// 3D cockpit layer (R0 spike). A Three.js scene drawn on a transparent canvas on top of the globe.
//
// The cockpit moves with the aircraft, so it is built in the aircraft's own frame and the Three.js
// camera sits still at the pilot's eye. The globe camera gets the same eye position, attitude, field of
// view and head turn, so the two layers line up without copying world coordinates into Three.js.
//
// This is a blockout: plain shapes at roughly the right places. Every control that will later be
// clickable is its own named object (for example GEAR_LEVER), which is the pattern for the full cockpit.
import * as THREE from "three";
import type { Controls, SimState } from "../sim/types";

// Axes: x to the right, y up, -z forward. Origin at the captain's eye. Metres. Rough sizes for R0.
const PANEL_COLOUR = 0x6d7a86; // light blue-grey
const DARK = 0x1c2128;
const SCREEN_OFF = 0x05070a;
const CENTRE_X = 0.53; // aircraft centreline is to the right of the captain's eye
const DEFAULT_HEAD_PITCH = -0.2; // looking a little down, so the screens and the outside both show

export interface CockpitClickHandlers {
  onGearLever(): void;
  onFlapLever(): void;
}

export class Cockpit3D {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private pfdTexture: THREE.CanvasTexture;
  private sidestick!: THREE.Object3D;
  private thrustLevers: THREE.Object3D[] = [];
  private gearLever!: THREE.Object3D;
  private flapLever!: THREE.Object3D;
  private clickable: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  /** Head turn in radians, positive = look right / look up. */
  headYaw = 0;
  headPitch = DEFAULT_HEAD_PITCH;
  visible = true;

  constructor(
    container: HTMLElement,
    pfdCanvas: HTMLCanvasElement,
    fovDeg: number,
    private handlers: CockpitClickHandlers,
  ) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.id = "cockpit3d";
    container.appendChild(this.canvas);

