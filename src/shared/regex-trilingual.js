/**
 * CogniShield - Trilingual Manipulation & Sensationalism Regex Engine
 * Languages: English (EN), German (DE), French (FR)
 * Purpose: Instant client-side scanning with 0 latency, 0 cloud compute, and 0 carbon emission.
 * Complies with Green IT mandates and European multilingual requirements (Hamburg Finals).
 */

const TRILINGUAL_DICTIONARY = {
  en: {
    name: "English",
    categories: {
      outrage_anger: [
        /\b(destroy(ed|s)?|destroying (our|your|education|future|culture|country)|demolish(ed|es)?|obliterat(ed|es)?|slams?|eviscerat(ed|es)?)\b/gi,
        /\b(outrageous|disgusting|infuriating|humiliat(ed|ing)|pathetic|treason|traitor)\b/gi,
        /\b(furious|raging|unhinged|shameful|scandalous|cheating epidemic|reckless|freaked (everybody|everyone) out|lied to (people|us|the public))\b/gi
      ],
      false_certainty: [
        /\b(undeniable|indisputable|100%|absolute truth|guaranteed|irrefutable|hoax)\b/gi,
        /\b(they don'?t want you to know|secret exposed|hidden truth|censored truth)\b/gi,
        /\b(everyone knows|obviously|clearly without doubt|zero debate)\b/gi
      ],
      tribal_polarization: [
        /\b(us vs them|the enemy|wake up sheeple|brainwashed|corrupt elite|passive sheep)\b/gi,
        /\b(they are lying|evil agenda|infiltrat(ed|ion))\b/gi
      ],
      urgency_panic: [
        /\b(before it'?s deleted|watch this now|urgent alert|widespread panic|panic button)\b/gi,
        /\b(running out of time|collapse imminent|disaster strikes|final warning)\b/gi,
        /\b(human extinction|kill all humans|wipe us out|catastrophic|terribly dangerous|desperately needs|going rogue|get(ting)? worse)\b/gi
      ]
    }
  },
  de: {
    name: "Deutsch",
    categories: {
      outrage_anger: [
        /\b(zerstört|vernichtet|absolut(er|e|es)? skandal|riesenskandal|skandalös|schandtat|widerlich|empörend)\b/gi,
        /\b(entlarvt|zerlegt|wutentbrannt|volksverrat|verräter|demütigung)\b/gi,
        /\b(fassungslos|drohende katastrophe|totaler kollaps|erbärmlich)\b/gi
      ],
      false_certainty: [
        /\b(unbestreitbar|unwiderlegbar|die ganze wahrheit|was verschwiegen wird)\b/gi,
        /\b(garantiert|100% bewiesen|kein zweifel|geheime fakten)\b/gi,
        /\b(jeder weiß|offensichtlich|systematische lüge)\b/gi
      ],
      tribal_polarization: [
        /\b(wir gegen die|die eliten|schlafschafe|gehirnwäsche|volksfeinde)\b/gi,
        /\b(zerstören unser land|böse agenda|zensurwahn)\b/gi
      ],
      urgency_panic: [
        /\b(bevor es gelöscht wird|sofort ansehen|eilmeldung|massenpanik|kollaps droht)\b/gi,
        /\b(letzte warnung|ausnahmezustand droht|untergang droht)\b/gi
      ]
    }
  },
  fr: {
    name: "Français",
    categories: {
      outrage_anger: [
        /\b(scandaleux|scandale absolu|pur scandale|détruit|anéanti|démoli|honteux|humilié|trahison)\b/gi,
        /\b(inadmissible|révoltant|immonde|traître|écœurant)\b/gi,
        /\b(furieux|massacré|catastrophe totale)\b/gi
      ],
      false_certainty: [
        /\b(irréfutable|incontestable|vérité cachée|ce qu'?on vous cache)\b/gi,
        /\b(preuve absolue|100% garanti|sans l'?ombre d'?un doute)\b/gi,
        /\b(tout le monde sait|mensonge d'?état|complot évident)\b/gi
      ],
      tribal_polarization: [
        /\b(nous contre eux|élites corrompues|moutons|lavage de cerveau)\b/gi,
        /\b(ils détruisent tout|agenda secret|ennemis du peuple)\b/gi
      ],
      urgency_panic: [
        /\b(avant censure|avant suppression|urgence absolue|alerte immédiate)\b/gi,
        /\b(dernière chance|panique générale|effondrement imminent)\b/gi
      ]
    }
  }
};

class TrilingualRegexEngine {
  constructor() {
    this.dictionary = TRILINGUAL_DICTIONARY;
  }

  /**
   * Automatically detects language or uses specified language.
   * Scans text for emotional triggers and returns matched tokens, counts, and intensity score.
   */
  scanText(text, lang = "auto") {
    if (!text || typeof text !== "string") {
      return { score: 0, matches: [], detectedLang: "en" };
    }

    const detectedLang = lang === "auto" ? this.detectLanguage(text) : lang;
    const langDict = this.dictionary[detectedLang] || this.dictionary.en;

    const matches = [];
    let matchCount = 0;

    for (const [category, patterns] of Object.entries(langDict.categories)) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
          matchCount++;
          matches.push({
            category,
            term: match[0],
            index: match.index,
            length: match[0].length
          });
        }
      }
    }

    // Normalized intensity score (0 to 10 scale)
    const wordCount = Math.max(1, text.split(/\s+/).length);
    const triggerDensity = (matchCount / wordCount) * 100; // triggers per 100 words
    const normalizedScore = Math.min(10, Math.round(triggerDensity * 2.5 * 10) / 10);

    return {
      score: normalizedScore,
      matchCount,
      matches,
      detectedLang,
      languageName: langDict.name,
      wordCount
    };
  }

  detectLanguage(text) {
    const sample = text.slice(0, 1000).toLowerCase();
    
    // Quick European linguistic markers
    const deMarkers = /\b(der|die|das|und|ist|nicht|für|mit|den|nach|oder|aber|wird)\b/gi;
    const frMarkers = /\b(le|la|les|un|une|des|et|est|pas|pour|avec|dans|mais|sont)\b/gi;

    const deHits = (sample.match(deMarkers) || []).length;
    const frHits = (sample.match(frMarkers) || []).length;

    if (deHits > 5 && deHits > frHits) return "de";
    if (frHits > 5 && frHits > deHits) return "fr";
    return "en";
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TrilingualRegexEngine, TRILINGUAL_DICTIONARY };
} else {
  window.CogniShieldRegex = new TrilingualRegexEngine();
}

