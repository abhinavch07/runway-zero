// ECAM logic, simplified: alerts with their action lines (lines go away as the crew does them),
// the take-off memo, and the T.O CONFIG test. Written in our own words from public descriptions
// of the A320 family. Not the real warning logic, and only a few alerts exist.
import type { A320Extras, Controls, SimState } from "../sim/types";

export interface AlertLine {
  text: string;
  done: boolean;
  /** Shown only once this is true (for "IF UNSUCCESSFUL" lines). */
  show?: boolean;
}

export interface Alert {
  id: string;
  title: string;
  level: "caution" | "warning";
  lines: AlertLine[];
}

/** The alerts active now, before any are cleared. */
export function activeAlerts(s: SimState, c: Controls): Alert[] {
  const x = c.extras;
  const sw = c.switches;
  const sys = s.systems;
  const out: Alert[] = [];
  if (sys.gen1Failed && sys.engines[0].phase === "RUN") {
    const cycled = !!x?.gen1Cycled;
    out.push({
      id: "gen1",
      title: "ELEC GEN 1 FAULT",
      level: "caution",
      lines: [
        { text: "-GEN 1 ........ OFF THEN ON", done: cycled },
        { text: "  IF UNSUCCESSFUL:", done: false, show: cycled },
        { text: "-GEN 1 ................ OFF", done: cycled && !sw.gen1, show: cycled },
        { text: "-APU (IF AVAIL) ..... START", done: sys.apuAvail, show: cycled && !sw.gen1 },
      ],
    });
  }
  return out;
}

/** Alerts still shown on the upper ECAM (not cleared with CLR). */
export function shownAlerts(s: SimState, c: Controls): Alert[] {
  const cleared = c.extras?.cleared ?? [];
  return activeAlerts(s, c).filter((a) => !cleared.includes(a.id));
}

export interface MemoItem {
  label: string;
  value: string;
  ok: boolean;
}

/** Take-off memo: shown on the ground with both engines running, before take-off. */
export function takeoffMemo(s: SimState, c: Controls): MemoItem[] | null {
  const sys = s.systems;
  const bothRunning = sys.engines.every((e) => e.phase === "RUN");
  if (!s.onGround || !bothRunning || s.groundSpeedKt > 40) return null;
  const x = c.extras;
  if (!x) return null;
  return [
    { label: "AUTO BRK", value: "MAX", ok: x.autobrake === "MAX" },
    { label: "SIGNS", value: "ON", ok: c.switches.seatBelts },
    { label: "CABIN", value: "CHECK", ok: sys.doorsClosed },
    { label: "SPLRS", value: "ARM", ok: x.spoilersArmed },
    { label: "FLAPS", value: "T.O", ok: c.flapLever >= 1 && c.flapLever <= 3 },
    { label: "T.O CONFIG", value: x.toConfigNormal ? "NORMAL" : "TEST", ok: x.toConfigNormal },
  ];
}

/**
 * The T.O CONFIG test: checks the items that would give a configuration warning at take-off power.
 * Returns the problems found (empty = T.O CONFIG NORMAL).
 */
export function toConfigTest(s: SimState, c: Controls, fmsThs: string | null): string[] {
  const x = c.extras;
  const problems: string[] = [];
  if (!(c.flapLever >= 1 && c.flapLever <= 3)) problems.push("CONFIG FLAPS NOT IN T.O CONFIG");
  if (c.speedbrake > 0 || s.speedbrakePos > 0.05) problems.push("CONFIG SPD BRK NOT RETRACTED");
  if (x && Math.abs(x.rudderTrim) > 3) problems.push("CONFIG RUD TRIM NOT IN T.O RANGE");
  if (x && thsFromFms(fmsThs) !== null && Math.abs(x.ths - thsFromFms(fmsThs)!) > 1.5)
    problems.push("CONFIG PITCH TRIM NOT IN T.O RANGE");
  if (c.switches.parkBrake) problems.push("CONFIG PARK BRK ON");
  return problems;
}

/** THS from the MCDU format (UP0.8, DN1.0) to degrees, nose up positive. */
export function thsFromFms(ths: string | null): number | null {
  if (!ths) return null;
  const m = /^(UP|DN)(\d(?:\.\d)?)$/.exec(ths);
  if (!m) return null;
  return (m[1] === "UP" ? 1 : -1) * Number(m[2]);
}

export function thsText(deg: number): string {
  if (Math.abs(deg) < 0.05) return "0.0";
  return `${deg > 0 ? "UP" : "DN"} ${Math.abs(deg).toFixed(1)}`;
}

/** The GEN 1 OFF-then-ON reset counts only after the failure. */
export function trackGen1Cycle(s: SimState, c: Controls, x: A320Extras, seen: { off: boolean }) {
  if (!s.systems.gen1Failed || x.gen1Cycled) return;
  if (!c.switches.gen1) seen.off = true;
  else if (seen.off) x.gen1Cycled = true;
}
