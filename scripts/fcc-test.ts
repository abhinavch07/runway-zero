// Scripted test flights in Node: takeoff, climb on autopilot, ILS approach and landing.
// Run with: node scripts/fcc-test.ts [scenario]   (scenarios: law, takeoff, ils, all)
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { MODEL_FILES, SimCore, STEP_HZ } from "../src/sim/core.ts";
import { STARTS } from "../src/config.ts";
import { destination } from "../src/world/geo.ts";
import { ILS_28, RWY28_COURSE_T, rwy28Final } from "../src/world/vidp.ts";
import type { Controls } from "../src/sim/types.ts";

const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);

async function makeCore() {
  const sdk = await JSBSimSdk.create({
    moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir),
    wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir),
    log: { console: false },
  });
  for (const f of MODEL_FILES) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
  sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
  sdk.loadModel("A320");
  sdk.setDt(1 / STEP_HZ);
  return new SimCore(sdk);
}

const start = (id: string) => STARTS.find((s) => s.id === id)!;
const neutral = (throttle: number, flapLever: number, gearDown: boolean): Controls => ({
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle,
  flapLever,
  gearDown,
  speedbrake: 0,
  brakes: 0,
});

function line(core: SimCore, label: string) {
  const s = core.state(1, 0);
  const f = s.fcc;
  const modes = `${f.ap ? "AP" : "--"} ${f.athr ? "AT" : "--"} ${f.lat || "-"}${f.latArmed ? "(" + f.latArmed + ")" : ""} ${f.vert || "-"}${f.vertArmed ? "(" + f.vertArmed + ")" : ""}`;
  console.log(
    `${label.padEnd(10)} t=${s.simTime.toFixed(0).padStart(4)} alt=${s.altFt.toFixed(0).padStart(5)} agl=${s.aglFt.toFixed(0).padStart(5)} ` +
      `kias=${s.kias.toFixed(0).padStart(3)} vs=${s.vsFpm.toFixed(0).padStart(5)} pitch=${s.pitchDeg.toFixed(1).padStart(5)} ` +
      `roll=${s.rollDeg.toFixed(1).padStart(5)} trk=${((s.trackDeg + 360) % 360).toFixed(0).padStart(3)} thr=${s.throttlePos.toFixed(2)} ` +
      `trim=${s.pitchTrim.toFixed(2)} dme=${f.ils.distThrNm.toFixed(1)} x=${f.ils.crossM.toFixed(0)} loc=${f.ils.locDevDeg.toFixed(2)} gs=${f.ils.gsDevDeg.toFixed(2)} [${modes}] ${f.message}`,
  );
}

function fly(core: SimCore, seconds: number, ctl: (t: number) => Controls, every = 5, label = "") {
  const steps = Math.round(seconds * STEP_HZ);
  for (let i = 1; i <= steps; i++) {
    core.step(ctl(i / STEP_HZ));
    if (every > 0 && i % Math.round(every * STEP_HZ) === 0) line(core, label);
  }
}

async function lawTest() {
  console.log("\n=== Normal law: stick inputs then release, at 3,000 ft ===");
  const core = await makeCore();
  const thr = core.place(start("delhi3000")).throttle;
  line(core, "start");
  fly(core, 3, () => neutral(thr, 0, false), 1, "hands off");
  fly(core, 2, () => ({ ...neutral(thr, 0, false), roll: 1 }), 1, "roll R");
  fly(core, 10, () => neutral(thr, 0, false), 2, "release");
  fly(core, 3, () => ({ ...neutral(thr, 0, false), roll: -1 }), 1, "roll L");
  fly(core, 10, () => neutral(thr, 0, false), 2, "release");
  fly(core, 2, () => ({ ...neutral(thr, 0, false), pitch: 0.6 }), 1, "pull");
  fly(core, 10, () => neutral(thr, 0, false), 2, "release");
  fly(core, 2, () => ({ ...neutral(thr, 0, false), pitch: -0.6 }), 1, "push");
  fly(core, 10, () => neutral(thr, 0, false), 2, "release");
  fly(core, 6, () => ({ ...neutral(thr, 0, false), roll: 1 }), 1, "full R");
  fly(core, 6, () => neutral(thr, 0, false), 1, "release");
}

