# Runway Zero

An open source A320neo-type learning simulator that runs in a desktop browser.

> For learning and entertainment only. Not approved for flight training credit or real-world operations.
> Not affiliated with or endorsed by Airbus or any airline. The ILS is a training stand-in, not the published procedure.

## Status: R2 (power up)

You can start cold and dark beside Delhi (VIDP) runway 28, power up the aircraft with a guided checklist, start both engines, taxi, take off, fly the ILS back to runway 28 and land.

New in R2:

- **Cold and dark start** beside runway 28 with a **guided checklist**: the next switch is highlighted, each step says why, and it ticks itself off.
- **Overhead panel (O):** ADIRS, ELEC (batteries, external power, generators), FUEL pumps, AIR (packs, bleeds), APU, exterior lights and signs. Lights follow the "dark cockpit" idea.
- **Simple systems:** batteries and AC power sources, APU start (about 45 s), ADIRS alignment (1 minute here, several minutes in reality), fuel pump pressure, bleed air.
- **Engine start:** ENG MODE IGN/START and ENG MASTER switches on the pedestal. Automatic start with crank, fuel at 22% N2, light up and idle, shown on the engine display (START, IGN A, AVAIL).
- **Screens need power:** dark without AC power. PFD shows ATT / HDG flags and the ND shows MAP NOT AVAIL until the ADIRS are aligned.
- **Parking brake (B)** and nosewheel steering for taxi.
- **Scenery:** sharper settings (High quality draws at full Retina resolution), no fake runway strips over real imagery, free 3D buildings, and free Google Photorealistic 3D scenery through Cesium ion.

R1 features:

What works now:

- **Start positions:** VIDP runway 28 ready for takeoff, 10 NM final on the runway 28 ILS, or in the air near Delhi.
- **Simple normal law:** on the ground the sidestick moves the elevators directly. In flight it asks for a pitch rate and roll rate. Let go and the aircraft holds its flight path and bank, and trims itself. Bank is held up to 33° and limited to 67°. Pitch is limited to +30° / -15°.
- **Autopilot (AP1):** HDG, ALT (with ALT* capture), V/S, LOC and G/S. Disconnects if you move the sidestick hard, and at 50 ft on the ILS ("LAND MANUALLY").
- **Autothrust (A/THR):** holds the FCU speed, goes to idle in the flare ("RETARD") and switches off after touchdown.
- **2D glass cockpit:** a big outside window on top, and an instrument panel below with the FCU on the glareshield, PFD, ND, engine and warning display, and the gear, flap, speedbrake and thrust levers.
- **FCU:** SPD, HDG, ALT, V/S with PULL / PUSH, AP1, A/THR, LOC, APPR, ND range.
- **PFD:** flight mode annunciator, attitude, speed and altitude tapes with FCU targets, V/S, heading, ILS diamonds, radio height.
- **ND:** arc mode with VIDP runways, ILS 28 course, heading bug, track and range rings.
- **Engine and warning display:** N1 dials with thrust lever position, N2, fuel flow, fuel on board, flap position, simple memos.
- **Gear ground safety:** the gear stays down while there is weight on the wheels.
- **Touchdown report:** sink rate, distance past the threshold, distance off the centreline.
- **Globe:** VIDP runways drawn on the ground. Real terrain with a free Cesium ion token.

Known gaps, planned for later releases:

- The flight model is JSBSim's public A320 model with small changes (see Licences). CFM56 engines, not LEAP. Liftoff around 150 kt, approach speed around 140 kt.
- EGT is an approximation: the stand-in engine model does not calculate it.
- Simplified systems: no hydraulics, no ECAM system pages, no failures yet. Those come in R3.
- All FCU values are "selected". Managed modes and the MCDU flight plan come in R4.
- Headings and courses are true, not magnetic (about 1° difference at Delhi).
- No wind or weather yet.

## Try it

**Start up:** the default start is **Cold and dark, beside runway 28**. Follow the checklist on the left. Press **O** to switch between the overhead and the main panel, **K** to hide or show the checklist.

1. Pick **10 NM final, runway 28 ILS**. Press **T** (autothrust) and **A** (autopilot), then click **APPR**.
2. Watch LOC and G/S on the PFD. The autopilot flies down the glide path.
3. At 50 ft it disconnects. Pull back gently on the sidestick (Arrow Down) to flare. Autothrust goes to idle.
4. After touchdown hold **.** for brakes. The touchdown report pops up.

For a takeoff: pick **VIDP runway 28**, hold **=** to full thrust, at about 150 kt pull back (Arrow Down) to about 12° pitch, then G for gear up.

