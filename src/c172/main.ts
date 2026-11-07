// Runway Zero, light aircraft page: a glass-cockpit procedures trainer for the C172 (c172.html)
// and the PA-28 (pa28.html, body data-aircraft="pa28"). The JSBSim model runs in a worker. The page
// shows the PFD and MFD, or the lower panel, with the same lesson list, quiz, progress and sound
// as the A320.
import { glossarize, enableGlossaryTips } from "../glossary/glossary";
import "../style.css";
import "./style.css";
import { C172Pfd } from "./cockpit/pfd";
import { C172Mfd } from "./cockpit/mfd";
import { C172LowerPanel } from "./cockpit/panel";
import { C172_LESSONS, type C172Lesson, type C172Panel } from "./lessons";
import { PA28_LESSONS } from "./pa28Lessons";
import { GA_VARIANTS, type GaId } from "./sim/variant";
import {
  coldC172Switches,
  runningC172Switches,
  type C172Controls,
  type C172FromWorker,
  type C172Start,
  type C172State,
  type C172ToWorker,
  defaultC172Radios,
} from "./sim/types";
import { RadioBox } from "../radio/radioBox";
import { readNav, type NavReading } from "../radio/navReceiver";
import { tune } from "../radio/training";
import { ChecklistPanel } from "../shell/checklist";
import { ExploreMode } from "../shell/explore";
import { gaExplore } from "../explore/ga";
import { gaChecklists, type GaCheck } from "../checklists/ga";
import { LessonPanel } from "../cockpit/lessonPanel";
import { QuizDialog } from "../cockpit/quiz";
import { Sound } from "../audio/sound";
import { PASS_MARK, QUIZZES } from "../lessons/quizzes";
import { markFinished, recordScore } from "../lessons/progress";
import { LessonPicker, lessonFromUrl } from "../shell/picker";
import { destination } from "../world/geo";
import { RWY28_COURSE_T, VIDP, rwy28Along } from "../world/vidp";
import { OutsideView } from "./cockpit/outside";
import { MiniPfd } from "./cockpit/miniPfd";
import { FlightKeys } from "./flightKeys";
import { FIELD_FT, RWY_LENGTH_M, RWY_WIDTH_M, TAXI, rwyPos, rwyToLatLon, trueHdg } from "./world";
import { angleDiff } from "../world/geo";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const variant = GA_VARIANTS[(document.body.dataset.aircraft as GaId | undefined) ?? "c172"];
const LESSONS = variant.id === "pa28" ? PA28_LESSONS : C172_LESSONS;

// Parked south of runway 28 at Delhi, facing north-west. A training position, not a real stand.
const parkedAt = destination(rwy28Along(600), RWY28_COURSE_T + 270, 160);
const START_BASE = {
  latDeg: parkedAt.latDeg,
  lonDeg: parkedAt.lonDeg,
  headingDeg: Math.round((RWY28_COURSE_T + 30) % 360),
  terrainFt: VIDP.runways[1].ends[1].elevationFt,
  fuelGalPerTank: 20,
};

const controls: C172Controls = {
  throttle: 0,
  mixture: 0,
  flaps: 0,
  trim: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
  brakes: 0,
  switches: coldC172Switches(variant.coldFuelSel),
  baro: { qnh: 1013, std: false },
  hdgBug: 330,
  radios: defaultC172Radios(),
};
let worldQnh = 1013;
/** Transponder code being typed (4 digits complete it). */
let xpdrTyping = "";
// Lesson failure state.
let failSent = false;
let altSeenOff = false;
let warned = false;
let readyAt = 0;

// ---------- Worker ----------
const worker = new Worker(new URL("./sim/worker.ts", import.meta.url), { type: "module" });
const send = (msg: C172ToWorker) => worker.postMessage(msg);
let initialised = false;
let ready = false;
let latest: C172State | null = null;
let currentLesson: C172Lesson | null = null;

worker.onmessage = (ev: MessageEvent<C172FromWorker>) => {
  const msg = ev.data;
  if (msg.type === "ready") onReady();
  else if (msg.type === "state") latest = msg.state;
  else if (msg.type === "error") showError(msg.message);
  else if (msg.type === "log") console.debug("[jsbsim]", msg.message);
};
worker.onerror = (e) => showError(e.message || "The simulation worker stopped");

