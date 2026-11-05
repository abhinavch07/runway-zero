// Pedestal controls on the 2D panel: gear lever, flap lever, speedbrake and thrust levers.
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
    this.thrFill = document.createElement("div");
    bar.appendChild(this.thrFill);
    this.thrText = document.createElement("span");
    this.brake = document.createElement("span");
    this.brake.className = "brake";
    thr.append(bar, this.thrText, this.brake);

    this.el.append(gear, flaps, sb, thr);

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
  }
}
