// Lessons for the procedures trainer. Each step either ticks itself off when the aircraft is in the
// right state, or (manual steps) waits for the learner to press Next after reading.
//
// Written in our own words as simplified training flows for the A320 family, from general public
// knowledge. They are not airline or manufacturer procedures. Real crews follow their operator's
// approved checklists. A type-rated pilot should review these before anyone learns from them.
import type { FcuAction } from "../sim/fcc";
import type { Switches } from "../sim/systems";
import type { Controls, SimState } from "../sim/types";

export type PanelName = "ovhd" | "main" | "ped";

export interface LessonStep {
  title: string;
  why: string;
  /** Controls to highlight (their data-ctl values). */
  targets: string[];
  /** Where the step's switches should end up. Switches already there stop pulsing. */
  want?: boolean;
  /** Panel to show for this step. */
  panel: PanelName;
  /** Ticks the step off when true. Steps without it are manual: the learner presses Next. */
  done?: (s: SimState, c: Controls) => boolean;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  /** Start position id from config.ts. */
  startId: string;
  /** Changes to the starting switch positions. */
  switches?: (sw: Switches) => void;
  /** FCU actions sent once the aircraft is placed (for example engaging the autopilot). */
  fcuActions?: FcuAction[];
  steps: LessonStep[];
  finished: string;
}

