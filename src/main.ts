// Runway Zero: an A320neo-type cockpit procedures trainer.
// The flight model and aircraft systems run in a worker. The page shows one cockpit panel at a time
// (Overhead, Main panel, Pedestal) and a lesson sidebar that guides the learner step by step.
import "./style.css";
import { STARTS } from "./config";
import { Pfd } from "./cockpit/pfd";
import { Nd } from "./cockpit/nd";
import { Ewd } from "./cockpit/ewd";
import { FcuPanel } from "./cockpit/fcu";
import { LeverPanel } from "./cockpit/levers";
import { OverheadPanel } from "./cockpit/overhead";
import { LessonPanel } from "./cockpit/lessonPanel";
import { Mcdu, type FmsData } from "./cockpit/mcdu";
import { EfisPanel } from "./cockpit/efis";
import { LESSONS, type Lesson, type PanelName } from "./lessons/lessons";
import { coldSwitches, startSwitches } from "./sim/systems";
import type { FcuAction } from "./sim/fcc";
import type { Controls, FromWorker, SimState, StartPosition, ToWorker } from "./sim/types";

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
};
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
const ewdSmall = new Ewd($<HTMLCanvasElement>("ewd-small"));
const gsInner = document.createElement("div");
gsInner.id = "gs-inner";
$("glareshield").appendChild(gsInner);
const efis = new EfisPanel(gsInner, () => controls.efis!);
const fcu = new FcuPanel(gsInner, fcuSend, (step) => nd.changeRange(step));
const overhead = new OverheadPanel($("p-ovhd"), () => controls.switches);
const levers = new LeverPanel($("ped-controls"), controls);
const mcdu = new Mcdu($("mcdu-slot"));
const lessonPanel = new LessonPanel($("lesson-slot"), showPanel, () => panel);

/** Sizes the active panel to fill the space it has. */
function fit() {
  const box = $("cockpit").getBoundingClientRect();
  // Main panel: three square displays under the FCU strip.
  const disp = Math.floor(Math.max(180, Math.min((box.width - 70) / 3, box.height - 100)));
  document.documentElement.style.setProperty("--disp", `${disp}px`);
  if (panel === "ovhd") overhead.fit();
  if (panel === "main") {
    gsInner.style.zoom = "1";
    gsInner.style.zoom = String(Math.min(1.25, (box.width - 50) / gsInner.scrollWidth));
  }
  if (panel === "ped") {
    const row = $("ped-row");
    row.style.zoom = "1";
    const z = Math.min(1.6, (box.width - 40) / row.scrollWidth, (box.height - 40) / row.scrollHeight);
    row.style.zoom = String(Math.max(0.6, z));
  }
}
window.addEventListener("resize", () => requestAnimationFrame(fit));

// ---------- Keys ----------
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === "1") showPanel("ovhd");
  if (k === "2") showPanel("main");
  if (k === "3") showPanel("ped");
  if (k === "l") openPicker();
});

// ---------- Lesson picker ----------
$("picker-list").innerHTML = LESSONS.map(
  (l, i) => `<button class="picker-item" data-lesson="${l.id}">
      <span class="picker-num">${i + 1}</span>
      <span><b>${l.title}</b><br><span class="picker-sum">${l.summary.replace(/</g, "&lt;")}</span></span>
      <span class="picker-min">about ${l.minutes} min</span>
    </button>`,
).join("");
document.querySelectorAll<HTMLElement>(".picker-item").forEach((b) =>
  b.addEventListener("click", () => {
    const lesson = LESSONS.find((l) => l.id === b.dataset.lesson);
    if (lesson) startLesson(lesson);
  }),
);
function openPicker() {
  $("picker").classList.remove("hidden");
}
$("lessons-btn").addEventListener("click", (e) => {
  openPicker();
  (e.currentTarget as HTMLElement).blur();
});
$("picker").addEventListener("click", (e) => {
  if (e.target === $("picker") && currentLesson) $("picker").classList.add("hidden");
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
    if (panel === "ped") ewdSmall.draw(s, controls);
  } else {
    for (const cv of [pfd.canvas, nd.canvas, ewd.canvas, ewdSmall.canvas]) blank(cv);
  }
  $("glareshield").classList.toggle("unpowered", !s.systems.dcPower);
  fcu.update(s.fcc, managedSpeed(s, mcdu.fms));
  efis.update(controls.efis!);
  levers.update(s, controls);
  overhead.update(controls.switches, s.systems);
  mcdu.setPowered(s.systems.acPower);
  lessonPanel.update(s, controls, mcdu.fms);

  const eng = s.systems.engines.map((e) => e.phase).join(" / ");
  $("status").textContent = `Power: ${s.systems.acSource || (s.systems.dcPower ? "BAT" : "OFF")} · Engines: ${eng}`;
}
requestAnimationFrame(frame);

/** On the ground with V2 entered, the speed target is managed: V2 from the MCDU. */
function managedSpeed(s: SimState, f: FmsData): number | null {
  return s.onGround && f.v2 !== null ? f.v2 : null;
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
openPicker();

// Hooks for automated browser tests.
const w = window as unknown as Record<string, unknown>;
w.__runwayZero = () => latest;
w.__runwayZeroFcu = fcuSend;
w.__runwayZeroFms = () => mcdu.fms;
w.__runwayZeroLesson = (id: string) => {
  const l = LESSONS.find((x) => x.id === id);
  if (l) startLesson(l);
};
