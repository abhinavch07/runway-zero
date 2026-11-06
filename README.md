# Runway Zero

An open source cockpit procedures trainer that runs in a desktop browser: an A320neo-type and a 737-type airliner, and two light aircraft (C172-type and PA-28-type) with glass cockpits.

> For learning only. Not approved for flight training credit or real-world operations.
> Not affiliated with or endorsed by Airbus, Boeing, Cessna, Textron, Piper, Garmin, CFM or any airline. Lessons are simplified training flows written in our own words, not operator or manufacturer procedures.

## Status: procedures trainer

Procedures first, flying later. Runway Zero now teaches cockpit procedures step by step. There is no outside view.

Pick a lesson. The lesson list on the left tells you what to do and why. The control you need pulses yellow, the right panel opens by itself, and each step ticks off when the aircraft is in the right state.

Lessons:

1. **Power up** (cold and dark beside Delhi runway 28): batteries, external power, ADIRS, fuel pumps, APU, until the APU powers the aircraft and the ADIRS are aligned.
2. **MCDU setup: Delhi to Mumbai**: INIT A, the flight plan (runways, three training waypoints, a discontinuity), INIT B and PERF TAKE OFF. The route then shows on the ND.
3. **Radios and ATC clearance** (at the gate): VHF 1 on the radio management panel, the ATIS, a clearance from Delivery with a read-back, the transponder, the cleared altitude, the RAD NAV page.
4. **Before start and engine start** (at the gate): flight directors, QNH, FCU altitude, V1 and V2 on the PFD, route on the ND, doors on the DOOR page, signs and beacon, engine start, APU off, flaps.
5. **After start and taxi**: ground spoilers ARM, rudder trim, flaps, pitch trim, autobrake MAX, flight control check, HYD page, taxi, brake check, T.O CONFIG test, T.O memo.
6. **Take-off** (lined up on runway 28): brakes off, 50% N1, FLX/MCT, 100 knots, V1, rotate, gear up, CL, autothrust and autopilot, flaps up, level off at 5,000 ft.
7. **FCU basics** (in cruise): read the FMA, change speed, heading and altitude with V/S, disconnect and engage the autopilot.
8. **Fuel imbalance and crossfeed** (in cruise): FUEL page, X FEED, lighter side pumps off, balance with TIME ×8, back to normal.
9. **ECAM: a generator fault** (at the gate): GEN 1 fails, MASTER CAUT, read the ECAM, the actions, CLR.
10. **Shutdown and secure** (parked with engines running): APU start, engines off, ground power, ADIRS off, cold and dark.

Panels:

- **Overhead:** ADIRS, HYD, ELEC, FUEL, AIR, ANTI ICE, APU, exterior lights and signs. Lights follow the "dark cockpit" idea.
- **Main panel:** MASTER CAUT, EFIS (FD and baro) and FCU on the glareshield, a sidestick pad (or arrow keys), PFD, ND and the engine and warning display.
- **Pedestal:** the MCDU (with RAD NAV), the radio management panel (VHF 1) and ATC transponder, the lower ECAM with its control panel (ENG, BLEED, ELEC, HYD, FUEL, DOOR, F/CTL pages, CLR, T.O CONFIG), autobrake, speedbrake with spoiler ARM, rudder trim, pitch trim, tiller, toe brakes, thrust detents (CL, FLX/MCT, TOGA), engine masters, ENG MODE, thrust levers, flaps, gear, parking brake, with a small engine display.

Under the panels there is a real simulation: the JSBSim flight model, simple systems (electrics, APU, ADIRS alignment in 1 minute, fuel, bleed, engine start) and an autopilot with HDG, ALT, V/S, LOC and G/S. Screens stay dark without AC power, and the PFD and ND show flags until the ADIRS are aligned.

Checklists: the CHECKLIST button in the top bar (or the C key) opens the normal checklists for the aircraft: cockpit preparation, before start, after start, before take-off, before landing, after landing and parking (securing on the light aircraft). Each line is a challenge and a response. Lines the trainer can check turn green when the aircraft is really set that way and amber when not. Lines it cannot check, such as briefings and the cabin, are ticked by hand. They are simplified training checklists in our own words, not the manufacturer's or an airline's.

The A320 lower ECAM has an APU page (N, EGT, APU GEN, APU BLEED, intake flap). It opens by itself while the APU starts and closes 10 seconds after AVAIL.

Sound, on every aircraft: cockpit hum when powered, APU, engines, switch clicks and a chime for each finished step. Also:

