// Explore mode, shared by every aircraft: an EXPLORE button in the top bar. While it is on, hovering
// any switch, button or screen shows a card with what it is, what it does and when it is used.
// Clicks show the card instead of moving anything, so nothing can be changed by accident.

export interface ExploreCard {
  /** The control's name, for example "APU MASTER SW". */
  name: string;
  /** What it does, in plain words. */
  what: string;
  /** When pilots use it (optional). */
  when?: string;
}

export interface ExploreTable {
  /** Cards by data-ctl name, or by "#id" for screens. */
  exact: Record<string, ExploreCard>;
  /** Cards for groups of names, for example every line select key. */
  patterns?: [RegExp, ExploreCard][];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class ExploreMode {
  private on = false;
  private btn: HTMLButtonElement;
  private card: HTMLElement;
  private table: ExploreTable;
  private pinned: HTMLElement | null = null;
  /** Turns plain text into HTML with glossary terms marked (set by the page if it has a glossary). */
  decorate: (text: string) => string = esc;

  constructor(table: ExploreTable) {
    this.table = table;
    this.btn = document.createElement("button");
    this.btn.id = "explore-btn";
    this.btn.dataset.ctl = "explore";
    this.btn.title = "Explore the cockpit: hover or click anything to learn what it does";
    this.btn.textContent = "EXPLORE";
    const anchor = document.getElementById("checklist-btn") ?? document.getElementById("time-btn") ?? document.getElementById("sound-ctl");
    anchor?.parentElement?.insertBefore(this.btn, anchor);
    this.btn.addEventListener("click", () => {
      this.toggle();
      this.btn.blur();
    });

    this.card = document.createElement("div");
    this.card.id = "explore-card";
    this.card.className = "hidden";
    this.card.setAttribute("role", "tooltip");
    document.body.appendChild(this.card);


    // Hover shows a card. Capture so it works over every control.
    document.addEventListener("pointerover", (e) => {
      if (!this.on || this.pinned) return;
      const el = this.target(e.target);
      if (el) this.show(el);
      else this.hide();
    });
    // While exploring, presses on the cockpit show the card and go no further.
    for (const type of ["pointerdown", "mousedown", "click", "dblclick"] as const) {
      document.addEventListener(
        type,
        (e) => {
          if (!this.on) return;
          const t = e.target as HTMLElement;
          if (!t.closest?.("#cockpit")) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          if (type === "click") {
            const el = this.target(t);
            if (el && el === this.pinned) this.unpin();
            else if (el) {
              this.pinned = null;
              this.show(el);
              this.pinned = el;
              el.classList.add("explore-pinned");
            } else this.unpin();
          }
        },
        true,
      );
    }
    window.addEventListener("keydown", (e) => {
      if (this.on && e.key === "Escape") this.toggle(false);
    });
    window.addEventListener("resize", () => this.hide());
  }

  get active() {
    return this.on;
  }

  toggle(force?: boolean) {
    this.on = force ?? !this.on;
    document.body.classList.toggle("exploring", this.on);
    this.btn.classList.toggle("on", this.on);
    this.btn.textContent = this.on ? "STOP EXPLORING (Esc)" : "EXPLORE";
    if (!this.on) {
      this.unpin();
      this.hide();
    }
  }

  private unpin() {
    this.pinned?.classList.remove("explore-pinned");
    this.pinned = null;
    this.hide();
  }

  /** The element the pointer is on that has a card, if any. */
  private target(node: EventTarget | null): HTMLElement | null {
    let el = node instanceof HTMLElement || node instanceof SVGElement ? (node as HTMLElement) : null;
    while (el && el !== document.body) {
      if (el.closest?.("#explore-card")) return null;
      const key = el.dataset?.ctl ?? (el.tagName === "CANVAS" && el.id ? `#${el.id}` : undefined);
      if (key && this.lookup(key)) return el;
      el = el.parentElement;
    }
    return null;
  }

  private lookup(key: string): ExploreCard | undefined {
    return this.table.exact[key] ?? this.table.patterns?.find(([re]) => re.test(key))?.[1];
  }

  private show(el: HTMLElement) {
    const key = el.dataset.ctl ?? `#${el.id}`;
    const c = this.lookup(key);
    if (!c) return this.hide();
    this.card.innerHTML = `<b>${esc(c.name)}</b><p>${this.decorate(c.what)}</p>${c.when ? `<p class="ex-when"><i>When:</i> ${this.decorate(c.when)}</p>` : ""}`;
    this.card.classList.remove("hidden");
    // Place it beside the control, inside the window.
    const r = el.getBoundingClientRect();
    const cw = this.card.offsetWidth;
    const ch = this.card.offsetHeight;
    let x = r.right + 10;
    if (x + cw > innerWidth - 8) x = r.left - cw - 10;
    if (x < 8) x = Math.min(innerWidth - cw - 8, Math.max(8, r.left));
    let y = r.top;
    if (x === Math.min(innerWidth - cw - 8, Math.max(8, r.left))) y = r.bottom + 8;
    if (y + ch > innerHeight - 8) y = Math.max(8, r.top - ch - 8);
    this.card.style.left = `${x}px`;
    this.card.style.top = `${y}px`;
  }

  private hide() {
    if (this.pinned) return;
    this.card.classList.add("hidden");
  }

  /** For tests: the card for a control name. */
  cardFor(key: string) {
    return this.lookup(key) ?? null;
  }
}
