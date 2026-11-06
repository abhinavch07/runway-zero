<p align="center">
  <img src="docs/images/banner.svg" alt="Runway Zero: learn cockpit procedures in your browser" width="100%">
</p>

<p align="center">
  <a href="https://abhinavch07.github.io/runway-zero/"><b>▶ Try it now in your browser</b></a>
  &nbsp;·&nbsp; free &nbsp;·&nbsp; nothing to install &nbsp;·&nbsp; no account
</p>

<p align="center">
  <img alt="Licence GPL v3" src="https://img.shields.io/badge/licence-GPL%20v3-blue">
  <img alt="Aircraft" src="https://img.shields.io/badge/aircraft-4-orange">
  <img alt="Lessons" src="https://img.shields.io/badge/lessons-31-brightgreen">
  <img alt="Runs in" src="https://img.shields.io/badge/runs%20in-desktop%20browser-lightgrey">
</p>

**Runway Zero** teaches you how to work a real cockpit, one switch at a time. Bring an airliner to life from cold and dark, set up the flight computer for Delhi to Mumbai, start the engines, talk to ATC and fly the autopilot. Or start a light aircraft and handle a failure. A guide tells you what to do and why, the right switch pulses yellow, and each step ticks off only when the aircraft is really set that way.

<p align="center">
  <img src="docs/images/b737-engine-start.gif" alt="A B737 engine start lesson: the lesson ticks off on the left while N2 and EGT rise on the engine display" width="90%">
  <br><sub>A B737 engine start: fuel pumps, hydraulics, packs off, start switch to GRD, start lever to IDLE at 25% N2.</sub>
</p>

> [!IMPORTANT]
> For learning only. Not approved for flight training credit or real-world operations. Not affiliated with or endorsed by Airbus, Boeing, Cessna, Textron, Piper, Garmin, CFM or any airline. Lessons and checklists are simplified training flows written in our own words, not operator or manufacturer procedures.

## Highlights

- 🛫 **Four aircraft**: an A320neo-type and a B737-type airliner, and C172-type and PA-28-type light aircraft with glass cockpits.
- 🧭 **31 guided lessons**: the control you need pulses yellow, the right panel opens by itself, and each step explains why.
- ✅ **Real checks**: steps and checklists look at the actual aircraft state, not at which button you clicked.
- 📋 **Normal checklists** for every aircraft: cockpit prep, before start, after start, before take-off, before landing, after landing and parking.
- 📝 **A quiz after every lesson**: 5 questions, with the answer and the reason after each one.
- 🎙️ **Spoken ATC**: listen to the ATIS, get a clearance and pick the right read-back. ATC speaks with an Indian English voice when your computer has one.
- 🔊 **Cockpit sound**: APU and engine starts, the A320 PTU bark, pumps, packs, the autopilot disconnect, the fuel pump ticking in a Cessna. All made in the browser, no recordings.
- ✈️ **A real flight model underneath**: JSBSim, the open source flight dynamics engine, running in your browser.
- 💾 **Your progress is saved** in your browser, with a tick for every finished lesson and passed quiz.

## The aircraft

<table>
  <tr>
    <td width="50%"><img src="docs/images/a320-main.png" alt="A320 main panel in cruise with the PFD, ND and engine display"></td>
    <td width="50%"><img src="docs/images/b737-main.png" alt="B737 main panel with the MCP, PFD showing CMD and LNAV, ND with the route"></td>
  </tr>
  <tr>
    <td><b>A320neo-type</b>: overhead, FCU, PFD, ND, ECAM with system pages, MCDU, radio management panel. 10 lessons from power up to a generator fault.</td>
    <td><b>B737-type</b>: overhead, MCP, three large screens, CDU, start levers, radios. 6 lessons from cold and dark to LNAV and VNAV.</td>
  </tr>
  <tr>
    <td><img src="docs/images/c172-instruments.png" alt="C172 glass cockpit PFD and MFD"></td>
    <td><img src="docs/images/pa28-panel.png" alt="PA-28 lower panel with the fuel selector, hand primer and engine readout"></td>
  </tr>
  <tr>
    <td><b>C172-type</b>: glass PFD and MFD, magneto key, fuel selector and shutoff. 8 lessons including an alternator failure.</td>
    <td><b>PA-28-type</b>: low wing, left and right tanks with no BOTH, hand primer, fuel pressure. 7 lessons including a fuel pump failure.</td>
  </tr>
</table>

## A closer look

