// 737-type autopilot, flight director and autothrottle, driven from the MCP (mode control panel).
//
// A training approximation written from public descriptions of how the 737 MCP behaves. It is not
// the real logic, and it is simplified:
//   - CMD A with no mode selected holds the pitch attitude and wings level (shown as CWS P / CWS R).
//   - LVL CHG climbs at climb N1 or descends at idle, flying the MCP speed with pitch.
//   - VNAV climbs like LVL CHG but to the lower of the MCP and FMC cruise altitudes, at 250 kt below
//     10,000 ft and 280 kt above. There is no descent path.
//   - LNAV flies to each route waypoint in turn.
// Runs inside the simulation step (120 Hz). The same code runs in Node for the tests.
import type { Fdm } from "../../sim/fcc.ts";
import { readNav } from "../../radio/navReceiver.ts";
import { bearingDeg, distanceM, M_PER_NM, type LatLon } from "../../world/geo.ts";

export type AtMode = "" | "N1" | "MCP SPD" | "FMC SPD" | "RETARD" | "ARM";
export type RollMode = "" | "CWS R" | "HDG SEL" | "LNAV" | "VOR/LOC";
export type PitchMode = "" | "CWS P" | "ALT HOLD" | "ALT ACQ" | "V/S" | "MCP SPD" | "VNAV SPD" | "VNAV PTH";

export interface McpValues {
  spd: number;
  hdg: number;
  alt: number;
  vs: number;
}

export interface RoutePoint extends LatLon {
  name: string;
}

export interface AfcsStatus {
  cmdA: boolean;
  fd: boolean;
  atArm: boolean;
  at: AtMode;
  roll: RollMode;
  pitch: PitchMode;
  /** Armed (white) modes. */
  rollArmed: "" | "VOR/LOC";
  mcp: McpValues;
  /** Flight director commands, degrees: pitch and bank wanted. */
  fdPitch: number;
  fdBank: number;
  /** Thrust lever position the autothrottle is setting, 0..1, or -1 when the pilot has them. */
  atThrottle: number;
  /** Route active in the FMC, and the waypoint LNAV flies to. */
  route: RoutePoint[];
  activeWpt: number;
  crzAltFt: number;
  /** Short message, for example "CMD NEEDS AIRBORNE". Empty when none. */
  message: string;
}

export type McpAction =
  | { kind: "set"; field: keyof McpValues; value: number }
  | { kind: "cmdA" }
  | { kind: "fd" }
  | { kind: "atArm" }
  | { kind: "n1" }
  | { kind: "speed" }
  | { kind: "lvlchg" }
  | { kind: "vnav" }
  | { kind: "hdgsel" }
  | { kind: "lnav" }
  | { kind: "vorloc" }
  | { kind: "althold" }
  | { kind: "vs" };

export interface AfcsInput {
  pitch: number;
  roll: number;
  throttle: number;
  nav1: number;
  crs1: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const CLB_N1 = 92;
const MAX_BANK = 25;

export class Afcs737 {
  private f: Fdm;
  st: AfcsStatus;
  private thetaCmd = 0;
  private phiCmd = 0;
  private holdAlt = 0;
  private lastKias = 0;
  private accel = 0;
  private thr = 0;
  private messageTimer = 0;

  constructor(fdm: Fdm) {
    this.f = fdm;
    this.st = {
      cmdA: false,
      fd: false,
      atArm: false,
      at: "",
      roll: "",
      pitch: "",
      rollArmed: "",
      mcp: { spd: 250, hdg: 280, alt: 10000, vs: 0 },
      fdPitch: 0,
      fdBank: 0,
      atThrottle: -1,
      route: [],
      activeWpt: 0,
      crzAltFt: 0,
      message: "",
    };
  }

  reset(mcp: McpValues, throttle: number) {
    // The page sends the lesson's route again after the reset, if it has one.
    this.st = { ...this.st, cmdA: false, fd: false, atArm: false, at: "", roll: "", pitch: "", rollArmed: "", mcp: { ...mcp }, atThrottle: -1, message: "", route: [], crzAltFt: 0, activeWpt: 0 };
    this.thr = throttle;
  }

  setRoute(points: RoutePoint[], crzAltFt: number) {
    this.st.route = points;
    this.st.crzAltFt = crzAltFt;
    this.st.activeWpt = 0;
  }

