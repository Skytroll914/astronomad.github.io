# AstroMind: Rimau, the Crew Wellbeing Copilot
### NASA Space Apps Challenge 2026 · Project Documentation

> **Challenge:** `[INSERT NASA SPACE APPS 2026 CHALLENGE NAME]`
> **Team:** `[TEAM NAME]` · `[MEMBER NAMES]`
> **Live prototype:** `https://astronomad.health` `[CONFIRM LINK]`
> **30-second demo video:** `[YOUTUBE LINK]` · **3–5 minute project video:** `[YOUTUBE LINK]`
> **Team poster:** `[ATTACH / LINK]`

**Alternative titles** (pick one):
- *AstroMind: Mission Control for the Mind*
- *Rimau: Catching Distress Before It Becomes Danger, From Orbit to Mars*

---

## Contents
1. [Project Title & Challenge Selection](#1-project-title--challenge-selection)
2. [High-Level Summary](#2-high-level-summary)
3. [Data Processing & Metric Thresholds](#3-data-processing--metric-thresholds)
4. [Future Work & Roadmap](#4-future-work--roadmap)
5. [Presentation Assets: 7-Slide Outline](#5-presentation-assets-7-slide-outline)
6. [References & Citations](#6-references--citations)
7. [Appendix A: Submission Checklist (8 items)](#appendix-a-submission-checklist-8-items)
8. [Appendix B: How We Address the 10 Judging Standards](#appendix-b-how-we-address-the-10-judging-standards)

---

## 1. Project Title & Challenge Selection

**Project name:** **AstroMind: Rimau, the Crew Wellbeing Copilot**

**Challenge:** `[INSERT NASA SPACE APPS 2026 CHALLENGE NAME]`

**One-line pitch:** *AstroMind turns the quiet signals of spaceflight (sleep, heart rhythm, voice, cabin air and a two-minute conversation) into early, private and explainable warnings, so astronauts get support days before stress becomes a mission risk.*

**Why it matters:** NASA lists behavioural health among the top human risks for long-duration exploration. On the ISS, help is a radio call away. On a Mars transit, with up to 22 minutes of one-way signal delay, the crew must notice and respond to psychological strain largely on their own. Astronauts are also selected for resilience and often under-report distress for fear of losing flight status. AstroMind is designed for exactly that gap.

---

## 2. High-Level Summary

AstroMind is a web-based monitoring and support system for astronaut mental and physical wellbeing. It combines **passive sensing** (wearable vitals, sleep, cabin environment, voice features, proximity), **active check-ins** (a short, open-ended daily conversation built on validated psychometric instruments) and **context** (schedule, workload, cabin events). It converts them into one simple, explainable status for each crew member: **Normal**, **Warning** or **Critical**.

Three role-based experiences share one data model:

| Role | What they see | Design principle |
|---|---|---|
| **Astronaut** (Personal tab) | One status card, readings grouped into Vitals, Mental state, Social, Sleep, and Cabin & safety, with 7 live vitals including hydration. Also a cabin remote, a sleep report that links each awakening to its environmental cause, and **Rimau**, the onboard AI assistant. | Simple at a glance, detail on demand ("Show details"). |
| **Astronaut** (Team tab) | Each crewmate's overall status, a mock CCTV layout, shared plans and gentle "check in on…" nudges. Tapping a crewmate shows their *physical* metrics only. | Look out for each other without exposing private mental-health data. |
| **Ground team** (flight director / flight surgeon) | A supervision dashboard that answers three questions first: **Who needs attention? Is anyone experiencing similar changes? What has changed since yesterday?** | Critical items first; the rule behind every status is visible. |

### The user experience
1. **Sign in** as an Astronaut (pick a crew member) or the Ground Team. A discreet developer link opens all views for demonstrations.
2. The astronaut sees **one status** and **one next action**: "Start winding down an hour earlier tonight", "Move to the shielded shelter now".
3. **Rimau** answers anything ("How fast is the station moving?", "Summarise my day"). If the astronaut sounds distressed, Rimau points to the daily check-in. Crisis language immediately surfaces the **Alert crew & ground** button.
4. A slow-pulsing button opens the **Daily check-in with Rimau**:
   - 4 open questions, adapted from PSS-4 (stress), PHQ-9 (mood), GAD-7 (anxiety) and isolated-confined-extreme (ICE) crew items.
   - Each answer is checked for scope ("Invalid answer, please try again." for off-task input) and receives a short supportive note that takes live vitals into account.
   - A final report estimates stress, anxiety, depression and isolation levels, cross-checked against physiology.
5. The **flight surgeon** receives the full report; the **flight director** sees only the overall colour. The astronaut is told this up front.
6. The **ground dashboard** spots individual decline, crew-wide patterns (for example, a CO₂ scrubber fault slowing everyone's reactions) and day-over-day improvements or deteriorations.

### What makes it different
- **Each person is their own reference:** readings are compared with the astronaut's own pre-flight baseline (standard-deviation units), not population averages.
- **Context before alarm:** before flagging a reading, every sudden change is checked against schedule, activity and cabin events ("expected: spacewalk", "crew-wide: CO₂ fault", or "unexplained").
- **Privacy by design:** crewmates see physical status only, psychological detail goes to the flight surgeon only, and Rimau's chat is never used for assessment.
- **Built for the Mars delay:** the design assumes an **onboard** language model, so support keeps working through blackouts and 3–22-minute light-time delays (simulated in the app's Mars transit mode).
- **Honest labelling:** every value is tagged *Simulated*, *Self-reported*, *Estimated*, *AI-estimated* or *Source-backed*, and every threshold is tagged *Source-backed* or *Demo rule*.

---

## 3. Data Processing & Metric Thresholds

### 3.1 Every metric we track

All crew data in the prototype is **simulated** for six fictional crew members across a 120-day mission, with 45 days of pre-flight baseline. Sleep is calibrated to published ISS averages: 6.41 h before flight and 6.09 h in flight (Barger 2014).

#### A. Personal readings scored against the astronaut's own baseline (SD model)
| Domain | Metric | Unit | Source | Direction |
|---|---|---|---|---|
| Attention | Reaction time | ms | Cognitive test | Higher is worse |
| Attention | Working memory score | % | Cognitive test | Lower is worse |
| Mood | Mood rating | /10 | Daily self-rating | Lower is worse |
| Mood | Stress rating | /10 | Daily self-rating | Higher is worse |
| Mood | Irritability rating | /10 | Daily self-rating | Higher is worse |
| Sleep | Sleep efficiency | % | Wearable | Lower is worse |
| Body | Heart-rate variability (HRV) | ms | Wearable | Lower is worse |
| Body | Resting heart rate | bpm | Wearable | Higher is worse |
| Social & voice | Time with crew | min/day | Proximity badge | Lower is worse |
| Social & voice | Speech rate | words/min | Voice (radio calls, content never analysed) | Lower is worse |
| Social & voice | Voice pitch variability | Hz | Voice | Lower is worse |
| Social & voice | Pause length in speech | s | Voice | Higher is worse |

#### B. Readings with fixed thresholds
| Group | Metric | Unit |
|---|---|---|
| Sleep | Sleep duration (3-night average) | h |
| Schedule | Workload: duty hours in 7 days, and days since a full day off | h, days |
| Circadian | Body clock vs sleep window (estimated phase gap) | h |
| Vitals | Blood oxygen (SpO₂) | % |
| Vitals | Blood pressure | mmHg |
| Vitals | Respiratory rate | /min |
| Vitals | Core body temperature, plus day-night swing | °C |
| Vitals | Hydration level (share of personal target) | % |
| Cabin | Cabin temperature, sleep-station temperature | °C |
| Cabin | Cabin humidity | % |
| Cabin | Cabin CO₂ | mmHg |
| Cabin | Sleep-station noise | dBA |
| Cabin | Light before sleep | lux |
| Cabin | Cabin radiation dose rate, plus cumulative mission dose | µSv/h, mSv |

#### C. Event, behavioural and conversational signals
| Signal | Output |
|---|---|
| Daily check-in (4 open answers a day; all 16 protocol items every 4 days) | Stress, Depression/Mood, Anxiety and ICE/Crew subscales (0–12 each), total (0–48), red-flag items, change from personal baseline |
| Gradual decline ("early sign") | Two or more readings in one domain sliding together for 3 weeks |
| Sudden change | A single-day spike, classified as expected, environmental, crew-wide or unexplained |
| Crew pair contact (flight surgeon only) | Two crewmates avoiding each other |
| Reaction check (1-minute, 5-round tap test) | ms against the personal normal |
| Task readiness | Advice before critical tasks (docking, robotic arm, spacewalk, burn) |
| Sleep session | Timeline of the night with each awakening attributed to noise, CO₂, temperature, humidity, light or schedule |
| Alerts and reports | "Alert crew & ground" (with Mars delay), "Report how I feel" (8 symptom options, sharing level chosen by the astronaut) |
| Live vitals stream | Heart rate, HRV, SpO₂, blood pressure, respiratory rate, core temperature and hydration, updated every 1.5 s, with a 60-second trend |

### 3.2 Data flow: Input → Transformation → Output

```
INPUTS                          TRANSFORMATION LOGIC                                  OUTPUTS
──────────────────────────────  ────────────────────────────────────────────────────  ──────────────────────────────────
Wearable (HR, HRV, SpO2, BP,    1. Personal baseline: mean and SD of each metric over  Personal status card
 resp. rate, temp, hydration,      45 pre-flight days, per astronaut                    (Normal / Warning / Critical)
 sleep)                         2. Signed z-score: z = dir × (x − mean) / SD          + one next action
Cognitive tests (RT, memory)       (negative always means "worse than usual")
Daily ratings (mood, stress,    3. 7-day rolling mean of z, compared with ±SD lines    Grouped metric cards and
 irritability)                  4. Fixed thresholds for clinical and environmental     live vital tiles
Voice features (rate, pitch,       readings (NASA-STD-3001, clinical bands)
 pauses)                        5. Trend detector: 21-day slope plus 7-day level       Early-sign banners
Proximity badges                6. Sudden-change detector, then context engine         Event log (expected / not planned)
Cabin sensors (temp, RH, CO2,      (schedule, activity, cabin events, crew-wide?)
 noise, light, radiation)       7. Sleep investigator: links symptoms to causes        Sleep report and investigator
Schedule and activity record    8. Check-in pipeline: scope check → supportive note    Daily check-in report
Open-ended check-in answers        → AI estimate of subscales → protocol triage         (flight surgeon / director views)
Astronaut actions (alerts,         → vitals trigger-and-verify                          Ground dashboard: who needs
 reports, remote settings)      9. Status = worst level among scored readings          attention, similar changes,
                                   (stale or missing data excluded, never "Normal")     what changed since yesterday
```

#### Step by step

**① Baseline.** For every astronaut and every metric in table A, the system computes the mean (μ) and standard deviation (σ) of the 45 pre-flight days. Space agencies use the same approach: pre-flight milestones set each astronaut's reference.

**② Signed z-score.** Each daily reading becomes `z = dir × (x − μ) / σ`, where `dir = +1` if higher is better and `−1` if higher is worse. **Negative z always means worse than this person's normal**, so one rule works for every metric.

**③ Smoothing.** Status uses the **7-day average of z**, so one bad day does not trigger an alarm but a bad week does.

**④ Domain composites.** Metrics are averaged into five domains (Attention, Mood, Sleep, Body, Social & voice) and re-standardised. That feeds the trend view and the "early sign" logic.

**⑤ Trend ("early sign") detector.** A linear slope is fitted to the last 21 days of z. A reading is "sliding" when the slope is −0.07 SD/day or steeper **and** the 7-day level is already −1 SD or below. An early sign is raised only when **two readings in the same domain** slide together. In simulation, this cut false early signs on steady crew from 190 person-days to 10.

**⑥ Sudden-change detector and context engine.** A spike is logged when |z| ≥ 3.5 **and** it jumps ≥ 3 SD from the person's previous-week mean. It is then classified:
- **Crew-wide:** more than half the crew shifted ≥ 2 SD in the same direction. If a cabin event explains it (for example, the CO₂ scrubber fault), it is tagged *environmental*; otherwise *crew-wide, cause unknown*, and the habitat should be checked.
- **Individual:** explained by context (spacewalk, emergency drill, exercise, scheduled task) or **unexplained**, prompting the crew to ask how the person feels.

**⑦ Sleep investigator.** When an astronaut reports difficulty sleeping, fatigue or poor focus, the system checks the night's schedule, alarms, sleep-station temperature, CO₂, light exposure and body-clock gap, and returns *what happened, why it matters, and what to check next*. The sleep report shows the whole night with every awakening attributed to its environmental trigger.

**⑧ Daily check-in pipeline** (follows our *Astronaut Mental Health Assessment Protocol* and *Vitals-Based Assessment* guidance):
1. 16 protocol items (adapted PSS-4, PHQ-9 cognitive/affective items, GAD-7, ICE crew context), rewritten as **open, readiness-framed questions** to counter "right stuff" under-reporting.
2. 4 per day, one per subscale, rotating so all 16 are covered every 4 days.
3. **Scope check:** off-task input such as coding requests, trivia, abuse or prompt injection gets *"Invalid answer, please try again."* Emotionally relevant answers such as "I miss my wife" are **valid**, because isolation from family is a protocol item. Crisis language is **never rejected**: it surfaces the alert button.
4. **Per-answer note:** a 1–2-sentence supportive reflection that considers the live vitals and confounders.
5. **Final report:**
   - estimated subscale scores (0–12), weighting emotional and cognitive content above somatic symptoms, which microgravity causes in healthy crew;
   - red-flag items 5 (anhedonia), 6 (low mood) and 13 (social withdrawal);
   - the change from the personal baseline;
   - a **trigger-and-verify** statement: do the vitals support, contradict or not bear on what was said?
6. The report is labelled **"AI-estimated, not a validated score."** A scripted demo mode reproduces the flow without AI for presentations.

**⑨ Status aggregation.** The overall status is the **most severe level** among all scored readings. Readings older than 24 h become *Unavailable* and are excluded, so a missing sensor never looks "Normal". The check-in band is shown **alongside** vitals-based status, not merged into it, so physiology and self-report can verify each other.

### 3.3 Threshold logic: Normal, Warning, Critical

All thresholds live in a single object in the code (`THRESHOLDS`) and are displayed in the app's *About* tab, each tagged **Source-backed** or **Demo rule**.

#### Personal SD-baseline readings (table A)
| State | Rule (7-day average of signed z) |
|---|---|
| **Normal** | z > −2.0 SD |
| **Warning** | −3.0 SD < z ≤ −2.0 SD |
| **Critical** | z ≤ −3.0 SD |
| *Early sign (not a status)* | Two readings in one domain: 21-day slope ≤ −0.07 SD/day **and** 7-day level ≤ −1.0 SD |
| *Sudden change (event log)* | Daily \|z\| ≥ 3.5 **and** a ≥ 3 SD jump from the previous week |

*Basis: demo rule. No published cut-off exists for a personal baseline.*

#### Fixed-threshold readings
| Metric | Normal | Warning | Critical | Basis |
|---|---|---|---|---|
| Sleep duration (3-night average) | > 5.0 h | ≤ 5.0 h | ≤ 4.0 h | Demo rule informed by Jones 2022 and Barger 2014 |
| Workload | < 45 h/7 d and < 10 days without a day off | ≥ 45 h or ≥ 10 days | ≥ 55 h or ≥ 14 days | Demo rule; ISS standard is a 6.5 h workday |
| Body-clock gap | < 1.5 h | ≥ 1.5 h | ≥ 3.0 h | Demo model |
| SpO₂ | ≥ 95 % | 92–94 % | < 92 % | Standard clinical bands (demo rule) |
| Blood pressure | < 140/90 | ≥ 140/90 | ≥ 160/100 mmHg | Standard clinical bands (demo rule) |
| Respiratory rate | 12–20 /min | outside 12–20 | > 24 or < 10 /min | Standard clinical bands (demo rule) |
| Core temperature | 36.1–37.5 °C, day-night swing ≥ 0.35 °C | outside the range, **or** swing < 0.35 °C (flattened rhythm) | ≥ 38.5 °C | Demo rule informed by vitals research |
| Hydration | ≥ 90 % of target | 80–89 % | < 80 % | Demo rule |
| Cabin and sleep-station temperature | 20–25 °C | 18–20 or 25–27 °C | < 18 or > 27 °C | **NASA-STD-3001** |
| Cabin humidity | 30–60 % | 25–30 or 60–75 % | < 25 or > 75 % | **NASA-STD-3001** |
| Cabin CO₂ (daily average) | ≤ 3.0 mmHg | > 3.0 mmHg | > 5.3 mmHg | **NASA-STD-3001**, ISS operations |
| Sleep-station noise | ≤ 50 dBA | > 50 dBA | > 65 dBA | ISS sleep limit plus demo rule |
| Light before sleep | ≤ 150 lux | > 150 lux | n/a | Demo rule informed by NASA Fatigue Management guidance |
| Cabin radiation | < 40 µSv/h | ≥ 40 µSv/h | ≥ 100 µSv/h (shelter) | ISS range 0.2–0.5 mSv/day; NASA 250 mSv per-event limit; demo lines |
| Reaction check | > −2 SD | ≤ −2 SD slower | ≤ −3 SD slower | Demo rule |
| Crew pair contact | > 40 % of usual | ≤ 40 % of usual while both are normal with the rest of the crew | n/a | Demo rule (flight surgeon only) |
| Stale reading | < 24 h old | n/a | n/a | Shown as *Unavailable* after 24 h |

#### Daily check-in triage (from the protocol)
| Level | Subscale (0–12, demo mapping) | Overall (total 0–48) |
|---|---|---|
| **Green / Normal** | 0–4 | Total 0–11, **or** within +3 of personal baseline |
| **Yellow / Warning** | 5–7 | Total 12–21, **or** +4 to +7 from baseline |
| **Red / Critical** | 8–12 | Total ≥ 22, **or** ≥ +8 from baseline, **or** red-flag item 5, 6 or 13 rated ≥ 2, **or** crisis language |

Yellow triggers low-friction countermeasures: workload review, an extra family call, self-guided tools. Red triggers a confidential tele-psychology consultation offer from the flight surgeon.

#### Visual language
- **Normal:** green outline.
- **Warning:** solid yellow fill.
- **Critical:** solid red fill.

Every state also has its own **icon shape** and **word**, so the meaning never depends on colour alone (accessibility for colour-blind users).

---

## 4. Future Work & Roadmap

Our prototype proves the workflow. The roadmap turns it into a flight-grade system. The two architectural upgrades below are the core of our technical vision.

### ★ 4.1 Predictive Analysis Engine: from static baselines to learned expectations

**The problem with a static baseline.** Today each reading is compared with a frozen pre-flight mean and SD. But physiology in space *is supposed to change*:
- resting heart rate and blood pressure shift as fluids move towards the head;
- sleep shortens by roughly 20 minutes on average;
- heart-rate variability adapts as the cardiovascular system deconditions.

A static baseline treats normal adaptation as an anomaly early in flight, and can miss real anomalies hidden inside "expected" drift later on.

**The upgrade.** Each astronaut gets a **personal forecasting model** that learns how their body is adapting and predicts what each reading *should* be today, given everything known. The system then flags readings that **deviate from the prediction**, not from a fixed past.

**Technical design**
1. **Model family:** a per-astronaut **Bayesian structural time-series / state-space model**, updated online with a Kalman filter. That makes it lightweight enough for onboard hardware, works with missing data, and its components are explainable to a flight surgeon:
   - **Adaptation trend:** an exponential-approach curve per metric, capturing microgravity adaptation over the first weeks of flight.
   - **Rhythms:** circadian (24 h) and weekly work/rest seasonality.
   - **Exogenous drivers (known causes):** duty hours, sleep debt (already modelled in our simulation as debt carrying 90 % into the next day), exercise, EVA preparation, cabin CO₂, radiation events and light exposure.
2. **Cold start with hierarchical priors:** before an individual has enough in-flight data, parameters borrow strength from crew-level and historical priors, for example published ISS averages and analog-mission data. As personal data accumulates, the model becomes individual.
3. **Forecast and prediction interval:** each reading gets an expected value ŷ and a 95 %/99 % prediction interval. The anomaly score is the standardised residual `r = (y − ŷ) / σ_pred`.
4. **Drift detection on residuals:** EWMA and CUSUM charts catch *slow* departures that never cross a single-day line. This is the successor to today's 21-day slope rule.
5. **Forward-looking outputs:**
   - "Tomas's reaction time is forecast to fall below his safe range before tomorrow's 05:30 spacewalk unless he gets 7 h of sleep tonight."
   - Readiness forecasts for critical tasks.
   - "What-if" scenarios for schedule changes, such as moving a maintenance block or shifting a sleep window.
6. **Explainability:** every alert names the component responsible, for example "higher than predicted *after* accounting for workload and CO₂", so flight surgeons can trust it and act on it.
7. **Validation plan:**
   - Back-test on analog-mission datasets (NASA HERA, NEEMO, Antarctic overwintering).
   - Measure **lead time**, precision/recall and **false alarms per crew-week** against the current static-SD method.
   - Release only if it improves lead time without raising alert fatigue.

### ★ 4.2 Dual-Pronged Detection Architecture: personal and clinical safety nets

**Today.** Each metric uses *one* method. Behavioural and cognitive readings use the personal SD baseline. Vitals and the cabin use fixed clinical or engineering thresholds.

**The upgrade.** **Every** metric is evaluated by **both** tiers at once, and the final state is the more severe of the two.

| Tier | Question it answers | Method | Example it catches |
|---|---|---|---|
| **A. Personalised baseline shift** (relative anomaly) | *"Is this astronaut behaving differently from their usual self?"* | z-score against the personal baseline today, against the predictive model's expected value tomorrow (4.1). Tiers: ≤ −2 SD Warning, ≤ −3 SD Critical, with drift charts for slow change. | An astronaut whose SpO₂ is a "normal" 95 % but who usually runs at 99 %; a normally talkative crew member whose speech rate and time with crew are quietly falling. |
| **B. Absolute clinical thresholds** (safety net) | *"Is this astronaut showing a recognised medical danger sign, regardless of personal baseline?"* | Hard-coded limits from clinical standards and **NASA-STD-3001**: SpO₂ < 92 %, BP ≥ 160/100, core temperature ≥ 38.5 °C, hydration < 80 %, CO₂ > 5.3 mmHg, radiation ≥ 100 µSv/h, check-in red-flag items and crisis language. | **Creeping degradation:** a slow decline over weeks that a rolling baseline gradually "learns" as the new normal. Tier B never moves, so it always fires. |

**Decision logic**

```
final_state = max_severity( TierA(personal_or_predicted_deviation), TierB(clinical_limit) )
```

| Tier A ↓ / Tier B → | Normal | Warning | Critical |
|---|---|---|---|
| **Normal** | Normal | Warning (clinical) | **Critical (clinical)** |
| **Warning** | Warning (personal) | Warning (both) | **Critical** |
| **Critical** | **Critical (personal)** | **Critical** | **Critical (both)** |

**Engineering details**
- **Baseline anchoring:** Tier A keeps two references: the *original pre-flight baseline* (frozen) and the *adaptive baseline or forecast* (moving). If the adaptive reference drifts more than a set margin from the frozen one, the drift itself is reported, so slow decline cannot hide in either tier.
- **Every alert says which tier fired:** "different from **your** normal", "outside the **clinical** safe range", or both. This tells the flight surgeon whether to start a conversation or a medical protocol.
- **Confounder gating:** a Tier-A alert during a known cause (exercise, spacewalk, drill) is downgraded to *expected*. **Tier-B alerts are never suppressed.** A clinical danger sign is a danger sign whatever the reason.
- **Single source of truth:** both tiers stay in the one `THRESHOLDS` registry with source citations, so changes are auditable.

### 4.3 Further roadmap features

| # | Feature | Impact |
|---|---|---|
| 3 | **Onboard edge LLM:** a quantised open-weights model on spacecraft hardware replaces the cloud API, so Rimau and the check-in work through communication blackouts and Mars delay. | Autonomy for deep space. |
| 4 | **Real sensor integration:** ingest data from flight-proven wearables such as the CSA Bio-Monitor (Astroskin), plus ISS environmental telemetry from the **NASA OSDR Environmental Data App**. | Moves from simulated to real data. |
| 5 | **On-device voice prosody analysis:** pitch, rate and pauses from routine radio calls, computed locally so speech content is never stored or analysed. | Passive and private mood signal. |
| 6 | **Analog-mission validation study:** pilot with HERA, NEEMO or Antarctic crews; compare check-in estimates with administered PHQ-9 / GAD-7 / PSS. | Scientific validity. |
| 7 | **Countermeasure effectiveness loop:** track whether a suggested intervention (family call, lighting plan, workload change) actually improved readings, and personalise future suggestions. | Closes the loop from detection to outcome. |
| 8 | **Autonomous schedule co-pilot:** propose workload rebalancing and sleep-window shifts when forecasts predict fatigue before critical tasks. | Prevents errors and protects crew time. |
| 9 | **Flight surgeon console:** secure tele-psychology scheduling, case notes, consent ledger and encrypted data routing, aligned with medical privacy requirements. | Clinical workflow ready. |
| 10 | **Privacy-preserving federated learning:** improve shared models across missions and crews without pooling raw personal data. | Scales without exposing individuals. |
| 11 | **Multilingual and cross-cultural adaptation:** check-ins and Rimau in crew members' native languages, with culturally validated wording for international crews. | Inclusive for global partners. |
| 12 | **Family connection features:** time-zone-aware call scheduling around light-time delay, asynchronous video messages, care-package requests. | Targets isolation, a top protocol item. |
| 13 | **Restorative environments:** VR Earth-view and nature scenes, paired with the cabin lighting system, recommended when stress markers rise. | Evidence-informed countermeasure. |
| 14 | **Terrestrial spin-offs:** Antarctic stations, submarines, offshore rigs, mining camps, polar shipping and ICU or shift-work staff (all isolated, confined or high-strain). | Commercial pathway (see below). |

### 4.4 Commercialisation and scale
- **Space sector:** licence to agencies and commercial station operators (private LEO stations and lunar programmes) as a crew-health module.
- **Earth markets:** remote and isolated workforces share the same risks of isolation, sleep disruption, workload and under-reporting. A B2B SaaS model with per-crew-member pricing, plus an on-premise edition for sites without connectivity.
- **Regulatory path:** start as a *wellbeing and decision-support* tool. The clinical tier (4.2-B) and validation study (feature 6) prepare for a medical-device pathway where needed.

---

## 5. Presentation Assets: 7-Slide Outline

> Copy each block into Canva or PowerPoint. *Speaker notes* are in italics.

**Slide 1: Title**
- **AstroMind: Rimau, the Crew Wellbeing Copilot**
- Catching distress before it becomes danger, from orbit to Mars
- `[Team name]` · NASA Space Apps Challenge 2026 · `[Challenge name]`
- Visual: Rimau the tiger astronaut mascot
- *Notes: open with the question "Who checks on an astronaut 225 million kilometres from home?"*

**Slide 2: The Problem**
- Behavioural health is one of NASA's top risks for long-duration missions
- Mars means up to 22 minutes each way: no real-time therapist
- Astronauts under-report distress ("right stuff" culture)
- Spaceflight disguises the symptoms: fatigue and poor sleep are normal up there
- *Notes: the danger is the slow, quiet decline that nobody notices until performance slips.*

**Slide 3: Our Solution**
- One simple status per astronaut: Normal · Warning · Critical
- **Passive:** 7 live vitals, sleep, cabin air and radiation, voice, proximity
- **Active:** a 4-minute daily check-in with Rimau, built on PSS-4, PHQ-9 and GAD-7
- **Supportive:** Rimau, an onboard AI assistant, plus NASA-sourced countermeasures
- Three views: Astronaut · Team · Ground
- *Notes: show the Personal tab and the pulsing check-in button.*

**Slide 4: How It Works (Architecture)**
- Input: wearables, cognitive tests, ratings, voice, cabin sensors, schedule, open answers
- Engine: personal SD baseline → 7-day z-scores → trend and spike detection → context check → protocol triage
- Output: status, next action, sleep report, alerts, ground dashboard
- "Every alert shows the rule behind it"
- *Notes: diagram of Input → Transformation → Output from section 3.2.*

**Slide 5: Demo Highlights**
- Kenji: daily check-in → Red report → flight surgeon notified, privately
- CO₂ scrubber fault: the dashboard finds that the whole crew slowed down together and names the shared cause
- Solar particle event: every screen turns red, the CCTV shows the crew in the shelter
- A warm cabin at night → the sleep report links each awakening to temperature
- *Notes: play the 30-second demo clip here.*

**Slide 6: Future Vision**
- **Predictive Analysis Engine:** learns each astronaut's adapting physiology and flags deviations from the forecast
- **Dual-pronged detection:** "different from your normal" plus "clinically dangerous regardless"
- Onboard edge AI for Mars autonomy · real wearables (Bio-Monitor) · analog-mission validation
- Spin-offs: Antarctica, submarines, offshore, ICU shift workers
- *Notes: stress that creeping degradation is caught by the clinical safety net.*

**Slide 7: Impact & Thank You**
- Earlier detection · private by design · built on NASA standards and research
- Validity: NASA-STD-3001 limits, ISS sleep and radiation data, published psychometrics
- Ready for the Moon, Mars and Earth's most isolated workplaces
- `[Live link]` · `[QR code]` · `[Team contacts]`
- *Notes: end on Rimau: "No astronaut should have to cope alone."*

---

## 6. References & Citations

### 6.1 NASA and space agency resources (used in the prototype)
*These are cited inside the app's About tab next to the thresholds they support.*

| # | Resource | Used for |
|---|---|---|
| 1 | NASA-STD-3001 Technical Brief: Environmental Control and Life Support System. https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-002-eclss.pdf | Cabin temperature and humidity bands |
| 2 | NASA-STD-3001 Technical Brief: ECLSS Rev A (CO₂ and health limits). https://www.nasa.gov/wp-content/uploads/2023/07/eclss-technical-brief-ochmo.pdf | CO₂ limits |
| 3 | Law & Alexander, *CO₂ on the International Space Station: an operations update* (NASA NTRS). https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf | CO₂ operations context |
| 4 | NASA NTRS 20150021777: *CO₂ exposure limits and crew headaches*. https://ntrs.nasa.gov/api/citations/20150021777/downloads/20150021777.pdf | CO₂ symptoms |
| 5 | Goodman, *Acoustics in habitable space enclosures* (NASA NTRS 20090043801). https://ntrs.nasa.gov/api/citations/20090043801/downloads/20090043801.pdf | Sleep noise limit |
| 6 | Allen, *ISS acoustics overview with crew quarters levels* (NASA NTRS 20170011521). https://ntrs.nasa.gov/api/citations/20170011521/downloads/20170011521.pdf | Crew-quarters noise |
| 7 | NASA OCHMO Technical Brief: Radiation Protection (NASA-STD-3001). https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf | Radiation limits and shelter logic |
| 8 | Maida 2016, *Solid-state interior lighting system for ISS* (NASA NTRS). https://ntrs.nasa.gov/api/citations/20160005080/downloads/20160005080.pdf | Lighting modes |
| 9 | NASA Fatigue Management Services: lighting and night-glasses guidance for ISS crew quarters (NTRS). https://ntrs.nasa.gov/api/citations/20200011570/downloads/20200011570.pdf | Pre-sleep lighting plan |
| 10 | NASA Lighting Effects study: dynamic lighting schedule for the ISS (NTRS). https://ntrs.nasa.gov/api/citations/20160006727/downloads/20160006727.pdf | Body-clock model |
| 11 | NASA NTRS 20170000487: *Executing human research on the ISS* (6.5 h workday). https://ntrs.nasa.gov/api/citations/20170000487/downloads/20170000487.pdf | Workload standard |
| 12 | VanderArk et al., *Human behavior and performance support for ISS operations* (NASA NTRS 20100036824). https://ntrs.nasa.gov/citations/20100036824 | Psychological support countermeasures |
| 13 | Whitmire 2022, *Space Psychology* (NASA NTRS 20230010798). https://ntrs.nasa.gov/citations/20230010798 | Private conferences, care packages |
| 14 | NASA, *Counteracting bone and muscle loss in microgravity*. https://www.nasa.gov/missions/station/iss-research/astronaut-exercise | Exercise schedule |
| 15 | NASA station blog posts and ISS Daily Summary Reports (2018–2024) | Activity simulation: cargo, EVA preparation, off-duty |
| 16 | NASA Open Science Data Repository: Environmental Data App. https://visualization.osdr.nasa.gov/eda | Identified for real cabin telemetry (roadmap item 4) |
| 17 | ESA Columbus Control Centre blog: *The astronaut daily schedule*. https://outpost42.esa.int/blog/the-astronaut-daily-schedule/ | Sleep window and day template |
| 18 | ESA Mars Express blog: spacecraft event time vs Earth receive time. https://blogs.esa.int/mex/?p=257 | Mars light-time delay |
| 19 | `[ADD ANY OTHER NASA DATASET USED, e.g. OSDR / GeneLab / LSAH]` | |

### 6.2 Scientific literature
- Barger et al. 2014, *Lancet Neurology*: sleep before, during and after spaceflight. https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436
- Jones et al. 2022, *Sleep*: short sleep and reaction speed in 24 ISS astronauts. https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197
- Scott et al. 2023, *npj Microgravity*: exercise countermeasures in 46 astronauts. https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566
- Kanas, Gushin & Yusupova 2021: *Whither the third quarter phenomenon?*
- Carter et al. 2005: the Virtual Space Station, an interactive program for psychosocial problems on long-duration spaceflight.
- Standard psychometric instruments adapted (open-ended form, not scored by the user): **PSS-4/PSS-10** (Cohen), **PHQ-9** (Kroenke, Spitzer & Williams), **GAD-7** (Spitzer et al.), **PANAS** (Watson, Clark & Tellegen).
- Team research documents: *Astronaut Stress, Depression & Anxiety Assessment Protocol*; *Measuring Stress, Depression, and Anxiety Through Vital Signs*.
- `[ADD ANY FURTHER PAPERS]`

### 6.3 Use of Artificial Intelligence *(submission item 6)*
| Tool | How it is used |
|---|---|
| **Google Gemini API** | Powers Rimau (general assistant) and the daily check-in assessor: scope checking, supportive notes and the AI-estimated final report. Called through a server-side proxy so the API key never reaches the browser. Represents the *onboard* model in our design. |
| `[AI coding assistant, e.g. Claude Code]` | `[Describe: used to help write and refactor the web application code.]` |
| `[Image generation tool]` | `[Describe: e.g. the Rimau mascot and its animated GIF, if AI-generated.]` |

### 6.4 Open-source libraries, tools and APIs
| Component | Purpose |
|---|---|
| Vanilla HTML, CSS and JavaScript (no framework) | Front end and the full simulation engine run in the browser, with no build step |
| Python 3 standard library (`http.server`, `urllib`) | Local development server and AI endpoint (`dev_server.py`) |
| PHP + cURL (optional) | Alternative AI proxy for PHP hosting (`api/gemini.php`) |
| Google Fonts: *Baloo 2*, *Nunito Sans* (SIL Open Font License) | Typography |
| GitHub Pages / Porkbun (`astronomad.health`) | Hosting and domain |
| `[ADD ANY OTHER LIBRARY OR ASSET]` | |

### 6.5 Space agency partner and other data *(submission item 8)*
- ESA (Columbus Control Centre schedule data, Mars Express light-time data), see 6.1 #17–18.
- CSA Bio-Monitor (Astroskin) is identified as the target wearable for real-data integration (roadmap). `[ADD CITATION IF USED]`
- `[ADD JAXA / CSA / other partner datasets if used]`

> **Data disclaimer:** all crew members, readings and events in the prototype are simulated. Published NASA and ESA values are used as reference ranges, not as data about any real astronaut. AstroMind is a hackathon prototype, not a medical device, and is not a NASA product or endorsed by NASA.

---

## Appendix A: Submission Checklist (8 items)

| # | Required item | Where it lives | Status |
|---|---|---|---|
| 1 | Project name with **team poster** | Section 1; poster file | `[ ]` Poster |
| 2 | Project summary | Section 2 | ✅ |
| 3 | Project demonstration: **30-second video** (YouTube) | `[LINK]` | `[ ]` |
| 4 | Project: **3–5 minute video** of the solution (YouTube) + live link | `[LINK]` · astronomad.health | `[ ]` |
| 5 | Project details | Sections 3–4 | ✅ |
| 6 | Use of Artificial Intelligence | Section 6.3 | `[ ]` Confirm tools |
| 7 | NASA data, with citations | Section 6.1 | ✅ (+ add any extra datasets) |
| 8 | Space agency partner and other data, with citations | Section 6.5 | `[ ]` Confirm |

*All documents must be submitted as **PDF** via Google Drive, and the outline filled in on the NASA Space Apps website, between 14 and 15 November 2026.*

---

## Appendix B: How We Address the 10 Judging Standards

| # | Standard | Our evidence |
|---|---|---|
| 1 | Relevance to theme | Directly targets NASA's behavioural-health risk for long-duration and deep-space missions `[tie to the chosen challenge statement]`. |
| 2 | Originality | Personal-baseline SD scoring, context-aware spike classification, conversational psychometrics with trigger-and-verify vitals, and a Mars-ready onboard AI design. |
| 3 | Construction technique | A working, role-based web app with a 120-day multi-crew simulation engine, live vitals streaming, a protocol-driven AI pipeline, a secure key proxy and accessible, colour-independent status design. |
| 4 | Diversity of material used | Wearable, cognitive, self-report, voice, proximity, cabin-sensor, radiation, schedule and conversational data, plus NASA, ESA and peer-reviewed sources. |
| 5 | Demonstrated understanding | Somatic-vs-affective weighting, "right stuff" under-reporting, confounder handling (exercise, EVA, CO₂), circadian lighting, and an explicit split between demo rules and source-backed thresholds. |
| 6 | Degree of practicality | Every alert explains its rule; privacy by role; works offline by design; graceful handling of missing data. |
| 7 | Degree of commercialisation | Agency and commercial-station licensing plus terrestrial ICE markets (Section 4.4). |
| 8 | Materials submitted | This document, the live prototype, 30-second and 3–5 minute videos, the poster and the slide deck. |
| 9 | Presentation style | A 7-slide narrative (Section 5), the Rimau mascot, and a guided walkthrough built into the app's About tab. |
| 10 | Use of free NASA resources | 16+ NASA documents and datasets drive the thresholds and simulation (Section 6.1). |