<table>
  <tr>
    <td width="33%"><img src="docs/images/checklist.png" alt="B737 before take-off checklist card with green and amber lines"></td>
    <td width="33%"><img src="docs/images/radio-clearance.png" alt="Radio box with an ATC clearance and three read-back choices"></td>
    <td width="33%"><img src="docs/images/a320-ecam-apu.png" alt="A320 lower ECAM APU page during the APU start"></td>
  </tr>
  <tr>
    <td><b>Checklists</b>: green when set, amber when not, a box for items you tick yourself (press <kbd>C</kbd>).</td>
    <td><b>ATC clearance</b>: listen, then pick the correct read-back. A wrong one gets "negative" and a hint.</td>
    <td><b>A320 APU page</b>: opens by itself during the APU start, with N and EGT.</td>
  </tr>
  <tr>
    <td><img src="docs/images/b737-cdu.png" alt="B737 CDU on the route page with the training waypoints"></td>
    <td><img src="docs/images/quiz.png" alt="A quiz question with the right answer in green and the reason below"></td>
    <td><img src="docs/images/lesson-picker.png" alt="The lesson list with aircraft tabs and progress ticks"></td>
  </tr>
  <tr>
    <td><b>B737 FMC</b>: POS INIT, route, ACTIVATE and EXEC, PERF INIT and take-off speeds.</td>
    <td><b>Quizzes</b>: 4 out of 5 to pass, with the reason after every answer.</td>
    <td><b>Lesson list</b>: aircraft tabs, and a tick when a lesson and its quiz are done.</td>
  </tr>
</table>

<p align="center">
  <img src="docs/images/a320-overhead.png" alt="The A320 overhead during the power up lesson, with the lesson guide on the left" width="90%">
  <br><sub>The lesson guide on the left, and the A320 overhead during power up.</sub>
</p>

## Every lesson

| Aircraft | # | Lesson | What you learn |
| --- | --- | --- | --- |
| A320 | 1 | Power up | Batteries, ground power, ADIRS, fuel pumps and the APU, from cold and dark |
| A320 | 2 | MCDU setup: Delhi to Mumbai | INIT A, the flight plan with training waypoints, INIT B, PERF take-off |
| A320 | 3 | Radios and ATC clearance | VHF 1, the ATIS, a clearance with a spoken read-back, transponder, RAD NAV |
| A320 | 4 | Before start and engine start | FD, QNH, FCU altitude, V speeds, doors, beacon, both engines, APU off |
| A320 | 5 | After start and taxi | Spoilers, trims, flaps, autobrake, flight control check, T.O CONFIG |
| A320 | 6 | Take-off | Thrust, 100 knots, V1, rotate, gear up, CL, autopilot, level at 5,000 ft |
| A320 | 7 | FCU basics | Read the FMA, change speed, heading and altitude, V/S, AP on and off |
| A320 | 8 | Fuel imbalance and crossfeed | FUEL page, X FEED, pumps off on the lighter side, balance |
| A320 | 9 | ECAM: a generator fault | GEN 1 fails, MASTER CAUT, ECAM actions, CLR |
| A320 | 10 | Shutdown and secure | APU start, engines off, ground power, ADIRS off, cold and dark |
| B737 | 1 | Power up from cold and dark | Battery, IRS, APU start, APU generators, APU bleed |
| B737 | 2 | FMC route set-up | IDENT, POS INIT, RTE, ACTIVATE and EXEC, PERF INIT, TAKEOFF REF |
| B737 | 3 | Engine start | Packs off, start switch GRD, start lever IDLE at 25% N2, generators on |
| B737 | 4 | MCP autopilot basics | F/D, A/T, CMD A, SPEED, HDG SEL, ALT HOLD, LVL CHG, V/S, LNAV, VNAV |
| B737 | 5 | Radios and ATC clearance | VHF 1, the ATIS, QNH, a spoken clearance, transponder, MCP altitude |
| B737 | 6 | VOR and ILS | NAV 1, Morse ident, ND in VOR mode, radial TO and FROM, ILS in APP mode |
| C172 | 1 | Before start and engine start | Fuel, master, priming with the fuel pump, the key, oil pressure, avionics |
| C172 | 2 | PFD and MFD basics | Tapes, colours, HSI, baro, heading bug, engine strip, fuel and electrics |
| C172 | 3 | Radios and ATC clearance | COM tuning, the ATIS, a clearance from Ground, transponder |
| C172 | 4 | VOR and ILS | Tune and identify a VOR, radial FROM, course TO, the localizer |
| C172 | 5 | Run-up before take-off | 1800 RPM, magneto check, engine and electrics, trim, flaps |
| C172 | 6 | Alternator failure | LOW VOLTS, reset the alternator, shed load, plan to land |
| C172 | 7 | Fuel management and starvation | An empty tank stops the engine, switch tanks, restart |
| C172 | 8 | Shutdown and secure | Avionics off, mixture to cut-off, magnetos off, master off |
| PA-28 | 1 | Before start and engine start | Fuel selector, electric fuel pump, hand primer, the key, fuel pressure |
| PA-28 | 2 | Radios and ATC clearance | As the C172, with the callsign VT-RZP |
| PA-28 | 3 | VOR and ILS | As the C172 |
| PA-28 | 4 | Run-up before take-off | Fuller tank, fuel pump on, 2000 RPM, magneto check, carb heat |
| PA-28 | 5 | Switching fuel tanks | Fuel pump on, change tanks, check the pressure, note the time |
| PA-28 | 6 | Engine fuel pump failure | FUEL PRESS, electric pump on at once, plan to land |
| PA-28 | 7 | Shutdown and secure | Fuel pump off, mixture to cut-off, magnetos off, fuel selector OFF |