function startLesson(lesson: C172Lesson) {
  currentLesson = lesson;
  ready = false;
  latest = null;
  $("loading").classList.remove("hidden");
  const start: C172Start = { id: lesson.id, name: lesson.title, ...START_BASE, running: lesson.running, fuelGal: lesson.fuelGal };
  if (lesson.start) {
    // First flight lessons start at a place in the runway 28 frame, some of them already flying.
    Object.assign(start, rwyToLatLon(lesson.start.x, lesson.start.y));
    start.headingDeg = trueHdg(lesson.start.h);
    start.terrainFt = FIELD_FT;
    start.air = lesson.start.air;
  }
  if (!initialised) {
    initialised = true;
    send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start, variant: variant.id });
  } else {
    send({ type: "reset", start });
  }
}

function onReady() {
  const lesson = currentLesson!;
  const sw = lesson.running ? runningC172Switches(variant.coldFuelSel) : coldC172Switches(variant.coldFuelSel);
  lesson.switches?.(sw);
  Object.assign(controls, {
    throttle: lesson.running ? 0.15 : 0,
    mixture: lesson.running ? 1 : 0,
    flaps: 0,
    trim: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    brakes: 0,
    hdgBug: 330,
    primeStrokes: 0,
    ...lesson.controls,
    switches: sw,
    baro: { qnh: 1013, std: false },
    radios: { ...defaultC172Radios(), ...lesson.radios },
  });
  xpdrTyping = "";
  radioBox.reset();
  lastSnd = null;
  pressWarned = false;
  failSent = false;
  altSeenOff = false;
  warned = false;
  readyAt = performance.now();
  controls.altCycled = false;
  worldQnh = lesson.qnh ?? 1013;
  lessonPanel.start(lesson);
  alertText = "";
  wasOnGround = !lesson.start?.air;
  document.getElementById("out-alert")?.classList.add("hidden");
  $("loading").classList.add("hidden");
  ready = true;
}

// ---------- Panels ----------
let panel: C172Panel = "lower";
function showPanel(name: C172Panel) {
  panel = name;
  document.querySelectorAll<HTMLElement>(".cp-panel").forEach((p) => p.classList.toggle("active", p.id === `p-${name}`));
  document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.panel === name));
  requestAnimationFrame(fit);
}
document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    showPanel(b.dataset.panel as C172Panel);
    b.blur();
  }),
);

const pfd = new C172Pfd($<HTMLCanvasElement>("c172-pfd"));
const mfd = new C172Mfd($<HTMLCanvasElement>("c172-mfd"));
pfd.fuelPress = mfd.fuelPress = variant.primer;
const lower = new C172LowerPanel($("p-lower"), controls, variant);
const lessonPanel = new LessonPanel<C172State, C172Controls, NavReading, C172Panel>($("lesson-slot"), showPanel, () => panel);
const checklist = new ChecklistPanel<GaCheck>(gaChecklists(variant), variant.name);
const explore = new ExploreMode(gaExplore(variant));
explore.decorate = glossarize;
enableGlossaryTips();
// First flight (C172 page only): the outside view, keyboard flying, guides and the readouts.
const outEl = document.getElementById("out-view") as HTMLCanvasElement | null;
const outside = outEl ? new OutsideView(outEl) : null;
const flightKeys = outside ? new FlightKeys(controls, variant.flapDeg.length - 1) : null;
const pfdEl = document.getElementById("out-pfd") as HTMLCanvasElement | null;
const miniPfd = pfdEl ? new MiniPfd(pfdEl) : null;
let guides = true;
let view: "cockpit" | "chase" = "cockpit";
function toggleView() {
  view = view === "cockpit" ? "chase" : "cockpit";
  const b = $("view-btn");
  b.innerHTML = `VIEW: ${view === "chase" ? "BEHIND" : "COCKPIT"} <kbd>V</kbd>`;
  b.classList.toggle("chase", view === "chase");
}
function toggleGuides() {
  guides = !guides;
  const b = $("guide-btn");
  b.innerHTML = `GUIDES ${guides ? "ON" : "OFF"} <kbd>G</kbd>`;
  b.classList.toggle("off", !guides);
}
if (outside) {
  $("guide-btn").addEventListener("click", (e) => {
    toggleGuides();
    (e.currentTarget as HTMLElement).blur();
  });
  $("keys-btn").addEventListener("click", (e) => {
    $("out-keys").classList.toggle("closed");
    (e.currentTarget as HTMLElement).blur();
  });
  flightKeys!.enabled = () => ready && !quiz.open && $("picker").classList.contains("hidden");
  flightKeys!.onChange = () => sound.click();
  $("view-btn").addEventListener("click", (e) => {
    toggleView();
    (e.currentTarget as HTMLElement).blur();
  });
  $("restart-btn").addEventListener("click", (e) => {
    if (currentLesson) startLesson(currentLesson);
    (e.currentTarget as HTMLElement).blur();
  });
}

