// Simulation core shared by the browser worker and the Node test scripts:
// JSBSim, the flight control computer, start positions and the touchdown report.
import type { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { FlightControlComputer, type FccStatus, type FcuAction, type PilotInput } from "./fcc.ts";
import type { Controls, SimState, StartPosition, TouchdownReport } from "./types.ts";
import { alongCross } from "../world/geo.ts";
import { ILS_28 } from "../world/vidp.ts";

export const STEP_HZ = 120;
const FT_TO_M = 0.3048;

// Flap lever detents mapped to the stand-in model's flap command (0 to 1 covers 0 to 40 degrees).
// 0, 1 (10 deg), 2 (15 deg), 3 (20 deg), FULL (40 deg).
const FLAP_CMD = [0, 0.25, 0.375, 0.5, 1];

export const MODEL_FILES = ["aircraft/A320/A320.xml", "engine/CFM56_5.xml", "engine/direct.xml"];

export class SimCore {
  readonly fcc: FlightControlComputer;
  private terrainFt = 0;
  private wasAirborne = false;
  private airborneFor = 0;
  private lastVsFpm = 0;
  touchdown: TouchdownReport | null = null;
  private sdk: JSBSimSdk;

  constructor(sdk: JSBSimSdk) {
    this.sdk = sdk;
    this.fcc = new FlightControlComputer({
      get: (p) => sdk.getPropertyValue(p),
      set: (p, v) => sdk.setPropertyValue(p, v),
    });
  }

  get(p: string) {
    return this.sdk.getPropertyValue(p);
  }
  set(p: string, v: number) {
    this.sdk.setPropertyValue(p, v);
  }

  setTerrain(ft: number) {
    this.terrainFt = ft;
  }

  /** Places the aircraft at a start position. Returns the thrust lever and trim values to start with. */
  place(start: StartPosition): { throttle: number } {
    this.terrainFt = start.terrainFt;
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
    this.set("propulsion/set-running", -1);
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
    this.wasAirborne = !start.onGround;
    this.airborneFor = start.onGround ? 0 : 60;
    this.touchdown = null;
    return { throttle };
  }

  /** Runs one 1/120 s step with the given pilot controls. */
  step(c: Controls) {
    const input: PilotInput = { pitch: c.pitch, roll: c.roll, yaw: c.yaw, throttle: c.throttle };
    this.set("fcs/flap-cmd-norm", FLAP_CMD[Math.max(0, Math.min(4, c.flapLever))]);
    this.set("gear/gear-cmd-norm", c.gearDown ? 1 : 0);
    this.set("fcs/speedbrake-cmd-norm", c.speedbrake);
    this.set("fcs/left-brake-cmd-norm", c.brakes);
    this.set("fcs/right-brake-cmd-norm", c.brakes);
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
      throttlePos: g("fcs/throttle-pos-norm[0]"),
      flapDeg: g("fcs/flap-pos-deg"),
      gearPos: g("gear/gear-pos-norm"),
      speedbrakePos: g("fcs/speedbrake-pos-norm"),
      onGround: g("gear/wow") > 0,
      pitchTrim: g("fcs/pitch-trim-cmd-norm"),
      simRate,
      fcc: structuredClone(this.fcc.getStatus()),
      touchdown: this.touchdown,
    };
  }
}
