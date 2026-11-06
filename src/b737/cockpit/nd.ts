// 737-type navigation display: MAP mode (heading up, the FMC route in magenta), VOR and APP modes
// (a full compass rose with the course pointer and deviation bar). Our own drawing in the general
// style of the type, not a copy of the real display.
import type { State737 } from "../sim/types";
import type { NavReading } from "../../radio/navReceiver";
import { AIRPORTS, WAYPOINTS } from "../../world/route";
import { bearingDeg, distanceM, M_PER_NM, type LatLon } from "../../world/geo";
import { freqText } from "../../radio/training";
import type { Fms737 } from "./cdu";

const W = 500;
const H = 500;
const GREEN = "#3ef03e";
const MAGENTA = "#ff4dff";
const WHITE = "#f2f2f2";
const CYAN = "#4fd8ff";
const FONT = "ui-monospace, Menlo, monospace";
export const ND_RANGES = [5, 10, 20, 40, 80, 160];
export type NdMode = "MAP" | "VOR" | "APP";

export class Nd737 {
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

  draw(s: State737, mode: NdMode, rangeNm: number, fms: Fms737, nav: NavReading, navFreq: number, crs: number) {
    const g = this.g;
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
    this.text(`GS${Math.round(s.groundSpeedKt)}`, 10, 16, WHITE, 14, "left");
    this.text(`TAS${Math.round(s.kias * (1 + s.altFt / 60000))}`, 80, 16, WHITE, 12, "left");
    if (mode === "MAP") this.map(s, rangeNm, fms);
    else this.rose(s, mode, nav, navFreq, crs);
  }

