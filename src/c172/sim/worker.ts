// Light aircraft simulation worker (C172 or PA-28) at 120 Hz, state to the page about 60 times a second.
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { C172Core, C172_STEP_HZ } from "./core.ts";
import { GA_VARIANTS, type GaId } from "./variant.ts";
import type { C172Controls, C172FromWorker, C172Start, C172ToWorker } from "./types.ts";

const MAX_STEPS_PER_TICK = 12;
let core: C172Core | null = null;
let controls: C172Controls | null = null;
let lastTick = 0;
let stepDebt = 0;
let lastStart: C172Start | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;

const post = (msg: C172FromWorker) => (self as unknown as Worker).postMessage(msg);

async function init(baseUrl: string, id: GaId) {
  const variant = GA_VARIANTS[id];
  const sdk = await JSBSimSdk.create({
    moduleUrl: new URL("jsbsim-wasm/jsbsim_wasm.mjs", baseUrl),
    wasmUrl: new URL("jsbsim-wasm/jsbsim_wasm.wasm", baseUrl),
    log: { console: false },
  });
  sdk.on("stderr", (e) => post({ type: "log", message: e.message }));
  for (const file of variant.modelFiles) {
    const res = await fetch(new URL(`jsbsim/${file}`, baseUrl));
    if (!res.ok) throw new Error(`Could not load ${file} (${res.status})`);
    sdk.writeDataFile(file, await res.text());
  }
  sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
  if (!sdk.loadModel(variant.model)) throw new Error(`The ${variant.name} model failed to load`);
  sdk.setDt(1 / C172_STEP_HZ);
  core = new C172Core(sdk, variant);
}

function tick() {
  if (!core) return;
  const now = performance.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  if (controls) {
    stepDebt += elapsed * C172_STEP_HZ;
    const steps = Math.min(MAX_STEPS_PER_TICK, Math.floor(stepDebt));
    stepDebt = Math.min(stepDebt - steps, 2);
    for (let i = 0; i < steps; i++) core.step(controls);
    if (!core.healthy() && lastStart) {
      controls = null;
      core.place(lastStart);
      post({ type: "ready", start: lastStart });
    }
  }
  post({ type: "state", state: core.state() });
}

self.onmessage = async (ev: MessageEvent<C172ToWorker>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init":
        await init(msg.baseUrl, msg.variant);
        lastStart = msg.start;
        core!.place(msg.start);
        post({ type: "ready", start: msg.start });
        lastTick = performance.now();
        ticker = setInterval(tick, 1000 / 60);
        break;
      case "reset":
        if (!core) break;
        controls = null;
        lastStart = msg.start;
        core.place(msg.start);
        post({ type: "ready", start: msg.start });
        break;
      case "controls":
        controls = msg.controls;
        break;
      case "fail":
        core?.fail(msg.what);
        break;
    }
  } catch (err) {
    if (ticker) clearInterval(ticker);
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
