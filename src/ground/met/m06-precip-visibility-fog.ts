// Meteorology Module 6: Precipitation, Visibility, Fog and Optical Phenomena.
// CAR Sec 7 Series B Part IV, Appendix B 1.4 b, 1.5 and 1.9 g. Written fresh for Runway Zero.
// Rainfall and fog terms follow current IMD usage. Visibility terms follow ICAO Annex 3.
import type { Module } from "../types.ts";

export const M06: Module = {
  n: 6,
  title: "Precipitation, Visibility, Fog and Optical Phenomena",
  car: "1.4 b, 1.5, 1.9 g",
  summary:
    "How rain and snow form and the different kinds that fall, how visibility and RVR are measured and reported, every kind of fog and haze with the conditions that make it, and the halos, coronas and other optical sights pilots see.",
  sections: [
    {
      id: "form",
      title: "How precipitation forms",
      blocks: [
        {
          t: "p",
          text: "**Precipitation** is water, liquid or solid, falling from a cloud and reaching the ground. A cloud droplet is tiny, far too small to fall against the up currents. It must grow about a million times in volume to become a raindrop. There are two ways this happens.",
        },
        {
          t: "table",
          head: ["Process", "Where", "How"],
          rows: [
            ["**Ice crystal (Bergeron) process**", "\"Cold\" clouds that reach well above the freezing level, with ice crystals and supercooled drops together", "Below 0 °C the drops have a higher vapour pressure than the ice. Drops evaporate, the vapour deposits on the crystals, and the crystals grow and fall. They melt into rain on the way down if it is warm enough"],
            ["**Collision and coalescence**", "\"Warm\" clouds, all above 0 °C, common in the tropics", "Bigger drops fall faster, hit smaller ones and join them. Large salt nuclei over the sea give a quick start. This is why tropical clouds can rain without reaching the freezing level"],
          ],
        },
        {
          t: "p",
          text: "How much a cloud rains depends on how deep it is and how strong its up currents are. Thin layer cloud gives drizzle at most. Deep layer cloud gives steady rain. Deep heap cloud gives heavy showers and hail.",
        },
      ],
    },
    {
      id: "types",
      title: "Kinds of precipitation",
      blocks: [
        {
          t: "table",
          head: ["Type", "What it is", "Usually from"],
          rows: [
            ["**Drizzle**", "Fine drops, under 0.5 mm, falling close together", "Stratus, thin stratocumulus"],
            ["**Rain**", "Drops 0.5 mm or bigger. Steady, continuous or intermittent", "Nimbostratus, thick altostratus"],
            ["**Showers**", "Start and stop suddenly, change fast in strength, with bright spells between", "Cumulus, TCU and CB"],
            ["**Hail**", "Balls or lumps of ice, 5 mm or more, built up in layers in strong up currents", "**CB only**"],
            ["**Small hail, graupel**", "Soft white ice pellets under 5 mm", "Cumulus, CB"],
            ["**Snow**", "Ice crystals, often stuck together as flakes", "Ns, As, Sc, CB in cold air"],
            ["**Sleet**", "Rain and snow falling together (in Indian and UK usage)", "Near 0 °C"],
            ["**Ice pellets**", "Raindrops that froze while falling through a deep cold layer", "Ns, often near a warm front"],
            ["**Freezing rain or drizzle**", "Supercooled drops that **freeze on impact**", "Rain from warm air above falling into a below 0 °C layer, as ahead of a warm front"],
          ],
        },
        {
          t: "p",
          text: "**Freezing rain** is the most dangerous for aircraft. It coats everything in heavy, clear ice within minutes. Snow usually reaches the ground when the surface temperature is below about +4 °C and the air between cloud base and ground is below 0 °C on average.",
        },
        {
          t: "table",
          head: ["IMD term", "Rain in 24 hours"],
          caption: "Current IMD rainfall terms",
          rows: [
            ["Very light", "Trace to 2.4 mm"],
            ["Light", "2.5 to 15.5 mm"],
            ["Moderate", "15.6 to 64.4 mm"],
            ["Heavy", "64.5 to 115.5 mm"],
            ["Very heavy", "115.6 to 204.4 mm"],
            ["Extremely heavy", "204.5 mm or more"],
          ],
        },
        {
          t: "list",
          items: [
            "A **rainy day** is a day with **2.5 mm or more** of rain.",
            "A **cloudburst** is extremely heavy rain over a small area in a short time, about **100 mm or more in an hour**. It often causes **flash floods** in the hills.",
          ],
        },
        {
          t: "flag",
          text: "Older books give different rain categories (for example light up to 7.5 mm, moderate 7.6 to 35.5 mm). IMD uses the table above now. If the exam options only match the old figures, pick the old figures.",
        },
      ],
    },
    {
      id: "pattern",
      title: "When and where it rains",
      blocks: [
        {
          t: "list",
          items: [
            "**In the tropics** most rain is convective, so it falls mostly in the **afternoon and evening**, and more in **summer**.",
            "**On coasts** and in valleys such as those of north east India, rain often peaks at **night or early morning**, when the land breeze or katabatic wind meets the moist air and lifts it.",
            "**In mid latitudes** most rain comes from depressions and fronts, which are most active in **winter**. Jammu and Kashmir and the western Himalayas follow this pattern because of western disturbances.",
            "The side of a mountain range facing the wind gets heavy rain. The far side is a **rain shadow**: for example the interior of Maharashtra and Karnataka behind the Western Ghats in the monsoon.",
          ],
        },
        {
          t: "p",
          text: "**Cloud seeding** puts nuclei such as silver iodide, dry ice or salt into suitable clouds to start the ice crystal or coalescence process. It can bring rain a little earlier or clear supercooled fog for a short time.",
        },
      ],
    },
    {
      id: "vis",
      title: "Visibility and RVR",
      blocks: [
        {
          t: "p",
          text: "**Visibility** for aviation is the greater of: (a) the greatest distance at which a **black object** of suitable size near the ground can be seen and recognised against a bright background, and (b) the greatest distance at which **lights of about 1,000 candelas** can be seen and identified against a dark background.",
        },
        {
          t: "p",
          text: "Visibility is often different in different directions. **In India, the METAR gives the lowest visibility** seen around the observing point. If the lowest visibility is below 5,000 m and the visibility in other directions is at least half as much again, the direction is added (for example **4000NE**). If the lowest is below 1,500 m and another direction is over 5,000 m, the best visibility and its direction are added too (for example **1400SW 6000N**).",
        },
        {
          t: "flag",
          text: "ICAO now prefers the **prevailing visibility** (the visibility reached or bettered over at least half the horizon), and many countries use it. **India still reports the lowest visibility** in METARs, as IMD's aviation procedures lay down. For the DGCA exam, the visibility reported by the Met office is the **lowest** visibility.",
        },
        {
          t: "p",
          text: "**Runway visual range (RVR)** is the distance over which a pilot of an aircraft on the **runway centre line** can see the runway surface markings or the runway edge or centre line lights. It is measured by **transmissometers** (or forward scatter meters) beside the runway, usually at the touchdown zone, mid point and stop end. **RVR is reported when the visibility or the RVR is less than 1,500 m.**",
        },
        { t: "figure", key: "slantvis", caption: "Over shallow fog the runway is clear from overhead but disappears on the approach." },
        {
          t: "list",
          items: [
            "**Vertical visibility**: looking straight down or up. Through a shallow fog layer it can be good.",
            "**Slant visibility**: looking along the approach path. You look through a much longer stretch of fog, so it can be very poor. The pilot may see the runway from overhead and lose it on final.",
            "Looking **into the sun**, haze scatters light and glare cuts visibility badly. Looking down sun, objects stand out.",
          ],
        },
      ],
    },
    {
      id: "obscure",
      title: "What reduces visibility",
      blocks: [
        {
          t: "table",
          head: ["Phenomenon", "Code", "Visibility", "What it is"],
          rows: [
            ["**Fog**", "FG", "**Below 1,000 m**", "Water droplets (or ice crystals) in the air. RH close to 100%. Fog is cloud touching the ground"],
            ["**Mist**", "BR", "**1,000 to 5,000 m**", "Thinner water droplets, high humidity, greyish"],
            ["**Haze**", "HZ", "5,000 m or less", "Very small dry particles of dust, smoke or salt. Gives a milky or bluish look. Low humidity"],
            ["**Smoke**", "FU", "5,000 m or less", "From fires, industry and traffic. Worst under a low inversion with light wind"],
            ["**Dust haze**", "DU", "5,000 m or less", "Fine dust hanging in the air after strong winds, widespread over north India in summer"],
            ["**Dust storm, sandstorm**", "DS, SS", "Usually below 1,000 m", "Strong wind lifting dust or sand. Visibility improves fast if rain follows"],
            ["**Smog**", "", "Very poor", "Fog and smoke together. Common over big cities in winter"],
            ["**Volcanic ash**", "VA", "Very poor", "Can be carried thousands of km. Damages engines, always avoid"],
          ],
        },
        {
          t: "tip",
          text: "**Mist is moist, haze is dry.** Fog and mist are water drops with high humidity. Haze and smoke are dry particles with lower humidity. The cut-off between fog and mist is **1,000 m**.",
        },
        {
          t: "flag",
          text: "Some older bank questions give mist as 1,000 to 2,000 m. The current ICAO limits for mist are 1,000 to 5,000 m. Choose 1,000 to 5,000 m if it is offered.",
        },
        {
          t: "p",
          text: "**Dust haze** is a pre-monsoon hazard over Rajasthan, Punjab, Haryana, UP and Bihar. Dust raised by the gusty daytime wind (from about 0900 to 1700) can spread over hundreds of km and several km upwards, so nearby alternates are often just as bad. A **low level inversion** traps smoke and dust, so visibility is worst on calm mornings near industrial areas.",
        },
      ],
    },
    {
      id: "fog",
      title: "How fog forms",
      blocks: [
        {
          t: "p",
          text: "Fog forms when the air near the ground becomes saturated. There are two ways: **cool the air to its dew point**, or **add water vapour** until it saturates. Plenty of condensation nuclei (smoke, salt) help fog form even a little before 100% RH, which is why city fog is thicker.",
        },
        { t: "figure", key: "fogtypes", caption: "Radiation fog forms on still, clear nights over land. Advection fog arrives on the wind." },
        {
          t: "p",
          text: "**Radiation fog** forms over **land** on a **clear night** as the ground loses heat and cools the air touching it. It needs:",
        },
        {
          t: "list",
          items: [
            "**Clear sky**, so the ground can radiate heat away.",
            "**Light wind, about 2 to 8 kt**. Calm gives only dew or a very shallow ground fog. A stronger wind mixes the cooling through a deep layer and gives low stratus instead of fog.",
            "**Moist air**, with a small dew point spread in the evening.",
            "A **long night**, so winter is the season.",
            "A **high pressure area or col**, with slack isobars and light winds.",
          ],
        },
        {
          t: "p",
          text: "Radiation fog is usually **thickest around sunrise**, because the temperature is lowest then. It normally **clears 2 to 3 hours after sunrise** as the sun warms the ground, often lifting first into a layer of low stratus. Deep fog, or fog under thick smoke, can last till midday or all day. It is usually a few hundred feet deep, with clear sky above. It does not form over the sea, where the temperature hardly changes at night.",
        },
        {
          t: "p",
          text: "**In India** radiation fog is a **winter** hazard (December and January worst) across the **Indo-Gangetic plains** from Punjab to Bihar and West Bengal, and in Assam. It is most widespread **after a western disturbance has passed**: the rain has moistened the ground, then the sky clears, the wind drops and cold air arrives. Smoke from cities and crop burning makes it thicker and longer lasting.",
        },
        {
          t: "table",
          head: ["IMD fog category", "Visibility"],
          rows: [
            ["Shallow fog", "1,000 to 500 m"],
            ["Moderate fog", "Below 500 to 200 m"],
            ["Dense fog", "Below 200 to 50 m"],
            ["Very dense fog", "Below 50 m"],
          ],
        },
        {
          t: "p",
          text: "**Advection fog** appears when the wind brings **warm, moist air over a colder surface** whose temperature is below the air's dew point. It forms over the sea and over land, by **day or night**, and can last for days. Unlike radiation fog it can form with a **moderate wind** (up to about 15 kt). Stronger winds lift it into low stratus. Sea fog can drift inland on the sea breeze. Along the Bengal and Odisha coasts in winter, fog is often a mix of advection and radiation.",
        },
        {
          t: "example",
          title: "Air 12 °C, dew point 10 °C, sea temperature 8 °C. The air blows over the sea. What forms?",
          steps: ["The sea (8 °C) is colder than the air's dew point (10 °C)", "The air is cooled from below to saturation as it moves", "**Advection fog** (sea fog)"],
        },
      ],
    },
    {
      id: "otherfog",
      title: "Other kinds of fog",
      blocks: [
        {
          t: "table",
          head: ["Fog", "How it forms", "Where"],
          rows: [
            ["**Steam fog** (arctic sea smoke)", "**Very cold air over much warmer water**. Water evaporates into the cold air and condenses at once", "Polar seas, lakes and rivers on cold mornings"],
            ["**Frontal fog**", "Warm rain falls into cold air ahead of a front and saturates it", "Mainly ahead of a **warm front**"],
            ["**Hill (upslope) fog**", "Moist air is forced up a slope and cools to saturation. Really low cloud on the hills", "Hills and mountain slopes"],
            ["**Freezing fog**", "Fog below 0 °C, made of supercooled droplets", "Leaves **rime ice** on aircraft and surfaces"],
          ],
        },
        {
          t: "p",
          text: "**Fog dispersal** at airports has been tried by heating the air (costly), by seeding supercooled fog with dry ice or silver iodide, and by spraying hygroscopic particles. None is in routine use in India.",
        },
      ],
    },
    {
      id: "optics",
      title: "Optical phenomena",
      blocks: [
        {
          t: "table",
          head: ["Sight", "Cause", "What to know"],
          rows: [
            ["**Rainbow**", "Sunlight refracted and reflected inside raindrops", "Seen **opposite the sun**, about 42° radius. Red **outside**, violet inside. A fainter secondary bow (about 51°) has the colours reversed"],
            ["**Halo**", "Sunlight **refracted through ice crystals**", "Ring of **22°** (sometimes 46°) round the sun or moon in **cirrostratus**. Faint **red on the inside**. Means ice cloud, so little icing"],
            ["**Corona**", "Light **diffracted by small water droplets**", "Small coloured rings close round the sun or moon in thin **altostratus or altocumulus**. Blue inside, **red outside**. The smaller the drops, the bigger the corona. Can mean supercooled drops and icing"],
            ["**Glory**", "Diffraction by cloud droplets", "Coloured rings round the **shadow of your own aircraft** on cloud below, with the sun behind you"],
            ["**Mirage**", "Light bent through layers of very different density", "**Inferior** mirage (watery look on a hot runway or road) over very hot ground. **Superior** mirage (objects lifted up) over a cold surface under an inversion"],
            ["**Bishop's ring**", "Diffraction by fine dust high up, often volcanic", "Whitish ring of about 22° round the sun"],
            ["**Aurora**", "Charged particles from the sun hitting the upper air", "Glowing curtains of light at high latitudes (Borealis in the north, Australis in the south). Disturbs HF radio"],
            ["**St Elmo's fire**", "Glow discharge of static electricity", "Bluish glow on wing tips, propeller tips and windscreen near CB. Harmless itself, but warns of strong electric fields and lightning risk, and causes radio static"],
          ],
        },
        {
          t: "flag",
          text: "One prescribed book says a halo shows clear red on the **outside**. That is the corona and the rainbow. A 22° halo has its faint red on the **inside** edge. If the exam asks only which ring has red outside, the corona (and rainbow) is the safe choice.",
        },
        {
          t: "tip",
          text: "**H**alo is **H**igh (ice, cirrostratus, 22°, big ring). **C**orona is **C**lose to the sun (water drops, small rings). Rainbow is **opposite** the sun.",
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
            "Ice crystal (Bergeron) process in clouds above the freezing level. **Coalescence** in warm tropical clouds.",
            "Drizzle under 0.5 mm from **stratus**. Showers from **cumuliform** cloud. **Hail only from CB**. Continuous rain from **Ns**.",
            "**Freezing rain**: supercooled drops freeze on impact. Rain falling through a below 0 °C layer, ahead of a warm front.",
            "Rainy day: **2.5 mm** or more. IMD heavy rain 64.5 to 115.5 mm. Cloudburst about 100 mm in an hour.",
            "Tropics: rain mostly **afternoon**, in summer. Mid latitudes and western Himalayas: **winter**. Coasts: night or early morning.",
            "Rain shadow on the **lee side** of the Western Ghats.",
            "Visibility: black object by day, **1,000 candela** lights by night. Indian METARs give the **lowest** visibility.",
            "**RVR** from transmissometers, reported when visibility or RVR is **below 1,500 m**.",
            "Over shallow fog: **vertical visibility good, slant visibility poor**.",
            "**Fog below 1,000 m. Mist 1,000 to 5,000 m. Haze 5,000 m or less**. Mist is moist, haze is dry.",
            "Worst visibility of all: **fog**. Smoke worst under a **low level inversion**.",
            "Radiation fog: **clear sky, light wind 2 to 8 kt, moist air, long night, high or col**. Over land only.",
            "Radiation fog thickest **around sunrise**, clears 2 to 3 hours after. In India: **winter**, Indo-Gangetic plains, **after a WD passes**.",
            "Advection fog: **warm moist air over a cold surface**, day or night, can form with moderate wind.",
            "Steam fog: **cold air over warm water**. Frontal fog: ahead of a **warm front**.",
            "**Halo: ice, Cs, 22°. Corona: water drops, As, red outside. Rainbow: opposite the sun, red outside.**",
            "**St Elmo's fire**: glow discharge on aircraft near CB.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "Making rain", points: ["Cloud drops are too small to fall", "**Ice crystal process**: in cold clouds, ice grows at the drops' expense", "**Coalescence**: in warm tropical clouds, drops bump and join", "Deeper cloud, stronger up currents: heavier precipitation"] },
    { title: "What falls from which cloud", points: ["**Drizzle** from stratus", "**Steady rain** from nimbostratus", "**Showers** from cumulus and CB", "**Hail** only from CB"] },
    { title: "The icy ones", points: ["**Freezing rain**: supercooled drops freeze on impact", "Comes from rain falling into a cold layer, ahead of warm fronts", "Ice pellets: drops frozen on the way down", "Snow likely below about +4 °C at the surface"] },
    { title: "IMD rain words", points: ["Light 2.5 to 15.5 mm a day", "Moderate 15.6 to 64.4, heavy 64.5 to 115.5", "Very heavy to 204.4, extremely heavy above", "Rainy day: **2.5 mm**. Cloudburst: about 100 mm an hour"] },
    { title: "Visibility and RVR", points: ["Black object by day, 1,000 candela lights by night", "Indian METAR gives the **lowest** visibility", "**RVR**: what the pilot sees along the runway", "Reported when visibility or RVR is **below 1,500 m**"] },
    { title: "Slant visibility", points: ["Over shallow fog, the runway is clear from overhead", "On the approach you look through much more fog", "**Vertical good, slant poor**", "Into the sun, haze and glare make it worse"], figure: "slantvis" },
    { title: "Fog, mist, haze", points: ["**Fog**: below 1,000 m, wet", "**Mist**: 1,000 to 5,000 m, wet", "**Haze**: 5,000 m or less, dry", "Smoke and dust worst under a low inversion"] },
    { title: "Radiation fog", points: ["Clear sky, **light wind 2 to 8 kt**", "Moist air, long night, high or col", "Thickest **around sunrise**, clears 2 to 3 hours later", "India: winter, Indo-Gangetic plains, after a WD"], figure: "fogtypes" },
    { title: "Advection fog", points: ["**Warm moist air over a colder surface**", "Over sea or land, **day or night**", "Can form with wind up to about 15 kt", "Air 12, dew point 10, sea 8: advection fog"] },
    { title: "Other fogs", points: ["**Steam fog**: cold air over warm water", "**Frontal fog**: rain into cold air, warm front", "**Hill fog**: moist air up a slope", "**Freezing fog**: rime ice"] },
    { title: "Rings round the sun", points: ["**Halo**: 22°, ice in cirrostratus, red inside", "**Corona**: small rings, water drops in As, red outside", "**Rainbow**: opposite the sun, red outside", "**Glory**: rings round your own shadow on cloud"] },
    { title: "More sights", points: ["**Inferior mirage**: wet look on a hot runway", "**Superior mirage**: over cold sea, under an inversion", "**Aurora**: high latitudes, upsets HF radio", "**St Elmo's fire**: glow on the aircraft near CB"] },
  ],
  mcqs: [
    { id: "m6-01", q: "When supercooled water drops and ice crystals exist together in a cloud:", options: ["The water drops grow while the ice crystals shrink", "The ice crystals grow while the water drops shrink", "Both stay the same size", "Both evaporate"], answer: 1, why: "Below 0 °C the vapour pressure over water is higher than over ice, so drops evaporate and the vapour deposits on the crystals. This is the ice crystal (Bergeron) process." },
    { id: "m6-02", q: "Rain from tropical clouds that do not reach the freezing level is explained by the:", options: ["Ice crystal theory", "Bergeron process", "Collision and coalescence process", "Sublimation process"], answer: 2, why: "In warm clouds there is no ice, so drops grow by colliding and joining. Salt nuclei over the sea help." },
    { id: "m6-03", q: "A cloud that rises far above the freezing level and holds both ice and supercooled drops is called a:", options: ["Warm clouds", "Cold clouds", "Fair weather clouds", "Orographic clouds"], answer: 1, why: "These are cold clouds, where the ice crystal process works." },
    { id: "m6-04", q: "Drizzle normally falls from:", options: ["Cumulonimbus", "Cirrostratus", "Altocumulus", "Stratus"], answer: 3, why: "Drizzle is fine drops from thin, low layer cloud such as stratus." },
    { id: "m6-05", q: "Precipitation that starts and stops suddenly and changes quickly in intensity is called:", options: ["Drizzle", "Showers", "Continuous rain", "Freezing rain"], answer: 1, why: "Showers come from cumuliform cloud, with bright spells between." },
    { id: "m6-06", q: "Hail falls only from:", options: ["Cumulonimbus", "Nimbostratus", "Altostratus", "Stratocumulus"], answer: 0, why: "Hail needs very strong up currents to carry ice up and down through supercooled water many times. Only CB has them." },
    { id: "m6-07", q: "Freezing rain is:", options: ["Snow that melts on the ground", "Rain mixed with hail", "Supercooled raindrops that freeze on impact", "Ice pellets"], answer: 2, why: "The drops are liquid below 0 °C and freeze the moment they hit. It forms when rain from warm air aloft falls into a below 0 °C layer near the ground." },
    { id: "m6-08", q: "Freezing rain is most likely to be met:", options: ["Behind a cold front", "In a high pressure area in summer", "Over the tropical sea", "Ahead of a warm front in winter, below the frontal surface"], answer: 3, why: "Warm air rides over cold air at a warm front. Rain from the warm air falls into the cold layer below and becomes supercooled." },
    { id: "m6-09", q: "As per IMD, a rainy day is a day with rainfall of:", options: ["1.5 mm or more", "2.0 mm or more", "2.5 mm or more", "10 mm or more"], answer: 2, why: "IMD counts a rainy day as one with 2.5 mm or more of rain in 24 hours." },
    { id: "m6-10", q: "In current IMD terms, 80 mm of rain in 24 hours is:", options: ["Moderate", "Heavy", "Very heavy", "Extremely heavy"], answer: 1, why: "Heavy rain is 64.5 to 115.5 mm. Very heavy starts at 115.6 mm.", flag: "Older books used different bands. In the current IMD table 80 mm is heavy." },
    { id: "m6-11", q: "When rivers and streams rise suddenly after very heavy rain, it is called a:", options: ["Flash flood", "Storm surge", "Cloud seeding", "Tidal wave"], answer: 0, why: "Flash floods follow very heavy rain such as a cloudburst, especially in the hills." },
    { id: "m6-12", q: "In the tropics, convective rain over land is most common:", options: ["Early morning", "Around midnight", "In the afternoon and evening", "Equally at all times"], answer: 2, why: "Convection is driven by daytime heating, so showers and thunderstorms peak in the afternoon and evening." },
    { id: "m6-13", q: "Over Jammu and Kashmir and the western Himalayas, precipitation is mostly in:", options: ["Summer", "Winter", "Autumn only", "Monsoon only"], answer: 1, why: "Western disturbances bring most of their rain and snow in winter, like mid latitude depressions." },
    { id: "m6-14", q: "Areas on the lee (east) side of the Western Ghats during the monsoon are:", options: ["Rain shadow areas", "The wettest parts of India", "Areas of advection fog", "Areas of freezing rain"], answer: 0, why: "Moist air rains out on the windward slopes and sinks dry on the lee side." },
    { id: "m6-15", q: "Aeronautical visibility by night is based on the distance at which:", options: ["A black object can be seen against the sky", "Lights of about 1,000 candelas can be seen and identified", "The runway edge can be seen from the tower", "The moon can be seen"], answer: 1, why: "By day it uses a dark object against a bright background, by night lights of about 1,000 candelas against a dark background. The greater value is taken." },
    { id: "m6-16", q: "In India, the visibility given in a METAR is the:", options: ["Maximum visibility in any direction", "Visibility along the runway", "Lowest visibility observed around the observing point", "Visibility from the control tower only"], answer: 2, why: "IMD reports the lowest visibility, adding a direction when it varies a lot. ICAO prefers prevailing visibility, which many other countries use.", flag: "Some newer books say METARs give the prevailing visibility. That is ICAO practice elsewhere. India reports the lowest visibility." },
    { id: "m6-17", q: "RVR is the range over which a pilot:", options: ["In the tower can see the runway lights", "On final at 200 ft can see the approach lights", "Can see the windsock", "Of an aircraft on the runway centre line can see the runway markings or lights"], answer: 3, why: "RVR is what the pilot on the runway centre line can see along the runway." },
    { id: "m6-18", q: "RVR groups are added to a METAR when either visibility or RVR drops below:", options: ["800 m", "1,500 m", "3,000 m", "5,000 m"], answer: 1, why: "RVR groups are added when visibility or RVR is below 1,500 m." },
    { id: "m6-19", q: "RVR is measured with a:", options: ["Transmissometer", "Ceilometer", "Hygrometer", "Anemometer"], answer: 0, why: "A transmissometer (or a forward scatter meter) measures how much light the air lets through along the runway. A ceilometer measures cloud base." },
    { id: "m6-20", q: "A pilot overhead sees the runway clearly through shallow fog, but loses sight of it on final approach. This is because:", options: ["Vertical visibility is poor but slant visibility is good", "Vertical visibility is good but slant visibility is poor", "The fog lifted", "RVR improved"], answer: 1, why: "Looking down you see through a thin layer. On the approach you look along a long slant path through the fog." },
    { id: "m6-21", q: "Fog is reported when visibility falls below:", options: ["500 m", "1,000 m", "1,500 m", "2,000 m"], answer: 1, why: "Fog (FG) means visibility below 1,000 m due to water droplets." },
    { id: "m6-22", q: "When a station reports mist, the visibility is:", options: ["Below 1,000 m", "1,000 to 5,000 m, with high humidity", "More than 5,000 m", "5,000 m or less, with low humidity"], answer: 1, why: "Mist (BR) is 1,000 to 5,000 m with water droplets and high humidity. Low humidity would be haze.", flag: "Some older questions give mist as 1,000 to 2,000 m. Current ICAO limits are 1,000 to 5,000 m." },
    { id: "m6-23", q: "Haze is caused by:", options: ["Very small dry particles of dust, smoke or salt", "Water droplets with RH near 100%", "Ice crystals", "Heavy drizzle"], answer: 0, why: "Haze is dry particles. Mist and fog are water droplets." },
    { id: "m6-24", q: "The greatest reduction in visibility usually occurs in:", options: ["Rain", "Drizzle", "Fog", "Haze"], answer: 2, why: "Fog can cut visibility to a few tens of metres." },
    { id: "m6-25", q: "Near industrial areas with a lot of smoke, visibility is worst with:", options: ["Strong winds", "A fast moving cold front", "Heavy showers", "A low level inversion and light wind"], answer: 3, why: "The inversion stops the smoke from rising and mixing away, so it builds up near the ground." },
    { id: "m6-26", q: "Low level inversions generally cause:", options: ["Good visibility", "Poor visibility, because pollutants cannot mix upwards", "Thunderstorms", "Strong gusty winds"], answer: 1, why: "An inversion is very stable. Smoke, dust and fog stay trapped below it." },
    { id: "m6-27", q: "Widespread dust haze over north India is mostly a hazard of:", options: ["The winter months", "The monsoon", "The post-monsoon season", "The pre-monsoon (hot weather) season"], answer: 3, why: "In March to May hot dry gusty winds raise dust over Rajasthan and the plains, giving haze over large areas." },
    { id: "m6-28", q: "Fog forms when the air near the ground is:", options: ["Warmed above its dew point", "Cooled to its dew point, or has moisture added until saturated", "Made to sink", "Dried out"], answer: 1, why: "Saturation can come from cooling or from adding water vapour." },
    { id: "m6-29", q: "For radiation fog to form, the ideal wind is:", options: ["Calm", "Strong and gusty", "Moderate, 15 to 20 kt", "Light, about 2 to 8 kt"], answer: 3, why: "A light wind spreads the cooling through a shallow layer. Calm gives only dew. Strong wind mixes too deep and gives stratus." },
    { id: "m6-30", q: "The pressure system most favourable for radiation fog is:", options: ["A deep depression", "A cold front", "A high or col with slack pressure gradient", "A tropical cyclone"], answer: 2, why: "Highs and cols give clear skies and light winds, both needed for radiation fog." },
    { id: "m6-31", q: "Which set of conditions favours radiation fog?", options: ["Clear night, light wind, moist air, long night", "Cloudy night, strong wind", "Hot afternoon, low humidity", "Clear night, strong wind, dry air"], answer: 0, why: "The ground must cool strongly (clear sky, long night), the air must be moist, and the wind light." },
    { id: "m6-32", q: "Radiation fog is usually thickest:", options: ["At sunset", "Around midnight", "Around sunrise", "At noon"], answer: 2, why: "The temperature is lowest around sunrise, so the fog is thickest then. It usually clears 2 to 3 hours later." },
    { id: "m6-33", q: "Radiation fog does not form over the open sea because:", options: ["The sea surface temperature hardly changes between day and night", "The sea is always windy", "There are no condensation nuclei over the sea", "The pressure is too low"], answer: 0, why: "Radiation fog needs strong night cooling of the surface. The sea barely cools at night." },
    { id: "m6-34", q: "Widespread radiation fog over north India in winter usually occurs:", options: ["Ahead of a western disturbance", "With a tropical cyclone", "During the monsoon", "In the rear of (after) a western disturbance"], answer: 3, why: "After a WD passes the ground is wet, the sky clears, the wind drops and cold air comes in. Ideal for fog." },
    { id: "m6-35", q: "Fog formed when the wind carries warm, moist air over a cold surface is called:", options: ["Radiation fog", "Steam fog", "Advection fog", "Upslope fog"], answer: 2, why: "Advection means carried by the wind. The warm moist air is cooled from below by the cold surface." },
    { id: "m6-36", q: "Air temperature 12 °C, dew point 10 °C, sea temperature 8 °C. If this air blows over the sea, you would expect:", options: ["Steam fog", "Radiation fog", "Advection fog", "No fog"], answer: 2, why: "The sea is colder than the air's dew point, so the air is cooled to saturation from below as it moves: advection fog." },
    { id: "m6-37", q: "Which statement about advection fog is correct?", options: ["It forms only on calm nights", "It forms only over land", "It cannot form with any wind", "It can form by day or night and with moderate wind"], answer: 3, why: "It depends on the air moving over a cold surface, not on night cooling, so it can form any time and with wind up to about 15 kt." },
    { id: "m6-38", q: "Steam fog (arctic sea smoke) forms when:", options: ["Warm air flows over cold water", "Moist air rises up a slope", "Rain falls into cold air", "Very cold air flows over much warmer water"], answer: 3, why: "The warm water evaporates into the very cold air, which cannot hold it, so it condenses at once like steam." },
    { id: "m6-39", q: "Frontal fog is most commonly found:", options: ["Ahead of a warm front", "Behind a cold front", "In the centre of a high", "Over hot deserts"], answer: 0, why: "Rain from the warm air falls into the cold air ahead of the warm front, saturating it." },
    { id: "m6-40", q: "A halo round the sun is produced by:", options: ["Diffraction of light by water droplets", "Volcanic dust", "Reflection from raindrops", "Refraction of light through ice crystals in cirrostratus"], answer: 3, why: "A halo (usually 22°) comes from light bending through ice crystals. It shows the cloud is ice." },
    { id: "m6-41", q: "A corona is formed by:", options: ["Refraction through ice crystals", "Reflection inside raindrops", "Diffraction of light by small water droplets in thin cloud", "Electric discharge"], answer: 2, why: "A corona is small coloured rings close to the sun or moon, made by diffraction around tiny water drops, as in thin altostratus." },
    { id: "m6-42", q: "Which ring has red on its outside?", options: ["Corona", "22° halo", "46° halo", "Secondary rainbow"], answer: 0, why: "A corona has blue inside and red outside. A halo has its faint red on the inside. A secondary rainbow has red inside.", flag: "One prescribed book says the halo is red outside. The 22° halo is red on the inside edge. The corona and the primary rainbow are red outside." },
    { id: "m6-43", q: "A rainbow is seen:", options: ["Looking towards the sun", "Directly overhead at noon", "Opposite the sun, with the sun behind the observer", "Only at night"], answer: 2, why: "Light enters raindrops, reflects inside and comes back towards the observer, so the sun must be behind you." },
    { id: "m6-44", q: "Coloured rings seen around the shadow of your own aircraft on a cloud below are called a:", options: ["Glory", "Halo", "Mirage", "Bishop's ring"], answer: 0, why: "A glory forms by diffraction from cloud droplets, opposite the sun, around the aircraft's shadow." },
    { id: "m6-45", q: "The \"wet\" look on a hot runway on a summer afternoon is:", options: ["An inferior mirage", "Dew", "A superior mirage", "A corona"], answer: 0, why: "Very hot air near the ground bends light from the sky upwards, so the sky appears reflected on the surface below." },
    { id: "m6-46", q: "St Elmo's fire is:", options: ["Lightning striking the aircraft", "The glow of the aurora", "A fire in an engine", "A visible glow discharge of static electricity on parts of the aircraft"], answer: 3, why: "It is a bluish glow on wing tips, propellers and windscreen in strong electric fields near CB. It warns of possible lightning and causes radio static." },
  ],
};
