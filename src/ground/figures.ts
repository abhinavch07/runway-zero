// Ground School diagrams, drawn here as SVG so they are our own and stay sharp at any size.
// Colours come from CSS classes in style.css (gf-*), so the figures follow the site theme.

const f = (n: number) => n.toFixed(1);

/** Temperature against height through all the layers, with the boundaries marked. */
function layers(): string {
  const W = 640;
  const H = 420;
  const x = (t: number) => 90 + ((t + 100) / 140) * 500; // -100 to +40 °C
  const y = (h: number) => 385 - (h / 110) * 355; // 0 to 110 km
  const pts: [number, number][] = [
    [15, 0], [-56.5, 11], [-56.5, 20], [-44.5, 32], [-2.5, 47], [-2.5, 51],
    [-58.5, 71], [-88, 85], [-88, 90], [-62, 100], [-15, 107], [30, 110],
  ];
  const line = pts.map(([t, h], i) => `${i ? "L" : "M"}${f(x(t))},${f(y(h))}`).join(" ");
  // Each label sits where the line is not: [bottom, top, name, label height, left side?]
  const bands: [number, number, string, number, boolean][] = [
    [0, 11, "Troposphere", 5.5, true], [11, 50, "Stratosphere", 42, false],
    [50, 85, "Mesosphere", 67.5, false], [85, 110, "Thermosphere", 92, false],
  ];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature against height through the layers of the atmosphere">`;
  bands.forEach(([a, b], i) => {
    s += `<rect class="gf-band${i % 2}" x="90" y="${f(y(b))}" width="500" height="${f(y(a) - y(b))}"/>`;
  });
  s += `<rect class="gf-ozone" x="90" y="${f(y(35))}" width="500" height="${f(y(15) - y(35))}"/>`;
  s += `<text class="gf-small" x="100" y="${f(y(31))}">Ozone layer</text>`;
  s += `<text class="gf-small" x="100" y="${f(y(31) + 16)}">most at 20 to 25 km</text>`;
  bands.forEach(([, , name, h, left]) => {
    s += `<text class="gf-label" x="${left ? 100 : 580}" y="${f(y(h) + 5)}" text-anchor="${left ? "start" : "end"}">${name}</text>`;
  });
  // Boundary labels: on the left where the line is far right, and the other way round.
  const tops: [number, string, number][] = [[11, "Tropopause ~11 km", -98], [50, "Stratopause ~50 km", -98], [85, "Mesopause ~85 km, coldest, about -90 °C", -40]];
  tops.forEach(([h, name, t]) => {
    s += `<line class="gf-dash" x1="90" x2="590" y1="${f(y(h))}" y2="${f(y(h))}"/>`;
    s += `<text class="gf-small" x="${f(x(t))}" y="${f(y(h) - 5)}">${name}</text>`;
  });
  s += `<path class="gf-line" d="${line}"/>`;
  // Axes.
  s += `<line class="gf-axis" x1="90" y1="385" x2="590" y2="385"/><line class="gf-axis" x1="90" y1="385" x2="90" y2="30"/>`;
  for (const t of [-100, -80, -60, -40, -20, 0, 20, 40]) {
    s += `<text class="gf-tick" x="${f(x(t))}" y="404" text-anchor="middle">${t}</text>`;
  }
  for (const h of [0, 20, 40, 60, 80, 100]) {
    s += `<text class="gf-tick" x="82" y="${f(y(h) + 4)}" text-anchor="end">${h}</text>`;
  }
  s += `<text class="gf-tick" x="340" y="418" text-anchor="middle">Temperature °C</text>`;
  s += `<text class="gf-tick" x="22" y="210" transform="rotate(-90 22 210)" text-anchor="middle">Height km</text>`;
  s += `<circle class="gf-dot" cx="${f(x(15))}" cy="${f(y(0))}" r="4"/><text class="gf-small" x="${f(x(15) + 8)}" y="${f(y(0) - 6)}">+15 °C at MSL</text>`;
  return s + "</svg>";
}

