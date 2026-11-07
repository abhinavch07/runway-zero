// Ground School data checks. Run with: node scripts/ground-test.ts
// Every question has four options and a valid answer, ids are unique, figures exist,
// and the text keeps the house style (no em dashes or semicolons).
import { SUBJECTS } from "../src/ground/subjects.ts";
import { isReady, type Module } from "../src/ground/types.ts";

// figures.ts only builds strings, so it loads fine in Node.
const { FIGURES } = await import("../src/ground/figures.ts");

let problems = 0;
const fail = (msg: string) => {
  problems++;
  console.error("FAIL " + msg);
};
const ids = new Set<string>();

function textOf(m: Module): string[] {
  const out: string[] = [m.title, m.summary];
  for (const s of m.sections) {
    out.push(s.title);
    for (const b of s.blocks) {
      if (b.t === "p" || b.t === "flag" || b.t === "tip") out.push(b.text);
      if (b.t === "list" || b.t === "remember") out.push(...b.items);
      if (b.t === "table") out.push(...b.head, ...b.rows.flat(), b.caption ?? "");
      if (b.t === "example") out.push(b.title, ...b.steps);
      if (b.t === "figure") {
        out.push(b.caption);
        if (!FIGURES[b.key]) fail(`${m.title}: unknown figure ${b.key}`);
      }
    }
  }
  for (const sl of m.slides) {
    out.push(sl.title, ...sl.points);
    if (sl.figure && !FIGURES[sl.figure]) fail(`${m.title}: slide figure ${sl.figure} missing`);
  }
  for (const q of m.mcqs) out.push(q.q, ...q.options, q.why, q.flag ?? "");
  return out;
}

for (const s of SUBJECTS) {
  for (const m of s.modules.filter(isReady)) {
    for (const q of m.mcqs) {
      if (ids.has(q.id)) fail(`duplicate id ${q.id}`);
      ids.add(q.id);
      if (q.options.length !== 4) fail(`${q.id}: needs 4 options`);
      if (!(q.answer >= 0 && q.answer <= 3)) fail(`${q.id}: answer out of range`);
      if (new Set(q.options).size !== 4) fail(`${q.id}: repeated option`);
      if (!q.why.trim()) fail(`${q.id}: no explanation`);
    }
    for (const t of textOf(m)) {
      if (t.includes("—")) fail(`${m.title}: em dash in "${t.slice(0, 60)}"`);
      if (t.includes(";")) fail(`${m.title}: semicolon in "${t.slice(0, 60)}"`);
      if ((t.match(/\*\*/g) ?? []).length % 2) fail(`${m.title}: unpaired ** in "${t.slice(0, 60)}"`);
    }
    // Answers should not all sit on one letter.
    const spread = [0, 1, 2, 3].map((k) => m.mcqs.filter((q) => q.answer === k).length);
    console.log(`${s.title} ${m.n}. ${m.title}: ${m.mcqs.length} questions, ${m.slides.length} slides, answers A-D ${spread.join("/")}`);
  }
}
for (const [k, draw] of Object.entries(FIGURES)) if (!draw().startsWith("<svg")) fail(`figure ${k} did not draw`);

if (problems) {
  console.error(`${problems} problem(s)`);
  process.exit(1);
}
console.log("Ground School data OK");
