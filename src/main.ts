// Runway Zero: an A320neo-type cockpit procedures trainer.
// The flight model and aircraft systems run in a worker. The page shows one cockpit panel at a time
// (Overhead, Main panel, Pedestal) and a lesson sidebar that guides the learner step by step.
import { minZoom } from "./shell/phone";
import { glossarize, enableGlossaryTips } from "./glossary/glossary";
import "./style.css";
import { STARTS } from "./config";
import { Pfd } from "./cockpit/pfd";
import { Nd } from "./cockpit/nd";
import { Ewd } from "./cockpit/ewd";
import { FcuPanel } from "./cockpit/fcu";
import { LeverPanel } from "./cockpit/levers";
import { OverheadPanel } from "./cockpit/overhead";
import { ChecklistPanel } from "./shell/checklist";
import { ExploreMode } from "./shell/explore";
import { A320_EXPLORE } from "./explore/a320";
import { A320_CHECKLISTS, type A320Check } from "./checklists/a320";
import { LessonPanel } from "./cockpit/lessonPanel";
import { Mcdu, type FmsData } from "./cockpit/mcdu";
import { EfisPanel } from "./cockpit/efis";
import { Sound } from "./audio/sound";
import { QuizDialog } from "./cockpit/quiz";
import { PASS_MARK, QUIZZES } from "./lessons/quizzes";
import { markFinished, recordScore } from "./lessons/progress";
import { LessonPicker, lessonFromUrl } from "./shell/picker";
import { LESSONS, type Lesson, type PanelName } from "./lessons/lessons";
import { coldSwitches, startSwitches } from "./sim/systems";
import type { FcuAction } from "./sim/fcc";
import { defaultExtras, type Controls, type EcamPage, type FromWorker, type SimState, type StartPosition, type ToWorker } from "./sim/types";
import { SystemDisplay } from "./cockpit/sd";
import { RadioPanels } from "./cockpit/rmp";
import { RadioBox } from "./radio/radioBox";
import { activeAlerts, shownAlerts, toConfigTest, trackGen1Cycle } from "./cockpit/ecam";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// ---------- Controls shared with the worker ----------
const controls: Controls = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0,
  flapLever: 0,
  gearDown: true,
  speedbrake: 0,
  brakes: 0,
  switches: coldSwitches(),
  efis: { fd: true, qnh: 1013, std: false },
  extras: defaultExtras(),
};
const x = () => controls.extras!;
/** Today's QNH at Delhi in the lesson. The altimeter reads true altitude when the baro is set to it. */
let worldQnh = 1013;

// ---------- Flight model worker ----------
const worker = new Worker(new URL("./sim/fdm.worker.ts", import.meta.url), { type: "module" });
const send = (msg: ToWorker) => worker.postMessage(msg);
const fcuSend = (action: FcuAction) => send({ type: "fcu", action });
let initialised = false;
let ready = false;
let latest: SimState | null = null;
let currentLesson: Lesson | null = null;

worker.onmessage = (ev: MessageEvent<FromWorker>) => {
  const msg = ev.data;
  switch (msg.type) {
    case "ready":
      onReady(msg.start, msg.throttle);
      break;
    case "state":
      latest = msg.state;
      break;
    case "notice":
      showNotice(msg.message);
      break;
    case "error":
      showError(msg.message);
      break;
    case "log":
      console.debug("[jsbsim]", msg.message);
      break;
  }
};
worker.onerror = (e) => showError(e.message || "The simulation worker stopped");

function startLesson(lesson: Lesson) {
  const start = STARTS.find((s) => s.id === lesson.startId);
  if (!start) return showError(`Start position ${lesson.startId} is missing`);
  currentLesson = lesson;
  ready = false;
  $("picker").classList.add("hidden");
  $("loading").classList.remove("hidden");
  if (!initialised) {
    initialised = true;
    send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start, displayOffsetM: 0 });
  } else {
    send({ type: "reset", start, displayOffsetM: 0 });
  }
}

