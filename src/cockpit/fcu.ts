// Flight control unit panel (on screen) plus a canvas copy of its windows for the 3D cockpit.
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
  readonly canvas: HTMLCanvasElement;
  private values: Record<Field, HTMLElement> = {} as Record<Field, HTMLElement>;
  private lights: Record<string, HTMLElement> = {};
  private ctx: CanvasRenderingContext2D;
  private send: (a: FcuAction) => void;
  private last: FcuValues = { spd: 0, hdg: 0, alt: 0, vs: 0 };
  private lastVert = "";

  constructor(parent: HTMLElement, send: (a: FcuAction) => void, onRange: (step: number) => void) {
    this.send = send;
    this.el = document.createElement("div");
    this.el.id = "fcu";
    this.el.className = "panel";
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

    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 64;
    this.ctx = this.canvas.getContext("2d")!;
  }

  private nudge(f: Field, dir: number, big: boolean) {
    const v = this.last[f] + dir * STEP[f][big ? 1 : 0];
    this.send({ kind: "set", field: f, value: v });
  }

  /** Updates the panel and the 3D cockpit's FCU windows. Returns true when the windows changed. */
  update(st: FccStatus): boolean {
    const v = st.fcu;
    const changed =
      v.spd !== this.last.spd || v.hdg !== this.last.hdg || v.alt !== this.last.alt || v.vs !== this.last.vs || st.vert !== this.lastVert;
    this.lastVert = st.vert;
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
    if (changed) this.drawWindows(st);
    return changed;
  }

  private drawWindows(st: FccStatus) {
    const g = this.ctx;
    g.fillStyle = "#11151b";
    g.fillRect(0, 0, 512, 64);
    g.font = "bold 30px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = "#ffb347";
    const v = st.fcu;
    g.fillText(String(Math.round(v.spd)), 64, 34);
    g.fillText(String(Math.round(v.hdg)).padStart(3, "0"), 192, 34);
    g.fillText(String(Math.round(v.alt)).padStart(5, "0"), 320, 34);
    g.fillText(st.vert === "V/S" ? (v.vs >= 0 ? "+" : "-") + String(Math.abs(v.vs) / 100).padStart(2, "0") + "oo" : "-----", 448, 34);
    g.font = "12px ui-monospace, Menlo, monospace";
    g.fillStyle = "#cfd6de";
    g.fillText("SPD", 64, 8);
    g.fillText("HDG", 192, 8);
    g.fillText("ALT", 320, 8);
    g.fillText("V/S", 448, 8);
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