/** Pole to equator slice: the tropopause steps up in three parts, with jet streams at the breaks. */
function tropopause(): string {
  const W = 640;
  const H = 360;
  const x = (lat: number) => 70 + ((90 - lat) / 90) * 520; // 90° on the left, equator on the right
  const y = (h: number) => 320 - h * 15; // 0 to 19 km
  const seg = (a: number, b: number, h: number) =>
    `<line class="gf-line" x1="${f(x(a))}" x2="${f(x(b))}" y1="${f(y(h))}" y2="${f(y(h))}"/>`;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Height of the tropopause from the pole to the equator">`;
  s += `<rect class="gf-band0" x="70" y="${f(y(19))}" width="520" height="${f(y(0) - y(19))}"/>`;
  s += seg(90, 57, 9) + seg(63, 37, 12) + seg(43, 0, 16.5);
  s += `<text class="gf-small" x="${f(x(88))}" y="${f(y(9) - 8)}">Polar, ~8 to 10 km, ~300 hPa</text>`;
  s += `<text class="gf-small" x="${f(x(61))}" y="${f(y(12) - 8)}">Middle, ~11 to 12 km, ~200 hPa</text>`;
  s += `<text class="gf-small" x="${f(x(40))}" y="${f(y(16.5) - 8)}">Tropical, ~16 to 18 km, ~100 hPa</text>`;
  // Jet streams just below the breaks.
  for (const [lat, h, name] of [[60, 8.2, "Polar front jet"], [40, 11.2, "Subtropical jet"]] as const) {
    s += `<circle class="gf-jet" cx="${f(x(lat))}" cy="${f(y(h))}" r="11"/><text class="gf-jett" x="${f(x(lat))}" y="${f(y(h) + 5)}" text-anchor="middle">J</text>`;
    s += `<text class="gf-small" x="${f(x(lat))}" y="${f(y(h) + 30)}" text-anchor="middle">${name}</text>`;
  }
  s += `<text class="gf-label" x="${f(x(85))}" y="${f(y(3))}">Colder surface, lower tropopause</text>`;
  s += `<text class="gf-label" x="${f(x(5))}" y="${f(y(3))}" text-anchor="end">Warmer surface, higher tropopause</text>`;
  s += `<line class="gf-axis" x1="70" y1="320" x2="590" y2="320"/><line class="gf-axis" x1="70" y1="320" x2="70" y2="${f(y(19))}"/>`;
  for (const lat of [90, 60, 40, 20, 0]) {
    s += `<text class="gf-tick" x="${f(x(lat))}" y="338" text-anchor="middle">${lat ? lat + "°" : "Equator"}</text>`;
  }
  for (const h of [0, 5, 10, 15]) s += `<text class="gf-tick" x="62" y="${f(y(h) + 4)}" text-anchor="end">${h}</text>`;
  s += `<text class="gf-tick" x="330" y="356" text-anchor="middle">Latitude, pole to equator</text>`;
  s += `<text class="gf-tick" x="20" y="180" transform="rotate(-90 20 180)" text-anchor="middle">Height km</text>`;
  return s + "</svg>";
}

/** The ISA temperature line from MSL to 20 km. */
function isa(): string {
  const W = 560;
  const H = 360;
  const x = (t: number) => 80 + ((t + 70) / 90) * 440; // -70 to +20 °C
  const y = (h: number) => 320 - h * 14.5; // 0 to 20 km
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ISA temperature against height up to 20 km">`;
  s += `<rect class="gf-band0" x="80" y="${f(y(11))}" width="440" height="${f(y(0) - y(11))}"/>`;
  s += `<rect class="gf-band1" x="80" y="${f(y(20))}" width="440" height="${f(y(11) - y(20))}"/>`;
  s += `<path class="gf-line" d="M${f(x(15))},${f(y(0))} L${f(x(-56.5))},${f(y(11))} L${f(x(-56.5))},${f(y(20))}"/>`;
  s += `<circle class="gf-dot" cx="${f(x(15))}" cy="${f(y(0))}" r="4"/>`;
  s += `<text class="gf-small" x="${f(x(15) - 8)}" y="${f(y(0) - 10)}" text-anchor="end">MSL: +15 °C, 1013.25 hPa, 1.225 kg/m³</text>`;
  s += `<circle class="gf-dot" cx="${f(x(-56.5))}" cy="${f(y(11))}" r="4"/>`;
  s += `<text class="gf-small" x="${f(x(-56.5) + 10)}" y="${f(y(11) + 4)}">Tropopause: 11 km (36,090 ft), -56.5 °C</text>`;
  s += `<text class="gf-small" x="${f(x(-56.5) + 10)}" y="${f(y(16))}">Constant -56.5 °C up to 20 km (65,617 ft)</text>`;
  s += `<text class="gf-small" x="${f(x(-12))}" y="${f(y(5.5))}">Falls 1.98 °C per 1000 ft</text>`;
  s += `<text class="gf-small" x="${f(x(-12))}" y="${f(y(5.5) + 16)}">(6.5 °C per km)</text>`;
  s += `<line class="gf-axis" x1="80" y1="320" x2="520" y2="320"/><line class="gf-axis" x1="80" y1="320" x2="80" y2="${f(y(20))}"/>`;
  for (const t of [-60, -40, -20, 0, 20]) s += `<text class="gf-tick" x="${f(x(t))}" y="338" text-anchor="middle">${t}</text>`;
  for (const h of [0, 5, 10, 15, 20]) s += `<text class="gf-tick" x="72" y="${f(y(h) + 4)}" text-anchor="end">${h}</text>`;
  s += `<text class="gf-tick" x="300" y="356" text-anchor="middle">Temperature °C</text>`;
  s += `<text class="gf-tick" x="22" y="170" transform="rotate(-90 22 170)" text-anchor="middle">Height km</text>`;
  return s + "</svg>";
}

