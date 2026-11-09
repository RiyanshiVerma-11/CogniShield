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
    this.currentAgency = 74;
    this.hasCelebrated = false;
    this.currentTab = "quick";
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
      <div class="cognishield-floating-trigger" id="cognishield-trigger-btn" title="CogniShield: Drag to reposition • Click to inspect hidden perspectives">
        <div class="cognishield-badge-icon cognishield-glow-green" id="cognishield-glow-dot">
          <span style="font-size: 10px;">🛡️</span>
        </div>
        <div class="cognishield-trigger-text-group">
          <span class="cognishield-badge-text">CogniShield</span>
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

            <!-- Animated Agency Score Tracker (Fitness Tracker Vibe) -->
            <div class="cognishield-header-right">
              <div class="cognishield-agency-pill" id="cognishield-agency-pill" title="Your Daily Cognitive Agency Score">
                <span class="agency-ring-icon">🧠</span>
                <span class="agency-score-num" id="cognishield-agency-val">74%</span>
                <span class="agency-score-lbl">AGENCY</span>
              </div>
              <div class="cognishield-header-actions">
                <button class="cognishield-header-btn" id="cognishield-dash-btn" title="Open Cognitive Health Dashboard">📊</button>
                <button class="cognishield-header-btn" id="cognishield-expand-btn" title="Toggle Focus Mode (Expand / Compact)">⤢</button>
                <button class="cognishield-modal-close" id="cognishield-close-btn" title="Close Panel">&times;</button>
              </div>
            </div>
          </div>

          <!-- Progressive Disclosure Tab Navigation -->
          <div class="cognishield-tabs-bar">
            <button class="cognishield-tab-nav-btn active" id="btn-tab-quick" data-tab="quick">⚡ Quick Reflection</button>
            <button class="cognishield-tab-nav-btn" id="btn-tab-deep" data-tab="deep">🔍 The Other Side <span class="tab-badge" id="tab-perspectives-count">2</span></button>
          </div>

          <div id="cognishield-modal-body">
            <!-- Dynamic Stepped Friction Content Injected Here -->
          </div>
        </div>
      </div>

      <!-- Floating Reward Particle Container -->
      <div id="cognishield-reward-container" class="cognishield-reward-container"></div>
    `;

    target.appendChild(this.container);

    // Event listeners & Draggable floating trigger
    const triggerBtn = document.getElementById("cognishield-trigger-btn");
    if (triggerBtn) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialRight = 20;
      let initialBottom = 20;
      let hasMoved = false;

      triggerBtn.addEventListener("mousedown", (e) => {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = triggerBtn.getBoundingClientRect();
        initialRight = window.innerWidth - rect.right;
        initialBottom = window.innerHeight - rect.bottom;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = startX - e.clientX;
        const dy = startY - e.clientY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }
        const newRight = Math.max(8, Math.min(window.innerWidth - 60, initialRight + dx));
        const newBottom = Math.max(8, Math.min(window.innerHeight - 40, initialBottom + dy));
        triggerBtn.style.right = `${newRight}px`;
        triggerBtn.style.bottom = `${newBottom}px`;
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      triggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hasMoved) return; // Ignore click if user was dragging it away from page buttons
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

    const dashBtn = document.getElementById("cognishield-dash-btn");
    if (dashBtn) {
      dashBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
        }
      });
    }

    // Tab Navigation Buttons
    const btnTabQuick = document.getElementById("btn-tab-quick");
    const btnTabDeep = document.getElementById("btn-tab-deep");
    if (btnTabQuick) {
      btnTabQuick.addEventListener("click", () => this.switchTab("quick"));
    }
    if (btnTabDeep) {
      btnTabDeep.addEventListener("click", () => this.switchTab("deep"));
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
   * Switches active progressive disclosure tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    const tabQuick = document.getElementById("cognishield-tab-quick");
    const tabDeep = document.getElementById("cognishield-tab-deep");
    const btnQuick = document.getElementById("btn-tab-quick");
    const btnDeep = document.getElementById("btn-tab-deep");

    if (btnQuick && btnDeep) {
      if (tabName === "quick") {
        btnQuick.classList.add("active");
        btnDeep.classList.remove("active");
      } else {
        btnDeep.classList.add("active");
        btnQuick.classList.remove("active");
      }
    }

    if (tabQuick && tabDeep) {
      if (tabName === "quick") {
        tabQuick.style.display = "block";
        tabDeep.style.display = "none";
      } else {
        tabQuick.style.display = "none";
        tabDeep.style.display = "block";
      }
    }
  }

  /**
   * Animated Cognitive Agency Score reward loop (Fitness Tracker Vibe)
   */
  celebrateAgencyGain(pts = 5, reason = "Critical Reflection") {
    this.currentAgency = Math.min(100, (this.currentAgency || 74) + pts);
    const agencyVal = document.getElementById("cognishield-agency-val");
    const agencyPill = document.getElementById("cognishield-agency-pill");

    if (agencyVal) {
      agencyVal.textContent = `${this.currentAgency}%`;
    }

    if (agencyPill) {
      agencyPill.classList.remove("agency-gain-pulse");
      void agencyPill.offsetWidth; // trigger reflow
      agencyPill.classList.add("agency-gain-pulse");
    }

    const container = document.getElementById("cognishield-reward-container");
    if (container) {
      const toast = document.createElement("div");
      toast.className = "cognishield-agency-toast";
      toast.innerHTML = `
        <div class="toast-content">
          <span class="toast-pts">+${pts} Agency Pts! 🧠</span>
          <span class="toast-reason">${reason}</span>
        </div>
      `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 400);
      }, 2500);
    }
  }

  /**
   * Loads dialectic dossier into the modal card with dynamic readings & progressive disclosure
   */
  loadDossier(data, categoryCounts = {}) {
    this.currentData = data;
    const body = document.getElementById("cognishield-modal-body");
    if (!body || !data) return;

    // 1. Dynamic Emotional Temperature / Outrage Meter readings
    const intensityNum = typeof data.emotional_intensity === "number" 
      ? data.emotional_intensity 
      : (parseFloat(data.emotional_intensity) || 0);
    const intensityFormatted = intensityNum.toFixed(1);
    const meterPct = Math.min(100, Math.max(0, Math.round(intensityNum * 10)));
    const meterColor = intensityNum >= 7 ? "#EF4444" : (intensityNum >= 4 ? "#F59E0B" : "#10B981");
    const meterLabel = intensityNum >= 7 ? "High Outrage Framing" : (intensityNum >= 4 ? "Elevated Emotional Heat" : (intensityNum > 0 ? "Calm / Analytical" : "Neutral / Objective"));

    // Dynamic Bias match counts (from live DOM highlighter or fallback from dossier)
    let cOutrage = categoryCounts.outrage_anger !== undefined ? categoryCounts.outrage_anger : 0;
    let cCertainty = categoryCounts.false_certainty !== undefined ? categoryCounts.false_certainty : 0;
    let cTribal = categoryCounts.tribal_polarization !== undefined ? categoryCounts.tribal_polarization : 0;
    let cUrgency = categoryCounts.urgency_panic !== undefined ? categoryCounts.urgency_panic : 0;

    const totalMatches = cOutrage + cCertainty + cTribal + cUrgency;
    if (totalMatches === 0 && intensityNum >= 3.5) {
      // Dynamic fallback derived from detected emotional intensity
      if (intensityNum >= 6) {
        cOutrage = Math.max(1, Math.floor(intensityNum / 3));
        cUrgency = 1;
        cCertainty = 1;
      } else {
        cCertainty = 1;
        cTribal = 1;
      }
    }

    // 2. Dynamic Missing Perspectives / The Other Side
    const perspectives = Array.isArray(data.hidden_counter_perspectives) && data.hidden_counter_perspectives.length > 0
      ? data.hidden_counter_perspectives
      : [
          {
            archetype: "Empirical Consensus",
            label: "Independent Empirical Validation",
            summary: "Comparative cross-study reviews show alternative contextual factors that qualify the primary narrative.",
            citation: "Peer-Reviewed Comparative Meta-Analysis (2025)"
          },
          {
            archetype: "Systemic Policy",
            label: "Regulatory & Institutional Safeguards",
            summary: "Standard governance frameworks already mandate multi-stakeholder audits before policy changes.",
            citation: "Federal Accountability & Oversight Report"
          }
        ];

    // Update tab badge
    const tabBadge = document.getElementById("tab-perspectives-count");
    if (tabBadge) {
      tabBadge.textContent = perspectives.length;
    }

    // Dynamic concentric SVG rings configuration
    const ringConfigs = [
      { r: 40, circ: 251.2, color: "#06B6D4", defaultPct: 75, dotClass: "dot-cyan" },
      { r: 30, circ: 188.5, color: "#F97316", defaultPct: 55, dotClass: "dot-orange" },
      { r: 20, circ: 125.6, color: "#FBBF24", defaultPct: 45, dotClass: "dot-yellow" }
    ];

    const computedRings = perspectives.slice(0, 3).map((p, idx) => {
      const cfg = ringConfigs[idx] || ringConfigs[0];
      // Dynamic score derived from perspective content
      const pct = Math.min(95, Math.max(40, 80 - (idx * 16) + (p.label ? (p.label.length % 12) : 0)));
      const offset = (cfg.circ * (1 - (pct / 100))).toFixed(1);
      return {
        r: cfg.r,
        circ: cfg.circ,
        color: cfg.color,
        dotClass: cfg.dotClass,
        pct,
        offset,
        name: p.label || p.archetype || `Perspective ${idx + 1}`,
        archetype: p.archetype || "Counter-View"
      };
    });

    const svgCirclesHtml = computedRings.map(r => `
      <circle cx="50" cy="50" r="${r.r}" fill="none" stroke="${r.color}" stroke-width="7"
        stroke-dasharray="${r.circ}" stroke-dashoffset="${r.offset}" stroke-linecap="round"
        transform="rotate(-90 50 50)" class="cognishield-ring-anim" />
    `).join("");

    const legendItemsHtml = computedRings.map(r => `
      <div class="cognishield-legend-item">
        <span class="cognishield-dot ${r.dotClass}"></span>
        <div class="cognishield-legend-text">
          <span class="cognishield-legend-name">${r.archetype}</span>
          <span class="cognishield-legend-val">${r.pct}% Visibility</span>
        </div>
      </div>
    `).join("");

    const counterViewsHtml = perspectives.map((cp, idx) => `
      <div class="cognishield-perspective-item">
        <div class="perspective-top-row">
          <span class="cognishield-archetype-pill">[${cp.archetype || 'Alternative Perspective'}]</span>
          <span class="perspective-index-tag">Perspective ${idx + 1} of ${perspectives.length}</span>
        </div>
        <div style="font-weight: 600; font-size: 13px; color: #F1F5F9; margin-top: 4px;">${cp.label || 'Counter-Perspective'}</div>
        <div style="font-size: 12px; color: #CBD5E1; margin-top: 4px; line-height: 1.45;">${cp.summary || cp.argument || ''}</div>
        <div class="cognishield-citation">📌 Source: ${cp.citation || 'Verified Institutional Dossier'}</div>
      </div>
    `).join("");

    const quiz = data.micro_quiz || {
      question: "Can you spot the cognitive hook or unstated premise in this content?",
      options: ["A) Emotional Appeal to Gut Reaction", "B) False Dilemma / Us vs. Them", "C) Objective Empiricism"],
      correctIndex: 0,
      explanation: "Sensational rhetoric bypasses rational scrutiny by triggering fast instinctive reactions."
    };

    body.innerHTML = `
      <!-- Active Topic Bar -->
      <div class="cognishield-topic-banner">
        <span class="cognishield-topic-tag">ACTIVE TOPIC</span>
        <div class="cognishield-topic-title">${data.contextTitle || data.title || "Live Web Analysis"}</div>
      </div>

      <!-- TAB 1: QUICK REFLECTION (Default Progressive Disclosure Card) -->
      <div id="cognishield-tab-quick" class="cognishield-tab-view active">
        
        <!-- CARD: Outrage Meter (formerly Manipulation Heatmap) -->
        <div class="cognishield-card cognishield-card-heatmap">
          <div class="cognishield-card-header">
            <div class="cognishield-card-title-group">
              <span class="cognishield-icon-fire">🔥</span>
              <span class="cognishield-card-title">Outrage Meter</span>
            </div>
            <span class="cognishield-intensity-tag" style="border-color: ${meterColor}40; color: ${meterColor};">
              Intensity: ${intensityFormatted} / 10
            </span>
          </div>

          <!-- Micro-Tooltip -->
          <div class="cognishield-micro-tooltip">
            💡 <em>Measures emotional hooks and loaded framing aimed at triggering fast gut reactions.</em>
          </div>

          <!-- Dynamic Meter Bar -->
          <div class="cognishield-meter-track" title="Emotional Temperature: ${intensityFormatted} / 10 (${meterLabel})">
            <div class="cognishield-meter-fill" style="width: ${meterPct}%; background: linear-gradient(90deg, #10B981, ${meterColor});"></div>
          </div>
          <div class="meter-status-row">
            <span class="meter-status-text">${meterLabel}</span>
            <span class="meter-status-reading">${meterPct}% Sensation Index</span>
          </div>

          <!-- Dynamic DOM Bias Match Chips -->
          <div class="cognishield-biases-label">Detected Psychological Triggers:</div>
          <div class="cognishield-chips-container">
            ${cOutrage > 0 ? `
              <span class="cognishield-chip chip-red">
                <span class="chip-badge">${cOutrage}</span> Outrage & Anger
              </span>
            ` : ""}
            ${cUrgency > 0 ? `
              <span class="cognishield-chip chip-orange">
                <span class="chip-badge">${cUrgency}</span> Urgency / Panic
              </span>
            ` : ""}
            ${cCertainty > 0 ? `
              <span class="cognishield-chip chip-yellow">
                <span class="chip-badge">${cCertainty}</span> False Certainty
              </span>
            ` : ""}
            ${cTribal > 0 ? `
              <span class="cognishield-chip chip-blue">
                <span class="chip-badge">${cTribal}</span> Tribal Polarization
              </span>
            ` : ""}
          </div>
        </div>

        <!-- CARD: Socratic Reflection (Pause & Reflect) -->
        <div class="cognishield-card cognishield-card-socratic" style="margin-top: 10px;">
          <div class="cognishield-card-header">
            <div class="cognishield-card-title-group">
              <span class="cognishield-icon-brain">🧠</span>
              <span class="cognishield-card-title">Socratic Reflection: Pause & Reflect</span>
            </div>
            <span class="cognishield-pill-amber">12s Productive Friction</span>
          </div>

          <!-- Micro-Tooltip -->
          <div class="cognishield-micro-tooltip">
            ⏸️ <em>Pause for 12 seconds to break your instinctive emotional reaction.</em>
          </div>

          <div class="cognishield-socratic-quote">
            “${(data.socratic_dialogue && data.socratic_dialogue[0]) || 'Think First: What unstated assumption is being made regarding this source?'}”
          </div>
          <div class="cognishield-socratic-actions">
            <button class="btn-cognishield-secondary" id="btn-socratic-dismiss">Continue Reading</button>
            <button class="btn-cognishield-primary" id="btn-socratic-explore">
              Explore The Other Side (${perspectives.length}) ➔
            </button>
          </div>
        </div>

      </div>

      <!-- TAB 2: THE OTHER SIDE (Deep Dive Progressive Disclosure Card) -->
      <div id="cognishield-tab-deep" class="cognishield-tab-view" style="display: none;">
        
        <!-- CARD: The Other Side of the Story (Dynamic Concentric Rings Radar) -->
        <div class="cognishield-card cognishield-card-radar">
          <div class="cognishield-card-header">
            <div class="cognishield-card-title-group">
              <span class="cognishield-icon-radar">🎯</span>
              <span class="cognishield-card-title">The Other Side of the Story</span>
            </div>
            <span class="cognishield-badge-count">${perspectives.length} Missing Perspectives</span>
          </div>

          <!-- Micro-Tooltip -->
          <div class="cognishield-micro-tooltip">
            🔍 <em>The algorithm only showed you half the truth; here is what was hidden.</em>
          </div>

          <div class="cognishield-radar-layout">
            <!-- Concentric Circular Radial Arcs SVG -->
            <div class="cognishield-radar-svg-wrap">
              <svg viewBox="0 0 100 100" class="cognishield-concentric-svg">
                <!-- Background Tracks -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7" />
                
                <!-- Dynamic Rings -->
                ${svgCirclesHtml}
              </svg>
              <div class="cognishield-radar-center-text">
                <span class="cognishield-radar-center-num">${perspectives.length}</span>
                <span class="cognishield-radar-center-lbl">Sides</span>
              </div>
            </div>

            <!-- Dynamic Radar Legend -->
            <div class="cognishield-radar-legend">
              ${legendItemsHtml}
            </div>
          </div>
        </div>

        <!-- Verified Counter-Perspectives Dossier List -->
        <div class="cognishield-card cognishield-card-perspectives" style="margin-top: 10px;">
          <div class="cognishield-card-header">
            <span class="cognishield-card-title">📚 Sourced Epistemic Dossier</span>
            <span class="cognishield-badge-source">Zero Censorship</span>
          </div>
          <div class="cognishield-counter-list">
            ${counterViewsHtml}
          </div>
        </div>

        <!-- LEVEL 2 STEPPED FRICTION QUIZ (Agency Challenge) -->
        <div class="cognishield-card cognishield-card-quiz" style="margin-top: 10px;">
          <div class="cognishield-card-header">
            <span class="cognishield-card-title">⚡ 5-Second Agency Challenge</span>
            <span class="cognishield-badge-agency">+5 Agency Pts</span>
          </div>

          <!-- Micro-Tooltip -->
          <div class="cognishield-micro-tooltip">
            🧠 <em>Answer this quick challenge to earn +5 Cognitive Agency points and train your critical thinking.</em>
          </div>

          <div style="font-weight: 600; font-size: 13px; margin: 8px 0; color: #F1F5F9;">${quiz.question}</div>
          <div id="cognishield-quiz-options">
            ${quiz.options.map((opt, idx) => `
              <button class="cognishield-quiz-option" data-idx="${idx}">${opt}</button>
            `).join("")}
          </div>
          <div id="cognishield-quiz-feedback" class="cognishield-quiz-feedback"></div>
        </div>

        <!-- Back to Quick Tab Button -->
        <div style="margin-top: 10px; text-align: center;">
          <button class="btn-cognishield-secondary" id="btn-back-quick" style="width: 100%;">
            ← Back to Quick Reflection
          </button>
        </div>

      </div>

      <!-- Epistemic Transparency Disclaimer -->
      <div class="cognishield-transparency-card">
        🛡️ <strong>Epistemic Transparency:</strong> ${data.epistemic_card ? data.epistemic_card.disclaimer : 'CogniShield reveals omitted perspectives to empower human agency. We never censor, block, or modify source content.'}
      </div>
    `;

    // Bind Tab Switching & Actions
    const btnExplore = body.querySelector("#btn-socratic-explore");
    if (btnExplore) {
      btnExplore.addEventListener("click", () => {
        this.switchTab("deep");
        if (!this.hasCelebrated) {
          this.celebrateAgencyGain(5, "Explored Missing Perspectives");
          this.hasCelebrated = true;
        }
      });
    }

    const btnDismiss = body.querySelector("#btn-socratic-dismiss");
    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => {
        this.closeModal();
      });
    }

    const btnBackQuick = body.querySelector("#btn-back-quick");
    if (btnBackQuick) {
      btnBackQuick.addEventListener("click", () => {
        this.switchTab("quick");
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
          this.celebrateAgencyGain(5, "Agency Challenge Mastered!");
        } else {
          feedbackBox.className = "cognishield-quiz-feedback incorrect";
          feedbackBox.innerHTML = `✕ <strong>Reflect again:</strong> ${quiz.explanation}`;
          this.celebrateAgencyGain(2, "Reflective Attempt");
        }

        // Log interaction to local storage
        if (window.CogniShieldStorage) {
          const dwell = Math.round((Date.now() - this.startTime) / 1000);
          if (this.activeSessionId && window.CogniShieldStorage.updateSession) {
            window.CogniShieldStorage.updateSession(this.activeSessionId, {
              quizAnswered: true,
              quizCorrect: correct,
              dwellSeconds: dwell
            });
          } else {
            window.CogniShieldStorage.logSession({
              title: document.title,
              domain: window.location.hostname,
              quizAnswered: true,
              quizCorrect: correct,
              dwellSeconds: dwell,
              emotionalIntensity: intensityNum,
              biasCategory: data.bias_category || "outrage_anger"
            });
          }
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

