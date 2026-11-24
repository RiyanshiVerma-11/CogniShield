/**
 * CogniShield - Manifest V3 Background Service Worker
 * Manages tab lifecycle, dwell-time analysis, and 4-tier hybrid AI dispatch.
 */

import { AIBridge } from "./api-bridge.js";

console.log("[CogniShield] Service Worker loaded.");

const aiBridge = new AIBridge();
const tabDwellMap = new Map();

// Initialize local configuration on install/update/load (preserving user preferences)
function initializeKeys() {
  chrome.storage.local.get(["geminiApiKey", "groqApiKey", "forceDemoMode", "userMode", "selectedLang"], (existing) => {
    const geminiKey = existing.geminiApiKey || "";
    const groqKey = existing.groqApiKey || "";

    chrome.storage.local.set({
      userMode: existing.userMode || "trainer",
      forceDemoMode: existing.forceDemoMode ?? false,
      selectedLang: existing.selectedLang || "auto",
      geminiApiKey: geminiKey,
      groqApiKey: groqKey
    }, () => {
      console.log("[CogniShield] Config initialized:", {
        mode: existing.userMode || "trainer",
        gemini: geminiKey ? "SET" : "OFFLINE_CACHE",
        groq: groqKey ? "SET" : "OFFLINE_CACHE"
      });
    });
  });
}

// Ensure config is populated immediately whenever worker boots up
initializeKeys();

chrome.runtime.onInstalled.addListener(initializeKeys);
chrome.runtime.onStartup.addListener(initializeKeys);

// Track Tab Dwell-Time for System 1/2 Latency Scrutiny
chrome.tabs.onActivated.addListener(activeInfo => {
  tabDwellMap.set(activeInfo.tabId, Date.now());
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    tabDwellMap.set(tabId, Date.now());
  }
});

// Message Dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_DWELL_TIME") {
    const tabId = sender.tab ? sender.tab.id : null;
    const startTime = tabDwellMap.get(tabId) || Date.now();
    const rawElapsed = Math.round((Date.now() - startTime) / 1000);
    // Cap per-tab dwell tracking at 120s max
    const elapsedSeconds = Math.min(Math.max(0, rawElapsed), 120);
    sendResponse({ dwellSeconds: elapsedSeconds });
    return true;
  }

  if (request.action === "OPEN_DASHBOARD") {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/dashboard/dashboard.html") });
    sendResponse({ status: "OPENED" });
    return true;
  }

  if (request.action === "FLIP_FEED_ANALYZE") {
    chrome.storage.local.get(["forceDemoMode", "geminiApiKey", "groqApiKey"], async (settings) => {
      try {
        const geminiKey = settings.geminiApiKey || "";
        const groqKey = settings.groqApiKey || "";

        const title = request.payload?.title || "";
        const textPayload = request.payload?.textPayload || "";
        const result = await aiBridge.generateFlipFeed(title, textPayload, {
          forceDemoMode: !!settings.forceDemoMode,
          geminiApiKey: geminiKey,
          groqApiKey: groqKey
        });
        sendResponse(result);
      } catch (err) {
        console.warn("[CogniShield ServiceWorker] FlipFeed AI dispatch error:", err);
        sendResponse({ status: "OFFLINE_FALLBACK" });
      }
    });
    return true; // Keep message port open for async response
  }

  if (request.action === "LOG_SESSION_SYNC") {
    const session = request.session;
    if (!session) {
      sendResponse({ status: "INVALID" });
      return true;
    }
    chrome.storage.local.get(["_cognishield_sessions_store"], (res) => {
      let store = res._cognishield_sessions_store || [];
      if (!session.id) session.id = "sess_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      store.unshift(session);
      if (store.length > 500) store = store.slice(0, 500);
      chrome.storage.local.set({
        _cognishield_sessions_store: store,
        _live_bus_event: { type: "SESSION_LOGGED", timestamp: Date.now() }
      }, () => {
        sendResponse({ status: "SAVED", id: session.id });
      });
    });
    return true;
  }

  if (request.action === "UPDATE_SESSION_SYNC") {
    const { id, updates } = request;
    if (!id || !updates) {
      sendResponse({ status: "INVALID" });
      return true;
    }
    chrome.storage.local.get(["_cognishield_sessions_store"], (res) => {
      let store = res._cognishield_sessions_store || [];
      let updated = false;
      store = store.map(item => {
        if (item.id === id) {
          updated = true;
          return Object.assign({}, item, updates);
        }
        return item;
      });
      if (updated) {
        chrome.storage.local.set({
          _cognishield_sessions_store: store,
          _live_bus_event: { type: "SESSION_UPDATED", timestamp: Date.now() }
        }, () => {
          sendResponse({ status: "UPDATED" });
        });
      } else {
        sendResponse({ status: "NOT_FOUND" });
      }
    });
    return true;
  }

  if (request.action === "GET_ALL_SESSIONS_SYNC") {
    chrome.storage.local.get(["_cognishield_sessions_store"], (res) => {
      sendResponse({ sessions: res._cognishield_sessions_store || [] });
    });
    return true;
  }

  if (request.action === "ANALYZE_LIVE_CONTENT") {
    chrome.storage.local.get(["forceDemoMode", "geminiApiKey", "groqApiKey"], async (settings) => {
      try {
        const geminiKey = settings.geminiApiKey || "";
        const groqKey = settings.groqApiKey || "";

        const textPayload = request.payload?.textPayload || request.payload?.title || "";
        const result = await aiBridge.dispatchAnalysis(textPayload, {
          forceDemoMode: !!settings.forceDemoMode,
          geminiApiKey: geminiKey,
          groqApiKey: groqKey
        });
        if (result && result.status === "SUCCESS") {
          sendResponse({ ...result, isLiveAi: true });
        } else {
          sendResponse({ status: "OFFLINE_CACHE", isLiveAi: false });
        }
      } catch (err) {
        console.warn("[CogniShield ServiceWorker] Live dispatch error:", err);
        sendResponse({ status: "OFFLINE_CACHE", isLiveAi: false });
      }
    });
    return true; // Keep message port open for async response
  }
});
