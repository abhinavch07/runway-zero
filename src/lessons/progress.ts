// Lesson progress, kept in this browser only. Browser storage can be missing or blocked
// (private windows, some embedded views), so every use is wrapped and failure means "no progress".
import { PASS_MARK } from "./quizzes";

const KEY = "runway-zero-progress";

export interface LessonProgress {
  finished: boolean;
  bestScore: number;
}

export type Progress = Record<string, LessonProgress>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* not saved, that is fine */
  }
}

export function markFinished(id: string) {
  const p = loadProgress();
  p[id] = { finished: true, bestScore: p[id]?.bestScore ?? 0 };
  save(p);
}

export function recordScore(id: string, score: number) {
  const p = loadProgress();
  const old = p[id] ?? { finished: true, bestScore: 0 };
  p[id] = { finished: true, bestScore: Math.max(old.bestScore, score) };
  save(p);
}

export function resetProgress() {
  save({});
}

export const passed = (lp?: LessonProgress) => !!lp && lp.finished && lp.bestScore >= PASS_MARK;
