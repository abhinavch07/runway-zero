// MCDU (the flight management keyboard and screen) on the pedestal. A small training version with
// the pages a crew uses to set up a flight: INIT A, INIT B, F-PLN (with LAT REV, departure and
// arrival runways) and PERF TAKE OFF. Entries go into the scratchpad first, then a line select key
// (LSK) beside a field puts the scratchpad into that field, like on the aircraft.
//
// The layout and colours follow the general A320 family idea (amber boxes for required entries,
// cyan for values you can change, green for values the computer works out). It is not a copy of
// the real software, and many pages and functions are left out.
import { AIRPORTS, WAYPOINTS, distanceNm } from "../world/route";
import { NAV_STATIONS, freqText } from "../radio/training";
import type { LatLon } from "../world/geo";

export type McduPage = "RADNAV" | "MENU" | "INITA" | "INITB" | "FPLN" | "LATREV" | "DEP" | "ARR" | "PERF";

export interface FmsData {
  page: McduPage;
  scratch: string;
  from: string | null;
  to: string | null;
  fltNbr: string | null;
  costIndex: number | null;
  crzFl: number | null;
  crzTemp: number | null;
  zfwCg: number | null;
  zfw: number | null;
  block: number | null;
  depRwy: string | null;
  arrRwy: string | null;
  /** Waypoints between the origin and the destination, in order. */
  legs: string[];
  /** A flight plan discontinuity after the last waypoint, before the destination. */
  disco: boolean;
  v1: number | null;
  vr: number | null;
  v2: number | null;
  flaps: number | null;
  ths: string | null;
  flex: number | null;
  /** Runway picked on the DEPARTURE or ARRIVAL page but not inserted yet (shown in yellow). */
  tmpyRwy: string | null;
  /** Where the LAT REV page was opened. */
  latRevAt: "origin" | "dest";
  /** RAD NAV: VOR 1 tuned by the pilot (ident), and the ILS (ident) if tuned by hand. */
  vor1: string | null;
  ilsManual: string | null;
}

export const TAXI_FUEL_T = 0.2;

export function emptyFms(): FmsData {
  return {
    page: "MENU",
    scratch: "",
    from: null,
    to: null,
    fltNbr: null,
    costIndex: null,
    crzFl: null,
    crzTemp: null,
    zfwCg: null,
    zfw: null,
    block: null,
    depRwy: null,
    arrRwy: null,
    legs: [],
    disco: false,
    v1: null,
    vr: null,
    v2: null,
    flaps: null,
    ths: null,
    flex: null,
    tmpyRwy: null,
    latRevAt: "origin",
    vor1: null,
    ilsManual: null,
  };
}

type Colour = "w" | "g" | "c" | "a" | "y" | "m";
interface Field {
  text: string;
  colour: Colour;
  /** Name used by lessons to highlight this text on the screen. */
  id?: string;
  small?: boolean;
}
interface Row {
  lLabel?: string;
  rLabel?: string;
  l?: Field;
  r?: Field;
  c?: Field;
}
interface Screen {
  title: Field;
  rows: Row[];
  /** Shows the up/down arrows in the corner when the page scrolls. */
  scroll?: boolean;
}

const BOX = "□";
const boxes = (n: number) => BOX.repeat(n);
const f = (text: string, colour: Colour = "w", id?: string): Field => ({ text, colour, id });
const fs = (text: string, colour: Colour = "w"): Field => ({ text, colour, small: true });

/** One item in the F-PLN list. */
interface PlanItem {
  kind: "origin" | "wpt" | "disco" | "dest" | "end";
  ident: string;
  pos?: LatLon;
}

const KEYS_FN = [
  ["DIR", "PROG", "PERF", "INIT", "DATA", ""],
  ["F-PLN", "RAD NAV", "FUEL PRED", "SEC F-PLN", "ATC COMM", "MCDU MENU"],
  ["AIRPORT", "", "", "", "", ""],
];

export class Mcdu {
  readonly el: HTMLElement;
  fms: FmsData = emptyFms();
  powered = false;
  private screenEl: HTMLElement;
  private message = "";
  private scroll = 0;

