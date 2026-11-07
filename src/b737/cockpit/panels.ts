// 737-type cockpit panels as HTML: the overhead, the glareshield (EFIS control panel and MCP) and
// the pedestal (start levers, thrust levers, flaps, parking brake, radios, transponder).
// Switches change the controls object directly. MCP buttons send actions to the autopilot.
import type { Controls737, State737 } from "../sim/types";
import type { McpAction, McpValues } from "../sim/afcs";
import { freqText, tune } from "../../radio/training";
import { ND_RANGES } from "./nd";

type Obj = Record<string, unknown>;
const getPath = (o: Obj, path: string): unknown => path.split(".").reduce<unknown>((v, k) => (v as Obj)?.[k], o);
function setPath(o: Obj, path: string, value: unknown) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce<Obj>((v, k) => v[k] as Obj, o);
  target[last] = value;
}

const tog = (path: string, label: string, ctl: string, light = "") =>
  `<button class="b-sw" data-ctl="${ctl}" data-tog="${path}"><i></i><span>${label}</span>${light ? `<b class="b-lt" data-lt="${light}"></b>` : ""}</button>`;
const sel = (path: string, values: string[], ctl: string, title: string) =>
  `<div class="b-sel"><div class="b-sel-t">${title}</div><div class="b-seg">${values
    .map((v) => `<button data-ctl="${ctl}-${v}" data-set="${path}" data-v="${v}">${v}</button>`)
    .join("")}</div></div>`;
const light = (key: string) => `<b class="b-lt" data-lt="${key}"></b>`;
const mini = () => `
  <section class="b-box b-mini">
    <div class="b-title">ENGINES</div>
    <div class="b-mini-row" data-ctl="mini-n2"><span>N2 %</span><b data-mini="n2-0"></b><b data-mini="n2-1"></b></div>
    <div class="b-mini-row" data-ctl="mini-egt"><span>EGT °C</span><b data-mini="egt-0"></b><b data-mini="egt-1"></b></div>
    <div class="b-mini-row" data-ctl="mini-n1"><span>N1 %</span><b data-mini="n1-0"></b><b data-mini="n1-1"></b></div>
    <div class="b-mini-row"><span>POWER</span><b data-mini="power" class="wide"></b></div>
  </section>`;

/** Wires every switch, selector and light inside an element. */
class PanelBase {
  readonly el: HTMLElement;
  protected c: Controls737;
  /** Light text by key, or "" when off. Filled by each panel. */
  protected lights: Record<string, (s: State737) => string> = {};

  constructor(parent: HTMLElement, id: string, c: Controls737, html: string) {
    this.c = c;
    this.el = document.createElement("div");
    this.el.id = id;
    this.el.innerHTML = html;
    parent.appendChild(this.el);
    const blur = (e: Event) => (e.currentTarget as HTMLElement).blur();
    this.el.querySelectorAll<HTMLElement>("[data-tog]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const p = b.dataset.tog!;
        setPath(this.c as unknown as Obj, p, !getPath(this.c as unknown as Obj, p));
        blur(e);
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-set]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const raw = b.dataset.v!;
        const v = /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
        setPath(this.c as unknown as Obj, b.dataset.set!, v);
        blur(e);
      }),
    );
  }

  update(s: State737 | null) {
    const c = this.c as unknown as Obj;
    this.el.querySelectorAll<HTMLElement>("[data-tog]").forEach((b) => b.classList.toggle("on", !!getPath(c, b.dataset.tog!)));
    this.el.querySelectorAll<HTMLElement>("[data-set]").forEach((b) => b.classList.toggle("on", String(getPath(c, b.dataset.set!)) === b.dataset.v));
    if (!s) return;
    this.el.querySelectorAll<HTMLElement>("[data-lt]").forEach((b) => {
      const t = this.lights[b.dataset.lt!]?.(s) ?? "";
      b.textContent = t;
      b.classList.toggle("lit", !!t);
      b.classList.toggle("blue", t.startsWith("APU GEN") || t === "ALIGN" || t === "ON DC");
    });
    const e = s.sys.engines;
    const m = (k: string, t: string) => this.el.querySelectorAll<HTMLElement>(`[data-mini="${k}"]`).forEach((x) => (x.textContent = t));
    for (let i = 0; i < 2; i++) {
      m(`n2-${i}`, e[i].n2.toFixed(0));
      m(`egt-${i}`, String(Math.round(e[i].egtC)));
      m(`n1-${i}`, e[i].n1.toFixed(0));
    }
    m("power", s.sys.acPower ? "AC" : s.sys.dcPower ? "BATTERY ONLY" : "OFF");
  }
}

