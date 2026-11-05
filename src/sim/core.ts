// Simulation core shared by the browser worker and the Node test scripts:
// JSBSim, the flight control computer, start positions and the touchdown report.
import type { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { FlightControlComputer, type FccStatus, type FcuAction, type PilotInput } from "./fcc.ts";
import type { Controls, SimState, StartPosition, TouchdownReport } from "./types.ts";
import { startSwitches, Systems } from "./systems.ts";
import { alongCross } from "../world/geo.ts";
import { ILS_28 } from "../world/vidp.ts";

export const STEP_HZ = 120;
const FT_TO_M = 0.3048;
/** How fast the flight model's ground height may follow the globe, feet per second. */
export const GROUND_RATE_ON_WHEELS = 2;
const GROUND_RATE_AIRBORNE = 100;

// Flap lever detents mapped to the stand-in model's flap command (0 to 1 covers 0 to 40 degrees).
// 0, 1 (10 deg), 2 (15 deg), 3 (20 deg), FULL (40 deg).
const FLAP_CMD = [0, 0.25, 0.375, 0.5, 1];

export const MODEL_FILES = ["aircraft/A320/A320.xml", "engine/CFM56_5.xml", "engine/direct.xml"];

export class SimCore {
  readonly fcc: FlightControlComputer;
  readonly systems: Systems;
  private terrainFt = 0;
  private terrainTargetFt = 0;
  private wasAirborne = false;
  private airborneFor = 0;
  private lastVsFpm = 0;
  touchdown: TouchdownReport | null = null;
  private sdk: JSBSimSdk;

  constructor(sdk: JSBSimSdk) {
    this.sdk = sdk;
    const fdm = {
      get: (p: string) => sdk.getPropertyValue(p),
      set: (p: string, v: number) => sdk.setPropertyValue(p, v),
    };
    this.fcc = new FlightControlComputer(fdm);
    this.systems = new Systems(fdm);
  }

  get(p: string) {
    return this.sdk.getPropertyValue(p);
  }
  set(p: string, v: number) {
    this.sdk.setPropertyValue(p, v);
  }

  /**
   * New ground height under the aircraft from the globe. Ignored if it is not a number, or if it
   * jumps by more than 50 ft while the aircraft is on its wheels (that means bad data, not a hill).
   * Otherwise the flight model's ground moves towards it gradually, at most 100 ft per second.
   */
  setTerrain(ft: number) {
    if (!Number.isFinite(ft)) return;
    const onWheels = this.get("gear/wow") > 0;
    if (onWheels && Math.abs(ft - this.terrainFt) > 50) return;
    this.terrainTargetFt = ft;
  }

  /** Short text for the browser console when something goes wrong. */
  debugInfo(): string {
    return `ground ${this.terrainFt.toFixed(1)} ft (target ${this.terrainTargetFt.toFixed(1)}), alt ${this.get("position/h-sl-ft")}, agl ${this.get("position/h-agl-ft")}, kias ${this.get("velocities/vc-kts")}, wow ${this.get("gear/wow")}`;
  }

  /** True when the flight model's numbers are all valid. False means it has broken down. */
  healthy(): boolean {
    return [
      this.get("position/lat-geod-deg"),
      this.get("position/long-gc-deg"),
      this.get("position/h-sl-ft"),
      this.get("velocities/vt-fps"),
    ].every(Number.isFinite);
  }

  /** Places the aircraft at a start position. Returns the thrust lever and trim values to start with. */
  place(start: StartPosition): { throttle: number } {
    this.terrainFt = start.terrainFt;
    this.terrainTargetFt = start.terrainFt;
    this.set("propulsion/tank[0]/contents-lbs", start.fuelLbs / 2);
    this.set("propulsion/tank[1]/contents-lbs", start.fuelLbs / 2);
    this.set("ic/lat-geod-deg", start.latDeg);
    this.set("ic/long-gc-deg", start.lonDeg);
    this.set("ic/terrain-elevation-ft", start.terrainFt);
    this.set("ic/psi-true-deg", start.headingDeg);
    if (start.onGround) {
      this.set("ic/h-agl-ft", 7.2); // reference point height with the gear just touching
      this.set("ic/vc-kts", 0);
      this.set("ic/gamma-deg", 0);
    } else {
      this.set("ic/h-sl-ft", start.altFt);
      this.set("ic/vc-kts", start.kias);
      this.set("ic/gamma-deg", start.gammaDeg ?? 0);
    }
    this.sdk.runIc();
    if (!start.coldAndDark && !start.powered) this.set("propulsion/set-running", -1);
    this.set("gear/gear-cmd-norm", start.gearDown ? 1 : 0);
    this.set("fcs/flap-cmd-norm", FLAP_CMD[start.flapLever]);
    // Move gear and flaps straight to the commanded position for the start.
    this.set("gear/gear-pos-norm", start.gearDown ? 1 : 0);
    this.set("fcs/flap-pos-deg", FLAP_CMD[start.flapLever] * 40);

    let throttle = 0;
    let trim = start.onGround ? -0.25 : 0; // small nose-up trim for takeoff
    if (!start.onGround) {
      try {
        this.sdk.doTrim(1);
      } catch {
        /* keep untrimmed */
      }
      throttle = this.get("fcs/throttle-cmd-norm[0]");
      trim = this.get("fcs/pitch-trim-cmd-norm");
    } else {
      for (let i = 0; i < STEP_HZ * 2; i++) {
        this.set("fcs/left-brake-cmd-norm", 1);
        this.set("fcs/right-brake-cmd-norm", 1);
        this.set("position/terrain-elevation-asl-ft", this.terrainFt);
        this.sdk.run(); // let the gear settle on the runway
      }
    }
    this.fcc.reset({
      onGround: !!start.onGround,
      trim,
      fcu: start.fcu,
    });
    this.systems.reset(!!start.coldAndDark, startSwitches(start), !!start.powered);
    this.wasAirborne = !start.onGround;
    this.airborneFor = start.onGround ? 0 : 60;
    this.touchdown = null;
    return { throttle };
  }

  /** Runs one 1/120 s step with the given pilot controls. */
  step(c: Controls) {
    const input: PilotInput = { pitch: c.pitch, roll: c.roll, yaw: c.yaw, throttle: c.throttle };
    this.set("fcs/flap-cmd-norm", FLAP_CMD[Math.max(0, Math.min(4, c.flapLever))]);
    // Ground safety: with weight on the wheels the gear cannot retract, whatever the lever says.
    const onWheels = this.get("gear/wow") > 0;
    this.set("gear/gear-cmd-norm", c.gearDown || onWheels ? 1 : 0);
    this.set("fcs/speedbrake-cmd-norm", c.speedbrake);
    const brakes = Math.max(c.brakes, c.switches.parkBrake ? 1 : 0);
    this.set("fcs/left-brake-cmd-norm", brakes);
    this.set("fcs/right-brake-cmd-norm", brakes);
    this.systems.step(1 / STEP_HZ, c.switches);
    // On the wheels the ground may only move slowly, like driving up a gentle slope. A fast change
    // pushes the gear through the ground and the flight model breaks down.
    const maxStep = (onWheels ? GROUND_RATE_ON_WHEELS : GROUND_RATE_AIRBORNE) / STEP_HZ;
    this.terrainFt += Math.max(-maxStep, Math.min(maxStep, this.terrainTargetFt - this.terrainFt));
    this.set("position/terrain-elevation-asl-ft", this.terrainFt);
    this.fcc.step(1 / STEP_HZ, input);
    this.sdk.run();
    this.watchTouchdown();
  }

  command(a: FcuAction) {
    this.fcc.command(a);
  }

  status(): FccStatus {
    return this.fcc.getStatus();
  }

  private watchTouchdown() {
    const wow = this.get("gear/unit[1]/WOW") > 0 || this.get("gear/unit[2]/WOW") > 0;
    const vs = this.get("velocities/h-dot-fps") * 60;
    if (!wow) {
      this.airborneFor += 1 / STEP_HZ;
      if (this.airborneFor > 10) this.wasAirborne = true;
      this.lastVsFpm = vs;
      return;
    }
    if (this.wasAirborne && this.airborneFor > 10) {
      const pos = { latDeg: this.get("position/lat-geod-deg"), lonDeg: this.get("position/long-gc-deg") };
      const fromThr = alongCross(ILS_28.threshold, ILS_28.courseT, pos);
      this.touchdown = {
        vsFpm: this.lastVsFpm,
        kias: this.get("velocities/vc-kts"),
        pitchDeg: this.get("attitude/theta-deg"),
        rollDeg: this.get("attitude/phi-deg"),
        distPastThresholdM: fromThr.along,
        offCentreM: fromThr.cross,
        simTime: this.sdk.getSimTime(),
      };
    }
    this.wasAirborne = false;
    this.airborneFor = 0;
  }

  state(simRate: number, displayOffsetM: number): SimState {
    const g = (p: string) => this.get(p);
    const altFt = g("position/h-sl-ft");
    return {
      simTime: this.sdk.getSimTime(),
      latDeg: g("position/lat-geod-deg"),
      lonDeg: g("position/long-gc-deg"),
      heightM: altFt * FT_TO_M + displayOffsetM,
      altFt,
      aglFt: g("position/h-agl-ft"),
      pitchDeg: g("attitude/theta-deg"),
      rollDeg: g("attitude/phi-deg"),
      headingDeg: (g("attitude/psi-deg") + 360) % 360,
      trackDeg: (Math.atan2(g("velocities/v-east-fps"), g("velocities/v-north-fps")) * 180) / Math.PI,
      kias: g("velocities/vc-kts"),
      groundSpeedKt: g("velocities/vg-fps") * 0.592484,
      machNo: g("velocities/mach"),
      vsFpm: g("velocities/h-dot-fps") * 60,
      n1: [g("propulsion/engine[0]/n1"), g("propulsion/engine[1]/n1")],
      n2: [g("propulsion/engine[0]/n2"), g("propulsion/engine[1]/n2")],
      egtC: [this.systems.status().engines[0].egtC, this.systems.status().engines[1].egtC],
      fuelFlowKgH: [g("propulsion/engine[0]/fuel-flow-rate-pps") * 1633, g("propulsion/engine[1]/fuel-flow-rate-pps") * 1633],
      fuelKg: g("propulsion/total-fuel-lbs") * 0.4536,
      throttlePos: g("fcs/throttle-pos-norm[0]"),
      flapDeg: g("fcs/flap-pos-deg"),
      gearPos: g("gear/gear-pos-norm"),
      speedbrakePos: g("fcs/speedbrake-pos-norm"),
      onGround: g("gear/wow") > 0,
      pitchTrim: g("fcs/pitch-trim-cmd-norm"),
      surfaces: {
        elevator: g("fcs/elevator-pos-norm"),
        aileron: g("fcs/left-aileron-pos-norm"),
        rudder: g("fcs/rudder-pos-norm"),
      },
      simRate,
      fcc: structuredClone(this.fcc.getStatus()),
      systems: structuredClone(this.systems.status()),
      touchdown: this.touchdown,
    };
  }
}
