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
  "emotional_intensity": 0.0,
  "_scoring_note": "Set emotional_intensity to a float from 0.0 (completely calm, factual) to 10.0 (extreme outrage/panic/manipulation) based strictly on the provided text.",
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
      "summary": "1-2 sentences summarizing counter-evidence or trade-offs that the media narrative omitted.",
      "citation": "Real well-known institution or legal framework (e.g. EU AI Act, OECD, Pew Research) if known. If unsure, say 'Source not verified — explore further'. Never invent citations, institutions, or statistics."
    },
    {
      "archetype": "Macro-Economic or Socio-Ethical or Systemic Oversight",
      "label": "Second Counter-Perspective Title",
      "summary": "1-2 sentences presenting another angle or structural reality not mentioned in the clip.",
      "citation": "Real institution or 'Source not verified — explore further'"
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
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
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
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
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
    return `You are CogniShield, an epistemic dialectic search-query generator and recommendation inverter designed to break YouTube algorithmic echo chambers.
A user is watching a YouTube video titled:
"${videoTitle}"
Additional context:
"${(contextPayload || "").slice(0, 1500)}"

Identify the core stance and emotional/narrative framing of the current video, then generate EXACTLY 5 distinct, high-credibility counter-perspective video recommendations representing the polar opposite or balancing worldview.

Rules for Stance Inversion & Opposites:
1. Polar Opposite Inversion:
   - If the current video is NEGATIVE, ALARMIST, or PANIC-INDUCING (e.g. "AI will destroy all jobs", "Economic collapse imminent"): The 5 counter-videos MUST be CONSTRUCTIVE, EMPIRICAL, SOLUTION-ORIENTED, or HIGHLIGHTING OPPORTUNITIES & STABILITY.
   - If the current video is OVERLY PROMOTIONAL, HYPE, or UNCRITICAL PRAISE (e.g. "Get rich with crypto", "Why this technology is 100% flawless"): The 5 counter-videos MUST be SKEPTICAL, HIGHLIGHTING REAL RISKS, HIDDEN COSTS, ETHICAL CONCERNS, or STATISTICAL DOWNFALLS.
   - If PARTISAN or IDEOLOGICAL: The 5 counter-videos MUST present rigorous, respected counter-arguments from the other side or neutral academic/institutional analyses.
2. Natural, High-Recall Search Queries:
   - For each recommendation, generate a clean 4 to 8-word YouTube search query that real creators, researchers, and journalists actually use in titles.
   - DO NOT use boilerplate phrases like "counter argument to", "fact check", "rebuttal", or "the other side of".
   - Keep queries natural: no quotation marks, no boolean syntax (AND/OR), no punctuation, and no emojis.
3. Cover 5 Distinct Dialectic Archetypes across the 5 recommendations:
   - 1. Direct Counter-Thesis: Direct refutation or opposing viewpoint to the main claim.
   - 2. Empirical Baseline: Hard data, census statistics, peer-reviewed studies, or benchmark audits.
   - 3. Inverted Valence / Trade-Offs: Practical benefits (if video is a warning) OR risks & limits (if video is hype).
   - 4. Institutional & Regulatory: Law, statutory policy, EU/OECD directives, or court rulings.
   - 5. Longitudinal Precedent: Historical context, past economic transitions, or long-term structural realities.

Return a strictly valid JSON object matching this exact structure (never invent video durations, statistics, papers, or channel names):
{
  "detectedStance": "Short 3-6 word summary of this video's specific angle/narrative (e.g. AI Automation Panic & Career Doom)",
  "flippedStance": "Short 3-6 word summary of the balancing counter-narrative (e.g. Empirical Labor Demand & Human Agency)",
  "recommendations": [
    {
      "title": "Suggested counter-perspective topic representing the direct counter-thesis",
      "source": "Topic domain or public institution type (or 'Search suggestion' if unverified)",
      "archetype": "Direct Counter-Thesis",
      "badge": "Counter-Thesis (Search Suggestion)",
      "rationale": "One crisp sentence explaining how exploring this angle challenges the core premise.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. why AI won't replace software engineers)"
    },
    {
      "title": "Suggested empirical study topic or data angle",
      "source": "Empirical / Academic Search Topic",
      "archetype": "Empirical Baseline",
      "badge": "Empirical Data (Search Suggestion)",
      "rationale": "One crisp sentence describing what evidence or study data should be checked.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. economic impact of AI automation labor statistics)"
    },
    {
      "title": "Suggested trade-offs or inverted valence angle",
      "source": "Investigative / Analytical Topic",
      "archetype": "Systemic Trade-Offs",
      "badge": "Opportunity Analysis (Search Suggestion)",
      "rationale": "One crisp sentence explaining alternative opportunities or overlooked trade-offs.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. how AI changes engineering workflows and new roles)"
    },
    {
      "title": "Suggested legal, policy, or regulatory topic",
      "source": "Policy & Statutory Topic",
      "archetype": "Regulatory Framework",
      "badge": "Statutory Governance (Search Suggestion)",
      "rationale": "One crisp sentence explaining how regulations, standards, or institutional safeguards operate.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. government regulation AI workplace liability policy)"
    },
    {
      "title": "Suggested historical precedent topic",
      "source": "Historical & Structural Context",
      "archetype": "Historical Precedent",
      "badge": "Historical Context (Search Suggestion)",
      "rationale": "One crisp sentence explaining how previous technological or societal transitions unfolded.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. what happened when computers entered the workplace history)"
    }
  ]
}
Return only the raw JSON object. No markdown fences.`;
  }

  async generateFlipFeed(videoTitle, contextPayload = "", options = {}) {
    const isExplicitlyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
    if (options.forceDemoMode || isExplicitlyOffline) {
      return { status: "OFFLINE_FALLBACK" };
    }

    const prompt = this.buildFlipFeedPrompt(videoTitle, contextPayload);
    let rawResult = null;

    // 1. Try Gemini
    if (options.geminiApiKey) {
      const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
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
      const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
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

    // Enhance recommendations with REAL direct YouTube videos from search results!
    const recommendations = await Promise.all((rawResult.recommendations || []).map(async (r) => {
      const q = r.searchQuery || r.title;
      let realVideo = null;
      try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        const res = await fetch(searchUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });
        if (res.ok) {
          const html = await res.text();
          const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData = ({.*?});/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
            const itemSection = contents?.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
            const firstVideo = itemSection?.find(i => i.videoRenderer)?.videoRenderer;
            if (firstVideo && firstVideo.videoId) {
              realVideo = {
                videoId: firstVideo.videoId,
                title: firstVideo.title?.runs?.[0]?.text || r.title,
                channel: firstVideo.ownerText?.runs?.[0]?.text || r.source,
                duration: firstVideo.lengthText?.simpleText || r.duration,
                thumbnail: firstVideo.thumbnail?.thumbnails?.[0]?.url || ""
              };
            }
          }
        }
      } catch (_) {}

      if (realVideo && realVideo.videoId) {
        return {
          title: realVideo.title,
          source: realVideo.channel,
          archetype: r.archetype || "Counter-Perspective",
          duration: realVideo.duration || r.duration,
          badge: r.badge || "Suggested Video",
          rationale: r.rationale || "Counter-perspective challenging single-sided algorithmic recommendations.",
          searchUrl: `https://www.youtube.com/watch?v=${realVideo.videoId}`,
          thumbnail: realVideo.thumbnail,
          isRealWatchUrl: true
        };
      }

      return {
        ...r,
        badge: r.badge || "Search Suggestion",
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
      };
    }));

    return {
      status: "SUCCESS",
      data: {
        activeVideoTitle: videoTitle,
        detectedBias: rawResult.detectedBias || "neutral",
        sourcePerspective: rawResult.detectedStance || "Algorithmic Monoculture",
        counterStance: rawResult.flippedStance || "Empirical Counter-Perspectives",
        recommendations: recommendations,
        agencyRewardPoints: 5
      }
    };
  }

  async dispatchAnalysis(contentPayload, options = {}) {
    // 1. If user forced offline Demo Mode or browser is offline, use Tier 3 offline cache
    const isExplicitlyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
    if (options.forceDemoMode || isExplicitlyOffline) {
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
