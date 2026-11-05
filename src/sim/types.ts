// Messages and values shared between the page and the simulation worker.
import type { FccStatus, FcuAction, FcuValues } from "./fcc.ts";
import type { Switches, SystemsStatus } from "./systems.ts";

export interface Controls {
  /** Stick pitch, -1 full forward (nose down) to +1 full back (nose up). */
  pitch: number;
  /** Stick roll, -1 full left to +1 full right. */
  roll: number;
  /** Rudder pedals, -1 full left to +1 full right. Also steers the nosewheel on the ground. */
  yaw: number;
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
  /** Overhead and pedestal switch positions. */
  switches: Switches;
  /** EFIS control panel: flight director, baro reference. Display only. */
  efis?: { fd: boolean; qnh: number; std: boolean };
}

export interface TouchdownReport {
  vsFpm: number;
  kias: number;
  pitchDeg: number;
  rollDeg: number;
  /** Distance past the runway 28 threshold, metres. */
  distPastThresholdM: number;
  /** Distance right of the runway centreline, metres. */
  offCentreM: number;
  simTime: number;
}

export interface SimState {
  simTime: number;
  latDeg: number;
  lonDeg: number;
  /** Height used to draw on the globe, metres (true altitude plus the globe offset). */
  heightM: number;
  /** Altitude above mean sea level, feet. */
  altFt: number;
  /** Height above the terrain under the aircraft, feet. */
  aglFt: number;
  pitchDeg: number;
  rollDeg: number;
  headingDeg: number;
  trackDeg: number;
  kias: number;
  groundSpeedKt: number;
  machNo: number;
  vsFpm: number;
  n1: [number, number];
  n2: [number, number];
  egtC: [number, number];
  /** Fuel flow per engine, kg per hour. */
  fuelFlowKgH: [number, number];
  /** Fuel on board, kg. */
  fuelKg: number;
  throttlePos: number;
  flapDeg: number;
  gearPos: number;
  speedbrakePos: number;
  onGround: boolean;
  pitchTrim: number;
  /** How many sim seconds ran per real second over the last report. */
  simRate: number;
  fcc: FccStatus;
  systems: SystemsStatus;
  touchdown: TouchdownReport | null;
}

export interface StartPosition {
  id: string;
  name: string;
  latDeg: number;
  lonDeg: number;
  /** Altitude above mean sea level, feet. Ignored for ground starts. */
  altFt: number;
  kias: number;
  headingDeg: number;
  gammaDeg?: number;
  /** Terrain elevation above mean sea level under the start point, feet. */
  terrainFt: number;
  onGround?: boolean;
  /** Cold and dark: everything off, engines stopped, parking brake set. */
  coldAndDark?: boolean;
  /** At the gate: APU running, ADIRS aligned, engines off, parking brake set. */
  powered?: boolean;
  flapLever: number;
  gearDown: boolean;
  /** Total fuel, pounds, split between the two wing tanks. */
  fuelLbs: number;
  fcu: FcuValues;
}

export type ToWorker =
  | { type: "init"; baseUrl: string; start: StartPosition; displayOffsetM: number }
  | { type: "controls"; controls: Controls }
  | { type: "terrain"; elevationFt: number }
  | { type: "pause"; paused: boolean }
  | { type: "reset"; start: StartPosition; displayOffsetM: number }
  | { type: "fcu"; action: FcuAction };

export type FromWorker =
  | { type: "ready"; throttle: number; start: StartPosition }
  | { type: "state"; state: SimState }
  | { type: "error"; message: string }
  | { type: "notice"; message: string }
  | { type: "log"; message: string };
