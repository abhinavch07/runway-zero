// Simplified 737-type systems: battery, APU, AC buses, IRS, fuel pumps and feed, hydraulics,
// bleed air and packs, and the 737 style engine start (start switch to GRD, start lever to IDLE).
//
// A training model in the spirit of the 737 family, written from public descriptions. It is not the
// real logic. Times are shortened where the real wait is long (IRS alignment), and the lesson text
// says so.
import type { Fdm } from "../../sim/fcc.ts";
import type { Sw737 } from "./types.ts";

export const IRS_ALIGN_S = 60; // the real alignment takes several minutes
const APU_START_S = 30;
/** The starter cuts out at about this N2, and the start switch springs back to OFF. */
export const STARTER_CUTOUT_N2 = 56;
const START_MIN_DUCT_PSI = 25;
const AMBIENT_C = 25;

export interface Eng737 {
  /** OFF, CRANK (starter only), LIGHT (fuel on, accelerating), RUN. */
  phase: "OFF" | "CRANK" | "LIGHT" | "RUN";
  n1: number;
  n2: number;
  egtC: number;
  fuelFlowKgH: number;
  oilPsi: number;
  /** START VALVE OPEN: the starter is turning the engine with air. */
  startValve: boolean;
}

export interface Sys737Status {
  dcPower: boolean;
  /** AC bus 1 and 2 powered. */
  acBus: [boolean, boolean];
  acPower: boolean;
  apuN: number;
  apuEgtC: number;
  apuStarting: boolean;
  apuAvail: boolean;
  /** APU GEN OFF BUS (blue): the APU is ready but not powering any bus. */
  apuGenOffBus: boolean;
  /** GEN OFF BUS (amber) for each engine generator. */
  genOffBus: [boolean, boolean];
  /** TRANSFER BUS OFF style light: the bus has no power. */
  busOff: [boolean, boolean];
  irsAligning: [boolean, boolean];
  irsAligned: [boolean, boolean];
  irsSecondsLeft: number;
  /** Duct pressure, psi, left and right (shown together here). */
  ductPsi: number;
  packOn: [boolean, boolean];
  /** Fuel in the left wing, centre and right wing tanks, kg. */
  tanksKg: [number, number, number];
  /** LOW PRESSURE light for each fuel pump (same order as the switches). */
  fuelLowPress: [boolean, boolean, boolean, boolean, boolean, boolean];
  /** Hydraulic pressure, system A and B, psi. */
  hydPsi: [number, number];
  /** LOW PRESSURE light for each hydraulic pump (same order as the switches). */
  hydLowPress: [boolean, boolean, boolean, boolean];
  engines: [Eng737, Eng737];
}

const blankEngine = (): Eng737 => ({ phase: "OFF", n1: 0, n2: 0, egtC: AMBIENT_C, fuelFlowKgH: 0, oilPsi: 0, startValve: false });

export class Systems737 {
  private f: Fdm;
  private s: Sys737Status;
  private irsTime: [number, number] = [0, 0];
  private apuPressesSeen = 0;

  constructor(fdm: Fdm) {
    this.f = fdm;
    this.s = this.blank();
  }

  private blank(): Sys737Status {
    return {
      dcPower: false,
      acBus: [false, false],
      acPower: false,
      apuN: 0,
      apuEgtC: AMBIENT_C,
      apuStarting: false,
      apuAvail: false,
      apuGenOffBus: false,
      genOffBus: [true, true],
      busOff: [true, true],
      irsAligning: [false, false],
      irsAligned: [false, false],
      irsSecondsLeft: 0,
      ductPsi: 0,
      packOn: [false, false],
      tanksKg: [0, 0, 0],
      fuelLowPress: [true, true, true, true, true, true],
      hydPsi: [0, 0],
      hydLowPress: [true, true, true, true],
      engines: [blankEngine(), blankEngine()],
    };
  }

