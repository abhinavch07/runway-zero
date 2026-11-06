// C172 first flight: three short hand-flying lessons with the outside view. Taxi and take-off,
// the circuit, and the landing. Simplified training flows in our own words: a flight instructor
// should review them. The circuit is a training pattern around runway 28, not a published one.
import type { C172Lesson } from "./lessons.ts";
import type { C172State } from "./sim/types.ts";
import {
  CIRCUIT,
  CIRCUIT_ALT_FT,
  LEG_HDG,
  RWY_LENGTH_M,
  RWY_WIDTH_M,
  TAXI,
  hdgNear,
  rwyPos,
} from "./world.ts";

const at = (s: C172State) => rwyPos(s);
const pad = (h: number) => String(h).padStart(3, "0");
const ALT = CIRCUIT_ALT_FT;
const onRunway = (s: C172State) => {
  const p = at(s);
  return p.x > 0 && p.x < RWY_LENGTH_M && Math.abs(p.y) < RWY_WIDTH_M / 2;
};

export const FIRST_FLIGHT: C172Lesson[] = [
  {
    id: "c172-ff-takeoff",
    title: "First flight 1: Taxi and take-off",
    summary: "Hand fly with the keyboard and the view out of the window: taxi to the holding point, line up on runway 28, take off, climb at 70 knots and level off at circuit height.",
    minutes: 8,
    running: true,
    start: { x: TAXI.x, y: TAXI.apronY + 12, h: 90 },
    switches: (sw) => {
      sw.taxi = true;
      sw.strobe = false;
    },
    controls: { throttle: 0.1, mixture: 1, trim: 0 },
    finished: "You taxied out, took off and climbed to circuit height by hand. Next: fly the circuit.",
    steps: [
      {
        title: "Look outside",
        why: "This is the view through the windscreen. Ahead is the taxiway to runway 28. Under the view are the speed, altitude, power and flaps. The keys are on the right: the arrow keys work like the yoke.",
        targets: ["out-keys", "o-ias", "o-alt"],
        panel: "out",
      },
      {
        title: "PARKING BRAKE: off (P)",
        why: "The parking brake holds the aircraft still. Press P to let it go. The PARK BRAKE lamp under the view goes out.",
        targets: ["key-park"],
        panel: "out",
        done: (_s, c) => !c.switches.parkBrake,
      },
      {
        title: "Power: a little, to start rolling (W)",
        why: "Hold W for a moment to add power to about 1000 RPM. As soon as the aircraft rolls, ease off with S. Taxi no faster than a brisk walk to a slow run, under 15 knots.",
        targets: ["key-throttle", "o-rpm"],
        panel: "out",
        done: (s) => s.groundSpeedKt > 3,
      },
      {
        title: "Taxi to the holding point and stop (B)",
        why: "Keep the yellow line under the nose with A and D (rudder pedals, which also steer the nose wheel). Stop before the yellow lines across the taxiway: take the power off (S) and hold B. This is the holding point. You never cross it without a clearance.",
        targets: ["key-rudder", "key-brakes"],
        panel: "out",
        done: (s) => {
          const p = at(s);
          return p.y > TAXI.holdY - 25 && p.y < TAXI.holdY + 2 && Math.abs(p.x - TAXI.x) < 10 && s.groundSpeedKt < 1;
        },
      },
      {
        title: "Line up on runway 28",
        why: "Imagine the tower has said: line up runway 28. Add a little power and roll onto the runway, then turn left with A until you face along the white centreline. Stop on the centreline if you like (B).",
        targets: ["key-rudder", "key-throttle"],
        panel: "out",
        aim: { hdg: LEG_HDG.upwind },
        done: (s) => {
          const p = at(s);
          return Math.abs(p.y) < 6 && Math.abs(p.h) < 6 && s.groundSpeedKt < 20 && p.x < 600;
        },
      },
      {
        title: "Full power (Shift+W)",
        why: "Press Shift+W for full power. Check the RPM rises past 2300. The aircraft starts to roll faster.",
        targets: ["key-throttle", "o-rpm"],
        panel: "out",
        done: (s, c) => c.throttle > 0.95 && s.engine.rpm > 2200,
      },
      {
        title: "Keep straight, lift off at 55 knots",
        why: "Keep the centreline under the nose with small taps of A and D. At 55 knots, hold the Down arrow to pull back gently. The nose rises and the aircraft lifts off.",
        targets: ["key-rudder", "key-pitch", "o-ias"],
        panel: "out",
        aim: { kias: 55, hdg: LEG_HDG.upwind },
        done: (s) => !s.onGround && s.aglFt > 15,
      },
      {
        title: "Climb at 70 knots",
        why: "Hold the nose up so the speed stays near 70 knots. Too fast: pull back a little (Down arrow). Too slow: push (Up arrow). Keep the wings level with the Left and Right arrows, and fly straight ahead.",
        targets: ["key-pitch", "key-roll", "o-ias"],
        panel: "out",
        aim: { kias: 70, hdg: LEG_HDG.upwind },
        done: (s) => s.aglFt > 400 && s.kias > 60 && s.kias < 82,
      },
      {
        title: "Trim for the climb (E and Q)",
        why: "Holding an arrow key all the time is tiring. Tap E (nose up) or Q (nose down) until the aircraft keeps about 70 knots by itself with no arrow pressed. That is what trim is for.",
        targets: ["key-trim", "o-trim"],
        panel: "out",
        aim: { kias: 70 },
        done: (s, c) => s.aglFt > 600 && Math.abs(c.pitch) < 0.08 && s.kias > 62 && s.kias < 80 && s.vsFpm > 200,
      },
      {
        title: `Level off at ${ALT} ft`,
        why: `Circuit height is ${ALT} ft on the altimeter, about 1000 ft above the runway. As you reach it, lower the nose to just above the horizon, then reduce power (S) to about 2100 RPM. Trim with Q until the CLIMB number stays near 0.`,
        targets: ["o-alt", "o-vs", "key-throttle", "key-trim"],
        panel: "out",
        aim: { altFt: ALT, kias: 85 },
        done: (s) => Math.abs(s.altFt - ALT) < 120 && Math.abs(s.vsFpm) < 250 && s.engine.rpm > 1850 && s.engine.rpm < 2450,
      },
    ],
  },
  {
    id: "c172-ff-circuit",
    title: "First flight 2: Fly the circuit",
    summary: "Already flying at circuit height past the end of runway 28: turn crosswind, downwind, base and final, with the before-landing checks and the first stage of flap.",
    minutes: 10,
    running: true,
    start: { x: RWY_LENGTH_M + 150, y: 0, h: 0, air: { aglFt: 1000, kias: 82, flaps: 0, throttle: 0.66, trim: -0.25 } },
    switches: (sw) => {
      sw.parkBrake = false;
      sw.taxi = false;
      sw.landing = false;
    },
    controls: { throttle: 0.66, mixture: 1, trim: -0.25 },
    finished: "You flew the whole circuit and lined up on final. Next: the landing.",
    steps: [
      {
        title: "You are flying: wings level, keep the height",
        why: `Runway 28 is behind you. You are at circuit height, ${ALT} ft, about 85 knots. The pink dots on the ground show the circuit: a rectangle around the runway, with every turn to the left. The pink box shows what to aim for.`,
        targets: ["out-hint", "guide-btn", "o-alt"],
        panel: "out",
      },
      {
        title: `Turn left onto crosswind, heading ${pad(LEG_HDG.crosswind)}`,
        why: `When the pink dots turn left, hold the Left arrow to bank about 20 degrees, let go, and keep a little back pressure (Down arrow) so the nose does not drop. Roll the wings level (Right arrow) as the heading comes to ${pad(LEG_HDG.crosswind)}.`,
        targets: ["key-roll", "key-pitch", "o-hdg"],
        panel: "out",
        aim: { hdg: LEG_HDG.crosswind, altFt: ALT },
        done: (s) => at(s).x > CIRCUIT.crosswindX - 400 && hdgNear(s.headingDeg, LEG_HDG.crosswind, 12),
      },
      {
        title: `Turn left onto downwind, heading ${pad(LEG_HDG.downwind)}`,
        why: `When you reach the next line of dots, turn left again to heading ${pad(LEG_HDG.downwind)}. The runway is now out of your left window, about a nautical mile away, pointing the other way.`,
        targets: ["key-roll", "o-hdg"],
        panel: "out",
        aim: { hdg: LEG_HDG.downwind, altFt: ALT },
        done: (s) => at(s).y < CIRCUIT.downwindY + 400 && hdgNear(s.headingDeg, LEG_HDG.downwind, 12),
      },
      {
        title: `Downwind: hold ${ALT} ft and 85 knots`,
        why: "Keep the height with small pitch changes, and trim (Q, E) so you do not have to hold the arrows. Keep the runway the same distance away on your left.",
        targets: ["o-alt", "key-trim"],
        panel: "out",
        aim: { hdg: LEG_HDG.downwind, altFt: ALT, kias: 85 },
        done: (s) =>
          hdgNear(s.headingDeg, LEG_HDG.downwind, 15) && Math.abs(s.altFt - ALT) < 150 && at(s).x < RWY_LENGTH_M * 0.65 && Math.abs(s.vsFpm) < 300,
      },
      {
        title: "Before landing: LANDING light ON",
        why: "The short before-landing check: fuel BOTH and mixture rich are already set. Switch the landing light on. The aircraft is trimmed and keeps flying while you look down.",
        targets: ["landing"],
        want: true,
        panel: "lower",
        done: (_s, c) => c.switches.landing,
      },
      {
        title: "Abeam the numbers: 1700 RPM, flaps 10 (S, F)",
        why: "When the start of the runway is beside you on the left, reduce power (S) to about 1700 RPM and press F once for flaps 10. Keep the nose so the speed settles at 75 knots. The aircraft starts a gentle descent.",
        targets: ["key-throttle", "key-flaps", "o-rpm", "o-flaps"],
        panel: "out",
        aim: { kias: 75, hdg: LEG_HDG.downwind },
        done: (s, c) => at(s).x < 300 && s.engine.rpm < 1900 && c.flaps >= 1,
      },
      {
        title: `Turn left onto base, heading ${pad(LEG_HDG.base)}`,
        why: `When the runway threshold is about 45 degrees behind your left shoulder and the dots turn left, turn left to heading ${pad(LEG_HDG.base)}. Keep 75 knots and keep descending.`,
        targets: ["key-roll", "o-hdg"],
        panel: "out",
        aim: { kias: 75, hdg: LEG_HDG.base },
        done: (s) => at(s).x < CIRCUIT.baseX + 400 && hdgNear(s.headingDeg, LEG_HDG.base, 12),
      },
      {
        title: "Flaps 20, 70 knots (F)",
        why: "Press F for flaps 20. The nose wants to rise: hold it so the speed settles at 70 knots. Add a little power (W) if you are getting low.",
        targets: ["key-flaps", "o-flaps", "o-ias"],
        panel: "out",
        aim: { kias: 70, hdg: LEG_HDG.base },
        done: (s, c) => c.flaps >= 2 && s.kias > 62 && s.kias < 80,
      },
      {
        title: `Turn left onto final, heading ${pad(LEG_HDG.final)}`,
        why: `Start the turn a little before the runway centreline, so you roll out lined up with the runway, heading ${pad(LEG_HDG.final)}. The four PAPI lights left of the runway show the slope: two white and two red is just right.`,
        targets: ["key-roll", "o-hdg", "out-view"],
        panel: "out",
        aim: { kias: 70, hdg: LEG_HDG.final },
        done: (s) => {
          const p = at(s);
          return Math.abs(p.y) < 120 && hdgNear(s.headingDeg, LEG_HDG.final, 20) && p.x < -200 && !s.onGround;
        },
      },
    ],
  },
  {
    id: "c172-ff-landing",
    title: "First flight 3: Land",
    summary: "On final for runway 28 with flaps 20: hold 65 knots, keep the slope with the PAPI, power to idle over the runway, flare, touch down and stop.",
    minutes: 5,
    running: true,
    start: { x: -1750, y: 0, h: 0, air: { aglFt: 350, kias: 68, flaps: 2, throttle: 0.5, trim: 0.1, gammaDeg: -3 } },
    switches: (sw) => {
      sw.parkBrake = false;
      sw.taxi = false;
      sw.landing = true;
    },
    controls: { throttle: 0.5, mixture: 1, flaps: 2, trim: 0.1 },
    finished: "You flew a whole first flight: take-off, circuit and landing. Fly it again to make it smoother, or try with the guides off (G).",
    steps: [
      {
        title: "On final: look at the runway",
        why: "You are on final for runway 28, about 1 nautical mile out, flaps 20, descending. Aim for the two big white blocks past the numbers. Keep that spot still in the windscreen: if it moves up you are getting low, if it moves down you are getting high.",
        targets: ["out-view"],
        panel: "out",
      },
      {
        title: "Hold 65 knots and the slope",
        why: "Pitch sets the speed: aim for 65 knots. Power sets the slope: two white and two red PAPI lights is right. More white: you are high, take off a little power (S). More red: you are low, add power (W).",
        targets: ["key-pitch", "key-throttle", "o-ias"],
        panel: "out",
        aim: { kias: 65, hdg: LEG_HDG.final },
        done: (s) => at(s).x > -600 && s.aglFt < 250 && s.kias > 56 && s.kias < 76,
      },
      {
        title: "Over the runway edge: power to idle (Shift+S)",
        why: "As you cross the start of the runway, about 50 ft up, take all the power off with Shift+S. Keep the nose where it is for now.",
        targets: ["key-throttle", "o-rpm"],
        panel: "out",
        aim: { kias: 65, hdg: LEG_HDG.final },
        done: (s, c) => c.throttle < 0.05 && s.aglFt < 90,
      },
      {
        title: "Flare and touch down",
        why: "About 10 to 15 ft above the runway, hold the Down arrow gently to raise the nose to the horizon and stop the descent. Keep holding as the speed falls. The main wheels touch first. The stall horn may sound just before: that is normal in a good landing.",
        targets: ["key-pitch"],
        panel: "out",
        done: (s) => s.onGround && onRunway(s),
      },
      {
        title: "Nose wheel down, keep straight, brake (B)",
        why: "Let go of the arrows so the nose wheel comes down. Keep straight with A and D, then hold B to slow to walking pace.",
        targets: ["key-rudder", "key-brakes"],
        panel: "out",
        done: (s) => s.onGround && s.groundSpeedKt < 6,
      },
      {
        title: "Flaps up (R)",
        why: "After landing, the flaps come up: press R until FLAPS shows 0. You have landed.",
        targets: ["key-flaps", "o-flaps"],
        panel: "out",
        done: (_s, c) => c.flaps === 0,
      },
    ],
  },
];
