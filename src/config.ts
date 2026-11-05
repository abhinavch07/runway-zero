import type { StartPosition } from "./sim/types";

// R0 starts in the air near Delhi. Runway starts come in R1, once runway data from the eAIP is in.
// Position is approximate, a few miles east of the airport, heading west.
export const START: StartPosition = {
  name: "Near Delhi, 3,000 ft, heading 280",
  latDeg: 28.58,
  lonDeg: 77.2,
  altFt: 3000,
  kias: 220,
  headingDeg: 280,
  terrainFt: 750,
};

/** Free Cesium ion token from the .env file (VITE_CESIUM_ION_TOKEN). Empty means no-token mode. */
export const CESIUM_ION_TOKEN: string = (import.meta.env.VITE_CESIUM_ION_TOKEN ?? "").trim();

/** Pilot eye position above the aircraft reference point, metres. Rough figure for R0. */
export const EYE_HEIGHT_M = 3;
