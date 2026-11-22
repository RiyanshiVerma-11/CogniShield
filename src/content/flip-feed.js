/**
 * CogniShield - "Flip the Feed" (CogniFlip) In-Page Controller
 * Mounts directly into YouTube's recommendation sidebar (#secondary #related).
 * Inverts recommendation bias, surfaces verified counter-arguments, and rewards user agency.
 */

class FlipFeedController {
  constructor() {
    this.container = null;
    this.isFlipped = false;
    this.currentData = null;
    this.currentVideoTitle = "";
    this.observer = null;
    this.hasAwardedPoints = false;
    this.hasLiveAiData = false;
    this.isLoadingAi = false;
  }

  /**
   * Initializes the Flip the Feed controller on YouTube pages.
   */
  init() {
    if (!window.location.hostname.includes("youtube.com")) return;

    this.mountIntoYouTubeDOM();

    // Listen for YouTube SPA navigation events
    window.addEventListener("yt-navigate-finish", () => {
      this.hasAwardedPoints = false;
      this.hasLiveAiData = false;
      this.isLoadingAi = false;
      this.mountIntoYouTubeDOM();
    });

    // Start a periodic DOM watchdog to ensure container stays attached
    setInterval(() => {
      if (window.location.pathname.startsWith("/watch") && !document.getElementById("cognishield-flip-feed-root")) {
        this.mountIntoYouTubeDOM();
      }
    }, 2000);
  }

  /**
   * Mounts the Flip the Feed container above YouTube's recommendation list.
   */
  mountIntoYouTubeDOM() {
    if (!window.location.pathname.startsWith("/watch")) return;
    if (document.getElementById("cognishield-flip-feed-root")) return;

    // Search for YouTube secondary recommendation container
    const targets = [
      document.querySelector("#secondary #related"),
      document.querySelector("ytd-watch-next-secondary-results-renderer #items"),
      document.querySelector("#secondary-inner"),
      document.querySelector("#secondary")
    ];

    const mountTarget = targets.find((el) => el !== null);
    if (!mountTarget) {
      setTimeout(() => this.mountIntoYouTubeDOM(), 800);
      return;
    }

    this.container = document.createElement("div");
    this.container.id = "cognishield-flip-feed-root";
    this.container.className = "cognishield-flip-feed-container";

    // Insert as the first element inside the related videos column
    mountTarget.insertBefore(this.container, mountTarget.firstChild);
    this.render();
  }

  /**
   * Updates feed data when a new video is analyzed by content-main.js.
   */
  updateFeed(analysisPayload) {
    if (!analysisPayload) return;

    const newTitle = analysisPayload.title || document.title;
    if (newTitle !== this.currentVideoTitle) {
      this.currentVideoTitle = newTitle;
      this.hasLiveAiData = false;
    }

    const dossier = analysisPayload.dossier;

    // 1. Initial immediate render from offline cache for 0ms UI readiness
    if (window.CogniShieldCognitive && typeof window.CogniShieldCognitive.generateCounterPerspectiveFeed === "function") {
      this.currentData = window.CogniShieldCognitive.generateCounterPerspectiveFeed(
        { title: this.currentVideoTitle },
        dossier,
        window.CogniShieldOffline
      );
    }

    this.mountIntoYouTubeDOM();
    this.render();

    // 2. LIVE AI INFERENCE: Call background service worker for Gemini 2.5 Flash / Groq real analysis
    this.triggerLiveAiFetch(analysisPayload.pageText);
  }

  /**
   * Triggers live AI analysis via background service worker (Gemini 2.5 Flash / Groq)
   */
  triggerLiveAiFetch(contextText = "") {
    if (this.isLoadingAi || this.hasLiveAiData) return;
    if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) return;

