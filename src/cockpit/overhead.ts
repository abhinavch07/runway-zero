// Overhead panel (2D), simplified: ADIRS, ELEC, FUEL, AIR, APU, exterior lights and signs.
// Pushbuttons follow the "dark cockpit" idea: no light means normal. A white OFF light means switched
// off, blue ON means switched on (for buttons that are normally off), green AVAIL means ready.
import type { Switches, SystemsStatus } from "../sim/systems";

type BoolKey = { [K in keyof Switches]: Switches[K] extends boolean ? K : never }[keyof Switches];

interface Pb {
  key: BoolKey | "apuStart";
  label: string;
  /** Which light shows when the switch is in its "on" position: none, or a blue ON. */
  onLight: boolean;
  /** Which light shows when the switch is off: a white OFF, or none. */
  offLight: boolean;
}

const SECTIONS: { title: string; cols: number; items: (Pb | { key: "sep" } | { key: "volts" } | { key: "irInfo" })[] }[] = [
  {
    title: "ADIRS",
    cols: 3,
    items: [
      { key: "ir1", label: "IR 1", onLight: false, offLight: true },
      { key: "ir3", label: "IR 3", onLight: false, offLight: true },
      { key: "ir2", label: "IR 2", onLight: false, offLight: true },
      { key: "irInfo" },
    ],
  },
  {
    title: "ELEC",
    cols: 4,
    items: [
      { key: "bat1", label: "BAT 1", onLight: false, offLight: true },
      { key: "bat2", label: "BAT 2", onLight: false, offLight: true },
      { key: "volts" },
      { key: "sep" },
      { key: "extPwr", label: "EXT PWR", onLight: true, offLight: false },
      { key: "apuGen", label: "APU GEN", onLight: false, offLight: true },
      { key: "gen1", label: "GEN 1", onLight: false, offLight: true },
      { key: "gen2", label: "GEN 2", onLight: false, offLight: true },
    ],
  },
  {
    title: "FUEL",
    cols: 4,
    items: [
      { key: "fuelL1", label: "L TK 1", onLight: false, offLight: true },
      { key: "fuelL2", label: "L TK 2", onLight: false, offLight: true },
      { key: "fuelR1", label: "R TK 1", onLight: false, offLight: true },
      { key: "fuelR2", label: "R TK 2", onLight: false, offLight: true },
    ],
  },
  {
    title: "AIR",
    cols: 5,
    items: [
      { key: "pack1", label: "PACK 1", onLight: false, offLight: true },
      { key: "pack2", label: "PACK 2", onLight: false, offLight: true },
      { key: "engBleed1", label: "ENG 1 BLEED", onLight: false, offLight: true },
      { key: "engBleed2", label: "ENG 2 BLEED", onLight: false, offLight: true },
      { key: "apuBleed", label: "APU BLEED", onLight: true, offLight: false },
    ],
  },
  {
    title: "APU",
    cols: 2,
    items: [
      { key: "apuMaster", label: "MASTER SW", onLight: true, offLight: false },
      { key: "apuStart", label: "START", onLight: true, offLight: false },
    ],
  },
  {
    title: "EXT LT / SIGNS",
    cols: 3,
    items: [
      { key: "beacon", label: "BEACON", onLight: true, offLight: false },
      { key: "navLights", label: "NAV", onLight: true, offLight: false },
      { key: "strobe", label: "STROBE", onLight: true, offLight: false },
      { key: "landingLights", label: "LAND", onLight: true, offLight: false },
      { key: "taxiLight", label: "TAXI", onLight: true, offLight: false },
      { key: "seatBelts", label: "SEAT BELTS", onLight: true, offLight: false },
    ],
  },
];

export class OverheadPanel {
  readonly el: HTMLElement;
  private inner: HTMLElement;
  private buttons = new Map<string, { top: HTMLElement; bottom: HTMLElement; btn: HTMLElement }>();
  private volts!: HTMLElement;
  private irInfo!: HTMLElement;
  private getSwitches: () => Switches;

