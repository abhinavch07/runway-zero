// Runway Zero, 737 page: a 737-type airliner procedures trainer with large screens.
// The JSBSim 737 runs in a worker with our systems and autopilot. The page shows the overhead,
// the main panel (EFIS, MCP, PFD, ND, engine display) and the pedestal (CDU, levers, radios), with
// the same lesson list, quiz, progress and sound as the other aircraft.
import "../style.css";
import "./style.css";
import { Pfd737 } from "./cockpit/pfd";
import { Nd737 } from "./cockpit/nd";
import { Eicas737 } from "./cockpit/eicas";
import { Cdu737, emptyFms737, readyFms737, routePoints } from "./cockpit/cdu";
import { Glareshield737, Overhead737, Pedestal737 } from "./cockpit/panels";
import { B737_LESSONS, type Lesson737, type Panel737, type X737 } from "./lessons";
import {
  coldSwitches737,
  defaultExtras737,
  poweredSwitches737,
  runningSwitches737,
  type Controls737,
  type FromWorker737,
  type Start737,
  type State737,
  type ToWorker737,
} from "./sim/types";
import type { McpAction, McpValues } from "./sim/afcs";
import { STARTER_CUTOUT_N2 } from "./sim/systems";
import { RadioBox } from "../radio/radioBox";
import { readNav, type NavReading } from "../radio/navReceiver";
import { ChecklistPanel } from "../shell/checklist";
import { B737_CHECKLISTS, type B737Check } from "../checklists/b737";
import { LessonPanel } from "../cockpit/lessonPanel";
import { QuizDialog } from "../cockpit/quiz";
import { Sound } from "../audio/sound";
import { PASS_MARK, QUIZZES } from "../lessons/quizzes";
import { markFinished, recordScore } from "../lessons/progress";
import { LessonPicker, lessonFromUrl } from "../shell/picker";
import { destination } from "../world/geo";
import { RWY28_COURSE_T, VIDP, rwy28Along } from "../world/vidp";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// At the gate: a training stand beside runway 28 (not a real stand), nose 45° towards the runway.
const gate = destination(rwy28Along(400), RWY28_COURSE_T + 270, 160);
const GATE = { latDeg: gate.latDeg, lonDeg: gate.lonDeg, headingDeg: Math.round((RWY28_COURSE_T + 45) % 360), terrainFt: VIDP.runways[1].ends[1].elevationFt };
// In the air: west-south-west of Delhi, heading for the first route waypoint.
const air = destination(VIDP.runways[1].ends[1], 250, 10 * 1852);
const AIR = { latDeg: air.latDeg, lonDeg: air.lonDeg, headingDeg: 250, terrainFt: 700 };

const controls: Controls737 = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0,
  flaps: 0,
  gearDown: true,
  brakes: 0,
  switches: coldSwitches737(),
  nav1: 108000,
  crs1: 360,
  x: defaultExtras737(),
};
let worldQnh = 1013;
let rate = 1;

// ---------- Worker ----------
const worker = new Worker(new URL("./sim/worker.ts", import.meta.url), { type: "module" });
const send = (msg: ToWorker737) => worker.postMessage(msg);
let initialised = false;
let ready = false;
let latest: State737 | null = null;
let currentLesson: Lesson737 | null = null;
/** After a start in the air, the thrust levers take the trimmed position from the first state. */
let syncThrottle = false;

worker.onmessage = (ev: MessageEvent<FromWorker737>) => {
  const msg = ev.data;
  if (msg.type === "ready") onReady();
  else if (msg.type === "state") latest = msg.state;
  else if (msg.type === "error") showError(msg.message);
  else if (msg.type === "log") console.debug("[jsbsim]", msg.message);
};
worker.onerror = (e) => showError(e.message || "The simulation worker stopped");

