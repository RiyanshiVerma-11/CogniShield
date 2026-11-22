/**
 * CogniShield - Multi-Tier Hybrid AI Dispatcher
 * Tier 1: Google Gemini 2.5 Flash (Primary Live LLM)
 * Tier 2: Groq GPT-OSS / Llama (Failover Live LLM on 429/Timeout)
 * Tier 3: Local Deterministic Offline Knowledge Graph (Zero-Network Safe Fallback)
 */

export class AIBridge {
  constructor() {
    this.geminiBase = "https://generativelanguage.googleapis.com/v1beta/models";
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
    const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let lastError = null;

    for (const model of models) {
      try {
        const url = `${this.geminiBase}/${model}:generateContent?key=${apiKey}`;
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
          throw new Error(`Gemini ${model} Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error(`Empty response from Gemini ${model}`);

        return this.parseCleanJson(rawText);
      } catch (err) {
        lastError = err;
        console.warn(`[CogniShield Bridge] Gemini model ${model} failed:`, err.message);
      }
    }

    throw lastError || new Error("All Gemini models failed");
  }

  async callGroq(contentPayload, apiKey) {
    if (!apiKey) throw new Error("No Groq API key provided");
    const prompt = this.buildSystemPrompt(contentPayload);
    const models = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "openai/gpt-oss-120b"];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(this.groqEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq ${model} Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (!rawText) throw new Error(`Empty response from Groq ${model}`);

        return this.parseCleanJson(rawText);
      } catch (err) {
        lastError = err;
        console.warn(`[CogniShield Bridge] Groq model ${model} failed:`, err.message);
      }
    }

    throw lastError || new Error("All Groq models failed");
  }

  parseCleanJson(text) {
    let clean = text.trim();
    if (clean.startsWith("```json")) clean = clean.slice(7);
    if (clean.startsWith("```")) clean = clean.slice(3);
    if (clean.endsWith("```")) clean = clean.slice(0, -3);
    return JSON.parse(clean.trim());
  }

  buildFlipFeedPrompt(videoTitle, contextPayload = "") {
    return `You are CogniShield, an epistemic cognitive copilot that inverts recommendation algorithms and breaks filter bubbles.
A user is watching a YouTube video titled:
"${videoTitle}"
Additional context:
"${(contextPayload || "").slice(0, 1500)}"

Analyze this video and generate 3 realistic, specific, verified counter-perspective video recommendations that present the legitimate alternative viewpoints, institutional empirical studies, or regulatory/economic realities that the current video's framing omits or downplays.

Return a strictly valid JSON object matching this exact structure:
{
  "detectedStance": "Short 3-6 word summary of this video's specific angle/narrative (e.g. Street Protests & Outrage Against Education Policy)",
  "flippedStance": "Short 3-6 word summary of the balancing counter-narrative (e.g. Government Policy Reforms, Investigation Findings & Global Norms)",
  "recommendations": [
    {
      "title": "A realistic, high-value documentary or investigative video title representing a verified counter-argument",
      "source": "A real, respected publication or institutional channel (e.g. The Print, Rajya Sabha TV, DW Analysis, Ministry Briefing, Carnegie India, PRS Legislative, OECD)",
      "archetype": "Regulatory Framework / Empirical Data / Historical Precedent / Institutional Review",
      "duration": "14 min",
      "badge": "Verified Analysis",
      "rationale": "One crisp sentence explaining specifically how this balances the narrative of the current video.",
      "searchQuery": "Targeted search keywords on YouTube to find this counter-perspective (e.g. India education examination paper leak reforms law analysis)"
    },
    {
      "title": "Second counter-perspective video title focusing on economic or systemic realities",
      "source": "Respected economic/academic source",
      "archetype": "Economic Trade-Offs",
      "duration": "18 min",
      "badge": "Alternative Viewpoint",
      "rationale": "One crisp sentence explaining the structural or systemic context omitted.",
      "searchQuery": "Targeted search keywords on YouTube"
    },
    {
      "title": "Third counter-perspective video title focusing on long-term precedents or policy solutions",
      "source": "Policy or historical think-tank source",
      "archetype": "Systemic Governance",
      "duration": "16 min",
      "badge": "Longitudinal Context",
      "rationale": "One crisp sentence explaining the historical or legislative solutions.",
      "searchQuery": "Targeted search keywords on YouTube"
    }
  ]
}
Return only the raw JSON object. No markdown fences.`;
  }

  async generateFlipFeed(videoTitle, contextPayload = "", options = {}) {
    if (options.forceDemoMode || !navigator.onLine) {
      return { status: "OFFLINE_FALLBACK" };
    }

    const prompt = this.buildFlipFeedPrompt(videoTitle, contextPayload);
    let rawResult = null;

    // 1. Try Gemini
    if (options.geminiApiKey) {
      const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
      for (const model of models) {
        try {
          const url = `${this.geminiBase}/${model}:generateContent?key=${options.geminiApiKey}`;
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
          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              rawResult = this.parseCleanJson(text);
              break;
            }
          }
        } catch (e) {
          console.warn(`[CogniShield FlipFeed] Gemini ${model} failed:`, e.message);
        }
      }
    }

    // 2. Fall back to Groq
    if (!rawResult && options.groqApiKey) {
      const models = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "openai/gpt-oss-120b"];
      for (const model of models) {
        try {
          const response = await fetch(this.groqEndpoint, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${options.groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              response_format: { type: "json_object" }
            })
          });
          if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              rawResult = this.parseCleanJson(text);
              break;
            }
          }
        } catch (e) {
          console.warn(`[CogniShield FlipFeed] Groq ${model} failed:`, e.message);
        }
      }
    }

    if (!rawResult) {
      return { status: "OFFLINE_FALLBACK" };
    }

    // Ensure recommendations have working YouTube search URLs
    const recommendations = (rawResult.recommendations || []).map(r => {
      const q = r.searchQuery || r.title;
      return {
        ...r,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
      };
    });

    return {
      status: "SUCCESS",
      data: {
        activeVideoTitle: videoTitle,
        detectedBias: "outrage_polarization",
        sourcePerspective: rawResult.detectedStance || "Algorithmic Monoculture",
        counterStance: rawResult.flippedStance || "Empirical Counter-Perspectives",
        recommendations: recommendations,
        agencyRewardPoints: 5
      }
    };
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
