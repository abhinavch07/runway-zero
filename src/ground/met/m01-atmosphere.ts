// Meteorology Module 1: The Atmosphere and ISA. CAR Sec 7 Series B Part IV, Appendix B 1.1 a and e.
// Written fresh for Runway Zero. Facts checked against the DGCA syllabus and standard ICAO values.
import type { Module } from "../types.ts";

export const M01: Module = {
  n: 1,
  title: "The Atmosphere and ISA",
  car: "1.1 a, e",
  summary:
    "What air is made of, how the atmosphere is stacked in layers, why the tropopause matters to pilots, and the International Standard Atmosphere with ISA deviation sums.",
  sections: [
    {
      id: "what",
      title: "What the atmosphere is",
      blocks: [
        {
          t: "p",
          text: "The atmosphere is the layer of air around the earth. Gravity holds it in place, so it turns with the earth. It has no sharp top edge. With height the air keeps thinning out and slowly fades into space.",
        },
        {
          t: "list",
          items: [
            "Air has **weight**, so it presses down on everything. This push is **atmospheric pressure**.",
            "Air can be **squeezed and expanded**. That is why it is thick near the ground and thin up high.",
            "Air **moves** and carries heat and moisture from one place to another. This is what makes weather.",
            "Air **conducts heat badly**. Only the air touching the ground is warmed or cooled directly.",
          ],
        },
      ],
    },
    {
      id: "gases",
      title: "What air is made of",
      blocks: [
        { t: "figure", key: "composition", caption: "Dry air by volume. Two gases make up 99% of it." },
        {
          t: "table",
          head: ["Gas", "By volume", "What to know"],
          rows: [
            ["Nitrogen (N₂)", "78%", "Does not take part in weather"],
            ["Oxygen (O₂)", "21%", "Needed for breathing and burning fuel"],
            ["Argon (Ar)", "0.93%", "Third biggest, an inert gas"],
            ["Carbon dioxide (CO₂)", "about 0.04%", "Greenhouse gas, more over cities and industry"],
            ["Water vapour (H₂O)", "0 to 4%", "Varies a lot. The most important gas for weather"],
            ["Ozone (O₃)", "tiny", "Mostly in the stratosphere. Absorbs UV from the sun"],
          ],
        },
        {
          t: "p",
          text: "Nitrogen to oxygen is about **4 : 1 by volume**. By weight it is about **3 : 1**, because an oxygen molecule is heavier than a nitrogen molecule.",
        },
        {
          t: "flag",
          text: "Older books and the DGCA question bank give carbon dioxide as **0.03%** (some say 0.035%). Today it is about **0.042%** (420 ppm) and still rising. In the exam, pick the option closest to **0.03%** if 0.04% is not given.",
        },
        {
          t: "p",
          text: "**Water vapour** is the gas that makes weather. Without it there would be no cloud, fog, rain or thunderstorm. Warm air can hold more of it than cold air. In warm, humid tropical air it can reach about **4% by volume**. Over the poles and above about 30,000 ft it is almost nil because the air is so cold. Nearly all of it (about 99%) is in the troposphere.",
        },
        {
          t: "p",
          text: "**Greenhouse gases** such as water vapour, CO₂, methane and ozone let the sun's short wave radiation pass through, but they absorb part of the long wave radiation that the earth gives out. They send some of it back down, which keeps the earth warmer.",
        },
        {
          t: "p",
          text: "**Ozone** forms high up, where UV light splits oxygen molecules. Ozone is found from about 10 to 50 km, with the **most ozone at 20 to 25 km**. By absorbing UV it protects life on earth, and it also **heats the stratosphere**.",
        },
        {
          t: "p",
          text: "Air also carries tiny **solid particles**: salt from the sea, dust, smoke and pollution. They cut visibility, and they act as **condensation nuclei**, the tiny specks on which water vapour condenses to form cloud and fog droplets. This is why fog and smog are common over big cities.",
        },
        {
          t: "p",
          text: "Because air thins out quickly with height, pilots need **supplementary oxygen above about 10,000 ft**.",
        },
      ],
    },
    {
      id: "mass",
      title: "How the air is spread with height",
      blocks: [
        {
          t: "table",
          head: ["Below about", "Share of all the air"],
          rows: [
            ["5.5 km (18,000 ft)", "Half. Pressure here is about 500 hPa, half of MSL"],
            ["11 km, the troposphere", "About three quarters"],
            ["35 km", "About 99%"],
          ],
        },
        {
          t: "p",
          text: "Up to about **80 km** the gases are well mixed, so the make up of air stays almost the same (only water vapour and ozone change). This part is called the **homosphere**. Above it, in the **heterosphere**, the gases sort themselves into layers by weight.",
        },
        {
          t: "p",
          text: "The atmosphere is **heated from below**. Sunlight passes through the air and warms the ground. The ground then warms the air above it by conduction, convection, radiation and by the latent heat released when water vapour condenses into cloud. That is why it usually gets colder as you climb.",
        },
      ],
    },
    {
      id: "layers",
      title: "The layers of the atmosphere",
      blocks: [
        {
          t: "p",
          text: "The layers are named by how **temperature changes with height**. The fall of temperature with height is called the **lapse rate**. A rise of temperature with height is an **inversion** (a negative lapse rate). No change with height is **isothermal**.",
        },
        { t: "figure", key: "layers", caption: "Temperature against height. The line changes direction at each pause." },
        {
          t: "table",
          head: ["Layer", "Height", "Temperature", "What to know"],
          rows: [
            ["Troposphere", "Surface to 8 to 18 km", "Falls, about 6.5 °C per km", "All weather. Most flying. Unstable. Most of the air and water vapour"],
            ["Stratosphere", "Tropopause to about 50 km", "Constant at first, then rises", "Ozone heats it. Very stable, very dry. Nacreous clouds"],
            ["Mesosphere", "50 to about 80 to 85 km", "Falls again", "Coldest point of the whole atmosphere at its top. Noctilucent clouds"],
            ["Thermosphere", "Above about 85 km", "Rises a lot", "Very thin air. Exosphere above about 500 to 700 km"],
          ],
        },
        {
          t: "p",
          text: "The top of each layer is a **pause**: tropopause, stratopause, mesopause. At the pause the temperature trend changes.",
        },
        { t: "p", text: "**Troposphere.** From the Greek word tropos, meaning turning or mixing. Air here keeps rising, sinking and mixing, which is what creates weather. Temperature falls with height, so this layer is generally **unstable**. It holds about **three quarters of all the air** and about **99% of the water vapour** and dust." },
        { t: "p", text: "**Stratosphere.** In the lower part the temperature stays about the same (isothermal). Higher up it rises because **ozone absorbs UV**, reaching about 0 °C near the stratopause at 50 km. Warm air on top of cold air means the stratosphere is very **stable**. There is almost no water vapour and no weather. **Nacreous clouds** (another name is mother of pearl clouds) can form here at about 20 to 30 km over high latitudes in winter." },
        { t: "p", text: "**Mesosphere.** Temperature falls again with height. The **mesopause** has the **lowest temperatures in the atmosphere**, about -90 °C or below. Rare **noctilucent clouds** form near the mesopause over polar regions." },
        { t: "p", text: "**Thermosphere and exosphere.** Temperature climbs steeply, but the air is so thin that there is very little heat in it. The outer part is the exosphere, where the air fades into space." },
        { t: "p", text: "**Ionosphere.** From about 60 km upwards the sun's radiation turns some molecules into charged ions. This region reflects **HF radio waves**, which is how HF radio reaches far beyond the horizon. Solar flares disturb it and can black out HF radio." },
        {
          t: "tip",
          text: "Order going up: **T S M T**. Think \"Tall Ships Make Trips\": Troposphere, Stratosphere, Mesosphere, Thermosphere. Temperature goes down, up, down, up.",
        },
        {
          t: "tip",
          text: "**Noct**ilucent means \"night shining\". These are the highest clouds of all, up near the mesopause, still lit by the sun after dark. **Nacreous** clouds are lower down, in the stratosphere.",
        },
      ],
    },
    {
      id: "tropopause",
      title: "The tropopause",
      blocks: [
        {
          t: "p",
          text: "The tropopause is the boundary between the troposphere and the stratosphere. It is where the temperature **stops falling** with height. By the WMO rule it is the lowest level where the lapse rate drops to **2 °C per km or less**.",
        },
        { t: "figure", key: "tropopause", caption: "The tropopause is not one smooth sheet. It steps up from the pole to the equator, with breaks where jet streams blow." },
        {
          t: "table",
          head: ["Where", "Height", "Temperature"],
          rows: [
            ["Over the equator", "16 to 18 km (about 55,000 ft)", "About -75 °C to -80 °C"],
            ["Mid latitudes", "About 11 km (36,000 ft)", "About -55 °C"],
            ["Over the poles", "8 to 10 km (about 28,000 ft)", "About -45 °C to -55 °C"],
          ],
        },
        {
          t: "p",
          text: "**Rule: the warmer the surface, the higher the tropopause.** Warm air rises and mixes higher before it stops cooling. So the tropopause is:",
        },
        {
          t: "list",
          items: [
            "**Higher over the equator**, lower over the poles (latitude).",
            "**Higher in summer**, lower in winter (season).",
            "Higher over warm land in summer than over the cooler sea.",
            "Higher over a warm high pressure area, lower over a cold low pressure area.",
          ],
        },
        {
          t: "p",
          text: "**The equatorial tropopause is colder than the polar one.** This sounds wrong but is easy to see: over the equator the air keeps cooling at about 6.5 °C per km for 16 km or more, so it ends up very cold. Over the pole the cooling stops at about 8 km. So **above about 8 km, the air over the poles is warmer than the air over the equator** at the same level.",
        },
        {
          t: "p",
          text: "The tropopause has **breaks (folds) at about 40° and 60° latitude**, where its height jumps. The break near 40° is the more marked one. This splits it into three parts:",
        },
        {
          t: "list",
          items: [
            "**Tropical tropopause**: from the equator to about 35° to 40°, near the **100 hPa** level. Over India it is at about **16 to 16.5 km**.",
            "**Middle tropopause**: between about 40° and 60°, near **200 hPa**, about 11 to 12 km. Over north India it is seen in winter at about 11.5 km.",
            "**Polar tropopause**: towards the poles from about 60°, near **300 hPa**, about 8 to 9 km. It is sometimes seen over Srinagar in winter when polar air comes south.",
          ],
        },
        {
          t: "p",
          text: "**Why pilots care about the tropopause:**",
        },
        {
          t: "list",
          items: [
            "It is the **ceiling for most cloud**. Big CB clouds spread out into an anvil when they reach it. Only very strong ones punch a little way above it.",
            "**Jet streams** blow near the breaks, and the **strongest winds** are found just below the tropopause.",
            "**Clear air turbulence (CAT)** is common near the tropopause and the jet streams.",
            "Above it the air is very dry and stable, so flying above the tropopause is usually smooth.",
          ],
        },
      ],
    },
    {
      id: "isa",
      title: "The International Standard Atmosphere (ISA)",
      blocks: [
        {
          t: "p",
          text: "The real atmosphere changes every day. To build, test and compare aircraft and instruments, everyone needs one agreed \"average\" atmosphere. ICAO has fixed one: the **International Standard Atmosphere**, or ISA. It is used to **calibrate altimeters and airspeed indicators** and to **work out aircraft performance**.",
        },
        { t: "figure", key: "isa", caption: "ISA temperature: falls steadily to 11 km, then stays at -56.5 °C to 20 km." },
        {
          t: "table",
          head: ["ISA value", "Figure"],
          rows: [
            ["Air", "Perfectly **dry** (no water vapour)"],
            ["MSL temperature", "**+15 °C** (288.15 K)"],
            ["MSL pressure", "**1013.25 hPa** (29.92 inches of mercury)"],
            ["MSL density", "**1.225 kg/m³** (1225 g/m³)"],
            ["Lapse rate up to 11 km", "**6.5 °C per km** = **1.98 °C per 1000 ft** (use 2 °C per 1000 ft for quick sums)"],
            ["Tropopause", "**11 km = 36,090 ft**, temperature **-56.5 °C**"],
            ["11 km to 20 km (65,617 ft)", "Temperature **constant at -56.5 °C**"],
            ["20 km to 32 km", "Temperature rises 1 °C per km"],
            ["Gravity", "9.80665 m/s²"],
          ],
        },
        {
          t: "p",
          text: "In the ISA, **-56.5 °C is the lowest temperature**, found from 11 km to 20 km.",
        },
        {
          t: "table",
          head: ["Pressure level", "Height in ISA (rounded)"],
          caption: "Standard levels used on upper air charts",
          rows: [
            ["850 hPa", "about 5,000 ft (1.5 km)"],
            ["700 hPa", "about 10,000 ft (3 km)"],
            ["500 hPa", "about 18,000 ft (5.5 km)"],
            ["300 hPa", "about 30,000 ft (9 km)"],
            ["250 hPa", "about 34,000 ft (10.4 km)"],
            ["200 hPa", "about 39,000 ft (11.8 km)"],
          ],
        },
        {
          t: "p",
          text: "**ISA temperature at any height** (below 36,090 ft): start at +15 °C and take off 2 °C for every 1000 ft.",
        },
        {
          t: "example",
          title: "ISA temperature at FL250",
          steps: ["Height = 25 thousand ft", "Drop = 25 × 2 = 50 °C", "ISA = 15 - 50 = **-35 °C**"],
        },
        {
          t: "p",
          text: "**ISA deviation** tells you how much warmer or colder the real air is than the standard. Always do **actual minus ISA**. A plus answer means warmer than ISA, a minus answer means colder.",
        },
        {
          t: "example",
          title: "OAT at FL100 is +5 °C. Find the ISA deviation.",
          steps: ["ISA at FL100 = 15 - (10 × 2) = -5 °C", "Deviation = actual - ISA = +5 - (-5) = **+10**", "So the air is **ISA +10**, warmer than standard"],
        },
        {
          t: "example",
          title: "OAT at FL300 is -50 °C. Find the ISA deviation.",
          steps: ["ISA at FL300 = 15 - (30 × 2) = -45 °C", "Deviation = -50 - (-45) = **-5**", "So the air is **ISA -5**, colder than standard"],
        },
        {
          t: "example",
          title: "OAT at FL410 is -60 °C. Find the ISA deviation.",
          steps: ["FL410 is above the ISA tropopause (36,090 ft), so ISA stays at -56.5 °C", "Deviation = -60 - (-56.5) = **-3.5**", "So the air is **ISA -3.5**"],
        },
        {
          t: "example",
          title: "MSL pressure is 1002.25 hPa. How far is it from ISA?",
          steps: ["Deviation = actual - ISA = 1002.25 - 1013.25 = **-11 hPa**"],
        },
        {
          t: "tip",
          text: "Mind the minus signs. Write the ISA value in brackets first, then subtract: actual - (ISA). \"Minus minus\" becomes plus.",
        },
        {
          t: "p",
          text: "The **Jet Standard Atmosphere (JSA)** was made for jet engine work. It also starts at +15 °C at MSL but uses a lapse rate of **2 °C per 1000 ft** with **no tropopause**. It is rarely asked.",
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
            "N₂ 78%, O₂ 21%, argon 0.93%. N₂ : O₂ is **4 : 1 by volume**, **3 : 1 by weight**.",
            "**Water vapour** has the greatest effect on weather. Up to about 4% by volume.",
            "Ozone: most at **20 to 25 km**, absorbs UV, warms the **stratosphere**.",
            "Half the air is below **18,000 ft** (500 hPa). About 3/4 is in the troposphere. Homosphere up to **80 km**.",
            "The atmosphere is **heated from below** by the earth's surface.",
            "Layers: **troposphere, stratosphere, mesosphere, thermosphere**. Troposphere is unstable, stratosphere is stable.",
            "Tropopause: **16 to 18 km at the equator (about -75 °C)**, **8 to 10 km at the poles (about -45 °C)**, about 11 km in mid latitudes.",
            "Warmer surface, **higher** tropopause. Higher in **summer**. The equatorial tropopause is **colder** than the polar one.",
            "Tropopause **breaks at about 40° and 60°**. Jet streams near the breaks, max winds and CAT just below the tropopause.",
            "Stratosphere goes up to about **50 km**. **Nacreous** clouds in the stratosphere, **noctilucent** clouds in the mesosphere.",
            "**Lowest temperatures** in the whole atmosphere are at the **mesopause**.",
            "ISA: **dry air, +15 °C, 1013.25 hPa, 1.225 kg/m³, 1.98 °C per 1000 ft to 36,090 ft, then -56.5 °C to 65,617 ft**.",
            "ISA deviation = **actual - ISA**.",
            "Supplementary oxygen above about **10,000 ft**.",
          ],
        },
      ],
    },
  ],
  slides: [
    {
      title: "What is the atmosphere?",
      points: [
        "A layer of air held to the earth by gravity",
        "It has weight, so it exerts **pressure**",
        "It can be squeezed: thick low down, thin up high",
        "It moves heat and moisture around, making **weather**",
        "It conducts heat badly of heat",
      ],
    },
    {
      title: "What air is made of",
      points: [
        "Nitrogen **78%**, oxygen **21%**, argon **0.93%**, CO₂ about **0.04%**",
        "N₂ : O₂ = **4 : 1 by volume**, **3 : 1 by weight**",
        "Water vapour: 0 to **4%**, the most important gas for weather",
        "Particles act as **condensation nuclei** for cloud and fog",
      ],
      figure: "composition",
    },
    {
      title: "Ozone and greenhouse gases",
      points: [
        "Ozone mostly at **20 to 25 km**",
        "It absorbs UV and **warms the stratosphere**",
        "Greenhouse gases let sunlight in but trap some of the earth's heat",
        "The atmosphere is **heated from below**, by the ground",
      ],
    },
    {
      title: "Where the air is",
      points: [
        "**Half** of all the air is below **18,000 ft** (500 hPa)",
        "About **three quarters** is in the troposphere",
        "About **99%** is below 35 km",
        "Well mixed up to **80 km** (homosphere)",
        "Oxygen needed above about **10,000 ft**",
      ],
    },
    {
      title: "The four layers",
      points: [
        "**Troposphere**: temperature falls, all the weather",
        "**Stratosphere**: constant, then rising. Stable and dry",
        "**Mesosphere**: falls again. Coldest at the mesopause",
        "**Thermosphere**: rises steeply, very thin air",
      ],
      figure: "layers",
    },
    {
      title: "Clouds in the high layers",
      points: [
        "**Nacreous** (mother of pearl) clouds: stratosphere, high latitudes, winter",
        "**Noctilucent** clouds: near the mesopause, polar regions",
        "**Ionosphere** from about 60 km reflects HF radio",
      ],
    },
    {
      title: "The tropopause",
      points: [
        "Where temperature stops falling (lapse rate 2 °C per km or less)",
        "Equator **16 to 18 km, about -75 °C**",
        "Poles **8 to 10 km, about -45 °C**",
        "Warmer surface, higher tropopause. Higher in summer",
        "Equator tropopause is **colder** than the polar one",
      ],
    },
    {
      title: "Three tropopauses",
      points: [
        "Breaks at about **40°** and **60°** latitude",
        "Tropical ~100 hPa, middle ~200 hPa, polar ~300 hPa",
        "Over India the tropical tropopause is about **16 to 16.5 km**",
        "**Jet streams** near the breaks, **CAT** and max winds just below",
      ],
      figure: "tropopause",
    },
    {
      title: "ISA at a glance",
      points: [
        "Dry air, **+15 °C**, **1013.25 hPa**, **1.225 kg/m³** at MSL",
        "Falls **1.98 °C per 1000 ft** (6.5 °C per km)",
        "Tropopause **36,090 ft, -56.5 °C**",
        "Constant -56.5 °C up to **65,617 ft** (20 km)",
      ],
      figure: "isa",
    },
    {
      title: "ISA deviation in three steps",
      points: [
        "ISA temp = 15 - 2 × (thousands of feet)",
        "Above 36,090 ft, ISA is just **-56.5 °C**",
        "Deviation = **actual - ISA**",
        "Example: FL100, OAT +5 °C. ISA -5. Deviation **ISA +10**",
      ],
    },
  ],
  mcqs: [
    { id: "m1-01", q: "In which layer of the atmosphere does almost all weather occur?", options: ["Stratosphere", "Thermosphere", "Mesosphere", "Troposphere"], answer: 3, why: "The troposphere has nearly all the water vapour and the rising and sinking air that make cloud and rain." },
    { id: "m1-02", q: "By volume, nitrogen makes up about what part of dry air?", options: ["21%", "50%", "99%", "78%"], answer: 3, why: "Nitrogen is about 78% and oxygen about 21%. Together they are about 99%." },
    { id: "m1-03", q: "The ratio of nitrogen to oxygen in the atmosphere by volume is about:", options: ["1 : 4", "3 : 1", "2 : 1", "4 : 1"], answer: 3, why: "78% to 21% is close to 4 to 1. Watch for the 1 : 4 option, which has it the wrong way round." },
    { id: "m1-04", q: "The ratio of nitrogen to oxygen in the atmosphere by weight is about:", options: ["3 : 1", "4 : 1", "1 : 3", "1 : 1"], answer: 0, why: "Oxygen molecules are heavier than nitrogen molecules, so by weight the ratio drops from about 4 : 1 to about 3 : 1." },
    { id: "m1-05", q: "Which part of the atmosphere has the greatest effect on weather?", options: ["Water vapour", "Oxygen", "Nitrogen", "Argon"], answer: 0, why: "Without water vapour there would be no cloud, fog, precipitation or thunderstorm. Its latent heat also drives storms." },
    { id: "m1-06", q: "The most water vapour that air can hold, in warm and humid tropical conditions, is about:", options: ["0.4% by volume", "40% by volume", "14% by volume", "4% by volume"], answer: 3, why: "Warm air can hold more water vapour. In hot humid tropics it reaches about 4% by volume." },
    { id: "m1-07", q: "The approximate amount of carbon dioxide in the atmosphere, as given in the DGCA reference books, is:", options: ["0.03%", "3%", "0.3%", "0.93%"], answer: 0, why: "The books give 0.03% (some 0.035%). 0.93% is argon, a common trap.", flag: "The current measured value is about 0.042%. If 0.04% appears as an option, that is the up to date figure, but the exam bank expects 0.03%." },
    { id: "m1-08", q: "The highest concentration of ozone is found at a height of about:", options: ["5 to 10 km", "80 to 85 km", "50 to 55 km", "20 to 25 km"], answer: 3, why: "Ozone is found from about 10 to 50 km, with most of it at 20 to 25 km, in the stratosphere." },
    { id: "m1-09", q: "The temperature rise with height in the upper stratosphere is caused by:", options: ["Absorption of ultraviolet radiation by ozone", "Heat from the earth's surface", "Release of latent heat", "Friction with the upper winds"], answer: 0, why: "Ozone absorbs the sun's UV radiation and warms the layer it sits in." },
    { id: "m1-10", q: "The atmosphere is mainly heated:", options: ["Directly by the sun's rays from above", "By the jet streams", "By the ozone layer", "From below, by the earth's surface"], answer: 3, why: "Sunlight mostly passes through the air and warms the ground. The ground then warms the air above it, so temperature usually falls with height." },
    { id: "m1-11", q: "Greenhouse gases such as CO₂ and water vapour:", options: ["Let short wave solar radiation pass but absorb some long wave radiation from the earth", "Absorb short wave solar radiation only", "Block sunlight from reaching the ground", "Have no effect on temperature"], answer: 0, why: "They are mostly transparent to incoming sunlight but absorb part of the long wave heat given out by the earth, keeping it warmer." },
    { id: "m1-12", q: "The part of the atmosphere up to about 80 km, where the make up of air stays nearly the same, is called the:", options: ["Heterosphere", "Ionosphere", "Exosphere", "Homosphere"], answer: 3, why: "Homo means same. Up to about 80 km the gases are well mixed. Above it is the heterosphere." },
    { id: "m1-13", q: "About half of the mass of the atmosphere lies below:", options: ["5,000 ft", "10,000 ft", "18,000 ft", "36,000 ft"], answer: 2, why: "At about 18,000 ft (5.5 km) the pressure is about 500 hPa, half the MSL value, so half the air is below this level." },
    { id: "m1-14", q: "About how much of the total mass of the atmosphere is in the troposphere?", options: ["One quarter", "One half", "Three quarters", "All of it"], answer: 2, why: "The troposphere holds about three quarters of the air's mass and about 99% of its water vapour." },
    { id: "m1-15", q: "The height of the tropopause over the equator is about:", options: ["8 to 10 km", "11 to 12 km", "16 to 18 km", "25 to 30 km"], answer: 2, why: "Warm equatorial air rises and mixes high, so the tropopause is at about 16 to 18 km there." },
    { id: "m1-16", q: "The height of the tropopause over the poles is about:", options: ["8 to 10 km", "12 to 14 km", "16 to 18 km", "2 to 4 km"], answer: 0, why: "The cold polar surface gives a low tropopause, about 8 to 10 km." },
    { id: "m1-17", q: "In mid latitudes, the tropopause is normally found at about:", options: ["20,000 ft", "25,000 ft", "36,000 ft", "55,000 ft"], answer: 2, why: "In mid latitudes it is about 11 km, which is about 36,000 ft. This is also the ISA tropopause, 36,090 ft." },
    { id: "m1-18", q: "Compared with the tropopause over the poles, the temperature at the tropopause over the equator is:", options: ["Higher", "Higher in winter only", "The same", "Lower"], answer: 3, why: "Over the equator the air keeps cooling up to 16 to 18 km, reaching about -75 °C. Over the poles it stops at about 8 km, at about -45 °C." },
    { id: "m1-19", q: "A typical temperature at the tropopause over the equator is:", options: ["-40 °C", "-56.5 °C", "-75 °C", "-100 °C"], answer: 2, why: "The equatorial tropopause is the coldest, about -75 °C to -80 °C. -56.5 °C is the ISA value, and about -45 °C is typical over the poles." },
    { id: "m1-20", q: "The higher the surface temperature, the tropopause will be:", options: ["Lower", "Broken", "At the same height", "Higher"], answer: 3, why: "Warm air rises and mixes higher before it stops cooling, so a warmer surface gives a higher tropopause." },
    { id: "m1-21", q: "Over north India, the tropopause is normally higher in:", options: ["Winter", "It does not change with season", "Spring and autumn only", "Summer"], answer: 3, why: "The surface is warmer in summer, so the tropopause rises. It is lower in winter." },
    { id: "m1-22", q: "The tropopause is broken (discontinuous) at about:", options: ["20° and 80° latitude", "30° latitude only", "40° and 60° latitude", "The equator"], answer: 2, why: "The tropopause steps up from polar to middle to tropical, with breaks near 60° and 40°. The 40° break is the more marked one." },
    { id: "m1-23", q: "Jet streams are usually found:", options: ["Near the breaks in the tropopause, just below it", "In the middle of the stratosphere", "Close to the ground in the friction layer", "Only over the equator"], answer: 0, why: "Jet streams blow near the tropopause breaks, and the strongest winds are just below the tropopause." },
    { id: "m1-24", q: "Above about 8 km, at the same height, the air is coldest over the:", options: ["Poles", "Mid latitudes", "Equator", "It is the same everywhere"], answer: 2, why: "Over the poles cooling stops at about 8 km, but over the equator it continues up to 16 to 18 km. So higher up, the equator is colder." },
    { id: "m1-25", q: "The tropical tropopause over India is normally found at about:", options: ["8 to 9 km, near 300 hPa", "11 to 12 km, near 200 hPa", "16 to 16.5 km, near 100 hPa", "20 to 22 km, near 50 hPa"], answer: 2, why: "The tropical tropopause is near the 100 hPa level, about 16 to 16.5 km over India." },
    { id: "m1-26", q: "The troposphere is generally:", options: ["Stable", "Isothermal", "Neutral", "Unstable"], answer: 3, why: "Temperature falls with height in the troposphere, so rising air tends to keep rising. It is the turning, mixing layer." },
    { id: "m1-27", q: "The stratosphere is generally:", options: ["Unstable", "Neutral", "Stable", "Full of convective cloud"], answer: 2, why: "Temperature is constant or rising with height, so warm air sits on cold air and vertical movement is stopped." },
    { id: "m1-28", q: "The stratosphere extends from the tropopause up to about:", options: ["20 km", "50 km", "80 km", "100 km"], answer: 1, why: "The stratopause is at about 50 km, where the temperature is close to 0 °C." },
    { id: "m1-29", q: "If you climb through the lower stratosphere, the temperature:", options: ["Keeps falling at 6.5 °C per km", "Stays about the same at first, then rises", "Falls sharply", "Changes at random"], answer: 1, why: "The lower stratosphere is about isothermal. Higher up the temperature rises because ozone absorbs UV." },
    { id: "m1-30", q: "Nacreous (mother of pearl) clouds form in the:", options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], answer: 1, why: "They form at about 20 to 30 km in the stratosphere, over high latitudes in winter." },
    { id: "m1-31", q: "Noctilucent clouds form in the:", options: ["Upper troposphere", "Lower stratosphere", "Mesosphere, near the mesopause", "Exosphere"], answer: 2, why: "They are the highest clouds, near the mesopause at about 80 to 85 km, seen over polar regions." },
    { id: "m1-32", q: "The lowest temperatures in the atmosphere are found at the:", options: ["Tropopause over the poles", "Tropopause over the equator", "Stratopause", "Mesopause"], answer: 3, why: "At the mesopause the temperature drops to about -90 °C or below, colder than any tropopause." },
    { id: "m1-33", q: "The part of the upper atmosphere that reflects HF radio waves is the:", options: ["Ionosphere", "Ozone layer", "Tropopause", "Homosphere"], answer: 0, why: "From about 60 km up, charged particles in the ionosphere bend HF radio waves back to earth. Solar flares can disturb it." },
    { id: "m1-34", q: "In the ICAO standard atmosphere, the temperature at mean sea level is:", options: ["0 °C", "+10 °C", "+15 °C", "+20 °C"], answer: 2, why: "ISA MSL temperature is +15 °C, which is 288.15 K." },
    { id: "m1-35", q: "In the ICAO standard atmosphere, the pressure at mean sea level is:", options: ["1000 hPa", "1013.25 hPa", "1012.25 hPa", "1031.25 hPa"], answer: 1, why: "ISA MSL pressure is 1013.25 hPa, which equals 29.92 inches of mercury." },
    { id: "m1-36", q: "In the ICAO standard atmosphere, the density at mean sea level is:", options: ["1.225 kg/m³", "12.25 kg/m³", "0.1225 kg/m³", "1.013 kg/m³"], answer: 0, why: "ISA MSL density is 1.225 kg/m³, the same as 1225 g/m³." },
    { id: "m1-37", q: "The ISA temperature lapse rate up to 11 km is:", options: ["1.5 °C per 1000 ft", "1.98 °C per 1000 ft", "3 °C per 1000 ft", "6.5 °C per 1000 ft"], answer: 1, why: "It is 6.5 °C per km, which is 1.98 °C per 1000 ft. The 6.5 option is a trap because it is per km, not per 1000 ft." },
    { id: "m1-38", q: "In the ISA, the tropopause is at:", options: ["11 km (36,090 ft) with -56.5 °C", "16 km (52,500 ft) with -75 °C", "8 km (26,250 ft) with -45 °C", "20 km (65,617 ft) with -44.5 °C"], answer: 0, why: "ISA puts the tropopause at 11 km, which is 36,090 ft, with -56.5 °C. That stays constant up to 20 km." },
    { id: "m1-39", q: "Which statement about the ISA is correct?", options: ["The air contains 1% water vapour", "The air is perfectly dry", "The air is saturated", "The humidity is 50%"], answer: 1, why: "ISA assumes perfectly dry air. Real air always has some water vapour." },
    { id: "m1-40", q: "What is the ISA temperature at FL200?", options: ["-5 °C", "-25 °C", "-40 °C", "-56.5 °C"], answer: 1, why: "15 - (20 × 2) = -25 °C. Using 1.98 °C per 1000 ft gives -24.6 °C, which rounds to the same answer." },
    { id: "m1-41", q: "At FL100 the outside air temperature is +5 °C. The ISA deviation is:", options: ["ISA +5", "ISA -10", "ISA +10", "ISA +20"], answer: 2, why: "ISA at FL100 = 15 - 20 = -5 °C. Deviation = actual - ISA = +5 - (-5) = +10." },
    { id: "m1-42", q: "At FL300 the outside air temperature is -50 °C. The ISA deviation is:", options: ["ISA -5", "ISA +5", "ISA -15", "ISA +10"], answer: 0, why: "ISA at FL300 = 15 - 60 = -45 °C. Deviation = -50 - (-45) = -5." },
    { id: "m1-43", q: "At FL410 the outside air temperature is -60 °C. The ISA deviation is about:", options: ["ISA +7", "ISA -3.5", "ISA -13", "ISA +3.5"], answer: 1, why: "FL410 is above the ISA tropopause, so ISA there is -56.5 °C. Deviation = -60 - (-56.5) = -3.5." },
    { id: "m1-44", q: "The MSL pressure is 1002.25 hPa. Its deviation from ISA is:", options: ["+11 hPa", "-11 hPa", "-10 hPa", "+12 hPa"], answer: 1, why: "Actual - ISA = 1002.25 - 1013.25 = -11 hPa." },
    { id: "m1-45", q: "The main purpose of the ICAO standard atmosphere is to:", options: ["Forecast the weather", "Give a common reference to calibrate instruments such as altimeters and to compare aircraft performance", "Set the height of the tropopause each day", "Decide the transition altitude"], answer: 1, why: "The real atmosphere keeps changing, so ISA gives everyone one fixed reference for instruments and performance figures." },
    { id: "m1-46", q: "When temperature goes up as you climb, the layer is called:", options: ["A lapse rate", "An inversion", "An isothermal layer", "Adiabatic cooling"], answer: 1, why: "An inversion is a negative lapse rate: temperature goes up as you climb. Isothermal means no change with height." },
    { id: "m1-47", q: "Supplementary oxygen is generally needed when flying above about:", options: ["5,000 ft", "10,000 ft", "25,000 ft", "41,000 ft"], answer: 1, why: "Air thins quickly with height. Above about 10,000 ft there is not enough oxygen pressure for normal brain function over time." },
    { id: "m1-48", q: "The word \"tropos\" in troposphere means:", options: ["Turning or mixing", "Warm", "Wet", "Lower"], answer: 0, why: "Tropos is Greek for turning. The troposphere is the layer where air keeps turning over and mixing." },
  ],
};