  constructor(parent: HTMLElement, getSwitches: () => Switches) {
    this.getSwitches = getSwitches;
    this.el = document.createElement("div");
    this.el.id = "overhead";
    parent.appendChild(this.el);
    this.inner = document.createElement("div");
    this.inner.className = "ovhd-inner";
    this.el.appendChild(this.inner);

    for (const sec of SECTIONS) {
      const box = document.createElement("div");
      box.className = "ovhd-section";
      box.innerHTML = `<div class="ovhd-title">${sec.title}</div>`;
      const grid = document.createElement("div");
      grid.className = "ovhd-grid";
      grid.style.width = `${sec.cols * 46}px`;
      for (const item of sec.items) {
        if (item.key === "sep") {
          grid.appendChild(Object.assign(document.createElement("div"), { className: "ovhd-sep" }));
          continue;
        }
        if (item.key === "volts") {
          this.volts = Object.assign(document.createElement("div"), { className: "ovhd-readout" });
          grid.appendChild(this.volts);
          continue;
        }
        if (item.key === "irInfo") {
          this.irInfo = Object.assign(document.createElement("div"), { className: "ovhd-readout" });
          grid.appendChild(this.irInfo);
          continue;
        }
        const pb = item as Pb;
        const wrap = document.createElement("div");
        wrap.className = "pb-wrap";
        const btn = document.createElement("button");
        btn.className = "pb";
        btn.dataset.ctl = pb.key;
        const top = document.createElement("span");
        top.className = "pb-top";
        const bottom = document.createElement("span");
        bottom.className = "pb-bottom";
        btn.append(top, bottom);
        btn.addEventListener("click", () => {
          const sw = this.getSwitches();
          if (pb.key === "apuStart") sw.apuStartPresses++;
          else sw[pb.key] = !sw[pb.key];
          btn.blur();
        });
        const label = document.createElement("div");
        label.className = "pb-label";
        label.textContent = pb.label;
        wrap.append(btn, label);
        grid.appendChild(wrap);
        this.buttons.set(pb.key, { top, bottom, btn });
      }
      box.appendChild(grid);
      this.inner.appendChild(box);
    }
  }

  /** Shrinks the panel contents to fit the space they have. Call after the page layout changes. */
  fit() {
    this.inner.style.zoom = "1";
    const box = this.el.getBoundingClientRect();
    if (box.width === 0) return;
    const need = { w: this.inner.scrollWidth, h: this.inner.scrollHeight };
    const zoom = Math.min(1.8, (box.width - 22) / need.w, (box.height - 22) / need.h);
    this.inner.style.zoom = String(Math.max(0.5, zoom));
  }

  update(sw: Switches, sys: SystemsStatus) {
    const lit = sys.dcPower; // annunciator lights need power
    const set = (key: string, top: [string, string] | null, bottom: [string, string] | null) => {
      const b = this.buttons.get(key);
      if (!b) return;
      b.top.textContent = lit && top ? top[0] : "";
      b.top.className = `pb-top ${lit && top ? top[1] : ""}`;
      b.bottom.textContent = lit && bottom ? bottom[0] : "";
      b.bottom.className = `pb-bottom ${lit && bottom ? bottom[1] : ""}`;
    };
    const offLight = (on: boolean) => (on ? null : (["OFF", "white"] as [string, string]));
    const onLight = (on: boolean) => (on ? (["ON", "blue"] as [string, string]) : null);

    for (const sec of SECTIONS) {
      for (const item of sec.items) {
        if (!("label" in item)) continue;
        if (item.key === "apuStart") continue;
        const on = sw[item.key] as boolean;
        if (item.key === "extPwr") {
          set("extPwr", sys.extPwrAvail && !on ? ["AVAIL", "green"] : null, onLight(on));
        } else if (item.key === "apuMaster") {
          set("apuMaster", null, onLight(on));
        } else if (item.key.startsWith("ir")) {
          const i = Number(item.key.slice(2)) - 1;
          set(item.key, sys.irAligning[i] ? ["ALIGN", "white"] : null, offLight(on));
        } else if (item.key.startsWith("fuel")) {
          const side = item.key.startsWith("fuelL") ? sys.fuelPressL : sys.fuelPressR;
          set(item.key, on && !side ? ["FAULT", "amber"] : null, offLight(on));
        } else {
          set(item.key, null, item.offLight ? offLight(on) : item.onLight ? onLight(on) : null);
        }
      }
    }
    set("apuStart", sys.apuAvail ? ["AVAIL", "green"] : null, sys.apuStarting ? ["ON", "blue"] : null);

    this.volts.textContent = lit ? `BAT ${sys.batVolts[0].toFixed(1)} V / ${sys.batVolts[1].toFixed(1)} V` : "";
    this.irInfo.textContent = !lit
      ? ""
      : sys.irAligned.every(Boolean)
        ? "ALIGNED"
        : sys.irSecondsLeft > 0
          ? `ALIGNING ${sys.irSecondsLeft} s`
          : "IR OFF";
  }
}
