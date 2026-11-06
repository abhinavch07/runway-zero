// C172 first flight lessons in Node: a simple robot pilot flies each lesson with the real flight
// model, and the real lesson checks must tick off every step in order.
// Run with: node scripts/c172-firstflight-test.ts
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { C172Core, C172_STEP_HZ } from "../src/c172/sim/core.ts";
import { GA_VARIANTS } from "../src/c172/sim/variant.ts";
import { runningC172Switches, type C172Controls, type C172State } from "../src/c172/sim/types.ts";
import { FIRST_FLIGHT } from "../src/c172/firstFlight.ts";
import { CIRCUIT, FIELD_FT, LEG_HDG, TAXI, rwyPos, rwyToLatLon, trueHdg } from "../src/c172/world.ts";
import { angleDiff } from "../src/world/geo.ts";

const v = GA_VARIANTS.c172;
const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({ moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir), wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir), log: { console: false } });
for (const f of v.modelFiles) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
if (!sdk.loadModel(v.model)) throw new Error("c172 failed to load");
sdk.setDt(1 / C172_STEP_HZ);
const core = new C172Core(sdk, v);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// What the robot pilot is doing.
interface Goal {
  ground?: { tx: number; ty: number; gs: number; stop?: boolean };
  hdg?: number;
  kias?: number;
  alt?: number;
  thr?: number;
  flaps?: number;
  flare?: boolean;
  park?: boolean;
  trimHands?: boolean;
}

function fly(s: C172State, c: C172Controls, g: Goal) {
  const p = rwyPos(s);
  if (g.flaps !== undefined) c.flaps = g.flaps;
  if (g.park !== undefined) c.switches.parkBrake = g.park;
  if (g.thr !== undefined) c.throttle = g.thr;
  if (g.ground) {
    const { tx, ty, gs, stop } = g.ground;
    const want = (Math.atan2(ty - p.y, tx - p.x) * 180) / Math.PI;
    const err = angleDiff(p.h, want);
    c.yaw = clamp(err * 0.08, -1, 1);
    c.pitch = 0;
    c.roll = 0;
    if (g.thr === undefined) c.throttle = stop ? 0 : clamp(c.throttle + (gs - s.groundSpeedKt) * 0.0015, 0.05, 0.5);
    c.brakes = stop || s.groundSpeedKt > gs + 4 ? 1 : 0;
    return;
  }
  c.brakes = 0;
  // Roll towards the heading, 20 degrees of bank at most.
  if (g.hdg !== undefined) {
    const err = angleDiff(s.headingDeg, g.hdg);
    const bank = clamp(err * 1.2, -20, 20);
    c.roll = clamp((bank - s.rollDeg) * 0.04, -0.5, 0.5);
    c.yaw = s.onGround ? clamp(err * 0.1, -1, 1) : 0;
  }
  if (g.flare) {
    const wantPitch = s.aglFt > 25 ? 0 : 6;
    c.pitch = clamp(c.pitch + ((wantPitch - s.pitchDeg) * 0.02 - s.vsFpm * 0.00002) / 6, -0.3, 0.8);
    return;
  }
  let wantPitch = s.pitchDeg;
  if (g.alt !== undefined) {
    wantPitch = clamp((g.alt - s.altFt) * 0.02 - s.vsFpm * 0.004 + 2, -6, 10);
    // Never let the speed fall below 68 knots while holding a height.
    if (s.kias < 68) wantPitch = Math.min(wantPitch, s.pitchDeg - (68 - s.kias) * 0.4);
  }
  else if (g.kias !== undefined) wantPitch = clamp(s.pitchDeg - (g.kias - s.kias) * 0.15, -8, 14);
  if (g.alt !== undefined && g.kias !== undefined && g.thr === undefined) c.throttle = clamp(c.throttle + (g.kias - s.kias) * 0.0004, 0.2, 1);
  if (g.trimHands) {
    // Trim so the yoke can be let go.
    c.trim = clamp(c.trim + c.pitch * 0.002, -1, 1);
  }
  c.pitch = clamp(c.pitch * 0.9 + (wantPitch - s.pitchDeg) * 0.015, -0.6, 0.6);
}

