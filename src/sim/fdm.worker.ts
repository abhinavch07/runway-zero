// Simulation worker. Runs JSBSim (compiled to WebAssembly) at a fixed 120 Hz step,
// applies the latest controls from the page, and sends the aircraft state back about 60 times a second.
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import type { Controls, FromWorker, SimState, StartPosition, ToWorker } from "./types";

const STEP_HZ = 120;
const STEP_S = 1 / STEP_HZ;
const MAX_STEPS_PER_TICK = 12; // never try to catch up more than 0.1 s at once
const FT_TO_M = 0.3048;

// Aircraft files the A320 stand-in model needs, relative to the jsbsim data folder.
const MODEL_FILES = ["aircraft/A320/A320.xml", "engine/CFM56_5.xml", "engine/direct.xml"];

// Flap lever detents mapped to the stand-in model's flap command (0 to 1 covers 0 to 40 degrees).
// 0, 1 (10 deg), 2 (15 deg), 3 (20 deg), FULL (40 deg).
const FLAP_CMD = [0, 0.25, 0.375, 0.5, 1];

let sdk: JSBSimSdk | null = null;
let paused = false;
let controls: Controls | null = null;
let terrainFt = 0;
let lastTick = 0;
let ticker: ReturnType<typeof setInterval> | null = null;
let simAtLastReport = 0;
let wallAtLastReport = 0;
let simRate = 1;

const post = (msg: FromWorker) => (self as unknown as Worker).postMessage(msg);
const get = (p: string) => sdk!.getPropertyValue(p);
const set = (p: string, v: number) => sdk!.setPropertyValue(p, v);

async function init(baseUrl: string, start: StartPosition) {
  sdk = await JSBSimSdk.create({
    moduleUrl: new URL("jsbsim-wasm/jsbsim_wasm.mjs", baseUrl),
    wasmUrl: new URL("jsbsim-wasm/jsbsim_wasm.wasm", baseUrl),
    log: { console: false },
  });
  sdk.on("stderr", (e) => post({ type: "log", message: e.message }));

  for (const file of MODEL_FILES) {
    const res = await fetch(new URL(`jsbsim/${file}`, baseUrl));
    if (!res.ok) throw new Error(`Could not load ${file} (${res.status})`);
    sdk.writeDataFile(file, await res.text());
  }
  sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
  if (!sdk.loadModel("A320")) throw new Error("The A320 stand-in model failed to load");
  sdk.setDt(STEP_S);
  placeAircraft(start);
}

/** Puts the aircraft at the start position, engines running, trimmed for level flight. */
function placeAircraft(start: StartPosition) {
  terrainFt = start.terrainFt;
  set("ic/lat-geod-deg", start.latDeg);
  set("ic/long-gc-deg", start.lonDeg);
  set("ic/h-sl-ft", start.altFt);
  set("ic/vc-kts", start.kias);
  set("ic/psi-true-deg", start.headingDeg);
  set("ic/gamma-deg", 0);
  set("ic/terrain-elevation-ft", terrainFt);
  sdk!.runIc();
  set("propulsion/set-running", -1);
  set("gear/gear-cmd-norm", 0);
  set("fcs/flap-cmd-norm", 0);
  try {
    sdk!.doTrim(1);
  } catch {
    post({ type: "log", message: "Trim did not converge, starting untrimmed" });
  }
  controls = null;
  simAtLastReport = sdk!.getSimTime();
  wallAtLastReport = performance.now();
  post({
    type: "ready",
    trimmedThrottle: get("fcs/throttle-cmd-norm[0]"),
    trimmedPitchTrim: -get("fcs/pitch-trim-cmd-norm"),
  });
}

function applyControls(c: Controls) {
  // JSBSim sign rules for this model: positive elevator = nose down, positive rudder = nose left.
  set("fcs/elevator-cmd-norm", -c.pitch);
  set("fcs/aileron-cmd-norm", c.roll);
  set("fcs/rudder-cmd-norm", -c.yaw);
  set("fcs/pitch-trim-cmd-norm", -c.pitchTrim);
  set("fcs/throttle-cmd-norm[0]", c.throttle);
  set("fcs/throttle-cmd-norm[1]", c.throttle);
  set("fcs/flap-cmd-norm", FLAP_CMD[Math.max(0, Math.min(4, c.flapLever))]);
  set("gear/gear-cmd-norm", c.gearDown ? 1 : 0);
  set("fcs/speedbrake-cmd-norm", c.speedbrake);
  set("fcs/left-brake-cmd-norm", c.brakes);
  set("fcs/right-brake-cmd-norm", c.brakes);
}

function readState(): SimState {
  const altFt = get("position/h-sl-ft");
  return {
    simTime: sdk!.getSimTime(),
    latDeg: get("position/lat-geod-deg"),
    lonDeg: get("position/long-gc-deg"),
    heightM: altFt * FT_TO_M,
    altFt,
    aglFt: get("position/h-agl-ft"),
    pitchDeg: get("attitude/theta-deg"),
    rollDeg: get("attitude/phi-deg"),
    headingDeg: (get("attitude/psi-deg") + 360) % 360,
    kias: get("velocities/vc-kts"),
    groundSpeedKt: get("velocities/vg-fps") * 0.592484,
    machNo: get("velocities/mach"),
    vsFpm: get("velocities/h-dot-fps") * 60,
    n1: [get("propulsion/engine[0]/n1"), get("propulsion/engine[1]/n1")],
    throttlePos: get("fcs/throttle-pos-norm[0]"),
    flapDeg: get("fcs/flap-pos-deg"),
    gearPos: get("gear/gear-pos-norm"),
    speedbrakePos: get("fcs/speedbrake-pos-norm"),
    onGround: get("gear/wow") > 0,
    simRate,
  };
}

function tick() {
  if (!sdk) return;
  const now = performance.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  if (!paused) {
    if (controls) applyControls(controls);
    set("position/terrain-elevation-asl-ft", terrainFt);
    const steps = Math.min(MAX_STEPS_PER_TICK, Math.max(1, Math.round(elapsed * STEP_HZ)));
    for (let i = 0; i < steps; i++) sdk.run();
  }
  if (now - wallAtLastReport > 1000) {
    simRate = (sdk.getSimTime() - simAtLastReport) / ((now - wallAtLastReport) / 1000);
    simAtLastReport = sdk.getSimTime();
    wallAtLastReport = now;
  }
  post({ type: "state", state: readState() });
}

self.onmessage = async (ev: MessageEvent<ToWorker>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init":
        await init(msg.baseUrl, msg.start);
        lastTick = performance.now();
        ticker = setInterval(tick, 1000 / 60);
        break;
      case "controls":
        controls = msg.controls;
        break;
      case "terrain":
        terrainFt = msg.elevationFt;
        break;
      case "pause":
        paused = msg.paused;
        break;
      case "reset":
        if (sdk) placeAircraft(msg.start);
        break;
    }
  } catch (err) {
    if (ticker) clearInterval(ticker);
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
