// Flight control computer for R1: a simplified normal law, autopilot and autothrust.
//
// This is a training approximation written from public descriptions of how the A320 family behaves.
// It is not the real control law. The idea it copies:
//   - On the ground the sidestick moves the elevators and ailerons directly.
//   - In flight the sidestick asks for a pitch rate and a roll rate. With the stick released the
//     aircraft holds its flight path and bank angle, and trims itself.
//   - Bank is held up to 33 degrees with the stick released and limited to 67 degrees.
//   - Pitch attitude is limited to +30 / -15 degrees.
//   - The autopilot flies through the same law by asking for a flight path and a bank angle.
//
// Runs inside the simulation step (120 Hz). The same code runs in Node for the scripted tests.
import { readIls, type IlsReading } from "./ils.ts";
import { angleDiff } from "../world/geo.ts";
import { ILS_28 } from "../world/vidp.ts";

export interface Fdm {
  get(property: string): number;
  set(property: string, value: number): void;
}

export interface PilotInput {
  pitch: number; // -1 forward .. +1 back
  roll: number; // -1 left .. +1 right
  yaw: number; // -1 left .. +1 right
  throttle: number; // 0 idle .. 1 full
}

export type LateralMode = "" | "HDG" | "LOC*" | "LOC";
export type VerticalMode = "" | "ALT" | "ALT*" | "V/S" | "G/S*" | "G/S";

export interface FcuValues {
  spd: number; // knots
  hdg: number; // degrees true in R1
  alt: number; // feet
  vs: number; // feet per minute
}

export interface FccStatus {
  law: "GROUND" | "FLIGHT";
  ap: boolean;
  athr: boolean;
  athrMode: "" | "SPEED" | "IDLE";
  lat: LateralMode;
  vert: VerticalMode;
  latArmed: "" | "LOC";
  vertArmed: "" | "G/S";
  fcu: FcuValues;
  ils: IlsReading;
  /** Short message for the pilot, for example "AP OFF". Empty when none. */
  message: string;
  /** Thrust lever position commanded by autothrust, 0..1, or -1 when the pilot has the levers. */
  athrThrottle: number;
}

export type FcuAction =
  | { kind: "set"; field: keyof FcuValues; value: number }
  | { kind: "ap" }
  | { kind: "athr" }
  | { kind: "loc" }
  | { kind: "appr" }
  | { kind: "vs" } // pull V/S: fly the selected vertical speed
  | { kind: "alt" } // push ALT: level off at the current altitude
  | { kind: "hdg" }; // pull HDG: fly the selected heading

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const G = 32.174; // ft/s²
const KT_PER_FPS = 0.592484;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Gains, tuned with scripts/fcc-test.ts against the JSBSim stand-in model.
const K = {
  // Pitch inner loop: elevator from pitch-rate error, trim integrates the same error.
  qP: 2.4,
  qI: 0.55,
  stickQ: 8, // deg/s of pitch rate at full stick
  gammaHold: 0.9, // deg/s of pitch rate per degree of flight path error
  // Roll inner loop.
  pP: 1.1,
  stickP: 15, // deg/s of roll rate at full stick
  bankHold: 0.9, // deg/s of roll rate per degree of bank error
  apRollRate: 5, // deg/s limit when the autopilot rolls
  // Yaw damper and turn coordination.
  rP: 2.0,
  // Autopilot outer loops.
  hdgToBank: 2.0, // degrees of bank per degree of heading error
  apBankMax: 25,
  altToVs: 8, // fpm per foot of altitude error near the target
  gsToVs: 4, // fpm per foot above or below the glide path
  locIntercept: 0.05, // degrees of intercept per metre off the centreline
  locInterceptRate: 0.6, // degrees per m/s of drift towards or away from the centreline
  // Autothrust.
  spdP: 0.06,
  spdI: 0.012,
  spdD: 0.12,
};

export class FlightControlComputer {
  private status: FccStatus;
  private trim = 0; // pitch trim command, JSBSim sign (positive = nose down)
  private gammaHold = 0;
  private bankHold = 0;
  private airborneTime = 0;
  private groundTime = 0;
  private athrIntegral = 0;
  private lastSpeed = 0;
  private lastCross = 0;
  private messageTimer = 0;
  private flightBlend = 0; // 0 = ground law, 1 = flight law
  /** Altitude held in ALT mode. Changing the FCU altitude does not move it (pull V/S to change level). */
  private altHold = 0;
  private fdm: Fdm;