// A plain warning after a hard landing or running off the paved surface, with a way to try again.
let lastVs = 0;
let wasOnGround = true;
let alertText = "";
function checkMishap(s: C172State) {
  if (!outside || !currentLesson?.start) return;
  const p = rwyPos(s);
  const paved =
    (p.x > -60 && p.x < RWY_LENGTH_M + 60 && Math.abs(p.y) < RWY_WIDTH_M / 2 + 3) ||
    (Math.abs(p.x - TAXI.x) < TAXI.width / 2 + 4 && p.y < 0 && p.y > TAXI.apronY - 95);
  let text = alertText;
  if (s.onGround && !wasOnGround && lastVs < -800) text = "That was a hard landing. Try a gentler flare: raise the nose a little earlier and hold it. Press RESTART LESSON to try again.";
  else if (s.onGround && !paved && s.groundSpeedKt > 15 && !currentLesson.fieldLanding) text = "The aircraft has left the runway. Press RESTART LESSON to try again.";
  wasOnGround = s.onGround;
  lastVs = s.vsFpm;
  if (text !== alertText) {
    alertText = text;
    $("out-alert").textContent = text;
    $("out-alert").classList.toggle("hidden", !text);
  }
}
const radioBox = new RadioBox($("lesson-slot"));
radioBox.voice.enabled = () => sound.on;
radioBox.voice.volume = () => sound.volume;
radioBox.onReadback = () => (controls.radios.readBack = true);
let nav: NavReading = readNav(0, 0, { latDeg: 0, lonDeg: 0 }, 0);

// Bezel knobs.
const MAP_RANGES = [1, 2, 5, 10, 20];
document.querySelectorAll<HTMLElement>(".c-knobs [data-k]").forEach((b) =>
  b.addEventListener("click", (e) => {
    const big = (e as MouseEvent).shiftKey;
    switch (b.dataset.k) {
      case "hdg-down":
        controls.hdgBug = (controls.hdgBug - (big ? 10 : 1) + 360) % 360;
        break;
      case "hdg-up":
        controls.hdgBug = (controls.hdgBug + (big ? 10 : 1)) % 360;
        break;
      case "baro-down":
        if (!controls.baro.std) controls.baro.qnh = Math.max(945, controls.baro.qnh - 1);
        break;
      case "baro-up":
        if (!controls.baro.std) controls.baro.qnh = Math.min(1050, controls.baro.qnh + 1);
        break;
      case "baro-std":
        controls.baro.std = !controls.baro.std;
        break;
      case "nav-mhz-down":
      case "nav-mhz-up":
      case "nav-khz-down":
      case "nav-khz-up":
      case "com-mhz-down":
      case "com-mhz-up":
      case "com-khz-down":
      case "com-khz-up": {
        const [kind, unit, dir] = b.dataset.k!.split("-") as ["nav" | "com", "mhz" | "khz", "up" | "down"];
        const r = controls.radios[kind];
        // Shift on the kHz buttons moves four steps at a time.
        const steps = unit === "khz" && big ? 4 : 1;
        for (let i = 0; i < steps; i++) r[1] = tune(r[1], kind, unit === "mhz", dir === "up" ? 1 : -1);
        break;
      }
      case "nav-swap":
      case "com-swap": {
        const r = controls.radios[b.dataset.k === "nav-swap" ? "nav" : "com"];
        [r[0], r[1]] = [r[1], r[0]];
        break;
      }
      case "nav-id":
        if (nav.valid && nav.station) {
          sound.morse(nav.station.ident);
          controls.radios.navIdHeard = true;
        }
        break;
      case "crs-down":
        controls.radios.obs = ((controls.radios.obs - (big ? 10 : 1) + 359) % 360) + 1;
        break;
      case "crs-up":
        controls.radios.obs = ((controls.radios.obs + (big ? 10 : 1) - 1) % 360) + 1;
        break;
      case "range-down":
      case "range-up": {
        const i = MAP_RANGES.indexOf(mfd.rangeNm) + (b.dataset.k === "range-up" ? 1 : -1);
        mfd.rangeNm = MAP_RANGES[Math.max(0, Math.min(MAP_RANGES.length - 1, i))];
        break;
      }
    }
    b.blur();
  }),
);

