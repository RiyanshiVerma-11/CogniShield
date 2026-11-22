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

    this.currentVideoTitle = analysisPayload.title || document.title;
    const dossier = analysisPayload.dossier;

    if (window.CogniShieldCognitive && typeof window.CogniShieldCognitive.generateCounterPerspectiveFeed === "function") {
      this.currentData = window.CogniShieldCognitive.generateCounterPerspectiveFeed(
        { title: this.currentVideoTitle },
        dossier,
        window.CogniShieldOffline
      );
    }

    this.mountIntoYouTubeDOM();
    this.render();
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

      // Log exploration to local IndexedDB
      if (window.CogniShieldStorage && typeof window.CogniShieldStorage.logSession === "function") {
        window.CogniShieldStorage.logSession({
          title: `Flipped Feed: ${this.currentVideoTitle}`,
          domain: "youtube.com",
          platform: "YouTube",
          biasCategory: this.currentData ? this.currentData.detectedBias : "algorithmic_echo",
          epistemicArchetypes: ["Counter-Perspective", "Empirical Baseline"],
          perspectivesCount: (this.currentData && this.currentData.recommendations) ? this.currentData.recommendations.length : 3,
          dwellSeconds: 15
        });
      }
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
      // UNFLIPPED STATE (Prompt Banner above YouTube Recommendations)
      // -------------------------------------------------------------
      this.container.innerHTML = `
        <div class="cognishield-flip-card-unflipped">
          <div class="cognishield-flip-header-row">
            <div class="cognishield-flip-badge-title">
              <span class="cognishield-flip-icon-glow">🔄</span>
              <span class="cognishield-flip-title">FLIP THE FEED</span>
              <span class="cognishield-anti-bubble-tag">Anti-Bubble Engine</span>
            </div>
            <div class="cognishield-flip-toggle-group">
              <button class="cognishield-toggle-btn active-echo" id="btn-toggle-echo" title="Currently showing YouTube's default recommendations">
                🔴 YouTube Echo
              </button>
              <button class="cognishield-toggle-btn btn-flip-action" id="btn-toggle-flip" title="Click to break the filter bubble and explore the other side">
                🟢 Flip Feed (+5 🧠)
              </button>
            </div>
          </div>
          <div class="cognishield-flip-teaser">
            <span class="cognishield-teaser-icon">⚡</span>
            <span class="cognishield-teaser-text">
              Watching a controversial opinion? Don't let the algorithm decide your perspective. 
              <strong>Flip the feed</strong> to see verified counter-arguments.
            </span>
            <button class="cognishield-btn-mini-flip" id="btn-quick-flip">Flip Now ➔</button>
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
            <div class="cognishield-rec-thumb-icon">▶</div>
          </div>
          <div class="cognishield-rec-body">
            <div class="cognishield-rec-title-row">
              <a href="${rec.searchUrl}" target="_blank" class="cognishield-rec-title" title="Open search results for this counter-perspective">
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
            <a href="${rec.searchUrl}" target="_blank" class="cognishield-btn-explore" title="Explore on YouTube">
              Explore ↗
            </a>
          </div>
        </div>
      `).join("");

      this.container.innerHTML = `
        <div class="cognishield-flip-card-active">
          <!-- Active Header -->
          <div class="cognishield-flip-header-row">
            <div class="cognishield-flip-badge-title">
              <span class="cognishield-flip-icon-glow">🛡️</span>
              <div>
                <span class="cognishield-flip-title">FEED FLIPPED: THE OTHER SIDE</span>
                <div class="cognishield-flip-sub">Balanced perspectives replacing algorithmic echo chamber</div>
              </div>
            </div>
            <div class="cognishield-flip-toggle-group">
              <button class="cognishield-toggle-btn" id="btn-toggle-echo" title="Restore YouTube's default recommendations">
                🔴 YouTube Echo
              </button>
              <button class="cognishield-toggle-btn active-flipped" id="btn-toggle-flip" title="CogniShield Counter-Perspective active">
                🟢 Flipped Active
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
    const btnQuickFlip = this.container.querySelector("#btn-quick-flip");
    const btnToggleEcho = this.container.querySelector("#btn-toggle-echo");
    const btnRevertFeed = this.container.querySelector("#btn-revert-feed");

    if (btnToggleFlip) {
      btnToggleFlip.addEventListener("click", () => this.toggleFeed(true));
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
