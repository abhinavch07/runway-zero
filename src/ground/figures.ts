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

export const FIGURES: Record<string, () => string> = {
  layers, tropopause, isa, composition, diurnal, saturation, columns, systems, altimetry, hightolow,
  geostrophic, friction, seabreeze, foehn, stability, lifting, clouds,
};