// Transponder: type four digits (0 to 7), then pick the mode.
document.querySelectorAll<HTMLElement>("[data-xd]").forEach((b) =>
  b.addEventListener("click", () => {
    xpdrTyping += b.dataset.xd;
    if (xpdrTyping.length === 4) {
      controls.radios.xpdrCode = xpdrTyping;
      xpdrTyping = "";
    }
    b.blur();
  }),
);
document.querySelectorAll<HTMLElement>("[data-xm]").forEach((b) =>
  b.addEventListener("click", () => {
    controls.radios.xpdrMode = b.dataset.xm as C172Controls["radios"]["xpdrMode"];
    b.blur();
  }),
);

function fit() {
  const box = $("cockpit").getBoundingClientRect();
  const w = Math.floor(Math.max(260, Math.min((box.width - 70) / 2, ((box.height - 150) * 4) / 3)));
  document.documentElement.style.setProperty("--c172w", `${w}px`);
  if (panel === "lower") {
    lower.el.style.zoom = "1";
    const z = Math.min(1.5, (box.width - 40) / lower.el.scrollWidth, (box.height - 30) / lower.el.scrollHeight);
    lower.el.style.zoom = String(Math.max(0.6, z));
  }
}
window.addEventListener("resize", () => requestAnimationFrame(fit));

// ---------- Sound, picker, quiz ----------
const sound = new Sound();
lessonPanel.onTick = (complete) => {
  sound.chime(complete);
  if (complete && currentLesson) markFinished(currentLesson.id);
};
lessonPanel.onQuiz = () => currentLesson && startQuiz(currentLesson);
const soundBtn = $<HTMLButtonElement>("sound-btn");
const soundVol = $<HTMLInputElement>("sound-vol");
function showSound() {
  soundBtn.textContent = sound.on ? "🔊" : "🔇";
  soundBtn.classList.toggle("off", !sound.on);
  soundVol.value = String(Math.round(sound.volume * 100));
}
soundBtn.addEventListener("click", () => {
  sound.setOn(!sound.on);
  showSound();
  soundBtn.blur();
});
soundVol.addEventListener("input", () => {
  sound.setVolume(Number(soundVol.value) / 100);
  if (!sound.on) sound.setOn(true);
  showSound();
});
showSound();

const quiz = new QuizDialog();
const picker = new LessonPicker({
  current: variant.id,
  startHere: (id) => {
    const l = LESSONS.find((x) => x.id === id);
    if (l) startLesson(l);
  },
  startQuiz: (id) => {
    const l = LESSONS.find((x) => x.id === id);
    if (l) startQuiz(l);
  },
  canClose: () => !!currentLesson,
});
function startQuiz(lesson: C172Lesson) {
  const qs = QUIZZES[lesson.id];
  if (!qs) return;
  picker.close();
  quiz.start(
    lesson.title,
    qs,
    (score) => {
      recordScore(lesson.id, score);
      if (score >= PASS_MARK) sound.chime(true);
    },
    () => picker.open(),
  );
}
$("lessons-btn").addEventListener("click", (e) => {
  picker.open();
  (e.currentTarget as HTMLElement).blur();
});

window.addEventListener("keydown", (e) => {
  if (e.repeat || quiz.open) return;
  const k = e.key.toLowerCase();
  if (k === "1") showPanel("inst");
  if (k === "2") showPanel("lower");
  if (k === "3" && outside) showPanel("out");
  if (k === "g" && outside) toggleGuides();
  if (k === "v" && outside) toggleView();
  if (k === "h" && outside) $("out-keys").classList.toggle("closed");
  if (k === "l") picker.open();
  if (k === "m") {
    sound.setOn(!sound.on);
    showSound();
  }
});

