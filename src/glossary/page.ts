// Glossary page: every term A to Z, with a search box and letter links.
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "../welcome/style.css";
import "./page.css";
import "../theme/light.css";
import { setUpThemeToggle } from "../theme/theme";
setUpThemeToggle();
import { TERMS } from "./terms";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
const first = (t: string) => t.replace(/[^A-Za-z0-9]/g, "")[0].toUpperCase();
const slug = (t: string) => "g-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const list = document.getElementById("g-list")!;
const q = document.getElementById("g-q") as HTMLInputElement;
const count = document.getElementById("g-count")!;
const letters = document.getElementById("g-letters")!;

let lastLetter = "";
list.innerHTML = sorted
  .map((t) => {
    const l = first(t.term);
    const anchor = l !== lastLetter ? ` data-letter="${l}"` : "";
    lastLetter = l;
    const also = t.also?.length ? `<span class="g-also">also ${t.also.map(esc).join(", ")}</span>` : "";
    const where = t.where ? `<span class="g-where">${esc(t.where)}</span>` : "";
    return `<div class="g-item" id="${slug(t.term)}"${anchor}><dt>${esc(t.term)} ${also}${where}</dt><dd>${esc(t.text)}</dd></div>`;
  })
  .join("");

const used = new Set(sorted.map((t) => first(t.term)));
letters.innerHTML = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
  .map((l) => (used.has(l) ? `<a href="#" data-l="${l}">${l}</a>` : `<span>${l}</span>`))
  .join("");
letters.addEventListener("click", (e) => {
  const l = (e.target as HTMLElement).dataset.l;
  if (!l) return;
  e.preventDefault();
  q.value = "";
  filter();
  list.querySelector(`[data-letter="${l}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

const items = [...list.querySelectorAll<HTMLElement>(".g-item")];
function filter() {
  const s = q.value.trim().toLowerCase();
  let n = 0;
  items.forEach((el, i) => {
    const t = sorted[i];
    const hit = !s || [t.term, ...(t.also ?? []), t.text].some((x) => x.toLowerCase().includes(s));
    el.hidden = !hit;
    if (hit) n++;
  });
  count.textContent = s ? (n ? `${n} match${n === 1 ? "" : "es"}` : "No match. Try a shorter word.") : `${sorted.length} words`;
}
q.addEventListener("input", filter);
// glossary.html?q=QNH or #g-qnh opens on that word.
const start = new URLSearchParams(location.search).get("q");
if (start) q.value = start;
filter();