export class Overhead737 extends PanelBase {
  constructor(parent: HTMLElement, c: Controls737) {
    const pump = (i: number, label: string) => tog(`switches.fuelPumps.${i}`, label, `fuel-${i}`, `fuel-${i}`);
    const hyd = (i: number, label: string) => tog(`switches.hydPumps.${i}`, label, `hyd-${i}`, `hyd-${i}`);
    super(
      parent,
      "b-ovhd",
      c,
      `
      <div class="b-row">
        <section class="b-box">
          <div class="b-title">ELECTRICAL</div>
          ${tog("switches.battery", "BAT", "battery")}
          <div class="b-gens">
            <button class="b-sw" data-ctl="gen1" data-bus="0" data-src="ENG"><i></i><span>GEN 1</span>${light("gen-0")}</button>
            <button class="b-sw" data-ctl="apugen1" data-bus="0" data-src="APU"><i></i><span>APU GEN 1</span></button>
            <button class="b-sw" data-ctl="apugen2" data-bus="1" data-src="APU"><i></i><span>APU GEN 2</span></button>
            <button class="b-sw" data-ctl="gen2" data-bus="1" data-src="ENG"><i></i><span>GEN 2</span>${light("gen-1")}</button>
          </div>
          <div class="b-lights">${light("apugen")}${light("busoff-0")}${light("busoff-1")}</div>
        </section>
        <section class="b-box">
          <div class="b-title">APU</div>
          <div class="b-seg b-apu">
            <button data-ctl="apu-OFF" data-apu="OFF">OFF</button>
            <button data-ctl="apu-ON" data-apu="ON">ON</button>
            <button data-ctl="apu-START" data-apu="START">START</button>
          </div>
          <div class="b-gauge" data-ctl="apu-egt"><span>APU EGT</span><b data-g="apuegt"></b></div>
          <div class="b-hint">START springs back to ON.</div>
        </section>
        <section class="b-box">
          <div class="b-title">IRS</div>
          ${sel("switches.irs.0", ["OFF", "ALIGN", "NAV"], "irsL", "L")}
          ${sel("switches.irs.1", ["OFF", "ALIGN", "NAV"], "irsR", "R")}
          <div class="b-lights">${light("irs-0")}${light("irs-1")}</div>
        </section>
        ${mini()}
      </div>
      <div class="b-row">
        <section class="b-box">
          <div class="b-title">FUEL</div>
          <div class="b-grid3">${pump(2, "CTR L")}${pump(3, "CTR R")}<span></span>${pump(0, "L FWD")}${pump(1, "L AFT")}<span></span>${pump(4, "R FWD")}${pump(5, "R AFT")}</div>
        </section>
        <section class="b-box">
          <div class="b-title">HYDRAULIC PUMPS</div>
          <div class="b-grid2">${hyd(0, "ENG 1 (A)")}${hyd(1, "ELEC 2 (A)")}${hyd(2, "ELEC 1 (B)")}${hyd(3, "ENG 2 (B)")}</div>
          <div class="b-gauge" data-ctl="hyd-psi"><span>PRESS A / B</span><b data-g="hyd"></b></div>
        </section>
        <section class="b-box">
          <div class="b-title">AIR</div>
          <div class="b-grid3">${tog("switches.packs.0", "L PACK", "packL")}<span></span>${tog("switches.packs.1", "R PACK", "packR")}
          ${tog("switches.engBleed.0", "BLEED 1", "engBleed1")}${tog("switches.apuBleed", "APU BLEED", "apuBleed")}${tog("switches.engBleed.1", "BLEED 2", "engBleed2")}</div>
          <div class="b-gauge" data-ctl="duct-psi"><span>DUCT PRESS</span><b data-g="duct"></b></div>
        </section>
      </div>
      <div class="b-row">
        <section class="b-box">
          <div class="b-title">ENGINE START</div>
          ${sel("switches.engStart.0", ["GRD", "OFF", "CONT"], "start1", "1")}
          ${sel("switches.engStart.1", ["GRD", "OFF", "CONT"], "start2", "2")}
          <div class="b-hint">GRD holds until the starter cuts out (about 56% N2).</div>
        </section>
        <section class="b-box">
          <div class="b-title">LIGHTS</div>
          <div class="b-grid3">${tog("switches.position", "POSITION", "position")}${tog("switches.beacon", "ANTI COLLISION", "beacon")}${tog("switches.strobe", "STROBE", "strobe")}
          ${tog("switches.landing", "LANDING", "landing")}${tog("switches.taxi", "TAXI", "taxi")}${tog("switches.seatBelts", "FASTEN BELTS", "seatBelts")}</div>
        </section>
      </div>`,
    );
    const sw = () => this.c.switches;
    this.el.querySelectorAll<HTMLElement>("[data-bus]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.bus);
        const src = b.dataset.src as "APU" | "ENG";
        sw().bus[i] = sw().bus[i] === src ? "" : src;
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-apu]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = b.dataset.apu;
        if (v === "START") {
          sw().apuOn = true;
          sw().apuStartPresses++;
        } else sw().apuOn = v === "ON";
        b.blur();
      }),
    );
    this.lights = {
      "gen-0": (s) => (s.sys.genOffBus[0] ? "GEN OFF BUS" : ""),
      "gen-1": (s) => (s.sys.genOffBus[1] ? "GEN OFF BUS" : ""),
      apugen: (s) => (s.sys.apuGenOffBus ? "APU GEN OFF BUS" : ""),
      "busoff-0": (s) => (s.sys.dcPower && s.sys.busOff[0] ? "BUS 1 OFF" : ""),
      "busoff-1": (s) => (s.sys.dcPower && s.sys.busOff[1] ? "BUS 2 OFF" : ""),
      "irs-0": (s) => (s.sys.irsAligning[0] ? "ALIGN" : ""),
      "irs-1": (s) => (s.sys.irsAligning[1] ? "ALIGN" : ""),
    };
    for (let i = 0; i < 6; i++) this.lights[`fuel-${i}`] = (s) => (s.sys.dcPower && s.sys.fuelLowPress[i] ? "LOW PRESSURE" : "");
    for (let i = 0; i < 4; i++) this.lights[`hyd-${i}`] = (s) => (s.sys.dcPower && s.sys.hydLowPress[i] ? "LOW PRESSURE" : "");
  }

  update(s: State737 | null) {
    super.update(s);
    const sw = this.c.switches;
    this.el.querySelectorAll<HTMLElement>("[data-bus]").forEach((b) => b.classList.toggle("on", sw.bus[Number(b.dataset.bus)] === b.dataset.src));
    this.el.querySelectorAll<HTMLElement>("[data-apu]").forEach((b) => b.classList.toggle("on", (b.dataset.apu === "ON") === sw.apuOn && b.dataset.apu !== "START"));
    if (!s) return;
    const g = (k: string, t: string) => ((this.el.querySelector(`[data-g="${k}"]`) as HTMLElement).textContent = t);
    g("apuegt", s.sys.apuN > 1 ? `${Math.round(s.sys.apuEgtC)} °C` : "--");
    g("hyd", s.sys.dcPower ? `${Math.round(s.sys.hydPsi[0])} / ${Math.round(s.sys.hydPsi[1])}` : "--");
    g("duct", s.sys.dcPower ? `${Math.round(s.sys.ductPsi)} psi` : "--");
    const irs = this.el.querySelector<HTMLElement>('[data-lt="irs-0"]')!;
    if (s.sys.irsSecondsLeft) irs.title = `${s.sys.irsSecondsLeft} s to align`;
  }
}

