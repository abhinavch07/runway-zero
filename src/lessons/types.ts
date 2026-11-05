// Lesson types shared by every aircraft. S = simulation state, C = controls, X = extra data
// (for example the A320 MCDU), P = the aircraft's panel names.

export interface StepBase<S, C, X, P extends string> {
  title: string;
  why: string;
  /** Controls to highlight (their data-ctl values). */
  targets: string[];
  /** Where the step's switches should end up. Switches already there stop pulsing. */
  want?: boolean;
  /** Panel to show for this step. */
  panel: P;
  /** Ticks the step off when true. Steps without it are manual: the learner presses Next. */
  done?: (s: S, c: C, x: X) => boolean;
}

export interface LessonInfo {
  id: string;
  title: string;
  summary: string;
  minutes: number;
}

export interface LessonBase<S, C, X, P extends string> extends LessonInfo {
  steps: StepBase<S, C, X, P>[];
  finished: string;
}
