// Ground School: DGCA theory courses. One page, routed by the address hash:
//   #/                 all subjects
//   #/met              one subject: its modules and the mock exam
//   #/met/1            module notes (#/met/1/slides, #/met/1/practice)
//   #/met/mock         timed mock exam
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "../welcome/style.css";
import "./style.css";
import "../theme/light.css";
import { SUBJECTS, subject, MOCK } from "./subjects";
import { isReady, type Block, type Mcq, type Module, type Subject } from "./types";
import { FIGURES } from "./figures";
import { markNotesRead, moduleProgress, recordPractice } from "./progress";
import { renderMock } from "./mock";
import { esc, md, LETTERS, shuffle, onLeave, runCleanup } from "./util";
import { setUpThemeToggle } from "../theme/theme";

const root = document.getElementById("gs-root")!;

function figure(key: string, caption?: string) {
  const draw = FIGURES[key];
  if (!draw) return "";
  return `<figure class="gs-fig">${draw()}${caption ? `<figcaption>${md(caption)}</figcaption>` : ""}</figure>`;
}

function block(b: Block): string {
  switch (b.t) {
    case "p":
      return `<p>${md(b.text)}</p>`;
    case "list":
      return `<ul>${b.items.map((i) => `<li>${md(i)}</li>`).join("")}</ul>`;
    case "table":
      return `<div class="gs-tablewrap"><table>${b.caption ? `<caption>${md(b.caption)}</caption>` : ""}<thead><tr>${b.head
        .map((h) => `<th>${md(h)}</th>`)
        .join("")}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "remember":
      return `<aside class="gs-remember"><h4>Remember for the exam</h4><ul>${b.items.map((i) => `<li>${md(i)}</li>`).join("")}</ul></aside>`;
    case "flag":
      return `<aside class="gs-flag"><h4>Old exam answer</h4><p>${md(b.text)}</p></aside>`;
    case "tip":
      return `<aside class="gs-tip"><h4>Memory trick</h4><p>${md(b.text)}</p></aside>`;
    case "example":
      return `<aside class="gs-example"><h4>Worked example: ${md(b.title)}</h4><ol>${b.steps.map((s) => `<li>${md(s)}</li>`).join("")}</ol></aside>`;
    case "figure":
      return figure(b.key, b.caption);
  }
}

function crumbs(parts: [string, string?][]) {
  return `<nav class="gs-crumbs" aria-label="You are here">${parts
    .map(([label, href]) => (href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`))
    .join(" <i>/</i> ")}</nav>`;
}

// ---------- Home: all subjects ----------
function home() {
  root.innerHTML = `
    <section class="gs-head">
      <h1>Ground School</h1>
      <p class="gs-lead">Free courses for the DGCA CPL theory papers. Simple notes, slides, practice questions with the reason for every answer, and timed mock exams.</p>
    </section>
    <div class="gs-subjects">
      ${SUBJECTS.map((s) => {
        const ready = s.modules.filter(isReady).length;
        const open = s.modules.length > 0;
        return `<a class="gs-subject${open ? "" : " is-soon"}" ${open ? `href="#/${s.id}"` : 'aria-disabled="true"'}>
          <h2>${esc(s.title)}</h2>
          <p>${esc(s.blurb)}</p>
          <span class="gs-pill">${open ? `${ready} of ${s.modules.length} modules ready` : "Coming soon"}</span>
        </a>`;
      }).join("")}
    </div>
    ${notice()}`;
}

function notice() {
  return `<p class="gs-notice"><b>For learning only.</b> Written in our own words from the DGCA syllabus (CAR Section 7, Series B, Part IV). Questions are our own practice questions, not real exam papers. Found a mistake? <a href="feedback.html?ref=Ground%20School">Tell us here</a>.</p>`;
}

// ---------- Subject: modules and mock exam ----------
function subjectPage(s: Subject) {
  const ready = s.modules.filter(isReady);
  const qCount = ready.reduce((n, m) => n + m.mcqs.length, 0);
  root.innerHTML = `
    ${crumbs([["Ground School", "#/"], [s.title]])}
    <section class="gs-head">
      <h1>${esc(s.title)}</h1>
      <p class="gs-lead">${esc(s.blurb)} ${s.modules.length} modules following the DGCA CPL syllabus.</p>
    </section>
    <ol class="gs-modules">
      ${s.modules
        .map((m) => {
          if (!isReady(m)) {
            return `<li class="gs-module is-soon"><span class="gs-num">${m.n}</span><div><h3>${esc(m.title)}</h3><p>CAR ${esc(m.car)} · Coming soon</p></div></li>`;
          }
          const p = moduleProgress(s.id, m.n);
          const ticks = `<span class="gs-tick${p.notesRead ? " on" : ""}" title="Notes read">Notes</span><span class="gs-tick${(p.best ?? 0) >= 70 ? " on" : ""}" title="Practice passed">Practice${p.best !== undefined ? ` ${p.best}%` : ""}</span>`;
          return `<li class="gs-module"><span class="gs-num">${m.n}</span><div>
            <h3><a href="#/${s.id}/${m.n}">${esc(m.title)}</a></h3>
            <p>CAR ${esc(m.car)} · ${m.mcqs.length} questions · ${m.slides.length} slides</p>
            <div class="gs-ticks">${ticks}</div>
            <div class="gs-links"><a href="#/${s.id}/${m.n}">Notes</a><a href="#/${s.id}/${m.n}/slides">Slides</a><a href="#/${s.id}/${m.n}/practice">Practice</a></div>
          </div></li>`;
        })
        .join("")}
    </ol>
    <section class="gs-mockcard">
      <h2>Mock exam</h2>
      <p>${MOCK.questions} questions, ${MOCK.minutes} minutes, pass mark ${MOCK.passPercent}%. Questions are drawn at random from every ready module, with a score for each module at the end.</p>
      ${qCount < MOCK.questions ? `<p class="gs-small">Preview: only ${ready.length} module${ready.length === 1 ? " is" : "s are"} ready, so this mock has ${qCount < MOCK.questions ? qCount : MOCK.questions} questions. Full mocks open as more modules are added.</p>` : ""}
      <a class="w-btn w-btn-main" href="#/${s.id}/mock">Start mock exam</a>
    </section>
    ${notice()}`;
}

// ---------- Module ----------
function moduleTabs(s: Subject, m: Module, tab: string) {
  const t = (id: string, label: string) =>
    `<a href="#/${s.id}/${m.n}${id ? "/" + id : ""}" ${tab === id ? 'aria-current="page"' : ""}>${label}</a>`;
  return `${crumbs([["Ground School", "#/"], [s.title, `#/${s.id}`], [`Module ${m.n}`]])}
    <section class="gs-head gs-head-mod">
      <p class="gs-kicker">${esc(s.title)} · Module ${m.n} · CAR ${esc(m.car)}</p>
      <h1>${esc(m.title)}</h1>
    </section>
    <nav class="gs-tabs" aria-label="Module parts">${t("", "Notes")}${t("slides", "Slides")}${t("practice", `Practice (${m.mcqs.length})`)}</nav>`;
}

function nextModuleLink(s: Subject, m: Module) {
  const next = s.modules.find((x) => x.n === m.n + 1);
  if (!next) return "";
  return isReady(next)
    ? `<a class="w-btn w-btn-quiet" href="#/${s.id}/${next.n}">Next: Module ${next.n}, ${esc(next.title)}</a>`
    : `<span class="gs-small">Next: Module ${next.n}, ${esc(next.title)} (coming soon)</span>`;
}

function notesPage(s: Subject, m: Module) {
  const read = moduleProgress(s.id, m.n).notesRead;
  root.innerHTML = `${moduleTabs(s, m, "")}
    <div class="gs-notes">
      <aside class="gs-toc"><h4>In this module</h4><ol>${m.sections.map((x) => `<li><a href="#" data-to="${x.id}">${esc(x.title)}</a></li>`).join("")}</ol></aside>
      <article class="gs-article">
        <p class="gs-summary">${md(m.summary)}</p>
        ${m.sections.map((x) => `<section id="sec-${x.id}"><h2>${esc(x.title)}</h2>${x.blocks.map(block).join("")}</section>`).join("")}
        <div class="gs-done">
          <button class="w-btn w-btn-main" id="gs-read">${read ? "Notes read ✓" : "Mark notes as read"}</button>
          <a class="w-btn w-btn-quiet" href="#/${s.id}/${m.n}/practice">Practice the ${m.mcqs.length} questions</a>
        </div>
      </article>
    </div>`;
  // Section links scroll without changing the route.
  root.querySelector(".gs-toc")!.addEventListener("click", (e) => {
    const id = (e.target as HTMLElement).dataset.to;
    if (!id) return;
    e.preventDefault();
    document.getElementById("sec-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("gs-read")!.addEventListener("click", (e) => {
    markNotesRead(s.id, m.n);
    (e.target as HTMLElement).textContent = "Notes read ✓";
  });
}

function slidesPage(s: Subject, m: Module) {
  let i = 0;
  root.innerHTML = `${moduleTabs(s, m, "slides")}
    <div class="gs-deck" id="gs-deck">
      <div class="gs-slide" id="gs-slide" aria-live="polite"></div>
      <div class="gs-deckbar">
        <button class="w-btn w-btn-quiet" id="gs-prev">Back</button>
        <span id="gs-count"></span>
        <button class="w-btn w-btn-quiet" id="gs-full">Full screen</button>
        <button class="w-btn w-btn-main" id="gs-next">Next</button>
      </div>
      <p class="gs-small">Use the arrow keys to move between slides.</p>
    </div>`;
  const deck = document.getElementById("gs-deck")!;
  const box = document.getElementById("gs-slide")!;
  const show = () => {
    const sl = m.slides[i];
    box.innerHTML = `<div class="gs-slide-text"><p class="gs-kicker">Module ${m.n} · ${esc(m.title)}</p><h2>${md(sl.title)}</h2><ul>${sl.points
      .map((p) => `<li>${md(p)}</li>`)
      .join("")}</ul></div>${sl.figure ? `<div class="gs-slide-fig">${figure(sl.figure)}</div>` : ""}`;
    box.classList.toggle("has-fig", !!sl.figure);
    document.getElementById("gs-count")!.textContent = `${i + 1} / ${m.slides.length}`;
    (document.getElementById("gs-prev") as HTMLButtonElement).disabled = i === 0;
    const next = document.getElementById("gs-next") as HTMLButtonElement;
    next.textContent = i === m.slides.length - 1 ? "Practice" : "Next";
  };
  const go = (d: number) => {
    if (i + d >= m.slides.length) {
      location.hash = `#/${s.id}/${m.n}/practice`;
      return;
    }
    i = Math.max(0, i + d);
    show();
  };
  document.getElementById("gs-prev")!.onclick = () => go(-1);
  document.getElementById("gs-next")!.onclick = () => go(1);
  document.getElementById("gs-full")!.onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else deck.requestFullscreen?.().catch(() => {});
  };
  const keys = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
  };
  window.addEventListener("keydown", keys);
  onLeave(() => {
    window.removeEventListener("keydown", keys);
    if (document.fullscreenElement) document.exitFullscreen();
  });
  show();
}

