// Flight control unit panel, on the glareshield strip of the 2D panel.
//
// R1 keeps it simple: every value is "selected" (no managed modes yet).
// Turn a value with the mouse wheel or the - / + buttons (hold Shift for big steps).
import type { FcuAction, FcuValues, FccStatus } from "../sim/fcc";

type Field = keyof FcuValues;
const STEP: Record<Field, [number, number]> = {
  spd: [1, 10],
  hdg: [1, 10],
  alt: [100, 1000],
  vs: [100, 500],
};
const LABEL: Record<Field, string> = { spd: "SPD", hdg: "HDG", alt: "ALT", vs: "V/S" };

export class FcuPanel {
  readonly el: HTMLElement;
  private values: Record<Field, HTMLElement> = {} as Record<Field, HTMLElement>;
  private lights: Record<string, HTMLElement> = {};
  private send: (a: FcuAction) => void;
  private last: FcuValues = { spd: 0, hdg: 0, alt: 0, vs: 0 };

  constructor(parent: HTMLElement, send: (a: FcuAction) => void, onRange: (step: number) => void) {
    this.send = send;
    this.el = document.createElement("div");
    this.el.id = "fcu";
    parent.appendChild(this.el);

    for (const f of ["spd", "hdg", "alt", "vs"] as Field[]) {
      const box = document.createElement("div");
      box.className = "fcu-field";
      box.innerHTML = `<span class="fcu-label">${LABEL[f]}</span>`;
      const minus = button("−", () => this.nudge(f, -1, false));
      const value = document.createElement("span");
      value.className = "fcu-value";
      value.title = "Scroll to change, Shift for big steps";
      value.addEventListener("wheel", (e) => {
        e.preventDefault();
        this.nudge(f, e.deltaY < 0 ? 1 : -1, e.shiftKey);
      });
      const plus = button("+", () => this.nudge(f, 1, false));
      minus.addEventListener("click", (e) => e.shiftKey && this.nudge(f, -1, true));
      plus.addEventListener("click", (e) => e.shiftKey && this.nudge(f, 1, true));
      box.append(minus, value, plus);
      if (f === "hdg") box.append(button("PULL", () => send({ kind: "hdg" }), "Fly the selected heading"));
      if (f === "alt") box.append(button("PUSH", () => send({ kind: "alt" }), "Level off here"));
      if (f === "vs") box.append(button("PULL", () => send({ kind: "vs" }), "Fly the selected V/S"));
      this.values[f] = value;
      this.el.appendChild(box);
    }
    const btns = document.createElement("div");
    btns.className = "fcu-buttons";
    for (const [id, label, action, tip] of [
      ["ap", "AP1", { kind: "ap" }, "Autopilot (A)"],
      ["athr", "A/THR", { kind: "athr" }, "Autothrust (T)"],
      ["loc", "LOC", { kind: "loc" }, "Arm localizer"],
      ["appr", "APPR", { kind: "appr" }, "Arm localizer and glide slope"],
    ] as [string, string, FcuAction, string][]) {
      const b = button(label, () => send(action), tip);
      b.classList.add("fcu-push");
      const light = document.createElement("i");
      b.prepend(light);
      this.lights[id] = light;
      btns.appendChild(b);
    }
    btns.append(button("ND −", () => onRange(-1), "ND range down"), button("ND +", () => onRange(1), "ND range up"));
    this.el.appendChild(btns);
  }

  private nudge(f: Field, dir: number, big: boolean) {
    const v = this.last[f] + dir * STEP[f][big ? 1 : 0];
    this.send({ kind: "set", field: f, value: v });
  }

  /** Updates the values and the button lights. */
  update(st: FccStatus) {
    const v = st.fcu;
    this.last = { ...v };
    this.values.spd.textContent = String(Math.round(v.spd));
    this.values.hdg.textContent = String(Math.round(v.hdg)).padStart(3, "0");
    this.values.alt.textContent = String(Math.round(v.alt)).padStart(5, "0");
    this.values.vs.textContent = (v.vs >= 0 ? "+" : "−") + String(Math.abs(v.vs)).padStart(4, "0");
    this.values.vs.classList.toggle("dim", st.vert !== "V/S");
    this.lights.ap.classList.toggle("on", st.ap);
    this.lights.athr.classList.toggle("on", st.athr);
    this.lights.loc.classList.toggle("on", st.latArmed === "LOC" || st.lat.startsWith("LOC"));
    this.lights.appr.classList.toggle("on", st.vertArmed === "G/S" || st.vert.startsWith("G/S"));
  }
}

function button(label: string, onClick: () => void, title = "") {
  const b = document.createElement("button");
  b.textContent = label;
  b.title = title;
  b.addEventListener("click", (e) => {
    if (!e.shiftKey) onClick();
    (e.currentTarget as HTMLElement).blur();
  });
  return b;
}
