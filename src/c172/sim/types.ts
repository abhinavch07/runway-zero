// Messages and values shared between the C172 page and its simulation worker.

export type MagPos = "OFF" | "R" | "L" | "BOTH" | "START";
export type FuelSel = "LEFT" | "BOTH" | "RIGHT";

/** Positions of every switch and lever the pilot can move in the C172. */
export interface C172Switches {
  masterBat: boolean;
  masterAlt: boolean;
  /** Standby battery for the essential bus (PFD) if main power fails. */
  stbyBatt: boolean;
  avionics: boolean;
  fuelPump: boolean;
  beacon: boolean;
  landing: boolean;
  taxi: boolean;
  nav: boolean;
  strobe: boolean;
  pitotHeat: boolean;
  magnetos: MagPos;
  fuelSel: FuelSel;
  /** Fuel shutoff valve: true = ON (fuel can flow). */
  fuelShutoff: boolean;
  parkBrake: boolean;
}

export interface C172Controls {
  /** 0 idle to 1 full. */
  throttle: number;
  /** 0 idle cut-off to 1 full rich. */
  mixture: number;
  /** Flap lever: 0, 1, 2, 3 = 0°, 10°, 20°, 30°. */
  flaps: number;
  /** Elevator trim, -1 nose down to +1 nose up. */
  trim: number;
  pitch: number;
  roll: number;
  yaw: number;
  brakes: number;
  switches: C172Switches;
  /** Display only: baro setting and heading bug. */
  baro: { qnh: number; std: boolean };
  hdgBug: number;
  /** Radios (page only): frequencies in kHz, [active, standby]. */
  radios: C172Radios;
  /** The ALT half of the master switch was switched off and on again after the failure. */
  altCycled?: boolean;
}

export type XpdrMode = "STBY" | "ON" | "ALT";

export interface C172Radios {
  com: [number, number];
  nav: [number, number];
  /** Course selected for NAV1 (the OBS), degrees. */
  obs: number;
  xpdrCode: string;
  xpdrMode: XpdrMode;
  /** The lesson's ATC clearance was read back correctly. */
  readBack: boolean;
  /** The NAV1 Morse ident was played while a station was received. */
  navIdHeard: boolean;
}

export function defaultC172Radios(): C172Radios {
  return { com: [118325, 118000], nav: [108000, 108000], obs: 360, xpdrCode: "2000", xpdrMode: "STBY", readBack: false, navIdHeard: false };
}

export interface C172Start {
  id: string;
  name: string;
  latDeg: number;
  lonDeg: number;
  headingDeg: number;
  terrainFt: number;
  /** Engine running at the start. */
  running: boolean;
  fuelGalPerTank: number;
  /** Different amounts in the left and right tanks, gallons (overrides fuelGalPerTank). */
  fuelGal?: [number, number];
}

export interface C172State {
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
  groundSpeedKt: number;
  vsFpm: number;
  onGround: boolean;
  flapDeg: number;
  oatC: number;
  engine: {
    running: boolean;
    cranking: boolean;
    rpm: number;
    mapInHg: number;
    fuelFlowGph: number;
    oilPressPsi: number;
    oilTempF: number;
    egtF: number;
    chtF: number;
  };
  fuelGal: [number, number];
  elec: {
    mainVolts: number;
    essVolts: number;
    /** Main battery amps: positive charging, negative discharging. */
    mainAmps: number;
    stbyAmps: number;
    mainBus: boolean;
    essBus: boolean;
    avionicsBus: boolean;
    alternatorOn: boolean;
    /** The alternator has failed (a lesson failure). */
    altFailed: boolean;
    /** Main bus below 24.5 V with the engine running: the LOW VOLTS warning. */
    lowVolts: boolean;
  };
  /** Seconds the fuel pump has run with the engine stopped (priming). */
  primeS: number;
  /** The selected tank is empty: no fuel reaches the engine. */
  starved: boolean;
}

export type C172ToWorker =
  | { type: "init"; baseUrl: string; start: C172Start }
  | { type: "reset"; start: C172Start }
  | { type: "controls"; controls: C172Controls }
  | { type: "fail"; what: "alternator" };

export type C172FromWorker =
  | { type: "ready"; start: C172Start }
  | { type: "state"; state: C172State }
  | { type: "error"; message: string }
  | { type: "log"; message: string };

export function coldC172Switches(): C172Switches {
  return {
    masterBat: false,
    masterAlt: false,
    stbyBatt: false,
    avionics: false,
    fuelPump: false,
    beacon: false,
    landing: false,
    taxi: false,
    nav: false,
    strobe: false,
    pitotHeat: false,
    magnetos: "OFF",
    fuelSel: "BOTH",
    fuelShutoff: true,
    parkBrake: true,
  };
}

export function runningC172Switches(): C172Switches {
  return {
    ...coldC172Switches(),
    masterBat: true,
    masterAlt: true,
    stbyBatt: true,
    avionics: true,
    beacon: true,
    nav: true,
    magnetos: "BOTH",
  };
}