  private map(s: State737, rangeNm: number, fms: Fms737) {
    const g = this.g;
    const ax = 250;
    const ay = 410;
    const R = 340;
    const ppn = R / rangeNm;
    const hdg = s.headingDeg;
    // Compass arc.
    g.save();
    g.beginPath();
    g.rect(0, 30, W, H - 30);
    g.clip();
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(ax, ay, R, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
    for (let d = 0; d < 360; d += 5) {
      const rel = ((d - hdg + 540) % 360) - 180;
      if (Math.abs(rel) > 60) continue;
      const a = ((rel - 90) * Math.PI) / 180;
      const len = d % 10 === 0 ? 12 : 6;
      g.beginPath();
      g.moveTo(ax + Math.cos(a) * R, ay + Math.sin(a) * R);
      g.lineTo(ax + Math.cos(a) * (R - len), ay + Math.sin(a) * (R - len));
      g.stroke();
      if (d % 30 === 0) this.text(String(d / 10), ax + Math.cos(a) * (R - 24), ay + Math.sin(a) * (R - 24), WHITE, 13);
    }
    // Half range ring.
    g.setLineDash([4, 6]);
    g.beginPath();
    g.arc(ax, ay, R / 2, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
    g.setLineDash([]);
    this.text(String(rangeNm / 2), ax - R / 2 * 0.95, ay - 40, WHITE, 11);
    // Selected heading.
    const hrel = ((s.afcs.mcp.hdg - hdg + 540) % 360) - 180;
    if (Math.abs(hrel) < 60) {
      const a = ((hrel - 90) * Math.PI) / 180;
      g.strokeStyle = MAGENTA;
      g.setLineDash([6, 6]);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(ax + Math.cos(a) * R, ay + Math.sin(a) * R);
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 2;
      g.strokeRect(ax + Math.cos(a) * R - 7, ay + Math.sin(a) * R - 4, 14, 8);
    }
    // Points on the map.
    const toXY = (p: LatLon) => {
      const d = distanceM(s, p) / M_PER_NM;
      const b = ((bearingDeg(s, p) - hdg) * Math.PI) / 180;
      return { x: ax + Math.sin(b) * d * ppn, y: ay - Math.cos(b) * d * ppn };
    };
    for (const [icao, ap] of Object.entries(AIRPORTS)) {
      const p = toXY(ap);
      g.strokeStyle = CYAN;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(p.x, p.y, 6, 0, Math.PI * 2);
      g.stroke();
      this.text(icao, p.x + 10, p.y - 10, CYAN, 12, "left");
    }
    // The route: magenta when active, dashed white while it is being changed.
    const names = fms.via.filter((n) => WAYPOINTS[n]);
    const pts: { name: string; p: LatLon }[] = [];
    if (AIRPORTS[fms.origin]) pts.push({ name: "", p: AIRPORTS[fms.origin] });
    for (const n of names) pts.push({ name: n, p: WAYPOINTS[n] });
    if (AIRPORTS[fms.dest]) pts.push({ name: "", p: AIRPORTS[fms.dest] });
    if (pts.length > 1) {
      const live = fms.active && !fms.pending;
      g.strokeStyle = live ? MAGENTA : WHITE;
      g.setLineDash(live ? [] : [8, 6]);
      g.lineWidth = 2;
      g.beginPath();
      pts.forEach((q, i) => {
        const p = toXY(q.p);
        if (i) g.lineTo(p.x, p.y);
        else g.moveTo(p.x, p.y);
      });
      g.stroke();
      g.setLineDash([]);
    }
    for (const q of pts) {
      if (!q.name) continue;
      const p = toXY(q.p);
      const activeWpt = s.afcs.route[s.afcs.activeWpt]?.name === q.name;
      g.strokeStyle = activeWpt ? MAGENTA : WHITE;
      g.lineWidth = 2;
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        g.moveTo(p.x, p.y);
        g.lineTo(p.x + Math.cos(a) * 8, p.y + Math.sin(a) * 8);
      }
      g.stroke();
      this.text(q.name, p.x + 10, p.y - 10, activeWpt ? MAGENTA : WHITE, 12, "left");
    }
    g.restore();
    // Aircraft symbol.
    g.strokeStyle = WHITE;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(ax, ay - 16);
    g.lineTo(ax - 10, ay + 10);
    g.lineTo(ax + 10, ay + 10);
    g.closePath();
    g.stroke();
    // Heading box.
    g.fillStyle = "#000";
    g.fillRect(ax - 44, 34, 88, 26);
    g.strokeStyle = WHITE;
    g.strokeRect(ax - 44, 34, 88, 26);
    this.text(`HDG ${String(Math.round(hdg) % 360).padStart(3, "0")}`, ax, 47, GREEN, 15);
    // Active waypoint and distance.
    const wp = s.afcs.route[s.afcs.activeWpt];
    if (wp && fms.active) {
      this.text(wp.name, 490, 16, MAGENTA, 15, "right");
      this.text(`${(distanceM(s, wp) / M_PER_NM).toFixed(1)}NM`, 490, 36, WHITE, 13, "right");
    }
    this.text(String(rangeNm), 18, ay - R / 2 - 10, WHITE, 11, "left");
    this.text("MAP", 490, 486, GREEN, 13, "right");
  }

  private rose(s: State737, mode: NdMode, n: NavReading, navFreq: number, crs: number) {
    const g = this.g;
    const cx = 250;
    const cy = 270;
    const R = 170;
    const hdg = s.headingDeg;
    g.save();
    g.translate(cx, cy);
    g.rotate((-hdg * Math.PI) / 180);
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    for (let d = 0; d < 360; d += 5) {
      g.save();
      g.rotate((d * Math.PI) / 180);
      g.beginPath();
      g.moveTo(0, -R);
      g.lineTo(0, -R + (d % 10 === 0 ? 12 : 6));
      g.stroke();
      if (d % 30 === 0) {
        g.font = `14px ${FONT}`;
        g.fillStyle = WHITE;
        g.textAlign = "center";
        g.fillText(String(d / 10), 0, -R + 28);
      }
      g.restore();
    }
    // Course pointer and deviation bar.
    g.rotate((crs * Math.PI) / 180);
    g.strokeStyle = MAGENTA;
    g.fillStyle = MAGENTA;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, -R + 10);
    g.lineTo(0, -60);
    g.moveTo(0, 60);
    g.lineTo(0, R - 10);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -R + 4);
    g.lineTo(-9, -R + 22);
    g.lineTo(9, -R + 22);
    g.closePath();
    g.fill();
    g.strokeStyle = WHITE;
    g.lineWidth = 1.5;
    for (const d of [-2, -1, 1, 2]) {
      g.beginPath();
      g.arc(d * 40, 0, 4, 0, Math.PI * 2);
      g.stroke();
    }
    if (n.valid) {
      const dx = Math.max(-1, Math.min(1, n.dev)) * 80;
      g.strokeStyle = MAGENTA;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(dx, -56);
      g.lineTo(dx, 56);
      g.stroke();
      if (n.toFrom) {
        g.fillStyle = WHITE;
        g.beginPath();
        const y = n.toFrom === "TO" ? -40 : 40;
        const tip = n.toFrom === "TO" ? -14 : 14;
        g.moveTo(0, y + tip);
        g.lineTo(-9, y);
        g.lineTo(9, y);
        g.closePath();
        g.fill();
      }
    }
    g.restore();
    // Aircraft at the centre.
    g.strokeStyle = WHITE;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx, cy - 22);
    g.lineTo(cx, cy + 18);
    g.moveTo(cx - 16, cy - 4);
    g.lineTo(cx + 16, cy - 4);
    g.moveTo(cx - 7, cy + 14);
    g.lineTo(cx + 7, cy + 14);
    g.stroke();
    // Lubber line and heading.
    g.fillStyle = "#000";
    g.fillRect(cx - 44, 46, 88, 26);
    g.strokeStyle = WHITE;
    g.strokeRect(cx - 44, 46, 88, 26);
    this.text(`HDG ${String(Math.round(hdg) % 360).padStart(3, "0")}`, cx, 59, GREEN, 15);
    // Station information.
    const label = mode === "APP" ? "ILS 1" : "VOR 1";
    this.text(`${label}  ${freqText(navFreq, 2)}`, 490, 16, WHITE, 14, "right");
    this.text(`CRS ${String(crs).padStart(3, "0")}`, 490, 36, MAGENTA, 14, "right");
    if (n.valid) {
      this.text(n.station!.ident, 490, 56, GREEN, 14, "right");
      if (n.distNm !== null) this.text(`DME ${n.distNm.toFixed(1)}`, 490, 76, WHITE, 13, "right");
    } else {
      this.text(n.station ? "NO SIGNAL" : "", 490, 56, "#ffb000", 13, "right");
    }
    if (mode === "VOR" && n.valid && n.toFrom) this.text(n.toFrom, cx + 120, cy + 60, WHITE, 15);
    if (mode === "APP" && n.valid && n.gs !== null) {
      g.strokeStyle = WHITE;
      for (const d of [-2, -1, 1, 2]) {
        g.beginPath();
        g.arc(470, cy + d * 40, 4, 0, Math.PI * 2);
        g.stroke();
      }
      const gy = cy - Math.max(-1, Math.min(1, n.gs)) * 80;
      g.fillStyle = MAGENTA;
      g.beginPath();
      g.moveTo(470, gy - 8);
      g.lineTo(478, gy);
      g.lineTo(470, gy + 8);
      g.lineTo(462, gy);
      g.closePath();
      g.fill();
    }
    this.text(mode, 490, 486, GREEN, 13, "right");
  }
}