  reset(state: "cold" | "powered" | "running", sw: Sw737) {
    this.s = this.blank();
    this.apuPressesSeen = sw.apuStartPresses;
    if (state === "cold") {
      this.irsTime = [0, 0];
      return;
    }
    this.irsTime = [IRS_ALIGN_S, IRS_ALIGN_S];
    if (state === "powered") {
      this.s.apuN = 100;
      this.s.apuAvail = true;
      this.s.apuEgtC = 400;
    } else {
      for (const e of this.s.engines) {
        e.phase = "RUN";
        e.egtC = 450;
      }
    }
  }

  setTanks(l: number, c: number, r: number) {
    this.s.tanksKg = [l, c, r];
  }

  status(): Sys737Status {
    return this.s;
  }

  step(dt: number, sw: Sw737) {
    const f = this.f;
    const s = this.s;
    const running = [f.get("propulsion/engine[0]/set-running") > 0, f.get("propulsion/engine[1]/set-running") > 0];

    // ----- DC and APU -----
    s.dcPower = sw.battery;
    if (sw.apuStartPresses !== this.apuPressesSeen) {
      this.apuPressesSeen = sw.apuStartPresses;
      if (sw.apuOn && s.dcPower && !s.apuAvail) s.apuStarting = true;
    }
    if (!sw.apuOn || !s.dcPower) s.apuStarting = false;
    if (s.apuStarting) {
      s.apuN = Math.min(100, s.apuN + (100 / APU_START_S) * dt);
      if (s.apuN >= 99.9) s.apuStarting = false;
    } else if (!sw.apuOn || !s.dcPower) {
      s.apuN = Math.max(0, s.apuN - 6 * dt);
    }
    s.apuAvail = sw.apuOn && s.dcPower && s.apuN >= 95;
    const apuEgt = s.apuStarting ? 300 + s.apuN * 4 : s.apuAvail ? 400 : AMBIENT_C;
    s.apuEgtC += (apuEgt - s.apuEgtC) * Math.min(1, dt / 2);

    // ----- AC buses: each bus has the source last selected (APU or its engine generator) -----
    for (let i = 0; i < 2; i++) {
      const src = sw.bus[i];
      s.acBus[i] = s.dcPower && ((src === "APU" && s.apuAvail) || (src === "ENG" && running[i]));
      s.genOffBus[i] = !(src === "ENG" && running[i]);
      s.busOff[i] = !s.acBus[i];
    }
    s.acPower = s.acBus[0] || s.acBus[1];
    s.apuGenOffBus = s.apuAvail && sw.bus[0] !== "APU" && sw.bus[1] !== "APU";

    // ----- IRS -----
    for (let i = 0; i < 2; i++) {
      const on = sw.irs[i] !== "OFF";
      if (on && s.dcPower) this.irsTime[i] = Math.min(IRS_ALIGN_S, this.irsTime[i] + dt);
      else if (!on) this.irsTime[i] = 0;
      const done = on && this.irsTime[i] >= IRS_ALIGN_S;
      s.irsAligned[i] = done && sw.irs[i] === "NAV";
      s.irsAligning[i] = on && !done;
    }
    const left = this.irsTime.filter((t, i) => sw.irs[i] !== "OFF" && t < IRS_ALIGN_S);
    s.irsSecondsLeft = left.length ? Math.ceil(IRS_ALIGN_S - Math.min(...left)) : 0;

    // ----- Bleed air and packs -----
    const apuAir = sw.apuBleed && s.apuAvail ? 36 : 0;
    const engAir = Math.max(sw.engBleed[0] && running[0] ? 42 : 0, sw.engBleed[1] && running[1] ? 42 : 0);
    const source = Math.max(apuAir, engAir);
    const packsOn = sw.packs.filter(Boolean).length;
    // The packs take air from the duct. With the APU alone, two packs leave too little for a start.
    const target = source > 0 ? Math.max(0, source - (engAir > 0 ? 2 : 6) * packsOn) : 0;
    s.ductPsi += (target - s.ductPsi) * Math.min(1, dt * 1.5);
    s.packOn = [sw.packs[0] && source >= 15 && s.acPower, sw.packs[1] && source >= 15 && s.acPower];

    // ----- Fuel pumps (AC) -----
    const t = s.tanksKg;
    for (let i = 0; i < 6; i++) {
      const tank = i < 2 ? 0 : i < 4 ? 1 : 2;
      s.fuelLowPress[i] = !(sw.fuelPumps[i] && s.acPower && t[tank] > 1);
    }
    // A centre tank with fuel feeds both engines first (its pumps push harder than the wing pumps).
    const ctrFeeds = (!s.fuelLowPress[2] || !s.fuelLowPress[3]) && t[1] > 1;

    // ----- Hydraulics: A = ENG 1 + ELEC 2, B = ELEC 1 + ENG 2 -----
    const hydOk = [
      sw.hydPumps[0] && running[0],
      sw.hydPumps[1] && s.acPower,
      sw.hydPumps[2] && s.acPower,
      sw.hydPumps[3] && running[1],
    ];
    s.hydLowPress = hydOk.map((x) => !x) as [boolean, boolean, boolean, boolean];
    const hydTarget = [hydOk[0] || hydOk[1] ? 3000 : 0, hydOk[2] || hydOk[3] ? 3000 : 0];
    for (let i = 0; i < 2; i++) {
      const d = hydTarget[i] - s.hydPsi[i];
      s.hydPsi[i] += Math.sign(d) * Math.min(Math.abs(d), (d > 0 ? 1500 : 400) * dt);
    }

    // ----- Engine start: start switch GRD opens the start valve, start lever IDLE adds fuel -----
    for (let i = 0; i < 2; i++) {
      const e = s.engines[i];
      const n2 = f.get(`propulsion/engine[${i}]/n2`);
      e.startValve = sw.engStart[i] === "GRD" && s.dcPower && n2 < STARTER_CUTOUT_N2;
      const starter = e.startValve && s.ductPsi >= START_MIN_DUCT_PSI;
      // Fuel needs the start lever at IDLE, and some feed (centre or wing pumps, or suction).
      const wingTank = i === 0 ? 0 : 2;
      const fuelAvail = ctrFeeds || t[wingTank] > 1;
      // The igniters fire with GRD or CONT selected; once running the engine keeps going on its own.
      const lit = running[i] || e.phase === "LIGHT" || (starter && n2 >= 15);
      const cutoff = sw.startLever[i] === "IDLE" && fuelAvail && (lit || running[i]) ? 0 : 1;
      if (running[i] && cutoff === 0) e.phase = "RUN";
      else if (cutoff === 0) e.phase = "LIGHT";
      else e.phase = starter ? "CRANK" : "OFF";
      f.set("propulsion/active_engine", i);
      // While the engine lights, the stand-in model needs its starter flag until it reports running.
      f.set("propulsion/starter_cmd", starter || e.phase === "LIGHT" ? 1 : 0);
      f.set("propulsion/cutoff_cmd", cutoff);
      e.n1 = f.get(`propulsion/engine[${i}]/n1`);
      e.n2 = n2;
      e.fuelFlowKgH = cutoff ? 0 : f.get(`propulsion/engine[${i}]/fuel-flow-rate-pps`) * 1633;
      // The stand-in engine model has no EGT or oil pressure, so these are approximations.
      let egtTarget = AMBIENT_C + (e.phase === "CRANK" ? 10 : 0);
      if (e.phase === "LIGHT") egtTarget = 350 + Math.min(1, n2 / 45) * 330;
      else if (e.phase === "RUN") egtTarget = 420 + Math.max(0, e.n1 - 20) * 5.2;
      e.egtC += (egtTarget - e.egtC) * Math.min(1, dt / 3);
      e.oilPsi += (Math.min(1, n2 / 60) * 40 + Math.max(0, n2 - 60) * 0.4 - e.oilPsi) * Math.min(1, dt);
      // Burn from the feeding tank.
      const src = ctrFeeds ? 1 : t[wingTank] > 1 ? wingTank : 2 - wingTank;
      t[src] = Math.max(0, t[src] - (e.fuelFlowKgH * dt) / 3600);
    }
    f.set("propulsion/active_engine", -1);
  }
}