// ---------- Frame loop ----------
let lastFrame = performance.now();
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now();
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  flightKeys?.update(dt);
  lower.update(latest, controls);
  if (!ready || !latest) return;
  const s = latest;
  send({ type: "controls", controls });
  const radiosOn = s.elec.avionicsBus;
  nav = radiosOn ? readNav(controls.radios.nav[0], controls.radios.obs, { latDeg: s.latDeg, lonDeg: s.lonDeg }, s.altFt) : readNav(0, 0, { latDeg: 0, lonDeg: 0 }, 0);
  radioBox.update(radiosOn && !currentLesson?.start ? controls.radios.com[0] : null, currentLesson?.clearance ?? null, currentLesson?.callsign ?? variant.callsign);
  const code = document.querySelector<HTMLElement>(".c-xpdr-code");
  if (code) code.textContent = xpdrTyping ? xpdrTyping.padEnd(4, "_") : controls.radios.xpdrCode;
  document.querySelectorAll<HTMLElement>("[data-xm]").forEach((b) => b.classList.toggle("on", b.dataset.xm === controls.radios.xpdrMode));
  if (panel === "inst") {
    if (s.elec.essBus) pfd.draw(s, controls, worldQnh, nav, radiosOn);
    else blank(pfd.canvas);
    if (s.elec.avionicsBus) mfd.draw(s);
    else blank(mfd.canvas);
  }
  // Lesson failure: the alternator fails, LOW VOLTS chimes once, the ALT reset is tracked.
  if (currentLesson?.failAfterS !== undefined && !failSent && performance.now() - readyAt > currentLesson.failAfterS * 1000) {
    failSent = true;
    send({ type: "fail", what: currentLesson.failure ?? "alternator" });
  }
  if (s.elec.lowVolts && !warned) {
    warned = true;
    sound.caution(false);
  }
  if (s.elec.altFailed && !controls.altCycled) {
    if (!controls.switches.masterAlt) altSeenOff = true;
    else if (altSeenOff) controls.altCycled = true;
  }
  checkMishap(s);
  if (outside && panel === "out") {
    outside.draw(s, { guides, view, field: currentLesson?.fieldLanding });
    miniPfd?.draw(s);
    outsideDash(s);
  }
  lessonPanel.update(s, controls, nav);
  checklist.update({ s, c: controls });
  const power = s.elec.mainBus ? (s.elec.avionicsBus ? 1 : 0.6) : s.elec.essBus ? 0.3 : 0;
  sound.updatePiston(s.engine.rpm, s.engine.running, s.engine.cranking, power);
  systemSounds(s);
  $("status").textContent = `Engine: ${s.engine.running ? `${Math.round(s.engine.rpm / 10) * 10} RPM` : s.engine.cranking ? "CRANKING" : "OFF"} · Bus: ${
    s.elec.mainBus ? `${s.elec.mainVolts.toFixed(1)} V` : "OFF"
  }`;
}
requestAnimationFrame(frame);

// Extra sounds: the electric fuel pump, the standby gyro and avionics fans, cylinder chugs while
// cranking, primer strokes, and the FUEL PRESS beep (PA-28).
let lastSnd: { strokes: number } | null = null;
let pressWarned = false;
function systemSounds(s: C172State) {
  const sw = controls.switches;
  sound.systems({
    gaFuelPump: sw.fuelPump && s.elec.mainBus,
    gyro: s.elec.essBus,
    fans: s.elec.avionicsBus,
    crankRpm: s.engine.cranking && !s.engine.running ? Math.max(60, s.engine.rpm) : 0,
    stallHorn: stallWarning(s),
    wind: s.kias / 110,
    rumble: s.onGround ? Math.min(1, s.groundSpeedKt / 45) : 0,
  });
  const strokes = controls.primeStrokes ?? 0;
  if (lastSnd && strokes > lastSnd.strokes) sound.primer();
  lastSnd = { strokes };
  if (variant.primer && s.engine.running && s.fuelPressPsi < 0.5 && !pressWarned) {
    pressWarned = true;
    sound.beep();
  }
}

/** The stall warning horn: a few knots above the stall, less with flaps out. In the air only. */
function stallWarning(s: C172State) {
  return !s.onGround && s.aglFt > 4 && s.kias < (s.flapDeg >= 15 ? 46 : 52) && s.kias > 5;
}

