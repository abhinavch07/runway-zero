// Extra cockpit sounds, made in the browser with Web Audio (no recordings):
//   - Systems that run while switched on: start valve air, igniter ticks, PTU bark, electric
//     hydraulic pumps, fuel pumps, packs airflow, cockpit fans, the light aircraft fuel pump ticking,
//     the standby gyro, cylinder chugs while cranking a piston engine.
//   - One-off events: APU door, engine light-off, primer stroke.
//   - Alerts: autopilot disconnect (a warble or a short trumpet call), altitude alert, caution tones.
// Each page fills in a SysSounds every frame from its own aircraft state.

export interface SysSounds {
  /** Start valve air rush, 0 to 1 (more for two engines). */
  startAir?: number;
  /** Igniters are firing (ticks). */
  igniters?: boolean;
  /** The A320 PTU is running (it barks). */
  ptu?: boolean;
  /** Electric hydraulic pumps running. */
  elecHydPumps?: number;
  /** Fuel pumps running. */
  fuelPumps?: number;
  /** Air conditioning packs running. */
  packs?: number;
  /** Cockpit and avionics fans (powered). */
  fans?: boolean;
  /** Light aircraft electric fuel pump (ticks). */
  gaFuelPump?: boolean;
  /** Standby gyro powered (spins up, spins down). */
  gyro?: boolean;
  /** Piston engine cranking: RPM, for cylinder chugs. 0 when not cranking. */
  crankRpm?: number;
}

export class ExtraSounds {
  private ctx: AudioContext;
  private out: AudioNode;
  private noise: AudioBuffer;
  private air: GainNode;
  private hydGain: GainNode;
  private fuelGain: GainNode;
  private packGain: GainNode;
  private fanGain: GainNode;
  private gyroGain: GainNode;
  private gyroTone: OscillatorNode;
  private gyroSpin = 0;
  private nextIgniter = 0;
  private nextBark = 0;
  private nextTick = 0;
  private nextChug = 0;

  constructor(ctx: AudioContext, out: AudioNode, noise: AudioBuffer) {
    this.ctx = ctx;
    this.out = out;
    this.noise = noise;
    // Start air: a hiss through the ducts.
    this.air = this.gain(0);
    this.noiseInto(this.filter("bandpass", 2600, 0.6, this.air));
    // Electric hydraulic pumps: a steady whine with a little noise.
    this.hydGain = this.gain(0);
    this.tone("sawtooth", 420, 0.25, this.filter("lowpass", 1400, 1, this.hydGain));
    this.noiseInto(this.filter("bandpass", 1200, 2, this.hydGain));
    // Fuel pumps: a low electric hum.
    this.fuelGain = this.gain(0);
    this.tone("triangle", 190, 0.6, this.fuelGain);
    // Packs: a broad rush of air.
    this.packGain = this.gain(0);
    this.noiseInto(this.filter("lowpass", 900, 0.5, this.packGain));
    // Fans: a soft high hiss.
    this.fanGain = this.gain(0);
    this.noiseInto(this.filter("highpass", 3500, 0.5, this.fanGain));
    // Gyro: a whine that rises as it spins up.
    this.gyroGain = this.gain(0);
    this.gyroTone = this.tone("sine", 200, 1, this.gyroGain);
  }

  private gain(v: number) {
    const g = this.ctx.createGain();
    g.gain.value = v;
    g.connect(this.out);
    return g;
  }

