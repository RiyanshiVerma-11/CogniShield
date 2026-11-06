/**
 * CogniShield - Client-Side Manipulation Heatmap Highlighter
 * Scans page DOM elements for sensational and polarizing keywords using pure client-side JS regex.
 * Zero API calls, zero latency, zero cloud emissions.
 */

class HeatmapHighlighter {
  constructor() {
    this.highlightClass = "cognishield-highlight";
    this.activeHighlights = 0;
  }

  /**
   * Highlights emotional triggers in targeted DOM elements without disrupting interactive elements.
   */
  highlightElements(elements, lang = "auto") {
    if (!elements || elements.length === 0) return { highlightedCount: 0 };
    if (typeof CogniShieldRegex === "undefined") return { highlightedCount: 0 };

    this.clearHighlights();
    let totalCount = 0;

    elements.forEach(el => {
      if (!el || el.closest(".cognishield-hud-container")) return;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];

      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.trim().length > 3) {
          textNodes.push(node);
        }
      }

      textNodes.forEach(textNode => {
        const text = textNode.nodeValue;
        const scanResult = CogniShieldRegex.scanText(text, lang);

        if (scanResult.matches && scanResult.matches.length > 0) {
          totalCount += scanResult.matches.length;
          const fragment = document.createDocumentFragment();
          let lastIdx = 0;

          // Sort matches by index ascending
          const sortedMatches = [...scanResult.matches].sort((a, b) => a.index - b.index);

          sortedMatches.forEach(m => {
            if (m.index < lastIdx) return; // avoid overlapping replacement errors

            // Append preceding regular text
            if (m.index > lastIdx) {
              fragment.appendChild(document.createTextNode(text.substring(lastIdx, m.index)));
            }

            // Create highlight mark
            const mark = document.createElement("mark");
            mark.className = `cognishield-mark cognishield-cat-${m.category}`;
            mark.title = `CogniShield Flag: [${m.category.replace(/_/g, " ").toUpperCase()}]`;
            mark.textContent = text.substr(m.index, m.length);
            fragment.appendChild(mark);

            lastIdx = m.index + m.length;
          });

          // Append remaining text
          if (lastIdx < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
          }

          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(fragment, textNode);
          }
        }
      });
    });

    this.activeHighlights = totalCount;
    return { highlightedCount: totalCount };
  }

  /**
   * Removes all highlights and restores original text
   */
  clearHighlights() {
    const marks = document.querySelectorAll("mark.cognishield-mark");
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
    this.activeHighlights = 0;
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { HeatmapHighlighter };
} else {
  window.CogniShieldHighlighter = new HeatmapHighlighter();
}

