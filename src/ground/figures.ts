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

/** A cold column and a warm column side by side: the same pressure levels sit lower in cold air. */
function columns(): string {
  const W = 600;
  const H = 320;
  const levels: [string, number, number][] = [
    ["500 hPa", 205, 155],
    ["700 hPa", 120, 92],
    ["850 hPa", 58, 45],
  ]; // [name, height over warm, height over cold], scaled so the warm column is taller
  const yc = (v: number) => 280 - v;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pressure levels sit lower over a cold column of air and higher over a warm column">`;
  s += `<rect class="gf-cold" x="70" y="40" width="170" height="240"/><rect class="gf-warm" x="360" y="40" width="170" height="240"/>`;
  s += `<text class="gf-label" x="155" y="300" text-anchor="middle">Cold, dense air</text>`;
  s += `<text class="gf-label" x="445" y="300" text-anchor="middle">Warm, light air</text>`;
  for (const [name, warmH, coldH] of levels) {
    const a = yc(coldH);
    const b = yc(warmH);
    s += `<path class="gf-line" d="M70,${a} L240,${a} C300,${a} 300,${b} 360,${b} L530,${b}"/>`;
    s += `<text class="gf-small" x="536" y="${b + 4}">${name}</text>`;
  }
  s += `<line class="gf-dash" x1="60" x2="540" y1="${yc(106)}" y2="${yc(106)}"/>`;
  s += `<text class="gf-small" x="66" y="${yc(106) - 6}">Same height: pressure below 700 hPa here...</text>`;
  s += `<text class="gf-small" x="360" y="${yc(106) + 16}">...but above 700 hPa here</text>`;
  s += `<line class="gf-axis" x1="60" y1="280" x2="540" y2="280"/>`;
  return s + "</svg>";
}

/** The five isobar patterns as small panels: low, high, trough, ridge, col. */
function systems(): string {
  const W = 640;
  const H = 200;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Low, high, trough, ridge and col isobar patterns">`;
  const panel = (cx: number, title: string, body: string) =>
    `<g>${body}<text class="gf-label" x="${cx}" y="188" text-anchor="middle">${title}</text></g>`;
  const rings = (cx: number, letter: string, cls: string) => {
    let b = "";
    for (const r of [16, 32, 48]) b += `<ellipse class="gf-iso" cx="${cx}" cy="90" rx="${r * 1.15}" ry="${r}"/>`;
    return b + `<text class="${cls}" x="${cx}" y="98" text-anchor="middle">${letter}</text>`;
  };
  s += panel(64, "Low", rings(64, "L", "gf-bigL"));
  s += panel(192, "High", rings(192, "H", "gf-bigH"));
  // Trough: V shaped isobars opening upwards from a low at the top.
  let tr = "";
  for (const k of [0, 1, 2]) {
    const w = 18 + k * 18;
    tr += `<path class="gf-iso" d="M${320 - w},${30 + k * 8} L320,${120 + k * 22} L${320 + w},${30 + k * 8}"/>`;
  }
  tr += `<text class="gf-bigL" x="320" y="34" text-anchor="middle">L</text><line class="gf-dash" x1="320" x2="320" y1="44" y2="166"/>`;
  s += panel(320, "Trough", tr);
  // Ridge: rounded U shaped isobars from a high at the top.
  let rg = "";
  for (const k of [0, 1, 2]) {
    const w = 18 + k * 18;
    const d = 110 + k * 22;
    rg += `<path class="gf-iso" d="M${448 - w},${30 + k * 8} C${448 - w},${d} ${448 + w},${d} ${448 + w},${30 + k * 8}"/>`;
  }
  rg += `<text class="gf-bigH" x="448" y="34" text-anchor="middle">H</text>`;
  s += panel(448, "Ridge", rg);
  // Col: two lows and two highs around a saddle.
  let col = "";
  for (const [dx, dy, l, cls] of [[-36, -40, "L", "gf-smL"], [36, 40, "L", "gf-smL"], [36, -40, "H", "gf-smH"], [-36, 40, "H", "gf-smH"]] as const) {
    col += `<ellipse class="gf-iso" cx="${576 + dx}" cy="${90 + dy}" rx="20" ry="17"/><text class="${cls}" x="${576 + dx}" y="${96 + dy}" text-anchor="middle">${l}</text>`;
  }
  col += `<circle class="gf-dot" cx="576" cy="90" r="4"/>`;
  s += panel(576, "Col", col);
  return s + "</svg>";
}

/** Three altimeter readings for one aircraft: QFE, QNH and 1013. */
function altimetry(): string {
  const W = 620;
  const H = 360;
  const sea = 290;
  const field = 250;
  const std = 312; // 1013 datum, drawn below MSL on a low pressure day
  const ac = 70;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="QFE gives height above the aerodrome, QNH gives altitude above sea level, 1013 gives pressure altitude">`;
  s += `<rect class="gf-sea" x="20" y="${sea}" width="200" height="${std - 4 - sea}"/>`;
  s += `<path class="gf-ground" d="M220,${sea} L300,${field} L600,${field} L600,${std - 4} L220,${std - 4} Z"/>`;
  s += `<text class="gf-small" x="30" y="${sea + 16}">Sea</text>`;
  s += `<text class="gf-small" x="440" y="${field + 20}">Aerodrome</text>`;
  s += `<line class="gf-dash" x1="220" x2="600" y1="${sea}" y2="${sea}"/>`;
  s += `<text class="gf-small" x="596" y="${sea - 6}" text-anchor="end">MSL</text>`;
  s += `<line class="gf-dash" x1="20" x2="600" y1="${std}" y2="${std}"/>`;
  s += `<text class="gf-small" x="30" y="${std + 18}">1013.25 hPa level (below MSL on a low pressure day)</text>`;
  s += `<path class="gf-plane" d="M460,${ac} l40,0 l8,-6 l4,0 l-4,8 l-12,2 l-6,10 l-6,0 l2,-10 l-26,0 z"/>`;
  const arrow = (x: number, y2: number, label: string, sub: string) => {
    s += `<line class="gf-arrow" x1="${x}" x2="${x}" y1="${ac + 12}" y2="${y2}" marker-end="url(#ah)" marker-start="url(#ah)"/>`;
    s += `<text class="gf-label" x="${x + 8}" y="${(ac + y2) / 2}">${label}</text>`;
    s += `<text class="gf-small" x="${x + 8}" y="${(ac + y2) / 2 + 16}">${sub}</text>`;
  };
  s += `<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="gf-head"/></marker></defs>`;
  arrow(480, field, "QFE", "Height");
  arrow(330, sea, "QNH", "Altitude");
  arrow(170, std, "1013", "Pressure altitude, FL");
  s += `<line class="gf-dash" x1="160" x2="470" y1="${ac + 12}" y2="${ac + 12}"/>`;
  return s + "</svg>";
}

/** Flying from high to low pressure at a constant indicated altitude: the aircraft sinks. */
function hightolow(): string {
  const W = 620;
  const H = 260;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="At constant indicated altitude, flying from high to low pressure takes the aircraft lower">`;
  s += `<rect class="gf-ground2" x="20" y="220" width="580" height="30"/>`;
  s += `<path class="gf-line" d="M40,70 C200,70 380,140 580,150"/>`;
  s += `<text class="gf-small" x="40" y="36">Indicated altitude stays 3,000 ft all the way</text>`;
  s += `<text class="gf-small" x="330" y="150" text-anchor="end">Where the aircraft really is</text>`;
  s += `<line class="gf-dash" x1="40" x2="580" y1="70" y2="70"/>`;
  s += `<text class="gf-small" x="575" y="62" text-anchor="end">Where the pilot thinks the aircraft is</text>`;
  s += `<text class="gf-bigH" x="70" y="200" text-anchor="middle">H</text><text class="gf-small" x="70" y="214" text-anchor="middle">QNH 1020</text>`;
  s += `<text class="gf-bigL" x="550" y="200" text-anchor="middle">L</text><text class="gf-small" x="550" y="214" text-anchor="middle">QNH 1005</text>`;
  s += `<line class="gf-arrow" x1="560" x2="560" y1="72" y2="146" marker-end="url(#ah2)" marker-start="url(#ah2)"/>`;
  s += `<text class="gf-label" x="548" y="112" text-anchor="end">15 hPa × 30 ft = 450 ft lower</text>`;
  s += `<defs><marker id="ah2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="gf-head"/></marker></defs>`;
  s += `<text class="gf-label" x="300" y="200" text-anchor="middle">High to low: look out below</text>`;
  return s + "</svg>";
}

/** Arrow marker shared by the force diagrams. Each SVG gets its own id to stay valid when several are on a page. */
const head = (id: string, cls = "gf-head") =>
  `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${cls}"/></marker></defs>`;

