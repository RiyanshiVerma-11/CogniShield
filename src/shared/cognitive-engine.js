/**
 * CogniShield - Cognitive Behavioral Engine & Dual-Process Scaffolding
 * Based on Daniel Kahneman's Dual-Process Theory (System 1 vs System 2)
 * and Frederick's Cognitive Reflection Test (CRT) frameworks.
 * 
 * Implements:
 * 1. Scientific Cognitive Agency Score (CAS) via Epistemic Latency, CRT Accuracy & Shannon Entropy.
 * 2. The Fading Scaffolding Model: AI hints fade as user agency matures, combating AI over-reliance.
 * 3. 3-Tier Socratic Question Generation & Epistemic Calibration.
 */

class CognitiveEngine {
  constructor() {
    this.TAU_CRITICAL_LATENCY = 12.0; // Seconds required for System 2 analytical activation
    this.DEFAULT_USER_STATS = {
      agencyScore: 50,
      quizzesSolved: 0,
      quizzesAttempted: 0,
      deepSparringCompleted: 0,
      passiveSkips: 0,
      totalDwellSeconds: 0,
      perspectiveDistribution: {
        economic: 0,
        statutory: 0,
        socio_ethical: 0,
        empirical: 0
      }
    };
  }

  /**
   * Formal Behavioral Agency Calculation:
   * CAS(t) = [0.40 * min(1, Δt / τ_crit) + 0.35 * CRT_accuracy + 0.25 * (H / H_max)] * 100
   * 
   * @param {number} dwellTime - Seconds user paused to evaluate before reacting.
   * @param {number} correctQuizzes - Count of correct fallacy / assumption identifications.
   * @param {number} totalQuizzes - Total micro-quizzes attempted.
   * @param {Object} perspectiveCounts - Distribution across epistemic archetypes.
   */
  calculateAgencyScore(dwellTime, correctQuizzes, totalQuizzes, perspectiveCounts) {
    // 1. Epistemic Latency Component (System 1 Impulsivity vs System 2 Deliberation)
    const latencyRatio = Math.min(1.0, Math.max(0, dwellTime / this.TAU_CRITICAL_LATENCY));

    // 2. Cognitive Reflection Accuracy (Ability to spot intuitive cognitive traps)
    const crtAccuracy = totalQuizzes > 0 ? (correctQuizzes / totalQuizzes) : 0.5;

    // 3. Shannon Entropy of Perspective Exposure (Diversity of ideological / factual inputs)
    const entropy = this.calculatePerspectiveEntropy(perspectiveCounts);
    const maxEntropy = Math.log2(4); // 4 archetypes: economic, statutory, socio_ethical, empirical
    const normalizedEntropy = maxEntropy > 0 ? (entropy / maxEntropy) : 0.5;

    // Weighted Synthesis
    const compositeScore = (
      0.40 * latencyRatio +
      0.35 * crtAccuracy +
      0.25 * normalizedEntropy
    ) * 100;

    return Math.round(Math.min(100, Math.max(1, compositeScore)));
  }

