// Ground School data types. Text fields use **double stars** for bold, nothing else.

/** One piece of a notes section. */
export type Block =
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  /** "Remember for the exam" box: the facts that are asked again and again. */
  | { t: "remember"; items: string[] }
  /** The old exam answer is different from the current rule or value. */
  | { t: "flag"; text: string }
  /** A short memory trick. */
  | { t: "tip"; text: string }
  /** A worked calculation, one line per step. */
  | { t: "example"; title: string; steps: string[] }
  /** A diagram from figures.ts, by key. */
  | { t: "figure"; key: string; caption: string };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Slide {
  title: string;
  points: string[];
  figure?: string;
}

export interface Mcq {
  id: string;
  q: string;
  /** Always four options, like the DGCA paper. */
  options: [string, string, string, string];
  /** Index of the right option, 0 to 3. */
  answer: number;
  /** Why the answer is right, in plain words. */
  why: string;
  /** Set when the exam is known to expect an older answer than the current rule. */
  flag?: string;
}

export interface Module {
  /** Module number inside the subject, from 1. */
  n: number;
  title: string;
  /** CAR Section 7 Series B Part IV syllabus references. */
  car: string;
  summary: string;
  sections: Section[];
  slides: Slide[];
  mcqs: Mcq[];
}

/** A module that is planned but not written yet. */
export interface PlannedModule {
  n: number;
  title: string;
  car: string;
}

export interface Subject {
  id: string;
  title: string;
  blurb: string;
  modules: (Module | PlannedModule)[];
}

export const isReady = (m: Module | PlannedModule): m is Module => "sections" in m;
