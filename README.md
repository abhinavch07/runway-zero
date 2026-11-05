# Runway Zero

An open source A320neo-type cockpit procedures trainer that runs in a desktop browser.

> For learning only. Not approved for flight training credit or real-world operations.
> Not affiliated with or endorsed by Airbus or any airline. Lessons are simplified training flows written in our own words, not operator or manufacturer procedures.

## Status: procedures trainer

Procedures first, flying later. Runway Zero now teaches cockpit procedures step by step. There is no outside view.

Pick a lesson. The lesson list on the left tells you what to do and why. The control you need pulses yellow, the right panel opens by itself, and each step ticks off when the aircraft is in the right state.

Lessons:

1. **Power up and engine start** (cold and dark beside Delhi runway 28): batteries, external power, ADIRS, fuel pumps, APU, beacon, engine start, ready for taxi.
2. **MCDU setup: Delhi to Mumbai** (cold and dark): power up, then INIT A (FROM/TO, flight number, cost index, cruise level), the flight plan (departure runway 28, arrival runway 27, three training waypoints, clearing a discontinuity), INIT B (zero fuel weight and block fuel) and PERF TAKE OFF (V1, VR, V2, flaps, FLEX). The route then shows on the ND.
3. **Before start and engine start** (at the gate, APU running, MCDU already set up): flight directors on, QNH 1008 on the baro, FCU altitude 5000, check V1 and V2 on the PFD and the route on the ND, seat belts and beacon, start both engines, APU off, flaps 1.
4. **FCU basics** (in cruise at 10,000 ft with the autopilot on): read the FMA, change speed and heading, climb and descend with V/S, watch ALT* and ALT, disconnect and engage the autopilot.
5. **Shutdown and secure** (parked at the gate with engines running): APU start, engines off, ground power, ADIRS off, back to cold and dark.


Panels:

- **Overhead:** ADIRS, ELEC, FUEL, AIR, APU, exterior lights and signs. Lights follow the "dark cockpit" idea.
- **Main panel:** EFIS (FD and baro) and FCU on the glareshield, PFD, ND and the engine and warning display.
- **Pedestal:** the MCDU, engine masters, ENG MODE, thrust levers, flaps, gear, parking brake, with a small engine display.

Under the panels there is a real simulation: the JSBSim flight model, simple systems (electrics, APU, ADIRS alignment in 1 minute, fuel, bleed, engine start) and an autopilot with HDG, ALT, V/S, LOC and G/S. Screens stay dark without AC power, and the PFD and ND show flags until the ADIRS are aligned.

Known gaps:

- The flight model is JSBSim's public A320 model with small changes (see Licences). CFM56 engines, not LEAP.
- EGT is an approximation: the stand-in engine model does not calculate it.
- Simplified systems: no hydraulics, no ECAM system pages, no failures.
- All FCU values are "selected". The MCDU flight plan is not flown yet (no managed NAV mode).
- No real SIDs, STARs, approaches or airways in the MCDU.
- Headings are true, not magnetic (about 1° difference at Delhi).

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev               # open the address it prints, usually http://localhost:5173
```

No accounts, tokens or keys are needed.

Other commands:

```bash
npm run build         # production build in dist/
npm run preview       # serve the production build
npm run typecheck     # TypeScript check
npm run test:fdm      # run the flight model for 60 s in Node
npm run test:flights  # scripted test flights: cold start and taxi, ground, normal law, takeoff, ILS and landing
```

## Keys

| Key | Action |
| --- | --- |
| 1 | Overhead panel |
| 2 | Main panel |
| 3 | Pedestal |
| L | Lesson list |

Click switches and buttons with the mouse. MCDU: click it once, then you can type on your keyboard (Backspace is CLR, arrow keys scroll, Esc stops typing). FCU values: scroll the mouse wheel over a value, or use − / + (hold Shift for bigger steps).

## How it is built

```
src/
  main.ts               page, panels, lesson picker, display loop
  config.ts             start positions for the lessons
  lessons/lessons.ts    the lessons and their steps
  sim/fdm.worker.ts     runs the simulation in a Web Worker at 120 Hz
  sim/core.ts           JSBSim and start positions (shared with the Node tests)
  sim/fcc.ts            normal law, autopilot and autothrust
  sim/systems.ts        electrics, APU, ADIRS, fuel, bleed, engine start
  sim/ils.ts            ILS deviations
  sim/types.ts          messages between page and worker
  world/vidp.ts         VIDP runway data and the training ILS 28
  world/geo.ts          distance and bearing helpers
  world/route.ts        small navigation database: VIDP, VABB and the training waypoints
  cockpit/lessonPanel.ts  lesson list, highlights and step checking
  cockpit/mcdu.ts       MCDU: INIT A, INIT B, F-PLN, LAT REV, departure and arrival, PERF TAKE OFF
  cockpit/pfd.ts        PFD
  cockpit/nd.ts         ND
  cockpit/ewd.ts        engine and warning display
  cockpit/fcu.ts        FCU on the glareshield
  cockpit/efis.ts       EFIS: flight director and baro (QNH / STD)
  cockpit/levers.ts     pedestal: engine masters, thrust, flaps, gear, parking brake
  cockpit/overhead.ts   overhead panel
public/jsbsim/          JSBSim aircraft and engine files
scripts/                Node test scripts
```

### Writing a lesson

Each lesson in `src/lessons/lessons.ts` has a start position and a list of steps. A step has a title, a short "why", the controls to highlight (their `data-ctl` names), the panel to show, and a `done(state, controls, fms)` check. `fms` is the MCDU data. Steps without a `done` check wait for the learner to press Next. Use `want: true` or `want: false` on switch steps so switches already in place stop pulsing.

## Data sources

- Lessons are our own simplified training flows, written from general public knowledge of the A320 family. A type-rated pilot should review them.
- VIDP runway ends, headings and elevations: [OurAirports](https://github.com/davidmegginson/ourairports-data) (public domain).
- The MCDU is a small training version. Its pages follow the general A320 family idea but are not a copy of the real software. The RZ101, RZ102 and RZ103 waypoints are made up for training. VABB is listed by runway ident only. Take-off speeds in the lesson are training numbers, not performance data.
- ILS 28 is built from the runway geometry: a training stand-in, not the published procedure.

## Licences

- Runway Zero code: GPL v3 or later (see `LICENSE`).
- JSBSim and its A320 and engine data files: LGPL 2.1 (`public/jsbsim/COPYING-LGPL-2.1.txt`). The A320 model notes it is built from public data, for educational and entertainment use, and not to be sold. Our copy is modified: fuel tank position moved from 600 to 650 in, CmDe changed from -1.5 to -2.0 so the model can be trimmed at normal approach speeds, and nose gear steering widened from 5° to 70° for taxiing. The changes are noted at the top of `A320.xml`.
- JSBSim WebAssembly build: `@0x62/jsbsim-wasm`, MIT.