  private say(m: string) {
    this.st.message = m;
    this.messageTimer = 4;
  }

  private get airborne() {
    return this.f.get("gear/wow") === 0;
  }

  private get altFt() {
    return this.f.get("position/h-sl-ft");
  }

  /** Pitch mode that flies the MCP speed: climbs at climb N1 when the MCP altitude is above. */
  private speedOnPitch(kind: "MCP SPD" | "VNAV SPD") {
    const target = kind === "VNAV SPD" ? this.vnavAlt() : this.st.mcp.alt;
    if (Math.abs(target - this.altFt) < 100) {
      this.st.pitch = kind === "VNAV SPD" ? "VNAV PTH" : "ALT HOLD";
      this.holdAlt = target;
      this.st.at = this.st.atArm ? (kind === "VNAV SPD" ? "FMC SPD" : "MCP SPD") : "";
      return;
    }
    this.st.pitch = kind;
    this.thetaCmd = this.f.get("attitude/theta-deg");
    if (this.st.atArm) this.st.at = target > this.altFt ? "N1" : "RETARD";
  }

  private vnavAlt() {
    return this.st.crzAltFt > 0 ? Math.min(this.st.mcp.alt, this.st.crzAltFt) : this.st.mcp.alt;
  }

  command(a: McpAction) {
    const st = this.st;
    const active = () => st.cmdA || st.fd;
    switch (a.kind) {
      case "set":
        st.mcp[a.field] = a.value;
        break;
      case "cmdA":
        if (st.cmdA) {
          st.cmdA = false;
          this.say("AP DISENGAGED");
          if (!st.fd) this.clearModes();
        } else if (!this.airborne) {
          this.say("CMD A: AIRBORNE ONLY HERE");
        } else {
          st.cmdA = true;
          if (!st.roll) st.roll = "CWS R";
          if (!st.pitch) {
            st.pitch = "CWS P";
            this.thetaCmd = this.f.get("attitude/theta-deg");
          }
        }
        break;
      case "fd":
        st.fd = !st.fd;
        if (!st.fd && !st.cmdA) this.clearModes();
        break;
      case "atArm":
        st.atArm = !st.atArm;
        if (!st.atArm) st.at = "";
        break;
      case "n1":
        if (st.atArm) st.at = st.at === "N1" ? "" : "N1";
        break;
      case "speed":
        if (st.atArm) st.at = st.at === "MCP SPD" ? "" : "MCP SPD";
        break;
      case "lvlchg":
        if (!active()) break;
        if (st.pitch === "MCP SPD") this.toCws();
        else this.speedOnPitch("MCP SPD");
        break;
      case "vnav":
        if (!active()) break;
        if (!st.route.length) {
          this.say("VNAV: NO ACTIVE ROUTE");
          break;
        }
        if (st.pitch === "VNAV SPD" || st.pitch === "VNAV PTH") this.toCws();
        else this.speedOnPitch("VNAV SPD");
        break;
      case "hdgsel":
        if (!active()) break;
        st.roll = st.roll === "HDG SEL" ? (st.cmdA ? "CWS R" : "") : "HDG SEL";
        st.rollArmed = "";
        break;
      case "lnav":
        if (!active()) break;
        if (!st.route.length) {
          this.say("LNAV: NO ACTIVE ROUTE");
          break;
        }
        st.roll = st.roll === "LNAV" ? (st.cmdA ? "CWS R" : "") : "LNAV";
        st.rollArmed = "";
        break;
      case "vorloc":
        if (!active()) break;
        st.rollArmed = st.rollArmed === "VOR/LOC" || st.roll === "VOR/LOC" ? "" : "VOR/LOC";
        if (st.roll === "VOR/LOC") st.roll = st.cmdA ? "CWS R" : "";
        break;
      case "althold":
        if (!active()) break;
        if (st.pitch === "ALT HOLD") this.toCws();
        else {
          st.pitch = "ALT HOLD";
          this.holdAlt = Math.round(this.altFt / 10) * 10;
          if (st.atArm) st.at = "MCP SPD";
        }
        break;
      case "vs":
        if (!active()) break;
        if (st.pitch === "V/S") this.toCws();
        else {
          st.pitch = "V/S";
          st.mcp.vs = Math.round(this.f.get("velocities/h-dot-fps") * 0.6) * 100;
          if (st.atArm) st.at = "MCP SPD";
        }
        break;
    }
  }