  constructor(fdm: Fdm) {
    this.fdm = fdm;
    this.status = {
      law: "GROUND",
      ap: false,
      athr: false,
      athrMode: "",
      lat: "",
      vert: "",
      latArmed: "",
      vertArmed: "",
      fcu: { spd: 150, hdg: 285, alt: 5000, vs: 0 },
      ils: readIls(ILS_28, { latDeg: 0, lonDeg: 0 }, 0),
      message: "",
      athrThrottle: -1,
    };
  }

  /** Called after a reset. Matches the law, trim and FCU to the new situation. */
  reset(opts: { onGround: boolean; trim: number; fcu: FcuValues }) {
    this.trim = opts.trim;
    this.status.ap = false;
    this.status.athr = false;
    this.status.athrMode = "";
    this.status.lat = this.status.vert = "";
    this.status.latArmed = this.status.vertArmed = "";
    this.status.fcu = { ...opts.fcu };
    this.status.athrThrottle = -1;
    this.flightBlend = opts.onGround ? 0 : 1;
    this.airborneTime = opts.onGround ? 0 : 60;
    this.groundTime = opts.onGround ? 60 : 0;
    this.gammaHold = this.fdm.get("flight-path/gamma-rad") * R2D;
    this.bankHold = this.fdm.get("attitude/phi-rad") * R2D;
    this.athrIntegral = 0;
    this.lastSpeed = this.fdm.get("velocities/vc-kts");
    this.say("");
  }

  getStatus(): FccStatus {
    return this.status;
  }

  command(a: FcuAction) {
    const s = this.status;
    switch (a.kind) {
      case "set": {
        const lim: Record<keyof FcuValues, [number, number]> = {
          spd: [100, 350],
          hdg: [0, 360],
          alt: [100, 39000],
          vs: [-6000, 6000],
        };
        let v = a.value;
        if (a.field === "hdg") v = ((Math.round(v) % 360) + 360) % 360 || 360;
        else v = clamp(v, lim[a.field][0], lim[a.field][1]);
        s.fcu[a.field] = v;
        break;
      }
      case "ap":
        if (s.ap) this.apOff("AP OFF");
        else this.apOn();
        break;
      case "athr":
        if (s.athr) this.athrOff("A/THR OFF");
        else if (this.airborneTime > 0 || this.fdm.get("velocities/vc-kts") > 80) {
          s.athr = true;
          s.athrMode = "SPEED";
          this.athrIntegral = this.fdm.get("fcs/throttle-cmd-norm[0]");
        } else this.say("A/THR NOT AVAILABLE ON GROUND");
        break;
      case "loc":
        s.latArmed = s.latArmed === "LOC" ? "" : "LOC";
        if (s.vertArmed === "G/S" && s.latArmed === "") s.vertArmed = "";
        break;
      case "appr":
        if (s.latArmed === "LOC" && s.vertArmed === "G/S") {
          s.latArmed = s.vertArmed = "";
        } else {
          if (s.lat !== "LOC" && s.lat !== "LOC*") s.latArmed = "LOC";
          if (s.vert !== "G/S" && s.vert !== "G/S*") s.vertArmed = "G/S";
        }
        break;
      case "vs":
        if (s.vert.startsWith("G/S")) break;
        s.vert = "V/S";
        break;
      case "alt":
        if (s.vert.startsWith("G/S")) break;
        s.fcu.alt = Math.round(this.fdm.get("position/h-sl-ft") / 100) * 100;
        this.altHold = s.fcu.alt;
        s.vert = "ALT";
        break;
      case "hdg":
        // Pulling HDG leaves the localizer. The glide slope cannot stay on without it.
        s.lat = "HDG";
        s.latArmed = "";
        s.vertArmed = "";
        if (s.vert.startsWith("G/S")) {
          s.vert = "V/S";
          s.fcu.vs = Math.round((this.fdm.get("velocities/h-dot-fps") * 60) / 100) * 100;
        }
        break;
    }
  }