- Engine and APU starts: start valve air, igniter ticks, a light-off rumble, the APU door.
- Airliner systems: the A320 PTU bark, electric hydraulic pumps, fuel pumps, packs airflow, cockpit fans.
- Light aircraft: the electric fuel pump ticking, primer strokes, the standby gyro spinning up, cylinder chugs while cranking.
- Alerts: autopilot disconnect (a warble on the 737, a short trumpet call on the A320), altitude alert, caution chimes, the PA-28 FUEL PRESS beep.

All sound is made in the browser with Web Audio, with no recordings. Use the speaker button and slider in the top bar, or M. Sound starts after your first click (browsers require that).

Radio voice: in the radio lessons, the ATIS, ATC and your correct read-back are spoken aloud with the browser's built-in voices (Web Speech API, free, nothing to download). ATC uses an Indian English voice when your computer has one, and the pilot uses a different voice. Numbers and callsigns are said the radio way (two eight, Victor Tango Romeo Zulu Alfa). The speaker button also mutes the voice. Which voices you hear depends on your browser and operating system.

Known gaps:

- The flight model is JSBSim's public A320 model with small changes (see Licences). CFM56 engines, not LEAP.
- EGT is an approximation: the stand-in engine model does not calculate it.
- Simplified systems: hydraulics, packs and anti-ice are on/off models. Only one failure exists (GEN 1). ECAM pages are our own simplified layouts. Pitch and rudder trim on the pedestal are for the checks only and do not move the flight model.
- All FCU values are "selected". The MCDU flight plan is not flown yet (no managed NAV mode).
- No real SIDs, STARs, approaches or airways in the MCDU.
- Headings are true, not magnetic (about 1° difference at Delhi).

## Cessna 172

A second aircraft: a C172-type light aircraft with a glass cockpit (its own page, `c172.html`). Pick it from the aircraft tabs in the lesson list.

1. **Before start and engine start**: fuel shutoff and selector, master (BAT and ALT), standby battery, beacon, mixture and throttle, priming with the electric fuel pump, the magneto key, oil pressure, 1000 RPM, avionics.
2. **PFD and MFD basics**: the PFD tapes, colours and HSI, baro and heading bug, the MFD engine strip, fuel and electrics.
3. **Radios and ATC clearance**: COM tuning with standby and swap, the ATIS, a clearance from Ground with a read-back, the transponder.
4. **VOR and ILS**: tune and identify a VOR (Morse ident), find the radial (FROM) and the course to the station (TO), tune the ILS and read the localizer.
5. **Run-up before take-off**: brakes, mixture, flight controls, fuel, trim, 1800 RPM, magneto check, engine and electrics, idle check, flaps.
6. **Alternator failure**: LOW VOLTS, volts and amps, reset ALT, ALT off, shed load, plan to land.
7. **Fuel management and starvation**: an empty selected tank stops the engine, switch tanks, fuel pump, restart.
8. **Shutdown and secure**: avionics off, mixture to idle cut-off, magnetos off, master off, fuel selector to one tank.

The flight model is JSBSim's public Cessna 172 (`c172p`) with its IO-320 engine. Our own code adds the electrics (24 V battery, 28 V alternator, essential and avionics buses, standby battery), the fuel selector and shutoff, priming with the fuel pump, and the spring-loaded START position of the key. The engine is fuel injected, so there is no carb heat and no primer knob. The glass PFD and MFD are our own drawings in the general style of light-aircraft glass cockpits, not copies of any manufacturer's display.

## PA-28

A third aircraft: a PA-28-type low-wing light aircraft with a glass cockpit (its own page, `pa28.html`, sharing the C172 page code). Pick it from the aircraft tabs in the lesson list.

1. **Before start and engine start**: fuel selector (no BOTH position), master, standby battery, beacon, electric fuel pump and fuel pressure, mixture and throttle, the hand primer, the magneto key, oil pressure, 1000 RPM, electric pump off with a pressure check, avionics.
2. **Radios and ATC clearance**: as the C172, with the callsign VT-RZP.
3. **VOR and ILS**: as the C172.
4. **Run-up before take-off**: brakes, mixture, controls, take-off on the fuller tank, electric fuel pump on, trim, 2000 RPM, magneto check, carb heat (described), engine and fuel pressure, idle check, flaps up.
5. **Switching fuel tanks**: electric pump on, select the full tank, check the pressure, pump off, note the time.
6. **Engine fuel pump failure**: the engine-driven pump fails, FUEL PRESS warning, electric pump on at once, check the pressure, plan to land.
7. **Shutdown and secure**: fuel pump off, avionics off, mixture to idle cut-off, magnetos off, master off, fuel selector OFF.

The flight model is JSBSim's public PA-28-180 (`pa28`) with its 180 hp engine, changed for Runway Zero: two 25-gallon wing tanks instead of one, a fixed-pitch propeller (`prop_75in2f`), main wheels that no longer steer, and flaps of 0, 10, 25 and 40 degrees. Our own code adds the hand primer, fuel pressure from the engine-driven and electric pumps, the carburettor running on for a few seconds when the pressure is lost, and the fuel pump failure. On the MFD the fuel pressure bar takes the place of EGT.

