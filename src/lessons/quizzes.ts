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
  fuel: [
    {
      q: "What does opening the crossfeed (X FEED) do?",
      options: [
        "Joins the left and right fuel lines, so one side can feed both engines",
        "Moves fuel from one wing tank to the other",
        "Dumps fuel overboard",
        "Starts the centre tank pumps",
      ],
      why: "It does not pump fuel between tanks. It lets an engine take fuel from the other side.",
    },
    {
      q: "The left wing is lighter. Which pumps do you switch off?",
      options: ["The left (lighter side) pumps", "The right (heavier side) pumps", "The centre tank pumps", "All of them"],
      why: "With the lighter side's pumps off and the crossfeed open, both engines use fuel from the heavier side.",
    },
    {
      q: "In this trainer, which tank feeds the engines first when it has fuel?",
      options: ["The centre tank", "The left wing", "The right wing", "Both wings equally"],
      why: "The centre tank is used first (its pumps push harder). The wings feed when it is empty.",
    },
    {
      q: "What do you do when the wings are balanced?",
      options: [
        "Pumps back ON, then X FEED OFF",
        "Leave the crossfeed open for the rest of the flight",
        "Switch off all pumps",
        "Restart the engines",
      ],
      why: "Return the fuel system to normal once the job is done.",
    },
    {
      q: "Before balancing, what must a crew rule out?",
      options: ["A fuel leak", "A radio failure", "A wrong squawk", "High cabin altitude"],
      why: "If the imbalance comes from a leak, crossfeeding would feed the leak. The real procedure checks for that first.",
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
  "c172-fuel": [
    {
      q: "The engine stopped with 20 gallons in the right tank. Why?",
      options: [
        "The selector was on the empty LEFT tank: fuel starvation",
        "The battery was flat",
        "The magnetos failed",
        "The oil was too cold",
      ],
      why: "Starvation means fuel on board but not reaching the engine. Exhaustion means no fuel at all.",
    },
    {
      q: "What is the first action when the engine stops and one tank is empty?",
      options: ["Select a tank with fuel (BOTH)", "MASTER off", "Flaps up", "Mixture to idle cut-off"],
      why: "Get fuel to the engine first, then help it restart with the fuel pump and the key.",
    },
    {
      q: "What does the electric fuel pump do in a restart?",
      options: [
        "Pushes fuel through the empty lines to the engine",
        "Makes the spark",
        "Charges the battery",
        "Cools the engine",
      ],
      why: "After starvation the lines have air in them. The pump refills them quickly.",
    },
    {
      q: "When must you check the fuel quantity in each tank?",
      options: ["Before every flight, and regularly in flight", "Only when a warning shows", "Once a month", "Only on long flights"],
      why: "Check it before flight (look in the tanks too) and keep an eye on it during the flight.",
    },
    {
      q: "What does LOW FUEL L on the PFD tell you?",
      options: [
        "The left tank is low (under about 5 gallons)",
        "The left fuel pump is off",
        "Fuel is leaking",
        "The selector is on LEFT",
      ],
      why: "It is a caution about the quantity. Check the selector and plan to land with enough fuel.",
    },
  ],
  "c172-ff-takeoff": [
    {
      q: "On the taxiway you reach yellow lines painted across it. What do you do?",
      options: ["Stop before them and wait for a clearance", "Cross them and line up", "Speed up to cross quickly", "Turn around"],
      why: "Those lines are the holding point for the runway. You never cross them onto the runway without a clearance.",
    },
    {
      q: "How do you steer the aircraft on the ground?",
      options: ["With the rudder pedals, which turn the nose wheel", "With the yoke", "With the throttle", "With the trim"],
      why: "On the ground the rudder pedals (A and D here) steer the nose wheel. The yoke does very little at taxi speed.",
    },
    {
      q: "At about what speed do you gently pull back to lift off in the C172?",
      options: ["55 knots", "25 knots", "90 knots", "120 knots"],
      why: "At about 55 knots the wing makes enough lift. A gentle pull raises the nose and the aircraft flies.",
    },
    {
      q: "In the climb the speed is falling below 70 knots. What do you do?",
      options: ["Lower the nose a little", "Raise the nose more", "Take off power", "Lower the flaps fully"],
      why: "Pitch controls the speed. Nose down a little lets the speed come back. Raising the nose would slow you further, towards a stall.",
    },
    {
      q: "What is the trim for?",
      options: ["It takes the pressure off the yoke so the aircraft holds its pitch by itself", "It steers the nose wheel", "It sets the engine power", "It lowers the flaps"],
      why: "Once trimmed, the aircraft keeps its attitude and speed with your hands off, which makes flying much less tiring.",
    },
  ],
  "c172-ff-circuit": [
    {
      q: "In this lesson's circuit, which way do all the turns go?",
      options: ["Left", "Right", "Left, then right", "It changes every time"],
      why: "It is a left-hand circuit: crosswind, downwind, base and final are all left turns, so the runway stays on your left.",
    },
    {
      q: "Which leg of the circuit runs parallel to the runway, pointing the opposite way?",
      options: ["Downwind", "Final", "Crosswind", "Base"],
      why: "Downwind is parallel to the runway, flown the opposite way to the landing. Base and final follow it.",
    },
    {
      q: "Where in the circuit do you reduce power and take the first stage of flap?",
      options: ["Abeam the runway threshold on downwind", "Right after take-off", "On the crosswind leg", "Over the runway"],
      why: "When the start of the runway is beside you on downwind, you reduce power to about 1700 RPM and take flaps 10. The descent starts there.",
    },
    {
      q: "In a turn, the nose starts to drop. What helps?",
      options: ["A little back pressure on the yoke", "More bank", "Less power", "Flaps up"],
      why: "Banking tilts some of the wing's lift sideways, so the nose drops unless you add a little back pressure.",
    },
    {
      q: "On final, the PAPI shows two white and two red lights. What does that mean?",
      options: ["You are on the right slope", "You are too high", "You are too low", "The runway is closed"],
      why: "Two white and two red is on the slope. More white means high, more red means low.",
    },
  ],
  "c172-ff-landing": [
    {
      q: "On final you are getting low (more red PAPI lights). What do you do?",
      options: ["Add a little power", "Pull the nose up hard", "Take all the power off", "Raise the flaps"],
      why: "Power controls the slope. A little more power stops the extra descent, and the speed stays in hand with pitch.",
    },
    {
      q: "What speed do you aim for on final with flaps 20 in this lesson?",
      options: ["65 knots", "40 knots", "100 knots", "120 knots"],
      why: "About 65 knots gives a good margin above the stall with flaps out, without floating a long way down the runway.",
    },
    {
      q: "When do you bring the power to idle?",
      options: ["As you cross the start of the runway, about 50 ft up", "At 1000 ft on final", "On the downwind leg", "After the nose wheel is down"],
      why: "Over the threshold the power comes off, and the aircraft settles towards the runway for the flare.",
    },
    {
      q: "What is the flare?",
      options: [
        "Raising the nose just above the runway to stop the descent and touch down gently",
        "A bright light on the runway",
        "Adding full power to go around",
        "Lowering the last stage of flap",
      ],
      why: "About 10 to 15 ft up you raise the nose gently and hold it off. The main wheels touch first, at low speed.",
    },
    {
      q: "The stall horn sounds just before the wheels touch. What does that usually mean?",
      options: ["The speed is low, as it should be at touchdown", "The engine has failed", "You must go around at once", "The flaps have failed"],
      why: "In a good landing the speed is low at touchdown, close to the stall, so a short beep of the horn is normal. In the air at height it is a warning to lower the nose.",
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

// PA-28: the radio and VOR/ILS quizzes are the same as the C172 ones.
QUIZZES["pa28-radios"] = QUIZZES["c172-radios"];
QUIZZES["pa28-nav"] = QUIZZES["c172-nav"];

QUIZZES["pa28-start"] = [
  {
    q: "The PA-28 fuel selector has no BOTH position. What does that mean?",
    options: [
      "The engine feeds from one tank at a time, the one you select",
      "Both tanks always feed the engine",
      "The right tank is only for emergencies",
      "The tanks feed in turn by themselves",
    ],
    why: "The selector has OFF, LEFT and RIGHT. Only the selected tank feeds the engine, so the pilot must manage the tanks.",
  },
  {
    q: "How is a cold PA-28 engine primed in this lesson?",
    options: [
      "Two or three strokes of the hand primer",
      "Running the electric fuel pump for 5 seconds",
      "Pumping the throttle many times",
      "It does not need priming",
    ],
    why: "The primer sprays a little fuel straight into the cylinders. The electric pump only fills the carburettor and gives fuel pressure.",
  },
  {
    q: "Why is the electric fuel pump switched ON before start?",
    options: [
      "To give fuel pressure and fill the carburettor before the engine turns",
      "To charge the battery",
      "To prime the cylinders",
      "To cool the starter",
    ],
    why: "Before the engine turns, the engine-driven pump gives no pressure. The electric pump does the job until the engine runs.",
  },
  {
    q: "After start you switch the electric fuel pump OFF. What must the fuel pressure do?",
    options: ["Stay in the green", "Drop to zero", "Rise into the red", "It does not matter"],
    why: "If the pressure stays in the green with the electric pump off, the engine-driven pump is working.",
  },
  {
    q: "The engine has started. What do you check first?",
    options: ["Oil pressure rises within 30 seconds", "The fuel quantity", "The heading bug", "The transponder code"],
    why: "No oil pressure means the engine is not being lubricated. Stop it at once with the mixture.",
  },
];

QUIZZES["pa28-runup"] = [
  {
    q: "The left tank has 12 gallons and the right tank 20. Which tank do you take off on?",
    options: ["RIGHT, the fuller tank", "LEFT, to use it up first", "OFF", "It does not matter"],
    why: "Taking off on the fuller tank keeps you far from an empty tank in the first minutes of flight.",
  },
  {
    q: "Why is the electric fuel pump ON for take-off?",
    options: [
      "If the engine-driven pump fails at a low height, fuel still reaches the engine",
      "It gives more power for take-off",
      "It charges the battery faster",
      "It is needed for the magneto check",
    ],
    why: "Take-off and landing are the worst times to lose fuel pressure. The electric pump is a backup.",
  },
  {
    q: "At what RPM does this lesson do the magneto check?",
    options: ["2000 RPM", "1000 RPM", "1800 RPM", "Full power"],
    why: "The PA-28 run-up is done at 2000 RPM. Always use the figure in your POH.",
  },
  {
    q: "During the magneto check, when do you return the key to BOTH?",
    options: [
      "After each single magneto check, before checking the other one",
      "Only at the end of the run-up",
      "Never, you take off on L",
      "After the idle check",
    ],
    why: "L, then BOTH, then R, then BOTH. You never take off on one magneto.",
  },
  {
    q: "What flap setting does this lesson use for a normal take-off?",
    options: ["0° (flaps up)", "40°", "25°", "10°"],
    why: "A normal PA-28 take-off is with flaps up. 25° is for a short field take-off.",
  },
];

QUIZZES["pa28-fuel"] = [
  {
    q: "What do you switch on before changing tanks?",
    options: ["The electric fuel pump", "The landing light", "Carb heat", "The avionics"],
    why: "The electric pump keeps the fuel pressure up while the selector moves to the other tank.",
  },
  {
    q: "Why must you look at the selector when you move it?",
    options: [
      "OFF is on the same selector, and OFF stops the engine",
      "It can break easily",
      "The tank names are hard to read",
      "The PFD does not show the tank",
    ],
    why: "Selecting OFF by mistake cuts the fuel. Move it firmly to the tank you want and check it.",
  },
  {
    q: "With no BOTH position, how do pilots keep the tanks balanced?",
    options: [
      "Switch tanks at regular times, often about every 30 minutes",
      "Fly with one wing low",
      "Use only the left tank",
      "The tanks balance by themselves",
    ],
    why: "Regular switching keeps the weight even and stops one tank running dry. Follow your school's rule.",
  },
  {
    q: "After the tank change you switch the electric pump OFF. What do you check?",
    options: ["Fuel pressure stays in the green", "The oil temperature drops", "The bus volts rise", "The heading"],
    why: "The engine-driven pump must keep the pressure up on the new tank.",
  },
  {
    q: "Why do pilots write down the time of each tank change?",
    options: [
      "To know when to switch back",
      "To tell ATC",
      "For the engine logbook",
      "To set the clock",
    ],
    why: "The time tells you how long you have been on the tank, so you switch back on time.",
  },
];

QUIZZES["pa28-pumpfail"] = [
  {
    q: "FUEL PRESS shows in red and the gauge reads zero. What failed in this lesson?",
    options: ["The engine-driven fuel pump", "The alternator", "A magneto", "The vacuum pump"],
    why: "The engine-driven pump gives the fuel pressure in normal flight. When it fails the pressure drops to zero.",
  },
  {
    q: "What is the first action?",
    options: ["Electric FUEL PUMP ON at once", "Mixture to idle cut-off", "Master switch OFF", "Wait to see if it recovers"],
    why: "The engine only has a few seconds of fuel in the carburettor. The electric pump restores the pressure.",
  },
  {
    q: "Why does the engine keep running for a few seconds after the pump fails?",
    options: [
      "Fuel is still in the carburettor",
      "The battery keeps it running",
      "The propeller drives it",
      "The primer feeds it",
    ],
    why: "The carburettor holds a small amount of fuel. When it is used up the engine stops.",
  },
  {
    q: "The pressure is back. When do you switch the electric pump off?",
    options: ["Not until shutdown", "Straight away", "After one minute", "When the pressure reaches 8 psi"],
    why: "The electric pump is now the only pump. Switching it off stops the fuel supply.",
  },
  {
    q: "What do you plan after this failure?",
    options: [
      "Land as soon as practical",
      "Carry on to the planned destination",
      "Climb as high as possible",
      "Turn the electric pump off to save the battery",
    ],
    why: "There is no backup pump left. If the electric pump or the electrics fail, the engine stops.",
  },
];

QUIZZES["pa28-shutdown"] = [
  {
    q: "The electric fuel pump was on for landing. When does it go off?",
    options: ["When parked, before shutdown", "In flight on final", "It stays on", "After the master is off"],
    why: "Once you are parked it is no longer needed.",
  },
  {
    q: "How is the engine normally stopped?",
    options: ["Mixture to IDLE CUT-OFF", "Magnetos OFF at high RPM", "Fuel selector OFF", "Master switch OFF"],
    why: "Idle cut-off stops fuel reaching the cylinders, so the engine stops cleanly.",
  },
  {
    q: "Why do the avionics go off before the engine stops?",
    options: [
      "To protect them from voltage changes",
      "To save fuel",
      "So the engine stops faster",
      "To reset the transponder",
    ],
    why: "Voltage changes during shutdown can harm the avionics.",
  },
  {
    q: "Why turn the magnetos OFF and take out the key?",
    options: [
      "A magneto left on can start the engine if someone turns the propeller",
      "To save battery power",
      "To stop the fuel pump",
      "To turn off the beacon",
    ],
    why: "Magnetos make their own sparks. With the key off they are grounded and safe.",
  },
  {
    q: "In this lesson, where does the fuel selector go when the aircraft is parked?",
    options: ["OFF", "LEFT", "RIGHT", "BOTH"],
    why: "Many schools turn it OFF when parked. Follow your school's checklist.",
  },
];

// ----- 737 -----
QUIZZES["b737-power"] = [
  {
    q: "With only the battery on, why do the big screens stay dark?",
    options: ["They need AC power, which the battery cannot give", "The IRS are not aligned", "The APU bleed is off", "The packs are off"],
    why: "The battery gives DC only. The screens come on when a generator (here the APU) powers the AC buses.",
  },
  {
    q: "What does the blue APU GEN OFF BUS light tell you?",
    options: [
      "The APU is ready but not powering any bus",
      "The APU has failed",
      "The APU is starting",
      "The battery is flat",
    ],
    why: "It is a blue (information) light: the APU generator is available. Press APU GEN 1 and 2 to use it.",
  },
  {
    q: "Where do you turn the IRS selectors for a normal alignment?",
    options: ["NAV", "ALIGN, and leave them there", "ATT", "OFF"],
    why: "Turned to NAV, they align first (ALIGN lights on) and then give navigation data.",
  },
  {
    q: "What does the APU bleed give?",
    options: ["Compressed air for the packs and for engine start", "Electrical power", "Hydraulic pressure", "Fuel pressure"],
    why: "The APU gives both: its generator gives electrics and its bleed gives air.",
  },
  {
    q: "What do you do after pressing APU START?",
    options: [
      "Let it spring back to ON and wait for the APU to be ready",
      "Hold it until the APU runs",
      "Turn it to OFF",
      "Press it again every 10 seconds",
    ],
    why: "START is a spring position. The APU then starts by itself, which takes some time.",
  },
];

QUIZZES["b737-fmc"] = [
  {
    q: "On the CDU, how do you put text into a line?",
    options: [
      "Type it into the scratchpad, then press the line select key next to the line",
      "Press the line select key, then type",
      "Type it and press EXEC",
      "Type it and press ENTER",
    ],
    why: "The scratchpad at the bottom holds what you type. The line select key moves it into the line.",
  },
  {
    q: "After ACTIVATE the EXEC key lights up. What does EXEC do?",
    options: ["Makes the route active", "Deletes the route", "Starts the engines", "Sends the route to ATC"],
    why: "EXEC confirms a change in the FMC. The title then shows ACT RTE 1.",
  },
  {
    q: "What is the zero fuel weight (ZFW)?",
    options: [
      "The aircraft with passengers and cargo, but no fuel",
      "The aircraft with full fuel",
      "The empty aircraft with no passengers",
      "The fuel weight only",
    ],
    why: "The FMC adds the fuel on board to the ZFW to get the gross weight.",
  },
  {
    q: "What does a low cost index do?",
    options: ["Saves fuel by flying slower", "Saves time by flying faster", "Flies higher", "Uses less runway"],
    why: "The cost index balances fuel against time. Low saves fuel, high saves time.",
  },
  {
    q: "On TAKEOFF REF, what is V1?",
    options: ["The decision speed", "The rotation speed", "The safe climb speed with one engine out", "The landing speed"],
    why: "V1 is the decision speed, VR the rotation speed and V2 the safe climb speed with an engine out.",
  },
];

QUIZZES["b737-start"] = [
  {
    q: "Why are the packs switched off before engine start?",
    options: [
      "So all the APU air goes to the starters",
      "To save fuel",
      "To cool the engines",
      "Because they need AC power",
    ],
    why: "With both packs on, the duct pressure is too low for a good start.",
  },
  {
    q: "When do you move the start lever to IDLE?",
    options: ["At about 25% N2", "As soon as the start switch is at GRD", "At 56% N2", "When N1 reaches 20%"],
    why: "At 25% N2 the engine turns fast enough to light. Too early can give a hot start.",
  },
  {
    q: "What happens at about 56% N2?",
    options: [
      "The starter cuts out and the start switch springs back to OFF",
      "The engine reaches take-off power",
      "The generator comes on by itself",
      "The fuel is cut off",
    ],
    why: "The starter is no longer needed. START VALVE OPEN goes out.",
  },
  {
    q: "Which engine does this lesson start first?",
    options: ["Engine 2", "Engine 1", "Both at once", "It does not matter"],
    why: "Engine 2 is usually started first. Follow your airline's procedure.",
  },
  {
    q: "After both engines run, what do GEN 1 and GEN 2 do?",
    options: [
      "Put each engine generator on its bus, taking over from the APU",
      "Start the APU",
      "Switch the packs on",
      "Open the start valves",
    ],
    why: "The GEN OFF BUS lights go out when each engine generator powers its bus.",
  },
];

QUIZZES["b737-mcp"] = [
  {
    q: "Where do you check what the autopilot is actually doing?",
    options: ["The flight mode annunciations (FMA) on the PFD", "The MCP button lights", "The ND", "The CDU"],
    why: "The FMA shows the engaged modes. A lit button only shows what was asked for.",
  },
  {
    q: "What does LVL CHG do in a climb?",
    options: [
      "Sets climb thrust (N1) and uses pitch to keep the speed",
      "Holds a fixed vertical speed",
      "Follows the FMC route",
      "Holds the present altitude",
    ],
    why: "The FMA shows N1 for the thrust and MCP SPD for the pitch.",
  },
  {
    q: "You want to descend at 1000 ft per minute. Which mode?",
    options: ["V/S", "LVL CHG", "ALT HOLD", "HDG SEL"],
    why: "Press V/S and set −1000. It still stops at the ALTITUDE window.",
  },
  {
    q: "What does LNAV follow?",
    options: ["The active FMC route", "The heading bug", "The VOR course", "The runway heading"],
    why: "LNAV flies to each route waypoint in turn. The active one is magenta on the ND.",
  },
  {
    q: "What does ALT ACQ on the FMA mean?",
    options: [
      "The aircraft is levelling off at the selected altitude",
      "The altitude is lost",
      "The autopilot is off",
      "A new altitude has been typed in the FMC",
    ],
    why: "It is the level-off phase. Then the FMA changes to ALT HOLD.",
  },
];

QUIZZES["b737-radios"] = [
  {
    q: "On VHF 1, which frequency do you tune with the knobs?",
    options: ["The standby, then swap it to active", "The active one directly", "Both at once", "Neither, the FMC tunes it"],
    why: "You tune the standby so the active frequency stays usable, then press ⇆.",
  },
  {
    q: "What does the ATIS give you?",
    options: ["Runway, wind, weather and QNH", "Your clearance", "Your squawk code", "The taxi route"],
    why: "Pilots listen to the ATIS before calling ATC.",
  },
  {
    q: "What must a clearance read-back include?",
    options: [
      "The route, the altitude and the squawk, then your callsign",
      "Only your callsign",
      "Only the squawk code",
      "\"Roger\"",
    ],
    why: "Reading back the important parts lets ATC catch a mistake.",
  },
  {
    q: "Why set the cleared altitude in the MCP ALTITUDE window?",
    options: [
      "So the autopilot will not climb above it",
      "So ATC can see it",
      "It sets the cruise altitude in the FMC",
      "It changes the QNH",
    ],
    why: "The MCP altitude is where the autopilot levels off.",
  },
  {
    q: "Which digits exist on a transponder?",
    options: ["0 to 7", "0 to 9", "1 to 8", "0 to 5"],
    why: "Squawk codes use the digits 0 to 7 only.",
  },
];

QUIZZES["b737-nav"] = [
  {
    q: "What must you do before using a VOR?",
    options: ["Identify it by its Morse code", "Set the transponder", "Switch on the APU", "Set the QNH"],
    why: "Identifying makes sure you have the right station and it is working.",
  },
  {
    q: "On the B737, where do you set the VOR course?",
    options: ["The MCP COURSE knob", "The CDU", "The EFIS BARO knob", "The NAV panel"],
    why: "The MCP COURSE sets the course for NAV 1. The ND in VOR mode shows it.",
  },
  {
    q: "The bar is centred and the ND shows FROM. What is the course number?",
    options: ["The radial you are on", "The course to the station", "Your heading", "The wind direction"],
    why: "With FROM, the centred course is the radial. Add 180° for the course TO the station.",
  },
  {
    q: "Which EFIS mode shows the ILS with the glide slope?",
    options: ["APP", "MAP", "VOR", "PLN"],
    why: "APP shows the localizer bar and, when in range, the glide slope.",
  },
  {
    q: "Compared with a VOR, how sensitive is a localizer?",
    options: ["About four times more sensitive", "The same", "Half as sensitive", "Ten times less sensitive"],
    why: "Full scale is a few degrees on a localizer, much less than on a VOR.",
  },
];
