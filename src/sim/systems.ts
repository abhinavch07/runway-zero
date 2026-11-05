// Simplified aircraft systems for R2: electrics, APU, ADIRS, fuel pumps, bleed air and engine start.
//
// A training model in the spirit of the A320 family, written from public descriptions. It is not the
// real logic. Times are shortened where the real wait is long (ADIRS alignment), and this is said
// in the checklist text.
import type { Fdm } from "./fcc.ts";

export type EngMode = "NORM" | "IGN";

/** Positions of every switch the pilot can move. Owned by the page, copied to the worker. */
export interface Switches {
  bat1: boolean;
  bat2: boolean;
  extPwr: boolean;
  apuGen: boolean;
  gen1: boolean;
  gen2: boolean;
  ir1: boolean;
  ir2: boolean;
  ir3: boolean;
  fuelL1: boolean;
  fuelL2: boolean;
  fuelR1: boolean;
  fuelR2: boolean;
  apuMaster: boolean;
  /** Counts presses of the APU START button (a push-and-release button). */
  apuStartPresses: number;
  apuBleed: boolean;
  pack1: boolean;
  pack2: boolean;
  engBleed1: boolean;
  engBleed2: boolean;
  beacon: boolean;
  navLights: boolean;
  strobe: boolean;
  landingLights: boolean;
  taxiLight: boolean;
  seatBelts: boolean;
  engMaster1: boolean;
  engMaster2: boolean;
  engMode: EngMode;
  parkBrake: boolean;
}

/** Switch positions for an aircraft that is powered up with both engines running. */
export function runningSwitches(): Switches {
  return {
    bat1: true,
    bat2: true,
    extPwr: false,
    apuGen: true,
    gen1: true,
    gen2: true,
    ir1: true,
    ir2: true,
    ir3: true,
    fuelL1: true,
    fuelL2: true,
    fuelR1: true,
    fuelR2: true,
    apuMaster: false,
    apuStartPresses: 0,
    apuBleed: false,
    pack1: true,
    pack2: true,
    engBleed1: true,
    engBleed2: true,
    beacon: true,
    navLights: true,
    strobe: true,
    landingLights: true,
    taxiLight: false,
    seatBelts: true,
    engMaster1: true,
    engMaster2: true,
    engMode: "NORM",
    parkBrake: false,
  };
}

/** Switch positions for a cold and dark aircraft, as the crew finds it before cockpit preparation. */
export function coldSwitches(): Switches {
  return {
    ...runningSwitches(),
    bat1: false,
    bat2: false,
    ir1: false,
    ir2: false,
    ir3: false,
    fuelL1: false,
    fuelL2: false,
    fuelR1: false,
    fuelR2: false,
    beacon: false,
    navLights: false,
    strobe: false,
    landingLights: false,
    seatBelts: false,
    engMaster1: false,
    engMaster2: false,
    parkBrake: true,
  };
}

export interface EngineStatus {
  /** OFF, CRANK (starter turning, no fuel yet), LIGHT (fuel on, accelerating), RUN. */
  phase: "OFF" | "CRANK" | "LIGHT" | "RUN";
  n1: number;
  n2: number;
  egtC: number;
  fuelFlowKgH: number;
  /** Shows AVAIL on the engine display for a few seconds after a good start. */
  availTimer: number;
}

export interface SystemsStatus {
  dcPower: boolean;
  acPower: boolean;
  acSource: "" | "EXT" | "APU" | "GEN";
  batVolts: [number, number];
  extPwrAvail: boolean;
  apuN: number;
  apuFlapOpen: boolean;
  apuStarting: boolean;
  apuAvail: boolean;
  bleedPsi: number;
  irAligning: [boolean, boolean, boolean];
  irAligned: [boolean, boolean, boolean];
  irSecondsLeft: number;
  fuelPressL: boolean;
  fuelPressR: boolean;
  engines: [EngineStatus, EngineStatus];
  parkBrake: boolean;
}

