// Meteorology Module 11: Thunderstorms, Microburst and Windshear. CAR Sec 7 Series B Part IV, Appendix B 1.9 c, d.
// Written fresh for Runway Zero. Microburst figures follow the FAA AIM (under 4 km, seldom over 15 minutes, downdraughts to 6,000 ft/min).
// Windshear intensity terms follow ICAO (kt per 100 ft).
import type { Module } from "../types.ts";

export const M11: Module = {
  n: 11,
  title: "Thunderstorms, Microburst and Windshear",
  car: "1.9 c, d",
  summary:
    "What a thunderstorm needs, the three stages of a storm cell, the kinds of thunderstorm (including squall lines and the Indian norwesters), every hazard a CB brings, how to avoid them, and low level windshear: its causes, what it does to an aircraft on approach or take-off, the microburst, and how windshear is reported.",
  sections: [
    {
      id: "needs",
      title: "What a thunderstorm needs",
      blocks: [
        {
          t: "p",
          text: "A thunderstorm is a **cumulonimbus (CB)** cloud with thunder and lightning. Three things are needed, and the exam often asks for all three together:",
        },
        {
          t: "list",
          items: [
            "**Deep unstable air**: a **steep lapse rate** through a deep layer, so a rising parcel stays warmer than the air around it for many thousands of feet.",
            "**Plenty of moisture**: high humidity in the lower layers. Condensation releases **latent heat**, which keeps the parcel warm and rising.",
            "**A trigger** to start the air rising: surface heating, hills, a front, or air converging (as in the ITCZ or a low).",
          ],
        },
        {
          t: "p",
          text: "Without moisture you get dry thermals or dust devils. Without instability the cloud stays flat. Without a trigger the unstable air may just sit there until afternoon heating sets it off.",
        },
        {
          t: "tip",
          text: "Think **M I T**: Moisture, Instability, Trigger.",
        },
      ],
    },
    {
      id: "life",
      title: "Life cycle of a storm cell",
      blocks: [
        { t: "figure", key: "tscell", caption: "The three stages of a single thunderstorm cell. Arrows show the air moving up or down." },
        {
          t: "table",
          head: ["Stage", "Air movement", "What you see and meet"],
          rows: [
            ["**Cumulus (developing)**", "**Updraughts only**, getting stronger with height", "Cu grows into towering Cu (TCU). No rain at the ground yet. Lasts about 10 to 15 minutes"],
            ["**Mature**", "**Both updraughts and downdraughts**, side by side", "Starts when **rain reaches the ground**. The most violent stage: heavy rain, hail, lightning, severe turbulence, icing, the **gust front** and microbursts. Anvil forms at the top. Lasts about 15 to 30 minutes"],
            ["**Dissipating**", "**Downdraughts only**", "Rain gets lighter and stops. The cloud collapses, often leaving the anvil (a sheet of cirrus) behind"],
          ],
        },
        {
          t: "list",
          items: [
            "A single cell lives for about **an hour** from start to finish. A **multicell** storm keeps making new cells beside the old ones and can last **several hours**.",
            "Each cell is a few km across. Tops reach **40,000 ft or more in the tropics**, sometimes over 55,000 ft over India in the pre-monsoon.",
            "The downdraught is fed by cold rain falling through the cloud and by evaporation cooling the air. That is why it is **colder** than the air around it and rushes down.",
          ],
        },
      ],
    },
    {
      id: "types",
      title: "Kinds of thunderstorm",
      blocks: [
        {
          t: "table",
          head: ["Kind", "How it forms", "Notes"],
          rows: [
            ["**Air mass (heat, thermal)**", "Strong **surface heating** of moist unstable air", "Afternoon and evening over land. Scattered, single cells. Over the sea they peak at night and early morning"],
            ["**Orographic**", "Moist unstable air forced up **hills or mountains**", "On the windward side. Can sit over the same ridge for hours"],
            ["**Frontal**", "Lifting along a front, mainly an active **cold front**", "Form a line along the front and **move with it**, so they are the **fastest moving** kind. Warm front CBs are often **embedded** in layer cloud"],
            ["**Squall line**", "A line of CBs, often **ahead of a cold front**, or along a dry line or outflow boundary", "Can be hundreds of km long. The most severe non-rotating storms: violent squalls, hail, heavy rain. Hard to get round"],
            ["**Convergence**", "Air meeting and rising in a low or the **ITCZ**", "Lines and clusters over the tropics"],
          ],
        },
        {
          t: "list",
          items: [
            "**Embedded thunderstorms** are CBs hidden inside layers of cloud or in haze, so they **cannot be seen** from the cockpit. Weather radar is the only way to find them in flight.",
            "A **supercell** is a single very large storm with a **rotating updraught**. It gives the worst hail, the strongest winds and sometimes tornadoes.",
            "A **thunderstorm is reported by the Met office when thunder is heard** at the station. Lightning seen far away without thunder is reported as lightning, not as a thunderstorm at the airfield.",
          ],
        },
        {
          t: "p",
          text: "**Over India** (more in Module 10): **norwesters (Kalbaisakhi)** over the east and north east from March to May, **dust storms (Andhi)** in the north west, pre-monsoon storms over the south and Kerala, monsoon CBs along the trough and the west coast, and in **October and November** thunderstorms over the **south peninsula, Kerala and Tamil Nadu** with the north east monsoon.",
        },
      ],
    },
    {
      id: "hazards",
      title: "Thunderstorm hazards",
      blocks: [
        {
          t: "table",
          head: ["Hazard", "Where and why"],
          rows: [
            ["**Turbulence**", "**Severe** inside the cloud, where updraughts and downdraughts sit side by side. Also below the cloud, **under the anvil**, around the cloud out to 20 nm, and above the top"],
            ["**Icing**", "Strong updraughts carry **large supercooled drops** high up, so **clear ice** can form quickly, from 0 °C down to about -20 °C, and some icing down to -40 °C"],
            ["**Hail**", "Inside the cloud, below it, and **thrown out under the anvil**, even in clear air several km from the cloud. Can crack windscreens and dent leading edges"],
            ["**Lightning**", "Most strikes on aircraft happen **near the freezing level**, roughly between +10 °C and -10 °C. Can blind the crew for a moment, damage radio and electrics and upset the **magnetic compass**"],
            ["**Gust front and squall**", "The cold downdraught spreads out ahead of the storm as a **first gust**: a sudden wind shift, sharp rise in speed, temperature drop and pressure jump, often several km before the rain"],
            ["**Microburst and windshear**", "Strong downdraughts hitting the ground and spreading out. The biggest danger near the ground (see below)"],
            ["**Heavy rain**", "Poor visibility, water on the runway, and very heavy rain can affect engines"],
            ["**Pressure changes**", "Pressure jumps as the gust front passes and the **altimeter may misread** by a few hundred feet"],
            ["**Static and radio noise**", "Static on HF and ADF. **St Elmo's fire**: a blue glow on the windscreen and wing tips from static discharge"],
            ["**Tornado**", "Rare over India but seen with the strongest norwesters"],
          ],
        },
        {
          t: "p",
          text: "The exam often asks why a thunderstorm is a hazard and gives several reasons as options. All of them are real: lightning, downdraughts, turbulence, icing and hail all come from the same CB.",
        },
      ],
    },
    {
      id: "avoid",
      title: "Avoiding thunderstorms",
      blocks: [
        {
          t: "list",
          items: [
            "**Keep well clear**: at least **10 nm** from any CB, and **20 nm** from severe ones, more at high levels. Pass on the **upwind side** so you are away from hail thrown out under the anvil.",
            "**Never fly under the anvil** or under the overhang of a storm. **Never take off or land** with a thunderstorm over or close to the airfield.",
            "Do not try to fly through a gap between two strong cells that are close together. The gap can close.",
            "Do not trust the look of the cloud. A storm can be **embedded** in layer cloud. Use **weather radar** and avoid all red and magenta returns and any echo with a **hook, finger or sharp edge**.",
            "Clear the top by a big margin. A rough rule is 1,000 ft above the top for every 10 kt of wind at that level.",
          ],
        },
        {
          t: "p",
          text: "**If you cannot avoid it** and must go through: tighten belts and stow loose items, set **turbulence penetration speed**, keep the **wings level and the attitude steady** and let the height vary (do not chase the altimeter), switch on **engine and airframe anti-icing**, turn **cockpit lights full bright** against lightning glare, and **keep the heading**. Once in, it is usually safer to keep going than to turn back.",
        },
      ],
    },
    {
      id: "shear",
      title: "Windshear",
      blocks: [
        {
          t: "p",
          text: "**Windshear** is a change of wind **speed or direction or both** over a short distance. It can be **vertical** (the wind changes with height) or **horizontal** (the wind changes along your path). It can happen at any level wherever there is a wind shift or a strong change of wind speed. It matters most as **low level windshear**, within about **1,600 ft (500 m)** of the ground on take-off and approach, where there is little height to recover.",
        },
        {
          t: "table",
          head: ["Cause", "How it gives windshear"],
          rows: [
            ["**Thunderstorms and CB**", "Gust front, **microbursts** and downdraughts. Found **on all sides of the storm and directly under it**. The worst kind"],
            ["**Fronts**", "Wind changes across the front, worst with a **fast moving cold front** and a large temperature difference"],
            ["**Low level inversion**", "On a clear night the surface air goes calm under an inversion while the wind just above it stays strong. Climbing through the top of the inversion, the wind changes suddenly"],
            ["**Low level jet**", "A band of strong wind a few hundred to a few thousand feet up, often at night"],
            ["**Terrain and buildings**", "Strong wind round hills, hangars and big buildings near the runway"],
            ["**Sea breeze front**", "Wind changes as the sea breeze front passes"],
            ["**Mountain waves**", "Rotors and strong downdraughts in the lee of ridges (Module 12)"],
          ],
        },
        {
          t: "p",
          text: "**What it does to the aircraft.** Because of its inertia, the aircraft keeps its speed over the ground for a moment when the wind changes. So the **airspeed changes**:",
        },
        {
          t: "table",
          head: ["Change", "Airspeed", "Flight path on approach", "Name"],
          rows: [
            ["**Headwind increases** or tailwind decreases", "Goes **up**", "Floats **above** the glide path", "Performance increasing"],
            ["**Headwind decreases** or tailwind increases", "Goes **down**", "Sinks **below** the glide path", "**Performance decreasing**, the dangerous one"],
            ["**Downdraught**", "Little change at first", "Pushed **down**", "Dangerous close to the ground"],
          ],
        },
        {
          t: "p",
          text: "On approach, a sudden **loss of headwind** or **gain of tailwind** is the most dangerous: speed falls, lift falls, and the aircraft sinks below the glide path just when it is lowest. An increasing headwind is easier to handle but it is often the first part of a microburst, with the tailwind still to come.",
        },
        {
          t: "table",
          head: ["Intensity (ICAO)", "Vertical shear", "Effect"],
          rows: [
            ["**Light**", "0 to 4 kt per 100 ft", "Minor changes of path and speed"],
            ["**Moderate**", "5 to 8 kt per 100 ft", "Significant effect on control"],
            ["**Strong**", "9 to 12 kt per 100 ft", "Hard to hold the path and speed"],
            ["**Severe**", "More than 12 kt per 100 ft", "Hazardous effect on control"],
          ],
          caption: "Vertical windshear is measured in knots per 100 ft (about 30 m). Older books give it in knots per 1,000 ft or in m/s per 30 m.",
        },
      ],
    },
    {
      id: "micro",
      title: "The microburst",
      blocks: [
        {
          t: "p",
          text: "A **microburst** is a small, very strong **downdraught** that hits the ground and spreads out in all directions. The air inside it is **colder than the air around it**, which is why it falls so fast. A larger one, over about 4 km across, is a **macroburst**. Both are kinds of **downburst**.",
        },
        { t: "figure", key: "microburst", caption: "Flying an approach through a microburst. First a headwind, then a downdraught, then a tailwind." },
        {
          t: "list",
          items: [
            "**Size**: the outflow is **less than 4 km** across.",
            "**Life**: seldom more than **15 minutes** from the time it hits the ground. The winds get stronger for the first 5 minutes after it touches down, and the strongest winds last only **2 to 4 minutes**.",
            "**Strength**: downdraughts up to about **6,000 ft per minute**. With 45 kt of outflow each side, the change from headwind to tailwind can be **90 kt**.",
            "**Wet microburst**: comes out of heavy rain under a CB. **Dry microburst**: under high based cloud with **virga** (rain that evaporates before reaching the ground). Evaporation chills the air, which then plunges down. A ring of blowing dust may be the only sign.",
            "Where there is one, expect more. They are common under norwesters and pre-monsoon CBs over India.",
          ],
        },
        {
          t: "p",
          text: "**Flying through one on approach** (follow the figure): (1) the headwind rises, speed rises and the aircraft floats high. The pilot is tempted to reduce power. (2) In the core, a strong downdraught pushes the aircraft down. (3) On the far side the headwind turns into a **tailwind**, airspeed falls sharply and the aircraft sinks fast, possibly into the ground.",
        },
        {
          t: "list",
          items: [
            "**Avoid**: do not take off or land with a CB over or near the field, or with virga, blowing dust or a reported windshear on the path. Wait or divert.",
            "**If you meet it**: apply **full (go-around or take-off) power** at once, pitch up to the windshear attitude (follow the flight director or windshear guidance), **do not change flap or gear** until clear, accept the stick shaker if needed, and do not chase airspeed.",
            "Report it to ATC so others are warned.",
          ],
        },
      ],
    },
    {
      id: "warn",
      title: "How windshear is found and reported",
      blocks: [
        {
          t: "list",
          items: [
            "**Ground systems**: **LLWAS** (a ring of anemometers round the airfield comparing winds) and **Doppler weather radar**, which sees air moving towards and away from it.",
            "**Aircraft systems**: **reactive** windshear warning (the aircraft senses it is in shear) and **predictive** windshear on the weather radar (warns before you fly into it).",
            "The Met office issues a **windshear warning** for the approach and take-off paths when it is observed or expected.",
            "In a **METAR**, windshear is added at the end as **supplementary information**: **WS R28** (windshear on runway 28) or **WS ALL RWY**. It is not part of the wind group.",
            "**Pilots** should report windshear to ATC: where it was, at what height, and what it did (for example \"loss of 20 kt at 500 ft on final runway 28\").",
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
            "Thunderstorm needs: **moisture, steep lapse rate (instability) and a trigger**.",
            "Stages: **cumulus** (updraughts only), **mature** (up and down, starts when **rain reaches the ground**, most severe), **dissipating** (downdraughts only).",
            "Single cell about **1 hour**. Multicell storms last hours.",
            "**Frontal** storms are the **fastest moving**. **Squall lines** form **ahead of a cold front**.",
            "**Embedded** TS: hidden in cloud layers or haze and **cannot be seen**.",
            "TS is reported when **thunder is heard** at the station.",
            "Hazards: turbulence, icing (**clear ice**), **hail (also under the anvil)**, lightning, gust front, microburst, windshear, heavy rain, pressure jumps, static.",
            "Lightning strikes most likely **near the freezing level**.",
            "Keep **10 nm** from CB, **20 nm** from severe ones. Never under the anvil. Pass upwind.",
            "In a storm: turbulence speed, **hold attitude not height**, anti-ice on, lights full bright, keep the heading.",
            "Windshear: change of wind speed or direction or both, **at any level**. Low level means below about **1,600 ft (500 m)**.",
            "TS windshear is found **on all sides and directly under** the storm.",
            "Loss of headwind or gain of tailwind: **airspeed falls, aircraft sinks below the path**. The dangerous case.",
            "Inversion windshear: calm below, strong wind above, on clear nights.",
            "Vertical shear in **kt per 100 ft**. Light 0 to 4, moderate 5 to 8, strong 9 to 12, severe over 12.",
            "**Microburst**: under **4 km**, cold air, downdraught to **6,000 ft/min**, lasts **under 15 minutes**, peak winds 2 to 4 minutes.",
            "Microburst on approach: **headwind, then downdraught, then tailwind**.",
            "Windshear in a METAR: supplementary information **WS R28** or **WS ALL RWY**.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "What a thunderstorm needs", points: ["**Moisture** in the low levels", "**Instability**: steep lapse rate through a deep layer", "A **trigger**: heating, hills, front, convergence", "Remember **M I T**"] },
    { title: "Three stages", points: ["**Cumulus**: updraughts only", "**Mature**: up and down, rain at the ground, worst weather", "**Dissipating**: downdraughts only", "One cell lives about an hour"], figure: "tscell" },
    { title: "Kinds of thunderstorm", points: ["**Air mass**: afternoon heating over land", "**Orographic**: over hills", "**Frontal**: moves with the front, fastest", "**Squall line**: ahead of a cold front"] },
    { title: "Hidden and severe storms", points: ["**Embedded**: hidden in cloud or haze", "**Supercell**: rotating, worst hail and wind", "Reported as TS when **thunder is heard**", "India: norwesters, dust storms, pre-monsoon CB"] },
    { title: "CB hazards", points: ["Severe turbulence, clear ice, **hail under the anvil**", "Lightning near the **freezing level**", "**Gust front**: wind shift, temperature drop, pressure jump", "Microburst, windshear, heavy rain, static"] },
    { title: "Keep away", points: ["**10 nm** from CB, **20 nm** if severe", "Pass **upwind**, never under the anvil", "No take-off or landing with a CB overhead", "Use radar: avoid red, magenta, hooks"] },
    { title: "If you must go through", points: ["Turbulence speed, belts tight", "**Hold attitude**, let height vary", "Anti-ice on, cockpit lights full bright", "Keep the heading, do not turn back"] },
    { title: "Windshear", points: ["Change of wind **speed or direction**", "Vertical or horizontal, **any level**", "Low level: below about **1,600 ft**", "Causes: CB, fronts, inversions, terrain, sea breeze"] },
    { title: "Effect on approach", points: ["More headwind: speed up, **above** the path", "**Less headwind or more tailwind: speed down, below the path**", "The second is the dangerous one", "Downdraughts push you down"] },
    { title: "The microburst", points: ["Under **4 km**, cold falling air", "Downdraught up to **6,000 ft/min**", "Lasts **under 15 minutes**, worst for 2 to 4", "**Headwind, downdraught, tailwind**"], figure: "microburst" },
    { title: "Escape and report", points: ["**Full power**, windshear pitch, no flap or gear change", "Do not take off or land into it, wait or divert", "LLWAS, Doppler radar, predictive windshear", "METAR: **WS R28**, report it to ATC"] },
  ],
  mcqs: [
    { id: "m11-01", q: "The conditions needed for a thunderstorm to form are:", options: ["Plenty of moisture, a steep lapse rate and a lifting trigger", "Plenty of moisture and an inversion", "Plenty of moisture and full cloud cover", "Dry air and strong surface wind"], answer: 0, why: "A CB needs moist air, deep instability (a steep lapse rate) and something to start the air rising." },
    { id: "m11-02", q: "In the cumulus stage of a thunderstorm cell, the air inside the cloud is moving:", options: ["Down only", "Up and down side by side", "Up only", "Sideways only"], answer: 2, why: "In the developing stage there are only updraughts. Rain has not yet started falling out of the cloud." },
    { id: "m11-03", q: "The mature stage of a thunderstorm begins when:", options: ["The anvil disappears", "The first cumulus forms", "Rain starts to reach the ground", "Updraughts stop"], answer: 2, why: "Falling rain drags air down with it, starting the downdraught. From then on there are updraughts and downdraughts side by side." },
    { id: "m11-04", q: "A mature thunderstorm has:", options: ["Strong updraughts only", "Strong downdraughts only", "Strong updraughts and downdraughts", "No vertical movement"], answer: 2, why: "The mature stage has both, next to each other, which is why turbulence is worst then." },
    { id: "m11-05", q: "The dissipating stage of a thunderstorm is marked by:", options: ["Downdraughts only", "Strong updraughts only", "The first towering cumulus", "Rapid growth of the cloud"], answer: 0, why: "The updraught dies and the cloud is left with only downdraughts as the rain eases." },
    { id: "m11-06", q: "The usual life of a single thunderstorm cell, from cumulus to dissipating stage, is about:", options: ["5 minutes", "One hour", "6 to 8 hours", "A whole day"], answer: 1, why: "A single cell lasts about an hour. Storms that last for hours are multicell storms making new cells." },
    { id: "m11-07", q: "Which kind of thunderstorm usually moves fastest?", options: ["Orographic", "Air mass (heat) storm", "Frontal storm", "A storm in a col"], answer: 2, why: "Frontal thunderstorms are carried along with the front. Orographic storms stay over the hills and heat storms drift slowly." },
    { id: "m11-08", q: "Air mass (heat) thunderstorms over land are most common:", options: ["Early in the morning", "In the afternoon and evening", "Around midnight", "Only in winter"], answer: 1, why: "They grow from surface heating, which peaks in the afternoon." },
    { id: "m11-09", q: "The term \"embedded thunderstorms\" means:", options: ["Severe storms inside a squall line", "Storms that are forecast in stable air", "Storms hidden inside cloud layers or haze, so they cannot be seen", "Storms that have dissipated"], answer: 2, why: "Embedded CBs are hidden from view. Weather radar is the only way to find them in flight." },
    { id: "m11-10", q: "A thunderstorm is reported at an aerodrome by the Met office when:", options: ["Thunder is heard", "Lightning is seen anywhere", "A CB is seen on the horizon", "Rain falls heavily"], answer: 0, why: "A thunderstorm at the station is reported when thunder is heard there." },
    { id: "m11-11", q: "A thunderstorm is a hazard to aircraft because of:", options: ["Lightning, which can damage radios and electrics", "Strong downdraughts near the ground", "Turbulence and icing in the CB", "Every one of these reasons"], answer: 3, why: "Lightning, downdraughts, turbulence and icing all come from the same CB. All are real hazards." },
    { id: "m11-12", q: "Hail from a thunderstorm can be met:", options: ["Only inside the cloud", "Only in heavy rain", "Never in clear air", "Inside the cloud, below it and under the anvil, even in clear air"], answer: 3, why: "Hail can be thrown out from the top of the storm and fall under the anvil several km away from the main cloud." },
    { id: "m11-13", q: "Aircraft are most often struck by lightning:", options: ["Near the freezing level", "Only above 40,000 ft", "Only in clear air", "Only on the ground"], answer: 0, why: "Most strikes happen at temperatures close to 0 °C, roughly between +10 °C and -10 °C." },
    { id: "m11-14", q: "The first gust from a thunderstorm is caused by:", options: ["Air rising into the storm", "The cold downdraught spreading out at the ground ahead of the storm", "Lightning heating the air", "The sea breeze"], answer: 1, why: "The downdraught hits the ground and spreads out, giving a sudden wind shift, gusts and a drop in temperature." },
    { id: "m11-15", q: "As the gust front of a thunderstorm passes an airfield, you would expect:", options: ["A slow rise in temperature", "Fog to form", "A sudden wind shift, gusts, a drop in temperature and a jump in pressure", "The wind to go calm for an hour"], answer: 2, why: "The cold outflow brings a sharp wind change and gusts, a fall in temperature and a rise in pressure." },
    { id: "m11-16", q: "A blue glow on the windscreen and wing tips near a thunderstorm is:", options: ["A halo", "A corona", "St Elmo's fire, from static discharge", "An aurora"], answer: 2, why: "St Elmo's fire is a harmless glow from static electricity. It shows the air is highly charged." },
    { id: "m11-17", q: "The minimum distance usually kept from a thunderstorm is about:", options: ["1 nm", "10 nm, and 20 nm from severe storms", "100 nm", "It is safe to fly under the anvil"], answer: 1, why: "Turbulence and hail reach well outside the cloud, so a wide berth is needed, wider at high levels." },
    { id: "m11-18", q: "When passing a thunderstorm, it is better to pass on the:", options: ["Downwind side, under the anvil", "Side under the overhang", "Upwind side", "Side with the most lightning"], answer: 2, why: "The anvil and the hail it throws out are carried downwind, so the upwind side is safer." },
    { id: "m11-19", q: "If you have to fly through a thunderstorm, you should:", options: ["Hold the altitude exactly with large control inputs", "Fly as fast as possible", "Turn back as soon as you enter the cloud", "Fly at turbulence speed and hold a steady attitude, letting the height vary"], answer: 3, why: "Chasing the altimeter in strong up and down draughts overloads the aircraft. Keep the attitude and heading steady." },
    { id: "m11-20", q: "When flying near thunderstorms at night, the cockpit lights should be:", options: ["Turned off", "Turned full bright", "Set to red only", "Dimmed"], answer: 1, why: "Bright cockpit lights reduce the blinding effect of lightning flashes." },
    { id: "m11-21", q: "Squall lines most often form:", options: ["Behind a warm front", "In an occluded front", "Ahead of a fast moving cold front", "In a high pressure area"], answer: 2, why: "A line of CBs often builds in the warm air ahead of an active cold front." },
    { id: "m11-22", q: "Windshear is best described as:", options: ["A change of wind speed or direction or both over a short distance", "Wind blowing across the runway", "Gusts of 10 kt or more", "Wind over 30 kt"], answer: 0, why: "Any change in wind speed or direction over a short distance, vertical or horizontal, is windshear." },
    { id: "m11-23", q: "Where can windshear occur?", options: ["Only in thunderstorms", "Only near the ground", "Only in jet streams", "Wherever there is a wind shift or a change of wind speed, at any level"], answer: 3, why: "Windshear happens at any level. It is most dangerous close to the ground on take-off and landing." },
    { id: "m11-24", q: "Low level windshear refers to windshear along the take-off and approach paths below about:", options: ["160 ft", "1,600 ft (500 m)", "16,000 ft", "Flight level 160"], answer: 1, why: "Low level windshear is the shear within about 500 m (1,600 ft) of the ground, where there is little height to recover." },
    { id: "m11-25", q: "Windshear associated with a thunderstorm can be found:", options: ["Only in front of the storm", "Only behind the storm", "On all sides of the storm and directly under it", "Only above the storm"], answer: 2, why: "The outflow spreads in every direction, and the downdraught is directly under the cell." },
    { id: "m11-26", q: "On a clear night with a strong wind a few hundred feet up, windshear is likely near the top of the:", options: ["Tropopause", "Surface (radiation) inversion", "Cloud base", "Freezing level"], answer: 1, why: "Under the inversion the air goes calm, while just above it the wind stays strong. Climbing through the inversion top, the wind changes suddenly." },
    { id: "m11-27", q: "On final approach, the headwind suddenly decreases. The airspeed will:", options: ["Increase and the aircraft will go above the glide path", "Decrease and the aircraft will sink below the glide path", "Stay the same", "Increase and the aircraft will sink"], answer: 1, why: "The aircraft keeps its ground speed for a moment, so losing headwind means losing airspeed and lift." },
    { id: "m11-28", q: "On approach, which wind change is the most dangerous?", options: ["An increasing headwind", "A steady crosswind", "A decreasing tailwind", "An increasing tailwind (or decreasing headwind)"], answer: 3, why: "It reduces airspeed and makes the aircraft sink below the path close to the ground." },
    { id: "m11-29", q: "On take-off, an aircraft meets a sudden increase in headwind. At first the airspeed will:", options: ["Increase", "Decrease", "Stay the same", "Fall to zero"], answer: 0, why: "More headwind means more airflow over the wing for the same ground speed, so airspeed rises. The danger is if it then turns to tailwind." },
    { id: "m11-30", q: "Vertical windshear is normally given in:", options: ["Metres per second", "Knots per 100 ft", "Feet per minute", "Hectopascals"], answer: 1, why: "ICAO uses knots per 100 ft (about 30 m). Older books may use knots per 1,000 ft." },
    { id: "m11-31", q: "By ICAO terms, vertical windshear of 10 kt per 100 ft is:", options: ["Light", "Moderate", "Severe", "Strong"], answer: 3, why: "Light is 0 to 4, moderate 5 to 8, strong 9 to 12 and severe over 12 kt per 100 ft." },
    { id: "m11-32", q: "A microburst is:", options: ["A strong downdraught of air colder than its surroundings", "A strong downdraught of air warmer than its surroundings", "A small tornado rising into a CB", "A gust lasting a few seconds"], answer: 0, why: "Cold, dense air plunges out of the storm, cooled by rain and evaporation." },
    { id: "m11-33", q: "The approximate diameter of a microburst is:", options: ["More than 20 km", "Less than 4 km", "About 50 km", "About 100 m"], answer: 1, why: "The outflow of a microburst is under 4 km across. Larger ones are called macrobursts." },
    { id: "m11-34", q: "An individual microburst seldom lasts longer than about:", options: ["15 minutes", "2 hours", "6 hours", "1 minute"], answer: 0, why: "It seldom lasts more than 15 minutes after it hits the ground, and the strongest winds last only 2 to 4 minutes." },
    { id: "m11-35", q: "Downdraughts in a strong microburst can reach about:", options: ["500 ft per minute", "6,000 ft per minute", "60,000 ft per minute", "50 ft per minute"], answer: 1, why: "Downdraughts of up to about 6,000 ft per minute have been measured, more than most aircraft can outclimb near the ground." },
    { id: "m11-36", q: "An aircraft flies an approach straight through a microburst. In order, it meets:", options: ["Tailwind, downdraught, headwind", "Downdraught, headwind, updraught", "Crosswind only", "Headwind, downdraught, tailwind"], answer: 3, why: "The outflow gives a headwind first, then the downdraught in the core, then a tailwind on the far side, which is the most dangerous part." },
    { id: "m11-37", q: "A dry microburst is often shown by:", options: ["Virga and a ring of blowing dust under a high based cloud", "Thick fog", "Clear blue sky with no cloud", "Steady drizzle"], answer: 0, why: "Rain evaporating as virga chills the air, which plunges down. Blowing dust on the ground may be the only sign." },
    { id: "m11-38", q: "If a microburst is met during a low approach, the pilot should:", options: ["Reduce power to stay on the glide path", "Raise the flaps at once", "Lower the nose to gain speed", "Apply full power, pitch to the windshear attitude and not change flap or gear"], answer: 3, why: "Maximum energy is needed to climb out. Changing configuration in the shear can make things worse." },
    { id: "m11-39", q: "In a METAR, low level windshear is reported:", options: ["As part of the wind group", "It is never reported in a METAR", "Only in the TAF", "As supplementary information at the end, such as WS R28"], answer: 3, why: "Windshear is added as supplementary information, for a runway (WS R28) or all runways (WS ALL RWY)." },
    { id: "m11-40", q: "A ground system that compares winds from anemometers placed round an airfield to detect windshear is:", options: ["ILS", "VOLMET", "ATIS", "LLWAS"], answer: 3, why: "The Low Level Windshear Alert System looks for differences between the wind at the sensors." },
    { id: "m11-41", q: "Thunderstorms over Kerala and coastal Tamil Nadu are common in:", options: ["October and November", "January", "July only", "December to February only"], answer: 0, why: "With the north east monsoon and the retreat of the south west monsoon, the south peninsula gets many thunderstorms in October and November." },
  ],
};
