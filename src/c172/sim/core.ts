// C172 simulation: JSBSim's public Cessna 172 model plus our own simple systems: electrics
// (battery, alternator, essential and avionics buses, standby battery), fuel selector and shutoff,
// electric fuel pump for priming, magnetos and starter. Used by the worker and the Node tests.
import type { JSBSimSdk } from "@0x62/jsbsim-wasm";
import type { C172Controls, C172Start, C172State } from "./types.ts";
import { GA_VARIANTS, type GaVariant } from "./variant.ts";

export const C172_MODEL_FILES = GA_VARIANTS.c172.modelFiles;
export const C172_STEP_HZ = 120;
const LBS_PER_GAL = 6;
const MAG_CMD = { OFF: 0, L: 1, R: 2, BOTH: 3, START: 3 } as const;

export class C172Core {
  private sdk: JSBSimSdk;
  private terrainFt = 0;
  /** Seconds the electric fuel pump ran with the engine stopped. Cold engines need 3 to 5 s. */
  private primeS = 0;
  private crankS = 0;
  /** True once the engine has caught and keeps running on its own. */
  private firing = false;
  private alternatorWarm = 0;
  private altFailed = false;
  private starved = false;
  /** The engine-driven fuel pump has failed (a lesson failure). */
  private pumpFailed = false;
  /** Fuel pressure, psi (PA-28 gauge). */
  private fuelPress = 0;
  /** Seconds of fuel left in the carburettor bowl when the pressure is lost. */
  private bowlS = 15;
  /** Battery charge used, amp-hours (a 13 Ah battery). */
  private drainAh = 0;
  private lastLoadA = 0;
  /** Switch positions from the last step, for the electrics in state(). */
  private lastSwitches: C172Controls["switches"] | null = null;
  private v: GaVariant;
  /** Primer strokes already counted (PA-28 hand primer). */
  private strokesSeen = 0;

  constructor(sdk: JSBSimSdk, variant: GaVariant = GA_VARIANTS.c172) {
    this.sdk = sdk;
    this.v = variant;
  }

  get(p: string) {
    return this.sdk.getPropertyValue(p);
  }
  set(p: string, v: number) {
    this.sdk.setPropertyValue(p, v);
  }

  healthy(): boolean {
    const v = [this.get("position/h-sl-ft"), this.get("velocities/vc-kts"), this.get("attitude/phi-rad")];
    return v.every(Number.isFinite) && Math.abs(this.get("attitude/phi-rad")) < 3.2;
  }

  place(start: C172Start) {
    this.terrainFt = start.terrainFt;
    for (let i = 0; i < 2; i++) this.set(`propulsion/tank[${i}]/contents-lbs`, (start.fuelGal?.[i] ?? start.fuelGalPerTank) * LBS_PER_GAL);
    this.set("ic/lat-geod-deg", start.latDeg);
    this.set("ic/long-gc-deg", start.lonDeg);
    this.set("ic/terrain-elevation-ft", start.terrainFt);
    this.set("ic/psi-true-deg", start.headingDeg);
    const air = start.air;
    this.set("ic/h-agl-ft", air ? air.aglFt : 4.5);
    this.set("ic/vc-kts", air ? air.kias : 0);
    this.set("ic/gamma-deg", air?.gammaDeg ?? 0);
    this.sdk.runIc();
    const stages = this.v.flapDeg;
    this.set("fcs/flap-cmd-norm", air ? stages[air.flaps] / stages[stages.length - 1] : 0);
    this.primeS = start.running ? 10 : 0;
    this.crankS = 0;
    this.strokesSeen = 0;
    this.firing = start.running;
    this.altFailed = false;
    this.pumpFailed = false;
    this.bowlS = 15;
    this.fuelPress = start.running ? 4.5 : 0;
    this.drainAh = 0;
    this.alternatorWarm = start.running ? 10 : 0;
    if (start.running) {
      this.set("fcs/mixture-cmd-norm", 1);
      this.set("fcs/throttle-cmd-norm", 0.1);
      this.set("propulsion/magneto_cmd", 3);
      this.set("propulsion/set-running", 0);
    } else {
      this.set("propulsion/magneto_cmd", 0);
      this.set("fcs/mixture-cmd-norm", 0);
    }
    if (air) {
      // Flying: the engine runs at the lesson's power, flaps and trim set. No settling on the ground.
      this.set("fcs/throttle-cmd-norm", air.throttle);
      this.set("fcs/pitch-trim-cmd-norm", -air.trim * 0.3);
      // Let the flaps run out (about 3 s) with the aircraft held steady, then hand over.
      for (let i = 0; i < C172_STEP_HZ * 3; i++) {
        this.set("fcs/elevator-cmd-norm", 0);
        this.set("fcs/aileron-cmd-norm", -this.get("attitude/phi-rad") * 2);
        this.sdk.run();
      }
      return;
    }
    for (let i = 0; i < C172_STEP_HZ * 2; i++) {
      this.set("fcs/left-brake-cmd-norm", 1);
      this.set("fcs/right-brake-cmd-norm", 1);
      this.set("position/terrain-elevation-asl-ft", this.terrainFt);
      this.sdk.run();
    }
  }

