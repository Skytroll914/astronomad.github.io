# AstroNomad: Rimau, the Crew Wellbeing Copilot

A NASA Space Apps Challenge 2026 prototype for monitoring astronaut mental and physical wellbeing on long-duration missions.

AstroNomad turns the quiet signals of spaceflight (sleep, heart rhythm, cabin air, radiation and a short daily conversation) into one simple, explainable status for each crew member: **Normal**, **Warning** or **Critical**. Each reading is compared with the astronaut's *own* pre-flight normal, not a population average. Rimau, a tiger-astronaut AI companion, answers questions and runs a daily wellbeing check-in built on established psychological questionnaires.

> All crew data is **simulated** (six fictional crew members over a 120-day mission). This is a hackathon prototype, not a medical device, and not a NASA product or endorsed by NASA.

---

## Run it yourself in 2 minutes

You only need **Python 3.8 or newer**. No other installs, no build step.

```bash
git clone https://github.com/Skytroll914/astronomad.github.io.git
cd astronomad.github.io/site
python dev_server.py
```

Open **http://localhost:8000** in your browser.

That's it. Everything works without an API key **except** Rimau's live chat and the AI-scored check-in. The **▶ Demo check-in** button (bottom left) shows the full check-in experience with scripted replies, so you can try it with no key at all.

### Optional: turn on the live AI (Google Gemini)

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Start the server with the key set (the key stays in your terminal and is never saved to a file):

   **Windows (PowerShell)**
   ```powershell
   $env:GEMINI_API_KEY = "your-key"
   python dev_server.py
   ```
   **macOS / Linux**
   ```bash
   GEMINI_API_KEY="your-key" python dev_server.py
   ```
3. The terminal should print `Gemini key: found`.

If Google has renamed its models and you get a "model not available" error, set the model ids to try, in order:
`GEMINI_MODELS="your-model-id,another-model-id"`.

---

## A 3-minute tour

1. **Sign in.** Choose **Astronaut** (then pick a crew member), **Ground Team**, or the small **Developer: demo walkthrough** link, which opens every tab.
2. **Personal tab** (astronaut):
   - One status card and one next action.
   - Readings grouped into Vitals, Mental state, Social, Sleep, and Cabin & safety. Seven vitals stream live: heart rate, HRV, SpO₂, blood pressure, breathing, core temperature, hydration.
   - **Show details** reveals the rule behind every status.
   - The cabin remote and a sleep report that links each awakening to its cause (noise, CO₂, temperature).
   - **Rimau** on the right answers anything. Try "Summarise my day".
3. **Daily check-in:**
   - The slow-pulsing Rimau button at the bottom right opens 4 open questions from the protocol.
   - Off-topic answers get "Invalid answer, please try again."
   - At the end, a report estimates stress, anxiety, mood and isolation, checked against vitals.
   - No key? Use **▶ Demo check-in** (bottom left). It plays itself, with example answers.
4. **Team tab:** each crewmate's overall status. Click a card for their physical metrics; mental-health details stay private.
5. **Ground team tab:**
   - Answers **Who needs attention?**, **Is anyone experiencing similar changes?** and **What has changed since yesterday?**
   - Switch between *Flight director* and *Flight surgeon* to see how privacy changes what each role sees.
6. **Demo controls** (top of the page): move the mission day slider, or jump to scenes such as the *CO₂ fault* (day 55), *Solar particle event* (day 64) and *Spacewalk tomorrow* (day 92).
7. **About this demo:** the step-by-step walkthrough, every threshold with its source, and the scope.

### Shortcut links
These open a scene directly (a refresh without them returns to sign-in):

| Scene | Link |
|---|---|
| Kenji, declining (good for the check-in demo) | `http://localhost:8000/?as=astronaut&p=kenji&day=85` |
| Solar particle event, whole crew | `http://localhost:8000/?as=demo&view=team&day=64` |
| Ground dashboard as flight surgeon | `http://localhost:8000/?as=ground&day=85&role=surgeon` |
| Everything, with the walkthrough | `http://localhost:8000/?as=demo&view=about` |

