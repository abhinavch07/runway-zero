// 737 simulation core shared by the browser worker and the Node tests: JSBSim's public 737 model,
// the systems and the autopilot.
import type { JSBSimSdk } from "@0x62/jsbsim-wasm";
import { Afcs737, type McpAction, type RoutePoint } from "./afcs.ts";
import { Systems737 } from "./systems.ts";
import type { Controls737, Start737, State737, Sw737 } from "./types.ts";

export const B737_STEP_HZ = 120;
export const B737_MODEL_FILES = ["aircraft/737/737.xml", "engine/CFM56.xml", "engine/direct.xml"];
/** Flap lever degrees to the model's flap command (its last stage is 40 degrees). */
export const FLAP_STAGES = [0, 1, 5, 15, 30, 40];

export class Core737 {
  readonly afcs: Afcs737;
  readonly systems: Systems737;
  private sdk: JSBSimSdk;
  private terrainFt = 0;

  constructor(sdk: JSBSimSdk) {
    this.sdk = sdk;
    const fdm = { get: (p: string) => sdk.getPropertyValue(p), set: (p: string, v: number) => sdk.setPropertyValue(p, v) };
    this.afcs = new Afcs737(fdm);
    this.systems = new Systems737(fdm);
  }

  get(p: string) {
    return this.sdk.getPropertyValue(p);
  }
  set(p: string, v: number) {
    this.sdk.setPropertyValue(p, v);
  }

  healthy() {
    return [this.get("position/h-sl-ft"), this.get("velocities/vc-kts"), this.get("attitude/phi-rad")].every(Number.isFinite);
  }

  place(start: Start737, sw: Sw737) {
    this.terrainFt = start.terrainFt;
    // The flight model's own tanks stay full. Our systems track the fuel in each tank.
    for (let i = 0; i < 3; i++) this.set(`propulsion/tank[${i}]/contents-lbs`, 9000);
    this.set("ic/lat-geod-deg", start.latDeg);
    this.set("ic/long-gc-deg", start.lonDeg);
    this.set("ic/terrain-elevation-ft", start.terrainFt);
    this.set("ic/psi-true-deg", start.headingDeg);
    if (start.onGround) {
      this.set("ic/h-agl-ft", 8);
      this.set("ic/vc-kts", 0);
      this.set("ic/gamma-deg", 0);
    } else {
      this.set("ic/h-sl-ft", start.altFt ?? 6000);
      this.set("ic/vc-kts", start.kias ?? 250);
      this.set("ic/gamma-deg", 0);
    }
    this.sdk.runIc();
    if (start.state === "running") this.set("propulsion/set-running", -1);
    this.set("gear/gear-cmd-norm", start.onGround ? 1 : 0);
    this.set("gear/gear-pos-norm", start.onGround ? 1 : 0);
    this.set("fcs/flap-cmd-norm", 0);
    let throttle = 0;
    if (!start.onGround) {
      try {
        this.sdk.doTrim(1);
      } catch {
        /* keep untrimmed */
      }
      throttle = this.get("fcs/throttle-cmd-norm[0]");
    } else {
      for (let i = 0; i < B737_STEP_HZ * 2; i++) {
        this.set("fcs/left-brake-cmd-norm", 1);
        this.set("fcs/right-brake-cmd-norm", 1);
        this.set("position/terrain-elevation-asl-ft", this.terrainFt);
        this.sdk.run();
      }
    }
    this.systems.reset(start.state, sw);
    // Fuel goes into the wings first (up to about 3,900 kg each), the rest into the centre tank.
    const wing = Math.min(start.fuelKg / 2, 3900);
    this.systems.setTanks(wing, start.fuelKg - wing * 2, wing);
    this.afcs.reset({ spd: start.onGround ? 250 : Math.round(start.kias ?? 250), hdg: Math.round(start.headingDeg), alt: start.onGround ? 10000 : Math.round((start.altFt ?? 6000) / 100) * 100, vs: 0 }, throttle);
    return { throttle };
  }

  step(c: Controls737) {
    const dt = 1 / B737_STEP_HZ;
    const stage = FLAP_STAGES.indexOf(c.flaps);
    this.set("fcs/flap-cmd-norm", stage <= 0 ? 0 : c.flaps / 40);
    const onWheels = this.get("gear/wow") > 0;
    this.set("gear/gear-cmd-norm", c.gearDown || onWheels ? 1 : 0);
    const brakes = Math.max(c.brakes, c.switches.parkBrake ? 1 : 0);
    this.set("fcs/left-brake-cmd-norm", brakes);
    this.set("fcs/right-brake-cmd-norm", brakes);
    this.set("fcs/rudder-cmd-norm", c.yaw);
    this.set("fcs/steer-cmd-norm", c.yaw);
    this.systems.step(dt, c.switches);
    this.afcs.step(dt, { pitch: c.pitch, roll: c.roll, throttle: c.throttle, nav1: c.nav1, crs1: c.crs1 });
    this.set("position/terrain-elevation-asl-ft", this.terrainFt);
    this.sdk.run();
  }

  command(a: McpAction) {
    this.afcs.command(a);
  }

  setRoute(points: RoutePoint[], crzAltFt: number) {
    this.afcs.setRoute(points, crzAltFt);
  }

  state(): State737 {
    const g = (p: string) => this.get(p);
    return {
      simTime: g("simulation/sim-time-sec"),
      latDeg: g("position/lat-geod-deg"),
      lonDeg: g("position/long-gc-deg"),
      altFt: g("position/h-sl-ft"),
      aglFt: g("position/h-agl-ft"),
      pitchDeg: g("attitude/theta-deg"),
      rollDeg: g("attitude/phi-deg"),
      headingDeg: (g("attitude/psi-deg") + 360) % 360,
      trackDeg: ((Math.atan2(g("velocities/v-east-fps"), g("velocities/v-north-fps")) * 180) / Math.PI + 360) % 360,
      kias: Math.max(0, g("velocities/vc-kts")),
      mach: g("velocities/mach"),
      groundSpeedKt: g("velocities/vg-fps") * 0.5925,
      vsFpm: g("velocities/h-dot-fps") * 60,
      onGround: g("gear/wow") > 0,
      flapDeg: g("fcs/flap-pos-norm") * 40,
      gearPos: g("gear/gear-pos-norm"),
      throttle: g("fcs/throttle-cmd-norm[0]"),
      sys: structuredClone(this.systems.status()),
      afcs: structuredClone(this.afcs.st),
    };
  }
}
