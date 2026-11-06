// Glass MFD for the C172: engine strip on the left (RPM, fuel flow, oil, EGT, fuel quantity,
// electrics) and a heading-up moving map on the right. Our own drawing for training.
// Gauge ranges follow public C172S figures.
import type { C172State } from "../sim/types";
import { bearingDeg, distanceM, M_PER_NM, type LatLon } from "../../world/geo";
import { VIDP } from "../../world/vidp";

const W = 640;
const H = 480;
const STRIP = 168;
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const YELLOW = "#ffd400";
const RED = "#ff3b3b";
const CYAN = "#3fd4ff";
const GREY = "#6b7480";

export class C172Mfd {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  rangeNm = 2;

  /** Show fuel pressure in place of EGT (PA-28). */
  fuelPress = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    this.g = canvas.getContext("2d")!;
    this.g.scale(dpr, dpr);
  }

  draw(s: C172State) {
    const g = this.g;
    g.save();
    g.fillStyle = "#05070a";
    g.fillRect(0, 0, W, H);
    g.textBaseline = "middle";
    this.map(s);
    this.strip(s);
    g.restore();
  }

  private strip(s: C172State) {
    const g = this.g;
    const e = s.engine;
    g.fillStyle = "#11151b";
    g.fillRect(0, 0, STRIP, H);
    g.strokeStyle = "#2a313a";
    g.beginPath();
    g.moveTo(STRIP, 0);
    g.lineTo(STRIP, H);
    g.stroke();
    g.font = "bold 12px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    g.fillStyle = WHITE;
    g.fillText("ENGINE", STRIP / 2, 12);

    // RPM dial: green 2100 to 2700, red line 2700.
    const cx = STRIP / 2;
    const cy = 78;
    const r = 46;
    const a0 = Math.PI * 0.8;
    const a1 = Math.PI * 2.2;
    const ang = (rpm: number) => a0 + (Math.min(3000, Math.max(0, rpm)) / 3000) * (a1 - a0);
    g.lineWidth = 6;
    g.strokeStyle = WHITE;
    g.beginPath();
    g.arc(cx, cy, r, a0, ang(2100));
    g.stroke();
    g.strokeStyle = GREEN;
    g.beginPath();
    g.arc(cx, cy, r, ang(2100), ang(2700));
    g.stroke();
    g.strokeStyle = RED;
    g.beginPath();
    g.arc(cx, cy, r, ang(2700), ang(3000));
    g.stroke();
    g.lineWidth = 2.5;
    g.strokeStyle = WHITE;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(ang(e.rpm)) * (r - 4), cy + Math.sin(ang(e.rpm)) * (r - 4));
    g.stroke();
    g.fillStyle = WHITE;
    g.font = "bold 16px ui-monospace, Menlo, monospace";
    g.fillText(String(Math.round(e.rpm / 10) * 10), cx, cy + 30);
    g.font = "11px ui-monospace, Menlo, monospace";
    g.fillText("RPM", cx, cy + 46);

    let y = 150;
    const bar = (label: string, value: number, text: string, lo: number, hi: number, zones: [number, number, string][]) => {
      g.font = "11px ui-monospace, Menlo, monospace";
      g.textAlign = "left";
      g.fillStyle = WHITE;
      g.fillText(label, 8, y);
      g.textAlign = "right";
      g.font = "bold 12px ui-monospace, Menlo, monospace";
      g.fillText(text, STRIP - 8, y);
      const bx = 8;
      const bw = STRIP - 16;
      const by = y + 10;
      for (const [z0, z1, col] of zones) {
        g.fillStyle = col;
        g.fillRect(bx + ((z0 - lo) / (hi - lo)) * bw, by, ((z1 - z0) / (hi - lo)) * bw, 4);
      }
      const px = bx + (Math.max(lo, Math.min(hi, value)) - lo) / (hi - lo) * bw;
      g.fillStyle = WHITE;
      g.beginPath();
      g.moveTo(px, by - 1);
      g.lineTo(px - 5, by - 8);
      g.lineTo(px + 5, by - 8);
      g.closePath();
      g.fill();
      y += 34;
    };
    bar("FFLOW GPH", e.fuelFlowGph, e.fuelFlowGph.toFixed(1), 0, 20, [[0, 20, GREEN]]);
    bar("OIL PRES", e.oilPressPsi, String(Math.round(e.oilPressPsi)), 0, 120, [
      [0, 20, RED],
      [20, 50, YELLOW],
      [50, 90, GREEN],
      [90, 115, YELLOW],
      [115, 120, RED],
    ]);
    bar("OIL TEMP", e.oilTempF, String(Math.round(e.oilTempF)), 50, 250, [
      [50, 100, YELLOW],
      [100, 245, GREEN],
      [245, 250, RED],
    ]);
    if (this.fuelPress)
      bar("FUEL PRES", s.fuelPressPsi, s.fuelPressPsi.toFixed(1), 0, 10, [
        [0, 0.5, RED],
        [0.5, 8, GREEN],
        [8, 10, RED],
      ]);
    else bar("EGT", e.egtF, String(Math.round(e.egtF)), 600, 1700, [[600, 1700, GREY]]);

    // Fuel quantity, gallons per tank (26 usable).
    g.font = "11px ui-monospace, Menlo, monospace";
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText("FUEL QTY GAL", 8, y);
    y += 14;
    const tank = (label: string, gal: number, row: number) => {
      const bx = 26;
      const bw = STRIP - 70;
      g.fillStyle = WHITE;
      g.textAlign = "left";
      g.fillText(label, 8, row);
      g.fillStyle = "#2a313a";
      g.fillRect(bx, row - 4, bw, 8);
      g.fillStyle = gal < 5 ? RED : GREEN;
      g.fillRect(bx, row - 4, (Math.min(28, gal) / 28) * bw, 8);
      g.textAlign = "right";
      g.fillStyle = WHITE;
      g.fillText(gal.toFixed(0), STRIP - 8, row);
    };
    tank("L", s.fuelGal[0], y);
    tank("R", s.fuelGal[1], y + 16);
    y += 44;

    // Electrics.
    g.fillStyle = WHITE;
    g.textAlign = "left";
    g.fillText("ELECTRICAL", 8, y);
    y += 16;
    const row = (label: string, v1: string, v2: string, warn: boolean) => {
      g.textAlign = "left";
      g.fillStyle = WHITE;
      g.fillText(label, 8, y);
      g.textAlign = "right";
      g.fillStyle = warn ? YELLOW : GREEN;
      g.fillText(v1, STRIP - 60, y);
      g.fillText(v2, STRIP - 8, y);
      y += 16;
    };
    g.textAlign = "right";
    g.fillStyle = GREY;
    g.fillText("M", STRIP - 60, y);
    g.fillText("E/S", STRIP - 8, y);
    y += 14;
    const el = s.elec;
    row("BUS V", el.mainVolts.toFixed(1), el.essVolts.toFixed(1), el.mainVolts < 25);
    row("BATT A", sign(el.mainAmps), sign(el.stbyAmps), el.mainAmps < 0);
  }

  private map(s: C172State) {
    const g = this.g;
    const x0 = STRIP;
    const cx = x0 + (W - x0) / 2;
    const cy = H * 0.66;
    const radius = 190;
    const pxPerNm = radius / this.rangeNm;
    const ac: LatLon = { latDeg: s.latDeg, lonDeg: s.lonDeg };
    const hdg = s.headingDeg;
    const toXY = (p: LatLon) => {
      const d = distanceM(ac, p) / M_PER_NM;
      const rel = ((bearingDeg(ac, p) - hdg) * Math.PI) / 180;
      return { x: cx + Math.sin(rel) * d * pxPerNm, y: cy - Math.cos(rel) * d * pxPerNm };
    };
    g.save();
    g.beginPath();
    g.rect(x0 + 1, 0, W - x0, H);
    g.clip();
    g.fillStyle = "#0d1a12";
    g.fillRect(x0, 0, W - x0, H);
    // Range ring.
    g.strokeStyle = "#2f4a3a";
    g.setLineDash([4, 6]);
    g.beginPath();
    g.arc(cx, cy, radius / 2, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = CYAN;
    g.font = "11px ui-monospace, Menlo, monospace";
    g.textAlign = "left";
    g.fillText(`${this.rangeNm / 2} NM`, cx + radius / 2 + 4, cy);
    // Runways.
    g.strokeStyle = "#c7ccd3";
    g.lineWidth = 5;
    g.lineCap = "butt";
    for (const rwy of VIDP.runways) {
      const a = toXY(rwy.ends[0]);
      const b = toXY(rwy.ends[1]);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    }
    const arp = toXY({ latDeg: 28.5562, lonDeg: 77.1 });
    g.fillStyle = WHITE;
    g.font = "bold 12px ui-monospace, Menlo, monospace";
    g.fillText("VIDP", arp.x + 12, arp.y + 14);
    // Aircraft.
    g.fillStyle = WHITE;
    g.beginPath();
    g.moveTo(cx, cy - 12);
    g.lineTo(cx - 9, cy + 9);
    g.lineTo(cx, cy + 4);
    g.lineTo(cx + 9, cy + 9);
    g.closePath();
    g.fill();
    g.restore();
    // Map header.
    g.save();
    g.fillStyle = "rgba(0, 0, 0, 0.7)";
    g.fillRect(x0, 0, W - x0, 24);
    g.font = "bold 12px ui-monospace, Menlo, monospace";
    g.fillStyle = WHITE;
    g.textAlign = "left";
    g.fillText("MAP · HDG UP", x0 + 10, 12);
    g.textAlign = "right";
    g.fillStyle = CYAN;
    g.fillText(`RANGE ${this.rangeNm} NM`, W - 10, 12);
    g.restore();
  }
}

function sign(v: number) {
  return (v > 0 ? "+" : "") + v.toFixed(0);
}