Use **Demo controls → Clear reports, alerts, chats, check-ins and remote** to reset between runs. Demo entries are stored only in your browser.

---

## Hosting it online

| Option | Cost | Live AI? | How |
|---|---|---|---|
| **Static hosting** (GitHub Pages, Netlify, Cloudflare Pages) | Free | No: everything else works, including the scripted demo check-in | Publish the contents of the `site/` folder. |
| **PHP hosting** (most cPanel hosts) | Usually paid | Yes | Upload the contents of `site/` to `public_html`. Copy `site/gemini-config.sample.php` to `gemini-config.php`, paste your key in, and upload it **one folder above** `public_html`, so it can't be downloaded. `site/api/gemini.php` handles the calls. |
| **Your own computer** | Free | Yes | `python dev_server.py`, as above. |

**Never commit an API key.** `gemini-config.php` and `.env` are already in `.gitignore`.

---

## How it works (short version)

1. **Personal baseline:** for every astronaut and metric, the mean and standard deviation over 45 pre-flight days.
2. **Signed z-score:** each reading becomes `z = direction × (value − mean) / SD`, so negative always means "worse than usual".
3. **Status:** the 7-day average of z gives Warning at −2 SD and Critical at −3 SD. Vitals and the cabin use fixed clinical and NASA-STD-3001 limits. The overall status is the most severe reading.
4. **Early signs and spikes:**
   - Slow slides (two readings in one area, 3 weeks) are flagged before any line is crossed.
   - Sudden spikes are checked against schedule, activity and cabin events, then tagged *expected*, *environmental*, *crew-wide* or *unexplained*.
5. **Daily check-in:**
   - 16 items adapted from PSS-4, PHQ-9, GAD-7 and isolated-confined-extreme (ICE) crew items, asked 4 a day as open questions.
   - AI-estimated subscale scores with the protocol's Green / Yellow / Red triage and red-flag items.
   - A vitals check that confirms or contradicts what was said.

Full details, every threshold and the roadmap are in **[SPACE_APPS_DOCS.md](SPACE_APPS_DOCS.md)**. The research the check-in is built on is in [astronaut_mental_health_assessment_protocol.md](astronaut_mental_health_assessment_protocol.md) and [vitals_based_mental_health_assessment.md](vitals_based_mental_health_assessment.md).

---

## Project structure

```
site/                    The web app (publish this folder)
  index.html             Page shell
  dev_server.py          Local server + AI endpoint (Python standard library only)
  api/gemini.php         Alternative AI endpoint for PHP hosting
  gemini-config.sample.php
  css/                   styles.css (base), v3–v5.css (later features)
  js/
    pipeline.js          Crew simulation, personal baselines, z-scores, spike detection
    rules.js             Thresholds, sources, status rules, sleep investigator, event log
    extras.js            Workload, body clock, crew pairs, trends, readiness, self-help tools
    additions.js         Radiation, cabin remote, sleep sessions, CCTV positions, interventions
    vitals.js            Live vitals stream (HR, HRV, SpO2, BP, breathing, temperature, hydration)
    ai.js                AI client and safe markdown rendering
    rimau.js             Rimau, the general assistant
    assessment.js        Daily check-in: questions, scope check, report, scripted demo
    supervisor.js        Ground dashboard: attention, similar changes, what changed
    ui.js                Screens, sign-in, tabs and interactions
  assets/                Rimau mascot images
SPACE_APPS_DOCS.md       Submission documentation
index (1).html           The first single-file prototype, kept for reference
```

---

## Built with
- Plain HTML, CSS and JavaScript, with no framework or dependencies.
- Python 3 standard library, for the local server.
- Google Gemini API, standing in for an onboard AI model.
- Google Fonts: Baloo 2 and Nunito Sans.
- NASA and ESA public sources for thresholds and the simulation: NASA-STD-3001 technical briefs, NASA Technical Reports Server papers, ISS sleep and radiation research. The full list is in [SPACE_APPS_DOCS.md § References](SPACE_APPS_DOCS.md#6-references--citations) and the app's *About this demo* tab.
