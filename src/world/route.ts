// Airports and waypoints known to the trainer's small navigation database.
// VIDP runway data comes from vidp.ts (OurAirports, public domain). VABB is listed by runway ident
// only, for the arrival page. The RZ waypoints are made up for training. They are not real fixes,
// and the digits in their names make sure they can never match one.
import { bearingDeg, destination, distanceM, M_PER_NM, type LatLon } from "./geo";
import { VIDP } from "./vidp";

export interface NavRunway {
  ident: string;
  lengthM: number;
  headingT: number;
  /** Threshold of this runway end, where the take-off starts. */
  start: LatLon;
  /** Far end, where the aircraft leaves the ground. */
  end: LatLon;
}

export interface NavAirport extends LatLon {
  icao: string;
  name: string;
  runways: NavRunway[];
}

const vidpRunways: NavRunway[] = VIDP.runways
  .flatMap((r) =>
    r.ends.map((e, i) => ({
      ident: e.ident,
      lengthM: Math.round(r.lengthFt * 0.3048),
      headingT: e.headingT,
      start: e,
      end: r.ends[1 - i],
    })),
  )
  .sort((a, b) => a.ident.localeCompare(b.ident));

const VABB_ARP: LatLon = { latDeg: 19.0887, lonDeg: 72.8679 };
const vabbRunway = (ident: string, headingT: number): NavRunway => ({
  ident,
  lengthM: 0,
  headingT,
  start: VABB_ARP,
  end: VABB_ARP,
});

export const AIRPORTS: Record<string, NavAirport> = {
  VIDP: { icao: "VIDP", name: "DELHI", latDeg: 28.5562, lonDeg: 77.1, runways: vidpRunways },
  VABB: {
    icao: "VABB",
    name: "MUMBAI",
    ...VABB_ARP,
    runways: [vabbRunway("09", 89), vabbRunway("14", 138), vabbRunway("27", 269), vabbRunway("32", 318)],
  },
};

// Training waypoints laid out between Delhi and Mumbai.
const vidp = AIRPORTS.VIDP;
const vabb = AIRPORTS.VABB;
const course = bearingDeg(vidp, vabb);
export const WAYPOINTS: Record<string, LatLon> = {
  RZ101: destination(vidp, 250, 25 * M_PER_NM),
  RZ102: destination(vidp, course, 200 * M_PER_NM),
  RZ103: destination(vidp, course, 450 * M_PER_NM),
};

export function distanceNm(a: LatLon, b: LatLon): number {
  return distanceM(a, b) / M_PER_NM;
}
