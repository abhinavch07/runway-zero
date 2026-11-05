// Runway Zero, R1: VIDP runway 28, normal law, autopilot and autothrust, PFD, ND, E/WD, FCU on a 2D panel.
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";
import { CESIUM_ION_TOKEN, EYE_OFFSET_M, FOV_DEG, GOOGLE_MAPS_KEY, STARTS } from "./config";
import { KEY_HELP, KeyboardControls } from "./input/keyboard";
import { Pfd, RA_ZERO_FT } from "./cockpit/pfd";
import { Nd } from "./cockpit/nd";
import { FcuPanel } from "./cockpit/fcu";
import { Ewd } from "./cockpit/ewd";
import { LeverPanel } from "./cockpit/levers";
import { OverheadPanel } from "./cockpit/overhead";
import { GuidedChecklist, type PanelName } from "./cockpit/checklist";
import { addRunways } from "./world/runways3d";
import { ILS_28 } from "./world/vidp";
import type { FcuAction } from "./sim/fcc";
import type { FromWorker, SimState, StartPosition, ToWorker, TouchdownReport } from "./sim/types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const rad = Cesium.Math.toRadians;
const M_TO_FT = 3.28084;
const FT_TO_M = 0.3048;

type Quality = "low" | "medium" | "high";
// retina: draw at the screen's full pixel density (sharp on Retina screens, heavier on the GPU).
// sse: how much ground detail to load (lower = sharper, more downloads).
const QUALITY: Record<Quality, { scale: number; retina: boolean; sse: number; fxaa: boolean }> = {
  low: { scale: 0.75, retina: false, sse: 3, fxaa: false },
  medium: { scale: 1, retina: false, sse: 1.5, fxaa: true },
  high: { scale: 1, retina: true, sse: 1, fxaa: true },
};

// ---------- Globe ----------
const hasToken = CESIUM_ION_TOKEN.length > 0;
if (hasToken) Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;

// Scenery: "standard" (globe imagery and terrain), "buildings" (standard plus free OpenStreetMap
// 3D buildings from Cesium ion) or "google" (Google Photorealistic 3D Tiles). Google 3D comes free
// through Cesium ion (1,000 loads a month on the free plan), or through the user's own Google key.
// Changing the scenery reloads the page.
type Scenery = "standard" | "buildings" | "google";
const hasGoogleKey = GOOGLE_MAPS_KEY.length > 0;
const googleAvailable = hasToken || hasGoogleKey;
let scenery: Scenery = "standard";
try {
  const saved = localStorage.getItem("rz-scenery");
  if (saved === "google" && googleAvailable) scenery = "google";
  if (saved === "buildings" && hasToken) scenery = "buildings";
} catch {
  /* ignore */
}

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
});
const scene = viewer.scene;
scene.globe.tileCacheSize = 500;
scene.globe.preloadSiblings = true;

// Google Photorealistic 3D Tiles replace the globe surface. Attribution and the Google logo are
// shown by Cesium in the bottom right corner and must stay visible.
let googleTiles: Cesium.Cesium3DTileset | null = null;
const googleReady: Promise<void> =
  scenery === "google"
    ? Cesium.createGooglePhotorealistic3DTileset(
        hasGoogleKey
          ? { key: GOOGLE_MAPS_KEY, onlyUsingWithGoogleGeocoder: true }
          : { onlyUsingWithGoogleGeocoder: true }, // no key: loads through the Cesium ion token
      )
        .then((tileset) => {
          googleTiles = tileset;
          scene.primitives.add(tileset);
          scene.globe.show = false;
        })
        .catch((e) => {
          showNotice(`Google 3D scenery failed to load (${e?.message ?? e}). Using standard scenery.`);
          $("mode").textContent = hasToken ? "Real terrain (Google 3D failed)" : "Flat ground (Google 3D failed)";
          if (!hasToken) addRunways(viewer, false);
        })
    : Promise.resolve();

// Free OpenStreetMap 3D buildings from Cesium ion, on top of the standard globe.
if (scenery === "buildings") {
  Cesium.createOsmBuildingsAsync()
    .then((tileset) => scene.primitives.add(tileset))
    .catch((e) => showNotice(`3D buildings failed to load (${e?.message ?? e}).`));
}

// Real terrain loads in the background. Until it is ready the globe is flat, so nothing that
// measures the ground (the height offset, the terrain under the aircraft) may run before it.
let terrainLoaded = false;
const terrainReady: Promise<void> = hasToken
  ? Cesium.createWorldTerrainAsync()
      .then((provider) => {
        scene.terrainProvider = provider;
        terrainLoaded = true;
      })
      .catch(() => {
        $("mode").textContent = "Real terrain failed to load: flat ground";
      })
  : Promise.resolve();
