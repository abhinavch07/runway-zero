// Messages and values shared between the 737 page and its simulation worker.
import type { AfcsStatus, McpAction, RoutePoint } from "./afcs.ts";
import type { Sys737Status } from "./systems.ts";

export type IrsMode = "OFF" | "ALIGN" | "NAV";
export type EngStart = "GRD" | "OFF" | "CONT";
export type StartLever = "CUTOFF" | "IDLE";
/** What a generator bus is connected to. */
export type BusSource = "" | "APU" | "ENG";

/** Positions of every switch the pilot can move. Owned by the page, copied to the worker. */
export interface Sw737 {
  battery: boolean;
  /** The APU switch is OFF or ON. START is a spring position: each press counts. */
  apuOn: boolean;
  apuStartPresses: number;
  /** Source chosen for AC bus 1 and 2 with the APU GEN and GEN switches. */
  bus: [BusSource, BusSource];
  irs: [IrsMode, IrsMode];
  /** Fuel pumps: left FWD, left AFT, centre L, centre R, right FWD, right AFT. */
  fuelPumps: [boolean, boolean, boolean, boolean, boolean, boolean];
  /** Hydraulic pumps: ENG 1 (A), ELEC 2 (A), ELEC 1 (B), ENG 2 (B). */
  hydPumps: [boolean, boolean, boolean, boolean];
  apuBleed: boolean;
  engBleed: [boolean, boolean];
  packs: [boolean, boolean];
  engStart: [EngStart, EngStart];
  startLever: [StartLever, StartLever];
  beacon: boolean;
  position: boolean;
  strobe: boolean;
  landing: boolean;
  taxi: boolean;
  seatBelts: boolean;
  parkBrake: boolean;
}

export interface Controls737 {
  /** Yoke: -1 forward to +1 back, -1 left to +1 right. Rudder -1 left to +1 right. */
  pitch: number;
  roll: number;
  yaw: number;
  /** Thrust levers when the autothrottle is not moving them, 0 idle to 1 full. */
  throttle: number;
  /** Flap lever: 0, 1, 5, 15, 30 or 40 (degrees). */
  flaps: number;
  gearDown: boolean;
  brakes: number;
  switches: Sw737;
  /** NAV 1 frequency (kHz) and the MCP course 1, for VOR/LOC. */
  nav1: number;
  crs1: number;
  /** Page-only settings: radios, EFIS, the lesson checks. Not used by the flight model. */
  x: Extras737;
}

export type XpdrMode737 = "STBY" | "XPNDR" | "TA/RA";

export interface Extras737 {
  /** VHF 1 and NAV 1, kHz, [active, standby]. */
  vhf1: [number, number];
  nav1: [number, number];
  xpdrCode: string;
  xpdrMode: XpdrMode737;
  readBack: boolean;
  navIdHeard: boolean;
  baro: { qnh: number; std: boolean };
  ndMode: "MAP" | "VOR" | "APP";
  ndRange: number;
}

export function defaultExtras737(): Extras737 {
  return {
    vhf1: [118325, 118000],
    nav1: [108000, 108000],
    xpdrCode: "2000",
    xpdrMode: "STBY",
    readBack: false,
    navIdHeard: false,
    baro: { qnh: 1013, std: false },
    ndMode: "MAP",
    ndRange: 20,
  };
}

export interface Start737 {
  id: string;
  latDeg: number;
  lonDeg: number;
  headingDeg: number;
  terrainFt: number;
  onGround: boolean;
  altFt?: number;
  kias?: number;
  /** cold: everything off. powered: APU running, IRS aligned, engines off. running: engines running. */
  state: "cold" | "powered" | "running";
  fuelKg: number;
}

export interface State737 {
  simTime: number;
  latDeg: number;
  lonDeg: number;
  altFt: number;
  aglFt: number;
  pitchDeg: number;
  rollDeg: number;
  headingDeg: number;
  trackDeg: number;
  kias: number;
  mach: number;
  groundSpeedKt: number;
  vsFpm: number;
  onGround: boolean;
  flapDeg: number;
  gearPos: number;
  /** Thrust lever position actually used (pilot or autothrottle). */
  throttle: number;
  sys: Sys737Status;
  afcs: AfcsStatus;
}

export type ToWorker737 =
  | { type: "init"; baseUrl: string; start: Start737 }
  | { type: "reset"; start: Start737 }
  | { type: "controls"; controls: Controls737 }
  | { type: "mcp"; action: McpAction }
  | { type: "route"; points: RoutePoint[]; crzAltFt: number }
  | { type: "rate"; rate: number };

export type FromWorker737 =
  | { type: "ready"; start: Start737 }
  | { type: "state"; state: State737 }
  | { type: "error"; message: string }
  | { type: "log"; message: string };

export function coldSwitches737(): Sw737 {
  return {
    battery: false,
    apuOn: false,
    apuStartPresses: 0,
    bus: ["", ""],
    irs: ["OFF", "OFF"],
    fuelPumps: [false, false, false, false, false, false],
    hydPumps: [true, false, false, true],
    apuBleed: false,
    engBleed: [true, true],
    packs: [true, true],
    engStart: ["OFF", "OFF"],
    startLever: ["CUTOFF", "CUTOFF"],
    beacon: false,
    position: false,
    strobe: false,
    landing: false,
    taxi: false,
    seatBelts: false,
    parkBrake: true,
  };
}

/** At the gate before engine start: battery, APU on both buses with bleed, IRS in NAV. */
export function poweredSwitches737(): Sw737 {
  return {
    ...coldSwitches737(),
    battery: true,
    apuOn: true,
    bus: ["APU", "APU"],
    irs: ["NAV", "NAV"],
    apuBleed: true,
    position: true,
  };
}

/** Both engines running, generators on, in flight or ready to taxi. */
export function runningSwitches737(): Sw737 {
  return {
    ...poweredSwitches737(),
    apuOn: false,
    apuBleed: false,
    bus: ["ENG", "ENG"],
    fuelPumps: [true, true, false, false, true, true],
    hydPumps: [true, true, true, true],
    startLever: ["IDLE", "IDLE"],
    beacon: true,
    strobe: true,
    seatBelts: true,
    parkBrake: false,
  };
}
