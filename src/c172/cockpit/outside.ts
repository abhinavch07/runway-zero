// The view out of the windscreen for the first flight lessons. A light 3D drawing on a 2D canvas,
// with no 3D library: flat fields, runway 28 with its markings and lights, the taxiway, a PAPI,
// sky and haze. Optional guide markers show the training circuit as dots on the ground.
//
// Frame: x along the runway from the threshold, y right of the centreline, z down (metres). The
// camera turns world points into the pilot's view with the usual heading, pitch, roll rotation.
import type { C172State } from "../sim/types";
import { CIRCUIT_PATH, FIELD_FT, PAPI_ANGLES, PAPI_X, RWY_LENGTH_M, RWY_WIDTH_M, TAXI, rwyPos } from "../world";

type V3 = [number, number, number];
const D2R = Math.PI / 180;
const FT = 0.3048;
const NEAR = 0.4;
const HFOV = 74;
/** The pilot looks a little below the nose line, so the horizon sits above the middle. */
const LOOK_DOWN = 5;
/** Eye height above the wheels' contact point, metres. */
const EYE_ON_GROUND = 1.5;

const HALF = RWY_WIDTH_M / 2;

// Field colours: dry grass, wheat, green crop, fallow.
const FIELDS = ["#7d8a4d", "#8f8a55", "#6c7f45", "#857a52", "#768a50", "#9a8e5c"];

