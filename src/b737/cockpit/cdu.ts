// 737-type CDU (the FMC keyboard and screen), with a small set of pages for the pre-flight:
// IDENT, POS INIT, RTE 1 and 2, PERF INIT and TAKEOFF REF. Simplified from public descriptions of
// how a 737 FMC is set up. Not the real software. Route entries need ACTIVATE and EXEC.
import { AIRPORTS, WAYPOINTS } from "../../world/route.ts";
import type { LatLon } from "../../world/geo.ts";

export type CduPage = "IDENT" | "POS" | "RTE1" | "RTE2" | "PERF" | "TO";

export interface Fms737 {
  refAirport: string;
  irsPosSet: boolean;
  origin: string;
  dest: string;
  runway: string;
  fltNo: string;
  /** Waypoints flown DIRECT one after the other. */
  via: string[];
  /** The route has been activated with ACTIVATE (EXEC still needed). */
  activated: boolean;
  /** The route is active (EXEC pressed). */
  active: boolean;
  /** Changes waiting for EXEC. */
  pending: boolean;
  zfwT: number;
  reservesT: number;
  costIndex: number;
  crzAltFt: number;
  toFlaps: number;
  vSel: [boolean, boolean, boolean];
}

export function emptyFms737(): Fms737 {
  return {
    refAirport: "",
    irsPosSet: false,
    origin: "",
    dest: "",
    runway: "",
    fltNo: "",
    via: [],
    activated: false,
    active: false,
    pending: false,
    zfwT: 0,
    reservesT: 0,
    costIndex: -1,
    crzAltFt: 0,
    toFlaps: 0,
    vSel: [false, false, false],
  };
}

/** A completed set-up, for lessons that start with the FMC done. */
export function readyFms737(): Fms737 {
  return {
    refAirport: "VIDP",
    irsPosSet: true,
    origin: "VIDP",
    dest: "VABB",
    runway: "28",
    fltNo: "RZ456",
    via: ["RZ101", "RZ102", "RZ103"],
    activated: true,
    active: true,
    pending: false,
    zfwT: 55,
    reservesT: 2.5,
    costIndex: 30,
    crzAltFt: 35000,
    toFlaps: 5,
    vSel: [true, true, true],
  };
}

/** Take-off speeds for training: a simple rule from the gross weight, not real performance data. */
export function vSpeeds(gwT: number, flaps: number): [number, number, number] {
  const v1 = Math.round(118 + (gwT - 60) * 1.4 - (flaps - 5) * 0.8);
  return [v1, v1 + 3, v1 + 9];
}

/** The route as points for LNAV: the waypoints, then the destination. */
export function routePoints(f: Fms737): (LatLon & { name: string })[] {
  const pts = f.via.map((n) => ({ name: n, ...WAYPOINTS[n] }));
  const d = AIRPORTS[f.dest];
  if (d) pts.push({ name: f.dest, latDeg: d.latDeg, lonDeg: d.lonDeg });
  return pts;
}

const fmtLat = (v: number) => `${v >= 0 ? "N" : "S"}${String(Math.floor(Math.abs(v))).padStart(2, "0")}°${((Math.abs(v) % 1) * 60).toFixed(1).padStart(4, "0")}`;
const fmtLon = (v: number) => `${v >= 0 ? "E" : "W"}${String(Math.floor(Math.abs(v))).padStart(3, "0")}°${((Math.abs(v) % 1) * 60).toFixed(1).padStart(4, "0")}`;
const fmtPos = (p: LatLon) => `${fmtLat(p.latDeg)} ${fmtLon(p.lonDeg)}`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const BOX = (n: number) => "□".repeat(n);

interface Cell {
  text: string;
  /** small: smaller font. dim: shown but not entered yet. */
  small?: boolean;
  colour?: "w" | "g" | "c" | "m";
}
interface Row {
  lLabel?: string;
  rLabel?: string;
  l?: Cell;
  r?: Cell;
  c?: Cell;
}

export class Cdu737 {
  readonly el: HTMLElement;
  page: CduPage = "IDENT";
  fms: Fms737 = emptyFms737();
  scratch = "";
  private message = "";
  private powered = false;
  /** Aircraft position and fuel, from the page every frame. */
  pos: LatLon = { latDeg: 0, lonDeg: 0 };
  fuelKg = 0;
  /** Called when the active route changes (EXEC). */
  onRoute?: () => void;
  private screen: HTMLElement;
  private execBtn: HTMLElement;
  private lastHtml = "";

