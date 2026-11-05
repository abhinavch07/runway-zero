// ILS deviations for the training ILS. Pure functions, used by the autopilot and the displays.
import { alongCross, M_PER_NM, type LatLon } from "../world/geo.ts";
import type { Ils } from "../world/vidp.ts";

export interface IlsReading {
  /** Localizer deviation, degrees. Positive = aircraft right of the centreline (fly left). */
  locDevDeg: number;
  /** Glide slope deviation, degrees. Positive = aircraft above the path (fly down). */
  gsDevDeg: number;
  /** Cross-track distance from the centreline, metres, positive right. */
  crossM: number;
  /** Height above the glide path, feet, positive above. */
  aboveGpFt: number;
  /** Distance to the threshold along the course, nautical miles (negative once past it). */
  distThrNm: number;
  /** True while the aircraft is in front of the localizer and within signal range. */
  valid: boolean;
}

export function readIls(ils: Ils, pos: LatLon, altFt: number): IlsReading {
  const fromThr = alongCross(ils.threshold, ils.courseT, pos);
  const fromLoc = alongCross(ils.localizer, ils.courseT, pos);
  const fromGp = alongCross(ils.glidePathOrigin, ils.courseT, pos);
  const toLocM = -fromLoc.along; // positive while the aircraft is before the localizer antenna
  const toGpM = Math.max(1, -fromGp.along);
  const hAboveThrFt = altFt - ils.threshold.elevationFt;
  const gpHeightFt = (toGpM * Math.tan((ils.glidePathDeg * Math.PI) / 180)) / 0.3048;
  const locDevDeg = (Math.atan2(fromLoc.cross, Math.max(1, toLocM)) * 180) / Math.PI;
  const gsAngle = (Math.atan2(hAboveThrFt * 0.3048, toGpM) * 180) / Math.PI;
  const distThrNm = -fromThr.along / M_PER_NM;
  return {
    locDevDeg,
    gsDevDeg: gsAngle - ils.glidePathDeg,
    crossM: fromThr.cross,
    aboveGpFt: hAboveThrFt - gpHeightFt,
    distThrNm,
    valid: toLocM > 0 && distThrNm < 25 && Math.abs(locDevDeg) < 35,
  };
}
