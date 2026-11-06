/**
 * CogniShield - In-Page HUD Overlay & Stepped Friction Controller
 * Implements:
 * Level 1: Subconscious Glow (Ambient badge changes color: Green -> Amber -> Red).
 * Level 2: 5-Second Quick-Reflect Micro-Quiz (Gamified fallacy spotter).
 * Level 3: Deep Socratic Sparring dialogue & Sourced Blindspot Radar.
 */

class HUDOverlayController {
  constructor() {
    this.container = null;
    this.badgeEl = null;
    this.modalEl = null;
    this.currentData = null;
    this.startTime = Date.now();
  }

  /**
   * Initializes and injects the floating HUD into the page.
   */
  init() {
    if (document.getElementById("cognishield-hud-root")) return;

    const target = document.body || document.documentElement;
    if (!target) {
      window.addEventListener("DOMContentLoaded", () => this.init());
      return;
    }

    this.container = document.createElement("div");
    this.container.id = "cognishield-hud-root";
    this.container.className = "cognishield-hud-container";

    // Create Floating Trigger
    this.container.innerHTML = `
      <div class="cognishield-floating-trigger" id="cognishield-trigger-btn" title="CogniShield: Click to inspect filter bubble & test critical agency">
        <div class="cognishield-badge-icon cognishield-glow-green" id="cognishield-glow-dot">
          <span style="font-size: 13px;">🛡️</span>
        </div>
        <div class="cognishield-trigger-text-group">
          <span class="cognishield-badge-text">CogniShield</span>
          <span class="cognishield-badge-sub">Copilot Active</span>
        </div>
        <span class="cognishield-badge-score" id="cognishield-badge-intensity">0.0</span>
      </div>

      <div class="cognishield-modal-backdrop" id="cognishield-modal-backdrop">
        <div class="cognishield-modal-card" id="cognishield-modal-card">
          <!-- Left Edge Drag Handle (Breadth / Width Resizer) -->
          <div class="cognishield-resize-handle-left" id="cognishield-resize-left" title="Drag to adjust breadth / width"></div>
          <!-- Bottom-Left Corner Drag Handle (Breadth & Height Resizer) -->
          <div class="cognishield-resize-handle-corner" id="cognishield-resize-corner" title="Drag to adjust width and height"></div>

          <div class="cognishield-modal-header">
            <div class="cognishield-header-left">
              <div class="cognishield-shield-icon-glow">🛡️</div>
              <div>
                <h3 class="cognishield-modal-title">COGNISHIELD</h3>
                <div class="cognishield-status-row">
                  <span class="cognishield-status-dot" id="cognishield-status-indicator"></span>
                  <span class="cognishield-status-label" id="cognishield-status-text">Cognitive Assistant: Live Analysis Active</span>
                </div>
              </div>
            </div>
            <div class="cognishield-header-actions">
              <button class="cognishield-header-btn" id="cognishield-expand-btn" title="Toggle Focus Mode (Expand / Compact)">⤢</button>
              <button class="cognishield-modal-close" id="cognishield-close-btn" title="Close Panel">&times;</button>
            </div>
          </div>
          <div id="cognishield-modal-body">
            <!-- Dynamic Stepped Friction Content Injected Here -->
          </div>
        </div>
      </div>
    `;

    target.appendChild(this.container);

    // Event listeners
    const triggerBtn = document.getElementById("cognishield-trigger-btn");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleModal();
      });
    }

    const closeBtn = document.getElementById("cognishield-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Interactive Drag-to-Resize Logic (Breadth & Height)
    const card = document.getElementById("cognishield-modal-card");
    const handleLeft = document.getElementById("cognishield-resize-left");
    const handleCorner = document.getElementById("cognishield-resize-corner");
    const expandBtn = document.getElementById("cognishield-expand-btn");

    let isResizingLeft = false;
    let isResizingCorner = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 440;
    let startHeight = 0;
    let isFocusMode = false;

    if (handleLeft && card) {
      handleLeft.addEventListener("mousedown", (e) => {
        isResizingLeft = true;
        startX = e.clientX;
        startWidth = card.offsetWidth;
        document.body.style.userSelect = "none";
        handleLeft.classList.add("dragging");
        e.preventDefault();
        e.stopPropagation();
      });
    }

    if (handleCorner && card) {
      handleCorner.addEventListener("mousedown", (e) => {
        isResizingCorner = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = card.offsetWidth;
        startHeight = card.offsetHeight;
        document.body.style.userSelect = "none";
        handleCorner.classList.add("dragging");
        e.preventDefault();
        e.stopPropagation();
      });
    }

    document.addEventListener("mousemove", (e) => {
      if (isResizingLeft && card) {
        const deltaX = startX - e.clientX;
        const newWidth = Math.max(360, Math.min(window.innerWidth - 32, startWidth + deltaX));
        card.style.width = `${newWidth}px`;
      } else if (isResizingCorner && card) {
        const deltaX = startX - e.clientX;
        const newWidth = Math.max(360, Math.min(window.innerWidth - 32, startWidth + deltaX));
        card.style.width = `${newWidth}px`;

        const deltaY = e.clientY - startY;
        const newHeight = Math.max(380, Math.min(window.innerHeight - 32, startHeight + deltaY));
        card.style.height = `${newHeight}px`;
        card.style.bottom = "auto";
      }
    });

    document.addEventListener("mouseup", () => {
      if (isResizingLeft || isResizingCorner) {
        isResizingLeft = false;
        isResizingCorner = false;
        document.body.style.userSelect = "";
        if (handleLeft) handleLeft.classList.remove("dragging");
        if (handleCorner) handleCorner.classList.remove("dragging");
        try {
          if (card.style.width) localStorage.setItem("cognishield_card_width", card.style.width);
        } catch (_) {}
      }
    });

    // Restore saved width from previous sessions
    try {
      const savedWidth = localStorage.getItem("cognishield_card_width");
      if (savedWidth && card) {
        card.style.width = savedWidth;
      }
    } catch (_) {}

    // Focus Mode Toggle (1-Click Expand / Restore)
    if (expandBtn && card) {
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isFocusMode = !isFocusMode;
        if (isFocusMode) {
          card.style.width = "75vw";
          card.style.height = "calc(100vh - 32px)";
          card.style.bottom = "16px";
          expandBtn.textContent = "⤡";
          expandBtn.title = "Restore Normal Width";
        } else {
          card.style.width = "440px";
          card.style.height = "calc(100vh - 32px)";
          card.style.bottom = "16px";
          expandBtn.textContent = "⤢";
          expandBtn.title = "Focus Mode (Expand Breadth)";
        }
      });
    }

    // Close on click outside the right-side card
    document.addEventListener("click", (e) => {
      if (isResizingLeft || isResizingCorner) return;
      const backdrop = document.getElementById("cognishield-modal-backdrop");
      const cardEl = document.getElementById("cognishield-modal-card");
      const trigger = document.getElementById("cognishield-trigger-btn");
      if (!backdrop || !backdrop.classList.contains("active")) return;
      if (cardEl && !cardEl.contains(e.target) && trigger && !trigger.contains(e.target)) {
        this.closeModal();
      }
    });

    // Close on Escape key (only when modal is active)
    document.addEventListener("keydown", (e) => {
      const backdrop = document.getElementById("cognishield-modal-backdrop");
      if (e.key === "Escape" && backdrop && backdrop.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  /**
   * Updates Level 1 Subconscious Ambient Glow
   */
  updateAmbientStatus(intensityScore, matchCount) {
    const trigger = document.getElementById("cognishield-trigger-btn");
    const glowDot = document.getElementById("cognishield-glow-dot");
    const intensityBadge = document.getElementById("cognishield-badge-intensity");
    if (!glowDot || !intensityBadge) return;

    intensityBadge.textContent = intensityScore.toFixed(1);

    // Color transition based on manipulation threshold
    glowDot.className = "cognishield-badge-icon";
    if (intensityScore < 3.5) {
      glowDot.classList.add("cognishield-glow-green");
      if (trigger) {
        trigger.style.borderColor = "rgba(16, 185, 129, 0.45)";
        trigger.title = "CogniShield: Low Emotional Manipulation (Calm Analysis)";
      }
    } else if (intensityScore < 7.0) {
      glowDot.classList.add("cognishield-glow-amber");
      if (trigger) {
        trigger.style.borderColor = "rgba(245, 158, 11, 0.5)";
        trigger.title = "CogniShield: Moderate Sensationalism / Polling Bias";
      }
    } else {
      glowDot.classList.add("cognishield-glow-red");
      if (trigger) {
        trigger.style.borderColor = "rgba(239, 68, 68, 0.6)";
        trigger.title = "CogniShield Alert: High Outrage / Filter-Bubble Hook Detected";
      }
    }
  }

  /**
   * Loads dialectic dossier into the modal card
   */
  loadDossier(data) {
    this.currentData = data;
    const body = document.getElementById("cognishield-modal-body");
    if (!body || !data) return;

    const quiz = data.micro_quiz || {
      question: "Can you spot the cognitive hook in this content?",
      options: ["A) Emotional Appeal", "B) False Dilemma", "C) Objective Evidence"],
      correctIndex: 0,
      explanation: "Emotional language is leveraged to prompt intuitive System 1 consensus."
    };

    const counterViews = (data.hidden_counter_perspectives || []).map(cp => `
      <div class="cognishield-perspective-item">
        <span class="cognishield-archetype-pill">[${cp.archetype || 'Empirical'}]</span>
        <div style="font-weight: 600; font-size: 13px; color: #F1F5F9; margin-top: 2px;">${cp.label || 'Counter-Perspective'}</div>
        <div style="font-size: 12px; color: #CBD5E1; margin-top: 4px; line-height: 1.4;">${cp.summary || cp.argument || ''}</div>
        <div class="cognishield-citation">Source: ${cp.citation || 'Verified Institutional Dossier'}</div>
      </div>
    `).join("");

    body.innerHTML = `
      <!-- Active Topic Bar -->
      <div class="cognishield-topic-banner">
        <span class="cognishield-topic-tag">ACTIVE TOPIC</span>
        <div class="cognishield-topic-title">${data.contextTitle || data.title || "Real-Time Feed Analysis"}</div>
      </div>

      <!-- CARD 1: Blindspot Radar (Concentric Rings Matching Official Mockup) -->
      <div class="cognishield-card cognishield-card-radar">
        <div class="cognishield-card-header">
          <div class="cognishield-card-title-group">
            <span class="cognishield-icon-radar">🎯</span>
            <span class="cognishield-card-title">Blindspot Radar</span>
          </div>
          <span class="cognishield-badge-count">3 Omitted Perspectives</span>
        </div>

        <div class="cognishield-radar-layout">
          <!-- Concentric Circular Radial Arcs SVG -->
          <div class="cognishield-radar-svg-wrap">
            <svg viewBox="0 0 100 100" class="cognishield-concentric-svg">
              <!-- Background Tracks -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
              
              <!-- Active Progress Rings -->
              <!-- Outer Ring: Economic (Cyan #06B6D4) - 70% -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="#06B6D4" stroke-width="7"
                stroke-dasharray="251.2" stroke-dashoffset="75.3" stroke-linecap="round"
                transform="rotate(-90 50 50)" class="cognishield-ring-anim" />
              <!-- Middle Ring: Social Impact (Orange #F97316) - 50% -->
              <circle cx="50" cy="50" r="30" fill="none" stroke="#F97316" stroke-width="7"
                stroke-dasharray="188.5" stroke-dashoffset="94.2" stroke-linecap="round"
                transform="rotate(-90 50 50)" class="cognishield-ring-anim" />
              <!-- Inner Ring: Statutory / Policy (Yellow #FBBF24) - 45% -->
              <circle cx="50" cy="50" r="20" fill="none" stroke="#FBBF24" stroke-width="7"
                stroke-dasharray="125.6" stroke-dashoffset="69.1" stroke-linecap="round"
                transform="rotate(-90 50 50)" class="cognishield-ring-anim" />
            </svg>
            <div class="cognishield-radar-center-text">
              <span class="cognishield-radar-center-num">3</span>
              <span class="cognishield-radar-center-lbl">Perspectives</span>
            </div>
          </div>

          <!-- Radar Legend & Metrics -->
          <div class="cognishield-radar-legend">
            <div class="cognishield-legend-item">
              <span class="cognishield-dot dot-cyan"></span>
              <div class="cognishield-legend-text">
                <span class="cognishield-legend-name">Economic Stability</span>
                <span class="cognishield-legend-val">70%</span>
              </div>
            </div>
            <div class="cognishield-legend-item">
              <span class="cognishield-dot dot-orange"></span>
              <div class="cognishield-legend-text">
                <span class="cognishield-legend-name">Social Impact</span>
                <span class="cognishield-legend-val">50%</span>
              </div>
            </div>
            <div class="cognishield-legend-item">
              <span class="cognishield-dot dot-yellow"></span>
              <div class="cognishield-legend-text">
                <span class="cognishield-legend-name">Policy & Legal</span>
                <span class="cognishield-legend-val">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 2: Manipulation Heatmap (Matching Mockup Biases Chips) -->
      <div class="cognishield-card cognishield-card-heatmap">
        <div class="cognishield-card-header">
          <div class="cognishield-card-title-group">
            <span class="cognishield-icon-fire">🔥</span>
            <span class="cognishield-card-title">Manipulation Heatmap</span>
          </div>
          <span class="cognishield-intensity-tag">Intensity: ${data.emotional_intensity || '7.5'}/10</span>
        </div>
        <div class="cognishield-biases-label">Highlighted In-DOM Biases:</div>
        <div class="cognishield-chips-container">
          <span class="cognishield-chip chip-red">
            <span class="chip-badge">2</span> Sensationalism
          </span>
          <span class="cognishield-chip chip-orange">
            <span class="chip-badge">3</span> Emotional Appeals
          </span>
          <span class="cognishield-chip chip-yellow">
            <span class="chip-badge">1</span> Language Loading
          </span>
        </div>
      </div>

      <!-- CARD 3: Socratic Reflection (Matching Mockup Pause & Reflect) -->
      <div class="cognishield-card cognishield-card-socratic">
        <div class="cognishield-card-header">
          <div class="cognishield-card-title-group">
            <span class="cognishield-icon-brain">🧠</span>
            <span class="cognishield-card-title">Socratic Reflection: Pause & Reflect</span>
          </div>
          <span class="cognishield-pill-amber">12s Productive Friction</span>
        </div>
        <div class="cognishield-socratic-quote">
          “${(data.socratic_dialogue && data.socratic_dialogue[0]) || 'Think First: What unstated assumption is being made regarding the data source?'}”
        </div>
        <div class="cognishield-socratic-actions">
          <button class="btn-cognishield-secondary" id="btn-socratic-dismiss">Continue Reading</button>
          <button class="btn-cognishield-primary" id="btn-socratic-deepdive">Dive Deeper</button>
        </div>
      </div>

      <!-- SOURCED PERSPECTIVES ACCORDION / EXPANDED DOSSIER -->
      <div id="cognishield-deepdive-section" class="cognishield-card cognishield-card-perspectives" style="margin-top: 12px;">
        <div class="cognishield-card-header">
          <span class="cognishield-card-title">📚 Verified Counter-Perspectives</span>
          <span class="cognishield-badge-source">Zero Censorship</span>
        </div>
        <div class="cognishield-counter-list">
          ${counterViews}
        </div>
      </div>

      <!-- LEVEL 2 STEPPED FRICTION QUIZ -->
      <div class="cognishield-card cognishield-card-quiz" style="margin-top: 12px;">
        <div class="cognishield-card-header">
          <span class="cognishield-card-title">⚡ 5-Second Agency Challenge</span>
          <span class="cognishield-badge-agency">+5 Agency Pts</span>
        </div>
        <div style="font-weight: 600; font-size: 13px; margin: 8px 0; color: #F1F5F9;">${quiz.question}</div>
        <div id="cognishield-quiz-options">
          ${quiz.options.map((opt, idx) => `
            <button class="cognishield-quiz-option" data-idx="${idx}">${opt}</button>
          `).join("")}
        </div>
        <div id="cognishield-quiz-feedback" class="cognishield-quiz-feedback"></div>
      </div>

      <!-- Epistemic Transparency Disclaimer -->
      <div class="cognishield-transparency-card">
        🛡️ <strong>Epistemic Transparency:</strong> ${data.epistemic_card ? data.epistemic_card.disclaimer : 'CogniShield reveals omitted perspectives to empower human scrutiny. We never censor or alter original sources.'}
      </div>
    `;

    // Bind Socratic Action Buttons
    const btnDismiss = body.querySelector("#btn-socratic-dismiss");
    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => {
        this.closeModal();
      });
    }

    const btnDeepDive = body.querySelector("#btn-socratic-deepdive");
    if (btnDeepDive) {
      btnDeepDive.addEventListener("click", () => {
        const deepSection = body.querySelector("#cognishield-deepdive-section");
        if (deepSection) {
          deepSection.scrollIntoView({ behavior: "smooth" });
          deepSection.style.borderColor = "rgba(56, 189, 248, 0.8)";
          setTimeout(() => {
            deepSection.style.borderColor = "rgba(255, 255, 255, 0.12)";
          }, 1500);
        }
      });
    }

    // Bind Quiz Option Clicks
    const optionBtns = body.querySelectorAll(".cognishield-quiz-option");
    const feedbackBox = body.querySelector("#cognishield-quiz-feedback");

    optionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const selected = parseInt(btn.getAttribute("data-idx"), 10);
        const correct = selected === quiz.correctIndex;

        optionBtns.forEach(b => b.style.pointerEvents = "none");

        if (correct) {
          feedbackBox.className = "cognishield-quiz-feedback correct";
          feedbackBox.innerHTML = `✓ <strong>Spot on!</strong> ${quiz.explanation}`;
        } else {
          feedbackBox.className = "cognishield-quiz-feedback incorrect";
          feedbackBox.innerHTML = `✕ <strong>Reflect again:</strong> ${quiz.explanation}`;
        }

        // Log interaction to local storage
        if (window.CogniShieldStorage) {
          const dwell = Math.round((Date.now() - this.startTime) / 1000);
          window.CogniShieldStorage.logSession({
            domain: window.location.hostname,
            quizAnswered: true,
            quizCorrect: correct,
            dwellSeconds: dwell,
            emotionalIntensity: data.emotional_intensity || 5,
            biasCategory: data.bias_category || "outrage_anger"
          });
        }
      });
    });
  }

  toggleModal() {
    const backdrop = document.getElementById("cognishield-modal-backdrop");
    if (backdrop && backdrop.classList.contains("active")) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  openModal() {
    const backdrop = document.getElementById("cognishield-modal-backdrop");
    if (backdrop) backdrop.classList.add("active");
    if (this.container) this.container.classList.add("modal-open");
  }

  closeModal() {
    const backdrop = document.getElementById("cognishield-modal-backdrop");
    if (backdrop) backdrop.classList.remove("active");
    if (this.container) this.container.classList.remove("modal-open");
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { HUDOverlayController };
} else {
  window.CogniShieldHUD = new HUDOverlayController();
}