## 737

A fourth aircraft: a 737-type airliner with large screens (its own page, `737.html`). Pick it from the aircraft tabs in the lesson list. Three panels: overhead, main panel (EFIS, MCP, PFD, ND and engine display) and pedestal (CDU, thrust and start levers, flaps, VHF 1, NAV 1, transponder).

1. **Power up from cold and dark**: battery, IRS to NAV, APU start, APU GEN on both buses, position lights, APU bleed, IRS alignment.
2. **FMC route set-up**: IDENT, POS INIT (reference airport, GPS position to SET IRS POS), RTE pages (origin, destination, runway, flight number, the RZ waypoints), ACTIVATE and EXEC, PERF INIT (ZFW, reserves, cost index, cruise altitude), TAKEOFF REF (flaps and V speeds).
3. **Engine start**: fuel pumps, electric hydraulic pumps, anti-collision light, packs off for duct pressure, engine 2 then 1 (start switch GRD, start lever IDLE at 25% N2, starter cut-out at 56% N2), generators on, packs on, APU bleed and APU off.
4. **MCP autopilot basics** (in flight): F/D, A/T ARM, CMD A, SPEED, HDG SEL, ALT HOLD, LVL CHG climb, V/S descent, LNAV and VNAV on the FMC route, reading the FMA.
5. **Radios and ATC clearance**: VHF 1, the ATIS, QNH on the EFIS panel, a clearance from Delivery with a spoken read-back, transponder, cleared altitude on the MCP.
6. **VOR and ILS**: NAV 1, Morse ident, the ND in VOR mode with the MCP COURSE (radial, TO and FROM), then the ILS in APP mode.

The flight model is JSBSim's public 737 model with its CFM56 engines. The only change is that the network inputs at the end of the file are removed, because a browser cannot open them. Our own code adds simplified systems (battery, APU, AC buses with APU and engine generators, IRS, six fuel pumps with centre tank feed, hydraulic systems A and B, bleed air and duct pressure, the 737 style engine start) and an autopilot with the MCP modes. The autopilot is simplified: CMD A with no mode holds attitude and wings level (CWS), and VNAV climbs at 250 kt below 10,000 ft and 280 kt above, to the lower of the MCP and FMC altitudes, with no descent path. The screens, MCP and CDU are our own drawings in the general style of the newer large-screen 737 cockpits, not copies of the real ones. The take-off speeds on the CDU come from a simple made-up rule, not real performance data.

## Training radio and navigation data

All radio frequencies and navaids are made up for training and labelled TRAINING or RZ: RZ ATIS 126.025, RZ DELIVERY 121.825, RZ GROUND 121.775, RZ TOWER 118.325, the RZV VOR on 113.35 (18 NM north-west of Delhi) and the IRZ ILS 28 on 110.55. Never use them for real flight. The A320 top bar has a TIME button (×1, ×4, ×8) to speed up long waits.

## Try it online

https://abhinavch07.github.io/runway-zero/

The site is the built `dist/` folder on the `gh-pages` branch. To publish the latest `main`, run `npm run publish:pages`. GitHub Pages is set to Deploy from a branch: `gh-pages`, `/ (root)`.