    this.camera = new THREE.PerspectiveCamera(fovDeg, 1, 0.05, 20);
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-1, 2, -1);
    this.scene.add(sun);

    this.pfdTexture = new THREE.CanvasTexture(pfdCanvas);
    this.pfdTexture.colorSpace = THREE.SRGBColorSpace;
    this.build();
    this.bindMouse();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setPixelRatio(scale: number) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * scale);
    this.resize();
  }

  /** Where the eye looks, as a unit vector in the aircraft frame: forward, right, up parts. */
  headDirection() {
    const cp = Math.cos(this.headPitch);
    return {
      forward: cp * Math.cos(this.headYaw),
      right: cp * Math.sin(this.headYaw),
      up: Math.sin(this.headPitch),
    };
  }

  /** Matching up vector for the eye, in the aircraft frame. */
  headUp() {
    const sp = Math.sin(this.headPitch);
    return {
      forward: -sp * Math.cos(this.headYaw),
      right: -sp * Math.sin(this.headYaw),
      up: Math.cos(this.headPitch),
    };
  }

  update(s: SimState, c: Controls) {
    // Sidestick leans with the pilot's input, thrust levers follow the lever position.
    this.sidestick.rotation.x = -c.pitch * 0.35;
    this.sidestick.rotation.z = -c.roll * 0.35;
    for (const lever of this.thrustLevers) lever.rotation.x = -0.5 + c.throttle * 1.0;
    this.gearLever.position.y = c.gearDown ? -0.46 : -0.36;
    this.flapLever.position.z = -0.42 + c.flapLever * 0.04;
    this.pfdTexture.needsUpdate = true;
    void s;
  }

  render() {
    if (!this.visible) return;
    this.camera.rotation.set(this.headPitch, -this.headYaw, 0);
    this.renderer.render(this.scene, this.camera);
  }

  setVisible(v: boolean) {
    this.visible = v;
    this.canvas.style.display = v ? "block" : "none";
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------- Building the blockout ----------

  private box(name: string, w: number, h: number, d: number, colour: number, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: colour, roughness: 0.85, metalness: 0.05 }),
    );
    mesh.name = name;
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }

  private screen(name: string, x: number, y: number, z: number, texture?: THREE.Texture, label?: string) {
    const size = 0.17;
    const mat = texture
      ? new THREE.MeshBasicMaterial({ map: texture })
      : new THREE.MeshBasicMaterial({ map: labelTexture(label ?? name) });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.rotation.x = -0.2; // panel leans back a little
    this.scene.add(mesh);
    void SCREEN_OFF;
    return mesh;
  }

  private build() {
    // Main instrument panel, leaning back, with its lower part continuing to the pedestal.
    const panel = this.box("MAIN_PANEL", 1.9, 0.34, 0.06, PANEL_COLOUR, CENTRE_X, -0.42, -0.78);
    panel.rotation.x = -0.2;
    // Glareshield with the FCU in the middle.
    this.box("GLARESHIELD", 1.9, 0.04, 0.22, DARK, CENTRE_X, -0.25, -0.76);
    this.box("FCU", 0.62, 0.05, 0.06, PANEL_COLOUR, CENTRE_X, -0.22, -0.84);
    this.box("EFIS_CAPT", 0.2, 0.05, 0.06, PANEL_COLOUR, -0.05, -0.22, -0.84);

    // Captain's displays: PFD (live) and ND, then the two ECAM screens on the centre panel.
    this.screen("PFD_CAPT", -0.12, -0.39, -0.74, this.pfdTexture);
    this.screen("ND_CAPT", 0.08, -0.39, -0.74, undefined, "ND");
    this.screen("ECAM_UPPER", CENTRE_X, -0.39, -0.74, undefined, "E/WD");
    this.screen("ND_FO", 0.98, -0.39, -0.74, undefined, "ND");
    this.screen("PFD_FO", 1.18, -0.39, -0.74, undefined, "PFD");

    // Pedestal between the seats, with the lower ECAM, thrust levers and flap lever.
    const pedestal = this.box("PEDESTAL", 0.36, 0.18, 0.75, PANEL_COLOUR, CENTRE_X, -0.66, -0.35);
    pedestal.rotation.x = -0.15;
    const lower = this.screen("ECAM_LOWER", CENTRE_X, -0.56, -0.62, undefined, "SD");
    lower.rotation.x = -0.9;
    for (const side of [-1, 1]) {
      const pivot = new THREE.Object3D();
      pivot.name = side < 0 ? "THR_LEVER_1" : "THR_LEVER_2";
      pivot.position.set(CENTRE_X + side * 0.04, -0.58, -0.33);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.12, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x2b2f36 }),
      );
      handle.position.y = 0.06;
      pivot.add(handle);
      this.scene.add(pivot);
      this.thrustLevers.push(pivot);
    }
    this.flapLever = this.box("FLAP_LEVER", 0.04, 0.05, 0.03, 0xe8e8e8, CENTRE_X + 0.13, -0.58, -0.42);
    this.clickable.push(this.flapLever);

    // Gear lever on the centre panel, below the ECAM.
    this.gearLever = this.box("GEAR_LEVER", 0.035, 0.035, 0.06, 0xe8e8e8, CENTRE_X - 0.14, -0.36, -0.7);
    this.clickable.push(this.gearLever);

    // Sidestick on the captain's left.
    this.sidestick = new THREE.Object3D();
    this.sidestick.name = "SIDESTICK_CAPT";
    this.sidestick.position.set(-0.42, -0.58, -0.25);
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.13, 12),
      new THREE.MeshStandardMaterial({ color: 0x22252b }),
    );
    grip.position.y = 0.065;
    this.sidestick.add(grip);
    this.scene.add(this.sidestick);
    this.box("SIDE_CONSOLE_CAPT", 0.22, 0.05, 0.6, PANEL_COLOUR, -0.42, -0.62, -0.25);

    // Window frame: centre post, side posts and roof, leaving the windscreen open.
    this.box("WINDOW_CENTRE_POST", 0.06, 0.55, 0.05, DARK, CENTRE_X, 0.03, -0.82);
    this.box("WINDOW_SIDE_POST_L", 0.07, 0.55, 0.05, DARK, -0.55, 0.03, -0.65);
    this.box("WINDOW_SIDE_POST_R", 0.07, 0.55, 0.05, DARK, 1.61, 0.03, -0.65);
    this.box("ROOF_FRONT", 2.3, 0.06, 0.25, DARK, CENTRE_X, 0.32, -0.7);
    const overhead = this.box("OVERHEAD_PANEL", 0.7, 0.05, 0.9, PANEL_COLOUR, CENTRE_X, 0.42, -0.2);
    overhead.rotation.x = 0.35;
    this.box("SIDE_WALL_L", 0.05, 0.4, 1.4, DARK, -0.7, -0.45, -0.1);
    this.box("SIDE_WINDOW_POST_L", 0.05, 0.55, 0.05, DARK, -0.7, 0.03, 0.05);
    this.box("SIDE_WALL_R", 0.05, 0.4, 1.4, DARK, 1.76, -0.45, -0.1);
    this.box("SIDE_WINDOW_POST_R", 0.05, 0.55, 0.05, DARK, 1.76, 0.03, 0.05);
  }

  // ---------- Mouse: drag to look around, click levers ----------

  private bindMouse() {
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.headYaw = clamp(this.headYaw + dx * 0.004, -2.4, 2.4);
      this.headPitch = clamp(this.headPitch - dy * 0.004, -1.2, 1.2);
    });
    this.canvas.addEventListener("pointerup", (e) => {
      dragging = false;
      if (!moved) this.click(e);
    });
    this.canvas.addEventListener("dblclick", () => {
      this.headYaw = 0;
      this.headPitch = DEFAULT_HEAD_PITCH;
    });
  }

  private click(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.camera.rotation.set(this.headPitch, -this.headYaw, 0);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObjects(this.clickable, false)[0];
    if (!hit) return;
    if (hit.object.name === "GEAR_LEVER") this.handlers.onGearLever();
    if (hit.object.name === "FLAP_LEVER") this.handlers.onFlapLever();
  }
}

function labelTexture(text: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#05070a";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#3a4250";
  g.font = "bold 22px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
