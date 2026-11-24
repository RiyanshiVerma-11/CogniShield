# CogniShield: Honest Jury Defense & Q&A Reference
### Sopra Steria International Student Challenge 2026–2027 (Stream: COGNITIVE)
**Target:** Grounded, code-accurate answers for jury questioning. If a question addresses a technical limitation, the answer is the limitation, not an overclaimed slogan.

---

### Q1: "Aren't you fighting algorithmic influence with more AI? Doesn't that create a second-order dependency?"

**Honest Answer:**
> *"That is the central risk of the Cognitive stream, and CogniShield is designed around one strict policy: **we never give the user the 'correct' opinion.**
> 
> 1. **Socratic Questions, Not AI Conclusions:** The engine does not say 'this post is false'. It asks one calibrated question: *'What concrete evidence remains if loaded adjectives are removed?'*
> 2. **12 Seconds of Friction:** We don't automate decision-making; we enforce a 12-second pause before action buttons become active. The goal is to activate the user's analytical reflection, not outsource their judgment to a chatbot.
> 3. **Search Suggestions, Not Verified Truths:** Counter-recommendations provide balanced search queries across alternative viewpoints. The student still searches, reads, and decides for themselves."*

---

### Q2: "You cite Kahneman's Dual-Process theory, but how is your Habit Score calculated? Is it an established psychological scale?"

**Honest Answer:**
> *"No, and we are completely transparent about that: **it is an intentional product design choice, not an empirically validated psychological diagnosis.**
> 
> In `cognitive-engine.js`, the score combines three practical habit metrics:
> 1. **Dwell Friction (40%):** Comparing time spent deliberating against our 12-second pause threshold ($\min(1, \Delta t / 12)$).
> 2. **Reflection Quiz Accuracy (35%):** Checking whether the student can identify the unstated premise or fallacy in a micro-quiz. When no quizzes have been attempted, this strictly contributes 0% — we never insert fake default scores.
> 3. **Perspective Diversity (25%):** Using Shannon Entropy across four viewpoint categories (Economic, Statutory, Socio-Ethical, Empirical).
> 
> We call it a **Habit Score**, not a medical metric or a definitive psychometric assessment."*

---

### Q3: "If venue Wi-Fi fails onstage, won't your live demo crash?"

**Honest Answer:**
> *"No, because the stage demo runs completely offline by design:
> 
> 1. **Stage Demo Pack:** In `offline-cache.js`, we have two hand-checked stage dossiers (`ai_education` and `energy_transition`) stored locally.
> 2. **Jury Demo Safety Switch:** The extension popup includes a 'Force Demo Cache' toggle. When enabled, zero network requests are issued.
> 3. **Deterministic Heuristics:** The regex engine runs entirely in browser JavaScript with sub-5ms latency and zero server reliance."*

---

### Q4: "How is CogniShield fundamentally different from fact-checking tools or browser blockers?"

**Honest Answer:**
> *"Traditional tools have two major limitations:
> 
> 1. **They Censor or Block:** Browser blockers and safety extensions downrank, hide, or ban content. CogniShield has a strict rule: **never block, ban, or delete the original post.** The user can always watch and read the original.
> 2. **They Act as Fact Arbiters:** Fact-checking plugins tell you what is true and what is false. CogniShield does not declare truth; it detects manipulation techniques (urgency, emotional arousal, tribal framing) and provides 12 seconds of friction so the human can evaluate the claim before forwarding."*

---

### Q5: "Why don't you claim a 95.5% or 99.98% carbon reduction like some AI projects do?"

**Honest Answer:**
> *"Because that comparison is fundamentally misleading.
> 
> Claiming a 95.5% or 99.98% carbon reduction by comparing a lightweight text parser to a fictitious cloud A100 GPU pipeline decoding 1,500 video frames compares a real solution to an architecture nobody actually uses for caption analysis.
> 
> We state our architecture honestly:
> - CogniShield parses lightweight on-screen text and metadata in the browser DOM.
> - We do not download or decode heavy video streams.
> - All primary analysis runs client-side on-device, with cloud LLMs used only as an optional user-initiated fallback."*

---

### Q6: "How do you protect student privacy? What about user data tracking?"

**Honest Answer:**
> *"We follow privacy-by-design at the code level:
> 
> 1. **No Account Required:** CogniShield requires no registration, email, or login.
> 2. **100% Local Storage:** All scan history, dwell records, and session logs reside in local browser IndexedDB (`local-storage.js`). No remote analytics server exists.
> 3. **Client-Side Zero-PII Sanitizer:** If the user enables optional cloud inference, the client script automatically strips URLs, user handles (`@user`, `u/user`), timestamps, subscriber counts, and emails before sending the text."*

---

### Q7: "Who is the community, and who is the second seat in your model?"

**Honest Answer:**
> *"We designed CogniShield for a specific community, not an abstract 'all internet citizens':
> 
> 1. **Primary Community:** College students who encounter manipulated posts, panic notices, and one-sided videos and are about to forward them in class WhatsApp groups, Reddit, X, or YouTube.
> 2. **The Second Seat:** Similar to ReViva's clinician seat, CogniShield provides a dashboard for a campus media literacy faculty coordinator or student club lead.
> 3. **Aggregate Only:** The second seat receives **only anonymous aggregate counts** — for example, *'[FORWARDS_PAUSED] pauses initiated this week'* across `[PILOT_N]` cohort participants. They never see an individual student's reading history or psychological profile."*

---

### Q8: "What happens when YouTube updates its layout or video captions are disabled?"

**Honest Answer:**
> *"We admit our current architectural boundary honestly:
> 
> - **Current Status:** Our Tier A network intercept is an API stub and is not currently wired to intercept internal `timedtext` network packets.
> - **Working Scrapers:** We rely on on-screen accessibility captions (which platforms cannot easily remove due to accessibility standards) and high-value semantic metadata (video title, description, and top pinned comments).
> - **Fallback:** If captions are absent, CogniShield analyzes the title and description, and matches against our topic heuristics."*

---

### Q9: "What about false positives? Won't your regex engine flag calm, neutral news?"

**Honest Answer:**
> *"Yes, keyword-based heuristics can flag neutral words like 'crisis' or 'emergency' in calm reporting. We treat this as an engineering reality to measure and improve, not a bug to hide.
> 
> In our automated test suite, we specifically added negative control tests using neutral paragraphs from BBC, Le Monde, and Der Spiegel:
> - Single neutral occurrences in calm context do not meet our threshold for emotional manipulation.
> - In our pitch demo, we explicitly show a calm economic article that produces a 0.0 score to prove that the system does not cry wolf."*

---

### Q10: "What does success look like for CogniShield?"

**Honest Answer:**
> *"One simple, falsifiable outcome: **an impulsive forward that did not happen.**
> 
> Success is a student reading a panic headline in a college WhatsApp group, encountering our 12-second pause, reading one counter-question, and deciding: *'Let me check the primary source before I send this to 180 classmates.'*"*
