// Lesson sidebar: shows the steps of the current lesson, explains the current one, highlights the
// control to use, switches to the right panel, and ticks steps off in order.
// It works for any aircraft: S is the simulation state, C the controls (with a switches object),
// X any extra data the lessons check (the A320 MCDU), P the panel names.
import type { LessonBase } from "../lessons/types";

export class LessonPanel<S, C extends { switches: object }, X, P extends string> {
  readonly el: HTMLElement;
  private header: HTMLElement;
  private list: HTMLElement;
  private footer: HTMLElement;
  private lesson: LessonBase<S, C, X, P> | null = null;
  private latched: boolean[] = [];
  private lastCurrent = -1;
  private nextPressed = false;
  /** Called when a step ticks off. complete is true when it was the last step. */
  onTick?: (complete: boolean) => void;
  /** Called when the learner presses "Take the quiz" at the end of the lesson. */
  onQuiz?: () => void;
  private footerHtml = "";
  private showPanel: (p: P) => void;
  private getPanel: () => P;

  constructor(parent: HTMLElement, showPanel: (p: P) => void, getPanel: () => P) {
    this.showPanel = showPanel;
    this.getPanel = getPanel;
    this.el = document.createElement("aside");
    this.el.id = "lesson";
    this.header = document.createElement("div");
    this.header.className = "ls-header";
    this.list = document.createElement("ol");
    this.footer = document.createElement("div");
    this.footer.className = "ls-footer";
    this.el.append(this.header, this.list, this.footer);
    parent.appendChild(this.el);
  }

  start(lesson: LessonBase<S, C, X, P>) {
    this.lesson = lesson;
    this.latched = lesson.steps.map(() => false);
    this.lastCurrent = -1;
    this.nextPressed = false;
    this.footerHtml = "";
    this.footer.innerHTML = "";
    this.list.innerHTML = lesson.steps
      .map(
        (st) =>
          `<li><div class="ls-title">${esc(st.title)}</div><div class="ls-why">${esc(st.why)}</div>` +
          `${st.done ? "" : '<button class="ls-next">Next</button>'}</li>`,
      )
      .join("");
    this.list.querySelectorAll(".ls-next").forEach((b) =>
      b.addEventListener("click", () => {
        this.nextPressed = true;
        (b as HTMLElement).blur();
      }),
    );
  }

  update(s: S, c: C, f: X) {
    const lesson = this.lesson;
    if (!lesson) return;
    // Steps count in order: a step only ticks once all steps before it are done. Once ticked it
    // stays ticked, even if a later step undoes it (APU MASTER goes ON, then OFF).
    let current = -1;
    for (let i = 0; i < lesson.steps.length; i++) {
      const st = lesson.steps[i];
      if (!this.latched[i] && (i === 0 || this.latched[i - 1])) {
        const ok = st.done ? st.done(s, c, f) : this.nextPressed && i === this.lastCurrent;
        if (ok) {
          this.latched[i] = true;
          this.nextPressed = false;
          this.onTick?.(i === lesson.steps.length - 1);
        }
      }
      if (!this.latched[i]) {
        current = i;
        break;
      }
    }

    const items = this.list.children;
    for (let i = 0; i < items.length; i++) {
      items[i].className = this.latched[i] ? "done" : i === current ? "current" : "";
    }
    const total = lesson.steps.length;
    this.header.innerHTML = `<div class="ls-name">${esc(lesson.title)}</div><div class="ls-progress">${
      current < 0 ? `All ${total} steps done` : `Step ${current + 1} of ${total}`
    }</div><div class="ls-bar"><i style="width:${(100 * (current < 0 ? total : current)) / total}%"></i></div>`;
    const footer =
      current < 0
        ? `<b>Lesson complete.</b> ${esc(lesson.finished)}<br><button class="ls-quiz">Take the quiz (5 questions)</button>`
        : "";
    // Only rebuild the footer when it changes, so its button can be clicked.
    if (footer !== this.footerHtml) {
      this.footerHtml = footer;
      this.footer.innerHTML = footer;
      this.footer.querySelector(".ls-quiz")?.addEventListener("click", () => this.onQuiz?.());
    }

    clearHighlights();
    if (current < 0) return;
    const step = lesson.steps[current];
    if (current !== this.lastCurrent) {
      this.lastCurrent = current;
      this.nextPressed = false;
      if (this.getPanel() !== step.panel) this.showPanel(step.panel);
      (items[current] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
    for (const t of step.targets) {
      // A switch that is already where the step wants it does not need pressing again.
      const pos = (c.switches as unknown as Record<string, unknown>)[t];
      if (step.want !== undefined && pos === step.want) continue;
      document.querySelectorAll(`[data-ctl="${t}"]`).forEach((el) => el.classList.add("next"));
    }
    if (this.getPanel() !== step.panel) {
      document.querySelectorAll(`[data-ctl="tab-${step.panel}"]`).forEach((el) => el.classList.add("next"));
    }
  }
}

function clearHighlights() {
  document.querySelectorAll(".next").forEach((el) => el.classList.remove("next"));
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
