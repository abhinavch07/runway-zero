// Runway Zero, R1: VIDP runway 28, normal law, autopilot and autothrust, PFD, ND, FCU, 3D cockpit.
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";
import { CESIUM_ION_TOKEN, EYE_OFFSET_M, FOV_DEG, STARTS } from "./config";
import { KEY_HELP, KeyboardControls } from "./input/keyboard";
import { Pfd, RA_ZERO_FT } from "./cockpit/pfd";
import { Nd } from "./cockpit/nd";
import { FcuPanel } from "./cockpit/fcu";
import { Cockpit3D } from "./cockpit/cockpit3d";
import { addRunways } from "./world/runways3d";
import { ILS_28 } from "./world/vidp";
import type { FcuAction } from "./sim/fcc";
import type { FromWorker, SimState, StartPosition, ToWorker, TouchdownReport } from "./sim/types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const rad = Cesium.Math.toRadians;
const M_TO_FT = 3.28084;
const FT_TO_M = 0.3048;

type Quality = "low" | "medium" | "high";
const QUALITY: Record<Quality, { scale: number; sse: number; fxaa: boolean }> = {
  low: { scale: 0.6, sse: 4, fxaa: false },
  medium: { scale: 0.85, sse: 2, fxaa: true },
  high: { scale: 1, sse: 1.5, fxaa: true },
};

// ---------- Globe ----------
const hasToken = CESIUM_ION_TOKEN.length > 0;
if (hasToken) Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;

const viewer = new Cesium.Viewer("globe", {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  scene3DOnly: true,
  shadows: false,
  baseLayer: hasToken
    ? Cesium.ImageryLayer.fromWorldImagery({})
    : new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({ url: "https://tile.openstreetmap.org/" })),
  terrain: hasToken ? Cesium.Terrain.fromWorldTerrain() : undefined,
});
const scene = viewer.scene;
scene.screenSpaceCameraController.enableInputs = false; // the aircraft drives the camera
scene.globe.depthTestAgainstTerrain = true;
scene.fog.enabled = true;
if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
const frustum = scene.camera.frustum as Cesium.PerspectiveFrustum;
frustum.near = 0.5;
addRunways(viewer, hasToken);

let cockpit3d: Cockpit3D | null = null;

// Cesium's fov is the wider of the two screen directions. Three.js uses the vertical one.
function syncFov() {
  const aspect = window.innerWidth / window.innerHeight;
  frustum.fov = rad(FOV_DEG);
  const wide = rad(FOV_DEG);
  const vertical = aspect >= 1 ? 2 * Math.atan(Math.tan(wide / 2) / aspect) : wide;
  if (cockpit3d) {
    cockpit3d.camera.fov = Cesium.Math.toDegrees(vertical);
    cockpit3d.camera.updateProjectionMatrix();
  }
}
window.addEventListener("resize", syncFov);

function applyQuality(q: Quality) {
  const s = QUALITY[q];
  viewer.resolutionScale = s.scale;
  cockpit3d?.setPixelRatio(s.scale);
  scene.globe.maximumScreenSpaceError = s.sse;
  scene.postProcessStages.fxaa.enabled = s.fxaa;
  try {
    localStorage.setItem("rz-quality", q);
  } catch {
    /* storage may be blocked, quality just will not be remembered */
  }
}
const qualitySelect = $<HTMLSelectElement>("quality");
let savedQuality: Quality = "medium";
try {
  savedQuality = (localStorage.getItem("rz-quality") as Quality) || "medium";
} catch {
  /* ignore */
}
qualitySelect.value = savedQuality;
applyQuality(savedQuality);
qualitySelect.addEventListener("change", () => {
  applyQuality(qualitySelect.value as Quality);
  qualitySelect.blur();
});

// ---------- Start positions ----------
const startSelect = $<HTMLSelectElement>("start");
startSelect.innerHTML = STARTS.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
let currentStart: StartPosition = STARTS[0];
startSelect.addEventListener("change", () => {
  currentStart = STARTS.find((s) => s.id === startSelect.value) ?? STARTS[0];
  startSelect.blur();
  resetTo(currentStart);
});

// The flight model works in true altitude above sea level. The globe uses height above the WGS84
// ellipsoid. Near Delhi the two differ by tens of metres, so we measure the difference at the runway
// 28 threshold once and use it for the whole area.
let displayOffsetM = -ILS_28.threshold.elevationFt * FT_TO_M; // no token: flat ground at height 0
async function measureOffset() {
  if (!hasToken) return;
  try {
    const [c] = await Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [
      Cesium.Cartographic.fromDegrees(ILS_28.threshold.lonDeg, ILS_28.threshold.latDeg),
    ]);
    if (c && Number.isFinite(c.height)) displayOffsetM = c.height - ILS_28.threshold.elevationFt * FT_TO_M;
  } catch {
    /* keep the default */
  }
}

