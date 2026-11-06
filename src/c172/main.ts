// Runway Zero, Cessna 172 page: a glass-cockpit light aircraft procedures trainer.
// The JSBSim C172 runs in a worker. The page shows the PFD and MFD, or the lower panel, with the
// same lesson list, quiz, progress and sound as the A320.
import "../style.css";
import "./style.css";
import { C172Pfd } from "./cockpit/pfd";
import { C172Mfd } from "./cockpit/mfd";
import { C172LowerPanel } from "./cockpit/panel";
import { C172_LESSONS, type C172Lesson, type C172Panel } from "./lessons";
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
import { LessonPanel } from "../cockpit/lessonPanel";
import { QuizDialog } from "../cockpit/quiz";
import { Sound } from "../audio/sound";
import { PASS_MARK, QUIZZES } from "../lessons/quizzes";
import { markFinished, recordScore } from "../lessons/progress";
import { LessonPicker, lessonFromUrl } from "../shell/picker";
import { destination } from "../world/geo";
import { RWY28_COURSE_T, VIDP, rwy28Along } from "../world/vidp";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

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
  switches: coldC172Switches(),
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
  if (!initialised) {
    initialised = true;
    send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start });
  } else {
    send({ type: "reset", start });
  }
}

function onReady() {
  const lesson = currentLesson!;
  const sw = lesson.running ? runningC172Switches() : coldC172Switches();
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
    ...lesson.controls,
    switches: sw,
    baro: { qnh: 1013, std: false },
    radios: { ...defaultC172Radios(), ...lesson.radios },
  });
  xpdrTyping = "";
  radioBox.reset();
  failSent = false;
  altSeenOff = false;
  warned = false;
  readyAt = performance.now();
  controls.altCycled = false;
  worldQnh = lesson.qnh ?? 1013;
  lessonPanel.start(lesson);
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
const lower = new C172LowerPanel($("p-lower"), controls);
const lessonPanel = new LessonPanel<C172State, C172Controls, NavReading, C172Panel>($("lesson-slot"), showPanel, () => panel);
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
  current: "c172",
  startHere: (id) => {
    const l = C172_LESSONS.find((x) => x.id === id);
    if (l) startLesson(l);
  },
  startQuiz: (id) => {
    const l = C172_LESSONS.find((x) => x.id === id);
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
  if (k === "l") picker.open();
  if (k === "m") {
    sound.setOn(!sound.on);
    showSound();
  }
});

// ---------- Frame loop ----------
function frame() {
  requestAnimationFrame(frame);
  lower.update(latest, controls);
  if (!ready || !latest) return;
  const s = latest;
  send({ type: "controls", controls });
  const radiosOn = s.elec.avionicsBus;
  nav = radiosOn ? readNav(controls.radios.nav[0], controls.radios.obs, { latDeg: s.latDeg, lonDeg: s.lonDeg }, s.altFt) : readNav(0, 0, { latDeg: 0, lonDeg: 0 }, 0);
  radioBox.update(radiosOn ? controls.radios.com[0] : null, currentLesson?.clearance ?? null, currentLesson?.callsign ?? "VT-RZA");
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
    send({ type: "fail", what: "alternator" });
  }
  if (s.elec.lowVolts && !warned) {
    warned = true;
    sound.caution(false);
  }
  if (s.elec.altFailed && !controls.altCycled) {
    if (!controls.switches.masterAlt) altSeenOff = true;
    else if (altSeenOff) controls.altCycled = true;
  }
  lessonPanel.update(s, controls, nav);
  const power = s.elec.mainBus ? (s.elec.avionicsBus ? 1 : 0.6) : s.elec.essBus ? 0.3 : 0;
  sound.updatePiston(s.engine.rpm, s.engine.running, s.engine.cranking, power);
  $("status").textContent = `Engine: ${s.engine.running ? `${Math.round(s.engine.rpm / 10) * 10} RPM` : s.engine.cranking ? "CRANKING" : "OFF"} · Bus: ${
    s.elec.mainBus ? `${s.elec.mainVolts.toFixed(1)} V` : "OFF"
  }`;
}
requestAnimationFrame(frame);

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
  const asked = C172_LESSONS.find((l) => l.id === lessonFromUrl());
  if (asked) startLesson(asked);
  else picker.open();
}

// Hooks for automated browser tests.
const w = window as unknown as Record<string, unknown>;
w.__runwayZero = () => latest;
w.__runwayZeroControls = () => controls;
w.__runwayZeroNav = () => nav;
w.__runwayZeroReadback = () => radioBox.readbackOk;
w.__runwayZeroSound = () => sound.debug();
w.__runwayZeroSpoken = () => radioBox.voice.spoken;
