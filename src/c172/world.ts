// The first flight world: runway 28 at Delhi (a training stand-in on flat ground) and the training
// circuit around it. Positions are in metres in the runway frame: x along runway 28 from its
// threshold, y to the right of the centreline (north side), heading relative to the runway course.
// The circuit is our own simple training pattern, not a published procedure.
import { alongCross, angleDiff, destination, distanceM, type LatLon } from "../world/geo.ts";
import { RWY28_COURSE_T, VIDP } from "../world/vidp.ts";

const RWY = VIDP.runways[1];
export const THR28 = RWY.ends[1];
export const RWY_COURSE = RWY28_COURSE_T;
export const RWY_LENGTH_M = distanceM(RWY.ends[1], RWY.ends[0]);
export const RWY_WIDTH_M = 45;
/** Flat ground at the runway 28 threshold elevation. */
export const FIELD_FT = THR28.elevationFt;
/** Circuit height above the runway, and what the altimeter reads there with today's QNH. */
export const CIRCUIT_AGL_FT = 1000;
export const CIRCUIT_ALT_FT = Math.round((FIELD_FT + CIRCUIT_AGL_FT) / 100) * 100;

export interface RwyPos {
  /** Metres past the threshold (negative: before it, out on the approach). */
  x: number;
  /** Metres right of the centreline (negative: left, the circuit side). */
  y: number;
  /** Heading relative to the runway course, -180 to 180, right positive. */
  h: number;
}

export function rwyPos(p: LatLon & { headingDeg: number }): RwyPos {
  const { along, cross } = alongCross(THR28, RWY_COURSE, p);
  return { x: along, y: cross, h: angleDiff(RWY_COURSE, p.headingDeg) };
}

/** A point in the runway frame as latitude and longitude. */
export function rwyToLatLon(x: number, y: number): LatLon {
  const a = destination(THR28, RWY_COURSE, x);
  return y === 0 ? a : destination(a, (RWY_COURSE + (y > 0 ? 90 : 270)) % 360, Math.abs(y));
}

/** True heading for a heading relative to the runway. */
export const trueHdg = (rel: number) => Math.round((((RWY_COURSE + rel) % 360) + 360) % 360);

/** Taxiway from the parking apron to the holding point, south of the runway near the threshold. */
export const TAXI = { x: 150, width: 15, apronY: -170, holdY: -55 };

/**
 * The left-hand training circuit, corners in the runway frame: climb out, turn left onto crosswind,
 * downwind on the south side, base, final. About 0.8 NM out from the runway.
 */
export const CIRCUIT = {
  /** Crosswind turn: a little past the far end of the runway. */
  crosswindX: RWY_LENGTH_M + 600,
  /** Downwind track, metres left of the centreline (about 0.8 NM). */
  downwindY: -1500,
  /** Base turn: this far before the threshold. */
  baseX: -1300,
};

export const CIRCUIT_PATH: [number, number][] = [
  [0, 0],
  [CIRCUIT.crosswindX, 0],
  [CIRCUIT.crosswindX, CIRCUIT.downwindY],
  [CIRCUIT.baseX, CIRCUIT.downwindY],
  [CIRCUIT.baseX, 0],
  [0, 0],
];

/** Headings on each leg, true degrees. */
export const LEG_HDG = {
  upwind: trueHdg(0),
  crosswind: trueHdg(-90),
  downwind: trueHdg(180),
  base: trueHdg(90),
  final: trueHdg(0),
};

/** Heading within a tolerance of a true heading. */
export const hdgNear = (hdg: number, target: number, tol: number) => Math.abs(angleDiff(target, hdg)) <= tol;

/** PAPI: four lights left of the runway, this far past the threshold, for a 3 degree approach. */
export const PAPI_X = 300;
/** Angles where each PAPI light changes from red to white, inner (next to the runway) first. */
export const PAPI_ANGLES = [3.5, 3.17, 2.83, 2.5];