## How to use it

1. Open **[the trainer](https://abhinavch07.github.io/runway-zero/)** in Chrome, Edge, Firefox or Safari on a desktop or laptop.
2. Pick an aircraft tab and a lesson. Click anywhere once so the browser lets the sound play.
3. Read the step on the left. The control to use pulses yellow, and the right panel opens by itself.
4. Do what the step says. It ticks off when the aircraft is really in that state.
5. At the end, take the quiz. Press <kbd>C</kbd> any time to open the checklists.

| Key | Action |
| --- | --- |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> | Switch panels (overhead, main panel, pedestal, or instruments and lower panel on the light aircraft) |
| <kbd>L</kbd> | Lesson list |
| <kbd>C</kbd> | Checklists |
| <kbd>M</kbd> | Sound on or off |
| Arrow keys | A320 sidestick |
| Shift + click | Bigger steps on the − and + buttons |

Long waits, like IRS alignment or a climb, have a **TIME** button in the top bar on the airliners (×1, ×4, ×8).

## FAQ

**Is it free?**
Yes. It is open source under the GPL v3 and runs in your browser. There are no accounts, ads or payments.

**Can I log hours or use it for my licence?**
No. It is a learning aid for procedures, not an approved training device.

**Is it a full flight simulator?**
Not yet. It is a procedures trainer, so there is no outside view. Under the panels there is a real flight model (JSBSim), so the aircraft does move, climb and turn. Flying by hand comes later.

**Are the checklists and lessons the real ones?**
No. They are simplified flows in our own words, from general public knowledge. Always use your airline's or school's documents for real flying.

**Are the frequencies and waypoints real?**
No. All radio frequencies, navaids and waypoints are made up for training and labelled TRAINING or RZ. Never use them for real flight.

**I can't hear anything.**
Browsers only allow sound after your first click or key press. Check the speaker button in the top bar is on. The spoken ATC uses your computer's own voices, so the voice depends on your browser and system.

**Does it work on a phone?**
It is made for a desktop or laptop screen with a mouse. A tablet may work, but the panels are small.

**Where is my progress saved?**
In your browser only. Clearing your browser data, or using another browser, starts fresh. The lesson list has a Reset progress button.

## Contributing

You don't need to write code to help.

- **Pilots and instructors**: try a lesson or a checklist and tell us what is wrong or missing. Type-rated pilots for the A320 and B737, and flight instructors for the C172 and PA-28, are especially welcome.
- **Learners**: tell us what was confusing, or which lesson you would like next.
- **Developers**: bug fixes, new lessons, new panels and better sounds are all welcome.

Open an [issue](https://github.com/abhinavch07/runway-zero/issues) with what you found. For code, fork the repository, make your change on a branch, run `npm run typecheck`, and open a pull request.

---

## For developers

### Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev               # open the address it prints, usually http://localhost:5173
```

No accounts, tokens or keys are needed.

```bash
npm run build         # production build in dist/
npm run preview       # serve the production build
npm run typecheck     # TypeScript check
npm run test:fdm      # run the flight model for 60 s in Node
npm run test:c172     # C172 start-up, run-up and shutdown in Node
npm run test:pa28     # PA-28 primer start, run-up, take-off and climb in Node (add "pump" or "dry" for the failures)
npm run test:737      # B737 power up, engine start and every autopilot mode in Node
npm run test:flights  # scripted test flights: cold start and taxi, ground, normal law, takeoff, ILS and landing
```

### Publishing

The site is the built `dist/` folder on the `gh-pages` branch. To publish the latest `main`, run `npm run publish:pages`. GitHub Pages is set to Deploy from a branch: `gh-pages`, `/ (root)`.

### How it is built

Each aircraft has its own page: `index.html` (A320), `737.html` (B737), `c172.html` and `pa28.html` (the light aircraft share one script). The flight model runs in a Web Worker at 120 Hz. The page draws the panels and screens, runs the lessons and plays the sound.

```
src/
  main.ts               A320 page, panels, lesson picker, display loop
  config.ts             A320 start positions
  lessons/              lessons.ts (A320), quizzes.ts (every aircraft), catalog.ts, progress.ts
  shell/picker.ts       lesson list with aircraft tabs, shared by every page
  shell/checklist.ts    checklist panel, shared by every page
  checklists/           a320.ts, b737.ts, ga.ts (C172 and PA-28)
  sim/                  A320: worker, JSBSim core, normal law and autopilot (fcc.ts), systems, ILS
  cockpit/              A320: PFD, ND, engine and warning display, ECAM pages, FCU, EFIS, MCDU,
                        radio panel, overhead, pedestal levers, and the shared lesson panel and quiz
  b737/                 B737: page, worker, systems, autopilot (sim/afcs.ts), PFD, ND, engine display,
                        overhead, MCP, pedestal, CDU (cockpit/cdu.ts), lessons
  c172/                 light aircraft: page, worker, systems, PFD, MFD, lower panel, lessons
                        (sim/variant.ts holds what differs between the C172 and the PA-28)
  radio/                training frequencies, the NAV receiver, the radio box, spoken ATC (voice.ts)
  audio/                sound.ts (hum, APU, engines, clicks, chimes), extras.ts (systems, starts, alerts)
  world/                VIDP runway data, the training ILS 28, geo helpers, the training waypoints
public/jsbsim/          JSBSim aircraft and engine files
scripts/                Node test scripts
docs/images/            the pictures in this README
```

### Writing a lesson

Each lesson has a start position and a list of steps. A step has a title, a short "why", the controls to highlight (their `data-ctl` names), the panel to show, and a `done(state, controls, extra)` check. Steps without a `done` check wait for the learner to press Next. Use `want: true` or `want: false` on switch steps so switches already in place stop pulsing. Add 5 quiz questions for the lesson in `src/lessons/quizzes.ts`.

### What is simplified

- **A320**: the flight model is JSBSim's public A320 with CFM56 engines, not LEAP. EGT is an approximation. Hydraulics, packs and anti-ice are on/off models. The only failure is GEN 1. All FCU values are selected, and the MCDU flight plan is not flown yet. Headings are true, not magnetic.
- **B737**: JSBSim's public 737 with CFM56 engines. CMD A with no mode holds attitude and wings level (CWS). VNAV only climbs, at 250 kt below 10,000 ft and 280 kt above. Take-off speeds come from a simple made-up rule. The screens, MCP and CDU are our own drawings in the general style of the newer large-screen cockpits.
- **C172 and PA-28**: the glass PFD and MFD are our own drawings in the general style of light aircraft glass cockpits. The PA-28 model is changed to two tanks, a fixed-pitch propeller and 0, 10, 25 and 40 degree flaps.
- **Everywhere**: IRS and ADIRS alignment takes 60 seconds, not several minutes. Sounds are made up in the browser, not recordings.

### Training radio and navigation data

RZ ATIS 126.025, RZ DELIVERY 121.825, RZ GROUND 121.775, RZ TOWER 118.325, the RZV VOR on 113.35 (18 NM north-west of Delhi) and the IRZ ILS 28 on 110.55. The RZ101, RZ102 and RZ103 waypoints lie between Delhi and Mumbai. All made up for training.

### Data sources

- Lessons, checklists and quiz questions are our own simplified training flows, written from general public knowledge. A type-rated pilot (or a flight instructor for the light aircraft) should review them.
- VIDP runway ends, headings and elevations: [OurAirports](https://github.com/davidmegginson/ourairports-data) (public domain).
- The MCDU and CDU are small training versions, not copies of the real software. VABB is listed by runway ident only. ILS 28 is built from the runway geometry, a training stand-in, not the published procedure.

### Licences

- Runway Zero code: GPL v3 or later (see `LICENSE`).
- JSBSim and its A320 and engine data files: LGPL 2.1 (`public/jsbsim/COPYING-LGPL-2.1.txt`). The A320 model notes it is built from public data, for educational and entertainment use, and not to be sold. Our copy is modified: fuel tank position moved from 600 to 650 in, CmDe changed from -1.5 to -2.0 so the model can be trimmed at normal approach speeds, and nose gear steering widened from 5° to 70° for taxiing. The changes are noted at the top of `A320.xml`.
- JSBSim Cessna 172 (`aircraft/c172p`, `engine/eng_io320.xml`, `engine/prop_75in2f.xml`): LGPL 2.1, unmodified.
- JSBSim 737 (`aircraft/737`, `engine/CFM56.xml`): the model file states the GPL. Our copy only removes the telnet and socket inputs, and the change is noted in its header.
- JSBSim PA-28-180 (`aircraft/pa28`, `engine/engIO360C.xml`): LGPL 2.1. The aircraft file is modified (two tanks, fixed-pitch propeller, main wheel steering off, 10° first flap stage), and the changes are noted in its header.
- Each JSBSim model notes it is built from public data, for educational and entertainment use, and not to be sold.
- JSBSim WebAssembly build: `@0x62/jsbsim-wasm`, MIT.

<p align="center"><sub>Clear skies. ✈️</sub></p>
