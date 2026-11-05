// Lesson picker shared by every aircraft page: aircraft tabs, the lessons with progress ticks,
// a Quiz button for finished lessons, and reset. Picking a lesson for another aircraft opens
// that aircraft's page with ?lesson=<id>.
import { AIRCRAFT, type AircraftId } from "../lessons/catalog";
import { loadProgress, passed, resetProgress } from "../lessons/progress";

export interface PickerOptions {
  current: AircraftId;
  startHere: (lessonId: string) => void;
  startQuiz: (lessonId: string) => void;
  /** True when a lesson is running, so the picker may be closed by clicking outside it. */
  canClose: () => boolean;
}

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class LessonPicker {
  private opts: PickerOptions;
  private shown: AircraftId;

  constructor(opts: PickerOptions) {
    this.opts = opts;
    this.shown = opts.current;
    $("picker").addEventListener("click", (e) => {
      if (e.target === $("picker") && opts.canClose()) this.close();
    });
    $("reset-progress").addEventListener("click", () => {
      if (window.confirm("Clear your lesson ticks and quiz scores in this browser?")) {
        resetProgress();
        this.render();
      }
    });
  }

  open() {
    this.shown = this.opts.current;
    this.render();
    $("picker").classList.remove("hidden");
  }

  close() {
    $("picker").classList.add("hidden");
  }

  private render() {
    const progress = loadProgress();
    $("picker-tabs").innerHTML = AIRCRAFT.map(
      (a) => `<button class="picker-tab${a.id === this.shown ? " on" : ""}" data-aircraft="${a.id}">${a.name}</button>`,
    ).join("");
    $("picker-tabs")
      .querySelectorAll<HTMLElement>(".picker-tab")
      .forEach((b) =>
        b.addEventListener("click", () => {
          this.shown = b.dataset.aircraft as AircraftId;
          this.render();
        }),
      );
    const aircraft = AIRCRAFT.find((a) => a.id === this.shown)!;
    const total = 5;
    $("picker-list").innerHTML =
      `<p class="picker-blurb">${esc(aircraft.blurb)}</p>` +
      aircraft.lessons
        .map((l, i) => {
          const p = progress[l.id];
          const status = passed(p)
            ? `<span class="picker-status ok" title="Lesson finished and quiz passed">✓ Done · quiz ${p!.bestScore}/${total}</span>`
            : p?.finished
              ? `<span class="picker-status half" title="Lesson finished, quiz not passed yet">◐ Finished · ${
                  p.bestScore ? `quiz ${p.bestScore}/${total}` : "take the quiz"
                }</span>`
              : "";
          const quizBtn =
            p?.finished && aircraft.id === this.opts.current
              ? `<button class="picker-quiz" data-quiz="${l.id}">Quiz</button>`
              : "";
          return `<div class="picker-row">
          <button class="picker-item" data-lesson="${l.id}">
            <span class="picker-num">${i + 1}</span>
            <span><b>${esc(l.title)}</b><br><span class="picker-sum">${esc(l.summary)}</span>${status ? "<br>" + status : ""}</span>
            <span class="picker-min">about ${l.minutes} min</span>
          </button>${quizBtn}</div>`;
        })
        .join("");
    $("picker-list")
      .querySelectorAll<HTMLElement>(".picker-item")
      .forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.dataset.lesson!;
          if (aircraft.id === this.opts.current) {
            this.close();
            this.opts.startHere(id);
          } else {
            window.location.href = `${aircraft.page}?lesson=${encodeURIComponent(id)}`;
          }
        }),
      );
    $("picker-list")
      .querySelectorAll<HTMLElement>(".picker-quiz")
      .forEach((b) =>
        b.addEventListener("click", () => {
          this.close();
          this.opts.startQuiz(b.dataset.quiz!);
        }),
      );
  }
}

/** The lesson id asked for in the page address (?lesson=...), if any. */
export function lessonFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("lesson");
}
