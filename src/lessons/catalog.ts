// Every aircraft and its lessons, for the lesson picker. Each aircraft has its own page.
import type { LessonInfo } from "./types";
import { LESSONS } from "./lessons";
import { C172_LESSONS } from "../c172/lessons";
import { PA28_LESSONS } from "../c172/pa28Lessons";
import { B737_LESSONS } from "../b737/lessons";

export type AircraftId = "a320" | "b737" | "c172" | "pa28";

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
    id: "b737",
    name: "B737",
    blurb: "Airliner with large screens: power up, FMC route, engine start, MCP autopilot, radios, VOR and ILS.",
    page: "./737.html",
    lessons: B737_LESSONS,
  },
  {
    id: "c172",
    name: "Cessna 172",
    blurb: "Light aircraft with a glass cockpit: start-up, PFD and MFD, run-up, shutdown.",
    page: "./c172.html",
    lessons: C172_LESSONS,
  },
  {
    id: "pa28",
    name: "PA-28",
    blurb: "Low-wing light aircraft with a glass cockpit: hand primer, left and right tanks, run-up, fuel pump failure.",
    page: "./pa28.html",
    lessons: PA28_LESSONS,
  },
];
