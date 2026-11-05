// Glass PFD for the C172, in the general style of light-aircraft glass cockpits: full-width
// attitude, airspeed tape with colour bands, altitude tape with baro, vertical speed and an HSI rose.
// Our own drawing for training, not a copy of any manufacturer's display.
import type { C172Controls, C172State } from "../sim/types";

const W = 640;
const H = 480;
const SKY = "#2f6fbf";
const GROUND = "#7a5530";
const WHITE = "#ffffff";
const CYAN = "#3fd4ff";
const GREEN = "#2fd24a";
const YELLOW = "#ffd400";
const RED = "#ff3b3b";
const MAGENTA = "#ff4bd8";
const TAPE = "rgba(40, 44, 52, 0.82)";
const FT_PER_HPA = 27;

// C172S airspeed limits, knots (public POH figures).
const V = { so: 40, s1: 48, fe: 85, no: 129, ne: 163 };

export class C172Pfd {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    this.g = canvas.getContext("2d")!;
    this.g.scale(dpr, dpr);
  }

  draw(s: C172State, c: C172Controls, worldQnh: number) {
    const g = this.g;
    g.save();
    g.font = "bold 15px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    this.attitude(s);
    this.speedTape(s);
    const baro = c.baro.std ? 1013.25 : c.baro.qnh;
    const indicated = s.altFt + (baro - worldQnh) * FT_PER_HPA;
    this.altTape(indicated);
    this.vsi(s.vsFpm);
    this.hsi(s, c.hdgBug);
    this.topBar(s);
    this.bottomBar(s, c);
    g.restore();
  }

  private attitude(s: C172State) {
    const g = this.g;
    const cx = W / 2;
    const cy = 190;
    const pxPerDeg = 7;
    g.save();
    g.translate(cx, cy);
    g.rotate((-s.rollDeg * Math.PI) / 180);
    const off = s.pitchDeg * pxPerDeg;
    g.fillStyle = SKY;
    g.fillRect(-900, -900 + off, 1800, 900);
    g.fillStyle = GROUND;
    g.fillRect(-900, off, 1800, 900);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-900, off);
    g.lineTo(900, off);
    g.stroke();
    // Pitch ladder.
    g.lineWidth = 1.5;
    g.fillStyle = WHITE;
    g.font = "12px ui-monospace, Menlo, monospace";
    g.textAlign = "left";
    for (let p = -30; p <= 30; p += 5) {
      if (p === 0) continue;
      const y = off - p * pxPerDeg;
      const half = p % 10 === 0 ? 40 : 18;
      g.beginPath();
      g.moveTo(-half, y);
      g.lineTo(half, y);
      g.stroke();
      if (p % 10 === 0) g.fillText(String(Math.abs(p)), half + 5, y);
    }
    g.restore();

    // Roll scale and pointer.
    g.save();
    g.translate(cx, cy);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 130, Math.PI * 1.25, Math.PI * 1.75);
    g.stroke();
    for (const a of [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60]) {
      const r = (a * Math.PI) / 180;
      const len = Math.abs(a) % 30 === 0 ? 14 : 8;
      g.beginPath();
      g.moveTo(Math.sin(r) * 130, -Math.cos(r) * 130);
      g.lineTo(Math.sin(r) * (130 + len), -Math.cos(r) * (130 + len));
      g.stroke();
    }
    g.fillStyle = WHITE;
    g.beginPath();
    g.moveTo(0, -130);
    g.lineTo(-8, -144);
    g.lineTo(8, -144);
    g.closePath();
    g.fill();
    g.rotate((-s.rollDeg * Math.PI) / 180);
    g.fillStyle = YELLOW;
    g.beginPath();
    g.moveTo(0, -128);
    g.lineTo(-8, -114);
    g.lineTo(8, -114);
    g.closePath();
    g.fill();
    g.restore();

    // Aircraft symbol (yellow wedge).
    g.save();
    g.translate(cx, cy);
    g.fillStyle = YELLOW;
    g.strokeStyle = "#000";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-70, 22);
    g.lineTo(-50, 22);
    g.lineTo(0, 8);
    g.lineTo(50, 22);
    g.lineTo(70, 22);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }

  private speedTape(s: C172State) {
    const g = this.g;
    const x = 70;
    const w = 66;
    const cy = 190;
    const h = 300;
    const pxPerKt = 4;
    const ias = s.kias < 20 ? 20 : s.kias; // the tape starts at 20 kt
    g.save();
    g.fillStyle = TAPE;
    g.fillRect(x, cy - h / 2, w, h);
    g.beginPath();
    g.rect(x, cy - h / 2, w + 12, h);
    g.clip();
    const yOf = (v: number) => cy - (v - ias) * pxPerKt;
    const band = (lo: number, hi: number, colour: string, dx: number) => {
      g.fillStyle = colour;
      g.fillRect(x + w - 8 + dx, yOf(hi), 6, yOf(lo) - yOf(hi));
    };
    band(V.so, V.fe, WHITE, -6);
    band(V.s1, V.no, GREEN, 0);
    band(V.no, V.ne, YELLOW, 0);
    band(V.ne, V.ne + 60, RED, 0);
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.textAlign = "right";
    g.lineWidth = 1.5;
    const base = Math.floor(ias / 10) * 10;
    for (let v = base - 40; v <= base + 50; v += 5) {
      if (v < 20) continue;
      const y = yOf(v);
      g.beginPath();
      g.moveTo(x + w - 16, y);
      g.lineTo(x + w - 8, y);
      g.stroke();
      if (v % 10 === 0) g.fillText(String(v), x + w - 20, y);
    }
    g.restore();
    readout(g, x - 2, cy, 58, s.kias < 20 ? "---" : String(Math.round(s.kias)), WHITE);
    g.fillStyle = "#000";
    g.fillRect(x, cy + h / 2, w, 22);
    g.fillStyle = MAGENTA;
    g.font = "bold 13px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    g.fillText(`TAS ${Math.round(s.kias)}KT`, x + w / 2, cy + h / 2 + 11);
  }

  private altTape(altFt: number) {
    const g = this.g;
    const x = 492;
    const w = 76;
    const cy = 190;
    const h = 300;
    const pxPerFt = 0.3;
    g.save();
    g.fillStyle = TAPE;
    g.fillRect(x, cy - h / 2, w, h);
    g.beginPath();
    g.rect(x, cy - h / 2, w, h);
    g.clip();
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.textAlign = "left";
    g.lineWidth = 1.5;
    const base = Math.floor(altFt / 100) * 100;
    for (let a = base - 600; a <= base + 600; a += 20) {
      const y = cy - (a - altFt) * pxPerFt;
      const big = a % 100 === 0;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (big ? 12 : 6), y);
      g.stroke();
      if (big) g.fillText(String(a), x + 16, y);
    }
    g.restore();
    readout(g, x + w / 2 + 2, cy, 78, String(Math.round(altFt / 10) * 10), WHITE);
  }

  /** Baro setting box under the altitude tape. */
  drawBaro(qnh: number, std: boolean) {
    const g = this.g;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(492, 340, 76, 22);
    g.fillStyle = CYAN;
    g.font = "bold 14px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(std ? "STD BARO" : `${qnh} HPA`, 530, 351);
    g.restore();
  }

  private vsi(vs: number) {
    const g = this.g;
    const x = 572;
    const cy = 190;
    g.save();
    g.fillStyle = TAPE;
    g.fillRect(x, cy - 110, 28, 220);
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.font = "11px ui-monospace, Menlo, monospace";
    g.textAlign = "left";
    for (const v of [-2000, -1000, 0, 1000, 2000]) {
      const y = cy - (v / 2000) * 100;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 8, y);
      g.stroke();
      if (v) g.fillText(String(Math.abs(v / 1000)), x + 11, y);
    }
    const v = Math.max(-2000, Math.min(2000, vs));
    const y = cy - (v / 2000) * 100;
    g.fillStyle = "#000";
    g.fillRect(x + 2, y - 8, 26, 16);
    g.fillStyle = WHITE;
    g.font = "10px ui-monospace, Menlo, monospace";
    g.fillText(Math.abs(vs) < 50 ? "" : String(Math.round(vs / 10) * 10), x + 3, y);
    g.restore();
  }

  private hsi(s: C172State, bug: number) {
    const g = this.g;
    const cx = W / 2;
    const cy = 400;
    const r = 66;
    g.save();
    g.fillStyle = "rgba(20, 22, 26, 0.85)";
    g.beginPath();
    g.arc(cx, cy, r + 6, 0, Math.PI * 2);
    g.fill();
    g.translate(cx, cy);
    g.save();
    g.rotate((-s.headingDeg * Math.PI) / 180);
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.font = "bold 12px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    for (let d = 0; d < 360; d += 5) {
      const a = (d * Math.PI) / 180;
      const len = d % 10 === 0 ? 9 : 5;
      g.beginPath();
      g.moveTo(Math.sin(a) * r, -Math.cos(a) * r);
      g.lineTo(Math.sin(a) * (r - len), -Math.cos(a) * (r - len));
      g.stroke();
      if (d % 30 === 0) {
        g.save();
        g.rotate(a);
        const label = d === 0 ? "N" : d === 90 ? "E" : d === 180 ? "S" : d === 270 ? "W" : String(d / 10);
        g.fillText(label, 0, -r + 20);
        g.restore();
      }
    }
    // Heading bug.
    g.save();
    g.rotate((bug * Math.PI) / 180);
    g.fillStyle = CYAN;
    g.fillRect(-7, -r - 2, 14, 7);
    g.restore();
    g.restore();
    // Aircraft symbol and lubber line.
    g.fillStyle = WHITE;
    g.beginPath();
    g.moveTo(0, -12);
    g.lineTo(-10, 10);
    g.lineTo(0, 5);
    g.lineTo(10, 10);
    g.closePath();
    g.fill();
    g.restore();
    // Heading box.
    g.save();
    g.fillStyle = "#000";
    g.strokeStyle = WHITE;
    g.fillRect(cx - 26, cy - r - 30, 52, 22);
    g.strokeRect(cx - 26, cy - r - 30, 52, 22);
    g.fillStyle = WHITE;
    g.font = "bold 15px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(`${String(Math.round(s.headingDeg) % 360).padStart(3, "0")}°`, cx, cy - r - 19);
    g.restore();
  }

  private topBar(s: C172State) {
    const g = this.g;
    g.save();
    g.fillStyle = "rgba(0, 0, 0, 0.75)";
    g.fillRect(0, 0, W, 26);
    g.font = "bold 13px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText("GS", 10, 13);
    g.fillStyle = MAGENTA;
    g.fillText(`${Math.round(s.groundSpeedKt)}KT`, 34, 13);
    g.textAlign = "right";
    g.fillStyle = WHITE;
    g.fillText(`OAT ${Math.round(s.oatC)}°C`, W - 10, 13);
    g.restore();
  }

  private bottomBar(s: C172State, c: C172Controls) {
    const g = this.g;
    g.save();
    g.font = "bold 13px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(0, 0, 0, 0.75)";
    g.fillRect(0, 456, 200, 24);
    g.fillRect(W - 200, 456, 200, 24);
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText("HDG", 10, 468);
    g.fillStyle = CYAN;
    g.fillText(`${String(c.hdgBug).padStart(3, "0")}°`, 46, 468);
    g.textAlign = "right";
    g.fillStyle = s.engine.running ? GREEN : WHITE;
    g.fillText(s.engine.running ? "ENGINE RUNNING" : "ENGINE OFF", W - 10, 468);
    g.restore();
    this.drawBaro(c.baro.qnh, c.baro.std);
  }
}

function readout(g: CanvasRenderingContext2D, cx: number, cy: number, w: number, text: string, colour: string) {
  g.save();
  g.fillStyle = "#000";
  g.strokeStyle = WHITE;
  g.lineWidth = 1.5;
  g.fillRect(cx - w / 2, cy - 15, w, 30);
  g.strokeRect(cx - w / 2, cy - 15, w, 30);
  g.fillStyle = colour;
  g.font = "bold 18px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, cx, cy + 1);
  g.restore();
}
