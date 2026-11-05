// Delhi Indira Gandhi International (VIDP) data for R1.
//
// Runway ends, headings and elevations come from OurAirports (public domain):
// https://github.com/davidmegginson/ourairports-data (runways.csv, fetched 5 Nov 2026).
// The ILS for runway 28 is a TRAINING STAND-IN built from the runway geometry (3 degree glide path,
// localizer on the runway centreline). It is not the published procedure and must not be used for real flying.
import { bearingDeg, destination, distanceM, M_PER_NM, type LatLon } from "./geo.ts";

export interface RunwayEnd extends LatLon {
  ident: string;
  elevationFt: number;
  /** True heading from OurAirports, degrees. */
  headingT: number;
}

export interface Runway {
  lengthFt: number;
  widthFt: number;
  ends: [RunwayEnd, RunwayEnd];
}

export const VIDP = {
  icao: "VIDP",
  name: "Delhi Indira Gandhi International",
  elevationFt: 777,
  runways: [
    {
      lengthFt: 9239,
      widthFt: 148,
      ends: [
        { ident: "09", latDeg: 28.570499, lonDeg: 77.087997, elevationFt: 731, headingT: 91 },
        { ident: "27", latDeg: 28.569799, lonDeg: 77.116997, elevationFt: 752, headingT: 271 },
      ],
    },
    {
      lengthFt: 12510,
      widthFt: 148,
      ends: [
        { ident: "10", latDeg: 28.5672, lonDeg: 77.084801, elevationFt: 725, headingT: 104 },
        { ident: "28", latDeg: 28.5585, lonDeg: 77.122498, elevationFt: 778, headingT: 284 },
      ],
    },
    {
      lengthFt: 13681,
      widthFt: 148,
      ends: [
        { ident: "11L", latDeg: 28.550125, lonDeg: 77.068176, elevationFt: 736, headingT: 103 },
        { ident: "29R", latDeg: 28.540747, lonDeg: 77.111877, elevationFt: 736, headingT: 283 },
      ],
    },
    {
      lengthFt: 14534,
      widthFt: 197,
      ends: [
        { ident: "11R", latDeg: 28.547171, lonDeg: 77.065491, elevationFt: 727, headingT: 103 },
        { ident: "29L", latDeg: 28.537729, lonDeg: 77.109528, elevationFt: 771, headingT: 283 },
      ],
    },
  ] as Runway[],
};

const RWY_10_28 = VIDP.runways[1];
const THR_28 = RWY_10_28.ends[1];
const THR_10 = RWY_10_28.ends[0];

/** Runway 28 centreline course, true degrees, from its two thresholds. */
export const RWY28_COURSE_T = bearingDeg(THR_28, THR_10);
const RWY28_LENGTH_M = distanceM(THR_28, THR_10);

export interface Ils {
  ident: string;
  runway: string;
  /** Localizer course, true degrees. */
  courseT: number;
  /** Runway threshold the approach leads to. */
  threshold: RunwayEnd;
  /** Localizer antenna, past the far end of the runway. */
  localizer: LatLon;
  /** Point on the centreline abeam the glide path antenna. */
  glidePathOrigin: LatLon;
  glidePathDeg: number;
  /** Height the glide path crosses the threshold, feet. */
  thresholdCrossingFt: number;
  /** Full scale localizer deviation (2 dots), degrees. */
  locFullScaleDeg: number;
  /** Full scale glide slope deviation (2 dots), degrees. */
  gsFullScaleDeg: number;
}

const GP_ANGLE = 3;
const TCH_FT = 50;
const gpDistM = (TCH_FT * 0.3048) / Math.tan((GP_ANGLE * Math.PI) / 180); // about 290 m past the threshold

export const ILS_28: Ils = {
  ident: "TRAINING ILS 28",
  runway: "28",
  courseT: RWY28_COURSE_T,
  threshold: THR_28,
  localizer: destination(THR_28, RWY28_COURSE_T, RWY28_LENGTH_M + 300),
  glidePathOrigin: destination(THR_28, RWY28_COURSE_T, gpDistM),
  glidePathDeg: GP_ANGLE,
  thresholdCrossingFt: TCH_FT,
  locFullScaleDeg: 2.5,
  gsFullScaleDeg: 0.7,
};

/** A point a given distance before the runway 28 threshold, out on the approach. */
export function rwy28Final(nm: number): LatLon {
  return destination(THR_28, (RWY28_COURSE_T + 180) % 360, nm * M_PER_NM);
}

/** A point a given distance past the runway 28 threshold, along the runway. */
export function rwy28Along(m: number): LatLon {
  return destination(THR_28, RWY28_COURSE_T, m);
}