/** What dry air is made of, by volume. */
function composition(): string {
  const W = 600;
  const H = 130;
  const x = (p: number) => 20 + (p / 100) * 560;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dry air by volume: nitrogen 78 percent, oxygen 21 percent, argon and others 1 percent">`;
  s += `<rect class="gf-n2" x="${x(0)}" y="30" width="${f(x(78) - x(0))}" height="44"/>`;
  s += `<rect class="gf-o2" x="${f(x(78))}" y="30" width="${f(x(99) - x(78))}" height="44"/>`;
  s += `<rect class="gf-ar" x="${f(x(99))}" y="30" width="${f(x(100) - x(99))}" height="44"/>`;
  s += `<text class="gf-barlabel" x="${f(x(39))}" y="58" text-anchor="middle">Nitrogen 78%</text>`;
  s += `<text class="gf-barlabel" x="${f(x(88.5))}" y="58" text-anchor="middle">Oxygen 21%</text>`;
  s += `<line class="gf-axis" x1="${f(x(99.5))}" y1="76" x2="${f(x(99.5))}" y2="96"/>`;
  s += `<text class="gf-small" x="${f(x(99.5))}" y="112" text-anchor="end">Argon 0.93%, carbon dioxide about 0.04%, traces of others</text>`;
  s += `<text class="gf-small" x="20" y="20">Dry air by volume. Water vapour is extra, from almost 0 up to about 4%.</text>`;
  return s + "</svg>";
}

