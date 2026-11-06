// Explore cards shared by every aircraft page: the top bar.
import type { ExploreCard } from "../shell/explore";

export const COMMON: Record<string, ExploreCard> = {
  explore: { name: "EXPLORE", what: "This mode. Hover or click anything in the cockpit to learn what it does. Nothing moves while it is on.", when: "Whenever you want to look around. Press Esc to stop." },
  "time-rate": { name: "TIME", what: "Speeds up time by 4 or 8 times for long waits, like IRS alignment or a climb. Click again to go back to normal.", when: "Whenever a step says to wait." },
  checklist: { name: "CHECKLIST", what: "Opens the normal checklists. Lines turn green when the aircraft is really set that way. Press C for the same.", when: "At each stage of the flight." },
  "tab-ovhd": { name: "Overhead panel", what: "The panel above the pilots' heads: electrics, fuel, hydraulics, air, lights and the APU. Key 1.", when: "Mostly during power up and engine start." },
  "tab-main": { name: "Main panel", what: "The screens in front of the pilots and the autopilot panel above them. Key 2.", when: "Most of the flight." },
  "tab-ped": { name: "Pedestal", what: "Between the pilots: thrust levers, the flight computer keyboard, radios, flaps and the parking brake. Key 3.", when: "Set-up, engine start, take-off and landing." },
  "tab-inst": { name: "Instruments", what: "The two glass screens (PFD and MFD) and the radio, heading and transponder controls. Key 1.", when: "Most of the time." },
  "tab-lower": { name: "Lower panel", what: "Switches, key, fuel, throttle, mixture, flaps and trim. Key 2.", when: "Starting, run-up and shutdown." },
};
