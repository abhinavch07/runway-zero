// A320 radio management panel (VHF 1 only) and ATC transponder panel, on the pedestal.
import type { A320Extras } from "../sim/types";
import { freqText, tune } from "../radio/training";

export class RadioPanels {
  readonly el: HTMLElement;
  private x: () => A320Extras;
  private typing = "";
  private act: HTMLElement;
  private stby: HTMLElement;
  private code: HTMLElement;

  constructor(parent: HTMLElement, extras: () => A320Extras) {
    this.x = extras;
    this.el = document.createElement("div");
    this.el.id = "radio-panels";
    this.el.innerHTML = `
      <section class="lever-section" data-ctl="rmp">
        <div class="sec-title">RMP · VHF 1</div>
        <div class="rmp-row">
          <span class="rmp-win act" data-rmp="act"></span>
          <button data-ctl="rmp-swap" data-r="swap" title="Transfer standby to active">⇆</button>
          <span class="rmp-win stby" data-rmp="stby"></span>
        </div>
        <div class="rmp-row">
          <span class="rmp-lbl">MHz</span><button data-r="mhz-down">−</button><button data-r="mhz-up">+</button>
          <span class="rmp-lbl">kHz</span><button data-r="khz-down" title="Shift: bigger steps">−</button><button data-r="khz-up" title="Shift: bigger steps">+</button>
        </div>
      </section>
      <section class="lever-section" data-ctl="atc">
        <div class="sec-title">ATC (TRANSPONDER)</div>
        <div class="rmp-row"><span class="rmp-win code" data-rmp="code"></span>
          ${["STBY", "AUTO", "ON"].map((m) => `<button data-xm="${m}" data-ctl="atc-${m}">${m}</button>`).join("")}
        </div>
        <div class="rmp-row keys">${[0, 1, 2, 3, 4, 5, 6, 7].map((d) => `<button data-xd="${d}">${d}</button>`).join("")}<button data-xd="clr">CLR</button></div>
      </section>`;
    parent.appendChild(this.el);
    this.act = this.el.querySelector("[data-rmp=act]")!;
    this.stby = this.el.querySelector("[data-rmp=stby]")!;
    this.code = this.el.querySelector("[data-rmp=code]")!;
    this.el.querySelectorAll<HTMLElement>("[data-r]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const x = this.x();
        const r = b.dataset.r!;
        if (r === "swap") [x.vhf1[0], x.vhf1[1]] = [x.vhf1[1], x.vhf1[0]];
        else {
          const [unit, dir] = r.split("-");
          const steps = unit === "khz" && (e as MouseEvent).shiftKey ? 4 : 1;
          for (let i = 0; i < steps; i++) x.vhf1[1] = tune(x.vhf1[1], "com", unit === "mhz", dir === "up" ? 1 : -1);
        }
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-xd]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.xd === "clr") this.typing = "";
        else {
          this.typing += b.dataset.xd;
          if (this.typing.length === 4) {
            this.x().xpdrCode = this.typing;
            this.typing = "";
          }
        }
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-xm]").forEach((b) =>
      b.addEventListener("click", () => {
        this.x().xpdrMode = b.dataset.xm as A320Extras["xpdrMode"];
        b.blur();
      }),
    );
  }

  reset() {
    this.typing = "";
  }

  update(powered: boolean) {
    const x = this.x();
    this.act.textContent = powered ? freqText(x.vhf1[0]) : "";
    this.stby.textContent = powered ? freqText(x.vhf1[1]) : "";
    this.code.textContent = powered ? (this.typing ? this.typing.padEnd(4, "_") : x.xpdrCode) : "";
    this.el.querySelectorAll<HTMLElement>("[data-xm]").forEach((b) => b.classList.toggle("on", b.dataset.xm === x.xpdrMode));
  }
}