scene.screenSpaceCameraController.enableInputs = false; // the aircraft drives the camera
scene.globe.depthTestAgainstTerrain = true;
scene.fog.enabled = true;
if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
const frustum = scene.camera.frustum as Cesium.PerspectiveFrustum;
frustum.near = 0.5;
// Our own runway drawing only on the flat no-token globe. On real imagery it would sit on top of the
// real runways slightly out of place.
if (!hasToken && scenery === "standard") addRunways(viewer, false);

frustum.fov = rad(FOV_DEG);

// ---------- Panel layout: outside window on top, instrument panel below ----------
let panelShown = true;
function layout() {
  const panelH = panelShown ? Math.round(Math.min(460, Math.max(300, window.innerHeight * 0.4))) : 0;
  const root = document.documentElement.style;
  root.setProperty("--panel-h", `${panelH}px`);
  // Display size: panel height minus the glareshield (FCU) strip and padding, and never so wide
  // that three displays plus the levers overflow the screen.
  const byHeight = panelH - 74;
  const byWidth = Math.floor((window.innerWidth - 470) / 3) - 12;
  root.setProperty("--disp", `${Math.max(180, Math.min(byHeight, byWidth))}px`);
  $("panel").classList.toggle("hidden", !panelShown);
}
window.addEventListener("resize", () => {
  layout();
  requestAnimationFrame(() => overheadFit());
});
layout();
let overheadFit = () => {};

// Head turn in the cockpit view: drag on the window, double-click to look ahead again.
const HEAD_PITCH_DEFAULT = -0.06;
let headYaw = 0;
let headPitch = HEAD_PITCH_DEFAULT;
{
  const el = $("globe");
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    headYaw = Math.max(-2.4, Math.min(2.4, headYaw + (e.clientX - lastX) * 0.004));
    headPitch = Math.max(-1.2, Math.min(1.2, headPitch - (e.clientY - lastY) * 0.004));
    lastX = e.clientX;
    lastY = e.clientY;
  });
  el.addEventListener("pointerup", () => (dragging = false));
  el.addEventListener("dblclick", () => {
    headYaw = 0;
    headPitch = HEAD_PITCH_DEFAULT;
  });
}

function applyQuality(q: Quality) {
  const s = QUALITY[q];
  viewer.useBrowserRecommendedResolution = !s.retina;
  viewer.resolutionScale = s.scale;
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
let offsetMeasured = false;
async function measureOffset() {
  await Promise.all([terrainReady, googleReady]);
  if (googleTiles) {
    // With Google 3D scenery the visible ground is the Google mesh, so measure the runway height
    // from it. Wait a moment for the tiles around the threshold to load first.
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const [c] = await scene.sampleHeightMostDetailed([
        Cesium.Cartographic.fromDegrees(ILS_28.threshold.lonDeg, ILS_28.threshold.latDeg),
      ]);
      if (c && Number.isFinite(c.height)) {
        displayOffsetM = c.height - ILS_28.threshold.elevationFt * FT_TO_M;
        offsetMeasured = terrainLoaded;
        return;
      }
    } catch {
      /* fall back to the terrain measurement below */
    }
  }
  if (!terrainLoaded) return;
  try {
    const [c] = await Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [
      Cesium.Cartographic.fromDegrees(ILS_28.threshold.lonDeg, ILS_28.threshold.latDeg),
    ]);
    if (c && Number.isFinite(c.height)) {
      displayOffsetM = c.height - ILS_28.threshold.elevationFt * FT_TO_M;
      offsetMeasured = true;
    }
  } catch {
    /* keep the default */
  }
}

// Stand-in aircraft for the outside view: a fuselage and a wing, A320-sized.
let latest: SimState | null = null;
const finiteState = (s: SimState | null): s is SimState =>
  !!s && Number.isFinite(s.latDeg) && Number.isFinite(s.lonDeg) && Number.isFinite(s.heightM);
const aircraftPos = new Cesium.CallbackPositionProperty(
  () => (finiteState(latest) ? Cesium.Cartesian3.fromDegrees(latest.lonDeg, latest.latDeg, latest.heightM) : undefined),
  false,
);
const aircraftOrient = new Cesium.CallbackProperty(() => {
  if (!finiteState(latest)) return undefined;
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
let shownTouchdown: TouchdownReport | null = null;

const keys = new KeyboardControls({
  onToggleView: () => {
    view = view === "cockpit" ? "outside" : "cockpit";
    fuselage.show = wing.show = view === "outside";
    if (view === "cockpit") scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  },
  onTogglePause: () => {
    paused = !paused;
    send({ type: "pause", paused });
  },
  onReset: () => resetTo(currentStart),
  onToggleHelp: () => $("help").classList.toggle("hidden"),
  onTogglePanel: () => {
    panelShown = !panelShown;
    layout();
  },
  onAp: () => fcuSend({ kind: "ap" }),
  onAthr: () => fcuSend({ kind: "athr" }),
  onOverhead: () => showPanel(panelName === "ovhd" ? "main" : "ovhd"),
});
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "k" && (e.target as HTMLElement)?.tagName !== "SELECT") checklist.toggle();
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
      keys.setStart(msg.throttle, msg.start.flapLever, msg.start.gearDown, !!msg.start.coldAndDark);
      if (msg.start.coldAndDark) {
        checklist.start();
        showPanel("ovhd");
      } else {
        checklist.stop();
        showPanel("main");
      }
      ready = true;
      $("loading").classList.add("hidden");
      break;
    case "state":
      if (finiteState(msg.state)) latest = msg.state;
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
worker.onerror = (e) => showError(e.message || "The flight model worker stopped");
measureOffset().then(() =>
  send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start: currentStart, displayOffsetM }),
);

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

