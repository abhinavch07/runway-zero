// Small helpers shared by the Ground School views.

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escape, then turn **text** into bold. */
export const md = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

export const LETTERS = ["A", "B", "C", "D"];

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Views that hold timers or key handlers register a cleanup to run when the route changes. */
let cleanup: (() => void) | null = null;
export function onLeave(fn: () => void) {
  cleanup = fn;
}
export function runCleanup() {
  cleanup?.();
  cleanup = null;
}
