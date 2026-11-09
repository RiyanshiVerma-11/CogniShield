/**
 * CogniShield - Content Script Main Coordinator
 * Integrates Scrapers (YouTube, Twitter, Reddit, Web News), Regex Engine, Heatmap Highlighter, and Stepped Friction HUD.
 */

(function () {
  console.log("[CogniShield] Multi-Platform Cognitive Copilot active.");

  let lastAnalyzedUrl = "";
  let lastAnalyzedTitle = "";
  let activeScanId = 0;
  let currentSessionId = null;
  let currentSessionStartTime = Date.now();
  let dwellTrackingInterval = null;

  async function initializeCogniShield() {
    // Do not inject floating HUD trigger inside CogniShield's own dashboard or options page
    if (window.location && window.location.pathname && window.location.pathname.includes("dashboard.html")) {
      return;
    }

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
      let extractedHeadline = "";
      const elementsToScan = [];

      // 1. Platform-Specific Scraper Routing
      if (hostname.includes("youtube.com") && window.CogniShieldScraper) {
        const extracted = await window.CogniShieldScraper.extractVideoContext();
        pageText = extracted.textPayload || document.title;
        extractedHeadline = extracted.title || "";
        const titleEl = document.querySelector("h1.ytd-watch-metadata yt-formatted-string, h1, #title");
        if (titleEl) elementsToScan.push(titleEl);
        document.querySelectorAll("#description, #content-text").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      } else if ((hostname.includes("twitter.com") || hostname.includes("x.com")) && window.CogniShieldTwitter) {
        const extracted = window.CogniShieldTwitter.extractTweetContext();
        pageText = extracted.textPayload || document.title;
        extractedHeadline = extracted.author ? `Post by ${extracted.author}` : "";
        document.querySelectorAll("article [data-testid='tweetText']").forEach((el, i) => {
          if (i < 5) elementsToScan.push(el);
        });
      } else if (hostname.includes("reddit.com") && window.CogniShieldReddit) {
        const extracted = window.CogniShieldReddit.extractRedditContext();
        pageText = extracted.textPayload || document.title;
        extractedHeadline = extracted.title || "";
        const titleEl = document.querySelector("h1, shreddit-post [slot='title']");
        if (titleEl) elementsToScan.push(titleEl);
        document.querySelectorAll("shreddit-comment [slot='comment'], .usertext-body").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      } else if (window.CogniShieldNews) {
        // Generic Web Article / News / Search / Competitions
        const extracted = window.CogniShieldNews.extractArticleContext();
        pageText = extracted.textPayload || document.title;
        extractedHeadline = extracted.headline || "";
        const h1 = document.querySelector("h1, [role='heading']");
        if (h1) elementsToScan.push(h1);
        document.querySelectorAll("article p, main p, p").forEach((el, i) => {
          if (i < 4) elementsToScan.push(el);
        });
      }

      // If no scraper headline found, inspect DOM for prominent heading
      if (!extractedHeadline) {
        const h1 = document.querySelector("h1, [role='heading']");
        if (h1 && h1.innerText && h1.innerText.trim().length > 4) {
          extractedHeadline = h1.innerText.trim();
        }
      }

      // Record this URL and title as analyzed
      const cleanDocTitle = document.title
        .replace(/^\(\d+\)\s*/, "")
        .replace(/- YouTube.*$/i, "")
        .replace(/\|.*$/i, "")
        .replace(/\s*-\s*Competitions,.*$/i, "")
        .replace(/\s*\|\s*Unstop.*$/i, "")
        .trim();

      const effectiveTitle = (extractedHeadline && extractedHeadline.length > 4)
        ? extractedHeadline.trim()
        : (cleanDocTitle || document.title || "Live Web Analysis");

      lastAnalyzedUrl = targetUrl;
      lastAnalyzedTitle = effectiveTitle;

      // 2. Client-side Manipulation Highlight Pass (Tier 0: 0ms, 0W)
      let highlightStats = { highlightedCount: 0 };
      if (window.CogniShieldHighlighter && elementsToScan.length > 0) {
        highlightStats = window.CogniShieldHighlighter.highlightElements(elementsToScan, "auto");
      }

      // 3. Scan overall text intensity dynamically
      let intensityScore = 0;
      let biasCategory = "neutral";

      if (window.CogniShieldRegex) {
        const scanRes = window.CogniShieldRegex.scanText(pageText, "auto");
        if (scanRes.score > 0) {
          intensityScore = scanRes.score;
        }
        if (scanRes.matches && scanRes.matches.length > 0) {
          biasCategory = scanRes.matches[0].category;
        }
      }

      // Match offline cache or dynamic topic synthesizer
      let matchedDossier = null;
      if (window.CogniShieldOffline) {
        matchedDossier = window.CogniShieldOffline.matchDossier(pageText, {
          title: effectiveTitle,
          hostname: window.location.hostname
        });
      }

      // Reconcile dynamic intensity and bias category
      if (intensityScore > 0) {
        if (matchedDossier) matchedDossier.emotional_intensity = intensityScore;
      } else if (matchedDossier && matchedDossier.emotional_intensity) {
        intensityScore = parseFloat(matchedDossier.emotional_intensity);
      } else {
        intensityScore = 1.5;
        if (matchedDossier) matchedDossier.emotional_intensity = intensityScore;
      }

      if (biasCategory !== "neutral") {
        if (matchedDossier) matchedDossier.bias_category = biasCategory;
      } else if (matchedDossier && matchedDossier.bias_category) {
        biasCategory = matchedDossier.bias_category;
      }

      // 4. Update Ambient Badge (Level 1 Subconscious Glow)
      if (window.CogniShieldHUD) {
        window.CogniShieldHUD.updateAmbientStatus(intensityScore, highlightStats.highlightedCount);

        // 5. Initial Load into HUD via Cache / Synthesizer
        if (matchedDossier) {
          window.CogniShieldHUD.loadDossier(matchedDossier, highlightStats.categoryCounts);
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
                  title: effectiveTitle,
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
                    liveData.contextTitle = effectiveTitle;
                  }
                  window.CogniShieldHUD.loadDossier(liveData, highlightStats.categoryCounts);
                  const newScore = parseFloat(liveData.emotional_intensity) || intensityScore;
                  intensityScore = newScore;
                  if (liveData.bias_category) {
                    biasCategory = liveData.bias_category;
                  }
                  window.CogniShieldHUD.updateAmbientStatus(newScore, highlightStats.highlightedCount);

                  if (currentSessionId && window.CogniShieldStorage && window.CogniShieldStorage.updateSession) {
                    let liveArchetypes = ["Empirical"];
                    if (liveData.hidden_counter_perspectives) {
                      liveArchetypes = liveData.hidden_counter_perspectives.map(p => p.archetype || "Empirical");
                    }
                    window.CogniShieldStorage.updateSession(currentSessionId, {
                      emotionalIntensity: newScore,
                      biasCategory: biasCategory,
                      epistemicArchetypes: liveArchetypes
                    });
                  }
                }
              }
            );
          });
        }
      }

      // 7. Log browsing visit to Local IndexedDB (100% On-Device Privacy)
      if (window.CogniShieldStorage && window.CogniShieldStorage.logSession) {
        if (currentSessionId && window.CogniShieldStorage.updateSession) {
          const finalDwell = Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 1000));
          window.CogniShieldStorage.updateSession(currentSessionId, { dwellSeconds: finalDwell });
          currentSessionId = null;
        }

        currentSessionStartTime = Date.now();
        let archetypesList = ["Empirical"];
        if (matchedDossier && matchedDossier.hidden_counter_perspectives) {
          archetypesList = matchedDossier.hidden_counter_perspectives.map(p => {
            const arch = (p.archetype || "").toLowerCase();
            if (arch.includes("econ")) return "Economic";
            if (arch.includes("statut") || arch.includes("legal") || arch.includes("juris")) return "Statutory";
            if (arch.includes("ethic") || arch.includes("social") || arch.includes("human")) return "Socio-Ethical";
            return "Empirical";
          });
        }

        window.CogniShieldStorage.logSession({
          title: effectiveTitle,
          domain: window.location.hostname,
          detectedLang: "en",
          biasCategory: biasCategory,
          emotionalIntensity: intensityScore,
          scaffoldingTier: "Autonomous Agency",
          dwellSeconds: 1,
          quizAnswered: false,
          quizCorrect: false,
          epistemicArchetypes: archetypesList.length > 0 ? archetypesList : ["Empirical", "Economic"],
          timestamp: Date.now()
        }).then(sessId => {
          currentSessionId = sessId;
          if (sessId && window.CogniShieldHUD) {
            window.CogniShieldHUD.activeSessionId = sessId;
          }
        });
      }

      // Continuously track real dwell time as user watches video or reads
      if (!dwellTrackingInterval) {
        dwellTrackingInterval = setInterval(() => {
          if (currentSessionId && window.CogniShieldStorage && window.CogniShieldStorage.updateSession) {
            const elapsed = Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 1000));
            window.CogniShieldStorage.updateSession(currentSessionId, { dwellSeconds: elapsed });
          }
        }, 3000);
      }
    } catch (err) {
      console.warn("[CogniShield] Analysis error:", err);
    }
  }

  // Finalize dwell on tab unload / hide
  window.addEventListener("pagehide", () => {
    if (currentSessionId && window.CogniShieldStorage && window.CogniShieldStorage.updateSession) {
      const finalDwell = Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 1000));
      window.CogniShieldStorage.updateSession(currentSessionId, { dwellSeconds: finalDwell });
    }
  });

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
        triggerDynamicScan("popup-trigger").then(() => sendResponse({ status: "SUCCESS" }));
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
