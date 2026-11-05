// Pedestal controls on the 2D panel: gear lever, autobrake, flap lever, speedbrake (with ground
// spoiler ARM), thrust levers with detents, engine master switches, engine mode selector, parking
// brake, rudder trim, pitch trim wheel, nosewheel tiller and toe brakes.
// Click to operate. The keyboard keys do the same things.
import type { A320Extras, Controls, SimState } from "../sim/types";
import { thsText } from "./ecam";

/** Thrust lever detents (lever position 0 to 1). */
export const DETENT = { CL: 0.75, FLX: 0.88, TOGA: 1 };

const FLAP_LABEL = ["0", "1", "2", "3", "FULL"];

export class LeverPanel {
  readonly el: HTMLElement;
  private gearBtn: HTMLButtonElement;
  private gearLights: HTMLElement;
  private flapBtns: HTMLButtonElement[] = [];
  private sbBtn: HTMLButtonElement;
  private thrFill: HTMLElement;
  private thrText: HTMLElement;
  private brake: HTMLElement;
  private master: HTMLButtonElement[] = [];
  private modeBtns: HTMLButtonElement[] = [];
  private parkBtn: HTMLButtonElement;
  private engLights: HTMLElement[] = [];
  private sbBtns: HTMLButtonElement[] = [];
  private abBtns: HTMLButtonElement[] = [];
  private rudText!: HTMLElement;
  private thsText!: HTMLElement;

  constructor(parent: HTMLElement, controls: Controls) {
    this.el = document.createElement("div");
    this.el.id = "levers";
    parent.appendChild(this.el);

    // Gear lever and the three green / red gear lights.
    const gear = section("GEAR");
    this.gearLights = document.createElement("div");
    this.gearLights.className = "gear-lights";
    this.gearLights.innerHTML = "<i></i><i></i><i></i>";
    this.gearBtn = document.createElement("button");
    this.gearBtn.className = "gear-lever";
    this.gearBtn.dataset.ctl = "gear";
    this.gearBtn.title = "Gear lever (G)";
    this.gearBtn.addEventListener("click", () => {
      controls.gearDown = !controls.gearDown;
      this.gearBtn.blur();
    });
    gear.append(this.gearLights, this.gearBtn);

    // Flap lever: one button per detent.
    const flaps = section("FLAPS");
    const row = document.createElement("div");
    row.className = "flap-row";
    FLAP_LABEL.forEach((label, i) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.title = "Flap lever (F / R)";
      b.dataset.ctl = `flaps${i}`;
      b.addEventListener("click", () => {
        controls.flapLever = i;
        b.blur();
      });
      this.flapBtns.push(b);
      row.appendChild(b);
    });
    flaps.appendChild(row);

    // Speedbrake: RET, ARM (ground spoilers armed for take-off and landing), FULL.
    const x = () => controls.extras as A320Extras;
    const sb = section("SPEED BRAKE");
    this.sbBtn = document.createElement("button");
    const sbRow = row3([
      ["RET", "spd-ret", () => ((controls.speedbrake = 0), (x().spoilersArmed = false))],
      ["ARM", "spd-arm", () => ((controls.speedbrake = 0), (x().spoilersArmed = true))],
      ["FULL", "spd-full", () => ((controls.speedbrake = 1), (x().spoilersArmed = false))],
    ]);
    this.sbBtns = [...sbRow.querySelectorAll("button")] as HTMLButtonElement[];
    sb.appendChild(sbRow);

    // Autobrake (on the main panel in the aircraft).
    const ab = section("AUTO BRK");
    const abRow = row3(
      (["LO", "MED", "MAX"] as const).map((m) => [m, `abrk-${m}`, () => (x().autobrake = x().autobrake === m ? "OFF" : m)] as [string, string, () => void]),
    );
    this.abBtns = [...abRow.querySelectorAll("button")] as HTMLButtonElement[];
    ab.appendChild(abRow);

