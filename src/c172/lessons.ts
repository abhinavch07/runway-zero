// C172 lessons. Simplified training flows for a fuel-injected C172 with a glass cockpit, written in
// our own words from general public knowledge. Not the manufacturer's checklist: real pilots use
// the POH and their school's checklist. A flight instructor should review these.
import type { LessonBase, StepBase } from "../lessons/types";
import type { AirStart, C172Controls, C172Radios, C172State, C172Switches } from "./sim/types";
import { FIRST_FLIGHT } from "./firstFlight";
import type { NavReading } from "../radio/navReceiver";
import type { Clearance } from "../radio/radioBox";

export type C172Panel = "inst" | "lower" | "out";

/** What to aim for in a flying step, shown in the pink box on the outside view. */
export interface Aim {
  kias?: number;
  /** Altimeter reading, feet. */
  altFt?: number;
  /** True heading, degrees. */
  hdg?: number;
}

export interface C172Step extends StepBase<C172State, C172Controls, NavReading, C172Panel> {
  aim?: Aim;
}

export interface C172Lesson extends LessonBase<C172State, C172Controls, NavReading, C172Panel> {
  steps: C172Step[];
  /** Where the lesson starts, in the runway 28 frame (metres, heading relative to the runway). */
  start?: { x: number; y: number; h: number; air?: AirStart };
  /** Engine running at the start. */
  running: boolean;
  /** Changes to the starting switches. */
  switches?: (sw: C172Switches) => void;
  /** Changes to the starting levers and settings. */
  controls?: Partial<Omit<C172Controls, "switches">>;
  /** Today's QNH in hPa, for the altimeter. */
  qnh?: number;
  /** Radio settings at the start. */
  radios?: Partial<C172Radios>;
  /** ATC clearance given on the delivery or ground frequency. */
  clearance?: Clearance;
  /** Our callsign on the radio. */
  callsign?: string;
  /** Something fails this many seconds after the start. */
  failAfterS?: number;
  /** What fails (the alternator if not set). */
  failure?: "alternator" | "fuelpump";
  /** Fuel in the left and right tanks at the start, gallons. */
  fuelGal?: [number, number];
}

const rpmBetween = (s: C172State, lo: number, hi: number) => s.engine.running && s.engine.rpm >= lo && s.engine.rpm <= hi;

