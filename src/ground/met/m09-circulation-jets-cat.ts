// Meteorology Module 9: General Circulation, Jet Streams and CAT. CAR Sec 7 Series B Part IV, Appendix B 1.2 c, d.
// Written fresh for Runway Zero. Jet stream definition follows WMO (core speed 60 kt or more).
import type { Module } from "../types.ts";

export const M09: Module = {
  n: 9,
  title: "General Circulation, Jet Streams and CAT",
  car: "1.2 c, d",
  summary:
    "Why the atmosphere circulates, the three cell model with its pressure belts and wind belts, the ITCZ, the main jet streams that affect India (subtropical, tropical easterly, polar front and the low level monsoon jet), and clear air turbulence: where to expect it and what to do.",
  sections: [
    {
      id: "why",
      title: "Why the air circulates",
      blocks: [
        {
          t: "p",
          text: "Over a year, the tropics receive more heat from the sun than they lose, and the polar regions lose more than they receive. If nothing moved heat around, the tropics would keep getting hotter and the poles colder. The **winds and ocean currents carry the extra heat towards the poles**. The large, long term pattern of these winds is the **general circulation**.",
        },
      ],
    },
    {
      id: "cells",
      title: "The three cell model",
      blocks: [
        { t: "figure", key: "threecell", caption: "Three cell model and surface wind belts, northern hemisphere." },
        {
          t: "table",
          head: ["Cell", "Latitudes", "How it works"],
          rows: [
            ["**Hadley cell**", "Equator to about 30°", "Hot air **rises at the equator**, flows polewards high up, **sinks at about 30°**, and returns towards the equator along the surface as the **trade winds**"],
            ["**Ferrel cell**", "About 30° to 60°", "Driven by the other two. Surface air flows polewards as the **westerlies** and rises at about 60°"],
            ["**Polar cell**", "About 60° to the pole", "Cold air **sinks at the pole** and flows out along the surface as the **polar easterlies**"],
          ],
        },
        {
          t: "table",
          head: ["Surface belt", "Latitude", "What you find"],
          rows: [
            ["**Doldrums / equatorial trough**", "Near the equator", "Rising air, light and variable winds, CB, heavy showers. The **ITCZ** lies here"],
            ["**Trade winds**", "About 5° to 30°", "Steady **north easterlies in the NH**, **south easterlies in the SH**. Strongest in the lower troposphere over the oceans"],
            ["**Horse latitudes (subtropical highs)**", "About 30°", "Sinking air, calms, clear skies, deserts"],
            ["**Westerlies**", "About 35° to 60°", "Changeable, with depressions and fronts. In the SH, strong and steady: the **Roaring Forties**"],
            ["**Polar front (subpolar low)**", "About 60°", "Where cold polar air meets mid latitude air. Depressions form here"],
            ["**Polar easterlies**", "60° to the poles", "Cold easterly winds out of the polar high"],
          ],
        },
        {
          t: "p",
          text: "The trade winds are the surface part of the sinking air from the subtropical highs, flowing back towards the equator and turned **westwards** (to their right in the NH) by the Coriolis force.",
        },
        {
          t: "p",
          text: "**Upper winds:** apart from a belt near the equator, the upper troposphere is dominated by **westerlies** (the zonal westerlies), because the poles are colder than the tropics (thermal wind, Module 4). Over the equatorial belt the upper winds are **easterly**. The whole pattern shifts north in the northern summer and south in winter, following the sun about one to two months behind it.",
        },
      ],
    },
    {
      id: "itcz",
      title: "The ITCZ",
      blocks: [
        {
          t: "p",
          text: "The **Inter Tropical Convergence Zone (ITCZ)** is the zone where the **north east trades of the NH meet the south east trades of the SH**. The converging air rises, giving lines and clusters of **CB, heavy showers and thunderstorms**. It is also called the equatorial trough. It is not one solid wall of storms: there are active stretches with heavy weather and quieter gaps.",
        },
        {
          t: "list",
          items: [
            "It **moves with the sun**, about one to two months behind, and moves much further over land than over the sea.",
            "In **July** it lies far north over India, at about **20° to 25°N**, where it merges with the **monsoon trough** along the Gangetic plains.",
            "In **January** it lies **south of the equator** over the Indian Ocean and northern Australia.",
            "Flying from India to south east Asia or Australia in the northern winter, you cross it south of the equator.",
          ],
        },
      ],
    },
    {
      id: "jets",
      title: "Jet streams",
      blocks: [
        {
          t: "p",
          text: "A **jet stream** is a fast, narrow river of wind high in the troposphere, usually just below the tropopause. WMO defines it as a core of at least **60 kt**. A typical jet is **thousands of km long, a few hundred km wide and a few km deep**, with strong wind shear around it.",
        },
        {
          t: "list",
          items: [
            "The **axis** is the line of fastest wind. The **core** is the tube of strongest wind round it. Faster patches moving along the axis are **jet streaks**.",
            "**Cause**: a strong **temperature contrast** across a narrow zone. The thermal wind builds up with height and peaks near the tropopause. The bigger the contrast, the stronger the jet, so **jets are stronger in winter**.",
            "Jets sit near the **breaks in the tropopause** (Module 1).",
            "Vertical shear near the core is about 5 m/s per km (about 3 kt per 1000 ft) or more. **Vertical shear is much stronger than horizontal shear** for the same distance.",
            "Core speeds of 100 to 200 kt are common in winter.",
          ],
        },
        { t: "figure", key: "jetsection", caption: "Cross section through a mid latitude jet stream, looking downstream (NH)." },
        {
          t: "table",
          head: ["Jet", "Height", "Where and when", "Speed"],
          rows: [
            ["**Subtropical jet (STJ)**, westerly", "About **12 km (40,000 ft)**, 200 hPa", "Near 30°. Over **north India from October to May**, mean position about **27°N**, furthest south (about 22°N) in **February**. Moves north of the Himalayas in summer", "Mean about 100 kt, at times 200 kt. **Strongest in winter**"],
            ["**Polar front jet (PFJ)**, westerly", "About 9 to 12 km (30,000 to 39,000 ft), 250 to 300 hPa", "Above the polar front, 40° to 60°, wavy and broken. **Further south and stronger in winter**", "Often 80 to 150 kt"],
            ["**Tropical easterly jet (TEJ)**", "About **15 to 16 km (50,000 ft)**, 100 to 150 hPa", "**Over south India and the Arabian Sea in June to August**, near **10° to 15°N**. Only over Asia and Africa", "60 to 100 kt, at times more"],
            ["**Low level (Somali) jet**", "**1 to 3 km**", "Along the coast of East Africa and across the Arabian Sea to India's west coast in the **south west monsoon**", "40 to 60 kt. Feeds the monsoon"],
            ["**Polar night jet**", "Stratosphere, about 25 km", "Over the winter pole", "Strong westerly"],
          ],
        },
        {
          t: "list",
          items: [
            "The **STJ** is the most constant jet of the NH, present all year in some form. Over India it is a winter feature.",
            "During the **monsoon**, the temperature contrast reverses (Tibet and north India are hottest), so the upper winds over India turn **easterly**: at 30,000 ft they are **easterly**, and the TEJ blows above.",
            "**Cloud signs**: long bands or streaks of **cirrus on the warm (equatorward) side** of the jet, often with a sharp poleward edge along the jet axis.",
            "A strong STJ moving south with a western disturbance helps trigger severe thunderstorms over north India. Divergence near jet streaks favours rising air below.",
          ],
        },
        {
          t: "p",
          text: "**Flying with jets:** eastbound across north India in winter, a jet can add 100 kt or more of tailwind. Westbound, routes and levels are chosen to avoid its core. Changing level by a few thousand feet, or moving to one side of the axis, often cuts the headwind a lot.",
        },
      ],
    },
    {
      id: "cat",
      title: "Clear air turbulence (CAT)",
      blocks: [
        {
          t: "p",
          text: "**CAT** is turbulence met **in clear air at high levels**, not caused by convection, usually **above about 20,000 ft** and near the tropopause. It gives no warning on weather radar and often none to the eye, which makes it dangerous to unbelted passengers and crew.",
        },
        {
          t: "p",
          text: "**Cause:** strong **wind shear**, mainly vertical shear. Layers of air sliding past each other at very different speeds roll up into large eddies, like waves breaking on a beach.",
        },
        {
          t: "list",
          items: [
            "Near **jet streams**, especially on the **cold (low pressure) side, just below the core**, and also above it. Looking downstream in the NH, the cold side is on the **left**. CAT is on the edges of the jet, not in the core itself.",
            "Where the jet is **strong, changing fast or sharply curved**, as round a deep upper trough or ridge.",
            "Near the **tropopause** and upper frontal zones with strong temperature contrast.",
            "Above and downwind of **mountain ranges** with strong winds (mountain waves reaching high levels), and near the tops of **CBs**.",
            "Rough guide: vertical shear of about **5 to 6 kt per 1000 ft or more** makes CAT likely.",
          ],
        },
        {
          t: "list",
          items: [
            "Over India, CAT is most common over **north India in winter** (with the STJ, worst from December to February) and over **south India in July and August** (with the TEJ). Western disturbances and the Himalayas add to it.",
            "Forecast CAT is shown on **significant weather (SIGWX) charts**. Severe CAT reported by aircraft leads the Met office to issue a **SIGMET**.",
            "If you meet CAT: **seat belt signs on**, slow to the **turbulence penetration speed**, and change level (often by a few thousand feet) or move away from the jet core, preferably towards the warm side. Report it to ATC.",
          ],
        },
      ],
    },
    {
      id: "exam",
      title: "Remember for the exam",
      blocks: [
        {
          t: "remember",
          items: [
            "Circulation carries heat from the tropics to the poles.",
            "**Hadley** (0 to 30°), **Ferrel** (30 to 60°), **Polar** (60 to 90°).",
            "Doldrums at the equator, **trades** 5 to 30° (**NE in NH, SE in SH**, strongest low down over the oceans), horse latitudes at 30°, **westerlies** 35 to 60°, polar front at 60°, polar easterlies.",
            "Trades: air from the subtropical highs going to the equator, **turned west** by Coriolis.",
            "Upper troposphere: mostly **westerly**, easterly over the equatorial belt.",
            "**ITCZ**: where the **NE and SE trades meet**. CB, heavy showers. Moves with the sun. **July about 20 to 25°N over India**, January south of the equator.",
            "Jet: core **60 kt or more** (WMO), long, narrow, shallow. Cause: **strong temperature contrast**. **Stronger in winter.**",
            "Vertical shear in a jet is **stronger** than horizontal shear.",
            "**STJ**: about **12 km, 27°N over India, October to May**, southernmost in **February**, strongest in winter, **most constant jet**.",
            "**PFJ**: moves **south and strengthens in winter**.",
            "**TEJ**: easterly, **15 to 16 km, about 13°N over south India, June to August**. Monsoon upper winds over India are **easterly**.",
            "**Somali low level jet**: 1 to 3 km, feeds the monsoon.",
            "Jet cirrus on the **warm side**.",
            "**CAT**: clear air, high levels, **wind shear**. Worst on the **cold side, just below the jet core**, at the edges, not in the core.",
            "India: CAT over **north India in winter** (STJ), south India in July and August (TEJ).",
            "CAT on **SIGWX charts**. Severe CAT reports lead to a **SIGMET**.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "Why the air moves", points: ["Tropics gain heat, poles lose it", "Winds and currents carry heat polewards", "The long term pattern is the general circulation"] },
    { title: "Three cells", points: ["**Hadley**: rises at the equator, sinks at 30°", "**Ferrel**: 30° to 60°", "**Polar**: sinks at the pole", "Surface winds: trades, westerlies, polar easterlies"], figure: "threecell" },
    { title: "Wind belts", points: ["Doldrums: calm, CB", "**Trades**: NE in NH, SE in SH", "Horse latitudes at 30°: deserts", "Westerlies 35° to 60°, Roaring Forties in the SH"] },
    { title: "The ITCZ", points: ["Where the **NE and SE trades meet**", "CB, heavy showers, active and quiet stretches", "Follows the sun: **July 20 to 25°N** over India", "January south of the equator"] },
    { title: "Jet streams", points: ["Core **60 kt or more**", "Thousands of km long, hundreds wide, a few km deep", "Caused by strong **temperature contrast**", "**Stronger in winter**"], figure: "jetsection" },
    { title: "India's jets", points: ["**STJ**: 12 km, 27°N, October to May, westerly", "**TEJ**: 15 to 16 km, 13°N, June to August, easterly", "**Somali jet**: 1 to 3 km, feeds the monsoon", "PFJ: further north, south in winter"] },
    { title: "Jet signs and flying", points: ["**Cirrus** bands on the warm side", "Big tailwinds eastbound in winter", "Change level or move aside to escape headwinds", "Monsoon upper winds over India are **easterly**"] },
    { title: "Clear air turbulence", points: ["Clear air, high levels, **wind shear**", "Worst on the **cold side, below the core**", "Also near the tropopause, mountains, CB tops", "Rough guide: 5 to 6 kt per 1000 ft shear"] },
    { title: "CAT over India", points: ["**North India in winter** with the STJ", "South India in July and August with the TEJ", "Shown on SIGWX charts, severe reports bring a SIGMET", "Belts on, slow down, change level, report it"] },
  ],
  mcqs: [
    { id: "m9-01", q: "The main reason for the general circulation of the atmosphere is:", options: ["The earth's magnetic field", "Unequal heating, with surplus in the tropics and deficit at the poles", "The tides", "Mountains"], answer: 1, why: "Winds carry the tropics' extra heat towards the poles." },
    { id: "m9-02", q: "In the Hadley cell, air rises near the equator and sinks at about:", options: ["10°", "30°", "60°", "90°"], answer: 1, why: "The sinking branch at about 30° forms the subtropical highs." },
    { id: "m9-03", q: "Air sinking in the subtropical highs flows back towards the equator near the surface and is turned west by Coriolis in the NH. This wind is the:", options: ["Westerlies", "Polar easterlies", "Trade winds", "Roaring Forties"], answer: 2, why: "These are the north east trades in the NH and the south east trades in the SH." },
    { id: "m9-04", q: "The trade winds in the northern hemisphere blow from the:", options: ["North east", "South west", "North west", "South east"], answer: 0, why: "Air flowing towards the equator is turned to its right in the NH, so it comes from the north east." },
    { id: "m9-05", q: "The trade winds are most prominent:", options: ["In the upper troposphere over land", "In the lower troposphere over the oceans", "In the lower troposphere over land", "In the stratosphere"], answer: 1, why: "They are steadiest and strongest near the surface over the open oceans." },
    { id: "m9-06", q: "The belt of calms and light variable winds near the equator is called the:", options: ["Horse latitudes", "Doldrums", "Roaring Forties", "Polar front"], answer: 1, why: "The doldrums are where the trades meet and air rises. The horse latitudes are the calms of the subtropical highs." },
    { id: "m9-07", q: "The \"Roaring Forties\" are:", options: ["Strong easterlies in the NH", "Strong westerlies in the southern hemisphere around 40° to 50°S", "Jet streams at 40,000 ft", "Thunderstorms at 40°N"], answer: 1, why: "With little land to slow them, the southern westerlies are strong and steady." },
    { id: "m9-08", q: "Away from the equator, which way do the upper tropospheric winds mostly blow?", options: ["Easterly", "Westerly", "Northerly", "Variable"], answer: 1, why: "The poles are colder than the tropics, so the thermal wind is westerly and grows with height." },
    { id: "m9-09", q: "The boundary between the trade winds of the NH and the SH is called the:", options: ["Warm front", "Occluded front", "Inter Tropical Convergence Zone (ITCZ)", "Polar front"], answer: 2, why: "The NE and SE trades converge at the ITCZ, where air rises." },
    { id: "m9-10", q: "The typical weather of the ITCZ is:", options: ["Clear skies and calm", "Fog and drizzle", "Lines of CB with heavy showers and thunderstorms", "Dust storms"], answer: 2, why: "Strong convergence makes air rise, building big convective clouds in active stretches." },
    { id: "m9-11", q: "During the year, the ITCZ:", options: ["Does not move", "Always stays north of the equator", "Shifts north and south with the sun, a month or two behind", "Moves east and west"], answer: 2, why: "It follows the sun one to two months behind, moving further over land than over the sea." },
    { id: "m9-12", q: "In July the ITCZ over India lies at about:", options: ["The equator", "10°S", "20° to 25°N, merging with the monsoon trough", "40°N"], answer: 2, why: "Strong heating of Asia pulls it far north, where it becomes the monsoon trough over the Gangetic plains." },
    { id: "m9-13", q: "By WMO definition, a jet stream has a core wind speed of at least:", options: ["30 kt", "60 kt", "100 kt", "150 kt"], answer: 1, why: "WMO set 30 m/s, about 60 kt, as the lower limit." },
    { id: "m9-14", q: "The main cause of a jet stream is:", options: ["Mountains", "A strong horizontal temperature contrast", "Thunderstorms", "The earth's magnetic field"], answer: 1, why: "A strong temperature gradient builds a strong thermal wind that peaks near the tropopause." },
    { id: "m9-15", q: "A typical jet stream is:", options: ["Hundreds of km long and thousands of km wide", "Thousands of km long, hundreds of km wide and a few km deep", "A few km long", "As deep as the troposphere"], answer: 1, why: "It is long, fairly narrow and shallow, like a flattened tube." },
    { id: "m9-16", q: "In a jet stream, how does vertical shear compare with horizontal shear over the same distance?", options: ["Weaker", "Stronger", "The same", "Zero"], answer: 1, why: "Over the same distance, wind changes far more with height than sideways. That is why vertical shear causes most CAT." },
    { id: "m9-17", q: "Jet streams in the NH are normally:", options: ["Stronger and further south in winter", "Stronger and further north in winter", "Weaker in winter", "The same all year"], answer: 0, why: "The pole to equator temperature contrast is greatest in winter, and the belts shift south." },
    { id: "m9-18", q: "How does the polar front jet in the NH winter differ from summer?", options: ["Moves south and speeds up", "Moves north and speeds up", "Moves north and slows down", "Disappears"], answer: 0, why: "Winter brings a stronger temperature contrast and pushes the belts south." },
    { id: "m9-19", q: "The jet stream that blows most constantly through the NH is the:", options: ["Arctic jet", "Polar night jet", "Subtropical jet", "Tropical easterly jet"], answer: 2, why: "The STJ is present in some form all year, though it shifts north in summer." },
    { id: "m9-20", q: "Over India, the subtropical jet stream is found mainly in:", options: ["October to May", "June to September", "July only", "All year at 10°N"], answer: 0, why: "It lies over north India from October to May and moves north of the Himalayas in the monsoon." },
    { id: "m9-21", q: "The mean position and height of the subtropical jet over India in winter is about:", options: ["13°N at 16 km", "5°N at 3 km", "45°N at 9 km", "27°N at 12 km"], answer: 3, why: "About 27°N and 12 km (40,000 ft), near the 200 hPa level." },
    { id: "m9-22", q: "The subtropical jet reaches its southernmost position over India in:", options: ["October", "December", "February", "May"], answer: 2, why: "It is furthest south, around 22°N, in February, and strongest in January and February." },
    { id: "m9-23", q: "The tropical easterly jet over India blows at about:", options: ["3 km", "9 km", "15 to 16 km", "25 km"], answer: 2, why: "The TEJ is near 100 to 150 hPa, about 15 to 16 km, just below the high tropical tropopause." },
    { id: "m9-24", q: "The tropical easterly jet prevails over the Indian peninsula during:", options: ["June to August", "December to February", "March to May", "October and November"], answer: 0, why: "It is a monsoon feature, strongest in July and August, at about 13°N." },
    { id: "m9-25", q: "Easterly jet streams are found mainly in:", options: ["The NH in winter", "The SH in winter", "Polar regions all year", "The tropics in the NH summer"], answer: 3, why: "The TEJ forms over Asia and Africa during the northern summer monsoon." },
    { id: "m9-26", q: "During the south west monsoon, the upper winds at 30,000 ft over most of India are:", options: ["Westerly", "South westerly", "Southerly", "Easterly"], answer: 3, why: "In summer the temperature contrast reverses (north is hotter), so upper winds over India turn easterly." },
    { id: "m9-27", q: "The low level jet that feeds the monsoon, along East Africa and across the Arabian Sea, is at a height of about:", options: ["1 to 3 km", "12 km", "16 km", "25 km"], answer: 0, why: "The Somali jet blows strongly between about 1 and 3 km during the south west monsoon." },
    { id: "m9-28", q: "Bands of cirrus associated with a jet stream are usually found:", options: ["On the cold (poleward) side", "Below 10,000 ft", "Only at the core", "On the warm (equatorward) side"], answer: 3, why: "Cirrus streaks lie on the warm side, often with a sharp edge along the axis." },
    { id: "m9-29", q: "The jet stream core is usually found:", options: ["Just below the tropopause", "Just above the ground", "High in the stratosphere", "At the freezing level"], answer: 0, why: "The thermal wind peaks just below the tropopause, so the core is there." },
    { id: "m9-30", q: "Clear air turbulence is best described as:", options: ["Turbulence in CB clouds", "Turbulence near the ground on hot days", "Turbulence in clear air at high levels, not due to convection", "Wake turbulence behind aircraft"], answer: 2, why: "CAT occurs in cloud free air, mostly high up, and is caused by wind shear." },
    { id: "m9-31", q: "The main cause of CAT is:", options: ["Strong wind shear, especially vertical shear", "Surface heating", "Icing", "Low pressure"], answer: 0, why: "Layers of air moving at very different speeds roll up into eddies." },
    { id: "m9-32", q: "CAT is often encountered:", options: ["In the core of the jet stream", "Only inside cloud", "Only below 5,000 ft", "At the boundary (edges) of a jet stream"], answer: 3, why: "The shear is strongest round the edges of the jet, not in the core itself." },
    { id: "m9-33", q: "The worst CAT associated with a jet stream is usually found:", options: ["On the warm side above the core", "In the centre of the core", "On the cold (low pressure) side, just below the core", "Far below the jet near the ground"], answer: 2, why: "The strongest shear is on the cold side, just below the core, with a second area above it." },
    { id: "m9-34", q: "In the northern hemisphere, looking downstream along a jet stream, the cold side with the most CAT is on the:", options: ["Right", "Directly ahead", "Above", "Left"], answer: 3, why: "With your back to the wind in the NH, low pressure (cold air) is on your left." },
    { id: "m9-35", q: "Over north India, CAT in the upper troposphere is most common during:", options: ["Active monsoon", "Weak monsoon", "October only", "Winter"], answer: 3, why: "The subtropical jet lies over north India in winter, with strong shear around it." },
    { id: "m9-36", q: "Where would you find forecast information on icing and CAT for a route?", options: ["The 500 hPa chart", "The 300 hPa chart", "The surface analysis chart", "The significant weather chart"], answer: 3, why: "SIGWX charts show forecast CAT, icing, CB, jets and the tropopause." },
    { id: "m9-37", q: "An aircraft reports severe CAT to ATC. The Met office will normally issue a:", options: ["SIGMET", "SPECI", "TAF", "METAR"], answer: 0, why: "Severe turbulence is one of the hazards for which a SIGMET is issued to warn other aircraft." },
    { id: "m9-38", q: "A reasonable action on meeting moderate CAT en route is to:", options: ["Climb as fast as possible at high speed", "Increase speed through it", "Turn back immediately in every case", "Slow to turbulence speed, belts on, and change level or move away from the jet core"], answer: 3, why: "Reducing speed limits structural load. Changing level by a few thousand feet often finds smoother air." },
  ],
};
