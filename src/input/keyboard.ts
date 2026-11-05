// Keyboard flight controls. Held keys move the sidestick smoothly; released keys let it centre again.
// Works on a laptop keyboard with no extra keys (no Page Up, Home or number pad needed).
import type { Controls } from "../sim/types";
import { coldSwitches, runningSwitches } from "../sim/systems";

export const KEY_HELP: Array<[string, string]> = [
  ["Arrow Up / Down", "Sidestick forward / back"],
  ["Arrow Left / Right", "Sidestick left / right"],
  ["Z / X", "Rudder and nosewheel left / right"],
  ["= / -", "Thrust levers up / down"],
  ["F / R", "Flaps one step down / up"],
  ["G", "Gear lever up / down"],
  ["/", "Speedbrake in / out"],
  [". (hold)", "Wheel brakes"],
  ["B", "Parking brake on / off"],
  ["O", "Overhead panel / main panel"],
  ["A", "Autopilot on / off"],
  ["T", "Autothrust on / off"],
  ["C", "Cockpit or outside view"],
  ["V", "Instrument panel on / off"],
  ["Mouse drag", "Look around (double-click resets)"],
  ["Panel buttons", "Gear, flaps, speedbrake, FCU"],
  ["P", "Pause"],
  ["Backspace", "Restart this start position"],
  ["H", "Show / hide this help"],
];

const STICK_RATE = 1.6; // stick travel per second while a key is held
const CENTRE_RATE = 2.5; // stick travel per second back to centre after release
const THROTTLE_RATE = 0.35;

export interface KeyboardEvents {
  onToggleView(): void;
  onTogglePause(): void;
  onReset(): void;
  onToggleHelp(): void;
  onTogglePanel(): void;
  onAp(): void;
  onAthr(): void;
  onOverhead(): void;
}

export class KeyboardControls {
  readonly controls: Controls = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0,
    flapLever: 0,
    gearDown: true,
    speedbrake: 0,
    brakes: 0,
    switches: runningSwitches(),
  };
  private held = new Set<string>();
  private events: KeyboardEvents;

  constructor(events: KeyboardEvents) {
    this.events = events;
    window.addEventListener("keydown", (e) => this.down(e));
    window.addEventListener("keyup", (e) => this.held.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.held.clear());
  }

  /** Matches the levers to a new start position. */
  setStart(throttle: number, flapLever: number, gearDown: boolean, cold: boolean) {
    this.controls.switches = cold ? coldSwitches() : runningSwitches();
    Object.assign(this.controls, {
      pitch: 0,
      roll: 0,
      yaw: 0,
      throttle,
      flapLever,
      gearDown,
      speedbrake: 0,
      brakes: 0,
    });
  }

  private down(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === "SELECT") return;
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
        this.events.onTogglePanel();
        break;
      case "a":
        this.events.onAp();
        break;
      case "t":
        this.events.onAthr();
        break;
      case "b":
        c.switches.parkBrake = !c.switches.parkBrake;
        break;
      case "o":
        this.events.onOverhead();
        break;
    }
  }

  /**
   * Moves the stick, rudder and thrust levers for held keys. Call once per frame.
   * While autothrust is active, pass its lever position: the levers follow it.
   */
  update(dt: number, athrThrottle: number | null) {
    const c = this.controls;
    const h = (k: string) => this.held.has(k);
    c.pitch = axis(c.pitch, h("arrowdown"), h("arrowup"), dt);
    c.roll = axis(c.roll, h("arrowright"), h("arrowleft"), dt);
    c.yaw = axis(c.yaw, h("x"), h("z"), dt);
    if (athrThrottle !== null) c.throttle = athrThrottle;
    else {
      if (h("=") || h("+")) c.throttle = clamp(c.throttle + THROTTLE_RATE * dt, 0, 1);
      if (h("-") || h("_")) c.throttle = clamp(c.throttle - THROTTLE_RATE * dt, 0, 1);
    }
    c.brakes = h(".") ? 1 : 0;
  }
}

function axis(value: number, plus: boolean, minus: boolean, dt: number): number {
  if (plus && !minus) return clamp(value + STICK_RATE * dt, -1, 1);
  if (minus && !plus) return clamp(value - STICK_RATE * dt, -1, 1);
  const step = CENTRE_RATE * dt;
  return Math.abs(value) <= step ? 0 : value - Math.sign(value) * step;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