// Readouts under the outside view, and the pink aim box for the current step.
function outsideDash(s: C172State) {
  const set = (k: string, v: string) => {
    const el = document.querySelector<HTMLElement>(`[data-o="${k}"]`);
    if (el && el.textContent !== v) el.textContent = v;
  };
  set("ias", String(Math.round(s.kias)));
  set("alt", String(Math.round(s.altFt / 10) * 10));
  set("agl", `${Math.max(0, Math.round((s.altFt - FIELD_FT) / 10) * 10)} above rwy`);
  set("vs", `${s.vsFpm >= 0 ? "+" : "−"}${Math.abs(Math.round(s.vsFpm / 50) * 50)}`);
  set("hdg", String(Math.round(s.headingDeg) % 360 || 360).padStart(3, "0"));
  set("rpm", String(Math.round(s.engine.rpm / 10) * 10));
  set("flaps", String(variant.flapDeg[Math.round(controls.flaps)] ?? 0));
  const trim = document.querySelector<HTMLElement>('[data-o="trim"]');
  if (trim) trim.style.left = `${50 + controls.trim * 45}%`;
  const lamp = (k: string, on: boolean, cls = "lit") => document.querySelector(`[data-o="${k}"]`)?.classList.toggle(cls, on);
  lamp("park", controls.switches.parkBrake);
  lamp("brake", controls.brakes > 0 && !controls.switches.parkBrake);
  lamp("stall", stallWarning(s), "warn");
  document.querySelectorAll<HTMLElement>("#out-keys [data-ctl]").forEach((el) => {
    const keys: Record<string, string[]> = {
      "key-pitch": ["arrowup", "arrowdown"],
      "key-roll": ["arrowleft", "arrowright"],
      "key-throttle": ["w", "s"],
      "key-rudder": ["a", "d"],
      "key-trim": ["q", "e"],
      "key-brakes": ["b"],
    };
    el.classList.toggle("held", (keys[el.dataset.ctl!] ?? []).some((k) => flightKeys!.isHeld(k)));
  });
  // The aim box: what the current step wants, and how close you are.
  const hint = $("out-hint");
  const step = currentLesson && lessonPanel.currentStep >= 0 ? currentLesson.steps[lessonPanel.currentStep] : null;
  const aim = guides ? step?.aim : undefined;
  if (!aim) {
    hint.classList.add("hidden");
    return;
  }
  const row = (label: string, want: string, now: string, ok: boolean) =>
    `<div class="oh-row"><span>${label} ${want}</span><b class="${ok ? "ok" : "off"}">now ${now}</b></div>`;
  let html = '<div class="oh-title">Aim for</div>';
  if (aim.kias !== undefined) html += row("Speed", `${aim.kias} kt`, String(Math.round(s.kias)), Math.abs(s.kias - aim.kias) <= 5);
  if (aim.altFt !== undefined) html += row("Altitude", `${aim.altFt} ft`, String(Math.round(s.altFt / 10) * 10), Math.abs(s.altFt - aim.altFt) <= 100);
  if (aim.hdg !== undefined) {
    const h = String(aim.hdg).padStart(3, "0");
    const d = angleDiff(s.headingDeg, aim.hdg);
    const turn = Math.abs(d) <= 10 ? "" : d < 0 ? " (turn left)" : " (turn right)";
    html += row("Heading", h, String(Math.round(s.headingDeg) % 360 || 360).padStart(3, "0") + turn, Math.abs(d) <= 10);
  }
  if (hint.innerHTML !== html) hint.innerHTML = html;
  hint.classList.remove("hidden");
}

function blank(cv: HTMLCanvasElement) {
  const g = cv.getContext("2d")!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#050607";
  g.fillRect(0, 0, cv.width, cv.height);
  g.restore();
}

function showError(text: string) {
  const el = $("error");
  el.textContent = `Problem: ${text}`;
  el.classList.remove("hidden");
}

// ---------- Start ----------
showPanel("lower");
{
  const asked = LESSONS.find((l) => l.id === lessonFromUrl());
  if (asked) startLesson(asked);
  else picker.open();
}

// Hooks for automated browser tests.
const w = window as unknown as Record<string, unknown>;
w.__runwayZero = () => latest;
w.__runwayZeroExplore = explore;
w.__runwayZeroChecklist = () => (latest ? checklist.debug({ s: latest, c: controls }) : null);
w.__runwayZeroChecklistSelect = (id: string) => checklist.select(id);
w.__runwayZeroControls = () => controls;
w.__runwayZeroNav = () => nav;
w.__runwayZeroRwy = () => (latest ? rwyPos(latest) : null);
w.__runwayZeroStep = () => lessonPanel.currentStep;
w.__runwayZeroReadback = () => radioBox.readbackOk;
w.__runwayZeroSound = () => sound.debug();
w.__runwayZeroSpoken = () => radioBox.voice.spoken;
w.__runwayZeroSoundEvents = () => sound.events;
