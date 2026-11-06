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
          <div class="cognishield-modal-header">
            <div class="cognishield-header-left">
              <span style="font-size: 20px;">🛡️</span>
              <h3 class="cognishield-modal-title">CogniShield Dialectic Copilot</h3>
            </div>
            <button class="cognishield-modal-close" id="cognishield-close-btn" title="Close Panel">&times;</button>
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

    // Close on click outside the right-side card
    document.addEventListener("click", (e) => {
      const backdrop = document.getElementById("cognishield-modal-backdrop");
      const card = document.getElementById("cognishield-modal-card");
      const trigger = document.getElementById("cognishield-trigger-btn");
      if (!backdrop || !backdrop.classList.contains("active")) return;
      if (card && !card.contains(e.target) && trigger && !trigger.contains(e.target)) {
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
    const glowDot = document.getElementById("cognishield-glow-dot");
    const intensityBadge = document.getElementById("cognishield-badge-intensity");
    if (!glowDot || !intensityBadge) return;

    intensityBadge.textContent = intensityScore.toFixed(1);

    // Color transition based on manipulation threshold
    glowDot.className = "cognishield-badge-icon";
    if (intensityScore < 3.5) {
      glowDot.classList.add("cognishield-glow-green");
    } else if (intensityScore < 7.0) {
      glowDot.classList.add("cognishield-glow-amber");
    } else {
      glowDot.classList.add("cognishield-glow-red");
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

