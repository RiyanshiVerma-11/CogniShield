/**
 * CogniShield - Multi-Tier Hybrid AI Dispatcher
 * Tier 1: Google Gemini 2.5 Flash (Primary Live LLM)
 * Tier 2: Groq GPT-OSS / Llama (Failover Live LLM on 429/Timeout)
 * Tier 3: Local Deterministic Offline Knowledge Graph (Zero-Network Safe Fallback)
 */

export class AIBridge {
  constructor() {
    this.geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    this.groqEndpoint = "https://api.groq.com/openai/v1/chat/completions";
  }

  buildSystemPrompt(contentPayload) {
    return `You are CogniShield, an epistemic cognitive copilot designed to empower critical thinking and intellectual agency without censorship.
Analyze the following media content (title, excerpt, or captions):
"${contentPayload.slice(0, 2500)}"

Return a strictly valid JSON object matching this exact structure:
{
  "title": "Clear concise topic headline (e.g. Autonomous AI Decision-Making: Liability & Agency)",
  "contextTitle": "Exact video or article title",
  "source_perspective": "Concise summary of the framing, tone, and angle (e.g. Technocentric Liability / Alarmist Outrage)",
  "emotional_intensity": 5.5,
  "epistemic_card": {
    "model_type": "Live Multi-Tier AI (Gemini Flash / Groq)",
    "epistemic_confidence": "Live Epistemic Analysis",
    "disclaimer": "Algorithmic counter-hypothesis generated for dialectic reflection, not absolute truth."
  },
  "micro_quiz": {
    "question": "A sharp Socratic question identifying an unstated premise, cognitive bias, or logical fallacy in this content",
    "options": [
      "A) Correct fallacy / cognitive hook explanation",
      "B) Plausible distractor option",
      "C) Another plausible distractor option"
    ],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this fallacy or assumption applies."
  },
  "hidden_counter_perspectives": [
    {
      "archetype": "Empirical Baseline or Statutory Law or Macro-Economic",
      "label": "First Counter-Perspective Title",
      "summary": "1-2 sentences summarizing verified counter-evidence or trade-offs that the media narrative omitted.",
      "citation": "Real academic, institutional, or empirical source (e.g. Pew Research, OECD, EU AI Act, Fraunhofer)"
    },
    {
      "archetype": "Macro-Economic or Socio-Ethical or Systemic Oversight",
      "label": "Second Counter-Perspective Title",
      "summary": "1-2 sentences presenting another angle or structural reality not mentioned in the clip.",
      "citation": "Institutional source or peer-reviewed study"
    }
  ],
  "socratic_dialogue": [
    "A deep probing Socratic question asking what unstated premises must be accepted for this narrative to hold?",
    "A question asking what localized variables or alternative hypotheses were omitted?"
  ]
}
Return only the raw JSON object. No markdown fences, no surrounding commentary.`;
  }

  async callGemini(contentPayload, apiKey) {
    if (!apiKey) throw new Error("No Gemini API key provided");
    const prompt = this.buildSystemPrompt(contentPayload);
    const url = `${this.geminiEndpoint}?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    return this.parseCleanJson(rawText);
  }

  async callGroq(contentPayload, apiKey) {
    if (!apiKey) throw new Error("No Groq API key provided");
    const prompt = this.buildSystemPrompt(contentPayload);

    const response = await fetch(this.groqEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error("Empty response from Groq");

    return this.parseCleanJson(rawText);
  }

  parseCleanJson(text) {
    let clean = text.trim();
    if (clean.startsWith("```json")) clean = clean.slice(7);
    if (clean.startsWith("```")) clean = clean.slice(3);
    if (clean.endsWith("```")) clean = clean.slice(0, -3);
    return JSON.parse(clean.trim());
  }

  async dispatchAnalysis(contentPayload, options = {}) {
    // 1. If user forced offline Demo Mode or browser is offline, use Tier 3 offline cache
    if (options.forceDemoMode || !navigator.onLine) {
      console.log("[CogniShield Bridge] ForceDemoMode enabled or offline. Using Tier 3 Offline Cache.");
      return { status: "OFFLINE_CACHE" };
    }

    // 2. Try Tier 1: Google Gemini 2.5 Flash
    if (options.geminiApiKey) {
      try {
        console.log("[CogniShield Bridge] Requesting Tier 1: Google Gemini Flash...");
        const result = await this.callGemini(contentPayload, options.geminiApiKey);
        return { status: "SUCCESS", tier: "Tier 1: Google Gemini Flash", data: result };
      } catch (geminiErr) {
        console.warn("[CogniShield Bridge] Gemini call failed or rate limited:", geminiErr.message);
      }
    }

    // 3. Fall back to Tier 2: Groq AI
    if (options.groqApiKey) {
      try {
        console.log("[CogniShield Bridge] Falling back to Tier 2: Groq AI...");
        const result = await this.callGroq(contentPayload, options.groqApiKey);
        return { status: "SUCCESS", tier: "Tier 2: Groq AI", data: result };
      } catch (groqErr) {
        console.warn("[CogniShield Bridge] Groq fallback failed:", groqErr.message);
      }
    }

    // 4. Fall back to Tier 3: Local Deterministic Offline Cache
    console.log("[CogniShield Bridge] AI APIs unavailable. Falling back to Tier 3 Deterministic Knowledge Graph.");
    return { status: "OFFLINE_CACHE" };
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AIBridge };
}
