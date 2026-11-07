// 737 lessons. Simplified training flows for a 737-type airliner, written in our own words from
// general public knowledge. Not the FCOM, QRH or an airline's procedures. A type-rated pilot should
// review these.
import type { LessonBase, StepBase } from "../lessons/types";
import type { Controls737, Extras737, State737, Sw737 } from "./sim/types";
import type { McpValues } from "./sim/afcs";
import type { CduPage, Fms737 } from "./cockpit/cdu";
import type { NavReading } from "../radio/navReceiver";
import type { Clearance } from "../radio/radioBox";

export type Panel737 = "ovhd" | "main" | "ped";

/** Extra things the lessons check: the FMC and the NAV 1 reading. */
export interface X737 {
  fms: Fms737;
  cduPage: CduPage;
  scratch: string;
  preflight: boolean;
  nav: NavReading;
}

export type Step737 = StepBase<State737, Controls737, X737, Panel737>;

export interface Lesson737 extends LessonBase<State737, Controls737, X737, Panel737> {
  /** cold: everything off. powered: APU, IRS aligned, engines off. running: engines running. */
  state: "cold" | "powered" | "running";
  /** At the gate, or in the air (altitude and speed). */
  air?: { altFt: number; kias: number };
  /** The FMC set-up at the start. */
  fms: "empty" | "ready";
  fuelKg?: number;
  switches?: (sw: Sw737) => void;
  extras?: Partial<Extras737>;
  mcp?: Partial<McpValues>;
  crs1?: number;
  qnh?: number;
  clearance?: Clearance;
  callsign?: string;
  /** Something fails this many seconds after the start. */
  failAfterS?: number;
  failure?: "fire1";
}

const mcp = (s: State737) => s.afcs.mcp;
const CALLSIGN = "Training 456";

