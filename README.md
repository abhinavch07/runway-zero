# Runway Zero

An open source A320neo-type learning simulator that runs in a desktop browser.

> For learning and entertainment only. Not approved for flight training credit or real-world operations.
> Not affiliated with or endorsed by Airbus or any airline.

## Status: R0 spike

R0 proves that the browser can carry the globe and the flight model together.

How the 3D cockpit lines up with the globe: the cockpit is built in the aircraft's own frame with its camera fixed at the pilot's eye. The globe camera gets the same eye position, attitude, field of view and head turn. So the two layers match without moving the cockpit through world coordinates.

What works now:

- 3D globe starting near Delhi (VIDP), 3,000 ft, heading 280, trimmed for level flight
- JSBSim flight model compiled to WebAssembly, running in a Web Worker at 120 Hz
- Keyboard flying: stick, rudder, trim, thrust levers, flaps, gear, speedbrake, brakes
- Simple PFD: attitude, speed tape, altitude tape, vertical speed, heading
- Blockout 3D cockpit (Three.js) drawn over the globe: glareshield, FCU, live PFD screen, ND and ECAM placeholders, pedestal, sidestick and thrust levers that move with your input
- Mouse look in the cockpit, and clickable gear and flap levers (the pattern every switch will follow)
- Cockpit view and outside view (stand-in box aircraft)
- Quality setting (Low, Medium, High), saved in the browser
- Real terrain height under the aircraft when a Cesium ion token is set

Known gaps in R0, planned for later releases:

- The flight model is JSBSim's public A320 model (CFM56 engines, simple direct controls, 737-style flap steps). No fly-by-wire laws yet.
- The 3D cockpit is a blockout of plain shapes. The real model comes from Blender, panel by panel.
- Starts in the air. Runway starts at VIDP come in R1 with runway data from the eAIP.
- Altitude is height above the WGS84 ellipsoid, so it can differ from true altitude by about 50 m near Delhi. Fixed in R1.

## Run it

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env      # optional: add your free Cesium ion token
npm run dev               # open the address it prints, usually http://localhost:5173
```

Other commands:

```bash
npm run build       # production build in dist/
npm run preview     # serve the production build
npm run typecheck   # TypeScript check
npm run test:fdm    # run the flight model for 60 s in Node and print the state
```

### Cesium ion token (free)

1. Sign up at https://ion.cesium.com (Community plan, free for personal non-commercial use).
2. Open **Access Tokens** and copy the default token.
3. Paste it into `.env` as `VITE_CESIUM_ION_TOKEN=...` and restart `npm run dev`.

Never commit `.env`. It is already in `.gitignore`.

Without a token the app still runs, with flat ground and OpenStreetMap imagery.

## Keys

| Key | Action |
| --- | --- |
| Arrow Up / Down | Pitch down / up |
| Arrow Left / Right | Roll left / right |
| Z / X | Rudder left / right |
| [ / ] | Pitch trim down / up |
| = / - | Thrust levers up / down |
| F / R | Flaps one step down / up |
| G | Gear lever |
| / | Speedbrake |
| . (hold) | Wheel brakes |
| C | Cockpit or outside view |
| V | 3D cockpit on or off (shows the flat PFD instead) |
| Mouse drag | Look around in the cockpit, double-click to reset |
| Click | Gear lever, flap lever in the 3D cockpit |
| P | Pause |
| Backspace | Reset |
| H | Help on or off |

## How it is built

```
src/
  main.ts              globe, camera, display loop, readouts
  config.ts            start position and settings
  sim/fdm.worker.ts    JSBSim in a Web Worker, fixed 120 Hz step
  sim/types.ts         messages between page and worker
  input/keyboard.ts    keyboard controls
  cockpit/pfd.ts       canvas PFD
  cockpit/cockpit3d.ts 3D cockpit layer (Three.js), mouse look, clickable levers
public/jsbsim/         JSBSim aircraft and engine files
scripts/               Node test scripts
```

## Licences

- Runway Zero code: GPL v3 or later (see `LICENSE`).
- JSBSim and its A320 and engine data files: LGPL 2.1 (`public/jsbsim/COPYING-LGPL-2.1.txt`). The A320 model notes it is built from public data, for educational and entertainment use, and not to be sold.
- JSBSim WebAssembly build: `@0x62/jsbsim-wasm`, MIT.
- CesiumJS: Apache 2.0.
- Three.js: MIT.
- Map data: Cesium ion (with token) or © OpenStreetMap contributors (without token).
