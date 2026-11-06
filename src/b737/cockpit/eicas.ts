// 737-type engine display: N1 and EGT dials for both engines, N2, fuel flow, oil pressure,
// START VALVE OPEN, fuel in each tank, and flaps and gear. Our own drawing in the general style
// of the type, not a copy of the real display.
import type { State737 } from "../sim/types";

const W = 500;
const H = 500;
const WHITE = "#f2f2f2";
const GREEN = "#3ef03e";
const AMBER = "#ffb000";
const RED = "#ff3b3b";
const CYAN = "#4fd8ff";
const FONT = "ui-monospace, Menlo, monospace";

export class Eicas737 {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = W;
    canvas.height = H;
    this.g = canvas.getContext("2d")!;
  }

  private text(t: string, x: number, y: number, colour = WHITE, size = 14, align: CanvasTextAlign = "center") {
    const g = this.g;
    g.font = `${size}px ${FONT}`;
    g.fillStyle = colour;
    g.textAlign = align;
    g.textBaseline = "middle";
    g.fillText(t, x, y);
  }

  /** A round gauge from 0 to max over 210 degrees, with a red line and a digital readout. */
  private dial(x: number, y: number, r: number, v: number, max: number, red: number, digits: string, label: string) {
    const g = this.g;
    const a0 = Math.PI * 0.75;
    const span = Math.PI * 1.17;
    const ang = (val: number) => a0 + (Math.max(0, Math.min(max, val)) / max) * span;
    g.lineWidth = 3;
    g.strokeStyle = WHITE;
    g.beginPath();
    g.arc(x, y, r, a0, ang(red));
    g.stroke();
    g.strokeStyle = RED;
    g.beginPath();
    g.arc(x, y, r, ang(red), ang(max));
    g.stroke();
    // Filled sector up to the value.
    if (v > 0.5) {
      g.fillStyle = "rgba(200,200,200,0.25)";
      g.beginPath();
      g.moveTo(x, y);
      g.arc(x, y, r - 2, a0, ang(v));
      g.closePath();
      g.fill();
    }
    g.strokeStyle = WHITE;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang(v)) * (r - 4), y + Math.sin(ang(v)) * (r - 4));
    g.stroke();
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.lineWidth = 1.5;
    g.fillRect(x + 4, y - r * 0.55 - 12, r * 0.95, 24);
    g.strokeRect(x + 4, y - r * 0.55 - 12, r * 0.95, 24);
    this.text(digits, x + 4 + r * 0.9, y - r * 0.55, WHITE, 17, "right");
    this.text(label, x, y + r * 0.55, CYAN, 12);
  }

  draw(s: State737) {
    const g = this.g;
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
    const e = s.sys.engines;
    this.text(`TAT +${Math.round(25 - s.altFt / 500)}c`, 10, 14, WHITE, 12, "left");
    for (let i = 0; i < 2; i++) {
      const x = i ? 330 : 120;
      this.dial(x, 95, 62, e[i].n1, 110, 104, e[i].n1.toFixed(1), "N1");
      this.dial(x, 230, 52, e[i].egtC, 1100, 950, String(Math.round(e[i].egtC)), "EGT");
      if (e[i].startValve) this.text("START VALVE", x, 168, AMBER, 12);
      if (e[i].startValve) this.text("OPEN", x, 182, AMBER, 12);
    }
    // Secondary engine values.
    const rows: [string, (i: number) => string, (i: number) => string][] = [
      ["N2", (i) => e[i].n2.toFixed(1), () => WHITE],
      ["FF KG/H", (i) => String(Math.round(e[i].fuelFlowKgH / 10) * 10), () => WHITE],
      ["OIL PRESS", (i) => String(Math.round(e[i].oilPsi)), (i) => (e[i].phase === "RUN" && e[i].oilPsi < 13 ? RED : WHITE)],
    ];
    rows.forEach(([label, val, col], r) => {
      const y = 310 + r * 28;
      this.text(label, 225, y, CYAN, 12);
      this.text(val(0), 150, y, col(0), 16, "right");
      this.text(val(1), 360, y, col(1), 16, "right");
    });
    // Fuel.
    const t = s.sys.tanksKg;
    g.strokeStyle = "#666";
    g.strokeRect(20, 400, 300, 86);
    this.text("FUEL KG", 30, 414, CYAN, 12, "left");
    const tank = (label: string, kg: number, x: number) => {
      this.text(String(Math.round(kg / 10) * 10), x, 446, WHITE, 16);
      this.text(label, x, 468, CYAN, 11);
    };
    tank("1", t[0], 70);
    tank("CTR", t[1], 170);
    tank("2", t[2], 270);
    this.text(`TOTAL ${Math.round(t[0] + t[1] + t[2])}`, 300, 414, WHITE, 12, "right");
    // Flaps and gear.
    this.text("FLAPS", 400, 410, CYAN, 12);
    this.text(String(Math.round(s.flapDeg)), 400, 432, s.flapDeg > 0.5 ? GREEN : WHITE, 18);
    this.text("GEAR", 460, 410, CYAN, 12);
    this.text(s.gearPos > 0.99 ? "DOWN" : s.gearPos < 0.01 ? "UP" : "TRAN", 460, 432, s.gearPos > 0.99 ? GREEN : s.gearPos < 0.01 ? WHITE : AMBER, 14);
    if (!s.sys.acPower && s.sys.dcPower) this.text("ON BATTERY", 250, 486, AMBER, 13);
  }
}
