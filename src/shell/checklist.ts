// Checklist panel shared by every aircraft: a CHECKLIST button in the top bar opens a list of normal
// checklists. Each line is a challenge and a response. Lines the trainer can check turn green when
// the aircraft is really set that way and amber when not. Lines it cannot check (a briefing, the
// cabin) are ticked by hand.
// D is whatever the aircraft's checks read: its state, controls and FMC.

export interface CheckItem<D> {
  /** What is checked, for example "PARKING BRAKE". */
  c: string;
  /** The answer, for example "SET". */
  r: string;
  /** True when the aircraft matches. No function means the line is ticked by hand. */
  ok?: (d: D) => boolean;
}

export interface Checklist<D> {
  id: string;
  title: string;
  items: CheckItem<D>[];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class ChecklistPanel<D> {
  readonly el: HTMLElement;
  private lists: Checklist<D>[];
  private current = 0;
  /** Lines ticked by hand, per checklist. */
  private ticks = new Map<string, Set<number>>();
  private isOpen = false;
  private btn: HTMLButtonElement;
  private body: HTMLElement;
  private foot: HTMLElement;
  private last = "";

  constructor(lists: Checklist<D>[], aircraft: string) {
    this.lists = lists;
    this.btn = document.createElement("button");
    this.btn.id = "checklist-btn";
    this.btn.dataset.ctl = "checklist";
    this.btn.title = "Normal checklists (C)";
    this.btn.textContent = "CHECKLIST";
    const anchor = document.getElementById("time-btn") ?? document.getElementById("sound-ctl");
    anchor?.parentElement?.insertBefore(this.btn, anchor);
    this.btn.addEventListener("click", () => {
      this.toggle();
      this.btn.blur();
    });

    this.el = document.createElement("div");
    this.el.id = "checklist";
    this.el.className = "hidden";
    this.el.innerHTML = `
      <div class="cl-head">
        <b>${esc(aircraft)} CHECKLISTS</b>
        <button class="cl-close" title="Close (C)">✕</button>
      </div>
      <div class="cl-tabs">${lists.map((l, i) => `<button data-cl="${i}" data-ctl="cl-${l.id}">${esc(l.title)}</button>`).join("")}</div>
      <ol class="cl-items"></ol>
      <div class="cl-foot"></div>
      <div class="cl-note">Simplified training checklists in our own words. Not the manufacturer's or an airline's checklist. Green: set. Amber: not set yet. Box: tick it yourself.</div>`;
    document.body.appendChild(this.el);
    this.body = this.el.querySelector(".cl-items")!;
    this.foot = this.el.querySelector(".cl-foot")!;
    this.el.querySelector(".cl-close")!.addEventListener("click", () => this.close());
    this.el.querySelectorAll<HTMLElement>("[data-cl]").forEach((b) =>
      b.addEventListener("click", () => {
        this.current = Number(b.dataset.cl);
        this.last = "";
        b.blur();
      }),
    );
    // Clicking a hand-ticked line ticks or unticks it.
    this.body.addEventListener("click", (e) => {
      const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-manual]");
      if (!li) return;
      const set = this.tickSet();
      const i = Number(li.dataset.i);
      if (set.has(i)) set.delete(i);
      else set.add(i);
      this.last = "";
    });
    this.foot.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).dataset.reset !== undefined) {
        this.tickSet().clear();
        this.last = "";
      }
    });
    window.addEventListener("keydown", (e) => {
      const t = e.target as HTMLElement;
      if (e.repeat || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.closest?.("#mcdu, #cdu")))) return;
      if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) this.toggle();
    });
  }

  get open() {
    return this.isOpen;
  }

  private tickSet() {
    const id = this.lists[this.current].id;
    if (!this.ticks.has(id)) this.ticks.set(id, new Set());
    return this.ticks.get(id)!;
  }

  toggle() {
    if (this.isOpen) this.close();
    else {
      this.isOpen = true;
      this.el.classList.remove("hidden");
      this.btn.classList.add("on");
      this.last = "";
    }
  }

  close() {
    this.isOpen = false;
    this.el.classList.add("hidden");
    this.btn.classList.remove("on");
  }

  /** Clears the hand ticks, for example when a new lesson starts. */
  resetTicks() {
    this.ticks.clear();
    this.last = "";
  }

  /** Checks every line against the aircraft. Call every frame; it only redraws when something changed. */
  update(d: D | null) {
    if (!this.isOpen) return;
    const list = this.lists[this.current];
    const ticks = this.tickSet();
    const states = list.items.map((it, i) => (it.ok ? (d ? (safe(it.ok, d) ? "ok" : "no") : "no") : ticks.has(i) ? "ticked" : "box"));
    const key = `${this.current}|${states.join(",")}`;
    if (key === this.last) return;
    this.last = key;
    this.el.querySelectorAll<HTMLElement>("[data-cl]").forEach((b) => b.classList.toggle("on", Number(b.dataset.cl) === this.current));
    this.body.innerHTML = list.items
      .map((it, i) => {
        const st = states[i];
        const mark = st === "ok" || st === "ticked" ? "✓" : st === "no" ? "•" : "";
        return `<li class="cl-${st}" data-i="${i}"${it.ok ? "" : " data-manual"} data-ctl="cl-item-${i}"><i>${mark}</i><span class="cl-c">${esc(it.c)}</span><span class="cl-dots"></span><span class="cl-r">${esc(it.r)}</span></li>`;
      })
      .join("");
    const done = states.filter((s) => s === "ok" || s === "ticked").length;
    const all = done === states.length;
    this.foot.innerHTML = `<span class="${all ? "cl-complete" : ""}">${all ? `${esc(list.title).toUpperCase()} CHECKLIST COMPLETE` : `${done} of ${states.length} done`}</span><button data-reset>Reset ticks</button>`;
  }

  /** For tests: the states of the shown checklist's lines. */
  debug(d: D) {
    const list = this.lists[this.current];
    return { id: list.id, lines: list.items.map((it, i) => ({ c: it.c, ok: it.ok ? safe(it.ok, d) : this.tickSet().has(i) })) };
  }

  select(id: string) {
    const i = this.lists.findIndex((l) => l.id === id);
    if (i >= 0) this.current = i;
    this.last = "";
  }
}

function safe<D>(f: (d: D) => boolean, d: D) {
  try {
    return !!f(d);
  } catch {
    return false;
  }
}
