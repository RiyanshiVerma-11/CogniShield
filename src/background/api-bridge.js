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

  /**
   * Detects if a video is celebrity/influencer/drama content.
   * These topics need different counter-perspective archetypes vs. academic/policy topics.
   */
  detectContentType(videoTitle, context = "") {
    const combined = (videoTitle + " " + context).toLowerCase();
    const influencerSignals = [
      "vlog", "controversy", "drama", "exposed", "cancelled", "beef", "clout",
      "reacts", "reaction", "storytime", "tea", "gossip", "relationship",
      "breakup", "cheating", "family", "boyfriend", "girlfriend", "toxic",
      "influencer", "youtuber", "streamer", "tiktok", "instagram", "collab",
      "roast", "callout", "apology", "canceled", "receipts", "shade"
    ];
    const matchCount = influencerSignals.filter(s => combined.includes(s)).length;
    return matchCount >= 2 ? "influencer_drama" : "structured_discourse";
  }

  buildFlipFeedPrompt(videoTitle, contextPayload = "") {
    const contentType = this.detectContentType(videoTitle, contextPayload);
    const isInfluencerDrama = contentType === "influencer_drama";

    // For influencer/celebrity drama, use socio-cultural archetypes anchored to the specific video context
    const archetypeBlock = isInfluencerDrama ? `
3. Cover 5 Distinct Socio-Cultural Archetypes (since this is creator/influencer content).
   CRITICAL RULE — Each recommendation must be BOTH:
   a) BROAD: rooted in a universal theme (parasocial dynamics, platform incentives, media literacy, accountability culture).
   b) SPECIFIC: the searchQuery must reference the core context/theme of the video (e.g. if family conflict: "family loyalty influencer public drama psychology"; if cheating/betrayal: "trust betrayal public figures parasocial fans").
   NEVER use the creator's name or specific person's name in any searchQuery.
   - 1. Platform Incentives: How platforms structurally profit from THIS TYPE of personal drama content.
   - 2. Parasocial & Fan Psychology: What emotionally draws fans to follow THIS KIND of personal conflict.
   - 3. Accountability vs. Mob Culture: Nuanced debate about online accountability for THIS CATEGORY of behavior.
   - 4. Creator Economy: How THIS TYPE of content is algorithmically rewarded and monetized.
   - 5. Media Literacy: How to critically consume and not be emotionally manipulated by THIS KIND of viral content.` : `
3. Cover 5 Distinct Dialectic Archetypes across the 5 recommendations:
   - 1. Direct Counter-Thesis: Direct refutation or opposing viewpoint to the main claim.
   - 2. Empirical Baseline: Hard data, census statistics, peer-reviewed studies, or benchmark audits.
   - 3. Inverted Valence / Trade-Offs: Practical benefits (if video is a warning) OR risks & limits (if video is hype).
   - 4. Institutional & Regulatory: Law, statutory policy, EU/OECD directives, or court rulings.
   - 5. Longitudinal Precedent: Historical context, past economic transitions, or long-term structural realities.`;

    return `You are CogniShield, an epistemic dialectic search-query generator and recommendation inverter designed to break YouTube algorithmic echo chambers.
A user is watching a YouTube video titled:
"${videoTitle}"
Additional context:
"${(contextPayload || "").slice(0, 1500)}"
Content type detected: ${isInfluencerDrama ? "INFLUENCER/CREATOR DRAMA" : "STRUCTURED DISCOURSE"}

Identify the core stance and emotional/narrative framing of the current video, then generate EXACTLY 5 distinct, high-credibility counter-perspective video recommendations representing the polar opposite or balancing worldview.

Rules for Stance Inversion & Opposites:
1. Polar Opposite Inversion:
   - If the current video is NEGATIVE, ALARMIST, or PANIC-INDUCING (e.g. "AI will destroy all jobs", "Economic collapse imminent"): The 5 counter-videos MUST be CONSTRUCTIVE, EMPIRICAL, SOLUTION-ORIENTED, or HIGHLIGHTING OPPORTUNITIES & STABILITY.
   - If the current video is OVERLY PROMOTIONAL, HYPE, or UNCRITICAL PRAISE (e.g. "Get rich with crypto", "Why this technology is 100% flawless"): The 5 counter-videos MUST be SKEPTICAL, HIGHLIGHTING REAL RISKS, HIDDEN COSTS, ETHICAL CONCERNS, or STATISTICAL DOWNFALLS.
   - If PARTISAN or IDEOLOGICAL: The 5 counter-videos MUST present rigorous, respected counter-arguments from the other side or neutral academic/institutional analyses.
   - If INFLUENCER/CREATOR DRAMA: DO NOT generate more drama. Generate broader socio-cultural, psychological, and media literacy perspectives.
2. Natural, High-Recall Search Queries:
   - For each recommendation, generate a clean 4 to 8-word YouTube search query that real creators, researchers, and journalists actually use in titles.
   - STRICT RULE: NEVER include phrases like "counter argument", "alternative perspective", "opposing view", "fact check", "rebuttal", "the other side of", or any meta-commentary in the searchQuery field.
   - Keep queries natural: no quotation marks, no boolean syntax (AND/OR), no punctuation, and no emojis.
   - If content is influencer/creator drama: NEVER use the creator's name or the specific controversy in the searchQuery. Use broad thematic concepts instead.
${archetypeBlock}

Return a strictly valid JSON object matching this exact structure:
{
  "detectedStance": "Short 3-6 word summary of this video's specific angle/narrative (e.g. AI Automation Panic & Career Doom)",
  "flippedStance": "Short 3-6 word summary of the balancing counter-narrative (e.g. Empirical Labor Demand, New Roles & Human Agency)",
  "recommendations": [
    {
      "title": "Natural YouTube video title representing the direct counter-thesis",
      "source": "Respected publication, expert creator, or institutional channel",
      "archetype": "Direct Counter-Thesis",
      "duration": "14 min",
      "badge": "Counter-Thesis",
      "rationale": "One crisp sentence explaining how this directly rebuts the core premise.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. why AI won't replace software engineers)"
    },
    {
      "title": "Natural YouTube video title presenting empirical data or statistics",
      "source": "Respected economic/academic source (e.g. Pew Research, OECD, MIT)",
      "archetype": "Empirical Baseline",
      "duration": "16 min",
      "badge": "Empirical Data",
      "rationale": "One crisp sentence highlighting verifiable statistics or study results.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. real economic impact of AI automation labor statistics)"
    },
    {
      "title": "Natural YouTube video title presenting inverted valence and trade-offs",
      "source": "Respected documentary or investigative channel (e.g. Bloomberg, CNBC, Vox)",
      "archetype": "Systemic Trade-Offs",
      "duration": "18 min",
      "badge": "Opportunity Analysis",
      "rationale": "One crisp sentence explaining the positive opportunities or overlooked advantages.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. how AI is creating new tech jobs)"
    },
    {
      "title": "Natural YouTube video title presenting legal, policy, or regulatory realities",
      "source": "Legal or governance think-tank (e.g. Brookings, CSIS, European Law Review)",
      "archetype": "Regulatory Framework",
      "duration": "15 min",
      "badge": "Statutory Governance",
      "rationale": "One crisp sentence explaining how regulations, standards, or institutional safeguards operate.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. government regulation AI workplace liability policy)"
    },
    {
      "title": "Natural YouTube video title presenting longitudinal historical precedents",
      "source": "Historical or systemic analyst (e.g. Stanford History, Kurzgesagt, Real Engineering)",
      "archetype": "Historical Precedent",
      "duration": "20 min",
      "badge": "Historical Context",
      "rationale": "One crisp sentence explaining how previous technological or societal transitions unfolded.",
      "searchQuery": "4 to 8 word natural YouTube search query (e.g. what happened when computers first entered the workplace history)"
    }
  ]
}
Return only the raw JSON object. No markdown fences.`;
  }

  async generateFlipFeed(videoTitle, contextPayload = "", options = {}) {
    if (options.forceDemoMode || (typeof navigator !== "undefined" && navigator.onLine === false)) {
      return { status: "OFFLINE_FALLBACK" };
    }

    const prompt = this.buildFlipFeedPrompt(videoTitle, contextPayload);
    let rawResult = null;

    // 1. Try Gemini (with 3.5s timeout per model to prevent UI lag on overload)
    if (options.geminiApiKey) {
      const models = ["gemini-3.8-flash", "gemini-flash-latest"];
      for (const model of models) {
        try {
          const url = `${this.geminiBase}/${model}:generateContent?key=${options.geminiApiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(3500),
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
          console.warn(`[CogniShield FlipFeed] Gemini ${model} failed or timed out:`, e.message);
        }
      }
    }

    // 2. Fall back to Groq (qwen/qwen3.8-27b is ultra-fast and reliable for JSON output)
    if (!rawResult && options.groqApiKey) {
      const models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
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

    // --- Post-process: Sanitize search queries ---
    // 1. Strip boilerplate meta-phrases that confuse YouTube's search engine.
    // 2. Strip the verbatim video title if AI echoed it into the searchQuery
    //    (common failure mode: "FULL TITLE counter argument alternative perspective").
    const META_PHRASE_BLOCKLIST = [
      "counter argument", "counterargument", "alternative perspective",
      "opposing view", "other side", "fact check", "fact-check",
      "rebuttal", "debunked", "refutation", "critical analysis of",
      "against the idea", "challenges the claim", "response to"
    ];
    // Build a normalised lower-case version of the video title for substring detection
    const normTitle = videoTitle.toLowerCase().replace(/[^\w\s]/g, "").trim();
    if (rawResult.recommendations) {
      rawResult.recommendations = rawResult.recommendations.map(r => {
        if (!r.searchQuery) return r;
        let q = r.searchQuery;

        // Strip meta-phrases
        META_PHRASE_BLOCKLIST.forEach(phrase => {
          const regex = new RegExp(phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
          q = q.replace(regex, "").trim();
        });

        // Strip verbatim video title (or long leading chunk of it) from the query.
        // If the query starts with or contains 6+ consecutive words from the title, it's noise.
        if (normTitle.length > 10) {
          const titleWords = normTitle.split(/\s+/).filter(Boolean);
          // Check if the first 6 words of the title appear at the start of the query (case-insensitive)
          if (titleWords.length >= 6) {
            const prefix = titleWords.slice(0, 6).join(" ");
            const qLow = q.toLowerCase().replace(/[^\w\s]/g, "").trim();
            if (qLow.startsWith(prefix)) {
              // Strip everything up to and including that prefix, keep the remainder
              const afterPrefix = q.slice(prefix.length).trim();
              q = afterPrefix || q; // fallback to original if stripping leaves nothing
            }
          }
        }

        // Clean up double spaces and trailing punctuation left by removals
        q = q.replace(/\s{2,}/g, " ").replace(/^[\s,]+|[\s,]+$/g, "").trim();
        // If sanitization left the query too short (<3 words), use rec title keywords
        if (q.split(" ").filter(Boolean).length < 3) {
          q = r.title || videoTitle;
        }
        // Final cap: YouTube search query should be at most 8 words
        const words = q.split(/\s+/).filter(Boolean);
        if (words.length > 8) q = words.slice(0, 8).join(" ");
        return { ...r, searchQuery: q };
      });
    }

    // Enhance recommendations with REAL YouTube videos using YouTube Data API v3
    // (Replaces brittle ytInitialData HTML scraping which is CORS-blocked in MV3 service workers)
    const recommendations = await Promise.all((rawResult.recommendations || []).map(async (r) => {
      const q = r.searchQuery || r.title;
      let realVideo = null;

      // --- YouTube Data API v3 (reliable structured JSON, CORS-safe from MV3 service worker) ---
      if (options.youtubeApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${options.youtubeApiKey}`;
          const res = await fetch(apiUrl);
          if (res.ok) {
            const data = await res.json();
            const item = data.items?.[0];
            if (item && item.id?.videoId) {
              const videoId = item.id.videoId;
              const snippet = item.snippet;
              realVideo = {
                videoId,
                title: snippet.title || r.title,
                channel: snippet.channelTitle || r.source,
                duration: r.duration, // refined below via Videos API
                thumbnail: snippet.thumbnails?.high?.url
                  || snippet.thumbnails?.medium?.url
                  || snippet.thumbnails?.default?.url
                  || ""
              };

              // Fetch exact duration from Videos API (single additional call per video)
              try {
                const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${options.youtubeApiKey}`;
                const vRes = await fetch(videoUrl);
                if (vRes.ok) {
                  const vData = await vRes.json();
                  const iso = vData.items?.[0]?.contentDetails?.duration || "";
                  // Convert ISO 8601 (e.g. PT14M32S) → "14 min"
                  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                  if (match) {
                    const h = parseInt(match[1] || 0);
                    const m = parseInt(match[2] || 0);
                    realVideo.duration = h > 0 ? `${h}h ${m}m` : `${m} min`;
                  }
                }
              } catch (_) { /* duration stays as AI estimate */ }
            }
          }
        } catch (e) {
          console.warn("[CogniShield FlipFeed] YouTube Data API v3 failed:", e.message);
        }
      }

      if (realVideo && realVideo.videoId) {
        return {
          title: realVideo.title,
          source: realVideo.channel,
          archetype: r.archetype || "Verified Perspective",
          duration: realVideo.duration || r.duration,
          badge: r.badge || "Verified Perspective",
          rationale: r.rationale || "Counter-perspective challenging single-sided algorithmic recommendations.",
          searchUrl: `https://www.youtube.com/watch?v=${realVideo.videoId}`,
          thumbnail: realVideo.thumbnail,
          isRealWatchUrl: true
        };
      }

      // Graceful fallback: show a YouTube search page link when no API key or API quota exceeded
      return {
        ...r,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
        isRealWatchUrl: false
      };
    }));

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
