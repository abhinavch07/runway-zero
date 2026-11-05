// Messages and values shared between the page and the simulation worker.

export interface Controls {
  /** Stick pitch, -1 full forward (nose down) to +1 full back (nose up). */
  pitch: number;
  /** Stick roll, -1 full left to +1 full right. */
  roll: number;
  /** Rudder, -1 full left to +1 full right. */
  yaw: number;
  /** Pitch trim, -1 to +1. */
  pitchTrim: number;
  /** Thrust levers, 0 idle to 1 full. */
  throttle: number;
  /** Flap lever detent: 0, 1, 2, 3 or 4 (FULL). */
  flapLever: number;
  /** Gear lever, true when down. */
  gearDown: boolean;
  /** Speedbrake lever, 0 retracted to 1 full. */
  speedbrake: number;
  /** Wheel brakes, 0 off to 1 full. */
  brakes: number;
}

export interface SimState {
  simTime: number;
  latDeg: number;
  lonDeg: number;
  /** Height above the WGS84 ellipsoid used by the globe, metres. */
  heightM: number;
  altFt: number;
  /** Height above the terrain under the aircraft, feet. */
  aglFt: number;
  pitchDeg: number;
  rollDeg: number;
  headingDeg: number;
  kias: number;
  groundSpeedKt: number;
  machNo: number;
  vsFpm: number;
  n1: [number, number];
  throttlePos: number;
  flapDeg: number;
  gearPos: number;
  speedbrakePos: number;
  onGround: boolean;
  /** How many sim seconds ran per real second over the last report. */
  simRate: number;
}

export interface StartPosition {
  name: string;
  latDeg: number;
  lonDeg: number;
  altFt: number;
  kias: number;
  headingDeg: number;
  /** Terrain height to use until the globe sends a real sample, feet. */
  terrainFt: number;
}

export type ToWorker =
  | { type: "init"; baseUrl: string; start: StartPosition }
  | { type: "controls"; controls: Controls }
  | { type: "terrain"; elevationFt: number }
  | { type: "pause"; paused: boolean }
  | { type: "reset"; start: StartPosition };

export type FromWorker =
  | { type: "ready"; trimmedThrottle: number; trimmedPitchTrim: number }
  | { type: "state"; state: SimState }
  | { type: "error"; message: string }
  | { type: "log"; message: string };