function startLesson(lesson: Lesson737) {
  currentLesson = lesson;
  ready = false;
  latest = null;
  $("loading").classList.remove("hidden");
  const pos = lesson.air ? AIR : GATE;
  const start: Start737 = {
    id: lesson.id,
    ...pos,
    onGround: !lesson.air,
    altFt: lesson.air?.altFt,
    kias: lesson.air?.kias,
    state: lesson.state,
    fuelKg: lesson.fuelKg ?? 7000,
  };
  if (!initialised) {
    initialised = true;
    send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start });
  } else send({ type: "reset", start });
}

function onReady() {
  const lesson = currentLesson!;
  const sw = lesson.state === "cold" ? coldSwitches737() : lesson.state === "powered" ? poweredSwitches737() : runningSwitches737();
  lesson.switches?.(sw);
  Object.assign(controls, {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0,
    flaps: 0,
    gearDown: !lesson.air,
    brakes: 0,
    switches: sw,
    crs1: lesson.crs1 ?? 360,
    x: { ...defaultExtras737(), ...lesson.extras },
  });
  syncThrottle = !!lesson.air;
  worldQnh = lesson.qnh ?? 1013;
  cdu.reset(lesson.fms === "ready" ? readyFms737() : emptyFms737());
  if (lesson.fms === "ready") sendRoute();
  mcpLocal = null;
  pedestal.reset();
  radioBox.reset();
  lastSnd = null;
  setRate(1);
  lessonPanel.start(lesson);
  $("loading").classList.add("hidden");
  ready = true;
}

function sendRoute() {
  const f = cdu.fms;
  if (f.active) send({ type: "route", points: routePoints(f), crzAltFt: f.crzAltFt });
}

// ---------- Panels ----------
let panel: Panel737 = "ovhd";
function showPanel(name: Panel737) {
  panel = name;
  document.querySelectorAll<HTMLElement>(".cp-panel").forEach((p) => p.classList.toggle("active", p.id === `p-${name}`));
  document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.panel === name));
  requestAnimationFrame(fit);
}
document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    showPanel(b.dataset.panel as Panel737);
    b.blur();
  }),
);

/** MCP windows: a local copy changed by the knobs, refreshed from the autopilot when idle. */
let mcpLocal: McpValues | null = null;
let mcpTouched = 0;
const sendMcp = (a: McpAction) => {
  if (a.kind === "set") {
    mcpLocal = { ...(mcpLocal ?? latest?.afcs.mcp ?? { spd: 250, hdg: 0, alt: 10000, vs: 0 }), [a.field]: a.value };
    mcpTouched = performance.now();
  }
  send({ type: "mcp", action: a });
};

const sound = new Sound();
const cdu = new Cdu737(document.createElement("div"));
cdu.onRoute = sendRoute;
const overhead = new Overhead737($("p-ovhd"), controls);
const glare = new Glareshield737($("b-glare-slot"), controls, {
  send: sendMcp,
  values: () => mcpLocal ?? latest?.afcs.mcp ?? { spd: 250, hdg: 0, alt: 10000, vs: 0 },
});
const pedestal = new Pedestal737($("p-ped"), controls, cdu.el, {
  morse: () => {
    if (nav.valid && nav.station) {
      sound.morse(nav.station.ident);
      controls.x.navIdHeard = true;
    }
  },
});
const pfd = new Pfd737($<HTMLCanvasElement>("b-pfd"));
const nd = new Nd737($<HTMLCanvasElement>("b-nd"));
const eicas = new Eicas737($<HTMLCanvasElement>("b-eicas"));
const lessonPanel = new LessonPanel<State737, Controls737, X737, Panel737>($("lesson-slot"), showPanel, () => panel);
const checklist = new ChecklistPanel<B737Check>(B737_CHECKLISTS, "B737");
const radioBox = new RadioBox($("lesson-slot"));
radioBox.voice.enabled = () => sound.on;
radioBox.voice.volume = () => sound.volume;
radioBox.onReadback = () => (controls.x.readBack = true);
let nav: NavReading = readNav(0, 0, { latDeg: 0, lonDeg: 0 }, 0);

