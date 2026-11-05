// Guided cold and dark start up. Each step ticks itself off when the aircraft is in the right state,
// and the control for the next step is highlighted on the panel.
//
// Written in our own words as a simplified training flow for the A320 family. It is not an airline
// or manufacturer procedure. Real crews follow their operator's approved checklists.
import type { Controls, SimState } from "../sim/types";

export type PanelName = "main" | "ovhd";

interface Step {
  title: string;
  why: string;
  /** Controls to highlight (data-ctl values). */
  targets: string[];
  /** Which panel the controls are on. Pedestal controls are always visible. */
  panel: PanelName | "ped";
  done: (s: SimState, c: Controls) => boolean;
}

const STEPS: Step[] = [
  {
    title: "BAT 1 and BAT 2: ON",
    why: "The batteries give DC power. That is enough to light the overhead panel and to start the APU.",
    targets: ["bat1", "bat2"],
    panel: "ovhd",
    done: (_s, c) => c.switches.bat1 && c.switches.bat2,
  },
  {
    title: "EXT PWR: ON",
    why: "Ground power gives AC power, so the screens and fuel pumps work without running the APU yet. Press it when AVAIL shows.",
    targets: ["extPwr"],
    panel: "ovhd",
    done: (s) => s.systems.acPower,
  },
  {
    title: "ADIRS: IR 1, IR 3, IR 2 to NAV",
    why: "The inertial references must align before the aircraft knows its attitude and heading. Do not move the aircraft while they align. Real alignment takes several minutes. Here it takes 1 minute.",
    targets: ["ir1", "ir3", "ir2"],
    panel: "ovhd",
    done: (_s, c) => c.switches.ir1 && c.switches.ir2 && c.switches.ir3,
  },
  {
    title: "Fuel pumps: all ON",
    why: "The wing tank pumps send fuel to the engines under pressure.",
    targets: ["fuelL1", "fuelL2", "fuelR1", "fuelR2"],
    panel: "ovhd",
    done: (_s, c) => c.switches.fuelL1 && c.switches.fuelL2 && c.switches.fuelR1 && c.switches.fuelR2,
  },
  {
    title: "NAV lights and SEAT BELTS: ON",
    why: "Navigation lights stay on whenever the aircraft is powered. Seat belt signs on before boarding is complete and engines start.",
    targets: ["navLights", "seatBelts"],
    panel: "ovhd",
    done: (_s, c) => c.switches.navLights && c.switches.seatBelts,
  },
  {
    title: "APU MASTER SW: ON",
    why: "Opens the APU air intake flap and powers the APU computer. Wait a few seconds for the flap to open.",
    targets: ["apuMaster"],
    panel: "ovhd",
    done: (_s, c) => c.switches.apuMaster,
  },
  {
    title: "APU START: press, wait for AVAIL",
    why: "The APU is a small jet engine in the tail. Once running it gives electrical power and the air needed to start the main engines. It takes about 45 seconds.",
    targets: ["apuStart"],
    panel: "ovhd",
    done: (s) => s.systems.apuAvail,
  },
  {
    title: "APU BLEED: ON",
    why: "Sends APU air to the engine starters (and to the air conditioning).",
    targets: ["apuBleed"],
    panel: "ovhd",
    done: (_s, c) => c.switches.apuBleed,
  },
  {
    title: "Wait for ADIRS to finish aligning",
    why: "When the ALIGN lights go out the PFD shows attitude and heading. Check the PFD and ND now show normally.",
    targets: ["ir1", "ir2", "ir3"],
    panel: "ovhd",
    done: (s) => s.systems.irAligned.every(Boolean),
  },
  {
    title: "EXT PWR: OFF",
    why: "Ground power is disconnected before the aircraft moves. The APU generator now powers the aircraft.",
    targets: ["extPwr"],
    panel: "ovhd",
    done: (s, c) => !c.switches.extPwr && s.systems.acPower,
  },
  {
    title: "BEACON: ON",
    why: "The red flashing beacon warns ground staff that the engines are about to start.",
    targets: ["beacon"],
    panel: "ovhd",
    done: (_s, c) => c.switches.beacon,
  },
  {
    title: "Parking brake: SET, thrust levers: IDLE",
    why: "The aircraft must not move during engine start.",
    targets: ["parkBrake", "thrust"],
    panel: "ped",
    done: (_s, c) => c.switches.parkBrake && c.throttle < 0.02,
  },
  {
    title: "ENG MODE: IGN/START",
    why: "Arms the automatic start. Nothing happens until an ENG MASTER switch goes ON.",
    targets: ["engModeIgn"],
    panel: "ped",
    done: (_s, c) => c.switches.engMode === "IGN",
  },
  {
    title: "ENG 2 MASTER: ON, wait for it to stabilise",
    why: "Engine 2 is usually started first. Watch the engine display: N2 rises, fuel flows at about 22% N2, EGT rises, then N1 and N2 settle at idle. About 30 seconds.",
    targets: ["engMaster2"],
    panel: "ped",
    done: (s) => s.systems.engines[1].phase === "RUN",
  },
  {
    title: "ENG 1 MASTER: ON, wait for it to stabilise",
    why: "Same sequence for engine 1. Watch EGT and N2 again.",
    targets: ["engMaster1"],
    panel: "ped",
    done: (s) => s.systems.engines[0].phase === "RUN",
  },
  {
    title: "ENG MODE: NORM",
    why: "Both engines are running, so the start system is no longer needed.",
    targets: ["engModeNorm"],
    panel: "ped",
    done: (_s, c) => c.switches.engMode === "NORM",
  },
  {
    title: "APU BLEED: OFF, APU MASTER SW: OFF",
    why: "The engines now give air and electrical power. (Some crews keep the APU running a little longer on hot days.)",
    targets: ["apuBleed", "apuMaster"],
    panel: "ovhd",
    done: (_s, c) => !c.switches.apuBleed && !c.switches.apuMaster,
  },
  {
    title: "Flaps: set for takeoff (1, 2 or 3)",
    why: "Takeoff flaps give extra lift at low speed. Flap 2 is a common choice.",
    targets: ["flaps1", "flaps2", "flaps3"],
    panel: "ped",
    done: (_s, c) => c.flapLever >= 1 && c.flapLever <= 3,
  },
  {
    title: "TAXI light: ON, parking brake: RELEASE",
    why: "Ready to taxi. Add thrust to about 30% (=) until the aircraft rolls, then back to idle (-). Steer with Z / X and turn left onto runway 28. Hold the full stop key to brake. Keep taxi speed below about 20 kt.",
    targets: ["taxiLight", "parkBrake"],
    panel: "ped",
    done: (_s, c) => c.switches.taxiLight && !c.switches.parkBrake,
  },
];