function onReady(start: StartPosition, throttle: number) {
  const lesson = currentLesson;
  Object.assign(controls, {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle,
    flapLever: start.flapLever,
    gearDown: start.gearDown,
    speedbrake: 0,
    brakes: 0,
    switches: startSwitches(start),
  });
  lesson?.switches?.(controls.switches);
  mcdu.reset();
  if (lesson?.fms) Object.assign(mcdu.fms, structuredClone(lesson.fms));
  mcdu.render();
  controls.efis = { fd: true, qnh: 1013, std: false, ...lesson?.efis };
  controls.extras = { ...defaultExtras(), ...structuredClone(lesson?.extras ?? {}) };
  timeBtn.textContent = "TIME ×1";
  timeBtn.classList.remove("fast");
  if (lesson?.tanksKg) send({ type: "tanks", kg: lesson.tanksKg });
  knownAlerts = new Set();
  radioPanels.reset();
  radioBox.reset();
  lastSnd = null;
  pageBeforeApu = null;
  gen1Seen.off = false;
  failSent = false;
  readyAt = performance.now();
  worldQnh = lesson?.qnh ?? 1013;
  for (const a of lesson?.fcuActions ?? []) fcuSend(a);
  if (lesson) lessonPanel.start(lesson);
  $("loading").classList.add("hidden");
  ready = true;
}

// ---------- Panels ----------
let panel: PanelName = "ovhd";
function showPanel(name: PanelName) {
  panel = name;
  document.querySelectorAll<HTMLElement>(".cp-panel").forEach((p) => p.classList.toggle("active", p.id === `p-${name}`));
  document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.panel === name));
  requestAnimationFrame(fit);
}
document.querySelectorAll<HTMLElement>("#tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    showPanel(b.dataset.panel as PanelName);
    b.blur();
  }),
);

const pfd = new Pfd($<HTMLCanvasElement>("pfd"));
const nd = new Nd($<HTMLCanvasElement>("nd"));
const ewd = new Ewd($<HTMLCanvasElement>("ewd"));
const sd = new SystemDisplay($<HTMLCanvasElement>("sd"));
const gsInner = document.createElement("div");
gsInner.id = "gs-inner";
$("glareshield").appendChild(gsInner);
// MASTER CAUT on the glareshield: lights amber for a new caution, press to acknowledge.
const masterCaut = document.createElement("button");
masterCaut.id = "master-caut";
masterCaut.dataset.ctl = "master-caut";
masterCaut.innerHTML = "MASTER<br>CAUT";
masterCaut.addEventListener("click", () => {
  x().masterCaution = false;
  masterCaut.blur();
});
const masterWarn = document.createElement("button");
masterWarn.id = "master-warn";
masterWarn.dataset.ctl = "master-warn";
masterWarn.innerHTML = "MASTER<br>WARN";
masterWarn.addEventListener("click", () => {
  x().masterWarning = false;
  masterWarn.blur();
});
gsInner.appendChild(masterWarn);
gsInner.appendChild(masterCaut);
const efis = new EfisPanel(gsInner, () => controls.efis!);
const fcu = new FcuPanel(gsInner, fcuSend, (step) => nd.changeRange(step));
const overhead = new OverheadPanel($("p-ovhd"), () => controls.switches);
const levers = new LeverPanel($("ped-controls"), controls);
const mcdu = new Mcdu($("mcdu-slot"));
const lessonPanel = new LessonPanel<SimState, Controls, FmsData, PanelName>($("lesson-slot"), showPanel, () => panel);
const radioPanels = new RadioPanels($("radio-slot"), () => controls.extras!);
const checklist = new ChecklistPanel<A320Check>(A320_CHECKLISTS, "A320");
const explore = new ExploreMode(A320_EXPLORE);
explore.decorate = glossarize;
enableGlossaryTips();
const radioBox = new RadioBox($("lesson-slot"));
radioBox.voice.enabled = () => sound.on;
radioBox.voice.volume = () => sound.volume;
radioBox.onReadback = () => (controls.extras!.readBack = true);

// ---------- ECAM control panel (pedestal) ----------
const ECAM_PAGES: EcamPage[] = ["ENG", "BLEED", "ELEC", "HYD", "FUEL", "APU", "DOOR", "F/CTL"];
/** The page shown before the APU page opened by itself, to go back to afterwards. */
let pageBeforeApu: EcamPage | null = null;
$("ecam-cp").innerHTML =
  `<div class="ecam-row">${ECAM_PAGES.map((p) => `<button data-page="${p}" data-ctl="ecam-${p.replace("/", "").toLowerCase()}">${p}</button>`).join("")}</div>` +
  `<div class="ecam-row"><button data-ecam="clr" data-ctl="ecam-clr" class="clr">CLR</button><button data-ecam="to" data-ctl="ecam-toconfig">T.O CONFIG</button></div>`;
