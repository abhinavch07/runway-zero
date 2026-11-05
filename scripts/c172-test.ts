// C172 start-up test in Node: cold engine, priming, start, idle, run-up and shutdown.
// Run with: node scripts/c172-test.ts
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { C172_MODEL_FILES, C172Core, C172_STEP_HZ } from "../src/c172/sim/core.ts";
import { coldC172Switches, type C172Controls } from "../src/c172/sim/types.ts";

const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({ moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir), wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir), log: { console: false } });
for (const f of C172_MODEL_FILES) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
if (!sdk.loadModel("c172p")) throw new Error("c172p failed to load");
sdk.setDt(1 / C172_STEP_HZ);
const core = new C172Core(sdk);
core.place({ id: "t", name: "t", latDeg: 28.5585, lonDeg: 77.12, headingDeg: 284, terrainFt: 777, running: false, fuelGalPerTank: 20 });
const c: C172Controls = { throttle: 0, mixture: 0, flaps: 0, trim: 0, pitch: 0, roll: 0, yaw: 0, brakes: 0, switches: coldC172Switches(), baro: { qnh: 1013, std: false }, hdgBug: 0 };
const run = (sec: number, label: string, every = 0) => {
  for (let i = 1; i <= sec * C172_STEP_HZ; i++) {
    core.step(c);
    if (every && i % (every * C172_STEP_HZ) === 0) show(label);
  }
  if (!every) show(label);
};
const show = (label: string) => {
  const s = core.state();
  const e = s.engine;
  console.log(`${label.padEnd(22)} t=${s.simTime.toFixed(0).padStart(3)} rpm=${e.rpm.toFixed(0).padStart(4)} map=${e.mapInHg.toFixed(1)} ff=${e.fuelFlowGph.toFixed(1)} oilP=${e.oilPressPsi.toFixed(0)} oilT=${e.oilTempF.toFixed(0)} egt=${e.egtF.toFixed(0)} cht=${e.chtF.toFixed(0)} V=${s.elec.mainVolts.toFixed(1)} A=${s.elec.mainAmps.toFixed(1)} prime=${s.primeS.toFixed(1)} agl=${s.aglFt.toFixed(1)} gs=${s.groundSpeedKt.toFixed(1)} fuel=${s.fuelGal.map((g) => g.toFixed(1))}`);
};
run(2, "cold");
c.switches.masterBat = true; c.switches.masterAlt = true; c.switches.beacon = true;
run(1, "master on");
c.mixture = 1; c.throttle = 0.1;
// try to start without priming, 3 s crank: should not start
c.switches.magnetos = "START"; run(3, "unprimed crank 3s"); c.switches.magnetos = "BOTH"; run(2, "after unprimed");
c.switches.magnetos = "OFF";
c.switches.fuelPump = true; run(4, "priming 4s"); c.switches.fuelPump = false;
c.switches.magnetos = "START"; run(3, "primed crank 3s"); c.switches.magnetos = "BOTH";
run(10, "running", 5);
c.throttle = 0.12; run(60, "warm up idle", 30);
c.throttle = 0.55; run(10, "1800 rpm?");
c.switches.magnetos = "L"; run(3, "mag L"); c.switches.magnetos = "BOTH"; run(2, "both");
c.switches.magnetos = "R"; run(3, "mag R"); c.switches.magnetos = "BOTH"; run(2, "both");
c.throttle = 0.1; run(5, "idle");
c.mixture = 0; run(8, "mixture cut-off");
c.switches.magnetos = "OFF"; c.switches.masterAlt = false; c.switches.masterBat = false; run(1, "all off");
console.log("healthy", core.healthy());