    // Rudder trim and pitch trim.
    const trims = section("RUD TRIM");
    this.rudText = document.createElement("div");
    this.rudText.className = "trim-text";
    trims.dataset.ctl = "rud-trim";
    trims.append(
      this.rudText,
      row3([
        ["◀ L", "rud-left", () => (x().rudderTrim = Math.max(-20, Math.round((x().rudderTrim - 0.5) * 10) / 10))],
        ["RESET", "rud-reset", () => (x().rudderTrim = 0)],
        ["R ▶", "rud-right", () => (x().rudderTrim = Math.min(20, Math.round((x().rudderTrim + 0.5) * 10) / 10))],
      ]),
    );
    const pitch = section("PITCH TRIM");
    pitch.dataset.ctl = "pitch-trim";
    this.thsText = document.createElement("div");
    this.thsText.className = "trim-text";
    pitch.append(
      this.thsText,
      row3([
        ["NOSE DN", "ths-dn", () => (x().ths = Math.max(-4, Math.round((x().ths - 0.1) * 10) / 10))],
        ["0", "ths-zero", () => (x().ths = 0)],
        ["NOSE UP", "ths-up", () => (x().ths = Math.min(13, Math.round((x().ths + 0.1) * 10) / 10))],
      ]),
    );

    // Tiller and toe brakes: hold to use.
    const taxi = section("TILLER AND BRAKES");
    const hold = (label: string, ctl: string, down: () => void, up: () => void) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.ctl = ctl;
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        down();
      });
      for (const ev of ["pointerup", "pointerleave"]) b.addEventListener(ev, up);
      return b;
    };
    const tillerRow = document.createElement("div");
    tillerRow.className = "flap-row";
    tillerRow.append(
      hold("◀ TILLER", "tiller-left", () => (controls.yaw = -1), () => (controls.yaw = 0)),
      hold("TILLER ▶", "tiller-right", () => (controls.yaw = 1), () => (controls.yaw = 0)),
    );
    const brakeBtn = hold("BRAKES (hold)", "brakes", () => (controls.brakes = 1), () => (controls.brakes = 0));
    brakeBtn.className = "gear-lever";
    taxi.append(tillerRow, brakeBtn);

    // Thrust levers (shown, moved with = and -).
    const thr = section("THRUST LEVERS");
    const bar = document.createElement("div");
    bar.className = "thr-bar";
    bar.dataset.ctl = "thrust";
    this.thrFill = document.createElement("div");
    bar.appendChild(this.thrFill);
    this.thrText = document.createElement("span");
    this.brake = document.createElement("span");
    this.brake.className = "brake";
    const thrBtns = document.createElement("div");
    thrBtns.className = "flap-row";
    thrBtns.style.marginTop = "4px";
    for (const [label, fn, ctl] of [
      ["IDLE", () => (controls.throttle = 0), "thr-idle"],
      ["−", () => (controls.throttle = Math.max(0, Math.round((controls.throttle - 0.05) * 100) / 100)), "thr-down"],
      ["+", () => (controls.throttle = Math.min(1, Math.round((controls.throttle + 0.05) * 100) / 100)), "thr-up"],
    ] as [string, () => void, string][]) {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.ctl = ctl;
      b.addEventListener("click", () => {
        fn();
        b.blur();
      });
      thrBtns.appendChild(b);
    }
    const detents = row3([
      ["CL", "thr-cl", () => (controls.throttle = DETENT.CL)],
      ["FLX/MCT", "thr-flx", () => (controls.throttle = DETENT.FLX)],
      ["TOGA", "thr-toga", () => (controls.throttle = DETENT.TOGA)],
    ]);
    detents.style.marginTop = "4px";
    thr.append(bar, this.thrText, this.brake, thrBtns, detents);

    // Engine master switches and mode selector.
    const eng = section("ENGINES");
    const masters = document.createElement("div");
    masters.className = "flap-row";
    for (const i of [1, 2]) {
      const b = document.createElement("button");
      b.dataset.ctl = `engMaster${i}`;
      b.title = `ENG ${i} MASTER`;
      b.addEventListener("click", () => {
        const sw = controls.switches;
        if (i === 1) sw.engMaster1 = !sw.engMaster1;
        else sw.engMaster2 = !sw.engMaster2;
        b.blur();
      });
      const light = document.createElement("i");
      light.className = "eng-light";
      this.engLights.push(light);
      b.append(light, document.createTextNode(`ENG ${i}`));
      this.master.push(b);
      masters.appendChild(b);
    }
    const modes = document.createElement("div");
    modes.className = "flap-row";
    modes.style.marginTop = "4px";
    for (const [mode, label] of [
      ["NORM", "NORM"],
      ["IGN", "IGN/START"],
    ] as const) {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.ctl = mode === "IGN" ? "engModeIgn" : "engModeNorm";
      b.title = "ENG MODE selector";
      b.addEventListener("click", () => {
        controls.switches.engMode = mode;
        b.blur();
      });
      this.modeBtns.push(b);
      modes.appendChild(b);
    }
    eng.append(masters, modes);

    const park = section("PARKING BRAKE");
    this.parkBtn = document.createElement("button");
    this.parkBtn.dataset.ctl = "parkBrake";
    this.parkBtn.title = "Parking brake (B)";
    this.parkBtn.addEventListener("click", () => {
      controls.switches.parkBrake = !controls.switches.parkBrake;
      this.parkBtn.blur();
    });
    park.appendChild(this.parkBtn);

    const col1 = document.createElement("div");
    col1.className = "lever-col";
    col1.append(gear, ab, flaps, sb);
    const col2 = document.createElement("div");
    col2.className = "lever-col";
    col2.append(eng, park, thr);
    const col3 = document.createElement("div");
    col3.className = "lever-col";
    col3.append(trims, pitch, taxi);
    this.el.append(col1, col2, col3);

    function row3(items: [string, string, () => void][]) {
      const r = document.createElement("div");
      r.className = "flap-row";
      for (const [label, ctl, fn] of items) {
        const b = document.createElement("button");
        b.textContent = label;
        b.dataset.ctl = ctl;
        b.addEventListener("click", () => {
          fn();
          b.blur();
        });
        r.appendChild(b);
      }
      return r;
    }

    function section(title: string) {
      const d = document.createElement("div");
      d.className = "lever-section";
      d.innerHTML = `<div class="lever-title">${title}</div>`;
      return d;
    }
  }

  update(s: SimState, c: Controls) {
    this.gearBtn.textContent = c.gearDown ? "DOWN" : "UP";
    this.gearBtn.classList.toggle("down", c.gearDown);
    const state = s.gearPos > 0.99 ? "down" : s.gearPos < 0.01 ? "up" : "moving";
    this.gearLights.className = `gear-lights ${state}`;
    this.flapBtns.forEach((b, i) => b.classList.toggle("on", i === c.flapLever));
    const x = c.extras;
    if (x) {
      const sbState = c.speedbrake > 0 ? 2 : x.spoilersArmed ? 1 : 0;
      this.sbBtns.forEach((b, i) => b.classList.toggle("on", i === sbState));
      this.abBtns.forEach((b) => b.classList.toggle("on", b.textContent === x.autobrake));
      const r = x.rudderTrim;
      this.rudText.textContent = Math.abs(r) < 0.05 ? "0.0" : `${r < 0 ? "L" : "R"} ${Math.abs(r).toFixed(1)}`;
      this.thsText.textContent = thsText(x.ths);
    }
    this.thrFill.style.height = `${Math.round(c.throttle * 100)}%`;
    this.thrText.textContent = `${Math.round(c.throttle * 100)}%${s.fcc.athr ? " A/THR" : ""}`;
    this.brake.textContent = c.brakes > 0 ? "BRAKES ON" : "";
    const sw = c.switches;
    [sw.engMaster1, sw.engMaster2].forEach((on, i) => {
      this.master[i].lastChild!.textContent = `ENG ${i + 1} ${on ? "ON" : "OFF"}`;
      this.master[i].classList.toggle("on", on);
      const e = s.systems.engines[i];
      this.engLights[i].className = `eng-light ${e.phase === "CRANK" || e.phase === "LIGHT" ? "starting" : ""}`;
    });
    this.modeBtns[0].classList.toggle("on", sw.engMode === "NORM");
    this.modeBtns[1].classList.toggle("on", sw.engMode === "IGN");
    this.parkBtn.textContent = sw.parkBrake ? "SET (ON)" : "RELEASED";
    this.parkBtn.classList.toggle("on", sw.parkBrake);
  }
}
