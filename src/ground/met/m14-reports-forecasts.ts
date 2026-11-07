// Meteorology Module 14: Met Reports and Forecasts. CAR Sec 7 Series B Part IV, Appendix B 1.10 c.
// Written fresh for Runway Zero. India practice checked against IMD's Standard Operational Procedure for Aviation Meteorology
// (half-hourly METAR, lowest visibility, no SPECI since 15 Nov 2015, 9 h and 30 h TAF, SIGMET by four MWOs, aerodrome and
// light aircraft warnings) and AIP India GEN 1.7 (no AIRMET, no GAMET). SIGWX levels checked against the ICAO WAFS notices.
import type { Module } from "../types.ts";

export const M14: Module = {
  n: 14,
  title: "Met Reports and Forecasts: METAR, TAF, SIGMET and more",
  car: "1.10 c",
  summary:
    "Every Met message a pilot reads, decoded group by group: METAR and the TREND landing forecast, local reports and the SPECI criteria, the TAF and its change groups, SIGMET, AIRMET and area forecasts, aerodrome, light aircraft and windshear warnings, significant weather and upper wind charts, flight documentation, ATIS and VOLMET, all as they are used in India.",
  sections: [
    {
      id: "family",
      title: "The Met messages",
      blocks: [
        {
          t: "table",
          head: ["Message", "What it is", "In India"],
          rows: [
            ["**METAR**", "Routine report of the weather **observed** at an aerodrome", "Every **half hour**"],
            ["**TREND**", "**Landing forecast** added to the end of a METAR or local report", "Valid **2 hours**"],
            ["**MET REPORT / SPECIAL**", "Local routine and special reports for ATC and ATIS at that airport", "Local use only"],
            ["**SPECI**", "Special METAR when the weather changes a lot between routine reports", "**Not issued since November 2015**: half hourly METARs instead"],
            ["**TAF**", "Aerodrome **forecast**", "9 hour (domestic) and 30 hour (international)"],
            ["**SIGMET**", "Warning of severe weather **en route**, for all aircraft", "From the four MWOs"],
            ["**AIRMET, GAMET**", "Warnings and area forecasts for **low level** flights", "**Not issued in India**. A local area forecast is issued instead"],
            ["**Aerodrome warning**", "Weather that can harm aircraft **on the ground** and airport facilities", "Local only"],
            ["**Windshear warning**", "Windshear on the approach or take-off path", "Up to 1,600 ft"],
            ["**SIGWX and wind and temperature charts**", "Forecast charts for flight planning", "From the World Area Forecast Centres and IMD"],
            ["**ATIS, VOLMET**", "Recorded broadcasts of airport information and Met reports", "VHF and HF"],
          ],
        },
      ],
    },
    {
      id: "metar",
      title: "Reading a METAR",
      blocks: [
        {
          t: "p",
          text: "A METAR is written in a fixed order. Learn the order and every report becomes easy to read. Here is a made up example for Mumbai during a monsoon thunderstorm:",
        },
        { t: "figure", key: "metar", caption: "A METAR split into its groups." },
        {
          t: "table",
          head: ["Group", "Example", "Meaning and rules"],
          rows: [
            ["**Type and station**", "METAR VABB", "Report type, then the four letter ICAO code (VIDP Delhi, VABB Mumbai, VECC Kolkata, VOMM Chennai, VOBL Bengaluru)"],
            ["**Day and time**", "141130Z", "14th of the month, 1130 **UTC** (Z)"],
            ["**Wind**", "24012G24KT", "From **240° true**, mean 12 kt, **gusting 24 kt**. The mean is over **10 minutes**. Gusts are given when the highest speed is **10 kt or more** above the mean"],
            ["**Wind variation**", "210V280", "Direction varied between 210° and 280° (clockwise). Given when it varies by **60° or more but less than 180°** and the mean is **3 kt or more**"],
            ["**Visibility**", "3000", "3,000 m. In India this is the **lowest** visibility around the station. A compass point may follow, such as 1400SW"],
            ["**RVR**", "R27/1100U", "RVR on runway 27 is 1,100 m, tendency **U**p (D down, N no change). Only when visibility or RVR is **below 1,500 m**"],
            ["**Present weather**", "TSRA", "Thunderstorm with moderate rain"],
            ["**Cloud**", "FEW015CB SCT020 BKN080", "1 to 2 oktas of **CB** at 1,500 ft, 3 to 4 oktas at 2,000 ft, 5 to 7 oktas at 8,000 ft. Heights in **hundreds of feet above the aerodrome**"],
            ["**Temperature and dew point**", "27/24", "27 °C and 24 °C. Below zero is written with **M**: M03"],
            ["**QNH**", "Q1006", "1006 hPa, **rounded down**. Some countries use inches: A2992"],
            ["**Supplementary**", "WS R27", "**Windshear** on runway 27. Also RE for recent weather, such as RETSRA"],
            ["**Trend**", "TEMPO 1500 +TSRA", "**TREND** for the next **2 hours**: at times 1,500 m in heavy thunderstorm rain"],
          ],
        },
        {
          t: "list",
          items: [
            "**Calm**: 00000KT (under 1 kt). **VRB**03KT: mean **under 3 kt** with a varying direction, or any speed when it varies by **180° or more** (as when a storm passes overhead). **P99KT**: 100 kt or more.",
            "**Visibility steps**: **50 m** below 800 m, **100 m** from 800 m to 5 km, **1 km** from 5 km to 10 km. **9999** means **10 km or more**. 0000 means less than 50 m. Values are rounded down to the step.",
            "**RVR steps**: **25 m** below 400 m, **50 m** from 400 to 800 m, **100 m** above 800 m. **P2000**: more than 2,000 m. **M0050**: less than 50 m. Up to four runways.",
            "**Temperature** is rounded to the nearest whole degree, with .5 going **up**: +2.5 °C is 03, -3.5 °C is M03. **QNH** is always rounded **down**: 1002.9 hPa is Q1002.",
          ],
        },
      ],
    },
    {
      id: "wx",
      title: "Weather and cloud codes",
      blocks: [
        {
          t: "table",
          head: ["Part", "Codes"],
          rows: [
            ["**Intensity or nearness**", "**-** light, no sign moderate, **+** heavy. **VC** in the vicinity: not at the aerodrome but within about 8 km of it"],
            ["**Descriptor**", "**MI** shallow, **BC** patches, **PR** partial, **DR** low drifting, **BL** blowing, **SH** showers, **TS** thunderstorm, **FZ** freezing (supercooled)"],
            ["**Precipitation**", "**DZ** drizzle, **RA** rain, **SN** snow, **SG** snow grains, **PL** ice pellets, **GR** hail, **GS** small hail or snow pellets, **UP** unknown"],
            ["**Obscuration**", "**BR** mist (1,000 to 5,000 m), **FG** fog (below 1,000 m), **FU** smoke, **VA** volcanic ash, **DU** widespread dust, **SA** sand, **HZ** haze"],
            ["**Other**", "**PO** dust devils, **SQ** squall, **FC** funnel cloud, **SS** sandstorm, **DS** duststorm"],
          ],
        },
        {
          t: "list",
          items: [
            "Examples: **-SHRA** light rain showers, **+TSRA** thunderstorm with heavy rain, **MIFG** shallow fog, **BCFG** fog patches, **VCTS** thunderstorm near the airfield, **FZFG** freezing fog, **RETS** thunderstorm in the last hour but not now.",
            "Mist, haze, smoke, dust and sand are reported only when the visibility is **5,000 m or less**.",
            "**Cloud amount** in oktas: **FEW 1 to 2, SCT 3 to 4, BKN 5 to 7, OVC 8**. Only **CB** and **TCU** are named. Usually up to three layers, lowest first.",
            "**NSC**: no significant cloud (none below 5,000 ft, no CB or TCU) when CAVOK does not apply. **NCD**: no cloud detected by an automatic station.",
          ],
        },
        {
          t: "p",
          text: "**CAVOK** (\"cav-oh-kay\", ceiling and visibility OK) replaces the visibility, RVR, weather and cloud groups when **all** of these are true at the same time: visibility **10 km or more**, **no cloud below 5,000 ft (1,500 m)** or below the highest minimum sector altitude, whichever is higher, **no CB or TCU** at all, and **no significant weather** (no precipitation, thunderstorm, fog, mist, dust and so on).",
        },
      ],
    },
    {
      id: "trend",
      title: "TREND: the landing forecast",
      blocks: [
        {
          t: "p",
          text: "A **TREND** is a short forecast added to the end of a METAR or local report. It is the **landing forecast** and is valid for **2 hours** from the time of the report.",
        },
        {
          t: "list",
          items: [
            "**NOSIG**: no significant change expected in the next 2 hours.",
            "**BECMG**: conditions are **becoming** different, changing at a steady or unsteady rate, and stay changed.",
            "**TEMPO**: **temporary** changes, each lasting **less than an hour** and together less than half the period.",
            "Time words: **FM** from, **TL** until, **AT** at. A change starting at **midnight** UTC is written **FM0000**. One ending at midnight is **TL2400**.",
            "**NSW**: no significant weather, used to show that weather such as rain or a thunderstorm will **end**.",
            "Example: **BECMG FM0300 TL0430 3000 BR** means from 0300 to 0430 UTC the visibility will drop to 3,000 m in mist and stay that way.",
          ],
        },
      ],
    },
    {
      id: "local",
      title: "Local reports and SPECI criteria",
      blocks: [
        {
          t: "p",
          text: "At each airport the Met office also makes **local routine reports (MET REPORT)** and **local special reports (SPECIAL)** for ATC and ATIS. These are in abbreviated plain language and use the wind **averaged over 2 minutes**, which is the wind ATC gives you for take-off and landing.",
        },
        {
          t: "flag",
          text: "**India stopped issuing SPECI** (the special METAR sent to other airports) from **15 November 2015**, because METARs are now issued every half hour. The SPECI criteria are still used for local special reports, and the exam still asks them.",
        },
        {
          t: "table",
          head: ["Element", "A special report is made when"],
          rows: [
            ["**Wind**", "Direction changes by **60° or more** (with a mean of 10 kt or more), the mean speed changes by **10 kt or more**, or gusts rise by 10 kt or more"],
            ["**Visibility**", "Reaches or passes **800, 1,500, 3,000 or 5,000 m**"],
            ["**RVR**", "Reaches or passes **150, 350, 600 or 800 m**"],
            ["**Weather**", "A thunderstorm, squall, funnel cloud, duststorm, sandstorm, freezing precipitation or moderate or heavy precipitation starts, stops or changes intensity"],
            ["**Cloud**", "The base of the lowest **BKN or OVC** layer reaches or passes **100, 200, 500, 1,000 or 1,500 ft (30, 60, 150, 300, 450 m)**, or cloud below 1,500 ft changes between SCT or less and BKN or OVC"],
            ["**Temperature**", "Rises by **2 °C or more** since the last report"],
          ],
        },
        {
          t: "p",
          text: "A worsening is reported **at once**. An improvement is reported only after it has lasted **10 minutes**.",
        },
      ],
    },
    {
      id: "taf",
      title: "The TAF",
      blocks: [
        {
          t: "p",
          text: "A **TAF (aerodrome forecast)** gives the weather expected at an aerodrome over a period. It uses the same groups as a METAR for wind, visibility, weather and cloud, but has **no RVR, no temperature and dew point group and no QNH**. It may add the expected maximum and minimum temperatures (TX and TN).",
        },
        {
          t: "table",
          head: ["Kind (India)", "Validity", "Issued"],
          rows: [
            ["**Short TAF**, for domestic flights and VOLMET", "**9 hours**", "**Every 3 hours**: 00, 03, 06 ... 21 UTC"],
            ["**Long TAF**, for international flights", "**30 hours**", "**Every 6 hours**: 00, 06, 12, 18 UTC"],
          ],
          caption: "ICAO rule: a TAF is valid for 6 to 30 hours. Those valid for less than 12 hours are issued every 3 hours, those for 12 to 30 hours every 6 hours.",
        },
        {
          t: "p",
          text: "Example (made up) for Bengaluru: **TAF VOBL 220500Z 2206/2312 09008KT 6000 SCT020 BKN080 TEMPO 2210/2214 4000 TSRA FEW015CB BKN020 BECMG 2216/2218 VRB03KT PROB30 2222/2302 0800 FG FM230300 10006KT 6000 SCT015=**",
        },
        {
          t: "list",
          items: [
            "**220500Z**: issued on the 22nd at 0500 UTC. **2206/2312**: valid from the 22nd 0600 UTC to the 23rd 1200 UTC (30 hours). A period ending at midnight is written with **24**, such as **1500/1524**.",
            "Main forecast: wind 090° 8 kt, visibility 6 km, 3 to 4 oktas at 2,000 ft, 5 to 7 oktas at 8,000 ft.",
            "Between 10 and 14 UTC, at times 4 km in thunderstorm rain with CB at 1,500 ft.",
            "Between 16 and 18 UTC the wind becomes variable at 3 kt and stays so.",
            "**30% chance** of fog with 800 m from 22 UTC to 02 UTC on the 23rd.",
            "From **0300 UTC on the 23rd**, a new forecast replaces everything: 100° 6 kt, 6 km, SCT at 1,500 ft.",
          ],
        },
        { t: "figure", key: "tafline", caption: "How the TAF change groups work through time." },
        {
          t: "table",
          head: ["Group", "Meaning"],
          rows: [
            ["**FM**ddhhmm", "**From** that time a **rapid, complete** change: everything in the forecast before it is replaced"],
            ["**BECMG** ddhh/ddhh", "A **gradual, lasting** change happening some time in that period. The period is normally **2 hours or less**, never more than **4 hours**. After it the new conditions hold"],
            ["**TEMPO** ddhh/ddhh", "**Temporary** changes, each lasting **less than 1 hour** and together **less than half** the period. The main forecast returns between them"],
            ["**PROB30, PROB40**", "**30% or 40% chance** of the conditions, alone or with TEMPO (PROB30 TEMPO). 50% or more is put in the main forecast or a change group instead"],
            ["**AMD, COR, CNL, NIL**", "Amended TAF, corrected TAF, cancelled TAF, missing TAF"],
          ],
        },
        {
          t: "p",
          text: "Only **one TAF of each kind** is valid at a time. When the weather no longer fits, an **amended TAF (TAF AMD)** is issued, valid from the present hour to the end of the original period.",
        },
      ],
    },
    {
      id: "sigmet",
      title: "SIGMET",
      blocks: [
        {
          t: "p",
          text: "A **SIGMET** warns **all aircraft en route** of severe weather in a Flight Information Region. In India it is issued by the four **Meteorological Watch Offices: Mumbai, Delhi, Kolkata and Chennai**, each for its own FIR. It is issued **when the hazard is seen or expected**, not on a fixed timetable.",
        },
        {
          t: "table",
          head: ["Phenomenon", "Code"],
          rows: [
            ["**Thunderstorms** that are obscured, embedded, frequent or in a squall line, with or without hail", "OBSC TS, EMBD TS, FRQ TS, SQL TS, and TSGR with hail"],
            ["**Tropical cyclone**", "TC (with its name)"],
            ["**Severe turbulence**", "SEV TURB"],
            ["**Severe icing**, including from freezing rain", "SEV ICE, SEV ICE (FZRA)"],
            ["**Severe mountain waves**", "SEV MTW"],
            ["**Heavy duststorm or sandstorm**", "HVY DS, HVY SS"],
            ["**Volcanic ash**", "VA"],
            ["**Radioactive cloud**", "RDOACT CLD"],
          ],
        },
        {
          t: "list",
          items: [
            "**Valid for not more than 4 hours.** For **tropical cyclones and volcanic ash**, up to **6 hours**.",
            "Issued not more than 4 hours before it becomes valid (up to **12 hours** ahead for cyclones and volcanic ash).",
            "It says whether the hazard is observed (**OBS**) or forecast (**FCST**), where it is, its levels (such as TOP FL450), its movement (**MOV E 10KT**) and whether it is getting stronger (**INTSF**), weaker (**WKN**) or not changing (**NC**). It is cancelled with **CNL SIGMET** when the hazard ends.",
            "Example (made up): **VECF SIGMET 3 VALID 071200/071600 VECC- VECF KOLKATA FIR EMBD TS OBS AT 1130Z N OF N22 TOP FL450 MOV E 10KT NC=**",
          ],
        },
        {
          t: "table",
          head: ["Word", "How much of the area has storms"],
          rows: [
            ["**ISOL** (isolated)", "Single storms, less than half the area"],
            ["**OCNL** (occasional)", "Well separated storms, **50 to 75%** of the area"],
            ["**FRQ** (frequent)", "Little or no gap between storms, **more than 75%** of the area"],
          ],
          caption: "These words are used for CB on charts and in other forecasts. A SIGMET is only issued for frequent (FRQ), obscured, embedded or squall line thunderstorms.",
        },
        {
          t: "flag",
          text: "Some institute notes say SIGMETs come out every 3 hours with 4 hours validity. A SIGMET is issued **whenever** the hazard occurs or is expected, and is valid for **up to 4 hours** (6 hours for cyclones and volcanic ash).",
        },
      ],
    },
    {
      id: "low",
      title: "AIRMET, GAMET and area forecasts",
      blocks: [
        {
          t: "list",
          items: [
            "**AIRMET** warns **low level flights** (below FL100, or FL150 in mountains) of lesser hazards not already in their forecast: **moderate icing, moderate turbulence, moderate mountain waves, isolated or occasional thunderstorms**, widespread surface wind over **30 kt**, widespread visibility below **5,000 m**, BKN or OVC cloud below 1,000 ft, mountains hidden in cloud.",
            "**GAMET** is an **area forecast for low level flights** in abbreviated plain language.",
            "**India does not issue AIRMET or GAMET.** Instead each Met office issues a **local area forecast** for the aerodrome and **100 nm** around it, valid for **8 hours**, three times a day, along with low level forecasts for flights.",
          ],
        },
      ],
    },
    {
      id: "warn",
      title: "Warnings at the aerodrome",
      blocks: [
        {
          t: "table",
          head: ["Warning", "When", "Notes"],
          rows: [
            ["**Aerodrome warning**", "Weather that can harm **parked aircraft**, aircraft on the ground and airport facilities: **thunderstorm**, squall, **hail**, surface wind of **30 kt or more** (mean or gust), tropical cyclone, duststorm, sandstorm, rising dust, frost and more", "Issued **half an hour to an hour before**, valid **not more than 4 hours**. **Local only**, not sent beyond the airport"],
            ["**Warning for light aircraft**", "Surface wind expected to reach **17 kt or more**", "For light aircraft and flying clubs"],
            ["**Windshear warning**", "Windshear on the approach or take-off path from the runway up to **500 m (1,600 ft)**", "Mentions a **microburst** when one is seen. Cancelled when aircraft no longer report it, or after 2 hours"],
          ],
        },
      ],
    },
    {
      id: "charts",
      title: "Significant weather and upper wind charts",
      blocks: [
        {
          t: "p",
          text: "For flight planning, the **World Area Forecast Centres (London and Washington)** send out forecast charts for the whole world, valid at fixed times (00, 06, 12 and 18 UTC). IMD also makes charts for the Indian region.",
        },
        {
          t: "list",
          items: [
            "**High level SIGWX (SWH)**: **FL250 to FL600**. **Medium level (SWM)**: FL100 to FL450. Low level charts cover the layers below.",
            "They show **jet streams** (with a core of **80 kt or more**) as a thick line with arrows, wind flags and the level (such as FL390). Two short bars across a jet show a 20 kt change in speed.",
            "**Tropopause heights** in small boxes, as flight levels.",
            "**CB areas** inside **scalloped lines**, with their amount (**OCNL** or **FRQ**) and **top over base** in flight levels. **XXX** means the base or top is outside the chart's levels.",
            "**A CB on a SIGWX chart means thunderstorms, moderate or severe turbulence, moderate or severe icing and hail**, even though these are not drawn separately.",
            "Areas of **CAT** (dashed lines), moderate or severe icing and turbulence symbols, tropical cyclones, volcanoes, radioactive release and surface fronts.",
            "All heights on these charts are **flight levels (above MSL)**, unlike METAR cloud bases, which are above the aerodrome.",
          ],
        },
        {
          t: "flag",
          text: "Older books and exam questions give the high level chart as **FL250 to FL630** and use **ISOL EMBD CB**. Since the WAFS changes of 2024 and 2025 the chart goes to **FL600** and shows only OCNL and FRQ CB.",
        },
        {
          t: "list",
          items: [
            "**Wind and temperature charts** show forecast winds as barbs and temperatures for standard flight levels such as FL050, FL100, FL180, FL240, FL300, FL340 and FL390. At high levels **temperatures are minus unless marked plus**.",
            "Choose the chart valid nearest to your flight time and the level nearest your cruise.",
          ],
        },
      ],
    },
    {
      id: "docs",
      title: "Flight forecasts, briefing and broadcasts",
      blocks: [
        {
          t: "list",
          items: [
            "**Forecast for take-off**: wind, temperature and QNH for the runway, prepared **within 3 hours before the expected departure**. IMD issues take-off data every 3 hours.",
            "**Route forecasts**: in India, **MET-T4** is a **chart** form for flights over **500 nm**, **MET-T3** a **table** form for flights of 500 nm or less. They give upper winds, temperatures, significant weather, cloud and the freezing level along the route.",
            "**Flight documentation** for a flight includes the TAFs for departure, destination and alternates, SIGWX and wind and temperature charts, SIGMETs and route forecasts. Upper wind and significant weather are given **not later than 3 hours** before departure.",
            "**ATIS** (automatic terminal information service): a recorded **VHF** broadcast at busy airports giving the latest weather, the runway in use, the type of approach and other information. Each version has a **letter** (information Alpha, Bravo...) and is updated every half hour or when anything important changes. Tell ATC the letter on first contact. ATIS wind, like all ATC wind, is in degrees **magnetic**.",
            "**VOLMET**: a broadcast of **METARs, TAFs and SIGMETs** for a list of airports, for aircraft in flight. **HF VOLMET** stations each have a **5 minute** slot every half hour for long range flights. India's short 9 hour TAF is the one used on VOLMET. **D-VOLMET** sends the same by data link.",
          ],
        },
        {
          t: "flag",
          text: "Older books describe coded route and area forecasts called **ROFOR** and **ARFOR (AIRFOR)**. These codes are no longer used. Route forecasts now come as charts and tables.",
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
            "METAR order: **type, station, time, wind, visibility, RVR, weather, cloud, temperature/dew point, QNH, supplementary, trend**.",
            "India: METAR **every half hour**. **SPECI not issued since 2015**. Visibility is the **lowest**.",
            "Wind: **true**, 10 minute mean. Gusts when **10 kt or more** above the mean. **dddVddd**: 60° to 180° and 3 kt or more. **VRB**: under 3 kt, or 180° or more. **00000KT** calm. **P99KT**: 100 kt or more.",
            "Visibility steps: **50 m below 800 m, 100 m to 5 km, 1 km to 10 km, 9999 = 10 km or more**.",
            "RVR when visibility or RVR **below 1,500 m**. Steps **25, 50, 100 m**. **P2000, M0050**. **U, D, N** tendency.",
            "**FG below 1,000 m. BR 1,000 to 5,000 m.** BR, HZ, FU, DU, SA only when visibility 5,000 m or less.",
            "FEW 1 to 2, SCT 3 to 4, BKN 5 to 7, OVC 8 oktas. Only **CB and TCU** named. Heights **above the aerodrome**.",
            "**CAVOK**: 10 km or more, no cloud below **5,000 ft** or MSA, **no CB or TCU**, no significant weather. **All** together.",
            "Temperature: .5 rounds **up** (+2.5 = 03, -3.5 = M03). QNH rounds **down** (1002.6 = Q1002).",
            "Windshear in METAR: **WS R27** or **WS ALL RWY**, supplementary information.",
            "**TREND = landing forecast, 2 hours**. NOSIG, BECMG, TEMPO, with FM, TL, AT. Midnight start **FM0000**, end **TL2400**. NSW ends the weather.",
            "SPECI criteria: visibility **800, 1,500, 3,000, 5,000 m**. RVR **150, 350, 600, 800 m**. Cloud BKN/OVC **100, 200, 500, 1,000, 1,500 ft**. Wind 60° or 10 kt. Temperature **up 2 °C**.",
            "TAF India: **9 h every 3 h** (domestic), **30 h every 6 h** (international). No QNH, no RVR.",
            "**FM** rapid and complete. **BECMG** gradual, **2 h normally, 4 h at most**. **TEMPO** each under 1 h, total under half. **PROB30/40** only.",
            "**SIGMET**: severe en route weather, **valid 4 h** (TC and VA **6 h**). Issued when needed by **Mumbai, Delhi, Kolkata, Chennai** MWOs.",
            "SIGMET for TS only if **OBSC, EMBD, FRQ or SQL**. ISOL under 50%, OCNL 50 to 75%, FRQ over 75%.",
            "**No AIRMET or GAMET in India**. Local area forecast: 100 nm, 8 h.",
            "**Aerodrome warning**: local only, up to **4 h**, wind **30 kt** or more, TS, hail, squall, dust. **Light aircraft warning: 17 kt** or more.",
            "Windshear warning: up to **1,600 ft (500 m)**.",
            "SIGWX: high **FL250 to FL600** (old FL630), jets **80 kt** or more, **CB implies TS, turbulence, icing and hail**. Heights are flight levels.",
            "Take-off forecast **within 3 hours** of departure. Route forecasts **MET-T4** (chart, over 500 nm) and **MET-T3** (table).",
            "**ATIS**: VHF, lettered, magnetic wind. **VOLMET**: METAR, TAF, SIGMET, HF slots of 5 minutes every half hour.",
          ],
        },
      ],
    },
  ],
  slides: [
    { title: "The messages", points: ["**METAR**: observed, every half hour", "**TAF**: aerodrome forecast", "**SIGMET**: severe weather en route", "Warnings, charts, ATIS, VOLMET"] },
    { title: "METAR order", points: ["Station, time, **wind**, **visibility**, RVR", "**Weather**, **cloud**", "Temperature/dew point, **QNH**", "Supplementary, then **TREND**"], figure: "metar" },
    { title: "Wind and visibility", points: ["Wind **true**, 10 min mean, gusts 10 kt over", "**VRB** under 3 kt, **dddVddd** for 60° to 180°", "Visibility steps **50 m, 100 m, 1 km**, 9999", "India reports the **lowest** visibility"] },
    { title: "RVR", points: ["Below **1,500 m** visibility or RVR", "Steps **25, 50, 100 m**", "**P2000**, **M0050**", "**U**p, **D**own, **N**o change"] },
    { title: "Weather and cloud", points: ["**- light, + heavy, VC** near", "**FG** under 1 km, **BR** 1 to 5 km", "FEW, SCT, BKN, OVC: **1-2, 3-4, 5-7, 8**", "Only **CB and TCU** named"] },
    { title: "CAVOK and rounding", points: ["**10 km**, no cloud below **5,000 ft**, no CB, no weather", "All four together", "Temperature: .5 rounds **up**", "QNH rounds **down**"] },
    { title: "TREND", points: ["**Landing forecast, 2 hours**", "NOSIG, BECMG, TEMPO", "FM, TL, AT. **FM0000, TL2400**", "NSW: weather ends"] },
    { title: "Special reports", points: ["India: **no SPECI since 2015**", "Visibility **800, 1,500, 3,000, 5,000 m**", "RVR **150, 350, 600, 800 m**", "Cloud **100, 200, 500, 1,000, 1,500 ft**"] },
    { title: "TAF", points: ["Short: **9 h, every 3 h**", "Long: **30 h, every 6 h**", "No QNH, no RVR", "1500/1524: to midnight"] },
    { title: "Change groups", points: ["**FM**: rapid, replaces all", "**BECMG**: gradual, 2 h, max 4 h", "**TEMPO**: each under 1 h, under half", "**PROB30, PROB40**"], figure: "tafline" },
    { title: "SIGMET", points: ["Severe weather **en route**", "Valid **4 h**, TC and VA **6 h**", "TS only if **OBSC, EMBD, FRQ, SQL**", "Four MWOs: Mumbai, Delhi, Kolkata, Chennai"] },
    { title: "Low level and warnings", points: ["**No AIRMET or GAMET** in India", "Area forecast: **100 nm, 8 h**", "Aerodrome warning: **4 h**, local, wind **30 kt**", "Light aircraft: **17 kt**. Windshear: to **1,600 ft**"] },
    { title: "SIGWX charts", points: ["High: **FL250 to FL600**", "Jets **80 kt** or more, tropopause boxes", "**CB means TS, turbulence, icing, hail**", "Heights are **flight levels**"] },
    { title: "Briefing and broadcasts", points: ["Take-off forecast **within 3 h**", "**MET-T4** chart, **MET-T3** table", "**ATIS**: VHF, lettered, magnetic wind", "**VOLMET**: METAR, TAF, SIGMET on HF"] },
  ],
  mcqs: [
    { id: "m14-01", q: "In India, METARs are issued:", options: ["Every hour", "Every 3 hours", "Every half hour", "Only when the weather changes"], answer: 2, why: "IMD issues METARs half hourly. That is why SPECIs were stopped in 2015." },
    { id: "m14-02", q: "In the METAR group 24012G24KT, the wind is:", options: ["240° true, 12 kt, gusting 24 kt", "240° magnetic, 12 kt, gusting 24 kt", "120° true, 24 kt", "240° true, 24 kt, lulls of 12 kt"], answer: 0, why: "Direction (true), mean speed, G and the gust speed, then KT." },
    { id: "m14-03", q: "In a METAR, gusts are reported when the maximum wind exceeds the mean by:", options: ["5 kt or more", "10 kt or more", "15 kt or more", "20 kt or more"], answer: 1, why: "A gust group is added when the highest speed in the last 10 minutes is 10 kt or more above the mean." },
    { id: "m14-04", q: "The METAR group 31015KT 270V350 means:", options: ["Wind 310° 15 kt, varying between 270° and 350°", "Wind 270° to 350° at 15 kt with a calm", "Visibility 270 m to 350 m", "Wind from 350° backing to 270°"], answer: 0, why: "The V group gives the two extreme directions, clockwise, when the direction varies by 60° or more but less than 180°." },
    { id: "m14-05", q: "Wind is reported as VRB in a METAR when the mean speed is:", options: ["Less than 3 kt, or the direction varies by 180° or more", "More than 10 kt", "Exactly 5 kt", "Gusting over 25 kt"], answer: 0, why: "VRB is for light winds with a varying direction, or any speed when the direction swings 180° or more, as in a passing thunderstorm." },
    { id: "m14-06", q: "A wind of 105 kt would appear in a METAR as:", options: ["270105KT", "270P99KT", "27099KT", "270/105KT"], answer: 1, why: "Speeds of 100 kt or more are shown as P99KT." },
    { id: "m14-07", q: "In a METAR, visibility below 800 m is reported in steps of:", options: ["25 m", "50 m", "100 m", "1,000 m"], answer: 1, why: "50 m below 800 m, 100 m from 800 m to 5 km, 1 km from 5 to 10 km." },
    { id: "m14-08", q: "Visibility between 800 m and 5,000 m is reported in steps of:", options: ["50 m", "100 m", "500 m", "1,000 m"], answer: 1, why: "100 m steps from 800 m up to 5 km." },
    { id: "m14-09", q: "The visibility group 9999 means:", options: ["9,999 m exactly", "Visibility not measured", "10 km or more", "Between 9 and 10 km"], answer: 2, why: "9999 is used for any visibility of 10 km or more." },
    { id: "m14-10", q: "RVR groups appear in a METAR when:", options: ["Visibility or RVR is below 1,500 m", "Visibility is below 5,000 m", "It is night", "There is rain"], answer: 0, why: "RVR is reported when the visibility or the RVR is less than 1,500 m." },
    { id: "m14-11", q: "RVR values below 400 m are reported in steps of:", options: ["10 m", "25 m", "50 m", "100 m"], answer: 1, why: "25 m below 400 m, 50 m from 400 to 800 m and 100 m above 800 m." },
    { id: "m14-12", q: "The METAR group R28/P2000 means:", options: ["RVR on runway 28 is more than 2,000 m", "RVR on runway 28 is less than 2,000 m", "Pressure on runway 28 is 2000", "Runway 28 is closed until 2000 UTC"], answer: 0, why: "P stands for plus: more than the highest value the system can give. M would mean less than the lowest." },
    { id: "m14-13", q: "In the METAR group R09/0450D, the letter D means:", options: ["Daylight", "Dry runway", "The RVR has been going down", "Dense fog"], answer: 2, why: "U, D and N show whether RVR went up, down or did not change over the last 10 minutes." },
    { id: "m14-14", q: "In a METAR, FG is used when the visibility is:", options: ["Less than 1,000 m", "1,000 to 5,000 m", "Less than 5,000 m in haze", "Less than 200 m only"], answer: 0, why: "Fog is reported when the obscuration brings visibility below 1,000 m. Mist (BR) is 1,000 to 5,000 m." },
    { id: "m14-15", q: "In a METAR, BR (mist) is reported when the visibility is:", options: ["Below 1,000 m", "1,000 m to 5,000 m", "More than 10 km", "Below 200 m"], answer: 1, why: "Mist is wet obscuration from 1,000 m to 5,000 m." },
    { id: "m14-16", q: "The weather group +TSRA means:", options: ["Light thunderstorm", "Thunderstorm with heavy rain", "Rain after a thunderstorm", "Thunderstorm in the vicinity"], answer: 1, why: "+ means heavy, TS thunderstorm, RA rain." },
    { id: "m14-17", q: "The weather group VCTS means:", options: ["Very cold thunderstorm", "Thunderstorm at the aerodrome", "Thunderstorm in the vicinity, not at the aerodrome", "Violent thunderstorm"], answer: 2, why: "VC means near the aerodrome (within about 8 km) but not at it." },
    { id: "m14-18", q: "RETSRA in a METAR means:", options: ["Thunderstorm with rain forecast", "Thunderstorm with rain in the last hour but not now", "Rain expected to turn into a thunderstorm", "Thunderstorm repeated"], answer: 1, why: "RE is recent weather: seen since the last report but not at the time of observation." },
    { id: "m14-19", q: "The cloud group BKN015 means:", options: ["1 to 2 oktas at 150 ft", "5 to 7 oktas with base 1,500 ft above the aerodrome", "8 oktas at 15,000 ft", "3 to 4 oktas at 1,500 ft above MSL"], answer: 1, why: "BKN is 5 to 7 oktas and heights are in hundreds of feet above the aerodrome." },
    { id: "m14-20", q: "In a METAR, the only cloud types named are:", options: ["Ci and Cs", "St and Sc", "CB and TCU", "As and Ns"], answer: 2, why: "Only the convective clouds that matter most, CB and towering cumulus, are named." },
    { id: "m14-21", q: "CAVOK may be used when:", options: ["Any one of the CAVOK conditions is met", "Visibility is 10 km or more, there is no cloud below 5,000 ft or the highest MSA, no CB or TCU and no significant weather, all together", "Visibility is 5 km or more", "There is no rain"], answer: 1, why: "All the conditions must be met at the same time." },
    { id: "m14-22", q: "A temperature of +2.5 °C is reported in a METAR as:", options: ["02", "2.5", "03", "M03"], answer: 2, why: "Half degrees are rounded up, so +2.5 becomes 03." },
    { id: "m14-23", q: "A temperature of -12 °C is reported in a METAR as:", options: ["-12", "M12", "12M", "N12"], answer: 1, why: "M stands for minus." },
    { id: "m14-24", q: "A QNH of 1002.8 hPa is reported in a METAR as:", options: ["Q1003", "Q1002.8", "Q1002", "Q0028"], answer: 2, why: "QNH is always rounded down to the whole hectopascal, so it errs on the safe side." },
    { id: "m14-25", q: "Low level windshear is reported in a METAR:", options: ["In the wind group", "As supplementary information, such as WS R27", "Only in the TAF", "Only on ATIS"], answer: 1, why: "It goes after the QNH as supplementary information: WS R27 or WS ALL RWY." },
    { id: "m14-26", q: "The TREND forecast added to a METAR is valid for:", options: ["30 minutes", "1 hour", "2 hours", "9 hours"], answer: 2, why: "The TREND is the landing forecast for the 2 hours after the report time." },
    { id: "m14-27", q: "In a TREND, NOSIG means:", options: ["No signal from the station", "No significant change expected in the next 2 hours", "No significant weather now", "Not signed by the forecaster"], answer: 1, why: "NOSIG tells you the report should still hold for the 2 hour trend period." },
    { id: "m14-28", q: "In a TREND forecast, a change expected to begin at midnight UTC is shown as:", options: ["FM2400", "FM0000", "TL0000", "AT2400"], answer: 1, why: "A start at midnight is FM0000. An end at midnight is TL2400." },
    { id: "m14-29", q: "SPECI reports have not been issued in India since 2015 because:", options: ["India now issues METARs every half hour", "SPECI were replaced by TAF", "ICAO banned them", "All airports became automatic"], answer: 0, why: "With half hourly METARs, the extra SPECI was no longer needed. Local special reports still use the SPECI criteria." },
    { id: "m14-30", q: "By the SPECI criteria, a special report is made when the visibility passes:", options: ["800, 1,500, 3,000 or 5,000 m", "100, 200, 300 or 400 m", "1, 2, 3 or 4 km", "2,000 or 8,000 m"], answer: 0, why: "These are the visibility thresholds used for special reports and TAF changes." },
    { id: "m14-31", q: "By the SPECI criteria, a special report is made when the base of the lowest BKN or OVC cloud passes:", options: ["1,000, 2,000 and 5,000 ft", "5,000 ft only", "50 and 150 ft only", "100, 200, 500, 1,000 or 1,500 ft"], answer: 3, why: "30, 60, 150, 300 and 450 m, which are 100, 200, 500, 1,000 and 1,500 ft." },
    { id: "m14-32", q: "By the SPECI criteria used in India, a special report is also made when the surface temperature rises by:", options: ["2 °C or more", "1 °C or more", "4 °C or more", "10 °C or more"], answer: 0, why: "A rise of 2 °C or more is a criterion, as it matters for aircraft performance." },
    { id: "m14-33", q: "In India, a TAF for domestic flights is valid for:", options: ["6 hours and issued every 6 hours", "24 hours and issued every 12 hours", "9 hours and issued every 3 hours", "30 hours and issued every 3 hours"], answer: 2, why: "The short TAF is valid 9 hours and issued every 3 hours. The long TAF for international flights is valid 30 hours and issued every 6 hours." },
    { id: "m14-34", q: "The TAF validity group 1500/1509 means the TAF is valid:", options: ["From 1500 UTC to 0900 UTC", "For 15 hours from 0900 UTC", "Issued on the 15th at 0000 UTC", "From the 15th at 0000 UTC to the 15th at 0900 UTC"], answer: 3, why: "Each half is day then hour: 15th 00 UTC to 15th 09 UTC." },
    { id: "m14-35", q: "Which item is NOT included in a TAF?", options: ["Surface wind", "Visibility", "Cloud", "QNH"], answer: 3, why: "A TAF has no QNH, no RVR and no temperature and dew point group." },
    { id: "m14-36", q: "In a TAF, FM101500 means:", options: ["From the 10th at 1500 UTC, a rapid change after which the new forecast replaces everything before", "A gradual change over 15 hours", "Temporary changes from 10 to 15 UTC", "Probability of 10 to 15%"], answer: 0, why: "FM gives day, hour and minutes, and starts a complete new forecast." },
    { id: "m14-37", q: "In a TAF, BECMG 1410/1412 means:", options: ["Temporary changes between 10 and 12 UTC on the 14th", "Conditions from 1410 UTC exactly", "A gradual, lasting change some time between 1000 and 1200 UTC on the 14th", "A 40% chance between 10 and 12 UTC"], answer: 2, why: "BECMG is a lasting change during the period. After 1200 UTC the new conditions hold." },
    { id: "m14-38", q: "A BECMG period in a TAF should normally not exceed 2 hours and must never exceed:", options: ["3 hours", "9 hours", "6 hours", "4 hours"], answer: 3, why: "The change period is normally 2 hours or less and never more than 4 hours." },
    { id: "m14-39", q: "In a TAF, TEMPO means changes that:", options: ["Last less than an hour each and less than half the period in total", "Last more than an hour each", "Are permanent", "Have a 50% chance"], answer: 0, why: "TEMPO is for short fluctuations, after which the main forecast conditions return." },
    { id: "m14-40", q: "The probability groups allowed in a TAF are:", options: ["PROB10 and PROB20", "PROB50 and PROB60", "PROB30 and PROB40", "Any value from 10 to 90"], answer: 2, why: "Only 30% and 40% are used. Anything 50% or more goes in the main forecast or a change group." },
    { id: "m14-41", q: "A SIGMET is issued for:", options: ["Moderate turbulence below FL100", "Wind over 17 kt for light aircraft", "Light rain at an aerodrome", "Severe turbulence, severe icing, frequent or embedded thunderstorms, cyclones and volcanic ash en route"], answer: 3, why: "SIGMETs warn all aircraft of severe en route weather. Lesser hazards are not SIGMET items." },
    { id: "m14-42", q: "A SIGMET for severe turbulence is valid for not more than:", options: ["2 hours", "12 hours", "6 hours", "4 hours"], answer: 3, why: "SIGMETs are valid for up to 4 hours, except for tropical cyclones and volcanic ash, which can be valid for 6 hours." },
    { id: "m14-43", q: "SIGMETs in India are issued by the Meteorological Watch Offices at:", options: ["Every airport", "Bengaluru and Hyderabad", "Pune only", "Mumbai, Delhi, Kolkata and Chennai"], answer: 3, why: "Each of the four MWOs watches its own FIR and issues SIGMETs for it." },
    { id: "m14-44", q: "Frequent thunderstorms (FRQ TS) means thunderstorms covering:", options: ["Less than 50% of the area", "50 to 75% of the area", "More than 75% of the area, with little or no gap between them", "One single storm"], answer: 2, why: "ISOL is under 50%, OCNL 50 to 75% and FRQ over 75%." },
    { id: "m14-45", q: "In India, AIRMET information:", options: ["Is issued every hour", "Is only for helicopters", "Replaces SIGMET", "Is not provided"], answer: 3, why: "AIP India lists AIRMET as not provided. A local area forecast for the aerodrome and 100 nm is issued instead." },
    { id: "m14-46", q: "An aerodrome warning is issued for:", options: ["Weather that may affect aircraft on the ground, parked aircraft and airport facilities", "Severe turbulence at FL350", "Volcanic ash en route", "Changes in the TAF"], answer: 0, why: "Aerodrome warnings are local warnings for the airport, for example of a thunderstorm, squall, hail or strong wind." },
    { id: "m14-47", q: "A thunderstorm is forecast to reach the airfield within the hour. The aerodrome Met office should issue:", options: ["A SIGMET", "An area forecast", "An aerodrome warning", "A route forecast"], answer: 2, why: "A thunderstorm is a ground hazard at the airfield, covered by an aerodrome warning. A SIGMET is for en route weather." },
    { id: "m14-48", q: "In India, an aerodrome warning is valid for not more than:", options: ["1 hour", "24 hours", "9 hours", "4 hours"], answer: 3, why: "It is issued half an hour to an hour ahead and kept short, not more than 4 hours, and reissued if needed." },
    { id: "m14-49", q: "In India, a warning for light aircraft is issued when the surface wind is expected to reach:", options: ["10 kt or more", "50 kt or more", "30 kt or more", "17 kt or more"], answer: 3, why: "Light aircraft are at risk at lower wind speeds, so their warning threshold is 17 kt." },
    { id: "m14-50", q: "On a SIGWX chart, a CB area implies:", options: ["Only rain", "Clear air turbulence only", "Fog", "Thunderstorms, moderate or severe turbulence, moderate or severe icing and hail"], answer: 3, why: "These hazards come with every CB, so they are not drawn separately." },
    { id: "m14-51", q: "On SIGWX charts, jet streams are shown when the core speed is at least:", options: ["40 kt", "60 kt", "80 kt", "120 kt"], answer: 2, why: "The charts show jets with a core of 80 kt or more." },
    { id: "m14-52", q: "Cloud heights on a significant weather chart are given:", options: ["Above the aerodrome", "In metres above ground", "Above the tropopause", "As flight levels, above MSL"], answer: 3, why: "SIGWX charts use flight levels. METAR and TAF cloud bases are above the aerodrome." },
    { id: "m14-53", q: "A forecast for take-off is prepared:", options: ["Within 3 hours before the expected time of departure", "24 hours before departure", "Only after take-off", "Within 12 hours before departure"], answer: 0, why: "It gives wind, temperature and QNH for the runway and must be fresh, so it is prepared within 3 hours of departure." },
    { id: "m14-54", q: "In India, the route forecast in chart form for flights over 500 nm is called:", options: ["MET-T3", "GAMET", "ROFOR", "MET-T4"], answer: 3, why: "MET-T4 is pictorial, for long flights. MET-T3 is a table, for flights of 500 nm or less." },
    { id: "m14-55", q: "VOLMET is:", options: ["A recorded broadcast of METARs, TAFs and SIGMETs for aircraft in flight", "A Met instrument", "The ATIS for one airport only", "A volcanic ash warning"], answer: 0, why: "VOLMET broadcasts weather for a list of airports, on HF for long range flights and on VHF in some areas." },
    { id: "m14-56", q: "ATIS is:", options: ["A satellite picture", "A SIGMET for the FIR", "A route forecast", "A recorded VHF broadcast of the current airport information, identified by a letter"], answer: 3, why: "Pilots listen to ATIS before calling ATC and report the letter they have received." },
  ],
};
