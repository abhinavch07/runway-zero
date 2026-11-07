// Welcome page: the runway hero, the aircraft, the suggested learning paths.
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./style.css";
import "../theme/light.css";
import { setUpThemeToggle } from "../theme/theme";
setUpThemeToggle();
import { AIRCRAFT, type AircraftId } from "../lessons/catalog";
import { loadProgress } from "../lessons/progress";

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- Hero: a night runway seen from the approach, painted "0" ----------
function runway() {
  const W = 600;
  const H = 760;
  const HORIZON = 200;
  const DEPTH = 520; // screen height of one unit of distance
  const HALF = 300; // half the runway width at distance 1
  const cx = W / 2;
  const y = (z: number) => HORIZON + DEPTH / z;
  const x = (side: number, z: number) => cx + (side * HALF) / z;
  const near = 1.35;
  const far = 14;
  const quad = (z1: number, z2: number, s1: number, s2: number) =>
    `${x(s1, z1)},${y(z1)} ${x(s2, z1)},${y(z1)} ${x(s2, z2)},${y(z2)} ${x(s1, z2)},${y(z2)}`;

  let paint = "";
  // Threshold stripes ("piano keys"): eight across the width.
  for (let i = 0; i < 8; i++) {
    const s1 = -0.86 + i * 0.22;
    paint += `<polygon class="r-paint" points="${quad(near + 0.04, near + 0.5, s1, s1 + 0.13)}"/>`;
  }
  // The painted "0", drawn in perspective as a ring between two depths.
  const z0 = 2.05;
  const z1 = 3.0;
  const ring: string[] = [];
  const inner: string[] = [];
  for (let a = 0; a <= 360; a += 6) {
    const r = (a * Math.PI) / 180;
    const zr = (z0 + z1) / 2 + (Math.cos(r) * (z1 - z0)) / 2;
    ring.push(`${x(Math.sin(r) * 0.3, zr)},${y(zr)}`);
    const zi = (z0 + z1) / 2 + (Math.cos(r) * (z1 - z0) * 0.62) / 2;
    inner.push(`${x(Math.sin(r) * 0.15, zi)},${y(zi)}`);
  }
  paint += `<path class="r-paint" fill-rule="evenodd" d="M${ring.join(" L")} Z M${inner.reverse().join(" L")} Z"/>`;
  // Centreline dashes.
  for (let z = 3.4; z < far; z *= 1.16) paint += `<polygon class="r-paint r-dash" points="${quad(z, z * 1.07, -0.012, 0.012)}"/>`;
  // Edge lights, switched on in order from near to far.
  let lights = "";
  let n = 0;
  for (let z = near; z < far; z *= 1.11, n++) {
    const r = Math.max(1.2, 5.5 / z);
    for (const side of [-1.03, 1.03]) lights += `<circle class="r-edge" style="--i:${n}" cx="${x(side, z)}" cy="${y(z)}" r="${r}"/>`;
  }
  // Threshold lights across the near end, green from the approach.
  for (let i = -8; i <= 8; i++) lights += `<circle class="r-thr" cx="${x(i * 0.125, near - 0.02)}" cy="${y(near - 0.02)}" r="4"/>`;
  // Approach lights before the threshold, with the sequenced flasher running in.
  for (let k = 0; k < 6; k++) {
    const z = 0.9 + k * 0.075;
    lights += `<circle class="r-app" cx="${cx}" cy="${y(z)}" r="${6 / z}"/>`;
    lights += `<circle class="r-rabbit" style="--k:${k}" cx="${cx}" cy="${y(z)}" r="${9 / z}"/>`;
    for (const side of [-0.18, 0.18]) lights += `<circle class="r-app" cx="${x(side, z)}" cy="${y(z)}" r="${4 / z}"/>`;
  }
  $("runway").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="r-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a212b"/><stop offset="1" stop-color="#2a323d"/>
        </linearGradient>
      </defs>
      <polygon fill="url(#r-asphalt)" points="${quad(near, far, -1, 1)}"/>
      ${paint}
      ${lights}
    </svg>`;
}

// ---------- Aircraft ----------
const DETAILS: Record<AircraftId, { img: string; alt: string; line: string; open: string }> = {
  a320: {
    img: "img/a320-main.jpg",
    alt: "A320 main panel in cruise: PFD, ND and engine display",
    line: "Fly-by-wire airliner. Overhead, FCU, ECAM pages and the MCDU, from cold and dark to a generator fault.",
    open: "Open the A320",
  },
  b737: {
    img: "img/b737-main.jpg",
    alt: "B737 main panel with the MCP and three large screens",
    line: "Large-screen airliner. Overhead, MCP autopilot and the FMC, from cold and dark to LNAV and VNAV.",
    open: "Open the B737",
  },
  c172: {
    img: "img/c172-instruments.jpg",
    alt: "C172 glass cockpit PFD and MFD",
    line: "High-wing trainer with a glass cockpit. Engine start, radios, VOR and ILS, run-up and an alternator failure.",
    open: "Open the C172",
  },
  pa28: {
    img: "img/pa28-panel.jpg",
    alt: "PA-28 lower panel with the fuel selector and hand primer",
    line: "Low-wing trainer. Hand primer, two tanks with no BOTH, run-up and an engine fuel pump failure.",
    open: "Open the PA-28",
  },
};

function aircraft() {
  const progress = loadProgress();
  const groups: { title: string; note: string; ids: AircraftId[] }[] = [
    { title: "Airliners", note: "Two-crew jets on the Delhi to Mumbai route.", ids: ["a320", "b737"] },
    { title: "Light aircraft", note: "Single-engine trainers, the kind most pilots learn on.", ids: ["c172", "pa28"] },
  ];
  $("aircraft-groups").innerHTML = groups
    .map(
      (g) => `
      <div class="w-group">
        <div class="w-group-head"><h3>${g.title}</h3><p>${g.note}</p></div>
        <div class="w-planes">${g.ids
          .map((id) => {
            const a = AIRCRAFT.find((x) => x.id === id)!;
            const d = DETAILS[id];
            const done = a.lessons.filter((l) => progress[l.id]?.finished).length;
            const mins = a.lessons.reduce((t, l) => t + l.minutes, 0);
            return `
            <article class="w-plane">
              <a class="w-shot" href="${a.page}" tabindex="-1" aria-hidden="true"><img src="${d.img}" alt="${esc(d.alt)}" loading="lazy" width="880" height="588"></a>
              <div class="w-plane-body">
                <h4>${esc(a.name)}</h4>
                <p>${esc(d.line)}</p>
                <p class="w-meta">${a.lessons.length} lessons, about ${Math.round(mins / 5) * 5} minutes in all${done ? `. You have finished ${done}.` : ""}</p>
                <a class="w-btn w-btn-main" href="${a.page}">${d.open}</a>
              </div>
            </article>`;
          })
          .join("")}</div>
      </div>`,
    )
    .join("");
}

// ---------- Where to start ----------
interface Path {
  who: string;
  why: string;
  steps: [AircraftId, string][];
}
const PATHS: Path[] = [
  {
    who: "Just want to fly",
    why: "Take the controls with the keyboard and the view out of the window. Taxi out, take off, fly a circuit and land.",
    steps: [
      ["c172", "c172-ff-takeoff"],
      ["c172", "c172-ff-circuit"],
      ["c172", "c172-ff-landing"],
    ],
  },
  {
    who: "New to flying",
    why: "Start small. A light aircraft has fewer switches, and each one does something you can see.",
    steps: [
      ["c172", "c172-start"],
      ["c172", "c172-pfd"],
      ["c172", "c172-runup"],
    ],
  },
  {
    who: "Learning to fly",
    why: "Practise the parts that take time in the air: the radio calls, VOR and ILS, and handling a failure.",
    steps: [
      ["c172", "c172-radios"],
      ["c172", "c172-nav"],
      ["pa28", "pa28-pumpfail"],
    ],
  },
  {
    who: "Aiming for the airlines",
    why: "Learn an airliner flow by flow, the way it is taught in type training, from cold and dark.",
    steps: [
      ["a320", "powerup"],
      ["a320", "mcdu"],
      ["a320", "beforestart"],
    ],
  },
];

function paths() {
  $("paths").innerHTML = PATHS.map((p) => {
    const steps = p.steps.map(([id, lessonId]) => {
      const a = AIRCRAFT.find((x) => x.id === id)!;
      const l = a.lessons.find((x) => x.id === lessonId)!;
      return { a, l, href: `${a.page}?lesson=${lessonId}` };
    });
    return `
      <div class="w-path">
        <h3>${esc(p.who)}</h3>
        <p>${esc(p.why)}</p>
        <ol>${steps.map((s) => `<li><a href="${s.href}"><span>${esc(s.l.title)}</span><small>${esc(s.a.name)}, about ${s.l.minutes} min</small></a></li>`).join("")}</ol>
        <a class="w-btn w-btn-quiet" href="${steps[0].href}">Start this path</a>
      </div>`;
  }).join("");
}

runway();
aircraft();
paths();