export class GuidedChecklist {
  readonly el: HTMLElement;
  private list: HTMLElement;
  private header: HTMLElement;
  private showPanel: (p: PanelName) => void;
  private getPanel: () => PanelName;
  private lastCurrent = -1;
  /** Steps stay ticked once done, even if a later step undoes them (APU MASTER goes ON, then OFF). */
  private latched: boolean[] = STEPS.map(() => false);
  active = false;

  constructor(parent: HTMLElement, showPanel: (p: PanelName) => void, getPanel: () => PanelName) {
    this.showPanel = showPanel;
    this.getPanel = getPanel;
    this.el = document.createElement("div");
    this.el.id = "checklist";
    this.el.className = "panel hidden";
    this.header = document.createElement("div");
    this.header.className = "cl-header";
    this.list = document.createElement("ol");
    this.el.append(this.header, this.list);
    parent.appendChild(this.el);
    this.list.innerHTML = STEPS.map(
      (st) => `<li><div class="cl-title">${st.title}</div><div class="cl-why">${st.why}</div></li>`,
    ).join("");
  }

  start() {
    this.active = true;
    this.lastCurrent = -1;
    this.latched = STEPS.map(() => false);
    this.el.classList.remove("hidden");
  }

  stop() {
    this.active = false;
    this.el.classList.add("hidden");
    clearHighlights();
  }

  toggle() {
    if (this.active) this.stop();
    else this.start();
  }

  update(s: SimState, c: Controls) {
    if (!this.active) return;
    // Steps are taken in order: a step only counts once all steps before it are done.
    let current = -1;
    for (let i = 0; i < STEPS.length; i++) {
      if (!this.latched[i] && STEPS[i].done(s, c) && (i === 0 || this.latched[i - 1])) this.latched[i] = true;
      if (!this.latched[i]) {
        current = i;
        break;
      }
    }
    const done = this.latched;
    const items = this.list.children;
    for (let i = 0; i < items.length; i++) {
      items[i].className = done[i] ? "done" : i === current ? "current" : "";
    }
    this.header.innerHTML =
      current < 0
        ? `<b>Start up complete.</b> Taxi to runway 28 and line up. Press K to hide this list.`
        : `<b>Cold and dark start up</b> · step ${current + 1} of ${STEPS.length} · K to hide`;

    clearHighlights();
    if (current < 0) return;
    const step = STEPS[current];
    if (current !== this.lastCurrent) {
      this.lastCurrent = current;
      // Bring the right panel up the first time a step needs it, and keep the step in view.
      if (step.panel !== "ped" && this.getPanel() !== step.panel) this.showPanel(step.panel);
      (items[current] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
    for (const t of step.targets) document.querySelectorAll(`[data-ctl="${t}"]`).forEach((el) => el.classList.add("next"));
    if (step.panel !== "ped" && this.getPanel() !== step.panel) {
      document.querySelectorAll(`[data-ctl="tab-${step.panel}"]`).forEach((el) => el.classList.add("next"));
    }
  }
}

function clearHighlights() {
  document.querySelectorAll(".next").forEach((el) => el.classList.remove("next"));
}
