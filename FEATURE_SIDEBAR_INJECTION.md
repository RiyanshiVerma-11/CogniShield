# 🛡️ CogniShield Feature Proposal: In-Feed Blindspot Recommender (Sidebar Injection)

> **Motto:** *"Never censor the algorithm. Simply expand the horizon."*  
> **Status:** Proposed Enhancement for Sopra Steria International Student Challenge 2026–2027  
> **Target Platforms:** YouTube (Primary), X/Twitter Threads, Reddit Feed

---

## 📌 1. Executive Summary

Traditional recommendation algorithms create **epistemic filter bubbles** by constantly suggesting content that reinforces the user's existing bias. 

Rather than hiding, deleting, or blocking YouTube's native recommendations (which would violate CogniShield's strict **Zero-Censorship philosophy**), this feature **non-destructively inserts a dedicated "CogniShield: Perspectives the Algorithm Missed" shelf at the very top of YouTube's sidebar**, naturally shifting YouTube's default recommendations down.

The user loses zero content, but their attention is immediately grounded with multi-perspective, verified counter-arguments before they fall into an algorithmic rabbit hole.

---

## 🎯 2. Core Philosophy & Behavioral Impact

```
┌────────────────────────────────────────────────────────────────────────┐
│               ZERO-CENSORSHIP VS. LEGACY BLOCKING                      │
├───────────────────────────────────┬────────────────────────────────────┤
│ ❌ Legacy / AdBlock Approach      │ ✅ CogniShield Non-Destructive Flow│
├───────────────────────────────────┼────────────────────────────────────┤
│ • Hides YouTube recommendations   │ • Leaves YouTube recommendations   │
│ • Triggers psychological reactance│ • Shifts native feed down smoothly │
│ • Creates a feeling of censorship │ • Prioritizes counter-views first  │
│ • Deprives user of autonomy       │ • Preserves complete user choice   │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **System 1 Interruption:** When a user finishes a video, their instinct is to click the first recommended thumbnail. Placing counter-perspectives at the top converts an impulsive reflex into analytical (System 2) reflection.
2. **The Backfire Effect Shield:** Because nothing is blocked, users never feel manipulated or restricted. They retain full cognitive agency.

---

## 🖥️ 3. UI/UX Visual Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ YouTube Watch Page (`#secondary #items`)                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  🛡️ COGNISHIELD • BLINDSPOT COUNTER-PERSPECTIVES                       │
│  "You watched Perspective A. Here is what the algorithm missed:"       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [Thumbnail]  Economic Lifecycle Analysis of EV Batteries         │  │
│  │              Channel: Bloomberg / Financial Times                │  │
│  │              Tag: [Economic Data] • 11 mins                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [Thumbnail]  Grid Capacity & Infrastructure Reality Check        │  │
│  │              Channel: MIT Technology Review                      │  │
│  │              Tag: [Empirical Research] • 8 mins                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ────────────────────────────────────────────────────────────────────  │
│  ▼ YouTube Native Recommendations (Shifted Down Naturally)             │
│  [Native Video 1]                                                      │
│  [Native Video 2]                                                      │
│  [Native Video 3]                                                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 4. Technical Architecture & DOM Mechanics

Because browser extensions execute client-side code directly in the user's browser, this requires **zero server-side access to YouTube**.

### Step-by-Step Flow:
1. **Context Extraction:** When a video loads, `src/content/scrapers/youtube-scraper.js` extracts the video title, description, and tags.
2. **Semantic Inversion:** The client identifies the core topic and stance, formulating 2 inverted search archetypes (e.g., *Empirical Research*, *Statutory/Regulatory Framework*).
3. **Public Search / Curated Lookup:** The extension fetches metadata (title, channel, duration, thumbnail URL, and video link) for verified opposing videos via YouTube search or local cache dossiers.
4. **Non-Destructive DOM Injection:** Using standard DOM insertion, the container is placed at the beginning of YouTube's recommendations list:

```javascript
// Target YouTube's recommendation container
const recommendationContainer = document.querySelector("#secondary #items, ytd-watch-next-secondary-results-renderer #items");

if (recommendationContainer && !document.getElementById("cognishield-counter-shelf")) {
  const shelf = document.createElement("div");
  shelf.id = "cognishield-counter-shelf";
  shelf.className = "cognishield-injected-shelf";
  shelf.innerHTML = `
    <div class="cognishield-shelf-header">
      <span class="cognishield-logo">🛡️</span>
      <span class="cognishield-shelf-title">PERSPECTIVES THE ALGORITHM MISSED</span>
    </div>
    <div class="cognishield-shelf-cards">
      <!-- 2 to 3 counter-video cards -->
    </div>
  `;

  // Insert at top without deleting or hiding native recommendations
  recommendationContainer.insertAdjacentElement("afterbegin", shelf);
}
```

---

## 🏆 5. Hackathon Judge Defense

### Question: *"Isn't this breaking YouTube's Terms of Service or modifying their proprietary algorithm?"*
> **Answer:**  
> *"No. We do not touch YouTube’s backend servers, reverse-engineer their proprietary ranking algorithms, or intercept private APIs. 
> 
> Exactly like accessibility screen-readers, translation extensions, or productivity tools (e.g., Grammarly, Enhancer for YouTube), CogniShield operates 100% locally on the user's client-side DOM. We do not delete or suppress YouTube's content; we simply present verified public video links directly in the user's viewport to support informed decision-making."*

---

## 🔗 Related Project Documents
* Master Charter: [.idea.md](file:///d:/SOPRA/.idea.md)
* YouTube Scraper Source: [youtube-scraper.js](file:///d:/SOPRA/src/content/scrapers/youtube-scraper.js)
* Jury Defense Cheatsheet: [JURY_DEFENSE_QA.md](file:///d:/SOPRA/JURY_DEFENSE_QA.md)