// The robot's plan for each step, by lesson.
const PLANS: Record<string, ((s: C172State, c: C172Controls) => Goal)[]> = {
  "c172-ff-takeoff": [
    () => ({ park: true }),
    () => ({ park: false, ground: { tx: TAXI.x, ty: TAXI.holdY, gs: 0, stop: true } }),
    () => ({ ground: { tx: TAXI.x, ty: TAXI.holdY, gs: 8 } }),
    (s) => ({ ground: { tx: TAXI.x, ty: TAXI.holdY - 8, gs: 6, stop: rwyPos(s).y > TAXI.holdY - 18 } }),
    (s) => {
      const p = rwyPos(s);
      // Roll onto the runway, then turn left along the centreline.
      return p.y < -12 ? { ground: { tx: TAXI.x + 5, ty: 0, gs: 6 } } : { ground: { tx: p.x + 60, ty: 0, gs: 5 } };
    },
    () => ({ thr: 1, hdg: LEG_HDG.upwind, ground: undefined, kias: undefined }),
    (s) => ({ thr: 1, hdg: LEG_HDG.upwind, kias: s.kias > 55 ? 60 : undefined }),
    () => ({ thr: 1, hdg: LEG_HDG.upwind, kias: 70 }),
    () => ({ thr: 1, hdg: LEG_HDG.upwind, kias: 70, trimHands: true }),
    (s) => ({ thr: s.altFt < 1720 ? 1 : 0.66, hdg: LEG_HDG.upwind, alt: 1800 }),
  ],
  "c172-ff-circuit": [
    () => ({ hdg: LEG_HDG.upwind, alt: 1800, thr: 0.66 }),
    (s) => ({ hdg: rwyPos(s).x > CIRCUIT.crosswindX - 200 ? LEG_HDG.crosswind : LEG_HDG.upwind, alt: 1800, thr: 0.66 }),
    (s) => ({ hdg: rwyPos(s).y < CIRCUIT.downwindY + 250 ? LEG_HDG.downwind : LEG_HDG.crosswind, alt: 1800, thr: 0.66 }),
    () => ({ hdg: LEG_HDG.downwind, alt: 1800, thr: 0.66 }),
    (_s, c) => {
      c.switches.landing = true;
      return { hdg: LEG_HDG.downwind, alt: 1800, thr: 0.66 };
    },
    (s) => (rwyPos(s).x < 250 ? { hdg: LEG_HDG.downwind, kias: 75, thr: 0.52, flaps: 1 } : { hdg: LEG_HDG.downwind, alt: 1800, thr: 0.66 }),
    (s) => ({ hdg: rwyPos(s).x < CIRCUIT.baseX + 250 ? LEG_HDG.base : LEG_HDG.downwind, kias: 75, thr: 0.52 }),
    () => ({ hdg: LEG_HDG.base, kias: 70, thr: 0.5, flaps: 2 }),
    (s) => ({ hdg: rwyPos(s).y > -480 ? trueHdg(clamp(-rwyPos(s).y * 0.06, -30, 30)) : LEG_HDG.base, kias: 70, thr: 0.5 }),
  ],
  "c172-ff-landing": [
    () => ({ hdg: LEG_HDG.final, kias: 65, thr: 0.5 }),
    (s) => ({ hdg: trueHdg(clamp(-rwyPos(s).y * 0.05, -10, 10)), kias: 65, thr: 0.5 }),
    (s) => ({ hdg: trueHdg(clamp(-rwyPos(s).y * 0.05, -10, 10)), kias: 65, thr: rwyPos(s).x > -50 ? 0 : 0.5 }),
    (s) => ({ hdg: trueHdg(clamp(-rwyPos(s).y * 0.05, -10, 10)), thr: 0, flare: true }),
    (s) => ({ ground: { tx: rwyPos(s).x + 80, ty: 0, gs: 0, stop: true }, thr: 0 }),
    () => ({ ground: { tx: 3000, ty: 0, gs: 0, stop: true }, thr: 0, flaps: 0 }),
  ],
};

let failed = false;
for (const lesson of FIRST_FLIGHT) {
  const st = lesson.start!;
  core.place({ id: lesson.id, name: lesson.title, ...rwyToLatLon(st.x, st.y), headingDeg: trueHdg(st.h), terrainFt: FIELD_FT, running: true, fuelGalPerTank: 20, air: st.air });
  const sw = runningC172Switches("BOTH");
  lesson.switches?.(sw);
  const c: C172Controls = { throttle: 0.1, mixture: 1, flaps: 0, trim: 0, pitch: 0, roll: 0, yaw: 0, brakes: 0, ...lesson.controls, switches: sw, baro: { qnh: 1013, std: false }, hdgBug: 0, radios: undefined as never } as C172Controls;
  const plan = PLANS[lesson.id];
  let step = 0;
  let t = 0;
  let stepT = 0;
  const log: string[] = [];
  let maxBank = 0;
  let minKias = 999;
  while (step < lesson.steps.length && t < 900) {
    const s = core.state();
    if (!s.onGround) {
      maxBank = Math.max(maxBank, Math.abs(s.rollDeg));
      if (s.aglFt > 30) minKias = Math.min(minKias, s.kias);
    }
    const g = plan[step](s, c);
    fly(s, c, g);
    core.step(c);
    t += 1 / C172_STEP_HZ;
    const st2 = lesson.steps[step];
    // Manual steps: the learner presses Next after 2 seconds.
    const ok = st2.done ? st2.done(core.state(), c, undefined as never) : t - stepT > 2;
    if (ok) {
      const s2 = core.state();
      const p = rwyPos(s2);
      log.push(`  ✓ ${String(step + 1).padStart(2)} ${st2.title.padEnd(48)} t=${t.toFixed(0).padStart(4)}s x=${p.x.toFixed(0).padStart(5)} y=${p.y.toFixed(0).padStart(5)} hdg=${s2.headingDeg.toFixed(0).padStart(3)} kias=${s2.kias.toFixed(0).padStart(3)} alt=${s2.altFt.toFixed(0).padStart(4)} vs=${s2.vsFpm.toFixed(0).padStart(5)} rpm=${s2.engine.rpm.toFixed(0)}`);
      step++;
      stepT = t;
    }
  }
  const s = core.state();
  const p = rwyPos(s);
  const pass = step === lesson.steps.length;
  if (!pass) failed = true;
  console.log(`${pass ? "PASS" : "FAIL"} ${lesson.id}: ${step}/${lesson.steps.length} steps in ${t.toFixed(0)} s, max bank ${maxBank.toFixed(0)}, min airborne speed ${minKias.toFixed(0)}`);
  console.log(log.join("\n"));
  if (!pass) console.log(`  stuck on: ${lesson.steps[step].title} | x=${p.x.toFixed(0)} y=${p.y.toFixed(0)} h=${p.h.toFixed(0)} hdg=${s.headingDeg.toFixed(0)} kias=${s.kias.toFixed(0)} gs=${s.groundSpeedKt.toFixed(1)} alt=${s.altFt.toFixed(0)} agl=${s.aglFt.toFixed(0)} vs=${s.vsFpm.toFixed(0)} rpm=${s.engine.rpm.toFixed(0)} ground=${s.onGround} pitch=${c.pitch.toFixed(2)}`);
}
process.exit(failed ? 1 : 0);