/** Geostrophic balance: straight isobars, PGF towards low, Coriolis towards high, wind along the isobars. */
function geostrophic(): string {
  const W = 600;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Geostrophic wind: pressure gradient force towards low pressure balances Coriolis force towards high pressure">`;
  s += head("gh1") + head("gh2", "gf-headb") + head("gh3", "gf-headr");
  for (const [y, p] of [[60, 1004], [150, 1008], [240, 1012]] as const) {
    s += `<line class="gf-iso" x1="40" x2="560" y1="${y}" y2="${y}"/><text class="gf-small" x="566" y="${y + 4}">${p}</text>`;
  }
  s += `<text class="gf-bigL" x="300" y="34" text-anchor="middle">LOW</text>`;
  s += `<text class="gf-bigH" x="300" y="286" text-anchor="middle">HIGH</text>`;
  s += `<line class="gf-arrowr" x1="300" x2="300" y1="150" y2="88" marker-end="url(#gh3)"/>`;
  s += `<text class="gf-label" x="310" y="112">Pressure gradient force</text>`;
  s += `<line class="gf-arrowb" x1="300" x2="300" y1="150" y2="212" marker-end="url(#gh2)"/>`;
  s += `<text class="gf-label" x="310" y="196">Coriolis force</text>`;
  s += `<line class="gf-arrow" x1="120" x2="270" y1="150" y2="150" marker-end="url(#gh1)" style="stroke-width:4"/>`;
  s += `<text class="gf-label" x="60" y="140">Wind</text>`;
  s += `<text class="gf-small" x="40" y="174">Along the isobars, low on its left (NH)</text>`;
  return s + "</svg>";
}

/** Friction: the wind above follows the isobars, the surface wind is slower and turned in towards low. */
function friction(): string {
  const W = 600;
  const H = 280;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Surface wind is slower and crosses the isobars towards low pressure">`;
  s += head("fh1") + head("fh2", "gf-headb");
  for (const [y, p] of [[60, 1004], [140, 1008], [220, 1012]] as const) {
    s += `<line class="gf-iso" x1="40" x2="560" y1="${y}" y2="${y}"/><text class="gf-small" x="566" y="${y + 4}">${p}</text>`;
  }
  s += `<text class="gf-bigL" x="300" y="34" text-anchor="middle">LOW</text>`;
  s += `<text class="gf-bigH" x="300" y="268" text-anchor="middle">HIGH</text>`;
  s += `<line class="gf-arrow" x1="160" x2="400" y1="140" y2="140" marker-end="url(#fh1)" style="stroke-width:4"/>`;
  s += `<text class="gf-label" x="250" y="166">2,000 ft wind: along the isobars</text>`;
  // 30° in towards low, about half as long.
  const len = 120;
  const ang = (30 * Math.PI) / 180;
  s += `<line class="gf-arrowb" x1="160" x2="${f(160 + len * Math.cos(ang))}" y1="140" y2="${f(140 - len * Math.sin(ang))}" marker-end="url(#fh2)" style="stroke-width:4"/>`;
  s += `<text class="gf-label gf-blue" x="${f(160 + len * Math.cos(ang) + 8)}" y="${f(140 - len * Math.sin(ang))}">Surface wind: about half the speed</text>`;
  s += `<path class="gf-iso" d="M210,140 A50,50 0 0 0 203,115"/>`;
  s += `<text class="gf-small" x="218" y="128">about 30° over land</text>`;
  s += `<text class="gf-small" x="250" y="186">NH: the surface wind is backed and lighter</text>`;
  return s + "</svg>";
}

/** Sea breeze by day and land breeze by night, side by side. */
function seabreeze(): string {
  const W = 640;
  const H = 260;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="By day the sea breeze blows from sea to land, by night the land breeze blows from land to sea">`;
  s += head("sb1") + head("sb2", "gf-headb");
  const panel = (x0: number, day: boolean) => {
    let p = `<rect class="gf-sea" x="${x0}" y="190" width="140" height="40"/><rect class="gf-ground2" x="${x0 + 140}" y="186" width="150" height="44"/>`;
    p += `<text class="gf-small" x="${x0 + 10}" y="214">Sea</text><text class="gf-small" x="${x0 + 280}" y="212" text-anchor="end">Land</text>`;
    p += `<text class="gf-label" x="${x0 + 145}" y="24" text-anchor="middle">${day ? "Day: sea breeze" : "Night: land breeze"}</text>`;
    p += `<text class="gf-small" x="${x0 + 145}" y="42" text-anchor="middle">${day ? "Land warmer, air rises over it" : "Land colder, air sinks over it"}</text>`;
    // Loop: surface arrow, rising, return aloft, sinking.
    const sx = day ? x0 + 40 : x0 + 250;
    const ex = day ? x0 + 250 : x0 + 40;
    const cls = day ? "gf-arrowb" : "gf-arrow";
    const mk = day ? "sb2" : "sb1";
    p += `<line class="${cls}" x1="${sx}" x2="${ex}" y1="170" y2="170" marker-end="url(#${mk})" style="stroke-width:4"/>`;
    p += `<line class="gf-arrowthin" x1="${ex}" x2="${ex}" y1="160" y2="80" marker-end="url(#sb1)"/>`;
    p += `<line class="gf-arrowthin" x1="${ex}" x2="${sx}" y1="70" y2="70" marker-end="url(#sb1)"/>`;
    p += `<line class="gf-arrowthin" x1="${sx}" x2="${sx}" y1="80" y2="160" marker-end="url(#sb1)"/>`;
    p += `<text class="gf-small" x="${x0 + 145}" y="160" text-anchor="middle">${day ? "10 to 15 kt, the stronger one" : "Weaker, a few knots"}</text>`;
    return p;
  };
  s += panel(20, true) + panel(340, false);
  return s + "</svg>";
}

/** Föhn: moist air rises and rains on the windward side, sinks warm and dry on the lee side. */
function foehn(): string {
  const W = 640;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Föhn effect over a mountain range">`;
  s += head("fo1");
  s += `<path class="gf-ground" d="M20,260 L220,260 L320,70 L420,260 L620,260 L620,300 L20,300 Z"/>`;
  s += `<path class="gf-cloud" d="M190,250 C180,200 220,150 260,135 C280,110 320,80 330,95 C300,130 280,190 280,250 Z"/>`;
  for (const x of [215, 235, 255]) s += `<line class="gf-rain" x1="${x}" x2="${x - 6}" y1="230" y2="258"/>`;
  s += `<path class="gf-line" d="M40,240 C160,240 250,120 320,60 C390,120 470,240 600,240" marker-end="url(#fo1)"/>`;
  s += `<text class="gf-label" x="40" y="228">20 °C, moist</text>`;
  s += `<text class="gf-small" x="40" y="212">Windward side</text>`;
  s += `<text class="gf-small" x="40" y="120">Cloud and rain:</text>`;
  s += `<text class="gf-small" x="40" y="136">cools slowly (saturated rate)</text>`;
  s += `<text class="gf-small" x="420" y="150">Dry now: warms</text>`;
  s += `<text class="gf-small" x="420" y="166">fast (dry rate)</text>`;
  s += `<text class="gf-label" x="600" y="228" text-anchor="end">26 °C, dry</text>`;
  s += `<text class="gf-small" x="600" y="212" text-anchor="end">Lee side: föhn</text>`;
  return s + "</svg>";
}

/** Stability: DALR and SALR lines from one start point, with ELR zones between and beyond them. */
function stability(): string {
  const W = 600;
  const H = 330;
  const x = (t: number) => 80 + (t + 20) * 11; // -20 to +20 °C
  const y = (h: number) => 290 - h * 22; // 0 to 11 thousand ft
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Stability zones: ELR steeper than DALR is absolutely unstable, less steep than SALR is absolutely stable, in between is conditionally unstable">`;
  // Zones as wedges from the start point (15 °C at the surface).
  const sx = x(15);
  const sy = y(0);
  const at = (rate: number) => [x(15 - rate * 10), y(10)]; // temperature after 10,000 ft at that rate
  const [dx, dy] = at(3);
  const [wx, wy] = at(1.5);
  s += `<path class="gf-zone-u" d="M${sx},${sy} L${dx},${dy} L${x(-20)},${dy} L${x(-20)},${y(0)} Z"/>`;
  s += `<path class="gf-zone-c" d="M${sx},${sy} L${dx},${dy} L${wx},${wy} Z"/>`;
  s += `<path class="gf-zone-s" d="M${sx},${sy} L${wx},${wy} L${x(20)},${wy} L${x(20)},${y(0)} Z"/>`;
  s += `<line class="gf-line" x1="${sx}" y1="${sy}" x2="${dx}" y2="${dy}"/>`;
  s += `<line class="gf-line2" x1="${sx}" y1="${sy}" x2="${wx}" y2="${wy}"/>`;
  s += `<text class="gf-label" x="${dx - 4}" y="${dy - 8}">DALR 3 °C/1000 ft</text>`;
  s += `<text class="gf-label gf-blue" x="${wx - 10}" y="${wy - 8}">SALR 1.5 °C/1000 ft</text>`;
  s += `<text class="gf-small" x="${x(-19)}" y="${y(5)}">ELR steeper than DALR:</text>`;
  s += `<text class="gf-label" x="${x(-19)}" y="${y(5) + 18}">absolutely unstable</text>`;
  s += `<text class="gf-small" x="${x(0)}" y="${y(7.5)}" text-anchor="middle">In between:</text>`;
  s += `<text class="gf-label" x="${x(0)}" y="${y(7.5) + 18}" text-anchor="middle">conditionally</text>`;
  s += `<text class="gf-label" x="${x(0)}" y="${y(7.5) + 36}" text-anchor="middle">unstable</text>`;
  s += `<text class="gf-small" x="${x(19)}" y="${y(9)}" text-anchor="end">ELR less than SALR</text>`;
  s += `<text class="gf-small" x="${x(19)}" y="${y(9) + 16}" text-anchor="end">(and inversions):</text>`;
  s += `<text class="gf-label" x="${x(19)}" y="${y(9) + 34}" text-anchor="end">absolutely stable</text>`;
  s += `<line class="gf-axis" x1="80" y1="${y(0)}" x2="520" y2="${y(0)}"/><line class="gf-axis" x1="80" y1="${y(0)}" x2="80" y2="${y(11)}"/>`;
  for (const t of [-20, -10, 0, 10, 20]) s += `<text class="gf-tick" x="${x(t)}" y="${y(0) + 18}" text-anchor="middle">${t}</text>`;
  for (const h of [0, 5, 10]) s += `<text class="gf-tick" x="72" y="${y(h) + 4}" text-anchor="end">${h}</text>`;
  s += `<text class="gf-tick" x="300" y="${y(0) + 34}" text-anchor="middle">Temperature °C</text>`;
  s += `<text class="gf-tick" x="22" y="${y(5.5)}" transform="rotate(-90 22 ${y(5.5)})" text-anchor="middle">Height, thousand ft</text>`;
  return s + "</svg>";
}