export interface McpCallbacks {
  send: (a: McpAction) => void;
  /** Local copy of the MCP windows, changed by the knobs. */
  values: () => McpValues;
}

export class Glareshield737 extends PanelBase {
  private cb: McpCallbacks;

  constructor(parent: HTMLElement, c: Controls737, cb: McpCallbacks) {
    const btn = (kind: string, label: string) => `<button class="b-mcp-btn" data-mcp="${kind}" data-ctl="mcp-${kind}"><i></i>${label}</button>`;
    const knob = (k: string, label: string) =>
      `<div class="b-knob" data-ctl="mcp-${k}"><span>${label}</span><b data-win="${k}"></b><div><button data-knob="${k}" data-d="-1">−</button><button data-knob="${k}" data-d="1">+</button></div></div>`;
    super(
      parent,
      "b-glare",
      c,
      `
      <button class="b-firewarn" data-ctl="fire-warn" data-firewarn>FIRE<br>WARN</button>
      <section class="b-box b-efis">
        <div class="b-title">EFIS</div>
        <div class="b-knob" data-ctl="efis-baro"><span>BARO</span><b data-win="baro"></b><div><button data-baro="-1">−</button><button data-baro="1">+</button><button data-baro="std">STD</button></div></div>
        <div class="b-seg">${["APP", "VOR", "MAP"].map((m) => `<button data-ctl="efis-${m}" data-set="x.ndMode" data-v="${m}">${m}</button>`).join("")}</div>
        <div class="b-knob" data-ctl="efis-range"><span>RANGE</span><b data-win="range"></b><div><button data-range="-1">−</button><button data-range="1">+</button></div></div>
      </section>
      <section class="b-box b-mcp">
        <div class="b-mcp-row">
          ${knob("crs", "COURSE")}
          <div class="b-mcp-col">${btn("fd", "F/D")}${btn("atArm", "A/T ARM")}</div>
          <div class="b-mcp-col">${btn("n1", "N1")}${btn("speed", "SPEED")}</div>
          ${knob("spd", "IAS")}
          <div class="b-mcp-col">${btn("lvlchg", "LVL CHG")}${btn("vnav", "VNAV")}</div>
          ${knob("hdg", "HEADING")}
          <div class="b-mcp-col">${btn("hdgsel", "HDG SEL")}${btn("lnav", "LNAV")}${btn("vorloc", "VOR LOC")}</div>
          ${knob("alt", "ALTITUDE")}
          <div class="b-mcp-col">${btn("althold", "ALT HOLD")}${btn("vs", "V/S")}</div>
          ${knob("vsw", "VERT SPEED")}
          <div class="b-mcp-col">${btn("cmdA", "CMD A")}</div>
        </div>
        <div class="b-hint">Hold Shift on − or + for bigger steps.</div>
      </section>`,
    );
    this.el.querySelector<HTMLElement>("[data-firewarn]")!.addEventListener("click", (e) => {
      // Pressing a FIRE WARN light silences the bell and turns the lights off.
      this.c.x.fireWarn = false;
      (e.currentTarget as HTMLElement).blur();
    });
    this.cb = cb;
    this.el.querySelectorAll<HTMLElement>("[data-mcp]").forEach((b) =>
      b.addEventListener("click", () => {
        cb.send({ kind: b.dataset.mcp } as McpAction);
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-knob]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const k = b.dataset.knob!;
        const d = Number(b.dataset.d) * ((e as MouseEvent).shiftKey ? 10 : 1);
        const v = cb.values();
        if (k === "crs") this.c.crs1 = ((this.c.crs1 + d - 1 + 360) % 360) + 1;
        else if (k === "spd") cb.send({ kind: "set", field: "spd", value: Math.max(100, Math.min(340, v.spd + d)) });
        else if (k === "hdg") cb.send({ kind: "set", field: "hdg", value: (v.hdg + d + 360) % 360 });
        else if (k === "alt") cb.send({ kind: "set", field: "alt", value: Math.max(0, Math.min(41000, v.alt + d * 100)) });
        else if (k === "vsw") cb.send({ kind: "set", field: "vs", value: Math.max(-6000, Math.min(6000, v.vs + Math.sign(d) * (Math.abs(d) > 1 ? 1000 : 100))) });
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-baro]").forEach((b) =>
      b.addEventListener("click", () => {
        const baro = this.c.x.baro;
        if (b.dataset.baro === "std") baro.std = !baro.std;
        else if (!baro.std) baro.qnh = Math.max(945, Math.min(1050, baro.qnh + Number(b.dataset.baro)));
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-range]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = ND_RANGES.indexOf(this.c.x.ndRange) + Number(b.dataset.range);
        this.c.x.ndRange = ND_RANGES[Math.max(0, Math.min(ND_RANGES.length - 1, i))];
        b.blur();
      }),
    );
  }

  update(s: State737 | null) {
    super.update(s);
    this.el.querySelector("[data-firewarn]")?.classList.toggle("lit", this.c.x.fireWarn && !!s?.sys.dcPower);
    const w = (k: string, t: string) => ((this.el.querySelector(`[data-win="${k}"]`) as HTMLElement).textContent = t);
    const x = this.c.x;
    w("baro", x.baro.std ? "STD" : `${x.baro.qnh} HPA`);
    w("range", String(x.ndRange));
    w("crs", String(this.c.crs1).padStart(3, "0"));
    const v = this.cb.values();
    const on = !!s?.sys.dcPower;
    w("spd", on ? String(v.spd) : "");
    w("hdg", on ? String(v.hdg).padStart(3, "0") : "");
    w("alt", on ? String(v.alt) : "");
    w("vsw", on ? (s!.afcs.pitch === "V/S" ? (v.vs > 0 ? "+" : "") + v.vs : "") : "");
    if (!s) return;
    const a = s.afcs;
    const lit: Record<string, boolean> = {
      fd: a.fd,
      atArm: a.atArm,
      n1: a.at === "N1",
      speed: a.at === "MCP SPD",
      lvlchg: a.pitch === "MCP SPD",
      vnav: a.pitch === "VNAV SPD" || a.pitch === "VNAV PTH",
      hdgsel: a.roll === "HDG SEL",
      lnav: a.roll === "LNAV",
      vorloc: a.roll === "VOR/LOC" || a.rollArmed === "VOR/LOC",
      althold: a.pitch === "ALT HOLD",
      vs: a.pitch === "V/S",
      cmdA: a.cmdA,
    };
    this.el.querySelectorAll<HTMLElement>("[data-mcp]").forEach((b) => b.classList.toggle("on", on && !!lit[b.dataset.mcp!]));
  }
}

