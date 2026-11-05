// Quiz shown after a lesson: one question at a time, the answer and why after each pick,
// then the score. 4 out of 5 passes.
import { PASS_MARK, type Question } from "../lessons/quizzes";

export class QuizDialog {
  private el: HTMLElement;
  private box: HTMLElement;
  private questions: { q: Question; order: number[] }[] = [];
  private index = 0;
  private score = 0;
  private title = "";
  private onDone: (score: number) => void = () => {};
  private onNextLesson: () => void = () => {};

  constructor() {
    this.el = document.createElement("div");
    this.el.id = "quiz";
    this.el.className = "hidden";
    this.box = document.createElement("div");
    this.box.className = "quiz-box";
    this.el.appendChild(this.box);
    document.body.appendChild(this.el);
  }

  get open() {
    return !this.el.classList.contains("hidden");
  }

  start(title: string, questions: Question[], onDone: (score: number) => void, onNextLesson: () => void) {
    this.title = title;
    this.onDone = onDone;
    this.onNextLesson = onNextLesson;
    this.questions = questions.map((q) => ({ q, order: shuffle([0, 1, 2, 3]) }));
    this.index = 0;
    this.score = 0;
    this.el.classList.remove("hidden");
    this.showQuestion();
  }

  close() {
    this.el.classList.add("hidden");
  }

  private showQuestion() {
    const { q, order } = this.questions[this.index];
    this.box.innerHTML = `
      <div class="quiz-head"><span>Quiz: ${esc(this.title)}</span><span>Question ${this.index + 1} of ${this.questions.length}</span></div>
      <div class="quiz-q">${esc(q.q)}</div>
      <div class="quiz-options">${order
        .map((i, n) => `<button class="quiz-opt" data-i="${i}"><b>${"ABCD"[n]}</b> ${esc(q.options[i])}</button>`)
        .join("")}</div>
      <div class="quiz-why"></div>
      <div class="quiz-actions"><button class="quiz-close">Close</button></div>`;
    this.box.querySelector(".quiz-close")!.addEventListener("click", () => this.close());
    this.box.querySelectorAll<HTMLButtonElement>(".quiz-opt").forEach((b) =>
      b.addEventListener("click", () => this.answer(Number(b.dataset.i))),
    );
  }

  private answer(i: number) {
    const { q } = this.questions[this.index];
    const right = i === 0;
    if (right) this.score++;
    this.box.querySelectorAll<HTMLButtonElement>(".quiz-opt").forEach((b) => {
      b.disabled = true;
      const bi = Number(b.dataset.i);
      if (bi === 0) b.classList.add("right");
      else if (bi === i) b.classList.add("wrong");
    });
    const why = this.box.querySelector(".quiz-why")!;
    why.innerHTML = `<b class="${right ? "ok" : "no"}">${right ? "Right." : "Not quite."}</b> ${esc(q.why)}`;
    const last = this.index === this.questions.length - 1;
    const next = document.createElement("button");
    next.className = "quiz-next";
    next.textContent = last ? "See score" : "Next question";
    next.addEventListener("click", () => {
      if (last) this.showScore();
      else {
        this.index++;
        this.showQuestion();
      }
    });
    this.box.querySelector(".quiz-actions")!.prepend(next);
  }

  private showScore() {
    const total = this.questions.length;
    const pass = this.score >= PASS_MARK;
    this.onDone(this.score);
    this.box.innerHTML = `
      <div class="quiz-head"><span>Quiz: ${esc(this.title)}</span></div>
      <div class="quiz-score ${pass ? "ok" : "no"}">${this.score} / ${total}</div>
      <p class="quiz-msg">${
        pass
          ? "Passed. This lesson now has a green tick on the lesson list."
          : `You need ${PASS_MARK} out of ${total} to pass. Read the lesson steps again, then try the quiz again.`
      }</p>
      <div class="quiz-actions">
        <button class="quiz-retry">Try again</button>
        <button class="quiz-lessons">Choose next lesson</button>
      </div>`;
    this.box.querySelector(".quiz-retry")!.addEventListener("click", () =>
      this.start(this.title, this.questions.map((x) => x.q), this.onDone, this.onNextLesson),
    );
    this.box.querySelector(".quiz-lessons")!.addEventListener("click", () => {
      this.close();
      this.onNextLesson();
    });
  }
}

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