$("ecam-cp")
  .querySelectorAll<HTMLElement>("[data-page]")
  .forEach((b) =>
    b.addEventListener("click", () => {
      x().ecamPage = b.dataset.page as EcamPage;
      b.blur();
    }),
  );
$("ecam-cp")
  .querySelector<HTMLElement>("[data-ecam=clr]")!
  .addEventListener("click", (e) => {
    if (latest) {
      const shown = shownAlerts(latest, controls);
      if (shown.length) x().cleared.push(shown[0].id);
    }
    (e.currentTarget as HTMLElement).blur();
  });
$("ecam-cp")
  .querySelector<HTMLElement>("[data-ecam=to]")!
  .addEventListener("click", (e) => {
    if (latest) {
      const problems = toConfigTest(latest, controls, mcdu.fms.ths);
      x().toConfigProblems = problems;
      x().toConfigUntil = performance.now() + 6000;
      x().toConfigNormal = problems.length === 0;
      if (problems.length) sound.caution(true);
    }
    (e.currentTarget as HTMLElement).blur();
  });

// ---------- Sidestick: hold buttons or arrow keys ----------
const stick = { up: false, down: false, left: false, right: false };
// The buttons give a firm, not full, input: easier to control than full deflection.
const STICK = 0.6;
function applyStick() {
  controls.pitch = ((stick.up ? 1 : 0) - (stick.down ? 1 : 0)) * STICK;
  controls.roll = ((stick.right ? 1 : 0) - (stick.left ? 1 : 0)) * STICK;
}
document.querySelectorAll<HTMLElement>("[data-stick]").forEach((b) => {
  const dir = b.dataset.stick as keyof typeof stick;
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    stick[dir] = true;
    applyStick();
  });
  for (const ev of ["pointerup", "pointerleave"])
    b.addEventListener(ev, () => {
      stick[dir] = false;
      applyStick();
    });
});
const ARROWS: Record<string, keyof typeof stick> = { ArrowUp: "down", ArrowDown: "up", ArrowLeft: "left", ArrowRight: "right" };
window.addEventListener("keydown", (e) => {
  const d = ARROWS[e.key];
  if (!d || document.activeElement?.id === "mcdu") return;
  e.preventDefault();
  stick[d] = true;
  applyStick();
});
window.addEventListener("keyup", (e) => {
  const d = ARROWS[e.key];
  if (!d) return;
  stick[d] = false;
  applyStick();
});

// Lesson state the page keeps between frames.
let knownAlerts = new Set<string>();
const gen1Seen = { off: false };
let failSent = false;
let readyAt = 0;

// ---------- Time speed-up (for long waits such as fuel balancing) ----------
const timeBtn = $<HTMLButtonElement>("time-btn");
function setRate(r: number) {
  controls.extras!.timeRate = r;
  send({ type: "rate", rate: r });
  timeBtn.textContent = `TIME ×${r}`;
  timeBtn.classList.toggle("fast", r > 1);
}
timeBtn.addEventListener("click", () => {
  const r = controls.extras!.timeRate;
  setRate(r === 1 ? 4 : r === 4 ? 8 : 1);
  timeBtn.blur();
});

// ---------- Sound ----------
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

/** Sizes the active panel to fill the space it has. */
function fit() {
  const box = $("cockpit").getBoundingClientRect();
  // Main panel: three square displays under the FCU strip.
  const disp = Math.floor(Math.max(180, Math.min((box.width - 70) / 3, box.height - 100)));
  document.documentElement.style.setProperty("--disp", `${disp}px`);
  if (panel === "ovhd") overhead.fit();
  if (panel === "main") {
    gsInner.style.zoom = "1";
    gsInner.style.zoom = String(Math.max(minZoom(0), Math.min(1.25, (box.width - 50) / gsInner.scrollWidth)));
  }
  if (panel === "ped") {
    const row = $("ped-row");
    row.style.zoom = "1";
    const z = Math.min(1.6, (box.width - 40) / row.scrollWidth, (box.height - 40) / row.scrollHeight);
    row.style.zoom = String(Math.max(minZoom(0.6), z));
  }
}
window.addEventListener("resize", () => requestAnimationFrame(fit));