function hash(i: number, j: number) {
  let h = (i * 374761393 + j * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Painted runway markings, as rectangles [x1, x2, y1, y2]. */
function markings(): [number, number, number, number][] {
  const r: [number, number, number, number][] = [];
  // Threshold stripes: six each side of the centreline.
  for (let k = 0; k < 6; k++) {
    const c = 2.7 + k * 3.6;
    r.push([6, 36, c - 0.9, c + 0.9], [6, 36, -c - 0.9, -c + 0.9]);
  }
  // Runway number "28", read from the approach: the bottom of each digit is nearest.
  const digit = (segs: string, y0: number) => {
    const w = 4.5;
    const h = 12;
    const t = 1;
    const x0 = 46;
    const S: Record<string, [number, number, number, number]> = {
      a: [x0 + h - t, x0 + h, y0, y0 + w],
      b: [x0 + h / 2, x0 + h, y0 + w - t, y0 + w],
      c: [x0, x0 + h / 2, y0 + w - t, y0 + w],
      d: [x0, x0 + t, y0, y0 + w],
      e: [x0, x0 + h / 2, y0, y0 + t],
      f: [x0 + h / 2, x0 + h, y0, y0 + t],
      g: [x0 + h / 2 - t / 2, x0 + h / 2 + t / 2, y0, y0 + w],
    };
    for (const k of segs) r.push(S[k]);
  };
  digit("abged", -6);
  digit("abcdefg", 1.5);
  // Centreline dashes.
  for (let x = 75; x < RWY_LENGTH_M - 60; x += 50) r.push([x, x + 30, -0.45, 0.45]);
  // Aiming point markings.
  r.push([PAPI_X, PAPI_X + 45, 5, 14], [PAPI_X, PAPI_X + 45, -14, -5]);
  // Touchdown zone bars.
  for (const x of [150, 450, 600]) for (const yc of [8, 11.5]) r.push([x, x + 22, yc - 0.9, yc + 0.9], [x, x + 22, -yc - 0.9, -yc + 0.9]);
  // Edge lines.
  r.push([0, RWY_LENGTH_M, HALF - 1.4, HALF - 0.5], [0, RWY_LENGTH_M, -HALF + 0.5, -HALF + 1.4]);
  return r;
}
const MARKS = markings();

export interface OutsideOptions {
  guides: boolean;
}

export class OutsideView {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private f = 1;
  private cy = 0;
  // Camera
  private cam: V3 = [0, 0, 0];
  private m = new Float64Array(9);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.g = canvas.getContext("2d")!;
  }

  private resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (w !== this.canvas.width || h !== this.canvas.height) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.w = w;
    this.h = h;
    this.f = w / 2 / Math.tan((HFOV / 2) * D2R);
    this.cy = h / 2 - this.f * Math.tan(LOOK_DOWN * D2R);
  }

  /** World point to camera (body) coordinates: x forward, y right, z down. */
  private body(p: V3): V3 {
    const m = this.m;
    const dx = p[0] - this.cam[0];
    const dy = p[1] - this.cam[1];
    const dz = p[2] - this.cam[2];
    return [m[0] * dx + m[1] * dy + m[2] * dz, m[3] * dx + m[4] * dy + m[5] * dz, m[6] * dx + m[7] * dy + m[8] * dz];
  }

  private screen(b: V3): [number, number] {
    return [this.w / 2 + (this.f * b[1]) / b[0], this.cy + (this.f * b[2]) / b[0]];
  }

  /** Draws a flat ground polygon (z = 0), clipped at the near plane. */
  private poly(pts: [number, number][], fill: string, z = 0) {
    const b = pts.map(([x, y]) => this.body([x, y, z]));
    // Sutherland-Hodgman against x > NEAR.
    const out: V3[] = [];
    for (let i = 0; i < b.length; i++) {
      const p = b[i];
      const q = b[(i + 1) % b.length];
      const pin = p[0] > NEAR;
      const qin = q[0] > NEAR;
      if (pin) out.push(p);
      if (pin !== qin) {
        const t = (NEAR - p[0]) / (q[0] - p[0]);
        out.push([NEAR, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
      }
    }
    if (out.length < 3) return;
    const g = this.g;
    g.beginPath();
    out.forEach((p, i) => {
      const [u, v] = this.screen(p);
      if (i === 0) g.moveTo(u, v);
      else g.lineTo(u, v);
    });
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  }

  private rect(r: [number, number, number, number], fill: string) {
    this.poly(
      [
        [r[0], r[2]],
        [r[1], r[2]],
        [r[1], r[3]],
        [r[0], r[3]],
      ],
      fill,
    );
  }

  /** A light: a dot that stays visible far away, with a glow. */
  private light(p: V3, color: string, size = 0.35, maxDist = 9000) {
    const b = this.body(p);
    if (b[0] < 2 || b[0] > maxDist) return;
    const [u, v] = this.screen(b);
    if (u < -20 || u > this.w + 20 || v < -20 || v > this.h + 20) return;
    const r = Math.max(1.3, Math.min(7, (this.f * size) / b[0]));
    const g = this.g;
    g.fillStyle = color;
    g.globalAlpha = 0.35;
    g.beginPath();
    g.arc(u, v, r * 2.2, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.beginPath();
    g.arc(u, v, r, 0, Math.PI * 2);
    g.fill();
  }

  draw(s: C172State, opt: OutsideOptions) {
    this.resize();
    const g = this.g;
    const pos = rwyPos(s);
    const groundHt = Math.max(0, (s.altFt - FIELD_FT) * FT);
    // On the ground the reported height includes the gear: use a fixed eye height there.
    const eye = s.onGround ? EYE_ON_GROUND : Math.max(EYE_ON_GROUND, groundHt - 0.6);
    this.cam = [pos.x, pos.y, -eye];
    const ps = pos.h * D2R;
    const th = s.pitchDeg * D2R;
    const ph = s.rollDeg * D2R;
    const [cps, sps, cth, sth, cph, sph] = [Math.cos(ps), Math.sin(ps), Math.cos(th), Math.sin(th), Math.cos(ph), Math.sin(ph)];
    const m = this.m;
    m[0] = cth * cps;
    m[1] = cth * sps;
    m[2] = -sth;
    m[3] = sph * sth * cps - cph * sps;
    m[4] = sph * sth * sps + cph * cps;
    m[5] = sph * cth;
    m[6] = cph * sth * cps + sph * sps;
    m[7] = cph * sth * sps - sph * cps;
    m[8] = cph * cth;

    // Sky: a gradient that follows the horizon as the aircraft rolls.
    const hz = this.horizon();
    g.save();
    g.translate(hz.u, hz.v);
    g.rotate(hz.angle);
    const big = Math.hypot(this.w, this.h) * 2;
    const sky = g.createLinearGradient(0, -this.h * 1.2, 0, 0);
    sky.addColorStop(0, "#3d77b8");
    sky.addColorStop(0.75, "#8db8de");
    sky.addColorStop(1, "#d6e3ea");
    g.fillStyle = sky;
    g.fillRect(-big, -big, big * 2, big);
    g.fillStyle = "#cfd8d6";
    g.fillRect(-big, 0, big * 2, big);
    g.restore();

    // Ground: far haze band, then nearer plain ground, then fields.
    const cx = pos.x;
    const cy = pos.y;
    const sq = (r: number): [number, number][] => [
      [cx - r, cy - r],
      [cx + r, cy - r],
      [cx + r, cy + r],
      [cx - r, cy + r],
    ];
    this.poly(sq(60000), "#a8ad98");
    this.poly(sq(14000), "#8f9a6e");
    const CELL = 420;
    const n = 11;
    const ci = Math.floor(cx / CELL);
    const cj = Math.floor(cy / CELL);
    for (let i = ci - n; i <= ci + n; i++) {
      for (let j = cj - n; j <= cj + n; j++) {
        const r = hash(i, j);
        if (r < 0.3) continue;
        const x0 = i * CELL;
        const y0 = j * CELL;
        // Leave a clear strip around the runway and taxiway.
        if (x0 + CELL > -400 && x0 < RWY_LENGTH_M + 400 && y0 + CELL > -260 && y0 < 160) continue;
        const inset = 8 + r * 20;
        this.poly(
          [
            [x0 + inset, y0 + inset],
            [x0 + CELL - inset, y0 + inset],
            [x0 + CELL - inset, y0 + CELL - inset],
            [x0 + inset, y0 + CELL - inset],
          ],
          FIELDS[Math.floor(r * 997) % FIELDS.length],
        );
      }
    }
    // Airfield grass, mown.
    this.poly(
      [
        [-400, -260],
        [RWY_LENGTH_M + 400, -260],
        [RWY_LENGTH_M + 400, 160],
        [-400, 160],
      ],
      "#7f9455",
    );

    // Taxiway and apron.
    const tw = TAXI.width / 2;
    this.rect([TAXI.x - tw, TAXI.x + tw, TAXI.apronY, -HALF], "#5d6064");
    this.rect([TAXI.x - 70, TAXI.x + 70, TAXI.apronY - 90, TAXI.apronY], "#62656a");
    // Runway.
    this.rect([-60, RWY_LENGTH_M + 60, -HALF - 1, HALF + 1], "#4a4d52");
    this.rect([0, RWY_LENGTH_M, -HALF, HALF], "#3f4247");
    for (const r of MARKS) this.rect(r, "#e9e9e4");
    // Taxiway centreline and the holding point lines (yellow).
    this.rect([TAXI.x - 0.2, TAXI.x + 0.2, TAXI.apronY, -HALF], "#e3b72e");
    this.rect([TAXI.x - tw, TAXI.x + tw, TAXI.holdY - 0.3, TAXI.holdY + 0.3], "#e3b72e");
    this.rect([TAXI.x - tw, TAXI.x + tw, TAXI.holdY - 1.6, TAXI.holdY - 1.0], "#e3b72e");

    // Guide markers: the circuit as dots on the ground.
    if (opt.guides) this.guides();

    // Lights.
    for (let x = 0; x <= RWY_LENGTH_M; x += 60) {
      const col = x > RWY_LENGTH_M - 600 ? "#ffcf5a" : "#fff6dc";
      this.light([x, HALF + 1.5, -0.4], col);
      this.light([x, -HALF - 1.5, -0.4], col);
    }
    for (let y = -HALF; y <= HALF; y += 3) {
      this.light([-1, y, -0.3], "#3dff6a", 0.3);
      this.light([RWY_LENGTH_M + 1, y, -0.3], "#ff3b30", 0.3);
    }
    // PAPI: four units left of the runway. Each shows white above its angle and red below.
    for (let i = 0; i < 4; i++) {
      const y = -HALF - 15 - i * 9;
      const dx = Math.max(1, Math.hypot(pos.x - PAPI_X, pos.y - y));
      const angle = Math.atan2(eye - 0.5, dx) / D2R;
      const white = pos.x < PAPI_X && angle > PAPI_ANGLES[i];
      this.light([PAPI_X, y, -0.6], white ? "#ffffff" : "#ff2a1a", 0.9, 12000);
    }

    this.cowling(s);
  }

  /** Where the horizon crosses the middle of the view, and its angle on the screen. */
  private horizon() {
    // Two far points level with the eye, ahead to the left and right.
    const hdg = Math.atan2(this.m[1], this.m[0]);
    const far = 1e6;
    const pt = (a: number): V3 => [this.cam[0] + Math.cos(hdg + a) * far, this.cam[1] + Math.sin(hdg + a) * far, this.cam[2]];
    const a = this.body(pt(-0.5));
    const b = this.body(pt(0.5));
    const [u1, v1] = this.screen(a);
    const [u2, v2] = this.screen(b);
    const angle = Math.atan2(v2 - v1, u2 - u1);
    // Point on the line below the screen centre.
    const t = (this.w / 2 - u1) / (u2 - u1 || 1e-6);
    return { u: this.w / 2, v: v1 + (v2 - v1) * t, angle };
  }

  private guides() {
    const g = this.g;
    g.fillStyle = "#ff3df2";
    for (let k = 0; k < CIRCUIT_PATH.length - 1; k++) {
      const [x1, y1] = CIRCUIT_PATH[k];
      const [x2, y2] = CIRCUIT_PATH[k + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const step = 60;
      for (let d = 0; d < len; d += step) {
        const x = x1 + ((x2 - x1) * d) / len;
        const y = y1 + ((y2 - y1) * d) / len;
        // Skip the dots on the runway itself.
        if (x > -30 && x < RWY_LENGTH_M + 30 && Math.abs(y) < HALF + 5) continue;
        const b = this.body([x, y, -0.5]);
        if (b[0] < 3 || b[0] > 9000) continue;
        const [u, v] = this.screen(b);
        if (u < -10 || u > this.w + 10 || v < -10 || v > this.h + 10) continue;
        const r = Math.max(1.6, Math.min(9, (this.f * (d % 300 === 0 ? 7 : 4)) / b[0]));
        g.beginPath();
        g.arc(u, v, r, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  /** The top of the instrument panel and the engine cowling, fixed in the view. */
  private cowling(s: C172State) {
    const g = this.g;
    const w = this.w;
    const h = this.h;
    // Engine vibration: a tiny shake that grows with RPM.
    const shake = s.engine.running ? (Math.random() - 0.5) * (s.engine.rpm / 2700) * 1.2 : 0;
    g.save();
    g.translate(0, shake);
    g.fillStyle = "#e9ebee";
    g.beginPath();
    g.moveTo(w * 0.26, h);
    g.bezierCurveTo(w * 0.32, h * 0.9, w * 0.4, h * 0.87, w * 0.5, h * 0.87);
    g.bezierCurveTo(w * 0.6, h * 0.87, w * 0.68, h * 0.9, w * 0.74, h);
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(w * 0.49, h * 0.875, w * 0.02, h * 0.13);
    // Glareshield.
    g.fillStyle = "#1b1d21";
    g.beginPath();
    g.moveTo(0, h * 0.94);
    g.quadraticCurveTo(w * 0.5, h * 0.9, w, h * 0.94);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.closePath();
    g.fill();
    // Windscreen posts.
    g.fillStyle = "#22252a";
    g.fillRect(0, 0, w * 0.012, h);
    g.fillRect(w * 0.988, 0, w * 0.012, h);
    g.restore();
  }
}
