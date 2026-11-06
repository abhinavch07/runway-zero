// 737 tests in Node: cold start to APU and IRS, engine start, then the autopilot modes in flight.
// Run with: node scripts/b737-test.ts
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { B737_MODEL_FILES, B737_STEP_HZ, Core737 } from "../src/b737/sim/core.ts";
import { coldSwitches737, poweredSwitches737, runningSwitches737, type Controls737, type Sw737 } from "../src/b737/sim/types.ts";
import { WAYPOINTS } from "../src/world/route.ts";

const root = new URL("../public/jsbsim/", import.meta.url);
const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({ moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir), wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir), log: { console: false } });
for (const f of B737_MODEL_FILES) sdk.writeDataFile(f, readFileSync(new URL(f, root), "utf8"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });
if (!sdk.loadModel("737")) throw new Error("737 failed to load");
sdk.setDt(1 / B737_STEP_HZ);
const core = new Core737(sdk);
const ctl = (sw: Sw737): Controls737 => ({ pitch: 0, roll: 0, yaw: 0, throttle: 0, flaps: 0, gearDown: true, brakes: 0, switches: sw, nav1: 108000, crs1: 0 });
const run = (c: Controls737, sec: number) => { for (let i = 0; i < sec * B737_STEP_HZ; i++) { if (c.switches.engStart.some((x) => x === "GRD")) { const e = core.systems.status().engines; c.switches.engStart = c.switches.engStart.map((x, i) => (x === "GRD" && e[i].n2 >= 56 ? "OFF" : x)) as Sw737["engStart"]; } core.step(c); } };
let fails = 0;
const check = (ok: boolean, what: string) => { console.log(`${ok ? "ok  " : "FAIL"} ${what}`); if (!ok) fails++; };
const base = { id: "t", latDeg: 28.56, lonDeg: 77.1, headingDeg: 284, terrainFt: 777, fuelKg: 9000 };

// ----- Cold and dark to APU and IRS -----
{
  const sw = coldSwitches737();
  core.place({ ...base, onGround: true, state: "cold" }, sw);
  const c = ctl(sw);
  run(c, 1);
  check(!core.systems.status().dcPower, "cold: no power");
  sw.battery = true; run(c, 1);
  check(core.systems.status().dcPower && !core.systems.status().acPower, "battery: DC only");
  sw.irs = ["NAV", "NAV"]; sw.apuOn = true; sw.apuStartPresses++; run(c, 35);
  const s = core.systems.status();
  check(s.apuAvail && s.apuGenOffBus, `APU available, APU GEN OFF BUS (N ${s.apuN.toFixed(0)})`);
  sw.bus = ["APU", "APU"]; run(c, 1);
  check(core.systems.status().acPower && !core.systems.status().apuGenOffBus, "APU on both buses: AC power");
  run(c, 30);
  check(core.systems.status().irsAligned.every(Boolean), "IRS aligned after 60 s");
}

// ----- Engine start from powered -----
{
  const sw = poweredSwitches737();
  core.place({ ...base, onGround: true, state: "powered" }, sw);
  const c = ctl(sw);
  sw.fuelPumps = [true, true, false, false, true, true];
  sw.hydPumps = [true, true, true, true];
  run(c, 2);
  console.log(`  duct with packs on: ${core.systems.status().ductPsi.toFixed(0)} psi`);
  sw.engStart[1] = "GRD"; run(c, 10);
  check(core.systems.status().engines[1].n2 < 5, `packs on: too little duct pressure, no start (N2 ${core.systems.status().engines[1].n2.toFixed(0)})`);
  sw.engStart[1] = "OFF"; sw.packs = [false, false]; run(c, 3);
  console.log(`  duct with packs off: ${core.systems.status().ductPsi.toFixed(0)} psi`);
  sw.engStart[1] = "GRD";
  for (let i = 0; i < 30 && core.systems.status().engines[1].n2 < 25; i++) run(c, 1);
  const e = core.systems.status().engines[1];
  check(e.n2 >= 25 && e.startValve, `N2 25% with start valve open (N2 ${e.n2.toFixed(0)})`);
  sw.startLever[1] = "IDLE";
  let peak = 0;
  for (let i = 0; i < 60; i++) { run(c, 1); peak = Math.max(peak, core.systems.status().engines[1].egtC); if (core.systems.status().engines[1].phase === "RUN" && sw.engStart[1] === "OFF") break; }
  const e2 = core.systems.status().engines[1];
  check(e2.phase === "RUN" && sw.engStart[1] === "OFF", `engine 2 running, start switch back to OFF (N2 ${e2.n2.toFixed(0)} N1 ${e2.n1.toFixed(0)} EGT peak ${peak.toFixed(0)} oil ${e2.oilPsi.toFixed(0)} FF ${e2.fuelFlowKgH.toFixed(0)})`);
  sw.bus[1] = "ENG"; run(c, 1);
  check(!core.systems.status().genOffBus[1] && core.systems.status().acBus[1], "GEN 2 on bus");
  run(c, 20);
  check(core.systems.status().engines[1].phase === "RUN", "engine 2 still running");
  sw.startLever[1] = "CUTOFF"; run(c, 20);
  check(core.systems.status().engines[1].n2 < 40, "start lever CUTOFF stops it");
}

