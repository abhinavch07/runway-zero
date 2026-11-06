// Light aircraft lower panel (C172 or PA-28): master and avionics switches, the switch row, the
// magneto key, fuel selector (and the C172 shutoff or the PA-28 primer), throttle, mixture, flaps,
// trim, parking brake, and a small engine readout.
import type { C172Controls, C172State, C172Switches, FuelSel, MagPos } from "../sim/types";
import type { GaVariant } from "../sim/variant";

type Toggle = keyof Pick<
  C172Switches,
  "masterBat" | "masterAlt" | "stbyBatt" | "avionics" | "fuelPump" | "beacon" | "landing" | "taxi" | "nav" | "strobe" | "pitotHeat" | "parkBrake" | "fuelShutoff"
>;

const SWITCH_ROW: [Toggle, string][] = [
  ["fuelPump", "FUEL PUMP"],
  ["beacon", "BEACON"],
  ["landing", "LAND"],
  ["taxi", "TAXI"],
  ["nav", "NAV"],
  ["strobe", "STROBE"],
  ["pitotHeat", "PITOT HEAT"],
];

export class C172LowerPanel {
  readonly el: HTMLElement;
  private c: C172Controls;

  constructor(parent: HTMLElement, controls: C172Controls, v: GaVariant) {
    this.c = controls;
    this.el = document.createElement("div");
    this.el.id = "c172-lower";
    const sw = (key: Toggle, label: string, cls = "") =>
      `<button class="c-sw ${cls}" data-ctl="${key}" data-sw="${key}"><i></i><span>${label}</span></button>`;
    this.el.innerHTML = `
      <div class="c-row">
        <section class="c-box">
          <div class="c-title">MASTER</div>
          <div class="c-master">${sw("masterAlt", "ALT", "rocker")}${sw("masterBat", "BAT", "rocker")}</div>
          ${v.stbyBatt ? `<div class="c-title">STBY BATT</div>${sw("stbyBatt", "ARM")}` : ""}
        </section>
        <section class="c-box">
          <div class="c-title">MAGNETOS</div>
          <div class="c-key">${(["OFF", "R", "L", "BOTH", "START"] as MagPos[])
            .map((m) => `<button data-ctl="mag-${m}" data-mag="${m}">${m}</button>`)
            .join("")}</div>
          <div class="c-hint">Hold START, let go when the engine runs.</div>
        </section>
        <section class="c-box">
          <div class="c-title">AVIONICS</div>
          ${sw("avionics", "BUS 1 / BUS 2")}
          <div class="c-title">PARKING BRAKE</div>
          ${sw("parkBrake", "SET")}
        </section>
        <section class="c-box c-mini">
          <div class="c-title">ENGINE</div>
          <div data-ctl="mini-rpm"><span>RPM</span><b data-mini="rpm"></b></div>
          <div data-ctl="mini-oil"><span>OIL PSI</span><b data-mini="oil"></b></div>
          <div data-ctl="mini-volts"><span>BUS V</span><b data-mini="volts"></b></div>
          <div data-ctl="mini-amps"><span>BATT A</span><b data-mini="amps"></b></div>
          ${v.primer ? `<div data-ctl="mini-fuelpress"><span>FUEL PSI</span><b data-mini="fuelpress"></b></div>` : ""}
        </section>
      </div>
      <section class="c-box c-switchrow">${SWITCH_ROW.map(([k, l]) => sw(k, l)).join("")}</section>
      <div class="c-row">
        <section class="c-box c-lever" data-ctl="throttle">
          <div class="c-title">THROTTLE</div>
          <div class="c-bar"><i data-bar="throttle"></i></div>
          <div class="c-val" data-val="throttle"></div>
          <div class="c-btns">
            <button data-lever="throttle" data-set="0">IDLE</button>
            <button data-lever="throttle" data-step="-0.02" title="Shift: big step">−</button>
            <button data-lever="throttle" data-step="0.02" title="Shift: big step">+</button>
            <button data-lever="throttle" data-set="1">FULL</button>
          </div>
        </section>
        <section class="c-box c-lever mix" data-ctl="mixture">
          <div class="c-title">MIXTURE</div>
          <div class="c-bar"><i data-bar="mixture"></i></div>
          <div class="c-val" data-val="mixture"></div>
          <div class="c-btns">
            <button data-lever="mixture" data-set="0">CUT-OFF</button>
            <button data-lever="mixture" data-step="-0.1">−</button>
            <button data-lever="mixture" data-step="0.1">+</button>
            <button data-lever="mixture" data-set="1">RICH</button>
          </div>
        </section>
        <section class="c-box">
          <div class="c-title">FUEL SELECTOR</div>
          <div class="c-seg">${v.fuelSel
            .map((f) => `<button data-ctl="fuelSel-${f}" data-fuel="${f}">${f}</button>`)
            .join("")}</div>
          ${
            v.fuelShutoff
              ? `<div class="c-title">FUEL SHUTOFF</div>${sw("fuelShutoff", "ON (pushed in)", "red")}`
              : `<div class="c-title">PRIMER</div><button class="c-prime" data-ctl="primer" data-prime>PUMP ONCE <b data-strokes></b></button>`
          }
        </section>
        <section class="c-box">
          <div class="c-title">FLAPS</div>
          <div class="c-seg">${v.flapDeg
            .map((d, f) => `<button data-ctl="flaps${f}" data-flaps="${f}">${d}°</button>`)
            .join("")}</div>
          <div class="c-title">TRIM</div>
          <div class="c-trim" data-ctl="trim">
            <button data-trim="-0.05">NOSE DN</button>
            <div class="c-trimind"><span class="to">TAKEOFF</span><i data-trimind></i></div>
            <button data-trim="0.05">NOSE UP</button>
          </div>
        </section>
      </div>`;
    parent.appendChild(this.el);

    const blur = (e: Event) => (e.currentTarget as HTMLElement).blur();
    this.el.querySelectorAll<HTMLElement>("[data-sw]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const k = b.dataset.sw as Toggle;
        this.c.switches[k] = !this.c.switches[k];
        blur(e);
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-mag]").forEach((b) => {
      const m = b.dataset.mag as MagPos;
      if (m === "START") {
        // Spring-loaded: START only while held, then back to BOTH.
        const release = () => {
          if (this.c.switches.magnetos === "START") this.c.switches.magnetos = "BOTH";
        };
        b.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          this.c.switches.magnetos = "START";
        });
        b.addEventListener("pointerup", release);
        b.addEventListener("pointerleave", release);
        window.addEventListener("pointerup", release);
      } else {
        b.addEventListener("click", (e) => {
          this.c.switches.magnetos = m;
          blur(e);
        });
      }
    });
    this.el.querySelectorAll<HTMLElement>("[data-fuel]").forEach((b) =>
      b.addEventListener("click", (e) => {
        this.c.switches.fuelSel = b.dataset.fuel as FuelSel;
        blur(e);
      }),
    );
    this.el.querySelector<HTMLElement>("[data-prime]")?.addEventListener("click", (e) => {
      this.c.primeStrokes = (this.c.primeStrokes ?? 0) + 1;
      blur(e);
    });
    this.el.querySelectorAll<HTMLElement>("[data-flaps]").forEach((b) =>
      b.addEventListener("click", (e) => {
        this.c.flaps = Number(b.dataset.flaps);
        blur(e);
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-trim]").forEach((b) =>
      b.addEventListener("click", (e) => {
        this.c.trim = clamp(round(this.c.trim + Number(b.dataset.trim)), -1, 1);
        blur(e);
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-lever]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const lever = b.dataset.lever as "throttle" | "mixture";
        if (b.dataset.set !== undefined) this.c[lever] = Number(b.dataset.set);
        else {
          const step = Number(b.dataset.step) * ((e as MouseEvent).shiftKey ? 5 : 1);
          this.c[lever] = clamp(round(this.c[lever] + step), 0, 1);
        }
        blur(e);
      }),
    );
  }

  update(s: C172State | null, c: C172Controls) {
    const sw = c.switches;
    this.el.querySelectorAll<HTMLElement>("[data-sw]").forEach((b) => b.classList.toggle("on", !!sw[b.dataset.sw as Toggle]));
    this.el.querySelectorAll<HTMLElement>("[data-mag]").forEach((b) => b.classList.toggle("on", b.dataset.mag === sw.magnetos));
    this.el.querySelectorAll<HTMLElement>("[data-fuel]").forEach((b) => b.classList.toggle("on", b.dataset.fuel === sw.fuelSel));
    this.el.querySelectorAll<HTMLElement>("[data-flaps]").forEach((b) => b.classList.toggle("on", Number(b.dataset.flaps) === c.flaps));
    for (const lever of ["throttle", "mixture"] as const) {
      (this.el.querySelector(`[data-bar=${lever}]`) as HTMLElement).style.height = `${c[lever] * 100}%`;
      (this.el.querySelector(`[data-val=${lever}]`) as HTMLElement).textContent =
        lever === "mixture" && c.mixture < 0.02 ? "IDLE CUT-OFF" : `${Math.round(c[lever] * 100)}%`;
    }
    (this.el.querySelector("[data-trimind]") as HTMLElement).style.left = `${50 + c.trim * 45}%`;
    const shut = this.el.querySelector<HTMLElement>("[data-sw=fuelShutoff] span");
    if (shut) shut.textContent = sw.fuelShutoff ? "ON (pushed in)" : "OFF (pulled out)";
    const strokes = this.el.querySelector<HTMLElement>("[data-strokes]");
    if (strokes) strokes.textContent = c.primeStrokes ? `(${c.primeStrokes})` : "";
    const mini = (k: string, t: string) => ((this.el.querySelector(`[data-mini=${k}]`) as HTMLElement).textContent = t);
    if (s) {
      mini("rpm", String(Math.round(s.engine.rpm / 10) * 10));
      mini("oil", String(Math.round(s.engine.oilPressPsi)));
      mini("volts", s.elec.mainBus ? s.elec.mainVolts.toFixed(1) : "--");
      mini("amps", s.elec.mainBus ? (s.elec.mainAmps > 0 ? "+" : "") + s.elec.mainAmps.toFixed(0) : "--");
      if (this.el.querySelector("[data-mini=fuelpress]")) mini("fuelpress", s.fuelPressPsi.toFixed(1));
    }
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = (v: number) => Math.round(v * 100) / 100;
