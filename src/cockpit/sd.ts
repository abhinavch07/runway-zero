// Lower ECAM (system display): ENG, BLEED, ELEC, HYD, FUEL, APU, DOOR and F/CTL pages.
// Simplified training pages in the spirit of the A320 family, our own drawings and layout.
import type { Controls, EcamPage, SimState } from "../sim/types";

const SIZE = 420;
const WHITE = "#ffffff";
const GREEN = "#2fd24a";
const AMBER = "#ff9f1a";
const CYAN = "#3fd4ff";
const GREY = "#7a828c";

export class SystemDisplay {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    this.g = canvas.getContext("2d")!;
    this.g.scale(dpr, dpr);
  }

  /** The page shown: ENG during engine start, ELEC during the GEN 1 fault, otherwise the chosen page. */
  static pageFor(s: SimState, c: Controls, alertActive: boolean): EcamPage {
    const starting = c.switches.engMode === "IGN" || s.systems.engines.some((e) => e.phase === "CRANK" || e.phase === "LIGHT");
    if (starting) return "ENG";
    if (alertActive) return "ELEC";
    return c.extras?.ecamPage ?? "DOOR";
  }

  draw(s: SimState, c: Controls, page: EcamPage) {
    const g = this.g;
    g.save();
    g.fillStyle = "#000";
    g.fillRect(0, 0, SIZE, SIZE);
    g.textBaseline = "middle";
    g.font = "bold 16px ui-monospace, Menlo, monospace";
    g.textAlign = "left";
    g.fillStyle = WHITE;
    g.fillText(page, 14, 18);
    g.strokeStyle = WHITE;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(14, 28);
    g.lineTo(14 + g.measureText(page).width, 28);
    g.stroke();
    switch (page) {
      case "ENG":
        this.eng(s, c);
        break;
      case "BLEED":
        this.bleed(s, c);
        break;
      case "ELEC":
        this.elec(s, c);
        break;
      case "HYD":
        this.hyd(s, c);
        break;
      case "FUEL":
        this.fuel(s, c);
        break;
      case "APU":
        this.apu(s, c);
        break;
      case "DOOR":
        this.door(s);
        break;
      case "F/CTL":
        this.fctl(s, c);
        break;
    }
    // Bottom strip: air temperature and gross weight.
    g.strokeStyle = GREY;
    g.beginPath();
    g.moveTo(0, 384);
    g.lineTo(SIZE, 384);
    g.stroke();
    g.font = "13px ui-monospace, Menlo, monospace";
    g.fillStyle = WHITE;
    g.textAlign = "left";
    g.fillText("SAT", 14, 402);
    g.fillStyle = GREEN;
    g.fillText("+25 °C", 48, 402);
    g.fillStyle = WHITE;
    g.textAlign = "right";
    g.fillText("FOB", 330, 402);
    g.fillStyle = GREEN;
    g.fillText(`${Math.round(s.fuelKg / 10) * 10} KG`, SIZE - 12, 402);
    g.restore();
  }

  private text(t: string, x: number, y: number, colour = WHITE, align: CanvasTextAlign = "center", size = 14) {
    const g = this.g;
    g.font = `${size}px ui-monospace, Menlo, monospace`;
    g.fillStyle = colour;
    g.textAlign = align;
    g.fillText(t, x, y);
  }

  private box(x: number, y: number, w: number, h: number, colour = WHITE) {
    this.g.strokeStyle = colour;
    this.g.lineWidth = 1.5;
    this.g.strokeRect(x, y, w, h);
  }

  private line(x1: number, y1: number, x2: number, y2: number, colour = GREEN) {
    const g = this.g;
    g.strokeStyle = colour;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  }

  private eng(s: SimState, c: Controls) {
    const sys = s.systems;
    // Our training layout: N2 and EGT per engine (the real page shows oil, vibration and start air;
    // N2 and EGT live on the upper ECAM). Shown here so the start can be watched from the pedestal.
    const xs = [110, 310];
    this.text("ENG", 210, 70, GREY);
    for (let i = 0; i < 2; i++) {
      const e = sys.engines[i];
      const run = e.phase === "RUN";
      const x = xs[i];
      this.text(String(i + 1), x, 50, WHITE, "center", 16);
      this.text(e.n2.toFixed(1), x, 90, GREEN, "center", 20);
      this.text(Math.round(e.egtC).toString(), x, 130, GREEN, "center", 20);
      this.text(run ? e.n1.toFixed(1) : e.n1.toFixed(1), x, 170, GREEN, "center", 18);
      const oil = run ? 30 + e.n2 * 0.25 : e.n2 * 0.4;
      this.text(oil.toFixed(0), x, 210, GREEN, "center", 18);
      const startValve = e.phase === "CRANK" || e.phase === "LIGHT";
      this.text(startValve ? "START VALVE OPEN" : "START VALVE SHUT", x, 252, startValve ? GREEN : GREY, "center", 12);
      this.text(c.switches.engMode === "IGN" && e.phase !== "OFF" ? "IGN A" : "", x, 278, GREEN, "center", 13);
    }
    this.text("N2 %", 210, 90, CYAN, "center", 12);
    this.text("EGT °C", 210, 130, CYAN, "center", 12);
    this.text("N1 %", 210, 170, CYAN, "center", 12);
    this.text("OIL PSI", 210, 210, CYAN, "center", 12);
    this.text(`START AIR ${Math.round(sys.bleedPsi)} PSI`, 210, 320, sys.bleedPsi >= 25 ? GREEN : AMBER, "center", 14);
  }

  private bleed(s: SimState, c: Controls) {
    const sys = s.systems;
    const sw = c.switches;
    const running = sys.engines.map((e) => e.phase === "RUN");
    // Duct across the middle.
    this.line(60, 230, 360, 230, sys.bleedPsi > 0 ? GREEN : AMBER);
    this.text(`${Math.round(sys.bleedPsi)} PSI`, 210, 250, sys.bleedPsi > 0 ? GREEN : AMBER, "center", 14);
    const valve = (x: number, y: number, open: boolean, label: string) => {
      // Shut in normal operation is shown green (crossline), not amber.
      this.g.strokeStyle = GREEN;
      this.g.lineWidth = 2;
      this.g.beginPath();
      this.g.arc(x, y, 12, 0, Math.PI * 2);
      this.g.stroke();
      if (open) this.line(x, y - 12, x, y + 12, GREEN);
      else this.line(x - 12, y, x + 12, y, GREEN);
      this.text(label, x, y + 28, WHITE, "center", 12);
    };
    valve(90, 300, sw.engBleed1 && running[0], "ENG 1");
    valve(330, 300, sw.engBleed2 && running[1], "ENG 2");
    valve(210, 300, sw.apuBleed && sys.apuAvail, "APU");
    for (const [x, i, label] of [
      [90, 0, "PACK 1"],
      [330, 1, "PACK 2"],
    ] as [number, number, string][]) {
      const on = sys.packFlow[i];
      this.box(x - 42, 110, 84, 40, on ? GREEN : AMBER);
      this.text(label, x, 130, on ? GREEN : AMBER, "center", 13);
      this.line(x, 150, x, 230, on ? GREEN : GREY);
    }
    this.text(sys.wingAntiIceOn ? "WING ANTI ICE ON" : "", 210, 70, GREEN, "center", 13);
  }

  private elec(s: SimState, c: Controls) {
    const sys = s.systems;
    const sw = c.switches;
    // Source boxes along the bottom: GEN 1, APU GEN, EXT PWR, GEN 2.
    const src = (x: number, label: string, on: boolean, fault: boolean, offSw: boolean) => {
      const col = fault ? AMBER : on ? GREEN : WHITE;
      this.box(x - 40, 270, 80, 66, fault ? AMBER : WHITE);
      this.text(label, x, 286, fault ? AMBER : WHITE, "center", 13);
      this.text(fault ? "FAULT" : offSw ? "OFF" : on ? "115 V" : "", x, 308, col, "center", 13);
      this.text(on ? "400 HZ" : "", x, 326, col, "center", 12);
    };
    const gen1Fault = sys.gen1Failed && sw.gen1 && sys.engines[0].phase === "RUN";
    src(60, "GEN 1", sys.genOn[0], gen1Fault, !sw.gen1);
    src(160, "APU GEN", sys.apuGenOn, false, !sw.apuGen);
    src(260, "EXT PWR", sys.acSource === "EXT", false, false);
    src(360, "GEN 2", sys.genOn[1], false, !sw.gen2);
    // AC buses at the top, fed by the matching generator, else the APU, else the other generator.
    const ext = sys.acSource === "EXT";
    const feed1 = sys.genOn[0] ? 60 : sys.apuGenOn ? 160 : ext ? 260 : sys.genOn[1] ? 360 : null;
    const feed2 = sys.genOn[1] ? 360 : sys.apuGenOn ? 160 : ext ? 260 : sys.genOn[0] ? 60 : null;
    for (const [x, label, feed] of [
      [90, "AC 1", feed1],
      [330, "AC 2", feed2],
    ] as [number, string, number | null][]) {
      this.box(x - 46, 70, 92, 32, feed === null ? AMBER : GREEN);
      this.text(label, x, 86, feed === null ? AMBER : GREEN, "center", 14);
      if (feed !== null) {
        this.line(x, 102, x, 180);
        this.line(x, 180, feed, 180);
        this.line(feed, 180, feed, 270);
      }
    }
    this.text(`BAT 1 ${sys.batVolts[0].toFixed(1)} V   BAT 2 ${sys.batVolts[1].toFixed(1)} V`, 210, 46, GREEN, "center", 12);
  }

  private hyd(s: SimState, c: Controls) {
    const sys = s.systems;
    const names = ["GREEN", "BLUE", "YELLOW"];
    const xs = [90, 210, 330];
    for (let i = 0; i < 3; i++) {
      const psi = sys.hydPsi[i];
      const ok = psi >= 1450;
      this.text(names[i], xs[i], 70, ok ? WHITE : AMBER, "center", 15);
      this.text(String(Math.round(psi / 50) * 50), xs[i], 100, ok ? GREEN : AMBER, "center", 18);
      this.line(xs[i], 115, xs[i], 260, ok ? GREEN : AMBER);
      this.box(xs[i] - 30, 260, 60, 30, ok ? GREEN : AMBER);
    }
    const sw = c.switches;
    this.text(sw.hydEng1Pump ? "ENG 1 PUMP" : "ENG 1 PUMP OFF", 90, 310, sw.hydEng1Pump ? WHITE : AMBER, "center", 12);
    this.text(sw.hydBlueElec ? "ELEC PUMP" : "ELEC PUMP OFF", 210, 310, sw.hydBlueElec ? WHITE : AMBER, "center", 12);
    this.text(sw.hydEng2Pump ? "ENG 2 PUMP" : "ENG 2 PUMP OFF", 330, 310, sw.hydEng2Pump ? WHITE : AMBER, "center", 12);
    this.text(sw.hydYellowElec ? "ELEC PUMP ON" : "", 330, 328, CYAN, "center", 12);
    this.text(sw.hydPtu ? (sys.ptuRunning ? "PTU ◀▶ RUNNING" : "PTU") : "PTU OFF", 210, 350, sw.hydPtu ? GREEN : AMBER, "center", 13);
  }

  private fuel(s: SimState, c: Controls) {
    const sys = s.systems;
    const sw = c.switches;
    const [l, ctr, r] = sys.tanksKg;
    // Engines at the top with their fuel flow and which tank feeds them.
    for (let i = 0; i < 2; i++) {
      const x = i ? 330 : 90;
      const e = sys.engines[i];
      this.text(`ENG ${i + 1}`, x, 54, WHITE, "center", 14);
      this.text(`${Math.round(e.fuelFlowKgH)} KG/H`, x, 74, GREEN, "center", 13);
      this.text(`FROM ${sys.feed[i] === "C" ? "CTR" : sys.feed[i]}`, x, 94, CYAN, "center", 12);
    }
    // Crossfeed valve in the middle of the line joining both sides.
    const open = sys.xfeedOpen;
    this.line(90, 130, 190, 130, GREEN);
    this.line(230, 130, 330, 130, GREEN);
    this.g.strokeStyle = GREEN;
    this.g.lineWidth = 2;
    this.g.beginPath();
    this.g.arc(210, 130, 14, 0, Math.PI * 2);
    this.g.stroke();
    if (open) this.line(196, 130, 224, 130, GREEN);
    else this.line(210, 116, 210, 144, GREEN);
    this.text(open ? "X FEED OPEN" : "X FEED", 210, 158, open ? GREEN : WHITE, "center", 11);
    this.line(90, 104, 90, 130);
    this.line(330, 104, 330, 130);
    // Tanks along the bottom with their pumps.
    const tank = (x: number, w: number, label: string, kg: number) => {
      this.box(x - w / 2, 250, w, 76, WHITE);
      this.text(label, x, 266, WHITE, "center", 12);
      this.text(String(Math.round(kg / 10) * 10), x, 296, GREEN, "center", 20);
    };
    tank(80, 120, "L WING", l);
    tank(210, 110, "CTR", ctr);
    tank(340, 120, "R WING", r);
    const pump = (x: number, on: boolean) => {
      const pr = on && sys.acPower;
      this.box(x - 14, 212, 28, 24, pr ? GREEN : AMBER);
      this.text(pr ? "▮" : "LO", x, 224, pr ? GREEN : AMBER, "center", 11);
    };
    pump(58, sw.fuelL1);
    pump(102, sw.fuelL2);
    pump(192, sw.fuelCtr1);
    pump(228, sw.fuelCtr2);
    pump(318, sw.fuelR1);
    pump(362, sw.fuelR2);
    this.line(80, 130, 80, 212, sys.fuelPressL ? GREEN : GREY);
    this.line(340, 130, 340, 212, sys.fuelPressR ? GREEN : GREY);
    this.text("KG", 210, 342, CYAN, "center", 12);
    const diff = Math.abs(l - r);
    if (diff > 300) this.text(`IMBALANCE ${Math.round(diff / 10) * 10} KG`, 210, 362, AMBER, "center", 12);
  }

  /** A round gauge from lo to hi over 240 degrees, with an amber and a red band near the top. */
  private gauge(x: number, y: number, r: number, v: number, lo: number, hi: number, amber: number, red: number, digits: string, label: string, unit: string) {
    const g = this.g;
    const a0 = Math.PI * 0.75;
    const span = Math.PI * 1.25;
    const ang = (val: number) => a0 + ((Math.max(lo, Math.min(hi, val)) - lo) / (hi - lo)) * span;
    g.lineWidth = 2;
    const arc = (from: number, to: number, colour: string) => {
      g.strokeStyle = colour;
      g.beginPath();
      g.arc(x, y, r, ang(from), ang(to));
      g.stroke();
    };
    arc(lo, amber, WHITE);
    arc(amber, red, AMBER);
    arc(red, hi, "#ff3b3b");
    g.strokeStyle = GREEN;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang(v)) * (r - 4), y + Math.sin(ang(v)) * (r - 4));
    g.stroke();
    this.text(digits, x + 18, y + 28, GREEN, "center", 20);
    this.text(label, x - r - 14, y - r + 6, WHITE, "left", 14);
    this.text(unit, x + r + 4, y + 28, CYAN, "left", 12);
  }

  private apu(s: SimState, c: Controls) {
    const sys = s.systems;
    const sw = c.switches;
    // APU GEN: shown once the APU runs. Our own simple load figure.
    this.box(30, 50, 130, 96, sys.apuAvail ? WHITE : GREY);
    this.text("APU GEN", 95, 66, sys.apuAvail && !sw.apuGen ? AMBER : WHITE, "center", 14);
    if (sys.apuAvail && sw.apuGen) {
      const load = sys.apuGenOn ? (sys.engines.some((e) => e.phase === "RUN") ? 12 : 28) : 0;
      this.text(String(load), 80, 90, GREEN, "right", 16);
      this.text("%", 88, 90, CYAN, "left", 12);
      this.text("115", 80, 112, GREEN, "right", 16);
      this.text("V", 88, 112, CYAN, "left", 12);
      this.text("400", 80, 134, GREEN, "right", 16);
      this.text("HZ", 88, 134, CYAN, "left", 12);
    } else if (sys.apuAvail) this.text("OFF", 95, 110, WHITE, "center", 14);
    // APU BLEED: pressure while the APU runs, valve open or shut.
    this.box(260, 50, 130, 70, sys.apuAvail ? WHITE : GREY);
    this.text("APU BLEED", 325, 66, WHITE, "center", 14);
    this.text(sys.apuAvail ? "35" : "XX", 320, 96, sys.apuAvail ? GREEN : AMBER, "right", 18);
    this.text("PSI", 326, 96, CYAN, "left", 12);
    const open = sw.apuBleed && sys.apuAvail;
    this.line(325, 120, 325, open ? 160 : 136, open ? GREEN : WHITE);
    this.text(open ? "VALVE OPEN" : "VALVE SHUT", 325, 174, open ? GREEN : WHITE, "center", 12);
    // AVAIL and the intake flap.
    if (sys.apuAvail) this.text("AVAIL", 210, 66, GREEN, "center", 18);
    this.text(sys.apuFlapOpen ? "FLAP OPEN" : sw.apuMaster && sys.dcPower ? "FLAP MOVING" : "", 325, 360, GREEN, "center", 14);
    // Speed (N) and EGT gauges.
    const on = sw.apuMaster && sys.dcPower;
    this.gauge(110, 240, 52, sys.apuN, 0, 120, 102, 107, on ? Math.round(sys.apuN).toString() : "XX", "N", "%");
    this.gauge(110, 340 - 14, 40, sys.apuEgtC, 300, 1100, 900, 1000, on ? String(Math.round(sys.apuEgtC / 5) * 5) : "XX", "EGT", "°C");
    if (sys.apuStarting) this.text("STARTING", 325, 230, GREEN, "center", 14);
  }

  private door(s: SimState) {
    const closed = s.systems.doorsClosed;
    // Fuselage outline seen from above.
    const g = this.g;
    g.strokeStyle = WHITE;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(170, 60);
    g.quadraticCurveTo(210, 30, 250, 60);
    g.lineTo(250, 340);
    g.lineTo(170, 340);
    g.closePath();
    g.stroke();
    const door = (x: number, y: number, label: string, side: "L" | "R") => {
      const col = closed ? GREEN : AMBER;
      this.box(x, y, 14, 26, col);
      this.text(label, side === "L" ? x - 8 : x + 22, y + 13, col, side === "L" ? "right" : "left", 12);
    };
    door(163, 90, closed ? "CABIN" : "CABIN OPEN", "L");
    door(243, 90, closed ? "" : "OPEN", "R");
    door(163, 290, closed ? "CABIN" : "CABIN OPEN", "L");
    door(243, 290, closed ? "" : "OPEN", "R");
    door(243, 150, closed ? "CARGO" : "CARGO OPEN", "R");
    door(243, 240, closed ? "CARGO" : "CARGO OPEN", "R");
    this.text(closed ? "SLIDES ARMED" : "", 210, 360, GREEN, "center", 13);
  }

  private fctl(s: SimState, c: Controls) {
    const sf = s.surfaces;
    const hyd = s.systems.hydPsi.some((p) => p > 1450);
    const scale = (x: number, y: number, label: string, v: number, vertical: boolean) => {
      this.text(label, x, y - 70, WHITE, "center", 13);
      const g = this.g;
      g.strokeStyle = WHITE;
      g.lineWidth = 1.5;
      if (vertical) {
        g.beginPath();
        g.moveTo(x, y - 50);
        g.lineTo(x, y + 50);
        g.stroke();
        g.fillStyle = hyd ? GREEN : AMBER;
        g.beginPath();
        g.moveTo(x - 4, y - v * 48);
        g.lineTo(x - 16, y - v * 48 - 7);
        g.lineTo(x - 16, y - v * 48 + 7);
        g.closePath();
        g.fill();
      } else {
        g.beginPath();
        g.moveTo(x - 60, y);
        g.lineTo(x + 60, y);
        g.stroke();
        g.fillStyle = hyd ? GREEN : AMBER;
        g.beginPath();
        g.moveTo(x + v * 58, y - 4);
        g.lineTo(x + v * 58 - 7, y - 16);
        g.lineTo(x + v * 58 + 7, y - 16);
        g.closePath();
        g.fill();
      }
    };
    scale(110, 160, "ELEV", sf.elevator, true);
    scale(310, 160, "AIL", sf.aileron, true);
    scale(210, 310, "RUD", sf.rudder, false);
    const x = c.extras;
    if (x) {
      const tick = (b: boolean) => (b ? "✓" : "·");
      this.text(
        `STICK  FWD ${tick(x.fctl.down)}  AFT ${tick(x.fctl.up)}  L ${tick(x.fctl.left)}  R ${tick(x.fctl.right)}`,
        210,
        360,
        CYAN,
        "center",
        12,
      );
    }
    if (!hyd) this.text("NO HYD PRESSURE", 210, 230, AMBER, "center", 13);
  }
}
