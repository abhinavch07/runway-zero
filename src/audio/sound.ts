// Cockpit sound, made entirely in the browser with Web Audio: no recordings are used.
// Layers: background hum (fans and electrics), APU, engines, switch clicks and lesson chimes.
// Browsers only allow sound after the user clicks or types, so the audio starts on the first input.
import type { SimState } from "../sim/types";

const STORE_KEY = "runway-zero-sound";

interface Saved {
  on: boolean;
  volume: number;
}

export class Sound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private noise!: AudioBuffer;
  private humGain!: GainNode;
  private apuGain!: GainNode;
  private apuTone!: OscillatorNode;
  private engRumble!: GainNode;
  private engFilter!: BiquadFilterNode;
  private engWhine!: GainNode;
  private engTone!: OscillatorNode;
  on = true;
  volume = 0.7;

  constructor() {
    const saved = load();
    if (saved) {
      this.on = saved.on;
      this.volume = saved.volume;
    }
    const startAudio = () => this.start();
    window.addEventListener("pointerdown", startAudio, { capture: true });
    window.addEventListener("keydown", startAudio, { capture: true });
    // A click for every button, switch and MCDU key.
    window.addEventListener(
      "pointerdown",
      (e) => {
        const el = e.target as HTMLElement | null;
        if (el?.closest("button")) this.click();
      },
      { capture: true },
    );
    window.addEventListener(
      "keydown",
      (e) => {
        if (!e.repeat && document.activeElement?.id === "mcdu" && e.key.length === 1) this.click();
      },
      { capture: true },
    );
  }

  /** Creates the audio graph on the first user input. */
  private start() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.on ? this.volume : 0;
    this.master.connect(ctx.destination);

    // Two seconds of white noise, looped by every noise layer.
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // Hum: low filtered noise like avionics fans, plus a faint 400 Hz tone from the AC power.
    this.humGain = this.gain(0);
    this.noiseInto(this.filter("lowpass", 450, 0.7, this.humGain));
    const ac400 = ctx.createOscillator();
    ac400.frequency.value = 400;
    const acGain = ctx.createGain();
    acGain.gain.value = 0.05;
    ac400.connect(acGain).connect(this.humGain);
    ac400.start();

    // APU: a high whine whose pitch follows its speed, plus some rumble. It sits in the tail, so it is quiet.
    this.apuGain = this.gain(0);
    this.apuTone = ctx.createOscillator();
    this.apuTone.type = "triangle";
    const apuToneGain = ctx.createGain();
    apuToneGain.gain.value = 0.25;
    this.apuTone.connect(apuToneGain).connect(this.apuGain);
    this.apuTone.start();
    this.noiseInto(this.filter("bandpass", 900, 0.8, this.apuGain));

    // Engines: a rumble that opens up with N1, and a fan whine whose pitch follows N2.
    this.engRumble = this.gain(0);
    this.engFilter = this.filter("lowpass", 200, 0.7, this.engRumble);
    this.noiseInto(this.engFilter);
    this.engWhine = this.gain(0);
    this.engTone = ctx.createOscillator();
    this.engTone.type = "sawtooth";
    const whineFilter = this.filter("lowpass", 2500, 1, this.engWhine);
    this.engTone.connect(whineFilter);
    this.engTone.start();
  }

  private gain(v: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = v;
    g.connect(this.master);
    return g;
  }

  private filter(type: BiquadFilterType, freq: number, q: number, out: AudioNode): BiquadFilterNode {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    f.connect(out);
    return f;
  }

  private noiseInto(node: AudioNode) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    // Start each layer at a different point so they do not sound the same.
    src.start(0, Math.random() * 2);
    src.connect(node);
  }

  private ramp(p: AudioParam, v: number, seconds = 0.3) {
    p.setTargetAtTime(v, this.ctx!.currentTime, seconds / 3);
  }

  /** Follows the aircraft state. Called every frame. */
  update(s: SimState) {
    this.updateJet(s.systems);
  }

  /** Jet airliner sound from the electrics, the APU and the two engines (A320 and 737 pages). */
  updateJet(sys: { acPower: boolean; dcPower: boolean; apuN: number; engines: { n1: number; n2: number }[] }) {
    if (!this.ctx) return;
    this.ramp(this.humGain.gain, sys.acPower ? 0.05 : sys.dcPower ? 0.015 : 0);

    const apu = sys.apuN / 100;
    this.ramp(this.apuGain.gain, apu * 0.035);
    this.ramp(this.apuTone.frequency, 300 + apu * 2400);

    const n1 = Math.max(...sys.engines.map((e) => e.n1)) / 100;
    const n2 = Math.max(...sys.engines.map((e) => e.n2)) / 100;
    const running = sys.engines.filter((e) => e.n2 > 1).length;
    this.ramp(this.engRumble.gain, n2 * 0.06 * running + n1 * n1 * 0.25);
    this.ramp(this.engFilter.frequency, 120 + n1 * 900 + n2 * 150);
    this.ramp(this.engWhine.gain, n2 * 0.012 * running);
    this.ramp(this.engTone.frequency, 60 + n2 * 520);
  }

  /** Light aircraft: piston engine sound from RPM, starter whine while cranking. */
  updatePiston(rpm: number, running: boolean, cranking: boolean, power: number) {
    if (!this.ctx) return;
    this.ramp(this.humGain.gain, power * 0.035);
    // The starter whine uses the APU voice.
    this.ramp(this.apuGain.gain, cranking ? 0.05 : 0, 0.1);
    this.ramp(this.apuTone.frequency, 500 + Math.min(1000, rpm) * 0.4, 0.1);
    const r = Math.min(1, rpm / 2700);
    // Four cylinders, four-stroke: two firings per turn of the crankshaft.
    this.ramp(this.engTone.frequency, Math.max(8, (rpm / 60) * 2), 0.15);
    this.ramp(this.engWhine.gain, running ? 0.05 + r * 0.06 : rpm > 50 ? 0.015 : 0, 0.15);
    this.ramp(this.engRumble.gain, running ? 0.08 + r * 0.22 : rpm > 50 ? 0.03 : 0, 0.15);
    this.ramp(this.engFilter.frequency, 150 + r * 1100, 0.15);
  }

  /** Single chime for a caution, or a sharper repeated one for a configuration warning. */
  caution(warning: boolean) {
    const ctx = this.ctx;
    if (!ctx) return;
    const times = warning ? [0, 0.25, 0.5] : [0];
    for (const dt of times) {
      const t = ctx.currentTime + dt;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = warning ? 1400 : 1250;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + (warning ? 0.2 : 0.9));
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 1);
    }
  }

  /** Plays a navaid ident in Morse code (about 7 words per minute, 1020 Hz like a VOR ident). */
  morse(text: string) {
    const ctx = this.ctx;
    if (!ctx) return;
    const CODE: Record<string, string> = {
      A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
      K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
      U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    };
    const unit = 0.12;
    let t = ctx.currentTime + 0.05;
    for (const ch of text.toUpperCase()) {
      for (const sym of CODE[ch] ?? "") {
        const len = sym === "." ? unit : unit * 3;
        const o = ctx.createOscillator();
        o.frequency.value = 1020;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.005);
        g.gain.setValueAtTime(0.12, t + len - 0.005);
        g.gain.linearRampToValueAtTime(0, t + len);
        o.connect(g).connect(this.master);
        o.start(t);
        o.stop(t + len + 0.01);
        t += len + unit;
      }
      t += unit * 2;
    }
  }

  click() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2200;
    f.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + 0.03);
  }

  /** A soft chime: one note for a step, a rising three-note chime when the lesson is complete. */
  chime(complete = false) {
    const ctx = this.ctx;
    if (!ctx) return;
    const notes = complete ? [660, 880, 1320] : [1046];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.14;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.65);
    });
  }

  setOn(on: boolean) {
    this.on = on;
    if (!on && "speechSynthesis" in window) speechSynthesis.cancel();
    this.applyVolume();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.applyVolume();
  }

  private applyVolume() {
    save({ on: this.on, volume: this.volume });
    if (this.ctx) this.ramp(this.master.gain, this.on ? this.volume : 0, 0.1);
  }

  /** For tests: whether audio is running and the current layer levels. */
  debug() {
    if (!this.ctx) return { state: "not started" };
    return {
      state: this.ctx.state,
      master: this.master.gain.value,
      hum: this.humGain.gain.value,
      apu: this.apuGain.gain.value,
      engines: this.engRumble.gain.value,
    };
  }
}

// Browser storage can be missing or blocked, so every use is wrapped.
function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(v: Saved) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(v));
  } catch {
    /* not saved, that is fine */
  }
}