/** Four small panels: convection, orographic, frontal and convergence lifting. */
function lifting(): string {
  const W = 640;
  const H = 210;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Four ways air is lifted: convection, orographic, frontal and convergence">`;
  s += head("lf1");
  const up = (x1: number, y1: number, x2: number, y2: number) => `<line class="gf-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#lf1)"/>`;
  const cu = (cx: number, cy: number, w: number) =>
    `<path class="gf-cloud" d="M${cx - w},${cy} c0,-14 12,-20 20,-16 c4,-14 24,-18 32,-6 c10,-8 26,0 ${2 * w - 52},22 z"/>`;
  // 1 Convection
  s += `<rect class="gf-ground2" x="10" y="170" width="140" height="12"/><circle class="gf-sun" cx="128" cy="34" r="12"/>`;
  s += up(70, 165, 70, 95) + cu(70, 80, 36);
  s += `<text class="gf-label" x="80" y="202" text-anchor="middle">Convection</text>`;
  // 2 Orographic
  s += `<path class="gf-ground" d="M165,182 L215,182 L265,100 L315,182 L315,182 Z"/>`;
  s += up(175, 170, 245, 108) + cu(255, 92, 34);
  s += `<text class="gf-label" x="240" y="202" text-anchor="middle">Orographic</text>`;
  // 3 Frontal
  s += `<path class="gf-coldair" d="M330,182 L470,182 L470,110 Z"/><text class="gf-small" x="440" y="170" text-anchor="middle">Cold</text>`;
  s += up(345, 170, 445, 110) + cu(440, 96, 34) + `<text class="gf-small" x="350" y="150">Warm</text>`;
  s += `<text class="gf-label" x="400" y="202" text-anchor="middle">Frontal</text>`;
  // 4 Convergence
  s += `<rect class="gf-ground2" x="490" y="170" width="140" height="12"/>`;
  s += `<line class="gf-arrow" x1="495" y1="160" x2="545" y2="160" marker-end="url(#lf1)"/><line class="gf-arrow" x1="625" y1="160" x2="575" y2="160" marker-end="url(#lf1)"/>`;
  s += up(560, 150, 560, 95) + cu(560, 80, 36);
  s += `<text class="gf-label" x="560" y="202" text-anchor="middle">Convergence</text>`;
  return s + "</svg>";
}

/** The ten cloud types drawn at their usual heights. */
function clouds(): string {
  const W = 640;
  const H = 380;
  const y = (kft: number) => 340 - kft * 5.2; // 0 to 60 thousand ft
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cloud types by height: high, medium, low and vertical development">`;
  s += `<rect class="gf-band1" x="70" y="${y(60)}" width="560" height="${y(20) - y(60)}"/>`;
  s += `<rect class="gf-band0" x="70" y="${y(20)}" width="560" height="${y(6.5) - y(20)}"/>`;
  s += `<rect class="gf-band1" x="70" y="${y(6.5)}" width="560" height="${y(0) - y(6.5)}"/>`;
  s += `<text class="gf-small" x="76" y="${y(57)}">High</text><text class="gf-small" x="76" y="${y(18)}">Medium</text><text class="gf-small" x="76" y="${y(5)}">Low</text>`;
  // High: wisps, ripples, veil.
  s += `<path class="gf-wisp" d="M120,${y(42)} q30,-12 60,-4 M130,${y(40)} q30,-10 55,-2 M175,${y(43)} l14,-14"/>`;
  s += `<text class="gf-label" x="150" y="${y(34.5)}" text-anchor="middle">Ci</text>`;
  for (let i = 0; i < 9; i++) s += `<circle class="gf-cloud" cx="${230 + (i % 5) * 12}" cy="${y(40) + Math.floor(i / 5) * 10}" r="4"/>`;
  s += `<text class="gf-label" x="255" y="${y(34.5)}" text-anchor="middle">Cc</text>`;
  s += `<rect class="gf-veil" x="310" y="${y(43)}" width="110" height="10" rx="5"/><text class="gf-label" x="365" y="${y(34.5)}" text-anchor="middle">Cs</text>`;
  // Medium.
  for (let i = 0; i < 6; i++) s += `<ellipse class="gf-cloud" cx="${130 + i * 18}" cy="${y(14)}" rx="9" ry="6"/>`;
  s += `<text class="gf-label" x="175" y="${y(10)}" text-anchor="middle">Ac</text>`;
  s += `<rect class="gf-cloud2" x="250" y="${y(15)}" width="140" height="14" rx="4"/><text class="gf-label" x="320" y="${y(10)}" text-anchor="middle">As</text>`;
  // Ns from medium down to low, with rain.
  s += `<rect class="gf-dark" x="420" y="${y(12)}" width="80" height="${y(2) - y(12)}" rx="6"/>`;
  for (const xx of [432, 450, 468, 486]) s += `<line class="gf-rain" x1="${xx}" x2="${xx - 5}" y1="${y(2)}" y2="${y(0) - 2}"/>`;
  s += `<text class="gf-label" x="460" y="${y(7)}" text-anchor="middle" style="fill:#fff">Ns</text>`;
  // Low.
  s += `<rect class="gf-cloud2" x="120" y="${y(2)}" width="120" height="10" rx="3"/><text class="gf-label" x="180" y="${y(2) + 26}" text-anchor="middle">St</text>`;
  for (let i = 0; i < 5; i++) s += `<ellipse class="gf-cloud2" cx="${270 + i * 24}" cy="${y(4)}" rx="13" ry="8"/>`;
  s += `<text class="gf-label" x="318" y="${y(4) + 30}" text-anchor="middle">Sc</text>`;
  // Cu and Cb.
  s += `<path class="gf-cloud" d="M515,${y(3)} c-4,-14 6,-24 18,-20 c4,-16 26,-14 28,0 c12,-2 16,12 10,20 z"/>`;
  s += `<text class="gf-label" x="545" y="${y(3) + 20}" text-anchor="middle">Cu</text>`;
  s += `<path class="gf-cloud" d="M572,${y(3)} L580,${y(25)} C570,${y(35)} 585,${y(46)} 596,${y(48)} L548,${y(50)} L626,${y(50)} L606,${y(47)} C620,${y(40)} 618,${y(28)} 612,${y(20)} L620,${y(3)} Z"/>`;
  s += `<text class="gf-label" x="598" y="${y(3) + 20}" text-anchor="middle">Cb</text>`;
  s += `<text class="gf-small" x="588" y="${y(52)}" text-anchor="middle">anvil</text>`;
  s += `<line class="gf-axis" x1="70" y1="${y(0)}" x2="630" y2="${y(0)}"/><line class="gf-axis" x1="70" y1="${y(0)}" x2="70" y2="${y(60)}"/>`;
  for (const k of [0, 6.5, 20, 40, 60]) s += `<text class="gf-tick" x="64" y="${y(k) + 4}" text-anchor="end">${k === 6.5 ? "6,500" : k ? k + ",000" : "0"}</text>`;
  s += `<text class="gf-tick" x="18" y="${y(30)}" transform="rotate(-90 18 ${y(30)})" text-anchor="middle">Height ft (tropics)</text>`;
  return s + "</svg>";
}