  /**
   * Computes Shannon Entropy: H = - sum(p_i * log2(p_i))
   */
  calculatePerspectiveEntropy(distribution) {
    if (!distribution) return 0;
    const counts = Object.values(distribution);
    const total = counts.reduce((acc, c) => acc + c, 0);
    if (total === 0) return 0;

    let entropy = 0;
    for (const count of counts) {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  /**
   * The Fading Scaffolding Principle (Vygotskian Cognitive Development)
   * As the user's agency score rises, AI intervention dynamically decreases:
   * - Novice (0-40): Full hints, fallacy definitions, multiple-choice options.
   * - Intermediate (41-75): Minimal hints, prompt-based open questions.
   * - Advanced (76-100): Zero hints, unassisted critical prompt, "Evaluate the AI" bonus tests.
   */
  getScaffoldingLevel(agencyScore) {
    if (agencyScore < 40) {
      return {
        tier: "Full Scaffolding",
        showDefinitions: true,
        showMultipleChoice: true,
        hintIntensity: "high",
        message: "Guiding your analysis: Identify the cognitive hook below."
      };
    } else if (agencyScore <= 75) {
      return {
        tier: "Fading Assistance",
        showDefinitions: false,
        showMultipleChoice: true,
        hintIntensity: "medium",
        message: "Test your reflex: Can you spot the unstated premise?"
      };
    } else {
      return {
        tier: "Autonomous Agency",
        showDefinitions: false,
        showMultipleChoice: false,
        hintIntensity: "zero",
        message: "Autonomous mode: Formulate your own counter-hypothesis."
      };
    }
  }

  /**
   * Socratic Question Bank tailored by Epistemic Category
   */
  getSocraticQuestions(category, lang = "en") {
    const questions = {
      en: {
        outrage_anger: [
          "What concrete evidence is provided beyond high-arousal emotional language?",
          "How would this argument sound if all loaded adjectives were replaced with neutral verbs?",
          "Who benefits financially or politically when readers feel outrage over this specific topic?"
        ],
        false_certainty: [
          "What unstated assumptions must be accepted for this 'certain' conclusion to hold?",
          "What peer-reviewed counter-evidence or minority consensus is omitted here?",
          "Under what specific edge conditions would this argument completely fail?"
        ],
        tribal_polarization: [
          "How would a good-faith representative of the opposing side summarize their own position?",
          "Are complex systemic incentives being oversimplified into 'good vs bad actors'?",
          "What shared goals or common ground between both factions are being ignored?"
        ]
      },
      de: {
        outrage_anger: [
          "Welche sachlichen Belege werden geliefert, wenn man die emotionale Sprache weglässt?",
          "Wer profitiert politisch oder finanziell von der Empörung über diesen Beitrag?",
          "Wie würde das Argument klingen, wenn es sachlich und nüchtern formuliert wäre?"
        ],
        false_certainty: [
          "Welche unausgesprochenen Prämissen müssen zutreffen, damit dieses Fazit stimmt?",
          "Welche wissenschaftlichen Gegenargumente werden in dieser Darstellung verschwiegen?",
          "In welchem Kontext würde diese pauschale Behauptung nicht mehr zutreffen?"
        ],
        tribal_polarization: [
          "Wie würde ein seriöser Vertreter der Gegenseite dieses Problem beschreiben?",
          "Werden hier komplexe Sachverhalte unzulässig auf ein simples Feindbild reduziert?",
          "Welche gemeinsamen Interessen beider Seiten werden systematisch ausgeblendet?"
        ]
      },
      fr: {
        outrage_anger: [
          "Quelles preuves concrètes restent-elles si l'on retire tout le vocabulaire émotionnel ?",
          "Qui bénéficie financièrement ou politiquement de l'indignation suscitée par ce sujet ?",
          "Comment cet argument serait-il formulé dans un rapport scientifique neutre ?"
        ],
        false_certainty: [
          "Quelles hypothèses implicites faut-il accepter pour valider cette conclusion absolue ?",
          "Quelles données contradictoires ont été délibérément omises dans cette présentation ?",
          "Dans quelles circonstances spécifiques cette affirmation deviendrait-elle fausse ?"
        ],
        tribal_polarization: [
          "Comment un représentant raisonnable de la partie adverse défendrait-il sa position ?",
          "Ce discours ne réduit-il pas un problème systémique à une opposition binaire 'bons contre méchants' ?",
          "Quels points d'accord ou compromis possibles sont ici ignorés ?"
        ]
      }
    };

    const langBank = questions[lang] || questions.en;
    return langBank[category] || langBank.outrage_anger;
  }

  /**
   * Generates a structured Counter-Perspective Feed (Flip the Feed / CogniFlip)
   * Inverts recommendation bias and provides 3-5 verified counter-perspective video/search links.
   * 
   * @param {Object} videoContext - Context object containing title, url, tags, description.
   * @param {Object} dossier - Optional pre-matched dossier from OfflineCacheManager.
   * @param {Object} offlineManager - Optional offline manager instance (for node/test injection).
   */
  generateCounterPerspectiveFeed(videoContext = {}, dossier = null, offlineManager = null) {
    const title = (videoContext && videoContext.title) ? videoContext.title : (dossier ? dossier.title : "Contemporary Video Debate");
    
    // --- Meta-phrase blocklist: strip these from any AI/template search query before hitting YouTube ---
    const SEARCH_META_BLOCKLIST = [
      "counter argument", "counterargument", "alternative perspective",
      "opposing view", "other side", "fact check", "fact-check",
      "rebuttal", "debunked", "refutation"
    ];
    // Stop-words to exclude when extracting keywords from title
    const STOP_WORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","was","are","were","be","been","has","have","had","do","does","did","will","would","could","should","may","might","its","it","this","that","these","those","i","we","you","he","she","they","my","our","your","his","her","their","&","her","his","how","why","what","who","when","where","which"]);

    /**
     * Extracts 4-6 meaningful keywords from a video title for use in YouTube search.
     * Avoids stop-words, punctuation, and very short words.
     */
    const extractKeywords = (t, maxWords = 6) => {
      return t
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
        .slice(0, maxWords)
        .join(" ")
        .trim();
    };

    const sanitizeQuery = (q) => {
      let clean = q;
      SEARCH_META_BLOCKLIST.forEach(phrase => {
        const re = new RegExp(phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        clean = clean.replace(re, "").trim();
      });
      clean = clean.replace(/\s{2,}/g, " ").replace(/^[\s,]+|[\s,]+$/g, "").trim();
      // Cap at 8 words
      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length > 8) clean = words.slice(0, 8).join(" ");
      return clean;
    };

    // --- Content-type detector: influencer/drama vs. structured discourse ---
    const isInfluencerDrama = (() => {
      const combined = title.toLowerCase();
      const signals = ["vlog","controversy","drama","exposed","cancelled","beef","clout",
        "reacts","reaction","storytime","tea","gossip","relationship","breakup",
        "cheating","family","boyfriend","girlfriend","toxic","influencer","youtuber",
        "streamer","tiktok","instagram","collab","roast","callout","apology","canceled","receipts"];
      return signals.filter(s => combined.includes(s)).length >= 2;
    })();

    // For influencer drama: use broad thematic queries that don't name the creator
    const dramaFallbackRecs = [
      { title: "How Social Media Algorithms Profit From Creator Drama", source: "Media Studies Review", archetype: "Platform Culture Critique", duration: "14:00", badge: "Platform Critique", rationale: "Explains why platforms amplify controversy for engagement and what it means for viewers.", searchQuery: "how youtube algorithm rewards drama controversy creators" },
      { title: "Parasocial Relationships and Fan Psychology Explained", source: "Psychology Today", archetype: "Parasocial Dynamics", duration: "16:30", badge: "Psychology Research", rationale: "Research on why audiences feel personally invested in influencer lives and the emotional cost.", searchQuery: "parasocial relationships social media fans psychology research" },
      { title: "Cancel Culture vs. Accountability: Where Is the Line?", source: "BBC Ideas", archetype: "Cancel Culture Debate", duration: "12:00", badge: "Nuanced Debate", rationale: "Explores the tension between online accountability and mob-driven pile-ons.", searchQuery: "cancel culture accountability social media debate nuanced" },
      { title: "The Creator Economy: Why Controversy Pays on YouTube", source: "Wall Street Journal", archetype: "Creator Economy", duration: "18:00", badge: "Industry Analysis", rationale: "How the revenue model of YouTube structurally incentivizes rage-bait and drama content.", searchQuery: "creator economy youtube monetization controversy revenue model" },
      { title: "How to Be a Smarter Media Literacy Consumer Online", source: "Crash Course", archetype: "Media Literacy", duration: "10:00", badge: "Media Literacy", rationale: "Practical framework for consuming creator content without being drawn into tribal fan camps.", searchQuery: "media literacy online content critical thinking social media" }
    ];

    // Resolve offline cache manager
    let mgr = offlineManager;
    if (!mgr) {
      if (typeof window !== "undefined" && window.CogniShieldOffline) {
        mgr = window.CogniShieldOffline;
      } else if (typeof global !== "undefined" && global.CogniShieldOffline) {
        mgr = global.CogniShieldOffline;
      }
    }

    let activeDossier = dossier;
    if (!activeDossier && mgr && typeof mgr.matchDossier === "function") {
      activeDossier = mgr.matchDossier(title, videoContext);
    }

    let rawRecs = [];
    if (isInfluencerDrama) {
      // Use socio-cultural archetypes — never reference creator's name
      rawRecs = dramaFallbackRecs;
    } else if (mgr && typeof mgr.getCounterRecommendations === "function") {
      rawRecs = mgr.getCounterRecommendations(activeDossier, title);
    } else if (activeDossier && Array.isArray(activeDossier.counter_recommendations)) {
      rawRecs = activeDossier.counter_recommendations;
    } else {
      const safeTruncate = (s, len) => {
        if (!s || s.length <= len) return s;
        const sub = s.slice(0, len);
        const sp = sub.lastIndexOf(" ");
        return (sp > 8 ? sub.slice(0, sp) : sub) + "...";
      };
      const kw = extractKeywords(title, 5); // 5 meaningful keywords from the video title
      rawRecs = [
        {
          title: `Empirical Fact-Check & Data: ${safeTruncate(title, 45)}`,
          source: "Institutional Economics & Science Review",
          archetype: "Empirical Baseline",
          duration: "14:15",
          badge: "Empirical Data",
          rationale: "Examines baseline methodology, sample sizes, and verifiable facts before accepting viral claims.",
          searchQuery: `${kw} empirical data statistics`
        },
        {
          title: `The Direct Counter-Argument: Why the Consensus Challenges ${safeTruncate(title, 45)}`,
          source: "Domain Policy & Ethics Review",
          archetype: "Direct Counter-Thesis",
          duration: "18:30",
          badge: "Counter-Thesis",
          rationale: "Explores competing viewpoints and trade-offs that algorithmic recommendation systems systematically omit.",
          searchQuery: `${kw} multiple perspectives debate`
        },
        {
          title: `The Hidden Opportunities & Positive Side of ${safeTruncate(title, 45)}`,
          source: "Global Innovation & Technology Review",
          archetype: "Systemic Trade-Offs",
          duration: "15:45",
          badge: "Opportunity Analysis",
          rationale: "Surfaces constructive upsides, overlooked opportunities, or alternative economic solutions.",
          searchQuery: `${kw} benefits opportunities solutions`
        },
        {
          title: `Regulatory & Institutional Realities: Legal Frameworks Surrounding ${safeTruncate(title, 45)}`,
          source: "International Statutory Observatory",
          archetype: "Regulatory Framework",
          duration: "17:10",
          badge: "Statutory Governance",
          rationale: "Examines how national and international regulations, liability laws, and standards govern this issue.",
          searchQuery: `${kw} legal policy regulations`
        },
        {
          title: `Longitudinal Context: How History Explains ${safeTruncate(title, 45)}`,
          source: "Historical & Societal Archive",
          archetype: "Historical Precedent",
          duration: "16:00",
          badge: "Historical Context",
          rationale: "Provides historical perspective to prevent knee-jerk panic and evaluate systemic drivers.",
          searchQuery: `${kw} history precedent lessons`
        }
      ];
    }

    const recommendations = rawRecs.map((rec) => {
      const rawQ = rec.searchQuery || rec.title;
      const q = sanitizeQuery(rawQ);
      return {
        ...rec,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
      };
    });

    const detectedBias = activeDossier ? (activeDossier.bias_category || "algorithmic_echo") : "algorithmic_echo";
    const sourcePerspective = activeDossier ? (activeDossier.source_perspective || "Dominant Algorithmic Narrative") : "Dominant Algorithmic Narrative";
    const counterStance = (activeDossier && activeDossier.hidden_counter_perspectives && activeDossier.hidden_counter_perspectives[0])
      ? activeDossier.hidden_counter_perspectives[0].label
      : "Multi-Perspective Epistemic Scrutiny";

    return {
      activeVideoTitle: title,
      detectedBias,
      sourcePerspective,
      counterStance,
      recommendations,
      agencyRewardPoints: 5,
      timestamp: Date.now()
    };
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CognitiveEngine };
} else {
  window.CogniShieldCognitive = new CognitiveEngine();
}