  private toCws() {
    this.st.pitch = this.st.cmdA ? "CWS P" : "";
    this.thetaCmd = this.f.get("attitude/theta-deg");
  }

  private clearModes() {
    this.st.roll = "";
    this.st.pitch = "";
    this.st.rollArmed = "";
  }

  /** Runs one step. Sets elevator, aileron, pitch trim and throttles when engaged. */
  step(dt: number, input: AfcsInput) {
    const f = this.f;
    const st = this.st;
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) st.message = "";
    }
    const kias = f.get("velocities/vc-kts");
    this.accel += ((kias - this.lastKias) / dt - this.accel) * Math.min(1, dt * 2);
    this.lastKias = kias;
    const alt = this.altFt;
    const theta = f.get("attitude/theta-deg");
    const phi = f.get("attitude/phi-deg");
    const q = f.get("velocities/q-rad_sec") * 57.3;
    const p = f.get("velocities/p-rad_sec") * 57.3;
    const alpha = f.get("aero/alpha-deg");
    const tasFps = Math.max(100, f.get("velocities/vt-fps"));
    const vsFpm = f.get("velocities/h-dot-fps") * 60;
    const pos = { latDeg: f.get("position/lat-geod-deg"), lonDeg: f.get("position/long-gc-deg") };
    const track = (Math.atan2(f.get("velocities/v-east-fps"), f.get("velocities/v-north-fps")) * 180) / Math.PI;
    const heading = f.get("attitude/psi-deg");

    // A big push on the yoke takes the autopilot off, like overpowering it.
    if (st.cmdA && (Math.abs(input.pitch) > 0.5 || Math.abs(input.roll) > 0.5)) {
      st.cmdA = false;
      this.say("AP DISENGAGED");
      if (!st.fd) this.clearModes();
    }
    if (!this.airborne && st.cmdA) st.cmdA = false;

    // ----- Lateral -----
    let phiCmd = 0;
    if (st.rollArmed === "VOR/LOC") {
      const n = readNav(input.nav1, input.crs1, pos, alt);
      if (n.valid && Math.abs(n.dev) < 0.8) {
        st.roll = "VOR/LOC";
        st.rollArmed = "";
      }
    }
    switch (st.roll) {
      case "HDG SEL":
        phiCmd = clamp(wrap180(st.mcp.hdg - heading) * 1.5, -MAX_BANK, MAX_BANK);
        break;
      case "LNAV": {
        const wp = st.route[st.activeWpt];
        if (!wp) {
          st.roll = st.cmdA ? "CWS R" : "";
          break;
        }
        const distNm = distanceM(pos, wp) / M_PER_NM;
        if (distNm < 1.5 && st.activeWpt < st.route.length - 1) st.activeWpt++;
        const want = bearingDeg(pos, st.route[st.activeWpt]);
        phiCmd = clamp(wrap180(want - track) * 1.5, -MAX_BANK, MAX_BANK);
        break;
      }
      case "VOR/LOC": {
        const n = readNav(input.nav1, input.crs1, pos, alt);
        const isLoc = n.station?.kind === "ils";
        const want = input.crs1 + clamp(n.dev * (isLoc ? 40 : 30), -30, 30);
        phiCmd = clamp(wrap180(want - track) * 1.5, -MAX_BANK, MAX_BANK);
        break;
      }
      case "CWS R":
        phiCmd = Math.abs(phi) < 6 ? 0 : phi;
        break;
    }
    // Bank changes at most 4 degrees per second.
    this.phiCmd += clamp(phiCmd - this.phiCmd, -4 * dt, 4 * dt);