/** Shallow fog: good vertical visibility, poor slant visibility on the approach. */
function slantvis(): string {
  const W = 620;
  const H = 260;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Over shallow fog the runway is visible from overhead but not along the slant approach path">`;
  s += `<rect class="gf-ground2" x="20" y="210" width="580" height="30"/>`;
  s += `<rect class="gf-runway" x="430" y="204" width="160" height="8"/>`;
  s += `<rect class="gf-fog" x="20" y="160" width="580" height="50"/>`;
  s += `<text class="gf-small" x="30" y="182">Shallow fog layer</text>`;
  s += `<path class="gf-plane" d="M500,40 l40,0 l8,-6 l4,0 l-4,8 l-12,2 l-6,10 l-6,0 l2,-10 l-26,0 z"/>`;
  s += `<line class="gf-sight" x1="510" y1="58" x2="510" y2="204"/>`;
  s += `<text class="gf-label gf-green" x="500" y="120" text-anchor="end">Overhead: runway in sight</text>`;
  s += `<path class="gf-plane" d="M120,90 l40,0 l8,-6 l4,0 l-4,8 l-12,2 l-6,10 l-6,0 l2,-10 l-26,0 z"/>`;
  s += `<line class="gf-sight2" x1="165" y1="104" x2="440" y2="204"/>`;
  s += `<text class="gf-label gf-red" x="30" y="128">Approach: long slant path</text>`;
  s += `<text class="gf-label gf-red" x="30" y="146">through fog hides the runway</text>`;
  return s + "</svg>";
}

/** Radiation fog and advection fog side by side. */
function fogtypes(): string {
  const W = 640;
  const H = 250;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Radiation fog forms on clear calm nights over land, advection fog when warm moist air moves over a cold surface">`;
  s += head("fg1");
  // Radiation fog panel.
  s += `<text class="gf-label" x="160" y="24" text-anchor="middle">Radiation fog</text>`;
  for (const [x, y] of [[40, 50], [90, 40], [150, 58], [210, 44], [270, 54]] as const) s += `<circle class="gf-star" cx="${x}" cy="${y}" r="2"/>`;
  s += `<text class="gf-small" x="160" y="80" text-anchor="middle">Clear sky: ground loses heat</text>`;
  for (const x of [70, 160, 250]) s += `<line class="gf-arrowthin" x1="${x}" y1="180" x2="${x}" y2="100" marker-end="url(#fg1)"/>`;
  s += `<rect class="gf-fog" x="20" y="170" width="280" height="30"/>`;
  s += `<rect class="gf-ground2" x="20" y="200" width="280" height="20"/>`;
  s += `<text class="gf-small" x="160" y="240" text-anchor="middle">Light wind 2 to 8 kt, moist air, long night, over land</text>`;
  // Advection fog panel.
  s += `<text class="gf-label" x="480" y="24" text-anchor="middle">Advection fog</text>`;
  s += `<rect class="gf-warm" x="340" y="110" width="120" height="60"/>`;
  s += `<text class="gf-small" x="400" y="138" text-anchor="middle">Warm moist air</text>`;
  s += `<line class="gf-arrow" x1="400" y1="160" x2="470" y2="160" marker-end="url(#fg1)" style="stroke-width:3"/>`;
  s += `<rect class="gf-fog" x="470" y="160" width="150" height="40"/>`;
  s += `<rect class="gf-sea" x="340" y="200" width="130" height="20"/>`;
  s += `<rect class="gf-coldsurf" x="470" y="200" width="150" height="20"/>`;
  s += `<text class="gf-small" x="545" y="150" text-anchor="middle">Cooled from below</text>`;
  s += `<text class="gf-small" x="545" y="214" text-anchor="middle">Cold sea or land</text>`;
  s += `<text class="gf-small" x="480" y="240" text-anchor="middle">Day or night, wind up to about 15 kt</text>`;
  return s + "</svg>";
}

/** Warm and cold front cross sections. */
function fronts(): string {
  const W = 640;
  const H = 400;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cross sections of a warm front and a cold front">`;
  s += head("fr1");
  // Warm front: cold wedge on the right, gentle slope.
  s += `<text class="gf-label" x="20" y="22">Warm front: warm air rides up a gentle slope</text>`;
  s += `<path class="gf-coldair" d="M180,170 L620,170 L620,70 Z"/>`;
  s += `<text class="gf-small" x="520" y="160">Cold air</text>`;
  s += `<text class="gf-small" x="40" y="150">Warm air</text>`;
  s += `<line class="gf-arrow" x1="60" y1="160" x2="170" y2="160" marker-end="url(#fr1)"/>`;
  s += `<rect class="gf-dark" x="200" y="110" width="110" height="48" rx="6"/><text class="gf-small" x="255" y="138" text-anchor="middle" style="fill:#fff">Ns</text>`;
  for (const x of [215, 235, 255, 275, 295]) s += `<line class="gf-rain" x1="${x}" x2="${x - 4}" y1="158" y2="170"/>`;
  s += `<rect class="gf-cloud2" x="320" y="90" width="120" height="16" rx="5"/><text class="gf-small" x="380" y="86" text-anchor="middle">As</text>`;
  s += `<rect class="gf-veil" x="450" y="60" width="90" height="8" rx="4"/><text class="gf-small" x="495" y="54" text-anchor="middle">Cs</text>`;
  s += `<path class="gf-wisp" d="M555,44 q20,-8 40,-2"/><text class="gf-small" x="575" y="32" text-anchor="middle">Ci</text>`;
  s += `<line class="gf-axis" x1="20" y1="170" x2="620" y2="170"/>`;
  s += `<text class="gf-small" x="180" y="188" text-anchor="middle">Surface front</text>`;
  s += `<text class="gf-small" x="620" y="188" text-anchor="end">Cloud up to about 1,000 km ahead</text>`;
  // Cold front: cold wedge on the left, steep slope.
  const y0 = 370;
  s += `<text class="gf-label" x="20" y="${y0 - 150}">Cold front: cold air pushes under, lifting warm air steeply</text>`;
  s += `<path class="gf-coldair" d="M20,${y0} L330,${y0} C300,${y0 - 30} 270,${y0 - 70} 240,${y0 - 110} L20,${y0 - 110} Z"/>`;
  s += `<text class="gf-small" x="60" y="${y0 - 20}">Cold air</text>`;
  s += `<line class="gf-arrow" x1="120" y1="${y0 - 40}" x2="230" y2="${y0 - 40}" marker-end="url(#fr1)"/>`;
  s += `<text class="gf-small" x="500" y="${y0 - 20}">Warm air</text>`;
  s += `<path class="gf-cloud" d="M330,${y0 - 6} L338,${y0 - 70} C328,${y0 - 92} 340,${y0 - 112} 352,${y0 - 116} L312,${y0 - 120} L396,${y0 - 120} L372,${y0 - 114} C384,${y0 - 100} 384,${y0 - 80} 376,${y0 - 64} L382,${y0 - 6} Z"/>`;
  s += `<text class="gf-small" x="356" y="${y0 - 126}" text-anchor="middle">CB</text>`;
  for (const x of [340, 352, 364, 376]) s += `<line class="gf-rain" x1="${x}" x2="${x - 4}" y1="${y0 - 6}" y2="${y0}"/>`;
  s += `<path class="gf-cloud2" d="M120,${y0 - 120} c10,-14 30,-14 36,-2 c10,-8 26,-2 26,8 z"/><text class="gf-small" x="150" y="${y0 - 128}" text-anchor="middle">Cu behind</text>`;
  s += `<line class="gf-axis" x1="20" y1="${y0}" x2="620" y2="${y0}"/>`;
  s += `<text class="gf-small" x="356" y="${y0 + 18}" text-anchor="middle">Surface front: narrow band of CB, squalls, heavy showers</text>`;
  return s + "</svg>";
}