// ---------- Keys ----------
window.addEventListener("keydown", (e) => {
  if (e.repeat || quiz.open) return;
  const k = e.key.toLowerCase();
  if (k === "1") showPanel("ovhd");
  if (k === "2") showPanel("main");
  if (k === "3") showPanel("ped");
  if (k === "l") openPicker();
  if (k === "m") {
    sound.setOn(!sound.on);
    showSound();
  }
});

// ---------- Lesson picker, progress and quiz ----------
const quiz = new QuizDialog();
const picker = new LessonPicker({
  current: "a320",
  startHere: (id) => {
    const lesson = LESSONS.find((l) => l.id === id);
    if (lesson) startLesson(lesson);
  },
  startQuiz: (id) => {
    const lesson = LESSONS.find((l) => l.id === id);
    if (lesson) startQuiz(lesson);
  },
  canClose: () => !!currentLesson,
});
function startQuiz(lesson: Lesson) {
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
    openPicker,
  );
}
function openPicker() {
  picker.open();
}
$("lessons-btn").addEventListener("click", (e) => {
  openPicker();
  (e.currentTarget as HTMLElement).blur();
});

// ---------- Frame loop ----------
function frame() {
  requestAnimationFrame(frame);
  if (!ready || !latest) return;
  const s = latest;
  // While autothrust is active the thrust levers follow it.
  if (s.fcc.athrThrottle >= 0) controls.throttle = s.fcc.athrThrottle;
  send({ type: "controls", controls });

  // Screens need AC power. Without it they stay dark.
  if (s.systems.acPower) {
    if (panel === "main") {
      pfd.draw(s, { fms: mcdu.fms, efis: controls.efis!, worldQnh, managedSpd: managedSpeed(s, mcdu.fms) });
      nd.draw(s, mcdu.fms);
      ewd.draw(s, controls);
    }
    if (panel === "ped") sd.draw(s, controls, SystemDisplay.pageFor(s, controls, shownAlerts(s, controls).length > 0));
  } else {
    for (const cv of [pfd.canvas, nd.canvas, ewd.canvas, sd.canvas]) blank(cv);
  }
  ecamFrame(s);
  radioPanels.update(s.systems.acPower);
  radioBox.update(s.systems.acPower ? controls.extras!.vhf1[0] : null, currentLesson?.clearance ?? null, currentLesson?.callsign ?? "Training 123");
  $("glareshield").classList.toggle("unpowered", !s.systems.dcPower);
  fcu.update(s.fcc, managedSpeed(s, mcdu.fms));
  efis.update(controls.efis!);
  levers.update(s, controls);
  overhead.update(controls.switches, s.systems);
  mcdu.setPowered(s.systems.acPower);
  lessonPanel.update(s, controls, mcdu.fms);
  checklist.update({ s, c: controls, fms: mcdu.fms });
  sound.update(s);
  systemSounds(s);

  const eng = s.systems.engines.map((e) => e.phase).join(" / ");
  $("status").textContent = `Power: ${s.systems.acSource || (s.systems.dcPower ? "BAT" : "OFF")} · Engines: ${eng}`;
}
requestAnimationFrame(frame);

/** Lesson failure, master caution, the GEN 1 reset and the flight control check. */
function ecamFrame(s: SimState) {
  const lesson = currentLesson;
  if (lesson?.failAfterS !== undefined && !failSent && performance.now() - readyAt > lesson.failAfterS * 1000) {
    failSent = true;
    send({ type: "fail", what: lesson.failure ?? "gen1" });
  }
  for (const a of activeAlerts(s, controls)) {
    if (!knownAlerts.has(a.id)) {
      knownAlerts.add(a.id);
      if (a.level === "warning") x().masterWarning = true;
      else {
        x().masterCaution = true;
        sound.caution(false);
      }
    }
  }
  trackGen1Cycle(s, controls, x(), gen1Seen);
  // The APU page opens by itself while the APU starts, and closes 10 s after AVAIL.
  const auto = s.systems.apuPageAuto;
  if (auto && pageBeforeApu === null) {
    pageBeforeApu = x().ecamPage;
    x().ecamPage = "APU";
  } else if (!auto && pageBeforeApu !== null) {
    if (x().ecamPage === "APU") x().ecamPage = pageBeforeApu;
    pageBeforeApu = null;
  }
  masterCaut.classList.toggle("lit", x().masterCaution && s.systems.dcPower);
  const warn = x().masterWarning && s.systems.dcPower;
  masterWarn.classList.toggle("lit", warn);
  sound.alarm(warn ? "crc" : null);
  const f = x().fctl;
  if (controls.pitch > 0.5) f.up = true;
  if (controls.pitch < -0.5) f.down = true;
  if (controls.roll < -0.5) f.left = true;
  if (controls.roll > 0.5) f.right = true;
  document.querySelectorAll<HTMLElement>("#ecam-cp [data-page]").forEach((b) =>
    b.classList.toggle("on", b.dataset.page === SystemDisplay.pageFor(s, controls, shownAlerts(s, controls).length > 0)),
  );
}

