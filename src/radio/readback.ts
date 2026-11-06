// Checks a spoken read-back. The browser turns speech into text, and here we look for each key
// item of the clearance in it: where to, the runway, the waypoint, the altitude, the squawk and
// the callsign. Speech comes out in many forms ("4521", "4 5 2 1", "four five two one",
// "five thousand", "Victor Tango Romeo Zulu Alfa"), so everything is first reduced to plain
// letters and digits with no spaces, and each item is looked for in that.

export interface ReadbackItem {
  /** What it is, in words for ATC's reply: "squawk code". */
  kind: string;
  /** Shown to the learner, for example "Squawk 4521". */
  label: string;
  /** What must appear in the reduced text, for example "4521". */
  key: string;
}

export interface ReadbackResult {
  items: (ReadbackItem & { ok: boolean })[];
  ok: boolean;
}

const UNITS: Record<string, number> = {
  zero: 0, oh: 0, one: 1, won: 1, two: 2, to: 2, too: 2, three: 3, tree: 3, four: 4, for: 4, fower: 4, five: 5, fife: 5,
  six: 6, seven: 7, eight: 8, nine: 9, niner: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const PHONETIC: Record<string, string> = {
  alpha: "a", alfa: "a", bravo: "b", charlie: "c", delta: "d", echo: "e", foxtrot: "f", golf: "g", hotel: "h",
  india: "i", juliet: "j", juliett: "j", kilo: "k", lima: "l", mike: "m", november: "n", oscar: "o", papa: "p",
  quebec: "q", romeo: "r", sierra: "s", tango: "t", uniform: "u", victor: "v", whiskey: "w", whisky: "w",
  xray: "x", yankee: "y", zulu: "z",
};

/** Words that can sound like numbers only count as numbers next to other numbers. */
const SOFT = new Set(["to", "too", "for", "won"]);

/** Reduces spoken text to lower-case letters and digits, with number words turned into digits. */
export function reduce(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/x-ray/g, "xray")
    .replace(/(\d),(\d{3})\b/g, "$1$2")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const isNum = (w: string | undefined) => !!w && (/^\d+$/.test(w) || (w in UNITS && !SOFT.has(w)) || w in TENS);
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    let n: number | null = null;
    if (/^\d+$/.test(w)) n = Number(w);
    else if (w in TENS) {
      n = TENS[w];
      const next = words[i + 1];
      if (next && next in UNITS && UNITS[next] > 0 && UNITS[next] < 10) {
        n += UNITS[next];
        i++;
      }
    } else if (w in UNITS && (!SOFT.has(w) || isNum(words[i - 1]) || isNum(words[i + 1]))) n = UNITS[w];
    if (n === null) {
      out.push(PHONETIC[w] ?? (w === "decimal" || w === "point" ? "." : w));
      continue;
    }
    // "five thousand five hundred", "2 thousand 500"
    let value = n;
    let digitsOnly = true;
    if (words[i + 1] === "thousand") {
      value = n * 1000;
      i++;
      digitsOnly = false;
      const a = words[i + 1];
      const b = words[i + 2];
      if (a && b === "hundred" && (a in UNITS || /^\d$/.test(a))) {
        value += (/^\d$/.test(a) ? Number(a) : UNITS[a]) * 100;
        i += 2;
      } else if (a && /^\d{3}$/.test(a)) {
        value += Number(a);
        i++;
      }
    } else if (words[i + 1] === "hundred") {
      value = n * 100;
      i++;
      digitsOnly = false;
    }
    out.push(digitsOnly ? String(n) : String(value));
  }
  return out.join("");
}

/** The items a correct read-back must contain, taken from the written correct read-back. */
export function readbackItems(correct: string, callsign: string): ReadbackItem[] {
  const items: ReadbackItem[] = [];
  const to = /cleared to (?:the )?(.+?)(?: via|,)/i.exec(correct);
  if (to) items.push({ kind: "destination", label: `Cleared to ${to[1]}`, key: reduce(to[1]) });
  const rwy = /runway (\d+[LRC]?)/i.exec(correct);
  if (rwy) items.push({ kind: "runway", label: `Runway ${rwy[1]}`, key: reduce(rwy[1]) });
  const wpt = /\b(RZ\d+)\b/.exec(correct);
  if (wpt) items.push({ kind: "waypoint", label: wpt[1], key: reduce(wpt[1]) });
  const alt = /climb (?:to )?(\d+) feet/i.exec(correct);
  if (alt) items.push({ kind: "altitude", label: `Climb ${alt[1]} feet`, key: alt[1] });
  const sq = /squawk (\d{4})/i.exec(correct);
  if (sq) items.push({ kind: "squawk code", label: `Squawk ${sq[1]}`, key: sq[1] });
  items.push({ kind: "callsign", label: `Callsign ${callsign}`, key: reduce(callsign) });
  return items;
}

/** Checks what was heard. Several guesses from the recogniser can be given: the best one counts. */
export function checkReadback(heard: string[], items: ReadbackItem[]): ReadbackResult & { heard: string } {
  let best: (ReadbackResult & { heard: string }) | null = null;
  for (const h of heard) {
    const r = reduce(h);
    const res = items.map((it) => ({ ...it, ok: r.includes(it.key) }));
    const score = res.filter((x) => x.ok).length;
    if (!best || score > best.items.filter((x) => x.ok).length) best = { items: res, ok: res.every((x) => x.ok), heard: h };
  }
  return best ?? { items: items.map((it) => ({ ...it, ok: false })), ok: false, heard: "" };
}

/** The browser's speech recogniser, when it has one (Chrome and Edge). */
export function speechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