const IR_ALIGN_SECONDS = 60; // real alignment takes several minutes
const APU_START_SECONDS = 45;
const START_FUEL_N2 = 22; // fuel is added at this N2 during an automatic start
const START_MIN_BLEED_PSI = 25;
const AMBIENT_C = 25;

const blankEngine = (): EngineStatus => ({ phase: "OFF", n1: 0, n2: 0, egtC: AMBIENT_C, fuelFlowKgH: 0, availTimer: 0 });

export class Systems {
  private fdm: Fdm;
  private st: SystemsStatus;
  private irTime: [number, number, number] = [0, 0, 0];
  private apuFlapTime = 0;
  private apuPressesSeen = 0;
  /** Seconds stopped on the ground. Ground power is plugged in after 20 s stopped. */
  private stoppedS = 30;

  constructor(fdm: Fdm) {
    this.fdm = fdm;
    this.st = this.blank();
  }

  private blank(): SystemsStatus {
    return {
      dcPower: false,
      acPower: false,
      acSource: "",
      batVolts: [25.5, 25.5],
      extPwrAvail: true,
      apuN: 0,
      apuFlapOpen: false,
      apuStarting: false,
      apuAvail: false,
      bleedPsi: 0,
      irAligning: [false, false, false],
      irAligned: [false, false, false],
      irSecondsLeft: 0,
      fuelPressL: false,
      fuelPressR: false,
      engines: [blankEngine(), blankEngine()],
      parkBrake: false,
    };
  }

  /** Called after a start position is set. Cold: everything off. Otherwise: powered, aligned, running. */
  reset(cold: boolean, switches: Switches) {
    this.st = this.blank();
    this.stoppedS = 30;
    this.apuPressesSeen = switches.apuStartPresses;
    this.apuFlapTime = 0;
    if (cold) {
      this.irTime = [0, 0, 0];
    } else {
      this.irTime = [IR_ALIGN_SECONDS, IR_ALIGN_SECONDS, IR_ALIGN_SECONDS];
      this.st.irAligned = [true, true, true];
      for (const e of this.st.engines) {
        e.phase = "RUN";
        e.egtC = 420;
      }
    }
  }

  status(): SystemsStatus {
    return this.st;
  }

