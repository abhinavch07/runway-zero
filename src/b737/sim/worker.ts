// 737 simulation worker: JSBSim's 737 at 120 Hz, state to the page about 60 times a second.
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { B737_MODEL_FILES, B737_STEP_HZ, Core737 } from "./core.ts";
import { coldSwitches737, poweredSwitches737, runningSwitches737, type Controls737, type FromWorker737, type Start737, type ToWorker737 } from "./types.ts";

const MAX_STEPS_PER_TICK = 12;
let core: Core737 | null = null;
let controls: Controls737 | null = null;
let lastTick = 0;
let stepDebt = 0;
let lastStart: Start737 | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;
/** Time speed-up for long waits: 1, 4 or 8. */
let rate = 1;

const post = (msg: FromWorker737) => (self as unknown as Worker).postMessage(msg);
const switchesFor = (s: Start737) => (s.state === "cold" ? coldSwitches737() : s.state === "powered" ? poweredSwitches737() : runningSwitches737());

async function init(baseUrl: string) {
  const sdk = await JSBSimSdk.create({
    moduleUrl: new URL("jsbsim-wasm/jsbsim_wasm.mjs", baseUrl),
    wasmUrl: new URL("jsbsim-wasm/jsbsim_wasm.wasm", baseUrl),
    log: { console: false },
  });
  sdk.on("stderr", (e) => post({ type: "log", message: e.message }));
  for (const file of B737_MODEL_FILES) {
    const res = await fetch(new URL(`jsbsim/${file}`, baseUrl));
    if (!res.ok) throw new Error(`Could not load ${file} (${res.status})`);
    sdk.writeDataFile(file, await res.text());
  }
  sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
  if (!sdk.loadModel("737")) throw new Error("The 737 model failed to load");
  sdk.setDt(1 / B737_STEP_HZ);
  core = new Core737(sdk);
}

function place(start: Start737) {
  controls = null;
  lastStart = start;
  core!.place(start, switchesFor(start));
  post({ type: "ready", start });
}

function tick() {
  if (!core) return;
  const now = performance.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  if (controls) {
    stepDebt += elapsed * B737_STEP_HZ * rate;
    const steps = Math.min(MAX_STEPS_PER_TICK * rate, Math.floor(stepDebt));
    stepDebt = Math.min(stepDebt - steps, 2);
    for (let i = 0; i < steps; i++) core.step(controls);
    if (!core.healthy() && lastStart) place(lastStart);
  }
  post({ type: "state", state: core.state() });
}

self.onmessage = async (ev: MessageEvent<ToWorker737>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init":
        await init(msg.baseUrl);
        place(msg.start);
        lastTick = performance.now();
        ticker = setInterval(tick, 1000 / 60);
        break;
      case "reset":
        if (core) place(msg.start);
        break;
      case "controls":
        controls = msg.controls;
        break;
      case "mcp":
        core?.command(msg.action);
        break;
      case "fail":
        core?.systems.fail(msg.what);
        break;
      case "rate":
        rate = msg.rate;
        break;
      case "route":
        core?.setRoute(msg.points, msg.crzAltFt);
        break;
    }
  } catch (err) {
    if (ticker) clearInterval(ticker);
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