  step(c: C172Controls) {
    const dt = 1 / C172_STEP_HZ;
    const sw = c.switches;
    this.lastSwitches = sw;
    const rpm = this.get("propulsion/engine/engine-rpm");
    const running = this.firing;

    // ----- Fuel: selector, shutoff valve, electric pump for priming -----
    // Starved when every tank the selector feeds from is empty.
    const lbs = [this.get("propulsion/tank[0]/contents-lbs"), this.get("propulsion/tank[1]/contents-lbs")];
    const feeds = sw.fuelSel === "OFF" ? [] : sw.fuelSel === "LEFT" ? [0] : sw.fuelSel === "RIGHT" ? [1] : [0, 1];
    this.starved = feeds.length > 0 && feeds.every((i) => lbs[i] < 0.05);
    const fuelAvailable = sw.fuelShutoff && feeds.length > 0 && !this.starved;
    // Fuel pressure: the engine-driven pump works while the engine turns, the electric pump while
    // it has power. With no pressure the engine runs on for a few seconds, then stops.
    const enginePump = rpm > 150 && !this.pumpFailed;
    const elecPump = sw.fuelPump && sw.masterBat;
    const press = !fuelAvailable ? 0 : elecPump && enginePump ? 5.2 : enginePump ? Math.min(4.5, rpm / 400) : elecPump ? 4.2 : 0;
    this.fuelPress += (press - this.fuelPress) * Math.min(1, dt * 1.5);
    if (this.fuelPress > 1) this.bowlS = Math.min(15, this.bowlS + dt * 3);
    else if (running && this.fuelPress < 0.5) this.bowlS = Math.max(0, this.bowlS - dt);
    const fuelFlowing = fuelAvailable && (this.bowlS > 0 || !this.v.primer);
    this.set("propulsion/tank[0]/priority", feeds.includes(0) ? 1 : 0);
    this.set("propulsion/tank[1]/priority", feeds.includes(1) ? 1 : 0);
    const mainBus = sw.masterBat;
    if (this.v.primer) {
      // Hand primer: each stroke counts as one second of priming. It needs fuel selected.
      const strokes = c.primeStrokes ?? 0;
      if (strokes > this.strokesSeen && fuelFlowing && !running) this.primeS = Math.min(30, this.primeS + (strokes - this.strokesSeen));
      this.strokesSeen = strokes;
    } else if (sw.fuelPump && mainBus && fuelFlowing && !running && c.mixture > 0.5) this.primeS = Math.min(30, this.primeS + dt);

    // ----- Starter and magnetos -----
    const cranking = sw.magnetos === "START" && mainBus;
    this.crankS = cranking ? this.crankS + dt : 0;
    this.set("propulsion/starter_cmd", cranking ? 1 : 0);
    this.set("propulsion/magneto_cmd", MAG_CMD[sw.magnetos]);
    // A cold engine fires only when primed. Without priming it needs a long crank to catch.
    const needCrank = this.primeS >= 2 ? 0.8 : 5;
    if (!this.firing && cranking && this.crankS >= needCrank && fuelFlowing && c.mixture > 0.3 && sw.magnetos !== "OFF")
      this.firing = true;
    // It stops when it slows right down (mixture cut-off, magnetos off, no fuel).
    if (this.firing && !cranking && rpm < 250) this.firing = false;
    const mixture = fuelFlowing && this.firing ? c.mixture : 0;
    this.set("fcs/mixture-cmd-norm", mixture);
    this.set("fcs/throttle-cmd-norm", c.throttle);

    // ----- Flight controls, flaps, brakes -----
    this.set("fcs/elevator-cmd-norm", -c.pitch);
    this.set("fcs/aileron-cmd-norm", c.roll);
    this.set("fcs/rudder-cmd-norm", -c.yaw);
    this.set("fcs/steer-cmd-norm", c.yaw);
    // Positive trim is nose up: JSBSim wants a negative elevator command for nose up, as for the yoke.
    this.set("fcs/pitch-trim-cmd-norm", -c.trim * 0.3);
    const stages = this.v.flapDeg;
    const stage = Math.max(0, Math.min(stages.length - 1, Math.round(c.flaps)));
    this.set("fcs/flap-cmd-norm", stages[stage] / stages[stages.length - 1]);
    const brakes = Math.max(c.brakes, sw.parkBrake ? 1 : 0);
    this.set("fcs/left-brake-cmd-norm", brakes);
    this.set("fcs/right-brake-cmd-norm", brakes);

    this.alternatorWarm = sw.masterAlt && mainBus && rpm > 800 && !this.altFailed ? Math.min(10, this.alternatorWarm + dt) : 0;
    // The battery runs down while it supplies the load and recharges from the alternator.
    if (mainBus && this.alternatorWarm <= 1) this.drainAh += (this.lastLoadA * dt) / 3600;
    else if (this.alternatorWarm > 1) this.drainAh = Math.max(0, this.drainAh - (5 * dt) / 3600);
    this.set("position/terrain-elevation-asl-ft", this.terrainFt);
    this.sdk.run();
  }