// Stand-in aircraft for the outside view: a fuselage and a wing, A320-sized.
let latest: SimState | null = null;
const aircraftPos = new Cesium.CallbackPositionProperty(
  () => (latest ? Cesium.Cartesian3.fromDegrees(latest.lonDeg, latest.latDeg, latest.heightM) : undefined),
  false,
);
const aircraftOrient = new Cesium.CallbackProperty(() => {
  if (!latest) return undefined;
  const pos = Cesium.Cartesian3.fromDegrees(latest.lonDeg, latest.latDeg, latest.heightM);
  const hpr = new Cesium.HeadingPitchRoll(rad(latest.headingDeg - 90), rad(latest.pitchDeg), rad(latest.rollDeg));
  return Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);
}, false);
const bodyColour = Cesium.Color.WHITESMOKE;
const fuselage = viewer.entities.add({
  position: aircraftPos,
  orientation: aircraftOrient,
  box: { dimensions: new Cesium.Cartesian3(37.6, 4, 4), material: bodyColour },
  show: false,
});
const wing = viewer.entities.add({
  position: aircraftPos,
  orientation: aircraftOrient,
  box: { dimensions: new Cesium.Cartesian3(6, 35.8, 0.6), material: bodyColour },
  show: false,
});

// ---------- Flight model worker ----------
const worker = new Worker(new URL("./sim/fdm.worker.ts", import.meta.url), { type: "module" });
const send = (msg: ToWorker) => worker.postMessage(msg);
const fcuSend = (action: FcuAction) => send({ type: "fcu", action });
let ready = false;
let paused = false;
let view: "cockpit" | "outside" = "cockpit";
let show3dCockpit = true;
let shownTouchdown: TouchdownReport | null = null;

const keys = new KeyboardControls({
  onToggleView: () => {
    view = view === "cockpit" ? "outside" : "cockpit";
    fuselage.show = wing.show = view === "outside";
    if (view === "cockpit") scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    updateLayers();
  },
  onTogglePause: () => {
    paused = !paused;
    send({ type: "pause", paused });
  },
  onReset: () => resetTo(currentStart),
  onToggleHelp: () => $("help").classList.toggle("hidden"),
  onToggleCockpit: () => {
    show3dCockpit = !show3dCockpit;
    updateLayers();
  },
  onAp: () => fcuSend({ kind: "ap" }),
  onAthr: () => fcuSend({ kind: "athr" }),
});

function resetTo(start: StartPosition) {
  ready = false;
  $("touchdown").classList.add("hidden");
  shownTouchdown = null;
  send({ type: "reset", start, displayOffsetM });
}

worker.onmessage = (ev: MessageEvent<FromWorker>) => {
  const msg = ev.data;
  switch (msg.type) {
    case "ready":
      keys.setStart(msg.throttle, msg.start.flapLever, msg.start.gearDown);
      ready = true;
      $("loading").classList.add("hidden");
      break;
    case "state":
      latest = msg.state;
      break;
    case "error":
      showError(msg.message);
      break;
    case "log":
      console.debug("[jsbsim]", msg.message);
      break;
  }
};
worker.onerror = (e) => showError(e.message || "The flight model worker stopped");
measureOffset().then(() =>
  send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start: currentStart, displayOffsetM }),
);

function showError(text: string) {
  const el = $("error");
  el.textContent = `Problem: ${text}`;
  el.classList.remove("hidden");
}

// ---------- Terrain height under the aircraft ----------
let sampling = false;
setInterval(async () => {
  if (!hasToken || !latest || sampling) return;
  sampling = true;
  try {
    const [c] = await Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [
      Cesium.Cartographic.fromDegrees(latest.lonDeg, latest.latDeg),
    ]);
    if (c && Number.isFinite(c.height)) send({ type: "terrain", elevationFt: (c.height - displayOffsetM) * M_TO_FT });
  } catch {
    /* keep the last known height */
  } finally {
    sampling = false;
  }
}, 1000);

