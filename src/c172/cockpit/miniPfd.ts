// A small glass PFD drawn over the outside view: attitude in the middle, the speed tape on the
// left, the altitude tape on the right, the climb rate under it and a heading tape at the bottom.
// Our own drawing in the general style of light aircraft glass cockpits.
import type { C172State } from "../sim/types";

const W = 300;
const H = 208;
const D2R = Math.PI / 180;
// Attitude area.
const AX = 62;
const AW = 176;
const AY = 6;
const AH = 162;
const CX = AX + AW / 2;
const CY = AY + AH / 2;
const PPD = 3.4;

export class MiniPfd {
  private g: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.g = canvas.getContext("2d")!;
  }

  draw(s: C172State) {
    const c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const k = (c.clientWidth || W) / W;
    const pw = Math.round(W * k * dpr);
    const ph = Math.round(H * k * dpr);
    if (c.width !== pw || c.height !== ph) {
      c.width = pw;
      c.height = ph;
    }
    const g = this.g;
    g.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    this.attitude(s);
    this.speed(s.kias);
    this.altitude(s.altFt, s.vsFpm);
    this.heading(s.headingDeg);
  }

  private attitude(s: C172State) {
    const g = this.g;
    g.save();
    g.beginPath();
    g.roundRect(AX, AY, AW, AH, 6);
    g.clip();
    g.translate(CX, CY);
    g.rotate(-s.rollDeg * D2R);
    const hy = s.pitchDeg * PPD;
    g.fillStyle = "#2f76c9";
    g.fillRect(-300, -300, 600, 300 + hy);
    g.fillStyle = "#8a5a2b";
    g.fillRect(-300, hy, 600, 300);
    g.strokeStyle = "#fff";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-300, hy);
    g.lineTo(300, hy);
    g.stroke();
    // Pitch ladder.
    g.font = "bold 10px system-ui, sans-serif";
    g.fillStyle = "#fff";
    g.textBaseline = "middle";
    g.lineWidth = 1.2;
    for (let p = -30; p <= 30; p += 5) {
      if (p === 0) continue;
      const y = hy - p * PPD;
      if (y < -AH / 2 + 34 || y > AH / 2 - 12) continue;
      const half = p % 10 === 0 ? 24 : 12;
      g.beginPath();
      g.moveTo(-half, y);
      g.lineTo(half, y);
      g.stroke();
      if (p % 10 === 0) {
        g.textAlign = "right";
        g.fillText(String(Math.abs(p)), -half - 3, y);
        g.textAlign = "left";
        g.fillText(String(Math.abs(p)), half + 3, y);
      }
    }
    // Bank pointer, turning with the horizon.
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(0, -AH / 2 + 18);
    g.lineTo(-6, -AH / 2 + 27);
    g.lineTo(6, -AH / 2 + 27);
    g.closePath();
    g.fill();
    g.restore();

    // Bank scale, fixed at the top.
    g.save();
    g.translate(CX, CY);
    g.strokeStyle = "#fff";
    g.lineWidth = 1.5;
    const r = AH / 2 - 18;
    g.beginPath();
    g.arc(0, 0, r, (-90 - 60) * D2R, (-90 + 60) * D2R);
    g.stroke();
    for (const a of [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60]) {
      const len = Math.abs(a) % 30 === 0 ? 9 : 5;
      const t = (a - 90) * D2R;
      g.beginPath();
      g.moveTo(Math.cos(t) * r, Math.sin(t) * r);
      g.lineTo(Math.cos(t) * (r + len), Math.sin(t) * (r + len));
      g.stroke();
    }
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(0, -r);
    g.lineTo(-5, -r - 8);
    g.lineTo(5, -r - 8);
    g.closePath();
    g.fill();
    // The aircraft symbol.
    g.fillStyle = "#ffd400";
    g.strokeStyle = "#000";
    g.lineWidth = 1;
    for (const sgn of [-1, 1]) {
      g.beginPath();
      g.rect(sgn > 0 ? 14 : -44, -2, 30, 4);
      g.fill();
      g.stroke();
    }
    g.beginPath();
    g.moveTo(-14, 10);
    g.lineTo(0, 0);
    g.lineTo(14, 10);
    g.lineTo(0, 4);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }

  /** A vertical tape: ticks, labels and the value box. */
  private tape(x: number, w: number, value: number, ppu: number, tick: number, label: number, fmt: (v: number) => string, bands?: [number, number, string][]) {
    const g = this.g;
    g.save();
    g.beginPath();
    g.roundRect(x, AY, w, AH, 6);
    g.fillStyle = "rgba(10, 14, 20, 0.72)";
    g.fill();
    g.clip();
    const right = x < CX;
    // Coloured speed bands along the inner edge.
    for (const [lo, hi, col] of bands ?? []) {
      const y1 = CY - (hi - value) * ppu;
      const y2 = CY - (lo - value) * ppu;
      g.fillStyle = col;
      g.fillRect(right ? x + w - 5 : x, y1, 5, y2 - y1);
    }
    g.strokeStyle = "#fff";
    g.fillStyle = "#fff";
    g.font = "11px ui-monospace, monospace";
    g.textBaseline = "middle";
    g.textAlign = right ? "right" : "left";
    g.lineWidth = 1;
    const span = AH / 2 / ppu + tick;
    for (let v = Math.ceil((value - span) / tick) * tick; v <= value + span; v += tick) {
      if (v < 0) continue;
      const y = CY - (v - value) * ppu;
      const major = v % label === 0;
      g.beginPath();
      if (right) {
        g.moveTo(x + w - 5, y);
        g.lineTo(x + w - (major ? 13 : 9), y);
      } else {
        g.moveTo(x + 5, y);
        g.lineTo(x + (major ? 13 : 9), y);
      }
      g.stroke();
      if (major) g.fillText(fmt(v), right ? x + w - 16 : x + 16, y);
    }
    g.restore();
    // Value box.
    g.save();
    g.fillStyle = "#000";
    g.strokeStyle = "#fff";
    g.lineWidth = 1.2;
    g.beginPath();
    g.rect(x + 2, CY - 11, w - 4, 22);
    g.fill();
    g.stroke();
    g.fillStyle = "#fff";
    g.font = "bold 15px ui-monospace, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(fmt(value), x + w / 2, CY + 1);
    g.restore();
  }

  private speed(kias: number) {
    const v = Math.max(0, kias);
    this.tape(4, 54, v, 3.2, 5, 10, (x) => String(Math.round(x)), [
      [33, 85, "#ffffff"],
      [48, 129, "#2ecc40"],
      [129, 163, "#ffd400"],
    ]);
    this.caption(31, "KT");
  }

  private altitude(alt: number, vs: number) {
    this.tape(242, 54, alt, 0.4, 50, 100, (x) => String(Math.round(x / 10) * 10));
    this.caption(269, "FT");
    // Climb rate under the altitude tape.
    const g = this.g;
    g.save();
    g.fillStyle = "rgba(10, 14, 20, 0.72)";
    g.beginPath();
    g.roundRect(242, AY + AH + 4, 54, H - AY - AH - 6, 5);
    g.fill();
    g.fillStyle = "#9fb0c0";
    g.font = "9px system-ui, sans-serif";
    g.textAlign = "center";
    g.fillText("CLIMB", 269, AY + AH + 14);
    const r = Math.round(vs / 50) * 50;
    g.fillStyle = Math.abs(r) < 100 ? "#fff" : r > 0 ? "#6dff9a" : "#ffc04d";
    g.font = "bold 12px ui-monospace, monospace";
    g.fillText(`${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}`, 269, AY + AH + 28);
    g.restore();
  }

  private caption(x: number, text: string) {
    const g = this.g;
    g.save();
    g.fillStyle = "rgba(10, 14, 20, 0.72)";
    g.beginPath();
    g.roundRect(x - 27, AY + AH + 4, 54, H - AY - AH - 6, 5);
    g.fill();
    g.fillStyle = "#9fb0c0";
    g.font = "10px system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, x, AY + AH + 20);
    g.restore();
  }

  private heading(hdg: number) {
    const g = this.g;
    const x = AX;
    const y = AY + AH + 4;
    const w = AW;
    const h = H - y - 2;
    const ppd = 3;
    g.save();
    g.beginPath();
    g.roundRect(x, y, w, h, 5);
    g.fillStyle = "rgba(10, 14, 20, 0.72)";
    g.fill();
    g.clip();
    g.strokeStyle = "#fff";
    g.fillStyle = "#fff";
    g.font = "10px ui-monospace, monospace";
    g.textAlign = "center";
    g.textBaseline = "top";
    const cx = x + w / 2;
    for (let d = Math.floor(hdg / 5) * 5 - 35; d <= hdg + 35; d += 5) {
      const u = cx + (d - hdg) * ppd;
      const major = d % 10 === 0;
      g.beginPath();
      g.moveTo(u, y);
      g.lineTo(u, y + (major ? 7 : 4));
      g.stroke();
      if (major && Math.abs(u - cx) > 26) {
        const n = ((d % 360) + 360) % 360;
        const lab = n === 0 ? "N" : n === 90 ? "E" : n === 180 ? "S" : n === 270 ? "W" : String(n / 10);
        g.fillText(lab, u, y + 9);
      }
    }
    g.restore();
    g.save();
    g.fillStyle = "#000";
    g.strokeStyle = "#fff";
    g.lineWidth = 1.2;
    g.beginPath();
    g.rect(cx - 22, y + 2, 44, h - 4);
    g.fill();
    g.stroke();
    g.fillStyle = "#fff";
    g.font = "bold 14px ui-monospace, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(String(Math.round(hdg) % 360 || 360).padStart(3, "0"), cx, y + h / 2 + 1);
    g.restore();
  }
}
