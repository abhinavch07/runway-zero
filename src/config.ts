import type { StartPosition } from "./sim/types.ts";
import { ILS_28, RWY28_COURSE_T, rwy28Along, rwy28Final } from "./world/vidp.ts";
import { destination } from "./world/geo.ts";

const thr28 = ILS_28.threshold;
const lineup = rwy28Along(60);
const final10 = rwy28Final(10);
// Cold and dark: parked 90 m left of the runway 28 centreline, 200 m in from the threshold,
// nose pointing 45 degrees towards the runway. A short taxi forward and a left turn lines up.
const parked = destination(rwy28Along(200), (RWY28_COURSE_T + 270) % 360, 90);
// FCU lesson: in level flight, well clear of the airport.
const cruisePos = destination(thr28, 105, 30 * 1852);
const final10AltFt =
  thr28.elevationFt + ILS_28.thresholdCrossingFt + (10 * 1852 * Math.tan((ILS_28.glidePathDeg * Math.PI) / 180)) / 0.3048;

/** Start positions offered in the menu. The first one is the default. */
export const STARTS: StartPosition[] = [
  {
    id: "cold28",
    name: "Cold and dark, beside runway 28 (guided start up)",
    latDeg: parked.latDeg,
    lonDeg: parked.lonDeg,
    altFt: thr28.elevationFt,
    kias: 0,
    headingDeg: (RWY28_COURSE_T + 45) % 360,
    terrainFt: thr28.elevationFt,
    onGround: true,
    coldAndDark: true,
    flapLever: 0,
    gearDown: true,
    fuelLbs: 16000,
    fcu: { spd: 160, hdg: 285, alt: 5000, vs: 0 },
  },
  {
    id: "gate28",
    name: "At the gate beside runway 28, APU running, engines off",
    latDeg: parked.latDeg,
    lonDeg: parked.lonDeg,
    altFt: thr28.elevationFt,
    kias: 0,
    headingDeg: (RWY28_COURSE_T + 45) % 360,
    terrainFt: thr28.elevationFt,
    onGround: true,
    powered: true,
    flapLever: 0,
    gearDown: true,
    fuelLbs: 17600,
    fcu: { spd: 160, hdg: 285, alt: 3000, vs: 0 },
  },
  {
    id: "parked28",
    name: "Parked beside runway 28, engines running",
    latDeg: parked.latDeg,
    lonDeg: parked.lonDeg,
    altFt: thr28.elevationFt,
    kias: 0,
    headingDeg: (RWY28_COURSE_T + 45) % 360,
    terrainFt: thr28.elevationFt,
    onGround: true,
    flapLever: 0,
    gearDown: true,
    fuelLbs: 8000,
    fcu: { spd: 160, hdg: 285, alt: 5000, vs: 0 },
  },
  {
    id: "cruise10k",
    name: "Cruise at 10,000 ft east of Delhi",
    latDeg: cruisePos.latDeg,
    lonDeg: cruisePos.lonDeg,
    altFt: 10000,
    kias: 250,
    headingDeg: 285,
    terrainFt: 700,
    flapLever: 0,
    gearDown: false,
    fuelLbs: 14000,
    fcu: { spd: 250, hdg: 285, alt: 10000, vs: 0 },
  },
  {
    id: "rwy28",
    name: "VIDP runway 28, ready for takeoff",
    latDeg: lineup.latDeg,
    lonDeg: lineup.lonDeg,
    altFt: thr28.elevationFt,
    kias: 0,
    headingDeg: RWY28_COURSE_T,
    terrainFt: thr28.elevationFt,
    onGround: true,
    flapLever: 2,
    gearDown: true,
    fuelLbs: 16000,
    fcu: { spd: 160, hdg: 285, alt: 5000, vs: 0 },
  },
  {
    id: "final28",
    name: "10 NM final, runway 28 ILS",
    latDeg: final10.latDeg,
    lonDeg: final10.lonDeg,
    altFt: Math.round(final10AltFt),
    kias: 145,
    headingDeg: RWY28_COURSE_T,
    gammaDeg: -3,
    terrainFt: thr28.elevationFt,
    flapLever: 4,
    gearDown: true,
    fuelLbs: 10000,
    fcu: { spd: 140, hdg: 285, alt: 3000, vs: 0 },
  },
  {
    id: "delhi3000",
    name: "Near Delhi, 3,000 ft, heading 280",
    latDeg: 28.58,
    lonDeg: 77.2,
    altFt: 3000,
    kias: 220,
    headingDeg: 280,
    terrainFt: 750,
    flapLever: 0,
    gearDown: false,
    fuelLbs: 16000,
    fcu: { spd: 220, hdg: 280, alt: 3000, vs: 0 },
  },
];
