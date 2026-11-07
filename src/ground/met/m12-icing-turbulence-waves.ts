// Meteorology Module 12: Icing, Turbulence, Mountain Waves and Inversions. CAR Sec 7 Series B Part IV, Appendix B 1.2 g, 1.9 a, b, e, f.
// Written fresh for Runway Zero. Turbulence intensity terms follow ICAO (light, moderate, severe, extreme).
import type { Module } from "../types.ts";

export const M12: Module = {
  n: 12,
  title: "Icing, Turbulence, Mountain Waves and Inversions",
  car: "1.2 g, 1.9 a, b, e, f",
  summary:
    "How ice forms on an aircraft, the kinds of ice (clear, rime, mixed, hoar frost) and where each is found, freezing rain, carburettor icing, the kinds and intensities of turbulence, mountain waves with their rotor and lenticular clouds, and inversions as a flying hazard.",
  sections: [
    {
      id: "icing",
      title: "How airframe icing forms",
      blocks: [
        {
          t: "p",
          text: "Airframe icing needs two things: **liquid water drops that are below 0 °C (supercooled)**, and an **airframe that is below 0 °C**. When a supercooled drop hits the aircraft it freezes, wholly or partly, on the spot. Cloud drops often stay liquid well below 0 °C (Module 2). Below about **-40 °C** all drops are frozen, so there is **little or no airframe icing** in clouds that cold: ice crystals bounce off.",
        },
        {
          t: "list",
          items: [
            "**Icing is most likely between 0 °C and about -15 °C**, and the risk is greatest **just above the freezing level** (at temperatures just below 0 °C), where there is the most supercooled water.",
            "In **layer cloud** (St, Sc, As, Ns) icing is usually found from 0 °C down to about -15 °C.",
            "In **cumuliform cloud** (Cu, TCU, CB) strong updraughts carry large supercooled drops high up, so **severe icing is found from 0 °C down to about -20 °C** and icing is possible down to **-40 °C**.",
            "**Cirrus** is made of ice crystals and gives **no airframe icing**.",
            "Icing can also happen in clear air, in **freezing rain or drizzle** falling from a warmer layer above.",
          ],
        },
      ],
    },
    {
      id: "types",
      title: "Kinds of ice",
      blocks: [
        {
          t: "table",
          head: ["Kind", "How it forms", "What it is like", "Where"],
          rows: [
            ["**Clear ice (glaze)**", "**Large** supercooled drops. Each drop freezes **slowly**, because the latent heat released lets part of it flow back over the surface before it freezes", "Clear, glassy, **hard, heavy**, sticks firmly. Spreads back over the wing and **changes the shape of the aerofoil**. Hard to remove", "CB and big Cu, Ns, **freezing rain**. Mostly 0 °C to about -10 °C"],
            ["**Rime ice**", "**Small** supercooled drops freeze **at once** on impact, trapping air between them", "**White, opaque, rough, brittle, light**. Builds forward on leading edges. Easier to remove", "St, Sc, As, small Cu, freezing fog. Mostly -10 °C to -20 °C and colder"],
            ["**Mixed ice**", "A mix of drop sizes, or snow caught in clear ice", "Rough, white and clear together. Can build odd shapes", "Cumuliform cloud, often -10 °C to -15 °C"],
            ["**Hoar frost**", "Water **vapour turns directly into ice** (deposition) on a surface below 0 °C. No drops involved", "Thin, white, feathery crystals", "On a parked aircraft on a **clear, cold night**, or when a cold soaked aircraft descends quickly into warm moist air"],
          ],
        },
        {
          t: "p",
          text: "**Why clear ice is the most dangerous**: it is heavy, hard to see, sticks firmly, flows back beyond the de-icing boots, and spoils the shape of the wing. **Frost** matters too: even a thin layer roughens the wing, spoils the airflow and raises the stall speed, so **all frost must be removed before take-off**.",
        },
        {
          t: "tip",
          text: "**Clear = big drops, slow freeze. Rime = small drops, quick freeze, trapped air makes it white.**",
        },
      ],
    },
    {
      id: "fzra",
      title: "Freezing rain",
      blocks: [
        { t: "figure", key: "fzra", caption: "Freezing rain: rain from a warm layer aloft falls into a layer below 0 °C." },
        {
          t: "p",
          text: "**Freezing rain (FZRA)** forms when rain falls out of a **warm layer above 0 °C** into a **layer below 0 °C** underneath, often **ahead of a warm front** where warm air rides over cold air (an inversion). The drops become supercooled but are **very large**, so they spread and freeze as **clear ice** very fast. It is the **worst icing of all**, worse than icing in freezing fog (FZFG), whose drops are tiny.",
        },
        {
          t: "list",
          items: [
            "Escape: climb into the warm layer above (if it is safe to do so), or leave the area. Do not hold height in it.",
            "Freezing rain or drizzle reported at an airfield (FZRA, FZDZ) also glazes runways, taxiways and parked aircraft.",
            "Freezing rain is rare over India. It is a winter hazard of higher latitudes and is still asked in the exam.",
          ],
        },
      ],
    },
    {
      id: "factors",
      title: "What decides how much ice you collect",
      blocks: [
        {
          t: "list",
          items: [
            "**Amount of liquid water** in the cloud (CB and Ns hold the most).",
            "**Size of the drops**: large drops give clear ice and spread further back.",
            "**Temperature** of the air and of the airframe. **Drop size together with temperature** decides the kind of ice and how bad it is.",
            "**Shape of the part**: thin, sharp parts (probes, tail edges, aerials, thin wings) collect ice **faster** than thick, blunt ones.",
            "**Speed**: a faster aircraft meets more drops, but high speed also warms the skin by friction and compression (**kinetic heating**), which can stop icing at high speed.",
            "**Time in the icing**: the longer you stay, the more you collect.",
          ],
        },
        {
          t: "table",
          head: ["Intensity", "What happens"],
          rows: [
            ["**Light**", "Slow build up. No problem for short periods. Use de-icing now and then"],
            ["**Moderate**", "Faster build up. Even short exposure is a hazard. De-icing or anti-icing needed, a change of level or route is wise"],
            ["**Severe**", "Ice builds faster than the systems can remove it. **Leave the area at once**"],
          ],
        },
        {
          t: "p",
          text: "**Effects of airframe ice**: more **weight** and **drag**, less **lift** and thrust, a **higher stall speed** with less warning, controls that stiffen or jam, propeller vibration, blocked **pitot and static** sources (wrong airspeed and altitude readings), iced windscreens and aerials, and ice breaking off into engines.",
        },
      ],
    },
    {
      id: "carb",
      title: "Carburettor and engine icing",
      blocks: [
        {
          t: "p",
          text: "In a piston engine with a carburettor, the air speeds up through the venturi (so its pressure and temperature fall) and the fuel evaporating into it takes heat. The air inside can cool by **20 °C or more**. If the outside air is humid, ice forms in the venturi and on the throttle valve, choking the engine.",
        },
        {
          t: "list",
          items: [
            "It can happen in **clear air, at outside temperatures well above 0 °C**, up to about **+25 °C or +30 °C** when the humidity is high.",
            "The risk is highest in **humid air with temperatures around +5 °C to +20 °C**, and at **low power** (descents and approach), when the partly closed throttle valve chills the air most.",
            "First sign with a fixed pitch propeller: a **slow drop in RPM**. Apply **full carburettor heat** at once. The engine may run rough for a moment as the ice melts.",
            "Jet engines can ice in cloud near 0 °C on the intake lips, and at high levels in thunderstorm tops with dense ice crystals.",
          ],
        },
      ],
    },
    {
      id: "turb",
      title: "Turbulence",
      blocks: [
        {
          t: "p",
          text: "Turbulence is irregular, gusty motion of the air that gives bumps, jolts and changes of height and attitude. Its strength depends mainly on **how strong the wind shear is** (vertical and horizontal) and on how **unstable** the air is.",
        },
        {
          t: "table",
          head: ["Kind", "Cause", "Where and when"],
          rows: [
            ["**Convective (thermal)**", "Rising thermals and sinking air between them", "Hot afternoons over land, below Cu bases. Usually smooth above the Cu tops. Worst in and near CB"],
            ["**Mechanical**", "Wind blowing over rough ground, hills, trees and buildings", "Near the ground in strong winds. Worse with **stronger wind, rougher ground and unstable air**. Gusts and eddies downwind of hangars near runways"],
            ["**Frontal**", "Lifting and shear along a front", "Near active cold fronts"],
            ["**Wind shear turbulence**", "Layers of air moving at different speeds", "At inversions, near jet streams (**CAT**, Module 9)"],
            ["**Mountain wave**", "Waves and rotors downwind of ridges", "See below"],
            ["**Wake turbulence**", "Wing tip vortices of other aircraft", "Not weather, but strongest behind heavy, slow, clean aircraft. They sink and drift with the wind"],
          ],
        },
        {
          t: "table",
          head: ["Intensity (ICAO)", "What it feels like"],
          rows: [
            ["**Light**", "Slight, quick changes in height or attitude. Belts feel a slight strain"],
            ["**Moderate**", "Changes in height and attitude, airspeed changes, but the aircraft **stays in positive control**. Walking is hard, loose things move"],
            ["**Severe**", "**Large, sudden changes** in height and attitude and big airspeed changes. The aircraft may be **out of control for short periods**. People are thrown against their belts"],
            ["**Extreme**", "The aircraft is tossed violently and is **practically impossible to control**. Structural damage is possible"],
          ],
        },
        {
          t: "p",
          text: "In turbulence: **belts on**, slow to **turbulence penetration speed** (it protects against both stalling and overstressing), hold the **attitude** and let height and speed wander a little, and report moderate or severe turbulence to ATC. **Severe** turbulence leads to a **SIGMET**.",
        },
      ],
    },
    {
      id: "waves",
      title: "Mountain waves",
      blocks: [
        {
          t: "p",
          text: "When a strong wind blows across a mountain range into stable air, the air goes over the ridge and then **bounces up and down in waves** downwind, like water flowing over a rock in a stream. These **mountain waves (lee waves)** can stretch **a hundred km or more downwind** and reach up into the stratosphere.",
        },
        { t: "figure", key: "mtnwave", caption: "Mountain waves downwind of a ridge, with cap cloud, lenticular clouds and a rotor." },
        {
          t: "list",
          items: [
            "Wind blowing **roughly at right angles** to the ridge (within about 30°).",
            "Wind speed at ridge top at least about **15 to 25 kt**, more for big mountains, **increasing with height** with little change of direction.",
            "A **stable layer** near the ridge top, with less stable air above and below.",
          ],
        },
        {
          t: "table",
          head: ["Cloud", "Where", "Meaning"],
          rows: [
            ["**Cap cloud** (foehn wall)", "Sitting over the ridge top", "Air cooling as it rises over the ridge. Strong downdraughts on its lee edge"],
            ["**Lenticular cloud**", "At the **crests** of the waves, often in rows, at medium and high levels", "Smooth, lens shaped, **stays still** although the wind blows through it. A sure sign of waves"],
            ["**Rotor (roll) cloud**", "Under the wave crests, **at or below ridge height**, downwind", "Air rolling round under the wave. **Severe turbulence**"],
          ],
        },
        {
          t: "p",
          text: "Waves can be there with **no cloud at all** if the air is dry. So no lenticulars does not mean no waves.",
        },
        {
          t: "list",
          items: [
            "**Downdraughts** on the lee side of the ridge and in the down part of each wave can be **2,000 ft per minute or more**, enough to pull a light aircraft into the ground.",
            "**Severe turbulence in the rotor** zone, below the wave crests near ridge height.",
            "Smooth up and down motion in the waves themselves, which can make it hard to hold a level.",
            "The **altimeter can over-read** in strong winds over mountains, because pressure is lower in fast flowing air, so you are lower than you think.",
            "**Icing** in cap and lenticular clouds.",
          ],
        },
        {
          t: "p",
          text: "**Flying near them**: cross ridges with plenty of height, often **3,000 to 5,000 ft above the ridge** or more in strong winds. Approach the ridge at about **45°** so you can turn away easily. Stay out of rotor cloud. Expect downdraughts when flying **into wind** towards a ridge from its lee side. Over India, mountain waves are common over the **Himalayas in winter** with strong westerlies, and also occur over the Western Ghats. Severe mountain waves lead to a **SIGMET (SEV MTW)**.",
        },
      ],
    },
    {
      id: "inv",
      title: "Inversions as a flying hazard",
      blocks: [
        {
          t: "p",
          text: "An **inversion** is a layer where temperature **rises with height** (Module 2). It is the most stable layer there is and acts as a **lid**: air below cannot rise through it.",
        },
        { t: "figure", key: "inversion", caption: "A night radiation inversion: cold calm air at the ground, warm windy air above." },
        {
          t: "table",
          head: ["Kind", "When and where", "Hazard"],
          rows: [
            ["**Radiation (night) inversion**", "Clear, calm nights over land. Strongest **at dawn**. Burnt off by morning sun", "**Fog**, smoke and haze trapped near the ground. **Windshear** at its top"],
            ["**Subsidence inversion**", "Sinking air in a **high**, a few thousand feet up", "Haze and smog trapped for days. Flat topped St or Sc under it. **Delhi winter smog**"],
            ["**Frontal inversion**", "Warm air over cold air at a front", "Freezing rain under it in cold climates. Low cloud"],
            ["**Turbulence inversion**", "Top of a well mixed surface layer", "Cloud tops level off. Bumpy below, smooth above"],
          ],
        },
        {
          t: "list",
          items: [
            "**Poor visibility** under it: fog, mist, smoke and haze cannot mix upwards.",
            "**Windshear**: light winds below and strong winds above. On climb out the wind can change suddenly at the inversion top. Low level windshear is often linked to a low level inversion.",
            "**Smooth air above** it and cloud tops flat at its base. Cumulus cannot grow through it, so it stops showers and thunderstorms until it breaks.",
            "Over hot land, an inversion aloft can let heat build up below until it breaks suddenly in the afternoon, setting off violent storms (as before some norwesters).",
            "**Radio and radar** waves can bend in a strong inversion, giving unusually long ranges or false echoes (ducting).",
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
            "Icing needs **supercooled water drops** and an airframe **below 0 °C**.",
            "Icing risk greatest **just above the freezing level**. Most icing **0 to -15 °C**. CB: severe icing 0 to -20 °C, possible to **-40 °C**. Below -40 °C: little or none.",
            "**Clear ice**: **large drops, slow freezing**, heavy, hard, changes the aerofoil. In CB, Ns and **freezing rain**.",
            "**Rime**: **small drops, instant freezing**, trapped air, white, brittle, light. In St, Sc, freezing fog.",
            "**Hoar frost**: **vapour to ice directly**, clear cold nights or descent into moist air. Remove all frost before take-off.",
            "**Freezing rain**: rain from a **warm layer above** into sub-zero air. **Worst icing**. Ahead of warm fronts.",
            "Worst combination for icing: **drop size and temperature**. Thin parts ice faster.",
            "**Carburettor icing**: clear air, up to about +25 °C, **humid air**, **low power**. Sign: RPM drop. Full carb heat.",
            "Turbulence strength depends on **wind shear** and **instability**.",
            "Mechanical turbulence grows with **wind speed, rough ground, unstable air**.",
            "**Moderate**: aircraft in positive control. **Severe**: momentarily out of control. **Extreme**: practically impossible to control.",
            "**Mountain waves** need wind **across the ridge**, speed **rising with height**, and a **stable layer** near the ridge top.",
            "**Lenticular**: wave crests, stationary. **Rotor cloud**: below the crests, **severe turbulence**. Cap cloud over the ridge.",
            "Waves can exist **without cloud**. Strong **lee side downdraughts**. Cross ridges at **45°** with plenty of height.",
            "**Inversion**: poor visibility below, **windshear** at the top, smooth above, flat cloud tops.",
            "Severe icing, turbulence or mountain waves lead to a **SIGMET**.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "Airframe icing", points: ["Needs **supercooled drops** and a sub-zero airframe", "Most likely 0 to -15 °C", "Greatest just above the freezing level", "Below -40 °C: almost none"] },
    { title: "Clear and rime", points: ["**Clear**: big drops, slow freeze, heavy, hard", "**Rime**: small drops, instant freeze, white, brittle", "Clear ice changes the wing shape", "Mixed ice: both together"] },
    { title: "Frost and freezing rain", points: ["**Hoar frost**: vapour straight to ice", "Clear cold nights, remove before take-off", "**Freezing rain**: warm layer above, cold below", "The worst icing of all"], figure: "fzra" },
    { title: "How much ice", points: ["Liquid water and **drop size**", "**Temperature**", "Thin parts collect ice fastest", "Time in cloud, speed and kinetic heating"] },
    { title: "Effects of ice", points: ["More weight and drag", "Less lift, **higher stall speed**", "Blocked pitot and static", "Severe: leave at once"] },
    { title: "Carburettor ice", points: ["Venturi and fuel evaporation chill the air", "Clear air, up to about **+25 °C**, humid", "Worst at **low power**", "RPM drop: full carb heat"] },
    { title: "Turbulence", points: ["Convective, mechanical, frontal, shear, waves", "Strength: **wind shear** and instability", "**Moderate**: still in control", "**Severe**: briefly out of control"] },
    { title: "Mountain waves", points: ["Wind **across the ridge**, rising with height", "**Stable layer** near the ridge top", "Cap, **lenticular** and **rotor** clouds", "Can exist with no cloud"], figure: "mtnwave" },
    { title: "Wave hazards", points: ["Lee side **downdraughts**", "**Severe turbulence in the rotor**", "Altimeter over-reads in strong wind", "Cross at 45° with plenty of height"] },
    { title: "Inversions", points: ["Temperature rises with height: a lid", "Fog, haze, smog trapped below", "**Windshear** at the top", "Smooth above, flat cloud tops"], figure: "inversion" },
  ],
  mcqs: [
    { id: "m12-01", q: "Airframe icing will be greatest when an aircraft flies through cloud made of:", options: ["Ice crystals", "Supercooled water drops", "Water vapour only", "Snowflakes"], answer: 1, why: "Supercooled drops freeze on impact. Ice crystals mostly bounce off." },
    { id: "m12-02", q: "For airframe icing to form, the conditions needed are:", options: ["Liquid water drops below 0 °C and an airframe below 0 °C", "Ice crystals and a warm airframe", "Dry air below -40 °C", "Rain above +10 °C"], answer: 0, why: "Supercooled liquid water freezes when it strikes a surface that is below 0 °C." },
    { id: "m12-03", q: "In cloud, the chance of airframe icing is greatest:", options: ["At the base of the cloud whatever the temperature", "Just above the freezing level", "At the top of a cirrus cloud", "The same everywhere in the cloud"], answer: 1, why: "Just above the freezing level the temperature is a little below 0 °C and there is the most supercooled water." },
    { id: "m12-04", q: "Airframe icing in cloud is unlikely at temperatures below about:", options: ["0 °C", "-5 °C", "-10 °C", "-40 °C"], answer: 3, why: "Below about -40 °C all cloud drops are frozen, and ice crystals do not stick." },
    { id: "m12-05", q: "In cumuliform clouds, severe icing is usually met at temperatures:", options: ["Above 0 °C", "Between 0 °C and about -20 °C", "Below -40 °C only", "Only at -50 °C"], answer: 1, why: "Strong updraughts carry large supercooled drops well above the freezing level." },
    { id: "m12-06", q: "Clear ice forms when:", options: ["Small drops freeze instantly", "Water vapour turns straight into ice", "Large supercooled drops freeze slowly", "Snow sticks to a dry wing"], answer: 2, why: "Latent heat released as large drops freeze lets them spread before freezing, giving a clear, solid layer." },
    { id: "m12-07", q: "Airframe ice formed by large supercooled drops freezing is called:", options: ["Hoar frost", "Rime ice", "Packed snow", "Clear ice (glaze)"], answer: 3, why: "Large drops spread and freeze slowly into clear ice. Rime comes from small drops." },
    { id: "m12-08", q: "Rime ice forms because:", options: ["Small supercooled drops freeze instantly, trapping air", "Large drops freeze slowly", "Vapour deposits directly as ice", "Rain falls on a cold runway"], answer: 0, why: "Instant freezing of tiny drops traps air between them, making rime white and brittle." },
    { id: "m12-09", q: "Rime ice is:", options: ["Clear, heavy and hard to remove", "White, opaque, rough and brittle", "Only formed on the ground", "Only formed in freezing rain"], answer: 1, why: "Trapped air makes rime white. It is light and easier to break off than clear ice." },
    { id: "m12-10", q: "Clear ice is so dangerous because:", options: ["It only forms in clear air", "It is white and easy to see", "It is heavy, sticks firmly and changes the shape of the aerofoil", "It forms only on the propeller"], answer: 2, why: "Clear ice is heavy, hard to see and remove, and spreads back over the wing, spoiling the airflow." },
    { id: "m12-11", q: "Hoar frost forms when:", options: ["Large drops freeze slowly", "Water vapour changes directly into ice on a surface below 0 °C", "Rain falls through a cold layer", "Small drops freeze on impact"], answer: 1, why: "Hoar frost is deposition: vapour to ice with no liquid stage." },
    { id: "m12-12", q: "Hoar frost on an aircraft is most likely:", options: ["After a clear, cold night on the ground", "In a CB at 0 °C", "In freezing rain", "In cirrus cloud"], answer: 0, why: "On a clear night the parked aircraft cools below 0 °C and frost deposits on it. It can also form on a cold aircraft descending into moist air." },
    { id: "m12-13", q: "Frost on the wings is a hazard on take-off because it:", options: ["Is heavy", "Roughens the surface, spoils the airflow and raises the stall speed", "Blocks the pitot tube", "Melts into the fuel"], answer: 1, why: "Even thin frost changes the smooth surface of the wing. All frost must be removed before take-off." },
    { id: "m12-14", q: "Freezing rain forms when:", options: ["Snow melts on the runway", "Drizzle falls from stratus at +10 °C", "Rain from a warm layer aloft falls into a layer below 0 °C", "Hail melts in a CB"], answer: 2, why: "Warm air over cold air (an inversion) lets rain fall into sub-zero air and become supercooled." },
    { id: "m12-15", q: "Which of these gives the worst airframe icing?", options: ["FZRA", "FZFG", "BR", "HZ"], answer: 0, why: "Freezing rain has very large supercooled drops that spread and freeze as clear ice very quickly." },
    { id: "m12-16", q: "Freezing rain is most likely:", options: ["Behind a cold front", "Ahead of a warm front in winter", "In the eye of a cyclone", "Over the Thar desert in summer"], answer: 1, why: "Ahead of a warm front, warm air rides over cold air, which is the set up for freezing rain." },
    { id: "m12-17", q: "Flying in freezing rain, a sensible escape is to:", options: ["Hold the same level", "Slow down and wait", "Climb into the warmer layer above, if safe, or leave the area", "Descend into colder air"], answer: 2, why: "The rain comes from warmer air above, so climbing into it stops the icing." },
    { id: "m12-18", q: "The worst combination of factors for icing is:", options: ["Relative humidity and temperature", "Drop size and temperature", "Freezing level and pressure", "Wind speed and direction"], answer: 1, why: "Drop size and temperature decide what kind of ice forms and how fast." },
    { id: "m12-19", q: "Which parts of an aircraft collect ice fastest?", options: ["Thick, blunt parts", "The fuselage underside", "Thin, sharp parts such as probes, aerials and tail edges", "Parts inside the cabin"], answer: 2, why: "Thin parts catch more drops for their size, so ice builds on them first." },
    { id: "m12-20", q: "Severe airframe icing means:", options: ["A slow build up of rime", "Ice building up faster than the de-icing system can remove it", "Frost on the ground", "Ice only on the windscreen"], answer: 1, why: "In severe icing the systems cannot cope. The pilot must leave the area at once." },
    { id: "m12-21", q: "Which is NOT an effect of airframe icing?", options: ["Increased weight", "Increased drag", "Higher stall speed", "Increased lift"], answer: 3, why: "Ice spoils the wing, so lift falls, while weight, drag and stall speed go up." },
    { id: "m12-22", q: "Carburettor icing can occur:", options: ["Only below 0 °C", "In clear, humid air at temperatures well above 0 °C", "Only in cloud", "Only at full power"], answer: 1, why: "The air inside the carburettor cools by 20 °C or more, so ice forms even on warm humid days." },
    { id: "m12-23", q: "Carburettor icing is most likely at:", options: ["Full power in dry air", "Take-off power in a desert", "High altitude in very cold dry air", "Low power, such as a descent, in humid air"], answer: 3, why: "The partly closed throttle valve adds extra cooling at low power, and humid air supplies the water." },
    { id: "m12-24", q: "The first sign of carburettor icing in an aircraft with a fixed pitch propeller is usually:", options: ["A slow drop in RPM", "A rise in oil pressure", "A rise in RPM", "Black smoke"], answer: 0, why: "Ice chokes the airflow, so power and RPM fall slowly. Apply full carb heat." },
    { id: "m12-25", q: "The intensity of turbulence depends mainly on:", options: ["The strength of vertical and horizontal wind shear", "The amount of sunshine", "The height of the aircraft", "The time of day only"], answer: 0, why: "Shear makes eddies. Instability then lets them grow." },
    { id: "m12-26", q: "Mechanical turbulence near the ground is worse with:", options: ["Light wind over flat ground", "Fog", "A strong inversion and calm air", "Strong wind over rough ground in unstable air"], answer: 3, why: "Strong wind over rough ground makes eddies, and unstable air lets them reach higher." },
    { id: "m12-27", q: "Convective turbulence is usually worst:", options: ["On a clear night over land", "Over a cold sea in winter", "On a hot afternoon over land, below the cumulus bases", "Above an inversion"], answer: 2, why: "Strong surface heating sets off thermals, bumpy below the Cu and smoother above the tops." },
    { id: "m12-28", q: "By ICAO definition, in moderate turbulence the aircraft:", options: ["Is tossed violently and is impossible to control", "Feels nothing", "Is out of control for short periods", "Has changes in height and attitude but stays in positive control"], answer: 3, why: "Moderate turbulence causes noticeable changes but the pilot keeps control throughout." },
    { id: "m12-29", q: "Turbulence in which the aircraft may be momentarily out of control is:", options: ["Light", "Moderate", "Severe", "Calm"], answer: 2, why: "Severe turbulence gives large, sudden changes and brief loss of control. Extreme is even worse." },
    { id: "m12-30", q: "Mountain waves need:", options: ["Calm air over the mountains", "Wind along the ridge, falling with height, in unstable air", "Wind roughly across the ridge, increasing with height, with a stable layer near the ridge top", "Only a warm front"], answer: 2, why: "A strong cross ridge wind and a stable layer make the air oscillate downwind." },
    { id: "m12-31", q: "Lenticular clouds are found:", options: ["At the crests of mountain waves, staying still in the wind", "Only in the rotor zone at ground level", "Ahead of cold fronts", "In the eye of a cyclone"], answer: 0, why: "Air cools and condenses at each wave crest and clears again as it sinks, so the cloud stays put." },
    { id: "m12-32", q: "The most severe turbulence in a mountain wave system is usually found:", options: ["High above the lenticular clouds", "Inside cap cloud only", "Far upwind of the ridge", "In the rotor zone, below the wave crests near ridge height"], answer: 3, why: "Air rolls round under the crests, giving violent turbulence near ridge height downwind." },
    { id: "m12-33", q: "The absence of lenticular clouds over a mountain range in a strong wind means:", options: ["There are certainly no mountain waves", "Icing is certain", "The wind must be calm", "Mountain waves may still be present in dry air"], answer: 3, why: "Waves only show as cloud when there is enough moisture. Dry waves are invisible." },
    { id: "m12-34", q: "A pilot crossing a mountain ridge in strong winds should:", options: ["Fly just above the ridge top", "Approach at right angles at low level", "Approach at about 45° with plenty of height so a turn away is easy", "Fly through the rotor cloud"], answer: 2, why: "Height margin and an easy escape turn protect against lee side downdraughts." },
    { id: "m12-35", q: "Over India, mountain waves are most common:", options: ["Over the Himalayas in winter with strong westerlies", "Over the Thar desert in summer", "Over the Bay of Bengal in the monsoon", "Over the Sundarbans"], answer: 0, why: "Strong westerly winds across the Himalayas in winter set up waves, with turbulence and downdraughts." },
    { id: "m12-36", q: "Flying in strong winds over mountains, the altimeter will tend to:", options: ["Under-read, showing you lower than you are", "Read correctly", "Over-read, showing you higher than you are", "Stop working"], answer: 2, why: "Pressure is lower in fast flowing air over the ridge, so the altimeter shows more height than you have." },
    { id: "m12-37", q: "Low level windshear is often linked with:", options: ["A low level temperature inversion", "Cirrus cloud", "Clear skies at noon", "High pressure aloft only"], answer: 0, why: "Air below an inversion can be calm while the wind just above stays strong." },
    { id: "m12-38", q: "Under a low level inversion you would expect:", options: ["Very good visibility", "Strong gusty surface winds", "Towering cumulus", "Poor visibility from trapped haze, smoke or fog"], answer: 3, why: "The inversion stops vertical mixing, so pollutants and moisture stay near the ground." },
    { id: "m12-39", q: "A layer of stratocumulus with a flat, level top usually marks:", options: ["An inversion at the cloud top", "A jet stream", "A thunderstorm", "Unstable air above"], answer: 0, why: "Air cannot rise through the inversion, so the cloud spreads out flat beneath it." },
    { id: "m12-40", q: "The winter smog over Delhi is mainly trapped by:", options: ["A tropical cyclone", "A jet stream", "The monsoon trough", "A low level inversion with light winds"], answer: 3, why: "Night inversions and sinking air in winter highs hold smoke and dust near the ground." },
  ],
};