function fit() {
  const box = $("cockpit").getBoundingClientRect();
  const el = panel === "ovhd" ? overhead.el : panel === "ped" ? pedestal.el : $("p-main");
  if (panel === "main") {
    // Three screens side by side under the glareshield.
    // Each screen has a 10 px bezel on both sides, and 12 px gaps between them.
    const w = Math.floor(Math.max(200, Math.min((box.width - 40 - 3 * 20 - 24) / 3, box.height - 250)));
    document.documentElement.style.setProperty("--b737w", `${w}px`);
    glare.el.style.zoom = "1";
    glare.el.style.zoom = String(Math.min(1, (box.width - 20) / glare.el.scrollWidth));
    return;
  }
  el.style.zoom = "1";
  const z = Math.min(1.4, (box.width - 30) / el.scrollWidth, (box.height - 20) / el.scrollHeight);
  el.style.zoom = String(Math.max(0.55, z));
}
window.addEventListener("resize", () => requestAnimationFrame(fit));

// ---------- Time, sound, picker, quiz ----------
const timeBtn = $<HTMLButtonElement>("time-btn");
function setRate(r: number) {
  rate = r;
  timeBtn.textContent = `TIME ×${r}`;
  timeBtn.classList.toggle("on", r > 1);
  send({ type: "rate", rate: r });
}
timeBtn.addEventListener("click", () => {
  setRate(rate === 1 ? 4 : rate === 4 ? 8 : 1);
  timeBtn.blur();
});

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
  current: "b737",
  startHere: (id) => {
    const l = B737_LESSONS.find((x) => x.id === id);
    if (l) startLesson(l);
  },
  startQuiz: (id) => {
    const l = B737_LESSONS.find((x) => x.id === id);
    if (l) startQuiz(l);
  },
  canClose: () => !!currentLesson,
});
function startQuiz(lesson: Lesson737) {
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
  const t = e.target as HTMLElement;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  const k = e.key.toLowerCase();
  if (k === "1") showPanel("ovhd");
  if (k === "2") showPanel("main");
  if (k === "3") showPanel("ped");
  if (k === "l") picker.open();
  if (k === "m") {
    sound.setOn(!sound.on);
    showSound();
  }
});

// ---------- Frame loop ----------
function frame() {
  requestAnimationFrame(frame);
  overhead.update(latest);
  glare.update(latest);
  pedestal.update(latest);
  if (!ready || !latest) return;
  const s = latest;
  if (syncThrottle) {
    controls.throttle = Math.round(s.throttle * 100) / 100;
    syncThrottle = false;
  }
  if (mcpLocal && performance.now() - mcpTouched > 800) mcpLocal = null;
  // The start switch is held at GRD until the starter cuts out, then springs back to OFF.
  controls.switches.engStart = controls.switches.engStart.map((v, i) => (v === "GRD" && s.sys.engines[i].n2 >= STARTER_CUTOUT_N2 ? "OFF" : v)) as Controls737["switches"]["engStart"];
  controls.nav1 = controls.x.nav1[0];
  send({ type: "controls", controls });

  const ac = s.sys.acPower;
  nav = ac ? readNav(controls.x.nav1[0], controls.crs1, { latDeg: s.latDeg, lonDeg: s.lonDeg }, s.altFt) : readNav(0, 0, { latDeg: 0, lonDeg: 0 }, 0);
  radioBox.update(ac ? controls.x.vhf1[0] : null, currentLesson?.clearance ?? null, currentLesson?.callsign ?? "Training 456");
  cdu.pos = { latDeg: s.latDeg, lonDeg: s.lonDeg };
  cdu.fuelKg = s.sys.tanksKg[0] + s.sys.tanksKg[1] + s.sys.tanksKg[2];
  cdu.setPowered(ac);
  cdu.render();
  if (panel === "main") {
    if (ac) {
      pfd.draw(s, controls.x.baro, worldQnh, nav);
      nd.draw(s, controls.x.ndMode, controls.x.ndRange, cdu.fms, nav, controls.x.nav1[0], controls.crs1);
    } else {
      blank(pfd.canvas);
      blank(nd.canvas);
    }
    if (ac || s.sys.dcPower) eicas.draw(s);
    else blank(eicas.canvas);
  }
  lessonPanel.update(s, controls, { fms: cdu.fms, cduPage: cdu.page, scratch: cdu.scratch, preflight: cdu.preflightComplete, nav });
  checklist.update({ s, c: controls, fms: cdu.fms, preflight: cdu.preflightComplete });
  sound.updateJet(s.sys);
  systemSounds(s);
  const e = s.sys.engines;
  $("status").textContent = `Power: ${ac ? "AC" : s.sys.dcPower ? "BATTERY" : "OFF"} · N2 ${e[0].n2.toFixed(0)} / ${e[1].n2.toFixed(0)}${s.onGround ? "" : ` · ${Math.round(s.altFt)} ft`}`;
}
requestAnimationFrame(frame);

