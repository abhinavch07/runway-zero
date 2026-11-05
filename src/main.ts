// Runway Zero, R0 spike: globe at Delhi, JSBSim flight model in a worker, keyboard controls, simple PFD.
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";
import { CESIUM_ION_TOKEN, EYE_OFFSET_M, FOV_DEG, START } from "./config";
import { KEY_HELP, KeyboardControls } from "./input/keyboard";
import { Pfd } from "./cockpit/pfd";
import { Cockpit3D } from "./cockpit/cockpit3d";
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
frustum.near = 0.5;
let cockpit3d: Cockpit3D | null = null;

// Cesium's fov is the wider of the two screen directions. Three.js uses the vertical one.
// Both are set from the same value so the cockpit and the outside world line up.
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
    updateLayers();
  },
  onTogglePause: () => {
    paused = !paused;
    send({ type: "pause", paused });
  },
  onReset: () => send({ type: "reset", start: START }),
  onToggleHelp: () => $("help").classList.toggle("hidden"),
  onToggleCockpit: () => {
    show3dCockpit = !show3dCockpit;
    updateLayers();
  },
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
let show3dCockpit = true;
cockpit3d = new Cockpit3D(document.body, $<HTMLCanvasElement>("pfd"), FOV_DEG, {
  onGearLever: () => (keys.controls.gearDown = !keys.controls.gearDown),
  onFlapLever: () => (keys.controls.flapLever = (keys.controls.flapLever + 1) % 5),
});
cockpit3d.setPixelRatio(QUALITY[qualitySelect.value as Quality].scale);
syncFov();

/** The 3D cockpit shows in cockpit view. The flat PFD panel shows when the 3D cockpit is hidden. */
function updateLayers() {
  const cockpitOn = view === "cockpit" && show3dCockpit;
  cockpit3d!.setVisible(cockpitOn);
  $("pfd-wrap").classList.toggle("hidden", cockpitOn);
}
updateLayers();
scene.postRender.addEventListener(() => cockpit3d!.render());

const scratch = {
  enu: new Cesium.Matrix4(),
  f: new Cesium.Cartesian3(),
  r: new Cesium.Cartesian3(),
  u: new Cesium.Cartesian3(),
  tmp: new Cesium.Cartesian3(),
};

/** Builds the aircraft's forward, right and up axes in Earth-fixed coordinates. */
function bodyAxes(s: SimState, origin: Cesium.Cartesian3) {
  const psi = rad(s.headingDeg);
  const th = rad(s.pitchDeg);
  const ph = rad(s.rollDeg);
  // In east-north-up: forward from heading and pitch, then right and up turned by roll.
  const f = new Cesium.Cartesian3(Math.sin(psi) * Math.cos(th), Math.cos(psi) * Math.cos(th), Math.sin(th));
  const r0 = new Cesium.Cartesian3(Math.cos(psi), -Math.sin(psi), 0);
  const u0 = Cesium.Cartesian3.cross(r0, f, new Cesium.Cartesian3());
  const r = new Cesium.Cartesian3(
    r0.x * Math.cos(ph) - u0.x * Math.sin(ph),
    r0.y * Math.cos(ph) - u0.y * Math.sin(ph),
    r0.z * Math.cos(ph) - u0.z * Math.sin(ph),
  );
  const u = new Cesium.Cartesian3(
    u0.x * Math.cos(ph) + r0.x * Math.sin(ph),
    u0.y * Math.cos(ph) + r0.y * Math.sin(ph),
    u0.z * Math.cos(ph) + r0.z * Math.sin(ph),
  );
  Cesium.Transforms.eastNorthUpToFixedFrame(origin, Cesium.Ellipsoid.WGS84, scratch.enu);
  return {
    f: Cesium.Matrix4.multiplyByPointAsVector(scratch.enu, f, new Cesium.Cartesian3()),
    r: Cesium.Matrix4.multiplyByPointAsVector(scratch.enu, r, new Cesium.Cartesian3()),
    u: Cesium.Matrix4.multiplyByPointAsVector(scratch.enu, u, new Cesium.Cartesian3()),
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
    setCockpitCamera(s);
  } else {
    const centre = Cesium.Cartesian3.fromDegrees(s.lonDeg, s.latDeg, s.heightM);
    scene.camera.lookAt(centre, new Cesium.HeadingPitchRange(rad(s.headingDeg), rad(-12), 90));
  }

  pfd.draw(s);
  cockpit3d!.update(s, keys.controls);
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