// ---------- Terrain height under the aircraft ----------
let sampling = false;
setInterval(async () => {
  if (!terrainLoaded || !offsetMeasured || !latest || sampling) return;
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
const ewd = new Ewd($<HTMLCanvasElement>("ewd"));
const fcu = new FcuPanel($("glareshield"), fcuSend, (step) => nd.changeRange(step));
const levers = new LeverPanel($("instruments"), keys.controls);
const overhead = new OverheadPanel($("instruments"), () => keys.controls.switches);
$("instruments").insertBefore(overhead.el, $("ewd"));
overheadFit = () => overhead.fit();

// Panel tabs on the glareshield: MAIN shows PFD and ND, OVHD shows the overhead panel.
let panelName: PanelName = "main";
const tabs = document.createElement("div");
tabs.id = "panel-tabs";
for (const [name, label] of [
  ["main", "MAIN"],
  ["ovhd", "OVHD (O)"],
] as [PanelName, string][]) {
  const b = document.createElement("button");
  b.textContent = label;
  b.dataset.ctl = `tab-${name}`;
  b.addEventListener("click", () => {
    showPanel(name);
    b.blur();
  });
  tabs.appendChild(b);
}
$("glareshield").prepend(tabs);
function showPanel(name: PanelName) {
  panelName = name;
  $("instruments").dataset.view = name;
  requestAnimationFrame(() => overhead.fit());
  tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.ctl === `tab-${name}`));
}
showPanel("main");
const checklist = new GuidedChecklist(document.body, showPanel, () => panelName);

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
  const cp = Math.cos(headPitch);
  const sp = Math.sin(headPitch);
  const d = { forward: cp * Math.cos(headYaw), right: cp * Math.sin(headYaw), up: sp };
  const hu = { forward: -sp * Math.cos(headYaw), right: -sp * Math.sin(headYaw), up: cp };
  scene.camera.setView({
    destination: eye,
    orientation: {
      direction: Cesium.Cartesian3.normalize(combine(f, r, u, d.forward, d.right, d.up), new Cesium.Cartesian3()),
      up: Cesium.Cartesian3.normalize(combine(f, r, u, hu.forward, hu.right, hu.up), new Cesium.Cartesian3()),
    },
  });
}

// ---------- Frame loop ----------
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

  const c = keys.controls;
  // Screens need AC power. Without it they stay dark.
  const powered = s.systems.acPower;
  if (powered) {
    pfd.draw(s);
    nd.draw(s);
    ewd.draw(s, c);
  } else {
    for (const cv of [pfd.canvas, nd.canvas, ewd.canvas]) blank(cv);
  }
  $("glareshield").classList.toggle("unpowered", !s.systems.dcPower);
  fcu.update(s.fcc);
  levers.update(s, c);
  overhead.update(c.switches, s.systems);
  checklist.update(s, c);

  const ra = s.aglFt - RA_ZERO_FT;
  $("readout").innerHTML = [
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

function blank(cv: HTMLCanvasElement) {
  const g = cv.getContext("2d")!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#050607";
  g.fillRect(0, 0, cv.width, cv.height);
  g.restore();
}

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
$("mode").textContent =
  scenery === "google"
    ? hasGoogleKey
      ? "Google 3D scenery"
      : "Google 3D via Cesium ion"
    : scenery === "buildings"
      ? "Real terrain + 3D buildings"
      : hasToken
        ? "Real terrain"
        : "No token: flat ground";
const scenerySelect = $<HTMLSelectElement>("scenery");
scenerySelect.value = scenery;
(scenerySelect.querySelector('option[value="google"]') as HTMLOptionElement).disabled = !googleAvailable;
(scenerySelect.querySelector('option[value="buildings"]') as HTMLOptionElement).disabled = !hasToken;
if (!hasToken) scenerySelect.title = "Add your free Cesium ion token to .env for 3D buildings and Google 3D";
scenerySelect.addEventListener("change", () => {
  try {
    localStorage.setItem("rz-scenery", scenerySelect.value);
  } catch {
    /* ignore */
  }
  location.reload();
});

// Read-only hook for automated browser tests.
(window as unknown as { __runwayZero: () => SimState | null }).__runwayZero = () => latest;
(window as unknown as { __runwayZeroFcu: (a: FcuAction) => void }).__runwayZeroFcu = fcuSend;
