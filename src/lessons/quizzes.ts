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

  radios: [
    {
      q: "What is the ATIS?",
      options: [
        "A recorded message with the runway, wind, weather and QNH",
        "The tower controller",
        "The transponder code",
        "The emergency frequency",
      ],
      why: "Pilots listen to the ATIS before the first call, then tell ATC which information letter they have.",
    },
    {
      q: "Which frequency do you tune when you turn the knobs?",
      options: ["The standby frequency", "The active frequency", "Both at once", "The NAV frequency"],
      why: "You tune the standby, then swap it to active. The active frequency stays usable while you tune.",
    },
    {
      q: "Why do pilots read back a clearance?",
      options: [
        "So ATC can catch any mistake in what the pilot heard",
        "To be polite",
        "To test the radio",
        "Because the transponder needs it",
      ],
      why: "The route, altitude and squawk are read back exactly. If anything is wrong, ATC corrects it at once.",
    },
    {
      q: "Which digits can a squawk code use?",
      options: ["0 to 7", "0 to 9", "1 to 8", "Letters and numbers"],
      why: "Transponder codes are four digits from 0 to 7 each.",
    },
    {
      q: "ATC says: climb 5000 feet. What do you do with it?",
      options: [
        "Read it back and set it as the altitude target",
        "Write it down only",
        "Set it as the squawk",
        "Tune it on the radio",
      ],
      why: "The cleared altitude goes on the FCU (or the altitude bug) so the climb stops there.",
    },
  ],
  aftertaxi: [
    {
      q: "Why are the ground spoilers ARMED before take-off?",
      options: [
        "So they come up by themselves on a rejected take-off and kill the lift",
        "To help the aircraft climb",
        "To slow the taxi",
        "They must be armed for the engines to start",
      ],
      why: "Armed spoilers deploy automatically on a rejected take-off or on landing. That puts the weight on the wheels so the brakes work.",
    },
    {
      q: "The PERF page says THS UP0.8. What do you set?",
      options: [
        "The pitch trim wheel to UP 0.8",
        "The rudder trim to 0.8",
        "Flaps 0.8",
        "Nothing, it is only for information",
      ],
      why: "The THS setting matches the centre of gravity, so the aircraft rotates normally. The trim wheel must match the take-off data.",
    },
    {
      q: "What does the T.O CONFIG button do?",
      options: [
        "Tests the take-off configuration as if take-off thrust were set",
        "Sets the flaps for take-off",
        "Starts the take-off roll",
        "Sends the take-off data to ATC",
      ],
      why: "It shows T.O CONFIG NORMAL, or a red CONFIG message that names what is wrong (flaps, spoilers, trim, parking brake).",
    },
    {
      q: "Why check the brakes just after the aircraft starts to move?",
      options: [
        "To make sure they work before going faster",
        "To warm the tyres",
        "To test the autobrake",
        "To reset the parking brake",
      ],
      why: "A brake check at walking speed is the safest place to find out the brakes do not work.",
    },
    {
      q: "On the T.O memo, what colour is an item that is not done yet?",
      options: ["Blue (cyan)", "Green", "Amber", "Red"],
      why: "Blue means still to do. Each item turns green when it is done.",
    },
  ],
  takeoff: [
    {
      q: "Why set about 50% N1 before take-off thrust?",
      options: [
        "So both engines settle at the same thrust before full power",
        "To warm the engines for 5 minutes",
        "To test the brakes",
        "To charge the batteries",
      ],
      why: "Engines that spool up together give symmetric thrust, so the aircraft stays straight on the runway.",
    },
    {
      q: "What does V1 mean?",
      options: [
        "The decision speed: after it you continue the take-off",
        "The speed to raise the nose",
        "The best climb speed",
        "The speed to raise the gear",
      ],
      why: "Before V1 you can stop on the runway. After V1 you take off, even with a failure.",
    },
    {
      q: "In this trainer, why keep holding PULL until the aircraft is airborne?",
      options: [
        "On the ground the stick moves the elevator directly, so letting go drops the nose",
        "The autopilot needs it",
        "To raise the gear",
        "To set the flaps",
      ],
      why: "In flight the flight controls hold the attitude when you let go. On the ground they do not.",
    },
    {
      q: "When do you select the gear UP?",
      options: [
        "When the climb is positive (altitude and vertical speed rising)",
        "As soon as the nose rises",
        "At V1",
        "At 5000 ft",
      ],
      why: "Positive climb means the aircraft will not settle back onto the runway.",
    },
    {
      q: "When are the flaps retracted after take-off?",
      options: [
        "When the speed has increased enough (about 190 kt here)",
        "At V1",
        "Immediately after lift-off",
        "Never on a short flight",
      ],
      why: "Flaps give lift at low speed. Retract them only when the speed is high enough to fly without them.",
    },
  ],
  genfault: [
    {
      q: "What does pressing MASTER CAUT do?",
      options: [
        "Silences and turns off the light, it does not fix anything",
        "Fixes the fault",
        "Resets all generators",
        "Starts the APU",
      ],
      why: "MASTER CAUT only acknowledges the caution. The fix is in the ECAM actions.",
    },
    {
      q: "On the upper ECAM, what colour are the actions to do?",
      options: ["Blue (cyan)", "Green", "Amber", "White"],
      why: "The title is amber for a caution. The action lines are blue, and each disappears when it is done.",
    },
    {
      q: "What is the first action for ELEC GEN 1 FAULT?",
      options: ["GEN 1 OFF then ON", "APU START", "ENG 1 MASTER OFF", "BAT 1 OFF"],
      why: "First try to reset the generator. Only if that does not work, switch it off.",
    },
    {
      q: "GEN 1 is off. Why start the APU?",
      options: [
        "Its generator replaces GEN 1, so two sources power the aircraft again",
        "To restart engine 1",
        "To cool the cabin",
        "It is needed to clear the ECAM",
      ],
      why: "With only GEN 2, one more failure leaves the aircraft on batteries. The APU generator gives back a second source.",
    },
    {
      q: "When do you press CLR on the ECAM control panel?",
      options: [
        "When all the action lines are done",
        "As soon as the caution appears",
        "Before reading the ECAM",
        "Never",
      ],
      why: "Read the alert, do every action, then CLR. Clearing too early hides actions you have not done.",
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
  "c172-radios": [
    {
      q: "What is the ATIS?",
      options: [
        "A recorded message with the runway, wind, weather and QNH",
        "The tower controller",
        "The transponder code",
        "The emergency frequency",
      ],
      why: "Pilots listen to the ATIS before the first call, then tell ATC which information letter they have.",
    },
    {
      q: "Which frequency do you tune when you turn the knobs?",
      options: ["The standby frequency", "The active frequency", "Both at once", "The NAV frequency"],
      why: "You tune the standby, then swap it to active. The active frequency stays usable while you tune.",
    },
    {
      q: "Why do pilots read back a clearance?",
      options: [
        "So ATC can catch any mistake in what the pilot heard",
        "To be polite",
        "To test the radio",
        "Because the transponder needs it",
      ],
      why: "The route, altitude and squawk are read back exactly. If anything is wrong, ATC corrects it at once.",
    },
    {
      q: "Which digits can a squawk code use?",
      options: ["0 to 7", "0 to 9", "1 to 8", "Letters and numbers"],
      why: "Transponder codes are four digits from 0 to 7 each.",
    },
    {
      q: "ATC says: climb 5000 feet. What do you do with it?",
      options: [
        "Read it back and set it as the altitude target",
        "Write it down only",
        "Set it as the squawk",
        "Tune it on the radio",
      ],
      why: "The cleared altitude goes on the altitude bug (or the FCU in an airliner) so the climb stops there.",
    },
  ],
  "c172-nav": [
    {
      q: "What must you do before using a VOR?",
      options: ["Identify it by its Morse code", "Set the transponder", "Call the tower", "Switch the avionics off"],
      why: "The ident proves you have the right station and that it is working.",
    },
    {
      q: "The needle is centred and the flag shows FROM with the course at 118. What does it mean?",
      options: [
        "You are on the 118 radial, on the line going out from the station at 118°",
        "You must fly heading 118 to reach the station",
        "The station is 118 NM away",
        "The wind is from 118°",
      ],
      why: "Centred with FROM: the course is the radial you are on. To fly to the station you need the TO course, 180° the other way.",
    },
    {
      q: "With the needle centred and TO, what is the course?",
      options: [
        "The course to fly to reach the station",
        "The radial you are on",
        "The runway heading",
        "The heading to fly away from the station",
      ],
      why: "TO means flying that course takes you towards the station.",
    },
    {
      q: "The localizer needle is far to the right. Where is the runway centreline?",
      options: ["To your right", "To your left", "Straight ahead", "Behind you"],
      why: "The needle shows where the course is. Fly towards the needle.",
    },
    {
      q: "How does a localizer compare with a VOR needle?",
      options: [
        "The localizer is about four times more sensitive",
        "They are exactly the same",
        "The VOR is more sensitive",
        "The localizer has no needle",
      ],
      why: "Full scale is about 10° for a VOR but only about 2.5° for a localizer, so small errors show quickly.",
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
  "c172-altfail": [
    {
      q: "What does LOW VOLTS with a negative battery current mean?",
      options: [
        "The alternator has stopped charging and the battery is powering everything",
        "The battery is full",
        "The engine is about to stop",
        "The avionics are off",
      ],
      why: "About 24 V and a negative current mean the battery is being used up. With a working alternator it is about 28 V and charging.",
    },
    {
      q: "What is the first thing to try?",
      options: ["MASTER ALT off, then on (reset)", "MASTER BAT off", "Mixture to idle cut-off", "Magnetos off"],
      why: "One reset of the alternator. If it does not come back, switch ALT off.",
    },
    {
      q: "Why leave the BAT half of the master switch ON?",
      options: [
        "The battery is now the only power for the radios and instruments",
        "It charges the alternator",
        "It keeps the engine running",
        "It is not allowed to switch it off",
      ],
      why: "With the alternator gone, the battery keeps the radios and the glass displays working.",
    },
    {
      q: "Why switch off the landing light, strobes and pitot heat?",
      options: [
        "To reduce the load so the battery lasts longer",
        "They stop the engine",
        "They cause the failure",
        "ATC requires it",
      ],
      why: "Shedding load stretches the battery time. Keep pitot heat on in icing conditions.",
    },
    {
      q: "Does the engine stop when the alternator fails?",
      options: [
        "No: the magnetos make the spark without the electrical system",
        "Yes, at once",
        "Yes, when the battery is flat",
        "Only if the fuel pump is off",
      ],
      why: "The engine keeps running on its magnetos. What you lose are the electrics: radios, displays, lights.",
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
