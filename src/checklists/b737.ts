// 737-type normal checklists for the trainer. Simplified, written in our own words from general
// public knowledge. Not the manufacturer's or an airline's checklist. A type-rated pilot should review.
import type { Checklist } from "../shell/checklist";
import type { Controls737, State737 } from "../b737/sim/types";
import type { Fms737 } from "../b737/cockpit/cdu";

export interface B737Check {
  s: State737;
  c: Controls737;
  fms: Fms737;
  preflight: boolean;
}
type L = Checklist<B737Check>;

const sw = (d: B737Check) => d.c.switches;
const wingPumps = (d: B737Check) => [0, 1, 4, 5].every((i) => sw(d).fuelPumps[i]);
const running = (d: B737Check) => d.s.sys.engines.every((e) => e.phase === "RUN");
const toFlaps = (d: B737Check) => d.c.flaps > 0 && (!d.fms.toFlaps || d.c.flaps === d.fms.toFlaps);

export const B737_CHECKLISTS: L[] = [
  {
    id: "prep",
    title: "Cockpit prep",
    items: [
      { c: "BATTERY", r: "ON", ok: (d) => sw(d).battery },
      { c: "AC POWER (APU)", r: "ON", ok: (d) => d.s.sys.acPower },
      { c: "IRS", r: "NAV, ALIGNED", ok: (d) => d.s.sys.irsAligned.every(Boolean) },
      { c: "POSITION LIGHTS", r: "ON", ok: (d) => sw(d).position },
      { c: "FASTEN BELTS", r: "ON", ok: (d) => sw(d).seatBelts },
      { c: "FMC", r: "PRE-FLIGHT COMPLETE", ok: (d) => d.preflight },
      { c: "FLIGHT DIRECTOR", r: "ON", ok: (d) => d.s.afcs.fd },
      { c: "ALTIMETER", r: "SET (QNH)", ok: (d) => !d.c.x.baro.std },
      { c: "TAKE-OFF BRIEFING", r: "COMPLETED" },
    ],
  },
  {
    id: "before-start",
    title: "Before start",
    items: [
      { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
      { c: "DOORS", r: "CLOSED" },
      { c: "CLEARANCE", r: "OBTAINED" },
      { c: "TRANSPONDER CODE", r: "SET", ok: (d) => d.c.x.xpdrCode !== "2000" },
      { c: "FUEL PUMPS", r: "ON", ok: wingPumps },
      { c: "HYDRAULIC ELEC PUMPS", r: "ON", ok: (d) => sw(d).hydPumps[1] && sw(d).hydPumps[2] },
      { c: "ANTI COLLISION LIGHT", r: "ON", ok: (d) => sw(d).beacon },
      { c: "APU BLEED", r: "ON", ok: (d) => sw(d).apuBleed && d.s.sys.apuAvail },
      { c: "PACKS", r: "OFF", ok: (d) => !sw(d).packs[0] && !sw(d).packs[1] },
      { c: "START LEVERS", r: "CUTOFF", ok: (d) => sw(d).startLever.every((l) => l === "CUTOFF") || running(d) },
    ],
  },
  {
    id: "after-start",
    title: "After start",
    items: [
      { c: "ENGINES", r: "RUNNING, STABLE", ok: running },
      { c: "START LEVERS", r: "IDLE", ok: (d) => sw(d).startLever.every((l) => l === "IDLE") },
      { c: "GENERATORS", r: "ON BUS", ok: (d) => sw(d).bus[0] === "ENG" && sw(d).bus[1] === "ENG" },
      { c: "PACKS", r: "ON", ok: (d) => sw(d).packs[0] && sw(d).packs[1] },
      { c: "APU BLEED", r: "OFF", ok: (d) => !sw(d).apuBleed },
      { c: "APU", r: "OFF (AS REQUIRED)", ok: (d) => !sw(d).apuOn },
      { c: "ANTI ICE", r: "AS REQUIRED" },
      { c: "FLAPS", r: "TAKE-OFF SETTING", ok: toFlaps },
      { c: "FLIGHT CONTROLS", r: "CHECKED" },
      { c: "TAXI LIGHT", r: "ON", ok: (d) => sw(d).taxi },
    ],
  },
  {
    id: "before-takeoff",
    title: "Before take-off",
    items: [
      { c: "FLAPS", r: "TAKE-OFF SETTING", ok: toFlaps },
      { c: "MCP ALTITUDE", r: "SET (CLEARED)", ok: (d) => d.s.afcs.mcp.alt > 0 },
      { c: "A/T ARM", r: "ARMED", ok: (d) => d.s.afcs.atArm },
      { c: "CABIN", r: "SECURE" },
      { c: "TRANSPONDER", r: "TA/RA", ok: (d) => d.c.x.xpdrMode === "TA/RA" },
      { c: "STROBE", r: "ON", ok: (d) => sw(d).strobe },
      { c: "LANDING LIGHTS", r: "ON", ok: (d) => sw(d).landing },
      { c: "PARKING BRAKE", r: "OFF", ok: (d) => !sw(d).parkBrake },
    ],
  },
  {
    id: "landing",
    title: "Before landing",
    items: [
      { c: "ALTIMETER", r: "SET (QNH)", ok: (d) => !d.c.x.baro.std },
      { c: "FASTEN BELTS", r: "ON", ok: (d) => sw(d).seatBelts },
      { c: "LANDING GEAR", r: "DOWN", ok: (d) => d.c.gearDown && d.s.gearPos > 0.99 },
      { c: "FLAPS", r: "30 OR 40", ok: (d) => d.c.flaps >= 30 },
      { c: "LANDING LIGHTS", r: "ON", ok: (d) => sw(d).landing },
      { c: "APPROACH BRIEFING", r: "COMPLETED" },
    ],
  },
  {
    id: "after-landing",
    title: "After landing",
    items: [
      { c: "FLAPS", r: "UP", ok: (d) => d.c.flaps === 0 },
      { c: "STROBE", r: "OFF", ok: (d) => !sw(d).strobe },
      { c: "LANDING LIGHTS", r: "OFF", ok: (d) => !sw(d).landing },
      { c: "TAXI LIGHT", r: "ON", ok: (d) => sw(d).taxi },
      { c: "TRANSPONDER", r: "STBY", ok: (d) => d.c.x.xpdrMode === "STBY" },
      { c: "APU", r: "START (AS REQUIRED)" },
    ],
  },
  {
    id: "parking",
    title: "Parking",
    items: [
      { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
      { c: "START LEVERS", r: "CUTOFF", ok: (d) => sw(d).startLever.every((l) => l === "CUTOFF") },
      { c: "ANTI COLLISION LIGHT", r: "OFF", ok: (d) => !sw(d).beacon },
      { c: "FASTEN BELTS", r: "OFF", ok: (d) => !sw(d).seatBelts },
      { c: "FUEL PUMPS", r: "OFF", ok: (d) => sw(d).fuelPumps.every((p) => !p) },
      { c: "HYDRAULIC ELEC PUMPS", r: "OFF", ok: (d) => !sw(d).hydPumps[1] && !sw(d).hydPumps[2] },
      { c: "TRANSPONDER", r: "STBY", ok: (d) => d.c.x.xpdrMode === "STBY" },
      { c: "IRS", r: "OFF (LAST FLIGHT)", ok: (d) => sw(d).irs.every((m) => m === "OFF") },
      { c: "BATTERY", r: "OFF (LAST FLIGHT)", ok: (d) => !sw(d).battery },
    ],
  },
];