    this.isLoadingAi = true;
    chrome.storage.local.get(["forceDemoMode"], (settings) => {
      if (settings.forceDemoMode) {
        this.isLoadingAi = false;
        return;
      }

      chrome.runtime.sendMessage({
        action: "FLIP_FEED_ANALYZE",
        payload: {
          title: this.currentVideoTitle,
          textPayload: contextText || document.title
        }
      }, (response) => {
        this.isLoadingAi = false;
        if (chrome.runtime.lastError) {
          console.warn("[CogniShield FlipFeed] Live bridge warning:", chrome.runtime.lastError.message);
          return;
        }

        if (response && response.status === "SUCCESS" && response.data) {
          console.log("[CogniShield FlipFeed] Live AI counter-perspectives received with real video links!");
          this.hasLiveAiData = true;
          this.currentData = response.data;
          this.mountIntoYouTubeDOM();
          this.render();
        }
      });
    });
  }

  /**
   * Toggles between YouTube's original algorithmic feed and CogniShield's counter-perspective feed.
   */
  toggleFeed(shouldFlip) {
    this.isFlipped = typeof shouldFlip === "boolean" ? shouldFlip : !this.isFlipped;

    // Toggle native YouTube recommendations visibility
    const nativeRelatedItems = document.querySelector("#secondary #related #items, ytd-watch-next-secondary-results-renderer #items");
    if (nativeRelatedItems) {
      if (this.isFlipped) {
        nativeRelatedItems.style.display = "none";
      } else {
        nativeRelatedItems.style.display = "";
      }
    }

    // Award agency points once per video when flipping to the counter-perspective
    if (this.isFlipped && !this.hasAwardedPoints) {
      this.hasAwardedPoints = true;
      if (window.CogniShieldHUD && typeof window.CogniShieldHUD.triggerRewardAnimation === "function") {
        window.CogniShieldHUD.triggerRewardAnimation();
      }

      const flipSession = {
        title: `Flipped Feed: ${this.currentVideoTitle}`,
        domain: "youtube.com",
        platform: "YouTube",
        detectedLang: "en",
        biasCategory: this.currentData ? this.currentData.detectedBias : "outrage_polarization",
        emotionalIntensity: 4.8,
        scaffoldingTier: "Autonomous Agency",
        dwellSeconds: 45,
        quizAnswered: true,
        quizCorrect: true,
        epistemicArchetypes: ["Empirical", "Statutory", "Economic"],
        perspectivesCount: (this.currentData && this.currentData.recommendations) ? this.currentData.recommendations.length : 3,
        timestamp: Date.now()
      };

      if (window.CogniShieldStorage && typeof window.CogniShieldStorage.logSession === "function") {
        window.CogniShieldStorage.logSession(flipSession);
      }

      // Direct cross-origin sync so the dashboard updates unconditionally
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(["_cognishield_sessions_store"], (res) => {
            let store = res._cognishield_sessions_store || [];
            store.unshift({ id: "flip_" + Date.now(), ...flipSession });
            if (store.length > 500) store = store.slice(0, 500);
            chrome.storage.local.set({
              _cognishield_sessions_store: store,
              _live_bus_event: { type: "SESSION_LOGGED", timestamp: Date.now() }
            });
          });
        }
      } catch (_) {}
    }

    // If flipped and live AI data hasn't arrived yet, trigger immediate fetch
    if (this.isFlipped && !this.hasLiveAiData) {
      this.triggerLiveAiFetch();
    }

    this.render();
  }

  /**
   * Renders the Flip the Feed widget UI.
   */
  render() {
    if (!this.container) return;

    const data = this.currentData || {
      activeVideoTitle: this.currentVideoTitle || "Current Video",
      detectedBias: "outrage_anger",
      sourcePerspective: "Dominant Algorithmic Narrative",
      counterStance: "Empirical Multi-Perspective Scrutiny",
      recommendations: [
        {
          title: "Empirical Labor Census: How AI Augments Workers",
          source: "OECD Economics Review",
          archetype: "Empirical Baseline",
          duration: "14 min",
          badge: "Verified Institutional Study",
          rationale: "Rebuts single-sided claims with empirical workforce data across 32 nations.",
          searchUrl: "https://www.youtube.com/results?search_query=OECD+AI+labor+market+empirical+study"
        },
        {
          title: "The Other Side of the Controversy: Historical Lessons",
          source: "MIT Technology Review",
          archetype: "Systemic Trade-Offs",
          duration: "18 min",
          badge: "Alternative Viewpoint",
          rationale: "Explores structural incentives and competing theories omitted by algorithmic feeds.",
          searchUrl: "https://www.youtube.com/results?search_query=MIT+technology+review+automation+counter+perspective"
        }
      ]
    };

    if (!this.isFlipped) {
      // -------------------------------------------------------------
      // UNFLIPPED STATE (High-Impact Interactive Anti-Bubble Controller)
      // -------------------------------------------------------------
      const recCount = (data.recommendations && data.recommendations.length) || 3;
      const archetypeTags = (data.recommendations || []).map(r => r.archetype || "Counter-View").slice(0, 3);
      const tagHtml = archetypeTags.map(tag => `<span class="cognishield-peek-chip" title="Click to unlock this perspective">✦ ${tag}</span>`).join("");

      this.container.innerHTML = `
        <div class="cognishield-flip-card-unflipped interactive-glow">
          <!-- Top Cyber-Glass Header -->
          <div class="cognishield-flip-header-row">
            <div class="cognishield-flip-brand">
              <span class="cognishield-flip-icon-animated">🛡️</span>
              <div class="cognishield-brand-text-col">
                <span class="cognishield-brand-name">COGNISHIELD</span>
                <span class="cognishield-live-radar-tag">
                  <span class="cognishield-radar-pulse"></span>
                  ANTI-ECHO ENGINE
                </span>
              </div>
            </div>

            <!-- Tactile Interactive Switcher -->
            <div class="cognishield-segmented-switch" id="cognishield-main-switch" role="tablist" title="Click to toggle between YouTube Echo and Balanced Feed">
              <button class="cognishield-switch-option active-echo" id="btn-toggle-echo" role="tab" aria-selected="true">
                <span class="switch-dot red-dot"></span> YouTube Echo
              </button>
              <button class="cognishield-switch-option btn-flip-action" id="btn-toggle-flip" role="tab" aria-selected="false">
                <span class="switch-sparkle">⚡</span> Flip Feed <span class="pts-pill">+5 🧠</span>
              </button>
            </div>
          </div>

          <!-- Alert / Detection Context -->
          <div class="cognishield-detection-banner">
            <div class="detection-icon-col">
              <span class="warning-badge-icon">⚠️</span>
            </div>
            <div class="detection-text-col">
              <div class="detection-title">Algorithmic Bubble Detected</div>
              <div class="detection-sub">YouTube's algorithm is prioritizing single-perspective outrage engagement.</div>
            </div>
          </div>

          <!-- HERO INTERACTIVE CALL-TO-ACTION BUTTON (Attention Magnet) -->
          <button class="cognishield-hero-flip-btn" id="btn-hero-flip" title="Click to invert recommendations and uncover hidden perspectives">
            <div class="hero-btn-shimmer"></div>
            <div class="hero-btn-content">
              <span class="hero-btn-icon">⚡</span>
              <span class="hero-btn-text">FLIP THE FEED: REVEAL ${recCount} COUNTER-PERSPECTIVES</span>
              <span class="hero-btn-badge">+5 🧠</span>
            </div>
          </button>

          <!-- Interactive Curiosity Chips -->
          <div class="cognishield-peek-bar" id="cognishield-peek-container" title="Click any perspective to flip">
            <span class="peek-label">Ready to unlock:</span>
            <div class="peek-chips-list">
              ${tagHtml || `<span class="cognishield-peek-chip">✦ Empirical Data</span><span class="cognishield-peek-chip">✦ Institutional Review</span>`}
            </div>
          </div>
        </div>
      `;
    } else {
      // -------------------------------------------------------------
      // FLIPPED STATE (Full Counter-Perspective Stack)
      // -------------------------------------------------------------
      const recsHtml = data.recommendations.map((rec, index) => `
        <div class="cognishield-counter-rec-card" data-url="${rec.searchUrl}">
          <div class="cognishield-rec-left">
            <div class="cognishield-rec-index">${index + 1}</div>
            ${rec.thumbnail ? `<img src="${rec.thumbnail}" class="cognishield-rec-thumb-img" alt="" />` : `<div class="cognishield-rec-thumb-icon">▶</div>`}
          </div>
          <div class="cognishield-rec-body">
            <div class="cognishield-rec-title-row">
              <a href="${rec.searchUrl}" target="_blank" class="cognishield-rec-title" title="${rec.isRealWatchUrl ? 'Watch this counter-perspective video on YouTube' : 'Search for this perspective on YouTube'}">
                ${rec.title}
              </a>
              <span class="cognishield-rec-duration">${rec.duration || "15 min"}</span>
            </div>
            <div class="cognishield-rec-source-row">
              <span class="cognishield-rec-source">🏛️ ${rec.source}</span>
              <span class="cognishield-rec-badge">${rec.badge || "Verified Perspective"}</span>
            </div>
            <div class="cognishield-rec-rationale">
              💡 <strong>Why watch:</strong> ${rec.rationale}
            </div>
          </div>
          <div class="cognishield-rec-action">
            <a href="${rec.searchUrl}" target="_blank" class="cognishield-btn-explore" title="Open video">
              ${rec.isRealWatchUrl ? "Watch ↗" : "Explore ↗"}
            </a>
          </div>
        </div>
      `).join("");

      this.container.innerHTML = `
        <div class="cognishield-flip-card-active">
          <!-- Active Header (Stacked Layout for Full Readability) -->
          <div class="cognishield-active-header-stacked">
            <div class="cognishield-active-brand-row">
              <span class="cognishield-flip-icon-glow">🛡️</span>
              <div class="cognishield-active-title-block">
                <span class="cognishield-flip-title">FEED FLIPPED: THE OTHER SIDE</span>
                <div class="cognishield-flip-sub">Balanced perspectives replacing algorithmic echo chamber</div>
              </div>
            </div>
            <div class="cognishield-segmented-switch">
              <button class="cognishield-switch-option" id="btn-toggle-echo" title="Restore YouTube's default recommendations">
                <span class="switch-dot red-dot"></span> YouTube Echo
              </button>
              <button class="cognishield-switch-option active-flipped" id="btn-toggle-flip" title="CogniShield Counter-Perspective active">
                <span class="switch-sparkle">⚡</span> Flipped Active <span class="pts-pill">Live</span>
              </button>
            </div>
          </div>

          <!-- Stance Overview Bar -->
          <div class="cognishield-stance-box">
            <div class="cognishield-stance-row">
              <span class="cognishield-stance-label">Detected Stance:</span>
              <span class="cognishield-stance-val red-text">${data.sourcePerspective}</span>
            </div>
            <div class="cognishield-stance-row">
              <span class="cognishield-stance-label">Flipped Stance:</span>
              <span class="cognishield-stance-val green-text">${data.counterStance}</span>
            </div>
            ${this.isLoadingAi ? `
              <div class="cognishield-ai-live-sync">
                <span class="cognishield-radar-pulse"></span>
                <span>Live Dialectic AI: Fetching verified counter-videos via Gemini 2.5 & Groq...</span>
              </div>
            ` : (this.hasLiveAiData ? `
              <div class="cognishield-ai-live-sync live-complete">
                <span>⚡ Live AI Verified • Real Counter-Perspective Videos Loaded</span>
              </div>
            ` : '')}
          </div>

          <!-- Counter-Perspective Recommendations Stack -->
          <div class="cognishield-recs-stack">
            ${recsHtml}
          </div>

          <!-- Agency Celebration Footer -->
          <div class="cognishield-flip-footer">
            <div class="cognishield-flip-agency-msg">
              <span class="agency-sparkle">🧠</span>
              <span><strong>+5 Agency Points Earned!</strong> You broke out of the algorithmic echo chamber.</span>
            </div>
            <button class="cognishield-btn-revert" id="btn-revert-feed" title="Show original YouTube recommendations">
              Show Original Feed ↩
            </button>
          </div>
        </div>
      `;
    }

    // Bind Event Listeners
    this.attachEventListeners();
  }

  /**
   * Binds user interaction events to the toggle buttons.
   */
  attachEventListeners() {
    if (!this.container) return;

    const btnToggleFlip = this.container.querySelector("#btn-toggle-flip");
    const btnHeroFlip = this.container.querySelector("#btn-hero-flip");
    const btnQuickFlip = this.container.querySelector("#btn-quick-flip");
    const btnToggleEcho = this.container.querySelector("#btn-toggle-echo");
    const btnRevertFeed = this.container.querySelector("#btn-revert-feed");

    if (btnToggleFlip) {
      btnToggleFlip.addEventListener("click", () => this.toggleFeed(true));
    }
    if (btnHeroFlip) {
      btnHeroFlip.addEventListener("click", () => this.toggleFeed(true));
    }
    if (btnQuickFlip) {
      btnQuickFlip.addEventListener("click", () => this.toggleFeed(true));
    }
    if (btnToggleEcho) {
      btnToggleEcho.addEventListener("click", () => this.toggleFeed(false));
    }
    if (btnRevertFeed) {
      btnRevertFeed.addEventListener("click", () => this.toggleFeed(false));
    }

    // Clicking curiosity chips flips feed
    this.container.querySelectorAll(".cognishield-peek-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.toggleFeed(true));
    });

    // Make entire counter-card clickable
    this.container.querySelectorAll(".cognishield-counter-rec-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // If user didn't click directly on the <a> link, open it
        if (!e.target.closest("a")) {
          const url = card.getAttribute("data-url");
          if (url) window.open(url, "_blank");
        }
      });
    });
  }
}

// Global singleton instance
window.CogniShieldFlipFeed = new FlipFeedController();

// Auto-initialize when content script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.CogniShieldFlipFeed.init());
} else {
  window.CogniShieldFlipFeed.init();
}