/** Plan view of a frontal depression with warm and cold fronts and the warm sector (NH). */
function depression(): string {
  const W = 560;
  const H = 360;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="A frontal depression: low centre with a warm front to the east, a cold front to the south west and the warm sector between">`;
  s += head("dp1");
  for (const [rx, ry] of [[50, 40], [110, 85], [180, 140]] as const) s += `<ellipse class="gf-iso" cx="230" cy="140" rx="${rx}" ry="${ry}"/>`;
  s += `<text class="gf-bigL" x="230" y="148" text-anchor="middle">L</text>`;
  // Warm front (red, half circles) to the east and south east.
  s += `<path class="gf-wfront" d="M232,150 C300,160 360,190 420,250"/>`;
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.17;
    const x = 232 + (420 - 232) * t;
    const y = 150 + (250 - 150) * (t * t * 0.8 + t * 0.2);
    s += `<path class="gf-wsym" d="M${f(x - 6)},${f(y)} A6,6 0 0 1 ${f(x + 6)},${f(y)} Z"/>`;
  }
  // Cold front (blue, triangles) to the south west.
  s += `<path class="gf-cfront" d="M232,150 C210,210 170,260 110,320"/>`;
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.17;
    const x = 232 + (110 - 232) * t;
    const y = 150 + (320 - 150) * t;
    s += `<path class="gf-csym" d="M${f(x)},${f(y)} l14,2 l-9,9 z"/>`;
  }
  s += `<text class="gf-label" x="290" y="250" text-anchor="middle">Warm sector</text>`;
  s += `<text class="gf-small" x="290" y="266" text-anchor="middle">mild, humid, St, drizzle</text>`;
  s += `<text class="gf-small gf-red" x="430" y="236">Warm front</text>`;
  s += `<text class="gf-small gf-blue" x="40" y="300">Cold front</text>`;
  s += `<text class="gf-small" x="70" y="80">Cold air</text>`;
  s += `<line class="gf-arrow" x1="300" y1="300" x2="380" y2="270" marker-end="url(#dp1)"/>`;
  s += `<text class="gf-small" x="300" y="330">Moves roughly with the warm sector isobars</text>`;
  return s + "</svg>";
}

/** Cross section of a tropical cyclone: eye, eye wall, rain bands. */
function tcsection(): string {
  const W = 640;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cross section of a tropical cyclone with the calm eye, the eye wall and spiral rain bands">`;
  s += `<rect class="gf-sea" x="20" y="250" width="600" height="30"/>`;
  // Eye wall towers and bands, symmetric about x=320.
  const cb = (cx: number, top: number, w: number) =>
    `<path class="gf-cloud" d="M${cx - w},250 L${cx - w + 4},${top + 20} C${cx - w},${top} ${cx + w},${top} ${cx + w - 4},${top + 20} L${cx + w},250 Z"/>`;
  s += cb(270, 40, 28) + cb(370, 40, 28) + cb(190, 110, 22) + cb(450, 110, 22) + cb(120, 160, 18) + cb(520, 160, 18);
  s += `<path class="gf-veil" d="M100,40 C200,26 440,26 540,40 L540,48 C440,36 200,36 100,48 Z"/>`;
  s += `<text class="gf-small" x="320" y="22" text-anchor="middle">Cirrus outflow at the top</text>`;
  s += `<text class="gf-label" x="320" y="150" text-anchor="middle">Eye</text>`;
  s += `<text class="gf-small" x="320" y="168" text-anchor="middle">calm, sinking air</text>`;
  s += `<text class="gf-small" x="320" y="184" text-anchor="middle">lowest pressure</text>`;
  s += `<text class="gf-label" x="270" y="270" text-anchor="middle">Eye wall</text>`;
  s += `<text class="gf-small" x="190" y="270" text-anchor="middle">Rain band</text>`;
  s += `<text class="gf-small" x="450" y="270" text-anchor="middle">Rain band</text>`;
  s += `<text class="gf-small" x="610" y="92" text-anchor="end">Strongest winds in the eye wall</text>`;
  s += `<line class="gf-dash" x1="296" x2="344" y1="210" y2="210"/><text class="gf-small" x="320" y="226" text-anchor="middle">20 to 50 km</text>`;
  return s + "</svg>";
}

/** Plan view of a typical NH track with the dangerous semicircle shaded on the right. */
function tctrack(): string {
  const W = 560;
  const H = 330;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Typical northern hemisphere cyclone track, moving west then recurving north east, with the dangerous semicircle on the right of the track">`;
  s += head("tt1");
  s += `<path class="gf-line" d="M520,270 C400,260 260,230 200,170 C160,130 180,80 260,40" marker-end="url(#tt1)"/>`;
  s += `<text class="gf-small" x="550" y="316" text-anchor="end">Moves west or north west at 10 to 15 kt</text>`;
  s += `<text class="gf-small" x="280" y="40">Often recurves north east</text>`;
  // Storm symbol with the right half shaded.
  const cx = 360;
  const cy = 248;
  s += `<path class="gf-danger" d="M${cx},${cy - 50} A50,50 0 0 1 ${cx},${cy + 50} Z" transform="rotate(-82 ${cx} ${cy})"/>`;
  s += `<circle class="gf-iso" cx="${cx}" cy="${cy}" r="50"/>`;
  s += `<circle class="gf-dot" cx="${cx}" cy="${cy}" r="5"/>`;
  s += `<text class="gf-label gf-red" x="${cx}" y="${cy - 60}" text-anchor="middle">Dangerous semicircle</text>`;
  s += `<text class="gf-small" x="${cx}" y="${cy - 76}" text-anchor="middle">right of track (NH)</text>`;
  s += `<text class="gf-small" x="40" y="100">Anticlockwise circulation</text>`;
  s += `<text class="gf-small" x="40" y="116">in the NH</text>`;
  return s + "</svg>";
}

/** Three cell model and surface wind belts, NH half. */
function threecell(): string {
  const W = 620;
  const H = 360;
  const y = (lat: number) => 330 - lat * 3.3; // 0 to 90°
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Three cell model with Hadley, Ferrel and polar cells and the surface wind belts">`;
  s += head("tc1");
  for (const lat of [0, 30, 60, 90]) {
    s += `<line class="gf-dash" x1="60" x2="600" y1="${y(lat)}" y2="${y(lat)}"/>`;
    s += `<text class="gf-tick" x="52" y="${y(lat) + 4}" text-anchor="end">${lat}°${lat ? "N" : ""}</text>`;
  }
  const cell = (a: number, b: number, name: string) => {
    const ya = y(a);
    const yb = y(b);
    const x1 = 300;
    const x2 = 360;
    let c = `<rect class="gf-cellbox" x="${x1 - 70}" y="${yb + 6}" width="${x2 - x1 + 140}" height="${ya - yb - 12}" rx="30"/>`;
    c += `<text class="gf-label" x="330" y="${(ya + yb) / 2 + 5}" text-anchor="middle">${name}</text>`;
    return c;
  };
  s += cell(0, 30, "Hadley cell") + cell(30, 60, "Ferrel cell") + cell(60, 90, "Polar cell");
  for (const [lat, word] of [[0, "air rises"], [30, "air sinks"], [60, "air rises"], [90, "air sinks"]] as const) {
    s += `<text class="gf-small gf-blue" x="444" y="${y(lat) + 16}">${word}</text>`;
  }
  // Surface wind arrows on the left.
  const wind = (lat: number, dx: number, dy: number, label: string) =>
    `<line class="gf-arrow" x1="${130 - dx / 2}" y1="${y(lat) - dy / 2}" x2="${130 + dx / 2}" y2="${y(lat) + dy / 2}" marker-end="url(#tc1)"/><text class="gf-small" x="170" y="${y(lat) + 4}">${label}</text>`;
  s += wind(15, -36, 22, "NE trades");
  s += wind(45, 36, -22, "Westerlies");
  s += wind(75, -36, 22, "Polar easterlies");
  s += `<text class="gf-small" x="600" y="${y(0) - 6}" text-anchor="end">Doldrums, ITCZ: low</text>`;
  s += `<text class="gf-small" x="600" y="${y(30) - 6}" text-anchor="end">Subtropical high: deserts</text>`;
  s += `<text class="gf-small" x="600" y="${y(60) - 6}" text-anchor="end">Polar front: low</text>`;
  s += `<text class="gf-small" x="600" y="${y(90) - 6}" text-anchor="end">Polar high</text>`;
  return s + "</svg>";
}

/** Jet stream cross section looking downstream (NH): core under the tropopause break, CAT on the cold side. */
function jetsection(): string {
  const W = 620;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Jet stream core near the tropopause break, with the worst clear air turbulence on the cold side below the core">`;
  s += `<path class="gf-line" d="M20,130 L300,130"/><path class="gf-line" d="M260,80 L600,80"/>`;
  s += `<text class="gf-small" x="24" y="122">Polar tropopause (lower)</text>`;
  s += `<text class="gf-small" x="596" y="72" text-anchor="end">Tropical tropopause (higher)</text>`;
  for (const [r, cls] of [[70, "gf-iso"], [48, "gf-iso"], [26, "gf-iso"]] as const) s += `<ellipse class="${cls}" cx="300" cy="150" rx="${r * 1.8}" ry="${r * 0.7}"/>`;
  s += `<circle class="gf-jet" cx="300" cy="150" r="12"/><text class="gf-jett" x="300" y="155" text-anchor="middle">J</text>`;
  s += `<text class="gf-small" x="300" y="128" text-anchor="middle">Core, 60 kt or more</text>`;
  s += `<path class="gf-danger" d="M150,170 C190,215 260,215 290,190 L270,200 C240,215 190,205 160,175 Z"/>`;
  s += `<ellipse class="gf-danger" cx="215" cy="190" rx="70" ry="22"/>`;
  s += `<text class="gf-label gf-red" x="140" y="236">Worst CAT: cold side,</text>`;
  s += `<text class="gf-label gf-red" x="140" y="254">just below the core</text>`;
  s += `<text class="gf-label gf-blue" x="40" y="200">Cold side (poleward)</text>`;
  s += `<text class="gf-small" x="40" y="216">left, looking downstream</text>`;
  s += `<text class="gf-label" x="580" y="200" text-anchor="end">Warm side</text>`;
  s += `<path class="gf-wisp" d="M380,108 q30,-10 60,-2 M400,116 q30,-8 60,0"/><text class="gf-small" x="470" y="112">Cirrus streaks</text>`;
  return s + "</svg>";
}

