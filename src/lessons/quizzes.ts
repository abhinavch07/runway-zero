// Five questions for each lesson. Written in our own words from what the lessons teach.
// Like the lessons, a type-rated pilot should review them.

export interface Question {
  q: string;
  /** The first option is the right answer. The options are shuffled when shown. */
  options: [string, string, string, string];
  why: string;
}

export const PASS_MARK = 4;

export const QUIZZES: Record<string, Question[]> = {
  powerup: [
    {
      q: "On a cold and dark aircraft, what do you switch on first?",
      options: ["BAT 1 and BAT 2", "APU START", "ENG 2 MASTER", "The fuel pumps"],
      why: "The batteries give the first DC power. Everything else, even starting the APU, needs it.",
    },
    {
      q: "What does the APU give you before engine start?",
      options: [
        "Electrical power and bleed air",
        "Thrust to taxi",
        "Fuel pressure for the engines",
        "Only the cabin lights",
      ],
      why: "The APU is a small jet engine in the tail. Its generator gives AC power and its bleed air starts the main engines.",
    },
    {
      q: "The PFD shows ATT and HDG flags and the ND shows MAP NOT AVAIL. Why?",
      options: [
        "The ADIRS have not finished aligning",
        "The engines are not running",
        "The FCU is switched off",
        "The parking brake is set",
      ],
      why: "Attitude, heading and position come from the inertial reference. Until it has aligned, those displays have nothing to show.",
    },
    {
      q: "What does the red flashing beacon tell the ground crew?",
      options: [
        "The engines are about to start or are running",
        "Boarding can begin",
        "Fuelling is complete",
        "A door is open",
      ],
      why: "Beacon on means stay clear of the engines. It goes on before start and off only after the engines have stopped.",
    },
    {
      q: "Both engines are running and stable. Where does ENG MODE go?",
      options: ["NORM", "IGN/START", "CRANK", "It stays where it is"],
      why: "IGN/START is only for starting. With both engines running, the selector goes back to NORM.",
    },
  ],
  mcdu: [
    {
      q: "Where does an MCDU entry go before it reaches a field?",
      options: ["The scratchpad at the bottom of the screen", "Straight into the field", "The FCU", "The ND"],
      why: "You type into the scratchpad, then press the line select key beside the field you want to fill.",
    },
    {
      q: "What do amber boxes on an MCDU page mean?",
      options: ["The entry is required", "The entry is optional", "The value was worked out by the computer", "The page has failed"],
      why: "Amber boxes must be filled in. Cyan values can be changed, green values are worked out by the computer.",
    },
    {
      q: "The departure runway shows in yellow with INSERT* on the right. What does INSERT* do?",
      options: [
        "Makes the temporary flight plan the active one",
        "Deletes the temporary flight plan",
        "Sends the flight plan to ATC",
        "Prints the flight plan",
      ],
      why: "Yellow means temporary. Check it, then INSERT* makes it active. TMPY ERASE throws it away.",
    },
    {
      q: "How do you clear a F-PLN DISCONTINUITY?",
      options: [
        "Press CLR, then the key beside the discontinuity",
        "Press NEXT PAGE twice",
        "Type DEL and press F-PLN",
        "Switch the MCDU off and on",
      ],
      why: "With an empty scratchpad, CLR puts CLR in the scratchpad. Pressing the key beside the discontinuity then removes it.",
    },
    {
      q: "Why FL360 and not FL350 from Delhi to Mumbai?",
      options: [
        "South-westbound tracks use even flight levels",
        "Odd levels are only for propeller aircraft",
        "FL350 is above the A320's ceiling",
        "Mumbai only accepts FL360",
      ],
      why: "Tracks between 180° and 359° use even levels, so traffic flying the other way is 1,000 ft apart. Delhi to Mumbai is about 205°.",
    },
  ],
  beforestart: [
    {
      q: "Why set today's QNH on the baro before departure?",
      options: [
        "So the altimeter shows altitude above sea level, about 780 ft at Delhi",
        "So the cabin pressure is right",
        "So the radios tune to Delhi",
        "So the fuel figures are right",
      ],
      why: "With the right QNH the altimeter reads the airport elevation on the ground and the true altitude near it.",
    },
    {
      q: "What does 1 FD 2 on the FMA mean?",
      options: [
        "Both flight directors are on",
        "Flaps 1 and 2 are set",
        "Autopilots 1 and 2 are engaged",
        "Fuel data is entered",
      ],
      why: "FD is the flight director. 1 FD 2 means the captain's and first officer's flight directors are both on.",
    },
    {
      q: "On the ground with V2 entered, the FCU speed window shows dashes and a dot. Why?",
      options: [
        "The speed is managed: the target V2 comes from the MCDU",
        "The FCU has failed",
        "Autothrust is off",
        "No speed is needed on the ground",
      ],
      why: "Dashes and a dot mean managed. The flight computer gives the target, which is V2 for take-off.",
    },
    {
      q: "On the PFD speed tape before take-off, which colour is V1?",
      options: ["Cyan", "Magenta", "Amber", "Red"],
      why: "V1 is shown in cyan. The managed speed target (V2 here) is magenta.",
    },
    {
      q: "Which flap setting do you select for this take-off?",
      options: [
        "1, the setting entered on the MCDU PERF page",
        "FULL, always for take-off",
        "0, flaps are set after take-off",
        "Any setting, the computer adjusts",
      ],
      why: "The flaps must match the take-off data. The PERF page says FLAPS/THS 1/UP0.8, so the lever goes to 1.",
    },
  ],
  fcu: [
    {
      q: "What does the FMA at the top of the PFD show?",
      options: [
        "The active and armed autopilot and autothrust modes",
        "Fuel used and fuel left",
        "Engine temperatures",
        "The next waypoint",
      ],
      why: "Always read the FMA after any FCU change. It tells you what the aircraft is really doing.",
    },
    {
      q: "You set ALT 12000 and want to climb at 1,500 ft per minute. What next?",
      options: ["Set V/S +1500 and PULL V/S", "PUSH ALT", "Press APPR", "Press AP1"],
      why: "Pulling V/S starts a climb at the selected rate. The aircraft levels off at the FCU altitude.",
    },
    {
      q: "What does ALT* on the FMA mean?",
      options: [
        "The aircraft is capturing the selected altitude",
        "Altitude hold has failed",
        "The aircraft is above the transition altitude",
        "The altitude is not set",
      ],
      why: "ALT* is the capture phase. The climb or descent rounds off and then ALT shows when the aircraft holds the altitude.",
    },
    {
      q: "With A/THR active, what holds the speed?",
      options: [
        "Autothrust changes the thrust to hold the FCU speed",
        "The pilot moves the thrust levers",
        "The flaps",
        "The speedbrake",
      ],
      why: "Autothrust adjusts engine thrust by itself to keep the speed set on the FCU.",
    },
    {
      q: "In this lesson, how do you disconnect the autopilot?",
      options: ["Press AP1 on the FCU", "Press A/THR", "Pull HDG", "Set ALT to 0"],
      why: "AP1 switches the autopilot on and off. In the real aircraft pilots normally use the disconnect button on the sidestick.",
    },
  ],
  shutdown: [
    {
      q: "Why start the APU before shutting down the engines?",
      options: [
        "To keep electrical power when the engines stop",
        "To warm up the cabin",
        "To help the aircraft taxi",
        "To refuel the aircraft",
      ],
      why: "The engine generators stop with the engines. The APU keeps power on until ground power is connected.",
    },
    {
      q: "When can you switch EXT PWR on?",
      options: [
        "When it shows AVAIL, after ground power is connected",
        "Any time, even while taxiing",
        "Only with the batteries off",
        "Only with the beacon on",
      ],
      why: "AVAIL means the ground power cable is plugged in. Then EXT PWR ON takes over from the APU.",
    },
    {
      q: "When does the beacon go off?",
      options: [
        "After both engines have stopped",
        "Before the engines are shut down",
        "At the start of taxi",
        "After the batteries are off",
      ],
      why: "The beacon warns the ground crew. It stays on until the engines have fully stopped.",
    },
    {
      q: "Ground power is on. What happens to the APU?",
      options: [
        "APU BLEED off, then APU MASTER SW off",
        "It keeps running until the next flight",
        "It is used to tow the aircraft",
        "It switches off by itself when the beacon goes off",
      ],
      why: "With ground power on, the APU is not needed. Switching it off saves fuel and noise at the gate.",
    },
    {
      q: "What are the last switches for a cold and dark aircraft?",
      options: [
        "EXT PWR off, then BAT 1 and BAT 2 off",
        "Fuel pumps off",
        "ENG MODE to NORM",
        "Seat belts off",
      ],
      why: "With everything else off, ground power and then the batteries go off last. The aircraft is now cold and dark.",
    },
  ],
};