async function takeoffTest() {
  console.log("\n=== Takeoff runway 28, climb on autopilot to 5,000 ft, turn to 104 ===");
  const core = await makeCore();
  core.place(start("rwy28"));
  line(core, "lined up");
  let gear = true;
  let flaps = 2;
  let rotated = false;
  let rotateT = 0;
  fly(
    core,
    60,
    (t) => {
      const s = core.state(1, 0);
      if (!rotated && s.kias > 145) {
        rotated = true;
        rotateT = t;
      }
      let pitch = 0;
      // Rotate to about 12.5 degrees and hold until well clear of the ground.
      if (rotated && (s.onGround || s.aglFt < 35)) pitch = Math.max(0, Math.min(0.7, (12.5 - s.pitchDeg) * 0.15));
      void rotateT;
      if (s.aglFt > 50 && s.vsFpm > 300) gear = false;
      if (s.kias > 185) flaps = 1;
      if (s.kias > 215) flaps = 0;
      return { ...neutral(1, flaps, gear), pitch };
    },
    3,
    "takeoff",
  );
  core.command({ kind: "set", field: "spd", value: 250 });
  core.command({ kind: "set", field: "alt", value: 5000 });
  core.command({ kind: "athr" });
  core.command({ kind: "ap" });
  core.command({ kind: "set", field: "vs", value: 1800 });
  core.command({ kind: "vs" });
  line(core, "AP on");
  fly(core, 150, () => neutral(0.9, 0, false), 10, "climb");
  core.command({ kind: "set", field: "hdg", value: 104 });
  fly(core, 70, () => neutral(0.9, 0, false), 5, "turn 104");
}

async function ilsTest() {
  console.log("\n=== Intercept: 14 NM, 1.5 km right of the centreline, 3,000 ft, APPR, then manual flare and landing ===");
  const core = await makeCore();
  const p = destination(rwy28Final(14), (RWY28_COURSE_T + 90) % 360, 1500);
  const base = start("final28");
  const thr = core.place({ ...base, id: "test", latDeg: p.latDeg, lonDeg: p.lonDeg, altFt: 3000, gammaDeg: 0, headingDeg: 255 }).throttle;
  line(core, "start");
  fly(core, 2, () => neutral(thr, 4, true), 0);
  core.command({ kind: "athr" });
  core.command({ kind: "ap" });
  core.command({ kind: "alt" });
  core.command({ kind: "set", field: "hdg", value: 255 });
  core.command({ kind: "hdg" });
  core.command({ kind: "appr" });
  fly(core, 120, () => neutral(thr, 4, true), 5, "intercept");
  let flare = false;
  let lowestRa = 1e9;
  fly(
    core,
    300,
    () => {
      const s = core.state(1, 0);
      lowestRa = Math.min(lowestRa, s.aglFt);
      let pitch = 0;
      // A simple pilot model for the flare: from 30 ft, pull to reduce the sink rate to about 150 fpm.
      if (s.aglFt < 38 && !s.onGround) flare = true;
      if (flare && !s.onGround) pitch = Math.max(0, Math.min(0.45, (-s.vsFpm - 180) / 600));
      const brakes = s.onGround && s.kias < 130 ? 0.5 : 0;
      if (process.env.TD && s.aglFt < 30 && s.aglFt > 7) console.log(`  agl=${s.aglFt.toFixed(1)} vs=${s.vsFpm.toFixed(0)} pitch=${s.pitchDeg.toFixed(1)} q=${(core.get("velocities/q-rad_sec")*57.3).toFixed(1)} wow=${core.get("gear/unit[1]/WOW")}`);
      const roll = !s.fcc.ap && !s.onGround ? Math.max(-0.3, Math.min(0.3, -s.rollDeg * 0.05 - s.fcc.ils.crossM * 0.004)) : 0;
      return { ...neutral(0, 4, true), pitch, brakes, roll };
    },
    5,
    "approach",
  );
  const td = core.state(1, 0).touchdown;
  console.log("TOUCHDOWN", td ? JSON.stringify(td, (_, v) => (typeof v === "number" ? Number(v.toFixed(1)) : v)) : "none");
  void ILS_28;
}

const which = process.argv[2] ?? "all";
if (which === "law" || which === "all") await lawTest();
if (which === "takeoff" || which === "all") await takeoffTest();
if (which === "ils" || which === "all") await ilsTest();
