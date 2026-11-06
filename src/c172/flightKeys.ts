// Flying the light aircraft with the keyboard.
//   Arrow keys: the yoke. Down arrow pulls back (nose up), Up arrow pushes (nose down), Left and
//   Right roll. The yoke springs back to the middle when you let go. Hold Shift for full travel.
//   W and S: more and less power (Shift+W full, Shift+S idle).  A and D: rudder and nosewheel.
//   F and R: flaps down and up one stage.  Q and E: trim nose down and nose up.
//   B: brakes (hold).  P: parking brake on or off.
import type { C172Controls } from "./sim/types";

const KEYS = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "s", "a", "d", "q", "e", "b"];

export class FlightKeys {
  private held = new Set<string>();
  private shift = false;
  private c: C172Controls;
  /** Flap stages on the lever (0 to max). */
  private maxFlap: number;
  /** Keys work only while this returns true (a lesson is loaded, no dialog open). */
  enabled: () => boolean = () => true;
  /** Called when a key changes something, for a click sound. */
  onChange?: (what: string) => void;

  constructor(c: C172Controls, maxFlap: number) {
    this.c = c;
    this.maxFlap = maxFlap;
    window.addEventListener("keydown", (e) => this.down(e));
    window.addEventListener("keyup", (e) => {
      this.held.delete(e.key.toLowerCase());
      this.shift = e.shiftKey;
    });
    window.addEventListener("blur", () => this.held.clear());
  }

  private typing(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }

  private down(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey || this.typing(e) || !this.enabled()) return;
    const k = e.key.toLowerCase();
    this.shift = e.shiftKey;
    if (KEYS.includes(k)) {
      this.held.add(k);
      if (k.startsWith("arrow")) e.preventDefault();
    }
    if (e.repeat) return;
    const c = this.c;
    if (k === "f" && c.flaps < this.maxFlap) {
      c.flaps = Math.round(c.flaps) + 1;
      this.onChange?.("flaps");
    }
    if (k === "r" && c.flaps > 0) {
      c.flaps = Math.round(c.flaps) - 1;
      this.onChange?.("flaps");
    }
    if (k === "p") {
      c.switches.parkBrake = !c.switches.parkBrake;
      this.onChange?.("park");
    }
    if (k === "w" && e.shiftKey) c.throttle = 1;
    if (k === "s" && e.shiftKey) c.throttle = 0;
  }

  /** Moves the yoke, rudder, throttle and trim towards the keys held. Call every frame. */
  update(dt: number) {
    const c = this.c;
    const h = this.held;
    const on = this.enabled();
    const axis = (neg: string, pos: string) => (on ? (h.has(pos) ? 1 : 0) - (h.has(neg) ? 1 : 0) : 0);
    const reach = this.shift ? 1 : 0.5;
    // Springy yoke and rudder: move towards the key, back to the middle when let go.
    const spring = (v: number, want: number, rate: number) => {
      const target = want * reach;
      const r = want === 0 ? rate * 1.6 : rate;
      return v + Math.max(-r * dt, Math.min(r * dt, target - v));
    };
    c.pitch = spring(c.pitch, axis("arrowup", "arrowdown"), 1.2);
    c.roll = spring(c.roll, axis("arrowleft", "arrowright"), 1.6);
    c.yaw = spring(c.yaw, axis("a", "d"), 2.5);
    if (on) {
      const thr = axis("s", "w");
      if (thr && !this.shift) c.throttle = Math.max(0, Math.min(1, c.throttle + thr * 0.35 * dt));
      const trim = axis("q", "e");
      if (trim) c.trim = Math.max(-1, Math.min(1, c.trim + trim * 0.3 * dt));
      c.brakes = h.has("b") ? 1 : 0;
    }
  }

  /** Which keys are held, for the on-screen key card. */
  isHeld(k: string) {
    return this.held.has(k);
  }
}
