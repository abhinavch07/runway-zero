// PA-28 test in Node: primer start, run-up, take-off, climb, cruise, a tank running dry.
// Run with: node scripts/pa28-test.ts
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { C172Core, C172_STEP_HZ } from "../src/c172/sim/core.ts";
import { GA_VARIANTS } from "../src/c172/sim/variant.ts";
import { coldC172Switches, type C172Controls } from "../src/c172/sim/types.ts";

const v = GA_VARIANTS.pa28;
const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({ moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir), wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir), log: { console: false } });
for (const f of v.modelFiles) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
if (!sdk.loadModel(v.model)) throw new Error("pa28 failed to load");
sdk.setDt(1 / C172_STEP_HZ);
const core = new C172Core(sdk, v);
const fuelGal = (process.argv[2] === "dry" ? [0.05, 20] : [20, 20]) as [number, number];
core.place({ id: "t", name: "t", latDeg: 28.5585, lonDeg: 77.12, headingDeg: 284, terrainFt: 777, running: false, fuelGalPerTank: 20, fuelGal });
const c: C172Controls = { throttle: 0, mixture: 0, flaps: 0, trim: 0, pitch: 0, roll: 0, yaw: 0, brakes: 0, switches: coldC172Switches("LEFT"), baro: { qnh: 1013, std: false }, hdgBug: 0, radios: undefined as never, primeStrokes: 0 };
let hdg0 = 284;
const show = (label: string) => {
  const s = core.state(); const e = s.engine;
  console.log(`${label.padEnd(18)} t=${s.simTime.toFixed(0).padStart(4)} rpm=${e.rpm.toFixed(0).padStart(4)} ff=${e.fuelFlowGph.toFixed(1)} oilP=${e.oilPressPsi.toFixed(0)} kias=${s.kias.toFixed(0).padStart(3)} agl=${s.aglFt.toFixed(0).padStart(5)} vs=${s.vsFpm.toFixed(0).padStart(5)} pitch=${s.pitchDeg.toFixed(1)} roll=${s.rollDeg.toFixed(1)} hdg=${s.headingDeg.toFixed(0)} flap=${s.flapDeg.toFixed(0)} fuel=${s.fuelGal.map((g) => g.toFixed(2))} starved=${s.starved} run=${e.running}`);
};
// Simple autopilot for the test: hold a speed with pitch, wings level, heading with rudder on the ground.
let mode: "none" | "ground" | "climb" | "level" = "none";
let tgtKias = 76, tgtAlt = 0;
const run = (sec: number, label: string, every = 0) => {
  for (let i = 1; i <= sec * C172_STEP_HZ; i++) {
    const s = core.state();
    if (mode === "ground") { c.yaw = Math.max(-1, Math.min(1, -((((s.headingDeg - hdg0 + 540) % 360) - 180) * 0.1)));
      c.pitch = s.kias > 58 ? 0.35 : 0; }
    if (mode === "climb" || mode === "level") {
      c.yaw = 0;
      c.roll = Math.max(-0.5, Math.min(0.5, -s.rollDeg * 0.05 - ((((s.headingDeg - hdg0 + 540) % 360) - 180)) * 0.02));
      const wantPitch = mode === "climb" ? 4 + (s.kias - tgtKias) * 0.5 : (tgtAlt - s.altFt) * 0.02 - s.vsFpm * 0.004 + 2;
      c.pitch = Math.max(-0.6, Math.min(0.6, (Math.max(-5, Math.min(12, wantPitch)) - s.pitchDeg) * 0.08));
    }
    core.step(c);
    if (every && i % (every * C172_STEP_HZ) === 0) show(label);
  }
  if (!every && label) show(label);
};
run(1, "cold");
c.switches.masterBat = true; c.switches.masterAlt = true; c.switches.beacon = true; c.switches.fuelPump = true;
c.mixture = 1; c.throttle = 0.1;
c.switches.magnetos = "START"; run(3, "unprimed crank 3s"); c.switches.magnetos = "BOTH"; run(1, "after");
c.switches.magnetos = "OFF";
c.primeStrokes = 3; run(1, "3 primer strokes");
c.switches.magnetos = "START"; run(3, "primed crank"); c.switches.magnetos = "BOTH";
run(10, "idle", 5);
c.switches.fuelPump = false;
if (process.argv[2] === "pump") {
  c.throttle = 0.35; run(5, "1500ish"); console.log("press", core.state().fuelPressPsi.toFixed(1));
  core.fail("fuelpump"); for (let i = 0; i < 6; i++) { run(2, ""); const s = core.state(); console.log(`after fail +${(i + 1) * 2}s rpm=${s.engine.rpm.toFixed(0)} press=${s.fuelPressPsi.toFixed(2)} run=${s.engine.running}`); }
  c.switches.fuelPump = true; for (let i = 0; i < 4; i++) { run(2, ""); const s = core.state(); console.log(`elec pump +${(i + 1) * 2}s rpm=${s.engine.rpm.toFixed(0)} press=${s.fuelPressPsi.toFixed(2)} run=${s.engine.running}`); }
  process.exit(0);
}
if (process.argv[2] === "dry") { run(60, "left tank running", 10); c.switches.fuelSel = "RIGHT"; c.switches.fuelPump = true; c.switches.magnetos = "START"; run(1.5, "restart on right"); c.switches.magnetos = "BOTH"; run(8, "on right", 4); process.exit(0); }
c.throttle = 0.6; run(4, "run-up 2000"); c.switches.magnetos = "L"; run(3, "mag L"); c.switches.magnetos = "R"; run(3, "mag R"); c.switches.magnetos = "BOTH"; c.throttle = 0.1; run(3, "idle");
c.switches.parkBrake = false; c.flaps = 0; c.switches.fuelPump = true;
mode = "ground"; c.throttle = 1; for (let i = 0; i < 60 && core.state().onGround; i++) run(1, i % 4 === 3 ? "take-off roll" : "");
mode = "climb"; tgtKias = 76; run(60, "climb 76", 10);
c.switches.fuelPump = false;
run(240, "climb", 60);
mode = "level"; tgtAlt = core.state().altFt; c.throttle = 0.72; run(90, "cruise", 30);
c.flaps = 3; run(20, "flaps 40", 10); c.flaps = 0;
