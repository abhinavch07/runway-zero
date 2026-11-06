// Marks glossary terms in a piece of text, and shows a small pop-up when one is hovered, focused or
// tapped. Used in lesson steps, quizzes and explore cards on every aircraft page.
import { TERMS, type Term } from "./terms.ts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Every written form of every term, longest first so "Flight level" wins over shorter matches. */
const FORMS: { form: string; term: Term }[] = TERMS.flatMap((t) => [t.term, ...(t.also ?? [])].map((form) => ({ form, term: t }))).sort(
  (a, b) => b.form.length - a.form.length,
);
// Two patterns: exact case for abbreviations, any case for ordinary words.
const build = (ci: boolean) => {
  const list = FORMS.filter((f) => !!f.term.ci === ci).map((f) => reEsc(f.form));
  return new RegExp(`(?<![A-Za-z0-9/.-])(${list.join("|")})(?![A-Za-z0-9/])`, ci ? "gi" : "g");
};
const EXACT = build(false);
const ANYCASE = build(true);
const byForm = new Map<string, Term>();
for (const f of FORMS) byForm.set(f.term.ci ? f.form.toLowerCase() : f.form, f.term);
const find = (s: string) => byForm.get(s) ?? byForm.get(s.toLowerCase());

/** Escapes the text and marks the first appearance of each glossary term with a dotted underline. */
export function glossarize(text: string): string {
  const seen = new Set<Term>();
  const marks: { start: number; end: number; term: Term }[] = [];
  for (const re of [EXACT, ANYCASE]) {
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      const term = find(m[1]);
      if (!term || seen.has(term)) continue;
      const start = m.index;
      const end = start + m[1].length;
      if (marks.some((k) => start < k.end && end > k.start)) continue;
      seen.add(term);
      marks.push({ start, end, term });
    }
  }
  marks.sort((a, b) => a.start - b.start);
  let out = "";
  let at = 0;
  for (const k of marks) {
    out += esc(text.slice(at, k.start));
    out += `<span class="gl" tabindex="0" data-term="${esc(k.term.term)}">${esc(text.slice(k.start, k.end))}</span>`;
    at = k.end;
  }
  return out + esc(text.slice(at));
}

let tip: HTMLElement | null = null;
let shownFor: HTMLElement | null = null;

/** Turns on the pop-ups for every marked term on the page. Call once per page. */
export function enableGlossaryTips() {
  if (tip) return;
  tip = document.createElement("div");
  tip.id = "gl-tip";
  tip.className = "hidden";
  tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);
  const show = (el: HTMLElement) => {
    const t = TERMS.find((x) => x.term === el.dataset.term);
    if (!t || !tip) return;
    shownFor = el;
    tip.innerHTML = `<b>${esc(t.term)}</b> ${esc(t.text)}`;
    tip.classList.remove("hidden");
    const r = el.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const x = Math.max(8, Math.min(innerWidth - w - 8, r.left));
    const y = r.bottom + 6 + h > innerHeight - 8 ? r.top - h - 6 : r.bottom + 6;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  const hide = () => {
    shownFor = null;
    tip?.classList.add("hidden");
  };
  document.addEventListener("pointerover", (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>(".gl");
    if (el) show(el);
    else if (shownFor) hide();
  });
  document.addEventListener("focusin", (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>(".gl");
    if (el) show(el);
  });
  document.addEventListener("focusout", hide);
  // Tap on touch screens: tap a term to show it, tap anywhere else to hide.
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>(".gl");
    if (el && el !== shownFor) show(el);
    else if (!el) hide();
  });
  document.addEventListener("scroll", hide, true);
}
