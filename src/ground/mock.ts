// Timed mock exam, laid out like a computer based test: one question at a time, a palette of
// question numbers, mark for review, a countdown, and a score per module at the end.
import { MOCK } from "./subjects";
import { isReady, type Mcq, type Module, type Subject } from "./types";
import { recordMock, mockHistory } from "./progress";
import { esc, md, LETTERS, shuffle, onLeave } from "./util";

interface Item {
  q: Mcq;
  mod: Module;
}

/** Pick questions spread across the ready modules in proportion to their size. */
function draw(mods: Module[], n: number): Item[] {
  const pool = mods.flatMap((mod) => mod.mcqs.map((q) => ({ q, mod })));
  if (pool.length <= n) return shuffle(pool);
  const picked: Item[] = [];
  for (const mod of mods) {
    const share = Math.round((mod.mcqs.length / pool.length) * n);
    picked.push(...shuffle(mod.mcqs).slice(0, share).map((q) => ({ q, mod })));
  }
  // Rounding can leave us a few short or over. Top up or trim at random.
  const rest = shuffle(pool.filter((it) => !picked.includes(it) && !picked.some((p) => p.q.id === it.q.id)));
  while (picked.length < n && rest.length) picked.push(rest.pop()!);
  return shuffle(picked).slice(0, n);
}

const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

export function renderMock(root: HTMLElement, s: Subject) {
  const mods = s.modules.filter(isReady);
  const total = Math.min(MOCK.questions, mods.reduce((n, m) => n + m.mcqs.length, 0));
  // Keep the full time for a full paper, and the same time per question for a shorter preview.
  const minutes = total === MOCK.questions ? MOCK.minutes : Math.max(5, Math.round((MOCK.minutes / MOCK.questions) * total));
  const past = mockHistory(s.id).slice(0, 5);
  root.innerHTML = `
    <nav class="gs-crumbs"><a href="#/">Ground School</a> <i>/</i> <a href="#/${s.id}">${esc(s.title)}</a> <i>/</i> <span>Mock exam</span></nav>
    <section class="gs-head"><h1>${esc(s.title)} mock exam</h1></section>
    <section class="gs-mockstart">
      <ul class="gs-facts">
        <li><b>${total}</b><span>questions</span></li>
        <li><b>${minutes}</b><span>minutes</span></li>
        <li><b>${MOCK.passPercent}%</b><span>to pass</span></li>
        <li><b>${MOCK.negative ? "Yes" : "None"}</b><span>negative marking</span></li>
      </ul>
      ${total < MOCK.questions ? `<p class="gs-small">Preview mock from ${mods.length} ready module${mods.length === 1 ? "" : "s"}. The full paper will have ${MOCK.questions} questions in ${MOCK.minutes} minutes.</p>` : ""}
      <ul class="gs-rules">
        <li>Answers are not shown until you submit, just like the real exam.</li>
        <li>Use <b>Mark for review</b> on any question you want to come back to.</li>
        <li>There is no negative marking, so answer every question.</li>
        <li>The test submits by itself when the time runs out.</li>
      </ul>
      <button class="w-btn w-btn-main" id="gs-begin">Begin the exam</button>
      ${past.length ? `<h3>Your recent mocks</h3><ul class="gs-past">${past
        .map((r) => `<li>${new Date(r.at).toLocaleDateString()} · ${r.score} / ${r.total} (${Math.round((r.score / r.total) * 100)}%)</li>`)
        .join("")}</ul>` : ""}
    </section>`;
  document.getElementById("gs-begin")!.onclick = () => run(root, s, draw(mods, total), minutes);
}

