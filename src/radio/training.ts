// Training radio stations and navaids around Delhi. All MADE UP for training: the names start with
// "RZ" or say TRAINING, and the frequencies are not the real Delhi ones. Never use them for real flight.
import { destination, M_PER_NM, type LatLon } from "../world/geo.ts";
import { ILS_28 } from "../world/vidp.ts";

/** Frequencies are whole kHz (126.025 MHz = 126025) to avoid rounding problems. */
export interface ComStation {
  freq: number;
  name: string;
  kind: "atis" | "delivery" | "ground" | "tower";
}

export const COM_STATIONS: ComStation[] = [
  { freq: 126025, name: "RZ ATIS (TRAINING)", kind: "atis" },
  { freq: 121825, name: "RZ DELIVERY (TRAINING)", kind: "delivery" },
  { freq: 121775, name: "RZ GROUND (TRAINING)", kind: "ground" },
  { freq: 118325, name: "RZ TOWER (TRAINING)", kind: "tower" },
];

export const ATIS_TEXT =
  "This is Delhi training information Alpha. Runway in use 28. Wind 270 degrees 8 knots. " +
  "Visibility 6 kilometres. Temperature 25, dew point 12. QNH 1008. " +
  "Advise on first contact you have information Alpha.";

export interface NavStation {
  freq: number;
  ident: string;
  name: string;
  kind: "vor" | "ils";
  pos: LatLon;
  /** ILS only: the localizer course, true degrees. */
  courseT?: number;
}

const vidp: LatLon = { latDeg: 28.5562, lonDeg: 77.1 };
export const NAV_STATIONS: NavStation[] = [
  {
    freq: 113350,
    ident: "RZV",
    name: "RZ TRAINING VOR",
    kind: "vor",
    pos: destination(vidp, 300, 18 * M_PER_NM),
  },
  {
    freq: 110550,
    ident: "IRZ",
    name: "ILS 28 (TRAINING)",
    kind: "ils",
    pos: ILS_28.localizer,
    courseT: ILS_28.courseT,
  },
];

export const comStation = (freq: number) => COM_STATIONS.find((s) => s.freq === freq) ?? null;
export const navStation = (freq: number) => NAV_STATIONS.find((s) => s.freq === freq) ?? null;

/** "126.025" from 126025. */
export function freqText(khz: number, decimals = 3): string {
  return (khz / 1000).toFixed(decimals);
}

/** One step of a frequency knob. COM: 1 MHz or 25 kHz. NAV: 1 MHz or 50 kHz. */
export function tune(khz: number, kind: "com" | "nav", big: boolean, dir: 1 | -1): number {
  const [lo, hi, small] = kind === "com" ? [118000, 136975, 25] : [108000, 117950, 50];
  const mhz = Math.floor(khz / 1000);
  let part = khz - mhz * 1000;
  let m = mhz;
  if (big) m = mhz + dir;
  else part = (part + dir * small + 1000) % 1000;
  if (m * 1000 < lo) m = Math.floor(hi / 1000);
  if (m * 1000 > hi) m = Math.floor(lo / 1000);
  return Math.min(hi, Math.max(lo, m * 1000 + part));
}

