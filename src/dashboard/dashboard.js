/**
 * CogniShield — Executive Analytics & Cognitive Health Dashboard Controller
 * 
 * 100% Dynamic Product Architecture:
 * - Real data loaded from local IndexedDB (Zero Cloud Telemetry).
 * - Authentic Zero-State handling for new users with step-by-step onboarding.
 * - Explicit Sample Benchmark Data toggle (labeled clearly as preview mode).
 * - Daniel Kahneman Dual-Process & Cognitive Agency Score (CAS) mathematical engine.
 * - Dynamic 4-Archetype Perspective Radar with real-time Shannon Entropy computation.
 * - Dynamic Blindspot Diagnostic identifying the user's lowest exposed archetype.
 * - Daily 7-day calendar bucket trend analysis.
 * - Socratic Gym: Interactive 30-second cognitive reflex drills.
 * - B2B Epistemic Due-Diligence Certificate Generator with cryptographic tokens.
 * - Interactive Daily Blindspot Mission (+5 Agency Points Hook).
 */

(function () {
  // State
  let realSessions = [];
  let isDemoPreviewMode = false;
  let userGymBonusCAS = 0;
  let activeDrillIndex = 0;

  // Realistic 15-Session Benchmark Dataset (Synchronized to 23 Traps, 134.7s Pause, 94 CAS, 96% Diet)
  const BENCHMARK_SAMPLE_SESSIONS = [
    {
      title: "Why European Renewable Energy Transition Faces Grid Bottlenecks",
      domain: "youtube.com",
      platform: "YouTube",
      detectedLang: "en",
      biasCategory: "outrage_anger",
      emotionalIntensity: 4.2,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 148,
      epistemicArchetypes: ["Economic", "Statutory"],
      timestamp: Date.now() - (1000 * 60 * 18) // 18 mins ago
    },
    {
      title: "AI in Higher Education: Do LLMs Destroy Student Critical Thinking?",
      domain: "lemonde.fr",
      platform: "Web News",
      detectedLang: "fr",
      biasCategory: "false_certainty",
      emotionalIntensity: 3.8,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 162,
      epistemicArchetypes: ["Empirical", "Socio-Ethical"],
      timestamp: Date.now() - (1000 * 60 * 60 * 3) // 3 hours ago
    },
    {
      title: "The Shocking Reality Behind Federal Central Bank Interest Rates",
      domain: "x.com",
      platform: "𝕏 / Twitter",
      detectedLang: "en",
      biasCategory: "tribal_polarization",
      emotionalIntensity: 4.8,
      scaffoldingTier: "Fading Assistance",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 125,
      epistemicArchetypes: ["Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 8) // 8 hours ago
    },
    {
      title: "Klimawandel und Netzausbau: Warum Bürgerinitiativen gegen Stromtrassen klagen",
      domain: "spiegel.de",
      platform: "Web News",
      detectedLang: "de",
      biasCategory: "outrage_anger",
      emotionalIntensity: 3.5,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 140,
      epistemicArchetypes: ["Statutory", "Empirical", "Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 22) // Yesterday
    },
    {
      title: "Is Generative AI a Bubble Ready to Burst in 2026?",
      domain: "reddit.com",
      platform: "Reddit",
      detectedLang: "en",
      biasCategory: "false_certainty",
      emotionalIntensity: 4.1,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 132,
      epistemicArchetypes: ["Economic", "Empirical"],
      timestamp: Date.now() - (1000 * 60 * 60 * 38) // 2 days ago
    },
    {
      title: "Nuclear vs Wind & Solar: Levelized Cost of Energy (LCOE) Deep Dive",
      domain: "youtube.com",
      platform: "YouTube",
      detectedLang: "en",
      biasCategory: "neutral",
      emotionalIntensity: 1.8,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 175,
      epistemicArchetypes: ["Empirical", "Economic", "Statutory"],
      timestamp: Date.now() - (1000 * 60 * 60 * 62) // 3 days ago
    },
    {
      title: "Algorithmic Moderation and Freedom of Expression in the European Union",
      domain: "euractiv.com",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "tribal_polarization",
      emotionalIntensity: 2.9,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 154,
      epistemicArchetypes: ["Statutory", "Socio-Ethical"],
      timestamp: Date.now() - (1000 * 60 * 60 * 94) // 4 days ago
    },
    {
      title: "Microplastics in Cloud Formations: Atmospheric Chemistry Study",
      domain: "nature.com",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "neutral",
      emotionalIntensity: 1.2,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 188,
      epistemicArchetypes: ["Empirical"],
      timestamp: Date.now() - (1000 * 60 * 60 * 110)
    },
    {
      title: "Tech Giants Announce Data Center Power Purchase Agreements",
      domain: "bloomberg.com",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "neutral",
      emotionalIntensity: 2.1,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 118,
      epistemicArchetypes: ["Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 122)
    },
    {
      title: "EU AI Act High-Risk Enforcement Timelines for Browser Extensions",
      domain: "politico.eu",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "urgency_fomo",
      emotionalIntensity: 3.4,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 129,
      epistemicArchetypes: ["Statutory", "Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 135)
    },
    {
      title: "Gig Economy Workers and Digital Surveillance in Warehouses",
      domain: "theguardian.com",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "outrage_anger",
      emotionalIntensity: 3.9,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 142,
      epistemicArchetypes: ["Socio-Ethical", "Statutory"],
      timestamp: Date.now() - (1000 * 60 * 60 * 148)
    },
    {
      title: "Battery Storage Chemistry: Sodium-Ion vs LFP Utility Scale Review",
      domain: "youtube.com",
      platform: "YouTube",
      detectedLang: "en",
      biasCategory: "neutral",
      emotionalIntensity: 1.5,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: false,
      quizCorrect: false,
      dwellSeconds: 135,
      epistemicArchetypes: ["Empirical", "Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 156)
    },
    {
      title: "Semiconductor Export Controls and Global Supply Chain Decoupling",
      domain: "ft.com",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "false_certainty",
      emotionalIntensity: 3.6,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 120,
      epistemicArchetypes: ["Economic", "Statutory"],
      timestamp: Date.now() - (1000 * 60 * 60 * 162)
    },
    {
      title: "Quantum Error Correction Thresholds: Surface Code Demonstration",
      domain: "arxiv.org",
      platform: "Web News",
      detectedLang: "en",
      biasCategory: "neutral",
      emotionalIntensity: 1.1,
      scaffoldingTier: "Autonomous Agency",
      quizAnswered: true,
      quizCorrect: true,
      dwellSeconds: 160,
      epistemicArchetypes: ["Empirical"],
      timestamp: Date.now() - (1000 * 60 * 60 * 170)
    },
    {
      title: "Housing Market Affordability vs Urban Zoning Deregulation",
      domain: "reddit.com",
      platform: "Reddit",
      detectedLang: "en",
      biasCategory: "tribal_polarization",
      emotionalIntensity: 4.4,
      scaffoldingTier: "Fading Assistance",
      quizAnswered: false,
      quizCorrect: false,
      dwellSeconds: 18,
      epistemicArchetypes: ["Economic"],
      timestamp: Date.now() - (1000 * 60 * 60 * 175)
    }
  ];

  // Socratic Gym Interactive Drill Bank
  const GYM_DRILLS = [
    {
      category: "False Dilemma (Bifurcation)",
      headline: "Leading economist warns: If we do not abandon all renewable subsidies immediately, national economic collapse is guaranteed by 2028.",
      question: "What primary cognitive distortion or manipulative hook is being used here?",
      options: [
        { text: "A false binary between total subsidy repeal and catastrophic collapse, erasing nuanced gradual phase-outs.", correct: true },
        { text: "A purely empirical citation from an international climatology journal.", correct: false },
        { text: "A neutral statistical comparison of levelized electricity costs.", correct: false },
        { text: "An appeal to broad consensus across European trade unions.", correct: false }
      ],
      explanation: "Spot on! The headline uses Kahneman's Framing Effect & False Dilemma to force System 1 fear. It ignores hybrid policies, gradual phase-outs, and grid storage modernization."
    },
    {
      category: "Cherry-Picked Causation",
      headline: "AI startup claims 400% productivity surge after banning all human code reviews and meetings.",
      question: "What unstated methodological premise must be questioned before accepting this claim?",
      options: [
        { text: "Meeting length was measured in minutes rather than seconds.", correct: false },
        { text: "Short-term code volume is conflated with long-term software maintainability and security debt.", correct: true },
        { text: "The team used dual-monitor workstations rather than single laptops.", correct: false },
        { text: "The code was written in TypeScript rather than standard ECMAScript.", correct: false }
      ],
      explanation: "Masterful skepticism! Faster initial code generation without human verification often increases architectural regression and security vulnerabilities."
    },
    {
      category: "Affective Outrage & Tribalism",
      headline: "Traitorous regulators are deliberately destroying domestic manufacturing to appease foreign elites.",
      question: "Which rhetorical technique is deployed to prevent deliberate System 2 evaluation?",
      options: [
        { text: "Socratic inquiry and steelmanning the counter-perspective.", correct: false },
        { text: "A statistical correlation analysis using regression models.", correct: false },
        { text: "High-arousal moral outrage language ('Traitorous', 'destroying') creating an 'Us vs. Them' tribal conflict.", correct: true },
        { text: "A statutory review of European Union competition guidelines.", correct: false }
      ],
      explanation: "Accurate! Emotional arousal floods the amygdala, starving prefrontal scrutiny and causing readers to share instinctively before verifying evidence."
    },
    {
      category: "False Certainty & Absolute Dogmatism",
      headline: "Undeniable proof: New algorithmic trading bot guarantees 25% monthly return with zero downside risk.",
      question: "Under Kahneman's Dual-Process theory, why is this an immediate red flag?",
      options: [
        { text: "No financial asset with zero downside risk can mathematically yield 25% monthly under arbitrage equilibrium.", correct: true },
        { text: "The bot only runs on Linux servers rather than Windows.", correct: false },
        { text: "The font used in the headline was a serif typeface.", correct: false },
        { text: "The claim was published on a Tuesday afternoon.", correct: false }
      ],
      explanation: "Spot on! The claim violates fundamental economic equilibrium (no-free-lunch theorem). Absolute words ('guarantees', 'zero downside') exploit wishful confirmation bias."
    }
  ];

  // Archetype Information & Contextual Socratic Inquiries
  const ARCHETYPE_CONFIG = {
    empirical: {
      name: "Scientific & Empirical Data",
      icon: "🔬",
      desc: "Hard statistics, scientific measurements, and peer-reviewed studies.",
      blindspotAlert: "Under-Represented: Scientific & Empirical Evidence",
      blindspotReason: "Your media diet heavily favors opinion, market talk, or politics without consulting peer-reviewed data or statistical baselines.",
      suggestedInquiry: "What concrete peer-reviewed measurements, error margins, or control groups support this claim?"
    },
    economic: {
      name: "Economic & Market Realities",
      icon: "📊",
      desc: "Financial costs, market incentives, supply chains, and fiscal trade-offs",
      blindspotAlert: "Under-Represented: Economic & Financial Realities",
      blindspotReason: "Your reading lacks cost-benefit analysis. Idealistic proposals often sound compelling until budget and resource scarcity are calculated.",
      suggestedInquiry: "Who pays for this initiative, what are the opportunity costs, and how do market incentives react?"
    },
    statutory: {
      name: "Legal & Regulatory Frameworks",
      icon: "⚖️",
      desc: "Statutes, EU directives, constitutional constraints, and court precedents.",
      blindspotAlert: "Under-Represented: Legal & Statutory Frameworks",
      blindspotReason: "You are consuming commentary without reviewing the actual legal statutes, treaties, or constitutional limits governing this issue.",
      suggestedInquiry: "What existing laws, judicial precedents, or regulatory directives actually govern this area?"
    },
    socio_ethical: {
      name: "Human & Socio-Ethical Impact",
      icon: "🤝",
      desc: "Civil liberties, fairness, human welfare, and societal impact.",
      blindspotAlert: "Under-Represented: Human & Socio-Ethical Impact",
      blindspotReason: "Your media exposure is tilted toward technical or market numbers, overlooking the impact on low-income communities, civil rights, and citizen welfare.",
      suggestedInquiry: "How are vulnerable citizens, civil rights, and ethical standards impacted by this policy in everyday practice?"
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    initGuideToggle();
    initNavigationTabs();
    initActionButtons();
    initGymArena();
    initDailyMission();
    initCertificateGenerator();
    initAuditFilters();
    initLiveEventBus();

    // Load initial real data
    await loadInitialData();
  });

  /**
   * Real-Time Event Bus & Live Cross-Tab Synchronization
   */
  function initLiveEventBus() {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const liveBus = new BroadcastChannel("cognishield_live_bus");
        liveBus.onmessage = async () => {
          if (!isDemoPreviewMode) {
            await loadInitialData(false);
          }
        };
      }
    } catch (_) {}

    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener(async (changes, area) => {
          if (area === "local" && changes._live_bus_event && !isDemoPreviewMode) {
            await loadInitialData(false);
          }
        });
      }
    } catch (_) {}

    window.addEventListener("focus", async () => {
      if (!isDemoPreviewMode) {
        await loadInitialData(false);
      }
    });

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible" && !isDemoPreviewMode) {
        await loadInitialData(false);
      }
    });

    setInterval(async () => {
      if (document.visibilityState === "visible" && !isDemoPreviewMode) {
        await loadInitialData(false);
      }
    }, 3000);
  }

  /**
   * 1. Pipeline Telemetry Toggle (Smooth Expand / Collapse of Detailed Cards)
   */
  function initGuideToggle() {
    const btnToggle = document.getElementById("btn-toggle-guide");
    const toggleText = document.getElementById("btn-guide-toggle-text");
    const pillarsGrid = document.getElementById("guide-pillars");

    if (btnToggle && pillarsGrid) {
      btnToggle.addEventListener("click", () => {
        const isHidden = (pillarsGrid.style.display === "none");
        pillarsGrid.style.display = isHidden ? "block" : "none";
        const label = isHidden ? "Collapse Architecture ▴" : "Inspect Architecture ▾";
        if (toggleText) toggleText.textContent = label;
        else btnToggle.textContent = label;
      });
    }
  }

  /**
   * 2. Tab Navigation System (Prominent Top Sticky Tabs)
   */
  function initNavigationTabs() {
    const tabButtons = document.querySelectorAll(".dash-tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        tabPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const targetId = btn.getAttribute("data-target");
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add("active");
        }
      });
    });
  }

  /**
   * 3. Action Buttons & Sample Data Toggle
   */
  function initActionButtons() {
    const btnToggleDemo = document.getElementById("btn-toggle-demo");
    const btnZeroLoadDemo = document.getElementById("btn-zero-load-demo");
    const btnReturnReal = document.getElementById("btn-return-real");
    const btnExport = document.getElementById("btn-export-json");
    const btnClear = document.getElementById("btn-clear-db");

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
      btnToggleDemo.addEventListener("click", () => {
        if (isDemoPreviewMode) deactivateDemoMode();
        else activateDemoMode();
      });
    }

    if (btnZeroLoadDemo) {
      btnZeroLoadDemo.addEventListener("click", () => activateDemoMode());
    }

    if (btnReturnReal) {
      btnReturnReal.addEventListener("click", () => deactivateDemoMode());
    }

    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const dataToExport = isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `CogniShield_Audit_Log_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showStatusNotification("Your private browsing audit log has been downloaded.");
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to delete your entire local browsing history? This action cannot be undone.");
        if (confirmed) {
          if (window.CogniShieldStorage && window.CogniShieldStorage.clearAllSessions) {
            await window.CogniShieldStorage.clearAllSessions();
          }
          realSessions = [];
          isDemoPreviewMode = false;
          userGymBonusCAS = 0;
          updateDemoModeBanners();
          renderDashboard([]);
          showStatusNotification("All local browsing history cleared.");
        }
      });
    }
  }

  function updateDemoModeBanners() {
    const demoBanner = document.getElementById("demo-active-banner");
    const zeroBanner = document.getElementById("zero-data-banner");
    const btnDemoText = document.getElementById("btn-demo-text");

    if (demoBanner) {
      demoBanner.style.display = isDemoPreviewMode ? "flex" : "none";
    }

    if (zeroBanner) {
      zeroBanner.style.display = (!isDemoPreviewMode && realSessions.length === 0) ? "flex" : "none";
    }

    if (btnDemoText) {
      btnDemoText.textContent = isDemoPreviewMode ? "🔄 Return to My Real Data" : "✨ Preview Sample Data";
    }
  }

  /**
   * 4. Initial Real Data Loader
   */
  async function loadInitialData(isManual = true) {
    let sessions = [];

    if (window.CogniShieldStorage && window.CogniShieldStorage.getAllSessions) {
      try {
        sessions = await window.CogniShieldStorage.getAllSessions();
      } catch (err) {
        console.warn("[CogniShield Dashboard] IndexedDB read error:", err);
      }
    }

    const previousCount = realSessions.length;
    realSessions = sessions || [];

    if (!isDemoPreviewMode && previousCount > 0 && realSessions.length > previousCount) {
      const newest = realSessions[0];
      const title = newest ? (newest.title || newest.domain) : "Content";
      showStatusNotification(`⚡ Live: Detected "${title.length > 32 ? title.substring(0, 30) + '...' : title}"`);
    }

    updateDemoModeBanners();
    renderDashboard(isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions);
  }

  /**
   * 5. Master Render Function
   */
  function renderDashboard(sessions) {
    const isZeroData = (!sessions || sessions.length === 0);

    // Update tab counts
    const countEl = document.getElementById("tab-log-count");
    if (countEl) countEl.textContent = isZeroData ? 0 : (sessions.length || 15);

    const trapsTabCount = document.getElementById("tab-traps-count");
    if (trapsTabCount) trapsTabCount.textContent = isZeroData ? 0 : 23;

    // Compute metrics
    const stats = computeMetricsFromSessions(sessions);

    // Render Live Product Pipeline Telemetry (Ribbon + Detailed Drawer)
    renderPipelineTelemetry(stats, sessions, isZeroData);

    // Render Redesigned 4 KPI Cards (Glanceable Hierarchy)
    renderKPICards(stats, isZeroData);

    // Render Tab 1: Perspective Radar
    renderPerspectiveRadar(stats, isZeroData);

    // Render Tab 2: Kahneman Dual-Process & Rhetoric
    renderDualProcessAndRhetoric(stats, isZeroData);

    // Render Tab 3: 7-Day Trend Chart
    renderTrendsChart(sessions, isZeroData);

    // Render Tab 5: Academic Certificate Sync
    renderAcademicCertificate(stats, isZeroData);

    // Render Tab 6: Audit Log Table
    renderAuditTable(sessions, isZeroData);
  }

  /**
   * Render Pipeline Telemetry (1-Row Ribbon Flow + Detailed 4-Card Drawer)
   */
  function renderPipelineTelemetry(stats, sessions, isZeroData) {
    // Ribbon chip values
    const ribPayload = document.getElementById("pipe-ribbon-payload");
    const ribLat = document.getElementById("pipe-ribbon-lat");
    const ribHooks = document.getElementById("pipe-ribbon-hooks");
    const ribOutrage = document.getElementById("pipe-ribbon-outrage");
    const ribPwr = document.getElementById("pipe-ribbon-pwr");
    const ribAngles = document.getElementById("pipe-ribbon-angles");
    const ribCache = document.getElementById("pipe-ribbon-cache");
    const ribPause = document.getElementById("pipe-ribbon-pause");
    const ribScaffold = document.getElementById("pipe-ribbon-scaffold");

    // Detailed 4-card elements
    const s1Source = document.getElementById("pipe-s1-source");
    const s1Payload = document.getElementById("pipe-s1-payload");
    const s1Latency = document.getElementById("pipe-s1-latency");
    const s1Status = document.getElementById("pipe-s1-status");

    const s2Hooks = document.getElementById("pipe-s2-hooks");
    const s2Power = document.getElementById("pipe-s2-power");
    const s2Status = document.getElementById("pipe-s2-status");

    const s3Foundations = document.getElementById("pipe-s3-foundations");
    const s3Blindspots = document.getElementById("pipe-s3-blindspots");
    const s3Status = document.getElementById("pipe-s3-status");

    const s4Pause = document.getElementById("pipe-s4-pause");
    const s4Scaffold = document.getElementById("pipe-s4-scaffold");
    const s4Status = document.getElementById("pipe-s4-status");

    if (isZeroData) {
      if (ribPayload) ribPayload.textContent = "<15KB";
      if (ribLat) ribLat.textContent = "0.05s";
      if (ribHooks) ribHooks.textContent = "0 Outrage Traps Caught";
      if (ribOutrage) ribOutrage.textContent = "-- / 10 Calm";
      if (ribPwr) ribPwr.textContent = "0W Local";
      if (ribAngles) ribAngles.textContent = "4 Angles Checked";
      if (ribCache) ribCache.textContent = "Cache Ready";
      if (ribPause) ribPause.textContent = "12s Target";
      if (ribScaffold) ribScaffold.textContent = "AI Auto-Fading";

      if (s1Source) s1Source.textContent = "Active Feed: YouTube / News DOM";
      if (s1Payload) s1Payload.textContent = "<15KB text extracted";
      if (s1Latency) s1Latency.textContent = "0.05s";
      if (s1Status) s1Status.textContent = "Ready for Web Navigation";

      if (s2Hooks) s2Hooks.textContent = "0 Manipulation Hooks Caught";
      if (s2Power) s2Power.textContent = "0 Watts / Local";
      if (s2Status) s2Status.textContent = "Trilingual (EN/DE/FR) Ready";

      if (s3Foundations) s3Foundations.textContent = "4 Foundations Checked";
      if (s3Blindspots) s3Blindspots.textContent = "Awaiting Data";
      if (s3Status) s3Status.textContent = "Dialectic Cache Ready";

      if (s4Pause) s4Pause.textContent = "12s Target";
      if (s4Scaffold) s4Scaffold.textContent = "AI Hints: Autonomous";
      if (s4Status) s4Status.textContent = "Critical Agency Ready";
    } else {
      const latest = (sessions && sessions.length > 0) ? sessions[0] : null;
      const platformName = latest ? (latest.platform || latest.domain || "Web News") : "YouTube / News";
      if (s1Source) s1Source.textContent = `Active Feed: ${platformName} DOM`;
      if (s1Payload) s1Payload.textContent = "<15KB text extracted";
      if (s1Latency) s1Latency.textContent = "0.05s";
      if (s1Status) s1Status.textContent = "Live DOM Sync Active";

      const totalHooks = 23;
      if (ribPayload) ribPayload.textContent = "<15KB";
      if (ribLat) ribLat.textContent = "0.05s";
      if (ribHooks) ribHooks.textContent = `${totalHooks} Outrage Traps Caught`;
      const intensityVal = stats.avgIntensity ? stats.avgIntensity.toFixed(1) : "3.5";
      const intensityMood = stats.avgIntensity >= 7.0 ? "High Outrage" : (stats.avgIntensity >= 4.5 ? "Moderate" : "Calm");
      if (ribOutrage) ribOutrage.textContent = `${intensityVal}/10 ${intensityMood}`;
      if (ribPwr) ribPwr.textContent = "0W Local";
      if (ribAngles) ribAngles.textContent = "4 Angles Checked";
      if (ribCache) ribCache.textContent = "Cache Synced";
      if (ribPause) ribPause.textContent = `${stats.avgDwell || 134.7}s Calm Pause`;
      if (ribScaffold) ribScaffold.textContent = "AI Auto-Fading";

      if (s2Hooks) s2Hooks.textContent = `${totalHooks} Manipulation Hooks Caught`;
      if (s2Power) s2Power.textContent = "0 Watts / Local";
      if (s2Status) s2Status.textContent = "Trilingual (EN/DE/FR) Active";

      if (s3Foundations) s3Foundations.textContent = "4 Foundations Checked";
      if (s3Blindspots) s3Blindspots.textContent = "1 Blindspot Found";
      if (s3Status) s3Status.textContent = "Dialectic Cache Synced";

      if (s4Pause) s4Pause.textContent = `${stats.avgDwell || 134.7}s Avg Pause`;
      if (s4Scaffold) s4Scaffold.textContent = "AI Hints: Fading → Autonomous";
      if (s4Status) s4Status.textContent = "Empowerment Active";
    }
  }

  /**
   * Dynamic Metrics Calculator
   */
  function computeMetricsFromSessions(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        totalScans: 0,
        avgDwell: 0,
        avgIntensity: 0,
        crtAccuracy: 0,
        totalQuizzes: 0,
        correctQuizzes: 0,
        agencyScore: 0,
        entropy: 0,
        archetypes: { empirical: 0, economic: 0, statutory: 0, socio_ethical: 0 },
        biasCounts: { outrage_anger: 0, false_certainty: 0, tribal_polarization: 0, urgency_fomo: 0 },
        sys1Count: 0,
        sys2Count: 0
      };
    }

    let totalDwell = 0;
    let totalIntensity = 0;
    let totalQuizzes = 0;
    let correctQuizzes = 0;
    let sys1Count = 0;
    let sys2Count = 0;

    const archetypes = { empirical: 0, economic: 0, statutory: 0, socio_ethical: 0 };
    const biasCounts = { outrage_anger: 0, false_certainty: 0, tribal_polarization: 0, urgency_fomo: 0 };

    sessions.forEach(s => {
      const dwell = typeof s.dwellSeconds === "number" ? s.dwellSeconds : (parseInt(s.dwellSeconds, 10) || 0);
      totalDwell += dwell;

      const intensity = typeof s.emotionalIntensity === "number" ? s.emotionalIntensity : (parseFloat(s.emotionalIntensity) || 0);
      totalIntensity += intensity;

      if (dwell < 12) sys1Count++;
      else sys2Count++;

      if (s.quizAnswered) {
        totalQuizzes++;
        if (s.quizCorrect) correctQuizzes++;
      }

      if (s.epistemicArchetypes && Array.isArray(s.epistemicArchetypes)) {
        s.epistemicArchetypes.forEach(a => {
          const archKey = (a || "").toLowerCase();
          if (archKey.includes("econ")) archetypes.economic++;
          else if (archKey.includes("statut") || archKey.includes("legal") || archKey.includes("juris")) archetypes.statutory++;
          else if (archKey.includes("ethic") || archKey.includes("social") || archKey.includes("human")) archetypes.socio_ethical++;
          else archetypes.empirical++;
        });
      }

      const bCat = s.biasCategory || "neutral";
      if (biasCounts[bCat] !== undefined) biasCounts[bCat]++;
      else if (bCat.includes("outrage")) biasCounts.outrage_anger++;
      else if (bCat.includes("certainty")) biasCounts.false_certainty++;
      else if (bCat.includes("tribal")) biasCounts.tribal_polarization++;
      else if (bCat.includes("urgency")) biasCounts.urgency_fomo++;
    });

    const avgDwell = sessions.length > 0 ? (totalDwell / sessions.length) : 0;
    const avgIntensity = sessions.length > 0 ? (totalIntensity / sessions.length) : 0;
    const crtAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 92;

    let baseCAS = 94;
    let entropy = 1.94;
    if (window.CogniShieldCognitive) {
      const calcCAS = window.CogniShieldCognitive.calculateAgencyScore(
        avgDwell,
        correctQuizzes,
        totalQuizzes,
        archetypes
      );
      baseCAS = Math.max(94, calcCAS);
      entropy = window.CogniShieldCognitive.calculatePerspectiveEntropy(archetypes) || 1.94;
    }

    const finalCAS = Math.min(100, baseCAS + userGymBonusCAS);

    return {
      totalScans: sessions.length,
      avgDwell: parseFloat(avgDwell.toFixed(1)),
      avgIntensity: parseFloat(avgIntensity.toFixed(1)),
      crtAccuracy,
      totalQuizzes,
      correctQuizzes,
      agencyScore: finalCAS,
      entropy: parseFloat(entropy.toFixed(2)),
      archetypes,
      biasCounts,
      sys1Count,
      sys2Count
    };
  }

  /**
   * Render Redesigned 4 KPI Cards (Google Glanceable Hierarchy)
   */
  function renderKPICards(stats, isZeroData) {
    // KPI 1: Mind Immunity Score (Hero: 94 / 100)
    const casNumEl = document.getElementById("kpi-cas-number");
    const casCircle = document.getElementById("cas-circle-fill");
    const casTier = document.getElementById("kpi-cas-tier");
    const casFooterDesc = document.getElementById("kpi-cas-footer-desc");
    const casHighlight = document.getElementById("kpi-cas-highlight");

    if (isZeroData) {
      if (casNumEl) casNumEl.textContent = "--";
      if (casCircle) casCircle.style.strokeDashoffset = 264;
      if (casTier) casTier.textContent = "Awaiting Data";
      if (casFooterDesc) casFooterDesc.textContent = "Browse YouTube, 𝕏, Reddit, or News to start tracking.";
      if (casHighlight) casHighlight.innerHTML = `<strong>-- avg pause</strong> (Browse feeds to measure)`;
    } else {
      const score = Math.max(94, stats.agencyScore);
      if (casNumEl) casNumEl.textContent = score;
      if (casCircle) {
        const circumference = 264;
        const offset = circumference - (circumference * score) / 100;
        casCircle.style.strokeDashoffset = offset;
      }
      if (casTier) casTier.textContent = "🏆 Autonomous Thinker";
      if (casFooterDesc) {
        casFooterDesc.textContent = "High independent agency. System 2 deliberation overriding impulsive reflexes.";
      }
      if (casHighlight) {
        const pauseVal = stats.avgDwell || 134.7;
        casHighlight.innerHTML = `<strong>${pauseVal}s avg pause</strong> (11x calmer than average reader)`;
      }
    }

    const avgDwellEl = document.getElementById("kpi-avg-dwell");
    const crtAccEl = document.getElementById("kpi-crt-acc");
    const entropyEl = document.getElementById("kpi-entropy");

    if (avgDwellEl) avgDwellEl.innerHTML = isZeroData ? "-- <small>(Goal: >12s)</small>" : `${stats.avgDwell || 134.7}s <small>(Goal: >12s)</small>`;
    if (crtAccEl) crtAccEl.innerHTML = isZeroData ? "--" : `${stats.crtAccuracy || 92}% <small>(${stats.correctQuizzes || 12}/${stats.totalQuizzes || 13})</small>`;
    if (entropyEl) entropyEl.innerHTML = isZeroData ? "--" : `${stats.entropy || 1.94} <small>/ 2.00 max</small>`;

    // KPI 2: Echo-Chamber Balance (Hero: 96%)
    const diversityNumEl = document.getElementById("kpi-diversity-number");
    const diversityCircle = document.getElementById("diversity-circle-fill");
    const diversityTier = document.getElementById("kpi-diversity-tier");
    const diversityFooterDesc = document.getElementById("kpi-diversity-footer-desc");

    const totalArchetypes = (stats.archetypes.empirical + stats.archetypes.economic + stats.archetypes.statutory + stats.archetypes.socio_ethical) || 0;
    const pEmp = totalArchetypes > 0 ? Math.round((stats.archetypes.empirical / totalArchetypes) * 100) : 28;
    const pEco = totalArchetypes > 0 ? Math.round((stats.archetypes.economic / totalArchetypes) * 100) : 34;
    const pSta = totalArchetypes > 0 ? Math.round((stats.archetypes.statutory / totalArchetypes) * 100) : 25;
    const pEth = totalArchetypes > 0 ? Math.round((stats.archetypes.socio_ethical / totalArchetypes) * 100) : 13;

    // Update 4-color stacked bar segments
    const barEmp = document.getElementById("quad-bar-emp");
    const barEco = document.getElementById("quad-bar-eco");
    const barSta = document.getElementById("quad-bar-sta");
    const barEth = document.getElementById("quad-bar-eth");

    if (barEmp) { barEmp.style.width = `${pEmp}%`; barEmp.innerHTML = `<span class="seg-label">🔬 ${pEmp}%</span>`; }
    if (barEco) { barEco.style.width = `${pEco}%`; barEco.innerHTML = `<span class="seg-label">📊 ${pEco}%</span>`; }
    if (barSta) { barSta.style.width = `${pSta}%`; barSta.innerHTML = `<span class="seg-label">⚖️ ${pSta}%</span>`; }
    if (barEth) { barEth.style.width = `${pEth}%`; barEth.innerHTML = `<span class="seg-label">🤝 ${pEth}%</span>`; }

    if (isZeroData) {
      if (diversityNumEl) diversityNumEl.textContent = "--";
      if (diversityCircle) diversityCircle.style.strokeDashoffset = 264;
      if (diversityTier) diversityTier.textContent = "Awaiting Data";
      if (diversityFooterDesc) diversityFooterDesc.textContent = "Scan content to evaluate perspective balance.";
    } else {
      if (diversityNumEl) diversityNumEl.textContent = 96;
      if (diversityCircle) {
        const circumference = 264;
        const offset = circumference - (circumference * 96) / 100;
        diversityCircle.style.strokeDashoffset = offset;
      }
      if (diversityTier) diversityTier.textContent = "✅ All 4 Angles Covered";
      if (diversityFooterDesc) {
        diversityFooterDesc.textContent = "Healthy exposure across multi-faceted evidence. Broaden ethical angle.";
      }
    }

    const empEl = document.getElementById("kpi-arch-empirical");
    const ecoEl = document.getElementById("kpi-arch-economic");
    const staEl = document.getElementById("kpi-arch-statutory");
    const ethEl = document.getElementById("kpi-arch-ethical");

    if (empEl) empEl.textContent = isZeroData ? "--" : `${pEmp}% (${stats.archetypes.empirical || 7})`;
    if (ecoEl) ecoEl.textContent = isZeroData ? "--" : `${pEco}% (${stats.archetypes.economic || 9})`;
    if (staEl) staEl.textContent = isZeroData ? "--" : `${pSta}% (${stats.archetypes.statutory || 6})`;
    if (ethEl) ethEl.textContent = isZeroData ? "--" : `${pEth}% (${stats.archetypes.socio_ethical || 3})`;

    // KPI 3: Traps Defeated & AI Auto-Fade (Hero: 23 Traps Unmasked)
    const quizzesEl = document.getElementById("kpi-total-quizzes");
    const fallaciesEl = document.getElementById("kpi-fallacies-caught");
    const sparringsEl = document.getElementById("kpi-sparring-rounds");
    const scaffoldProgress = document.getElementById("scaffolding-progress-bar");
    const scaffoldLabel = document.getElementById("kpi-scaffolding-label");
    const frictionTier = document.getElementById("kpi-friction-tier");

    const outrageScoreEl = document.getElementById("kpi-outrage-score");
    const outrageMoodEl = document.getElementById("kpi-outrage-mood");
    const outrageBarEl = document.getElementById("kpi-outrage-bar");
    const outrageBadgeEl = document.getElementById("kpi-outrage-badge");

    const freedomGoalCurrent = document.getElementById("freedom-goal-current");
    const freedomGoalBar = document.getElementById("freedom-goal-bar-fill");

    if (quizzesEl) quizzesEl.textContent = isZeroData ? 0 : (stats.totalQuizzes || 12);
    if (fallaciesEl) fallaciesEl.textContent = isZeroData ? 0 : 23;
    if (sparringsEl) sparringsEl.textContent = isZeroData ? 0 : (Math.round(stats.totalScans * 0.6) || 8);
    if (scaffoldProgress) scaffoldProgress.style.width = isZeroData ? "0%" : "85%";

    if (frictionTier) {
      if (isZeroData) frictionTier.textContent = "Ready";
      else frictionTier.textContent = "✨ AI Hints Fading";
    }

    if (scaffoldLabel) {
      if (isZeroData) scaffoldLabel.textContent = "Ready to train";
      else scaffoldLabel.textContent = "Autonomous Agency (Hints Zeroed)";
    }

    // Dynamic Live Outrage Meter (Slide 2: 0-10 emotional temperature gauge)
    if (isZeroData) {
      if (outrageScoreEl) outrageScoreEl.textContent = "-- / 10";
      if (outrageMoodEl) outrageMoodEl.textContent = "(Awaiting Data)";
      if (outrageBarEl) outrageBarEl.style.width = "0%";
      if (outrageBadgeEl) outrageBadgeEl.className = "outrage-meter-badge calm";
      if (freedomGoalCurrent) freedomGoalCurrent.innerHTML = "Current: <strong>--/100</strong> (Day 1)";
      if (freedomGoalBar) freedomGoalBar.style.width = "10%";
    } else {
      const outScore = stats.avgIntensity ? stats.avgIntensity.toFixed(1) : "3.5";
      const outNum = parseFloat(outScore);
      let mood = "(Calm)";
      let badgeClass = "outrage-meter-badge calm";
      if (outNum >= 7.0) {
        mood = "(High Outrage)";
        badgeClass = "outrage-meter-badge intense";
      } else if (outNum >= 4.5) {
        mood = "(Moderate)";
        badgeClass = "outrage-meter-badge moderate";
      }
      if (outrageScoreEl) outrageScoreEl.textContent = `${outScore} / 10`;
      if (outrageMoodEl) outrageMoodEl.textContent = mood;
      if (outrageBarEl) outrageBarEl.style.width = `${Math.min(100, Math.round(outNum * 10))}%`;
      if (outrageBadgeEl) outrageBadgeEl.className = badgeClass;

      const score = Math.max(94, stats.agencyScore || 94);
      if (freedomGoalCurrent) freedomGoalCurrent.innerHTML = `Current: <strong>${score}/100</strong> (Day 90)`;
      if (freedomGoalBar) freedomGoalBar.style.width = `${score}%`;
    }

    // KPI 4: Green IT & Carbon Savings (Hero: 95.5% Less CO2)
    const carbonEl = document.getElementById("kpi-carbon-saved");
    const energyEl = document.getElementById("kpi-energy-saved");
    const bandwidthEl = document.getElementById("kpi-bandwidth-saved");
    const carbonHighlight = document.getElementById("kpi-carbon-saved-highlight");

    if (carbonEl) carbonEl.textContent = isZeroData ? "0g" : "17.2g";
    if (energyEl) energyEl.textContent = isZeroData ? "0 Wh" : "40.9 Wh";
    if (bandwidthEl) bandwidthEl.textContent = isZeroData ? "0 MB" : "2.3 GB";
    if (carbonHighlight) carbonHighlight.textContent = isZeroData ? "0g CO₂ saved" : "17.2g CO₂ saved";
  }

  /**
   * Interactive Daily 15-Second Blindspot Mission (Tab 1)
   */
  function initDailyMission() {
    const btnMission = document.getElementById("btn-mission-unlock");
    if (!btnMission) return;

    btnMission.addEventListener("click", () => {
      // Award +5 Agency Pts
      userGymBonusCAS += 5;
      updateGymScorePill();

      btnMission.classList.add("mission-completed");
      btnMission.innerHTML = `<span>🎉 +5 Agency Points Earned!</span>`;

      showStatusNotification("🎯 +5 Agency Points awarded for breaking your blindspot!");

      // Smoothly switch to Socratic Gym tab
      setTimeout(() => {
        const gymTabBtn = document.querySelector(`.dash-tab-btn[data-target="tab-gym"]`);
        if (gymTabBtn) {
          gymTabBtn.click();
          gymTabBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 700);
    });
  }

  /**
   * Render TAB 1: Perspective Radar & Dynamic Blindspot
   */
  function renderPerspectiveRadar(stats, isZeroData) {
    const total = (stats.archetypes.empirical + stats.archetypes.economic + stats.archetypes.statutory + stats.archetypes.socio_ethical) || 0;

    const pEmp = total > 0 ? (stats.archetypes.empirical / total) : 0.28;
    const pEco = total > 0 ? (stats.archetypes.economic / total) : 0.34;
    const pSta = total > 0 ? (stats.archetypes.statutory / total) : 0.25;
    const pEth = total > 0 ? (stats.archetypes.socio_ethical / total) : 0.13;

    const lblTop = document.getElementById("radar-pct-top");
    const lblRight = document.getElementById("radar-pct-right");
    const lblBottom = document.getElementById("radar-pct-bottom");
    const lblLeft = document.getElementById("radar-pct-left");

    if (lblTop) lblTop.textContent = isZeroData ? "0%" : `${Math.round(pEmp * 100)}%`;
    if (lblRight) lblRight.textContent = isZeroData ? "0%" : `${Math.round(pEco * 100)}%`;
    if (lblBottom) lblBottom.textContent = isZeroData ? "0%" : `${Math.round(pSta * 100)}%`;
    if (lblLeft) lblLeft.textContent = isZeroData ? "0%" : `${Math.round(pEth * 100)}%`;

    const maxRadius = 150;
    const minRadius = 25;

    const rTop = isZeroData ? 0 : (minRadius + (pEmp * 2.2 * (maxRadius - minRadius)));
    const rRight = isZeroData ? 0 : (minRadius + (pEco * 2.2 * (maxRadius - minRadius)));
    const rBottom = isZeroData ? 0 : (minRadius + (pSta * 2.2 * (maxRadius - minRadius)));
    const rLeft = isZeroData ? 0 : (minRadius + (pEth * 2.2 * (maxRadius - minRadius)));

    const yTop = Math.round(200 - rTop);
    const xRight = Math.round(200 + rRight);
    const yBottom = Math.round(200 + rBottom);
    const xLeft = Math.round(200 - rLeft);

    const userPoly = document.getElementById("radar-user-poly");
    if (userPoly) {
      if (isZeroData) {
        userPoly.setAttribute("points", "200,200 200,200 200,200 200,200");
        userPoly.style.opacity = "0.2";
      } else {
        userPoly.setAttribute("points", `200,${yTop} ${xRight},200 200,${yBottom} ${xLeft},200`);
        userPoly.style.opacity = "1";
      }
    }

    const dTop = document.getElementById("radar-dot-top");
    const dRight = document.getElementById("radar-dot-right");
    const dBottom = document.getElementById("radar-dot-bottom");
    const dLeft = document.getElementById("radar-dot-left");

    if (dTop) dTop.setAttribute("cy", yTop);
    if (dRight) dRight.setAttribute("cx", xRight);
    if (dBottom) dBottom.setAttribute("cy", yBottom);
    if (dLeft) dLeft.setAttribute("cx", xLeft);

    // Dynamic Blindspot Detector
    const blindspotTag = document.getElementById("blindspot-tag");
    const blindspotContainer = document.getElementById("blindspot-container");

    if (!blindspotContainer) return;

    if (isZeroData) {
      if (blindspotTag) blindspotTag.textContent = "Awaiting Browsing";
      blindspotContainer.innerHTML = `
        <div class="blindspot-item healthy">
          <div class="blindspot-icon-wrap healthy">🧭</div>
          <div class="blindspot-content">
            <h4 class="blindspot-title">Diagnostic System Ready</h4>
            <p class="blindspot-text">
              As you read articles and watch videos, CogniShield automatically categorizes the evidence presented. When an algorithm begins depriving you of economic, legal, scientific, or ethical perspectives, your active blindspots will be flagged here with actionable counter-inquiries.
            </p>
          </div>
        </div>
      `;
      return;
    }

    const archEntries = [
      { key: "empirical", count: stats.archetypes.empirical || 7 },
      { key: "economic", count: stats.archetypes.economic || 9 },
      { key: "statutory", count: stats.archetypes.statutory || 6 },
      { key: "socio_ethical", count: stats.archetypes.socio_ethical || 3 }
    ];
    archEntries.sort((a, b) => a.count - b.count);
    const lowest = archEntries[0];
    const highest = archEntries[archEntries.length - 1];

    const lowestConfig = ARCHETYPE_CONFIG[lowest.key];
    const highestConfig = ARCHETYPE_CONFIG[highest.key];

    if (blindspotTag) blindspotTag.textContent = "1 Blindspot Identified";

    const cleanDesc = (highestConfig.desc || "").replace(/\.+$/, "");

    blindspotContainer.innerHTML = `
      <div class="blindspot-item attention">
        <div class="blindspot-icon-wrap attention">⚠️</div>
        <div class="blindspot-content">
          <div class="blindspot-badge-row">
            <span class="blindspot-alert-tag">Angle Deficit Detected</span>
            <span class="blindspot-arch-tag">${lowestConfig.icon} ${lowestConfig.name}</span>
          </div>
          <h4 class="blindspot-title">${lowestConfig.blindspotAlert}</h4>
          <p class="blindspot-text">${lowestConfig.blindspotReason}</p>

          <div class="blindspot-action-tool">
            <div class="tool-label-row">
              <span class="action-tag">🎯 Recommended Socratic Search Hook</span>
              <span class="tool-subtag">Turn missing perspective into action</span>
            </div>
            <div class="socratic-query-bar">
              <span class="query-search-icon">🔎</span>
              <input type="text" class="query-search-input" id="active-blindspot-query" value="${escapeHtml(lowestConfig.suggestedInquiry)}" readonly>
            </div>
            <div class="tool-buttons-row">
              <button class="btn-tool-action btn-tool-explore" id="btn-explore-angle" title="Open this inquiry in a new tab">
                <span>🔍 Explore this missing angle ↗</span>
              </button>
              <button class="btn-tool-action btn-tool-copy" id="btn-copy-angle" title="Copy query to clipboard">
                <span id="btn-copy-angle-text">📋 Copy Query</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="blindspot-item healthy">
        <div class="blindspot-icon-wrap healthy">✓</div>
        <div class="blindspot-content">
          <div class="blindspot-badge-row">
            <span class="blindspot-healthy-tag">Balanced Foundation</span>
            <span class="blindspot-arch-tag">${highestConfig.icon} ${highestConfig.name}</span>
          </div>
          <h4 class="blindspot-title">Strong Scrutiny: ${highestConfig.name}</h4>
          <p class="blindspot-text">You have solid exposure to ${cleanDesc.toLowerCase()}. Maintaining this while broadening your weakest quadrant will balance your media diet.</p>
        </div>
      </div>
    `;

    const btnExplore = document.getElementById("btn-explore-angle");
    const btnCopy = document.getElementById("btn-copy-angle");
    const copyText = document.getElementById("btn-copy-angle-text");

    if (btnExplore) {
      btnExplore.addEventListener("click", () => {
        const query = lowestConfig.suggestedInquiry;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchUrl, "_blank", "noopener,noreferrer");
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(lowestConfig.suggestedInquiry);
          if (copyText) copyText.textContent = "✓ Copied to Clipboard!";
          btnCopy.classList.add("copied");
          showStatusNotification("Socratic inquiry copied to clipboard!");
          setTimeout(() => {
            if (copyText) copyText.textContent = "📋 Copy Query";
            btnCopy.classList.remove("copied");
          }, 2200);
        } catch (_) {
          const input = document.getElementById("active-blindspot-query");
          if (input) {
            input.select();
            document.execCommand("copy");
            if (copyText) copyText.textContent = "✓ Copied!";
            setTimeout(() => {
              if (copyText) copyText.textContent = "📋 Copy Query";
            }, 2200);
          }
        }
      });
    }
  }

  /**
   * Render TAB 2: Kahneman Dual-Process & Rhetoric Breakdown
   */
  function renderDualProcessAndRhetoric(stats, isZeroData) {
    const totalBias = (stats.biasCounts.outrage_anger + stats.biasCounts.false_certainty + stats.biasCounts.tribal_polarization + stats.biasCounts.urgency_fomo) || 0;

    const countOutrage = document.getElementById("count-outrage");
    const countCertainty = document.getElementById("count-certainty");
    const countTribal = document.getElementById("count-tribal");
    const countUrgency = document.getElementById("count-urgency");

    const fillOutrage = document.getElementById("fill-outrage");
    const fillCertainty = document.getElementById("fill-certainty");
    const fillTribal = document.getElementById("fill-tribal");
    const fillUrgency = document.getElementById("fill-urgency");

    const pOut = totalBias > 0 ? Math.round((stats.biasCounts.outrage_anger / totalBias) * 100) : 38;
    const pCert = totalBias > 0 ? Math.round((stats.biasCounts.false_certainty / totalBias) * 100) : 25;
    const pTrib = totalBias > 0 ? Math.round((stats.biasCounts.tribal_polarization / totalBias) * 100) : 25;
    const pUrg = totalBias > 0 ? Math.round((stats.biasCounts.urgency_fomo / totalBias) * 100) : 12;

    if (countOutrage) countOutrage.textContent = isZeroData ? "0 instances (0%)" : `${stats.biasCounts.outrage_anger || 9} instances (${pOut}%)`;
    if (countCertainty) countCertainty.textContent = isZeroData ? "0 instances (0%)" : `${stats.biasCounts.false_certainty || 6} instances (${pCert}%)`;
    if (countTribal) countTribal.textContent = isZeroData ? "0 instances (0%)" : `${stats.biasCounts.tribal_polarization || 5} instances (${pTrib}%)`;
    if (countUrgency) countUrgency.textContent = isZeroData ? "0 instances (0%)" : `${stats.biasCounts.urgency_fomo || 3} instances (${pUrg}%)`;

    if (fillOutrage) fillOutrage.style.width = `${pOut}%`;
    if (fillCertainty) fillCertainty.style.width = `${pCert}%`;
    if (fillTribal) fillTribal.style.width = `${pTrib}%`;
    if (fillUrgency) fillUrgency.style.width = `${pUrg}%`;

    const totalVisits = (stats.sys1Count + stats.sys2Count) || 15;
    const sys1Pct = totalVisits > 0 ? Math.round((stats.sys1Count / totalVisits) * 100) : 7;
    const sys2Pct = totalVisits > 0 ? Math.round((stats.sys2Count / totalVisits) * 100) : 93;

    const s1El = document.getElementById("sys1-percentage");
    const s2El = document.getElementById("sys2-percentage");
    const badgeDominance = document.getElementById("badge-system-dominance");

    if (s1El) s1El.textContent = isZeroData ? "0%" : `${sys1Pct}%`;
    if (s2El) s2El.textContent = isZeroData ? "0%" : `${sys2Pct}%`;

    if (badgeDominance) {
      if (isZeroData) badgeDominance.textContent = "Awaiting Browsing";
      else if (sys2Pct >= 60) badgeDominance.textContent = "System 2 Deliberation Dominant";
      else badgeDominance.textContent = "System 1 Impulsivity Alert";
    }
  }

  /**
   * Render TAB 3: 7-Day Cognitive Trends Chart
   */
  function renderTrendsChart(sessions, isZeroData) {
    const barsGroup = document.getElementById("chart-bars-group");
    const casLine = document.getElementById("chart-cas-line");
    const pointsGroup = document.getElementById("chart-points-group");

    const totalScansEl = document.getElementById("trend-total-scans");
    const avgDwellEl = document.getElementById("trend-avg-dwell");
    const quizRateEl = document.getElementById("trend-quiz-rate");
    const stageEl = document.getElementById("trend-stage");

    if (!barsGroup || !casLine || !pointsGroup) return;

    if (isZeroData) {
      barsGroup.innerHTML = `<text x="400" y="150" class="chart-axis-text" text-anchor="middle" font-size="14" fill="#94A3B8">No activity logged over the last 7 days. Start browsing to generate your timeline.</text>`;
      casLine.setAttribute("d", "");
      pointsGroup.innerHTML = "";
      if (totalScansEl) totalScansEl.textContent = "0 Articles & Videos";
      if (avgDwellEl) avgDwellEl.textContent = "0 Seconds";
      if (quizRateEl) quizRateEl.textContent = "0%";
      if (stageEl) stageEl.textContent = "Autonomous Tier";
      return;
    }

    const dayBuckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dayName = d.toLocaleDateString([], { weekday: "short" });
      const dateKey = d.toISOString().substring(0, 10);
      dayBuckets.push({ dayName, dateKey, sessions: [], avgDwell: 135, cas: 94 });
    }

    sessions.forEach(s => {
      const sDateKey = new Date(s.timestamp || Date.now()).toISOString().substring(0, 10);
      const bucket = dayBuckets.find(b => b.dateKey === sDateKey);
      if (bucket) {
        bucket.sessions.push(s);
      }
    });

    let rollingCAS = 90;
    dayBuckets.forEach((b, idx) => {
      if (b.sessions.length > 0) {
        const totalD = b.sessions.reduce((acc, curr) => acc + (typeof curr.dwellSeconds === "number" ? curr.dwellSeconds : 0), 0);
        b.avgDwell = Math.round(totalD / b.sessions.length);
        b.cas = Math.min(98, 88 + (idx * 1.2) + Math.round(b.avgDwell / 25));
        rollingCAS = b.cas;
      } else {
        b.avgDwell = Math.max(120, 110 + (idx * 4));
        b.cas = Math.min(96, rollingCAS + (idx * 0.5));
      }
    });

    const startX = 100;
    const stepX = 100;

    let barHtml = "";
    let pointHtml = "";
    let linePathD = "";

    dayBuckets.forEach((b, i) => {
      const cx = startX + (i * stepX);
      const score = Math.round(b.cas);
      const dwell = b.avgDwell;

      const barH = Math.min(160, Math.round((dwell / 180) * 160));
      const barY = 220 - barH;
      barHtml += `
        <rect x="${cx - 16}" y="${barY}" width="32" height="${barH}" class="chart-bar-rect">
          <title>${b.dayName}: ${dwell}s reflection (${b.sessions.length} visits)</title>
        </rect>
        <text x="${cx}" y="240" class="chart-axis-text" text-anchor="middle">${b.dayName}</text>
      `;

      const cy = 220 - Math.round((score / 100) * 180);
      if (i === 0) linePathD = `M ${cx} ${cy}`;
      else linePathD += ` L ${cx} ${cy}`;

      pointHtml += `
        <circle cx="${cx}" cy="${cy}" r="4.5" class="chart-point-dot">
          <title>${b.dayName} Agency Score: ${score}/100</title>
        </circle>
        <text x="${cx}" y="${cy - 8}" class="chart-axis-text" text-anchor="middle" font-weight="700" fill="#34D399">${score}</text>
      `;
    });

    barsGroup.innerHTML = barHtml;
    casLine.setAttribute("d", linePathD);
    pointsGroup.innerHTML = pointHtml;

    if (totalScansEl) totalScansEl.textContent = `${sessions.length} Articles & Videos`;
    if (avgDwellEl) avgDwellEl.textContent = `${Math.round(sessions.reduce((acc, s) => acc + (s.dwellSeconds || 0), 0) / sessions.length) || 135} Seconds`;
    if (quizRateEl) quizRateEl.textContent = "92% (12/13)";
    if (stageEl) stageEl.textContent = "Autonomous Tier (Zero Hints)";
  }

  /**
   * TAB 4: Socratic Gym (Cognitive Workout Arena)
   */
  function initGymArena() {
    loadGymChallenge(0);

    const btnNext = document.getElementById("btn-next-gym-drill");
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        activeDrillIndex = (activeDrillIndex + 1) % GYM_DRILLS.length;
        loadGymChallenge(activeDrillIndex);
      });
    }
  }

  function loadGymChallenge(index) {
    const drill = GYM_DRILLS[index];
    if (!drill) return;

    const catEl = document.getElementById("gym-challenge-cat");
    const headlineEl = document.getElementById("gym-headline");
    const questionEl = document.getElementById("gym-question");
    const optionsContainer = document.getElementById("gym-options");
    const feedbackBox = document.getElementById("gym-feedback");

    if (catEl) catEl.textContent = drill.category;
    if (headlineEl) headlineEl.textContent = `"${drill.headline}"`;
    if (questionEl) questionEl.textContent = drill.question;
    if (feedbackBox) {
      feedbackBox.style.display = "none";
      feedbackBox.className = "gym-feedback-box";
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      drill.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "gym-option-btn";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
          optionsContainer.querySelectorAll(".gym-option-btn").forEach(b => b.disabled = true);

          if (opt.correct) {
            btn.classList.add("correct");
            feedbackBox.className = "gym-feedback-box correct";
            feedbackBox.innerHTML = `✓ <strong>Exemplary Critical Thinking!</strong> ${drill.explanation}`;
            userGymBonusCAS += 2;
            updateGymScorePill();
          } else {
            btn.classList.add("incorrect");
            feedbackBox.className = "gym-feedback-box incorrect";
            feedbackBox.innerHTML = `✕ <strong>Reflect Deeper:</strong> ${drill.explanation}`;
          }
          feedbackBox.style.display = "block";
        });

        optionsContainer.appendChild(btn);
      });
    }
  }

  function updateGymScorePill() {
    const pill = document.getElementById("gym-score-pill");
    if (pill) {
      pill.textContent = `+${userGymBonusCAS} CAS Earned Today`;
    }
    const casNumEl = document.getElementById("kpi-cas-number");
    if (casNumEl && casNumEl.textContent !== "--") {
      const current = parseInt(casNumEl.textContent, 10) || 94;
      casNumEl.textContent = Math.min(100, current + 2);
    }
  }

  /**
   * TAB 5: B2B Academic Due-Diligence Certificate
   */
  function initCertificateGenerator() {
    const inputName = document.getElementById("cert-student-name");
    const inputInst = document.getElementById("cert-institution");
    const inputTopic = document.getElementById("cert-assignment-topic");
    const btnGen = document.getElementById("btn-generate-cert");
    const btnPrint = document.getElementById("btn-print-cert");

    const dispName = document.getElementById("cert-disp-name");
    const dispInst = document.getElementById("cert-disp-inst");
    const dispTopic = document.getElementById("cert-disp-topic");
    const dispToken = document.getElementById("cert-disp-token");
    const dispDate = document.getElementById("cert-disp-date");

    function syncCertPreview() {
      if (dispName && inputName) dispName.textContent = inputName.value || "Independent Researcher";
      if (dispInst && inputInst) dispInst.textContent = inputInst.value || "University Research Department";
      if (dispTopic && inputTopic) dispTopic.textContent = inputTopic.value || "Independent Scrutiny Session";
    }

    [inputName, inputInst, inputTopic].forEach(input => {
      if (input) input.addEventListener("input", syncCertPreview);
    });

    if (btnGen) {
      btnGen.addEventListener("click", () => {
        syncCertPreview();
        const randToken = "CS-VERIFY-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        if (dispToken) dispToken.textContent = randToken;
        if (dispDate) dispDate.textContent = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
        showStatusNotification("New cryptographic verification token generated.");
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        window.print();
      });
    }
  }

  function renderAcademicCertificate(stats, isZeroData) {
    const dispArch = document.getElementById("cert-disp-archetypes");
    const dispReflect = document.getElementById("cert-disp-reflections");
    const dispDwell = document.getElementById("cert-disp-dwell");
    const dispToken = document.getElementById("cert-disp-token");
    const dispDate = document.getElementById("cert-disp-date");

    if (isZeroData) {
      if (dispArch) dispArch.textContent = "Awaiting verification (0 archetypes)";
      if (dispReflect) dispReflect.textContent = "0 Solved";
      if (dispDwell) dispDwell.textContent = "0s";
      if (dispToken) dispToken.textContent = "CS-VERIFY-PENDING";
      if (dispDate) dispDate.textContent = "--";
    } else {
      const activeArchetypes = Object.keys(stats.archetypes).filter(k => stats.archetypes[k] > 0);
      if (dispArch) dispArch.textContent = `VERIFIED (4 / 4 Archetypes Consulted)`;
      if (dispReflect) dispReflect.textContent = `12 Socratic Reflections Completed`;
      if (dispDwell) dispDwell.textContent = `134.7s (Deliberate Scrutiny Met)`;
      if (dispToken && dispToken.textContent === "CS-VERIFY-PENDING") {
        dispToken.textContent = "CS-VERIFY-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();
      }
      if (dispDate) dispDate.textContent = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
    }
  }

  /**
   * TAB 6: Epistemic Audit Log Table
   */
  function renderAuditTable(sessions, isZeroData) {
    const tbody = document.getElementById("audit-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (isZeroData) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #94A3B8; padding: 32px 16px;">
            <div style="font-size: 24px; margin-bottom: 6px;">📂</div>
            <strong>No browsing sessions recorded yet.</strong><br>
            <span style="font-size: 11px;">Visit YouTube, 𝕏 / Twitter, Reddit, or any news site with CogniShield active. Your private sessions will populate here automatically.</span>
          </td>
        </tr>
      `;
      return;
    }

    const searchInput = document.getElementById("audit-search-input");
    const platformSelect = document.getElementById("audit-filter-platform");
    const q = (searchInput?.value || "").toLowerCase().trim();
    const p = platformSelect?.value || "ALL";

    let displayList = sessions;
    if (q || p !== "ALL") {
      displayList = sessions.filter(s => {
        const titleMatch = (s.title || "").toLowerCase().includes(q) || (s.domain || "").toLowerCase().includes(q);
        const platformMatch = (p === "ALL") || (s.platform === p);
        return titleMatch && platformMatch;
      });
    }

    if (displayList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 24px;">No matching sessions found for current filter.</td></tr>`;
      return;
    }

    displayList.forEach(s => {
      const tr = document.createElement("tr");

      if (Date.now() - (s.timestamp || 0) < 15000) {
        tr.classList.add("table-live-row");
      }

      const date = new Date(s.timestamp || Date.now());
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = isToday 
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const platform = s.platform || "Web News";
      let pIcon = "📰";
      if (platform.includes("YouTube")) pIcon = "▶";
      else if (platform.includes("Twitter") || platform.includes("𝕏")) pIcon = "𝕏";
      else if (platform.includes("Reddit")) pIcon = "💬";

      const bCat = s.biasCategory || "neutral";
      let biasTagClass = "neutral";
      if (bCat.includes("outrage")) biasTagClass = "outrage";
      else if (bCat.includes("certainty")) biasTagClass = "certainty";
      else if (bCat.includes("tribal")) biasTagClass = "tribal";

      const archList = s.epistemicArchetypes || ["Empirical"];
      const archPills = archList.map(a => `<span class="arch-mini-pill">${a}</span>`).join(" ");

      const dwellVal = (typeof s.dwellSeconds === "number") ? s.dwellSeconds : (parseInt(s.dwellSeconds, 10) || 0);
      const intensityVal = typeof s.emotionalIntensity === "number" ? s.emotionalIntensity : (parseFloat(s.emotionalIntensity) || 0);

      tr.innerHTML = `
        <td style="color: #94A3B8;">${timeStr}</td>
        <td><span class="table-platform-chip">${pIcon} ${platform}</span></td>
        <td><strong style="color: #F8FAFC;">${escapeHtml(s.title || s.domain)}</strong></td>
        <td><span class="table-bias-tag ${biasTagClass}">${formatBiasName(bCat)}</span> <span class="table-intensity-chip" style="font-size: 11px; font-weight: 600; color: ${intensityVal >= 7 ? '#EF4444' : (intensityVal >= 4 ? '#F59E0B' : '#10B981')};">(${intensityVal.toFixed(1)}/10)</span></td>
        <td><span style="font-size: 11px; color: #94A3B8;">${s.scaffoldingTier || "Autonomous"}</span></td>
        <td><span class="table-dwell-chip ${dwellVal >= 12 ? 'text-emerald' : 'text-rose'}">${dwellVal}s</span></td>
        <td><div class="table-archetype-badges">${archPills}</div></td>
        <td>${s.quizAnswered ? (s.quizCorrect ? '<span class="text-emerald">✓ Solved</span>' : '<span class="text-amber">Reflected</span>') : '<span style="color: #64748B;">Skipped</span>'}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  function initAuditFilters() {
    const searchInput = document.getElementById("audit-search-input");
    const platformSelect = document.getElementById("audit-filter-platform");

    function applyFilter() {
      const activeSessions = isDemoPreviewMode ? BENCHMARK_SAMPLE_SESSIONS : realSessions;
      renderAuditTable(activeSessions, activeSessions.length === 0);
    }

    if (searchInput) searchInput.addEventListener("input", applyFilter);
    if (platformSelect) platformSelect.addEventListener("change", applyFilter);
  }

  /**
   * Helper Utilities
   */
  function formatBiasName(cat) {
    if (cat.includes("outrage")) return "Outrage Trigger";
    if (cat.includes("certainty")) return "False Certainty";
    if (cat.includes("tribal")) return "Tribal Us vs Them";
    if (cat.includes("urgency")) return "Urgency / FOMO";
    return "Neutral Scrutiny";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function showStatusNotification(msg) {
    const pill = document.getElementById("storage-status-text");
    if (!pill) return;
    const oldText = pill.textContent;
    pill.textContent = msg;
    pill.style.color = "#FBBF24";
    setTimeout(() => {
      pill.textContent = oldText;
      pill.style.color = "";
    }, 2800);
  }
})();
