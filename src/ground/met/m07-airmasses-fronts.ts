// Meteorology Module 7: Air Masses and Fronts. CAR Sec 7 Series B Part IV, Appendix B 1.6.
// Written fresh for Runway Zero. Northern hemisphere unless stated.
import type { Module } from "../types.ts";

export const M07: Module = {
  n: 7,
  title: "Air Masses and Fronts",
  car: "1.6",
  summary:
    "What an air mass is and where it comes from, how it changes as it travels, the air masses that reach India, and the warm, cold, occluded and stationary fronts with the clouds, weather and wind changes each one brings.",
  sections: [
    {
      id: "what",
      title: "What an air mass is",
      blocks: [
        {
          t: "p",
          text: "An **air mass** is a huge body of air, thousands of km across, in which **temperature and humidity are nearly the same** at each level across the whole area. It gets these properties by sitting for days over a large, even surface: a cold continent, a warm ocean, a hot desert.",
        },
        {
          t: "p",
          text: "Good **source regions** are wide, flat areas with **light winds**, so the air stays long enough to take on the surface's character. These are mostly the big **high pressure areas**: the polar regions, the subtropical highs over the oceans, and the winter highs over Siberia and Canada.",
        },
        {
          t: "table",
          head: ["Letter", "Meaning", "Tells you about"],
          rows: [
            ["**A**", "Arctic (or Antarctic)", "Temperature: extremely cold"],
            ["**P**", "Polar", "Temperature: cold"],
            ["**T**", "Tropical", "Temperature: warm"],
            ["**E**", "Equatorial", "Temperature: hot"],
            ["**c**", "Continental", "Humidity: dry, formed over land"],
            ["**m**", "Maritime", "Humidity: moist, formed over sea"],
          ],
        },
        {
          t: "table",
          head: ["Air mass", "Source", "When it arrives"],
          rows: [
            ["**cP** Polar continental", "Siberia, northern Canada in winter", "Very cold, very dry, stable. **Extreme cold** temperatures"],
            ["**mP** Polar maritime", "Northern oceans", "Cool and moist. Showers when it moves over warmer ground"],
            ["**cT** Tropical continental", "Hot deserts: Sahara, Arabia, Thar", "Hot, dry, dusty, hazy"],
            ["**mT** Tropical maritime", "Subtropical oceans", "Warm and moist. Low cloud, drizzle and fog over cold ground"],
            ["**mE** Equatorial maritime", "Equatorial oceans", "Hot, very humid, unstable. Heavy showers and thunderstorms"],
          ],
        },
      ],
    },
    {
      id: "modify",
      title: "How an air mass changes as it travels",
      blocks: [
        {
          t: "p",
          text: "As an air mass moves, the surface below warms or cools it from beneath and adds or removes moisture. The key question: **is the air colder or warmer than the ground it is moving over?**",
        },
        {
          t: "table",
          head: ["Cold air over a warmer surface", "Warm air over a colder surface"],
          rows: [
            ["Heated from below, so **unstable**", "Cooled from below, so **stable**, often with an inversion"],
            ["**Cumulus and CB**, showers, thunderstorms", "**Stratus, stratocumulus, drizzle, fog**"],
            ["**Good visibility** outside showers", "**Poor visibility**: haze, mist, fog"],
            ["Bumpy, gusty", "Smooth, light winds near the ground"],
          ],
        },
        {
          t: "tip",
          text: "**Cold on warm: clouds go up. Warm on cold: clouds stay down.**",
        },
      ],
    },
    {
      id: "india",
      title: "Air masses over India",
      blocks: [
        {
          t: "list",
          items: [
            "**Winter**: dry continental air from the north and north west covers most of India. It starts as very cold polar continental air over Siberia but warms a great deal crossing Central Asia and the Himalayas. It brings **clear skies, dry air, cold nights and poor visibility in haze and fog**.",
            "After a western disturbance passes, a fresh push of this cold continental air can give a **cold wave** over north and north west India.",
            "**Pre-monsoon**: very hot, dry **continental tropical** air over north west India and Pakistan, with moist sea air creeping in along the coasts.",
            "**Monsoon**: very moist **equatorial maritime** air crosses the equator from the southern Indian Ocean and reaches India as the south west monsoon. North of the monsoon trough, north east India also gets moist tropical air from the Pacific side.",
          ],
        },
        {
          t: "flag",
          text: "One prescribed book calls India's main winter air mass \"tropical continental air from the Siberian high\". Air from the Siberian high is polar continental air, much modified on the way. If an exam asks which air mass gives the most extreme cold, the answer is **polar continental (cP)**.",
        },
      ],
    },
    {
      id: "fronts",
      title: "Fronts",
      blocks: [
        {
          t: "p",
          text: "A **front** is the narrow boundary zone between two air masses of different temperature (and so different density). The **frontal surface** slopes, with the cold, dense air underneath like a wedge. The **front** is the line where this surface meets the ground. Crossing a front, you find changes in **temperature, dew point, wind, pressure tendency, cloud and weather**. A **wind shift** is the one change you always get.",
        },
        {
          t: "list",
          items: [
            "**Frontogenesis**: a front forming or getting stronger as the temperature contrast grows.",
            "**Frontolysis**: a front weakening and dying away as the contrast fades.",
            "In the tropics there is little temperature contrast, so real fronts are rare. **A tropical low is told apart from a mid latitude low by having no fronts.**",
          ],
        },
        { t: "figure", key: "fronts", caption: "Cross sections through a warm front (top) and a cold front (bottom). Not to scale." },
      ],
    },
    {
      id: "warm",
      title: "The warm front",
      blocks: [
        {
          t: "p",
          text: "At a **warm front**, warm air is advancing and **riding up over** the retreating cold air. The slope is **gentle, about 1 in 150**, so the cloud spreads a very long way ahead of the surface front. Warm fronts move slowly, about 10 to 15 kt.",
        },
        {
          t: "list",
          items: [
            "Cloud sequence as it approaches: **Ci → Cs → As → Ns**, lowering and thickening. Cirrus can be seen up to about 1,000 km ahead. The halo in Cs is an early sign.",
            "Rain begins from As and Ns some 300 to 400 km ahead, light at first, becoming **steady and continuous**.",
            "Just ahead of the front: low **stratus, drizzle, frontal fog**, very poor visibility.",
            "If the rising warm air is **unstable**, **CBs can be hidden (embedded)** in the layer cloud.",
            "In winter, rain falling into the cold air below can be **freezing rain**, with severe icing.",
          ],
        },
      ],
    },
    {
      id: "cold",
      title: "The cold front",
      blocks: [
        {
          t: "p",
          text: "At a **cold front**, cold air is advancing and **pushing under** the warm air, lifting it sharply. The slope is **steep, about 1 in 50 to 1 in 100**, so the weather is in a **narrow band**, but it is violent. Cold fronts move about **twice as fast** as warm fronts.",
        },
        {
          t: "list",
          items: [
            "**CB, heavy showers, thunderstorms, hail, squalls, severe turbulence and windshear** along the front.",
            "A **squall line** of thunderstorms can form **ahead of** a fast moving cold front, often 100 to 300 km in front of it.",
            "Behind the front: the sky **clears quickly**, then **cumulus and isolated CB with showers** in the cold air, and **excellent visibility**.",
          ],
        },
        {
          t: "p",
          text: "**Ana and kata fronts.** At an **ana front** the warm air is **rising** along the frontal surface: plenty of cloud and rain, an active front. At a **kata front** the warm air above is **sinking**: thinner cloud and much less weather. Either a warm or a cold front can be ana or kata.",
        },
      ],
    },
    {
      id: "passage",
      title: "What changes as a front passes",
      blocks: [
        {
          t: "table",
          head: ["", "Warm front passes", "Cold front passes"],
          rows: [
            ["**Pressure**", "Falls steadily as it approaches, then **stops falling**", "Falls ahead, then **rises sharply** after"],
            ["**Wind**", "Backs and freshens ahead, **veers** at the front", "**Veers sharply**, often with gusts or squalls"],
            ["**Temperature**", "**Rises**", "**Falls sharply**"],
            ["**Dew point**", "Rises", "Falls"],
            ["**Cloud**", "Ci, Cs, As, Ns then St in the warm sector", "CB at the front, clearing to Cu behind"],
            ["**Weather**", "Long steady rain, then drizzle", "Short, heavy showers and thunder"],
            ["**Visibility**", "Poor in rain, worse in the warm sector", "Poor in showers, **very good** behind"],
          ],
        },
        {
          t: "p",
          text: "**The warm sector** (the warm air between the warm and cold fronts) is mild and humid, with low stratus or stratocumulus, drizzle and poor visibility, especially over a cold surface.",
        },
        {
          t: "tip",
          text: "In the NH the wind **always veers** as any front passes. Remember \"**v**eer at the front, **b**ack before it\".",
        },
      ],
    },
    {
      id: "occlusion",
      title: "Occluded and stationary fronts",
      blocks: [
        {
          t: "p",
          text: "Because the cold front moves faster, it **catches up with the warm front** and lifts the warm sector air off the ground. The combined front is an **occluded front (occlusion)**. Occlusion happens **because the cold front moves faster**.",
        },
        {
          t: "table",
          head: ["Type", "What happens", "Weather"],
          rows: [
            ["**Cold occlusion**", "The air behind the cold front is **colder** than the air ahead of the warm front, so it **undercuts** both", "Warm front weather first, then cold front type showers. More common in summer"],
            ["**Warm occlusion**", "The air behind the cold front is **less cold** than the air ahead, so it **rides up over** it", "Mostly warm front type weather. More common in winter, when the air ahead is very cold continental air"],
          ],
        },
        {
          t: "p",
          text: "An occluded front can be very active where it is young, with **embedded CBs** in widespread layer cloud. The western disturbances that reach India are usually in this occluded stage.",
        },
        {
          t: "p",
          text: "A **stationary front** hardly moves. The winds on both sides blow **parallel to the front**, in opposite directions. Its weather is like a weak warm front and can sit over the same area for days.",
        },
        {
          t: "table",
          head: ["Front", "Fastest to slowest"],
          rows: [["Cold front", "Fastest"], ["Occluded front", "In between"], ["Warm front", "Slow"], ["Stationary front", "Almost still"]],
        },
      ],
    },
    {
      id: "depression",
      title: "The life of a frontal depression",
      blocks: [
        { t: "figure", key: "depression", caption: "A frontal depression with its warm sector (NH)." },
        {
          t: "list",
          items: [
            "It starts as a **wave** on the **polar front**, the boundary between cold polar air and warm subtropical air in mid latitudes.",
            "The wave deepens into a low with a **warm front** ahead, a **cold front** behind, and a **warm sector** between them.",
            "The depression moves roughly in the direction of the **isobars in the warm sector**.",
            "The cold front catches up and the low **occludes**. It deepens most just as occlusion begins, then slowly fills.",
            "New waves often form one after another on the trailing cold front, giving **families of depressions**.",
          ],
        },
        {
          t: "p",
          text: "Other fronts: the **Arctic front** further north, and the **Mediterranean front** in winter between cold European air and warm North African air. Lows forming on the Mediterranean front are among the parents of India's western disturbances (Module 10).",
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
            "Air mass: huge, **uniform temperature and humidity** in the horizontal. Source regions: **highs**, light winds, uniform surface.",
            "Named by temperature (**A, P, T, E**) and moisture (**c** dry, **m** moist). Land at low latitude: **cT**. Land in polar regions: **cold and dry (cP)**.",
            "**Extreme cold: polar continental (cP).**",
            "Cold air over warm surface: **unstable, Cu and CB, showers, good visibility**. Warm over cold: **stable, St, drizzle, fog, poor visibility**.",
            "Front: boundary between air masses of different density. Always a **wind shift**.",
            "Tropical lows have **no fronts**.",
            "Warm front: **slope 1 in 150**, slow, **Ci Cs As Ns St**, long steady rain, frontal fog, embedded CB if unstable.",
            "Cold front: **slope 1 in 50 to 100**, about **twice as fast**, CB, squalls, **squall line ahead**, clears behind with showers and good visibility.",
            "At both fronts in NH the wind **veers**. Pressure stops falling at a warm front, **rises sharply** after a cold front.",
            "Warm sector: mild, humid, St, drizzle, poor visibility.",
            "Occlusion happens because **the cold front moves faster**. **Cold occlusion: cold air undercuts. Warm occlusion: it rides over.**",
            "Stationary front: winds **parallel to the front**.",
            "Ana: warm air rising, active. Kata: warm air sinking, weak.",
            "Depressions form as waves on the **polar front** and move with the warm sector isobars.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "What an air mass is", points: ["Huge body of air, **same temperature and humidity** across it", "Formed over **highs** with light winds", "Named by temperature and moisture"] },
    { title: "The letters", points: ["**A** Arctic, **P** Polar, **T** Tropical, **E** Equatorial", "**c** continental (dry), **m** maritime (moist)", "**cP**: extreme cold. **cT**: hot and dry", "**mT**: warm and moist. **mE**: hot, humid, unstable"] },
    { title: "Changing on the way", points: ["Cold air over warm ground: **unstable**", "Cu, CB, showers, good visibility", "Warm air over cold ground: **stable**", "St, drizzle, fog, poor visibility"] },
    { title: "India's air masses", points: ["Winter: dry continental air from the north west", "Cold wave after a WD passes", "Pre-monsoon: hot dry cT over the north west", "Monsoon: moist equatorial air from the south"] },
    { title: "Fronts", points: ["Boundary between air masses of different density", "Cold air is the wedge underneath", "Always a **wind shift** across it", "Tropical lows have **no fronts**"], figure: "fronts" },
    { title: "Warm front", points: ["Warm air **rides over** cold air", "Gentle slope, **1 in 150**, slow", "**Ci, Cs, As, Ns, St**", "Long steady rain, frontal fog, maybe embedded CB"] },
    { title: "Cold front", points: ["Cold air **pushes under** warm air", "Steep, **1 in 50 to 100**, about twice as fast", "CB, squalls, hail, **squall line ahead**", "Clears behind, showers, great visibility"] },
    { title: "As the front passes (NH)", points: ["Wind **veers** at both", "Warm front: pressure stops falling, temperature rises", "Cold front: pressure **jumps up**, temperature drops", "Warm sector: St, drizzle, poor visibility"] },
    { title: "Occlusions", points: ["Cold front **catches the warm front**", "**Cold occlusion**: cold air undercuts", "**Warm occlusion**: rides over", "Embedded CBs in layer cloud"] },
    { title: "Stationary front", points: ["Hardly moves", "Winds **parallel** to the front, opposite ways", "Weak warm front type weather for days"] },
    { title: "Frontal depressions", points: ["Wave on the **polar front**", "Warm front, warm sector, cold front", "Moves with the warm sector isobars", "Occludes, then fills"], figure: "depression" },
  ],
  mcqs: [
    { id: "m7-01", q: "An air mass is best described as a large body of air with:", options: ["Uniform temperature and humidity in the horizontal", "The same wind everywhere", "The same pressure everywhere", "Constant temperature with height"], answer: 0, why: "Its temperature and moisture are nearly the same across the whole area at any given level." },
    { id: "m7-02", q: "Good source regions for air masses are:", options: ["Large areas of uniform surface with light winds, such as highs", "Areas of strong winds", "Mountain ranges", "Frontal zones"], answer: 0, why: "The air must stay over the same surface long enough to take on its character, which needs light winds." },
    { id: "m7-03", q: "Air masses are classified mainly by their:", options: ["Wind speed", "Pressure", "Temperature and humidity", "Cloud amount"], answer: 2, why: "The letters show temperature (A, P, T, E) and humidity (c or m)." },
    { id: "m7-04", q: "An air mass that forms over land at low latitudes is called:", options: ["Polar maritime", "Tropical maritime", "Polar continental", "Tropical continental"], answer: 3, why: "Low latitude means tropical, over land means continental: cT, hot and dry." },
    { id: "m7-05", q: "An air mass formed over land in polar regions is:", options: ["Warm and dry", "Cold and dry", "Warm and moist", "Cold and moist"], answer: 1, why: "Polar means cold, continental means dry: cP." },
    { id: "m7-06", q: "Extreme cold temperatures are found in which air mass?", options: ["Polar maritime", "Tropical maritime", "Polar continental", "Equatorial maritime"], answer: 2, why: "Polar continental air forms over frozen continents in winter, with no sea to warm it." },
    { id: "m7-07", q: "An air mass that originates over the sea in high latitudes is called:", options: ["Polar maritime", "Polar continental", "Tropical maritime", "Arctic continental"], answer: 0, why: "High latitude means polar, over the sea means maritime: mP." },
    { id: "m7-08", q: "Cold air moving over a much warmer surface becomes:", options: ["Stable, with fog", "Unstable, with cumulus and showers", "Stable, with stratus", "Unchanged"], answer: 1, why: "Heating from below steepens the lapse rate, so the air becomes unstable." },
    { id: "m7-09", q: "Warm moist air moving over a colder surface is likely to give:", options: ["Thunderstorms and good visibility", "Strong gusty winds", "Low stratus, drizzle and fog with poor visibility", "Clear skies"], answer: 2, why: "Cooling from below makes the air stable and can bring it to saturation near the ground." },
    { id: "m7-10", q: "Which is typical of an unstable air mass?", options: ["Good visibility with showery precipitation", "Poor visibility with fog", "Continuous drizzle", "Smooth flying"], answer: 0, why: "Unstable air mixes freely, carrying haze away, and builds cumulus with showers." },
    { id: "m7-11", q: "During the south west monsoon, the main air mass over southern India is:", options: ["Polar continental", "Tropical continental", "Arctic", "Equatorial maritime"], answer: 3, why: "Very moist air from the southern Indian Ocean crosses the equator to form the south west monsoon current." },
    { id: "m7-12", q: "A front is a boundary between two air masses of different:", options: ["Wind speed only", "Density, due to different temperature and humidity", "Altitude", "Pressure tendency only"], answer: 1, why: "Different temperature (and moisture) gives different density. The cold dense air forms a wedge under the warm air." },
    { id: "m7-13", q: "The passage of a front is always shown by:", options: ["A shift in wind direction or speed, or both", "An abrupt fall in pressure", "Thunderstorms", "Clear skies"], answer: 0, why: "Every front brings a wind change. Other changes may be weak at a weak front." },
    { id: "m7-14", q: "A tropical low pressure system is told apart from a mid latitude (extra-tropical) low mainly by its:", options: ["Pressure", "Wind speed", "Lack of frontal characteristics", "Cloud tops"], answer: 2, why: "Tropical lows form in a single warm air mass, so they have no fronts." },
    { id: "m7-15", q: "When a front forms or becomes stronger, the process is called:", options: ["Frontolysis", "Frontogenesis", "Occlusion", "Subsidence"], answer: 1, why: "Frontogenesis is the birth or strengthening of a front. Frontolysis is its weakening." },
    { id: "m7-16", q: "At a warm front:", options: ["Cold air pushes under warm air", "Warm air rides up over the retreating cold air", "Both air masses sink", "Air moves parallel to the front"], answer: 1, why: "The advancing warm air glides up the gentle slope of the cold air ahead." },
    { id: "m7-17", q: "The average slope of a warm front is about:", options: ["1 in 10", "1 in 50", "1 in 150", "1 in 1,000"], answer: 2, why: "A warm front is gentle, about 1 in 150, which is why its cloud spreads so far ahead. A cold front is 1 in 50 to 100." },
    { id: "m7-18", q: "The sequence of cloud seen as a warm front approaches is:", options: ["Cb, Cu, Sc, St", "Ci, Cs, As, Ns, St", "St, Ns, As, Cs, Ci", "Cu, Ac, Ci, Cb"], answer: 1, why: "High cloud first, then lowering and thickening to rain cloud and low stratus near the front." },
    { id: "m7-19", q: "The precipitation ahead of a warm front is usually:", options: ["Short heavy showers", "Hail", "No precipitation", "Steady, continuous rain over a wide belt"], answer: 3, why: "Layer cloud from gentle lifting gives long periods of steady rain." },
    { id: "m7-20", q: "If the warm air rising over a warm front is unstable, you may meet:", options: ["Embedded cumulonimbus in the layer cloud", "Clear skies", "Mountain waves", "Haze only"], answer: 0, why: "CBs can grow inside the stratiform cloud, hidden from view. A real danger without weather radar." },
    { id: "m7-21", q: "Frontal fog is most common with a:", options: ["Cold front", "Warm front", "Stationary high", "Sea breeze"], answer: 1, why: "Rain from the warm air falls into the cold air ahead of the warm front and saturates it." },
    { id: "m7-22", q: "At a cold front:", options: ["Warm air rides over cold air", "Cold air pushes under the warm air and lifts it sharply", "The front does not move", "Warm air pushes the cold air back"], answer: 1, why: "The advancing cold wedge drives under the warm air, forcing it up steeply." },
    { id: "m7-23", q: "Compared with a warm front, a cold front normally moves:", options: ["At about half the speed", "At the same speed", "At about twice the speed", "Not at all"], answer: 2, why: "Cold fronts move about twice as fast as warm fronts, which is why they catch up and occlude." },
    { id: "m7-24", q: "Squall lines most often develop:", options: ["In an occluded front", "In a stable cold air mass", "Ahead of a cold front", "Behind a warm front"], answer: 2, why: "A line of thunderstorms can form in the warm air ahead of a fast moving cold front." },
    { id: "m7-25", q: "Behind a fast moving cold front you would expect:", options: ["8 oktas of layered cloud and continuous rain", "Scattered stratus and drizzle", "Isolated CBs and showers with good visibility", "Dense fog"], answer: 2, why: "The cold air behind is unstable over warmer ground: Cu, a few CB, showers, and very good visibility." },
    { id: "m7-26", q: "Which weather is typical of an active cold front?", options: ["Ci, Cs and halo", "CB, heavy showers, thunder, squalls in a narrow belt", "Long periods of drizzle", "Radiation fog"], answer: 1, why: "The steep, fast lifting gives violent convective weather in a narrow band." },
    { id: "m7-27", q: "In the northern hemisphere, as a cold front passes, the wind:", options: ["Backs sharply", "Veers sharply, often with gusts", "Stays the same", "Becomes calm for hours"], answer: 1, why: "The wind veers at every front in the NH. At a cold front the change is sudden and squally." },
    { id: "m7-28", q: "After a cold front passes, the pressure normally:", options: ["Rises sharply", "Falls sharply", "Stays the same", "Falls slowly"], answer: 0, why: "Denser cold air arrives, so pressure rises quickly behind the front." },
    { id: "m7-29", q: "After a cold front passes, the temperature and dew point:", options: ["Both rise", "Both fall", "Temperature rises, dew point falls", "Do not change"], answer: 1, why: "Colder, drier air arrives behind the front." },
    { id: "m7-30", q: "As a warm front approaches a station in the northern hemisphere, the wind usually:", options: ["Veers and decreases", "Reverses", "Becomes calm", "Backs and freshens"], answer: 3, why: "Ahead of the warm front the wind backs and increases. It veers when the front passes." },
    { id: "m7-31", q: "When a warm front passes, the pressure usually:", options: ["Rises sharply", "Falls sharply", "Stops falling and becomes steady", "Oscillates"], answer: 2, why: "Pressure falls steadily ahead of the warm front and levels off in the warm sector." },
    { id: "m7-32", q: "The weather in the warm sector of a depression is typically:", options: ["Cold and clear", "Dry and dusty", "Thunderstorms and hail", "Mild and humid with stratus, drizzle and poor visibility"], answer: 3, why: "Warm moist air over a cooler surface gives low stratus, drizzle and mist or fog." },
    { id: "m7-33", q: "Occlusion of fronts takes place because of:", options: ["Faster movement of the warm front", "Daytime heating", "Fronts moving in opposite directions", "Faster movement of the cold front"], answer: 3, why: "The faster cold front catches up with the warm front and lifts the warm sector off the ground." },
    { id: "m7-34", q: "A cold occlusion forms when:", options: ["The air behind the cold front is colder than the air ahead of the warm front and undercuts it", "Warm air undercuts cold air", "The warm front overtakes the cold front", "The front stops moving"], answer: 0, why: "The coldest air goes underneath. If the air behind is less cold and rides over, it is a warm occlusion." },
    { id: "m7-35", q: "A warm occlusion forms when the air behind the cold front:", options: ["Is colder and undercuts the air ahead", "Stops moving", "Is warmer than the warm sector", "Is less cold and rides up over the air ahead of the warm front"], answer: 3, why: "The less cold air behind rises over the very cold air ahead. Common in winter when the air ahead is cold continental air." },
    { id: "m7-36", q: "Which of these normally moves the fastest?", options: ["Warm front", "Warm occlusion", "Cold front", "Stationary front"], answer: 2, why: "Cold fronts are the fastest moving fronts." },
    { id: "m7-37", q: "At a stationary front, the wind blows:", options: ["Perpendicular to the front", "Always gusty and variable", "Always very strongly", "Parallel to the front, in opposite directions on each side"], answer: 3, why: "Neither air mass advances, so the winds run along the front." },
    { id: "m7-38", q: "At an ana front, the warm air is:", options: ["Rising along the frontal surface, giving active weather", "Sinking, giving little weather", "Stationary", "Below the cold air"], answer: 0, why: "Ana means rising. Kata means sinking, with weaker weather." },
    { id: "m7-39", q: "Mid latitude frontal depressions form as waves on the:", options: ["ITCZ", "Monsoon trough", "Polar front", "Subtropical high"], answer: 2, why: "The polar front separates cold polar air from warm subtropical air. Waves on it grow into depressions." },
    { id: "m7-40", q: "A frontal depression usually moves in the direction of the:", options: ["Isobars in the warm sector", "Isobars in the cold air", "Surface wind behind the cold front", "Jet stream at right angles"], answer: 0, why: "The warm sector isobars are a good guide to the direction of movement." },
    { id: "m7-41", q: "The western disturbances that reach India are mostly in the form of:", options: ["Cols", "Tropical cyclones", "Highs", "Occluded fronts"], answer: 3, why: "They are mid latitude lows that have travelled far and are usually occluded by the time they reach India." },
    { id: "m7-42", q: "On a surface chart, a line marked with alternate triangles and half circles on the same side is a:", options: ["Warm front", "Cold front", "Trough", "Occluded front"], answer: 3, why: "Triangles mark a cold front, half circles a warm front. Both together on the same side is an occlusion. Alternating on opposite sides is a stationary front." },
  ],
};
