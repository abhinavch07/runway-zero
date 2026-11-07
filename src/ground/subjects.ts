// The DGCA CPL papers and their modules. A module is listed with only a title until it is written.
import type { Subject } from "./types.ts";
import { M01 } from "./met/m01-atmosphere.ts";
import { M02 } from "./met/m02-temp-density-humidity.ts";
import { M03 } from "./met/m03-pressure.ts";
import { M04 } from "./met/m04-wind.ts";
import { M05 } from "./met/m05-stability-clouds.ts";

export const SUBJECTS: Subject[] = [
  {
    id: "met",
    title: "Meteorology",
    blurb: "The atmosphere, weather, flight hazards and the Met reports and forecasts pilots use.",
    modules: [
      M01,
      M02,
      M03,
      M04,
      M05,
      { n: 6, title: "Precipitation, Visibility, Fog and Optical Phenomena", car: "1.4 b, 1.5, 1.9 g" },
      { n: 7, title: "Air Masses and Fronts", car: "1.6" },
      { n: 8, title: "Pressure Systems and Tropical Cyclones", car: "1.7" },
      { n: 9, title: "General Circulation, Jet Streams and CAT", car: "1.2 c, d" },
      { n: 10, title: "Climate of India: Monsoon, Western Disturbances, Local Storms", car: "1.8" },
      { n: 11, title: "Thunderstorms, Microburst and Windshear", car: "1.9 c, d" },
      { n: 12, title: "Icing, Turbulence, Mountain Waves and Inversions", car: "1.2 g, 1.9 a, b, e, f" },
      { n: 13, title: "Observations, Instruments, Radar, Satellites and Charts", car: "1.10 a, b" },
      { n: 14, title: "Met Reports and Forecasts: METAR, TAF, SIGMET and more", car: "1.10 c" },
    ],
  },
  { id: "regs", title: "Air Regulations", blurb: "Aircraft Act and Rules, CARs, ICAO Annexes, rules of the air and ATS.", modules: [] },
  { id: "nav", title: "Air Navigation", blurb: "The earth, charts, DR navigation, compasses, radio aids and flight planning.", modules: [] },
  { id: "tg", title: "Technical General", blurb: "Principles of flight, airframes, engines, systems and instruments.", modules: [] },
  { id: "ts", title: "Technical Specific", blurb: "One track per aircraft type: C172, PA-28 and more.", modules: [] },
  { id: "rtr", title: "RTR (A) Part 1 and Part 2", blurb: "Radio telephony: phraseology, procedures and radio theory.", modules: [] },
];

export const subject = (id: string) => SUBJECTS.find((s) => s.id === id);

/** Mock exam pattern: DGCA CPL Meteorology, 50 questions in 2 hours, 70% to pass, no negative marking. */
export const MOCK = { questions: 50, minutes: 120, passPercent: 70, negative: false };
