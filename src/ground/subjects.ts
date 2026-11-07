// The DGCA CPL papers and their modules. A module is listed with only a title until it is written.
import type { Subject } from "./types.ts";
import { M01 } from "./met/m01-atmosphere.ts";

export const SUBJECTS: Subject[] = [
  {
    id: "met",
    title: "Meteorology",
    blurb: "The atmosphere, weather, flight hazards and the Met reports and forecasts pilots use.",
    modules: [
      M01,
      { n: 2, title: "Temperature, Density and Humidity", car: "1.1 b, d, 1.3" },
      { n: 3, title: "Pressure and Altimetry", car: "1.1 c, f" },
      { n: 4, title: "Wind", car: "1.2 a, b, e, f" },
      { n: 5, title: "Vertical Motion, Stability and Clouds", car: "1.3, 1.4 a" },
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

/**
 * Mock exam pattern. Public sources do not agree on the current DGCA paper, so this is kept in one
 * place and shown on the start screen. Change it here once confirmed.
 */
export const MOCK = { questions: 50, minutes: 120, passPercent: 70, negative: false };
