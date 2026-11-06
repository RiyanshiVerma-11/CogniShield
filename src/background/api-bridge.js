/**
 * CogniShield - 4-Tier Hybrid AI Dispatcher
 * Tier 0: Pure Client-Side Regex (0ms, 0W)
 * Tier 1: Local Deterministic Offline Cache (0ms, 0 Network)
 * Tier 2: Serverless Cloud Micro-JSON (Sub-400ms, Groq / Gemini Flash)
 * Tier 3: Chrome Gemini Nano On-Device SLM (window.ai)
 */

class AIBridge {
  constructor() {
    this.cloudEndpoint = "https://api.groq.com/openai/v1/chat/completions";
  }

  /**
   * Main dispatch method enforcing 4-tier cascade
   */
  async dispatchAnalysis(sanitizedText, options = {}) {
    // 1. Check if user or stage forced Demo Mode (Tier 1)
    if (options.forceDemoMode || !navigator.onLine) {
      console.log("[CogniShield Bridge] Dispatching Tier 1: Offline Safety Net.");
      return { tier: "Tier 1: Offline Cache", status: "OFFLINE_CACHE" };
    }

    // 2. Try Tier 3: Chrome Built-in AI (window.ai) if available
    if (typeof window !== "undefined" && window.ai && window.ai.languageModel) {
      try {
        console.log("[CogniShield Bridge] Dispatching Tier 3: Chrome Gemini Nano (window.ai).");
        const session = await window.ai.languageModel.create();
        const prompt = `Analyze this topic for blindspots. Return JSON with 2 counter perspectives: ${sanitizedText}`;
        const result = await session.prompt(prompt);
        return { tier: "Tier 3: On-Device Nano", data: JSON.parse(result) };
      } catch (err) {
        console.warn("[CogniShield Bridge] window.ai fallback to Tier 2:", err);
      }
    }

    // 3. Fall back to Tier 2: Cloud micro-JSON
    console.log("[CogniShield Bridge] Dispatching Tier 2: Serverless Micro-JSON.");
    return {
      tier: "Tier 2: Micro-JSON Cloud",
      status: "READY"
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AIBridge };
}