// ---------- Cockpit displays ----------
const pfd = new Pfd($<HTMLCanvasElement>("pfd"));
const nd = new Nd($<HTMLCanvasElement>("nd"));
const fcu = new FcuPanel(document.body, fcuSend, (step) => nd.changeRange(step));
cockpit3d = new Cockpit3D(document.body, { pfd: pfd.canvas, nd: nd.canvas, fcu: fcu.canvas }, FOV_DEG, {
  onGearLever: () => (keys.controls.gearDown = !keys.controls.gearDown),
  onFlapLever: () => (keys.controls.flapLever = (keys.controls.flapLever + 1) % 5),
});
cockpit3d.setPixelRatio(QUALITY[qualitySelect.value as Quality].scale);
syncFov();

/** The 3D cockpit shows in cockpit view. The flat PFD and ND show when the 3D cockpit is hidden. */
function updateLayers() {
  const cockpitOn = view === "cockpit" && show3dCockpit;
  cockpit3d!.setVisible(cockpitOn);
  $("displays").classList.toggle("hidden", cockpitOn);
}
updateLayers();
scene.postRender.addEventListener(() => cockpit3d!.render());

// ---------- Camera ----------
const scratchEnu = new Cesium.Matrix4();

/** Builds the aircraft's forward, right and up axes in Earth-fixed coordinates. */
function bodyAxes(s: SimState, origin: Cesium.Cartesian3) {
  const psi = rad(s.headingDeg);
  const th = rad(s.pitchDeg);
  const ph = rad(s.rollDeg);
  const f = new Cesium.Cartesian3(Math.sin(psi) * Math.cos(th), Math.cos(psi) * Math.cos(th), Math.sin(th));
  const r0 = new Cesium.Cartesian3(Math.cos(psi), -Math.sin(psi), 0);
  const u0 = Cesium.Cartesian3.cross(r0, f, new Cesium.Cartesian3());
  const mix = (a: Cesium.Cartesian3, b: Cesium.Cartesian3, ka: number, kb: number) =>
    new Cesium.Cartesian3(a.x * ka + b.x * kb, a.y * ka + b.y * kb, a.z * ka + b.z * kb);
  const r = mix(r0, u0, Math.cos(ph), -Math.sin(ph));
  const u = mix(u0, r0, Math.cos(ph), Math.sin(ph));
  Cesium.Transforms.eastNorthUpToFixedFrame(origin, Cesium.Ellipsoid.WGS84, scratchEnu);
  return {
    f: Cesium.Matrix4.multiplyByPointAsVector(scratchEnu, f, new Cesium.Cartesian3()),
    r: Cesium.Matrix4.multiplyByPointAsVector(scratchEnu, r, new Cesium.Cartesian3()),
    u: Cesium.Matrix4.multiplyByPointAsVector(scratchEnu, u, new Cesium.Cartesian3()),
  };
}

function combine(a: Cesium.Cartesian3, b: Cesium.Cartesian3, c: Cesium.Cartesian3, x: number, y: number, z: number) {
  return new Cesium.Cartesian3(a.x * x + b.x * y + c.x * z, a.y * x + b.y * y + c.y * z, a.z * x + b.z * y + c.z * z);
}

/** Puts the globe camera at the pilot's eye, looking where the head is turned. */
function setCockpitCamera(s: SimState) {
  const origin = Cesium.Cartesian3.fromDegrees(s.lonDeg, s.latDeg, s.heightM);
  const { f, r, u } = bodyAxes(s, origin);
  const eye = Cesium.Cartesian3.add(
    origin,
    combine(f, r, u, EYE_OFFSET_M.forward, EYE_OFFSET_M.right, EYE_OFFSET_M.up),
    new Cesium.Cartesian3(),
  );
  const d = cockpit3d!.headDirection();
  const hu = cockpit3d!.headUp();
  scene.camera.setView({
    destination: eye,
    orientation: {
      direction: Cesium.Cartesian3.normalize(combine(f, r, u, d.forward, d.right, d.up), new Cesium.Cartesian3()),
      up: Cesium.Cartesian3.normalize(combine(f, r, u, hu.forward, hu.right, hu.up), new Cesium.Cartesian3()),
    },
  });
}

// ---------- Frame loop ----------
const FLAP_LABEL = ["0", "1", "2", "3", "FULL"];
let lastFrame = performance.now();
let frames = 0;
let fps = 0;
let fpsTimer = performance.now();