// Extra sounds: systems that run while switched on, and one-off events found by comparing frames.
let lastSnd: { apuOn: boolean; phases: string[]; cmdA: boolean; pitch: string } | null = null;
function systemSounds(s: State737) {
  const sys = s.sys;
  const sw = controls.switches;
  const ac = sys.acPower;
  sound.systems({
    startAir: sys.engines.filter((e) => e.startValve).length * 0.8 * Math.min(1, sys.ductPsi / 30),
    igniters: sys.engines.some((e) => e.phase === "LIGHT") || sys.engines.some((e, i) => e.phase === "RUN" && sw.engStart[i] === "CONT"),
    elecHydPumps: (sw.hydPumps[1] && ac ? 1 : 0) + (sw.hydPumps[2] && ac ? 1 : 0),
    fuelPumps: sys.fuelLowPress.filter((x) => !x).length,
    packs: sys.packOn.filter(Boolean).length,
    fans: ac,
  });
  const now = { apuOn: sw.apuOn, phases: sys.engines.map((e) => e.phase), cmdA: s.afcs.cmdA, pitch: s.afcs.pitch };
  if (lastSnd) {
    if (now.apuOn && !lastSnd.apuOn && sys.dcPower) sound.apuDoor();
    now.phases.forEach((p, i) => {
      if (p === "LIGHT" && lastSnd!.phases[i] !== "LIGHT") sound.lightOff();
    });
    if (lastSnd.cmdA && !now.cmdA) sound.apDisconnect("warble");
    if (now.pitch === "ALT ACQ" && lastSnd.pitch !== "ALT ACQ") sound.altitudeAlert();
  }
  lastSnd = now;
}

function blank(cv: HTMLCanvasElement) {
  const g = cv.getContext("2d")!;
  g.fillStyle = "#050607";
  g.fillRect(0, 0, cv.width, cv.height);
}

function showError(text: string) {
  const el = $("error");
  el.textContent = `Problem: ${text}`;
  el.classList.remove("hidden");
}

// ---------- Start ----------
showPanel("ovhd");
{
  const asked = B737_LESSONS.find((l) => l.id === lessonFromUrl());
  if (asked) startLesson(asked);
  else picker.open();
}

// Hooks for automated browser tests.
const w = window as unknown as Record<string, unknown>;
w.__runwayZero = () => latest;
w.__runwayZeroChecklist = () => (latest ? checklist.debug({ s: latest, c: controls, fms: cdu.fms, preflight: cdu.preflightComplete }) : null);
w.__runwayZeroChecklistSelect = (id: string) => checklist.select(id);
w.__runwayZeroControls = () => controls;
w.__runwayZeroNav = () => nav;
w.__runwayZeroCdu = () => cdu;
w.__runwayZeroSpoken = () => radioBox.voice.spoken;
w.__runwayZeroSoundEvents = () => sound.events;
w.__runwayZeroSound = () => sound.debug();
