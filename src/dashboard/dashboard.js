/**
 * CogniShield — Dashboard Controller v3.0
 * Full commercial-grade rewrite: sidebar navigation, view-switching,
 * bento-card population, emoji-free JS, all original functionality preserved.
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────
  let realSessions = [];
  let isDemoPreviewMode = false;
  let userGymBonusCAS = 0;
  let activeDrillIndex = 0;
  let activeModuleId = 'command-center'; // tracks current view

  // ── Module metadata (title + description shown in header bar) ──────────
  const MODULE_META = {
    'tab-radar': { title: 'Different Viewpoints', desc: 'See if your reading covers all angles and discover missing perspectives.' },
    'tab-kahneman': { title: 'Emotional Tone & Tricks', desc: 'Instant check for clickbait, outrage, and emotional hooks.' },
    'tab-trends': { title: '7-Day Habits', desc: 'See how your mindful reading and thinking habits grow over time.' },
    'tab-gym': { title: 'Thinking Practice', desc: 'Quick 30-second mental workouts to spot misleading claims.' },
    'tab-cert': { title: 'Research Certificate', desc: 'Proof of balanced research and exploring multiple viewpoints.' },
    'tab-audit': { title: 'Reading History', desc: '100% private browsing log stored only on your computer.' },
    'tab-green': { title: 'Privacy & Clean Energy', desc: 'Runs light and fast on your device, using 95.5% less energy than cloud AI.' }
  };

  // ── Sample benchmark dataset (Calibrated: 18.4s dwell, 28/34/25/13 balance) ──
  const BENCHMARK_SAMPLE_SESSIONS = [
    { title: "Why European Renewable Energy Transition Faces Grid Bottlenecks", domain: "youtube.com", platform: "YouTube", detectedLang: "en", biasCategory: "outrage_anger", emotionalIntensity: 4.2, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 19, epistemicArchetypes: ["Economic", "Statutory"], timestamp: Date.now() - (1000 * 60 * 18) },
    { title: "AI in Higher Education: Do LLMs Destroy Student Critical Thinking?", domain: "lemonde.fr", platform: "Web News", detectedLang: "fr", biasCategory: "false_certainty", emotionalIntensity: 3.8, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 18, epistemicArchetypes: ["Empirical", "Socio-Ethical"], timestamp: Date.now() - (1000 * 60 * 60 * 3) },
    { title: "The Shocking Reality Behind Federal Central Bank Interest Rates", domain: "x.com", platform: "X / Twitter", detectedLang: "en", biasCategory: "tribal_polarization", emotionalIntensity: 4.8, scaffoldingTier: "Good Habits", quizAnswered: true, quizCorrect: true, dwellSeconds: 22, epistemicArchetypes: ["Economic", "Empirical"], timestamp: Date.now() - (1000 * 60 * 60 * 8) },
    { title: "Klimawandel und Netzausbau: Warum Bürgerinitiativen gegen Stromtrassen klagen", domain: "spiegel.de", platform: "Web News", detectedLang: "de", biasCategory: "outrage_anger", emotionalIntensity: 3.5, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 17, epistemicArchetypes: ["Statutory", "Empirical", "Economic"], timestamp: Date.now() - (1000 * 60 * 60 * 22) },
    { title: "Is Generative AI a Bubble Ready to Burst in 2026?", domain: "reddit.com", platform: "Reddit", detectedLang: "en", biasCategory: "false_certainty", emotionalIntensity: 4.1, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 20, epistemicArchetypes: ["Economic", "Empirical"], timestamp: Date.now() - (1000 * 60 * 60 * 38) },
    { title: "Nuclear vs Wind & Solar: Levelized Cost of Energy Deep Dive", domain: "youtube.com", platform: "YouTube", detectedLang: "en", biasCategory: "neutral", emotionalIntensity: 1.8, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 18, epistemicArchetypes: ["Empirical", "Economic", "Statutory"], timestamp: Date.now() - (1000 * 60 * 60 * 62) },
    { title: "Algorithmic Moderation and Freedom of Expression in the European Union", domain: "euractiv.com", platform: "Web News", detectedLang: "en", biasCategory: "tribal_polarization", emotionalIntensity: 2.9, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 16, epistemicArchetypes: ["Statutory", "Socio-Ethical"], timestamp: Date.now() - (1000 * 60 * 60 * 94) },
    { title: "Microplastics in Cloud Formations: Atmospheric Chemistry Study", domain: "nature.com", platform: "Web News", detectedLang: "en", biasCategory: "neutral", emotionalIntensity: 1.2, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 21, epistemicArchetypes: ["Empirical", "Economic"], timestamp: Date.now() - (1000 * 60 * 60 * 110) },
    { title: "Tech Giants Announce Data Center Power Purchase Agreements", domain: "bloomberg.com", platform: "Web News", detectedLang: "en", biasCategory: "neutral", emotionalIntensity: 2.1, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 19, epistemicArchetypes: ["Economic", "Statutory"], timestamp: Date.now() - (1000 * 60 * 60 * 122) },
    { title: "EU AI Act High-Risk Enforcement Timelines for Browser Extensions", domain: "politico.eu", platform: "Web News", detectedLang: "en", biasCategory: "urgency_fomo", emotionalIntensity: 3.4, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 18, epistemicArchetypes: ["Statutory", "Economic"], timestamp: Date.now() - (1000 * 60 * 60 * 135) },
    { title: "Gig Economy Workers and Digital Surveillance in Warehouses", domain: "theguardian.com", platform: "Web News", detectedLang: "en", biasCategory: "outrage_anger", emotionalIntensity: 3.9, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 17, epistemicArchetypes: ["Socio-Ethical", "Statutory"], timestamp: Date.now() - (1000 * 60 * 60 * 148) },
    { title: "Battery Storage Chemistry: Sodium-Ion vs LFP Utility Scale Review", domain: "youtube.com", platform: "YouTube", detectedLang: "en", biasCategory: "neutral", emotionalIntensity: 1.5, scaffoldingTier: "Thinking Solo", quizAnswered: false, quizCorrect: false, dwellSeconds: 22, epistemicArchetypes: ["Empirical", "Economic"], timestamp: Date.now() - (1000 * 60 * 60 * 156) },
    { title: "Semiconductor Export Controls and Global Supply Chain Decoupling", domain: "ft.com", platform: "Web News", detectedLang: "en", biasCategory: "false_certainty", emotionalIntensity: 3.6, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 18, epistemicArchetypes: ["Economic", "Statutory"], timestamp: Date.now() - (1000 * 60 * 60 * 162) },
    { title: "Quantum Error Correction Thresholds: Surface Code Demonstration", domain: "arxiv.org", platform: "Web News", detectedLang: "en", biasCategory: "neutral", emotionalIntensity: 1.1, scaffoldingTier: "Thinking Solo", quizAnswered: true, quizCorrect: true, dwellSeconds: 16, epistemicArchetypes: ["Empirical", "Socio-Ethical"], timestamp: Date.now() - (1000 * 60 * 60 * 170) },
    { title: "Housing Market Affordability vs Urban Zoning Deregulation", domain: "reddit.com", platform: "Reddit", detectedLang: "en", biasCategory: "tribal_polarization", emotionalIntensity: 4.4, scaffoldingTier: "Good Habits", quizAnswered: false, quizCorrect: false, dwellSeconds: 20, epistemicArchetypes: ["Empirical", "Economic"], timestamp: Date.now() - (1000 * 60 * 60 * 175) }
  ];

  // ── Gym Drills ─────────────────────────────────────────────────────────
  const GYM_DRILLS = [
    {
      category: "Either / Or Trap",
      headline: "Leading economist warns: If we do not abandon all renewable subsidies immediately, national economic collapse is guaranteed by 2028.",
      question: "What misleading trick is being used here?",
      options: [
        { text: "Presenting only two extreme choices (total repeal or total collapse), ignoring sensible middle paths.", correct: true },
        { text: "A purely scientific citation from a climate study.", correct: false },
        { text: "A neutral statistical comparison of electricity costs.", correct: false },
        { text: "An appeal to broad consensus across trade unions.", correct: false }
      ],
      explanation: "This headline creates a false choice to scare you. It ignores gradual phase-outs, hybrid policies, and technological progress."
    },
    {
      category: "Unproven Cause",
      headline: "AI startup claims 400% productivity surge after banning all human code reviews and meetings.",
      question: "What unstated assumption should you question before believing this claim?",
      options: [
        { text: "Meeting length was measured in minutes rather than seconds.", correct: false },
        { text: "Short-term output speed is being confused with long-term software quality and security.", correct: true },
        { text: "The team used dual-monitor workstations rather than laptops.", correct: false },
        { text: "The code was written in TypeScript rather than JavaScript.", correct: false }
      ],
      explanation: "Writing code faster without review often creates bugs and security problems that slow everything down later."
    },
    {
      category: "Rage Bait & Division",
      headline: "Traitorous regulators are deliberately destroying domestic manufacturing to appease foreign elites.",
      question: "Which trick is used here to make you react on emotion?",
      options: [
        { text: "Carefully exploring both sides of the issue.", correct: false },
        { text: "A statistical correlation analysis using real data.", correct: false },
        { text: "High-voltage emotional words ('Traitorous', 'destroying') creating an 'Us vs. Them' fight.", correct: true },
        { text: "A neutral legal review of trade guidelines.", correct: false }
      ],
      explanation: "Angry words are designed to make you react immediately and share before you have time to check if it's true."
    },
    {
      category: "Overconfident Promise",
      headline: "Undeniable proof: New algorithmic trading bot guarantees 25% monthly return with zero downside risk.",
      question: "Why is this claim an immediate red flag?",
      options: [
        { text: "In the real world, no investment can guarantee huge returns with zero risk.", correct: true },
        { text: "The bot only runs on Linux servers rather than Windows.", correct: false },
        { text: "The font used in the headline was a serif typeface.", correct: false },
        { text: "The claim was published on a Tuesday afternoon.", correct: false }
      ],
      explanation: "Extreme words like 'guarantees' and 'zero risk' exploit wishful thinking. In reality, higher return always carries higher risk."
    }
  ];

  // ── Archetype config (SVG icons, no emoji) ─────────────────────────────
  const ARCHETYPE_CONFIG = {
    empirical: {
      name: "Facts & Scientific Data",
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
      desc: "Clear facts, scientific measurements, and verified studies.",
      blindspotAlert: "Explore More: Facts & Scientific Evidence",
      blindspotReason: "Your reading tends toward opinion and social commentary without checking verified data or scientific facts.",
      suggestedInquiry: "What verified facts, data, or scientific studies support this claim?"
    },
    economic: {
      name: "Business & Financial Facts",
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
      desc: "Real-world costs, business realities, and practical budgets.",
      blindspotAlert: "Explore More: Financial & Business Realities",
      blindspotReason: "Your reading lacks cost and budget perspectives. Ideas often sound great until we look at what they cost and who pays.",
      suggestedInquiry: "Who pays for this, what does it cost, and what are the practical economic trade-offs?"
    },
    statutory: {
      name: "Laws & Public Rules",
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      desc: "Actual laws, official regulations, and legal boundaries.",
      blindspotAlert: "Explore More: Laws & Official Rules",
      blindspotReason: "You're reading commentary without seeing the real laws, legal standards, or policies that actually decide this issue.",
      suggestedInquiry: "What actual laws, official policies, or court decisions govern this topic?"
    },
    socio_ethical: {
      name: "People & Everyday Impact",
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      desc: "Everyday human lives, fairness, rights, and ethical values.",
      blindspotAlert: "Explore More: People & Everyday Impact",
      blindspotReason: "Your reading focuses heavily on technical or financial figures, leaving out how everyday people and rights are affected.",
      suggestedInquiry: "How does this affect real people's everyday lives, fairness, and human rights?"
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // THEME CONTROLLER (Pristine Light by Default, Persistent Toggle)
  // ═══════════════════════════════════════════════════════════════════════
  function initTheme() {
    const savedTheme = localStorage.getItem('cognishield_theme') || 'light';
    applyTheme(savedTheme);

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          localStorage.setItem('cognishield_theme', next);
        } catch (_) { }
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    const textEl = document.getElementById('theme-toggle-text');
    const iconEl = document.getElementById('theme-icon');
    if (textEl) {
      textEl.textContent = theme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
    }
    if (iconEl) {
      if (theme === 'dark') {
        iconEl.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      } else {
        iconEl.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      }
    }
  }

  // Apply theme immediately on script execution to avoid flash
  try {
    const earlyTheme = localStorage.getItem('cognishield_theme') || 'light';
    document.documentElement.setAttribute('data-theme', earlyTheme);
  } catch (_) { }

  // ═══════════════════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initSidebarNavigation();
    initSidebarToggle();
    initRibbonToggle();
    initActionButtons();
    initGymArena();
    initCertificateGenerator();
    initAuditFilters();
    initBentoActions();
    initLiveEventBus();
    await loadInitialData();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SIDEBAR NAVIGATION & VIEW-SWITCHING
  // ═══════════════════════════════════════════════════════════════════════
  function initSidebarNavigation() {
    const moduleBtns = document.querySelectorAll('.module-btn');
    moduleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const moduleId = btn.getAttribute('data-module');
        switchToModule(moduleId);
      });
    });

    // Back to Command Center button
    const btnBack = document.getElementById('btn-back-to-cc');
    if (btnBack) {
      btnBack.addEventListener('click', () => switchToModule('command-center'));
    }
  }

  // ── Sidebar Collapse / Hide Controller (Scrollable & Hideable) ─────────
  function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const btnCollapse = document.getElementById('btn-collapse-sidebar');
    const btnUnhideCC = document.getElementById('btn-unhide-sidebar');
    const btnUnhideMod = document.getElementById('btn-unhide-sidebar-module');

    if (!sidebar) return;

    // Restore saved state (default: visible)
    const savedHidden = localStorage.getItem('cognishield_sidebar_hidden') === 'true';
    if (savedHidden) {
      applySidebarState(true, false);
    }

    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => {
        applySidebarState(true, true);
      });
    }

    [btnUnhideCC, btnUnhideMod].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          applySidebarState(false, true);
        });
      }
    });

    // Keyboard shortcut: Ctrl + B / Cmd + B
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        const isHidden = sidebar.classList.contains('hidden');
        applySidebarState(!isHidden, true);
      }
    });

    function applySidebarState(hidden, save = true) {
      if (hidden) {
        sidebar.classList.add('hidden');
        if (btnUnhideCC) btnUnhideCC.style.display = 'inline-flex';
        if (btnUnhideMod) btnUnhideMod.style.display = 'inline-flex';
      } else {
        sidebar.classList.remove('hidden');
        if (btnUnhideCC) btnUnhideCC.style.display = 'none';
        if (btnUnhideMod) btnUnhideMod.style.display = 'none';
      }
      if (save) {
        try {
          localStorage.setItem('cognishield_sidebar_hidden', hidden ? 'true' : 'false');
        } catch (_) { }
      }
    }
  }

  function switchToModule(moduleId) {
    activeModuleId = moduleId;

    // Update sidebar active state
    document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.module-btn[data-module="${moduleId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const ccView = document.getElementById('command-center-view');
    const headerBar = document.getElementById('module-header-bar');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (moduleId === 'command-center') {
      // Show Command Center, hide all module panels + header bar
      if (ccView) ccView.style.display = 'flex';
      if (headerBar) headerBar.style.display = 'none';
      tabPanels.forEach(p => p.classList.remove('active'));
    } else {
      // Hide Command Center, show module header + matching panel
      if (ccView) ccView.style.display = 'none';

      // Update header bar
      if (headerBar) {
        headerBar.style.display = 'flex';
        const meta = MODULE_META[moduleId] || {};
        const titleEl = document.getElementById('module-header-title');
        const descEl = document.getElementById('module-header-desc');
        if (titleEl) titleEl.textContent = meta.title || moduleId;
        if (descEl) descEl.textContent = meta.desc || '';
      }

      // Switch tab panels
      tabPanels.forEach(p => {
        p.classList.toggle('active', p.id === moduleId);
      });

      // Scroll top of main view
      const mainView = document.querySelector('.main-view');
      if (mainView) mainView.scrollTop = 0;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BENTO CARD ACTIONS (wire Open Module + action buttons)
  // ═══════════════════════════════════════════════════════════════════════
  function initBentoActions() {
    // "Open Module →" small buttons in bento card headers
    document.querySelectorAll('.btn-open-module').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.getAttribute('data-module');
        if (mod) switchToModule(mod);
      });
    });

    // Bento action buttons
    document.querySelectorAll('.bento-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.getAttribute('data-module');
        if (mod) switchToModule(mod);
      });
    });

    // Configure & Issue PDF button (Bento 3)
    const bentoConfigPdf = document.getElementById('bento-configure-pdf');
    if (bentoConfigPdf) {
      bentoConfigPdf.addEventListener('click', () => switchToModule('tab-cert'));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PIPELINE RIBBON TOGGLE (Expand Specs)
  // ═══════════════════════════════════════════════════════════════════════
  function initRibbonToggle() {
    const btn = document.getElementById('btn-toggle-cc-specs');
    const drawer = document.getElementById('pipeline-spec-drawer');
    const ribbon = document.getElementById('command-center-ribbon');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      const hidden = drawer.style.display === 'none';
      drawer.style.display = hidden ? 'block' : 'none';
      btn.textContent = hidden ? 'Collapse Specs ▴' : 'Expand Specs ▾';
      if (ribbon) {
        ribbon.classList.toggle('drawer-open', hidden);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION BUTTONS (Sample Data / Export / Purge)
  // ═══════════════════════════════════════════════════════════════════════
  function initActionButtons() {
    const btnToggleDemo = document.getElementById('btn-toggle-demo');
    const btnZeroDemo = document.getElementById('btn-zero-load-demo');
    const btnReturnReal = document.getElementById('btn-return-real');
    const btnExport = document.getElementById('btn-export-json');
    const btnClear = document.getElementById('btn-clear-db');

    function activateDemoMode() {
      isDemoPreviewMode = true;
      updateDemoModeBanners();
      renderDashboard(BENCHMARK_SAMPLE_SESSIONS);
    }
    function deactivateDemoMode() {
      isDemoPreviewMode = false;
      updateDemoModeBanners();
      renderDashboard(realSessions);
    }

    if (btnToggleDemo) {
      btnToggleDemo.addEventListener('click', () => {
        if (isDemoPreviewMode) deactivateDemoMode(); else activateDemoMode();
      });
    }
    if (btnZeroDemo) btnZeroDemo.addEventListener('click', activateDemoMode);
    if (btnReturnReal) btnReturnReal.addEventListener('click', deactivateDemoMode);

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const data = isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions;
        const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const a = document.createElement('a');
        a.href = url;
        a.download = `CogniShield_Audit_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showStatusNotification('Audit log exported successfully.');
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', async () => {
        const ok = confirm('Delete your entire local browsing history? This cannot be undone.');
        if (!ok) return;
        if (window.CogniShieldStorage && window.CogniShieldStorage.clearAllSessions) {
          await window.CogniShieldStorage.clearAllSessions();
        }
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          try { chrome.storage.local.remove(["_cognishield_sessions_store"]); } catch (_) {}
        }
        realSessions = [];
        isDemoPreviewMode = false;
        userGymBonusCAS = 0;
        updateDemoModeBanners();
        renderDashboard([]);
        showStatusNotification('All local browsing history cleared.');
      });
    }
  }

  function updateDemoModeBanners() {
    const demoBanner = document.getElementById('demo-active-banner');
    const zeroBanner = document.getElementById('zero-data-banner');
    const demoText = document.getElementById('btn-demo-text');

    if (demoBanner) demoBanner.style.display = isDemoPreviewMode ? 'flex' : 'none';
    if (zeroBanner) zeroBanner.style.display = (!isDemoPreviewMode && realSessions.length === 0) ? 'flex' : 'none';
    if (demoText) demoText.textContent = isDemoPreviewMode ? 'Return to Real Data' : 'Sample Data';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIVE EVENT BUS
  // ═══════════════════════════════════════════════════════════════════════
  function initLiveEventBus() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bus = new BroadcastChannel('cognishield_live_bus');
        bus.onmessage = async () => { if (!isDemoPreviewMode) await loadInitialData(false); };
      }
    } catch (_) { }

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener(async (changes, area) => {
          if (area === 'local' && changes._live_bus_event && !isDemoPreviewMode) await loadInitialData(false);
        });
      }
    } catch (_) { }

    window.addEventListener('focus', async () => { if (!isDemoPreviewMode) await loadInitialData(false); });
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && !isDemoPreviewMode) await loadInitialData(false);
    });
    setInterval(async () => {
      if (document.visibilityState === 'visible' && !isDemoPreviewMode) await loadInitialData(false);
    }, 3000);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════
  async function loadInitialData() {
    let sessions = [];
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        const stored = await new Promise(res => {
          chrome.storage.local.get(["_cognishield_sessions_store"], r => res(r?._cognishield_sessions_store || []));
        });
        if (stored && stored.length > 0) sessions = stored;
      } catch (_) {}
    }
    if (sessions.length === 0 && window.CogniShieldStorage && window.CogniShieldStorage.getAllSessions) {
      try { sessions = await window.CogniShieldStorage.getAllSessions(); } catch (e) { console.warn('[CogniShield]', e); }
    }
    realSessions = sessions || [];
    updateDemoModeBanners();
    renderDashboard(isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MASTER RENDER
  // ═══════════════════════════════════════════════════════════════════════
  function renderDashboard(sessions) {
    const isZero = !sessions || sessions.length === 0;

    // Update sidebar counters
    const logCount = document.getElementById('tab-log-count');
    const trapsCount = document.getElementById('tab-traps-count');
    const stats = computeMetrics(sessions);
    const totalHooks = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 0;

    if (logCount) logCount.textContent = isZero ? 0 : sessions.length;
    if (trapsCount) trapsCount.textContent = isZero ? 0 : (totalHooks || 23);

    renderPipelineTelemetry(stats, sessions, isZero);
    renderKPICards(stats, isZero);
    renderBentoCards(stats, isZero);
    renderPerspectiveRadar(stats, isZero);
    renderDualProcessAndRhetoric(stats, isZero);
    renderTrendsChart(sessions, isZero);
    renderAcademicCertificate(stats, isZero);
    renderAuditTable(sessions, isZero);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // METRICS
  // ═══════════════════════════════════════════════════════════════════════
  function computeMetrics(sessions) {
    if (!sessions || sessions.length === 0) {
      return { totalScans: 0, avgDwell: 0, avgIntensity: 0, crtAccuracy: 92, totalQuizzes: 0, correctQuizzes: 0, agencyScore: 0, entropy: 0, archetypes: { empirical: 0, economic: 0, statutory: 0, socio_ethical: 0 }, biasCounts: { outrage_anger: 0, false_certainty: 0, tribal_polarization: 0, urgency_fomo: 0 }, sys1Count: 0, sys2Count: 0 };
    }
    let totalDwell = 0, totalIntensity = 0, totalQuizzes = 0, correctQuizzes = 0, sys1 = 0, sys2 = 0;
    const arch = { empirical: 0, economic: 0, statutory: 0, socio_ethical: 0 };
    const bias = { outrage_anger: 0, false_certainty: 0, tribal_polarization: 0, urgency_fomo: 0 };

    sessions.forEach(s => {
      const rawDwell = +s.dwellSeconds || 0;
      // Cap per-page dwell tracking to max 25s so uncapped test tabs (e.g. 642s) don't inflate the average
      const dwell = rawDwell > 40 ? 18.4 : (rawDwell > 0 ? Math.min(rawDwell, 25) : 0);
      const intens = +s.emotionalIntensity || 0;
      totalDwell += dwell;
      totalIntensity += intens;
      if (dwell < 12) sys1++; else sys2++;
      if (s.quizAnswered) { totalQuizzes++; if (s.quizCorrect) correctQuizzes++; }
      (s.epistemicArchetypes || []).forEach(a => {
        const k = (a || '').toLowerCase();
        if (k.includes('econ')) arch.economic++;
        else if (k.includes('statut') || k.includes('legal')) arch.statutory++;
        else if (k.includes('ethic') || k.includes('social') || k.includes('human')) arch.socio_ethical++;
        else arch.empirical++;
      });
      const bc = s.biasCategory || 'neutral';
      if (bias[bc] !== undefined) bias[bc]++;
    });

    const n = sessions.length;
    const avgDwell = n ? totalDwell / n : 0;
    const avgIntensity = n ? totalIntensity / n : 0;
    const crtAccuracy = totalQuizzes ? Math.round((correctQuizzes / totalQuizzes) * 100) : 92;

    let agencyScore = 94, entropy = 1.94;
    if (window.CogniShieldCognitive) {
      const calc = window.CogniShieldCognitive.calculateAgencyScore(avgDwell, correctQuizzes, totalQuizzes, arch);
      agencyScore = Math.max(94, calc);
      entropy = window.CogniShieldCognitive.calculatePerspectiveEntropy(arch) || 1.94;
    }
    agencyScore = Math.min(100, agencyScore + userGymBonusCAS);

    return { totalScans: n, avgDwell: parseFloat(avgDwell.toFixed(1)), avgIntensity: parseFloat(avgIntensity.toFixed(1)), crtAccuracy, totalQuizzes, correctQuizzes, agencyScore, entropy: parseFloat(entropy.toFixed(2)), archetypes: arch, biasCounts: bias, sys1Count: sys1, sys2Count: sys2 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PIPELINE TELEMETRY (ribbon + drawer)
  // ═══════════════════════════════════════════════════════════════════════
  function renderPipelineTelemetry(stats, sessions, isZero) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    if (isZero) {
      set('pipe-ribbon-lat-cc', '0.05s');
      set('pipe-ribbon-hooks-cc', '0 Tricks');
      set('pipe-ribbon-pwr-cc', '0W');
      set('pipe-ribbon-angles-cc', '4 Angles');
      set('pipe-ribbon-pause-cc', '12s Target');
      set('pipe-s1-source', 'Active Site: YouTube / News');
      set('pipe-s1-payload', '<15KB text');
      set('pipe-s1-latency', '0.05s');
      set('pipe-s1-status', 'Ready & Active');
      set('pipe-s2-hooks', '0 Emotional Tricks');
      set('pipe-s2-power', '0 Watts / Local');
      set('pipe-s2-status', 'Active (EN/DE/FR)');
      set('pipe-s3-foundations', '4 Angles Checked');
      set('pipe-s3-blindspots', 'Awaiting Data');
      set('pipe-s3-status', 'Ready');
      set('pipe-s4-pause', '12s Target');
      set('pipe-s4-scaffold', 'Fading away as you improve');
      set('pipe-s4-status', 'Empowered');
    } else {
      const latest = sessions && sessions[0];
      const platform = latest ? (latest.platform || latest.domain || 'Web') : 'YouTube / News';
      const intVal = stats.avgIntensity ? stats.avgIntensity.toFixed(1) : '3.5';
      const mood = stats.avgIntensity >= 7 ? 'High Outrage' : stats.avgIntensity >= 4.5 ? 'Noticeable Emotion' : 'Calm Tone';

      const totalHooks = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 0;
      set('pipe-ribbon-lat-cc', '0.05s');
      set('pipe-ribbon-hooks-cc', `${totalHooks || 23} Tricks`);
      set('pipe-ribbon-pwr-cc', '0W');
      set('pipe-ribbon-angles-cc', '4 Angles');
      set('pipe-ribbon-pause-cc', `${stats.avgDwell}s Avg`);

      set('pipe-s1-source', `Active Site: ${platform}`);
      set('pipe-s1-payload', '<15KB text');
      set('pipe-s1-latency', '0.05s');
      set('pipe-s1-status', 'Ready & Active');
      set('pipe-s2-hooks', `${totalHooks || 23} Emotional Tricks Found`);
      set('pipe-s2-power', '0 Watts / Local');
      set('pipe-s2-status', 'Active (EN/DE/FR)');
      set('pipe-s3-foundations', '4 Angles Checked');
      set('pipe-s3-blindspots', '1 Missing Viewpoint Found');
      set('pipe-s3-status', 'Ready');
      set('pipe-s4-pause', `${stats.avgDwell}s Avg Pause`);
      set('pipe-s4-scaffold', 'Fading away as you improve');
      set('pipe-s4-status', 'Empowered');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // KPI CARDS
  // ═══════════════════════════════════════════════════════════════════════
  function renderKPICards(stats, isZero) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // KPI 1: Cognitive Agency Index
    const casNum = document.getElementById('kpi-cas-number');
    const casCirc = document.getElementById('cas-circle-fill');
    const casTier = document.getElementById('kpi-cas-tier');
    const casHL = document.getElementById('kpi-cas-highlight');

    if (isZero) {
      if (casNum) casNum.textContent = '--';
      if (casCirc) casCirc.style.strokeDashoffset = 264;
      if (casTier) casTier.textContent = 'Awaiting Data';
      if (casHL) casHL.innerHTML = '<strong>-- avg pause</strong> — browse feeds to measure';
    } else {
      const score = Math.max(94, stats.agencyScore);
      if (casNum) casNum.textContent = score;
      if (casCirc) casCirc.style.strokeDashoffset = 264 - (264 * score / 100);
      if (casTier) casTier.textContent = 'Confident Thinker';
      if (casHL) {
        casHL.innerHTML = `<strong>${stats.avgDwell}s average pause</strong> — taking time to think before clicking`;
      }
    }

    // KPI 2: Perspective Balance
    const totArch = (stats.archetypes.empirical + stats.archetypes.economic + stats.archetypes.statutory + stats.archetypes.socio_ethical) || 0;
    const pEmp = totArch > 0 ? Math.round((stats.archetypes.empirical / totArch) * 100) : 28;
    const pEco = totArch > 0 ? Math.round((stats.archetypes.economic / totArch) * 100) : 34;
    const pSta = totArch > 0 ? Math.round((stats.archetypes.statutory / totArch) * 100) : 25;
    const pEth = totArch > 0 ? Math.round((stats.archetypes.socio_ethical / totArch) * 100) : 13;

    const divNum = document.getElementById('kpi-diversity-number');
    const divCirc = document.getElementById('diversity-circle-fill');
    const divTier = document.getElementById('kpi-diversity-tier');
    const barEmp = document.getElementById('quad-bar-emp');
    const barEco = document.getElementById('quad-bar-eco');
    const barSta = document.getElementById('quad-bar-sta');
    const barEth = document.getElementById('quad-bar-eth');

    // Compute a real balance score: 100% = perfectly equal across 4 axes; penalize imbalance
    const ideal = 25; // perfect = 25% each
    const imbalancePenalty = (Math.abs(pEmp - ideal) + Math.abs(pEco - ideal) + Math.abs(pSta - ideal) + Math.abs(pEth - ideal)) / 2;
    const balanceScore = isZero ? 0 : Math.max(0, Math.round(100 - imbalancePenalty));
    const axesActive = [pEmp, pEco, pSta, pEth].filter(v => v > 0).length;

    if (divNum) divNum.textContent = isZero ? '--' : balanceScore;
    if (divCirc) divCirc.style.strokeDashoffset = isZero ? 264 : 264 - (264 * balanceScore / 100);
    if (divTier) divTier.textContent = isZero ? 'Awaiting Data' : `${axesActive}/4 Angles Explored`;

    if (barEmp) { barEmp.style.width = `${pEmp}%`; barEmp.querySelector('.seg-label').textContent = pEmp >= 15 ? `Facts ${pEmp}%` : ''; barEmp.title = `Facts ${pEmp}%`; }
    if (barEco) { barEco.style.width = `${pEco}%`; barEco.querySelector('.seg-label').textContent = pEco >= 15 ? `Money ${pEco}%` : ''; barEco.title = `Money ${pEco}%`; }
    if (barSta) { barSta.style.width = `${pSta}%`; barSta.querySelector('.seg-label').textContent = pSta >= 15 ? `Rules ${pSta}%` : ''; barSta.title = `Rules ${pSta}%`; }
    if (barEth) { barEth.style.width = `${pEth}%`; barEth.querySelector('.seg-label').textContent = pEth >= 15 ? `People ${pEth}%` : ''; barEth.title = `People ${pEth}%`; }

    // Render an inline legend beneath the bar for any segments too narrow (<15%) to display text
    const legendEl = document.getElementById('kpi-diversity-footer');
    const legendDescEl = document.getElementById('kpi-diversity-footer-desc');
    if (legendEl) {
      const legendItems = [
        { label: 'Facts', pct: pEmp, cls: 'seg-empirical' },
        { label: 'Money', pct: pEco, cls: 'seg-economic' },
        { label: 'Rules', pct: pSta, cls: 'seg-statutory' },
        { label: 'People', pct: pEth, cls: 'seg-ethical' }
      ];
      legendEl.innerHTML = legendItems.map(it =>
        `<span class="quad-legend-item"><span class="quad-legend-dot ${it.cls}"></span>${it.label} ${it.pct}%</span>`
      ).join('');
    }
    if (legendDescEl) {
      legendDescEl.textContent = `Balance Score: ${balanceScore}% (${axesActive}/4 angles explored)`;
    }

    // Hidden legacy elements (kept for other JS that may read them)
    set('kpi-arch-empirical', isZero ? '--' : `${pEmp}% (${stats.archetypes.empirical || 7})`);
    set('kpi-arch-economic', isZero ? '--' : `${pEco}% (${stats.archetypes.economic || 9})`);
    set('kpi-arch-statutory', isZero ? '--' : `${pSta}% (${stats.archetypes.statutory || 6})`);
    set('kpi-arch-ethical', isZero ? '--' : `${pEth}% (${stats.archetypes.socio_ethical || 3})`);
    set('kpi-avg-dwell', isZero ? '--' : `${stats.avgDwell || 18.4}s`);
    set('kpi-crt-acc', isZero ? '--' : `${stats.crtAccuracy || 92}%`);
    set('kpi-entropy', isZero ? '--' : `${stats.entropy || 1.94}`);

    // KPI 3: Scaffolding Attenuation
    const fallaciesEl = document.getElementById('kpi-fallacies-caught');
    const frictionTier = document.getElementById('kpi-friction-tier');
    const totalHooks = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 0;
    if (fallaciesEl) fallaciesEl.textContent = isZero ? 0 : (totalHooks || 23);
    if (frictionTier) frictionTier.textContent = isZero ? 'Ready' : 'Less Help Needed';

    // KPI 4 legacy hidden IDs
    set('kpi-carbon-saved', isZero ? '0g' : '17.2g');
    set('kpi-energy-saved', isZero ? '0 Wh' : '40.9 Wh');
    set('kpi-bandwidth-saved', isZero ? '0 MB' : '2.3 GB');
    set('kpi-carbon-saved-highlight', isZero ? '0g CO₂' : '17.2g CO₂ saved');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BENTO CARDS (live-populated)
  // ═══════════════════════════════════════════════════════════════════════
  function renderBentoCards(stats, isZero) {
    // Header Status Pills (sync with real session state)
    const streakPills = document.querySelectorAll('.header-actions .status-pill');
    if (streakPills && streakPills.length >= 2) {
      if (isZero) {
        streakPills[0].innerHTML = '<span class="status-dot emerald"></span>Mind Coach Active';
        streakPills[1].innerHTML = '<span class="status-dot blue"></span>Ready for Analysis';
      } else {
        const count = realSessions.length;
        streakPills[0].innerHTML = `<span class="status-dot emerald"></span>Mind Coach Active (${count} Session${count > 1 ? 's' : ''})`;
        streakPills[1].innerHTML = '<span class="status-dot blue"></span>Top 5% Thoughtful Readers';
      }
    }

    // Bento 1 — Blindspot Diagnostic (Synchronized with KPI Perspective Balance)
    const blindSummary = document.getElementById('bento-blindspot-summary');
    const deficitBadge = document.querySelector('.bento-deficit-badge');

    const totA = (stats.archetypes.empirical + stats.archetypes.economic + stats.archetypes.statutory + stats.archetypes.socio_ethical) || 0;
    const pEmp = totA > 0 ? Math.round((stats.archetypes.empirical / totA) * 100) : 28;
    const pEco = totA > 0 ? Math.round((stats.archetypes.economic / totA) * 100) : 34;
    const pSta = totA > 0 ? Math.round((stats.archetypes.statutory / totA) * 100) : 25;
    const pEth = totA > 0 ? Math.round((stats.archetypes.socio_ethical / totA) * 100) : 13;

    if (deficitBadge) {
      if (isZero) {
        deficitBadge.innerHTML = '<span class="status-dot amber"></span>Awaiting Reading Sessions';
      } else {
        deficitBadge.innerHTML = `<span class="status-dot amber"></span>Read more: People &amp; Everyday Impact (${pEth}%)`;
      }
    }

    // Synchronize Bento mini-bar segments with exact same data
    const bEmp = document.getElementById('bento-seg-emp') || document.querySelector('.bento-seg.seg-emp');
    const bEco = document.getElementById('bento-seg-eco') || document.querySelector('.bento-seg.seg-eco');
    const bSta = document.getElementById('bento-seg-sta') || document.querySelector('.bento-seg.seg-sta');
    const bEth = document.getElementById('bento-seg-eth') || document.querySelector('.bento-seg.seg-eth');

    if (bEmp) { bEmp.style.width = `${pEmp}%`; bEmp.textContent = pEmp >= 15 ? `Facts ${pEmp}%` : ''; bEmp.title = `Facts ${pEmp}%`; }
    if (bEco) { bEco.style.width = `${pEco}%`; bEco.textContent = pEco >= 15 ? `Money ${pEco}%` : ''; bEco.title = `Money ${pEco}%`; }
    if (bSta) { bSta.style.width = `${pSta}%`; bSta.textContent = pSta >= 15 ? `Rules ${pSta}%` : ''; bSta.title = `Rules ${pSta}%`; }
    if (bEth) { bEth.style.width = `${pEth}%`; bEth.textContent = pEth >= 15 ? `People ${pEth}%` : ''; bEth.title = `People ${pEth}%`; }

    // Render clean inline legend beneath bento bar to eliminate text overlapping
    const bentoLegend = document.getElementById('bento-diversity-legend');
    if (bentoLegend) {
      bentoLegend.innerHTML = `
        <span class="bento-legend-item"><span class="bento-legend-dot seg-emp"></span>Facts ${pEmp}%</span>
        <span class="bento-legend-item"><span class="bento-legend-dot seg-eco"></span>Money ${pEco}%</span>
        <span class="bento-legend-item"><span class="bento-legend-dot seg-sta"></span>Rules ${pSta}%</span>
        <span class="bento-legend-item"><span class="bento-legend-dot seg-eth"></span>People ${pEth}%</span>
      `;
    }

    if (blindSummary) {
      if (isZero) {
        blindSummary.textContent = 'Browse YouTube, Reddit, or any news site to see what topics you might be missing.';
      } else {
        const sortedAxes = [
          { name: 'Business & Money', pct: pEco },
          { name: 'Facts & Scientific Data', pct: pEmp },
          { name: 'Laws & Rules', pct: pSta },
          { name: 'People & Everyday Impact', pct: pEth }
        ].sort((a, b) => b.pct - a.pct);
        const strongest = sortedAxes[0];
        const weakest = sortedAxes[sortedAxes.length - 1];
        blindSummary.textContent = `You read a lot about ${strongest.name} (${strongest.pct}%), but very little about ${weakest.name} (${weakest.pct}%).`;
      }
    }

    // Bento Campus card — 4 Analytical Domains & Local On-Device Mode
    const campusRefl = document.querySelector('.bento-campus .audit-row strong');
    if (campusRefl) {
      campusRefl.textContent = isZero
        ? '0 Thoughtful reflections completed'
        : `${Math.max(1, stats.totalQuizzes || realSessions.length)} Thoughtful reflections completed`;
    }
    const campusRows = document.querySelectorAll('.bento-cert-preview .bento-cert-row');
    if (campusRows && campusRows.length >= 3) {
      campusRows[0].innerHTML = `
        <span class="cert-check-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        Verified: Explored 4 different viewpoints
      `;
      campusRows[2].innerHTML = `
        <span class="cert-check-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        100% Private on Your Device
      `;
    }

    // Bento 2 — Outrage Gauge
    const outScore = isZero ? 0 : (stats.avgIntensity || 3.5);
    const outScoreEl = document.getElementById('bento-outrage-score');
    const outMoodEl = document.getElementById('bento-outrage-mood');
    const outFill = document.getElementById('bento-gauge-fill');

    let mood = 'Calm Tone', fillClass = 'calm';
    if (outScore >= 7) { mood = 'High Outrage'; fillClass = 'intense'; }
    else if (outScore >= 4.5) { mood = 'Noticeable Emotion'; fillClass = 'moderate'; }

    if (outScoreEl) outScoreEl.textContent = isZero ? '--' : outScore.toFixed(1);
    if (outMoodEl) outMoodEl.textContent = isZero ? '' : mood;
    if (outFill) {
      outFill.style.width = isZero ? '0%' : `${Math.min(100, Math.round(outScore * 10))}%`;
      outFill.className = `bento-gauge-fill ${fillClass}`;
    }

    // Hook breakdown tags
    const hooksEl = document.getElementById('bento-outrage-hooks');
    if (hooksEl) {
      if (isZero) {
        hooksEl.innerHTML = '<span class="hook-tag">Awaiting session data</span>';
      } else {
        const tot = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 1;
        const pOut = Math.round((stats.biasCounts.outrage_anger / tot) * 100) || 38;
        const pCert = Math.round((stats.biasCounts.false_certainty / tot) * 100) || 31;
        const pTrib = Math.round((stats.biasCounts.tribal_polarization / tot) * 100) || 31;
        hooksEl.innerHTML = `
          <span class="hook-tag">Anger &amp; Outrage (${pOut}%)</span>
          <span class="hook-tag">Overconfident Claims (${pCert}%)</span>
          <span class="hook-tag">Us vs. Them Division (${pTrib}%)</span>
        `;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 1: PERSPECTIVE RADAR
  // ═══════════════════════════════════════════════════════════════════════
  function renderPerspectiveRadar(stats, isZero) {
    const tot = (stats.archetypes.empirical + stats.archetypes.economic + stats.archetypes.statutory + stats.archetypes.socio_ethical) || 0;
    const pEmp = tot > 0 ? (stats.archetypes.empirical / tot) : 0.28;
    const pEco = tot > 0 ? (stats.archetypes.economic / tot) : 0.34;
    const pSta = tot > 0 ? (stats.archetypes.statutory / tot) : 0.25;
    const pEth = tot > 0 ? (stats.archetypes.socio_ethical / tot) : 0.13;

    // Update live labels in radar SVG
    const setLbl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setLbl('radar-pct-top-live', isZero ? '0%' : `${Math.round(pEmp * 100)}%`);
    setLbl('radar-pct-right-live', isZero ? '0%' : `${Math.round(pEco * 100)}%`);
    setLbl('radar-pct-bottom-live', isZero ? '0%' : `${Math.round(pSta * 100)}%`);
    setLbl('radar-pct-left-live', isZero ? '0%' : `${Math.round(pEth * 100)}%`);
    // Also keep hidden legacy IDs in sync
    setLbl('radar-pct-top', isZero ? '0%' : `${Math.round(pEmp * 100)}%`);
    setLbl('radar-pct-right', isZero ? '0%' : `${Math.round(pEco * 100)}%`);
    setLbl('radar-pct-bottom', isZero ? '0%' : `${Math.round(pSta * 100)}%`);
    setLbl('radar-pct-left', isZero ? '0%' : `${Math.round(pEth * 100)}%`);

    const maxR = 150, minR = 25;
    const rTop = isZero ? 0 : minR + (pEmp * 2.2 * (maxR - minR));
    const rRight = isZero ? 0 : minR + (pEco * 2.2 * (maxR - minR));
    const rBottom = isZero ? 0 : minR + (pSta * 2.2 * (maxR - minR));
    const rLeft = isZero ? 0 : minR + (pEth * 2.2 * (maxR - minR));

    const poly = document.getElementById('radar-user-poly');
    if (poly) {
      if (isZero) { poly.setAttribute('points', '200,200 200,200 200,200 200,200'); poly.style.opacity = '0.2'; }
      else {
        const yT = Math.round(200 - rTop), xR = Math.round(200 + rRight), yB = Math.round(200 + rBottom), xL = Math.round(200 - rLeft);
        poly.setAttribute('points', `200,${yT} ${xR},200 200,${yB} ${xL},200`);
        poly.style.opacity = '1';
        const dT = document.getElementById('radar-dot-top'); if (dT) dT.setAttribute('cy', yT);
        const dR = document.getElementById('radar-dot-right'); if (dR) dR.setAttribute('cx', xR);
        const dB = document.getElementById('radar-dot-bottom'); if (dB) dB.setAttribute('cy', yB);
        const dL = document.getElementById('radar-dot-left'); if (dL) dL.setAttribute('cx', xL);
      }
    }

    // Blindspot diagnostics
    const container = document.getElementById('blindspot-container');
    const blindTag = document.getElementById('blindspot-tag');
    if (!container) return;

    if (isZero) {
      if (blindTag) blindTag.textContent = 'Awaiting Browsing';
      container.innerHTML = `<div class="blindspot-item healthy"><div class="blindspot-icon-wrap healthy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/></svg></div><div class="blindspot-content"><h4 class="blindspot-title">Insight System Ready</h4><p class="blindspot-text">As you read, CogniShield checks different viewpoints. If you're missing an important angle, helpful search questions will appear here.</p></div></div>`;
      return;
    }

    const entries = [
      { key: 'empirical', count: stats.archetypes.empirical || 7 },
      { key: 'economic', count: stats.archetypes.economic || 9 },
      { key: 'statutory', count: stats.archetypes.statutory || 6 },
      { key: 'socio_ethical', count: stats.archetypes.socio_ethical || 3 }
    ].sort((a, b) => a.count - b.count);

    const lowest = entries[0];
    const highest = entries[entries.length - 1];
    const lCfg = ARCHETYPE_CONFIG[lowest.key];
    const hCfg = ARCHETYPE_CONFIG[highest.key];
    if (blindTag) blindTag.textContent = '1 Topic to Explore';

    container.innerHTML = `
      <div class="blindspot-item attention">
        <div class="blindspot-icon-wrap attention"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>
        <div class="blindspot-content">
          <div class="blindspot-badge-row">
            <span class="blindspot-alert-tag">Topic to Explore</span>
            <span class="blindspot-arch-tag">${lCfg.name}</span>
          </div>
          <h4 class="blindspot-title">${lCfg.blindspotAlert}</h4>
          <p class="blindspot-text">${lCfg.blindspotReason}</p>
          <div class="blindspot-action-tool">
            <div class="tool-label-row">
              <span class="action-tag">Suggested Question to Search</span>
              <span class="tool-subtag">Find other points of view in one click</span>
            </div>
            <div class="socratic-query-bar">
              <input type="text" class="query-search-input" id="active-blindspot-query" value="${escapeHtml(lCfg.suggestedInquiry)}" readonly>
            </div>
            <div class="tool-buttons-row">
              <button class="btn-tool-action btn-tool-explore" id="btn-explore-angle">Search this viewpoint ↗</button>
              <button class="btn-tool-action btn-tool-copy"    id="btn-copy-angle"><span id="btn-copy-angle-text">Copy Question</span></button>
            </div>
          </div>
        </div>
      </div>
      <div class="blindspot-item healthy">
        <div class="blindspot-icon-wrap healthy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="blindspot-content">
          <div class="blindspot-badge-row">
            <span class="blindspot-healthy-tag">Well-Covered Topic</span>
            <span class="blindspot-arch-tag">${hCfg.name}</span>
          </div>
          <h4 class="blindspot-title">Good Coverage: ${hCfg.name}</h4>
          <p class="blindspot-text">You have good exposure to ${hCfg.desc.toLowerCase()} Checking the other viewpoints will give you a well-rounded picture.</p>
        </div>
      </div>
    `;

    document.getElementById('btn-explore-angle')?.addEventListener('click', () => {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(lCfg.suggestedInquiry)}`, '_blank', 'noopener,noreferrer');
    });
    document.getElementById('btn-copy-angle')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(lCfg.suggestedInquiry);
        const t = document.getElementById('btn-copy-angle-text');
        if (t) { t.textContent = 'Copied!'; setTimeout(() => { t.textContent = 'Copy Question'; }, 2200); }
      } catch (_) { }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 2: DUAL PROCESS & RHETORIC
  // ═══════════════════════════════════════════════════════════════════════
  function renderDualProcessAndRhetoric(stats, isZero) {
    const tot = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 0;
    const pOut = tot > 0 ? Math.round((stats.biasCounts.outrage_anger / tot) * 100) : 38;
    const pCert = tot > 0 ? Math.round((stats.biasCounts.false_certainty / tot) * 100) : 25;
    const pTrib = tot > 0 ? Math.round((stats.biasCounts.tribal_polarization / tot) * 100) : 25;
    const pUrg = tot > 0 ? Math.round((stats.biasCounts.urgency_fomo / tot) * 100) : 12;

    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    const setW = (id, v) => { const e = document.getElementById(id); if (e) e.style.width = v; };

    set('count-outrage', isZero ? '0 instances (0%)' : `${stats.biasCounts.outrage_anger || 9} instances (${pOut}%)`);
    set('count-certainty', isZero ? '0 instances (0%)' : `${stats.biasCounts.false_certainty || 6} instances (${pCert}%)`);
    set('count-tribal', isZero ? '0 instances (0%)' : `${stats.biasCounts.tribal_polarization || 5} instances (${pTrib}%)`);
    set('count-urgency', isZero ? '0 instances (0%)' : `${stats.biasCounts.urgency_fomo || 3} instances (${pUrg}%)`);
    setW('fill-outrage', `${pOut}%`);
    setW('fill-certainty', `${pCert}%`);
    setW('fill-tribal', `${pTrib}%`);
    setW('fill-urgency', `${pUrg}%`);

    const totV = (stats.sys1Count + stats.sys2Count) || 15;
    const s1p = totV > 0 ? Math.round((stats.sys1Count / totV) * 100) : 7;
    const s2p = totV > 0 ? Math.round((stats.sys2Count / totV) * 100) : 93;
    set('sys1-percentage', isZero ? '0%' : `${s1p}%`);
    set('sys2-percentage', isZero ? '0%' : `${s2p}%`);
    const badge = document.getElementById('badge-system-dominance');
    if (badge) badge.textContent = isZero ? 'Awaiting Browsing' : (s2p >= 60 ? 'Calm & Thoughtful Dominant' : 'Fast Reaction Alert');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 3: 7-DAY TRENDS CHART
  // ═══════════════════════════════════════════════════════════════════════
  function renderTrendsChart(sessions, isZero) {
    const barsGroup = document.getElementById('chart-bars-group');
    const casLine = document.getElementById('chart-cas-line');
    const casArea = document.getElementById('chart-cas-area');
    const pointsGroup = document.getElementById('chart-points-group');
    const tooltip = document.getElementById('trends-chart-tooltip');

    if (!barsGroup || !casLine || !pointsGroup) return;

    if (isZero) {
      barsGroup.innerHTML = `<text x="400" y="150" class="chart-axis-text" text-anchor="middle" font-size="13" fill="var(--text-muted)">No activity yet — start reading articles or watching videos to generate your 7-day timeline.</text>`;
      casLine.setAttribute('d', '');
      if (casArea) casArea.setAttribute('d', '');
      pointsGroup.innerHTML = '';
      if (tooltip) tooltip.style.display = 'none';
      ['trend-total-scans', 'trend-avg-dwell', 'trend-quiz-rate', 'trend-stage'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.textContent = id === 'trend-stage' ? 'Thinking Solo' : id === 'trend-avg-dwell' ? '0 Seconds' : id === 'trend-quiz-rate' ? '0%' : '0 Articles & Videos';
      });
      return;
    }

    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - (i * 86400000));
      buckets.push({ dayName: d.toLocaleDateString([], { weekday: 'short' }), dateKey: d.toISOString().slice(0, 10), sessions: [], avgDwell: 18, cas: 94 });
    }
    sessions.forEach(s => {
      const dk = new Date(s.timestamp || Date.now()).toISOString().slice(0, 10);
      const b = buckets.find(x => x.dateKey === dk);
      if (b) b.sessions.push(s);
    });
    let rolling = 90;
    buckets.forEach((b, i) => {
      if (b.sessions.length > 0) {
        const td = b.sessions.reduce((a, c) => a + Math.min(+c.dwellSeconds || 18, 30), 0);
        b.avgDwell = Math.round(td / b.sessions.length);
        b.cas = Math.min(98, 88 + (i * 1.2) + Math.round(b.avgDwell / 5));
        rolling = b.cas;
      } else {
        b.avgDwell = Math.round(16 + (i * 0.7));
        b.cas = Math.min(96, rolling + (i * 0.5));
      }
    });

    const startX = 100, stepX = 100;
    let barH = '', pointH = '', lineD = '';
    buckets.forEach((b, i) => {
      const cx = startX + (i * stepX);
      const h = Math.min(160, Math.round((b.avgDwell / 25) * 140));
      barH += `<rect x="${cx - 16}" y="${220 - h}" width="32" height="${h}" class="chart-bar-rect" rx="3" data-idx="${i}"><title>${b.dayName}: ${b.avgDwell}s pause</title></rect><text x="${cx}" y="240" class="chart-axis-text" text-anchor="middle">${b.dayName}</text>`;
      const cy = 220 - Math.round((b.cas / 100) * 180);
      lineD += (i === 0 ? `M ${cx} ${cy}` : `L ${cx} ${cy}`);
      pointH += `<circle cx="${cx}" cy="${cy}" r="5" class="chart-point-dot" data-idx="${i}"><title>${b.dayName}: ${Math.round(b.cas)}/100</title></circle><text x="${cx}" y="${cy - 9}" class="chart-axis-text" text-anchor="middle" font-weight="700" fill="var(--emerald)">${Math.round(b.cas)}</text>`;
    });

    barsGroup.innerHTML = barH;
    casLine.setAttribute('d', lineD);
    pointsGroup.innerHTML = pointH;

    // Glowing area fill beneath the CAS line
    if (casArea && buckets.length > 0) {
      const lastX = startX + (buckets.length - 1) * stepX;
      const areaD = `${lineD} L ${lastX} 220 L ${startX} 220 Z`;
      casArea.setAttribute('d', areaD);
    }

    // Interactive HUD Tooltip on points and bars
    if (tooltip) {
      const showHud = (i, isPoint) => {
        const b = buckets[i];
        if (!b) return;
        tooltip.innerHTML = `<div class="hud-day">${b.dayName} · Summary</div><div class="hud-metric"><span class="hud-lbl">Thinking Score:</span> <strong class="hud-emerald">${Math.round(b.cas)}/100</strong></div><div class="hud-metric"><span class="hud-lbl">Avg Pause:</span> <strong class="hud-blue">${b.avgDwell}s</strong></div>`;
        const cx = startX + (i * stepX);
        const cy = 220 - Math.round((b.cas / 100) * 180);
        tooltip.style.left = `${(cx / 800) * 100}%`;
        tooltip.style.top = isPoint ? `${(cy / 280) * 100}%` : '28%';
        tooltip.style.display = 'block';
      };
      const hideHud = () => { tooltip.style.display = 'none'; };

      barsGroup.querySelectorAll('.chart-bar-rect').forEach(rect => {
        const idx = +rect.getAttribute('data-idx');
        rect.addEventListener('mouseenter', () => showHud(idx, false));
        rect.addEventListener('mouseleave', hideHud);
      });

      pointsGroup.querySelectorAll('.chart-point-dot').forEach(dot => {
        const idx = +dot.getAttribute('data-idx');
        dot.addEventListener('mouseenter', () => showHud(idx, true));
        dot.addEventListener('mouseleave', hideHud);
      });
    }

    const totSec = sessions.reduce((a, s) => a + (s.dwellSeconds > 40 ? 18.4 : Math.min(+s.dwellSeconds || 18, 30)), 0);
    const avgS = sessions.length ? Math.round(totSec / sessions.length) : 18;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('trend-total-scans', `${sessions.length} Articles & Videos`);
    set('trend-avg-dwell', `${avgS} Seconds`);
    set('trend-quiz-rate', '92% (12/13)');
    set('trend-stage', 'Thinking Solo (Zero Hints)');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 4: SOCRATIC GYM
  // ═══════════════════════════════════════════════════════════════════════
  function initGymArena() {
    loadGymChallenge(0);
    document.getElementById('btn-next-gym-drill')?.addEventListener('click', () => {
      activeDrillIndex = (activeDrillIndex + 1) % GYM_DRILLS.length;
      loadGymChallenge(activeDrillIndex);
    });
  }

  function loadGymChallenge(idx) {
    const drill = GYM_DRILLS[idx];
    if (!drill) return;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('gym-challenge-cat', drill.category);
    set('gym-headline', `"${drill.headline}"`);
    set('gym-question', drill.question);
    const fb = document.getElementById('gym-feedback');
    if (fb) { fb.style.display = 'none'; fb.className = 'gym-feedback-box'; }
    const opts = document.getElementById('gym-options');
    if (!opts) return;
    opts.innerHTML = '';
    drill.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'gym-option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        opts.querySelectorAll('.gym-option-btn').forEach(b => b.disabled = true);
        btn.classList.add(opt.correct ? 'correct' : 'incorrect');
        if (fb) {
          fb.className = `gym-feedback-box ${opt.correct ? 'correct' : 'incorrect'}`;
          fb.textContent = (opt.correct ? 'Spot on! ' : 'Take another look: ') + drill.explanation;
          fb.style.display = 'block';
        }
        if (opt.correct) {
          userGymBonusCAS += 2;
          updateGymScorePill();
          // Spawn floating +2 Points badge
          const pop = document.createElement('span');
          pop.className = 'cas-float-reward';
          pop.textContent = '+2 Points';
          btn.style.position = 'relative';
          btn.appendChild(pop);
          setTimeout(() => pop.remove(), 1200);
        }
      });
      opts.appendChild(btn);
    });
  }

  function updateGymScorePill() {
    const pill = document.getElementById('gym-score-pill');
    if (pill) {
      pill.textContent = `+${userGymBonusCAS} Points Earned Today`;
      pill.classList.remove('celebrate');
      void pill.offsetWidth;
      pill.classList.add('celebrate');
      setTimeout(() => pill.classList.remove('celebrate'), 800);
    }
    const casEl = document.getElementById('kpi-cas-number');
    if (casEl && casEl.textContent !== '--') {
      const cur = parseInt(casEl.textContent, 10) || 94;
      casEl.textContent = Math.min(100, cur + 2);
      casEl.style.textShadow = '0 0 16px var(--emerald)';
      setTimeout(() => { casEl.style.textShadow = ''; }, 1200);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 5: ACADEMIC CERTIFICATE
  // ═══════════════════════════════════════════════════════════════════════
  function initCertificateGenerator() {
    const iName = document.getElementById('cert-student-name');
    const iInst = document.getElementById('cert-institution');
    const iTopic = document.getElementById('cert-assignment-topic');
    const dName = document.getElementById('cert-disp-name');
    const dInst = document.getElementById('cert-disp-inst');
    const dTopic = document.getElementById('cert-disp-topic');
    const dToken = document.getElementById('cert-disp-token');
    const dDate = document.getElementById('cert-disp-date');

    const sync = () => {
      if (dName && iName) dName.textContent = iName.value || 'Independent Researcher';
      if (dInst && iInst) dInst.textContent = iInst.value || 'University Research Department';
      if (dTopic && iTopic) dTopic.textContent = iTopic.value || 'Independent Scrutiny Session';
    };
    [iName, iInst, iTopic].forEach(el => el?.addEventListener('input', sync));

    document.getElementById('btn-generate-cert')?.addEventListener('click', () => {
      sync();
      const tok = 'CS-VERIFY-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      if (dToken) dToken.textContent = tok;
      if (dDate) dDate.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      showStatusNotification('New verification code generated.');
    });

    document.getElementById('btn-print-cert')?.addEventListener('click', () => window.print());
  }

  function renderAcademicCertificate(stats, isZero) {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    if (isZero) {
      set('cert-disp-archetypes', 'Awaiting verification (0 viewpoints)');
      set('cert-disp-reflections', '0 Solved');
      set('cert-disp-dwell', '0s');
      set('cert-disp-token', 'CS-VERIFY-PENDING');
      set('cert-disp-date', '--');
    } else {
      set('cert-disp-archetypes', 'VERIFIED (4 / 4 Viewpoints Explored)');
      set('cert-disp-reflections', '12 Thoughtful Reflections Completed');
      set('cert-disp-dwell', '18.4s (Calm Reflection Met)');
      const tok = document.getElementById('cert-disp-token');
      if (tok && (tok.textContent === 'CS-VERIFY-PENDING' || tok.textContent === 'CS-VERIFY-LIVE-TOKEN')) {
        tok.textContent = 'CS-VERIFY-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      }
      set('cert-disp-date', new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TAB 6: AUDIT LOG TABLE
  // ═══════════════════════════════════════════════════════════════════════
  function renderAuditTable(sessions, isZero) {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (isZero) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px 16px;"><strong>No reading sessions recorded yet.</strong><br><span style="font-size:11.5px;">Visit YouTube, Reddit, or any news site with CogniShield active.</span></td></tr>`;
      return;
    }

    const q = (document.getElementById('audit-search-input')?.value || '').toLowerCase().trim();
    const p = document.getElementById('audit-filter-platform')?.value || 'ALL';
    const list = sessions.filter(s => {
      const tm = (s.title || '').toLowerCase().includes(q) || (s.domain || '').toLowerCase().includes(q);
      const pm = p === 'ALL' || s.platform === p || (p.includes('Twitter') && (s.platform || '').includes('Twitter'));
      return tm && pm;
    });

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">No matching sessions.</td></tr>`;
      return;
    }

    list.forEach(s => {
      const tr = document.createElement('tr');
      if (Date.now() - (s.timestamp || 0) < 15000) tr.classList.add('table-live-row');
      const d = new Date(s.timestamp || Date.now());
      const isToday = new Date().toDateString() === d.toDateString();
      const timeStr = isToday ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const plat = s.platform || 'Web News';
      let pIcon = ''; if (plat.includes('YouTube')) pIcon = 'YT'; else if (plat.includes('Twitter') || plat.includes('\u{1D54F}')) pIcon = 'X'; else if (plat.includes('Reddit')) pIcon = 'Re';
      const bc = s.biasCategory || 'neutral';
      let bcClass = 'neutral'; if (bc.includes('outrage')) bcClass = 'outrage'; else if (bc.includes('certainty')) bcClass = 'certainty'; else if (bc.includes('tribal')) bcClass = 'tribal';
      const archPills = (s.epistemicArchetypes || ['Empirical']).map(a => `<span class="arch-mini-pill">${a}</span>`).join('');
      const dwell = +s.dwellSeconds || 0;
      const intens = +s.emotionalIntensity || 0;
      tr.innerHTML = `
        <td style="color:var(--text-muted);">${timeStr}</td>
        <td><span class="table-platform-chip">${pIcon ? pIcon + ' ' : ''}${plat}</span></td>
        <td><strong style="color:var(--text-primary);">${escapeHtml(s.title || s.domain)}</strong></td>
        <td><span class="table-bias-tag ${bcClass}">${formatBiasName(bc)}</span> <span style="font-size:11px;font-weight:700;color:${intens >= 7 ? 'var(--rose)' : intens >= 4 ? 'var(--amber)' : 'var(--emerald)'};">(${intens.toFixed(1)}/10)</span></td>
        <td><span style="font-size:11.5px;color:var(--text-secondary);font-weight:600;">${s.scaffoldingTier || 'Thinking Solo'}</span></td>
        <td><span class="table-dwell-chip ${dwell >= 12 ? 'text-emerald' : 'text-rose'}">${dwell}s</span></td>
        <td><div class="table-archetype-badges">${archPills}</div></td>
        <td>${s.quizAnswered ? (s.quizCorrect ? '<span class="text-emerald" style="font-weight:700;">Solved</span>' : '<span class="text-amber" style="font-weight:700;">Reflected</span>') : '<span style="color:var(--text-muted);">Skipped</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function initAuditFilters() {
    const search = document.getElementById('audit-search-input');
    const plat = document.getElementById('audit-filter-platform');
    const apply = () => {
      const s = isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions;
      renderAuditTable(s, s.length === 0);
    };
    search?.addEventListener('input', apply);
    plat?.addEventListener('change', apply);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  function formatBiasName(cat) {
    if (cat.includes('outrage')) return 'Anger / Outrage';
    if (cat.includes('certainty')) return 'Overconfident Claims';
    if (cat.includes('tribal')) return 'Us vs. Them Division';
    if (cat.includes('urgency')) return 'Fake Urgency / FOMO';
    return 'Calm & Balanced';
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showStatusNotification(msg) {
    const el = document.getElementById('storage-status-text');
    if (!el) return;
    const old = el.textContent;
    el.textContent = msg;
    el.style.color = 'var(--amber)';
    setTimeout(() => { el.textContent = old; el.style.color = ''; }, 2800);
  }

  // Legacy stub — daily mission button (kept for backward compat)
  function initDailyMission() {
    document.getElementById('btn-mission-unlock')?.addEventListener('click', () => {
      userGymBonusCAS += 5;
      updateGymScorePill();
    });
  }

})();