/** Month by month hazard calendar for India. */
function calendar(): string {
  const W = 640;
  const H = 300;
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const x = (m: number) => 190 + m * 36; // m from 0 (Jan) to 12 (end of Dec)
  const rows: [string, [number, number][], string][] = [
    ["Fog, north India", [[0, 2], [11, 12]], "gf-bar-fog"],
    ["Western disturbances", [[0, 4], [9.5, 12]], "gf-bar-wd"],
    ["Dust storms, NW India", [[3, 6]], "gf-bar-dust"],
    ["Norwesters, east India", [[2, 5]], "gf-bar-ts"],
    ["SW monsoon", [[5, 9.5]], "gf-bar-mon"],
    ["NE monsoon, Tamil Nadu", [[9.5, 12]], "gf-bar-mon"],
    ["Cyclones", [[3.5, 5.5], [9.5, 12]], "gf-bar-tc"],
    ["Subtropical jet, CAT", [[0, 5], [9.5, 12]], "gf-bar-jet"],
  ];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendar of weather hazards in India by month">`;
  months.forEach((m, i) => (s += `<text class="gf-tick" x="${x(i) + 18}" y="24" text-anchor="middle">${m}</text>`));
  rows.forEach(([name, spans, cls], r) => {
    const yy = 40 + r * 31;
    s += `<text class="gf-small" x="180" y="${yy + 15}" text-anchor="end">${name}</text>`;
    s += `<rect class="gf-band1" x="${x(0)}" y="${yy}" width="${x(12) - x(0)}" height="22" rx="3"/>`;
    for (const [a, b] of spans) s += `<rect class="${cls}" x="${x(a)}" y="${yy}" width="${x(b) - x(a)}" height="22" rx="3"/>`;
  });
  for (const m of [2, 5, 9]) s += `<line class="gf-dash" x1="${x(m)}" x2="${x(m)}" y1="32" y2="${40 + rows.length * 31}"/>`;
  return s + "</svg>";
}

/** Weather sequence as a western disturbance passes: pressure trace and weather stages. */
function wdpass(): string {
  const W = 620;
  const H = 260;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="As a western disturbance passes, pressure falls then rises, cloud thickens to rain then clears, followed by fog and a cold wave">`;
  s += `<path class="gf-line" d="M40,60 C150,64 220,120 300,150 C340,160 380,120 460,80 C520,62 560,60 600,58"/>`;
  s += `<text class="gf-small" x="44" y="50">Pressure</text>`;
  const stage = (x: number, w: number, title: string, lines: string[]) => {
    let t = `<rect class="gf-band0" x="${x}" y="176" width="${w}" height="74" rx="6"/>`;
    t += `<text class="gf-label" x="${x + w / 2}" y="194" text-anchor="middle">${title}</text>`;
    lines.forEach((l, i) => (t += `<text class="gf-small" x="${x + w / 2}" y="${212 + i * 16}" text-anchor="middle">${l}</text>`));
    return t;
  };
  s += stage(20, 190, "Approach", ["Wind backs, warmer", "Ci, then As and Ns"]);
  s += stage(215, 190, "Passage", ["Rain, snow on hills", "CB, thunder, hail"]);
  s += stage(410, 190, "After", ["Clear, cold NW wind", "Fog and cold wave"]);
  s += `<text class="gf-small" x="300" y="170" text-anchor="middle">lowest</text>`;
  return s + "</svg>";
}

/** Schematic of the two monsoon branches. Not a map. */
function monsoon(): string {
  const W = 600;
  const H = 380;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Schematic of the Arabian Sea and Bay of Bengal branches of the south west monsoon">`;
  s += head("mn1", "gf-headb");
  s += `<rect class="gf-sea" x="0" y="0" width="${W}" height="${H}"/>`;
  s += `<rect class="gf-hills" x="150" y="20" width="400" height="34" rx="8"/><text class="gf-label" x="350" y="43" text-anchor="middle">Himalayas</text>`;
  s += `<path class="gf-land" d="M150,60 L560,60 L560,150 L470,190 L380,330 L330,360 L260,210 L180,150 Z"/>`;
  s += `<path class="gf-hills" d="M262,214 L300,300 L318,340 L326,336 L290,250 L272,206 Z"/>`;
  s += `<text class="gf-small" x="345" y="352">Western Ghats</text>`;
  s += `<line class="gf-dash" x1="180" y1="110" x2="530" y2="150"/><text class="gf-small" x="356" y="122" text-anchor="middle">Monsoon trough</text>`;
  s += `<text class="gf-small" x="350" y="230" text-anchor="middle">Rain shadow</text>`;
  s += `<text class="gf-label" x="60" y="250" text-anchor="middle">Arabian</text><text class="gf-label" x="60" y="268" text-anchor="middle">Sea</text>`;
  s += `<text class="gf-label" x="520" y="270" text-anchor="middle">Bay of</text><text class="gf-label" x="520" y="288" text-anchor="middle">Bengal</text>`;
  const arr = (d: string) => `<path class="gf-arrowb" d="${d}" fill="none" marker-end="url(#mn1)"/>`;
  s += arr("M60,360 C150,330 220,300 262,260");
  s += arr("M40,320 C130,280 200,230 230,190");
  s += arr("M470,360 C520,300 560,240 560,180");
  s += arr("M560,170 C500,120 420,96 300,90");
  s += `<text class="gf-small" x="40" y="350">Arabian Sea branch</text>`;
  s += `<text class="gf-small" x="440" y="356">Bay branch</text>`;
  s += `<text class="gf-small" x="420" y="82" text-anchor="middle">turned west along the plains</text>`;
  s += `<text class="gf-tick" x="590" y="372" text-anchor="end">Schematic, not a map</text>`;
  return s + "</svg>";
}

/** The three stages of a thunderstorm cell, with updraughts in red and downdraughts in blue. */
function tscell(): string {
  const W = 660;
  const H = 320;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Thunderstorm cell in the cumulus, mature and dissipating stages">`;
  s += head("ts1", "gf-headr") + head("ts2", "gf-headb");
  s += `<rect class="gf-ground" x="0" y="262" width="${W}" height="16"/>`;
  const up = (x: number, a: number, b: number) => `<line class="gf-arrowr" x1="${x}" x2="${x}" y1="${a}" y2="${b}" marker-end="url(#ts1)"/>`;
  const down = (x: number, a: number, b: number) => `<line class="gf-arrowb" x1="${x}" x2="${x}" y1="${a}" y2="${b}" marker-end="url(#ts2)"/>`;
  const rain = (x0: number, x1: number, step: number) => {
    let r = "";
    for (let x = x0; x <= x1; x += step) r += `<line class="gf-rain" x1="${x}" x2="${x - 6}" y1="206" y2="252"/>`;
    return r;
  };
  // Cumulus stage.
  s += `<path class="gf-cloud" d="M62,200 C56,160 70,124 90,112 C96,86 128,82 136,106 C156,114 166,152 160,200 Z"/>`;
  s += up(96, 245, 128) + up(126, 245, 128);
  // Mature stage: tall tower with the anvil spreading downwind.
  s += `<path class="gf-cloud" d="M282,200 L286,72 L248,64 L248,52 C300,36 400,36 462,50 L462,60 L380,72 L382,200 Z"/>`;
  s += up(304, 245, 92) + down(356, 92, 252);
  s += rain(338, 378, 10);
  s += `<text class="gf-small" x="430" y="30" text-anchor="middle">Anvil</text>`;
  s += `<line class="gf-arrowb" x1="388" x2="452" y1="256" y2="256" marker-end="url(#ts2)"/>`;
  s += `<text class="gf-small" x="420" y="246" text-anchor="middle">Gust front</text>`;
  // Dissipating stage: the anvil is left, the tower collapses.
  s += `<path class="gf-veil" d="M486,54 C524,42 606,42 644,54 L644,64 L486,64 Z"/>`;
  s += `<path class="gf-cloud2" d="M514,200 C508,160 522,114 546,104 C574,102 590,150 586,200 Z"/>`;
  s += down(532, 112, 252) + down(566, 112, 252);
  s += rain(540, 570, 15);
  const lab = (x: number, a: string, b: string) =>
    `<text class="gf-label" x="${x}" y="296" text-anchor="middle">${a}</text><text class="gf-small" x="${x}" y="314" text-anchor="middle">${b}</text>`;
  s += lab(112, "Cumulus", "updraughts only") + lab(332, "Mature", "up and down, rain at the ground") + lab(560, "Dissipating", "downdraughts only");
  return s + "</svg>";
}

/** An approach through a microburst: headwind, then downdraught, then tailwind. */
function microburst(): string {
  const W = 640;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Aircraft path on an approach through a microburst, dropping below the glide path">`;
  s += head("mb1", "gf-headb");
  s += `<rect class="gf-ground" x="0" y="260" width="${W}" height="10"/>`;
  s += `<rect class="gf-runway" x="500" y="256" width="130" height="6"/>`;
  s += `<path class="gf-cloud2" d="M210,70 C200,40 240,18 280,26 C300,8 360,8 380,26 C420,18 450,44 436,70 Z"/>`;
  for (const x of [300, 320, 340]) {
    s += `<line class="gf-arrowb" x1="${x}" x2="${x}" y1="80" y2="226" marker-end="url(#mb1)"/>`;
  }
  s += `<text class="gf-small" x="352" y="112">Cold downdraught</text>`;
  s += `<line class="gf-arrowb" x1="306" x2="196" y1="248" y2="248" marker-end="url(#mb1)"/>`;
  s += `<line class="gf-arrowb" x1="334" x2="444" y1="248" y2="248" marker-end="url(#mb1)"/>`;
  s += `<text class="gf-small" x="236" y="240" text-anchor="middle">outflow</text>`;
  s += `<text class="gf-small" x="404" y="240" text-anchor="middle">outflow</text>`;
  // Intended glide path and the actual path.
  s += `<line class="gf-dash" x1="40" y1="80" x2="620" y2="240"/>`;
  s += `<text class="gf-small" x="620" y="226" text-anchor="end">Glide path</text>`;
  s += `<path class="gf-line" d="M40,80 C110,88 150,96 170,100 C230,112 280,150 320,175 C380,210 430,228 470,242"/>`;
  const num = (x: number, y: number, n: string) =>
    `<circle class="gf-dot" cx="${x}" cy="${y}" r="10"/><text class="gf-barlabel" x="${x}" y="${y + 5}" text-anchor="middle">${n}</text>`;
  s += num(170, 100, "1") + num(320, 175, "2") + num(470, 242, "3");
  s += `<text class="gf-small" x="20" y="290">1 Headwind: speed up, floats high</text>`;
  s += `<text class="gf-small" x="250" y="290">2 Downdraught: pushed down</text>`;
  s += `<text class="gf-small" x="450" y="290">3 Tailwind: speed falls, sinks</text>`;
  return s + "</svg>";
}

