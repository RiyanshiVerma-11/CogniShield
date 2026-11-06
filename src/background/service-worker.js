/**
 * CogniShield - Manifest V3 Background Service Worker
 * Manages tab lifecycle, dwell-time analysis, and 4-tier hybrid AI dispatch.
 */

import { AIBridge } from "./api-bridge.js";

console.log("[CogniShield] Service Worker loaded.");

const aiBridge = new AIBridge();
const tabDwellMap = new Map();

// Initialize secure local configuration on install/update
async function initializeKeys() {
  chrome.storage.local.get(["geminiApiKey", "groqApiKey", "forceDemoMode"], async (existing) => {
    let geminiKey = existing.geminiApiKey || "";
    let groqKey = existing.groqApiKey || "";

    // Try reading local developer config if present (ignored by Git)
    try {
      const localMod = await import("../config/keys.local.js");
      if (localMod?.LOCAL_AI_KEYS) {
        if (!geminiKey) geminiKey = localMod.LOCAL_AI_KEYS.geminiApiKey || "";
        if (!groqKey) groqKey = localMod.LOCAL_AI_KEYS.groqApiKey || "";
      }
    } catch (_) {
      // keys.local.js is gitignored and optional
    }

    chrome.storage.local.set({
      userMode: "trainer", // "zen" or "trainer"
      forceDemoMode: existing.forceDemoMode ?? false,
      selectedLang: "auto",
      geminiApiKey: geminiKey,
      groqApiKey: groqKey
    });
  });
}

chrome.runtime.onInstalled.addListener(initializeKeys);
chrome.runtime.onStartup.addListener(initializeKeys);

// Track Tab Dwell-Time for Kahneman System 1/2 Latency Scrutiny
chrome.tabs.onActivated.addListener(activeInfo => {
  const tabId = activeInfo.tabId;
  tabDwellMap.set(tabId, Date.now());
});

// Message Dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_DWELL_TIME") {
    const tabId = sender.tab ? sender.tab.id : null;
    const startTime = tabDwellMap.get(tabId) || Date.now();
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    sendResponse({ dwellSeconds: elapsedSeconds });
    return true;
  }

  if (request.action === "ANALYZE_LIVE_CONTENT") {
    chrome.storage.local.get(["forceDemoMode", "geminiApiKey", "groqApiKey"], async (settings) => {
      try {
        const textPayload = request.payload?.textPayload || request.payload?.title || "";
        const result = await aiBridge.dispatchAnalysis(textPayload, {
          forceDemoMode: !!settings.forceDemoMode,
          geminiApiKey: settings.geminiApiKey || "",
          groqApiKey: settings.groqApiKey || ""
        });
        sendResponse(result);
      } catch (err) {
        console.warn("[CogniShield ServiceWorker] Live dispatch error:", err);
        sendResponse({ status: "OFFLINE_CACHE" });
      }
    });
    return true; // Keep message port open for async response
  }
});
