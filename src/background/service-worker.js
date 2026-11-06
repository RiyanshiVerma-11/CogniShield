/**
 * CogniShield - Manifest V3 Background Service Worker
 * Manages tab lifecycle, dwell-time analysis, and extension communication.
 */

console.log("[CogniShield] Service Worker loaded.");

const tabDwellMap = new Map();

chrome.runtime.onInstalled.addListener(() => {
  console.log("[CogniShield] Successfully installed and configured.");
  chrome.storage.local.set({
    userMode: "trainer", // "zen" or "trainer"
    forceDemoMode: false,
    selectedLang: "auto"
  });
});

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
});