/** On the ground with V2 entered, the speed target is managed: V2 from the MCDU. */
function managedSpeed(s: SimState, f: FmsData): number | null {
  return s.onGround && f.v2 !== null ? f.v2 : null;
}

// Extra sounds: systems that run while switched on, and one-off events found by comparing frames.
let lastSnd: { apuMaster: boolean; phases: string[]; ap: boolean; vert: string } | null = null;
function systemSounds(s: SimState) {
  const sys = s.systems;
  const sw = controls.switches;
  const ac = sys.acPower;
  const anyRunning = sys.engines.some((e) => e.phase === "RUN");
  sound.systems({
    startAir: sys.engines.filter((e) => e.phase === "CRANK" || e.phase === "LIGHT").length * 0.8,
    igniters: sys.engines.some((e) => e.phase === "LIGHT"),
    ptu: sys.ptuRunning,
    elecHydPumps: (sw.hydYellowElec && ac ? 1 : 0) + (sw.hydBlueElec && ac && anyRunning ? 1 : 0),
    fuelPumps: ac ? [sw.fuelL1, sw.fuelL2, sw.fuelR1, sw.fuelR2, sw.fuelCtr1, sw.fuelCtr2].filter(Boolean).length : 0,
    packs: sys.packFlow.filter(Boolean).length,
    fans: ac,
  });
  const now = { apuMaster: sw.apuMaster, phases: sys.engines.map((e) => e.phase), ap: s.fcc.ap, vert: s.fcc.vert };
  if (lastSnd) {
    if (now.apuMaster && !lastSnd.apuMaster && sys.dcPower) sound.apuDoor();
    now.phases.forEach((p, i) => {
      if (p === "LIGHT" && lastSnd!.phases[i] !== "LIGHT") sound.lightOff();
    });
    if (lastSnd.ap && !now.ap) sound.apDisconnect("trumpet");
    if (now.vert === "ALT*" && lastSnd.vert !== "ALT*") sound.altitudeAlert();
  }
  lastSnd = now;
}

function blank(cv: HTMLCanvasElement) {
  const g = cv.getContext("2d")!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#050607";
  g.fillRect(0, 0, cv.width, cv.height);
  g.restore();
}

let noticeTimer = 0;
function showNotice(text: string) {
  const el = $("notice-msg");
  el.textContent = text;
  el.classList.remove("hidden");
  clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => el.classList.add("hidden"), 6000);
}

function showError(text: string) {
  const el = $("error");
  el.textContent = `Problem: ${text}`;
  el.classList.remove("hidden");
}

// ---------- Start ----------
showPanel("ovhd");
$("loading").classList.add("hidden");
{
  const asked = LESSONS.find((l) => l.id === lessonFromUrl());
  if (asked) startLesson(asked);
  else openPicker();
}

// Hooks for automated browser tests.
const w = window as unknown as Record<string, unknown>;
w.__runwayZero = () => latest;
w.__runwayZeroExplore = explore;
w.__runwayZeroChecklist = () => (latest ? checklist.debug({ s: latest, c: controls, fms: mcdu.fms }) : null);
w.__runwayZeroChecklistSelect = (id: string) => checklist.select(id);
w.__runwayZeroFcu = fcuSend;
w.__runwayZeroFms = () => mcdu.fms;
w.__runwayZeroSound = () => sound.debug();
w.__runwayZeroSoundEvents = () => sound.events;
w.__runwayZeroControls = () => controls;
w.__runwayZeroSpoken = () => radioBox.voice.spoken;
w.__runwayZeroLesson = (id: string) => {
  const l = LESSONS.find((x) => x.id === id);
  if (l) startLesson(l);
};