function practicePage(s: Subject, m: Module) {
  root.innerHTML = `${moduleTabs(s, m, "practice")}
    <section class="gs-practice-start">
      <p>Answer one question at a time. The right answer and the reason show as soon as you pick. Score ${MOCK.passPercent}% or more to tick this module.</p>
      <div class="gs-actions">
        <button class="w-btn w-btn-main" data-n="all">All ${m.mcqs.length} questions</button>
        <button class="w-btn w-btn-quiet" data-n="10">Quick 10</button>
      </div>
    </section>`;
  root.querySelector(".gs-actions")!.addEventListener("click", (e) => {
    const n = (e.target as HTMLElement).dataset.n;
    if (!n) return;
    const set = shuffle(m.mcqs);
    runPractice(s, m, n === "all" ? set : set.slice(0, 10));
  });
}

function runPractice(s: Subject, m: Module, qs: Mcq[]) {
  let i = 0;
  let right = 0;
  let picked: number | null = null;
  const wrong: Mcq[] = [];
  const host = document.createElement("section");
  host.className = "gs-quiz";
  root.querySelector(".gs-practice-start")!.replaceWith(host);

  const draw = () => {
    const q = qs[i];
    host.innerHTML = `
      <div class="gs-qhead"><span>Question ${i + 1} of ${qs.length}</span><span>${right} right so far</span></div>
      <div class="gs-bar"><i style="width:${(i / qs.length) * 100}%"></i></div>
      <h3 class="gs-q">${md(q.q)}</h3>
      <div class="gs-opts">${q.options
        .map((o, k) => `<button class="gs-opt" data-k="${k}"><b>${LETTERS[k]}</b><span>${md(o)}</span></button>`)
        .join("")}</div>
      <div class="gs-why" id="gs-why"></div>`;
    picked = null;
  };
  const answer = (k: number) => {
    if (picked !== null) return;
    picked = k;
    const q = qs[i];
    const ok = k === q.answer;
    if (ok) right++;
    else wrong.push(q);
    host.querySelectorAll<HTMLButtonElement>(".gs-opt").forEach((b, j) => {
      b.disabled = true;
      if (j === q.answer) b.classList.add("is-right");
      else if (j === k) b.classList.add("is-wrong");
    });
    host.querySelector("#gs-why")!.innerHTML = `
      <p class="gs-verdict ${ok ? "ok" : "no"}">${ok ? "Correct." : `Not quite. The answer is ${LETTERS[q.answer]}.`}</p>
      <p>${md(q.why)}</p>
      ${q.flag ? `<aside class="gs-flag"><h4>Old exam answer</h4><p>${md(q.flag)}</p></aside>` : ""}
      <p class="gs-small gs-report"><a href="feedback.html?ref=${q.id}" target="_blank" rel="noopener">Report a problem with this question (${q.id})</a></p>
      <button class="w-btn w-btn-main" id="gs-nextq">${i === qs.length - 1 ? "See my score" : "Next question"}</button>`;
    const nb = host.querySelector<HTMLButtonElement>("#gs-nextq")!;
    nb.onclick = next;
    nb.focus({ preventScroll: true });
  };
  const next = () => {
    if (i < qs.length - 1) {
      i++;
      draw();
      return;
    }
    const pct = Math.round((right / qs.length) * 100);
    if (qs.length === m.mcqs.length) recordPractice(s.id, m.n, pct);
    const passed = pct >= MOCK.passPercent;
    host.innerHTML = `
      <div class="gs-result ${passed ? "ok" : "no"}">
        <p class="gs-big">${right} / ${qs.length} · ${pct}%</p>
        <p>${passed ? "Passed. Well done." : `Below ${MOCK.passPercent}%. Read the notes on the ones you missed and try again.`}</p>
        ${qs.length !== m.mcqs.length ? `<p class="gs-small">Quick sets are not saved. Do all ${m.mcqs.length} to tick the module.</p>` : ""}
      </div>
      ${wrong.length ? `<h3>Questions you missed</h3><ol class="gs-review">${wrong
        .map((q) => `<li><p>${md(q.q)}</p><p class="gs-ans">Answer: ${LETTERS[q.answer]}. ${md(q.options[q.answer])}</p><p class="gs-small">${md(q.why)}</p></li>`)
        .join("")}</ol>` : ""}
      <div class="gs-actions">
        ${wrong.length ? `<button class="w-btn w-btn-main" id="gs-retry">Try the ${wrong.length} I missed</button>` : ""}
        <a class="w-btn w-btn-quiet" href="#/${s.id}/${m.n}/practice" id="gs-again">Start again</a>
        ${nextModuleLink(s, m)}
      </div>`;
    host.querySelector("#gs-retry")?.addEventListener("click", () => {
      qs = shuffle(wrong.splice(0));
      i = 0;
      right = 0;
      draw();
    });
    // Same route as now, so force a fresh page.
    host.querySelector("#gs-again")?.addEventListener("click", (e) => {
      e.preventDefault();
      route();
    });
  };
  host.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".gs-opt");
    if (b) answer(Number(b.dataset.k));
  });
  const keys = (e: KeyboardEvent) => {
    const k = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
    if (k >= 0 && e.key.length === 1 && picked === null && host.querySelector(".gs-opt")) answer(k);
  };
  window.addEventListener("keydown", keys);
  onLeave(() => window.removeEventListener("keydown", keys));
  draw();
}

// ---------- Router ----------
function route() {
  runCleanup();
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const s = parts[0] ? subject(parts[0]) : undefined;
  if (!s || !s.modules.length) home();
  else if (!parts[1]) subjectPage(s);
  else if (parts[1] === "mock") renderMock(root, s);
  else {
    const m = s.modules.find((x) => String(x.n) === parts[1]);
    if (!m || !isReady(m)) subjectPage(s);
    else if (parts[2] === "slides") slidesPage(s, m);
    else if (parts[2] === "practice") practicePage(s, m);
    else notesPage(s, m);
  }
  window.scrollTo(0, 0);
  document.title = `${parts.length ? (s?.title ?? "Ground School") + " · " : ""}Ground School · Runway Zero`;
}

window.addEventListener("hashchange", route);
setUpThemeToggle();
route();
