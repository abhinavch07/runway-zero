// Runway Zero, R0 spike: globe at Delhi, JSBSim flight model in a worker, keyboard controls, simple PFD.
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";
import { CESIUM_ION_TOKEN, EYE_HEIGHT_M, START } from "./config";
import { KEY_HELP, KeyboardControls } from "./input/keyboard";
import { Pfd } from "./cockpit/pfd";
import type { FromWorker, SimState, ToWorker } from "./sim/types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const rad = Cesium.Math.toRadians;
const M_TO_FT = 3.28084;

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
frustum.fov = rad(70);
frustum.near = 0.5;

function applyQuality(q: Quality) {
  const s = QUALITY[q];
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

// Stand-in aircraft for the outside view: a fuselage and a wing, A320-sized. Real model comes from Blender later.
let latest: SimState | null = null;
const aircraftPos = new Cesium.CallbackPositionProperty(
  () => (latest ? Cesium.Cartesian3.fromDegrees(latest.lonDeg, latest.latDeg, latest.heightM) : undefined),
  false,
);
const aircraftOrient = new Cesium.CallbackProperty(() => {
  if (!latest) return undefined;
  const pos = Cesium.Cartesian3.fromDegrees(latest.lonDeg, latest.latDeg, latest.heightM);
  // Box x axis points east at heading 0, so turn by 90 degrees to point the nose north.
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
let ready = false;
let paused = false;
let view: "cockpit" | "outside" = "cockpit";

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
  onReset: () => send({ type: "reset", start: START }),
  onToggleHelp: () => $("help").classList.toggle("hidden"),
});

worker.onmessage = (ev: MessageEvent<FromWorker>) => {
  const msg = ev.data;
  switch (msg.type) {
    case "ready":
      ready = true;
      keys.setTrimmed(msg.trimmedThrottle, msg.trimmedPitchTrim);
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
send({ type: "init", baseUrl: new URL(".", document.baseURI).href, start: START });

function showError(text: string) {
  const el = $("error");
  el.textContent = `Problem: ${text}`;
  el.classList.remove("hidden");
}

// ---------- Terrain height under the aircraft ----------
// The flight model needs the ground height so it knows where the ground is.
// With a token we sample real terrain about once a second. Without one the ground stays at the start value.
let sampling = false;
setInterval(async () => {
  if (!hasToken || !latest || sampling) return;
  sampling = true;
  try {
    const [c] = await Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [
      Cesium.Cartographic.fromDegrees(latest.lonDeg, latest.latDeg),
    ]);
    if (c && Number.isFinite(c.height)) send({ type: "terrain", elevationFt: c.height * M_TO_FT });
  } catch {
    /* keep the last known height */
  } finally {
    sampling = false;
  }
}, 1000);

// ---------- Cockpit display and readouts ----------
const pfd = new Pfd($<HTMLCanvasElement>("pfd"));
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
  keys.update(dt);
  send({ type: "controls", controls: keys.controls });

  const s = latest;
  if (view === "cockpit") {
    scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(s.lonDeg, s.latDeg, s.heightM + EYE_HEIGHT_M),
      orientation: { heading: rad(s.headingDeg), pitch: rad(s.pitchDeg), roll: rad(s.rollDeg) },
    });
  } else {
    const centre = Cesium.Cartesian3.fromDegrees(s.lonDeg, s.latDeg, s.heightM);
    scene.camera.lookAt(centre, new Cesium.HeadingPitchRange(rad(s.headingDeg), rad(-12), 90));
  }

  pfd.draw(s);
  const c = keys.controls;
  const gear = s.gearPos > 0.99 ? "DOWN" : s.gearPos < 0.01 ? "UP" : "MOVING";
  $("readout").innerHTML = [
    row("Thrust levers", `${Math.round(c.throttle * 100)}%`),
    row("N1", `${s.n1[0].toFixed(1)} / ${s.n1[1].toFixed(1)}`),
    row("Flaps", `${FLAP_LABEL[c.flapLever]} (${s.flapDeg.toFixed(0)}°)`),
    row("Gear", gear),
    row("Speedbrake", s.speedbrakePos > 0.05 ? "OUT" : "IN"),
    row("Trim", c.pitchTrim.toFixed(2)),
    row("Radio alt", s.aglFt < 2500 ? `${Math.round(s.aglFt)} ft` : "–"),
    row("Ground speed", `${Math.round(s.groundSpeedKt)} kt`),
    row("Mach", s.machNo.toFixed(2)),
    row("Frame rate", `${Math.round(fps)} fps`),
    row("Sim speed", `${s.simRate.toFixed(2)}×`),
  ].join("");
  $("paused").classList.toggle("hidden", !paused);
});

function row(label: string, value: string) {
  return `<div class="row"><span>${label}</span><b>${value}</b></div>`;
}

// ---------- Help ----------
$("help-list").innerHTML = KEY_HELP.map(([k, v]) => `<div class="row"><kbd>${k}</kbd><span>${v}</span></div>`).join("");
$("mode").textContent = hasToken ? "Real terrain (Cesium ion)" : "No token: flat ground, street map imagery";
$("start-name").textContent = START.name;

// Read-only hook for automated browser tests.
(window as unknown as { __runwayZero: () => SimState | null }).__runwayZero = () => latest;
