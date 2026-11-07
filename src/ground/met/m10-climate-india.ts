// Meteorology Module 10: Climate of India. CAR Sec 7 Series B Part IV, Appendix B 1.8.
// Written fresh for Runway Zero. Monsoon dates are the IMD normals revised in 2020.
import type { Module } from "../types.ts";

export const M10: Module = {
  n: 10,
  title: "Climate of India: Monsoon, Western Disturbances, Local Storms",
  car: "1.8",
  summary:
    "India's four seasons and the flying hazards of each: winter fog and western disturbances, pre-monsoon dust storms and norwesters, the south west monsoon with its trough, breaks and depressions, and the post-monsoon retreat with cyclones and the north east monsoon.",
  sections: [
    {
      id: "controls",
      title: "What shapes India's weather",
      blocks: [
        {
          t: "list",
          items: [
            "The **Himalayas** block the bitter winter winds from Central Asia, so most of India is warmer than other places at the same latitude. In summer they hold the moist monsoon air in and turn it westwards along the plains.",
            "The **Thar desert** and north west India heat up enormously in summer, creating the heat low that draws in the monsoon.",
            "The **Arabian Sea and Bay of Bengal** supply the moisture.",
            "The **seasonal reversal of winds**, the monsoon, rules everything. The word comes from the Arabic **mausim**, meaning season.",
          ],
        },
        {
          t: "p",
          text: "About **75% of India's annual rain falls from June to September**. The wettest places are **Mawsynram and Cherrapunji** in Meghalaya (over 11,000 mm a year). The far west of Rajasthan gets under about 200 mm.",
        },
        {
          t: "table",
          head: ["IMD season", "Months"],
          rows: [
            ["**Winter**", "January and February"],
            ["**Pre-monsoon** (hot weather, thunderstorm season)", "March to May"],
            ["**South west monsoon**", "June to September"],
            ["**Post-monsoon** (north east monsoon over the south)", "October to December"],
          ],
        },
        {
          t: "p",
          text: "Some older books treat December to February as the cold weather season and October and November as post-monsoon. The weather is the same, only the month boundaries differ.",
        },
        { t: "figure", key: "calendar", caption: "Hazard calendar for flying in India." },
      ],
    },
    {
      id: "winter",
      title: "Winter (January and February)",
      blocks: [
        {
          t: "list",
          items: [
            "**Pressure**: high over north west India (the edge of the Siberian high), lower over the south. Weak gradient.",
            "**Surface winds**: light, **north westerly over north India**, turning **north easterly over the peninsula** (the winter or north east monsoon).",
            "**Upper winds**: **westerly** above about 10,000 ft, strengthening with height. The **subtropical jet** lies over north India at about **12 km and 27°N** with 80 to 150 kt. Flying Delhi to Kolkata at FL100 in January, expect north westerly to westerly winds of about 25 to 30 kt.",
            "**Weather**: clear skies, dry air, cold nights, large day to night range. Broken by **western disturbances**.",
          ],
        },
        {
          t: "p",
          text: "**Hazards:** **fog** over the Indo-Gangetic plains (worst after a WD), **smog and haze** near cities, **poor visibility** in the mornings, **CAT** near the subtropical jet, **mountain waves** over the Himalayas, a **lower freezing level** so more icing, and snow and low cloud over the hills during WDs. Tamil Nadu and the south east coast get rain and thunderstorms from the north east monsoon, mostly in October to December.",
        },
        {
          t: "p",
          text: "A **cold wave** follows many WDs as cold, dry north westerly air spreads over north and central India. IMD declares a cold wave in the plains when the minimum temperature is 10 °C or less and well below normal (about 4.5 °C or more below).",
        },
      ],
    },
    {
      id: "wd",
      title: "Western disturbances (WDs)",
      blocks: [
        {
          t: "p",
          text: "A **western disturbance** is a mid latitude low or trough that starts over the **Mediterranean, Caspian or Black Sea** region and travels **from west to east** in the westerlies across Iran, Afghanistan and Pakistan into north India. They belong to the **extra-tropical (frontal) cyclone** family, and by the time they reach India they are usually **occluded**. In the upper air they show as troughs in the westerlies.",
        },
        {
          t: "list",
          items: [
            "**Most frequent in winter**: about 4 to 7 a month. Fewer in the pre-monsoon, almost none in the monsoon, coming back from October.",
            "They pick up moisture from the Arabian Sea and grow stronger over the Himalayas.",
            "Weather is heaviest over **Jammu and Kashmir, Himachal, Uttarakhand, Punjab and Haryana**, with rain over the plains and **snow over the hills**. Strong ones affect UP, MP, Bihar and even north east India.",
            "A low that forms to the **south** of a WD under its influence is an **induced low**.",
            "In the pre-monsoon, WDs trigger dust storms in the north west and thunderstorms over the northern plains.",
          ],
        },
        { t: "figure", key: "wdpass", caption: "What you see as a western disturbance passes a station in north India." },
        {
          t: "table",
          head: ["Stage", "What happens"],
          rows: [
            ["**Approach**", "Wind **backs** from north west to south west or south east, temperature rises, pressure falls. **Cirrus** appears, then thickens to As and Ns"],
            ["**Passage**", "Rain or snow, low cloud, drizzle, then CB, thunderstorms and hail as the cold front type part passes. Pressure starts rising"],
            ["**After**", "Skies clear, cold dry north westerly winds. **Widespread radiation fog** and a **cold wave** for 2 to 3 days"],
          ],
        },
        {
          t: "p",
          text: "**Hazards:** low cloud, rain and poor visibility, thunderstorms and hail, icing, snow on hill airfields, then dense fog after it passes.",
        },
      ],
    },
    {
      id: "premonsoon",
      title: "Pre-monsoon (March to May)",
      blocks: [
        {
          t: "p",
          text: "The land heats up fast. Pressure falls over the north west and a **heat low** develops over Pakistan and Rajasthan. Day temperatures reach 40 to 45 °C or more over north and central India in May. The subtropical jet weakens and moves north. Many pilots call this the **most hazardous season for flying** in India.",
        },
        {
          t: "table",
          head: ["Phenomenon", "Where", "What"],
          rows: [
            ["**Dust storms (Andhi)**", "Rajasthan, Punjab, Haryana, west UP, Delhi", "Violent squalls raising walls of dust, visibility near zero, mostly afternoon and evening, April to June"],
            ["**Dust haze**", "Whole of north India", "Widespread poor visibility from about 0900 to 1700, alternates equally bad"],
            ["**Loo**", "North west and central India", "Hot, dry, dusty westerly wind on afternoons. Very high density altitude"],
            ["**Norwesters (Kalbaisakhi)**", "**West Bengal, Odisha, Jharkhand, Bihar, Assam** (called Bardoli Chheerha in Assam)", "Violent thunderstorms with **squalls from the north west**, hail and heavy rain, mostly in the late afternoon and evening, **March to May**"],
            ["**Mango showers**", "Kerala and coastal Karnataka", "Pre-monsoon thunder showers in April and May. Called blossom showers over Karnataka coffee country"],
            ["**Heat waves**", "North west and central India", "IMD: maximum 40 °C or more in the plains and well above normal, or 45 °C or more"],
            ["**Cyclones**", "Bay of Bengal, sometimes the Arabian Sea", "Mostly in May (Module 8)"],
          ],
        },
        {
          t: "p",
          text: "Over the peninsula, a **dry line** (a boundary between hot dry air from the north and moister air from the sea) often sets off afternoon thunderstorms with hail and squalls.",
        },
      ],
    },
    {
      id: "swmonsoon",
      title: "The south west monsoon (June to September)",
      blocks: [
        {
          t: "p",
          text: "As the sun moves north, the land heats far more than the sea. The **ITCZ shifts north** over India as the **monsoon trough**, the heat low deepens, and the south east trades of the southern Indian Ocean cross the equator, turn right and arrive as the **south west monsoon**: very moist equatorial air. The low level **Somali jet** carries it across the Arabian Sea, and high above, the **tropical easterly jet** blows from the east.",
        },
        { t: "figure", key: "monsoon", caption: "The two branches of the south west monsoon. Schematic only, not a map." },
        {
          t: "table",
          head: ["Branch", "Path", "Rain"],
          rows: [
            ["**Arabian Sea branch** (the stronger one)", "Strikes the west coast and the **Western Ghats** first, then moves inland", "Very heavy rain on the **windward west coast**, **rain shadow** east of the Ghats (Deccan), then rain over central India"],
            ["**Bay of Bengal branch**", "Moves north to the north east states and Bangladesh, then is **turned west by the Himalayas** along the Gangetic plains", "Very heavy rain in the north east and Meghalaya (Mawsynram, Cherrapunji), then up the Ganges valley"],
          ],
        },
        {
          t: "table",
          head: ["Normal date (IMD, revised 2020)", "Event"],
          rows: [
            ["**1 June**", "Onset over **Kerala**"],
            ["**11 June**", "Mumbai"],
            ["End of June", "Delhi"],
            ["**8 July**", "Covers the **whole country**"],
            ["**17 September**", "Starts withdrawing from **west Rajasthan**"],
            ["**15 October**", "Withdrawn from the whole country"],
          ],
        },
        {
          t: "flag",
          text: "The older normals, still in many books and question banks, were: whole country covered by **15 July**, and withdrawal starting from north west India on **1 September**. Onset over Kerala stays **1 June**. Use the new dates unless only the old ones are offered.",
        },
        {
          t: "p",
          text: "**The monsoon trough** is the line of lowest pressure running from **north west Rajasthan, across UP, to the head of the Bay of Bengal**. It slopes southwards with height. **Monsoon rain over India depends mainly on the position of the trough's axis.** Winds are westerly to south westerly south of it and easterly to south easterly north of it.",
        },
        {
          t: "list",
          items: [
            "**Active monsoon**: trough near its normal place or south of it, strong winds over the sea, widespread heavy rain.",
            "**Break monsoon**: the trough moves north to the **Himalayan foothills**. Rain stops over central and north west India and becomes very heavy over the foothills and north east India, causing floods in Bihar and Assam. Hot, humid, hazy weather over the plains.",
            "**Monsoon depressions** form over the **north Bay of Bengal** (head Bay), move **west north west** along the trough, and last about 3 to 5 days. The **heaviest rain is in their south west sector**. They bring most of the rain to central India.",
            "**Offshore troughs and vortices** along the west coast and **mid-tropospheric cyclones** over Gujarat and Maharashtra give spells of extremely heavy rain (as in Mumbai in 2005).",
          ],
        },
        {
          t: "p",
          text: "**Flying in the monsoon:** cloud lies in layers with clear gaps between, so a smooth level can often be found, but **CBs embedded** in the layers give heavy rain and turbulence. Visibility is **excellent outside rain** but drops sharply in heavy rain. Coastal airports (Mumbai, Goa, Mangaluru, Kochi) get low cloud, heavy rain, gusty crosswinds and wet runways. The freezing level is high, about 5 km. Upper winds over India are **easterly**.",
        },
      ],
    },
    {
      id: "postmonsoon",
      title: "Post-monsoon (October to December)",
      blocks: [
        {
          t: "list",
          items: [
            "The monsoon withdraws from north west India first, and dry northerly air takes over. Skies clear, and the hot, humid **October heat** gives way to cooler nights.",
            "The winds over the Bay of Bengal turn **north easterly**: the **north east monsoon** brings the main rainy season to **Tamil Nadu**, south coastal Andhra Pradesh and south Kerala from October to December.",
            "This is the main **cyclone season**, especially in the Bay of Bengal in **October and November**, with the strongest storms of the year.",
            "WDs return, the subtropical jet comes back over north India, and **fog** begins over the plains by December.",
          ],
        },
      ],
    },
    {
      id: "enso",
      title: "El Niño and the monsoon",
      blocks: [
        {
          t: "p",
          text: "**El Niño** is a warming of the sea surface in the central and eastern Pacific, off Ecuador and Peru, every few years. It often goes with a **weaker Indian monsoon** and drought, though not every time. **La Niña**, the opposite cooling, often goes with a good monsoon. A **positive Indian Ocean Dipole** (warmer western Indian Ocean) tends to help the monsoon.",
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
            "IMD seasons: **winter Jan to Feb, pre-monsoon Mar to May, SW monsoon Jun to Sep, post-monsoon Oct to Dec**.",
            "About **75%** of India's rain falls June to September.",
            "Winter: NW winds over north India, **NE over the peninsula**. Upper westerlies, **STJ at 27°N, 12 km**.",
            "Winter hazards: **fog after WDs**, haze, smog, CAT near the STJ, mountain waves.",
            "**WDs**: mid latitude lows from the **Mediterranean**, moving **west to east**, usually **occluded**, most frequent in **winter**. Induced lows form to their **south**.",
            "WD sequence: wind backs, temperature up, pressure down, Ci to As and Ns, rain or snow, then CB, then clearing, **cold wave and fog**.",
            "Pre-monsoon: **dust storms** in the north west, **norwesters (Kalbaisakhi) in the east and north east, March to May**, loo, mango showers, heat waves, Bay cyclones in May.",
            "Monsoon onset **Kerala 1 June**, Mumbai about 11 June, Delhi end of June, whole country **8 July** (old normal 15 July).",
            "Withdrawal from west Rajasthan about **17 September** (old normal 1 September), complete by **15 October**.",
            "Monsoon advances as **two branches**: Arabian Sea (stronger, Western Ghats) and Bay of Bengal (north east, then up the Ganges).",
            "**Rain depends on the monsoon trough's position.** Break: trough at the **Himalayan foothills**.",
            "Monsoon depressions form in the **north Bay of Bengal**, move WNW, heaviest rain **south west sector**.",
            "Monsoon flying: layers with **embedded CB**, good visibility outside rain, **easterly upper winds**, TEJ.",
            "Post-monsoon: **NE monsoon rain over Tamil Nadu**, strongest **cyclones** in October and November.",
            "**El Niño** often means a weaker monsoon.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "What drives India's weather", points: ["**Himalayas**: block cold air, turn the monsoon", "**Thar**: summer heat low", "Two seas supply moisture", "Seasonal wind reversal: the **monsoon**"] },
    { title: "Four IMD seasons", points: ["Winter: Jan to Feb", "Pre-monsoon: Mar to May", "SW monsoon: Jun to Sep (**75%** of the rain)", "Post-monsoon: Oct to Dec"], figure: "calendar" },
    { title: "Winter", points: ["NW winds in the north, **NE over the peninsula**", "Upper westerlies, **STJ at 27°N**", "Clear, cold, dry, hazy", "**Fog**, smog, CAT, mountain waves"] },
    { title: "Western disturbances", points: ["Lows from the **Mediterranean**, moving west to east", "Usually **occluded** on arrival", "Most frequent in **winter**", "Rain in the plains, snow in the hills"] },
    { title: "As a WD passes", points: ["Wind backs, warmer, pressure falls, Ci to As, Ns", "Rain, snow, then CB and hail", "Then clear, cold NW wind", "**Fog and cold wave** for 2 to 3 days"], figure: "wdpass" },
    { title: "Pre-monsoon storms", points: ["**Dust storms**: Rajasthan, Punjab, Delhi", "**Norwesters (Kalbaisakhi)**: Bengal, Odisha, Assam, Bihar", "Squalls from the NW, hail, **March to May**", "Loo, heat waves, mango showers"] },
    { title: "Monsoon arrives", points: ["Kerala **1 June**", "Mumbai about 11 June, Delhi end of June", "Whole country **8 July** (old: 15 July)", "Two branches: Arabian Sea and Bay of Bengal"], figure: "monsoon" },
    { title: "Monsoon trough", points: ["NW Rajasthan to the head Bay", "**Rain depends on its position**", "**Break**: trough at the Himalayan foothills", "Floods in the north east, dry plains"] },
    { title: "Monsoon depressions", points: ["Form in the **north Bay of Bengal**", "Move **west north west** along the trough", "Heaviest rain in the **south west sector**", "Last about 3 to 5 days"] },
    { title: "Flying in the monsoon", points: ["Layered cloud with **embedded CB**", "Good visibility outside rain", "Wet runways, crosswinds at coastal airports", "**Easterly** upper winds, TEJ above"] },
    { title: "After the monsoon", points: ["Withdraws from W Rajasthan about **17 September**", "Gone by **15 October**", "**NE monsoon** rain over Tamil Nadu", "Strongest **cyclones** in October and November"] },
  ],
  mcqs: [
    { id: "m10-01", q: "About what share of India's annual rainfall comes during the south west monsoon (June to September)?", options: ["25%", "50%", "75%", "95%"], answer: 2, why: "About three quarters of the year's rain falls in these four months." },
    { id: "m10-02", q: "According to IMD, the pre-monsoon season covers:", options: ["December to February", "March to May", "June to September", "October to December"], answer: 1, why: "IMD seasons: winter Jan to Feb, pre-monsoon Mar to May, monsoon Jun to Sep, post-monsoon Oct to Dec." },
    { id: "m10-03", q: "In winter, the surface winds over the Indian peninsula are mainly:", options: ["South westerly", "North easterly", "Southerly", "Calm all season"], answer: 1, why: "Northerly flow from the high over the north turns right under Coriolis to become north easterly over the south." },
    { id: "m10-04", q: "Flying from Delhi to Kolkata at FL100 in January, you would expect:", options: ["North westerly to westerly winds of about 25 to 30 kt", "Easterly winds of 10 to 15 kt", "Southerly winds of 40 kt", "Calm"], answer: 0, why: "In winter the winds above about 10,000 ft over north India are westerly and fairly strong." },
    { id: "m10-05", q: "The main aviation hazard over north India in winter is:", options: ["Tropical cyclones", "Dust storms", "Poor visibility from fog, mist, haze and smoke", "Monsoon rain"], answer: 2, why: "Fog and smog in the mornings regularly close north Indian airports in December and January." },
    { id: "m10-06", q: "Western disturbances originate over the region of the:", options: ["Bay of Bengal", "Mediterranean, Caspian and Black Seas", "South China Sea", "Southern Indian Ocean"], answer: 1, why: "They form as mid latitude lows to the west and travel east in the westerlies." },
    { id: "m10-07", q: "Western disturbances usually approach India as:", options: ["Cols", "Occluded fronts", "Anticyclones", "Tropical cyclones"], answer: 1, why: "They are extra-tropical lows that are usually occluded by the time they arrive." },
    { id: "m10-08", q: "Western disturbances are most frequent over India in:", options: ["Winter", "Pre-monsoon", "Monsoon", "Post-monsoon"], answer: 0, why: "About 4 to 7 a month in winter. Almost none during the monsoon." },
    { id: "m10-09", q: "Western disturbances move generally:", options: ["From east to west", "From south to north", "From west to east", "In a circle over Rajasthan"], answer: 2, why: "They are carried by the westerlies, from Pakistan towards the western Himalayas and beyond." },
    { id: "m10-10", q: "Induced lows develop to the ____ of a western disturbance.", options: ["North", "South", "East only", "Centre"], answer: 1, why: "Under the influence of the WD, a low or cyclonic circulation often forms to its south over Rajasthan or nearby." },
    { id: "m10-11", q: "As a western disturbance approaches a station in north India, the wind usually:", options: ["Veers to north westerly", "Backs from north westerly to south westerly or south easterly", "Becomes calm", "Becomes northerly and strong"], answer: 1, why: "Ahead of the system the wind backs, temperature rises and pressure falls, like ahead of a warm front." },
    { id: "m10-12", q: "The type of fog associated with the passage of a western disturbance is:", options: ["Steam fog", "Frontal fog only", "Advection fog only", "Radiation fog after it passes"], answer: 3, why: "After the WD the ground is wet, skies clear and winds fall light, so widespread radiation fog forms." },
    { id: "m10-13", q: "After a western disturbance passes over north India in winter, you can expect:", options: ["Hot, dusty winds", "A cold wave and widespread fog", "Monsoon rain", "A tropical cyclone"], answer: 1, why: "Cold, dry north westerly air spreads in behind it, with clear calm nights and fog." },
    { id: "m10-14", q: "Norwesters occur mainly:", options: ["In north west India in November", "In north east and east India during March to May", "On the west coast in July", "In Tamil Nadu in December"], answer: 1, why: "These violent thunderstorms with north westerly squalls hit West Bengal, Odisha, Jharkhand, Bihar and Assam in the pre-monsoon." },
    { id: "m10-15", q: "Norwesters in West Bengal are locally known as:", options: ["Loo", "Andhi", "Kalbaisakhi", "Mango showers"], answer: 2, why: "Kalbaisakhi means the calamity of the month of Baisakh. In Assam they are called Bardoli Chheerha." },
    { id: "m10-16", q: "Dust storms are most common over:", options: ["Kerala in July", "Rajasthan, Punjab, Haryana and Delhi in the pre-monsoon", "Assam in winter", "Tamil Nadu in November"], answer: 1, why: "Hot, dry, loose soil and strong gusty winds in April to June raise dust storms over the north west." },
    { id: "m10-17", q: "The Loo is:", options: ["A cold northerly in winter", "A hot, dry westerly wind of north India summer afternoons", "A thunderstorm in Assam", "Rain over Kerala in April"], answer: 1, why: "It blows over the plains of north and central India in May and June." },
    { id: "m10-18", q: "Pre-monsoon thunder showers over Kerala and coastal Karnataka are called:", options: ["Mango showers", "Kalbaisakhi", "Western disturbances", "Bardoli Chheerha"], answer: 0, why: "They come in April and May, around mango season." },
    { id: "m10-19", q: "The normal date of onset of the south west monsoon over Kerala is:", options: ["1 June", "15 May", "15 June", "1 July"], answer: 0, why: "Onset over Kerala is 1 June, unchanged in the 2020 revision." },
    { id: "m10-20", q: "Which place is normally reached by the monsoon by 1 June?", options: ["Kochi (Cochin)", "Mumbai", "Hyderabad", "Delhi"], answer: 0, why: "The monsoon reaches the Kerala coast first, around 1 June." },
    { id: "m10-21", q: "The normal date of onset of the monsoon over Delhi is around:", options: ["Last week of May", "Second week of June", "Last week of June", "Middle of August"], answer: 2, why: "The monsoon normally reaches Delhi near the end of June." },
    { id: "m10-22", q: "Under the IMD normals revised in 2020, the monsoon covers the whole of India by about:", options: ["15 June", "1 August", "15 July", "8 July"], answer: 3, why: "The new normal is 8 July.", flag: "The older normal was 15 July. If 8 July is not an option, choose 15 July." },
    { id: "m10-23", q: "Under the revised IMD normals, the monsoon starts withdrawing from west Rajasthan around:", options: ["1 August", "1 September", "17 September", "15 October"], answer: 2, why: "The new normal is about 17 September. It is gone from the whole country by about 15 October.", flag: "The older normal was 1 September. If 17 September is not an option, choose 1 September." },
    { id: "m10-24", q: "The south west monsoon advances over India as:", options: ["A Bay of Bengal current only", "An Arabian Sea current only", "Both an Arabian Sea branch and a Bay of Bengal branch", "A north easterly current"], answer: 2, why: "Two branches: the Arabian Sea branch hits the west coast, the Bay branch hits the north east and turns up the Ganges valley." },
    { id: "m10-25", q: "Very heavy rain on the windward slopes of the Western Ghats in the monsoon is mainly due to:", options: ["Orographic lifting of moist south westerly winds", "Convection only", "Western disturbances", "Frontal lifting"], answer: 0, why: "Moist air is forced up the Ghats and drops heavy rain. The lee side is a rain shadow." },
    { id: "m10-26", q: "The Bay of Bengal branch of the monsoon is turned westwards along the Gangetic plains by:", options: ["The Western Ghats", "The Vindhyas", "The Thar desert", "The Himalayas"], answer: 3, why: "The Himalayas stop it going north, so it flows west along the plains." },
    { id: "m10-27", q: "Rainfall over India during the monsoon depends mainly on:", options: ["A low over Pakistan", "Depressions over the Bay of Bengal only", "The position of the axis of the monsoon trough", "Western disturbances"], answer: 2, why: "Where the trough lies decides where the rain falls. Depressions moving along it add to it." },
    { id: "m10-28", q: "Normally, the monsoon trough runs from:", options: ["North west Rajasthan, across UP, to the head of the Bay of Bengal", "Kerala to Gujarat", "Mumbai to Chennai", "Kashmir to Assam along the Himalayas"], answer: 0, why: "It runs across the north Indian plains to the head Bay. In a break it shifts to the Himalayan foothills." },
    { id: "m10-29", q: "During a break in the monsoon, the monsoon trough:", options: ["Moves south to the peninsula", "Moves over the Arabian Sea", "Disappears completely", "Shifts north to the foothills of the Himalayas"], answer: 3, why: "Rain then stops over central and north west India but becomes very heavy along the foothills and in the north east." },
    { id: "m10-30", q: "During the monsoon, depressions form most frequently over:", options: ["The north Bay of Bengal", "The Malabar coast", "North west India", "The south Bay of Bengal"], answer: 0, why: "Monsoon depressions form over the head Bay and move west north west along the trough." },
    { id: "m10-31", q: "In a monsoon depression, the heaviest rain normally falls in its:", options: ["North east sector", "North sector", "Centre only", "South west sector"], answer: 3, why: "The strongest moist inflow is on the south west side, giving a broad belt of heavy rain there." },
    { id: "m10-32", q: "During the south west monsoon, upper winds at 30,000 ft over India are mainly:", options: ["Easterly", "Westerly", "South westerly", "Northerly"], answer: 0, why: "In summer the north is warmer than the south, so the upper winds reverse to easterly. The tropical easterly jet blows above." },
    { id: "m10-33", q: "Flying in the monsoon over central India, you would usually find:", options: ["Clear skies and dust", "Freezing rain", "Dense fog", "Layered cloud with embedded CB, and good visibility outside rain"], answer: 3, why: "Monsoon cloud forms in layers with gaps, but CBs are hidden in it. The moist, clean air gives good visibility out of rain." },
    { id: "m10-34", q: "The main rainy season for Tamil Nadu is:", options: ["June to September", "January only", "March to May", "October to December, from the north east monsoon"], answer: 3, why: "Tamil Nadu is in the rain shadow of the south west monsoon but gets the north east monsoon from the Bay." },
    { id: "m10-35", q: "The strongest cyclones affecting India usually form in:", options: ["January and February", "July and August", "October and November", "March"], answer: 2, why: "The post-monsoon season, especially October and November, has the most intense Bay of Bengal storms." },
    { id: "m10-36", q: "The subtropical jet stream lies over north India in winter at about:", options: ["27°N and 12 km", "13°N and 16 km", "40°N and 9 km", "20°N and 3 km"], answer: 0, why: "Mean position about 27°N, height about 12 km (40,000 ft)." },
    { id: "m10-37", q: "El Niño refers to:", options: ["Cooling of the sea off Ecuador and Peru", "The monsoon onset", "A cyclone in the Bay of Bengal", "Warming of the sea surface in the central and eastern Pacific, off Ecuador and Peru"], answer: 3, why: "El Niño is a warming of the eastern Pacific. It often goes with a weaker Indian monsoon." },
    { id: "m10-38", q: "Mawsynram and Cherrapunji are among the wettest places on earth mainly because of:", options: ["Western disturbances", "The north east monsoon", "Norwesters", "The Bay of Bengal monsoon branch being forced up the Khasi hills"], answer: 3, why: "The moist south westerly flow from the Bay is funnelled and lifted sharply over the Meghalaya hills." },
    { id: "m10-39", q: "Which of these is NOT typical of the pre-monsoon season over India?", options: ["Dust storms", "Norwesters", "Dense radiation fog over the plains", "Heat waves"], answer: 2, why: "Widespread radiation fog belongs to the winter. Pre-monsoon brings heat, dust and thunderstorms." },
  ],
};
