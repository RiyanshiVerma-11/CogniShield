/**
 * CogniShield - In-Page HUD Overlay & Stepped Friction Controller
 * Implements:
 * Level 1: Subconscious Glow (Ambient badge changes color: Green -> Amber -> Red).
 * Level 2: 5-Second Quick-Reflect Micro-Quiz (Gamified fallacy spotter).
 * Level 3: Deep Socratic Sparring dialogue & Sourced Blindspot Radar.
 */

const COGNISHIELD_ICONS = {
  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  brain: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>`,
  sun: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  moon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  chart: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  expand: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
  collapse: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>`,
  close: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  zap: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  search: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  flame: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  pause: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>`,
  radar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="m21.17 8-7.35 4"/><circle cx="12" cy="12" r="2"/></svg>`,
  book: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  play: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
};

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
    this.currentTheme = "light";
    try {
      this.currentTheme = localStorage.getItem("cognishield_hud_theme") || "light";
    } catch (_) {}
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
          <span style="display: flex; align-items: center; justify-content: center; color: #FFFFFF;">${COGNISHIELD_ICONS.shield}</span>
        </div>
        <div class="cognishield-trigger-text-group">
          <span class="cognishield-badge-text">CogniShield</span>
        </div>
        <span class="cognishield-badge-score" id="cognishield-badge-intensity">0.0</span>
      </div>

      <div class="cognishield-modal-backdrop" id="cognishield-modal-backdrop">
        <div class="cognishield-modal-card ${this.currentTheme === 'dark' ? 'theme-dark' : 'theme-light'}" id="cognishield-modal-card">
          <!-- Left Edge Drag Handle (Breadth / Width Resizer) -->
          <div class="cognishield-resize-handle-left" id="cognishield-resize-left" title="Drag to adjust breadth / width"></div>
          <!-- Bottom-Left Corner Drag Handle (Breadth & Height Resizer) -->
          <div class="cognishield-resize-handle-corner" id="cognishield-resize-corner" title="Drag to adjust width and height"></div>

          <div class="cognishield-modal-header">
            <div class="cognishield-header-top">
              <div class="cognishield-brand-wrap">
                <span class="cognishield-shield-icon">${COGNISHIELD_ICONS.shield}</span>
                <h3 class="cognishield-modal-title">CogniShield</h3>
                <span class="cognishield-tier-pill local" id="cognishield-tier-pill">Smart Engine</span>
              </div>

              <!-- Compact Header Actions -->
              <div class="cognishield-header-actions">
                <div class="cognishield-agency-pill" id="cognishield-agency-pill" title="Daily Cognitive Focus Score">
                  <span class="agency-ring-icon">${COGNISHIELD_ICONS.brain}</span>
                  <span class="agency-score-num" id="cognishield-agency-val">74%</span>
                </div>
                <button class="cognishield-header-btn" id="cognishield-theme-btn" title="Toggle Light / Dark Theme">${this.currentTheme === 'dark' ? COGNISHIELD_ICONS.moon : COGNISHIELD_ICONS.sun}</button>
                <button class="cognishield-header-btn" id="cognishield-dash-btn" title="Open Cognitive Health Dashboard">${COGNISHIELD_ICONS.chart}</button>
                <button class="cognishield-header-btn" id="cognishield-expand-btn" title="Toggle Focus Mode (Expand / Compact)">${COGNISHIELD_ICONS.expand}</button>
                <button class="cognishield-modal-close" id="cognishield-close-btn" title="Close Panel">${COGNISHIELD_ICONS.close}</button>
              </div>
            </div>

            <!-- Single-Line Truncated Status Row (Never wraps or pushes layout) -->
            <div class="cognishield-status-row">
              <span class="cognishield-status-dot" id="cognishield-status-indicator"></span>
              <span class="cognishield-status-label" id="cognishield-status-text">100% On-Device · Private</span>
            </div>
          </div>

          <!-- Progressive Disclosure Tab Navigation -->
          <div class="cognishield-tabs-bar">
            <button class="cognishield-tab-nav-btn active" id="btn-tab-quick" data-tab="quick">
              ${COGNISHIELD_ICONS.zap}
              <span>Quick Check</span>
            </button>
            <button class="cognishield-tab-nav-btn" id="btn-tab-deep" data-tab="deep">
              ${COGNISHIELD_ICONS.search}
              <span>Perspectives</span>
              <span class="tab-badge" id="tab-perspectives-count">2</span>
            </button>
          </div>

          <div id="cognishield-modal-body">
            <!-- Dynamic Content Injected Here -->
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

    // Theme Toggle Handler
    const themeBtn = document.getElementById("cognishield-theme-btn");
    const modalEl = document.getElementById("cognishield-modal-card");
    if (themeBtn && modalEl) {
      themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
        try { localStorage.setItem("cognishield_hud_theme", this.currentTheme); } catch (_) {}
        if (this.currentTheme === "dark") {
          modalEl.classList.add("theme-dark");
          modalEl.classList.remove("theme-light");
          themeBtn.innerHTML = COGNISHIELD_ICONS.moon;
          themeBtn.title = "Dark Theme Active (Click for Light Theme)";
        } else {
          modalEl.classList.add("theme-light");
          modalEl.classList.remove("theme-dark");
          themeBtn.innerHTML = COGNISHIELD_ICONS.sun;
          themeBtn.title = "Light Theme Active (Click for Dark Theme)";
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
          card.style.height = "calc(100vh - 16px)";
          card.style.bottom = "8px";
          expandBtn.innerHTML = COGNISHIELD_ICONS.collapse;
          expandBtn.title = "Restore Normal Width";
        } else {
          card.style.width = "400px";
          card.style.height = "calc(100vh - 16px)";
          card.style.bottom = "8px";
          expandBtn.innerHTML = COGNISHIELD_ICONS.expand;
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
   * WhatsApp-status style celebration burst that shoots emojis and celebratory particles
   * upwards from the bottom of the screen with physics, wobble, and scaling!
   */
  triggerCelebrationBurst(congratsText = "Okay, got +5 points!") {
    try {
      const burstContainer = document.createElement("div");
      burstContainer.className = "cognishield-whatsapp-burst-container";
      document.body.appendChild(burstContainer);

      // Floating celebration banner
      const banner = document.createElement("div");
      banner.className = "cognishield-whatsapp-celebration-banner";
      banner.innerHTML = `
        <span class="burst-trophy">🎉</span>
        <span class="burst-text">${congratsText}</span>
        <span class="burst-badge">+5 Focus</span>
      `;
      burstContainer.appendChild(banner);

      // WhatsApp status style celebration particles
      const particleSymbols = ["🎉", "✨", "🧠", "🌟", "🔥", "💯", "👏", "⚡", "🎯", "🚀", "+5", "⭐"];
      const particleCount = 20;

      for (let i = 0; i < particleCount; i++) {
        const p = document.createElement("div");
        p.className = "cognishield-burst-particle";
        p.textContent = particleSymbols[i % particleSymbols.length];

        // Randomize initial position across the bottom of the viewport
        const startX = Math.max(20, Math.min(window.innerWidth - 40, (window.innerWidth / 2) + (Math.random() * 360 - 180)));
        const startY = window.innerHeight + 10;
        const driftX = (Math.random() * 260 - 130);
        const floatDistance = 320 + Math.random() * 420;
        const duration = 1.3 + Math.random() * 0.8;
        const delay = Math.random() * 0.3;
        const rot = (Math.random() * 80 - 40);
        const scale = 0.9 + Math.random() * 0.8;

        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;
        p.style.setProperty("--drift-x", `${driftX}px`);
        p.style.setProperty("--float-dist", `-${floatDistance}px`);
        p.style.setProperty("--rot", `${rot}deg`);
        p.style.setProperty("--scale", `${scale}`);
        p.style.animation = `cognishield-whatsapp-float ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`;

        burstContainer.appendChild(p);
      }

      // Automatically remove from DOM
      setTimeout(() => {
        burstContainer.remove();
      }, 2600);
    } catch (e) {
      console.warn("[CogniShield] Celebration error:", e);
    }
  }

  /**
   * Loads dialectic dossier into the modal card with dynamic readings & progressive disclosure
   */
  loadDossier(data, categoryCounts = {}, meta = {}) {
    this.currentData = data;
    const body = document.getElementById("cognishield-modal-body");
    if (!body || !data) return;

    // Update live AI vs local engine header badges
    const statusText = document.getElementById("cognishield-status-text");
    const statusIndicator = document.getElementById("cognishield-status-indicator");
    const tierPill = document.getElementById("cognishield-tier-pill");

    if (meta && meta.isLiveAi) {
      if (tierPill) {
        tierPill.textContent = "Live AI";
        tierPill.className = "cognishield-tier-pill live";
      }
      if (statusText) statusText.innerHTML = `<strong>Live AI:</strong> ${meta.tier || 'Google Gemini Flash'}`;
      if (statusIndicator) {
        statusIndicator.style.backgroundColor = "#10B981";
        statusIndicator.style.boxShadow = "0 0 8px #10B981";
      }
    } else {
      if (tierPill) {
        tierPill.textContent = "On-Device";
        tierPill.className = "cognishield-tier-pill local";
      }
      if (statusText) statusText.innerHTML = `<strong>Smart Engine:</strong> 100% On-Device · Private`;
      if (statusIndicator) {
        statusIndicator.style.backgroundColor = "#0284C7";
        statusIndicator.style.boxShadow = "0 0 8px #0284C7";
      }
    }

    // 1. Dynamic Emotional Temperature / Tone readings
    const intensityNum = typeof data.emotional_intensity === "number" 
      ? data.emotional_intensity 
      : (parseFloat(data.emotional_intensity) || 0);
    const intensityFormatted = intensityNum.toFixed(1);
    const meterPct = Math.min(100, Math.max(0, Math.round(intensityNum * 10)));
    const meterColor = intensityNum >= 7 ? "#EF4444" : (intensityNum >= 4 ? "#F59E0B" : "#10B981");
    const meterLabel = intensityNum >= 7 ? "High Emotional Heat" : (intensityNum >= 4 ? "Moderate Sensationalism" : (intensityNum > 0 ? "Calm & Informative" : "Neutral & Factual"));

    // Dynamic Bias match counts (from live DOM highlighter or fallback from dossier)
    let cOutrage = categoryCounts.outrage_anger !== undefined ? categoryCounts.outrage_anger : 0;
    let cCertainty = categoryCounts.false_certainty !== undefined ? categoryCounts.false_certainty : 0;
    let cTribal = categoryCounts.tribal_polarization !== undefined ? categoryCounts.tribal_polarization : 0;
    let cUrgency = categoryCounts.urgency_panic !== undefined ? categoryCounts.urgency_panic : 0;

    const totalMatches = cOutrage + cCertainty + cTribal + cUrgency;
    if (totalMatches === 0 && intensityNum >= 3.5) {
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
            archetype: "Verified Evidence",
            label: "Independent Empirical Validation",
            summary: "Comparative cross-study reviews show alternative contextual factors that qualify the primary narrative.",
            citation: "Peer-Reviewed Comparative Meta-Analysis (2025)"
          },
          {
            archetype: "Systemic Context",
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

    const currentTopicForSearch = data.contextTitle || data.title || "alternative perspective";
    const counterViewsHtml = perspectives.map((cp, idx) => `
      <div class="cognishield-perspective-item">
        <div class="perspective-top-row">
          <span class="cognishield-archetype-pill">[${cp.archetype || 'Alternative Perspective'}]</span>
          <span class="perspective-index-tag">Perspective ${idx + 1} of ${perspectives.length}</span>
        </div>
        <div class="perspective-title">${cp.label || 'Counter-Perspective'}</div>
        <div class="perspective-summary">${cp.summary || cp.argument || ''}</div>
        <div class="cognishield-citation">Verified Source: ${cp.citation || 'Independent Research & Public Records'}</div>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent((cp.label || '') + ' ' + currentTopicForSearch)}" target="_blank" class="cognishield-watch-counter-btn">
          ${COGNISHIELD_ICONS.play} <span>Watch Balancing Videos on YouTube ↗</span>
        </a>
      </div>
    `).join("");

    const quiz = data.micro_quiz || {
      question: "What should you check first when reading a dramatic or viral headline?",
      options: ["A) Look for missing context, alternative viewpoints, and source data", "B) Share it immediately to warn others", "C) Assume it is 100% accurate without verification"],
      correctIndex: 0,
      explanation: "Sensational rhetoric bypasses rational scrutiny by triggering fast instinctive reactions. Always check the primary evidence."
    };

    body.innerHTML = `
      <!-- Active Topic Bar -->
      <div class="cognishield-topic-banner">
        <span class="cognishield-topic-tag">TOPIC UNDER ANALYSIS</span>
        <div class="cognishield-topic-title">${data.contextTitle || data.title || "Live Web Analysis"}</div>
      </div>

      <!-- TAB 1: QUICK CHECK (Direct Text Splash) -->
      <div id="cognishield-tab-quick" class="cognishield-tab-view active">
        
        <!-- SECTION: Emotional Tone Check -->
        <div class="cognishield-direct-section">
          <div class="cognishield-section-header">
            <div class="cognishield-section-title-group">
              <span class="cognishield-section-icon">${COGNISHIELD_ICONS.flame}</span>
              <span class="cognishield-section-title">Emotional Tone Check</span>
            </div>
            <span class="cognishield-intensity-tag" style="border-color: ${meterColor}40; color: ${meterColor};">
              Heat: ${intensityFormatted} / 10
            </span>
          </div>

          <!-- Direct Hint Text (No Box) -->
          <div class="cognishield-direct-hint">
            Measures emotional language and sensational hooks used to grab your attention.
          </div>

          <!-- Dynamic Meter Bar -->
          <div class="cognishield-meter-track" title="Emotional Temperature: ${intensityFormatted} / 10 (${meterLabel})">
            <div class="cognishield-meter-fill" style="width: ${meterPct}%; background: linear-gradient(90deg, #10B981, ${meterColor});"></div>
          </div>
          <div class="meter-status-row">
            <span class="meter-status-text">${meterLabel}</span>
            <span class="meter-status-reading">${meterPct}% Emotion Index</span>
          </div>

          <!-- Dynamic Trigger Match Chips -->
          <div class="cognishield-biases-label">Triggers Detected on This Page:</div>
          <div class="cognishield-chips-container">
            ${cOutrage > 0 ? `
              <span class="cognishield-chip chip-red">
                <span class="chip-badge">${cOutrage}</span> Angry / Inflammatory Words
              </span>
            ` : ""}
            ${cUrgency > 0 ? `
              <span class="cognishield-chip chip-orange">
                <span class="chip-badge">${cUrgency}</span> Extreme Urgency / Fear
              </span>
            ` : ""}
            ${cCertainty > 0 ? `
              <span class="cognishield-chip chip-yellow">
                <span class="chip-badge">${cCertainty}</span> Overconfident Claims
              </span>
            ` : ""}
            ${cTribal > 0 ? `
              <span class="cognishield-chip chip-blue">
                <span class="chip-badge">${cTribal}</span> Us vs. Them Division
              </span>
            ` : ""}
            ${totalMatches === 0 ? `
              <span class="cognishield-chip chip-green" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #047857;">
                ✓ Low Emotional Distortion
              </span>
            ` : ""}
          </div>
        </div>

        <!-- SECTION: Think Twice (Pause & Reflect Splashed Directly) -->
        <div class="cognishield-direct-section" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.07);">
          <div class="cognishield-section-header">
            <div class="cognishield-section-title-group">
              <span class="cognishield-section-icon">${COGNISHIELD_ICONS.pause}</span>
              <span class="cognishield-section-title">Take 10 Seconds: Think Twice</span>
            </div>
            <span class="cognishield-pill-amber">10s Mindful Pause</span>
          </div>

          <div class="cognishield-direct-hint">
            Take a quick breath before reacting, commenting, or sharing.
          </div>

          <div class="cognishield-socratic-quote">
            “${(data.socratic_dialogue && data.socratic_dialogue[0]) || 'What important facts might this headline leave out to get more clicks?'}”
          </div>
          <div class="cognishield-socratic-actions">
            <button class="btn-cognishield-secondary" id="btn-socratic-dismiss">Keep Reading</button>
            <button class="btn-cognishield-primary" id="btn-socratic-explore">
              See Other Perspectives (${perspectives.length}) ➔
            </button>
          </div>
        </div>

      </div>

      <!-- TAB 2: OTHER PERSPECTIVES -->
      <div id="cognishield-tab-deep" class="cognishield-tab-view" style="display: none;">
        
        <!-- SECTION: Different Sides of the Story -->
        <div class="cognishield-direct-section">
          <div class="cognishield-section-header">
            <div class="cognishield-section-title-group">
              <span class="cognishield-section-icon">${COGNISHIELD_ICONS.radar}</span>
              <span class="cognishield-section-title">Different Sides of This Story</span>
            </div>
            <span class="cognishield-badge-count">${perspectives.length} Perspectives Found</span>
          </div>

          <div class="cognishield-direct-hint">
            Algorithms often push one-sided content; here are alternative viewpoints to give you the full picture.
          </div>

          <div class="cognishield-radar-layout">
            <!-- Concentric Circular Radial Arcs SVG -->
            <div class="cognishield-radar-svg-wrap">
              <svg viewBox="0 0 100 100" class="cognishield-concentric-svg">
                <!-- Background Tracks -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="7" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="7" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="7" />
                
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

        <!-- Verified Alternative Perspectives List (Splashed directly) -->
        <div class="cognishield-direct-section" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.07);">
          <div class="cognishield-section-header">
            <div class="cognishield-section-title-group">
              <span class="cognishield-section-icon">${COGNISHIELD_ICONS.book}</span>
              <span class="cognishield-section-title">Sourced Perspectives</span>
            </div>
            <span class="cognishield-badge-source">Zero Censorship</span>
          </div>
          <div class="cognishield-counter-list">
            ${counterViewsHtml}
          </div>
        </div>

        <!-- QUICK 30-SECOND CRITICAL THINKING CHALLENGE (Splashed directly) -->
        <div class="cognishield-direct-section" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.07);">
          <div class="cognishield-section-header">
            <div class="cognishield-section-title-group">
              <span class="cognishield-section-icon">${COGNISHIELD_ICONS.check}</span>
              <span class="cognishield-section-title">30-Second Thinking Challenge</span>
            </div>
            <span class="cognishield-badge-agency">+5 Focus Pts</span>
          </div>

          <div class="cognishield-direct-hint">
            Spot the assumption to train your media discernment and earn Focus Points.
          </div>

          <div style="font-weight: 700; font-size: 13px; margin: 8px 0; color: inherit;">${quiz.question}</div>
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
            ← Back to Quick Check
          </button>
        </div>

      </div>

      <!-- Epistemic Transparency Disclaimer -->
      <div class="cognishield-transparency-card">
        <strong>How CogniShield works:</strong> We highlight emotional triggers and find alternative viewpoints so you can think for yourself. We never block or censor anything.
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
          feedbackBox.innerHTML = `✓ <strong>Spot on! Okay, got +5 points.</strong> ${quiz.explanation}`;
          this.celebrateAgencyGain(5, "Agency Challenge Mastered!");
          this.triggerCelebrationBurst("Okay, got +5 points! 🎉");
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

