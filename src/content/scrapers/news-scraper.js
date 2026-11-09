/**
 * CogniShield - Generic Web News & Article Scraper
 * Extracts editorial context from news portals (BBC, Der Spiegel, Le Monde, The Hindu, Substack, Medium).
 * Implements Readability-style text harvesting in sub-30ms.
 */

class NewsScraper {
  constructor() {
    this.platform = "Web News / Editorial";
  }

  extractArticleContext() {
    let headline = "";
    let publication = window.location.hostname.replace("www.", "");
    const paragraphs = [];

    try {
      // 1. Article / Page Headline
      const h1 = document.querySelector("article h1, main h1, h1, [role='heading'][aria-level='1'], [role='heading']");
      if (h1 && h1.innerText && h1.innerText.trim().length > 3) {
        headline = h1.innerText.trim();
      } else {
        headline = document.title;
      }

      // 2. Lead paragraphs (first 3-4 paragraphs)
      const pNodes = document.querySelectorAll("article p, main p, .article-body p, .story-body p, .content p");
      pNodes.forEach((p, idx) => {
        if (idx < 4) {
          const t = p.innerText.trim();
          if (t && t.length > 30) paragraphs.push(t);
        }
      });
    } catch (e) {
      console.warn("[CogniShield] News scraper error:", e);
    }

    const combinedPayload = [
      `[Source]: ${publication}`,
      headline ? `[Headline]: ${headline}` : "",
      paragraphs.length > 0 ? `[Content]: ${paragraphs.join(" ")}` : ""
    ].filter(Boolean).join("\n");

    return {
      platform: "Editorial",
      publication,
      headline,
      paragraphs,
      textPayload: combinedPayload || document.title
    };
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NewsScraper };
} else {
  window.CogniShieldNews = new NewsScraper();
}

