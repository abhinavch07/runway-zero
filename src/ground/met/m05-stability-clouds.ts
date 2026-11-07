// Meteorology Module 5: Vertical Motion, Stability and Clouds. CAR Sec 7 Series B Part IV, Appendix B 1.3 and 1.4 a.
// Written fresh for Runway Zero. Cloud names and heights follow the WMO International Cloud Atlas.
import type { Module } from "../types.ts";

export const M05: Module = {
  n: 5,
  title: "Vertical Motion, Stability and Clouds",
  car: "1.3, 1.4 a",
  summary:
    "Why rising air cools, the dry and saturated adiabatic lapse rates, how to tell stable from unstable air, the four ways air is made to rise, and all ten cloud types with their heights, looks and hazards.",
  sections: [
    {
      id: "adiabatic",
      title: "Rising air cools: adiabatic change",
      blocks: [
        {
          t: "p",
          text: "Air conducts heat badly, so a rising or sinking bubble of air (a **parcel**) hardly swaps heat with the air around it. When it rises, pressure on it drops, it **expands and cools**. When it sinks, it is **squeezed and warms**. A change of temperature with no heat added or removed is called **adiabatic**.",
        },
        {
          t: "table",
          head: ["Rate", "Value", "When"],
          rows: [
            ["**Dry adiabatic lapse rate (DALR)**", "**9.8 °C per km = 3 °C per 1000 ft**. Fixed", "Unsaturated air rising or sinking"],
            ["**Saturated adiabatic lapse rate (SALR)**", "About **5 to 6 °C per km = 1.5 °C per 1000 ft** near the ground. Varies", "Saturated air (in cloud) rising"],
            ["**Environmental lapse rate (ELR)**", "Whatever it is today. ISA average 6.5 °C per km", "The real air around the parcel"],
          ],
        },
        {
          t: "p",
          text: "**Why SALR is smaller than DALR:** as saturated air rises and cools, water vapour condenses and **releases latent heat**, which makes up for part of the cooling. In warm, moist tropical air a lot of vapour condenses, so SALR is small (as low as 4 °C per km). Very high up, where it is colder than about -40 °C, there is hardly any vapour left, so **SALR gets close to DALR**.",
        },
        {
          t: "p",
          text: "The DALR and SALR are what a **rising parcel** does. The ELR is what the **surrounding air** is like. Comparing them tells you whether the parcel keeps going up.",
        },
        {
          t: "example",
          title: "A dry parcel at 35 °C at the surface is lifted 1 km. How warm is it now?",
          steps: ["Dry air cools at the DALR, about 10 °C per km", "35 - 10 = **25 °C**"],
        },
        {
          t: "example",
          title: "Temperature +8 °C at an aerodrome of elevation 1,350 ft. With ISA lapse rate, where is the freezing level?",
          steps: ["ISA lapse rate is 2 °C per 1000 ft", "To lose 8 °C you climb 8 ÷ 2 = 4,000 ft", "Freezing level = 1,350 + 4,000 = **5,350 ft AMSL**"],
        },
      ],
    },
    {
      id: "stability",
      title: "Stable, unstable and neutral air",
      blocks: [
        {
          t: "p",
          text: "Give a parcel a small push upwards. If it ends up **colder** than the air around it, it is heavier and **sinks back**: the air is **stable**. If it ends up **warmer**, it is lighter and **keeps rising**: the air is **unstable**. If it ends up at the same temperature, it stays put: **neutral**.",
        },
        { t: "figure", key: "stability", caption: "Compare the ELR with the DALR and SALR to find the stability." },
        {
          t: "table",
          head: ["ELR compared with DALR and SALR", "Stability"],
          rows: [
            ["**ELR less than SALR** (including isothermal and inversion)", "**Absolutely stable**, for dry and saturated air"],
            ["**ELR more than DALR**", "**Absolutely unstable**, for dry and saturated air"],
            ["**SALR less than ELR less than DALR**", "**Conditionally unstable**: stable if dry, unstable if saturated"],
            ["ELR equal to DALR", "Neutral for dry air"],
            ["ELR equal to SALR", "Neutral for saturated air"],
          ],
        },
        {
          t: "tip",
          text: "**The steeper the ELR, the less stable the air.** A fast drop of temperature with height lets a warm parcel stay warmer than its surroundings. An inversion is the most stable of all.",
        },
        {
          t: "p",
          text: "Most of the time the real ELR lies **between the SALR and the DALR**, so the air is **conditionally unstable**. Lift it until it saturates and forms cloud, and it can take off on its own into cumulus or CB. A lapse rate steeper than the DALR (super-adiabatic) is found only near very hot ground on sunny afternoons.",
        },
        {
          t: "p",
          text: "**Potential (convective) instability**: a layer that is **moist at the bottom and dry at the top** may be stable now, but if the whole layer is lifted (by a front or hills) the bottom saturates first and cools slowly while the top cools fast. The layer becomes unstable, and CBs can grow hidden inside layer cloud. These **embedded CBs** are a known danger at warm fronts.",
        },
        {
          t: "table",
          head: ["Stable air", "Unstable air"],
          rows: [
            ["**Layer cloud** (stratus, stratiform)", "**Heap cloud** (cumulus, CB)"],
            ["Steady, continuous rain or drizzle", "Showers, thunderstorms, hail"],
            ["**Poor visibility**: haze, smoke and fog are trapped", "**Good visibility** except in showers"],
            ["**Smooth flying**", "**Bumpy, gusty**, strong up and down draughts"],
            ["Steady wind", "Gusty wind"],
          ],
        },
        {
          t: "p",
          text: "Stability is decided by the **environmental lapse rate** on the day. It is measured with a **radiosonde** and plotted on a thermodynamic chart (in India the **tephigram**). On it, the DALR from the temperature, the SALR from the wet bulb and the mixing ratio line from the dew point all meet at one point, the **Normand point**. Starting from surface readings, this point is the **lifting condensation level**: the expected cloud base.",
        },
      ],
    },
    {
      id: "lifting",
      title: "How air is made to rise",
      blocks: [
        {
          t: "p",
          text: "Cloud forms when air rises and cools to its dew point. The level where this happens is the **condensation level**, the cloud base. There are four main ways to make air rise:",
        },
        { t: "figure", key: "lifting", caption: "The four ways air is lifted." },
        {
          t: "table",
          head: ["Lifting", "How", "Typical cloud"],
          rows: [
            ["**Convection** (thermal)", "Sun heats the ground, warm bubbles rise", "Cumulus by day, CB on hot afternoons"],
            ["**Orographic**", "Wind is forced up over hills and mountains", "Layer cloud or CB on the windward side, lenticular cloud downwind"],
            ["**Frontal**", "Warm air rides up over cold air at a front", "Layer cloud at warm fronts, CB at cold fronts (Module 7)"],
            ["**Convergence**", "Air flows into a low or trough and has to go up", "Widespread cloud and rain, monsoon cloud"],
          ],
        },
        {
          t: "p",
          text: "**Turbulence** (mechanical mixing) near the ground also lifts air a little and can give a sheet of low stratus or stratocumulus on a windy day.",
        },
        {
          t: "p",
          text: "**Convergence and divergence.** When more air flows into an area than out (convergence) near the ground, it must rise: lows and troughs bring cloud. When air **diverges** high up, air from below rises to replace it, the surface pressure falls and cloud forms. The opposite, **convergence aloft** with **divergence at the surface**, makes air **sink**. Sinking air warms and dries, so a **high has little cloud** because of **subsidence**.",
        },
        {
          t: "p",
          text: "**Fair weather cumulus** follows the sun. It forms in the late morning as the ground heats, grows most in the afternoon and melts away in the evening when heating stops.",
        },
      ],
    },
    {
      id: "types",
      title: "The ten cloud types",
      blocks: [
        {
          t: "p",
          text: "Clouds are named by their **shape** and their **height**. Shapes: **stratus** (layer), **cumulus** (heap), **cirrus** (wispy, of ice). **Nimbus** means rain bearing. **Alto** means medium level. There are **10 main types (genera)**.",
        },
        { t: "figure", key: "clouds", caption: "The ten cloud types by height (tropical heights)." },
        {
          t: "table",
          head: ["Level", "Base height in the tropics", "Clouds"],
          rows: [
            ["**High**", "About 20,000 to 60,000 ft (6 to 18 km)", "Cirrus (Ci), Cirrocumulus (Cc), Cirrostratus (Cs)"],
            ["**Medium**", "About 6,500 to 25,000 ft (2 to 8 km)", "Altocumulus (Ac), Altostratus (As). Nimbostratus (Ns) usually starts here and spreads down"],
            ["**Low**", "Surface to about 6,500 ft (2 km)", "Stratus (St), Stratocumulus (Sc)"],
            ["**Vertical growth**", "Base low, top can be very high", "Cumulus (Cu), Cumulonimbus (Cb)"],
          ],
        },
        {
          t: "p",
          text: "In mid latitudes, medium cloud is 6,500 to 23,000 ft and high cloud 16,500 to 45,000 ft. In polar regions everything is lower. A cloud is placed by the height of its **base**: a cloud with base at 3 km and top at 6 km is a **medium** cloud.",
        },
        {
          t: "table",
          head: ["Cloud", "Looks like", "Made of", "Weather and hazards"],
          rows: [
            ["**Cirrus (Ci)**", "White, thin, feathery strands", "Ice crystals", "No rain reaching the ground, no icing. Can be the first sign of an approaching warm front or jet stream"],
            ["**Cirrocumulus (Cc)**", "Tiny white ripples or grains, sky seen between", "Ice", "No rain, very little icing"],
            ["**Cirrostratus (Cs)**", "Thin milky veil over the sky", "Ice", "Gives a **halo** round the sun or moon. Often ahead of a warm front"],
            ["**Altocumulus (Ac)**", "White or grey rounded patches, rolls, rows", "Water, often supercooled", "Some icing and light bumps. **Lenticular** form shows mountain waves. **Castellanus** form warns of thunderstorms later"],
            ["**Altostratus (As)**", "Grey sheet, sun looks as if behind frosted glass", "Water and ice", "**Corona** when thin. Thick As gives continuous light rain. Icing below 0 °C"],
            ["**Nimbostratus (Ns)**", "Thick dark grey layer, hides the sun", "Water and ice", "**Continuous** rain or snow for hours, poor visibility, icing. Monsoon rain over the west coast"],
            ["**Stratus (St)**", "Grey uniform layer with a low, flat base", "Water", "Drizzle, very low ceilings. **Fog** is stratus touching the ground. Ragged bits are fractostratus"],
            ["**Stratocumulus (Sc)**", "Grey or white lumps and rolls in a layer", "Water", "Light rain or drizzle at most. Light bumps"],
            ["**Cumulus (Cu)**", "Separate heaps with flat dark bases and cauliflower tops", "Water", "Fair weather Cu: bumps only. Big **towering Cu (TCU)**: showers, turbulence, icing"],
            ["**Cumulonimbus (Cb)**", "Huge tower, top often spreads into an **anvil**", "Water below, ice above", "**The most dangerous cloud**: thunder, lightning, hail, severe turbulence, icing, squalls, windshear. Spans **all three levels**"],
          ],
        },
        {
          t: "tip",
          text: "**H**alo goes with **H**igh cloud (cirrostratus, ice). **C**orona goes with the middle **C**louds (altostratus and altocumulus, water drops).",
        },
      ],
    },
    {
      id: "features",
      title: "Cloud features and contrails",
      blocks: [
        {
          t: "table",
          head: ["Term", "Meaning"],
          rows: [
            ["**Lenticularis**", "Smooth lens or almond shaped cloud (Ac, Sc, Cc), staying still in the wind. Sign of **mountain waves**"],
            ["**Castellanus**", "Little towers rising from a cloud layer (Ac). Sign of instability at medium levels, thunderstorms likely later"],
            ["**Fractus**", "Ragged shreds of stratus or cumulus, often under rain cloud"],
            ["**Congestus**", "Cumulus with big vertical growth, a towering cumulus (TCU)"],
            ["**Calvus**", "Cb whose top is still rounded, no fibrous ice top yet"],
            ["**Capillatus**", "Cb with a clear fibrous top or **anvil**. Mature thunderstorm"],
            ["**Virga**", "Rain or snow falling from a cloud base that **evaporates before reaching the ground**"],
            ["**Mamma**", "Pouches hanging under a cloud, often under a Cb anvil. Sign of strong turbulence"],
          ],
        },
        {
          t: "p",
          text: "**Contrails** (condensation trails) form when the water vapour in jet exhaust condenses and freezes in very cold air, usually above about 30,000 ft. The **mintra level** is the lowest level at which contrails can form. Below it, no contrails. **Wing tip trails** are short lived, made by the pressure drop over wing tips. **Distrails** are clear lanes cut through a thin cloud by the heat of the exhaust.",
        },
      ],
    },
    {
      id: "amount",
      title: "Cloud amount, base and ceiling",
      blocks: [
        {
          t: "p",
          text: "Cloud amount is measured in **oktas**: eighths of the sky covered.",
        },
        {
          t: "table",
          head: ["Oktas", "Reported as"],
          rows: [
            ["1 to 2", "**FEW**"],
            ["3 to 4", "**SCT** (scattered)"],
            ["5 to 7", "**BKN** (broken)"],
            ["8", "**OVC** (overcast)"],
          ],
        },
        {
          t: "list",
          items: [
            "Cloud base in **METAR, SPECI and TAF** is given **above the aerodrome (ground)**. On **area forecasts and significant weather charts** it is **above MSL**.",
            "**Ceiling**: the height of the base of the **lowest layer below 20,000 ft (6,000 m)** covering **more than half the sky** (BKN or OVC).",
            "**Cloud of operational significance**: cloud with base below **5,000 ft (1,500 m)** or below the highest minimum sector altitude, whichever is higher, and **any CB or TCU** at any height.",
          ],
        },
        {
          t: "p",
          text: "Cloud reports and codes are covered in full in Module 14.",
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
            "Adiabatic: temperature change **with no heat added or removed**. Rising air expands and cools.",
            "**DALR 3 °C per 1000 ft (9.8 per km)**, fixed. **SALR about 1.5 °C per 1000 ft** near the ground, varies.",
            "SALR is less than DALR because of **latent heat** released by condensation. SALR nears DALR at very low temperatures.",
            "ELR is the real lapse rate and **changes with time**. Stability depends on the **ELR**.",
            "**ELR < SALR: absolutely stable. ELR > DALR: absolutely unstable. In between: conditionally unstable.**",
            "Inversion and isothermal layers are **absolutely stable**.",
            "Stable air: **layer cloud, steady rain, poor visibility, smooth**. Unstable air: **heap cloud, showers, good visibility, bumpy**.",
            "Moist below, dry above, lifted: **potential instability**, embedded CB.",
            "Four lifts: **convection, orographic, frontal, convergence**.",
            "Upper divergence: surface pressure falls, cloud forms. A high is clear because of **sinking air**.",
            "Tephigram: DALR, SALR and mixing ratio lines meet at the **Normand point**. From the surface it gives the **LCL**, the cloud base.",
            "Cloud level is by **base height**. Base 3 km, top 6 km: **medium** cloud.",
            "**Cs: halo. As and Ac: corona. Ns: continuous rain. St: drizzle, fog when on the ground. Cb: all hazards, spans all three levels.**",
            "**Lenticular: mountain waves. Castellanus: thunderstorms later. Capillatus: Cb with anvil. Virga: rain not reaching the ground.**",
            "Mintra level: the **lowest level** at which contrails form.",
            "FEW 1 to 2, SCT 3 to 4, BKN 5 to 7, OVC 8 oktas.",
            "Ceiling: lowest **BKN or OVC** layer below **20,000 ft**. METAR cloud base **above the aerodrome**.",
          ],
        },
      ],
    },
  ],
  slides: [
    {
      title: "Rising air cools",
      points: [
        "Rising air **expands and cools**, sinking air **warms**",
        "No heat in or out: **adiabatic**",
        "**DALR 3 °C per 1000 ft**, fixed",
        "**SALR about 1.5 °C per 1000 ft**, varies",
      ],
    },
    {
      title: "Why SALR is smaller",
      points: [
        "Condensation **releases latent heat**",
        "It makes up part of the cooling",
        "Warm tropical air: SALR very small",
        "Below about -40 °C: SALR close to DALR",
      ],
    },
    {
      title: "Stable or unstable?",
      points: [
        "Parcel colder than surroundings: sinks back, **stable**",
        "Parcel warmer: keeps rising, **unstable**",
        "**ELR < SALR**: absolutely stable",
        "**ELR > DALR**: absolutely unstable",
        "In between: **conditionally unstable**",
      ],
      figure: "stability",
    },
    {
      title: "What you see",
      points: [
        "Stable: **layer cloud, steady rain, haze, smooth**",
        "Unstable: **heap cloud, showers, clear, bumpy**",
        "Inversion: most stable of all",
        "Moist below, dry above, lifted: **embedded CB**",
      ],
    },
    {
      title: "Four ways to lift air",
      points: [
        "**Convection**: hot ground, thermals",
        "**Orographic**: over hills",
        "**Frontal**: warm air over cold",
        "**Convergence**: air piling into a low",
      ],
      figure: "lifting",
    },
    {
      title: "Up and down aloft",
      points: [
        "Surface convergence: air rises, cloud",
        "Upper divergence: surface pressure falls, cloud",
        "Upper convergence: air sinks, clear skies",
        "A high has no low cloud because of **subsidence**",
      ],
    },
    {
      title: "The ten clouds",
      points: [
        "**High**: Ci, Cc, Cs (ice)",
        "**Medium**: Ac, As, (Ns)",
        "**Low**: St, Sc",
        "**Vertical**: Cu, Cb",
      ],
      figure: "clouds",
    },
    {
      title: "Clouds and what they bring",
      points: [
        "**Cs**: halo. **As**: corona, steady rain",
        "**Ns**: continuous rain or snow",
        "**St**: drizzle, fog on the ground",
        "**Cb**: thunder, hail, turbulence, icing",
      ],
    },
    {
      title: "Warning signs in the sky",
      points: [
        "**Lenticular**: mountain waves",
        "**Castellanus**: thunderstorms later",
        "**Capillatus**: Cb with an anvil",
        "**Virga**: rain that dries up before the ground",
      ],
    },
    {
      title: "Cloud amount and ceiling",
      points: [
        "FEW 1 to 2, SCT 3 to 4, BKN 5 to 7, OVC 8 oktas",
        "METAR base: **above the aerodrome**",
        "Area charts: **above MSL**",
        "Ceiling: lowest BKN or OVC below 20,000 ft",
      ],
    },
    {
      title: "Quick sums",
      points: [
        "Dry air 35 °C lifted 1 km: **25 °C**",
        "+8 °C at 1,350 ft, ISA rate: freezing level **5,350 ft**",
        "Cloud base = (T - dew point) × 400 ft",
      ],
    },
  ],
  mcqs: [
    { id: "m5-01", q: "A process in which no heat enters or leaves a parcel of air is called:", options: ["Isothermal", "Adiabatic", "Isobaric", "Conduction"], answer: 1, why: "Adiabatic means no heat exchange. The temperature changes only because the parcel expands or is squeezed." },
    { id: "m5-02", q: "A parcel of unsaturated air rising in the atmosphere:", options: ["Expands and cools", "Contracts and warms", "Expands and warms", "Keeps the same temperature"], answer: 0, why: "Pressure falls as it rises, so it expands. Expanding uses its internal energy, so it cools." },
    { id: "m5-03", q: "The dry adiabatic lapse rate is about:", options: ["1.5 °C per 1000 ft", "2 °C per 1000 ft", "3 °C per 1000 ft", "6.5 °C per 1000 ft"], answer: 2, why: "DALR is 9.8 °C per km, about 3 °C per 1000 ft. 2 °C per 1000 ft is the ISA rate." },
    { id: "m5-04", q: "The saturated adiabatic lapse rate is less than the dry adiabatic lapse rate because:", options: ["Saturated air is heavier", "Latent heat is released as water vapour condenses", "Saturated air contains no dust", "Saturated air rises faster"], answer: 1, why: "Condensation gives out latent heat, which makes up for part of the cooling, so saturated air cools more slowly." },
    { id: "m5-05", q: "Near mean sea level in temperate latitudes, the SALR is about:", options: ["10 °C per km", "8 °C per km", "2 °C per km", "5 to 6 °C per km"], answer: 3, why: "Near the ground SALR is about 5 to 6 °C per km, or about 1.5 °C per 1000 ft. It varies with temperature." },
    { id: "m5-06", q: "At very low temperatures (below about -40 °C), the SALR:", options: ["Becomes nearly equal to the DALR", "Becomes zero", "Becomes negative", "Becomes double the DALR"], answer: 0, why: "Very cold air holds almost no vapour, so little latent heat is released, and saturated air cools nearly as fast as dry air." },
    { id: "m5-07", q: "The environmental lapse rate in the real atmosphere:", options: ["Is fixed at 2 °C per 1000 ft", "Is fixed at 0.65 °C per 100 m", "Varies with time and place", "Equals the DALR"], answer: 2, why: "The ELR is whatever the air is doing that day. ISA uses an average, but the real one changes all the time." },
    { id: "m5-08", q: "The stability of the atmosphere is decided mainly by its:", options: ["Relative humidity", "Pressure", "Wind speed", "Environmental lapse rate"], answer: 3, why: "Comparing the ELR with the DALR and SALR tells you whether a lifted parcel ends up warmer or colder than its surroundings." },
    { id: "m5-09", q: "The atmosphere is absolutely unstable when the ELR is:", options: ["More than the DALR", "Equal to the DALR", "Less than the SALR", "Between the SALR and DALR"], answer: 0, why: "If the surroundings cool faster than even the DALR, any lifted parcel, dry or saturated, stays warmer and keeps rising." },
    { id: "m5-10", q: "The atmosphere is absolutely stable when the ELR is:", options: ["More than the DALR", "Less than the SALR", "Equal to the DALR", "Between the SALR and DALR"], answer: 1, why: "If the surroundings cool more slowly than even the SALR, any lifted parcel ends up colder and sinks back." },
    { id: "m5-11", q: "Conditional instability exists when:", options: ["ELR is greater than DALR", "ELR is less than SALR", "ELR lies between the SALR and the DALR", "ELR equals zero"], answer: 2, why: "Then dry air is stable but saturated air is unstable. Whether it goes up depends on the condition of being saturated." },
    { id: "m5-12", q: "DALR 9.8 °C per km, ELR 6.8 °C per km. For a parcel of unsaturated air, the atmosphere is:", options: ["Unstable", "Neutral", "Absolutely unstable", "Stable"], answer: 3, why: "The dry parcel cools at 9.8, faster than its surroundings at 6.8, so it ends up colder and sinks back. Stable for dry air." },
    { id: "m5-13", q: "SALR 5.5 °C per km, ELR 4.5 °C per km. For saturated air, the atmosphere is:", options: ["Stable", "Unstable", "Neutral", "Conditionally unstable"], answer: 0, why: "The saturated parcel cools at 5.5, faster than the 4.5 of its surroundings, so it ends up colder. Stable." },
    { id: "m5-14", q: "Saturated air is unstable when:", options: ["SALR is greater than ELR", "SALR equals ELR", "SALR is less than ELR", "DALR is less than SALR"], answer: 2, why: "If the surroundings cool faster than the saturated parcel, the parcel stays warmer and keeps rising." },
    { id: "m5-15", q: "An inversion indicates that the air is:", options: ["Unstable", "Absolutely stable", "Conditionally unstable", "Neutral"], answer: 1, why: "Temperature rising with height is the most stable state. Rising air is quickly colder than the air around it." },
    { id: "m5-16", q: "An isothermal layer of air is:", options: ["Stable", "Unstable", "Neutral", "Super-adiabatic"], answer: 0, why: "No fall of temperature with height is well below the SALR, so the layer is stable." },
    { id: "m5-17", q: "If the ELR equals the DALR, the atmosphere for dry air is:", options: ["Stable", "Unstable", "Neutral", "Absolutely stable"], answer: 2, why: "A lifted dry parcel stays the same temperature as its surroundings, so it neither rises further nor sinks back." },
    { id: "m5-18", q: "Surface temperature is 30 °C. Using the DALR, the temperature of a dry parcel lifted to 2 km is about:", options: ["20 °C", "26 °C", "17 °C", "10 °C"], answer: 3, why: "About 10 °C per km for 2 km is a 20 °C drop: 30 - 20 = 10 °C." },
    { id: "m5-19", q: "A dry parcel at 35 °C at the surface is lifted 1 km with no heat exchange. What is its temperature now?", options: ["25 °C", "28.5 °C", "30 °C", "15 °C"], answer: 0, why: "DALR is about 10 °C per km, so 35 - 10 = 25 °C." },
    { id: "m5-20", q: "Air temperature is +8 °C at an aerodrome 1,350 ft AMSL. With the ISA lapse rate, the freezing level is about:", options: ["3,350 ft AMSL", "5,350 ft AMSL", "9,350 ft AMSL", "4,000 ft AMSL"], answer: 1, why: "At 2 °C per 1000 ft, losing 8 °C takes 4,000 ft. 1,350 + 4,000 = 5,350 ft AMSL." },
    { id: "m5-21", q: "Which is typical of stable air?", options: ["Cumulus cloud and showers", "Good visibility and gusty winds", "Layer cloud, steady precipitation and poor visibility", "Thunderstorms"], answer: 2, why: "Stable air stops vertical motion, so cloud spreads out in layers and haze is trapped near the ground." },
    { id: "m5-22", q: "Which is typical of unstable air?", options: ["Smooth flying", "Fog and haze", "Continuous drizzle", "Cumuliform cloud, showers and good visibility outside them"], answer: 3, why: "Unstable air rises freely, building heap clouds and showers. Mixing carries haze away, so visibility is good." },
    { id: "m5-23", q: "A layer that is moist at the bottom and dry at the top becomes unstable when lifted as a whole. This is called:", options: ["Potential (convective) instability", "Absolute stability", "An inversion", "Neutral stability"], answer: 0, why: "The moist bottom saturates and cools slowly while the dry top cools fast, so the lapse rate of the layer steepens." },
    { id: "m5-24", q: "Cloud formed by air being forced up over a mountain range is called:", options: ["Convective cloud", "Frontal cloud", "Orographic cloud", "Advection cloud"], answer: 2, why: "Orographic means caused by hills or mountains." },
    { id: "m5-25", q: "Fair weather cumulus over land usually:", options: ["Forms at night and clears by noon", "Forms in the late morning, peaks in the afternoon and clears by evening", "Lasts all day and night", "Forms only over the sea"], answer: 1, why: "It is driven by the sun heating the ground, so it follows the daily heating cycle." },
    { id: "m5-26", q: "If the air at upper levels is diverging, at the surface you would expect:", options: ["Pressure rising and clouds clearing", "No change", "Pressure falling, rising air and cloud forming", "Calm winds and fog"], answer: 2, why: "Air removed aloft is replaced by air rising from below, so surface pressure falls and cloud forms." },
    { id: "m5-27", q: "The lack of low cloud in a stationary high is due to:", options: ["Instability", "Rising air", "Strong winds", "Sinking (subsiding) air"], answer: 3, why: "Air sinks in a high and warms as it is squeezed, so it dries out and cloud cannot form." },
    { id: "m5-28", q: "On a tephigram, the point where the DALR line from the temperature, the SALR line from the wet bulb and the mixing ratio line from the dew point meet is the:", options: ["Normand point", "Freezing level", "Tropopause", "Mintra level"], answer: 0, why: "This is the Normand point. Starting from surface values it gives the lifting condensation level." },
    { id: "m5-29", q: "A cloud has its base at 3 km and its top at 6 km. It is classed as a:", options: ["Low cloud", "Medium cloud", "High cloud", "Cloud of vertical development"], answer: 1, why: "Clouds are classed by the height of their base. A 3 km base is in the medium level." },
    { id: "m5-30", q: "Which clouds are made almost entirely of ice crystals?", options: ["Stratus and stratocumulus", "Cumulus", "Altocumulus", "Cirrus, cirrocumulus and cirrostratus"], answer: 3, why: "The high clouds are so cold that they are made of ice crystals." },
    { id: "m5-31", q: "A halo round the sun or moon is seen through:", options: ["Cirrostratus", "Stratus", "Cumulonimbus", "Nimbostratus"], answer: 0, why: "A halo comes from light bending through the ice crystals of thin cirrostratus." },
    { id: "m5-32", q: "A corona is usually seen through thin:", options: ["Cirrus", "Cumulonimbus", "Altostratus or altocumulus", "Fog"], answer: 2, why: "A corona is made by small water drops in thin medium cloud. A halo needs ice crystals." },
    { id: "m5-33", q: "A dark grey cloud layer giving continuous rain for hours is:", options: ["Cumulonimbus", "Nimbostratus", "Cirrostratus", "Cumulus"], answer: 1, why: "Nimbostratus is the thick rain layer of steady, continuous rain or snow. CB gives heavy showers instead." },
    { id: "m5-34", q: "Heavy, continuous rain over Mumbai during the monsoon usually comes from:", options: ["Cirrus", "Altocumulus", "Stratocumulus", "Nimbostratus"], answer: 3, why: "Deep, moist monsoon flow forced up the Western Ghats gives thick nimbostratus with long spells of heavy rain." },
    { id: "m5-35", q: "A uniform grey layer of cloud like fog, but not touching the ground, is:", options: ["Stratus", "Altostratus", "Cirrostratus", "Cumulus"], answer: 0, why: "Stratus is a low, flat, grey layer. When it touches the ground it is fog." },
    { id: "m5-36", q: "The cloud most likely to give drizzle is:", options: ["Cirrus", "Stratus", "Cumulonimbus", "Altocumulus"], answer: 1, why: "Drizzle falls from thin, low layer cloud such as stratus, where drops are small." },
    { id: "m5-37", q: "Which cloud type can have its base in the low level and its top in the high level?", options: ["Cirrus", "Stratus", "Altocumulus", "Cumulonimbus"], answer: 3, why: "A CB has its base in the low level and can tower up through the medium and high levels to the tropopause." },
    { id: "m5-38", q: "The most dangerous cloud for aviation is:", options: ["Nimbostratus", "Cirrostratus", "Cumulonimbus", "Altostratus"], answer: 2, why: "CB brings severe turbulence, hail, icing, lightning, squalls and windshear." },
    { id: "m5-39", q: "Lenticular clouds indicate the presence of:", options: ["A warm front", "A cold front", "Mountain waves", "A tropical cyclone"], answer: 2, why: "Lens shaped clouds that sit still in a strong wind form at the crests of mountain waves." },
    { id: "m5-40", q: "Altocumulus castellanus in the morning is a sign of:", options: ["Fog in the evening", "Instability at medium levels and thunderstorms later", "A stable day", "Mountain waves"], answer: 1, why: "Little towers on a medium cloud layer show the air aloft is unstable. Thunderstorms often follow later." },
    { id: "m5-41", q: "A cumulonimbus with a distinct anvil is called:", options: ["Cumulonimbus calvus", "Cumulus congestus", "Cumulonimbus capillatus", "Cumulus fractus"], answer: 2, why: "Capillatus means it has a fibrous, ice top, usually spread out as an anvil. Calvus has no such top yet." },
    { id: "m5-42", q: "Precipitation falling from a cloud base but evaporating before reaching the ground is called:", options: ["Virga", "Drizzle", "Mamma", "Fractus"], answer: 0, why: "Virga shows as streaks hanging under a cloud. It often means dry air below and possible downbursts." },
    { id: "m5-43", q: "A large cumulus with strong vertical growth and a cauliflower top is called:", options: ["Fractus", "Cumulus congestus (TCU)", "Stratocumulus", "Altocumulus"], answer: 1, why: "Congestus is towering cumulus (TCU). It gives showers and turbulence and may grow into a CB." },
    { id: "m5-44", q: "The lowest level at which condensation trails will form is called the:", options: ["Drytra level", "Maxtra level", "Freezing level", "Mintra level"], answer: 3, why: "Mintra is the minimum trail level. Below it, contrails do not form." },
    { id: "m5-45", q: "In a METAR, the height of the cloud base is given:", options: ["Above the aerodrome level", "Above mean sea level", "As a flight level", "Above the tropopause"], answer: 0, why: "METAR, SPECI and TAF give cloud base above the aerodrome. Area forecasts and SIGWX charts use MSL." },
    { id: "m5-46", q: "BKN in a cloud report means a cloud amount of:", options: ["1 to 2 oktas", "3 to 4 oktas", "8 oktas", "5 to 7 oktas"], answer: 3, why: "FEW 1 to 2, SCT 3 to 4, BKN 5 to 7, OVC 8 oktas." },
    { id: "m5-47", q: "The ceiling is the height of the base of the lowest cloud layer below 20,000 ft that covers:", options: ["Any part of the sky", "More than half of the sky", "At least a quarter of the sky", "The whole sky only"], answer: 1, why: "Ceiling is the lowest layer of BKN or OVC cloud, that is more than 4 oktas, below 20,000 ft (6,000 m)." },
    { id: "m5-48", q: "Which of these is NOT one of the four main ways air is lifted to form cloud?", options: ["Convection", "Orographic lifting", "Frontal lifting", "Subsidence"], answer: 3, why: "Subsidence is sinking air, which clears cloud. The four lifts are convection, orographic, frontal and convergence." },
  ],
};
