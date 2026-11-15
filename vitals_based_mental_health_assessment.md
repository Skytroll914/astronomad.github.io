# Measuring Stress, Depression, and Anxiety Through Vital Signs

Vital signs cannot reliably diagnose stress, depression, or anxiety on their own. While physiological sensors can objectively detect **autonomic nervous system arousal** (which spikes during acute stress and anxiety) and **circadian or metabolic disruption** (which often accompanies depression), they suffer from a **specificity problem**: a racing heart or fragmented sleep looks identical on a sensor whether it is caused by panic, heavy exercise, dehydration, or microgravity adaptation.

## 1. What Vitals Can (and Cannot) Detect

* **Stress and Anxiety (High Sensitivity, Low Specificity):** Both activate the sympathetic nervous system ("fight-or-flight") and the hypothalamic-pituitary-adrenal (HPA) axis. This triggers immediate, measurable shifts in heart rate, heart rate variability (HRV), blood pressure, and blood glucose. However, sensors cannot determine *why* the sympathetic nervous system fired—an emergency spacewalk, a tense crew interaction, and a double espresso produce overlapping cardiovascular signatures.
* **Depression (Subtle, Longitudinal Shifts):** Depression rarely causes sudden vital spikes. Instead, it emerges over weeks as **autonomic blunting** (rigid, unresponsive heart rate variability), **flattened circadian rhythms** (core body temperature and cortisol losing their normal day-night amplitude), and disrupted sleep architecture.

## 2. How Specific Vitals Map to Mental Health

In an operational or spaceflight monitoring system, standard telemetry metrics react differently to acute arousal versus chronic mood disorders—and each carries environmental confounders that must be filtered out:

| Vital / Biomarker | Acute Stress & Anxiety | Depression (Chronic Pattern) | Spaceflight & Operational Confounders |
| :--- | :--- | :--- | :--- |
| **Heart Rate (HR) & HRV** | Elevated resting HR; sharp drop in **HRV** (reduced parasympathetic vagal tone) | Slightly elevated resting HR; chronically low, rigid HRV with poor overnight recovery | Microgravity cardiovascular deconditioning, resistive workouts, and fluid shifts |
| **Blood Pressure (BP)** | Transient spikes in systolic and diastolic BP due to vasoconstriction | Usually unchanged; occasional mild elevation from prolonged HPA-axis strain | Headward (cephalad) fluid shifts in weightlessness alter baseline arterial pressure |
| **Sleep Duration & Architecture** | Delayed sleep onset (insomnia) and frequent micro-awakenings | Fragmented sleep, early-morning waking, reduced deep slow-wave sleep, or oversleeping | 90-minute orbital sunrise/sunset cycles, cabin fan noise, and elevated cabin $\text{CO}_2$ |
| **Core Body Temperature** | Mild stress-induced temperature rise during acute episodes | **Flattened circadian curve** (warmer nocturnal baseline, blunted daytime peak) | Altered convective heat dissipation in microgravity; cooling garments during EVAs |
| **Blood Glucose** | Acute spikes as cortisol and adrenaline mobilize stored energy | Gradual trend toward mild insulin resistance during prolonged depressive episodes | Meal timing, caloric deficits, and spaceflight-induced changes in insulin sensitivity |
| **Electrodermal Activity (EDA) & Cortisol** *(Supplementary)* | Rapid skin-conductance spikes (micro-sweating); elevated salivary cortisol | Blunted skin-conductance reactivity (emotional flattening); flattened daily cortisol slope | Cabin humidity/temperature fluctuations and physical exertion sweating |

## 3. The Gold Standard: Multimodal "Trigger-and-Verify" Fusion

Because vitals alone cannot distinguish physical strain from psychological distress, modern aerospace and digital-phenotyping systems pair continuous vitals with subjective and behavioral data in a two-step loop:

1. **Passive Anomaly Detection (Vitals):** Software tracks a rolling 7-to-14-day personal baseline for each crew member. If an astronaut exhibits a sustained drop in overnight HRV, elevated resting heart rate, and shortened sleep *outside* of scheduled high-exertion tasks, the system flags an **autonomic recovery deficit**.
2. **Active Verification (Psychometrics & Behavior):** That physiological flag automatically prompts a brief subjective check-in (such as a rapid stress/mood questionnaire) and cross-references passive behavioral markers—such as flattened vocal pitch (prosody), slower reaction times on cognitive tasks, or reduced communication frequency—to separate routine physical fatigue from emerging anxiety or depression.