// Ground School progress, kept in this browser only. Storage can be blocked (private windows),
// so every use is wrapped and failure simply means "no progress yet".

const KEY = "runway-zero-ground";

export interface ModuleProgress {
  notesRead?: boolean;
  /** Best practice score as a percentage. */
  best?: number;
}

export interface MockResult {
  subject: string;
  at: number;
  score: number;
  total: number;
}

interface Store {
  modules: Record<string, ModuleProgress>;
  mocks: MockResult[];
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Store>;
      return { modules: s.modules ?? {}, mocks: s.mocks ?? [] };
    }
  } catch {
    /* fall through */
  }
  return { modules: {}, mocks: [] };
}

function save(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* not saved, that is fine */
  }
}

const key = (subject: string, n: number) => `${subject}-${n}`;

export const moduleProgress = (subject: string, n: number): ModuleProgress => load().modules[key(subject, n)] ?? {};

export function markNotesRead(subject: string, n: number) {
  const s = load();
  s.modules[key(subject, n)] = { ...s.modules[key(subject, n)], notesRead: true };
  save(s);
}

export function recordPractice(subject: string, n: number, percent: number) {
  const s = load();
  const old = s.modules[key(subject, n)] ?? {};
  s.modules[key(subject, n)] = { ...old, best: Math.max(old.best ?? 0, percent) };
  save(s);
}

export function recordMock(r: MockResult) {
  const s = load();
  s.mocks = [r, ...s.mocks].slice(0, 20);
  save(s);
}

export const mockHistory = (subject: string) => load().mocks.filter((m) => m.subject === subject);
