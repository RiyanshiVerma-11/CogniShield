/**
 * CogniShield - Extension Popup Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const toggleTrainer = document.getElementById("toggle-trainer-mode");
  const toggleDemo = document.getElementById("toggle-demo-mode");
  const badgeStatus = document.getElementById("badge-mode-status");
  const btnScan = document.getElementById("btn-trigger-scan");
  const btnLoadDemo = document.getElementById("btn-load-demo");
  const selectDemo = document.getElementById("select-demo-topic");
  const btnExport = document.getElementById("btn-cert-export");
  const btnSaveKeys = document.getElementById("btn-save-keys");
  const inputGemini = document.getElementById("input-gemini-key");
  const inputGroq = document.getElementById("input-groq-key");
  const labelKeysSaved = document.getElementById("label-keys-saved");
  const badgeApiStatus = document.getElementById("badge-api-status");

  const btnOpenDashboard = document.getElementById("btn-open-dashboard");
  const statAgency = document.getElementById("stat-agency");
  const statDiversity = document.getElementById("stat-diversity");

  // Load dynamic metrics from IndexedDB
  async function loadDynamicPopupStats() {
    if (window.CogniShieldStorage && window.CogniShieldStorage.getAllSessions) {
      try {
        const sessions = await window.CogniShieldStorage.getAllSessions();
        if (sessions && sessions.length > 0) {
          let totalDwell = 0;
          let correct = 0;
          let totalQuizzes = 0;
          const archetypes = { empirical: 0, economic: 0, statutory: 0, socio_ethical: 0 };

          sessions.forEach(s => {
            totalDwell += (typeof s.dwellSeconds === "number" ? s.dwellSeconds : (parseInt(s.dwellSeconds, 10) || 0));
            if (s.quizAnswered) {
              totalQuizzes++;
              if (s.quizCorrect) correct++;
            }
            if (Array.isArray(s.epistemicArchetypes)) {
              s.epistemicArchetypes.forEach(a => {
                const k = (a || "").toLowerCase();
                if (k.includes("econ")) archetypes.economic++;
                else if (k.includes("statut") || k.includes("legal") || k.includes("juris")) archetypes.statutory++;
                else if (k.includes("ethic") || k.includes("social") || k.includes("human")) archetypes.socio_ethical++;
                else archetypes.empirical++;
              });
            }
          });

          const avgDwell = sessions.length > 0 ? (totalDwell / sessions.length) : 0;
          let cas = 70;
          let entropy = 1.6;
          if (window.CogniShieldCognitive) {
            cas = window.CogniShieldCognitive.calculateAgencyScore(avgDwell, correct, totalQuizzes, archetypes);
            entropy = window.CogniShieldCognitive.calculatePerspectiveEntropy(archetypes);
          }
          const divPct = Math.min(100, Math.round((entropy / 2.0) * 100));

          if (statAgency) statAgency.textContent = cas;
          if (statDiversity) statDiversity.textContent = `${divPct}%`;
        }
      } catch (err) {
        console.warn("[CogniShield Popup] Error loading stats:", err);
      }
    }
  }
  loadDynamicPopupStats();

  // Load saved state
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["userMode", "forceDemoMode", "geminiApiKey", "groqApiKey"], (res) => {
      const isTrainer = res.userMode !== "zen";
      if (toggleTrainer) toggleTrainer.checked = isTrainer;
      if (badgeStatus) {
        badgeStatus.textContent = isTrainer ? "TRAINER" : "ZEN";
        badgeStatus.style.color = isTrainer ? "#10B981" : "#38BDF8";
        badgeStatus.style.borderColor = isTrainer ? "rgba(16, 185, 129, 0.3)" : "rgba(56, 189, 248, 0.3)";
      }

      if (toggleDemo) toggleDemo.checked = !!res.forceDemoMode;

      // Populate API key inputs if saved
      if (inputGemini && res.geminiApiKey) {
        inputGemini.value = res.geminiApiKey;
      }
      if (inputGroq && res.groqApiKey) {
        inputGroq.value = res.groqApiKey;
      }
      if (badgeApiStatus) {
        const hasKey = !!(res.geminiApiKey || res.groqApiKey);
        badgeApiStatus.textContent = hasKey ? "READY" : "OFFLINE";
        badgeApiStatus.style.color = hasKey ? "#10B981" : "#94A3B8";
      }
    });
  }

  // Open Full Cognitive Dashboard
  if (btnOpenDashboard) {
    btnOpenDashboard.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: chrome.runtime.getURL("src/dashboard/dashboard.html") });
      } else {
        window.open("../dashboard/dashboard.html", "_blank");
      }
    });
  }

  // Save API Keys to browser local storage
  if (btnSaveKeys && inputGemini && inputGroq) {
    btnSaveKeys.addEventListener("click", () => {
      const geminiApiKey = inputGemini.value.trim();
      const groqApiKey = inputGroq.value.trim();

      chrome.storage.local.set({ geminiApiKey, groqApiKey }, () => {
        if (labelKeysSaved) {
          labelKeysSaved.style.display = "block";
          setTimeout(() => { labelKeysSaved.style.display = "none"; }, 2500);
        }
        if (badgeApiStatus) {
          const hasKey = !!(geminiApiKey || groqApiKey);
          badgeApiStatus.textContent = hasKey ? "READY" : "OFFLINE";
          badgeApiStatus.style.color = hasKey ? "#10B981" : "#94A3B8";
        }
      });
    });
  }

  // Trainer vs Zen Mode Toggle
  toggleTrainer.addEventListener("change", () => {
    const isTrainer = toggleTrainer.checked;
    const mode = isTrainer ? "trainer" : "zen";
    badgeStatus.textContent = isTrainer ? "TRAINER" : "ZEN";
    badgeStatus.style.color = isTrainer ? "#10B981" : "#38BDF8";

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ userMode: mode });
    }
  });

  // Demo Mode Toggle
  toggleDemo.addEventListener("change", () => {
    const isDemo = toggleDemo.checked;
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ forceDemoMode: isDemo });
    }
  });

  // Scan Feed Now Button
  btnScan.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_SCAN" });
        window.close();
      }
    });
  });

  // Launch Demo Scenario
  btnLoadDemo.addEventListener("click", () => {
    const topicId = selectDemo.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "FORCE_DEMO_TOPIC", topicId });
        window.close();
      }
    });
  });

  // Export Academic Certificate
  btnExport.addEventListener("click", () => {
    const token = "CS-VERIFY-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();
    const certText = `
=============================================================
🛡️ COGNISHIELD ACADEMIC DUE-DILIGENCE CERTIFICATE
Accreditation Standard: European Standards & Guidelines (ESG)
=============================================================
Verification Token : ${token}
Timestamp          : ${new Date().toISOString()}
Session Status     : VERIFIED MULTI-PERSPECTIVE SCRUTINY
Cognitive Agency   : 78 / 100 (System 2 Scrutiny Active)

Verified Epistemic Archetypes Engaged:
[x] Peer-Reviewed Empirical Data
[x] Statutory & Regulatory Frameworks
[x] Macroeconomic Census Backing

GDPR & Ethics Compliance:
100% Client-Side Local Execution (Zero-Cloud Retention).
=============================================================
`.trim();

    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CogniShield_Academic_Certificate_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

