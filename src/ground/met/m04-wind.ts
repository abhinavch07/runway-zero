// Meteorology Module 4: Wind. CAR Sec 7 Series B Part IV, Appendix B 1.2 a, b, e and f.
// Written fresh for Runway Zero. Facts checked against the DGCA syllabus, ICAO Annex 3 reporting practice and standard texts.
import type { Module } from "../types.ts";

export const M04: Module = {
  n: 4,
  title: "Wind",
  car: "1.2 a, b, e, f",
  summary:
    "How wind is measured and reported, the forces that make it blow (pressure gradient, Coriolis, friction), geostrophic and gradient wind, Buys Ballot's law, how wind changes with height and through the day, crosswind sums, and the local winds every pilot meets.",
  sections: [
    {
      id: "measure",
      title: "Wind direction, speed and measurement",
      blocks: [
        {
          t: "p",
          text: "Wind is air moving **horizontally**. It has a direction and a speed. **Direction is where the wind comes from.** A westerly wind blows from the west towards the east. A southerly blows from the south.",
        },
        {
          t: "list",
          items: [
            "Direction is given in degrees, to the nearest 10°. In **METARs, TAFs and forecasts it is from true north**. The wind **ATC gives you for take-off and landing is magnetic**, to match the runway.",
            "Speed is in **knots** (nautical miles per hour). 1 kt = 1.852 km/h, about 0.5 m/s. Roughly, 1 m/s = 2 kt.",
            "Surface wind is measured at a height of **10 m** in open ground: an **anemometer** for speed (spinning cups) and a **wind vane** for direction. A **windsock** shows the wind at a glance.",
            "The wind in a **METAR** is the average over **10 minutes**. The wind given by ATC for take-off and landing is averaged over **2 minutes**.",
            "Upper winds are measured by tracking a balloon: with a theodolite (**pilot balloon**) or with radar or GPS (**RAWIN**).",
          ],
        },
        {
          t: "table",
          head: ["Word", "Meaning"],
          rows: [
            ["**Veer**", "Wind direction changes **clockwise**, e.g. 270° to 300°"],
            ["**Back**", "Wind direction changes **anticlockwise**, e.g. 270° to 240°"],
            ["**Gust**", "A short burst stronger than the mean, lasting seconds. Reported when it is **10 kt or more** above the mean"],
            ["**Lull**", "A short drop below the mean"],
            ["**Squall**", "A sudden rise of at least 16 kt to 22 kt or more, lasting **at least a minute**. Comes with CB and thunderstorms"],
            ["**Gale**", "Mean wind of **34 kt or more**"],
          ],
        },
        {
          t: "tip",
          text: "**Veer = clockwise.** Picture a clock: V for \"with the hands\". **Back = backwards** (anticlockwise).",
        },
      ],
    },
    {
      id: "forces",
      title: "What makes the wind blow",
      blocks: [
        {
          t: "p",
          text: "**Pressure gradient force (PGF)** is the push from high pressure towards low pressure, at right angles to the isobars. The closer the isobars, the stronger the push. This is what starts the wind.",
        },
        {
          t: "p",
          text: "**Coriolis force** comes from the earth turning under the moving air. It is not a real push but it has a real effect: it **turns moving air to the right in the northern hemisphere** and to the left in the southern hemisphere. It always acts at right angles to the wind.",
        },
        {
          t: "list",
          items: [
            "Coriolis force = 2 × earth's spin rate × air density × wind speed × sin(latitude).",
            "It is **zero at the equator** (sin 0° = 0) and **greatest at the poles**.",
            "It gets **stronger as the wind gets faster**. Still air has no Coriolis force.",
            "It changes the **direction** of the wind, never its speed.",
          ],
        },
        { t: "figure", key: "geostrophic", caption: "Geostrophic wind: the pressure gradient force and the Coriolis force balance, and the wind blows along the isobars." },
      ],
    },
    {
      id: "geo",
      title: "Geostrophic and gradient wind",
      blocks: [
        {
          t: "p",
          text: "Air starts moving from high to low, Coriolis turns it to the right, and it keeps turning until the two forces balance. Then it blows **parallel to straight isobars**. This is the **geostrophic wind**: a balance of **pressure gradient force and Coriolis force**, with no friction (above about 2,000 to 3,000 ft).",
        },
        {
          t: "list",
          items: [
            "**Closer isobars, stronger geostrophic wind.**",
            "For the same isobar spacing, the geostrophic wind is **stronger at low latitudes** and weaker at high latitudes, because Coriolis is weaker near the equator. Wind at 30°N is stronger than at 70°N for the same gradient.",
            "For the same gradient it is also stronger at height, where the air is less dense.",
            "It does **not work near the equator** (within about 15°), where Coriolis is almost nil.",
          ],
        },
        {
          t: "p",
          text: "**Gradient wind** is the wind along **curved isobars**, round a low or a high. A third force comes in, the centrifugal effect of going round a curve.",
        },
        {
          t: "table",
          head: ["Around a", "What happens", "Wind compared with geostrophic"],
          rows: [
            ["**Low** (cyclonic)", "Centrifugal effect works **against** the pressure gradient force", "**Weaker** (sub-geostrophic)"],
            ["**High** (anticyclonic)", "Centrifugal effect works **with** the pressure gradient force", "**Stronger** (super-geostrophic)"],
          ],
        },
        {
          t: "p",
          text: "So for the **same isobar spacing**, wind round a high is stronger than round a low. (In practice highs have widely spaced isobars, so their winds are usually light.) With straight isobars, gradient wind = geostrophic wind.",
        },
        {
          t: "p",
          text: "**Cyclostrophic wind** is the balance of pressure gradient and centrifugal force alone, with Coriolis too small to matter. It is found in very tight, fast spinning systems: **tornadoes, dust devils, and near the centre of a tropical cyclone**, and close to the equator.",
        },
      ],
    },
    {
      id: "bb",
      title: "Buys Ballot's law",
      blocks: [
        {
          t: "p",
          text: "**In the northern hemisphere, stand with your back to the wind and low pressure is on your left.** High pressure is on your right. In the southern hemisphere it is the other way round.",
        },
        {
          t: "list",
          items: [
            "So in the NH, wind blows **anticlockwise** round a low and **clockwise** round a high.",
            "In the SH, it blows **clockwise** round a low and anticlockwise round a high.",
            "This is how drift tells you which way the pressure is falling, and why the altimeter over-reads with starboard drift in the NH (Module 3).",
          ],
        },
        {
          t: "tip",
          text: "Northern hemisphere: **back to wind, Low on Left**. Two L's.",
        },
      ],
    },
    {
      id: "friction",
      title: "Friction and the surface wind",
      blocks: [
        {
          t: "p",
          text: "Near the ground, friction slows the wind. Slower wind means less Coriolis force, so the pressure gradient force wins a little and the wind **turns in across the isobars towards low pressure**. This happens in the **friction layer**, the lowest **1 km or so (about 2,000 to 3,000 ft)**. It is deeper over rough ground and on hot, unstable days.",
        },
        { t: "figure", key: "friction", caption: "Above the friction layer the wind follows the isobars. At the surface it is slower and turned towards low pressure." },
        {
          t: "table",
          head: ["Surface", "Surface wind crosses isobars by", "Speed compared with 2,000 ft wind"],
          rows: [
            ["**Over the sea**", "About 10° to 15°", "About two thirds or more"],
            ["**Over land**", "About **30°**", "About **half**"],
          ],
        },
        {
          t: "p",
          text: "So in the northern hemisphere, compared with the wind at 2,000 ft, the **surface wind is backed and lighter**. Climbing out of the friction layer, the wind **veers and increases**. (In the southern hemisphere the surface wind is veered and lighter.)",
        },
        {
          t: "example",
          title: "The 2,000 ft wind over land is 270° 30 kt. Estimate the surface wind (NH).",
          steps: ["Back it by about 30°: 270 - 30 = 240°", "Halve the speed: about 15 kt", "Surface wind about **240° 15 kt**"],
        },
        {
          t: "p",
          text: "**Through the day.** On a sunny afternoon, rising thermals mix the faster upper wind down to the ground. The surface wind becomes **stronger, gusty and veered**, closer to the 2,000 ft wind. On a clear night the mixing stops, a ground inversion forms, and the surface wind **drops and backs**, sometimes to calm, while a strong wind keeps blowing a few hundred feet up. This gives **low level windshear** at night. Over the sea the wind hardly changes through the day.",
        },
      ],
    },
    {
      id: "height",
      title: "Wind higher up: thermal wind",
      blocks: [
        {
          t: "p",
          text: "Above the friction layer, the wind still changes with height when temperature changes across the area. The difference between the wind at a lower level and a higher level is called the **thermal wind**.",
        },
        {
          t: "list",
          items: [
            "The thermal wind blows **along the isotherms** (lines of equal mean temperature of the layer), with **cold air on the left** in the northern hemisphere.",
            "Because the poles are colder than the tropics, the thermal wind is mostly **westerly**. This is why westerly winds get stronger with height in mid latitudes, ending in the jet streams (Module 9).",
            "In the NH, wind that **veers with height** means **warm air** is being carried in. Wind that **backs with height** means **cold air** is being carried in.",
          ],
        },
      ],
    },
    {
      id: "crosswind",
      title: "Headwind and crosswind",
      blocks: [
        {
          t: "p",
          text: "Runways are laid out along the most common wind direction, but the wind is rarely straight down the runway. Split it into a **headwind** (along the runway) and a **crosswind** (across it). A headwind is what you want for take-off and landing. Every aircraft has a maximum crosswind limit.",
        },
        {
          t: "table",
          head: ["Angle between wind and runway", "Crosswind is about", "Headwind is about"],
          rows: [
            ["10°", "1/6 of the wind", "Nearly all of it"],
            ["30°", "**Half** the wind", "0.9 of the wind"],
            ["45°", "0.7 of the wind", "0.7 of the wind"],
            ["60°", "0.9 of the wind", "**Half** the wind"],
            ["90°", "All of it", "None"],
          ],
        },
        {
          t: "example",
          title: "Runway 27, wind 300° 20 kt. Find the crosswind and headwind.",
          steps: ["Angle = 300 - 270 = 30°", "Crosswind = half of 20 = **10 kt**, from the right", "Headwind = 0.9 × 20 = **about 17 kt**"],
        },
      ],
    },
    {
      id: "local",
      title: "Local winds",
      blocks: [
        { t: "figure", key: "seabreeze", caption: "Sea breeze by day, land breeze by night." },
        {
          t: "p",
          text: "**Sea breeze and land breeze** come from the daily temperature difference between land and sea. By day the land heats faster, air rises over it, and cooler air flows in from the sea: a **sea breeze**, about 10 to 15 kt, felt up to 1,000 to 2,000 ft and some tens of km inland. At night the land cools faster and a weaker **land breeze** blows out to sea. **The sea breeze is stronger than the land breeze.**",
        },
        {
          t: "p",
          text: "**Anabatic and katabatic winds** come from heating and cooling of slopes. By day a sunny slope warms the air on it, which rises **up the slope**: an **anabatic** wind, light and often hidden by thermals. At night the slope cools the air on it, which drains **down the slope**: a **katabatic** wind. Katabatic winds are **stronger** and collect cold air in valleys, giving frost, mist and fog. Over snow or ice they can blow by day too and become very strong.",
        },
        {
          t: "tip",
          text: "**A**nabatic goes **A**scending, **K**atabatic **K**omes down. Day up, night down.",
        },
        { t: "figure", key: "foehn", caption: "Föhn effect: the air loses its moisture on the windward side and comes down the lee side warmer and drier." },
        {
          t: "p",
          text: "**Föhn wind.** Moist air forced up a mountain range cools, forms cloud and drops rain on the windward side. Inside the cloud it cools only at the slower saturated rate. On the lee side, now dry, it sinks and warms at the faster dry rate. So it reaches the lee foothills **warmer and drier** than it started. The **Chinook** of the Rocky Mountains is a föhn wind. Föhn needs a big mountain range, a strong wind blowing across it and moist air.",
        },
        {
          t: "table",
          head: ["Wind", "Where", "What it is"],
          rows: [
            ["**Loo**", "North India, May and June afternoons", "Hot, dry, dusty westerly. Very high density altitude"],
            ["**Föhn**", "Alps (lee side)", "Warm, dry downslope wind"],
            ["**Chinook**", "East of the Rocky Mountains", "Warm, dry föhn type wind. Can melt snow fast"],
            ["**Bora**", "Adriatic coast", "**Cold katabatic** wind, very gusty, can exceed 100 kt"],
            ["**Mistral**", "Rhône valley, south France", "Cold, strong northerly funnelled down the valley"],
            ["**Harmattan**", "West Africa", "Dry, dusty north easterly from the Sahara. **Poor visibility** in dust haze"],
            ["**Sirocco** (Khamsin in Egypt)", "North Africa to the Mediterranean", "Hot, dusty southerly. Picks up moisture over the sea"],
          ],
        },
        {
          t: "p",
          text: "**Valley and ravine winds**: when a pressure difference exists across a hill range, air is forced through gaps and valleys and speeds up, like water through a narrow pipe. Strong turbulence is found near the exit.",
        },
        {
          t: "p",
          text: "India's own seasonal and storm winds (monsoon, western disturbances, norwesters and dust storms) are in Module 10.",
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
            "Wind direction is **where it comes from**. METAR and forecasts **true**, ATC runway wind **magnetic**. Speed in **knots**.",
            "Surface wind measured at **10 m**. METAR wind averaged over **10 minutes**, ATC take-off and landing wind over **2 minutes**.",
            "**Veer clockwise, back anticlockwise.** Gusts reported when **10 kt or more** above the mean. Gale **34 kt** or more.",
            "Squall: sudden, lasts **a minute or more**, with CB.",
            "Coriolis: **right in NH**, left in SH. **Zero at the equator, maximum at the poles.** Grows with wind speed.",
            "Geostrophic wind: **PGF = Coriolis**, straight isobars, no friction, blows **along the isobars**.",
            "Same gradient: geostrophic wind **stronger at low latitudes**. Not used within about 15° of the equator.",
            "Gradient wind: curved isobars. **Weaker than geostrophic round a low, stronger round a high.**",
            "Cyclostrophic: PGF and centrifugal only. **Tornadoes, TRS centre, near the equator**.",
            "**Buys Ballot (NH): back to the wind, low on the left.** Anticlockwise round a low in the NH.",
            "Friction layer about **1 km**. Surface wind **crosses isobars towards low**: about **30° and half speed over land**, 10 to 15° and two thirds over sea.",
            "NH: surface wind is **backed and lighter** than 2,000 ft wind. Climbing, it **veers and increases**.",
            "By day surface wind **veers, strengthens, gusty**. At night it **backs and drops**.",
            "Thermal wind along isotherms, **cold air on the left** (NH). Veering with height = warm advection.",
            "Crosswind at 30° = **half**, at 60° = 0.9. Headwind at 60° = half.",
            "**Sea breeze by day, stronger. Land breeze by night.** Caused by the land and sea temperature difference.",
            "**Anabatic up the slope by day. Katabatic down the slope by night, stronger.**",
            "**Föhn and Chinook**: warm and dry on the lee side. **Bora**: cold katabatic. **Harmattan**: dust, poor visibility.",
          ],
        },
      ],
    },
  ],
  slides: [
    {
      title: "Reading the wind",
      points: [
        "Direction is **where it comes from**",
        "METAR: degrees **true**. ATC runway wind: **magnetic**",
        "Speed in knots. 1 m/s is about 2 kt",
        "Measured at **10 m**, averaged **10 min** (METAR), **2 min** (ATC)",
      ],
    },
    {
      title: "Wind words",
      points: [
        "**Veer**: clockwise. **Back**: anticlockwise",
        "**Gust**: 10 kt or more over the mean, for seconds",
        "**Squall**: sudden, a minute or more, with CB",
        "**Gale**: 34 kt or more",
      ],
    },
    {
      title: "Two forces",
      points: [
        "**Pressure gradient**: high to low, across the isobars",
        "**Coriolis**: turns wind **right in NH**",
        "Coriolis is zero at the equator, maximum at the poles",
        "Grows with wind speed, changes direction only",
      ],
      figure: "geostrophic",
    },
    {
      title: "Geostrophic wind",
      points: [
        "PGF = Coriolis. Blows **along straight isobars**",
        "Closer isobars, stronger wind",
        "Same gradient: **stronger at low latitudes**",
        "Not used within about 15° of the equator",
      ],
    },
    {
      title: "Curved isobars",
      points: [
        "Gradient wind: PGF, Coriolis and centrifugal",
        "Round a **low**: **weaker** than geostrophic",
        "Round a **high**: **stronger** than geostrophic",
        "**Cyclostrophic**: tornadoes, TRS centre",
      ],
    },
    {
      title: "Buys Ballot's law",
      points: [
        "NH: **back to the wind, low on the left**",
        "NH: anticlockwise round lows, clockwise round highs",
        "SH: the other way round",
      ],
    },
    {
      title: "Friction",
      points: [
        "Friction layer: lowest **1 km**",
        "Surface wind turns **towards low pressure**",
        "Land: about **30°**, **half** speed",
        "Sea: 10 to 15°, two thirds speed",
      ],
      figure: "friction",
    },
    {
      title: "Day and night",
      points: [
        "NH surface wind is **backed and lighter** than at 2,000 ft",
        "Climbing out: wind **veers and increases**",
        "Afternoon: thermals mix it down, **gusty and veered**",
        "Night: **backs and drops**, windshear above",
      ],
    },
    {
      title: "Thermal wind",
      points: [
        "Change of wind with height due to temperature",
        "Blows along isotherms, **cold on the left** (NH)",
        "Makes westerlies stronger with height",
        "Veering with height = warm air coming in",
      ],
    },
    {
      title: "Crosswind sums",
      points: [
        "30°: crosswind **half**",
        "45°: 0.7 each",
        "60°: crosswind 0.9, headwind **half**",
        "Rwy 27, wind 300/20: **10 kt** cross, 17 kt head",
      ],
    },
    {
      title: "Sea and land breeze",
      points: [
        "Land heats and cools faster than sea",
        "**Sea breeze by day**, 10 to 15 kt, stronger",
        "**Land breeze by night**, weaker",
      ],
      figure: "seabreeze",
    },
    {
      title: "Slope winds",
      points: [
        "**Anabatic**: up the slope by day, light",
        "**Katabatic**: down the slope at night, stronger",
        "Katabatic fills valleys with cold air: frost and fog",
        "**Bora**: a cold katabatic wind",
      ],
    },
    {
      title: "Föhn",
      points: [
        "Moist air rises, rains out on the windward side",
        "Comes down the lee side **warm and dry**",
        "**Chinook** in the Rockies",
        "Needs big mountains, strong wind, moist air",
      ],
      figure: "foehn",
    },
    {
      title: "Named winds",
      points: [
        "**Loo**: hot, dry, north India summer",
        "**Harmattan**: dusty, West Africa, poor visibility",
        "**Mistral**: cold, Rhône valley",
        "**Sirocco / Khamsin**: hot, dusty, North Africa",
      ],
    },
  ],
  mcqs: [
    { id: "m4-01", q: "A southerly wind is one that blows:", options: ["From the north towards the south", "From the south towards the north", "From the east", "Along the south coast"], answer: 1, why: "Wind is named for where it comes from. A southerly comes from the south." },
    { id: "m4-02", q: "Wind direction in METARs and TAFs is given with reference to:", options: ["Magnetic north", "Grid north", "True north", "The runway heading"], answer: 2, why: "Met reports and forecasts use true north. The wind ATC passes for take-off and landing is magnetic." },
    { id: "m4-03", q: "Surface wind instruments are normally mounted at a height of:", options: ["2 m", "1.25 m", "30 m", "10 m"], answer: 3, why: "The standard height is 10 m in open ground. 1.25 m is for the thermometer screen." },
    { id: "m4-04", q: "The wind reported in a METAR is averaged over:", options: ["10 minutes", "2 minutes", "1 minute", "30 minutes"], answer: 0, why: "METAR wind is a 10 minute average. ATC uses a 2 minute average for take-off and landing." },
    { id: "m4-05", q: "Wind speed is measured with an:", options: ["Anemometer", "Aneroid", "Altimeter", "Hygrometer"], answer: 0, why: "An anemometer measures wind speed. A wind vane shows direction." },
    { id: "m4-06", q: "A change of wind direction from 270° to 300° is called:", options: ["Backing", "Veering", "Gusting", "Shearing"], answer: 1, why: "Clockwise change is veering. Anticlockwise, such as 270° to 240°, is backing." },
    { id: "m4-07", q: "A change of wind direction from 090° to 060° is called:", options: ["Veering", "A lull", "Backing", "A squall"], answer: 2, why: "From 090° to 060° is anticlockwise, which is backing." },
    { id: "m4-08", q: "Gusts are reported in a wind report when the gust speed exceeds the mean speed by:", options: ["5 kt or more", "15 kt or more", "25 kt or more", "10 kt or more"], answer: 3, why: "Gusts are included when they are 10 kt or more above the mean wind." },
    { id: "m4-09", q: "The main difference between a squall and a gust is that a squall:", options: ["Lasts a minute or more and comes with CB", "Lasts only a few seconds", "Is always a decrease in wind", "Only occurs at night"], answer: 0, why: "A gust lasts seconds. A squall is a sudden strong rise lasting a minute or more, usually with CB or a thunderstorm." },
    { id: "m4-10", q: "A gale is a mean wind speed of:", options: ["22 kt or more", "34 kt or more", "48 kt or more", "64 kt or more"], answer: 1, why: "Gale is 34 kt or more. 64 kt or more is hurricane force." },
    { id: "m4-11", q: "In the northern hemisphere, the Coriolis force deflects moving air:", options: ["To the left", "Upwards", "To the right", "Towards the equator only"], answer: 2, why: "The earth's spin makes moving air turn right in the northern hemisphere and left in the southern." },
    { id: "m4-12", q: "The Coriolis force is:", options: ["Maximum at the equator and zero at the poles", "Zero at the equator and maximum at the poles", "The same at all latitudes", "Maximum at 45°"], answer: 1, why: "It depends on the sine of the latitude: sin 0° = 0 at the equator, sin 90° = 1 at the poles." },
    { id: "m4-13", q: "Which statement about the Coriolis force is correct?", options: ["It acts on still air", "It changes the wind speed", "It acts in the direction of the wind", "It increases as the wind speed increases"], answer: 3, why: "It is proportional to wind speed, acts at right angles to the wind, and changes only the direction." },
    { id: "m4-14", q: "The geostrophic wind results from a balance between:", options: ["Pressure gradient force and Coriolis force", "Coriolis force and friction", "Pressure gradient force and friction", "Centrifugal force and friction"], answer: 0, why: "Geostrophic wind is where the pressure gradient force and Coriolis force balance, with no friction and straight isobars." },
    { id: "m4-15", q: "The geostrophic wind blows:", options: ["Across the isobars from high to low", "Parallel to straight isobars", "Parallel to curved isobars", "From the sea to the land"], answer: 1, why: "When the two forces balance, the wind follows the straight isobars. Parallel to curved isobars is the gradient wind." },
    { id: "m4-16", q: "For the same pressure gradient, the geostrophic wind is:", options: ["Stronger at higher latitudes", "The same at all latitudes", "Stronger at lower latitudes", "Zero at 30°"], answer: 2, why: "Coriolis is weaker at low latitudes, so a stronger wind is needed to balance the same pressure gradient." },
    { id: "m4-17", q: "For the same pressure gradient, the wind at 70°N compared with the wind at 30°N would be:", options: ["Stronger", "The same", "Calm", "Weaker"], answer: 3, why: "Higher latitude, stronger Coriolis, so a lighter wind balances the same gradient." },
    { id: "m4-18", q: "The geostrophic wind formula cannot be used:", options: ["In mid latitudes", "Close to the equator", "Above 2,000 ft", "Over the sea"], answer: 1, why: "Near the equator Coriolis is nearly zero, so there is nothing to balance the pressure gradient force." },
    { id: "m4-19", q: "The main difference between the gradient wind and the geostrophic wind is that the gradient wind:", options: ["Blows along curved isobars", "Includes friction", "Blows across the isobars", "Only blows at night"], answer: 0, why: "Geostrophic is for straight isobars. Gradient wind is for curved isobars and includes the centrifugal effect." },
    { id: "m4-20", q: "For the same isobar spacing, the geostrophic wind round a low is stronger than the gradient wind because:", options: ["Centrifugal force adds to the pressure gradient force", "Friction is greater in a low", "Centrifugal force opposes the pressure gradient force", "Coriolis force is zero in a low"], answer: 2, why: "Round a low the pressure gradient force points in and centrifugal points out, so the net push is less and the gradient wind is weaker." },
    { id: "m4-21", q: "For the same isobar spacing, the wind would be strongest around:", options: ["A low", "A col", "A trough", "A high"], answer: 3, why: "Round a high the centrifugal effect adds to the pressure gradient force, so the gradient wind is stronger than geostrophic." },
    { id: "m4-22", q: "Cyclostrophic wind is a balance between the pressure gradient force and:", options: ["Coriolis force", "Centrifugal force", "Friction", "Gravity"], answer: 1, why: "In very tight, fast spinning systems like tornadoes, Coriolis is too small to matter, so only pressure gradient and centrifugal forces balance." },
    { id: "m4-23", q: "In the northern hemisphere, if you stand with your back to the wind, low pressure is:", options: ["On your left", "On your right", "In front of you", "Behind you"], answer: 0, why: "This is Buys Ballot's law. In the southern hemisphere low pressure is on your right." },
    { id: "m4-24", q: "In the southern hemisphere, wind around a low pressure area blows:", options: ["Anticlockwise", "Straight in towards the centre", "Clockwise", "Straight out from the centre"], answer: 2, why: "Coriolis turns air left in the southern hemisphere, so lows spin clockwise there." },
    { id: "m4-25", q: "The depth of the friction layer is normally about:", options: ["100 ft", "1 km (2,000 to 3,000 ft)", "5 km", "Up to the tropopause"], answer: 1, why: "Friction from the ground is felt up to about 1 km, deeper over rough ground and on hot unstable days." },
    { id: "m4-26", q: "Friction causes the surface wind to:", options: ["Blow faster than the geostrophic wind", "Blow parallel to the isobars", "Blow away from low pressure", "Blow across the isobars towards low pressure"], answer: 3, why: "Friction slows the wind, Coriolis weakens with it, and the pressure gradient force turns the wind in towards low pressure." },
    { id: "m4-27", q: "Over land in the northern hemisphere, the surface wind compared with the 2,000 ft wind is typically:", options: ["Veered by 30° and half the speed", "Backed by 30° and half the speed", "Backed by 10° and the same speed", "Veered by 10° and stronger"], answer: 1, why: "Over land friction is large: the surface wind is backed by about 30° and about half the speed (NH)." },
    { id: "m4-28", q: "Over the sea, compared with the wind above the friction layer, the surface wind crosses the isobars at about:", options: ["10° to 15°, at about two thirds of the speed", "30°, at about half the speed", "45°, at about a quarter of the speed", "0°, at the same speed"], answer: 0, why: "The sea is smooth, so friction is small: a small angle and only a modest drop in speed." },
    { id: "m4-29", q: "Compared with the wind at 3,000 ft, the surface wind:", options: ["Veers and is stronger", "Blows along the isobars and is stronger", "Blows across the isobars and is weaker", "Is the same"], answer: 2, why: "Friction slows the surface wind and turns it across the isobars towards low pressure." },
    { id: "m4-30", q: "In the northern hemisphere, climbing from the surface to 2,000 ft over land, the wind normally:", options: ["Backs and decreases", "Veers and increases", "Backs and increases", "Stays the same"], answer: 1, why: "You leave the friction behind, so the wind speeds up and turns clockwise towards the isobar direction." },
    { id: "m4-31", q: "The surface wind is usually strongest and most gusty:", options: ["Around dawn", "At midnight", "On a calm winter morning", "On a sunny afternoon"], answer: 3, why: "Afternoon thermals mix the faster upper wind down to the ground, making it stronger, veered and gusty." },
    { id: "m4-32", q: "On a clear night over land, compared with the afternoon, the surface wind will usually:", options: ["Back and decrease", "Veer and increase", "Back and increase", "Not change"], answer: 0, why: "A ground inversion forms, mixing stops, and the surface wind drops and backs while stronger wind blows above." },
    { id: "m4-33", q: "The thermal wind blows parallel to the isotherms with, in the northern hemisphere:", options: ["Warm air on the left", "Cold air on the left", "Low pressure on the right", "The wind always from the east"], answer: 1, why: "The thermal wind keeps cold air on its left in the NH. Since the poles are cold, it is mostly westerly." },
    { id: "m4-34", q: "In the northern hemisphere, a wind that veers with height above the friction layer shows:", options: ["Cold air being carried in", "No temperature change", "A col", "Warm air being carried in"], answer: 3, why: "Veering with height means warm advection. Backing with height means cold advection." },
    { id: "m4-35", q: "Runway 27, wind 300° 20 kt. The crosswind component is about:", options: ["5 kt", "10 kt", "17 kt", "20 kt"], answer: 1, why: "The wind is 30° off the runway. At 30° the crosswind is half the wind: 10 kt." },
    { id: "m4-36", q: "Runway 09, wind 150° 20 kt. The headwind component is about:", options: ["10 kt", "17 kt", "20 kt", "5 kt"], answer: 0, why: "The wind is 60° off the runway. At 60° the headwind is half the wind: 10 kt. The crosswind is about 17 kt." },
    { id: "m4-37", q: "The wind component most helpful for take-off is a:", options: ["Tailwind", "Crosswind", "Headwind", "Variable wind"], answer: 2, why: "A headwind gives lift at a lower ground speed, so the take-off run is shorter." },
    { id: "m4-38", q: "Land and sea breezes are caused by:", options: ["The Coriolis force", "The different daily heating and cooling of land and sea", "The smoothness of the sea", "The monsoon"], answer: 1, why: "Land heats and cools faster than water, so pressure differences set up a breeze that reverses between day and night." },
    { id: "m4-39", q: "Which is correct?", options: ["The land breeze is stronger than the sea breeze", "The land breeze blows by day", "The sea breeze blows at night", "The sea breeze is stronger than the land breeze"], answer: 3, why: "Daytime heating over land is stronger than night cooling, so the sea breeze is the stronger of the two." },
    { id: "m4-40", q: "A sea breeze blows:", options: ["From the sea to the land, by day", "From the land to the sea, by day", "From the sea to the land, at night", "Along the coast only"], answer: 0, why: "By day the land is warmer, air rises over it, and cooler sea air flows in." },
    { id: "m4-41", q: "Anabatic winds occur:", options: ["During the night", "Only over the sea", "During the day", "Only in winter"], answer: 2, why: "Sunny slopes warm the air on them, which flows up the slope by day." },
    { id: "m4-42", q: "Katabatic winds occur mainly:", options: ["During the night", "Around noon", "Only in thunderstorms", "Only near the equator"], answer: 0, why: "At night slopes cool the air on them, which drains downhill. Over snow they can blow by day too." },
    { id: "m4-43", q: "Which statement is correct?", options: ["Anabatic winds are stronger than katabatic winds", "Both are always the same strength", "Katabatic winds are stronger than anabatic winds", "Neither depends on time of day"], answer: 2, why: "Cold dense air draining downhill builds up more speed than warm air rising uphill, which is broken up by thermals." },
    { id: "m4-44", q: "A Bora is:", options: ["A warm dry föhn wind", "A dusty wind in Africa", "A cold katabatic wind on the Adriatic coast", "A hot wind in north India"], answer: 2, why: "The Bora is a cold, very gusty katabatic wind blowing down to the Adriatic coast." },
    { id: "m4-45", q: "The Chinook is:", options: ["A cold wind of Argentina", "A dust storm of Arabia", "A sea breeze in Chile", "A warm, dry wind on the lee side of the Rocky Mountains"], answer: 3, why: "The Chinook is a föhn type wind, warm and dry, on the eastern (lee) side of the Rockies." },
    { id: "m4-46", q: "Which of these is an example of a föhn wind?", options: ["Bora", "Harmattan", "Mistral", "Chinook"], answer: 3, why: "The Chinook is the classic föhn wind. Bora and Mistral are cold winds. Harmattan is a dusty desert wind." },
    { id: "m4-47", q: "A föhn wind is:", options: ["Warm and dry on the lee side of mountains", "Cold and moist on the windward side", "A night time valley breeze", "A sea breeze over mountains"], answer: 0, why: "The air drops its moisture on the windward side and comes down the lee side warmer and drier." },
    { id: "m4-48", q: "Why is the air warmer at the foot of the lee side than at the same level on the windward side?", options: ["The sun shines more on the lee side", "Friction heats it", "It cooled at the slower saturated rate going up but warms at the faster dry rate coming down", "The pressure is lower on the lee side"], answer: 2, why: "Going up in cloud it cools at the saturated rate (about 1.5 °C per 1000 ft). Coming down dry it warms at about 3 °C per 1000 ft." },
    { id: "m4-49", q: "The main hazard of the Harmattan is:", options: ["Severe icing", "Tropical cyclones", "Poor visibility in dust and sand haze", "Dense radiation fog"], answer: 2, why: "The Harmattan carries Sahara dust over West Africa, cutting visibility badly." },
    { id: "m4-50", q: "The Loo of north India is:", options: ["A cold northerly wind in winter", "A moist south westerly", "A sea breeze along the west coast", "A hot, dry westerly wind of summer afternoons"], answer: 3, why: "The Loo blows hot and dry across the plains of north India on May and June afternoons." },
  ],
};
