// Primary flight display drawn on a canvas: flight mode annunciator, attitude, speed and altitude
// tapes with the FCU targets, vertical speed, heading, ILS deviation scales and radio height.
// A training display in the spirit of the real one, not a replica.
import type { SimState } from "../sim/types";

const SIZE = 420;
const SKY = "#2a6fc9";
const GROUND = "#8a5a2b";
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const YELLOW = "#ffd400";
const AMBER = "#ff9f1a";
const CYAN = "#3fd4ff";
const MAGENTA = "#ff4bd8";
const RED = "#ff3b3b";
const TAPE_BG = "#3b3b3b";
const PX_PER_DEG = 6;
/** Height of the radio altimeter antenna above the ground with the aircraft on its wheels, feet. */
export const RA_ZERO_FT = 8;

export class Pfd {
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

  draw(s: SimState) {
    const g = this.ctx;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, SIZE);
    g.font = "14px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    const sys = s.systems;
    // Attitude and heading need an aligned inertial reference. Speed and altitude (air data) work
    // as soon as an ADIRS is switched on.
    const att = sys.irAligned[0] || sys.irAligned[2];
    const adr = sys.irAligning.some(Boolean) || sys.irAligned.some(Boolean);
    if (att) {
      this.attitude(s, 210, 205);
      this.ils(s, 210, 205);
      this.headingTape(s, 210, 395);
    } else {
      flag(g, "ATT", 210, 205);
      flag(g, "HDG", 210, 395);
    }
    if (adr) {
      this.speedTape(s, 52, 205);
      this.altTape(s, 352, 205);
      this.vsi(s.vsFpm, 404, 205);
    } else {
      flag(g, "SPD", 52, 205);
      flag(g, "ALT", 352, 205);
    }
    if (att) this.radioHeight(s, 210, 300);
    this.fma(s);
    g.restore();
  }

  private fma(s: SimState) {
    const g = this.ctx;
    const f = s.fcc;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, 52);
    g.strokeStyle = "#555";
    g.lineWidth = 1;
    for (const x of [84, 168, 252, 336]) {
      g.beginPath();
      g.moveTo(x, 4);
      g.lineTo(x, 48);
      g.stroke();
    }
    g.textAlign = "center";
    g.font = "bold 13px ui-monospace, Menlo, monospace";
    const col = (i: number) => 42 + i * 84;
    // Column 1: autothrust mode. Column 2: vertical. Column 3: lateral. Column 5: engagement.
    if (f.athr) {
      g.fillStyle = GREEN;
      g.fillText(f.athrMode, col(0), 15);
    }
    g.fillStyle = GREEN;
    if (f.vert) g.fillText(f.vert, col(1), 15);
    if (f.lat) g.fillText(f.lat, col(2), 15);
    g.fillStyle = CYAN;
    if (f.vertArmed) g.fillText(f.vertArmed, col(1), 33);
    if (f.latArmed) g.fillText(f.latArmed, col(2), 33);
    g.fillStyle = WHITE;
    if (f.ap) g.fillText("AP1", col(4), 15);
    if (f.athr) g.fillText("A/THR", col(4), 33);
    if (!f.ap && !f.athr && !f.vert) {
      g.fillStyle = "#9aa";
      g.font = "12px ui-monospace, Menlo, monospace";
      g.fillText(s.fcc.law === "GROUND" ? "GROUND LAW" : "MANUAL", col(2), 15);
    }
    if (f.message) {
      g.font = "bold 12px ui-monospace, Menlo, monospace";
      g.fillStyle = f.message.startsWith("AP OFF") ? RED : AMBER;
      g.fillText(f.message, 210, 46);
    }
    g.restore();
  }

  private attitude(s: SimState, cx: number, cy: number) {
    const g = this.ctx;
    const w = 210;
    const h = 220;
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

    g.save();
    g.translate(cx, cy);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    const r = 96;
    for (const a of [-45, -30, -20, -10, 10, 20, 30, 45]) {
      const rad = ((a - 90) * Math.PI) / 180;
      const len = Math.abs(a) % 30 === 0 ? 12 : 7;
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

    g.save();
    g.translate(cx, cy);
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

  /** ILS scales: localizer under the attitude, glide slope to its right. Diamonds in magenta. */
  private ils(s: SimState, cx: number, cy: number) {
    const ils = s.fcc.ils;
    if (!ils.valid || ils.distThrNm > 20 || ils.distThrNm < -2) return;
    const g = this.ctx;
    const dot = 22; // pixels per dot
    g.save();
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    for (const i of [-2, -1, 1, 2]) {
      g.beginPath();
      g.arc(cx + i * dot, cy + 100, 3, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(cx + 114, cy + i * dot, 3, 0, Math.PI * 2);
      g.stroke();
    }
    // Localizer: positive deviation = aircraft right, so the beam (diamond) is to the left.
    const locDots = Math.max(-2.3, Math.min(2.3, -ils.locDevDeg / (2.5 / 2)));
    const gsDots = Math.max(-2.3, Math.min(2.3, ils.gsDevDeg / (0.7 / 2)));
    g.fillStyle = MAGENTA;
    diamond(g, cx + locDots * dot, cy + 100, 7);
    diamond(g, cx + 114, cy + gsDots * dot, 7);
    g.font = "11px ui-monospace, Menlo, monospace";
    g.fillStyle = MAGENTA;
    g.textAlign = "left";
    g.fillText(`ILS28 ${ils.distThrNm.toFixed(1)}NM`, cx - 104, cy - 100);
    g.restore();
  }

  private speedTape(s: SimState, cx: number, cy: number) {
    const kias = s.kias;
    const g = this.ctx;
    const w = 64;
    const h = 250;
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
    // Selected speed: cyan triangle on the right edge of the tape.
    const spdY = cy - (s.fcc.fcu.spd - kias) * pxPerKt;
    g.fillStyle = CYAN;
    g.beginPath();
    g.moveTo(cx + w / 2 - 1, spdY);
    g.lineTo(cx + w / 2 + 10, spdY - 7);
    g.lineTo(cx + w / 2 + 10, spdY + 7);
    g.closePath();
    g.fill();
    g.restore();
    this.readout(Math.round(kias).toString(), cx - 2, cy, 50, YELLOW);
    const g2 = this.ctx;
    g2.save();
    g2.fillStyle = CYAN;
    g2.textAlign = "center";
    g2.font = "12px ui-monospace, Menlo, monospace";
    g2.fillText(String(Math.round(s.fcc.fcu.spd)), cx, cy - h / 2 - 9);
    g2.restore();
  }

  private altTape(s: SimState, cx: number, cy: number) {
    const altFt = s.altFt;
    const g = this.ctx;
    const w = 70;
    const h = 250;
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
    const altY = cy - (s.fcc.fcu.alt - altFt) * pxPerFt;
    g.fillStyle = CYAN;
    g.fillRect(cx - w / 2, altY - 2, 12, 4);
    g.restore();
    this.readout(Math.round(altFt).toString(), cx + 4, cy, 62, GREEN);
    g.save();
    g.fillStyle = CYAN;
    g.textAlign = "center";
    g.font = "12px ui-monospace, Menlo, monospace";
    g.fillText(String(Math.round(s.fcc.fcu.alt)), cx, cy - h / 2 - 9);
    g.restore();
  }

  private vsi(vsFpm: number, cx: number, cy: number) {
    const g = this.ctx;
    g.save();
    g.fillStyle = TAPE_BG;
    g.fillRect(cx - 12, cy - 100, 24, 200);
    const clamped = Math.max(-6000, Math.min(6000, vsFpm));
    const y = cy - Math.sign(clamped) * Math.sqrt(Math.abs(clamped) / 6000) * 95;
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

  private headingTape(s: SimState, cx: number, cy: number) {
    const hdg = s.headingDeg;
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
      if (d % 10 === 0) g.fillText(String((((d % 360) + 360) % 360) / 10).padStart(2, "0"), x, cy + 6);
    }
    // Selected heading: cyan triangle.
    let rel = s.fcc.fcu.hdg - hdg;
    rel = ((rel + 540) % 360) - 180;
    const hx = cx + Math.max(-w / 2 + 6, Math.min(w / 2 - 6, rel * pxPerDeg));
    g.fillStyle = CYAN;
    g.beginPath();
    g.moveTo(hx, cy - 18);
    g.lineTo(hx - 6, cy - 6);
    g.lineTo(hx + 6, cy - 6);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = YELLOW;
    g.fillRect(cx - 1.5, cy - 26, 3, 16);
  }

  private radioHeight(s: SimState, cx: number, cy: number) {
    const ra = s.aglFt - RA_ZERO_FT;
    if (ra > 2500 || s.onGround) return;
    const g = this.ctx;
    g.save();
    g.textAlign = "center";
    g.font = "bold 16px ui-monospace, Menlo, monospace";
    g.fillStyle = ra < 400 ? AMBER : GREEN;
    const shown = ra < 50 ? Math.max(0, Math.round(ra)) : ra < 400 ? Math.round(ra / 5) * 5 : Math.round(ra / 10) * 10;
    g.fillText(String(shown), cx, cy);
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

function flag(g: CanvasRenderingContext2D, text: string, x: number, y: number) {
  g.save();
  g.fillStyle = RED;
  g.font = "bold 20px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, x, y);
  g.restore();
}

function diamond(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r, y);
  g.lineTo(x, y + r);
  g.lineTo(x - r, y);
  g.closePath();
  g.fill();
}
