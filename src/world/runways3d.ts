// Draws the VIDP runways on the globe: surface, centreline and threshold bars.
// On real terrain they are draped on the ground. Without a token the ground is the flat ellipsoid.
import * as Cesium from "cesium";
import { bearingDeg, destination, type LatLon } from "./geo";
import { VIDP } from "./vidp";

/**
 * @param draped true when real terrain is loaded: runways are draped on it.
 *   false for the flat no-token globe: runways are drawn just above the ellipsoid.
 */
export function addRunways(viewer: Cesium.Viewer, draped: boolean) {
  const flat = (pts: LatLon[], h: number) => Cesium.Cartesian3.fromDegreesArrayHeights(pts.flatMap((c) => [c.lonDeg, c.latDeg, h]));
  const polygon = (pts: LatLon[], material: Cesium.Color, h: number) =>
    draped
      ? {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(pts.flatMap((c) => [c.lonDeg, c.latDeg])),
          material,
          classificationType: Cesium.ClassificationType.TERRAIN,
        }
      : { hierarchy: flat(pts, h), material, perPositionHeight: true };
  const surface = Cesium.Color.fromCssColorString("#3a3d42");
  const paint = Cesium.Color.WHITE.withAlpha(0.9);
  for (const rwy of VIDP.runways) {
    const [a, b] = rwy.ends;
    const brg = bearingDeg(a, b);
    const halfW = (rwy.widthFt * 0.3048) / 2;
    const side = (p: LatLon, dir: number, w: number) => destination(p, (brg + dir + 360) % 360, w);
    const corners = [side(a, -90, halfW), side(b, -90, halfW), side(b, 90, halfW), side(a, 90, halfW)];
    viewer.entities.add({ polygon: polygon(corners, surface, 0.1) });
    viewer.entities.add({
      polyline: {
        positions: draped ? Cesium.Cartesian3.fromDegreesArray([a.lonDeg, a.latDeg, b.lonDeg, b.latDeg]) : flat([a, b], 0.3),
        width: 2,
        clampToGround: draped,
        material: new Cesium.PolylineDashMaterialProperty({ color: paint, dashLength: 24 }),
      },
    });
    // Threshold bars: a white band across each end, 30 m deep.
    for (const [end, dir] of [
      [a, brg],
      [b, (brg + 180) % 360],
    ] as [LatLon, number][]) {
      const inner = destination(end, dir, 30);
      const bar = [
        destination(end, (dir + 270) % 360, halfW * 0.9),
        destination(inner, (dir + 270) % 360, halfW * 0.9),
        destination(inner, (dir + 90) % 360, halfW * 0.9),
        destination(end, (dir + 90) % 360, halfW * 0.9),
      ];
      viewer.entities.add({ polygon: polygon(bar, paint, 0.2) });
    }
  }
}
