// Meteorology Module 8: Pressure Systems and Tropical Cyclones. CAR Sec 7 Series B Part IV, Appendix B 1.7.
// Written fresh for Runway Zero. Cyclone classes follow the IMD scale in use since 2015.
import type { Module } from "../types.ts";

export const M08: Module = {
  n: 8,
  title: "Pressure Systems and Tropical Cyclones",
  car: "1.7",
  summary:
    "Where the world's main highs and lows sit and how they shift with the seasons, the different kinds of anticyclone and non-frontal depression, and tropical cyclones: how they form, their structure, movement, IMD classes, and the seasons they hit India.",
  sections: [
    {
      id: "principal",
      title: "The principal pressure areas",
      blocks: [
        {
          t: "p",
          text: "Averaged over a year, the world's surface pressure falls into belts (more in Module 9):",
        },
        {
          t: "table",
          head: ["Belt", "Latitude", "Weather"],
          rows: [
            ["**Equatorial low (trough)**", "Near the equator, shifting with the sun", "Rising air, CB, heavy showers, light winds (doldrums)"],
            ["**Subtropical highs**", "About 30° N and S", "Sinking air, clear skies, the great deserts"],
            ["**Subpolar lows**", "About 60° N and S", "Depressions and fronts, the polar front"],
            ["**Polar highs**", "Over the poles", "Cold, sinking air"],
          ],
        },
        {
          t: "p",
          text: "Land heats and cools far more than the sea, so the belts break up into cells that change with the seasons. In winter a huge, cold **Siberian high** sits over Asia, and India lies on its southern edge with northerly and north westerly winds. In summer the land heats up and a **heat low** forms over Pakistan and north west India, pulling in the moist south west monsoon. Over the oceans, semi-permanent highs (Azores, Pacific, south Indian Ocean) and lows (Icelandic, Aleutian) stay in place most of the year.",
        },
      ],
    },
    {
      id: "highs",
      title: "Anticyclones",
      blocks: [
        {
          t: "p",
          text: "In an **anticyclone (high)** the pressure is highest in the middle. Air **sinks** in the centre and **spreads out (diverges)** near the ground. Winds are **light** and blow **clockwise in the NH**, with isobars far apart. Sinking air warms and dries, giving a **subsidence inversion**.",
        },
        {
          t: "table",
          head: ["Type", "How it forms", "Features"],
          rows: [
            ["**Cold anticyclone**", "Air cooled over a cold continent in winter, e.g. **Siberian high**", "Shallow, high pressure only near the ground. Very cold, clear, dry. Fog and frost"],
            ["**Warm anticyclone**", "Large scale sinking air, e.g. the **subtropical highs**", "Deep, high pressure through the whole troposphere. Warm, dry, long lasting"],
            ["**Blocking anticyclone**", "A warm high that stays still for days or weeks in mid latitudes", "Blocks the usual west to east march of depressions, which are pushed round it"],
            ["**Ridge**", "A tongue of high pressure from a high", "Fair weather, short lived between depressions"],
          ],
        },
        {
          t: "list",
          items: [
            "Weather: mostly **fair**, little cloud and light winds. **No low cloud** because of the sinking air.",
            "But: **poor visibility** in haze and smoke trapped under the inversion, and in winter **fog and low stratus** over land. A sheet of stratocumulus can also sit under the inversion for days.",
            "Over land in winter, a stationary high brings a **tendency for fog and low stratus**.",
          ],
        },
      ],
    },
    {
      id: "lows",
      title: "Depressions without fronts",
      blocks: [
        {
          t: "p",
          text: "In a **depression (low)** air **converges** near the ground and **rises**, giving cloud and rain. Winds blow **anticlockwise in the NH**. Frontal depressions are in Module 7. Others form without fronts:",
        },
        {
          t: "table",
          head: ["Type", "How it forms", "Example"],
          rows: [
            ["**Thermal (heat) low**", "Strong heating of land. Air rises and pressure falls near the ground. Shallow", "Summer heat low over Pakistan, Rajasthan and north west India"],
            ["**Orographic (lee) low**", "Air flowing over a mountain range leaves a low on the lee side", "Lows in the lee of the Alps or Rockies"],
            ["**Polar low**", "Very cold air over a warmer sea in winter", "Small intense lows over northern seas"],
            ["**Tropical low and depression**", "Convergence in the tropics, no fronts", "Monsoon depressions over the Bay of Bengal"],
            ["**Tropical cyclone**", "A tropical low that grows very strong over a warm sea", "Bay of Bengal and Arabian Sea cyclones"],
          ],
        },
        {
          t: "p",
          text: "A heat low is shallow: above a few thousand feet it is often topped by a high. It gives hot, dusty, hazy weather rather than widespread rain unless moist air is drawn in.",
        },
      ],
    },
    {
      id: "tcform",
      title: "Tropical cyclones: how they form",
      blocks: [
        {
          t: "p",
          text: "A **tropical cyclone (TC)** is an intense, non-frontal low over a tropical ocean, with very strong winds spiralling round a calm **eye**, torrential rain and huge CBs. The same storm is called a **hurricane** in the Atlantic and north east Pacific, a **typhoon** in the north west Pacific, and a **cyclone** in the Indian Ocean and around Australia. In general terms it is a **tropical revolving storm (TRS)**.",
        },
        {
          t: "list",
          items: [
            "**Warm sea**: surface temperature of about **26.5 to 27 °C or more**, through a good depth.",
            "**Latitude about 5° to 20°**. Not within about **5° of the equator**, where the Coriolis force is too weak to start the spin.",
            "**Moist, unstable air** through a deep layer.",
            "**Little vertical wind shear**, so the storm is not torn apart. Strong shear during the monsoon is why few cyclones form then.",
            "A **pre-existing disturbance**, such as a low or an easterly wave, and divergence aloft to carry the rising air away.",
          ],
        },
        {
          t: "p",
          text: "Its energy comes from **latent heat** released when water vapour from the warm ocean condenses in the clouds. Cut off that supply, by crossing land or colder sea, and it weakens. Over land, friction also slows it.",
        },
        {
          t: "p",
          text: "Most cyclones form on the **western side of the oceans**, where the sea surface is warmest (warm currents flow there).",
        },
      ],
    },
    {
      id: "structure",
      title: "Structure of a tropical cyclone",
      blocks: [
        { t: "figure", key: "tcsection", caption: "Cross section through a mature tropical cyclone. Not to scale." },
        {
          t: "table",
          head: ["Part", "Size", "Weather"],
          rows: [
            ["**Eye**", "About 20 to 50 km across", "**Lowest pressure, light and variable winds, little cloud or broken cloud**. Air sinks and warms, so the eye is the warmest part (warm core)"],
            ["**Eye wall**", "A ring round the eye, tens of km wide", "**Strongest winds**, towering CBs up to 15 to 18 km, torrential rain, severe turbulence. The most dangerous part"],
            ["**Rain bands**", "Spiral bands out to a few hundred km", "Bands of CB with heavy showers and squalls, gaps between"],
            ["**Outer area**", "Out to several hundred km", "Gale force winds, cirrus spreading out from the top"],
          ],
        },
        {
          t: "list",
          items: [
            "The whole storm is typically **a few hundred km** across, and the circulation reaches up to the tropopause.",
            "Central pressure can drop to **950 hPa or lower**, 30 to over 60 hPa below the surroundings in strong storms.",
            "In the NH winds spiral **anticlockwise and inwards**. The **strongest winds are in the eye wall**, and stronger on the **right side** of the track in the NH.",
            "Passing through the eye, the wind drops suddenly, then returns just as strong from the **opposite direction**.",
          ],
        },
      ],
    },
    {
      id: "movement",
      title: "Movement and dangers",
      blocks: [
        { t: "figure", key: "tctrack", caption: "Typical track and the dangerous semicircle (NH)." },
        {
          t: "list",
          items: [
            "Cyclones usually move **west or north west** at about 10 to 15 kt, steered round the subtropical high. Many then **recurve** to the north and north east and speed up.",
            "In the NH the **right side of the track** is the **dangerous semicircle**: the storm's forward speed adds to its winds there, and the wind tends to push ships into the path. The **right front quadrant** has the worst winds and weather. In the SH it is the left side.",
            "On landfall, the **storm surge** (sea level pushed up by wind and low pressure) floods low coasts and causes most of the loss of life.",
            "Over land the storm weakens fast but gives very heavy rain far inland.",
          ],
        },
        {
          t: "p",
          text: "**For pilots:** never try to fly through or under a cyclone. Expect severe turbulence, heavy rain, icing above the freezing level, windshear, low cloud to the surface and crosswinds well outside the storm. Airports in its path close.",
        },
      ],
    },
    {
      id: "imd",
      title: "IMD classification and Indian cyclones",
      blocks: [
        {
          t: "table",
          head: ["IMD category", "Max sustained wind (3 minute mean)"],
          caption: "North Indian Ocean, IMD scale in use since 2015",
          rows: [
            ["Low pressure area", "Below 17 kt"],
            ["Depression", "17 to 27 kt"],
            ["Deep depression", "28 to 33 kt"],
            ["**Cyclonic storm**", "**34 to 47 kt** (named from here)"],
            ["Severe cyclonic storm", "48 to 63 kt"],
            ["Very severe cyclonic storm", "64 to 89 kt"],
            ["Extremely severe cyclonic storm", "90 to 119 kt"],
            ["Super cyclonic storm", "120 kt or more"],
          ],
        },
        {
          t: "flag",
          text: "Before 2015 IMD had no \"extremely severe\" class: very severe ran from 64 to 119 kt and super cyclone was 120 kt or more. Older books and question banks may use this. The cyclonic storm threshold, 34 kt, has not changed.",
        },
        {
          t: "list",
          items: [
            "India has **two cyclone seasons**: **pre-monsoon (April to early June, mostly May)** and **post-monsoon (October to December, mostly October and November)**. The **east coast** gets hit in both.",
            "The **post-monsoon** storms are often the strongest. November has the most.",
            "The **Bay of Bengal** gets about **four times** as many as the Arabian Sea.",
            "Almost none form in **January to March**. During the monsoon the strong upper easterlies give too much shear, so **monsoon depressions** form instead (Module 10).",
            "Bay of Bengal storms mostly strike **Odisha, Andhra Pradesh, Tamil Nadu, West Bengal, Bangladesh and Myanmar**. Arabian Sea storms hit **Gujarat, Maharashtra, Oman** or die out at sea.",
          ],
        },
        {
          t: "p",
          text: "Low pressure systems in India are also described by closed isobars at 2 hPa intervals: a **low** has one, a **depression** two, a **deep depression** three, and a **cyclonic storm** four or more.",
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
            "Belts: equatorial low, **subtropical highs at 30°**, subpolar lows at 60°, polar highs.",
            "Winter: **Siberian high**, India on its southern edge. Summer: **heat low** over Pakistan and north west India.",
            "High: **sinking air, divergence**, light winds, **clockwise NH**, fair but hazy, fog in winter, **no low cloud**.",
            "**Cold high**: shallow, continental winter. **Warm high**: deep, subtropical. **Blocking high**: stays still, diverts depressions.",
            "Low: **convergence, rising air**, anticlockwise NH. Heat low: shallow, hot and dusty.",
            "TC needs: sea **26.5 °C or more**, latitude **5° to 20°** (not within 5° of the equator), moist unstable air, **low wind shear**, a starting disturbance.",
            "TC energy: **latent heat** from the warm ocean. Weakens over land or cold sea.",
            "Hurricane (Atlantic), typhoon (NW Pacific), cyclone (Indian Ocean).",
            "**Eye**: light variable winds, little cloud, lowest pressure, warm. **Eye wall**: strongest winds and worst weather.",
            "NH: **dangerous semicircle on the right of the track**, worst in the right front quadrant.",
            "Moves west or north west, then often recurves north east. **Storm surge** at landfall.",
            "IMD: depression **17 to 27 kt**, deep depression 28 to 33, **cyclonic storm 34 to 47**, severe 48 to 63, very severe 64 to 89, extremely severe 90 to 119, **super 120+**.",
            "India: **pre-monsoon and post-monsoon** cyclones. Bay of Bengal about **4 times** the Arabian Sea. Nearly none January to March.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "World pressure belts", points: ["Equatorial low: rising air, CB", "**Subtropical highs at 30°**: deserts", "Subpolar lows at 60°: depressions", "Polar highs"] },
    { title: "Seasonal giants", points: ["Winter: **Siberian high** over Asia", "India on its southern edge, northerly winds", "Summer: **heat low** over Pakistan and NW India", "It draws in the south west monsoon"] },
    { title: "Anticyclones", points: ["Sinking, diverging air, **clockwise NH**", "Light winds, fair, **no low cloud**", "But **haze, smoke and winter fog** under the inversion", "Cold (shallow), warm (deep), blocking"] },
    { title: "Lows without fronts", points: ["**Heat low**: hot land, shallow", "**Lee low**: behind mountains", "**Polar low**: cold air over warm sea", "**Tropical lows** and depressions"] },
    { title: "What a cyclone needs", points: ["Sea **26.5 °C or warmer**", "**5° to 20°** latitude, not near the equator", "Moist unstable air, **little wind shear**", "Energy from **latent heat**"] },
    { title: "Inside a cyclone", points: ["**Eye**: calm, little cloud, lowest pressure, warm", "**Eye wall**: strongest winds, worst weather", "Spiral **rain bands**", "Anticlockwise in the NH"], figure: "tcsection" },
    { title: "Where it goes", points: ["West or north west at 10 to 15 kt", "Often **recurves** north east", "NH: **right side** is the dangerous semicircle", "**Storm surge** at landfall"], figure: "tctrack" },
    { title: "IMD ladder", points: ["Depression 17 to 27 kt, deep depression 28 to 33", "**Cyclonic storm 34 to 47** (named)", "Severe 48 to 63, very severe 64 to 89", "Extremely severe 90 to 119, **super 120+**"] },
    { title: "Indian cyclone seasons", points: ["**Pre-monsoon**: April to early June", "**Post-monsoon**: October to December, peak November", "Bay of Bengal about **4 times** the Arabian Sea", "Almost none January to March"] },
  ],
  mcqs: [
    { id: "m8-01", q: "The subtropical high pressure belts lie at about:", options: ["The equator", "30° latitude", "60° latitude", "The poles"], answer: 1, why: "Air sinking from the Hadley cells builds high pressure at about 30° N and S, where the great deserts are." },
    { id: "m8-02", q: "In winter, India lies on the southern edge of the:", options: ["Siberian high", "Azores high", "Icelandic low", "Pakistan heat low"], answer: 0, why: "The cold Siberian high dominates Asia in winter, giving northerly and north westerly winds over India." },
    { id: "m8-03", q: "In summer, a heat low forms over:", options: ["Siberia", "The Bay of Bengal", "Pakistan and north west India", "The southern Indian Ocean"], answer: 2, why: "Intense heating of the land lowers the pressure there, drawing in moist air from the sea." },
    { id: "m8-04", q: "An area of high pressure is also called:", options: ["A trough", "A col", "An anticyclone", "A depression"], answer: 2, why: "A high is an anticyclone. A low is a depression or cyclone." },
    { id: "m8-05", q: "In an anticyclone, the air near the ground is:", options: ["Converging and rising", "Diverging, with sinking air above", "Rotating anticlockwise in the NH", "Moving very fast"], answer: 1, why: "Air sinks in a high and spreads out at the surface. In the NH it turns clockwise." },
    { id: "m8-06", q: "The lack of low cloud in a stationary high is due to:", options: ["Instability", "Rising air", "Sinking air", "Strong winds"], answer: 2, why: "Sinking air warms and dries as it is squeezed, so cloud cannot form." },
    { id: "m8-07", q: "In the centre of a high pressure area you would expect:", options: ["Thundershowers", "Nimbostratus and continuous rain", "Light winds and fair weather, with possible haze or fog", "Strong gusty winds"], answer: 2, why: "Highs give light winds and little cloud, but trapped haze, and fog on winter nights over land." },
    { id: "m8-08", q: "The surface weather associated with a stationary high over land in winter is a:", options: ["Tendency for fog and low stratus", "Nimbostratus and continuous rain", "Possibility of snow showers", "Thunderstorms"], answer: 0, why: "Clear, calm, long nights under a high over land favour radiation fog and low stratus." },
    { id: "m8-09", q: "A cold anticyclone is typically:", options: ["Deep, extending to the tropopause", "Shallow, found over cold continents in winter", "Found at the equator", "Associated with heavy rain"], answer: 1, why: "It comes from air cooled near the ground, so it is shallow. The Siberian high is an example." },
    { id: "m8-10", q: "The subtropical highs are examples of:", options: ["Cold anticyclones", "Warm anticyclones", "Thermal lows", "Polar lows"], answer: 1, why: "They are deep and warm, built by large scale sinking air." },
    { id: "m8-11", q: "A blocking anticyclone is one that:", options: ["Moves very fast", "Stays nearly still and diverts depressions round it", "Forms only over the sea", "Produces thunderstorms"], answer: 1, why: "It sits in the path of the westerlies for days and blocks the normal eastward march of lows." },
    { id: "m8-12", q: "A thermal (heat) low forms because of:", options: ["Air flowing over mountains", "Fronts", "Strong heating of the land surface", "Cold air over a warm sea"], answer: 2, why: "Heated air expands and rises, lowering the surface pressure. Heat lows are shallow." },
    { id: "m8-13", q: "A low formed on the lee side of a mountain range is called:", options: ["An orographic (lee) low", "A thermal low", "A polar low", "A tropical cyclone"], answer: 0, why: "Air flowing over the range stretches vertically on the lee side and pressure falls there." },
    { id: "m8-14", q: "Polar lows form when:", options: ["Warm air flows over cold land", "Very cold air flows over a relatively warm sea in winter", "The sun heats the ground", "Fronts occlude"], answer: 1, why: "Strong heating from the sea below the very cold air makes small, intense lows." },
    { id: "m8-15", q: "A tropical revolving storm is called a hurricane in the:", options: ["Bay of Bengal", "North west Pacific", "Arabian Sea", "Atlantic"], answer: 3, why: "Hurricane in the Atlantic and NE Pacific, typhoon in the NW Pacific, cyclone in the Indian Ocean." },
    { id: "m8-16", q: "Tropical cyclones form over seas with a surface temperature of at least about:", options: ["15 °C", "20 °C", "26.5 °C", "35 °C"], answer: 2, why: "They need a warm ocean of about 26.5 to 27 °C or more to supply enough moisture and heat." },
    { id: "m8-17", q: "Tropical cyclones do not form within about 5° of the equator because:", options: ["The sea is too cold there", "The Coriolis force is too weak to start rotation", "There is no moisture", "Pressure is too high"], answer: 1, why: "Coriolis is zero at the equator, so air flows straight into a low and fills it instead of spinning round it." },
    { id: "m8-18", q: "A tropical revolving storm gets most of its energy from:", options: ["Direct sunshine on the storm", "Latent heat of water vapour from the ocean", "Very strong winds", "Very low pressure in the eye"], answer: 1, why: "Warm ocean water evaporates. When it condenses in the storm's clouds, latent heat is released and drives the storm." },
    { id: "m8-19", q: "Which condition prevents tropical cyclone formation?", options: ["Warm sea", "Moist air", "Strong vertical wind shear", "A pre-existing low"], answer: 2, why: "Strong shear tilts and tears the storm apart. This is why cyclones rarely form in the Indian seas during the monsoon." },
    { id: "m8-20", q: "Tropical cyclones tend to form on the western side of tropical oceans because:", options: ["Coastal gulfs give a strong spin", "The sea surface is warmest there", "Land and sea temperatures provide an unstable gradient", "The trade winds are weakest there"], answer: 1, why: "Warm ocean currents flow along the western sides of the oceans, keeping the water warmest there." },
    { id: "m8-21", q: "The weather in the eye of a tropical cyclone is:", options: ["Heavy showers and very poor visibility", "The strongest winds of the storm", "Thick nimbostratus", "Light, variable winds with little or broken cloud"], answer: 3, why: "Air sinks in the eye, so it is nearly calm with little cloud, though the sea is very rough." },
    { id: "m8-22", q: "The strongest winds in a tropical revolving storm are found:", options: ["In the eye", "In the wall of cloud round the eye", "At the outer edge", "Equally everywhere"], answer: 1, why: "The eye wall has the steepest pressure gradient, the strongest winds and the worst weather." },
    { id: "m8-23", q: "Compared with its surroundings, the eye of a tropical cyclone is:", options: ["Colder", "Wetter", "The same temperature", "Warmer"], answer: 3, why: "Sinking air in the eye is warmed by compression, giving the storm a warm core." },
    { id: "m8-24", q: "The typical diameter of the eye of a tropical cyclone is about:", options: ["2 km", "1,000 km", "300 km", "20 to 50 km"], answer: 3, why: "Eyes are usually 20 to 50 km across. The whole storm is a few hundred km across." },
    { id: "m8-25", q: "In the northern hemisphere, the winds round a tropical cyclone blow:", options: ["Anticlockwise and inwards", "Clockwise and outwards", "Straight in to the centre", "Clockwise and inwards"], answer: 0, why: "Like any NH low, they turn anticlockwise and spiral in towards the centre." },
    { id: "m8-26", q: "As an aircraft or ship passes through the eye of a cyclone, the wind:", options: ["Stays the same", "Turns to calm for the rest of the storm", "Becomes stronger in the eye", "Drops, then returns strongly from the opposite direction"], answer: 3, why: "The eye is calm, but on the far side the eye wall winds blow the other way round the centre." },
    { id: "m8-27", q: "In the northern hemisphere, the dangerous semicircle of a tropical cyclone is:", options: ["To the right of the track", "To the left of the track", "Behind the storm", "In the eye"], answer: 0, why: "On the right the storm's forward speed adds to its wind. The right front quadrant is worst." },
    { id: "m8-28", q: "Tropical cyclones in the northern hemisphere usually move at first towards the:", options: ["West or north west", "East", "South", "Equator"], answer: 0, why: "They are steered by the easterlies round the subtropical high, then often recurve towards the north east." },
    { id: "m8-29", q: "Most of the loss of life when a strong cyclone crosses a low coast is caused by:", options: ["Lightning", "Hail", "The storm surge", "Dust"], answer: 2, why: "Wind and low pressure push the sea several metres above normal, flooding low coasts." },
    { id: "m8-30", q: "A tropical cyclone weakens quickly after landfall mainly because:", options: ["The Coriolis force reverses", "The sun sets", "The eye closes", "It loses its supply of warm moist air, and friction increases"], answer: 3, why: "Without the warm ocean there is no latent heat supply, and friction over land slows the winds." },
    { id: "m8-31", q: "As per IMD, a low pressure system is a cyclonic storm when its maximum sustained wind is:", options: ["17 to 27 kt", "28 to 33 kt", "34 to 47 kt", "64 to 89 kt"], answer: 2, why: "34 to 47 kt is a cyclonic storm. 17 to 27 kt is a depression, 28 to 33 kt a deep depression." },
    { id: "m8-32", q: "A system with maximum sustained winds of about 15 m/s (about 29 kt) around its centre is classed by IMD as a:", options: ["Deep depression", "Depression", "Cyclonic storm", "Severe cyclonic storm"], answer: 0, why: "15 m/s is about 29 kt, inside the deep depression range of 28 to 33 kt." },
    { id: "m8-33", q: "In the current IMD scale, a storm with sustained winds of 100 kt is an:", options: ["Severe cyclonic storm", "Very severe cyclonic storm", "Extremely severe cyclonic storm", "Super cyclonic storm"], answer: 2, why: "Extremely severe is 90 to 119 kt. Super cyclonic is 120 kt or more.", flag: "Before 2015 there was no extremely severe class, and 100 kt was \"very severe\" (64 to 119 kt). Use the current scale unless only the old terms are offered." },
    { id: "m8-34", q: "A super cyclonic storm has sustained winds of:", options: ["64 kt or more", "90 kt or more", "100 kt or more", "120 kt or more"], answer: 3, why: "Super cyclonic storm is 120 kt (222 km/h) or more." },
    { id: "m8-35", q: "IMD measures the maximum sustained wind of a cyclone as a mean over:", options: ["1 minute", "1 hour", "10 minutes", "3 minutes"], answer: 3, why: "IMD uses a 3 minute mean. The USA uses 1 minute and many others 10 minutes." },
    { id: "m8-36", q: "The east coast of India is affected by cyclonic storms mainly in the:", options: ["Monsoon season only", "Winter only", "Pre-monsoon and post-monsoon seasons", "Post-monsoon season only"], answer: 2, why: "Cyclones form in April to early June and in October to December, with the post-monsoon storms often strongest." },
    { id: "m8-37", q: "In the North Indian Ocean, the month with the most cyclones is usually:", options: ["November", "February", "July", "January"], answer: 0, why: "The post-monsoon season peaks in November. July has strong shear and few cyclones." },
    { id: "m8-38", q: "Compared with the Arabian Sea, cyclones in the Bay of Bengal are:", options: ["About four times as frequent", "Equally frequent", "Rarer", "Never severe"], answer: 0, why: "The Bay of Bengal is warmer and gets more disturbances from the east, giving roughly four times as many cyclones." },
    { id: "m8-39", q: "Cyclones are almost absent over the Indian seas in:", options: ["May and November", "October", "June", "January to March"], answer: 3, why: "In late winter the sea is cooler and upper winds are strong, so cyclones hardly ever form." },
    { id: "m8-40", q: "In India, a low pressure system with two closed isobars at 2 hPa interval is called a:", options: ["Depression", "Low", "Deep depression", "Cyclonic storm"], answer: 0, why: "One closed isobar is a low, two a depression, three a deep depression, four or more a cyclonic storm." },
    { id: "m8-41", q: "Flying near an active tropical cyclone, a pilot should expect:", options: ["Smooth air and good visibility everywhere", "Only light icing", "Danger only in the eye", "Severe turbulence, heavy rain, windshear and low cloud, even well outside the eye"], answer: 3, why: "The rain bands and eye wall carry CB weather far from the centre. Never fly through a cyclone." },
  ],
};
