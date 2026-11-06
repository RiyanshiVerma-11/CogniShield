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
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CognitiveEngine };
} else {
  window.CogniShieldCognitive = new CognitiveEngine();
}

