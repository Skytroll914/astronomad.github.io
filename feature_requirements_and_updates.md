# Proposed Changes and Additions

This document outlines the required features, UI/UX changes, and system architecture additions for the upcoming iteration of the astronaut dashboard application.

## 1. "Rimau" AI Chatbot Integration
*   **Core Purpose:** An empathetic, conversational AI assistant designed to monitor and assess the astronauts' mental health (detecting emotional distress, loneliness, depression, anxiety, and stress).
*   **Technology:** Powered by the **Gemini API**.
*   **Data Integration:** The chatbot must have contextual access to the user's physiological metrics (e.g., heart rate) and event logs to perform accurate reasoning and assessment.
*   **Conversational Tone:** Must avoid sounding like a clinical questionnaire. The interaction should feel natural, empathetic, and supportive.
*   **Actionable Advice:** Upon assessment, Rimau should suggest appropriate interventions (e.g., calling relatives, seeking psychological therapy, guided exercises). These recommendations must be grounded in actual research related to MASA or other space agencies.
*   **UI Element:** Include an animated GIF of Rimau that activates specifically when the bot is "talking" or generating a response.

## 2. Role-Based Views and Login System
Implement a simplified, hard-coded login screen to route users to role-specific dashboards (no secure authentication or database required for the demo).

### Login Page
*   **Role Selection:** Options for "Astronaut" or "Ground Team".
*   **Developer Bypass:** A small, discrete button allowing developers to access a "Demo/Walkthrough" mode that displays **ALL** tabs simultaneously (similar to the current `index.html` setup).

### Astronaut View (Two Tabs)
1.  **PERSONAL Tab:** 
    *   Focuses solely on the logged-in astronaut's individual status.
    *   Information must be simple and easily digestible at a glance.
    *   Include a "Show Details" button that expands to reveal in-depth explanations and raw data for the metrics.
    *   *Note:* The Rimau AI Chatbot will be housed in this tab.
2.  **TEAM Tab:**
    *   Displays a high-level overview of the entire crew's stats.
    *   **Design Goal:** Keep it uncluttered. Only show crucial information that fosters empathy, team bonding, communication, and mutual support.

### Ground Team View
*   A comprehensive supervision dashboard to monitor the entire crew.
*   Must feature a clean display where critical alerts, important metrics, and overall crew statuses are highly prioritized and immediately visible.

## 3. Cabin Radiation Tracking
*   **New Metric:** Add a real-time tracking metric for the cabin's current radiation levels to serve as an additional, critical safety measure.

## 4. Mock CCTV Integration
*   **Locations:** Add this module to both the **Ground Team Dashboard** and the Astronaut's **TEAM Tab**.
*   **Implementation:** For now, use a static placeholder image representing a mock CCTV feed of the cabin layout.

## 5. Personal Metric Categorization
*   **UI/UX Improvement:** Group and categorize metrics on the Personal tab logically (e.g., Vitals, Environment, Mental State). 
*   **Goal:** Avoid information overload, maintain a clean interface, and allow users to easily visually correlate related metrics.

## 6. Semantic Color Coding
*   Apply consistent and meaningful color coding across all dashboards.
*   Colors should clearly indicate metric priority, alert significance (e.g., Red for critical, Yellow for warnings, Green for nominal), and general status at a glance.

## 7. Environmental Controls & Sleep Reporting
*   **Cabin Remote:** Add a simple remote-control UI in the Personal tab allowing astronauts to tune their local cabin temperature and lighting.
*   **Sleep Report:** Introduce a daily/session sleep report. This should log any disturbances during a nap/sleep session, correlating them with environmental data (e.g., noise spikes, CO2 levels, humidity changes).

## 8. Data Simulation (Architecture Note)
*   **Assumption:** The system architecture assumes a constant stream of real-time telemetry and biometric data to trigger real-time alerts and AI insights.
*   **Demo Implementation:** For the current phase, we will continue to simulate these real-time data streams and specific alert scenarios via hard-coded scripts (as currently implemented in `index.html`).