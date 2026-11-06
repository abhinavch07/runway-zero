// C172 first flight tuning in Node: hands-off trim for the airborne lesson starts.
// Run with: node scripts/c172-flight-test.ts
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { C172Core, C172_STEP_HZ } from "../src/c172/sim/core.ts";
import { GA_VARIANTS } from "../src/c172/sim/variant.ts";
import { runningC172Switches, type AirStart, type C172Controls } from "../src/c172/sim/types.ts";

const v = GA_VARIANTS.c172;
const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({ moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir), wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir), log: { console: false } });
for (const f of v.modelFiles) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
if (!sdk.loadModel(v.model)) throw new Error("c172 failed to load");
sdk.setDt(1 / C172_STEP_HZ);
const core = new C172Core(sdk, v);

export function hold(air: AirStart, secs: number) {
  core.place({ id: "t", name: "t", latDeg: 28.5585, lonDeg: 77.12, headingDeg: 284, terrainFt: 778, running: true, fuelGalPerTank: 20, air });
  const sw = runningC172Switches("BOTH"); sw.parkBrake = false;
  const c: C172Controls = { throttle: air.throttle, mixture: 1, flaps: air.flaps, trim: air.trim, pitch: 0, roll: 0, yaw: 0, brakes: 0, switches: sw, baro: { qnh: 1013, std: false }, hdgBug: 0, radios: undefined as never };
  const out: string[] = [];
  for (let i = 1; i <= secs * C172_STEP_HZ; i++) {
    const s = core.state();
    c.roll = Math.max(-0.3, Math.min(0.3, -s.rollDeg * 0.03));
    core.step(c);
    if (i % (10 * C172_STEP_HZ) === 0) out.push(`${(i / C172_STEP_HZ).toFixed(0)}s kias=${s.kias.toFixed(0)} vs=${s.vsFpm.toFixed(0)} agl=${s.aglFt.toFixed(0)} rpm=${s.engine.rpm.toFixed(0)} pitch=${s.pitchDeg.toFixed(1)}`);
  }
  return out.join(" | ");
}

const mode = process.argv[2] ?? "level";
if (mode === "level") for (const thr of [0.62, 0.66]) for (const trim of [-0.3, -0.2, -0.1]) console.log(`thr=${thr} trim=${trim}:`, hold({ aglFt: 1000, kias: 90, flaps: 0, throttle: thr, trim }, 40));
if (mode === "app") for (const thr of [0.38, 0.44, 0.5]) for (const trim of [0.1, 0.3]) console.log(`thr=${thr} trim=${trim}:`, hold({ aglFt: 400, kias: 65, flaps: 2, throttle: thr, trim, gammaDeg: -3 }, 30));
if (mode === "cruise") for (const [k, thr, trim] of [[84, 0.68, -0.3], [85, 0.7, -0.35], [80, 0.66, -0.25]]) console.log(`k=${k} thr=${thr} trim=${trim}:`, hold({ aglFt: 1000, kias: k, flaps: 0, throttle: thr, trim }, 60));
if (mode === "climb") for (const trim of [-0.1, 0, 0.1, 0.2]) console.log(`climb trim=${trim}:`, hold({ aglFt: 300, kias: 72, flaps: 0, throttle: 1, trim }, 40));
if (mode === "takeoff") for (const trim of [0, 0.1, 0.2]) {
  core.place({ id: "t", name: "t", latDeg: 28.5585, lonDeg: 77.12, headingDeg: 284, terrainFt: 778, running: true, fuelGalPerTank: 20 });
  const sw = runningC172Switches("BOTH"); sw.parkBrake = false;
  const c: C172Controls = { throttle: 1, mixture: 1, flaps: 0, trim, pitch: 0, roll: 0, yaw: 0, brakes: 0, switches: sw, baro: { qnh: 1013, std: false }, hdgBug: 0, radios: undefined as never };
  const log: string[] = []; let liftT = 0;
  for (let i = 1; i <= 50 * C172_STEP_HZ; i++) {
    const s = core.state();
    c.yaw = Math.max(-1, Math.min(1, -((((s.headingDeg - 284 + 540) % 360) - 180) * 0.15)));
    // keyboard-like: pull to 0.5 from 55 kt until 8 degrees nose up, then let go
    c.pitch = s.onGround && s.kias > 55 ? Math.min(0.5, c.pitch + 1.2 / C172_STEP_HZ) : s.pitchDeg < 6 && s.aglFt < 50 ? c.pitch : Math.max(0, c.pitch - 2 / C172_STEP_HZ);
    c.roll = Math.max(-0.3, Math.min(0.3, -s.rollDeg * 0.03));
    if (!liftT && !s.onGround) liftT = i / C172_STEP_HZ;
    core.step(c);
    if (i % (5 * C172_STEP_HZ) === 0) log.push(`${i / C172_STEP_HZ}s k=${s.kias.toFixed(0)} agl=${s.aglFt.toFixed(0)} vs=${s.vsFpm.toFixed(0)} p=${s.pitchDeg.toFixed(1)} hdg=${s.headingDeg.toFixed(0)}`);
  }
  console.log(`takeoff trim=${trim} lift=${liftT}s:`, log.join(" | "));
}
