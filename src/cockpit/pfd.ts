// A simple primary flight display drawn on a canvas: attitude, speed tape, altitude tape,
// vertical speed and heading. R0 version, not yet a full replica of the real display.
import type { SimState } from "../sim/types";

const SIZE = 420;
const SKY = "#2a6fc9";
const GROUND = "#8a5a2b";
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const YELLOW = "#ffd400";
const AMBER = "#ff9f1a";
const TAPE_BG = "#3b3b3b";
const PX_PER_DEG = 6; // attitude: pixels per degree of pitch

export class Pfd {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.scale(dpr, dpr);
  }

  draw(s: SimState) {
    const g = this.ctx;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, SIZE);
    g.font = "14px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    this.attitude(s, 210, 200);
    this.speedTape(s.kias, 52, 200);
    this.altTape(s.altFt, 352, 200);
    this.vsi(s.vsFpm, 404, 200);
    this.headingTape(s.headingDeg, 210, 388);
    this.fma();
    g.restore();
  }

  private attitude(s: SimState, cx: number, cy: number) {
    const g = this.ctx;
    const w = 210;
    const h = 230;
    g.save();
    g.beginPath();
    g.rect(cx - w / 2, cy - h / 2, w, h);
    g.clip();
    g.translate(cx, cy);
    g.rotate((-s.rollDeg * Math.PI) / 180);
    const horizonY = s.pitchDeg * PX_PER_DEG;
    g.fillStyle = SKY;
    g.fillRect(-400, -800 + horizonY, 800, 800);
    g.fillStyle = GROUND;
    g.fillRect(-400, horizonY, 800, 800);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-400, horizonY);
    g.lineTo(400, horizonY);
    g.stroke();
    // Pitch ladder every 2.5 degrees, labels every 10.
    g.fillStyle = WHITE;
    g.textAlign = "center";
    g.lineWidth = 1.5;
    for (let p = -30; p <= 30; p += 2.5) {
      if (p === 0) continue;
      const y = horizonY - p * PX_PER_DEG;
      const half = p % 10 === 0 ? 40 : p % 5 === 0 ? 22 : 10;
      g.beginPath();
      g.moveTo(-half, y);
      g.lineTo(half, y);
      g.stroke();
      if (p % 10 === 0) {
        g.fillText(String(Math.abs(p)), -half - 14, y);
        g.fillText(String(Math.abs(p)), half + 14, y);
      }
    }
    g.restore();

    // Roll scale (fixed) and roll pointer (moves with the aircraft).
    g.save();
    g.translate(cx, cy);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    const r = 100;
    for (const a of [-45, -30, -20, -10, 0, 10, 20, 30, 45]) {
      const rad = ((a - 90) * Math.PI) / 180;
      const len = a === 0 ? 0 : Math.abs(a) % 30 === 0 ? 12 : 7;
      if (len === 0) continue;
      g.beginPath();
      g.moveTo(Math.cos(rad) * r, Math.sin(rad) * r);
      g.lineTo(Math.cos(rad) * (r + len), Math.sin(rad) * (r + len));
      g.stroke();
    }
    g.fillStyle = YELLOW;
    g.beginPath();
    g.moveTo(0, -r);
    g.lineTo(-7, -r - 11);
    g.lineTo(7, -r - 11);
    g.closePath();
    g.fill();
    g.rotate((-s.rollDeg * Math.PI) / 180);
    g.fillStyle = Math.abs(s.rollDeg) > 33 ? AMBER : YELLOW;
    g.beginPath();
    g.moveTo(0, -r + 2);
    g.lineTo(-7, -r + 13);
    g.lineTo(7, -r + 13);
    g.closePath();
    g.fill();
    g.restore();

    // Fixed aircraft symbol.
    g.save();
    g.translate(cx, cy);
    g.fillStyle = "#000";
    g.strokeStyle = YELLOW;
    g.lineWidth = 3;
    for (const side of [-1, 1]) {
      g.beginPath();
      g.moveTo(side * 70, 0);
      g.lineTo(side * 30, 0);
      g.lineTo(side * 30, 10);
      g.stroke();
    }
    g.fillStyle = YELLOW;
    g.fillRect(-4, -4, 8, 8);
    g.restore();
  }

  private speedTape(kias: number, cx: number, cy: number) {
    const g = this.ctx;
    const w = 64;
    const h = 260;
    const pxPerKt = 3.2;
    g.save();
    g.fillStyle = TAPE_BG;
    g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.beginPath();
    g.rect(cx - w / 2, cy - h / 2, w, h);
    g.clip();
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.textAlign = "right";
    g.lineWidth = 1.5;
    const base = Math.floor(kias / 10) * 10;
    for (let v = base - 60; v <= base + 60; v += 10) {
      if (v < 30) continue;
      const y = cy - (v - kias) * pxPerKt;
      g.beginPath();
      g.moveTo(cx + w / 2 - 10, y);
      g.lineTo(cx + w / 2, y);
      g.stroke();
      if (v % 20 === 0) g.fillText(String(v), cx + w / 2 - 14, y);
    }
    g.restore();
    this.readout(Math.round(kias).toString(), cx - 2, cy, 50, YELLOW);
  }

  private altTape(altFt: number, cx: number, cy: number) {
    const g = this.ctx;
    const w = 70;
    const h = 260;
    const pxPerFt = 0.24;
    g.save();
    g.fillStyle = TAPE_BG;
    g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.beginPath();
    g.rect(cx - w / 2, cy - h / 2, w, h);
    g.clip();
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.textAlign = "left";
    g.lineWidth = 1.5;
    const base = Math.floor(altFt / 100) * 100;
    for (let a = base - 600; a <= base + 600; a += 100) {
      const y = cy - (a - altFt) * pxPerFt;
      g.beginPath();
      g.moveTo(cx - w / 2, y);
      g.lineTo(cx - w / 2 + 8, y);
      g.stroke();
      if (a % 500 === 0) g.fillText(String(a / 100).padStart(3, "0"), cx - w / 2 + 12, y);
    }
    g.restore();
    this.readout(Math.round(altFt).toString(), cx + 4, cy, 62, GREEN);
  }

  private vsi(vsFpm: number, cx: number, cy: number) {
    const g = this.ctx;
    g.save();
    g.fillStyle = TAPE_BG;
    g.fillRect(cx - 12, cy - 100, 24, 200);
    const clamped = Math.max(-6000, Math.min(6000, vsFpm));
    const y = cy - (Math.sign(clamped) * Math.sqrt(Math.abs(clamped) / 6000)) * 95;
    g.strokeStyle = Math.abs(vsFpm) > 6000 ? AMBER : GREEN;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx + 12, cy);
    g.lineTo(cx - 10, y);
    g.stroke();
    if (Math.abs(vsFpm) >= 200) {
      g.fillStyle = GREEN;
      g.textAlign = "center";
      g.font = "12px ui-monospace, Menlo, monospace";
      g.fillText(String(Math.round(Math.abs(vsFpm) / 100)).padStart(2, "0"), cx, vsFpm > 0 ? cy - 112 : cy + 112);
    }
    g.restore();
  }

  private headingTape(hdg: number, cx: number, cy: number) {
    const g = this.ctx;
    const w = 210;
    const pxPerDeg = 5;
    g.save();
    g.fillStyle = TAPE_BG;
    g.fillRect(cx - w / 2, cy - 18, w, 36);
    g.beginPath();
    g.rect(cx - w / 2, cy - 18, w, 36);
    g.clip();
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.textAlign = "center";
    g.lineWidth = 1.5;
    const base = Math.floor(hdg / 5) * 5;
    for (let d = base - 25; d <= base + 25; d += 5) {
      const x = cx + (d - hdg) * pxPerDeg;
      g.beginPath();
      g.moveTo(x, cy - 18);
      g.lineTo(x, cy - 18 + (d % 10 === 0 ? 10 : 6));
      g.stroke();
      if (d % 10 === 0) g.fillText(String(((d % 360) + 360) % 360 / 10).padStart(2, "0"), x, cy + 6);
    }
    g.restore();
    g.fillStyle = YELLOW;
    g.fillRect(cx - 1.5, cy - 26, 3, 16);
  }

  private fma() {
    const g = this.ctx;
    g.save();
    g.fillStyle = WHITE;
    g.textAlign = "center";
    g.font = "12px ui-monospace, Menlo, monospace";
    g.fillText("MANUAL  ·  NO AUTOPILOT IN R0", 210, 16);
    g.restore();
  }

  private readout(text: string, cx: number, cy: number, w: number, colour: string) {
    const g = this.ctx;
    g.save();
    g.fillStyle = "#000";
    g.strokeStyle = colour;
    g.lineWidth = 2;
    g.fillRect(cx - w / 2, cy - 13, w, 26);
    g.strokeRect(cx - w / 2, cy - 13, w, 26);
    g.fillStyle = colour;
    g.textAlign = "center";
    g.font = "bold 16px ui-monospace, Menlo, monospace";
    g.fillText(text, cx, cy + 1);
    g.restore();
  }
}