scene.preRender.addEventListener(() => {
  const now = performance.now();
  const dt = Math.min(0.25, (now - lastFrame) / 1000);
  lastFrame = now;
  frames++;
  if (now - fpsTimer >= 1000) {
    fps = (frames * 1000) / (now - fpsTimer);
    frames = 0;
    fpsTimer = now;
  }

  if (!ready || !latest) return;
  const s = latest;
  // While autothrust is active the thrust levers follow it, so nothing jumps when it disconnects.
  keys.update(dt, s.fcc.athrThrottle >= 0 ? s.fcc.athrThrottle : null);
  send({ type: "controls", controls: keys.controls });

  if (view === "cockpit") setCockpitCamera(s);
  else {
    const centre = Cesium.Cartesian3.fromDegrees(s.lonDeg, s.latDeg, s.heightM);
    scene.camera.lookAt(centre, new Cesium.HeadingPitchRange(rad(s.headingDeg), rad(-12), 90));
  }

  pfd.draw(s);
  nd.draw(s);
  const fcuChanged = fcu.update(s.fcc);
  cockpit3d!.update(s, keys.controls, fcuChanged);

  const c = keys.controls;
  const gear = s.gearPos > 0.99 ? "DOWN" : s.gearPos < 0.01 ? "UP" : "MOVING";
  const ra = s.aglFt - RA_ZERO_FT;
  $("readout").innerHTML = [
    row("Thrust levers", `${Math.round(c.throttle * 100)}%${s.fcc.athr ? " (A/THR)" : ""}`),
    row("N1", `${s.n1[0].toFixed(1)} / ${s.n1[1].toFixed(1)}`),
    row("Flaps", `${FLAP_LABEL[c.flapLever]} (${s.flapDeg.toFixed(0)}°)`),
    row("Gear", gear),
    row("Speedbrake", s.speedbrakePos > 0.05 ? "OUT" : "IN"),
    row("Brakes", c.brakes > 0 ? "ON" : "OFF"),
    row("Radio height", ra < 2500 && !s.onGround ? `${Math.max(0, Math.round(ra))} ft` : "–"),
    row("Ground speed", `${Math.round(s.groundSpeedKt)} kt`),
    row("Frame rate", `${Math.round(fps)} fps`),
    row("Sim speed", `${s.simRate.toFixed(2)}×`),
  ].join("");
  $("paused").classList.toggle("hidden", !paused);

  if (s.touchdown && s.touchdown !== shownTouchdown && s.touchdown.simTime !== shownTouchdown?.simTime) {
    shownTouchdown = s.touchdown;
    showTouchdown(s.touchdown);
  }
});

function row(label: string, value: string) {
  return `<div class="row"><span>${label}</span><b>${value}</b></div>`;
}

function showTouchdown(t: TouchdownReport) {
  const sink = Math.abs(t.vsFpm);
  const feel = sink < 240 ? "Smooth" : sink < 360 ? "Firm" : sink < 600 ? "Hard" : "Very hard, would need an inspection";
  const zone =
    t.distPastThresholdM < 0
      ? "Short of the runway!"
      : t.distPastThresholdM <= 750
        ? "In the touchdown zone"
        : "Long, past the touchdown zone";
  const side = Math.abs(t.offCentreM) < 1 ? "on the centreline" : `${Math.abs(t.offCentreM).toFixed(0)} m ${t.offCentreM > 0 ? "right" : "left"} of the centreline`;
  $("touchdown").innerHTML = `
    <h3>Touchdown, runway 28</h3>
    <div class="row"><span>Sink rate</span><b>${Math.round(sink)} fpm · ${feel}</b></div>
    <div class="row"><span>Distance past threshold</span><b>${Math.round(t.distPastThresholdM)} m · ${zone}</b></div>
    <div class="row"><span>Position</span><b>${side}</b></div>
    <div class="row"><span>Speed</span><b>${Math.round(t.kias)} kt</b></div>
    <div class="row"><span>Pitch / bank</span><b>${t.pitchDeg.toFixed(1)}° / ${t.rollDeg.toFixed(1)}°</b></div>
    <p>Click to close</p>`;
  $("touchdown").classList.remove("hidden");
}
$("touchdown").addEventListener("click", () => $("touchdown").classList.add("hidden"));

// ---------- Help ----------
$("help-list").innerHTML = KEY_HELP.map(([k, v]) => `<div class="row"><kbd>${k}</kbd><span>${v}</span></div>`).join("");
$("mode").textContent = hasToken ? "Real terrain" : "No token: flat ground";

// Read-only hook for automated browser tests.
(window as unknown as { __runwayZero: () => SimState | null }).__runwayZero = () => latest;
(window as unknown as { __runwayZeroFcu: (a: FcuAction) => void }).__runwayZeroFcu = fcuSend;
