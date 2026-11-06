// Light aircraft normal checklists (C172 and PA-28) for the trainer. Simplified, written in our own
// words from general public knowledge. Not the POH checklist. A flight instructor should review.
import type { Checklist, CheckItem } from "../shell/checklist";
import type { C172Controls, C172State } from "../c172/sim/types";
import type { GaVariant } from "../c172/sim/variant";

export interface GaCheck {
  s: C172State;
  c: C172Controls;
}
type Item = CheckItem<GaCheck>;

const sw = (d: GaCheck) => d.c.switches;

export function gaChecklists(v: GaVariant): Checklist<GaCheck>[] {
  const pa28 = v.id === "pa28";
  /** C172: BOTH. PA-28: the fuller tank. */
  const fuelForTakeoff: Item = pa28
    ? {
        c: "FUEL SELECTOR",
        r: "FULLER TANK",
        ok: (d) => (sw(d).fuelSel === "LEFT" && d.s.fuelGal[0] >= d.s.fuelGal[1]) || (sw(d).fuelSel === "RIGHT" && d.s.fuelGal[1] >= d.s.fuelGal[0]),
      }
    : { c: "FUEL SELECTOR", r: "BOTH", ok: (d) => sw(d).fuelSel === "BOTH" };
  const only = (yes: boolean, it: Item): Item[] => (yes ? [it] : []);
  const pumpOn: Item = { c: "ELECTRIC FUEL PUMP", r: "ON", ok: (d) => sw(d).fuelPump };

  return [
    {
      id: "prep",
      title: "Preflight cockpit",
      items: [
        { c: "DOCUMENTS", r: "ON BOARD" },
        { c: "CONTROL LOCK", r: "REMOVED" },
        { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
        { c: "MAGNETOS", r: "OFF", ok: (d) => sw(d).magnetos === "OFF" },
        { c: "AVIONICS", r: "OFF", ok: (d) => !sw(d).avionics },
        { c: "MASTER", r: "ON", ok: (d) => sw(d).masterBat },
        { c: "FUEL QUANTITY", r: "CHECKED (5 GAL OR MORE EACH)", ok: (d) => d.s.fuelGal[0] >= 5 && d.s.fuelGal[1] >= 5 },
        ...only(v.stbyBatt, { c: "STANDBY BATTERY", r: "ARM", ok: (d) => sw(d).stbyBatt }),
      ],
    },
    {
      id: "before-start",
      title: "Before start",
      items: [
        { c: "SEATS AND BELTS", r: "SECURE" },
        { c: "PASSENGER BRIEFING", r: "COMPLETED" },
        pa28 ? { c: "FUEL SELECTOR", r: "LEFT OR RIGHT", ok: (d) => sw(d).fuelSel !== "OFF" } : { c: "FUEL SELECTOR", r: "BOTH", ok: (d) => sw(d).fuelSel === "BOTH" },
        ...only(v.fuelShutoff, { c: "FUEL SHUTOFF", r: "ON (IN)", ok: (d) => sw(d).fuelShutoff }),
        { c: "AVIONICS", r: "OFF", ok: (d) => !sw(d).avionics },
        { c: "BEACON", r: "ON", ok: (d) => sw(d).beacon },
        { c: "MIXTURE", r: "RICH", ok: (d) => d.c.mixture > 0.9 },
        ...only(pa28, pumpOn),
        { c: "PRIME", r: "AS REQUIRED" },
        { c: "PROPELLER AREA", r: "CLEAR" },
      ],
    },
    {
      id: "after-start",
      title: "After start",
      items: [
        { c: "OIL PRESSURE", r: "IN THE GREEN", ok: (d) => d.s.engine.running && d.s.engine.oilPressPsi > 20 },
        { c: "THROTTLE", r: "1000 RPM", ok: (d) => d.s.engine.running && d.s.engine.rpm >= 850 && d.s.engine.rpm <= 1200 },
        ...only(pa28, { c: "ELECTRIC FUEL PUMP", r: "OFF, PRESSURE CHECKED", ok: (d) => !sw(d).fuelPump && d.s.fuelPressPsi > 1.5 }),
        ...only(!pa28, { c: "ELECTRIC FUEL PUMP", r: "OFF", ok: (d) => !sw(d).fuelPump }),
        { c: "AVIONICS", r: "ON", ok: (d) => sw(d).avionics },
        { c: "ALTERNATOR", r: "CHARGING", ok: (d) => d.s.elec.alternatorOn && d.s.elec.mainAmps > 0 },
        { c: "NAV LIGHTS", r: "ON", ok: (d) => sw(d).nav },
        { c: "ALTIMETER", r: "SET (QNH)", ok: (d) => !d.c.baro.std },
        { c: "RADIOS AND TRANSPONDER", r: "SET" },
        { c: "BRAKES", r: "CHECKED WHEN MOVING" },
      ],
    },
    {
      id: "before-takeoff",
      title: "Before take-off",
      items: [
        { c: "PARKING BRAKE", r: "SET (RUN-UP)", ok: (d) => sw(d).parkBrake },
        fuelForTakeoff,
        { c: "MIXTURE", r: "RICH", ok: (d) => d.c.mixture > 0.9 },
        { c: "FLIGHT CONTROLS", r: "FREE AND CORRECT" },
        { c: "MAGNETO CHECK", r: "DONE, BOTH", ok: (d) => sw(d).magnetos === "BOTH" },
        { c: "TRIM", r: "TAKE-OFF", ok: (d) => Math.abs(d.c.trim) < 0.06 },
        pa28 ? { c: "FLAPS", r: "UP", ok: (d) => d.c.flaps === 0 } : { c: "FLAPS", r: "0° TO 10°", ok: (d) => d.c.flaps <= 1 },
        ...only(pa28, pumpOn),
        { c: "TRANSPONDER", r: "ALT", ok: (d) => d.c.radios.xpdrMode === "ALT" },
        { c: "LANDING LIGHT AND STROBE", r: "ON", ok: (d) => sw(d).landing && sw(d).strobe },
        { c: "DOORS AND WINDOWS", r: "CLOSED" },
      ],
    },
    {
      id: "landing",
      title: "Before landing",
      items: [
        fuelForTakeoff,
        { c: "MIXTURE", r: "RICH", ok: (d) => d.c.mixture > 0.9 },
        ...only(pa28, pumpOn),
        { c: "LANDING LIGHT", r: "ON", ok: (d) => sw(d).landing },
        { c: "SEATS AND BELTS", r: "SECURE" },
        { c: "FLAPS", r: "AS REQUIRED" },
      ],
    },
    {
      id: "after-landing",
      title: "After landing",
      items: [
        { c: "FLAPS", r: "UP", ok: (d) => d.c.flaps === 0 },
        ...only(pa28, { c: "ELECTRIC FUEL PUMP", r: "OFF", ok: (d) => !sw(d).fuelPump }),
        { c: "STROBE", r: "OFF", ok: (d) => !sw(d).strobe },
        { c: "LANDING LIGHT", r: "OFF", ok: (d) => !sw(d).landing },
        { c: "TAXI LIGHT", r: "ON", ok: (d) => sw(d).taxi },
        { c: "TRANSPONDER", r: "STBY", ok: (d) => d.c.radios.xpdrMode === "STBY" },
        { c: "TRIM", r: "TAKE-OFF", ok: (d) => Math.abs(d.c.trim) < 0.06 },
      ],
    },
    {
      id: "parking",
      title: "Securing",
      items: [
        { c: "PARKING BRAKE", r: "SET", ok: (d) => sw(d).parkBrake },
        { c: "AVIONICS", r: "OFF", ok: (d) => !sw(d).avionics },
        { c: "MIXTURE", r: "IDLE CUT-OFF", ok: (d) => d.c.mixture < 0.05 && !d.s.engine.running },
        { c: "MAGNETOS", r: "OFF, KEY OUT", ok: (d) => sw(d).magnetos === "OFF" },
        { c: "LIGHTS", r: "OFF", ok: (d) => !sw(d).beacon && !sw(d).nav && !sw(d).taxi && !sw(d).landing && !sw(d).strobe },
        { c: "MASTER", r: "OFF", ok: (d) => !sw(d).masterBat && !sw(d).masterAlt && !sw(d).stbyBatt },
        pa28 ? { c: "FUEL SELECTOR", r: "OFF", ok: (d) => sw(d).fuelSel === "OFF" } : { c: "FUEL SELECTOR", r: "LEFT OR RIGHT", ok: (d) => sw(d).fuelSel !== "BOTH" },
        { c: "CONTROL LOCK", r: "INSTALLED" },
      ],
    },
  ];
}
