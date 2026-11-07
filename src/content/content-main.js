/**
 * CogniShield - Content Script Main Coordinator
 * Integrates Scrapers (YouTube, Twitter, Reddit, Web News), Regex Engine, Heatmap Highlighter, and Stepped Friction HUD.
 */

(function () {
  console.log("[CogniShield] Multi-Platform Cognitive Copilot active.");

  let lastAnalyzedUrl = "";
  let lastAnalyzedTitle = "";
  let activeScanId = 0;

  async function initializeCogniShield() {
    // 1. Initialize HUD Overlay
    if (window.CogniShieldHUD) {
      window.CogniShieldHUD.init();
    }

    // Trigger initial scan
    triggerDynamicScan("initial-load");
  }

  /**
   * Triggers a dynamic scan when navigating across videos or SPA routes.
   * Handles title settlement and prevents redundant/stale race conditions.
   */
  async function triggerDynamicScan(reason) {
    const targetUrl = window.location.href;
    const currentScanId = ++activeScanId;

    // Reset scraper transcript cache for new route
    if (window.CogniShieldScraper && window.CogniShieldScraper.reset) {
      window.CogniShieldScraper.reset();
    }

    // Wait for the new title / DOM metadata to settle
    const isYouTube = window.location.hostname.includes("youtube.com");
    if (isYouTube) {
      const start = Date.now();
      while (Date.now() - start < 2200) {
        if (window.location.href !== targetUrl) return; // User clicked another video
        const titleEl = document.querySelector("h1.ytd-watch-metadata yt-formatted-string, #title h1, h1.title");
        const titleText = titleEl ? titleEl.textContent.trim() : "";
        const docTitle = document.title.replace(/^\(\d+\)\s*/, "").replace(/- YouTube.*$/i, "").trim();

        if (titleText && titleText !== lastAnalyzedTitle && titleText.toLowerCase() !== "youtube") break;
        if (docTitle && docTitle !== lastAnalyzedTitle && docTitle.toLowerCase() !== "youtube") break;

        await new Promise(r => setTimeout(r, 120));
      }
    } else {
      await new Promise(r => setTimeout(r, 500));
    }

    // If another navigation occurred while waiting, abort this scan
    if (currentScanId !== activeScanId) return;

    await runContentAnalysis(targetUrl);
  }

  async function runContentAnalysis(targetUrl = window.location.href) {
    try {
      const hostname = window.location.hostname;
      let pageText = document.title;
      const elementsToScan = [];

      // 1. Platform-Specific Scraper Routing
      if (hostname.includes("youtube.com") && window.CogniShieldScraper) {
        const extracted = await window.CogniShieldScraper.extractVideoContext();
        pageText = extracted.textPayload || document.title;
        const titleEl = document.querySelector("h1, #title, ytd-watch-metadata");
        if (titleEl) elementsToScan.push(titleEl);
        document.querySelectorAll("#description, #content-text").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      } else if ((hostname.includes("twitter.com") || hostname.includes("x.com")) && window.CogniShieldTwitter) {
        const extracted = window.CogniShieldTwitter.extractTweetContext();
        pageText = extracted.textPayload || document.title;
        document.querySelectorAll("article [data-testid='tweetText']").forEach((el, i) => {
          if (i < 5) elementsToScan.push(el);
        });
      } else if (hostname.includes("reddit.com") && window.CogniShieldReddit) {
        const extracted = window.CogniShieldReddit.extractRedditContext();
        pageText = extracted.textPayload || document.title;
        const titleEl = document.querySelector("h1, shreddit-post [slot='title']");
        if (titleEl) elementsToScan.push(titleEl);
        document.querySelectorAll("shreddit-comment [slot='comment'], .usertext-body").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      } else if (window.CogniShieldNews) {
        // Generic Web Article / News / Search
        const extracted = window.CogniShieldNews.extractArticleContext();
        pageText = extracted.textPayload || document.title;
        const h1 = document.querySelector("h1, [role='heading']");
        if (h1) elementsToScan.push(h1);
        document.querySelectorAll("article p, main p, p").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      }

      // Record this URL and title as analyzed
      const cleanDocTitle = document.title.replace(/^\(\d+\)\s*/, "").replace(/- YouTube.*$/i, "").trim();
      lastAnalyzedUrl = targetUrl;
      lastAnalyzedTitle = cleanDocTitle;

      // 2. Client-side Manipulation Highlight Pass (Tier 0: 0ms, 0W)
      let highlightStats = { highlightedCount: 0 };
      if (window.CogniShieldHighlighter && elementsToScan.length > 0) {
        highlightStats = window.CogniShieldHighlighter.highlightElements(elementsToScan, "auto");
      }

      // 3. Scan overall text intensity
      let intensityScore = 3.0;
      let biasCategory = "outrage_anger";

      if (window.CogniShieldRegex) {
        const scanRes = window.CogniShieldRegex.scanText(pageText, "auto");
        intensityScore = Math.max(2.5, scanRes.score);
        if (scanRes.matches && scanRes.matches.length > 0) {
          biasCategory = scanRes.matches[0].category;
        }
      }

      // 4. Update Ambient Badge (Level 1 Subconscious Glow)
      if (window.CogniShieldHUD) {
        window.CogniShieldHUD.updateAmbientStatus(intensityScore, highlightStats.highlightedCount);

        // 5. Initial Instant Load via Deterministic Cache (Zero Latency Baseline)
        if (window.CogniShieldOffline) {
          const dossier = window.CogniShieldOffline.matchDossier(pageText, {
            title: cleanDocTitle,
            hostname: window.location.hostname
          });
          dossier.emotional_intensity = intensityScore;
          dossier.bias_category = biasCategory;
          window.CogniShieldHUD.loadDossier(dossier, highlightStats.categoryCounts);
        }

        // 6. Live Multi-Tier AI Analysis (Gemini Flash Primary -> Groq Fallback)
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.storage.local.get(["forceDemoMode"], (settings) => {
            if (settings.forceDemoMode) {
              console.log("[CogniShield] Demo Safety Net active. Running 100% offline.");
              return;
            }

            chrome.runtime.sendMessage(
              {
                action: "ANALYZE_LIVE_CONTENT",
                payload: {
                  title: cleanDocTitle,
                  textPayload: pageText,
                  url: window.location.href
                }
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.warn("[CogniShield] Live bridge error:", chrome.runtime.lastError.message);
                  return;
                }
                // Verify the user is still on this URL
                if (window.location.href !== targetUrl) return;

                if (response && response.status === "SUCCESS" && response.data) {
                  console.log(`[CogniShield] Live analysis successfully loaded via ${response.tier}!`);
                  const liveData = response.data;
                  if (!liveData.contextTitle) {
                    liveData.contextTitle = cleanDocTitle;
                  }
                  window.CogniShieldHUD.loadDossier(liveData, highlightStats.categoryCounts);
                  const newScore = parseFloat(liveData.emotional_intensity) || intensityScore;
                  window.CogniShieldHUD.updateAmbientStatus(newScore, highlightStats.highlightedCount);
                }
              }
            );
          });
        }
      }
    } catch (err) {
      console.warn("[CogniShield] Analysis error:", err);
    }
  }

  // Handle YouTube native SPA navigation events
  window.addEventListener("yt-navigate-finish", () => triggerDynamicScan("yt-navigate-finish"));
  window.addEventListener("yt-page-data-updated", () => triggerDynamicScan("yt-page-data-updated"));
  window.addEventListener("popstate", () => triggerDynamicScan("popstate"));

  // Continuous fallback watcher for seamless Single-Page App navigation
  let lastMonitoredUrl = location.href;
  setInterval(() => {
    if (location.href !== lastMonitoredUrl) {
      lastMonitoredUrl = location.href;
      triggerDynamicScan("url-change");
    }
  }, 400);

  // Listen for messages from popup
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "TRIGGER_SCAN") {
        hasScanned = false;
        runContentAnalysis().then(() => sendResponse({ status: "SUCCESS" }));
        return true;
      } else if (request.action === "FORCE_DEMO_TOPIC") {
        if (window.CogniShieldOffline && window.CogniShieldHUD) {
          const dossier = window.CogniShieldOffline.getDossierById(request.topicId);
          window.CogniShieldHUD.loadDossier(dossier);
          window.CogniShieldHUD.openModal();
          sendResponse({ status: "LOADED" });
        }
        return true;
      }
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeCogniShield();
  } else {
    window.addEventListener("DOMContentLoaded", initializeCogniShield);
  }
})();
