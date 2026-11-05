// Navigation display, ARC mode, heading up. Shows the VIDP runways, the training ILS 28 course,
// the selected heading, the track and range rings. R1 has no flight plan yet.
import type { SimState } from "../sim/types";
import { bearingDeg, distanceM, M_PER_NM, type LatLon } from "../world/geo";
import { ILS_28, VIDP, rwy28Final } from "../world/vidp";

const SIZE = 420;
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const CYAN = "#3fd4ff";
const MAGENTA = "#ff4bd8";
const YELLOW = "#ffd400";
const GREY = "#8a8f98";
export const ND_RANGES = [5, 10, 20, 40, 80];

export class Nd {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  rangeNm = 10;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.scale(dpr, dpr);
  }

  changeRange(step: number) {
    const i = ND_RANGES.indexOf(this.rangeNm);
    this.rangeNm = ND_RANGES[Math.max(0, Math.min(ND_RANGES.length - 1, i + step))];
  }

  draw(s: SimState) {
    const g = this.ctx;
    const cx = SIZE / 2;
    const cy = 340; // aircraft symbol position
    const radius = 290; // pixels for the full range
    const pxPerNm = radius / this.rangeNm;
    const ac: LatLon = { latDeg: s.latDeg, lonDeg: s.lonDeg };
    const hdg = s.headingDeg;
    const toXY = (p: LatLon) => {
      const d = distanceM(ac, p) / M_PER_NM;
      const rel = ((bearingDeg(ac, p) - hdg) * Math.PI) / 180;
      return { x: cx + Math.sin(rel) * d * pxPerNm, y: cy - Math.cos(rel) * d * pxPerNm, d };
    };

    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, SIZE);
    g.font = "13px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";

    // Everything inside the arc is clipped to it.
    g.save();
    g.beginPath();
    g.rect(0, 30, SIZE, cy + 60);
    g.clip();

    // Range rings.
    g.strokeStyle = GREY;
    g.lineWidth = 1;
    g.setLineDash([4, 6]);
    g.beginPath();
    g.arc(cx, cy, radius / 2, Math.PI, 2 * Math.PI);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = CYAN;
    g.textAlign = "right";
    g.fillText(String(this.rangeNm / 2), cx - radius / 2 + 2, cy - 10);

    // ILS 28 course: magenta line from 15 NM out to the threshold.
    const far = toXY(rwy28Final(15));
    const thr = toXY(ILS_28.threshold);
    g.strokeStyle = MAGENTA;
    g.lineWidth = 2;
    g.setLineDash([10, 6]);
    g.beginPath();
    g.moveTo(far.x, far.y);
    g.lineTo(thr.x, thr.y);
    g.stroke();
    g.setLineDash([]);

    // Runways.
    g.strokeStyle = WHITE;
    g.lineWidth = 3;
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
    g.textAlign = "left";
    g.fillText("VIDP", arp.x + 14, arp.y + 16);
    g.restore();

    // Compass arc with ticks every 5 degrees, numbers every 30.
    g.save();
    g.translate(cx, cy);
    g.strokeStyle = WHITE;
    g.fillStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, radius, Math.PI * 1.17, Math.PI * 1.83);
    g.stroke();
    g.textAlign = "center";
    for (let d = -60; d <= 60; d++) {
      const brg = Math.round(hdg) + d;
      if (brg % 5 !== 0) continue;
      const rel = ((brg - hdg) * Math.PI) / 180;
      if (Math.abs(rel) > 1.06) continue;
      const len = brg % 10 === 0 ? 12 : 6;
      const sx = Math.sin(rel);
      const sy = -Math.cos(rel);
      g.beginPath();
      g.moveTo(sx * radius, sy * radius);
      g.lineTo(sx * (radius - len), sy * (radius - len));
      g.stroke();
      if (brg % 30 === 0) {
        const label = String((((brg % 360) + 360) % 360) / 10);
        g.fillText(label, sx * (radius - 26), sy * (radius - 26));
      }
    }
    // Selected heading bug (cyan).
    const bugRel = (((s.fcc.fcu.hdg - hdg + 540) % 360) - 180) * (Math.PI / 180);
    if (Math.abs(bugRel) < 1.06) {
      g.save();
      g.rotate(bugRel);
      g.fillStyle = CYAN;
      g.beginPath();
      g.moveTo(0, -radius);
      g.lineTo(-7, -radius - 12);
      g.lineTo(7, -radius - 12);
      g.closePath();
      g.fill();
      g.restore();
    }
    // Track diamond (green) and track line.
    const trkRel = ((((s.trackDeg - hdg + 540) % 360) - 180) * Math.PI) / 180;
    if (s.groundSpeedKt > 30) {
      g.save();
      g.rotate(trkRel);
      g.fillStyle = GREEN;
      g.beginPath();
      g.moveTo(0, -radius + 2);
      g.lineTo(-6, -radius + 10);
      g.lineTo(0, -radius + 18);
      g.lineTo(6, -radius + 10);
      g.closePath();
      g.fill();
      g.restore();
    }
    // Lubber line and aircraft symbol (yellow).
    g.fillStyle = YELLOW;
    g.fillRect(-1.5, -radius - 18, 3, 16);
    g.strokeStyle = YELLOW;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, -14);
    g.lineTo(0, 22);
    g.moveTo(-18, 0);
    g.lineTo(18, 0);
    g.moveTo(-7, 18);
    g.lineTo(7, 18);
    g.stroke();
    g.restore();

    // Corner data.
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText("GS", 10, 16);
    g.fillStyle = GREEN;
    g.fillText(String(Math.round(s.groundSpeedKt)), 34, 16);
    g.fillStyle = WHITE;
    g.fillText("TAS", 74, 16);
    g.fillStyle = GREEN;
    g.fillText(String(Math.round(s.kias * (1 + s.altFt / 1000 * 0.02))), 106, 16);
    const ils = s.fcc.ils;
    g.textAlign = "right";
    g.fillStyle = MAGENTA;
    g.fillText("ILS 28 TRAINING", SIZE - 10, 16);
    g.fillStyle = WHITE;
    g.fillText(`CRS ${Math.round(ILS_28.courseT)}°T`, SIZE - 10, 34);
    if (ils.valid) g.fillText(`${Math.max(0, ils.distThrNm).toFixed(1)} NM`, SIZE - 10, 52);
    g.fillStyle = CYAN;
    g.textAlign = "left";
    g.fillText(`RANGE ${this.rangeNm}`, 10, SIZE - 14);
    g.restore();
  }
}