## Run it

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env      # optional: add your free Cesium ion token
npm run dev               # open the address it prints, usually http://localhost:5173
```

Other commands:

```bash
npm run build         # production build in dist/
npm run preview       # serve the production build
npm run typecheck     # TypeScript check
npm run test:fdm      # run the flight model for 60 s in Node
npm run test:flights  # scripted test flights: cold start and taxi, ground, normal law, takeoff, ILS and landing
```

### Cesium ion token (free)

1. Sign up at https://ion.cesium.com (Community plan, free for personal non-commercial use).
2. Open **Access Tokens** and copy the default token.
3. Paste it into `.env` as `VITE_CESIUM_ION_TOKEN=...` and restart `npm run dev`.

Never commit `.env`. It is already in `.gitignore`. Without a token the app still runs, with flat ground and OpenStreetMap imagery.

### Scenery (top bar)

- **Standard:** Cesium World Terrain with Bing aerial imagery (needs the free Cesium ion token).
- **3D buildings (free):** Standard plus Cesium OSM Buildings, simple 3D buildings from OpenStreetMap.
- **Google 3D (free, 1,000 loads/month):** Google Photorealistic 3D Tiles. With only the Cesium ion token it streams through Cesium ion, which allows 1,000 loads a month on the free plan. Each page load or scenery change uses about one.

Optionally you can use your own Google Maps key instead (`VITE_GOOGLE_MAPS_KEY` in `.env`, Map Tiles API enabled). Google charges after its free monthly amount, so set a budget and a daily quota cap first.

Google's logo and data attribution appear in the bottom right corner and must stay visible. Before a public launch, the site needs a privacy policy that says it uses Google Maps APIs and links to Google's privacy policy (a Google Maps Platform requirement).

## Keys

| Key | Action |
| --- | --- |
| Arrow Up / Down | Sidestick forward / back |
| Arrow Left / Right | Sidestick left / right |
| Z / X | Rudder and nosewheel |
| = / - | Thrust levers up / down |
| F / R | Flaps one step down / up |
| G | Gear lever |
| / | Speedbrake |
| . (hold) | Wheel brakes |
| A | Autopilot on / off |
| T | Autothrust on / off |
| C | Cockpit or outside view |
| V | Instrument panel on / off (full screen outside view) |
| Mouse drag | Look around from the seat, double-click to reset |
| Panel buttons | Gear, flaps, speedbrake, FCU |
| B | Parking brake |
| O | Overhead panel / main panel |
| K | Guided checklist on / off |
| P | Pause |
| Backspace | Restart the current start position |
| H | Help on / off |

FCU values: scroll the mouse wheel over a value, or use − / + (hold Shift for bigger steps).

## How it is built

```
src/
  main.ts               globe, camera, display loop, panels
  config.ts             start positions and settings
  sim/fdm.worker.ts     runs the simulation in a Web Worker at 120 Hz
  sim/core.ts           JSBSim, start positions, touchdown report (shared with the Node tests)
  sim/fcc.ts            normal law, autopilot and autothrust
  sim/systems.ts        electrics, APU, ADIRS, fuel, bleed, engine start
  sim/ils.ts            ILS deviations
  sim/types.ts          messages between page and worker
  world/vidp.ts         VIDP runway data and the training ILS 28
  world/geo.ts          distance and bearing helpers
  world/runways3d.ts    runways drawn on the globe
  cockpit/pfd.ts        PFD
  cockpit/nd.ts         ND
  cockpit/ewd.ts        engine and warning display
  cockpit/fcu.ts        FCU on the glareshield
  cockpit/levers.ts     gear, flap, speedbrake, thrust levers, engine masters, parking brake
  cockpit/overhead.ts   overhead panel
  cockpit/checklist.ts  guided cold and dark checklist
  input/keyboard.ts     keyboard controls
public/jsbsim/          JSBSim aircraft and engine files
scripts/                Node test scripts
```

The flight model works in altitude above mean sea level. The globe uses height above the WGS84 ellipsoid. The difference is measured once at the runway 28 threshold and applied around Delhi.

## Data sources

- The cold and dark checklist is our own simplified training flow, written from general public knowledge of the A320 family. It is not an airline or manufacturer procedure.

- VIDP runway ends, headings and elevations: [OurAirports](https://github.com/davidmegginson/ourairports-data) (public domain).
- ILS 28 is built from the runway geometry: localizer on the centreline, 3° glide path, 50 ft threshold crossing height. It is a training stand-in, not the published procedure.

## Licences

- Runway Zero code: GPL v3 or later (see `LICENSE`).
- JSBSim and its A320 and engine data files: LGPL 2.1 (`public/jsbsim/COPYING-LGPL-2.1.txt`). The A320 model notes it is built from public data, for educational and entertainment use, and not to be sold. Our copy is modified: fuel tank position moved from 600 to 650 in, CmDe changed from -1.5 to -2.0 so the model can be trimmed at normal approach speeds, and nose gear steering widened from 5° to 70° for taxiing. The changes are noted at the top of `A320.xml`.
- JSBSim WebAssembly build: `@0x62/jsbsim-wasm`, MIT.
- CesiumJS: Apache 2.0.
- Map data: Cesium ion (with token) or © OpenStreetMap contributors (without token).
