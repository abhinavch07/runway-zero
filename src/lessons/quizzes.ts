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
      q: "What does APU MASTER SW ON do before you press APU START?",
      options: [
        "Opens the APU air intake flap and powers the APU computer",
        "Starts the main engines",
        "Connects ground power",
        "Turns on the fuel pumps",
      ],
      why: "The master switch gets the APU ready. Wait a few seconds for the intake flap to open, then press START.",
    },
    {
      q: "The APU is running. Why switch EXT PWR off?",
      options: [
        "The APU generator takes over, and ground power must be off before the aircraft moves",
        "Ground power would stop the APU",
        "The batteries need to charge from the APU only",
        "The ADIRS stop aligning on ground power",
      ],
      why: "With the APU generator ready, ground power is no longer needed. The cable is removed before pushback or taxi.",
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
      q: "Both engines are running and stable. Where does ENG MODE go?",
      options: ["NORM", "IGN/START", "CRANK", "It stays where it is"],
      why: "IGN/START is only for starting. With both engines running, the selector goes back to NORM.",
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

  "c172-start": [
    {
      q: "Why are the avionics OFF during engine start?",
      options: [
        "The starter pulls a lot of current and the voltage dips, which can harm the avionics",
        "The avionics need the propeller turning to work",
        "To save fuel",
        "The PFD only works with the avionics off",
      ],
      why: "Avionics go off before start and on after start, once the alternator gives a steady voltage.",
    },
    {
      q: "How do you prime this fuel-injected engine for a cold start?",
      options: [
        "Run the electric fuel pump for 3 to 5 seconds with the mixture rich",
        "Pump the throttle several times",
        "Pull the primer knob",
        "Turn on carb heat",
      ],
      why: "The fuel-injected engine has no primer knob and no carb heat. The electric fuel pump primes it. Too long floods it.",
    },
    {
      q: "What do the two halves of the MASTER switch do?",
      options: [
        "BAT connects the battery, ALT connects the alternator",
        "One is for the PFD and one for the MFD",
        "One is for the engine and one for the lights",
        "They are two spare switches for the same thing",
      ],
      why: "BAT puts the battery on the main bus. ALT lets the alternator charge once the engine runs.",
    },
    {
      q: "The engine has started. What must you check within 30 seconds?",
      options: ["Oil pressure rises", "Fuel tanks are full", "The flaps are up", "The heading bug is set"],
      why: "No oil pressure means the engine is not being lubricated. Stop it at once with the mixture.",
    },
    {
      q: "After start, the bus shows 28 V and the battery current is positive. What does it mean?",
      options: [
        "The alternator is working and charging the battery",
        "The battery is going flat",
        "The avionics have failed",
        "The engine is about to stop",
      ],
      why: "About 24 V means battery only. About 28 V with a positive charge means the alternator is online.",
    },
  ],
  "c172-pfd": [
    {
      q: "On the PFD, where is the airspeed shown?",
      options: ["The tape on the left", "The tape on the right", "The rose at the bottom", "The top bar"],
      why: "Airspeed on the left, altitude on the right, attitude in the middle, heading at the bottom.",
    },
    {
      q: "What does the red line at the top of the airspeed tape mean?",
      options: ["Never exceed speed (163 kt)", "Stall speed", "Best climb speed", "Flap limit speed"],
      why: "Red is a limit: never fly faster than that. The yellow band below it is for smooth air only.",
    },
    {
      q: "You set the baro to today's QNH at Delhi. What should the altitude show on the ground?",
      options: [
        "The airfield elevation, about 780 ft",
        "Zero",
        "The cruise altitude",
        "1008 ft",
      ],
      why: "With the right QNH the altimeter reads height above sea level, which on the ground is the airfield elevation.",
    },
    {
      q: "What is the cyan heading bug on the HSI for?",
      options: [
        "It marks the heading you want to fly",
        "It shows the wind",
        "It points to the nearest airport",
        "It shows the aircraft's current heading",
      ],
      why: "The current heading is in the box at the top of the rose. The bug is the heading you select.",
    },
    {
      q: "On the MFD engine strip, what rises with the RPM when you open the throttle?",
      options: ["Fuel flow", "Fuel quantity", "Bus voltage", "Outside air temperature"],
      why: "More power needs more fuel, so fuel flow (gallons per hour) goes up with the RPM.",
    },
  ],
  "c172-runup": [
    {
      q: "At what RPM is the magneto check done in this lesson?",
      options: ["1800 RPM", "1000 RPM", "2700 RPM", "At idle"],
      why: "The run-up is done at 1800 RPM with the parking brake set.",
    },
    {
      q: "During the magneto check, what is the most RPM drop allowed on one magneto?",
      options: ["150 RPM", "500 RPM", "No drop at all", "1000 RPM"],
      why: "A small drop is normal. More than 150 RPM, or more than 50 RPM difference between L and R, needs attention.",
    },
    {
      q: "Why is there no carb heat check in this aircraft?",
      options: [
        "The engine is fuel injected, so it has no carburettor",
        "Carb heat is only checked in flight",
        "It is checked at 2700 RPM",
        "The fuel pump does it automatically",
      ],
      why: "Carb heat is for carburettor engines. This fuel-injected engine has no carburettor to ice up.",
    },
    {
      q: "Where must the trim be before take-off?",
      options: ["At the TAKEOFF mark", "Fully nose up", "Fully nose down", "Anywhere, it does not matter"],
      why: "A wrong trim setting can make the aircraft pitch up or down hard after take-off.",
    },
    {
      q: "Why pull the throttle to idle near the end of the run-up?",
      options: [
        "To check the engine keeps running smoothly at low power",
        "To cool the oil",
        "To charge the battery",
        "To test the brakes",
      ],
      why: "An engine that stops at idle could stop on the landing approach. Check it now on the ground.",
    },
  ],
  "c172-shutdown": [
    {
      q: "How do you normally stop the engine?",
      options: ["MIXTURE to IDLE CUT-OFF", "MAGNETOS to OFF", "MASTER to OFF", "FUEL SELECTOR to OFF"],
      why: "Cutting off the fuel stops the engine cleanly. The magnetos go off after it has stopped.",
    },
    {
      q: "Why turn the magnetos OFF and take the key out?",
      options: [
        "A magneto left on can start the engine if someone turns the propeller",
        "To save battery power",
        "To stop the clock",
        "To lock the doors",
      ],
      why: "Magnetos make their own spark without the battery. A live magneto makes the propeller dangerous.",
    },
    {
      q: "When do the avionics go off?",
      options: ["Before the engine is stopped", "After the master switch", "Never", "During the magneto check"],
      why: "Like at start, avionics are off while the engine stops or starts.",
    },
    {
      q: "Where does the fuel selector go when the aircraft is parked?",
      options: ["LEFT or RIGHT", "BOTH", "It has no off position, so anywhere", "Halfway"],
      why: "On BOTH, fuel can flow from one tank to the other when the aircraft is not level.",
    },
    {
      q: "What is the last thing to switch off?",
      options: ["The master switch (after the standby battery)", "The beacon", "The mixture", "The avionics"],
      why: "Electrical power goes off last: standby battery, then both halves of the master switch.",
    },
  ],
};
