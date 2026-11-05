// Pedestal controls on the 2D panel: gear lever, flap lever, speedbrake, thrust levers,
// engine master switches, engine mode selector and parking brake.
// Click to operate. The keyboard keys do the same things.
import type { Controls, SimState } from "../sim/types";

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

    // Speedbrake.
    const sb = section("SPEED BRAKE");
    this.sbBtn = document.createElement("button");
    this.sbBtn.title = "Speedbrake (/)";
    this.sbBtn.addEventListener("click", () => {
      controls.speedbrake = controls.speedbrake > 0 ? 0 : 1;
      this.sbBtn.blur();
    });
    sb.appendChild(this.sbBtn);

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
    thr.append(bar, this.thrText, this.brake);

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
    col1.append(gear, flaps, sb);
    const col2 = document.createElement("div");
    col2.className = "lever-col";
    col2.append(eng, park, thr);
    this.el.append(col1, col2);

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
    this.sbBtn.textContent = c.speedbrake > 0 ? "EXTENDED" : "RETRACTED";
    this.sbBtn.classList.toggle("on", c.speedbrake > 0);
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
