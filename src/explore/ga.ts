// Explore cards for the light aircraft (C172-type and PA-28-type). Plain words, simplified.
import type { ExploreTable } from "../shell/explore";
import type { GaVariant } from "../c172/sim/variant";
import { COMMON } from "./common";

export function gaExplore(v: GaVariant): ExploreTable {
  const pa28 = v.id === "pa28";
  return {
    exact: {
      ...COMMON,
      "#c172-pfd": { name: "PFD (primary flight display)", what: "Airspeed tape on the left, attitude in the middle, altitude and vertical speed on the right, and the HSI compass at the bottom with the course needle. Radio frequencies across the top.", when: "Always, in flight." },
      "#c172-mfd": { name: "MFD (multi-function display)", what: "Engine readings on the left (RPM, fuel flow, oil, fuel, electrics) and a moving map on the right.", when: "Engine start, run-up, and to check fuel and electrics." },
      "c-nav": { name: "NAV radio", what: "Tunes a VOR or ILS. Tune the standby, then swap with ⇆.", when: "Before using a VOR or ILS." },
      "c-nav-swap": { name: "NAV swap (⇆)", what: "Makes the standby navaid frequency active.", when: "After tuning." },
      "c-nav-id": { name: "ID", what: "Plays the station's Morse code so you can check it is the right one.", when: "Always, before using a navaid." },
      "c-com": { name: "COM radio", what: "Tunes the radio for talking to ATC. Tune the standby, then swap with ⇆.", when: "Every new ATC frequency." },
      "c-com-swap": { name: "COM swap (⇆)", what: "Swaps the active and standby frequencies.", when: "To change frequency." },
      "c-hdg": { name: "HDG bug", what: "Moves the heading bug on the HSI, a reminder of the heading to fly.", when: "When ATC gives a heading." },
      "c-crs": { name: "CRS (course)", what: "Sets the course for the VOR or ILS needle on the HSI.", when: "Using a VOR or ILS." },
      "c-baro": { name: "BARO", what: "Sets the altimeter pressure (QNH), so the altimeter reads height above sea level.", when: "Before taxi, and when ATC gives a new QNH." },
      "c-xpdr": { name: "Transponder", what: "Sends your four-digit code (digits 0 to 7) and altitude to ATC radar.", when: "Set the code ATC gives you." },
      "c-range": { name: "MAP RANGE", what: "Zooms the moving map in or out.", when: "Whenever useful." },
      masterBat: { name: "MASTER: BAT", what: "Connects the battery to the main bus. The PFD comes on.", when: "First in start-up, last in shutdown." },
      masterAlt: { name: "MASTER: ALT", what: "Connects the alternator, which charges the battery once the engine runs.", when: "With BAT. Off and on again to reset after LOW VOLTS." },
      stbyBatt: { name: "STBY BATT", what: "Arms the standby battery, which keeps the PFD going if the main electrics fail.", when: "Before start." },
      avionics: { name: "AVIONICS", what: "Powers the radios and the MFD.", when: "On after engine start, off before shutdown. The starter's power dip can harm them." },
      parkBrake: { name: "PARKING BRAKE", what: "Holds the aircraft still.", when: "Start, run-up and parking." },
      "mini-rpm": { name: "RPM", what: "Engine speed in revolutions per minute.", when: "Start, run-up, take-off." },
      "mini-oil": { name: "OIL PSI", what: "Oil pressure. It must rise within 30 seconds of start, or stop the engine.", when: "Right after start." },
      "mini-volts": { name: "BUS V", what: "Electrical bus voltage. About 28 V when the alternator charges, 24 V on battery.", when: "After start, and if LOW VOLTS shows." },
      "mini-amps": { name: "BATT A", what: "Battery current. Positive means charging, negative means the battery is draining.", when: "After start, and if LOW VOLTS shows." },
      "mini-fuelpress": { name: "FUEL PSI", what: "Fuel pressure to the engine. It must stay in the green.", when: "After switching pumps or tanks." },
      fuelPump: pa28
        ? { name: "Electric FUEL PUMP", what: "A backup pump. It gives fuel pressure before start and if the engine-driven pump fails.", when: "On for start, take-off, landing and tank changes." }
        : { name: "FUEL PUMP", what: "Electric pump. Here it primes the engine before a cold start.", when: "A few seconds before a cold start." },
      beacon: { name: "BEACON", what: "Flashing red light warning people the engine is starting.", when: "On before start." },
      landing: { name: "LAND light", what: "Landing light.", when: "Take-off and landing." },
      taxi: { name: "TAXI light", what: "Light for taxiing.", when: "Taxiing at night or in poor light." },
      nav: { name: "NAV lights", what: "Red, green and white navigation lights.", when: "Whenever the engine runs, and always at night." },
      strobe: { name: "STROBE", what: "Bright flashing white lights.", when: "On when entering the runway." },
      pitotHeat: { name: "PITOT HEAT", what: "Heats the pitot tube, which measures airspeed, so ice cannot block it.", when: "In cloud or rain when it is cold." },
      throttle: { name: "THROTTLE", what: "Sets engine power. Push in for more, pull out for less.", when: "All the time the engine runs." },
      mixture: { name: "MIXTURE", what: "Sets how much fuel goes with the air. RICH for start and take-off. Pulled fully out (IDLE CUT-OFF) stops the engine.", when: "Rich for start, cut-off to shut down." },
      fuelShutoff: { name: "FUEL SHUTOFF", what: "A valve that stops all fuel to the engine when pulled out.", when: "Pushed in (ON) for flight." },
      primer: { name: "PRIMER", what: "Sprays a little fuel straight into the cylinders for a cold start. Each press is one stroke.", when: "Two or three strokes before a cold start." },
      trim: { name: "TRIM", what: "Elevator trim. It takes the pressure off the yoke so the aircraft holds its pitch. TAKEOFF is the mark for take-off.", when: "Set for take-off, then trim in flight." },
    },
    patterns: [
      [/^c-baro-/, { name: "BARO knob", what: "Changes the altimeter pressure setting.", when: "When the QNH changes." }],
      [/^c-xpdr-/, { name: "Transponder mode", what: "STBY: not transmitting. ON: sends your code. ALT: also sends your altitude.", when: "ALT before take-off." }],
      [/^mag-/, { name: "Magneto key", what: "OFF, R, L, BOTH and START. The magnetos make the sparks. Hold START to turn the starter. L and R are used to check each magneto in the run-up.", when: "START to start, BOTH in flight, OFF and key out when parked." }],
      [/^fuelSel-/, pa28
        ? { name: "FUEL SELECTOR", what: "OFF, LEFT or RIGHT. The engine feeds from one tank at a time, so the pilot switches tanks to keep them balanced.", when: "Fuller tank for take-off. Switch every 30 minutes or so." }
        : { name: "FUEL SELECTOR", what: "LEFT, BOTH or RIGHT tank. BOTH is used for take-off and landing.", when: "BOTH for most flying." }],
      [/^flaps\d$/, { name: "Flaps", what: `Flap stages ${v.flapDeg.join(", ")} degrees. More flap lets the wing fly slower and land steeper.`, when: pa28 ? "Up for a normal take-off, more for landing." : "0 to 10 for take-off, more for landing." }],
    ],
  };
}