  fail(what: "alternator" | "fuelpump") {
    if (what === "alternator") this.altFailed = true;
    if (what === "fuelpump") this.pumpFailed = true;
  }

  state(): C172State {
    const g = (p: string) => this.get(p);
    const sw = this.lastSwitches;
    const rpm = g("propulsion/engine/engine-rpm");
    const running = this.firing && rpm > 450;
    const cranking = !!sw && sw.magnetos === "START" && sw.masterBat;
    const altOn = this.alternatorWarm > 1;
    const mainBus = !!sw?.masterBat;
    const avionics = mainBus && !!sw?.avionics;
    // Battery 24 V system. Alternator 28 V. Cranking pulls the battery down.
    // A 24 V battery reads about 24.4 V full, falling as it is used (13 Ah capacity).
    const batV = Math.max(20, 24.4 - (this.drainAh / 13) * 4);
    let mainVolts = mainBus ? (altOn ? 28.0 : cranking ? batV - 3 : batV) : 0;
    let load = 0;
    if (mainBus) {
      load = 6 + (avionics ? 9 : 0) + (sw!.fuelPump ? 3 : 0) + (sw!.beacon ? 1.5 : 0) + (sw!.landing ? 6 : 0) +
        (sw!.taxi ? 4 : 0) + (sw!.nav ? 2 : 0) + (sw!.strobe ? 2 : 0) + (sw!.pitotHeat ? 10 : 0) + (cranking ? 120 : 0);
    }
    this.lastLoadA = load;
    const mainAmps = !mainBus ? 0 : altOn ? Math.max(1.5, 8 - this.alternatorWarm * 0.6) : -load;
    const stbyOnly = !mainBus && !!sw?.stbyBatt;
    if (stbyOnly) mainVolts = 0;
    const essVolts = mainBus ? mainVolts : stbyOnly ? 24.0 : 0;
    return {
      simTime: g("simulation/sim-time-sec"),
      latDeg: g("position/lat-geod-deg"),
      lonDeg: g("position/long-gc-deg"),
      altFt: g("position/h-sl-ft"),
      aglFt: g("position/h-agl-ft"),
      pitchDeg: g("attitude/theta-deg"),
      rollDeg: g("attitude/phi-deg"),
      headingDeg: (g("attitude/psi-deg") + 360) % 360,
      trackDeg: (g("flight-path/psi-gt-rad") * 180) / Math.PI,
      kias: Math.max(0, g("velocities/vc-kts")),
      groundSpeedKt: g("velocities/vg-fps") * 0.5925,
      vsFpm: g("velocities/h-dot-fps") * 60,
      onGround: g("gear/wow") > 0,
      flapDeg: g("fcs/flap-pos-deg"),
      oatC: g("atmosphere/T-R") / 1.8 - 273.15,
      engine: {
        running,
        cranking,
        rpm,
        mapInHg: g("propulsion/engine/map-inhg"),
        fuelFlowGph: g("propulsion/engine/fuel-flow-rate-gph"),
        oilPressPsi: g("propulsion/engine/oil-pressure-psi"),
        oilTempF: g("propulsion/engine/oil-temperature-degF"),
        egtF: g("propulsion/engine/egt-degF"),
        chtF: g("propulsion/engine/cht-degF"),
      },
      fuelGal: [g("propulsion/tank[0]/contents-lbs") / LBS_PER_GAL, g("propulsion/tank[1]/contents-lbs") / LBS_PER_GAL],
      elec: {
        mainVolts,
        essVolts,
        mainAmps,
        stbyAmps: stbyOnly ? -4 : 0,
        mainBus,
        essBus: essVolts > 0,
        avionicsBus: avionics,
        alternatorOn: altOn,
        altFailed: this.altFailed,
        lowVolts: mainBus && running && mainVolts < 24.5,
      },
      primeS: this.primeS,
      starved: this.starved,
      fuelPressPsi: this.fuelPress,
      pumpFailed: this.pumpFailed,
    };
  }
}