export const C172_LESSONS: C172Lesson[] = [
  {
    id: "c172-start",
    title: "Before start and engine start",
    summary: "From a cold aircraft to the engine running at 1000 RPM: fuel, master, beacon, mixture, priming with the fuel pump, the key, then avionics.",
    minutes: 6,
    running: false,
    switches: (sw) => {
      sw.fuelShutoff = false;
    },
    controls: { throttle: 0, mixture: 0 },
    finished: "The engine is running at 1000 RPM, the alternator is charging and the avionics are on. Next: the PFD and MFD lesson, or the run-up.",
    steps: [
      {
        title: "Parking brake: SET",
        why: "The aircraft must not roll when the engine starts. Check the brake is set.",
        targets: ["parkBrake"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.parkBrake,
      },
      {
        title: "FUEL SHUTOFF valve: ON",
        why: "The red fuel shutoff knob on the floor is pushed in for ON. Pulled out, no fuel can reach the engine.",
        targets: ["fuelShutoff"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.fuelShutoff,
      },
      {
        title: "FUEL SELECTOR: BOTH",
        why: "For start, taxi and take-off the selector is on BOTH, so fuel comes from both wing tanks.",
        targets: ["fuelSel-BOTH"],
        panel: "lower",
        done: (_s, c) => c.switches.fuelSel === "BOTH",
      },
      {
        title: "AVIONICS: check OFF",
        why: "The avionics stay off during engine start. The starter pulls a lot of current and the voltage dips.",
        targets: ["avionics"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.avionics,
      },
      {
        title: "MASTER switch: ON (BAT and ALT)",
        why: "The master switch has two halves: BAT connects the battery, ALT the alternator. The PFD comes on. On the lower panel the bus shows about 24 V from the battery.",
        targets: ["masterBat", "masterAlt"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.masterBat && c.switches.masterAlt,
      },
      {
        title: "STBY BATT: ARM",
        why: "The standby battery keeps the PFD powered if the main electrical system fails. (On the real aircraft you test it first, then arm it.)",
        targets: ["stbyBatt"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.stbyBatt,
      },
      {
        title: "BEACON: ON",
        why: "The flashing beacon warns people outside that the engine is about to start.",
        targets: ["beacon"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.beacon,
      },
      {
        title: "MIXTURE: RICH, THROTTLE: open a little",
        why: "Push the mixture fully in (RICH). Open the throttle about a quarter of an inch: one or two presses of + from idle.",
        targets: ["mixture", "throttle"],
        panel: "lower",
        done: (_s, c) => c.mixture > 0.9 && c.throttle >= 0.05 && c.throttle <= 0.25,
      },
      {
        title: "FUEL PUMP: ON for 3 to 5 seconds, then OFF",
        why: "This engine has fuel injection. Running the electric fuel pump for a few seconds primes it for a cold start. Too long floods the engine.",
        targets: ["fuelPump"],
        panel: "lower",
        done: (s, c) => s.primeS >= 2 && !c.switches.fuelPump,
      },
      {
        title: "Propeller area: CLEAR",
        why: "Look all around the propeller. On the real aircraft you open the window and call \"Clear prop!\" before you start. Press Next.",
        targets: [],
        panel: "lower",
      },
      {
        title: "MAGNETOS: hold START, let go when it starts",
        why: "Press and hold START on the key. The starter turns the engine. When the RPM rises past about 600, let go: the key springs back to BOTH.",
        targets: ["mag-START"],
        panel: "lower",
        done: (s, c) => s.engine.running && c.switches.magnetos === "BOTH",
      },
      {
        title: "OIL PRESSURE: check it rises",
        why: "Within 30 seconds the oil pressure must rise. If it does not, stop the engine at once (mixture to idle cut-off).",
        targets: ["mini-oil"],
        panel: "lower",
        done: (s) => s.engine.oilPressPsi > 20,
      },
      {
        title: "THROTTLE: set 1000 RPM",
        why: "1000 RPM is a good warm-up speed. Watch the RPM on the lower panel or the MFD as you move the throttle.",
        targets: ["throttle", "mini-rpm"],
        panel: "lower",
        // The RPM flares just after start, so the throttle must have been moved up as well.
        done: (s, c) => c.throttle >= 0.12 && rpmBetween(s, 900, 1100),
      },
      {
        title: "AVIONICS: ON",
        why: "With the engine running and the voltage steady, the avionics can come on. The MFD starts up.",
        targets: ["avionics"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.avionics,
      },
      {
        title: "Check the alternator is charging",
        why: "On the lower panel (or the MFD): the bus is now about 28 V and the battery current is positive (charging). Press Next.",
        targets: ["mini-volts", "mini-amps"],
        panel: "lower",
      },
      {
        title: "NAV lights: ON",
        why: "Navigation lights on. The aircraft is ready for the PFD and MFD lesson or the run-up.",
        targets: ["nav"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.nav,
      },
    ],
  },
  {
    id: "c172-pfd",
    title: "PFD and MFD basics",
    summary: "With the engine running: read the glass PFD (speed, attitude, altitude, heading) and the MFD engine page, set the baro and the heading bug.",
    minutes: 6,
    running: true,
    controls: { throttle: 0.15, mixture: 1 },
    qnh: 1008,
    finished: "You can read the PFD and the MFD engine page, set the baro and the heading bug. Next: the run-up before take-off.",
    steps: [
      {
        title: "The PFD layout",
        why: "Left: airspeed tape. Middle: attitude (blue sky, brown ground). Right: altitude tape, with vertical speed beside it. Bottom: the heading (HSI) rose. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "The airspeed tape colours",
        why: "White band: flaps can be used (up to 85 kt). Green: normal operating speeds. Yellow: smooth air only. Red line: never exceed (163 kt). On the ground it shows no speed yet. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "BARO: set QNH 1008",
        why: "The airfield gives today's pressure: 1008 hPa. Use the BARO − button beside the PFD until it shows 1008. The altitude then reads the airfield elevation, about 780 ft.",
        targets: ["c-baro-down"],
        panel: "inst",
        done: (_s, c) => !c.baro.std && c.baro.qnh === 1008,
      },
      {
        title: "HDG bug: set 280",
        why: "The cyan heading bug on the HSI marks the heading you want. Set it to 280, the runway heading for runway 28. Hold Shift for 10° steps.",
        targets: ["c-hdg"],
        panel: "inst",
        done: (_s, c) => c.hdgBug === 280,
      },
      {
        title: "The MFD engine strip",
        why: "On the left of the MFD: RPM at the top, then fuel flow, oil pressure, oil temperature and exhaust gas temperature (EGT). Green is normal, red is a limit. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "Fuel and electrics on the MFD",
        why: "Lower on the strip: fuel in each tank (L and R, in gallons), then the bus volts (M BUS, E BUS) and battery current (M BATT, S BATT). Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "THROTTLE: set 1200 RPM and watch",
        why: "Open the throttle a little. On the MFD watch the RPM rise and the fuel flow go up with it.",
        targets: ["throttle"],
        panel: "lower",
        done: (s) => rpmBetween(s, 1150, 1300),
      },
      {
        title: "THROTTLE: back to 1000 RPM",
        why: "Back to a steady 1000 RPM. Fuel flow comes down again.",
        targets: ["throttle"],
        panel: "lower",
        done: (s) => rpmBetween(s, 900, 1100),
      },
    ],
  },
  {
    id: "c172-radios",
    title: "Radios and ATC clearance",
    summary: "Engine running: tune and swap COM frequencies, listen to the ATIS, set the QNH, get a clearance from Ground and read it back, then set the transponder.",
    minutes: 8,
    running: true,
    controls: { throttle: 0.15, mixture: 1 },
    qnh: 1008,
    callsign: "VT-RZA",
    radios: { com: [118325, 118000] },
    clearance: {
      station: "ground",
      atc: "VT-RZA, Delhi Ground, cleared to the training area via runway 28, climb 2500 feet, squawk 4521.",
      readbacks: [
        "Cleared to the training area via runway 28, climb 2500 feet, squawk 4521, VT-RZA.",
        "Cleared via runway 28, climb 2500 feet, squawk 4251, VT-RZA.",
        "Roger, VT-RZA.",
      ],
      hint: "Read back the route, the altitude and the squawk code exactly, then your callsign.",
    },
    finished: "You tuned the radios, used the ATIS, read back a clearance and set the transponder. These frequencies are made up for training: always use the real published ones in a real aircraft.",
    steps: [
      {
        title: "The radios on the PFD",
        why: "The top of the PFD shows NAV1 on the left and COM1 on the right. Each has an active frequency (green, the one you use) and a standby frequency (in the cyan box, the one you tune). These frequencies are made up for training. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "COM: tune 126.025 on standby (ATIS)",
        why: "Use the COM buttons under the PFD. The MHz − and + change the part before the dot, the kHz − and + the part after it (hold Shift for bigger steps). Set 126.025.",
        targets: ["c-com"],
        panel: "inst",
        done: (_s, c) => c.radios.com.includes(126025),
      },
      {
        title: "COM: press ⇆ to make it active",
        why: "The swap button moves the standby frequency to active. You now hear the ATIS in the radio box.",
        targets: ["c-com-swap"],
        panel: "inst",
        done: (_s, c) => c.radios.com[0] === 126025,
      },
      {
        title: "Read the ATIS",
        why: "The ATIS is a recorded message with the runway, wind, weather and QNH. Pilots listen to it before calling ATC. Note the QNH. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "BARO: set the QNH from the ATIS",
        why: "The ATIS said QNH 1008. Set it with BARO −.",
        targets: ["c-baro-down"],
        panel: "inst",
        done: (_s, c) => !c.baro.std && c.baro.qnh === 1008,
      },
      {
        title: "COM: tune GROUND 121.775 and make it active",
        why: "Tune 121.775 on standby, then press ⇆. Ground will give you a clearance.",
        targets: ["c-com", "c-com-swap"],
        panel: "inst",
        done: (_s, c) => c.radios.com[0] === 121775,
      },
      {
        title: "Read back the clearance",
        why: "Ground gives the clearance in the radio box. Press SPEAK and say your read-back out loud (Chrome or Edge), or pick the correct one. A read-back repeats the important parts exactly (route, altitude, squawk) so ATC can catch any mistake.",
        targets: ["readback-speak", "readback-0", "readback-1", "readback-2"],
        panel: "inst",
        done: (_s, c) => c.radios.readBack,
      },
      {
        title: "XPDR: set 4521",
        why: "The squawk code identifies you on the ATC radar. Type 4, 5, 2, 1 on the XPDR buttons. Only the digits 0 to 7 exist.",
        targets: ["c-xpdr"],
        panel: "inst",
        done: (_s, c) => c.radios.xpdrCode === "4521",
      },
      {
        title: "XPDR: ALT",
        why: "ALT sends your code and your altitude to ATC radar. Normally you select it when you line up on the runway. Select it now to see it.",
        targets: ["c-xpdr-ALT"],
        panel: "inst",
        done: (_s, c) => c.radios.xpdrMode === "ALT",
      },
      {
        title: "COM: put TOWER 118.325 on standby",
        why: "Get the next frequency ready: tune 118.325 on standby. When Ground says \"contact Tower\", one press of ⇆ is all you need.",
        targets: ["c-com"],
        panel: "inst",
        done: (_s, c) => c.radios.com[1] === 118325,
      },
    ],
  },
  {
    id: "c172-nav",
    title: "VOR and ILS",
    summary: "Engine running at Delhi: tune and identify a VOR, find which radial you are on (FROM), the course to fly to it (TO), then tune the ILS for runway 28 and read the localizer needle.",
    minutes: 8,
    running: true,
    controls: { throttle: 0.15, mixture: 1, hdgBug: 330 },
    radios: { nav: [108000, 108000], obs: 360 },
    finished: "You can tune and identify a VOR, find your radial, the course to the station and read a localizer. The RZV VOR and the IRZ ILS are made up for training.",
    steps: [
      {
        title: "NAV: tune 113.35 (RZV VOR), then ⇆",
        why: "VORs are radio beacons on the ground. Tune the NAV standby with the NAV buttons under the PFD, then swap it to active. The ident RZV appears next to the frequency when the signal is received.",
        targets: ["c-nav", "c-nav-swap"],
        panel: "inst",
        done: (_s, c) => c.radios.nav[0] === 113350,
      },
      {
        title: "Identify: press ID and listen",
        why: "Never use a navaid you have not identified. Press ID: you hear R Z V in Morse code (.-. --.. ...-).",
        targets: ["c-nav-id"],
        panel: "inst",
        done: (_s, c) => c.radios.navIdHeard,
      },
      {
        title: "CRS: centre the needle with a FROM flag",
        why: "Turn the course with CRS − and + (Shift for 10°) until the green needle on the HSI is in the middle and the flag shows FROM (the white triangle points to the tail end of the arrow).",
        targets: ["c-crs"],
        panel: "inst",
        done: (_s, _c, n) => n.valid && n.toFrom === "FROM" && Math.abs(n.dev) < 0.1,
      },
      {
        title: "Read your radial",
        why: "With the needle centred and FROM, the course is the radial you are on: about 118. A radial is a line going out from the VOR. You are about 19 NM south-east of RZV. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "CRS: now centre it with a TO flag",
        why: "Add 180° (about 298) and centre the needle again. Now the flag shows TO: this is the course to fly to reach the station.",
        targets: ["c-crs"],
        panel: "inst",
        done: (_s, _c, n) => n.valid && n.toFrom === "TO" && Math.abs(n.dev) < 0.1,
      },
      {
        title: "HDG bug: set it to the course",
        why: "To fly to the VOR you would turn to that heading (plus a correction for wind). Set the heading bug to the same number as the course.",
        targets: ["c-hdg"],
        panel: "inst",
        done: (_s, c) => Math.abs(((c.hdgBug - c.radios.obs + 540) % 360) - 180) <= 3,
      },
      {
        title: "NAV: tune 110.55 (ILS 28), then ⇆",
        why: "An ILS guides you down to a runway. Its localizer shows the runway centreline. The source on the HSI changes to LOC1.",
        targets: ["c-nav", "c-nav-swap"],
        panel: "inst",
        done: (_s, c) => c.radios.nav[0] === 110550,
      },
      {
        title: "CRS: set 285, the runway course",
        why: "Set the course to the localizer course of runway 28 (285), so the needle reads the right way round.",
        targets: ["c-crs"],
        panel: "inst",
        done: (_s, c) => c.radios.obs === 285,
      },
      {
        title: "Read the localizer needle",
        why: "The needle is far out to the right: the runway centreline is to your right. A localizer is four times more sensitive than a VOR, so even 150 m off the centreline here is full scale. On an approach from the east a glide slope diamond also appears. Press Next.",
        targets: [],
        panel: "inst",
      },
    ],
  },
  {
    id: "c172-runup",
    title: "Run-up before take-off",
    summary: "At the run-up area: brakes, mixture, flight controls, fuel, trim, 1800 RPM, magneto check, engine and electrics, idle check, ready for take-off.",
    minutes: 6,
    running: true,
    controls: { throttle: 0.15, mixture: 1, trim: 0.6 },
    finished: "The run-up is complete and the aircraft is ready for take-off. Real pilots then do the before take-off checklist and get a clearance.",
    steps: [
      {
        title: "Parking brake: SET",
        why: "Hold the aircraft still during the run-up. Point it into wind if you can.",
        targets: ["parkBrake"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.parkBrake,
      },
      {
        title: "MIXTURE: RICH",
        why: "At low airfields like Delhi the mixture stays fully rich for the run-up and take-off.",
        targets: ["mixture"],
        panel: "lower",
        done: (_s, c) => c.mixture > 0.9,
      },
      {
        title: "Flight controls: free and correct",
        why: "Move the yoke fully forward, back, left and right and check the control surfaces move the right way. (Not modelled here.) Press Next.",
        targets: [],
        panel: "lower",
      },
      {
        title: "FUEL SELECTOR: BOTH",
        why: "Fuel from both tanks for take-off.",
        targets: ["fuelSel-BOTH"],
        panel: "lower",
        done: (_s, c) => c.switches.fuelSel === "BOTH",
      },
      {
        title: "TRIM: set for take-off",
        why: "The trim is nose up from the last landing. Use the trim buttons until the indicator is at the TAKEOFF mark.",
        targets: ["trim"],
        panel: "lower",
        done: (_s, c) => Math.abs(c.trim) < 0.06,
      },
      {
        title: "THROTTLE: 1800 RPM",
        why: "The engine checks are done at 1800 RPM.",
        targets: ["throttle", "mini-rpm"],
        panel: "lower",
        done: (s) => rpmBetween(s, 1720, 1880),
      },
      {
        title: "MAGNETOS: L, note the RPM drop",
        why: "Turn the key to L: the engine runs on the left magneto only. The RPM drops a little. The drop must not be more than 150 RPM.",
        targets: ["mag-L", "mini-rpm"],
        panel: "lower",
        done: (_s, c) => c.switches.magnetos === "L",
      },
      {
        title: "MAGNETOS: BOTH",
        why: "Back to BOTH. The RPM comes back up.",
        targets: ["mag-BOTH"],
        panel: "lower",
        done: (s, c) => c.switches.magnetos === "BOTH" && s.engine.rpm > 1700,
      },
      {
        title: "MAGNETOS: R, note the RPM drop",
        why: "Now the right magneto only. Again not more than 150 RPM drop, and not more than 50 RPM different from the left.",
        targets: ["mag-R", "mini-rpm"],
        panel: "lower",
        done: (_s, c) => c.switches.magnetos === "R",
      },
      {
        title: "MAGNETOS: BOTH",
        why: "Back to BOTH. Never take off on one magneto.",
        targets: ["mag-BOTH"],
        panel: "lower",
        done: (s, c) => c.switches.magnetos === "BOTH" && s.engine.rpm > 1700,
      },
      {
        title: "Engine and electrics: check",
        why: "On the MFD: oil pressure and temperature in the green, both bus volts about 28 V, battery current positive. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "THROTTLE: idle, check it runs smoothly",
        why: "Pull the throttle to idle. The engine must keep running smoothly at low RPM.",
        targets: ["throttle"],
        panel: "lower",
        done: (s) => s.engine.running && s.engine.rpm < 900,
      },
      {
        title: "THROTTLE: 1000 RPM",
        why: "Back to 1000 RPM to wait at the holding point.",
        targets: ["throttle"],
        panel: "lower",
        done: (s) => rpmBetween(s, 900, 1100),
      },
      {
        title: "FLAPS: 0° to 10° for take-off",
        why: "A normal take-off uses flaps 0° to 10°.",
        targets: ["flaps0", "flaps1"],
        panel: "lower",
        done: (_s, c) => c.flaps <= 1,
      },
    ],
  },
  ...FIRST_FLIGHT,
  {
    id: "c172-altfail",
    title: "Alternator failure",
    summary: "Engine running with lights and pitot heat on when the alternator fails: LOW VOLTS, read the volts and amps, reset the alternator, switch it off, shed electrical load, plan to land.",
    minutes: 6,
    running: true,
    controls: { throttle: 0.2, mixture: 1 },
    switches: (sw) => {
      sw.landing = true;
      sw.taxi = true;
      sw.strobe = true;
      sw.pitotHeat = true;
    },
    failAfterS: 8,
    finished: "You handled an alternator failure: reset once, then off, shed load, and land as soon as practical while the battery lasts. In a real aircraft follow the POH checklist.",
    steps: [
      {
        title: "Wait: something is about to fail",
        why: "Watch the PFD and the MFD electrics. In a few seconds a warning appears.",
        targets: [],
        panel: "inst",
        done: (s) => s.elec.altFailed && s.elec.lowVolts,
      },
      {
        title: "LOW VOLTS: read the MFD",
        why: "A red LOW VOLTS shows on the PFD. On the MFD the bus has dropped from 28 V to about 24 V, and the battery current (BATT A) is negative: the battery is now powering everything. The alternator has stopped charging. Press Next.",
        targets: [],
        panel: "inst",
      },
      {
        title: "MASTER ALT: OFF, then ON",
        why: "Try to reset the alternator: switch the ALT half of the master switch off, then on again.",
        targets: ["masterAlt"],
        panel: "lower",
        done: (_s, c) => !!c.altCycled,
      },
      {
        title: "Still LOW VOLTS: MASTER ALT OFF",
        why: "The reset did not work. Switch ALT off so the failed alternator is out of the system. Leave BAT on: the battery now keeps the radios and instruments going.",
        targets: ["masterAlt"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.masterAlt,
      },
      {
        title: "Shed load: LAND, TAXI, STROBE, PITOT HEAT off",
        why: "Every amp you save makes the battery last longer. Switch off what you do not need now. (Pitot heat is needed in icing. Today it is 25°C and dry.)",
        targets: ["landing", "taxi", "strobe", "pitotHeat"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.landing && !c.switches.taxi && !c.switches.strobe && !c.switches.pitotHeat,
      },
      {
        title: "Check the battery current again",
        why: "On the lower panel or the MFD, BATT A is still negative, but much smaller than before. Press Next.",
        targets: ["mini-amps"],
        panel: "lower",
      },
      {
        title: "Plan: land as soon as practical",
        why: "A battery lasts only a limited time, often 30 minutes or less. In flight you would tell ATC, keep only what you need on, and land at the nearest suitable airfield. Press Next.",
        targets: [],
        panel: "inst",
      },
    ],
  },
  {
    id: "c172-fuel",
    title: "Fuel management and starvation",
    summary: "Engine running on the LEFT tank, which is almost empty while the right tank is full. See fuel starvation stop the engine, then switch tanks, use the fuel pump and restart.",
    minutes: 6,
    running: true,
    controls: { throttle: 0.55, mixture: 1 },
    switches: (sw) => {
      sw.fuelSel = "LEFT";
    },
    fuelGal: [0.03, 20],
    finished: "The engine stopped with 20 gallons still on board: the fuel just could not reach it. Check the quantity in each tank before flight, watch it in flight, and know where the selector is.",
    steps: [
      {
        title: "Look at the fuel",
        why: "On the MFD: LEFT tank almost empty (and LOW FUEL L on the PFD), RIGHT tank 20 gallons. On the lower panel the FUEL SELECTOR is on LEFT. Press Next, then watch the RPM.",
        targets: ["fuelSel-LEFT"],
        panel: "inst",
      },
      {
        title: "Watch the RPM",
        why: "Within about half a minute the left tank runs dry. The fuel flow drops to zero and the engine stops, even though the right tank is full. This is fuel starvation.",
        targets: ["mini-rpm"],
        panel: "lower",
        done: (s) => s.starved && !s.engine.running,
      },
      {
        title: "FUEL SELECTOR: BOTH",
        why: "Select a tank that has fuel. BOTH feeds from both tanks, so the full right tank now reaches the engine.",
        targets: ["fuelSel-BOTH"],
        panel: "lower",
        done: (_s, c) => c.switches.fuelSel === "BOTH",
      },
      {
        title: "FUEL PUMP: ON, MIXTURE: RICH",
        why: "The electric fuel pump pushes fuel back through the empty lines to the engine. Mixture fully rich for the restart.",
        targets: ["fuelPump", "mixture"],
        panel: "lower",
        done: (_s, c) => c.switches.fuelPump && c.mixture > 0.9,
      },
      {
        title: "Restart: hold MAGNETOS on START",
        why: "Hold START until the engine runs, then let go. (In flight a turning propeller often restarts the engine by itself once fuel arrives.)",
        targets: ["mag-START"],
        panel: "lower",
        done: (s, c) => s.engine.running && c.switches.magnetos === "BOTH",
      },
      {
        title: "FUEL PUMP: OFF",
        why: "The engine-driven pump does the job again. Switch the electric pump off.",
        targets: ["fuelPump"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.fuelPump,
      },
    ],
  },
  {
    id: "c172-shutdown",
    title: "Shutdown and secure",
    summary: "Parked with the engine running: avionics off, lights off, mixture to idle cut-off, magnetos off, master off, fuel selector to one tank.",
    minutes: 4,
    running: true,
    switches: (sw) => {
      sw.taxi = true;
    },
    controls: { throttle: 0.15, mixture: 1 },
    finished: "The engine is stopped and the aircraft is secured. Real pilots then fit the control lock and tie the aircraft down.",
    steps: [
      {
        title: "Parking brake: SET",
        why: "Set the brake as soon as you stop at the parking spot.",
        targets: ["parkBrake"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.parkBrake,
      },
      {
        title: "THROTTLE: 1000 RPM",
        why: "Let the engine run at 1000 RPM for a moment before shutdown.",
        targets: ["throttle"],
        panel: "lower",
        done: (s) => rpmBetween(s, 900, 1100),
      },
      {
        title: "AVIONICS: OFF",
        why: "Avionics off before the engine stops, to protect them from voltage changes.",
        targets: ["avionics"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.avionics,
      },
      {
        title: "TAXI light: OFF",
        why: "Switch off the lights you no longer need.",
        targets: ["taxi"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.taxi,
      },
      {
        title: "MIXTURE: IDLE CUT-OFF",
        why: "Pull the mixture fully out. The engine stops because no fuel reaches the cylinders. This is the normal way to stop it.",
        targets: ["mixture"],
        panel: "lower",
        done: (s) => !s.engine.running && s.engine.rpm < 100,
      },
      {
        title: "MAGNETOS: OFF",
        why: "Turn the key to OFF and take it out. A magneto left on can start the engine if someone turns the propeller.",
        targets: ["mag-OFF"],
        panel: "lower",
        done: (_s, c) => c.switches.magnetos === "OFF",
      },
      {
        title: "BEACON and NAV lights: OFF",
        why: "The engine has stopped, so the beacon can go off.",
        targets: ["beacon", "nav"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.beacon && !c.switches.nav,
      },
      {
        title: "STBY BATT: OFF, MASTER: OFF",
        why: "Standby battery off, then both halves of the master switch. Everything goes dark.",
        targets: ["stbyBatt", "masterAlt", "masterBat"],
        want: false,
        panel: "lower",
        done: (_s, c) => !c.switches.stbyBatt && !c.switches.masterBat && !c.switches.masterAlt,
      },
      {
        title: "FUEL SELECTOR: LEFT or RIGHT",
        why: "When parked, the selector goes to one tank. On BOTH, fuel can flow from the fuller tank to the other if the aircraft is not level.",
        targets: ["fuelSel-LEFT", "fuelSel-RIGHT"],
        panel: "lower",
        done: (_s, c) => c.switches.fuelSel !== "BOTH",
      },
    ],
  },
];