/** Freezing rain: a warm layer aloft over sub-zero air, with the temperature profile beside it. */
function fzra(): string {
  const W = 620;
  const H = 290;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Freezing rain falling from a warm layer into a layer below 0 °C">`;
  s += `<rect class="gf-cloud2" x="20" y="16" width="340" height="40" rx="16"/>`;
  s += `<rect class="gf-warm" x="20" y="60" width="340" height="90"/>`;
  s += `<rect class="gf-cold" x="20" y="150" width="340" height="100"/>`;
  s += `<rect class="gf-ground" x="20" y="250" width="340" height="12"/>`;
  for (let x = 40; x <= 190; x += 30) {
    for (const y of [68, 108, 158, 214]) s += `<line class="gf-rain" x1="${x}" x2="${x - 5}" y1="${y}" y2="${y + 22}"/>`;
  }
  s += `<path class="gf-plane" d="M96,200 l40,0 l8,-6 l4,0 l-4,8 l-12,2 l-6,10 l-6,0 l2,-10 l-26,0 z"/>`;
  s += `<text class="gf-small" x="190" y="40" text-anchor="middle">Cloud</text>`;
  s += `<text class="gf-label" x="210" y="98">Warm layer</text><text class="gf-small" x="210" y="116">above 0 °C, rain</text>`;
  s += `<text class="gf-label" x="210" y="184">Cold layer</text><text class="gf-small" x="210" y="202">below 0 °C, drops</text><text class="gf-small" x="210" y="218">supercooled, clear</text><text class="gf-small" x="210" y="234">ice on contact</text>`;
  // Temperature profile.
  s += `<line class="gf-axis" x1="400" y1="250" x2="600" y2="250"/><line class="gf-axis" x1="400" y1="250" x2="400" y2="20"/>`;
  s += `<line class="gf-dash" x1="500" y1="250" x2="500" y2="20"/>`;
  s += `<path class="gf-line" d="M440,250 L560,110 L410,20"/>`;
  s += `<text class="gf-tick" x="500" y="268" text-anchor="middle">0 °C</text><text class="gf-tick" x="410" y="268">colder</text><text class="gf-tick" x="596" y="268" text-anchor="end">warmer</text>`;
  s += `<text class="gf-tick" x="500" y="286" text-anchor="middle">Temperature</text>`;
  s += `<text class="gf-small" x="520" y="214">inversion</text>`;
  return s + "</svg>";
}

/** Mountain waves downwind of a ridge, drawn from computed streamlines. */
function mtnwave(): string {
  const W = 660;
  const H = 300;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mountain waves with cap cloud, lenticular clouds and a rotor downwind of a ridge">`;
  s += head("mw1") + head("mw2", "gf-headr");
  const lines: [number, number, number][] = [[200, 85, 22], [150, 70, 28], [100, 55, 28], [55, 40, 24]];
  for (const [base, lift, amp] of lines) {
    let d = "";
    for (let x = 0; x <= W; x += 6) {
      const r = lift * Math.exp(-(((x - 230) / 60) ** 2));
      const e = x < 230 ? 0 : Math.min(1, (x - 230) / 60) * Math.exp(-(x - 375) / 900);
      const y = base - r - amp * e * Math.cos((2 * Math.PI * (x - 375)) / 150);
      d += `${x ? "L" : "M"}${f(x)},${f(y)} `;
    }
    s += `<path class="gf-iso" d="${d}"/>`;
  }
  s += `<path class="gf-ground" d="M0,270 L150,270 L230,140 L300,270 L${W},270 L${W},290 L0,290 Z"/>`;
  s += `<ellipse class="gf-cloud" cx="232" cy="128" rx="38" ry="15"/>`;
  s += `<text class="gf-small" x="286" y="134">Cap cloud</text>`;
  for (const x of [375, 525]) s += `<ellipse class="gf-cloud" cx="${x}" cy="72" rx="38" ry="8"/>`;
  s += `<ellipse class="gf-cloud" cx="375" cy="30" rx="30" ry="6"/>`;
  s += `<text class="gf-small" x="450" y="60" text-anchor="middle">Lenticular</text>`;
  s += `<ellipse class="gf-cloud2" cx="375" cy="210" rx="30" ry="15"/>`;
  s += `<path class="gf-arrowr" d="M352,232 C326,214 344,186 372,188 C398,190 412,208 400,226" fill="none" marker-end="url(#mw2)"/>`;
  s += `<text class="gf-small" x="375" y="256" text-anchor="middle">Rotor: severe turbulence</text>`;
  s += `<line class="gf-arrow" x1="16" x2="96" y1="244" y2="244" marker-end="url(#mw1)"/>`;
  s += `<text class="gf-small" x="16" y="236">Wind</text>`;
  return s + "</svg>";
}

/** A night radiation inversion: temperature profile and the wind above and below it. */
function inversion(): string {
  const W = 620;
  const H = 290;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Night inversion with calm foggy air below and strong wind above">`;
  s += head("iv1", "gf-headb");
  s += `<rect class="gf-fog" x="40" y="222" width="560" height="28"/>`;
  s += `<rect class="gf-ground" x="40" y="250" width="560" height="10"/>`;
  s += `<line class="gf-axis" x1="80" y1="250" x2="80" y2="20"/><line class="gf-axis" x1="80" y1="250" x2="320" y2="250"/>`;
  s += `<path class="gf-line" d="M130,250 L215,180 L120,30"/>`;
  s += `<line class="gf-dash" x1="80" x2="600" y1="180" y2="180"/>`;
  s += `<text class="gf-small" x="600" y="174" text-anchor="end">Top of the inversion: windshear</text>`;
  s += `<text class="gf-small" x="88" y="200">Inversion:</text><text class="gf-small" x="88" y="216">warmer with height</text>`;
  s += `<text class="gf-small" x="178" y="100">Above: colder with height</text>`;
  s += `<text class="gf-tick" x="200" y="276" text-anchor="middle">Temperature</text>`;
  s += `<text class="gf-tick" x="66" y="135" transform="rotate(-90 66 135)" text-anchor="middle">Height</text>`;
  const wind: [number, number][] = [[238, 18], [206, 24], [156, 120], [118, 140], [70, 140]];
  for (const [y, len] of wind) {
    s += `<line class="gf-arrowb" x1="380" x2="${380 + len}" y1="${y}" y2="${y}" marker-end="url(#iv1)"/>`;
  }
  s += `<text class="gf-small" x="380" y="56">Strong wind above</text>`;
  s += `<text class="gf-small" x="330" y="280">Calm below: fog, haze, smoke trapped</text>`;
  return s + "</svg>";
}

/** An airborne weather radar picture: range rings, a cell with colour bands, a hook echo and a colour key. */
function radar(): string {
  const W = 640;
  const H = 300;
  const ox = 230;
  const oy = 285;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weather radar display with green, yellow, red and magenta echoes and a hook shaped echo">`;
  for (const r of [80, 160, 220]) {
    s += `<path class="gf-dash" fill="none" d="M${ox - r},${oy} A${r},${r} 0 0 1 ${ox + r},${oy}"/>`;
    s += `<text class="gf-tick" x="${ox + r + 4}" y="${oy - 4}">${r / 2} nm</text>`;
  }
  s += `<path class="gf-plane" d="M${ox},${oy - 16} l-8,14 l16,0 z"/>`;
  // A cell with the classic nested colour bands.
  s += `<ellipse class="gf-rgreen" cx="170" cy="140" rx="56" ry="34"/>`;
  s += `<ellipse class="gf-ryellow" cx="174" cy="138" rx="38" ry="23"/>`;
  s += `<ellipse class="gf-rred" cx="178" cy="136" rx="22" ry="14"/>`;
  s += `<ellipse class="gf-rmag" cx="180" cy="135" rx="9" ry="6"/>`;
  s += `<text class="gf-small" x="170" y="92" text-anchor="middle">Steep colour change</text>`;
  // A hook echo.
  s += `<ellipse class="gf-rgreen" cx="320" cy="118" rx="48" ry="28"/>`;
  s += `<path class="gf-rred" d="M300,112 C304,92 342,90 348,112 C352,132 330,142 318,132 C330,130 338,120 332,110 C324,102 310,106 306,116 Z"/>`;
  s += `<text class="gf-small" x="320" y="170" text-anchor="middle">Hook: avoid</text>`;
  // Colour key.
  const key: [string, string][] = [["gf-rgreen", "Green: light"], ["gf-ryellow", "Yellow: moderate"], ["gf-rred", "Red: heavy"], ["gf-rmag", "Magenta: extreme"]];
  key.forEach(([cls, label], i) => {
    const y = 180 + i * 26;
    s += `<rect class="${cls}" x="470" y="${y - 12}" width="16" height="16" rx="3"/><text class="gf-small" x="494" y="${y}">${label}</text>`;
  });
  return s + "</svg>";
}

