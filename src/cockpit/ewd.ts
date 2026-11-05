// Engine and warning display (upper ECAM), simplified: N1 dials, N2, fuel flow,
// fuel on board, flap position and a memo line. A training display, not a replica.
import type { SimState } from "../sim/types";

const SIZE = 420;
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const CYAN = "#3fd4ff";
const AMBER = "#ff9f1a";
const RED = "#ff3b3b";
const GREY = "#8a8f98";
const FLAP_LABEL = ["0", "1", "2", "3", "FULL"];

export class Ewd {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.scale(dpr, dpr);
  }

  draw(s: SimState, flapLever: number, throttle: number) {
    const g = this.ctx;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, SIZE);
    g.textBaseline = "middle";
    g.font = "13px ui-monospace, Menlo, monospace";

    this.n1Dial(105, 90, s.n1[0], throttle);
    this.n1Dial(315, 90, s.n1[1], throttle);
    g.fillStyle = GREY;
    g.textAlign = "center";
    g.fillText("N1", 210, 70);
    g.fillText("%", 210, 88);

    // EGT, N2, fuel flow rows.
    const rows: [string, string, [string, string]][] = [
      ["N2", "%", [s.n2[0].toFixed(1), s.n2[1].toFixed(1)]],
      ["FF", "KG/H", [fmt(s.fuelFlowKgH[0], 20), fmt(s.fuelFlowKgH[1], 20)]],
    ];
    rows.forEach(([label, unit, [a, b]], i) => {
      const y = 190 + i * 34;
      g.textAlign = "center";
      g.fillStyle = GREY;
      g.fillText(label, 210, y);
      g.fillStyle = CYAN;
      g.font = "10px ui-monospace, Menlo, monospace";
      g.fillText(unit, 210, y + 11);
      g.font = "bold 16px ui-monospace, Menlo, monospace";
      g.fillStyle = GREEN;
      g.fillText(a, 105, y);
      g.fillText(b, 315, y);
      g.font = "13px ui-monospace, Menlo, monospace";
    });

    // Fuel on board and flaps.
    g.strokeStyle = "#333";
    g.beginPath();
    g.moveTo(10, 268);
    g.lineTo(410, 268);
    g.stroke();
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText("FOB :", 18, 290);
    g.fillStyle = GREEN;
    g.font = "bold 15px ui-monospace, Menlo, monospace";
    g.fillText(`${fmt(s.fuelKg, 10)} KG`, 70, 290);
    g.font = "13px ui-monospace, Menlo, monospace";

    g.textAlign = "center";
    g.fillStyle = WHITE;
    g.fillText("FLAP", 320, 290);
    const moving = Math.abs(s.flapDeg - flapDegFor(flapLever)) > 0.5;
    g.fillStyle = moving ? CYAN : GREEN;
    g.font = "bold 16px ui-monospace, Menlo, monospace";
    g.fillText(FLAP_LABEL[flapLever] ?? "", 320, 312);
    g.font = "13px ui-monospace, Menlo, monospace";
    // A small bar showing actual flap travel, 0 to 40 degrees.
    g.strokeStyle = GREY;
    g.strokeRect(250, 326, 140, 8);
    g.fillStyle = moving ? CYAN : GREEN;
    g.fillRect(250, 326, 140 * Math.min(1, s.flapDeg / 40), 8);

    // Memo line: simple reminders in green, warnings in amber or red.
    g.strokeStyle = "#333";
    g.beginPath();
    g.moveTo(10, 346);
    g.lineTo(410, 346);
    g.stroke();
    g.textAlign = "left";
    const memo = memoLines(s, flapLever);
    memo.forEach(([text, colour], i) => {
      g.fillStyle = colour;
      g.fillText(text, 18, 366 + i * 20);
    });
    g.restore();
  }

  private n1Dial(cx: number, cy: number, n1: number, throttle: number) {
    const g = this.ctx;
    const r = 58;
    const start = Math.PI * 0.75;
    const sweep = Math.PI * 1.25;
    const ang = (v: number) => start + (Math.max(0, Math.min(110, v)) / 110) * sweep;
    g.save();
    g.lineWidth = 3;
    g.strokeStyle = WHITE;
    g.beginPath();
    g.arc(cx, cy, r, start, start + sweep);
    g.stroke();
    g.strokeStyle = RED;
    g.beginPath();
    g.arc(cx, cy, r, ang(100), ang(110));
    g.stroke();
    g.lineWidth = 2;
    g.strokeStyle = WHITE;
    for (const v of [0, 50, 100]) {
      const a = ang(v);
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8));
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.stroke();
    }
    // Thrust lever position (cyan circle on the arc).
    const ta = ang(20 + throttle * 82);
    g.strokeStyle = CYAN;
    g.beginPath();
    g.arc(cx + Math.cos(ta) * (r + 8), cy + Math.sin(ta) * (r + 8), 4, 0, Math.PI * 2);
    g.stroke();
    // Needle.
    const a = ang(n1);
    g.strokeStyle = GREEN;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    g.stroke();
    g.fillStyle = "#000";
    g.strokeStyle = GREY;
    g.lineWidth = 1;
    g.fillRect(cx - 4, cy + 14, 58, 24);
    g.strokeRect(cx - 4, cy + 14, 58, 24);
    g.fillStyle = GREEN;
    g.textAlign = "right";
    g.font = "bold 17px ui-monospace, Menlo, monospace";
    g.fillText(n1.toFixed(1), cx + 50, cy + 27);
    g.restore();
  }
}

function flapDegFor(lever: number) {
  return [0, 10, 15, 20, 40][lever] ?? 0;
}

function fmt(v: number, step = 5) {
  return String(Math.max(0, Math.round(v / step) * step));
}

function memoLines(s: SimState, flapLever: number): [string, string][] {
  const out: [string, string][] = [];
  const f = s.fcc;
  if (f.message.startsWith("AP OFF")) out.push([f.message, RED]);
  else if (f.message) out.push([f.message, AMBER]);
  if (s.onGround && s.groundSpeedKt < 40) {
    out.push([flapLever >= 1 && flapLever <= 3 ? "T.O FLAPS ........ OK" : "T.O FLAPS ...... CONFIG", flapLever >= 1 && flapLever <= 3 ? GREEN : CYAN]);
  } else if (!s.onGround && s.aglFt < 2000 && s.vsFpm < -300) {
    out.push([s.gearPos > 0.99 ? "LDG GEAR ......... DN" : "LDG GEAR ..... DN", s.gearPos > 0.99 ? GREEN : AMBER]);
    out.push([flapLever === 4 ? "FLAPS .......... FULL" : "FLAPS ......... FULL", flapLever === 4 ? GREEN : CYAN]);
  }
  if (s.speedbrakePos > 0.05) out.push(["SPEED BRK", GREEN]);
  return out.slice(0, 3);
}