    // ----- Vertical -----
    const gammaFor = (vs: number) => (Math.asin(clamp(vs / 60 / tasFps, -0.3, 0.3)) * 180) / Math.PI;
    let thetaCmd = this.thetaCmd;
    const capture = (target: number, next: PitchMode) => {
      // Start the level-off when the altitude is closer than the climb or descent rate allows.
      if (Math.abs(target - alt) < Math.max(150, Math.abs(vsFpm) / 5)) {
        st.pitch = "ALT ACQ";
        this.holdAlt = target;
        this.nextAfterAcq = next;
        if (st.atArm && st.at) st.at = next === "VNAV PTH" ? "FMC SPD" : "MCP SPD";
      }
    };
    switch (st.pitch) {
      case "ALT HOLD":
      case "VNAV PTH":
        thetaCmd = alpha + gammaFor(clamp((this.holdAlt - alt) * 3, -1500, 1500));
        break;
      case "ALT ACQ": {
        thetaCmd = alpha + gammaFor(clamp((this.holdAlt - alt) * 4, -2500, 2500));
        if (Math.abs(this.holdAlt - alt) < 25) {
          st.pitch = this.nextAfterAcq;
          if (st.atArm) st.at = st.pitch === "VNAV PTH" ? "FMC SPD" : "MCP SPD";
        }
        break;
      }
      case "V/S":
        thetaCmd = alpha + gammaFor(st.mcp.vs);
        if (st.mcp.vs !== 0 && Math.sign(st.mcp.alt - alt) === Math.sign(st.mcp.vs)) capture(st.mcp.alt, "ALT HOLD");
        break;
      case "MCP SPD":
      case "VNAV SPD": {
        const target = st.pitch === "VNAV SPD" ? this.vnavAlt() : st.mcp.alt;
        const spd = st.pitch === "VNAV SPD" ? (alt < 10000 ? 250 : 280) : st.mcp.spd;
        // Pitch up when too fast, down when too slow: a slow base pitch plus quick corrections.
        const err = kias - spd;
        const climbing = target > alt;
        this.thetaCmd = clamp(this.thetaCmd + clamp(err * 0.025, -0.4, 0.4) * dt, climbing ? 0 : -8, climbing ? 16 : 4);
        thetaCmd = clamp(this.thetaCmd + clamp(err * 0.15 + this.accel * 1.2, -4, 4), climbing ? 0 : -8, climbing ? 18 : 5);
        capture(target, st.pitch === "VNAV SPD" ? "VNAV PTH" : "ALT HOLD");
        if (st.at === "RETARD" && this.thr < 0.02) st.at = "ARM";
        break;
      }
      case "CWS P":
        break;
    }
    if (st.pitch !== "MCP SPD" && st.pitch !== "VNAV SPD" && st.pitch !== "CWS P") this.thetaCmd = thetaCmd;
    thetaCmd = clamp(thetaCmd, -10, 20);

    st.fdPitch = thetaCmd;
    st.fdBank = this.phiCmd;

    // ----- Autopilot servos -----
    if (st.cmdA) {
      const e = thetaCmd - theta;
      f.set("fcs/elevator-cmd-norm", clamp(-(0.05 * e - 0.1 * q), -0.5, 0.5));
      // The stabiliser trim slowly takes over the steady part of the elevator.
      f.set("fcs/pitch-trim-cmd-norm", clamp(f.get("fcs/pitch-trim-cmd-norm") - 0.012 * e * dt, -1, 1));
      f.set("fcs/aileron-cmd-norm", clamp(0.035 * (this.phiCmd - phi) - 0.06 * p, -0.4, 0.4));
    } else {
      f.set("fcs/elevator-cmd-norm", -input.pitch);
      f.set("fcs/aileron-cmd-norm", input.roll);
    }

    // ----- Autothrottle -----
    if (!st.atArm || !st.at || st.at === "ARM") {
      this.thr = input.throttle;
      st.atThrottle = -1;
    } else {
      const n1 = f.get("propulsion/engine[0]/n1");
      let rate = 0;
      if (st.at === "N1") rate = 0.01 * (CLB_N1 - n1);
      else if (st.at === "RETARD") rate = -0.15;
      else {
        const spd = st.at === "FMC SPD" ? (alt < 10000 ? 250 : 280) : st.mcp.spd;
        rate = 0.006 * (spd - kias) - 0.03 * this.accel;
      }
      this.thr = clamp(this.thr + clamp(rate, -0.15, 0.15) * dt, 0, 0.95);
      st.atThrottle = this.thr;
    }
    f.set("fcs/throttle-cmd-norm[0]", this.thr);
    f.set("fcs/throttle-cmd-norm[1]", this.thr);
  }

  private nextAfterAcq: PitchMode = "ALT HOLD";
}