  constructor(parent: HTMLElement) {
    this.el = document.createElement("div");
    this.el.id = "cdu";
    const lsk = (side: "L" | "R") =>
      `<div class="cdu-lsks">${[1, 2, 3, 4, 5, 6].map((n) => `<button data-lsk="${side}${n}" data-ctl="cdu-${side}${n}"></button>`).join("")}</div>`;
    const fn = (k: string, label: string) => `<button data-key="${k}" data-ctl="cdu-${k}">${label}</button>`;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    this.el.innerHTML = `
      <div class="cdu-top">${lsk("L")}<div class="cdu-screen"></div>${lsk("R")}</div>
      <div class="cdu-fns">
        ${fn("INITREF", "INIT<br>REF")}${fn("RTE", "RTE")}${fn("CLB", "CLB")}${fn("CRZ", "CRZ")}${fn("DES", "DES")}
        ${fn("MENU", "MENU")}${fn("LEGS", "LEGS")}${fn("DEPARR", "DEP<br>ARR")}${fn("HOLD", "HOLD")}${fn("PROG", "PROG")}
        <button data-key="EXEC" data-ctl="cdu-EXEC" class="cdu-exec">EXEC<i></i></button>
        ${fn("N1", "N1<br>LIMIT")}${fn("FIX", "FIX")}${fn("PREV", "PREV<br>PAGE")}${fn("NEXT", "NEXT<br>PAGE")}
      </div>
      <div class="cdu-keys">
        <div class="cdu-nums">${["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "+/-"].map((k) => `<button data-key="${k}">${k}</button>`).join("")}</div>
        <div class="cdu-letters">${[...letters, "SP", "DEL", "/", "CLR"]
          .map((k) => `<button data-key="${k}"${k === "CLR" ? ' data-ctl="cdu-CLR" class="clr"' : ""}>${k}</button>`)
          .join("")}</div>
      </div>`;
    parent.appendChild(this.el);
    this.screen = this.el.querySelector(".cdu-screen")!;
    this.execBtn = this.el.querySelector(".cdu-exec")!;
    this.el.querySelectorAll<HTMLElement>("[data-key]").forEach((b) =>
      b.addEventListener("click", () => {
        this.key(b.dataset.key!);
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-lsk]").forEach((b) =>
      b.addEventListener("click", () => {
        this.lsk(b.dataset.lsk!);
        b.blur();
      }),
    );
  }

  reset(fms: Fms737) {
    this.fms = structuredClone(fms);
    this.page = "IDENT";
    this.scratch = "";
    this.message = "";
    this.lastHtml = "";
  }

  setPowered(on: boolean) {
    if (on === this.powered) return;
    this.powered = on;
    this.el.classList.toggle("unpowered", !on);
    this.lastHtml = "";
  }

  private msg(m: string) {
    this.message = m;
  }

  key(k: string) {
    if (!this.powered) return;
    if (this.message) {
      this.message = "";
      if (k === "CLR") return;
    }
    switch (k) {
      case "INITREF":
        this.page = this.fms.irsPosSet ? "POS" : "IDENT";
        return;
      case "RTE":
        this.page = "RTE1";
        return;
      case "N1":
      case "CLB":
        this.page = "PERF";
        return;
      case "NEXT":
        this.page = this.page === "RTE1" ? "RTE2" : this.page === "RTE2" ? "RTE1" : this.page;
        return;
      case "PREV":
        this.page = this.page === "RTE2" ? "RTE1" : this.page === "RTE1" ? "RTE2" : this.page;
        return;
      case "EXEC":
        if (this.fms.pending && this.fms.activated) {
          this.fms.pending = false;
          this.fms.active = true;
          this.onRoute?.();
        }
        return;
      case "CLR":
        this.scratch = this.scratch.slice(0, -1);
        return;
      case "DEL":
        this.scratch = "DELETE";
        return;
      case "SP":
        this.scratch += " ";
        return;
      case "+/-":
        this.scratch = this.scratch.endsWith("-") ? this.scratch.slice(0, -1) + "+" : this.scratch + "-";
        return;
    }
    if (k.length === 1 && this.scratch.length < 22) this.scratch += k;
  }

  /** A line select key. With text in the scratchpad it enters it, otherwise it acts on the line. */
  lsk(id: string) {
    if (!this.powered) return;
    const f = this.fms;
    const sp = this.scratch.trim();
    const take = () => (this.scratch = "");
    const routeChanged = () => {
      f.pending = true;
    };
    switch (`${this.page}-${id}`) {
      case "IDENT-R6":
      case "TO-L6":
        this.page = "POS";
        return;
      case "POS-L2":
        if (!sp) return;
        if (!AIRPORTS[sp]) return this.msg("NOT IN DATA BASE");
        f.refAirport = sp;
        take();
        return;
      case "POS-R4":
        // GPS POS copied to the scratchpad, then put in SET IRS POS.
        if (!sp) {
          this.scratch = fmtPos(this.pos);
          return;
        }
        if (sp !== fmtPos(this.pos) && !/^[NS]\d/.test(sp)) return this.msg("INVALID ENTRY");
        return this.msg("USE SET IRS POS LINE");
      case "POS-R5":
        if (!sp) return;
        if (!/^[NS]\d/.test(sp)) return this.msg("INVALID ENTRY");
        f.irsPosSet = true;
        take();
        return;
      case "POS-R6":
        this.page = "RTE1";
        return;
      case "RTE1-L1":
        if (!sp) return;
        if (!AIRPORTS[sp]) return this.msg("NOT IN DATA BASE");
        f.origin = sp;
        f.runway = "";
        take();
        routeChanged();
        return;
      case "RTE1-R1":
        if (!sp) return;
        if (!AIRPORTS[sp]) return this.msg("NOT IN DATA BASE");
        f.dest = sp;
        take();
        routeChanged();
        return;
      case "RTE1-L2": {
        if (!sp) return;
        const rw = sp.replace(/^RW/, "");
        if (!f.origin) return this.msg("ENTER ORIGIN FIRST");
        if (!AIRPORTS[f.origin].runways.some((r) => r.ident === rw)) return this.msg("NOT IN DATA BASE");
        f.runway = rw;
        take();
        routeChanged();
        return;
      }
      case "RTE1-R2":
        if (!sp) return;
        if (sp.length > 8) return this.msg("INVALID ENTRY");
        f.fltNo = sp;
        take();
        return;
      case "RTE1-R6":
      case "RTE2-R6":
        if (f.active && !f.pending) {
          this.page = "PERF";
          return;
        }
        if (!f.origin || !f.dest || !f.via.length) return this.msg("ROUTE INCOMPLETE");
        f.activated = true;
        f.pending = true;
        return;
    }
    if (this.page === "RTE2" && id.startsWith("R") && id !== "R6") {
      const row = Number(id[1]) - 1;
      if (!sp) return;
      if (sp === "DELETE") {
        if (row < f.via.length) f.via.splice(row, 1);
        take();
        routeChanged();
        return;
      }
      if (row > f.via.length) return this.msg("INVALID ENTRY");
      if (!WAYPOINTS[sp]) return this.msg("NOT IN DATA BASE");
      f.via[row] = sp;
      take();
      routeChanged();
      return;
    }
    switch (`${this.page}-${id}`) {
      case "PERF-L3": {
        if (!sp) return;
        const v = Number(sp);
        if (!(v >= 35 && v <= 65)) return this.msg("INVALID ENTRY");
        f.zfwT = v;
        take();
        return;
      }
      case "PERF-L4": {
        if (!sp) return;
        const v = Number(sp);
        if (!(v >= 0.5 && v <= 10)) return this.msg("INVALID ENTRY");
        f.reservesT = v;
        take();
        return;
      }
      case "PERF-L5": {
        if (!sp) return;
        const v = Number(sp);
        if (!Number.isInteger(v) || v < 0 || v > 500) return this.msg("INVALID ENTRY");
        f.costIndex = v;
        take();
        return;
      }
      case "PERF-R1": {
        if (!sp) return;
        let v = Number(sp.replace(/^FL/, ""));
        if (v > 0 && v <= 410 && sp.length <= 5 && !sp.includes("0000")) v = v < 1000 ? v * 100 : v;
        if (!(v >= 5000 && v <= 41000)) return this.msg("INVALID ENTRY");
        f.crzAltFt = Math.round(v / 100) * 100;
        take();
        this.onRoute?.();
        return;
      }
      case "PERF-R6":
        this.page = "TO";
        return;
      case "TO-L1": {
        if (!sp) return;
        const v = Number(sp);
        if (![1, 5, 10, 15, 25].includes(v)) return this.msg("INVALID ENTRY");
        f.toFlaps = v;
        f.vSel = [false, false, false];
        take();
        return;
      }
      case "TO-R1":
      case "TO-R2":
      case "TO-R3": {
        if (!f.toFlaps || !f.zfwT) return this.msg("ENTER FLAPS AND ZFW");
        f.vSel[Number(id[1]) - 1] = true;
        return;
      }
    }
  }

  /** True when the pre-flight entries are all done. */
  get preflightComplete() {
    const f = this.fms;
    return f.irsPosSet && f.active && !f.pending && f.zfwT > 0 && f.reservesT > 0 && f.costIndex >= 0 && f.crzAltFt > 0 && f.toFlaps > 0 && f.vSel.every(Boolean);
  }

  private rows(): { title: string; pageNo?: string; rows: Row[] } {
    const f = this.fms;
    const box = (v: string, n: number, colour: Cell["colour"] = "w"): Cell => (v ? { text: v, colour } : { text: BOX(n), colour: "w" });
    const gwT = f.zfwT ? f.zfwT + this.fuelKg / 1000 : 0;
    switch (this.page) {
      case "IDENT":
        return {
          title: "IDENT",
          rows: [
            { lLabel: "MODEL", l: { text: "737-8 TYPE" }, rLabel: "ENG RATING", r: { text: "TRAINING" } },
            { lLabel: "NAV DATA", l: { text: "RZ TRAINING" }, rLabel: "ACTIVE", r: { text: "ALWAYS" } },
            {},
            { lLabel: "OP PROGRAM", l: { text: "RUNWAY ZERO" } },
            {},
            { l: { text: "<INDEX" }, r: { text: "POS INIT>" } },
          ],
        };
      case "POS":
        return {
          title: "POS INIT",
          rows: [
            {},
            { lLabel: "REF AIRPORT", l: box(f.refAirport, 4, "g"), r: f.refAirport ? { text: fmtPos(AIRPORTS[f.refAirport]), small: true } : undefined },
            {},
            { rLabel: "GPS POS", r: { text: fmtPos(this.pos), colour: "g" } },
            { rLabel: "SET IRS POS", r: f.irsPosSet ? { text: fmtPos(this.pos), colour: "g" } : { text: "□□□°□□.□ □□□□°□□.□" } },
            { l: { text: "<INDEX" }, r: { text: "ROUTE>" } },
          ],
        };
      case "RTE1": {
        const title = f.active && !f.pending ? "ACT RTE 1" : f.active ? "MOD RTE 1" : "RTE 1";
        return {
          title,
          pageNo: "1/2",
          rows: [
            { lLabel: "ORIGIN", l: box(f.origin, 4, "g"), rLabel: "DEST", r: box(f.dest, 4, "g") },
            { lLabel: "RUNWAY", l: { text: f.runway ? `RW${f.runway}` : "-----", colour: f.runway ? "g" : "w" }, rLabel: "FLT NO.", r: { text: f.fltNo || "--------", colour: f.fltNo ? "g" : "w" } },
            {},
            {},
            {},
            { l: { text: "<RTE 2" }, r: { text: f.active && !f.pending ? "PERF INIT>" : f.activated && f.pending ? "PRESS EXEC" : "ACTIVATE>" } },
          ],
        };
      }
      case "RTE2": {
        const title = f.active && !f.pending ? "ACT RTE 1" : f.active ? "MOD RTE 1" : "RTE 1";
        const rows: Row[] = [];
        for (let i = 0; i < 5; i++) {
          const w = f.via[i];
          if (w) rows.push({ lLabel: i === 0 ? "VIA" : "", rLabel: i === 0 ? "TO" : "", l: { text: "DIRECT", colour: "g" }, r: { text: w, colour: "g" } });
          else if (i === f.via.length) rows.push({ lLabel: i === 0 ? "VIA" : "", rLabel: i === 0 ? "TO" : "", l: { text: "-----" }, r: { text: "-----" } });
          else rows.push({});
        }
        rows.push({ l: { text: "<RTE 1" }, r: { text: f.active && !f.pending ? "PERF INIT>" : f.activated && f.pending ? "PRESS EXEC" : "ACTIVATE>" } });
        return { title, pageNo: "2/2", rows };
      }
      case "PERF":
        return {
          title: "PERF INIT",
          rows: [
            { lLabel: "GW/CRZ CG", l: { text: gwT ? `${gwT.toFixed(1)}/25.0%` : "---.-/--.-%" }, rLabel: "CRZ ALT", r: f.crzAltFt ? { text: f.crzAltFt >= 10000 ? `FL${f.crzAltFt / 100}` : String(f.crzAltFt), colour: "g" } : { text: BOX(5) } },
            { lLabel: "PLAN/FUEL", l: { text: `${(this.fuelKg / 1000).toFixed(1)}`, colour: "g" } },
            { lLabel: "ZFW", l: f.zfwT ? { text: f.zfwT.toFixed(1), colour: "g" } : { text: BOX(5) } },
            { lLabel: "RESERVES", l: f.reservesT ? { text: f.reservesT.toFixed(1), colour: "g" } : { text: BOX(4) } },
            { lLabel: "COST INDEX", l: f.costIndex >= 0 ? { text: String(f.costIndex), colour: "g" } : { text: BOX(3) } },
            { l: { text: "<INDEX" }, r: { text: "TAKEOFF>" } },
          ],
        };
      case "TO": {
        const v = vSpeeds(gwT || 60, f.toFlaps || 5);
        const vRow = (i: number, label: string): Row => ({
          rLabel: label,
          r: !f.toFlaps || !gwT ? { text: "---" } : f.vSel[i] ? { text: `${v[i]}`, colour: "g" } : { text: `${v[i]}>`, small: true, colour: "m" },
        });
        return {
          title: "TAKEOFF REF",
          rows: [
            { lLabel: "FLAPS", l: f.toFlaps ? { text: `${f.toFlaps}°`, colour: "g" } : { text: "□□°" }, ...vRow(0, "V1") },
            { lLabel: "THRUST", l: { text: "TO" }, ...vRow(1, "VR") },
            { lLabel: "TOGW", l: { text: gwT ? gwT.toFixed(1) : "---.-" }, ...vRow(2, "V2") },
            { lLabel: "RUNWAY", l: { text: f.runway ? `RW${f.runway}` : "-----" } },
            { c: this.preflightComplete ? { text: "PRE-FLT COMPLETE", colour: "g" } : { text: "PRE-FLT INCOMPLETE" } },
            { l: { text: "<POS INIT" } },
          ],
        };
      }
    }
  }

  render() {
    this.execBtn.classList.toggle("lit", this.powered && this.fms.pending && this.fms.activated);
    if (!this.powered) {
      if (this.lastHtml !== "off") this.screen.innerHTML = "";
      this.lastHtml = "off";
      return;
    }
    const p = this.rows();
    const span = (x: Cell | undefined, cls: string) =>
      x ? `<span class="${cls} c-${x.colour ?? "w"}${x.small ? " c-s" : ""}">${esc(x.text)}</span>` : `<span class="${cls}"></span>`;
    let html = `<div class="cdu-title"><span>${esc(p.title)}</span><span class="c-s">${p.pageNo ?? ""}</span></div>`;
    for (const r of p.rows) {
      html += `<div class="cdu-label"><span>${esc(r.lLabel ?? "")}</span><span>${esc(r.rLabel ?? "")}</span></div>`;
      html += r.c ? `<div class="cdu-line cdu-center">${span(r.c, "")}</div>` : `<div class="cdu-line">${span(r.l, "l")}${span(r.r, "r")}</div>`;
    }
    html += `<div class="cdu-scratch${this.message ? " cdu-msg" : ""}">${esc(this.message || this.scratch)}</div>`;
    if (html !== this.lastHtml) {
      this.screen.innerHTML = html;
      this.lastHtml = html;
    }
  }
}
