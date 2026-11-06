// NAV receiver: what a VOR or localizer needle shows for the tuned station and the selected course.
import { bearingDeg, distanceM, M_PER_NM, type LatLon } from "../world/geo.ts";
import { ILS_28 } from "../world/vidp.ts";
import { readIls } from "../sim/ils.ts";
import { navStation, type NavStation } from "./training.ts";

export interface NavReading {
  station: NavStation | null;
  /** Receiving a usable signal. */
  valid: boolean;
  /** Needle deflection, -1 (full left) to +1 (full right): the side the course is on. */
  dev: number;
  /** VOR only: TO or FROM the station. */
  toFrom: "TO" | "FROM" | null;
  /** VOR only: the radial the aircraft is on (bearing from the station), degrees. */
  radial: number | null;
  distNm: number | null;
  /** ILS only: glide slope, -1 (fly down, path below) to +1 (fly up), null if not received. */
  gs: number | null;
}

const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

/** Reads the station on `freq` (kHz) with the course set to `obs` (true degrees). */
export function readNav(freq: number, obs: number, pos: LatLon, altFt: number): NavReading {
  const st = navStation(freq);
  const none: NavReading = { station: st, valid: false, dev: 0, toFrom: null, radial: null, distNm: null, gs: null };
  if (!st) return none;
  const distNm = distanceM(st.pos, pos) / M_PER_NM;
  if (st.kind === "vor") {
    if (distNm > 80) return { ...none, distNm };
    const radial = (bearingDeg(st.pos, pos) + 360) % 360;
    const diff = wrap180(radial - obs);
    // FROM when the aircraft is on the course side of the station, TO when it is on the other side.
    const from = Math.abs(diff) <= 90;
    const off = from ? wrap180(obs - radial) : wrap180((radial + 180) % 360 - obs);
    // Full scale is 10 degrees.
    return { station: st, valid: true, dev: clamp(off / 10), toFrom: from ? "FROM" : "TO", radial, distNm, gs: null };
  }
  // ILS: the localizer needle uses the published course, whatever the course knob says.
  const ils = readIls(ILS_28, pos, altFt);
  if (!ils.valid) return { ...none, distNm };
  return {
    station: st,
    valid: true,
    dev: clamp(-ils.locDevDeg / ILS_28.locFullScaleDeg),
    toFrom: null,
    radial: null,
    distNm,
    gs: ils.distThrNm > 0.3 && ils.distThrNm < 18 ? clamp(-ils.gsDevDeg / ILS_28.gsFullScaleDeg) : null,
  };
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));