  constructor(parent: HTMLElement) {
    this.el = document.createElement("div");
    this.el.id = "mcdu";
    this.el.tabIndex = 0;
    this.el.title = "MCDU. Click it, then you can also type on your keyboard.";
    const lsk = (side: "L" | "R") =>
      `<div class="mcdu-lsks">${[1, 2, 3, 4, 5, 6]
        .map((n) => `<button data-key="${side}${n}" data-ctl="mcdu-${side}${n}">${side === "L" ? "–" : "–"}</button>`)
        .join("")}</div>`;
    const fn = KEYS_FN.map(
      (row) =>
        `<div class="mcdu-fn">${row
          .map((k) =>
            k === ""
              ? "<span></span>"
              : `<button data-key="${k}" data-ctl="mcdu-${k.toLowerCase().replace(/[^a-z]/g, "")}">${k}</button>`,
          )
          .join("")}</div>`,
    ).join("");
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(["-", "SP", "/", "CLR"]);
    const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "+/-"];
    this.el.innerHTML = `
      <div class="mcdu-top">${lsk("L")}<div class="mcdu-screen"></div>${lsk("R")}</div>
      <div class="mcdu-keys">
        ${fn}
        <div class="mcdu-nav">
          <button data-key="NEXT PAGE" data-ctl="mcdu-nextpage">NEXT PAGE</button>
          <button data-key="UP" data-ctl="mcdu-up">↑</button>
          <button data-key="DOWN" data-ctl="mcdu-down">↓</button>
        </div>
        <div class="mcdu-alpha">
          <div class="mcdu-nums">${nums.map((k) => `<button data-key="${k}">${k}</button>`).join("")}</div>
          <div class="mcdu-letters">${letters
            .map((k) => `<button data-key="${k}"${k === "CLR" ? ' data-ctl="mcdu-clr" class="clr"' : ""}>${k}</button>`)
            .join("")}</div>
        </div>
      </div>`;
    parent.appendChild(this.el);
    this.screenEl = this.el.querySelector(".mcdu-screen")!;
    this.el.querySelectorAll<HTMLButtonElement>("button[data-key]").forEach((b) =>
      b.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.el.focus();
        this.press(b.dataset.key!);
      }),
    );
    this.el.addEventListener("keydown", (e) => {
      const k = e.key;
      let key: string | null = null;
      if (/^[a-z0-9]$/i.test(k)) key = k.toUpperCase();
      else if (k === "/" || k === "." || k === "-") key = k;
      else if (k === " ") key = "SP";
      else if (k === "Backspace" || k === "Delete") key = "CLR";
      else if (k === "ArrowUp") key = "UP";
      else if (k === "ArrowDown") key = "DOWN";
      else if (k === "Escape") return this.el.blur();
      if (key) {
        e.preventDefault();
        e.stopPropagation();
        this.press(key);
      }
    });
    this.render();
  }

  reset() {
    this.fms = emptyFms();
    this.message = "";
    this.scroll = 0;
    this.render();
  }

  setPowered(on: boolean) {
    if (on === this.powered) return;
    this.powered = on;
    this.el.classList.toggle("unpowered", !on);
    this.render();
  }

  // ---------- Keys ----------
  press(key: string) {
    if (!this.powered) return;
    const d = this.fms;
    if (key.length === 1 || key === "SP" || key === "+/-") {
      this.message = "";
      if (d.scratch === "CLR") d.scratch = "";
      const ch = key === "SP" ? " " : key === "+/-" ? (d.scratch.endsWith("-") ? "+" : "-") : key;
      if (key === "+/-" && /[+-]$/.test(d.scratch)) d.scratch = d.scratch.slice(0, -1);
      if (d.scratch.length < 22) d.scratch += ch;
    } else if (key === "CLR") {
      if (this.message) this.message = "";
      else if (d.scratch === "CLR") d.scratch = "";
      else if (d.scratch) d.scratch = d.scratch.slice(0, -1);
      else d.scratch = "CLR";
    } else if (key === "INIT") this.go("INITA");
    else if (key === "F-PLN") this.go("FPLN");
    else if (key === "PERF") this.go("PERF");
    else if (key === "RAD NAV") this.go("RADNAV");
    else if (key === "NEXT PAGE") {
      if (d.page === "INITA") this.go("INITB");
      else if (d.page === "INITB") this.go("INITA");
    } else if (key === "UP") this.scroll = Math.max(0, this.scroll - 1);
    else if (key === "DOWN") this.scroll = Math.min(this.maxScroll(), this.scroll + 1);
    else if (/^[LR][1-6]$/.test(key)) this.lsk(key[0] as "L" | "R", Number(key[1]));
    else this.msg("NOT IN THIS TRAINER");
    this.render();
  }

  private go(page: McduPage) {
    this.fms.page = page;
    this.scroll = 0;
    if (page !== "DEP" && page !== "ARR") this.fms.tmpyRwy = null;
  }

  private msg(text: string) {
    this.message = text;
  }

  /** Takes the scratchpad for an entry. Returns null (and does nothing) when it is empty. */
  private take(): string | null {
    const s = this.fms.scratch.trim();
    if (!s) return null;
    return s;
  }

  private accept() {
    this.fms.scratch = "";
  }

  private lsk(side: "L" | "R", n: number) {
    const d = this.fms;
    const s = this.take();
    const bad = () => this.msg("FORMAT ERROR");
    switch (d.page) {
      case "INITA": {
        if (side === "R" && n === 1) {
          if (!s) return;
          const m = /^([A-Z]{4})\/([A-Z]{4})$/.exec(s);
          if (!m) return bad();
          if (!AIRPORTS[m[1]] || !AIRPORTS[m[2]]) return this.msg("NOT IN DATA BASE");
          d.from = m[1];
          d.to = m[2];
          d.legs = [];
          d.disco = true;
          d.depRwy = null;
          d.arrRwy = null;
          return this.accept();
        }
        if (side === "L" && n === 3) {
          if (!s) return;
          if (!/^[A-Z0-9]{1,8}$/.test(s)) return bad();
          d.fltNbr = s;
          return this.accept();
        }
        if (side === "L" && n === 5) {
          if (!s) return;
          if (!/^\d{1,3}$/.test(s)) return bad();
          d.costIndex = Number(s);
          return this.accept();
        }
        if (side === "L" && n === 6) {
          if (!s) return;
          const m = /^(?:FL)?(\d{2,3})(?:\/([+-]?\d{1,2}))?$/.exec(s);
          if (!m) return bad();
          const fl = Number(m[1]);
          if (fl < 100 || fl > 410) return this.msg("ENTRY OUT OF RANGE");
          d.crzFl = fl;
          d.crzTemp = m[2] !== undefined ? Number(m[2]) : Math.round(15 - (fl * 100 * 1.98) / 1000);
          return this.accept();
        }
        if (s) this.msg("NOT ALLOWED");
        return;
      }
      case "INITB": {
        if (side === "R" && n === 1) {
          if (!s) return;
          const m = /^(\d{1,2}(?:\.\d)?)?\/(\d{2}(?:\.\d)?)$/.exec(s);
          if (!m) return bad();
          const cg = m[1] !== undefined ? Number(m[1]) : d.zfwCg;
          const zfw = Number(m[2]);
          if (zfw < 35 || zfw > 64.3 || (cg !== null && (cg < 8 || cg > 45))) return this.msg("ENTRY OUT OF RANGE");
          if (cg === null) return bad();
          d.zfwCg = cg;
          d.zfw = zfw;
          return this.accept();
        }
        if (side === "R" && n === 2) {
          if (!s) return;
          if (!/^\d{1,2}(\.\d)?$/.test(s)) return bad();
          const b = Number(s);
          if (b < 1 || b > 23.8) return this.msg("ENTRY OUT OF RANGE");
          d.block = b;
          return this.accept();
        }
        if (s) this.msg("NOT ALLOWED");
        return;
      }
      case "PERF": {
        if (side === "L" && n <= 3) {
          if (!s) return;
          if (!/^\d{2,3}$/.test(s)) return bad();
          const v = Number(s);
          if (v < 90 || v > 200) return this.msg("ENTRY OUT OF RANGE");
          const next = { v1: d.v1, vr: d.vr, v2: d.v2 };
          next[(["v1", "vr", "v2"] as const)[n - 1]] = v;
          const order = [next.v1, next.vr, next.v2];
          for (let i = 0; i < 3; i++)
            for (let j = i + 1; j < 3; j++) {
              const a = order[i];
              const b = order[j];
              if (a !== null && b !== null && a > b) return this.msg("V1/VR/V2 DISAGREE");
            }
          Object.assign(d, next);
          return this.accept();
        }
        if (side === "R" && n === 3) {
          if (!s) return;
          const m = /^([1-3])(?:\/((?:UP|DN)\d(?:\.\d)?|\d(?:\.\d)?(?:UP|DN)))?$/.exec(s);
          if (!m) return bad();
          d.flaps = Number(m[1]);
          if (m[2]) d.ths = m[2].replace(/^(\d(?:\.\d)?)(UP|DN)$/, "$2$1");
          return this.accept();
        }
        if (side === "R" && n === 4) {
          if (!s) return;
          if (!/^\d{1,2}$/.test(s)) return bad();
          const t = Number(s);
          if (t < 30 || t > 75) return this.msg("ENTRY OUT OF RANGE");
          d.flex = t;
          return this.accept();
        }
        if (s) this.msg("NOT ALLOWED");
        return;
      }
      case "FPLN":
        return this.lskPlan(side, n, s);
      case "MENU":
        if (side === "L" && n === 1) this.go("INITA");
        return;
      case "RADNAV": {
        if (side === "L" && (n === 1 || n === 3)) {
          if (!s) return;
          const kind = n === 1 ? "vor" : "ils";
          const st = NAV_STATIONS.find((x) => x.kind === kind && (x.ident === s || freqText(x.freq, 2) === s));
          if (s === "CLR") {
            if (n === 1) d.vor1 = null;
            else d.ilsManual = null;
            return this.accept();
          }
          if (!st) return this.msg(/^\d{3}\.\d{1,2}$/.test(s) || /^[A-Z]{2,3}$/.test(s) ? "NOT IN DATA BASE" : "FORMAT ERROR");
          if (n === 1) d.vor1 = st.ident;
          else d.ilsManual = st.ident;
          return this.accept();
        }
        if (s) this.msg("NOT ALLOWED");
        return;
      }
      case "LATREV": {
        if (side === "L" && n === 6) return this.go("FPLN");
        if (side === "L" && n === 1 && this.fms.latRevAt === "origin") return this.go("DEP");
        if (side === "R" && n === 1 && this.fms.latRevAt === "dest") return this.go("ARR");
        return;
      }
      case "DEP":
      case "ARR": {
        const isDep = d.page === "DEP";
        const apt = AIRPORTS[(isDep ? d.from : d.to) ?? ""];
        if (side === "L" && n === 6) {
          // ERASE the temporary choice, or RETURN when there is none.
          if (this.fms.tmpyRwy) this.fms.tmpyRwy = null;
          else this.go("FPLN");
          return;
        }
        if (side === "R" && n === 6 && this.fms.tmpyRwy) {
          if (isDep) d.depRwy = this.fms.tmpyRwy;
          else d.arrRwy = this.fms.tmpyRwy;
          this.go("FPLN");
          return;
        }
        if (side === "L" && n >= 2 && n <= 5 && apt) {
          const rwy = apt.runways[this.scroll + n - 2];
          if (rwy) this.fms.tmpyRwy = rwy.ident;
        }
        return;
      }
    }
  }

  private plan(): PlanItem[] {
    const d = this.fms;
    if (!d.from || !d.to) return [];
    const items: PlanItem[] = [{ kind: "origin", ident: d.from + (d.depRwy ?? ""), pos: AIRPORTS[d.from] }];
    for (const w of d.legs) items.push({ kind: "wpt", ident: w, pos: WAYPOINTS[w] });
    if (d.disco) items.push({ kind: "disco", ident: "" });
    items.push({ kind: "dest", ident: d.to + (d.arrRwy ?? ""), pos: AIRPORTS[d.to] });
    items.push({ kind: "end", ident: "" });
    return items;
  }

  private maxScroll(): number {
    const d = this.fms;
    if (d.page === "FPLN") return Math.max(0, this.plan().length - 5);
    if (d.page === "DEP" || d.page === "ARR") {
      const apt = AIRPORTS[(d.page === "DEP" ? d.from : d.to) ?? ""];
      return Math.max(0, (apt?.runways.length ?? 0) - 4);
    }
    return 0;
  }

  private lskPlan(side: "L" | "R", n: number, s: string | null) {
    const d = this.fms;
    if (side !== "L" || n > 5) {
      if (s) this.msg("NOT ALLOWED");
      return;
    }
    const items = this.plan();
    const idx = this.scroll + n - 1;
    const item = items[idx];
    if (!item || item.kind === "end") return;
    if (s === "CLR") {
      if (item.kind === "disco") d.disco = false;
      else if (item.kind === "wpt") d.legs.splice(d.legs.indexOf(item.ident), 1);
      else return this.msg("NOT ALLOWED");
      return this.accept();
    }
    if (s) {
      if (item.kind === "origin") return this.msg("NOT ALLOWED");
      if (!WAYPOINTS[s]) return this.msg("NOT IN DATA BASE");
      if (d.legs.includes(s)) return this.msg("NOT ALLOWED");
      // The new waypoint goes in before the line you pressed.
      const before = item.kind === "wpt" ? d.legs.indexOf(item.ident) : d.legs.length;
      d.legs.splice(before, 0, s);
      return this.accept();
    }
    if (item.kind === "origin") {
      this.fms.latRevAt = "origin";
      this.go("LATREV");
    } else if (item.kind === "dest") {
      this.fms.latRevAt = "dest";
      this.go("LATREV");
    }
  }

  // ---------- Screen ----------
  private screen(): Screen {
    const d = this.fms;
    switch (d.page) {
      case "RADNAV": {
        const vor = NAV_STATIONS.find((x) => x.ident === d.vor1);
        // The ILS of the departure runway is tuned by the flight computer (small font) unless set by hand.
        const ilsSt = NAV_STATIONS.find((x) => x.kind === "ils");
        const autoIls = d.depRwy === "28" && !d.ilsManual;
        const ils = d.ilsManual ? ilsSt : autoIls ? ilsSt : undefined;
        const ilsText = ils ? `${ils.ident}/${freqText(ils.freq, 2)}` : `${"[ ]"}/[    ]`;
        return {
          title: f("RADIO NAV"),
          rows: [
            {
              lLabel: "VOR1/FREQ",
              l: vor ? f(`${vor.ident}/${freqText(vor.freq, 2)}`, "c", "vor1") : f("[ ]/[    ]", "c", "vor1"),
              rLabel: "FREQ/VOR2",
              r: f("[    ]/[ ]", "c"),
            },
            { lLabel: "CRS", l: f(vor ? "---" : "[ ]", "c"), rLabel: "CRS", r: f("[ ]", "c") },
            {
              lLabel: "LS /FREQ",
              l: autoIls ? fs(ilsText, "c") : f(ilsText, "c", "ils"),
              rLabel: "",
            },
            { lLabel: "CRS", l: ils ? f(`${String(Math.round(ils.courseT ?? 0)).padStart(3, "0")}`, "c", "ilscrs") : f("[ ]", "c") },
            { lLabel: "ADF1/FREQ", l: f("[ ]/[    ]", "c"), rLabel: "FREQ/ADF2", r: f("[    ]/[ ]", "c") },
            {},
          ],
        };
      }
      case "MENU":
        return {
          title: f("MCDU MENU"),
          rows: [{ l: f("<FMGC", "g", "fmgc") }, {}, {}, {}, {}, { r: f("SELECT DESIRED SYSTEM", "w") }],
        };
      case "INITA":
        return {
          title: f("INIT", "w"),
          rows: [
            {
              lLabel: "CO RTE",
              l: f("----------"),
              rLabel: "FROM/TO",
              r: d.from ? f(`${d.from}/${d.to}`, "c", "fromto") : f(`${boxes(4)}/${boxes(4)}`, "a", "fromto"),
            },
            { lLabel: "ALTN/CO RTE", l: f("----/----------") },
            {
              lLabel: "FLT NBR",
              l: d.fltNbr ? f(d.fltNbr, "c", "fltnbr") : f(boxes(8), "a", "fltnbr"),
            },
            { lLabel: "LAT", l: f("----.--"), rLabel: "LONG", r: f("-----.--") },
            {
              lLabel: "COST INDEX",
              l: d.costIndex !== null ? f(String(d.costIndex), "c", "ci") : f(boxes(3), "a", "ci"),
            },
            {
              lLabel: "CRZ FL/TEMP",
              l:
                d.crzFl !== null
                  ? f(`FL${String(d.crzFl).padStart(3, "0")}/${d.crzTemp}°`, "c", "crz")
                  : f(`${boxes(5)}/${boxes(3)}°`, "a", "crz"),
              rLabel: "TROPO",
              r: fs("36090", "c"),
            },
          ],
        };
      case "INITB": {
        const tow = d.zfw !== null && d.block !== null ? (d.zfw + d.block - TAXI_FUEL_T).toFixed(1) : null;
        return {
          title: f("INIT", "w"),
          rows: [
            {
              lLabel: "TAXI",
              l: fs(TAXI_FUEL_T.toFixed(1), "c"),
              rLabel: "ZFWCG/ZFW",
              r:
                d.zfw !== null
                  ? f(`${d.zfwCg!.toFixed(1)}/${d.zfw.toFixed(1)}`, "c", "zfw")
                  : f(`${boxes(2)}.${BOX}/${boxes(2)}.${BOX}`, "a", "zfw"),
            },
            {
              lLabel: "TRIP/TIME",
              l: f("---.-/----"),
              rLabel: "BLOCK",
              r: d.block !== null ? f(d.block.toFixed(1), "c", "block") : f(`${boxes(2)}.${BOX}`, "a", "block"),
            },
            { lLabel: "RTE RSV/%", l: f("---.-/---") },
            { lLabel: "ALTN/TIME", l: f("---.-/----"), rLabel: "TOW", r: tow ? f(tow, "g", "tow") : f("---.-") },
            { lLabel: "FINAL/TIME", l: f("---.-/----"), rLabel: "LW", r: f("---.-") },
            { lLabel: "MIN DEST FOB", l: f("---.-"), rLabel: "EXTRA/TIME", r: f("---.-/----") },
          ],
        };
      }
      case "PERF": {
        const sp = (v: number | null, id: string) => (v !== null ? f(String(v), "c", id) : f(boxes(3), "a", id));
        return {
          title: f(d.depRwy ? `TAKE OFF   RWY ${d.depRwy}` : "TAKE OFF", "g"),
          rows: [
            { lLabel: "V1", l: sp(d.v1, "v1"), rLabel: "FLP RETR", r: fs("F=---") },
            { lLabel: "VR", l: sp(d.vr, "vr"), rLabel: "SLT RETR", r: fs("S=---") },
            {
              lLabel: "V2",
              l: sp(d.v2, "v2"),
              rLabel: "FLAPS/THS",
              r: d.flaps !== null ? f(`${d.flaps}/${d.ths ?? "-----"}`, "c", "flaps") : f(`[]/[    ]`, "c", "flaps"),
            },
            {
              lLabel: "TRANS ALT",
              l: f("4000", "c"),
              rLabel: "FLEX TO TEMP",
              r: d.flex !== null ? f(`${d.flex}°`, "c", "flex") : f("[ ]°", "c", "flex"),
            },
            { lLabel: "THR RED/ACC", l: fs("1500/1500", "c"), rLabel: "ENG OUT ACC", r: fs("1500", "c") },
            { lLabel: "", l: f(""), rLabel: "NEXT", r: f("PHASE>") },
          ],
        };
      }
      case "FPLN": {
        const items = this.plan();
        if (!items.length) return { title: f("F-PLN"), rows: [{ c: f("NO FLIGHT PLAN") }, {}, {}, {}, {}, {}] };
        const rows: Row[] = [];
        let prev: LatLon | undefined;
        let total = 0;
        const dists: (number | null)[] = items.map((it) => {
          if (!it.pos) return null;
          const dd = prev && !items[items.indexOf(it) - 1]?.kind.startsWith("disco") ? distanceNm(prev, it.pos) : null;
          prev = it.pos;
          if (dd) total += dd;
          return dd;
        });
        for (let i = this.scroll; i < this.scroll + 5; i++) {
          const it = items[i];
          if (!it) {
            rows.push({});
            continue;
          }
          if (it.kind === "disco") rows.push({ c: f("--F-PLN DISCONTINUITY--", "w", "item-DISCO") });
          else if (it.kind === "end") rows.push({ c: f("----- END OF F-PLN -----") });
          else {
            const dist = dists[i];
            rows.push({
              lLabel: it.kind === "origin" ? "FROM" : "",
              l: f(it.ident, "g", `item-${it.ident.slice(0, it.kind === "wpt" ? 5 : 4)}`),
              rLabel: dist ? `${Math.round(dist)}NM` : "",
              r: f("---/-----", "g"),
            });
          }
        }
        rows.push({
          lLabel: "DEST",
          l: f(d.to! + (d.arrRwy ?? ""), "w"),
          rLabel: "DIST",
          r: f(total ? String(Math.round(total)) : "----", "w"),
        });
        return { title: f("F-PLN"), rows, scroll: items.length > 5 };
      }
      case "LATREV": {
        const ident = this.fms.latRevAt === "origin" ? d.from : d.to;
        return {
          title: f(`LAT REV FROM ${ident ?? ""}`),
          rows: [
            this.fms.latRevAt === "origin"
              ? { l: f("<DEPARTURE", "w", "departure") }
              : { r: f("ARRIVAL>", "w", "arrival") },
            {},
            {},
            {},
            {},
            { l: f("<RETURN") },
          ],
        };
      }
      case "DEP":
      case "ARR": {
        const isDep = d.page === "DEP";
        const apt = AIRPORTS[(isDep ? d.from : d.to) ?? ""];
        const tmpy = this.fms.tmpyRwy;
        const sel = (isDep ? d.depRwy : d.arrRwy) ?? "---";
        const rows: Row[] = [
          { lLabel: isDep ? "RWY" : "APPR", l: f(tmpy ?? sel, tmpy ? "y" : "g"), rLabel: isDep ? "SID" : "STAR", r: f("------") },
        ];
        const list = apt?.runways ?? [];
        for (let i = this.scroll; i < this.scroll + 4; i++) {
          const r = list[i];
          if (!r)
            rows.push({});
          else
            rows.push({
              lLabel: i === this.scroll ? (isDep ? "AVAILABLE RUNWAYS" : "RUNWAYS") : "",
              l: f(`<${r.ident}${r.lengthM ? `  ${r.lengthM}M` : ""}`, "c", `item-${r.ident}`),
              r: f(`${String(r.headingT).padStart(3, "0")}°`, "c"),
            });
        }
        rows.push(tmpy ? { l: f("<TMPY ERASE", "a"), r: f("INSERT*", "a", "insert") } : { l: f("<RETURN") });
        return {
          title: f(`${isDep ? "DEPARTURES FROM" : "ARRIVAL TO"} ${apt?.icao ?? ""}`, tmpy ? "y" : "w"),
          rows,
          scroll: list.length > 4,
        };
      }
    }
  }

  render() {
    if (!this.powered) {
      this.screenEl.innerHTML = "";
      return;
    }
    const sc = this.screen();
    const span = (x?: Field) =>
      x ? `<span class="mc-${x.colour}${x.small ? " mc-s" : ""}"${x.id ? ` data-ctl="mcdu-${x.id}"` : ""}>${esc(x.text)}</span>` : "<span></span>";
    let html = `<div class="mc-title">${span(sc.title)}${sc.scroll ? '<i class="mc-arrows">↑↓</i>' : ""}</div>`;
    for (const r of sc.rows) {
      html += `<div class="mc-label"><span>${esc(r.lLabel ?? "")}</span><span>${esc(r.rLabel ?? "")}</span></div>`;
      html += r.c
        ? `<div class="mc-line mc-center">${span(r.c)}</div>`
        : `<div class="mc-line">${span(r.l)}${span(r.r)}</div>`;
    }
    const sp = this.message || this.fms.scratch;
    html += `<div class="mc-scratch ${this.message ? "mc-w" : ""}">${esc(sp)}</div>`;
    this.screenEl.innerHTML = html;
  }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