/** Surface temperature through a clear, calm day: over land against over the sea. */
function diurnal(): string {
  const W = 620;
  const H = 330;
  const x = (hr: number) => 70 + (hr / 24) * 520; // local time 0 to 24
  const y = (t: number) => 280 - (t - 14) * 9; // 14 to 40 °C
  // Simple smooth curves through hand picked points (local time, °C).
  const land: [number, number][] = [[0, 22.5], [3, 19.5], [6.75, 17], [9.5, 24], [12, 31.5], [14.5, 37], [17.5, 33], [21, 25.5], [24, 22.5]];
  const sea: [number, number][] = [[0, 27.6], [6.5, 27.3], [12, 27.9], [15, 28.2], [20, 27.9], [24, 27.6]];
  const path = (p: [number, number][]) => {
    const P = p.map(([h, t]) => [x(h), y(t)]);
    let d = `M${f(P[0][0])},${f(P[0][1])}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
    }
    return d;
  };
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Surface temperature through a day over land and over the sea">`;
  s += `<rect class="gf-band1" x="${f(x(0))}" y="${f(y(40))}" width="${f(x(6) - x(0))}" height="${f(y(14) - y(40))}"/>`;
  s += `<rect class="gf-band1" x="${f(x(18.5))}" y="${f(y(40))}" width="${f(x(24) - x(18.5))}" height="${f(y(14) - y(40))}"/>`;
  s += `<rect class="gf-band0" x="${f(x(6))}" y="${f(y(40))}" width="${f(x(18.5) - x(6))}" height="${f(y(14) - y(40))}"/>`;
  s += `<text class="gf-small" x="${f(x(3))}" y="${f(y(38.5))}" text-anchor="middle">Night</text>`;
  s += `<text class="gf-small" x="${f(x(9))}" y="${f(y(38.5))}" text-anchor="middle">Day</text>`;
  s += `<text class="gf-small" x="${f(x(12))}" y="${f(y(38.5))}" text-anchor="middle">Noon</text>`;
  s += `<line class="gf-dash" x1="${f(x(12))}" x2="${f(x(12))}" y1="${f(y(37.8))}" y2="${f(y(14))}"/>`;
  s += `<path class="gf-line" d="${path(land)}"/>`;
  s += `<path class="gf-line2" d="${path(sea)}"/>`;
  s += `<circle class="gf-dot" cx="${f(x(6.75))}" cy="${f(y(17))}" r="4"/>`;
  s += `<text class="gf-small" x="${f(x(7.2))}" y="${f(y(17) + 18)}">Minimum: just after sunrise</text>`;
  s += `<circle class="gf-dot" cx="${f(x(14.5))}" cy="${f(y(37))}" r="4"/>`;
  s += `<text class="gf-small" x="${f(x(15))}" y="${f(y(37) - 8)}">Maximum: about 2 to 3 hours after noon</text>`;
  s += `<text class="gf-label" x="${f(x(19.5))}" y="${f(y(31))}">Over land: big range</text>`;
  s += `<text class="gf-label gf-blue" x="${f(x(0.4))}" y="${f(y(29.6))}">Over the sea: under 1 °C</text>`;
  s += `<line class="gf-axis" x1="70" y1="280" x2="590" y2="280"/><line class="gf-axis" x1="70" y1="280" x2="70" y2="${f(y(40))}"/>`;
  for (const hr of [0, 6, 12, 18, 24]) s += `<text class="gf-tick" x="${f(x(hr))}" y="298" text-anchor="middle">${String(hr).padStart(2, "0")}:00</text>`;
  for (const t of [15, 20, 25, 30, 35, 40]) s += `<text class="gf-tick" x="62" y="${f(y(t) + 4)}" text-anchor="end">${t}</text>`;
  s += `<text class="gf-tick" x="330" y="318" text-anchor="middle">Local time</text>`;
  s += `<text class="gf-tick" x="22" y="160" transform="rotate(-90 22 160)" text-anchor="middle">Temperature °C</text>`;
  return s + "</svg>";
}

/** How much water vapour saturated air holds at each temperature (near sea level). */
function saturation(): string {
  const W = 600;
  const H = 340;
  const x = (t: number) => 70 + ((t + 10) / 50) * 500; // -10 to 40 °C
  const y = (g: number) => 290 - g * 5.2; // 0 to 50 g/kg
  // Saturation mixing ratio at 1000 hPa, g/kg (standard tables, rounded).
  const sat: [number, number][] = [[-10, 1.8], [-5, 2.6], [0, 3.8], [5, 5.4], [10, 7.7], [15, 10.7], [20, 14.9], [25, 20.4], [30, 27.7], [35, 37.2], [40, 49.8]];
  const d = sat.map(([t, g], i) => `${i ? "L" : "M"}${f(x(t))},${f(y(g))}`).join(" ");
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The most water vapour air can hold rises steeply with temperature">`;
  s += `<path class="gf-fill" d="${d} L${f(x(40))},${f(y(0))} L${f(x(-10))},${f(y(0))} Z"/>`;
  s += `<path class="gf-line" d="${d}"/>`;
  s += `<text class="gf-label" x="${f(x(-8))}" y="${f(y(40))}">Above the line: not possible,</text>`;
  s += `<text class="gf-label" x="${f(x(-8))}" y="${f(y(40) + 18)}">the extra vapour condenses</text>`;
  s += `<text class="gf-label" x="${f(x(13))}" y="${f(y(2.2))}">Below the line: unsaturated air</text>`;
  // Worked point: air at 30 °C holding 14.9 g/kg.
  s += `<circle class="gf-dot" cx="${f(x(30))}" cy="${f(y(14.9))}" r="5"/>`;
  s += `<line class="gf-dash" x1="${f(x(30))}" x2="${f(x(20))}" y1="${f(y(14.9))}" y2="${f(y(14.9))}"/>`;
  s += `<circle class="gf-dot2" cx="${f(x(20))}" cy="${f(y(14.9))}" r="5"/>`;
  s += `<text class="gf-small" x="${f(x(30))}" y="${f(y(14.9) + 22)}" text-anchor="middle">Air at 30 °C holding 14.9 g/kg</text>`;
  s += `<text class="gf-small" x="${f(x(30))}" y="${f(y(14.9) + 38)}" text-anchor="middle">RH = 14.9 ÷ 27.7 = about 54%</text>`;
  s += `<text class="gf-small" x="${f(x(20))}" y="${f(y(14.9) - 12)}" text-anchor="end">Cool it to 20 °C: saturated. Dew point 20 °C</text>`;
  s += `<line class="gf-axis" x1="70" y1="290" x2="570" y2="290"/><line class="gf-axis" x1="70" y1="290" x2="70" y2="${f(y(50))}"/>`;
  for (const t of [-10, 0, 10, 20, 30, 40]) s += `<text class="gf-tick" x="${f(x(t))}" y="308" text-anchor="middle">${t}</text>`;
  for (const g of [0, 10, 20, 30, 40, 50]) s += `<text class="gf-tick" x="62" y="${f(y(g) + 4)}" text-anchor="end">${g}</text>`;
  s += `<text class="gf-tick" x="320" y="328" text-anchor="middle">Air temperature °C</text>`;
  s += `<text class="gf-tick" x="22" y="160" transform="rotate(-90 22 160)" text-anchor="middle">Water vapour, g per kg of air</text>`;
  return s + "</svg>";
}

export const FIGURES: Record<string, () => string> = { layers, tropopause, isa, composition, diurnal, saturation };