  /** One step. Also drives the flight model's engine starter and fuel cut-off. */
  step(dt: number, sw: Switches) {
    const f = this.fdm;
    const s = this.st;
    const onGround = f.get("gear/wow") > 0;
    const gsKt = f.get("velocities/vg-fps") * 0.5925;
    this.stoppedS = onGround && gsKt < 1 ? this.stoppedS + dt : 0;

    // ----- Engines (flight model) -----
    const running = [f.get("propulsion/engine[0]/set-running") > 0, f.get("propulsion/engine[1]/set-running") > 0];

    // ----- Electrics -----
    s.extPwrAvail = this.stoppedS > 20;
    const genOn = [running[0] && sw.gen1, running[1] && sw.gen2];
    const ext = sw.extPwr && s.extPwrAvail;
    const apuGen = sw.apuGen && s.apuAvail;
    // Priority: engine generators, then external power, then the APU generator.
    s.acSource = genOn[0] || genOn[1] ? "GEN" : ext ? "EXT" : apuGen ? "APU" : "";
    s.acPower = s.acSource !== "";
    s.dcPower = s.acPower || sw.bat1 || sw.bat2;
    const charging = s.acPower ? 28.2 : 25.5;
    s.batVolts = [sw.bat1 ? charging : 25.5, sw.bat2 ? charging : 25.5];

    // ----- APU -----
    if (sw.apuMaster && s.dcPower) {
      this.apuFlapTime = Math.min(5, this.apuFlapTime + dt);
    } else {
      this.apuFlapTime = Math.max(0, this.apuFlapTime - dt);
    }
    s.apuFlapOpen = this.apuFlapTime >= 3;
    if (sw.apuStartPresses !== this.apuPressesSeen) {
      this.apuPressesSeen = sw.apuStartPresses;
      if (sw.apuMaster && s.dcPower && !s.apuAvail) s.apuStarting = true;
    }
    if (!sw.apuMaster || !s.dcPower) s.apuStarting = false;
    if (s.apuStarting && s.apuFlapOpen) {
      s.apuN = Math.min(100, s.apuN + (100 / APU_START_SECONDS) * dt);
      if (s.apuN >= 99.9) s.apuStarting = false;
    } else if (!sw.apuMaster || !s.dcPower) {
      s.apuN = Math.max(0, s.apuN - 5 * dt);
    }
    s.apuAvail = sw.apuMaster && s.dcPower && s.apuN >= 95;

    // ----- Bleed air -----
    const apuAir = sw.apuBleed && s.apuAvail ? 35 : 0;
    const engAir = Math.max(sw.engBleed1 && running[0] ? 40 : 0, sw.engBleed2 && running[1] ? 40 : 0);
    s.bleedPsi = Math.max(apuAir, engAir);

    // ----- ADIRS -----
    const irOn = [sw.ir1, sw.ir2, sw.ir3];
    for (let i = 0; i < 3; i++) {
      if (irOn[i] && s.dcPower) this.irTime[i] = Math.min(IR_ALIGN_SECONDS, this.irTime[i] + dt);
      else if (!irOn[i]) this.irTime[i] = 0;
      s.irAligned[i] = irOn[i] && this.irTime[i] >= IR_ALIGN_SECONDS;
      s.irAligning[i] = irOn[i] && !s.irAligned[i];
    }
    const aligning = this.irTime.filter((t, i) => irOn[i] && t < IR_ALIGN_SECONDS);
    s.irSecondsLeft = aligning.length ? Math.ceil(IR_ALIGN_SECONDS - Math.min(...aligning)) : 0;

    // ----- Fuel pumps (need AC power) -----
    s.fuelPressL = s.acPower && (sw.fuelL1 || sw.fuelL2);
    s.fuelPressR = s.acPower && (sw.fuelR1 || sw.fuelR2);

    // ----- Parking brake -----
    s.parkBrake = sw.parkBrake;

    // ----- Engine start and shutdown -----
    const masters = [sw.engMaster1, sw.engMaster2];
    for (let i = 0; i < 2; i++) {
      const e = s.engines[i];
      const n2 = f.get(`propulsion/engine[${i}]/n2`);
      const canStart = masters[i] && sw.engMode === "IGN" && s.dcPower && s.bleedPsi >= START_MIN_BLEED_PSI;
      let starter = 0;
      let cutoff = 1;
      if (running[i]) {
        cutoff = masters[i] ? 0 : 1;
        if (e.phase !== "RUN") e.availTimer = 10;
        e.phase = masters[i] ? "RUN" : "OFF";
      } else if (masters[i] && (e.phase === "CRANK" || e.phase === "LIGHT" || canStart)) {
        // Automatic start: starter turns the engine, fuel is added at 22% N2.
        starter = canStart || e.phase === "LIGHT" ? 1 : 0;
        cutoff = n2 >= START_FUEL_N2 ? 0 : 1;
        e.phase = starter ? (cutoff ? "CRANK" : "LIGHT") : "OFF";
      } else {
        e.phase = "OFF";
      }
      f.set("propulsion/active_engine", i);
      f.set("propulsion/starter_cmd", starter);
      f.set("propulsion/cutoff_cmd", cutoff);

      e.n1 = f.get(`propulsion/engine[${i}]/n1`);
      e.n2 = n2;
      e.fuelFlowKgH = f.get(`propulsion/engine[${i}]/fuel-flow-rate-pps`) * 1633;
      // The stand-in engine model has no EGT, so this is an approximation for the display.
      let egtTarget = AMBIENT_C;
      if (e.phase === "LIGHT") egtTarget = 300 + Math.min(1, n2 / 40) * 380;
      else if (e.phase === "RUN") egtTarget = 390 + e.n1 * 4.6;
      e.egtC += (egtTarget - e.egtC) * Math.min(1, dt / 3);
      e.availTimer = Math.max(0, e.availTimer - dt);
    }
    f.set("propulsion/active_engine", -1);
  }
}
