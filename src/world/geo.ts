// Small geodesy helpers. A spherical Earth is accurate enough for distances inside an airport area
// and for drawing runways, approach paths and the ND.

export const EARTH_R_M = 6371008.8;
export const M_PER_NM = 1852;
export const FT_PER_M = 3.28084;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export interface LatLon {
  latDeg: number;
  lonDeg: number;
}

/** Initial true bearing from a to b, degrees 0 to 360. */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const φ1 = a.latDeg * D2R;
  const φ2 = b.latDeg * D2R;
  const Δλ = (b.lonDeg - a.lonDeg) * D2R;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Great circle distance in metres. */
export function distanceM(a: LatLon, b: LatLon): number {
  const φ1 = a.latDeg * D2R;
  const φ2 = b.latDeg * D2R;
  const Δφ = φ2 - φ1;
  const Δλ = (b.lonDeg - a.lonDeg) * D2R;
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * EARTH_R_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point reached from start going distanceM along a true bearing. */
export function destination(start: LatLon, bearing: number, dist: number): LatLon {
  const δ = dist / EARTH_R_M;
  const θ = bearing * D2R;
  const φ1 = start.latDeg * D2R;
  const λ1 = start.lonDeg * D2R;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { latDeg: φ2 * R2D, lonDeg: (((λ2 * R2D + 540) % 360) - 180) };
}

/** Signed difference b - a in degrees, wrapped to -180..180. */
export function angleDiff(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

/**
 * Position of p relative to a line through `origin` along `courseDeg`.
 * along: metres ahead of origin along the course. cross: metres to the right of the course line.
 */
export function alongCross(origin: LatLon, courseDeg: number, p: LatLon) {
  const d = distanceM(origin, p);
  const brg = bearingDeg(origin, p);
  const rel = angleDiff(courseDeg, brg) * D2R;
  return { along: d * Math.cos(rel), cross: d * Math.sin(rel) };
}
