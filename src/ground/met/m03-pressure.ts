// Meteorology Module 3: Pressure and Altimetry. CAR Sec 7 Series B Part IV, Appendix B 1.1 c and f.
// Written fresh for Runway Zero. Values from the ICAO standard atmosphere and ICAO altimeter setting practice.
import type { Module } from "../types.ts";

export const M03: Module = {
  n: 3,
  title: "Pressure and Altimetry",
  car: "1.1 c, f",
  summary:
    "What air pressure is and how it changes with height, place and time, how it is shown on charts, the pressure settings QFE, QNH, QFF and 1013, transition altitude and level, and the altimeter errors that put aircraft closer to the ground than the pilot thinks.",
  sections: [
    {
      id: "what",
      title: "What pressure is",
      blocks: [
        {
          t: "p",
          text: "Atmospheric pressure at any point is the **weight of the column of air above it**, pressing on each unit of area. The higher you go, the less air there is above you, so **pressure always falls with height**.",
        },
        {
          t: "table",
          head: ["Unit", "ISA MSL value", "Note"],
          rows: [
            ["Hectopascal (hPa)", "1013.25", "Used by ICAO. 1 hPa = 100 N/m²"],
            ["Millibar (mb)", "1013.25", "Exactly the same size as the hPa"],
            ["Inches of mercury", "29.92", "Used in the USA and on some altimeters"],
            ["Millimetres of mercury", "760", "Used on older barometers"],
          ],
        },
        {
          t: "p",
          text: "Air at rest pushes equally in all directions. This is **static pressure**, the one a barometer reads. Moving air adds **dynamic pressure** in the direction of flow (what the pitot tube uses).",
        },
      ],
    },
    {
      id: "measure",
      title: "How pressure is measured",
      blocks: [
        {
          t: "table",
          head: ["Instrument", "How it works"],
          rows: [
            ["**Mercury barometer**", "Air pressure holds up a column of mercury. The most accurate, used as the standard at Met offices"],
            ["**Aneroid barometer**", "A sealed metal capsule with a partial vacuum that squeezes or swells as pressure changes. Less accurate but handy and robust"],
            ["**Barograph**", "An aneroid that draws a continuous record of pressure on a drum"],
            ["**Altimeter**", "An **aneroid barometer** whose scale reads height instead of pressure"],
          ],
        },
        {
          t: "p",
          text: "A mercury barometer reading is corrected for the instrument (index error), for temperature and for gravity, which changes slightly with latitude. Then it can be reduced to mean sea level so stations at different heights can be compared.",
        },
      ],
    },
    {
      id: "height",
      title: "Pressure and height",
      blocks: [
        {
          t: "p",
          text: "Pressure falls quickly near the ground and more slowly higher up, because the air is thinner there. In ISA, **1 hPa** of pressure change matches about:",
        },
        {
          t: "table",
          head: ["Height", "Height for 1 hPa"],
          rows: [
            ["Near MSL", "**27 ft (about 8 m)**. Use **30 ft** for quick altimeter sums"],
            ["10,000 ft", "about 36 ft"],
            ["18,000 ft (500 hPa)", "about 50 ft"],
            ["40,000 ft", "about 100 ft"],
          ],
        },
        {
          t: "p",
          text: "So near sea level a climb of 1000 ft lowers the pressure by about 33 to 37 hPa. Pressure is **half** the MSL value at about **18,000 ft**.",
        },
        {
          t: "p",
          text: "**Warm and cold columns.** Cold air is denser, so pressure falls **faster with height in cold air** and **more slowly in warm air**. A given pressure level (say 700 hPa) is therefore **lower over cold air and higher over warm air**. At the same height, the pressure is **higher over the warm area**. This is why highs aloft sit over warm air and lows aloft over cold air.",
        },
        { t: "figure", key: "columns", caption: "The same pressure levels sit lower over a cold column than over a warm one." },
      ],
    },
    {
      id: "charts",
      title: "Pressure on charts",
      blocks: [
        {
          t: "list",
          items: [
            "**Isobars** join places of equal pressure. On surface charts they show pressure reduced to MSL (**QFF**). In India they are drawn every **2 hPa**.",
            "**Pressure gradient** is how fast pressure changes across the isobars. **Close isobars mean a steep gradient and strong wind**. Widely spaced isobars mean light wind.",
            "**Contours** are used on upper air charts. They join places where a pressure level (such as 500 hPa) is at the same height. Low contour heights work just like low pressure.",
            "**Thickness** is the height gap between two pressure levels. Warm air makes a thick layer, cold air a thin one.",
          ],
        },
        { t: "figure", key: "systems", caption: "The five basic shapes of isobars, northern hemisphere." },
        {
          t: "table",
          head: ["System", "Shape", "Air", "Usual weather"],
          rows: [
            ["**Low** (depression)", "Closed isobars, lowest in the middle. Wind anticlockwise (NH)", "Converges and **rises**", "Cloud and rain, but good visibility once out of rain"],
            ["**Trough**", "V shaped tongue of low pressure", "Converges and rises", "Bad weather. **Wind veers** as a trough passes (NH)"],
            ["**High** (anticyclone)", "Closed isobars, highest in the middle. Wind clockwise (NH)", "**Sinks** and diverges", "Fair, light winds, but haze and poor visibility. Fog in winter"],
            ["**Ridge**", "U shaped (rounded) tongue of high pressure", "Sinks", "Fair weather"],
            ["**Col**", "The saddle between two highs and two lows", "Little movement", "Light and variable wind, mixed weather, fog or thunderstorms by season"],
          ],
        },
        {
          t: "p",
          text: "Pressure systems are covered in more depth in Module 8.",
        },
      ],
    },
    {
      id: "time",
      title: "Pressure through the day",
      blocks: [
        {
          t: "p",
          text: "Even with no weather system around, pressure rises and falls **twice a day**: highest around **1000 and 2200** local time, lowest around **0400 and 1600**. This is the **semi-diurnal variation**. It is about **3 hPa in the tropics** and almost nil near the poles.",
        },
        {
          t: "p",
          text: "Because this daily swing is large in India, **pressure tendency** (the change of pressure with time) is worked out over **24 hours** in India. In higher latitudes it is taken over the last **3 hours**. Lines joining equal pressure tendency are **isallobars**. A low tends to move towards the area of greatest pressure fall.",
        },
      ],
    },
    {
      id: "settings",
      title: "Altimeter settings: QFE, QNH, QFF and 1013",
      blocks: [
        {
          t: "p",
          text: "An altimeter only measures pressure. It shows height above whatever pressure you set in its **subscale**. Change the setting and you change the reference level.",
        },
        { t: "figure", key: "altimetry", caption: "Same aircraft, three settings, three readings." },
        {
          t: "table",
          head: ["Setting", "What it is", "Altimeter shows"],
          rows: [
            ["**QFE**", "Pressure at aerodrome level", "**Height** above the aerodrome. **Zero** on the runway"],
            ["**QNH**", "Aerodrome pressure brought down to MSL **using ISA**", "**Altitude** above MSL. Shows **aerodrome elevation** on the runway"],
            ["**QFF**", "Station pressure brought down to MSL **using the actual temperature**", "Not set on altimeters. Used to draw **isobars** on weather charts"],
            ["**Standard 1013.25 hPa**", "The ISA MSL pressure", "**Pressure altitude**, used for **flight levels**"],
            ["**QNE**", "Not a setting. The height the altimeter shows on the runway with 1013 set", "The aerodrome's pressure altitude"],
          ],
        },
        {
          t: "tip",
          text: "**QFE = Field Elevation is zero. QNH = Nautical Height (above sea). QFF = For Forecasting charts.**",
        },
        {
          t: "list",
          items: [
            "**Elevation**: how high a point on the ground is above MSL.",
            "**Altitude**: how high something in the air is above MSL.",
            "**Height**: how high something is above a stated point, usually the ground or aerodrome.",
            "**Pressure altitude**: altimeter reading with 1013.25 set.",
            "**Flight level**: pressure altitude in hundreds of feet. FL 80 = 8,000 ft on 1013.",
          ],
        },
        {
          t: "p",
          text: "**Quick sums with 30 ft per hPa.** The gap between QNH and QFE comes from the aerodrome's elevation:",
        },
        {
          t: "example",
          title: "Aerodrome elevation 900 ft, QNH 1012 hPa. Find QFE.",
          steps: ["Elevation in hPa = 900 ÷ 30 = 30 hPa", "Aerodrome is above MSL, so its pressure is lower", "QFE = 1012 - 30 = **982 hPa**"],
        },
        {
          t: "example",
          title: "QNH 1003 hPa. What does the altimeter show on the runway with 1013 set?",
          steps: ["1013 is 10 hPa more than QNH", "Setting a higher value makes the altimeter read higher: 10 × 30 = 300 ft", "It shows elevation + 300 ft. That is the aerodrome's pressure altitude"],
        },
        {
          t: "list",
          items: [
            "The **higher the aerodrome**, the **bigger the gap** between QNH and QFE.",
            "For an aerodrome **at MSL**, QNH = QFE.",
            "For an aerodrome **below MSL**, QFE is **more** than QNH.",
            "If QNH is exactly 1013.2 hPa, the aerodrome's pressure altitude equals its elevation.",
            "Two aerodromes with the same QNH: the **lower** one has the **higher QFE**.",
          ],
        },
        {
          t: "p",
          text: "**QNH and QFF.** Both bring pressure down to MSL, but QNH uses ISA temperature and QFF the real one. For an aerodrome above MSL: when the air is **colder than ISA**, the imaginary column is denser, so **QFF is more than QNH**. When it is **warmer than ISA**, **QFF is less than QNH**. In ISA they are equal.",
        },
      ],
    },
    {
      id: "transition",
      title: "Transition altitude and transition level",
      blocks: [
        {
          t: "table",
          head: ["Term", "Meaning"],
          rows: [
            ["**Transition altitude (TA)**", "The altitude **at or below** which you fly on **QNH** and report **altitude**"],
            ["**Transition level (TL)**", "The **lowest flight level** you can use above the TA. At or above it you fly on **1013.2** and report **flight levels**"],
            ["**Transition layer**", "The airspace between the TA and the TL"],
          ],
        },
        {
          t: "list",
          items: [
            "**Climbing**: set **1013** as you pass the **transition altitude**.",
            "**Descending**: set **QNH** as you pass the **transition level**.",
            "Inside the transition layer, report **flight level** when climbing and **altitude** when descending.",
          ],
        },
        {
          t: "p",
          text: "Everyone above the TL uses the same setting, so aircraft stay safely apart without changing the setting at every town. Below the TA, QNH keeps the altimeter tied to terrain heights on the chart.",
        },
      ],
    },
    {
      id: "errors",
      title: "Altimeter errors from pressure and temperature",
      blocks: [
        {
          t: "p",
          text: "The altimeter assumes ISA. When the real air is different, it reads wrong. **Over-reading** (showing higher than you really are) is the dangerous one, because you are closer to the ground than you think.",
        },
        { t: "figure", key: "hightolow", caption: "Holding the same indicated altitude from high to low pressure takes you lower and lower." },
        {
          t: "table",
          head: ["You fly", "Altimeter", "True altitude is"],
          rows: [
            ["From **high to low** pressure (setting not changed)", "**Over-reads**", "**Lower** than shown"],
            ["From **low to high** pressure", "Under-reads", "Higher than shown"],
            ["Into air **colder than ISA**", "**Over-reads**", "**Lower** than shown"],
            ["Into air **warmer than ISA**", "Under-reads", "Higher than shown"],
          ],
        },
        {
          t: "tip",
          text: "**\"High to low, or hot to cold: look out below.\"** Both make the altimeter read too high.",
        },
        {
          t: "p",
          text: "**Rules for the size of the error:**",
        },
        {
          t: "list",
          items: [
            "Pressure: about **30 ft for every 1 hPa** the setting is wrong.",
            "Temperature: about **4% of the height above the setting datum for every 10 °C** away from ISA. Some books say 1% for every 3 °C, which gives nearly the same answer.",
          ],
        },
        {
          t: "example",
          title: "Departed with QNH 1020 set and forgot to change it. Now flying at 3,000 ft indicated where QNH is 1005.",
          steps: ["Setting is 15 hPa too high", "Error = 15 × 30 = 450 ft, altimeter over-reads", "True altitude = 3,000 - 450 = **2,550 ft**"],
        },
        {
          t: "example",
          title: "Flying at 5,000 ft on QNH. Air is ISA -15 °C. Find the true altitude.",
          steps: ["Colder than ISA, so the altimeter over-reads", "Error = 4% × 1.5 = 6% of 5,000 = 300 ft", "True altitude = 5,000 - 300 = **about 4,700 ft**"],
        },
        {
          t: "p",
          text: "**Drift tells you too.** In the northern hemisphere, with your back to the wind, low pressure is on your left (Buys Ballot's law, Module 4). So if the wind comes from your **left (port)**, you drift to starboard and you are heading towards low pressure: the altimeter **over-reads**. Wind from the **right (starboard)**, port drift: it **under-reads**. It is the other way round in the southern hemisphere.",
        },
        {
          t: "list",
          items: [
            "The **safest** conditions for terrain clearance are **warm air and high pressure**. Then you are higher than the altimeter says.",
            "The **worst** are **cold air and low pressure**. The lowest usable flight level is worked out from the **lowest QNH** and the **coldest temperature** expected.",
            "A **radio altimeter** measures true height above the ground directly with radio waves, so it has no pressure or temperature error.",
            "Setting a subscale value **higher** than the correct QNH makes the altimeter read **too high**, by 30 ft per hPa.",
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
            "Pressure = weight of air above. **1013.25 hPa = 29.92 in = 760 mm**. 1 hPa = 1 mb.",
            "Mercury barometer is most accurate. **Altimeter = aneroid barometer**. Barograph records pressure.",
            "1 hPa is about **27 ft (8 m) near MSL**, use **30 ft** for sums. About 50 ft at 18,000 ft, 100 ft at 40,000 ft.",
            "Pressure falls **faster with height in cold air**. Pressure levels are **higher over warm air**.",
            "Surface chart isobars show **QFF**. India draws them every **2 hPa**. Close isobars, strong wind.",
            "Semi-diurnal: highs about **1000 and 2200**, lows about **0400 and 1600** local. About 3 hPa in the tropics.",
            "India uses **24 hour** pressure tendency. Isallobars join equal pressure tendency.",
            "Low: rising air, bad weather, better visibility. High: sinking air, fair, **poor visibility**, light winds.",
            "Trough: V shaped, rising air, **wind veers** as it passes (NH). Ridge: U shaped. Col: between two highs and two lows.",
            "**QFE** reads zero on the runway. **QNH** reads elevation. **1013** gives pressure altitude and flight levels. **QFF** for charts.",
            "Higher aerodrome = bigger QNH to QFE gap. Below MSL: **QFE > QNH**.",
            "Colder than ISA: **QFF > QNH**. Warmer than ISA: QFF < QNH.",
            "Climbing: 1013 at **TA**. Descending: QNH at **TL**.",
            "**High to low or hot to cold: over-reads, look out below**.",
            "NH: wind from **port** (starboard drift) means **over-read**.",
            "Safest for terrain: **warm and high pressure**. Lowest flight level uses **lowest QNH and coldest temperature**.",
          ],
        },
      ],
    },
  ],
  slides: [
    {
      title: "What pressure is",
      points: [
        "The **weight of the air** above a point",
        "Always **falls with height**",
        "**1013.25 hPa = 29.92 in = 760 mm**",
        "1 hPa = 1 mb",
      ],
    },
    {
      title: "Measuring pressure",
      points: [
        "**Mercury barometer**: the most accurate",
        "**Aneroid**: sealed capsule, handy",
        "**Barograph**: continuous record",
        "**Altimeter**: an aneroid that reads in feet",
      ],
    },
    {
      title: "How fast pressure falls",
      points: [
        "1 hPa = about **27 ft** near MSL. Use **30 ft** for sums",
        "About 50 ft per hPa at 18,000 ft, 100 ft at 40,000 ft",
        "Half the MSL pressure at about **18,000 ft**",
      ],
    },
    {
      title: "Warm and cold columns",
      points: [
        "Pressure falls **faster in cold air**",
        "Pressure levels sit **lower over cold air**",
        "At the same height, pressure is **higher over warm air**",
      ],
      figure: "columns",
    },
    {
      title: "Isobars and systems",
      points: [
        "Isobars on surface charts show **QFF**, every 2 hPa in India",
        "Close isobars = **strong wind**",
        "Low and trough: rising air, bad weather",
        "High and ridge: sinking air, fair, hazy",
      ],
      figure: "systems",
    },
    {
      title: "Pressure through the day",
      points: [
        "Two highs (**1000, 2200**) and two lows (**0400, 1600**)",
        "About **3 hPa** in the tropics",
        "India uses **24 hour** pressure tendency",
        "**Isallobars** join equal tendency",
      ],
    },
    {
      title: "The settings",
      points: [
        "**QFE**: height, zero on the runway",
        "**QNH**: altitude, elevation on the runway",
        "**1013**: pressure altitude, flight levels",
        "**QFF**: for drawing isobars",
      ],
      figure: "altimetry",
    },
    {
      title: "QNH and QFE sums",
      points: [
        "Gap = elevation ÷ 30 ft",
        "Elevation 900 ft, QNH 1012: **QFE 982**",
        "Higher aerodrome, bigger gap",
        "Below MSL: QFE **more** than QNH",
      ],
    },
    {
      title: "Transition",
      points: [
        "**TA**: at or below, fly on **QNH**",
        "**TL**: lowest flight level, fly on **1013**",
        "Climbing: set 1013 at **TA**",
        "Descending: set QNH at **TL**",
      ],
    },
    {
      title: "Look out below",
      points: [
        "**High to low**: over-reads",
        "**Hot to cold**: over-reads",
        "30 ft per hPa, 4% per 10 °C",
        "NH wind from **port**: over-reads",
      ],
      figure: "hightolow",
    },
    {
      title: "Safe and unsafe",
      points: [
        "Safest: **warm** air, **high** pressure",
        "Worst: **cold** air, **low** pressure",
        "Lowest FL uses lowest QNH and coldest temperature",
        "Radio altimeter: true height, no pressure error",
      ],
    },
  ],
  mcqs: [
    { id: "m3-01", q: "Atmospheric pressure at a place is best described as:", options: ["The weight of the column of air above that place", "The temperature of the air", "The density of air at the surface", "The force of the wind"], answer: 0, why: "Pressure is the weight of all the air above, pressing on each unit of area. That is why it falls with height." },
    { id: "m3-02", q: "1013.25 hPa is equal to:", options: ["29.92 inches and 760 mm of mercury", "30.92 inches and 760 mm of mercury", "29.92 inches and 700 mm of mercury", "27.92 inches and 760 mm of mercury"], answer: 0, why: "ISA MSL pressure is 1013.25 hPa = 29.92 inches = 760 mm of mercury." },
    { id: "m3-03", q: "An altimeter is basically a:", options: ["Mercury barometer", "Aneroid barometer", "Radio altimeter", "Barograph"], answer: 1, why: "An altimeter is an aneroid capsule with a scale marked in feet instead of hPa." },
    { id: "m3-04", q: "The most accurate instrument for measuring atmospheric pressure is the:", options: ["Aneroid barometer", "Altimeter", "Barograph", "Mercury barometer"], answer: 3, why: "The mercury barometer is the standard. Aneroids are handier but less accurate." },
    { id: "m3-05", q: "An instrument that keeps a continuous record of pressure is a:", options: ["Hygrograph", "Anemograph", "Barograph", "Thermograph"], answer: 2, why: "A barograph records pressure. Hygrograph is humidity, anemograph is wind, thermograph is temperature." },
    { id: "m3-06", q: "Near mean sea level, a pressure change of 1 hPa matches a height change of about:", options: ["8 m (27 ft)", "20 m (65 ft)", "30 m (100 ft)", "3 m (10 ft)"], answer: 0, why: "In ISA near MSL, 1 hPa is about 27 ft, or 8 m. For quick sums we round to 30 ft." },
    { id: "m3-07", q: "Near sea level, a climb of 1000 ft lowers the pressure by about:", options: ["3 hPa", "33 hPa", "100 hPa", "10 hPa"], answer: 1, why: "At about 30 ft per hPa, 1000 ft is about 33 hPa." },
    { id: "m3-08", q: "At about 40,000 ft, 1 hPa of pressure change matches a height change of about:", options: ["27 ft", "50 ft", "100 ft", "300 ft"], answer: 2, why: "The air is thin up there, so pressure falls slowly with height: about 100 ft per hPa." },
    { id: "m3-09", q: "Compared with a warm air mass, pressure in a cold air mass falls with height:", options: ["More slowly", "At the same rate", "Not at all", "More rapidly"], answer: 3, why: "Cold air is denser, so each foot of climb leaves more weight of air below. Pressure falls faster." },
    { id: "m3-10", q: "Two aircraft fly at the same indicated altitude with 1013.2 set. One is over a cold air mass, the other over a warm air mass. Which is truly higher?", options: ["The one over the warm air mass", "The one over the cold air mass", "Both are at the same true altitude", "It depends on the wind"], answer: 0, why: "Pressure levels sit higher in warm air. Following the same pressure level, the aircraft over warm air is higher." },
    { id: "m3-11", q: "At the same height, pressure is usually:", options: ["Higher over a cold area", "Higher over a warm area", "Equal everywhere", "Lowest over the sea"], answer: 1, why: "Pressure falls more slowly in warm air, so at a given height a warm column keeps more pressure." },
    { id: "m3-12", q: "Isobars on a surface weather chart are lines joining places of equal:", options: ["QNH", "QFE", "QFF", "QNE"], answer: 2, why: "Surface charts use pressure reduced to MSL with the actual temperature, which is QFF." },
    { id: "m3-13", q: "On Indian weather charts, isobars are normally drawn at intervals of:", options: ["1 hPa", "2 hPa", "4 hPa", "5 hPa"], answer: 1, why: "India draws isobars every 2 hPa. Many other countries use 4 hPa." },
    { id: "m3-14", q: "Closely spaced isobars indicate:", options: ["Light winds", "Calm conditions", "A col", "A steep pressure gradient and strong winds"], answer: 3, why: "Close isobars mean pressure changes quickly across a short distance, which drives strong wind." },
    { id: "m3-15", q: "What name is given to lines that link places with the same pressure tendency?", options: ["Isallobars", "Isobars", "Isotherms", "Isogonals"], answer: 0, why: "Isallobars join equal pressure change over a set time. A low tends to move towards the biggest fall." },
    { id: "m3-16", q: "In India, pressure tendency is normally worked out over:", options: ["1 hour", "3 hours", "12 hours", "24 hours"], answer: 3, why: "The twice daily pressure swing is large in the tropics, so India compares with the same time a day earlier." },
    { id: "m3-17", q: "The semi-diurnal variation of pressure is most marked in the:", options: ["Polar regions", "Middle latitudes", "Tropics", "Stratosphere"], answer: 2, why: "It is about 3 hPa in the tropics and nearly nil near the poles." },
    { id: "m3-18", q: "Due to the semi-diurnal variation, the daily pressure maximums occur at about:", options: ["0400 and 1600 local time", "1000 and 2200 local time", "Noon and midnight", "Sunrise and sunset"], answer: 1, why: "Highs come at about 1000 and 2200 local time, lows at about 0400 and 1600." },
    { id: "m3-19", q: "A region between two highs and two lows is called a:", options: ["Ridge", "Trough", "Col", "Depression"], answer: 2, why: "A col is the saddle between two highs and two lows. Winds there are light and variable." },
    { id: "m3-20", q: "Which is true of a high pressure area (anticyclone)?", options: ["Rising air, cloud and rain", "Strong winds", "Sinking air, light winds and often poor visibility in haze", "Thunderstorms at the centre"], answer: 2, why: "Air sinks and warms in a high, so cloud is rare, but haze and smoke are trapped and visibility can be poor." },
    { id: "m3-21", q: "In a trough of low pressure, the air is generally:", options: ["Descending and diverging", "Descending and converging", "Ascending and diverging", "Ascending and converging"], answer: 3, why: "Air flows in (converges) and rises in a trough, giving cloud and bad weather." },
    { id: "m3-22", q: "In the northern hemisphere, as a trough passes a station the wind normally:", options: ["Backs", "Veers", "Stays the same", "Becomes calm for a day"], answer: 1, why: "The wind changes direction clockwise, for example from south west to north west, as the trough goes by." },
    { id: "m3-23", q: "With the altimeter subscale set to QFE, on landing the altimeter reads:", options: ["Aerodrome elevation", "Pressure altitude", "Zero", "Height above MSL"], answer: 2, why: "QFE is the pressure at aerodrome level, so the altimeter shows height above the aerodrome, which is zero on the runway." },
    { id: "m3-24", q: "An aircraft on the ground shows the aerodrome elevation on its altimeter. The subscale is set to:", options: ["QFE", "QNH", "QFF", "1013.2 hPa"], answer: 1, why: "With QNH set the altimeter shows altitude above MSL, so on the ground it reads the elevation." },
    { id: "m3-25", q: "QNH is the aerodrome pressure reduced to MSL:", options: ["Using ISA conditions", "Using the actual temperature", "Using the dew point", "Without any correction"], answer: 0, why: "QNH uses ISA. QFF uses the actual temperature." },
    { id: "m3-26", q: "With 1013.2 hPa set on the subscale, the altimeter shows:", options: ["Height above the aerodrome", "Altitude above MSL", "True altitude", "Pressure altitude"], answer: 3, why: "1013.2 is the ISA MSL pressure, so the reading is pressure altitude. Flight levels use this setting." },
    { id: "m3-27", q: "If the QNH at a place is 1013.2 hPa, the pressure altitude of the aerodrome is:", options: ["Zero", "Equal to its elevation", "Higher than its elevation", "Lower than its elevation"], answer: 1, why: "When QNH and the standard setting are the same, both give the same reading: the elevation." },
    { id: "m3-28", q: "The higher the elevation of an aerodrome, the difference between QNH and QFE will be:", options: ["Less", "Greater", "No difference", "Zero"], answer: 1, why: "The gap is the pressure of the air between MSL and the aerodrome, about 1 hPa for every 30 ft of elevation." },
    { id: "m3-29", q: "Aerodrome elevation 900 ft, QNH 1012 hPa. The QFE is about:", options: ["982 hPa", "1042 hPa", "1003 hPa", "1012 hPa"], answer: 0, why: "900 ÷ 30 = 30 hPa. The aerodrome is above MSL, so QFE = 1012 - 30 = 982 hPa." },
    { id: "m3-30", q: "Aerodromes A (elevation 800 ft) and B (elevation 1200 ft) have the same QNH. The QFE at A is:", options: ["Lower than at B", "The same as at B", "Higher than at B", "Not related to B"], answer: 2, why: "A is lower down, with more air above it, so its station pressure (QFE) is higher." },
    { id: "m3-31", q: "For an aerodrome 50 ft below MSL:", options: ["QFE is less than QNH", "QFE equals QNH", "There is no relation", "QFE is more than QNH"], answer: 3, why: "Below MSL there is extra air above the aerodrome, so its station pressure is higher than the MSL value." },
    { id: "m3-32", q: "An aerodrome is 300 m above MSL, QNH 1012 hPa and the air is ISA -10 °C. The QFF is:", options: ["More than 1012 hPa", "Less than 1012 hPa", "Equal to 1012 hPa", "Equal to the QFE"], answer: 0, why: "QFF uses the actual cold air, which is denser, so adding the imaginary column down to MSL raises the pressure more than ISA does." },
    { id: "m3-33", q: "QNE is:", options: ["A pressure setting used for landing", "The height shown on the altimeter on the runway with 1013.2 set", "The QNH of the region", "Pressure reduced to MSL using actual temperature"], answer: 1, why: "QNE is not a pressure but a reading: the aerodrome's pressure altitude, shown with 1013.2 set." },
    { id: "m3-34", q: "The transition altitude is the altitude:", options: ["At or below which vertical position is given as altitude, on QNH", "At or above which flight levels are used", "Of the highest obstacle in the area", "At which the aircraft levels off"], answer: 0, why: "At or below the TA you fly on QNH and report altitude. Flight levels start at the transition level." },
    { id: "m3-35", q: "The transition level is:", options: ["The highest altitude on QNH", "The lowest flight level available for use above the transition altitude", "Always FL 100", "The level at which the temperature is 0 °C"], answer: 1, why: "The TL is the lowest usable flight level. The layer between the TA and TL is the transition layer." },
    { id: "m3-36", q: "During a climb, the altimeter is normally changed from QNH to 1013.2 hPa:", options: ["On reaching the transition level", "At top of climb", "On passing the transition altitude", "Before take-off"], answer: 2, why: "Climbing, you change to 1013.2 as you pass the TA. Descending, you change to QNH as you pass the TL." },
    { id: "m3-37", q: "During descent, the altimeter is normally changed from 1013.2 hPa to QNH:", options: ["On passing the transition level", "On passing the transition altitude", "At 1,000 ft", "On landing"], answer: 0, why: "Descending, you set QNH as you pass the TL, so you report altitude in the transition layer." },
    { id: "m3-38", q: "Flying from a high pressure area to a low pressure area without changing the subscale, the altimeter will:", options: ["Read correctly", "Under-read", "Read zero", "Over-read"], answer: 3, why: "\"High to low, look out below.\" The aircraft sinks with the pressure surfaces while the reading stays the same." },
    { id: "m3-39", q: "Flying from low pressure to high pressure without changing the subscale, the true altitude will be:", options: ["Higher than indicated", "Lower than indicated", "The same as indicated", "Zero"], answer: 0, why: "Low to high, the altimeter under-reads, so you are higher than it shows." },
    { id: "m3-40", q: "When flying in air much colder than ISA, the altimeter will:", options: ["Read correctly", "Over-read", "Under-read", "Freeze"], answer: 1, why: "In cold, dense air the pressure levels are closer together and lower, so the altimeter shows more height than you really have." },
    { id: "m3-41", q: "On a hot summer day, an aircraft flying close to the ground has an altimeter reading that is:", options: ["Higher than the actual altitude", "The same as the actual altitude", "Lower than the actual altitude", "Zero"], answer: 2, why: "Warmer than ISA, the altimeter under-reads, so it shows less height than you actually have." },
    { id: "m3-42", q: "Flying on QNH on a very cold day, you circle exactly at the height of a mountain peak. Your altimeter will read:", options: ["The same as the peak elevation", "Lower than the peak elevation", "Zero", "Higher than the peak elevation"], answer: 3, why: "In cold air the altimeter over-reads. At the true height of the peak it shows more than the peak elevation, which is how pilots hit peaks they think they are above." },
    { id: "m3-43", q: "In the northern hemisphere, if an aircraft has port drift, the altimeter will:", options: ["Over-read", "Under-read", "Read correctly", "Read pressure altitude"], answer: 1, why: "Port drift means the wind is from the right (starboard). With your back to that wind, low pressure is on your left, behind the aircraft. You are heading towards high pressure, so it under-reads." },
    { id: "m3-44", q: "In the northern hemisphere, an aircraft flying with the wind from the port side will find that its altimeter tends to:", options: ["Over-read", "Under-read", "Stay correct", "Read zero"], answer: 0, why: "Wind from the left, back to the wind, low pressure is on your left, which is ahead of the aircraft. Flying towards low pressure, it over-reads." },
    { id: "m3-45", q: "You took off with QNH 1020 set and did not reset it. Now you are at 3,000 ft indicated where QNH is 1005. Your true altitude is about:", options: ["3,450 ft", "3,000 ft", "2,550 ft", "1,500 ft"], answer: 2, why: "The setting is 15 hPa too high. 15 × 30 = 450 ft over-read. 3,000 - 450 = 2,550 ft." },
    { id: "m3-46", q: "Flying at 5,000 ft on QNH in air that is ISA -15 °C, the true altitude is about:", options: ["5,300 ft", "5,000 ft", "4,250 ft", "4,700 ft"], answer: 3, why: "About 4% per 10 °C, so 6% of 5,000 = 300 ft. Cold air, over-reads, so true altitude is about 4,700 ft." },
    { id: "m3-47", q: "Which conditions give the greatest clearance above obstacles at a given indicated altitude?", options: ["Cold air and low pressure", "Cold air and high pressure", "Warm air and low pressure", "Warm air and high pressure"], answer: 3, why: "Warm air and high pressure both make the altimeter under-read, so you are higher than shown." },
    { id: "m3-48", q: "The lowest usable flight level is worked out using:", options: ["The QFE of the departure aerodrome", "The highest QNH and the highest temperature", "The average QNH", "The lowest QNH and the lowest (most negative) temperature deviation"], answer: 3, why: "Low pressure and cold air both make an aircraft lower than its flight level suggests, so the worst case of each is used." },
    { id: "m3-49", q: "If the subscale is set to a value higher than the actual QNH, the altimeter will show:", options: ["Less than the true altitude", "The true altitude", "More than the true altitude", "Pressure altitude"], answer: 2, why: "A higher setting moves the reference level down, so the altimeter reads higher, by about 30 ft per hPa." },
    { id: "m3-50", q: "The approximate height of the 250 hPa level in the ISA is:", options: ["18,000 ft", "30,000 ft", "34,000 ft", "39,000 ft"], answer: 2, why: "250 hPa is about 34,000 ft. 500 hPa is about 18,000, 300 hPa about 30,000, 200 hPa about 39,000." },
  ],
};
