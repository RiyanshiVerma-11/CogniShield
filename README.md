# 🛡️ CogniShield: The Zero-Censorship Cognitive Copilot
### Stream 1: COGNITIVE (Algorithmic Influence & Cognitive Digital Risks)
**Sopra Steria International Student Challenge 2026–2027**  
*Motto:* **"CogniShield doesn’t fight the algorithm. It upgrades the human."**

<div align="center">

[![CogniShield CI](https://github.com/RiyanshiVerma-11/CogniShield/actions/workflows/test.yml/badge.svg)](https://github.com/RiyanshiVerma-11/CogniShield/actions/workflows/test.yml)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Brave%20MV3-F7941D?style=for-the-badge&logo=googlechrome)
![Track](https://img.shields.io/badge/Track-Stream%201%3A%20COGNITIVE-0F172A?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-38%2F38%20Passing-10B981?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-0284C7?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache%202.0-8B5CF6?style=for-the-badge)

</div>

---

## 📌 Executive Summary

**CogniShield** is a zero-censorship **Chrome and Brave browser extension** designed to detect algorithmic filter bubbles and emotional manipulation across social media and web news (YouTube, X, Reddit, news portals), while actively training the user’s critical thinking so they build independent cognitive agency.

Unlike legacy tools that censor content, ban websites, or slap patronizing "True/False" fact-check badges that trigger defensive psychological reactance, CogniShield adheres strictly to a **100% Non-Censorship Policy**:
* We never block, ban, or alter original content.
* We reveal the perspectives that recommendation algorithms systematically hide.
* We inject **12-second productive friction** (Daniel Kahneman’s System 2 rational questioning) before impulsive sharing.
* We feature **Flip the Feed**: an in-page recommendation inverter on YouTube that replaces outrage loops with **counter-perspective search suggestions** across multiple viewpoints and awards Agency Points.

---

## 👥 Collaborator & Team Setup Guide (Clone, Edit, Branch & Push)

> 💡 **For Collaborators:** If you have been added as a collaborator on GitHub, follow this step-by-step workflow to clone the project, set up your local development environment, edit any module, and push your contributions cleanly.

### 1. Prerequisites
* **Google Chrome** or **Brave Browser** (version 108+)
* **Node.js** (v16+ recommended for running automated tests)
* **Git** installed and configured on your system

---

### 2. Clone the Repository & Create a Branch
1. Clone the GitHub repository:
   ```bash
   git clone https://github.com/RiyanshiVerma-11/CogniShield.git
   cd CogniShield
   ```
2. Create and switch to your own dedicated feature branch:
   ```bash
   git checkout -b feature/your-name-feature-description
   ```

---

### 3. Configure Local API Keys (Zero-Leak Guarantee)
CogniShield works **100% offline out-of-the-box** using deterministic cached dossiers (0ms latency, zero API reliance).

To test **Live Gemini 2.5 Flash** or **Groq Llama** cloud inference locally:
1. In the `src/config/` folder, copy the example file:
   ```bash
   cp src/config/keys.example.js src/config/keys.local.js
   ```
2. Open `src/config/keys.local.js` and paste your free API keys:
   * **Gemini API:** [Google AI Studio](https://aistudio.google.com/) (Free)
   * **Groq API:** [Groq Cloud Console](https://console.groq.com/) (Free)
3. *(Optional)* If running local node/python scripts, copy `.env.example`:
   ```bash
   cp .env.example .env
   ```

> 🔒 **Security Guarantee:** `*.local.js` and `.env` are strictly tracked in `.gitignore`. Your personal secret keys will **never** be committed or pushed to GitHub.

---

### 4. Load the Extension in Chrome / Brave
1. Open your browser and navigate to:
   * Chrome: `chrome://extensions`
   * Brave: `brave://extensions`
2. Toggle on **"Developer mode"** in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select your cloned **`CogniShield`** root folder.
5. Pin the 🛡️ **CogniShield** icon to your browser toolbar!

---

### 5. Where to Edit What (Module Code Map)
Collaborators can edit any module directly in VS Code / IDE:

| Capability / Feature | Files to Edit | What it Controls |
| :--- | :--- | :--- |
| **YouTube "Flip the Feed" Inverter** | `src/content/flip-feed.js`<br>`src/content/hud-styles.css` | In-page recommendation replacement, 5 opposite video cards, agency points reward |
| **Cognitive Math & Scrutiny Formulas** | `src/shared/cognitive-engine.js` | Daniel Kahneman System 1 vs 2 formulas, CRT quizzes, Shannon Entropy metrics |
| **Trilingual Outrage Regex Scanner** | `src/shared/regex-detector.js` | English, German (Hamburg), and French zero-watt emotional manipulation keywords |
| **Pre-cached Hamburg Stage Dossiers** | `src/shared/offline-cache.js` | 0ms deterministic dossiers (AI Ethics, Renewable Energy, Inflation, Elections) |
| **Cognitive Health Dashboard** | `src/dashboard/dashboard.html`<br>`src/dashboard/dashboard.js`<br>`src/dashboard/dashboard.css` | Real-time analytics, habit loops, and exportable Local Session Log |
| **Dual AI Cloud Bridge & Prompts** | `src/background/api-bridge.js` | Gemini 2.5 Flash & Groq LLM dialectic query orchestration & prompt engineering |
| **Extension Toolbar Popup & Modes** | `src/popup/popup.html`<br>`src/popup/popup.js` | Zen Mode vs Active Trainer switcher, Force Demo Cache stage toggle |

---

### 6. Live Hot-Reloading during Development
Whenever you make changes to any file:
1. Go back to `chrome://extensions`.
2. Click the **🔄 (Reload)** icon on the CogniShield card.
3. Refresh your YouTube or news tab to see your changes instantly!

---

### 7. Committing & Pushing as a Collaborator
Once your edits are tested and verified:
1. Run the test suite:
   ```bash
   npm test
   ```
2. Stage and commit your changes with a clear message:
   ```bash
   git add .
   git commit -m "feat(flip-feed): improve 5-video dialectic contrast"
   ```
3. Push your feature branch to GitHub:
   ```bash
   git push origin feature/your-name-feature-description
   ```
4. Open a Pull Request on [GitHub CogniShield](https://github.com/RiyanshiVerma-11/CogniShield/pulls) for team review and merge into `main`!

---

## 🧪 Quality Assurance & Testing Suite

CogniShield features an automated 38-test verification suite covering trilingual regex heuristics, behavioral agency math, privacy sanitization, negative neutral-news controls, and pilot stats.

### 1. Automated Unit Test Suite (`npm test`)
Run the test suite directly from your terminal:
```bash
npm test
# or
node tests/test-cognitive-engine.js
```

All 38 unit tests pass deterministically.

---

### 2. Manual Live Feature Verification Guide

#### A. In-Page YouTube "Flip the Feed"
1. Open any video on [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ).
2. Check the right sidebar above the native recommendations.
3. Confirm the **CogniShield Flip the Feed** hero card is mounted.
4. Click **"⚡ Flip Feed (+5 🧠)"** or **"FLIP THE FEED: REVEAL 5 COUNTER-PERSPECTIVES"**.
5. Verify native recommendations are replaced by **balanced counter-perspective search suggestions** across:
   * *Direct Counter-Thesis*
   * *Empirical Baseline Data*
   * *Opportunity / Inverted Valence Upsides*
   * *Statutory / Regulatory Governance*
   * *Historical Precedent*
6. Confirm the **+5 Agency Points** reward banner and sound trigger in real time.

#### B. In-DOM Socratic Friction HUD Overlay
1. Open any news article or social media thread (X/Twitter, Reddit).
2. Verify emotional drama keywords are highlighted in real time (**0ms latency, 0 Watts**).
3. Engage with the 12-second reflection timer and Socratic challenge.

#### C. Cognitive Health Dashboard & Integrity Certificate
1. Click the CogniShield toolbar icon or open `src/dashboard/dashboard.html` in browser.
2. Verify the **Cognitive Agency Score (CAS)**, **System 1 vs 2 Scrutiny Ratio**, and **Shannon Entropy** metrics render correctly.
3. Click **"Export Local Session Log"** to generate an on-device plain-text record of user inquiry.

#### D. Hamburg Stage Resilience Test (100% Offline Mode)
1. Turn off your Wi-Fi completely (or toggle `forceDemoMode: true` in `keys.local.js`).
2. Refresh your browser and interact with CogniShield on any pre-cached topic (AI Ethics, Renewable Energy, Inflation).
3. Verify that CogniShield responds instantly with **0ms latency, zero API calls, and zero stage crash risk**.

---

## 🏛️ 5-Step Real-Time Execution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                COGNISHIELD 5-STEP RUNTIME PIPELINE                              │
├─────────────────┬─────────────────┬──────────────────┬──────────────────┬───────────────────────┤
│ 🌐 01. ACTION   │ ⚡ 02. EXTRACT  │ 🛡️ 03. SCAN      │ 🧠 04. SYNTHESIS │ 🏆 05. REFLECT        │
│ User visits     │ DOM scraper     │ Trilingual regex │ Micro-JSON AI    │ 12s Socratic pause    │
│ YouTube, X,     │ grabs text      │ flags outrage &  │ surfaces 5       │ + 5s System 2 quiz    │
│ Reddit, or news │ in 0.05s        │ drama hooks in   │ counter-views    │ rewards +5 Agency Pts │
│ feeds           │ (<15 KB payload)│ 0ms (0 Watts)    │ in <0.3s         │ (🧠 79% Agency)       │
└─────────────────┴─────────────────┴──────────────────┴──────────────────┴───────────────────────┘
```

### The Zero-Fail Hybrid Cascade
To ensure stage uptime during presentations:

* **Tier 0: Pure Client-Side Trilingual Regex (0ms, 100% Offline):** Instant in-browser scan across English, German, and French emotional manipulation patterns.
* **Tier 1: Deterministic Offline Demo Cache (0ms, 0 Network Overhead):** Pre-cached stage dossiers (`ai_education` and `energy_transition`).
* **Tier 2: Serverless Micro-JSON Cloud Inference (<0.3s Latency):** Gemini Flash & Groq returning structured counter-perspectives with on-device Zero-PII sanitization.

---

## 🔒 Architecture & Privacy: Lightweight DOM Processing

CogniShield processes text titles, captions, and DOM metadata locally inside the browser. It does not stream or download heavy video files to cloud servers. All browsing history and quiz results remain in the browser's local IndexedDB with zero cloud telemetry.

---

## 🧠 Behavioral Model: The Cognitive Habit Score

Implemented in `src/shared/cognitive-engine.js`, the Habit Score is an intentional product design choice inspired by Daniel Kahneman's Dual-Process concept:

$$\text{Habit Score}(t) = \left[ 0.40 \cdot \min\left(1, \frac{\Delta t_{\text{dwell}}}{12\text{s}}\right) + 0.35 \cdot \text{CRT}_{\text{score}} + 0.25 \cdot \left(\frac{H(P)}{\log_2(N)}\right) \right] \times 100$$

1. **Epistemic Latency ($\Delta t_{\text{dwell}}$):** Measures whether the user pauses to scrutinize claims (System 2) before reacting impulsively (System 1).
2. **Cognitive Reflection Test (CRT) Accuracy:** Micro-quizzes test the user's ability to spot intuitive logical traps. When no quizzes are taken, this strictly contributes 0.
3. **Shannon Entropy of Perspective Exposure:** Measures the diversity of perspectives explored across archetypes.

*Note: This formula is an educational habit-building heuristic, not an empirically validated psychological diagnosis.*

---

## 📁 Repository Structure

```
CogniShield/
├── manifest.json                     # Chrome/Brave Manifest V3 configuration
├── package.json                      # Project metadata & npm test command
├── LICENSE                           # Apache 2.0 Open Source License
├── .env.example                      # Template for local environment variables
├── .gitignore                        # Git ignore (protects .env, *.local.js, PPTs)
├── README.md                         # Complete project documentation & setup guide
├── IMPLEMENTATION_PLAN.md            # Sprint roadmap & evaluation alignment
├── JURY_DEFENSE_QA.md                # 10 bulletproof Q&A defenses for the jury
├── src/
│   ├── config/
│   │   ├── keys.example.js           # Template for local API keys
│   │   └── keys.local.js             # Local keys (gitignored - zero leak risk)
│   ├── dashboard/                    # Executive Cognitive Health & Due-Diligence Studio
│   │   ├── dashboard.html            # Interactive analytics portal
│   │   ├── dashboard.css             # High-contrast cyber-HUD styling
│   │   └── dashboard.js              # Real-time analytics, entropy & certificate export
│   ├── shared/
│   │   ├── cognitive-engine.js       # Mathematical CAS scoring, CRT quizzes & Shannon entropy
│   │   ├── offline-cache.js          # Deterministic pre-cached dossiers (Hamburg safety net)
│   │   ├── local-storage.js          # GDPR-compliant encrypted local session store
│   │   └── regex-detector.js         # Trilingual (EN/DE/FR) zero-watt manipulation scanner
│   ├── content/
│   │   ├── content-main.js           # Multi-platform content coordinator (YouTube/X/Reddit)
│   │   ├── flip-feed.js              # "Flip the Feed" recommendation inverter
│   │   └── hud-styles.css            # Ambient glow & radar overlay styles
│   ├── background/
│   │   ├── service-worker.js         # MV3 background worker & tab dwell-time tracker
│   │   └── api-bridge.js             # Dual Gemini 2.5 & Groq LLM orchestration
│   └── popup/
│       ├── popup.html                # Extension toolbar popup interface
│       └── popup.js                  # Mode switcher (Zen vs Trainer) & demo toggles
├── assets/
│   ├── icons/                        # Extension shield icons (16, 48, 128 px)
│   └── presentation_visuals/         # Visual slide graphics (Slide 02 - Slide 08)
├── local/                            # Presentation PPTs, PDF decks & local scripts (gitignored)
└── tests/
    └── test-cognitive-engine.js      # Automated unit test suite (26/26 passing)
```

---

## 👥 Interdisciplinary Team Synergy

* **AI & Software Engineer:** Chrome/Brave Manifest V3 architecture, 0.05s DOM scraper, Groq & Gemini micro-JSON orchestration.
* **Cognitive Psychology & UX Lead:** 12-second reflection pause, Kahneman System 2 Socratic challenge, habit reward loops.
* **Digital Ethics & Policy Strategist:** 100% zero-censorship enforcement, EU AI Act conformity, GDPR compliance & data audits.
* **Campus Partnerships Lead:** Multi-university pilot coordination (India & Europe), academic integrity licenses.

---
*Authored for the Sopra Steria International Student Challenge 2026–2027. All rights reserved by Team CogniShield.*
