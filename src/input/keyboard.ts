// Keyboard flight controls. Held keys move the stick smoothly; released keys let it centre again.
// Works on a laptop keyboard with no extra keys (no Page Up, Home or number pad needed).
import type { Controls } from "../sim/types";

export const KEY_HELP: Array<[string, string]> = [
  ["Arrow Up / Down", "Pitch down / up"],
  ["Arrow Left / Right", "Roll left / right"],
  ["Z / X", "Rudder left / right"],
  ["[ / ]", "Pitch trim down / up"],
  ["= / -", "Thrust levers up / down"],
  ["F / R", "Flaps one step down / up"],
  ["G", "Gear lever up / down"],
  ["/", "Speedbrake in / out"],
  [".", "Wheel brakes (hold)"],
  ["C", "Cockpit or outside view"],
  ["V", "3D cockpit on or off"],
  ["Mouse drag", "Look around (double-click to reset)"],
  ["Click", "Gear lever, flap lever"],
  ["P", "Pause"],
  ["Backspace", "Reset to start position"],
  ["H", "Show or hide this help"],
];

const STICK_RATE = 1.6; // stick travel per second while a key is held
const CENTRE_RATE = 2.5; // stick travel per second back to centre after release
const STICK_LIMIT = 1;
const TRIM_RATE = 0.15;
const THROTTLE_RATE = 0.35;

export interface KeyboardEvents {
  onToggleView(): void;
  onTogglePause(): void;
  onReset(): void;
  onToggleHelp(): void;
  onToggleCockpit(): void;
}

export class KeyboardControls {
  readonly controls: Controls = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    pitchTrim: 0,
    throttle: 0.3,
    flapLever: 0,
    gearDown: false,
    speedbrake: 0,
    brakes: 0,
  };
  private held = new Set<string>();

  constructor(private events: KeyboardEvents) {
    window.addEventListener("keydown", (e) => this.down(e));
    window.addEventListener("keyup", (e) => this.held.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.held.clear());
  }

  /** Sets thrust and trim to the values the trim routine found, after a start or reset. */
  setTrimmed(throttle: number, pitchTrim: number) {
    Object.assign(this.controls, {
      pitch: 0,
      roll: 0,
      yaw: 0,
      throttle,
      pitchTrim,
      flapLever: 0,
      gearDown: false,
      speedbrake: 0,
      brakes: 0,
    });
  }

  private down(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "/", "backspace"].includes(key)) e.preventDefault();
    if (e.repeat) return;
    this.held.add(key);
    const c = this.controls;
    switch (key) {
      case "f":
        c.flapLever = Math.min(4, c.flapLever + 1);
        break;
      case "r":
        c.flapLever = Math.max(0, c.flapLever - 1);
        break;
      case "g":
        c.gearDown = !c.gearDown;
        break;
      case "/":
        c.speedbrake = c.speedbrake > 0 ? 0 : 1;
        break;
      case "c":
        this.events.onToggleView();
        break;
      case "p":
        this.events.onTogglePause();
        break;
      case "backspace":
        this.events.onReset();
        break;
      case "h":
        this.events.onToggleHelp();
        break;
      case "v":
        this.events.onToggleCockpit();
        break;
    }
  }

  /** Moves the stick, rudder, trim and thrust for held keys. Call once per frame. */
  update(dt: number) {
    const c = this.controls;
    const h = (k: string) => this.held.has(k);
    c.pitch = axis(c.pitch, h("arrowdown"), h("arrowup"), dt);
    c.roll = axis(c.roll, h("arrowright"), h("arrowleft"), dt);
    c.yaw = axis(c.yaw, h("x"), h("z"), dt);
    if (h("]")) c.pitchTrim = clamp(c.pitchTrim + TRIM_RATE * dt, -1, 1);
    if (h("[")) c.pitchTrim = clamp(c.pitchTrim - TRIM_RATE * dt, -1, 1);
    if (h("=") || h("+")) c.throttle = clamp(c.throttle + THROTTLE_RATE * dt, 0, 1);
    if (h("-") || h("_")) c.throttle = clamp(c.throttle - THROTTLE_RATE * dt, 0, 1);
    c.brakes = h(".") ? 1 : 0;
  }
}

function axis(value: number, plus: boolean, minus: boolean, dt: number): number {
  if (plus && !minus) return clamp(value + STICK_RATE * dt, -STICK_LIMIT, STICK_LIMIT);
  if (minus && !plus) return clamp(value - STICK_RATE * dt, -STICK_LIMIT, STICK_LIMIT);
  const step = CENTRE_RATE * dt;
  return Math.abs(value) <= step ? 0 : value - Math.sign(value) * step;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
