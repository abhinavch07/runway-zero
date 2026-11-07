// Meteorology Module 2: Temperature, Density and Humidity. CAR Sec 7 Series B Part IV, Appendix B 1.1 b, d and 1.3 a.
// Written fresh for Runway Zero. Facts checked against the DGCA syllabus, ICAO ISA and standard humidity tables.
import type { Module } from "../types.ts";

export const M02: Module = {
  n: 2,
  title: "Temperature, Density and Humidity",
  car: "1.1 b, d, 1.3 a",
  summary:
    "How the sun heats the earth and the earth heats the air, why temperature swings through the day, what makes air dense or thin, density altitude and performance, and every humidity term from dew point to mixing ratio.",
  sections: [
    {
      id: "heat",
      title: "Heat and temperature",
      blocks: [
        {
          t: "p",
          text: "**Heat** is energy: the total energy of movement of all the molecules in something. **Temperature** is how hot or cold it is: the average energy of its molecules. A full bucket of warm water has more heat than a cup of boiling water, even though the cup is at a higher temperature.",
        },
        {
          t: "table",
          head: ["Scale", "Water freezes", "Water boils", "Convert"],
          rows: [
            ["Celsius (°C)", "0", "100", "Used in aviation and science"],
            ["Fahrenheit (°F)", "32", "212", "F = (9/5 × C) + 32"],
            ["Kelvin (K)", "273", "373", "K = C + 273. 0 K is absolute zero"],
          ],
        },
        { t: "tip", text: "**-40 °C = -40 °F.** It is the one temperature where both scales read the same, a favourite exam question." },
        {
          t: "p",
          text: "**Specific heat** is the heat needed to warm 1 gram of something by 1 °C. Water has a very high specific heat (1), land only about 0.2. So **land heats up and cools down much faster than water**. This one fact explains sea breezes, the monsoon and why coastal places have mild days and nights.",
        },
      ],
    },
    {
      id: "measure",
      title: "How temperature is measured",
      blocks: [
        {
          t: "p",
          text: "Surface air temperature is measured in the shade, in a **Stevenson screen**: a white wooden box with louvred sides so air flows through but sunlight does not. The thermometers sit about **1.25 m (4 ft) above the ground**, over grass. The door opens on the side **facing the pole** (north, in India), so the sun never shines in when it is opened.",
        },
        {
          t: "table",
          head: ["Instrument", "What it does"],
          rows: [
            ["Dry bulb thermometer", "Ordinary air temperature"],
            ["Wet bulb thermometer", "Bulb wrapped in wet muslin. Reads lower in dry air. Used with the dry bulb to find humidity"],
            ["Maximum thermometer", "**Mercury**, with a narrow kink so it stays at the highest reading"],
            ["Minimum thermometer", "**Alcohol**, with a small index that is pulled back to the lowest reading"],
            ["Thermograph", "**Bimetallic strip** that draws a continuous record"],
            ["Radiosonde", "Balloon borne. Measures temperature, humidity and pressure at upper levels"],
          ],
        },
      ],
    },
    {
      id: "sun",
      title: "How the sun heats the earth",
      blocks: [
        {
          t: "p",
          text: "Every object gives out radiation. **The hotter it is, the more it gives out and the shorter the wavelength.** (These are Stefan's law: energy goes up with the fourth power of absolute temperature, and Wien's law: wavelength is shorter for a hotter body.)",
        },
        {
          t: "list",
          items: [
            "The sun, at about 6000 °C, sends **short wave** radiation: about half infrared, a bit less than half visible light, and a small part ultraviolet.",
            "The earth, being much cooler, gives out **long wave** (infrared) radiation, day and night. At night this is called **nocturnal radiation**.",
            "Air lets most short wave sunlight pass straight through. But **water vapour, CO₂ and pollution absorb long wave radiation** from the earth. This is how the air gets most of its heat.",
          ],
        },
        {
          t: "p",
          text: "So the **troposphere is heated mainly from below**: by long wave radiation from the earth, and by conduction and convection from the warm ground.",
        },
        {
          t: "p",
          text: "**Insolation** is the amount of sunlight received on an area. It is greatest when the sun is overhead (rays hit straight on) and least when the sun is low. So the tropics get the most and the poles the least.",
        },
        {
          t: "p",
          text: "**Albedo** is the share of sunlight a surface reflects. **Fresh snow** has the highest albedo, reflecting about 80% or more. Thick cloud also reflects a lot. The earth as a whole reflects about 30%.",
        },
        {
          t: "table",
          head: ["What happens to the sun's radiation", "About"],
          caption: "Heat budget, rounded figures used in the books",
          rows: [
            ["Reflected or scattered back to space (by cloud, air and ground)", "30%"],
            ["Absorbed by the air, water vapour, dust, ozone and cloud", "20%"],
            ["Absorbed by the earth's surface", "50%"],
          ],
        },
        {
          t: "p",
          text: "Over a year the earth gives back to space as much heat as it receives, so its average temperature stays nearly steady.",
        },
      ],
    },
    {
      id: "transfer",
      title: "How heat moves in the atmosphere",
      blocks: [
        {
          t: "table",
          head: ["Process", "How it works", "Where it matters"],
          rows: [
            ["**Radiation**", "Energy travels as waves, needs no medium", "Sun to earth, earth to air and space"],
            ["**Conduction**", "Heat passes by contact", "Only the thin layer of air touching the ground"],
            ["**Convection**", "Warm air rises bodily, cool air sinks", "Vertical transfer, gives cumulus and thunderstorms"],
            ["**Advection**", "Wind carries heat sideways", "Warm or cold air arriving from somewhere else"],
            ["**Latent heat**", "Absorbed when water evaporates, released when it condenses", "Powers thunderstorms and cyclones"],
            ["**Turbulence**", "Eddies mix the lower air", "Spreads heat through the lowest 1 km on windy days"],
          ],
        },
        {
          t: "tip",
          text: "**Convection is up and down. Advection is across.** \"Ad\" like \"add\": wind adds air from another place.",
        },
      ],
    },
    {
      id: "diurnal",
      title: "Temperature through the day",
      blocks: [
        { t: "figure", key: "diurnal", caption: "A clear, calm day over land compared with the open sea." },
        {
          t: "list",
          items: [
            "The ground keeps losing heat all night, so the **minimum temperature comes just after sunrise**, about half an hour to an hour after.",
            "The sun peaks at noon, yet for some hours afterwards the ground still takes in more heat than it gives out. The **maximum comes about 2 to 3 hours after noon**, around 1400 to 1500 local time.",
          ],
        },
        {
          t: "table",
          head: ["Big day to night range when", "Small range when"],
          rows: [
            ["Sky is **clear**", "Sky is **cloudy**, especially low cloud"],
            ["Wind is **calm**", "Wind is **strong** (it mixes the air)"],
            ["Over **land**, deserts, dry air", "Over the **sea** (under 1 °C) or very humid air"],
            ["Wind blowing off the land at a coast", "Wind blowing off the sea at a coast"],
          ],
        },
        {
          t: "p",
          text: "**Cloudy nights are warmer.** Cloud absorbs the long wave heat from the ground and sends part of it back down. By day the same cloud blocks sunshine. So cloud cuts both the maximum and the minimum. The lower and thicker the cloud, the stronger the effect.",
        },
      ],
    },
    {
      id: "height",
      title: "Temperature with height",
      blocks: [
        {
          t: "p",
          text: "The real fall of temperature with height on a given day is the **environmental lapse rate (ELR)**. It averages about 6.5 °C per km (2 °C per 1000 ft), which is why ISA uses that figure, but on any day it can be more or less.",
        },
        {
          t: "list",
          items: [
            "**Inversion**: temperature rises with height. Very stable. It traps smoke, haze and fog below it, so visibility under an inversion is often poor.",
            "**Isothermal layer**: temperature stays the same with height. Also stable.",
          ],
        },
        {
          t: "table",
          head: ["Type of inversion", "How it forms"],
          rows: [
            ["**Radiation** (surface) inversion", "Ground cools on a clear, calm night and chills the air touching it"],
            ["**Subsidence** inversion", "Air sinking in a high pressure area warms as it is squeezed. Found aloft"],
            ["**Frontal** inversion", "Warm air lies over cold air along a front"],
            ["**Turbulence** inversion", "Strong mixing in the lowest layer leaves warmer air above the mixed layer"],
          ],
        },
        {
          t: "p",
          text: "Inversions as a flight hazard (windshear at the top of a night inversion, trapped pollution) are covered again in Module 12.",
        },
      ],
    },
    {
      id: "density",
      title: "Air density",
      blocks: [
        {
          t: "p",
          text: "**Density** is the mass of air in a given volume, in kg/m³ (ISA at MSL: 1.225 kg/m³). It comes from the gas law: **density = pressure ÷ (gas constant × absolute temperature)**. So:",
        },
        {
          t: "table",
          head: ["If this goes up", "Density", "Why"],
          rows: [
            ["**Pressure**", "Goes **up**", "Air is squeezed into less space"],
            ["**Temperature**", "Goes **down**", "Warm air expands"],
            ["**Humidity**", "Goes **down** (a little)", "A water vapour molecule is lighter than the nitrogen and oxygen it replaces"],
            ["**Height**", "Goes **down**", "Pressure falls faster than temperature"],
          ],
        },
        {
          t: "p",
          text: "At equal pressure and temperature, **moist air weighs less than dry air**. Many students expect the opposite, so it is a common exam trap.",
        },
        {
          t: "p",
          text: "A handy rule: density drops by about **1%** for a pressure fall of **10 hPa**, or a temperature rise of **3 °C**, or a climb of **300 ft**. Low down it falls about **3% for every 1000 ft**, and it is about **half the MSL value at about 6.5 km (22,000 ft)**.",
        },
        {
          t: "p",
          text: "**From place to place:** at the surface, cold polar air is denser than warm equatorial air. But higher up this turns round. At about **8 km** density is nearly the same everywhere, and **above 8 km the air over the equator is denser** than over the poles. (It ties in with Module 1: up there the equator is colder.)",
        },
        {
          t: "p",
          text: "**Through the day:** density is **lowest in the afternoon** (hottest) and **highest around sunrise** (coolest). Lines joining places of equal density are called **isopycnals** (some books say isosteres).",
        },
      ],
    },
    {
      id: "da",
      title: "Density altitude and performance",
      blocks: [
        {
          t: "p",
          text: "**Density altitude** is the height in the ISA at which you would find the density you have now. It tells you how the aircraft will \"feel\". **High density altitude means low density**, and the aircraft performs as if it were at a higher airfield.",
        },
        {
          t: "list",
          items: [
            "Wings make less lift and engines make less power and thrust.",
            "**Longer take-off and landing runs**, because the true airspeed for the same indicated airspeed is higher.",
            "**Poorer rate of climb**.",
          ],
        },
        {
          t: "p",
          text: "**Hot, high and humid** is the worst case. Each makes the air thinner. In ISA, density altitude equals pressure altitude. For every 1 °C warmer than ISA, density altitude is about **120 ft higher** than pressure altitude.",
        },
        {
          t: "example",
          title: "Delhi in May: pressure altitude 800 ft, OAT +44 °C. Find the density altitude.",
          steps: [
            "ISA at 800 ft = 15 - (0.8 × 2) = about +13 °C",
            "ISA deviation = 44 - 13 = +31",
            "Extra height = 31 × 120 = 3,720 ft",
            "Density altitude = 800 + 3,720 = **about 4,500 ft**. The aircraft performs as if the runway were 4,500 ft up",
          ],
        },
        {
          t: "p",
          text: "If pressure rises and temperature stays the same, the air gets denser, so the **density altitude goes down**.",
        },
        {
          t: "flag",
          text: "One of the prescribed books states that density altitude **increases** when pressure increases at constant temperature. That is a slip. Higher pressure means denser air and a **lower** density altitude, and the book's own question key gives \"lowers\". Go with \"lowers\".",
        },
      ],
    },
    {
      id: "states",
      title: "Water changing state: latent heat",
      blocks: [
        {
          t: "p",
          text: "Water exists in the air as gas (water vapour), liquid (cloud drops, rain) and solid (ice, snow, hail). **Latent heat** is the heat taken in or given out when water **changes state**, without any change in its temperature.",
        },
        {
          t: "table",
          head: ["Change", "Name", "Latent heat"],
          rows: [
            ["Ice → water", "Melting", "**Absorbed** (taken from the air, so it cools)"],
            ["Water → vapour", "Evaporation", "**Absorbed**"],
            ["Ice → vapour", "Sublimation", "**Absorbed**"],
            ["Vapour → water", "Condensation", "**Released** (warms the air)"],
            ["Water → ice", "Freezing", "**Released**"],
            ["Vapour → ice", "Deposition (older books also call it sublimation)", "**Released**"],
          ],
        },
        {
          t: "tip",
          text: "Going \"up\" from ice to water to vapour, the water **takes in** heat. Coming \"down\", it **gives it back**. Evaporation needs much more heat than melting: about 600 calories per gram against 80.",
        },
        {
          t: "p",
          text: "The heat released by condensation is what keeps a thunderstorm growing and what powers a **tropical cyclone**, which gets its energy from the latent heat of water evaporated from a warm ocean.",
        },
      ],
    },
    {
      id: "humidity",
      title: "Humidity: the words to know",
      blocks: [
        {
          t: "p",
          text: "Air can hold only so much water vapour. When it holds the most it can, it is **saturated**. **Warm air can hold far more than cold air**: roughly double for every 10 °C rise.",
        },
        { t: "figure", key: "saturation", caption: "The saturation line. Cooling unsaturated air moves it left until it hits the line: that temperature is the dew point." },
        {
          t: "table",
          head: ["Term", "What it means", "Unit"],
          rows: [
            ["**Vapour pressure**", "The part of the air pressure due to the water vapour in it", "hPa"],
            ["**Saturation vapour pressure**", "Vapour pressure when saturated. Depends only on temperature", "hPa"],
            ["**Absolute humidity**", "Mass of water vapour in a volume of air", "g/m³"],
            ["**Specific humidity**", "Mass of water vapour per kg of moist air", "g/kg"],
            ["**Humidity mixing ratio (HMR)**", "Mass of water vapour mixed with 1 kg of **dry** air", "g/kg"],
            ["**Relative humidity (RH)**", "Water vapour present ÷ the most it could hold at that temperature, × 100", "%"],
          ],
        },
        {
          t: "p",
          text: "**HMR stays the same when air rises or sinks**, as long as no water is added or removed (no condensation). That makes it the most useful measure for following a parcel of air upwards.",
        },
        {
          t: "p",
          text: "**Relative humidity changes with temperature.** Warm the same air and its RH falls, cool it and RH rises, even though the amount of water has not changed. So RH is **highest around dawn** and **lowest in the afternoon**.",
        },
      ],
    },
    {
      id: "dewpoint",
      title: "Dew point, frost point and wet bulb",
      blocks: [
        {
          t: "list",
          items: [
            "**Dew point**: the temperature to which air must be **cooled, at constant pressure**, to become saturated. Cool it more and water condenses as dew, mist, fog or cloud.",
            "**Frost point**: the same idea, but saturated over **ice**. Cooling below it gives hoar frost.",
            "**Wet bulb temperature**: the lowest temperature air can be cooled to by **evaporating water into it**. A desert cooler works this way. The drier the air, the bigger the cooling.",
          ],
        },
        {
          t: "p",
          text: "**Dew point is a measure of how much moisture the air holds.** It changes only if water vapour is added or removed. Warming or cooling the air (above the dew point) changes the RH but not the dew point. More moisture, higher dew point.",
        },
        {
          t: "remember",
          items: [
            "Unsaturated air: **dry bulb > wet bulb > dew point**.",
            "Saturated air (RH 100%, in fog or rain): **dry bulb = wet bulb = dew point**.",
            "The gap between temperature and dew point is the **dew point spread**. A small spread means the air is close to saturation: expect mist, fog or low cloud.",
          ],
        },
        {
          t: "p",
          text: "**Measuring humidity:** a **psychrometer** compares the dry and wet bulb readings to give RH. A **hair hygrometer** uses human hair, which gets longer as RH rises. A **hygrograph** draws a continuous record.",
        },
        {
          t: "p",
          text: "**Base of a heap (cumulus) cloud:** rising air cools 3 °C per 1000 ft while its dew point drops only about 0.5 °C per 1000 ft, so the gap closes by about 2.5 °C per 1000 ft. That gives:",
        },
        {
          t: "example",
          title: "Cloud base = (temperature - dew point) × 400 ft",
          steps: [
            "Surface temperature 16 °C, dew point 12 °C",
            "Spread = 16 - 12 = 4 °C",
            "Cloud base = 4 × 400 = **1,600 ft** above the ground",
          ],
        },
        {
          t: "example",
          title: "Afternoon temperature +12 °C, dew point +5 °C. What must happen for saturation?",
          steps: ["Dew point is the temperature at which saturation happens", "So the air must **cool to +5 °C** (a drop of 7 °C)"],
        },
      ],
    },
    {
      id: "ice",
      title: "Water and ice below 0 °C",
      blocks: [
        {
          t: "p",
          text: "Water drops do not freeze at 0 °C unless there is something to freeze on. In clouds they often stay liquid well below 0 °C. These are **supercooled** drops. Small drops can stay liquid down to about **-40 °C**. Supercooled drops freeze the moment they hit an aircraft, which is the cause of airframe icing (Module 12).",
        },
        {
          t: "p",
          text: "Below 0 °C, **water drops have a higher saturation vapour pressure than ice** at the same temperature. So in a cloud with both supercooled drops and ice crystals, the drops evaporate and the vapour deposits onto the crystals. The crystals grow big enough to fall. This is how most rain starts outside the tropics (Module 6).",
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
            "F = (9/5 × C) + 32. K = C + 273. **-40 °C = -40 °F**.",
            "Stevenson screen: shade, **1.25 m (4 ft)** high, door facing the pole. Max thermometer **mercury**, min thermometer **alcohol**.",
            "Sun gives **short wave**, earth gives **long wave**. The troposphere is heated **from below** by terrestrial radiation, conduction and convection.",
            "Water vapour and CO₂ **absorb long wave** radiation. Highest albedo: **fresh snow**.",
            "Land heats and cools faster than water (lower specific heat).",
            "Minimum temperature **just after sunrise**. Maximum about **2 to 3 hours after noon**.",
            "Biggest daily range: **clear sky, calm wind, over land**. Cloudy nights are **warmer**.",
            "Convection is **vertical**, advection is **horizontal**.",
            "Density goes **up with pressure**, **down with temperature, humidity and height**. Moist air is **lighter** than dry air.",
            "Surface density is higher at the poles. **Above about 8 km it is higher over the equator**.",
            "Density lowest in the **afternoon**, highest around **sunrise**. Lines of equal density: **isopycnals (isosteres)**.",
            "High density altitude = **low density** = longer runs, poor climb. About **120 ft per 1 °C** above ISA.",
            "Evaporation, melting, sublimation **absorb** latent heat. Condensation, freezing, deposition **release** it.",
            "HMR is **g of vapour per kg of dry air** and stays **constant** in rising or sinking air without condensation.",
            "RH = present ÷ maximum × 100. RH falls when air warms. **Dew point** shows **moisture content**.",
            "Saturated: **T = wet bulb = dew point**. Psychrometer measures RH.",
            "Cumulus base = **(T - dew point) × 400 ft**.",
            "Supercooled drops down to about **-40 °C**. SVP over **water > over ice**.",
          ],
        },
      ],
    },
  ],
  slides: [
    {
      title: "Heat is not temperature",
      points: [
        "Heat = total energy. Temperature = average energy",
        "F = (9/5 × C) + 32, K = C + 273",
        "**-40 °C = -40 °F**",
        "Water has a high specific heat: **land heats and cools faster**",
      ],
    },
    {
      title: "Measuring temperature",
      points: [
        "**Stevenson screen**: shade, louvres, **1.25 m (4 ft)** up",
        "Door faces the **pole** so the sun never shines in",
        "Max thermometer **mercury**, min thermometer **alcohol**",
        "Thermograph uses a **bimetallic strip**. Radiosonde for upper air",
      ],
    },
    {
      title: "Short wave in, long wave out",
      points: [
        "Sun (about 6000 °C) sends **short wave** radiation",
        "Earth sends back **long wave** radiation, day and night",
        "Water vapour and CO₂ absorb the long wave and warm the air",
        "So the troposphere is **heated from below**",
      ],
    },
    {
      title: "Insolation and albedo",
      points: [
        "Insolation is greatest with the sun **overhead**",
        "Albedo = share reflected. Highest from **fresh snow**",
        "About 30% reflected, 20% absorbed by air, 50% by the ground",
      ],
    },
    {
      title: "How heat moves",
      points: [
        "**Radiation**: waves, no medium needed",
        "**Conduction**: contact, only near the ground",
        "**Convection**: up and down. **Advection**: sideways",
        "**Latent heat** from condensation powers storms",
      ],
    },
    {
      title: "The daily cycle",
      points: [
        "Minimum **just after sunrise**",
        "Maximum about **2 to 3 hours after noon**",
        "Big range: **clear, calm, over land**",
        "Small range: cloudy, windy, over the sea. **Cloudy nights are warmer**",
      ],
      figure: "diurnal",
    },
    {
      title: "Inversions",
      points: [
        "Temperature **rises** with height: very stable",
        "Traps haze and smoke, so poor visibility below",
        "Types: **radiation**, **subsidence**, **frontal**, **turbulence**",
      ],
    },
    {
      title: "What makes air dense",
      points: [
        "Density = pressure ÷ (R × absolute temperature)",
        "Up with **pressure**. Down with **temperature**, **humidity**, **height**",
        "**Moist air is lighter** than dry air",
        "1% less dense: -10 hPa, +3 °C or +300 ft",
      ],
    },
    {
      title: "Density around the globe",
      points: [
        "At the surface: denser at the **poles**",
        "At about 8 km: about the same everywhere",
        "Above 8 km: denser over the **equator**",
        "Lowest in the **afternoon**, highest at **sunrise**",
      ],
    },
    {
      title: "Density altitude",
      points: [
        "ISA height that has today's density",
        "**Hot, high, humid** = high DA = thin air",
        "Longer take-off and landing, poorer climb",
        "About **120 ft per 1 °C** above ISA",
      ],
    },
    {
      title: "Latent heat",
      points: [
        "Melting, evaporation, sublimation **take in** heat",
        "Condensation, freezing, deposition **give out** heat",
        "Evaporation needs about 7 times the heat of melting",
        "Cyclones run on latent heat from warm seas",
      ],
    },
    {
      title: "Humidity words",
      points: [
        "**HMR**: g of vapour per kg of dry air. Constant in rising air",
        "**Absolute humidity**: g per m³",
        "**RH** = present ÷ maximum × 100. Falls when air warms",
        "Warm air holds about **double** for every 10 °C",
      ],
      figure: "saturation",
    },
    {
      title: "Dew point and wet bulb",
      points: [
        "Dew point: cool at constant pressure until saturated",
        "Dew point = **moisture content**. Only changes if water is added or removed",
        "Unsaturated: **T > wet bulb > dew point**. Saturated: all equal",
        "Small spread: expect mist, fog or low cloud",
      ],
    },
    {
      title: "Two quick sums",
      points: [
        "Cumulus base = **(T - dew point) × 400 ft**",
        "T 16, dew point 12: base **1,600 ft**",
        "Density altitude = pressure altitude + 120 × ISA deviation",
        "PA 800 ft, ISA +31: DA about **4,500 ft**",
      ],
    },
    {
      title: "Below freezing",
      points: [
        "Cloud drops stay liquid well below 0 °C: **supercooled**",
        "Down to about **-40 °C**",
        "SVP over water is **higher** than over ice",
        "So ice crystals grow while the drops shrink",
      ],
    },
  ],
  mcqs: [
    { id: "m2-01", q: "At what temperature do the Celsius and Fahrenheit scales show the same number?", options: ["0°", "-40°", "-32°", "100°"], answer: 1, why: "Put C = F in F = (9/5 × C) + 32 and you get -40. So -40 °C is exactly -40 °F." },
    { id: "m2-02", q: "+20 °C is the same as:", options: ["68 °F", "36 °F", "52 °F", "293 °F"], answer: 0, why: "F = (9/5 × 20) + 32 = 36 + 32 = 68 °F. 293 is the Kelvin value, a trap." },
    { id: "m2-03", q: "+15 °C on the Kelvin scale is about:", options: ["258 K", "300 K", "273 K", "288 K"], answer: 3, why: "K = C + 273, so 15 + 273 = 288 K. This is the ISA MSL temperature, 288.15 K." },
    { id: "m2-04", q: "Surface air temperature is measured in a Stevenson screen at a height of about:", options: ["0.5 m", "1.25 m (4 ft)", "3 m (10 ft)", "10 m (33 ft)"], answer: 1, why: "The thermometers sit about 1.25 m (4 ft) above the ground, in the shade. 10 m is the height for measuring surface wind." },
    { id: "m2-05", q: "In India, the door of a Stevenson screen should open towards the:", options: ["North", "South", "East", "West"], answer: 0, why: "It opens towards the pole, which is north in the northern hemisphere, so the sun never shines on the thermometers when the door is open." },
    { id: "m2-06", q: "The liquid used in a minimum thermometer is:", options: ["Mercury", "Water", "Alcohol", "Oil"], answer: 2, why: "A minimum thermometer uses alcohol, which drags a small index back to the lowest reading. The maximum thermometer uses mercury." },
    { id: "m2-07", q: "Radiation from the sun reaches the earth mainly as:", options: ["Long wave radiation", "Radio waves", "Short wave radiation", "Only ultraviolet"], answer: 2, why: "The hotter a body, the shorter its wavelength. The very hot sun sends short wave radiation. The cooler earth sends long wave." },
    { id: "m2-08", q: "The troposphere is mainly heated by:", options: ["Long wave radiation from the earth, conduction and convection", "Direct sunlight absorbed by the air", "Ultraviolet absorbed by ozone", "Heat coming down from the stratosphere"], answer: 0, why: "Sunlight passes through the air and warms the ground. The ground then heats the air from below by long wave radiation, conduction and convection." },
    { id: "m2-09", q: "Long wave terrestrial radiation is readily absorbed by:", options: ["Nitrogen and oxygen", "Argon", "Ozone only", "Water vapour, carbon dioxide and pollutants"], answer: 3, why: "Nitrogen and oxygen let it pass. Water vapour and CO₂ (the greenhouse gases) absorb it and warm the air." },
    { id: "m2-10", q: "The highest albedo is found over:", options: ["Fresh snow", "Thin cloud", "Forest", "Sea water"], answer: 0, why: "Fresh snow reflects about 80% or more of sunlight, the highest of all natural surfaces." },
    { id: "m2-11", q: "Land heats up and cools down faster than the sea mainly because:", options: ["Land is darker", "The specific heat of land is much lower than that of water", "Land is higher than the sea", "Water has a higher albedo"], answer: 1, why: "Water needs about five times more heat than land to warm by the same amount. It also mixes the heat downwards and loses heat to evaporation." },
    { id: "m2-12", q: "Horizontal transfer of heat by the wind is called:", options: ["Convection", "Conduction", "Advection", "Radiation"], answer: 2, why: "Advection is sideways transport by the wind. Convection is vertical." },
    { id: "m2-13", q: "Conduction is important as a way of heating the atmosphere:", options: ["Throughout the troposphere", "In the stratosphere", "Inside clouds", "Only in the thin layer of air touching the ground"], answer: 3, why: "Air conducts heat badly, so conduction works only where air touches the warm or cold ground." },
    { id: "m2-14", q: "On a clear day over land, the minimum temperature normally occurs:", options: ["At midnight", "Just after sunrise", "Just before sunset", "Two hours before sunrise"], answer: 1, why: "The ground keeps losing heat until the rising sun gives back more than it loses, a little after sunrise." },
    { id: "m2-15", q: "The maximum temperature of the day is normally recorded:", options: ["At noon", "About 2 to 3 hours after noon", "At sunset", "Mid morning"], answer: 1, why: "The ground keeps gaining heat after noon, and the screen temperature lags behind. The peak is around 1400 to 1500 local time." },
    { id: "m2-16", q: "The diurnal range of temperature is greatest with:", options: ["Clear sky and calm wind", "Clear sky and strong wind", "Overcast sky and calm wind", "Overcast sky and strong wind"], answer: 0, why: "Clear skies let the ground heat strongly by day and cool strongly at night. Calm wind keeps the change close to the surface." },
    { id: "m2-17", q: "The diurnal variation of temperature over the open ocean is about:", options: ["15 °C", "5 to 10 °C", "Less than 1 °C", "Nil"], answer: 2, why: "Water's high specific heat and mixing keep the sea surface temperature almost steady, changing by less than 1 °C." },
    { id: "m2-18", q: "Compared with clear nights, cloudy nights are usually:", options: ["Warmer", "Colder", "The same", "Colder only over the sea"], answer: 0, why: "Cloud absorbs the earth's long wave radiation and sends part of it back down, so the ground cannot cool as much." },
    { id: "m2-19", q: "An inversion is a layer in which temperature:", options: ["Falls quickly with height", "Stays the same with height", "Increases with height", "Falls at the dry adiabatic rate"], answer: 2, why: "In an inversion temperature goes up with height. It is very stable and traps haze below it." },
    { id: "m2-20", q: "A subsidence inversion is usually found:", options: ["In a high pressure area, where air is sinking", "In a depression, where air is rising", "Only at ground level on clear nights", "Inside a thunderstorm"], answer: 0, why: "Sinking air in an anticyclone is squeezed and warms, forming an inversion above the surface." },
    { id: "m2-21", q: "Air density is:", options: ["The weight of air above a point", "The amount of water vapour in air", "The mass of air in a given volume", "The force on a unit area"], answer: 2, why: "Density is mass per unit volume, in kg/m³. The weight of the air above is pressure." },
    { id: "m2-22", q: "With pressure constant, if the temperature of air rises its density will:", options: ["Increase", "Not change", "Double", "Decrease"], answer: 3, why: "Warm air expands, so the same mass takes up more space and density falls." },
    { id: "m2-23", q: "At the same pressure and temperature, if the water vapour content of air increases, its density will:", options: ["First increase, then decrease", "Increase", "Stay the same", "Decrease"], answer: 3, why: "A water vapour molecule is lighter than nitrogen or oxygen. Moist air is lighter than dry air." },
    { id: "m2-24", q: "Air is less dense in:", options: ["Cold air", "High pressure", "Dry air", "Warm, humid air at high altitude"], answer: 3, why: "High temperature, high humidity and high altitude all lower the density. The other three make air denser." },
    { id: "m2-25", q: "A fall in density of about 1% is caused by a temperature rise of about:", options: ["1 °C", "10 °C", "3 °C", "30 °C"], answer: 2, why: "1% of the absolute temperature (about 288 K) is about 3 K, so a 3 °C rise lowers density by about 1%. A 10 hPa pressure fall does the same." },
    { id: "m2-26", q: "At the earth's surface, air density is:", options: ["Highest in the mid latitudes", "Higher at the equator than at the poles", "The same everywhere", "Higher at the poles than at the equator"], answer: 3, why: "Cold polar air is denser than warm equatorial air at the surface." },
    { id: "m2-27", q: "Above about 8 km, air density is:", options: ["Higher over the poles than over the equator", "Higher over the equator than over the poles", "Zero", "The same everywhere"], answer: 1, why: "The pattern turns round at about 8 km. Above it, the air over the equator is denser." },
    { id: "m2-28", q: "Over a day, surface air density is usually lowest:", options: ["Around sunrise", "At midnight", "In the afternoon", "In the evening"], answer: 2, why: "Density falls as temperature rises, so it is lowest in the hot afternoon and highest around sunrise." },
    { id: "m2-29", q: "Lines joining places of equal air density are called:", options: ["Isobars", "Isotherms", "Isohyets", "Isopycnals (isosteres)"], answer: 3, why: "Isopycnals join equal density. Isobars join equal pressure, isotherms equal temperature, isohyets equal rainfall." },
    { id: "m2-30", q: "Which is the correct meaning of density altitude?", options: ["The ISA height that has the same pressure as now", "The ISA height that has the same density as now", "The altitude shown with 1013 hPa set", "The height above the aerodrome"], answer: 1, why: "Density altitude finds today's density in the ISA. The first option is the definition of pressure altitude." },
    { id: "m2-31", q: "A higher density altitude means:", options: ["Lower density", "Higher density", "The same density", "Higher pressure"], answer: 0, why: "A high density altitude means the air is as thin as it would be high up in the ISA." },
    { id: "m2-32", q: "Pressure rises while temperature stays the same. What happens to density altitude?", options: ["Increases", "Remains the same", "Doubles", "Decreases"], answer: 3, why: "More pressure squeezes the air, so it is denser and the density altitude is lower.", flag: "One prescribed book says density altitude increases here. That is a slip, and its own answer key gives \"lowers\". Choose \"decreases\"." },
    { id: "m2-33", q: "For every 1 °C that the temperature is above ISA, density altitude is higher than pressure altitude by about:", options: ["120 ft", "30 ft", "300 ft", "1000 ft"], answer: 0, why: "The rule of thumb is about 120 ft per 1 °C of ISA deviation." },
    { id: "m2-34", q: "Pressure altitude 800 ft, temperature +44 °C. The density altitude is about:", options: ["800 ft", "2,000 ft", "4,500 ft", "8,000 ft"], answer: 2, why: "ISA at 800 ft is about +13 °C, so ISA +31. 31 × 120 = 3,720 ft. 800 + 3,720 is about 4,500 ft." },
    { id: "m2-35", q: "Taking off on a hot, humid day from a high airfield, you should expect:", options: ["A shorter take-off run", "A longer take-off run and a poorer climb", "No change in performance", "Better engine power"], answer: 1, why: "Hot, high and humid all lower density. Less lift and power, higher true airspeed needed, so longer runs and slower climb." },
    { id: "m2-36", q: "Latent heat is the heat absorbed or released when a substance:", options: ["Changes its temperature", "Changes its volume", "Changes its pressure", "Changes its state"], answer: 3, why: "Latent heat goes with a change of state (ice, water, vapour) at a steady temperature." },
    { id: "m2-37", q: "Latent heat is released to the air during:", options: ["Evaporation", "Melting", "Condensation", "Sublimation of ice to vapour"], answer: 2, why: "Condensation (vapour to water) gives out heat. Evaporation, melting and ice to vapour all take heat in." },
    { id: "m2-38", q: "A tropical cyclone gets most of its energy from:", options: ["Direct sunshine on the storm", "Latent heat of water vapour evaporated from a warm ocean", "Very strong winds around it", "Very low pressure in the eye"], answer: 1, why: "Warm sea water evaporates. When the vapour condenses in the storm's clouds it releases latent heat, which drives the storm." },
    { id: "m2-39", q: "The ratio, in percent, of the water vapour actually present to the most the air could hold at the same temperature is the:", options: ["Absolute humidity", "Humidity mixing ratio", "Relative humidity", "Dew point"], answer: 2, why: "That is relative humidity: present ÷ maximum × 100." },
    { id: "m2-40", q: "The mass of water vapour in grams mixed with 1 kg of dry air is called the:", options: ["Humidity mixing ratio", "Absolute humidity", "Relative humidity", "Vapour pressure"], answer: 0, why: "HMR is grams of vapour per kg of dry air. Absolute humidity is grams per cubic metre." },
    { id: "m2-41", q: "When unsaturated air is lifted adiabatically, its humidity mixing ratio:", options: ["Increases", "Decreases", "Remains constant", "Becomes 100%"], answer: 2, why: "No water is added or removed, and HMR is a ratio of masses, so it does not change as the air expands." },
    { id: "m2-42", q: "Warmer air needs how much water vapour to become saturated, compared with cooler air?", options: ["Less", "More", "The same", "None at all"], answer: 1, why: "Warm air can hold more vapour, about double for every 10 °C rise, so more is needed to saturate it." },
    { id: "m2-43", q: "If air is warmed without adding or removing any water vapour:", options: ["Relative humidity rises and dew point rises", "Relative humidity falls and dew point stays the same", "Relative humidity stays the same", "Dew point falls"], answer: 1, why: "Warmer air could hold more, so RH falls. The actual moisture has not changed, so the dew point stays the same." },
    { id: "m2-44", q: "Relative humidity is normally highest:", options: ["In the early afternoon", "Around noon", "In the early evening", "Around dawn"], answer: 3, why: "RH is highest when temperature is lowest, around dawn, and lowest in the hot afternoon." },
    { id: "m2-45", q: "Unsaturated air is cooled at constant pressure until it just becomes saturated. That temperature is its:", options: ["Wet bulb temperature", "Dry bulb temperature", "Dew point temperature", "Frost point"], answer: 2, why: "That is the definition of dew point. Frost point is the same but over ice." },
    { id: "m2-46", q: "Dew point temperature is a measure of the air's:", options: ["Stability", "Moisture content", "Temperature", "Density"], answer: 1, why: "Dew point depends only on how much water vapour the air holds. More moisture, higher dew point." },
    { id: "m2-47", q: "The lowest temperature air can reach by evaporating water into it until saturated is the:", options: ["Wet bulb temperature", "Dew point", "Frost point", "Minimum temperature"], answer: 0, why: "That is the wet bulb temperature. Evaporation takes latent heat from the air and cools it." },
    { id: "m2-48", q: "When do the dry bulb, wet bulb and dew point all show the same reading?", options: ["Air temperature is 0 °C", "The air is very dry", "Relative humidity is 100%", "The wind is calm"], answer: 2, why: "In saturated air nothing more can evaporate, so the wet bulb cannot cool, and the air is already at its dew point." },
    { id: "m2-49", q: "In unsaturated air, which order is correct?", options: ["Dew point > wet bulb > dry bulb", "Dry bulb > dew point > wet bulb", "Wet bulb > dry bulb > dew point", "Dry bulb > wet bulb > dew point"], answer: 3, why: "Evaporation cools the wet bulb below the air temperature, but not as far as the dew point." },
    { id: "m2-50", q: "Relative humidity is measured with a:", options: ["Psychrometer", "Barometer", "Anemometer", "Transmissometer"], answer: 0, why: "A psychrometer compares dry and wet bulb readings. A hygrometer also measures humidity." },
    { id: "m2-51", q: "Surface temperature 16 °C and dew point 12 °C. The base of cumulus cloud will be at about:", options: ["400 ft", "1,600 ft", "3,200 ft", "4,800 ft"], answer: 1, why: "Cloud base = (16 - 12) × 400 = 1,600 ft above the ground." },
    { id: "m2-52", q: "Afternoon temperature +12 °C, dew point +5 °C. For saturation, the air must:", options: ["Cool to +5 °C", "Cool by 5 °C", "Cool to +6 °C", "Warm to +17 °C"], answer: 0, why: "Air becomes saturated when it cools to its dew point, +5 °C. That is a drop of 7 °C, not 5." },
    { id: "m2-53", q: "Below 0 °C, the saturation vapour pressure over supercooled water compared with that over ice is:", options: ["Lower", "Higher", "The same", "Zero"], answer: 1, why: "SVP over water is higher, so in mixed clouds the drops evaporate and the ice crystals grow." },
    { id: "m2-54", q: "Small supercooled water drops can stay liquid down to about:", options: ["0 °C", "-10 °C", "-20 °C", "-40 °C"], answer: 3, why: "Tiny drops with nothing to freeze on can stay liquid down to about -40 °C." },
  ],
};