function run(root: HTMLElement, s: Subject, items: Item[], minutes: number) {
  const ans: (number | null)[] = items.map(() => null);
  const marked = items.map(() => false);
  const seen = items.map(() => false);
  let i = 0;
  const endAt = Date.now() + minutes * 60_000;
  let done = false;

  root.innerHTML = `
    <section class="gs-exam">
      <header class="gs-examtop">
        <b>${esc(s.title)} mock</b>
        <span class="gs-timer" id="gs-timer" role="timer"></span>
        <button class="w-btn w-btn-quiet" id="gs-submit">Submit</button>
      </header>
      <div class="gs-exambody">
        <div class="gs-examq" id="gs-examq"></div>
        <aside class="gs-palette">
          <div id="gs-pal" class="gs-pal"></div>
          <ul class="gs-legend">
            <li><i class="p-ans"></i>Answered</li><li><i class="p-mark"></i>Marked for review</li>
            <li><i class="p-seen"></i>Seen, not answered</li><li><i></i>Not seen</li>
          </ul>
        </aside>
      </div>
      <div class="gs-confirm" id="gs-confirm" hidden></div>
    </section>`;

  const timerEl = document.getElementById("gs-timer")!;
  const qEl = document.getElementById("gs-examq")!;
  const palEl = document.getElementById("gs-pal")!;

  const palette = () => {
    palEl.innerHTML = items
      .map((_, k) => {
        const cls = [marked[k] ? "p-mark" : ans[k] !== null ? "p-ans" : seen[k] ? "p-seen" : "", k === i ? "p-now" : ""].join(" ");
        return `<button class="${cls}" data-go="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`;
      })
      .join("");
  };
  const show = () => {
    seen[i] = true;
    const { q } = items[i];
    qEl.innerHTML = `
      <p class="gs-qhead"><span>Question ${i + 1} of ${items.length}</span></p>
      <h3 class="gs-q">${md(q.q)}</h3>
      <div class="gs-opts" role="radiogroup">${q.options
        .map((o, k) => `<button role="radio" aria-checked="${ans[i] === k}" class="gs-opt${ans[i] === k ? " is-picked" : ""}" data-k="${k}"><b>${LETTERS[k]}</b><span>${md(o)}</span></button>`)
        .join("")}</div>
      <div class="gs-actions">
        <button class="w-btn w-btn-quiet" id="gs-back" ${i === 0 ? "disabled" : ""}>Previous</button>
        <button class="w-btn w-btn-quiet" id="gs-clear" ${ans[i] === null ? "disabled" : ""}>Clear answer</button>
        <button class="w-btn w-btn-quiet" id="gs-mark">${marked[i] ? "Unmark review" : "Mark for review"}</button>
        <button class="w-btn w-btn-main" id="gs-fwd">${i === items.length - 1 ? "Finish" : "Save and next"}</button>
      </div>`;
    palette();
  };
  const go = (k: number) => {
    i = Math.max(0, Math.min(items.length - 1, k));
    show();
  };

  qEl.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const opt = t.closest<HTMLElement>(".gs-opt");
    if (opt) {
      ans[i] = Number(opt.dataset.k);
      show();
      return;
    }
    if (t.id === "gs-back") go(i - 1);
    if (t.id === "gs-clear") {
      ans[i] = null;
      show();
    }
    if (t.id === "gs-mark") {
      marked[i] = !marked[i];
      show();
    }
    if (t.id === "gs-fwd") (i === items.length - 1 ? confirmSubmit() : go(i + 1));
  });
  palEl.addEventListener("click", (e) => {
    const k = (e.target as HTMLElement).dataset.go;
    if (k !== undefined) go(Number(k));
  });

  const confirmBox = document.getElementById("gs-confirm")!;
  const confirmSubmit = () => {
    const left = ans.filter((a) => a === null).length;
    const rev = marked.filter(Boolean).length;
    confirmBox.hidden = false;
    confirmBox.innerHTML = `<div class="gs-confirmcard" role="dialog" aria-modal="true" aria-label="Submit the exam">
      <h3>Submit the exam?</h3>
      <p>${items.length - left} answered, ${left} not answered, ${rev} marked for review.</p>
      ${left ? "<p>There is no negative marking, so it is better to answer every question.</p>" : ""}
      <div class="gs-actions"><button class="w-btn w-btn-quiet" id="gs-stay">Go back</button><button class="w-btn w-btn-main" id="gs-really">Submit</button></div>
    </div>`;
    document.getElementById("gs-stay")!.onclick = () => (confirmBox.hidden = true);
    document.getElementById("gs-really")!.onclick = finish;
  };
  document.getElementById("gs-submit")!.onclick = confirmSubmit;

  const tick = () => {
    const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    timerEl.textContent = `${mmss(left)} left`;
    timerEl.classList.toggle("is-low", left <= 300);
    if (left === 0) finish();
  };
  const timer = window.setInterval(tick, 1000);
  // Leaving the page by accident would lose the test, so ask first.
  const warn = (e: BeforeUnloadEvent) => {
    if (!done) e.preventDefault();
  };
  window.addEventListener("beforeunload", warn);
  onLeave(() => {
    window.clearInterval(timer);
    window.removeEventListener("beforeunload", warn);
  });

  function finish() {
    if (done) return;
    done = true;
    window.clearInterval(timer);
    window.removeEventListener("beforeunload", warn);
    const score = items.filter((it, k) => ans[k] === it.q.answer).length;
    const pct = Math.round((score / items.length) * 100);
    recordMock({ subject: s.id, at: Date.now(), score, total: items.length });
    const byMod = new Map<Module, { right: number; all: number }>();
    items.forEach((it, k) => {
      const r = byMod.get(it.mod) ?? { right: 0, all: 0 };
      r.all++;
      if (ans[k] === it.q.answer) r.right++;
      byMod.set(it.mod, r);
    });
    const passed = pct >= MOCK.passPercent;
    root.innerHTML = `
      <nav class="gs-crumbs"><a href="#/">Ground School</a> <i>/</i> <a href="#/${s.id}">${esc(s.title)}</a> <i>/</i> <span>Mock result</span></nav>
      <div class="gs-result ${passed ? "ok" : "no"}">
        <p class="gs-big">${score} / ${items.length} · ${pct}%</p>
        <p>${passed ? "Pass. Keep this up across a few more mocks before the real exam." : `Below the ${MOCK.passPercent}% pass mark. Look at the weakest module below and revise it first.`}</p>
      </div>
      <h3>Score by module</h3>
      <div class="gs-tablewrap"><table><thead><tr><th>Module</th><th>Right</th><th>Score</th></tr></thead><tbody>${[...byMod.entries()]
        .sort((a, b) => a[0].n - b[0].n)
        .map(([m, r]) => `<tr><td><a href="#/${s.id}/${m.n}">${m.n}. ${esc(m.title)}</a></td><td>${r.right} / ${r.all}</td><td>${Math.round((r.right / r.all) * 100)}%</td></tr>`)
        .join("")}</tbody></table></div>
      <h3>Every question with the answer</h3>
      <ol class="gs-review">${items
        .map((it, k) => {
          const a = ans[k];
          const ok = a === it.q.answer;
          return `<li class="${ok ? "ok" : "no"}"><p>${md(it.q.q)}</p>
            <p class="gs-ans">${a === null ? "Not answered." : `You chose ${LETTERS[a]}${ok ? ", correct." : "."}`} ${ok ? "" : `Answer: ${LETTERS[it.q.answer]}. ${md(it.q.options[it.q.answer])}`}</p>
            <p class="gs-small">${md(it.q.why)}</p>${it.q.flag ? `<p class="gs-small gs-flagline"><b>Old exam answer:</b> ${md(it.q.flag)}</p>` : ""}</li>`;
        })
        .join("")}</ol>
      <div class="gs-actions"><a class="w-btn w-btn-main" href="#/${s.id}">Back to ${esc(s.title)}</a></div>`;
    window.scrollTo(0, 0);
  }

  tick();
  show();
}