const allPumps = (c: Controls) => c.switches.fuelL1 && c.switches.fuelL2 && c.switches.fuelR1 && c.switches.fuelR2;
const noPumps = (c: Controls) => !c.switches.fuelL1 && !c.switches.fuelL2 && !c.switches.fuelR1 && !c.switches.fuelR2;
const angle = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export const LESSONS: Lesson[] = [
  {
    id: "powerup",
    title: "Power up and engine start",
    summary: "From a cold and dark aircraft to both engines running: batteries, ground power, ADIRS, fuel, APU, engine start.",
    minutes: 10,
    startId: "cold28",
    finished: "Both engines are running and the aircraft is ready for taxi. Well done.",
    steps: [
      {
        title: "BAT 1 and BAT 2: ON",
        why: "The batteries give DC power. That is enough to light the overhead panel and to start the APU. Check each shows about 25 V or more.",
        targets: ["bat1", "bat2"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.bat1 && c.switches.bat2,
      },
      {
        title: "EXT PWR: ON",
        why: "Ground power gives AC power, so the screens and fuel pumps work without running the APU yet. Press it when AVAIL shows.",
        targets: ["extPwr"],
        want: true,
        panel: "ovhd",
        done: (s) => s.systems.acPower,
      },
      {
        title: "ADIRS: IR 1, IR 3, IR 2 to NAV",
        why: "The inertial references must align before the aircraft knows its attitude and heading. Do not move the aircraft while they align. Real alignment takes several minutes. Here it takes 1 minute.",
        targets: ["ir1", "ir3", "ir2"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.ir1 && c.switches.ir2 && c.switches.ir3,
      },
      {
        title: "Fuel pumps: all ON",
        why: "The wing tank pumps send fuel to the engines under pressure.",
        targets: ["fuelL1", "fuelL2", "fuelR1", "fuelR2"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => allPumps(c),
      },
      {
        title: "NAV lights and SEAT BELTS: ON",
        why: "Navigation lights stay on whenever the aircraft is powered. Seat belt signs go on before engine start.",
        targets: ["navLights", "seatBelts"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.navLights && c.switches.seatBelts,
      },
      {
        title: "Look at the main panel",
        why: "With AC power the screens are on. The PFD shows red ATT and HDG flags and the ND shows MAP NOT AVAIL: the ADIRS are still aligning. Press Next when you have had a look.",
        targets: ["tab-main"],
        panel: "main",
      },
      {
        title: "APU MASTER SW: ON",
        why: "Opens the APU air intake flap and powers the APU computer. Wait a few seconds for the flap to open.",
        targets: ["apuMaster"],
        want: true,
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
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.apuBleed,
      },
      {
        title: "Wait for ADIRS to finish aligning",
        why: "When the ALIGN lights go out the PFD shows attitude and heading and the ND shows the map.",
        targets: ["ir1", "ir2", "ir3"],
        want: true,
        panel: "ovhd",
        done: (s) => s.systems.irAligned.every(Boolean),
      },
      {
        title: "EXT PWR: OFF",
        why: "Ground power is disconnected before the aircraft moves. The APU generator now powers the aircraft.",
        targets: ["extPwr"],
        want: false,
        panel: "ovhd",
        done: (s, c) => !c.switches.extPwr && s.systems.acPower,
      },
      {
        title: "BEACON: ON",
        why: "The red flashing beacon warns ground staff that the engines are about to start.",
        targets: ["beacon"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.beacon,
      },
      {
        title: "Parking brake: SET, thrust levers: IDLE",
        why: "The aircraft must not move during engine start.",
        targets: ["parkBrake", "thrust"],
        want: true,
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
        why: "Engine 2 is usually started first. Watch the small engine display: N2 rises, fuel flows at about 22% N2, EGT rises, then N1 and N2 settle at idle. About 30 seconds.",
        targets: ["engMaster2"],
        want: true,
        panel: "ped",
        done: (s) => s.systems.engines[1].phase === "RUN",
      },
      {
        title: "ENG 1 MASTER: ON, wait for it to stabilise",
        why: "Same sequence for engine 1. Watch EGT and N2 again.",
        targets: ["engMaster1"],
        want: true,
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
        want: false,
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
        title: "TAXI light: ON",
        why: "The aircraft is ready to taxi.",
        targets: ["taxiLight"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.taxiLight,
      },
    ],
  },
  {
    id: "fcu",
    title: "FCU basics",
    summary: "In cruise with the autopilot on: read the FMA, change speed, heading and altitude, and see what each FCU change does.",
    minutes: 8,
    startId: "cruise10k",
    fcuActions: [{ kind: "athr" }, { kind: "ap" }, { kind: "alt" }],
    finished: "You have used SPD, HDG, ALT and V/S, and engaged and disconnected the autopilot. Well done.",
    steps: [
      {
        title: "Read the FMA",
        why: "The top row of the PFD is the Flight Mode Annunciator. Left to right: SPEED (autothrust holds the speed), ALT (holding altitude), HDG (holding heading), and AP1 and A/THR engaged on the right. After every FCU change, check the FMA. Press Next.",
        targets: [],
        panel: "main",
      },
      {
        title: "Set SPD 220 on the FCU",
        why: "Use the + and − buttons or scroll over the value. The cyan number above the speed tape and the cyan triangle move to 220.",
        targets: ["fcu-spd"],
        panel: "main",
        done: (s) => s.fcc.fcu.spd === 220,
      },
      {
        title: "Watch the speed reduce to 220 kt",
        why: "Autothrust reduces thrust (see N1 drop on the engine display) until the speed reaches the target, then adds thrust to hold it.",
        targets: [],
        panel: "main",
        done: (s) => Math.abs(s.kias - 220) < 4,
      },
      {
        title: "Set HDG 090 on the FCU",
        why: "In HDG mode the aircraft turns as soon as the heading changes. It turns the shorter way, banking up to 25°. (When following a flight plan in NAV mode you would PULL the knob to take the selected heading.)",
        targets: ["fcu-hdg"],
        panel: "main",
        done: (s) => s.fcc.fcu.hdg === 90,
      },
      {
        title: "Watch the turn on the PFD and ND",
        why: "The PFD shows the bank. On the ND the cyan heading bug sits at 090 and the compass turns until it is under the yellow line.",
        targets: [],
        panel: "main",
        done: (s) => angle(s.headingDeg, 90) < 4,
      },
      {
        title: "Set ALT 12000 on the FCU",
        why: "This is the target altitude. Nothing happens yet: the autopilot must be told how to climb.",
        targets: ["fcu-alt"],
        panel: "main",
        done: (s) => s.fcc.fcu.alt === 12000,
      },
      {
        title: "Set V/S +1500, then PULL V/S",
        why: "Pulling the V/S knob tells the autopilot to climb at the selected rate. The FMA shows V/S in green.",
        targets: ["fcu-vs", "fcu-vs-pull"],
        panel: "main",
        done: (s) => s.fcc.fcu.vs === 1500 && (s.fcc.vert === "V/S" || s.fcc.vert === "ALT*"),
      },
      {
        title: "Watch ALT* and then ALT",
        why: "Near 12,000 ft the FMA changes to ALT* (capturing) and the climb rate eases off. At the altitude it shows ALT (holding).",
        targets: [],
        panel: "main",
        done: (s) => s.fcc.vert === "ALT" && Math.abs(s.altFt - 12000) < 60,
      },
      {
        title: "Descend: ALT 10000, V/S −1000, PULL V/S",
        why: "Same idea downwards. Set the lower altitude first, then the descent rate, then pull.",
        targets: ["fcu-alt", "fcu-vs", "fcu-vs-pull"],
        panel: "main",
        done: (s) => s.fcc.fcu.alt === 10000 && s.fcc.fcu.vs === -1000 && (s.fcc.vert === "V/S" || s.fcc.vert === "ALT*"),
      },
      {
        title: "Wait for ALT at 10,000 ft",
        why: "Watch the altitude tape and the FMA again: V/S, then ALT*, then ALT.",
        targets: [],
        panel: "main",
        done: (s) => s.fcc.vert === "ALT" && Math.abs(s.altFt - 10000) < 60,
      },
      {
        title: "Disconnect the autopilot: press AP1",
        why: "AP OFF shows in red. In the real aircraft the pilot then flies with the sidestick. Here the aircraft simply holds its attitude.",
        targets: ["fcu-ap"],
        panel: "main",
        done: (s) => !s.fcc.ap,
      },
      {
        title: "Engage the autopilot again: press AP1",
        why: "AP1 shows in white on the FMA again. With nothing selected it holds the current heading and vertical speed.",
        targets: ["fcu-ap"],
        panel: "main",
        done: (s) => s.fcc.ap,
      },
    ],
  },
  {
    id: "shutdown",
    title: "Shutdown and secure",
    summary: "Parked with engines running: set the brake, start the APU, stop the engines and switch the aircraft off.",
    minutes: 6,
    startId: "parked28",
    switches: (sw) => {
      sw.landingLights = false;
      sw.strobe = false;
      sw.taxiLight = true;
      sw.parkBrake = false;
    },
    finished: "The aircraft is cold and dark again. Well done.",
    steps: [
      {
        title: "Parking brake: SET",
        why: "The aircraft is at its parking spot. Set the brake before anything else.",
        targets: ["parkBrake"],
        want: true,
        panel: "ped",
        done: (_s, c) => c.switches.parkBrake,
      },
      {
        title: "TAXI light: OFF",
        why: "Avoids dazzling the ground crew.",
        targets: ["taxiLight"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.taxiLight,
      },
      {
        title: "APU MASTER SW: ON, then APU START",
        why: "Start the APU before stopping the engines so the aircraft keeps electrical power. Wait for AVAIL.",
        targets: ["apuMaster", "apuStart"],
        want: true,
        panel: "ovhd",
        done: (s) => s.systems.apuAvail,
      },
      {
        title: "ENG 1 and ENG 2 MASTER: OFF",
        why: "Fuel to the engines is cut and they spool down. The APU generator takes over.",
        targets: ["engMaster1", "engMaster2"],
        want: false,
        panel: "ped",
        done: (_s, c) => !c.switches.engMaster1 && !c.switches.engMaster2,
      },
      {
        title: "Wait for the engines to stop",
        why: "Watch N1 and N2 fall on the engine display.",
        targets: [],
        panel: "ped",
        done: (s) => s.systems.engines.every((e) => e.n2 < 5),
      },
      {
        title: "BEACON: OFF",
        why: "The engines have stopped, so the ground crew can come close to the aircraft.",
        targets: ["beacon"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.beacon,
      },
      {
        title: "Fuel pumps: all OFF, SEAT BELTS: OFF",
        why: "No engine needs fuel now. Passengers can leave their seats.",
        targets: ["fuelL1", "fuelL2", "fuelR1", "fuelR2", "seatBelts"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => noPumps(c) && !c.switches.seatBelts,
      },
      {
        title: "EXT PWR: ON (when AVAIL)",
        why: "Ground power takes over from the APU, which saves fuel and noise at the gate.",
        targets: ["extPwr"],
        want: true,
        panel: "ovhd",
        done: (s, c) => c.switches.extPwr && s.systems.acSource === "EXT",
      },
      {
        title: "APU BLEED: OFF, APU MASTER SW: OFF",
        why: "The APU is no longer needed. It runs on a little longer to cool down, then stops.",
        targets: ["apuBleed", "apuMaster"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.apuBleed && !c.switches.apuMaster,
      },
      {
        title: "ADIRS: IR 1, 2 and 3 OFF",
        why: "Switch the inertial references off when the aircraft is being left. They will need a new alignment next time.",
        targets: ["ir1", "ir2", "ir3"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.ir1 && !c.switches.ir2 && !c.switches.ir3,
      },
      {
        title: "NAV lights: OFF",
        why: "The aircraft is about to be switched off.",
        targets: ["navLights"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.navLights,
      },
      {
        title: "EXT PWR: OFF, BAT 1 and BAT 2: OFF",
        why: "Last of all, remove power. The screens go dark: the aircraft is cold and dark.",
        targets: ["extPwr", "bat1", "bat2"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.extPwr && !c.switches.bat1 && !c.switches.bat2,
      },
    ],
  },
];
