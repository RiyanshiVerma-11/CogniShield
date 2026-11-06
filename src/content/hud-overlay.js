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
        <div class="cognishield-badge-icon cognishield-glow-green" id="cognishield-glow-dot"></div>
        <span class="cognishield-badge-text">CogniShield</span>
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
              <span style="font-size: 20px;">🛡️</span>
              <h3 class="cognishield-modal-title">CogniShield Dialectic Copilot</h3>
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

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
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
      <!-- Level 2: Stepped Friction Micro-Quiz -->
      <div class="cognishield-section-badge">Level 2: 5-Second Quick-Reflect</div>
      <div class="cognishield-quiz-card">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${quiz.question}</div>
        <div id="cognishield-quiz-options">
          ${quiz.options.map((opt, idx) => `
            <button class="cognishield-quiz-option" data-idx="${idx}">${opt}</button>
          `).join("")}
        </div>
        <div id="cognishield-quiz-feedback" class="cognishield-quiz-feedback"></div>
      </div>

      <!-- Level 3: Blindspot Radar & Socratic Dialectic -->
      <div class="cognishield-section-badge">Level 3: Blindspot Radar & Sourced Counter-Views</div>
      <div class="cognishield-radar-card">
        <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px; line-height: 1.4;">
          <strong style="color: #F8FAFC;">Active Topic:</strong> <span style="color: #38BDF8;">${data.contextTitle || data.title}</span>
        </div>
        <div style="font-size: 13px; color: #94A3B8;">
          <strong style="color: #F8FAFC;">Detected Tone:</strong> ${data.source_perspective || 'Single-Perspective Feeds'}
          <span style="float: right; color: #F7941D; font-weight: 700;">Intensity: ${data.emotional_intensity || '7.5'}/10</span>
        </div>

        <!-- Epistemic Filter-Bubble Radar Visualizer -->
        <div class="cognishield-filter-bubble-widget">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #38BDF8; letter-spacing: 0.5px;">EPISTEMIC BUBBLE RADAR</span>
            <span style="font-size: 10px; color: #94A3B8; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">4 Diversity Quadrants</span>
          </div>
          <svg viewBox="0 0 240 100" style="width: 100%; height: 95px; display: block; margin: 0 auto;">
            <!-- Radar concentric rings -->
            <circle cx="120" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2,2" />
            <circle cx="120" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.12)" />
            <line x1="120" y1="8" x2="120" y2="92" stroke="rgba(255,255,255,0.08)" />
            <line x1="78" y1="50" x2="162" y2="50" stroke="rgba(255,255,255,0.08)" />

            <!-- 4 Perspective Bubbles -->
            <circle cx="148" cy="30" r="14" fill="rgba(2, 132, 199, 0.35)" stroke="#0284C7" stroke-width="1.5" />
            <text x="148" y="33" fill="#E0F2FE" font-size="8" font-weight="700" text-anchor="middle">Data</text>

            <circle cx="152" cy="70" r="13" fill="rgba(168, 85, 247, 0.3)" stroke="#A855F7" stroke-width="1.5" />
            <text x="152" y="73" fill="#F3E8FF" font-size="7.5" font-weight="700" text-anchor="middle">Econ</text>

            <circle cx="88" cy="70" r="12" fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" stroke-width="1.5" />
            <text x="88" y="73" fill="#FEF3C7" font-size="7.5" font-weight="700" text-anchor="middle">Civic</text>

            <circle cx="88" cy="30" r="12" fill="rgba(168, 85, 247, 0.2)" stroke="#10B981" stroke-width="1.5" />
            <text x="88" y="33" fill="#D1FAE5" font-size="7.5" font-weight="700" text-anchor="middle">Ethic</text>

            <!-- Current Feed Anchor Bubble (Glowing dot) -->
            <circle cx="126" cy="44" r="6" fill="#F7941D" stroke="#FFFFFF" stroke-width="1.5" class="cognishield-bubble-focal" />
          </svg>
          <div style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 2px;">
            Target Narrative: <span style="color: #F7941D; font-weight: 600;">Narrow Outrage Vector</span> ➔ <span style="color: #10B981; font-weight: 600;">Multi-Perspective Diligence</span>
          </div>
        </div>
        <div style="margin-top: 12px;">${counterViews}</div>
      </div>

      <!-- Socratic Sparring Question -->
      <div class="cognishield-section-badge">Socratic Reflection</div>
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; font-size: 13px; color: #E2E8F0; font-style: italic;">
        "${(data.socratic_dialogue && data.socratic_dialogue[0]) || 'What unstated premise must you accept for this narrative to hold?'}"
      </div>

      <!-- Epistemic Transparency Disclaimer -->
      <div class="cognishield-transparency-card">
        🛡️ <strong>Epistemic Transparency:</strong> ${data.epistemic_card ? data.epistemic_card.disclaimer : 'Algorithmic hypothesis for dialectic reflection, not universal truth.'}
      </div>
    `;

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