// ----- Autopilot in flight -----
{
  const sw = runningSwitches737();
  core.place({ ...base, onGround: false, altFt: 6000, kias: 250, state: "running" }, sw);
  const c = ctl(sw);
  c.gearDown = false;
  const s = () => core.state();
  c.throttle = s().throttle;
  const show = (l: string) => { const x = s(); console.log(`  ${l.padEnd(18)} alt=${x.altFt.toFixed(0)} kias=${x.kias.toFixed(0)} vs=${x.vsFpm.toFixed(0)} pitch=${x.pitchDeg.toFixed(1)} roll=${x.rollDeg.toFixed(1)} hdg=${x.headingDeg.toFixed(0)} thr=${x.throttle.toFixed(2)} n1=${x.sys.engines[0].n1.toFixed(0)} | ${x.afcs.at} | ${x.afcs.roll} | ${x.afcs.pitch}`); };
  core.command({ kind: "fd" }); core.command({ kind: "atArm" }); core.command({ kind: "cmdA" });
  run(c, 10); show("CMD A (CWS)");
  check(Math.abs(s().altFt - 6000) < 150, "CWS holds about level");
  core.command({ kind: "speed" }); core.command({ kind: "althold" });
  core.command({ kind: "set", field: "hdg", value: 330 }); core.command({ kind: "hdgsel" });
  for (let i = 0; i < 4; i++) { run(c, 10); show("HDG SEL 330"); }
  check(Math.abs(s().headingDeg - 330) < 3 && Math.abs(s().altFt - 6000) < 100, "HDG SEL 330 with ALT HOLD");
  core.command({ kind: "set", field: "spd", value: 220 }); run(c, 40); show("SPD 220");
  check(Math.abs(s().kias - 220) < 6, "MCP SPD 220");
  core.command({ kind: "set", field: "alt", value: 10000 }); core.command({ kind: "lvlchg" });
  for (let i = 0; i < 12; i++) { run(c, 15); show("LVL CHG 10000"); if (s().afcs.pitch === "ALT HOLD") break; }
  run(c, 40); show("level");
  check(s().afcs.pitch === "ALT HOLD" && Math.abs(s().altFt - 10000) < 80 && Math.abs(s().kias - 220) < 10, "LVL CHG climb, captures 10000");
  core.command({ kind: "set", field: "alt", value: 8000 }); core.command({ kind: "set", field: "vs", value: -1000 });
  for (let i = 0; i < 14; i++) { run(c, 10); show("V/S -1000"); if (s().afcs.pitch === "ALT HOLD") break; }
  run(c, 15); show("level");
  check(s().afcs.pitch === "ALT HOLD" && Math.abs(s().altFt - 8000) < 80, "V/S descent, captures 8000");
  core.setRoute([{ name: "RZ102", ...WAYPOINTS.RZ102 }, { name: "RZ103", ...WAYPOINTS.RZ103 }], 12000);
  core.command({ kind: "lnav" }); core.command({ kind: "set", field: "alt", value: 14000 }); core.command({ kind: "vnav" });
  for (let i = 0; i < 16; i++) { run(c, 15); show("LNAV VNAV"); }
  check(s().afcs.roll === "LNAV" && s().afcs.pitch === "VNAV PTH" && Math.abs(s().altFt - 12000) < 100, "VNAV levels at the FMC cruise altitude 12000 under MCP 14000");
}
console.log(fails ? `FAILS: ${fails}` : "ALL PASS");
