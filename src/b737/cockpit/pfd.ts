// 737-type PFD: flight mode annunciations at the top, speed tape, attitude with flight director bars,
// altitude tape and vertical speed, heading arc, and localizer and glide slope scales on an ILS.
// Our own drawing in the general style of the type, not a copy of the real display.
import type { State737 } from "../sim/types";
import type { NavReading } from "../../radio/navReceiver";

const W = 500;
const H = 500;
const GREEN = "#3ef03e";
const MAGENTA = "#ff4dff";
const WHITE = "#f2f2f2";
const AMBER = "#ffb000";
const CYAN = "#4fd8ff";
const SKY = "#2a6fd6";
const GROUND = "#8a5a2b";
const FONT = "ui-monospace, Menlo, monospace";

export class Pfd737 {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = W;
    canvas.height = H;
    this.g = canvas.getContext("2d")!;
  }

  draw(s: State737, baro: { qnh: number; std: boolean }, worldQnh: number, nav: NavReading) {
    const g = this.g;
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
    this.attitude(s);
    this.speedTape(s);
    this.altTape(s, baro, worldQnh);
    this.heading(s);
    this.fma(s);
    if (nav.valid && nav.station?.kind === "ils") this.ils(nav);
  }

  private text(t: string, x: number, y: number, colour = WHITE, size = 14, align: CanvasTextAlign = "center") {
    const g = this.g;
    g.font = `${size}px ${FONT}`;
    g.fillStyle = colour;
    g.textAlign = align;
    g.textBaseline = "middle";
    g.fillText(t, x, y);
  }

  private fma(s: State737) {
    const g = this.g;
    const a = s.afcs;
    const cols: [string, string][] = [
      [a.at, ""],
      [a.roll, a.rollArmed],
      [a.pitch, ""],
    ];
    g.strokeStyle = "#555";
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = 105 + i * 100;
      if (i) {
        g.beginPath();
        g.moveTo(x - 50, 4);
        g.lineTo(x - 50, 46);
        g.stroke();
      }
      this.text(cols[i][0], x, 16, GREEN, 15);
      if (cols[i][1]) this.text(cols[i][1], x, 36, WHITE, 13);
    }
    const ap = a.cmdA ? "CMD" : a.fd ? "FD" : "";
    if (ap) this.text(ap, 250, 64, GREEN, 18);
    if (a.message) this.text(a.message, 250, 86, AMBER, 13);
  }

  private attitude(s: State737) {
    const g = this.g;
    const cx = 250;
    const cy = 245;
    const ppd = 7; // pixels per degree of pitch
    g.save();
    g.beginPath();
    g.rect(110, 100, 280, 290);
    g.clip();
    g.translate(cx, cy);
    g.rotate((-s.rollDeg * Math.PI) / 180);
    g.translate(0, s.pitchDeg * ppd);
    g.fillStyle = SKY;
    g.fillRect(-500, -1000, 1000, 1000);
    g.fillStyle = GROUND;
    g.fillRect(-500, 0, 1000, 1000);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-500, 0);
    g.lineTo(500, 0);
    g.stroke();
    g.lineWidth = 1.5;
    for (let d = -30; d <= 30; d += 2.5) {
      if (d === 0) continue;
      const half = d % 10 === 0 ? 40 : d % 5 === 0 ? 22 : 10;
      g.beginPath();
      g.moveTo(-half, -d * ppd);
      g.lineTo(half, -d * ppd);
      g.stroke();
      if (d % 10 === 0) {
        g.font = `12px ${FONT}`;
        g.fillStyle = WHITE;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(String(Math.abs(d)), -56, -d * ppd);
        g.fillText(String(Math.abs(d)), 56, -d * ppd);
      }
    }
    g.restore();

    // Roll scale and pointer.
    g.save();
    g.translate(cx, cy);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 125, (-150 * Math.PI) / 180, (-30 * Math.PI) / 180);
    g.stroke();
    for (const d of [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]) {
      const r = (d - 90) * (Math.PI / 180);
      const len = Math.abs(d) % 30 === 0 ? 14 : 8;
      g.beginPath();
      g.moveTo(Math.cos(r) * 125, Math.sin(r) * 125);
      g.lineTo(Math.cos(r) * (125 + len), Math.sin(r) * (125 + len));
      g.stroke();
    }
    g.rotate((-s.rollDeg * Math.PI) / 180);
    g.fillStyle = WHITE;
    g.beginPath();
    g.moveTo(0, -123);
    g.lineTo(-8, -110);
    g.lineTo(8, -110);
    g.closePath();
    g.fill();
    g.restore();

    // Flight director bars.
    const a = s.afcs;
    if (a.fd && (a.roll || a.pitch)) {
      g.strokeStyle = MAGENTA;
      g.lineWidth = 3;
      const dy = Math.max(-80, Math.min(80, -(a.fdPitch - s.pitchDeg) * ppd));
      const dx = Math.max(-80, Math.min(80, (a.fdBank - s.rollDeg) * 3));
      g.beginPath();
      g.moveTo(cx - 70, cy + dy);
      g.lineTo(cx + 70, cy + dy);
      g.moveTo(cx + dx, cy - 70);
      g.lineTo(cx + dx, cy + 70);
      g.stroke();
    }
    // Aircraft symbol.
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    for (const side of [-1, 1]) {
      g.beginPath();
      g.rect(cx + side * 40 - (side > 0 ? 0 : 40), cy - 4, 40, 8);
      g.fill();
      g.stroke();
    }
    g.fillRect(cx - 5, cy - 5, 10, 10);
    g.strokeRect(cx - 5, cy - 5, 10, 10);
  }

  private speedTape(s: State737) {
    const g = this.g;
    const x = 30;
    const w = 62;
    const top = 100;
    const bot = 390;
    const mid = (top + bot) / 2;
    const ppk = 4; // pixels per knot
    g.fillStyle = "#3a3f47";
    g.fillRect(x, top, w, bot - top);
    g.save();
    g.beginPath();
    g.rect(x, top, w, bot - top);
    g.clip();
    const v = Math.max(30, s.kias);
    for (let k = Math.floor((v - 40) / 10) * 10; k <= v + 40; k += 10) {
      if (k < 30) continue;
      const y = mid - (k - v) * ppk;
      g.strokeStyle = WHITE;
      g.beginPath();
      g.moveTo(x + w - 10, y);
      g.lineTo(x + w, y);
      g.stroke();
      if (k % 20 === 0) this.text(String(k), x + w - 14, y, WHITE, 13, "right");
    }
    // Selected speed bug.
    const by = mid - (s.afcs.mcp.spd - v) * ppk;
    g.strokeStyle = MAGENTA;
    g.lineWidth = 2;
    g.strokeRect(x + w - 2, by - 6, 10, 12);
    g.restore();
    // Current speed box.
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.fillRect(x - 6, mid - 14, w + 4, 28);
    g.strokeRect(x - 6, mid - 14, w + 4, 28);
    this.text(s.kias < 30 ? "---" : String(Math.round(s.kias)), x + 26, mid, WHITE, 18);
    this.text(String(Math.round(s.afcs.mcp.spd)), x + w / 2, top - 12, MAGENTA, 16);
    this.text(`.${Math.round(s.mach * 1000)}`.slice(0, 4), x + w / 2, bot + 14, WHITE, 13);
  }

  private altTape(s: State737, baro: { qnh: number; std: boolean }, worldQnh: number) {
    const g = this.g;
    const x = 400;
    const w = 66;
    const top = 100;
    const bot = 390;
    const mid = (top + bot) / 2;
    const ppf = 0.35; // pixels per foot
    // The altimeter reads true altitude with the right QNH, and 27 ft more per hPa set too high.
    const ref = baro.std ? 1013 : baro.qnh;
    const alt = s.altFt + (ref - worldQnh) * 27;
    g.fillStyle = "#3a3f47";
    g.fillRect(x, top, w, bot - top);
    g.save();
    g.beginPath();
    g.rect(x, top, w, bot - top);
    g.clip();
    for (let a = Math.floor((alt - 500) / 100) * 100; a <= alt + 500; a += 100) {
      const y = mid - (a - alt) * ppf;
      g.strokeStyle = WHITE;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 8, y);
      g.stroke();
      if (a % 200 === 0) this.text(String(a), x + 12, y, WHITE, 12, "left");
    }
    const by = mid - (s.afcs.mcp.alt - alt) * ppf;
    g.strokeStyle = MAGENTA;
    g.lineWidth = 2;
    g.strokeRect(x - 6, by - 7, 10, 14);
    g.restore();
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.fillRect(x + 2, mid - 14, w + 6, 28);
    g.strokeRect(x + 2, mid - 14, w + 6, 28);
    this.text(String(Math.round(alt / 10) * 10), x + w - 2, mid, WHITE, 17, "right");
    this.text(String(s.afcs.mcp.alt), x + w / 2, top - 12, MAGENTA, 16);
    this.text(baro.std ? "STD" : `${baro.qnh} HPA`, x + w / 2, bot + 14, baro.std ? CYAN : GREEN, 13);
    // Vertical speed.
    const vx = 478;
    g.fillStyle = "#3a3f47";
    g.fillRect(vx, 140, 18, 210);
    const vs = Math.max(-6000, Math.min(6000, s.vsFpm));
    const vy = 245 - Math.sign(vs) * Math.min(100, Math.sqrt(Math.abs(vs) / 6000) * 100);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(vx + 18, 245);
    g.lineTo(vx + 2, vy);
    g.stroke();
    if (Math.abs(vs) > 400) this.text(String(Math.round(vs / 50) * 50), vx + 8, vs > 0 ? 130 : 362, WHITE, 11);
  }

  private heading(s: State737) {
    const g = this.g;
    const cx = 250;
    const cy = 560;
    const r = 130;
    g.save();
    g.beginPath();
    g.rect(110, 405, 280, 95);
    g.clip();
    g.fillStyle = "#3a3f47";
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    g.translate(cx, cy);
    g.rotate((-s.headingDeg * Math.PI) / 180);
    for (let d = 0; d < 360; d += 5) {
      const len = d % 10 === 0 ? 12 : 6;
      g.save();
      g.rotate((d * Math.PI) / 180);
      g.strokeStyle = WHITE;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(0, -r);
      g.lineTo(0, -r + len);
      g.stroke();
      if (d % 30 === 0) {
        g.font = `13px ${FONT}`;
        g.fillStyle = WHITE;
        g.textAlign = "center";
        g.fillText(String(d / 10), 0, -r + 26);
      }
      g.restore();
    }
    g.save();
    g.rotate((s.afcs.mcp.hdg * Math.PI) / 180);
    g.strokeStyle = MAGENTA;
    g.lineWidth = 2;
    g.strokeRect(-7, -r - 2, 14, 8);
    g.restore();
    g.restore();
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.fillRect(cx - 24, 410, 48, 22);
    g.strokeRect(cx - 24, 410, 48, 22);
    this.text(String(Math.round(s.headingDeg) % 360).padStart(3, "0"), cx, 421, WHITE, 15);
    this.text(`${String(s.afcs.mcp.hdg).padStart(3, "0")} H`, 160, 421, MAGENTA, 13);
  }

  private ils(n: NavReading) {
    const g = this.g;
    // Localizer below the attitude, glide slope to its right.
    g.strokeStyle = WHITE;
    g.lineWidth = 1.5;
    for (const d of [-2, -1, 1, 2]) {
      g.beginPath();
      g.arc(250 + d * 40, 376, 4, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(384, 245 + d * 40, 4, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = MAGENTA;
    const lx = 250 + Math.max(-1, Math.min(1, n.dev)) * 80;
    g.beginPath();
    g.moveTo(lx, 368);
    g.lineTo(lx + 8, 376);
    g.lineTo(lx, 384);
    g.lineTo(lx - 8, 376);
    g.closePath();
    g.fill();
    if (n.gs !== null) {
      const gy = 245 - Math.max(-1, Math.min(1, n.gs)) * 80;
      g.beginPath();
      g.moveTo(384, gy - 8);
      g.lineTo(392, gy);
      g.lineTo(384, gy + 8);
      g.lineTo(376, gy);
      g.closePath();
      g.fill();
    }
    this.text(n.station?.ident ?? "", 130, 112, WHITE, 12, "left");
  }
}
