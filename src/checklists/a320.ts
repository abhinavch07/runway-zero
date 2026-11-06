// A320-type normal checklists for the trainer. Simplified, written in our own words from general
// public knowledge. Not the manufacturer's or an airline's checklist. A type-rated pilot should review.
import type { Checklist } from "../shell/checklist";
import type { Controls, SimState } from "../sim/types";
import type { FmsData } from "../cockpit/mcdu";

export interface A320Check {
  s: SimState;
  c: Controls;
  fms: FmsData;
}
type L = Checklist<A320Check>;

const sw = (d: A320Check) => d.c.switches;
const x = (d: A320Check) => d.c.extras!;
const wingPumps = (d: A320Check) => sw(d).fuelL1 && sw(d).fuelL2 && sw(d).fuelR1 && sw(d).fuelR2;
const baroSet = (d: A320Check) => !!d.c.efis && !d.c.efis.std;
const engines = (d: A320Check, phase: "RUN" | "OFF") => d.s.systems.engines.every((e) => e.phase === phase);

export const A320_CHECKLISTS: L[] = [
  {
    id: "prep",
    title: "Cockpit prep",
    items: [
      { c: "BAT 1 AND BAT 2", r: "ON", ok: (d) => sw(d).bat1 && sw(d).bat2 },
      { c: "EXT PWR OR APU", r: "ON", ok: (d) => d.s.systems.acPower },
      { c: "ADIRS", r: "NAV, ALIGNED", ok: (d) => d.s.systems.irAligned.every(Boolean) },
      { c: "FUEL PUMPS", r: "ON", ok: wingPumps },
      { c: "NAV LIGHTS", r: "ON", ok: (d) => sw(d).navLights },
      { c: "SEAT BELTS", r: "ON", ok: (d) => sw(d).seatBelts },
      { c: "MCDU", r: "COMPLETED", ok: (d) => !!(d.fms.from && d.fms.to && d.fms.crzFl && d.fms.zfw && d.fms.v1 && d.fms.vr && d.fms.v2 && d.fms.flaps !== null) },
      { c: "FLIGHT DIRECTORS", r: "ON", ok: (d) => !!d.c.efis?.fd },
      { c: "BARO REF", r: "SET (QNH)", ok: baroSet },
      { c: "TAKE-OFF BRIEFING", r: "COMPLETED" },
    ],
  },
  {
    id: "before-start",
    title: "Before start",
    items: [
      { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
      { c: "DOORS", r: "CLOSED", ok: (d) => d.s.systems.doorsClosed },
      { c: "CLEARANCE", r: "OBTAINED" },
      { c: "TRANSPONDER CODE", r: "SET", ok: (d) => x(d).xpdrCode !== "2000" },
      { c: "BEACON", r: "ON", ok: (d) => sw(d).beacon },
      { c: "FUEL PUMPS", r: "ON", ok: wingPumps },
      { c: "APU BLEED", r: "ON", ok: (d) => sw(d).apuBleed && d.s.systems.apuAvail },
      { c: "THRUST LEVERS", r: "IDLE", ok: (d) => d.c.throttle < 0.05 },
    ],
  },
  {
    id: "after-start",
    title: "After start",
    items: [
      { c: "ENGINES", r: "RUNNING, STABLE", ok: (d) => engines(d, "RUN") },
      { c: "ENG MODE SELECTOR", r: "NORM", ok: (d) => sw(d).engMode === "NORM" },
      { c: "APU BLEED", r: "OFF", ok: (d) => !sw(d).apuBleed },
      { c: "APU MASTER SW", r: "OFF", ok: (d) => !sw(d).apuMaster },
      { c: "ANTI ICE", r: "AS REQUIRED" },
      { c: "GROUND SPOILERS", r: "ARMED", ok: (d) => x(d).spoilersArmed },
      { c: "FLAPS", r: "SET FOR TAKE-OFF", ok: (d) => d.c.flapLever >= 1 && (d.fms.flaps === null || d.c.flapLever === d.fms.flaps) },
      { c: "PITCH TRIM", r: "SET" },
      { c: "FLIGHT CONTROLS", r: "CHECKED", ok: (d) => Object.values(x(d).fctl).every(Boolean) },
      { c: "TAXI LIGHT", r: "ON", ok: (d) => sw(d).taxiLight },
    ],
  },
  {
    id: "before-takeoff",
    title: "Before take-off",
    items: [
      { c: "T.O CONFIG", r: "TEST, NORMAL", ok: (d) => x(d).toConfigNormal },
      { c: "AUTO BRAKE", r: "MAX", ok: (d) => x(d).autobrake === "MAX" },
      { c: "CABIN", r: "READY" },
      { c: "TRANSPONDER", r: "AUTO", ok: (d) => x(d).xpdrMode !== "STBY" },
      { c: "STROBE", r: "ON", ok: (d) => sw(d).strobe },
      { c: "LANDING LIGHTS", r: "ON", ok: (d) => sw(d).landingLights },
      { c: "PARKING BRAKE", r: "OFF", ok: (d) => !sw(d).parkBrake },
      { c: "TAKE-OFF RUNWAY", r: "CONFIRMED" },
    ],
  },
  {
    id: "landing",
    title: "Before landing",
    items: [
      { c: "BARO REF", r: "SET (QNH)", ok: baroSet },
      { c: "SEAT BELTS", r: "ON", ok: (d) => sw(d).seatBelts },
      { c: "AUTO BRAKE", r: "LO OR MED", ok: (d) => x(d).autobrake === "LO" || x(d).autobrake === "MED" },
      { c: "LANDING GEAR", r: "DOWN", ok: (d) => d.c.gearDown && d.s.gearPos > 0.99 },
      { c: "FLAPS", r: "3 OR FULL", ok: (d) => d.c.flapLever >= 3 },
      { c: "GROUND SPOILERS", r: "ARMED", ok: (d) => x(d).spoilersArmed },
      { c: "LANDING LIGHTS", r: "ON", ok: (d) => sw(d).landingLights },
      { c: "APPROACH BRIEFING", r: "COMPLETED" },
    ],
  },
  {
    id: "after-landing",
    title: "After landing",
    items: [
      { c: "GROUND SPOILERS", r: "DISARMED", ok: (d) => !x(d).spoilersArmed },
      { c: "FLAPS", r: "UP", ok: (d) => d.c.flapLever === 0 },
      { c: "AUTO BRAKE", r: "OFF", ok: (d) => x(d).autobrake === "OFF" },
      { c: "STROBE", r: "OFF", ok: (d) => !sw(d).strobe },
      { c: "LANDING LIGHTS", r: "OFF", ok: (d) => !sw(d).landingLights },
      { c: "TAXI LIGHT", r: "ON", ok: (d) => sw(d).taxiLight },
      { c: "TRANSPONDER", r: "STBY", ok: (d) => x(d).xpdrMode === "STBY" },
      { c: "APU", r: "START (AS REQUIRED)" },
    ],
  },
  {
    id: "parking",
    title: "Parking",
    items: [
      { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
      { c: "ENG MASTER 1 AND 2", r: "OFF", ok: (d) => !sw(d).engMaster1 && !sw(d).engMaster2 },
      { c: "BEACON", r: "OFF", ok: (d) => !sw(d).beacon && engines(d, "OFF") },
      { c: "SEAT BELTS", r: "OFF", ok: (d) => !sw(d).seatBelts },
      { c: "FUEL PUMPS", r: "OFF", ok: (d) => !sw(d).fuelL1 && !sw(d).fuelL2 && !sw(d).fuelR1 && !sw(d).fuelR2 && !sw(d).fuelCtr1 && !sw(d).fuelCtr2 },
      { c: "TRANSPONDER", r: "STBY", ok: (d) => x(d).xpdrMode === "STBY" },
      { c: "ADIRS", r: "OFF (LAST FLIGHT)", ok: (d) => !sw(d).ir1 && !sw(d).ir2 && !sw(d).ir3 },
      { c: "BAT 1 AND BAT 2", r: "OFF (LAST FLIGHT)", ok: (d) => !sw(d).bat1 && !sw(d).bat2 },
    ],
  },
];