  private filter(type: BiquadFilterType, freq: number, q: number, out: AudioNode) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    f.connect(out);
    return f;
  }

  private tone(type: OscillatorType, freq: number, level: number, out: AudioNode) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = level;
    o.connect(g).connect(out);
    o.start();
    return o;
  }

  private noiseInto(node: AudioNode) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(0, Math.random() * 2);
    src.connect(node);
  }

  private ramp(p: AudioParam, v: number, s = 0.3) {
    p.setTargetAtTime(v, this.ctx.currentTime, s / 3);
  }

  /** A short burst of filtered noise: clicks, ticks, chugs and thumps. */
  private burst(at: number, freq: number, q: number, level: number, len: number, type: BiquadFilterType = "bandpass") {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(level, at + Math.min(0.01, len / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(f).connect(g).connect(this.out);
    src.start(at, Math.random());
    src.stop(at + len + 0.02);
  }

  /** A note with an envelope. */
  private note(at: number, freq: number, len: number, level: number, type: OscillatorType = "sine") {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(level, at + 0.015);
    g.gain.setValueAtTime(level, at + Math.max(0.02, len - 0.05));
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(this.out);
    o.start(at);
    o.stop(at + len + 0.02);
    return o;
  }

  update(x: SysSounds) {
    const now = this.ctx.currentTime;
    this.ramp(this.air.gain, Math.min(1.5, x.startAir ?? 0) * 0.07, 0.6);
    this.ramp(this.hydGain.gain, (x.elecHydPumps ?? 0) * 0.012);
    this.ramp(this.fuelGain.gain, Math.min(6, x.fuelPumps ?? 0) * 0.004);
    this.ramp(this.packGain.gain, (x.packs ?? 0) * 0.02, 1);
    this.ramp(this.fanGain.gain, x.fans ? 0.012 : 0, 0.8);

    // Igniters: a sharp snap about once a second.
    if (x.igniters && now >= this.nextIgniter) {
      this.burst(now + 0.01, 3800, 3, 0.12, 0.03);
      this.nextIgniter = now + 0.85 + Math.random() * 0.2;
    }
    // PTU: the well-known bark, short low buzzes in a row.
    if (x.ptu && now >= this.nextBark) {
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.32;
        const o = this.note(t, 95, 0.16, 0.09, "sawtooth");
        o.frequency.setValueAtTime(80, t);
        o.frequency.linearRampToValueAtTime(115, t + 0.12);
      }
      this.nextBark = now + 1.4 + Math.random() * 0.6;
    }
    // Light aircraft electric fuel pump: a fast ticking.
    if (x.gaFuelPump && now >= this.nextTick) {
      this.burst(now + 0.01, 1800, 4, 0.05, 0.02);
      this.nextTick = now + 0.13;
    }
    // Piston engine cranking: a chug for each cylinder coming up on compression (two per turn).
    const rpm = x.crankRpm ?? 0;
    if (rpm > 30 && now >= this.nextChug) {
      this.burst(now + 0.01, 160, 1, 0.22, 0.09, "lowpass");
      this.nextChug = now + 60 / (rpm * 2);
    }
    // Gyro: spins up over about 20 s, runs down more slowly.
    const dt = 1 / 60;
    this.gyroSpin = x.gyro ? Math.min(1, this.gyroSpin + dt / 20) : Math.max(0, this.gyroSpin - dt / 40);
    this.ramp(this.gyroTone.frequency, 200 + this.gyroSpin * 2100, 0.2);
    this.ramp(this.gyroGain.gain, this.gyroSpin > 0.01 ? 0.006 + this.gyroSpin * 0.008 : 0, 0.5);
  }

  /** The APU inlet door opening: a motor whirr and a thump. */
  apuDoor() {
    const t = this.ctx.currentTime;
    const o = this.note(t, 140, 1.1, 0.03, "sawtooth");
    o.frequency.linearRampToValueAtTime(220, t + 1);
    this.burst(t + 1.1, 120, 1, 0.25, 0.15, "lowpass");
  }

  /** Engine light-off: a deep whoomp as the fuel lights. */
  lightOff() {
    const t = this.ctx.currentTime;
    this.burst(t, 90, 0.7, 0.45, 1.2, "lowpass");
    this.burst(t + 0.05, 400, 0.8, 0.12, 0.8);
  }

  /** One stroke of the hand primer: a push and a hiss of fuel. */
  primer() {
    const t = this.ctx.currentTime;
    this.burst(t, 700, 1.5, 0.12, 0.12);
    this.burst(t + 0.12, 2500, 1, 0.05, 0.25);
  }

  /** Autopilot disconnect: a warble on the 737, a short trumpet call on the A320. */
  apDisconnect(style: "warble" | "trumpet") {
    const t = this.ctx.currentTime;
    if (style === "warble") {
      for (let i = 0; i < 8; i++) this.note(t + i * 0.18, i % 2 ? 1300 : 900, 0.18, 0.07, "square");
    } else {
      [523, 659, 784, 1047].forEach((f, i) => this.note(t + i * 0.12, f, 0.14, 0.08, "sawtooth"));
      this.note(t + 0.5, 1047, 0.35, 0.08, "sawtooth");
    }
  }

  /** Altitude alert: a short chord as the aircraft nears the selected altitude. */
  altitudeAlert() {
    const t = this.ctx.currentTime;
    for (const f of [523, 659, 784]) this.note(t, f, 0.9, 0.05, "triangle");
  }

  /** A two-tone caution beep, for light aircraft warnings such as FUEL PRESS. */
  beep() {
    const t = this.ctx.currentTime;
    this.note(t, 1000, 0.18, 0.08, "square");
    this.note(t + 0.25, 1000, 0.18, 0.08, "square");
  }
}
