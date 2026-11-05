// Simulation worker. Runs JSBSim (compiled to WebAssembly) and the flight control computer at a
// fixed 120 Hz step, and sends the aircraft state back to the page about 60 times a second.
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { MODEL_FILES, SimCore, STEP_HZ } from "./core.ts";
import type { Controls, FromWorker, StartPosition, ToWorker } from "./types.ts";

const MAX_STEPS_PER_TICK = 12; // never try to catch up more than 0.1 s at once

let core: SimCore | null = null;
let paused = false;
let controls: Controls | null = null;
let displayOffsetM = 0;
let lastTick = 0;
let ticker: ReturnType<typeof setInterval> | null = null;
let simAtLastReport = 0;
let wallAtLastReport = 0;
let simRate = 1;
let stepDebt = 0;
let lastStart: StartPosition | null = null;

const post = (msg: FromWorker) => (self as unknown as Worker).postMessage(msg);

async function init(baseUrl: string) {
  const sdk = await JSBSimSdk.create({
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
  sdk.setDt(1 / STEP_HZ);
  core = new SimCore(sdk);
}

function tick() {
  if (!core) return;
  const now = performance.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  if (!paused && controls) {
    stepDebt += elapsed * STEP_HZ;
    const steps = Math.min(MAX_STEPS_PER_TICK, Math.floor(stepDebt));
    stepDebt = Math.min(stepDebt - steps, 2);
    for (let i = 0; i < steps; i++) core.step(controls);
    if (!core.healthy() && lastStart) {
      // The flight model broke down. Start again rather than send broken numbers to the page.
      controls = null;
      const { throttle } = core.place(lastStart);
      post({ type: "ready", throttle, start: lastStart });
      post({ type: "notice", message: "The flight model hit a problem and was restarted at the start position." });
    }
  }
  if (now - wallAtLastReport > 1000) {
    const t = core.get("simulation/sim-time-sec");
    simRate = (t - simAtLastReport) / ((now - wallAtLastReport) / 1000);
    simAtLastReport = t;
    wallAtLastReport = now;
  }
  post({ type: "state", state: core.state(simRate, displayOffsetM) });
}

self.onmessage = async (ev: MessageEvent<ToWorker>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init": {
        await init(msg.baseUrl);
        displayOffsetM = msg.displayOffsetM;
        lastStart = msg.start;
        const { throttle } = core!.place(msg.start);
        post({ type: "ready", throttle, start: msg.start });
        lastTick = wallAtLastReport = performance.now();
        ticker = setInterval(tick, 1000 / 60);
        break;
      }
      case "controls":
        controls = msg.controls;
        break;
      case "terrain":
        core?.setTerrain(msg.elevationFt);
        break;
      case "pause":
        paused = msg.paused;
        break;
      case "reset": {
        if (!core) break;
        displayOffsetM = msg.displayOffsetM;
        controls = null; // wait for the page to send controls that match the new start
        lastStart = msg.start;
        const { throttle } = core.place(msg.start);
        post({ type: "ready", throttle, start: msg.start });
        break;
      }
      case "fcu":
        core?.command(msg.action);
        break;
    }
  } catch (err) {
    if (ticker) clearInterval(ticker);
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