export interface PedestalCallbacks {
  morse: () => void;
}

export class Pedestal737 extends PanelBase {
  private typing = "";


  constructor(parent: HTMLElement, c: Controls737, cdu: HTMLElement, cb: PedestalCallbacks) {
    const radio = (k: "vhf" | "nav", title: string) => `
      <section class="b-box b-radio" data-ctl="${k}">
        <div class="b-title">${title}</div>
        <div class="b-freqs"><b data-f="${k}-0"></b><button data-swap="${k}" data-ctl="${k}-swap" title="Transfer">⇆</button><b data-f="${k}-1" class="sb"></b></div>
        <div class="b-tune">
          <button data-tune="${k}-mhz-down">−</button><button data-tune="${k}-mhz-up">+</button><i>MHz</i>
          <button data-tune="${k}-khz-down">−</button><button data-tune="${k}-khz-up">+</button><i>kHz</i>
          ${k === "nav" ? '<button data-ctl="nav-id" data-id>ID</button>' : ""}
        </div>
      </section>`;
    super(
      parent,
      "b-ped",
      c,
      `
      <div class="b-ped-row">
        <div id="b-cdu-slot"></div>
        <div class="b-ped-side">
          <div class="b-row">
            <section class="b-box b-lever" data-ctl="throttle">
              <div class="b-title">THRUST LEVERS</div>
              <div class="b-bar"><i data-bar="throttle"></i></div>
              <div class="b-val" data-val="throttle"></div>
              <div class="b-btns"><button data-thr="idle">IDLE</button><button data-thr="-0.02">−</button><button data-thr="0.02">+</button></div>
            </section>
            <section class="b-box">
              <div class="b-title">START LEVERS</div>
              ${sel("switches.startLever.0", ["IDLE", "CUTOFF"], "lever1", "1")}
              ${sel("switches.startLever.1", ["IDLE", "CUTOFF"], "lever2", "2")}
            </section>
            <section class="b-box">
              <div class="b-title">FLAPS</div>
              <div class="b-seg b-flaps">${[0, 1, 5, 15, 30, 40].map((f) => `<button data-ctl="flaps-${f}" data-set="flaps" data-v="${f}">${f}</button>`).join("")}</div>
              <div class="b-title">PARKING BRAKE</div>
              ${tog("switches.parkBrake", "SET", "parkBrake")}
            </section>
            ${mini()}
          </div>
          <div class="b-row">
            ${radio("vhf", "VHF 1")}
            ${radio("nav", "NAV 1")}
          </div>
          <section class="b-box b-fire">
            <div class="b-title">ENGINE FIRE</div>
            <div class="b-fire-row">
              ${[0, 1]
                .map(
                  (i) => `<div class="b-fire-eng">
                <button class="b-fire-handle" data-ctl="fire-${i + 1}" data-fire="${i}"><span>ENG ${i + 1}</span><small>PULL</small></button>
                <div class="b-fire-rot">
                  <button data-ctl="fire-${i + 1}-L" data-rot="${i}" data-b="0">◀ L</button>
                  <button data-ctl="fire-${i + 1}-R" data-rot="${i}" data-b="1">R ▶</button>
                </div>
              </div>`,
                )
                .join("")}
              <div class="b-fire-lts">${light("disch-0")}${light("disch-1")}</div>
            </div>
            <div class="b-hint">Pull the handle, then turn it to fire a bottle.</div>
          </section>
          <section class="b-box b-xpdr" data-ctl="xpdr">
            <div class="b-title">TRANSPONDER</div>
            <b class="b-code"></b>
            ${[0, 1, 2, 3, 4, 5, 6, 7].map((d) => `<button data-xd="${d}">${d}</button>`).join("")}
            ${["STBY", "XPNDR", "TA/RA"].map((m) => `<button data-ctl="xpdr-${m}" data-set="x.xpdrMode" data-v="${m}">${m}</button>`).join("")}
          </section>
        </div>
      </div>`,
    );
    this.el.querySelector("#b-cdu-slot")!.appendChild(cdu);
    for (let k = 0; k < 2; k++)
      this.lights[`disch-${k}`] = (s) => (s.sys.dcPower && this.c.switches.bottle[k] ? `${k ? "R" : "L"} BOTTLE DISCHARGED` : "");
    this.el.querySelectorAll<HTMLElement>("[data-thr]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const v = b.dataset.thr!;
        this.c.throttle = v === "idle" ? 0 : Math.max(0, Math.min(1, Math.round((this.c.throttle + Number(v) * ((e as MouseEvent).shiftKey ? 5 : 1)) * 100) / 100));
        b.blur();
      }),
    );
    // Engine fire handles: pull once (it stays up). Turning left or right fires bottle L or R into
    // that engine, only with the handle pulled, and each bottle only once.
    this.el.querySelectorAll<HTMLElement>("[data-fire]").forEach((b) =>
      b.addEventListener("click", () => {
        this.c.switches.fireHandle[Number(b.dataset.fire)] = true;
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-rot]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.rot);
        const k = Number(b.dataset.b);
        const sw = this.c.switches;
        if (sw.fireHandle[i] && sw.bottle[k] === 0) sw.bottle[k] = i + 1;
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-tune]").forEach((b) =>
      b.addEventListener("click", (e) => {
        const [k, unit, dir] = b.dataset.tune!.split("-") as ["vhf" | "nav", "mhz" | "khz", "up" | "down"];
        const r = k === "vhf" ? this.c.x.vhf1 : this.c.x.nav1;
        const steps = unit === "khz" && (e as MouseEvent).shiftKey ? 4 : 1;
        for (let i = 0; i < steps; i++) r[1] = tune(r[1], k === "vhf" ? "com" : "nav", unit === "mhz", dir === "up" ? 1 : -1);
        b.blur();
      }),
    );
    this.el.querySelectorAll<HTMLElement>("[data-swap]").forEach((b) =>
      b.addEventListener("click", () => {
        const r = b.dataset.swap === "vhf" ? this.c.x.vhf1 : this.c.x.nav1;
        [r[0], r[1]] = [r[1], r[0]];
        b.blur();
      }),
    );
    this.el.querySelector<HTMLElement>("[data-id]")!.addEventListener("click", (e) => {
      cb.morse();
      (e.currentTarget as HTMLElement).blur();
    });
    this.el.querySelectorAll<HTMLElement>("[data-xd]").forEach((b) =>
      b.addEventListener("click", () => {
        this.typing += b.dataset.xd;
        if (this.typing.length === 4) {
          this.c.x.xpdrCode = this.typing;
          this.typing = "";
        }
        b.blur();
      }),
    );
  }

  reset() {
    this.typing = "";
  }

  update(s: State737 | null) {
    super.update(s);
    const c = this.c;
    (this.el.querySelector("[data-bar=throttle]") as HTMLElement).style.height = `${(s ? s.throttle : c.throttle) * 100}%`;
    (this.el.querySelector("[data-val=throttle]") as HTMLElement).textContent = s && s.afcs.atThrottle >= 0 ? `A/T ${Math.round(s.throttle * 100)}%` : `${Math.round(c.throttle * 100)}%`;
    const on = !!s?.sys.acPower;
    const f = (k: string, t: string) => ((this.el.querySelector(`[data-f="${k}"]`) as HTMLElement).textContent = on ? t : "");
    f("vhf-0", freqText(c.x.vhf1[0]));
    f("vhf-1", freqText(c.x.vhf1[1]));
    f("nav-0", freqText(c.x.nav1[0], 2));
    f("nav-1", freqText(c.x.nav1[1], 2));
    (this.el.querySelector(".b-code") as HTMLElement).textContent = on ? (this.typing ? this.typing.padEnd(4, "_") : c.x.xpdrCode) : "";
    // Fire handles: red light with a fire, raised when pulled.
    this.el.querySelectorAll<HTMLElement>("[data-fire]").forEach((b) => {
      const i = Number(b.dataset.fire);
      b.classList.toggle("fire", !!s?.sys.fire[i] && !!s?.sys.dcPower);
      b.classList.toggle("pulled", c.switches.fireHandle[i]);
    });
  }
}