  /** One control step. Writes surface, trim and thrust commands to the flight model. */
  step(dt: number, input: PilotInput) {
    const f = this.fdm;
    const s = this.status;
    const wowMain = f.get("gear/unit[1]/WOW") > 0 || f.get("gear/unit[2]/WOW") > 0;
    const wowAny = wowMain || f.get("gear/unit[0]/WOW") > 0;
    const kias = f.get("velocities/vc-kts");
    const vt = Math.max(60, f.get("velocities/vt-fps"));
    const phi = f.get("attitude/phi-rad") * R2D;
    const theta = f.get("attitude/theta-rad") * R2D;
    const gamma = f.get("flight-path/gamma-rad") * R2D;
    const p = f.get("velocities/p-rad_sec") * R2D;
    const q = f.get("velocities/q-rad_sec") * R2D;
    const r = f.get("velocities/r-rad_sec") * R2D;
    const altFt = f.get("position/h-sl-ft");
    const aglFt = f.get("position/h-agl-ft");
    const pos = { latDeg: f.get("position/lat-geod-deg"), lonDeg: f.get("position/long-gc-deg") };
    const vn = f.get("velocities/v-north-fps");
    const ve = f.get("velocities/v-east-fps");
    const trackDeg = (Math.atan2(ve, vn) * R2D + 360) % 360;
    const gs = Math.hypot(vn, ve);

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) s.message = "";
    }

    // ----- Which law: ground or flight -----
    if (wowAny) {
      this.groundTime += dt;
      this.airborneTime = 0;
    } else {
      this.airborneTime += dt;
      this.groundTime = 0;
    }
    const inFlight = this.airborneTime > 0.5 || (!wowAny && this.flightBlend > 0);
    const target = inFlight ? 1 : this.groundTime > 1 ? 0 : this.flightBlend;
    // Into flight law within about a second once airborne, so the attitude holds when the stick is
    // released after lift-off. Back to ground law over 5 s after touchdown.
    const rate = inFlight ? dt / 1.2 : dt / 5;
    this.flightBlend += clamp(target - this.flightBlend, -rate, rate);
    s.law = this.flightBlend > 0.5 ? "FLIGHT" : "GROUND";

    // ----- Autopilot safety: disconnect on strong stick input or on the ground -----
    if (s.ap && (Math.abs(input.pitch) > 0.5 || Math.abs(input.roll) > 0.5)) this.apOff("AP OFF (STICK)");
    if (s.ap && wowAny) this.apOff("AP OFF");
    if (s.ap && s.vert.startsWith("G/S") && aglFt < 50) this.apOff("AP OFF, LAND MANUALLY");

    // ----- ILS -----
    s.ils = readIls(ILS_28, pos, altFt);
    const ils = s.ils;

    // ----- Autopilot outer loops: decide flight path and bank -----
    let gammaCmd = this.gammaHold;
    let bankCmd = this.bankHold;
    if (s.ap) {
      // Lateral
      if (s.latArmed === "LOC" && ils.valid && Math.abs(ils.locDevDeg) < 1.5 * (ILS_28.locFullScaleDeg / 2)) {
        s.lat = "LOC*";
        s.latArmed = "";
      }
      let hdgTarget = s.fcu.hdg;
      if (s.lat === "LOC*" || s.lat === "LOC") {
        const crossRate = (ils.crossM - this.lastCross) / Math.max(dt, 1e-3);
        const intercept = clamp(-K.locIntercept * ils.crossM - K.locInterceptRate * crossRate, -30, 30);
        hdgTarget = ILS_28.courseT + intercept;
        if (s.lat === "LOC*" && Math.abs(ils.locDevDeg) < 0.2 && Math.abs(crossRate) < 3) s.lat = "LOC";
      } else if (s.lat === "") s.lat = "HDG";
      const err = angleDiff(trackDeg, hdgTarget);
      const bankMax = s.lat === "LOC" ? 15 : K.apBankMax;
      bankCmd = clamp(K.hdgToBank * err, -bankMax, bankMax);

      // Vertical
      const locOn = s.lat === "LOC" || s.lat === "LOC*";
      if (s.vertArmed === "G/S" && locOn && ils.valid && ils.gsDevDeg < 0.1 && ils.gsDevDeg > -0.1) {
        s.vert = "G/S*";
        s.vertArmed = "";
      }
      let vsCmd = 0;
      const altErr = s.fcu.alt - altFt;
      if (s.vert === "G/S*" || s.vert === "G/S") {
        const nominal = -gs * Math.tan(ILS_28.glidePathDeg * D2R) * 60;
        vsCmd = nominal - K.gsToVs * ils.aboveGpFt;
        // Never climb to reach the glide slope. Below it, fly level and let it come down to meet us.
        vsCmd = clamp(vsCmd, nominal - 1000, Math.min(0, nominal + 1000));
        if (s.vert === "G/S*" && Math.abs(ils.aboveGpFt) < 30) s.vert = "G/S";
      } else if (s.vert === "V/S") {
        vsCmd = s.fcu.vs;
        const closing = Math.sign(altErr) === Math.sign(vsCmd) && vsCmd !== 0;
        if (closing && Math.abs(altErr) < Math.abs(vsCmd) / K.altToVs) s.vert = "ALT*";
      } else if (s.vert === "ALT*") {
        vsCmd = clamp(K.altToVs * altErr, -2500, 2500);
        if (Math.abs(altErr) < 20) {
          s.vert = "ALT";
          this.altHold = s.fcu.alt;
        }
      } else if (s.vert === "ALT") {
        vsCmd = clamp(K.altToVs * (this.altHold - altFt), -800, 800);
      } else {
        s.vert = "V/S";
        s.fcu.vs = Math.round((f.get("velocities/h-dot-fps") * 60) / 100) * 100;
        vsCmd = s.fcu.vs;
      }
      gammaCmd = Math.asin(clamp(vsCmd / 60 / vt, -0.3, 0.3)) * R2D;
    }
    this.lastCross = ils.crossM;

    // ----- Pitch -----
    let elevator: number;
    if (this.flightBlend < 1) {
      // Ground law (and the blend into flight law): stick drives the elevator directly.
      const direct = -input.pitch;
      const flightElev = this.pitchFlightLaw(dt, input, gamma, gammaCmd, theta, phi, q, vt, s.ap);
      elevator = direct * (1 - this.flightBlend) + flightElev * this.flightBlend;
      if (this.flightBlend === 0) {
        this.gammaHold = gamma;
      }
    } else {
      elevator = this.pitchFlightLaw(dt, input, gamma, gammaCmd, theta, phi, q, vt, s.ap);
    }

    // ----- Roll -----
    let aileron: number;
    if (this.flightBlend < 0.5) {
      aileron = input.roll * 0.6;
      this.bankHold = phi;
    } else {
      let pCmd: number;
      if (s.ap) {
        pCmd = clamp(K.bankHold * (bankCmd - phi), -K.apRollRate, K.apRollRate);
        this.bankHold = phi;
      } else if (Math.abs(input.roll) > 0.05) {
        pCmd = input.roll * K.stickP;
        this.bankHold = clamp(phi, -67, 67);
      } else {
        if (Math.abs(this.bankHold) > 33) this.bankHold = 33 * Math.sign(this.bankHold); // neutral stick: back to 33
        pCmd = K.bankHold * (this.bankHold - phi);
      }
      if (phi > 65 && pCmd > 0) pCmd = K.bankHold * (67 - phi);
      if (phi < -65 && pCmd < 0) pCmd = K.bankHold * (-67 - phi);
      aileron = clamp((K.pP * (pCmd - p)) / 15, -1, 1);
    }

    // ----- Yaw: pedals plus yaw damper and turn coordination in flight -----
    let rudder = -input.yaw;
    if (this.flightBlend > 0.5) {
      const rCoord = ((G / vt) * Math.tan(phi * D2R)) * R2D;
      rudder += clamp((-K.rP * (rCoord - r)) / 10, -0.3, 0.3);
    }

    // ----- Thrust -----
    let throttle = input.throttle;
    if (s.athr) {
      const accel = (kias - this.lastSpeed) / Math.max(dt, 1e-3);
      const err = s.fcu.spd - kias;
      // In the flare autothrust brings the thrust to idle, then switches off after touchdown.
      if (!wowAny && this.airborneTime > 10 && aglFt < 30) s.athrMode = "IDLE";
      if (s.athrMode === "IDLE") {
        throttle = 0;
        this.athrIntegral = 0;
        if (aglFt < 20 && !wowAny && s.message !== "RETARD") this.say("RETARD", 3);
        if (wowAny && this.groundTime > 0.5) this.athrOff("");
      } else {
        this.athrIntegral = clamp(this.athrIntegral + K.spdI * err * dt, 0, 0.92);
        throttle = clamp(this.athrIntegral + K.spdP * err - K.spdD * accel, 0, 0.92);
      }
      s.athrThrottle = throttle;
    } else {
      s.athrThrottle = -1;
    }
    this.lastSpeed = kias;

    // ----- Write to the flight model -----
    f.set("fcs/elevator-cmd-norm", clamp(elevator, -1, 1));
    f.set("fcs/pitch-trim-cmd-norm", clamp(this.trim, -1, 1));
    f.set("fcs/aileron-cmd-norm", aileron);
    f.set("fcs/rudder-cmd-norm", clamp(rudder, -1, 1));
    // Nosewheel: full steering (like the tiller) at taxi speed, only a few degrees (like the pedals) when fast.
    const steerScale = gs * 0.5925 <= 15 ? 1 : Math.max(0.09, 1 - (gs * 0.5925 - 15) / 40);
    f.set("fcs/steer-cmd-norm", clamp(input.yaw * steerScale, -1, 1));
    f.set("fcs/throttle-cmd-norm[0]", throttle);
    f.set("fcs/throttle-cmd-norm[1]", throttle);
  }

  /** Flight law pitch channel. Returns the elevator command; also moves the trim. */
  private pitchFlightLaw(
    dt: number,
    input: PilotInput,
    gamma: number,
    gammaCmd: number,
    theta: number,
    phi: number,
    q: number,
    vt: number,
    ap: boolean,
  ): number {
    // Pitch rate needed to stay on the flight path in a bank (up to 33 degrees).
    const bankComp = Math.abs(phi) < 33 ? ((G / vt) * Math.sin(phi * D2R) * Math.tan(phi * D2R)) * R2D : 0;
    let qCmd: number;
    if (!ap && Math.abs(input.pitch) > 0.05) {
      qCmd = input.pitch * K.stickQ + bankComp;
      // Just after lift-off the flight path lags the attitude. Hold the climb the attitude will
      // give (pitch minus about 6° of wing angle), so releasing the stick keeps the aircraft climbing.
      this.gammaHold = this.airborneTime < 15 ? Math.max(gamma, theta - 6) : gamma;
    } else {
      const target = ap ? gammaCmd : this.gammaHold;
      qCmd = clamp(K.gammaHold * (target - gamma), -4, 4) + bankComp;
      if (ap) this.gammaHold = gamma;
    }
    // Pitch attitude protection.
    if (theta > 25 && qCmd > 0) qCmd = Math.min(qCmd, (30 - theta) * 1.0);
    if (theta < -12 && qCmd < 0) qCmd = Math.max(qCmd, (-15 - theta) * 1.0);
    const err = q - qCmd; // positive = nose rising too fast, so elevator nose down (positive)
    this.trim = clamp(this.trim + ((K.qI * err) / 10) * dt * this.flightBlend, -1, 1);
    return clamp((K.qP * err) / 10, -1, 1);
  }

  private apOn() {
    const s = this.status;
    if (this.airborneTime < 5 || this.fdm.get("position/h-agl-ft") < 100) {
      this.say("AP NOT AVAILABLE BELOW 100 FT");
      return;
    }
    s.ap = true;
    if (!s.lat) {
      // Engaging with no lateral mode: hold the current heading.
      s.lat = "HDG";
      const hdg = ((this.fdm.get("attitude/psi-deg") % 360) + 360) % 360;
      s.fcu.hdg = Math.round(hdg) || 360;
    }
    if (!s.vert) {
      s.vert = "V/S";
      s.fcu.vs = Math.round((this.fdm.get("velocities/h-dot-fps") * 60) / 100) * 100;
    }
  }

  private apOff(msg: string) {
    const s = this.status;
    s.ap = false;
    s.lat = s.vert = "";
    s.latArmed = s.vertArmed = "";
    this.gammaHold = this.fdm.get("flight-path/gamma-rad") * R2D;
    this.bankHold = this.fdm.get("attitude/phi-rad") * R2D;
    if (msg) this.say(msg, 5);
  }

  private athrOff(msg: string) {
    const s = this.status;
    s.athr = false;
    s.athrMode = "";
    s.athrThrottle = -1;
    if (msg) this.say(msg, 5);
  }

  private say(msg: string, seconds = 4) {
    this.status.message = msg;
    this.messageTimer = msg ? seconds : 0;
  }
}

export { KT_PER_FPS };