export const B737_LESSONS: Lesson737[] = [
  {
    id: "b737-power",
    title: "Power up from cold and dark",
    summary: "From a dark aircraft to APU power: battery, IRS to NAV, APU start, APU generators on both buses, position lights, APU bleed, IRS alignment.",
    minutes: 8,
    state: "cold",
    fms: "empty",
    finished: "The aircraft runs on APU power and air, and the IRS are aligned. Next: set up the FMC for the flight to Mumbai.",
    steps: [
      {
        title: "BATTERY: ON",
        why: "The battery switch is under a guard on the real aircraft. Switch it on. Some lights on the overhead come on. The big screens stay dark: they need AC power, which the battery cannot give.",
        targets: ["battery"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.battery,
      },
      {
        title: "IRS L and R: NAV",
        why: "The IRS (inertial reference) work out where the aircraft is and which way it points. Turn both selectors to NAV. The ALIGN lights come on while they align. A real alignment takes several minutes. Here it takes 60 seconds.",
        targets: ["irsL-NAV", "irsR-NAV"],
        panel: "ovhd",
        done: (_s, c) => c.switches.irs[0] === "NAV" && c.switches.irs[1] === "NAV",
      },
      {
        title: "APU: START",
        why: "Press START on the APU switch. It springs back to ON and the APU starts. Watch the APU EGT rise. It takes about 30 seconds here.",
        targets: ["apu-START"],
        panel: "ovhd",
        done: (s) => s.sys.apuStarting || s.sys.apuAvail,
      },
      {
        title: "Wait: APU GEN OFF BUS",
        why: "When the APU is ready, the blue APU GEN OFF BUS light comes on. The APU can now power the aircraft, but it is not connected to anything yet.",
        targets: [],
        panel: "ovhd",
        done: (s) => s.sys.apuGenOffBus,
      },
      {
        title: "APU GEN 1 and APU GEN 2: ON",
        why: "Connect the APU generator to both AC buses. The blue light goes out, the BUS OFF lights go out, and the screens and the CDU come on.",
        targets: ["apugen1", "apugen2"],
        panel: "ovhd",
        done: (_s, c) => c.switches.bus[0] === "APU" && c.switches.bus[1] === "APU",
      },
      {
        title: "POSITION lights: ON",
        why: "Position lights on whenever the aircraft has power.",
        targets: ["position"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.position,
      },
      {
        title: "APU BLEED: ON",
        why: "The APU also gives compressed air: for the air conditioning packs now, and later to start the engines. Watch the DUCT PRESS come up.",
        targets: ["apuBleed"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.apuBleed,
      },
      {
        title: "Wait for the IRS to align",
        why: "The ALIGN lights go out when alignment is complete. Use the TIME button at the top to wait less. In a real aircraft you also give the IRS the position through the FMC (next lesson).",
        targets: ["time-rate"],
        panel: "ovhd",
        done: (s) => s.sys.irsAligned[0] && s.sys.irsAligned[1],
      },
      {
        title: "Look at the screens",
        why: "On the main panel: the PFD on the left (now showing attitude), the ND in the middle and the engine display on the right. The engines are off, so their dials are at zero. Press Next.",
        targets: [],
        panel: "main",
      },
    ],
  },
  {
    id: "b737-fmc",
    title: "FMC route set-up",
    summary: "On the CDU: IDENT, the IRS position, the route Delhi to Mumbai through the training waypoints, ACTIVATE and EXEC, performance data, and the take-off flaps and speeds.",
    minutes: 12,
    state: "powered",
    fms: "empty",
    fuelKg: 7000,
    finished: "The FMC is set up: position, route, performance and take-off data. On the ND the route shows in magenta. The waypoints are made up for training.",
    steps: [
      {
        title: "IDENT page: check it",
        why: "The CDU (on the pedestal) shows the IDENT page: the aircraft model and which navigation data is loaded. Check them first. Press Next.",
        targets: [],
        panel: "ped",
      },
      {
        title: "POS INIT: press the key next to POS INIT>",
        why: "The keys beside the screen are line select keys (LSK). Lines are counted 1 to 6 from the top, L on the left and R on the right. POS INIT> is at 6R.",
        targets: ["cdu-R6"],
        panel: "ped",
        done: (_s, _c, x) => x.cduPage === "POS",
      },
      {
        title: "REF AIRPORT: VIDP",
        why: "Type V, I, D, P on the keyboard. It appears in the scratchpad at the bottom of the screen. Then press 2L, next to REF AIRPORT.",
        targets: ["cdu-L2"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.refAirport === "VIDP",
      },
      {
        title: "GPS POS: copy it to the scratchpad",
        why: "With the scratchpad empty, press 4R next to GPS POS. The position is copied to the scratchpad.",
        targets: ["cdu-R4"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.irsPosSet || x.scratch.startsWith("N"),
      },
      {
        title: "SET IRS POS: press 5R",
        why: "Press 5R to give the copied position to the IRS. This is how they know where they are.",
        targets: ["cdu-R5"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.irsPosSet,
      },
      {
        title: "ROUTE>: press 6R",
        why: "Go on to the route page (RTE 1).",
        targets: ["cdu-R6"],
        panel: "ped",
        done: (_s, _c, x) => x.cduPage === "RTE1",
      },
      {
        title: "ORIGIN VIDP and DEST VABB",
        why: "Type VIDP and press 1L (ORIGIN). Type VABB and press 1R (DEST).",
        targets: ["cdu-L1", "cdu-R1"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.origin === "VIDP" && x.fms.dest === "VABB",
      },
      {
        title: "RUNWAY 28 and FLT NO. RZ456",
        why: "Type 28 and press 2L (RUNWAY). Type RZ456 and press 2R (flight number).",
        targets: ["cdu-L2", "cdu-R2"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.runway === "28" && x.fms.fltNo === "RZ456",
      },
      {
        title: "NEXT PAGE: RTE page 2",
        why: "Page 2 is where the route itself goes, as VIA (how) and TO (where).",
        targets: ["cdu-NEXT"],
        panel: "ped",
        done: (_s, _c, x) => x.cduPage === "RTE2",
      },
      {
        title: "Waypoints: RZ101, RZ102, RZ103",
        why: "Type RZ101 and press 1R. VIA fills in as DIRECT. Then RZ102 at 2R and RZ103 at 3R. These are made-up training waypoints between Delhi and Mumbai.",
        targets: ["cdu-R1", "cdu-R2", "cdu-R3"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.via.join(" ") === "RZ101 RZ102 RZ103",
      },
      {
        title: "ACTIVATE>: press 6R",
        why: "The route is ready. ACTIVATE makes it the route to fly. The EXEC key lights up.",
        targets: ["cdu-R6"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.activated,
      },
      {
        title: "EXEC",
        why: "Press the lit EXEC key. The title changes to ACT RTE 1: the route is active. EXEC is how the FMC asks you to confirm a change.",
        targets: ["cdu-EXEC"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.active && !x.fms.pending,
      },
      {
        title: "PERF INIT>: press 6R",
        why: "Next, the performance data: weights, fuel reserve, cost index and cruise altitude.",
        targets: ["cdu-R6"],
        panel: "ped",
        done: (_s, _c, x) => x.cduPage === "PERF",
      },
      {
        title: "ZFW: 55.0",
        why: "Zero fuel weight is the aircraft with passengers and cargo but no fuel, in tonnes. Type 55.0 and press 3L. The gross weight (GW) at the top is worked out from it and the fuel on board.",
        targets: ["cdu-L3"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.zfwT === 55,
      },
      {
        title: "RESERVES 2.5 and COST INDEX 30",
        why: "Type 2.5 and press 4L (fuel to keep in reserve, tonnes). Type 30 and press 5L. The cost index balances fuel against time: low saves fuel, high saves time.",
        targets: ["cdu-L4", "cdu-L5"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.reservesT === 2.5 && x.fms.costIndex === 30,
      },
      {
        title: "CRZ ALT: FL350",
        why: "Type FL350 (or 350) and press 1R. Flight level 350 is 35,000 ft on the standard pressure setting.",
        targets: ["cdu-R1"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.crzAltFt === 35000,
      },
      {
        title: "TAKEOFF>: press 6R",
        why: "Last page: the take-off reference data.",
        targets: ["cdu-R6"],
        panel: "ped",
        done: (_s, _c, x) => x.cduPage === "TO",
      },
      {
        title: "FLAPS: 5",
        why: "Type 5 and press 1L. Flaps 5 is a common take-off setting. The FMC then offers take-off speeds (small, at the right).",
        targets: ["cdu-L1"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.toFlaps === 5,
      },
      {
        title: "V1, VR, V2: press 1R, 2R, 3R",
        why: "Press each key to accept the speed. V1 is the decision speed, VR the rotation speed, V2 the safe climb speed with one engine out. These are made-up training values, not real performance data.",
        targets: ["cdu-R1", "cdu-R2", "cdu-R3"],
        panel: "ped",
        done: (_s, _c, x) => x.fms.vSel.every(Boolean),
      },
      {
        title: "Check: PRE-FLT COMPLETE, and the route on the ND",
        why: "The CDU shows PRE-FLT COMPLETE. On the main panel the ND shows the route in magenta, from Delhi to RZ101. Press Next.",
        targets: [],
        panel: "main",
      },
    ],
  },
  {
    id: "b737-start",
    title: "Engine start",
    summary: "With APU power and air: fuel pumps, electric hydraulic pumps, anti-collision light, packs off, then engine 2 and engine 1 (start switch GRD, start lever IDLE at 25% N2), generators on, packs on, APU bleed off.",
    minutes: 10,
    state: "powered",
    fms: "ready",
    fuelKg: 7000,
    finished: "Both engines are running on their own generators, the packs are back on and the APU bleed is off. The aircraft is ready to taxi.",
    steps: [
      {
        title: "FUEL PUMPS: the four wing pumps ON",
        why: "L FWD, L AFT, R FWD and R AFT. Their LOW PRESSURE lights go out. The centre tank is empty today, so the CTR pumps stay off.",
        targets: ["fuel-0", "fuel-1", "fuel-4", "fuel-5"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => [0, 1, 4, 5].every((i) => c.switches.fuelPumps[i]),
      },
      {
        title: "HYDRAULIC: ELEC 1 and ELEC 2 ON",
        why: "The electric pumps pressurise systems A and B before the engines run. The ENG pumps are already on and will work once the engines turn. Watch PRESS A / B rise to 3000.",
        targets: ["hyd-1", "hyd-2"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.hydPumps[1] && c.switches.hydPumps[2],
      },
      {
        title: "ANTI COLLISION light: ON",
        why: "The red flashing light tells people outside that the engines are about to start.",
        targets: ["beacon"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.beacon,
      },
      {
        title: "PACKS: both OFF",
        why: "The packs use APU air for air conditioning. Switch them off so all the air goes to the engine starters. DUCT PRESS rises to about 36 psi. With both packs on there is too little for a start.",
        targets: ["packL", "packR", "duct-psi"],
        want: false,
        panel: "ovhd",
        done: (s, c) => !c.switches.packs[0] && !c.switches.packs[1] && s.sys.ductPsi > 30,
      },
      {
        title: "ENGINE 2 START: GRD",
        why: "Engine 2 (right) is usually started first. Turn its start switch to GRD. The start valve opens and air turns the engine. N2 starts to rise (ENGINES box, or the engine display).",
        targets: ["start2-GRD"],
        panel: "ovhd",
        done: (_s, c) => c.switches.engStart[1] === "GRD",
      },
      {
        title: "At 25% N2: START LEVER 2 to IDLE",
        why: "Wait until N2 reaches 25% (watch the ENGINES box). Then move start lever 2 to IDLE. This gives fuel and the igniters light it. Too early and the start can run hot.",
        targets: ["lever2-IDLE", "mini-n2"],
        panel: "ped",
        done: (s, c) => c.switches.startLever[1] === "IDLE" && s.sys.engines[1].n2 >= 20,
      },
      {
        title: "Watch the start: EGT, N1, then cut-out",
        why: "On the engine display: EGT rises (light-up), then N1. At about 56% N2 the starter cuts out, START VALVE OPEN goes out and the start switch springs back to OFF. The engine settles at idle.",
        targets: [],
        panel: "main",
        done: (s, c) => s.sys.engines[1].phase === "RUN" && c.switches.engStart[1] === "OFF",
      },
      {
        title: "ENGINE 1 START: GRD",
        why: "Now the left engine, the same way.",
        targets: ["start1-GRD"],
        panel: "ovhd",
        done: (_s, c) => c.switches.engStart[0] === "GRD",
      },
      {
        title: "At 25% N2: START LEVER 1 to IDLE",
        why: "Wait for 25% N2 on engine 1, then start lever 1 to IDLE.",
        targets: ["lever1-IDLE", "mini-n2"],
        panel: "ped",
        done: (s, c) => c.switches.startLever[0] === "IDLE" && s.sys.engines[0].n2 >= 20,
      },
      {
        title: "Wait for engine 1 to settle",
        why: "Watch EGT and N1 rise, then the start switch goes back to OFF at about 56% N2.",
        targets: [],
        panel: "main",
        done: (s, c) => s.sys.engines[0].phase === "RUN" && c.switches.engStart[0] === "OFF",
      },
      {
        title: "GEN 1 and GEN 2: ON",
        why: "Put each engine's generator on its bus. The GEN OFF BUS lights go out. The APU is no longer powering the buses.",
        targets: ["gen1", "gen2"],
        panel: "ovhd",
        done: (_s, c) => c.switches.bus[0] === "ENG" && c.switches.bus[1] === "ENG",
      },
      {
        title: "PACKS: both ON",
        why: "The engines now give bleed air, so the packs can run again for the cabin.",
        targets: ["packL", "packR"],
        want: true,
        panel: "ovhd",
        done: (_s, c) => c.switches.packs[0] && c.switches.packs[1],
      },
      {
        title: "APU BLEED: OFF",
        why: "The engine bleeds supply the air now. Switch the APU bleed off.",
        targets: ["apuBleed"],
        want: false,
        panel: "ovhd",
        done: (_s, c) => !c.switches.apuBleed,
      },
      {
        title: "APU: OFF",
        why: "The APU is no longer needed. (Some airlines keep it running a little longer.) Its EGT falls as it stops.",
        targets: ["apu-OFF"],
        panel: "ovhd",
        done: (_s, c) => !c.switches.apuOn,
      },
    ],
  },
  {
    id: "b737-mcp",
    title: "MCP autopilot basics",
    summary: "In flight at 6000 ft: flight directors, A/T ARM, CMD A, SPEED, HDG SEL, ALT HOLD, a climb with LVL CHG, a descent with V/S, then LNAV and VNAV along the FMC route.",
    minutes: 12,
    state: "running",
    air: { altFt: 6000, kias: 250 },
    fms: "ready",
    fuelKg: 7000,
    finished: "You used the main MCP modes and read the flight mode annunciations. Remember: always check the FMA after pressing a button. The FMA shows what the autopilot is doing, the button lights only show what you asked for.",
    steps: [
      {
        title: "The flight mode annunciations",
        why: "The top of the PFD shows the FMA in three parts: autothrottle, roll mode and pitch mode. Nothing is engaged yet: the aircraft is trimmed at 6000 ft and 250 kt. The MCP is the long panel above the screens. Press Next.",
        targets: [],
        panel: "main",
      },
      {
        title: "F/D: ON",
        why: "The flight director shows the autopilot's commands as magenta bars on the PFD.",
        targets: ["mcp-fd"],
        panel: "main",
        done: (s) => s.afcs.fd,
      },
      {
        title: "A/T ARM: ON",
        why: "Arms the autothrottle, so the autopilot can move the thrust levers.",
        targets: ["mcp-atArm"],
        panel: "main",
        done: (s) => s.afcs.atArm,
      },
      {
        title: "CMD A: engage the autopilot",
        why: "CMD shows on the PFD. With no mode chosen, it holds the attitude and the wings level: the FMA shows CWS R and CWS P.",
        targets: ["mcp-cmdA"],
        panel: "main",
        done: (s) => s.afcs.cmdA,
      },
      {
        title: "SPEED, then IAS 230",
        why: "Press SPEED: the autothrottle flies the IAS window speed (MCP SPD on the FMA). Then set 230 with the IAS − button (Shift for steps of 10). The thrust comes back and the aircraft slows.",
        targets: ["mcp-speed", "mcp-spd"],
        panel: "main",
        done: (s) => s.afcs.at === "MCP SPD" && mcp(s).spd === 230,
      },
      {
        title: "HEADING 270, then HDG SEL",
        why: "Set 270 in the HEADING window, then press HDG SEL. The aircraft turns to the magenta heading bug. FMA roll mode: HDG SEL.",
        targets: ["mcp-hdg", "mcp-hdgsel"],
        panel: "main",
        done: (s) => s.afcs.roll === "HDG SEL" && mcp(s).hdg === 270,
      },
      {
        title: "ALT HOLD",
        why: "Press ALT HOLD. The autopilot holds the present altitude. FMA pitch mode: ALT HOLD.",
        targets: ["mcp-althold"],
        panel: "main",
        done: (s) => s.afcs.pitch === "ALT HOLD",
      },
      {
        title: "ALTITUDE 10000, then LVL CHG",
        why: "Set 10000 in the ALTITUDE window (Shift for 1000 ft steps). Press LVL CHG: climb thrust (N1) and the pitch keeps the speed. FMA: N1, HDG SEL, MCP SPD.",
        targets: ["mcp-alt", "mcp-lvlchg"],
        panel: "main",
        done: (s) => mcp(s).alt === 10000 && (s.afcs.pitch === "MCP SPD" || s.afcs.pitch === "ALT ACQ"),
      },
      {
        title: "Wait: level off at 10,000 ft",
        why: "Near the altitude the FMA shows ALT ACQ, then ALT HOLD, and the autothrottle goes back to MCP SPD. The TIME button speeds this up.",
        targets: ["time-rate"],
        panel: "main",
        done: (s) => s.afcs.pitch === "ALT HOLD" && Math.abs(s.altFt - 10000) < 100,
      },
      {
        title: "ALTITUDE 8000, V/S, then −1000",
        why: "Set 8000 in the ALTITUDE window. Press V/S, then set −1000 with the VERT SPEED − button. The aircraft descends at 1000 ft per minute.",
        targets: ["mcp-alt", "mcp-vs", "mcp-vsw"],
        panel: "main",
        done: (s) => mcp(s).alt === 8000 && s.afcs.pitch === "V/S" && mcp(s).vs <= -900,
      },
      {
        title: "Wait: level off at 8000 ft",
        why: "V/S also stops at the ALTITUDE window: ALT ACQ, then ALT HOLD.",
        targets: ["time-rate"],
        panel: "main",
        done: (s) => s.afcs.pitch === "ALT HOLD" && Math.abs(s.altFt - 8000) < 100,
      },
      {
        title: "LNAV",
        why: "Press LNAV. The autopilot now follows the FMC route: it turns towards RZ101 (magenta on the ND, with the distance at the top right). FMA roll mode: LNAV.",
        targets: ["mcp-lnav"],
        panel: "main",
        done: (s) => s.afcs.roll === "LNAV",
      },
      {
        title: "ALTITUDE 14000, then VNAV",
        why: "Set 14000, then press VNAV. The FMC now controls the climb and the speed: VNAV SPD with N1. Here it is simplified: 250 kt below 10,000 ft and 280 kt above, up to the ALTITUDE window or the FMC cruise altitude, whichever is lower.",
        targets: ["mcp-alt", "mcp-vnav"],
        panel: "main",
        done: (s) => mcp(s).alt === 14000 && (s.afcs.pitch === "VNAV SPD" || s.afcs.pitch === "VNAV PTH" || s.afcs.pitch === "ALT ACQ"),
      },
      {
        title: "CMD A: disengage",
        why: "Press CMD A to take the autopilot off. The flight director bars stay, to guide you if you fly by hand. In a real aircraft you would hold the yoke first.",
        targets: ["mcp-cmdA"],
        panel: "main",
        done: (s) => !s.afcs.cmdA,
      },
    ],
  },
  {
    id: "b737-radios",
    title: "Radios and ATC clearance",
    summary: "At the gate on APU power: tune VHF 1, listen to the ATIS, set the QNH, get a clearance from Delivery and read it back, set the transponder and the cleared altitude.",
    minutes: 8,
    state: "powered",
    fms: "ready",
    fuelKg: 7000,
    qnh: 1008,
    callsign: CALLSIGN,
    clearance: {
      station: "delivery",
      atc: `${CALLSIGN}, Delhi Delivery, cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521.`,
      readbacks: [
        `Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, ${CALLSIGN}.`,
        `Cleared to Mumbai via runway 28, climb 5000 feet, squawk 4251, ${CALLSIGN}.`,
        `Roger, ${CALLSIGN}.`,
      ],
      hint: "Read back the route, the altitude and the squawk code exactly, then your callsign.",
    },
    finished: "You tuned the radio, used the ATIS, read back a clearance, and set the transponder and the cleared altitude. These frequencies are made up for training: always use the real published ones.",
    steps: [
      {
        title: "The radio panel",
        why: "On the pedestal, VHF 1 shows the active frequency on the left and the standby on the right. You tune the standby, then press ⇆ to swap them. These frequencies are made up for training. Press Next.",
        targets: ["vhf"],
        panel: "ped",
      },
      {
        title: "VHF 1: tune 126.025 (ATIS) and swap",
        why: "Use MHz − and + for the part before the dot, kHz − and + for the part after it (Shift for bigger steps). Then press ⇆. The ATIS plays in the radio box.",
        targets: ["vhf", "vhf-swap"],
        panel: "ped",
        done: (_s, c) => c.x.vhf1[0] === 126025,
      },
      {
        title: "Read the ATIS",
        why: "The ATIS gives the runway, wind, weather and QNH. Note the QNH. Press Next.",
        targets: [],
        panel: "ped",
      },
      {
        title: "BARO: set QNH 1008",
        why: "On the EFIS panel (left of the MCP), set the BARO to 1008. The altitude on the PFD then reads the airfield elevation, about 780 ft.",
        targets: ["efis-baro"],
        panel: "main",
        done: (_s, c) => !c.x.baro.std && c.x.baro.qnh === 1008,
      },
      {
        title: "VHF 1: tune DELIVERY 121.825 and swap",
        why: "Delivery gives the departure clearance.",
        targets: ["vhf", "vhf-swap"],
        panel: "ped",
        done: (_s, c) => c.x.vhf1[0] === 121825,
      },
      {
        title: "Read back the clearance",
        why: "Press SPEAK and say the read-back out loud (Chrome or Edge), or pick the correct one. It repeats the route, the altitude and the squawk exactly, so ATC can catch a mistake.",
        targets: ["readback-speak", "readback-0", "readback-1", "readback-2"],
        panel: "ped",
        done: (_s, c) => c.x.readBack,
      },
      {
        title: "TRANSPONDER: 4521",
        why: "Type 4, 5, 2, 1. Only the digits 0 to 7 exist on a transponder.",
        targets: ["xpdr"],
        panel: "ped",
        done: (_s, c) => c.x.xpdrCode === "4521",
      },
      {
        title: "MCP ALTITUDE: 5000",
        why: "The clearance said climb 5000 feet. Set it in the MCP ALTITUDE window, so the autopilot will not climb above it.",
        targets: ["mcp-alt"],
        panel: "main",
        done: (s) => s.afcs.mcp.alt === 5000,
      },
      {
        title: "VHF 1: put GROUND 121.775 on standby",
        why: "Get the next frequency ready. When Delivery says \"contact Ground\", one press of ⇆ is all you need.",
        targets: ["vhf"],
        panel: "ped",
        done: (_s, c) => c.x.vhf1[1] === 121775,
      },
    ],
  },
  {
    id: "b737-nav",
    title: "VOR and ILS",
    summary: "At the gate: tune and identify the RZV VOR on NAV 1, use the ND in VOR mode and the MCP COURSE to find your radial and the course to the station, then tune the ILS for runway 28 and read it in APP mode.",
    minutes: 8,
    state: "powered",
    fms: "ready",
    fuelKg: 7000,
    crs1: 360,
    finished: "You can tune and identify a VOR, find your radial and the course to the station, and read a localizer. The RZV VOR and the IRZ ILS are made up for training.",
    steps: [
      {
        title: "NAV 1: tune 113.35 (RZV) and swap",
        why: "The NAV 1 panel is on the pedestal, next to VHF 1. Tune the standby to 113.35, then press ⇆.",
        targets: ["nav", "nav-swap"],
        panel: "ped",
        done: (_s, c) => c.x.nav1[0] === 113350,
      },
      {
        title: "Identify: press ID and listen",
        why: "Never use a navaid you have not identified. You hear R Z V in Morse code (.-. --.. ...-).",
        targets: ["nav-id"],
        panel: "ped",
        done: (_s, c) => c.x.navIdHeard,
      },
      {
        title: "EFIS: VOR mode",
        why: "On the EFIS panel choose VOR. The ND shows a full compass with the course pointer and the deviation bar.",
        targets: ["efis-VOR"],
        panel: "main",
        done: (_s, c) => c.x.ndMode === "VOR",
      },
      {
        title: "COURSE: centre the bar with FROM",
        why: "Turn the MCP COURSE (left end of the MCP, Shift for 10°) until the deviation bar is in the middle and the ND shows FROM.",
        targets: ["mcp-crs"],
        panel: "main",
        done: (_s, _c, x) => x.nav.valid && x.nav.toFrom === "FROM" && Math.abs(x.nav.dev) < 0.1,
      },
      {
        title: "Read your radial",
        why: "With the bar centred and FROM, the course is the radial you are on: about 118. You are about 18 NM south-east of RZV (DME at the top right). Press Next.",
        targets: [],
        panel: "main",
      },
      {
        title: "COURSE: centre it with TO",
        why: "Add 180° (about 298) and centre the bar again. Now it shows TO: the course to fly to the station.",
        targets: ["mcp-crs"],
        panel: "main",
        done: (_s, _c, x) => x.nav.valid && x.nav.toFrom === "TO" && Math.abs(x.nav.dev) < 0.1,
      },
      {
        title: "HEADING: set it to the course",
        why: "To fly to RZV you would turn to that heading (plus a correction for wind). Set the MCP HEADING to the same number as the COURSE.",
        targets: ["mcp-hdg"],
        panel: "main",
        done: (s, c) => Math.abs(((s.afcs.mcp.hdg - c.crs1 + 540) % 360) - 180) <= 3,
      },
      {
        title: "NAV 1: tune 110.55 (ILS 28) and swap",
        why: "An ILS guides you to the runway. Its localizer shows the centreline and its glide slope the descent path.",
        targets: ["nav", "nav-swap"],
        panel: "ped",
        done: (_s, c) => c.x.nav1[0] === 110550,
      },
      {
        title: "EFIS: APP mode, COURSE 285",
        why: "Choose APP on the EFIS panel and set the COURSE to 285, the runway 28 localizer course.",
        targets: ["efis-APP", "mcp-crs"],
        panel: "main",
        done: (_s, c) => c.x.ndMode === "APP" && c.crs1 === 285,
      },
      {
        title: "Read the localizer",
        why: "The bar is far to the right: the runway centreline is to your right. The PFD also shows the localizer scale under the attitude. A localizer is about four times more sensitive than a VOR. Press Next.",
        targets: [],
        panel: "main",
      },
    ],
  },
  {
    id: "b737-fire",
    title: "Engine fire on the ground",
    summary: "Engines running at the gate when engine 1 catches fire: the fire bell and FIRE WARN, start lever to CUTOFF, pull the fire handle, turn it to fire both bottles, then the evacuation decision.",
    minutes: 5,
    state: "running",
    fms: "empty",
    switches: (sw) => {
      sw.parkBrake = true;
    },
    failAfterS: 8,
    failure: "fire1",
    finished: "You handled an engine fire on the ground the Boeing way: silence the bell, start lever CUTOFF, pull the handle, turn it to fire the bottles. The real procedure has more to it (ATC, the cabin crew, evacuation): follow the airline's procedures.",
    steps: [
      {
        title: "Wait: something is about to happen",
        why: "Both engines are running at the gate with the parking brake set. Listen.",
        targets: [],
        panel: "main",
        done: (s) => s.sys.fire[0],
      },
      {
        title: "FIRE WARN: press to silence the bell",
        why: "The fire bell rings and the red FIRE WARN light flashes on the glareshield. Press FIRE WARN: the bell stops. The fire is still there: the handle for the burning engine stays lit.",
        targets: ["fire-warn"],
        panel: "main",
        done: (_s, c) => !c.x.fireWarn,
      },
      {
        title: "Find the lit handle: ENG 1",
        why: "On the pedestal, the ENG 1 fire handle glows red, so the fire is in engine 1. Check it is engine 1 before you touch anything. The thrust levers are already at idle. Press Next.",
        targets: ["fire-1"],
        panel: "ped",
      },
      {
        title: "START LEVER 1: CUTOFF",
        why: "Cut the fuel to engine 1 with its start lever. The engine winds down.",
        targets: ["lever1-CUTOFF"],
        panel: "ped",
        done: (_s, c) => c.switches.startLever[0] === "CUTOFF",
      },
      {
        title: "ENG 1 fire handle: PULL",
        why: "Pull the ENG 1 fire handle up. This closes the engine's fuel valve, cuts its bleed air and generator, and arms the bottles.",
        targets: ["fire-1"],
        panel: "ped",
        done: (_s, c) => c.switches.fireHandle[0],
      },
      {
        title: "Turn the handle: bottle L",
        why: "Turn the handle to one side and hold it for a second: that fires one bottle into the engine. Press ◀ L under ENG 1. L BOTTLE DISCHARGED lights.",
        targets: ["fire-1-L"],
        panel: "ped",
        done: (_s, c) => c.switches.bottle.includes(1),
      },
      {
        title: "On the ground: the other bottle too (R)",
        why: "On the ground there is no reason to wait: turn the handle the other way to fire the second bottle. Press R ▶ under ENG 1.",
        targets: ["fire-1-R"],
        panel: "ped",
        done: (_s, c) => c.switches.bottle[0] === 1 && c.switches.bottle[1] === 1,
      },
      {
        title: "Fire out: decide on the evacuation",
        why: "A few seconds later the handle light goes out. The crew now tells ATC and decides with the cabin crew whether to evacuate the passengers.",
        targets: ["fire-1"],
        panel: "ped",
        done: (s) => s.sys.fireOut[0],
      },
    ],
  },
];
