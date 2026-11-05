// Every aircraft and its lessons, for the lesson picker. Each aircraft has its own page.
import type { LessonInfo } from "./types";
import { LESSONS } from "./lessons";
import { C172_LESSONS } from "../c172/lessons";

export type AircraftId = "a320" | "c172";

export interface AircraftEntry {
  id: AircraftId;
  name: string;
  blurb: string;
  /** Page that runs this aircraft, relative to the site root. */
  page: string;
  lessons: LessonInfo[];
}

export const AIRCRAFT: AircraftEntry[] = [
  {
    id: "a320",
    name: "A320neo",
    blurb: "Airliner: overhead, MCDU, FCU and engine start, Delhi to Mumbai.",
    page: "./",
    lessons: LESSONS,
  },
  {
    id: "c172",
    name: "Cessna 172",
    blurb: "Light aircraft with a glass cockpit: start-up, PFD and MFD, run-up, shutdown.",
    page: "./c172.html",
    lessons: C172_LESSONS,
  },
];