/** Wind barbs for a set of example winds. */
function windbarbs(): string {
  const W = 660;
  const H = 210;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wind barb examples from calm to 65 knots">`;
  const L = 46;
  const barb = (cx: number, cy: number, dir: number, kt: number) => {
    let g = "";
    if (kt === 0) {
      return `<circle class="gf-iso" cx="${cx}" cy="${cy}" r="6"/><circle class="gf-iso" cx="${cx}" cy="${cy}" r="11"/>`;
    }
    const a = (dir * Math.PI) / 180;
    const u = [Math.sin(a), -Math.cos(a)];
    const p = [-u[1], u[0]];
    const ex = cx + u[0] * L;
    const ey = cy + u[1] * L;
    g += `<circle class="gf-iso" cx="${cx}" cy="${cy}" r="6"/>`;
    g += `<line class="gf-iso" x1="${f(cx + u[0] * 6)}" y1="${f(cy + u[1] * 6)}" x2="${f(ex)}" y2="${f(ey)}"/>`;
    let left = kt;
    let at = 0;
    const pt = (k: number) => [ex - u[0] * k, ey - u[1] * k];
    while (left >= 50) {
      const [x1, y1] = pt(at);
      const [x2, y2] = pt(at + 8);
      g += `<path class="gf-plane" d="M${f(x1)},${f(y1)} L${f(x1 + p[0] * 16)},${f(y1 + p[1] * 16)} L${f(x2)},${f(y2)} Z"/>`;
      at += 11;
      left -= 50;
    }
    while (left >= 10) {
      const [x1, y1] = pt(at);
      g += `<line class="gf-iso" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x1 + p[0] * 16 + u[0] * 5)}" y2="${f(y1 + p[1] * 16 + u[1] * 5)}"/>`;
      at += 7;
      left -= 10;
    }
    if (left >= 5) {
      if (at === 0) at = 7;
      const [x1, y1] = pt(at);
      g += `<line class="gf-iso" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x1 + p[0] * 8 + u[0] * 2.5)}" y2="${f(y1 + p[1] * 8 + u[1] * 2.5)}"/>`;
    }
    return g;
  };
  const ex: [number, number, string, string][] = [
    [0, 0, "Calm", ""], [270, 5, "5 kt", "from the west"], [90, 10, "10 kt", "from the east"], [360, 15, "15 kt", "from the north"],
    [225, 25, "25 kt", "from the SW"], [270, 50, "50 kt", "from the west"], [180, 65, "65 kt", "from the south"],
  ];
  ex.forEach(([dir, kt, a, b], i) => {
    const cx = 50 + i * 94;
    s += barb(cx, 96, dir, kt);
    s += `<text class="gf-label" x="${cx}" y="174" text-anchor="middle">${a}</text>`;
    if (b) s += `<text class="gf-small" x="${cx}" y="192" text-anchor="middle">${b}</text>`;
  });
  return s + "</svg>";
}

/** A METAR laid out group by group, each with its name below. */
function metar(): string {
  const W = 680;
  const H = 200;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="A METAR split into groups with the name of each group">`;
  const rows: [string, string][][] = [
    [["METAR", "Type"], ["VABB", "Station"], ["141130Z", "Day, time UTC"], ["24012G24KT", "Wind"], ["210V280", "Variation"], ["3000", "Visibility"], ["R27/1100U", "RVR"]],
    [["TSRA", "Weather"], ["FEW015CB SCT020 BKN080", "Cloud"], ["27/24", "Temp/dew"], ["Q1006", "QNH"], ["WS R27", "Windshear"], ["TEMPO 1500 +TSRA", "Trend, 2 h"]],
  ];
  rows.forEach((row, r) => {
    const y = 30 + r * 90;
    let x = 14;
    row.forEach(([code, name], i) => {
      const w = code.length * 9.2 + 14;
      s += `<rect class="${(i + r) % 2 ? "gf-warm" : "gf-cold"}" x="${f(x)}" y="${y}" width="${f(w)}" height="30" rx="5"/>`;
      s += `<text class="gf-code" x="${f(x + w / 2)}" y="${y + 20}" text-anchor="middle">${code}</text>`;
      s += `<text class="gf-small" x="${f(x + w / 2)}" y="${y + 50}" text-anchor="middle">${name}</text>`;
      x += w + 8;
    });
  });
  return s + "</svg>";
}

/** A 30 hour TAF on a time line: main forecast, TEMPO, BECMG, PROB30 and FM. */
function tafline(): string {
  const W = 660;
  const H = 300;
  const x = (o: number) => 60 + (o * 560) / 30; // hours after 22/06 UTC
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Time line of a TAF showing TEMPO, BECMG, PROB30 and FM groups">`;
  s += `<line class="gf-axis" x1="${x(0)}" x2="${x(30)}" y1="262" y2="262"/>`;
  const ticks: [number, string][] = [[0, "22/06"], [6, "22/12"], [12, "22/18"], [18, "23/00"], [24, "23/06"], [30, "23/12"]];
  for (const [o, t] of ticks) {
    s += `<line class="gf-axis" x1="${f(x(o))}" x2="${f(x(o))}" y1="262" y2="268"/><text class="gf-tick" x="${f(x(o))}" y="282" text-anchor="middle">${t}</text>`;
  }
  s += `<text class="gf-tick" x="${x(15)}" y="298" text-anchor="middle">Day/hour UTC</text>`;
  // Main forecast, replaced by the FM group at 23/03.
  s += `<rect class="gf-cold" x="${f(x(0))}" y="40" width="${f(x(21) - x(0))}" height="26"/>`;
  s += `<text class="gf-small" x="${f(x(0) + 8)}" y="58">Main forecast: 6 km, SCT020 BKN080</text>`;
  s += `<rect class="gf-warm" x="${f(x(21))}" y="40" width="${f(x(30) - x(21))}" height="26"/>`;
  s += `<text class="gf-small" x="${f(x(21) + 8)}" y="58">New forecast</text>`;
  // TEMPO: short spells inside the period.
  s += `<rect class="gf-cellbox" x="${f(x(4))}" y="95" width="${f(x(8) - x(4))}" height="26"/>`;
  for (const [a, b] of [[4.3, 4.9], [5.6, 6.2], [7.0, 7.6]]) {
    s += `<rect class="gf-danger" x="${f(x(a))}" y="97" width="${f(x(b) - x(a))}" height="22"/>`;
  }
  s += `<text class="gf-small" x="${f(x(4) - 8)}" y="113" text-anchor="end">TEMPO 2210/2214</text>`;
  s += `<text class="gf-small" x="${f(x(8) + 8)}" y="113">short spells of TSRA, each under 1 hour</text>`;
  // BECMG: gradual change, then it holds.
  s += `<rect class="gf-cellbox" x="${f(x(10))}" y="150" width="${f(x(12) - x(10))}" height="26"/>`;
  s += `<path class="gf-coldsurf" d="M${f(x(10))},176 L${f(x(12))},150 L${f(x(21))},150 L${f(x(21))},176 Z"/>`;
  s += `<text class="gf-small" x="${f(x(10) - 8)}" y="168" text-anchor="end">BECMG 2216/2218: gradual change</text>`;
  s += `<text class="gf-small" x="${f(x(12) + 8)}" y="168">then it holds</text>`;
  // PROB30.
  s += `<rect class="gf-veil" x="${f(x(16))}" y="205" width="${f(x(20) - x(16))}" height="26"/>`;
  s += `<rect class="gf-cellbox" x="${f(x(16))}" y="205" width="${f(x(20) - x(16))}" height="26"/>`;
  s += `<text class="gf-small" x="${f(x(16) - 8)}" y="223" text-anchor="end">PROB30 2222/2302: 30% chance of fog</text>`;
  // FM: everything changes at once.
  s += `<line class="gf-arrowr" x1="${f(x(21))}" x2="${f(x(21))}" y1="30" y2="262"/>`;
  s += `<text class="gf-small" x="${f(x(21) + 6)}" y="24">FM230300: all replaced</text>`;
  return s + "</svg>";
}

export const FIGURES: Record<string, () => string> = {
  layers, tropopause, isa, composition, diurnal, saturation, columns, systems, altimetry, hightolow,
  geostrophic, friction, seabreeze, foehn, stability, lifting, clouds,
  slantvis, fogtypes, fronts, depression, tcsection, tctrack, threecell, jetsection, calendar, wdpass, monsoon,
  tscell, microburst, fzra, mtnwave, inversion, radar, windbarbs, metar, tafline,
};