After each lesson there is a 5-question quiz, with the answer and the reason after each question. 4 out of 5 passes. The lesson list shows a green tick when a lesson is finished and its quiz is passed, and a half tick when the lesson is finished but the quiz is not passed yet. Progress is saved in the browser only.

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
npm run test:c172     # C172 start-up, run-up and shutdown in Node
npm run test:pa28     # PA-28 primer start, run-up, take-off and climb in Node (add "pump" or "dry" for the failures)
npm run test:737      # 737 power up, engine start and every autopilot mode in Node
npm run test:flights  # scripted test flights: cold start and taxi, ground, normal law, takeoff, ILS and landing
```

## Keys

| Key | Action |
| --- | --- |
| 1 | Overhead panel |
| 2 | Main panel |
| 3 | Pedestal |
| L | Lesson list |
| Arrow keys | A320 sidestick (not while typing in the MCDU) |
| M | Sound on / off |

Click switches and buttons with the mouse. MCDU: click it once, then you can type on your keyboard (Backspace is CLR, arrow keys scroll, Esc stops typing). FCU values: scroll the mouse wheel over a value, or use − / + (hold Shift for bigger steps).

## How it is built

```
src/
  main.ts               page, panels, lesson picker, display loop
  config.ts             start positions for the lessons
  lessons/lessons.ts    the A320 lessons and their steps
  lessons/catalog.ts    every aircraft and its lessons, for the lesson picker
  shell/picker.ts       lesson picker with aircraft tabs, shared by both pages
  c172/                 the light aircraft (C172 and PA-28): page, worker, systems, PFD, MFD, lower panel, lessons
                        (sim/variant.ts holds what differs between the two, pa28Lessons.ts the PA-28 lessons)
  b737/                 the 737: page, worker, systems, autopilot (sim/afcs.ts), PFD, ND, engine display,
                        overhead, MCP, pedestal, CDU (cockpit/cdu.ts), lessons
  lessons/quizzes.ts    five quiz questions for each lesson
  lessons/progress.ts   lesson ticks and best quiz scores, saved in the browser
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
  cockpit/quiz.ts       the quiz dialog
  cockpit/mcdu.ts       MCDU: INIT A, INIT B, F-PLN, LAT REV, departure and arrival, PERF TAKE OFF
  cockpit/pfd.ts        PFD
  cockpit/nd.ts         ND
  cockpit/ewd.ts        engine and warning display
  cockpit/fcu.ts        FCU on the glareshield
  cockpit/efis.ts       EFIS: flight director and baro (QNH / STD)
  cockpit/ecam.ts       ECAM alerts and action lines, T.O memo, T.O CONFIG test
  cockpit/sd.ts         lower ECAM system pages
  cockpit/rmp.ts        A320 radio management panel and ATC transponder
  radio/training.ts     made-up training frequencies and navaids
  radio/navReceiver.ts  VOR radial, TO/FROM and needle, localizer and glide slope
  radio/radioBox.ts     what is heard on the radio, clearance read-back
  audio/sound.ts        cockpit sound made with Web Audio
  audio/extras.ts       system sounds, start sounds and alerts
  shell/checklist.ts    the checklist panel shared by every aircraft
  checklists/           the checklists: a320.ts, b737.ts, ga.ts (C172 and PA-28)
  radio/voice.ts        spoken radio messages (Web Speech API)
  cockpit/levers.ts     pedestal: engine masters, thrust, flaps, gear, parking brake
  cockpit/overhead.ts   overhead panel
public/jsbsim/          JSBSim aircraft and engine files
scripts/                Node test scripts
```

### Writing a lesson

Each lesson in `src/lessons/lessons.ts` has a start position and a list of steps. A step has a title, a short "why", the controls to highlight (their `data-ctl` names), the panel to show, and a `done(state, controls, fms)` check. `fms` is the MCDU data. Steps without a `done` check wait for the learner to press Next. Use `want: true` or `want: false` on switch steps so switches already in place stop pulsing.

## Data sources

- Lessons and quiz questions are our own simplified training flows, written from general public knowledge of the A320 family. A type-rated pilot should review them.
- VIDP runway ends, headings and elevations: [OurAirports](https://github.com/davidmegginson/ourairports-data) (public domain).
- The MCDU is a small training version. Its pages follow the general A320 family idea but are not a copy of the real software. The RZ101, RZ102 and RZ103 waypoints are made up for training. VABB is listed by runway ident only. Take-off speeds in the lesson are training numbers, not performance data.
- ILS 28 is built from the runway geometry: a training stand-in, not the published procedure.

## Licences

- Runway Zero code: GPL v3 or later (see `LICENSE`).
- JSBSim and its A320 and engine data files: LGPL 2.1 (`public/jsbsim/COPYING-LGPL-2.1.txt`). The A320 model notes it is built from public data, for educational and entertainment use, and not to be sold. Our copy is modified: fuel tank position moved from 600 to 650 in, CmDe changed from -1.5 to -2.0 so the model can be trimmed at normal approach speeds, and nose gear steering widened from 5° to 70° for taxiing. The changes are noted at the top of `A320.xml`.
- JSBSim Cessna 172 (`aircraft/c172p`, `engine/eng_io320.xml`, `engine/prop_75in2f.xml`): LGPL 2.1, unmodified. The model notes it is built from public data, for educational and entertainment use, and not to be sold.
- JSBSim 737 (`aircraft/737`, `engine/CFM56.xml`): the model file states the GPL. Our copy only removes the telnet and socket inputs, and the change is noted in its header. The model notes it is built from public data, for educational and entertainment use, and not to be sold.
- JSBSim PA-28-180 (`aircraft/pa28`, `engine/engIO360C.xml`): LGPL 2.1. The aircraft file is modified (two tanks, fixed-pitch propeller, main wheel steering off, 10° first flap stage), and the changes are noted in its header. The model notes it is built from public data, for educational and entertainment use, and not to be sold.
- JSBSim WebAssembly build: `@0x62/jsbsim-wasm`, MIT.
