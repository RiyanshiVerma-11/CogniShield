/**
 * CogniShield - Local API Configuration Template
 * 
 * To use live Gemini or Groq AI analysis locally:
 * 1. Copy this file to `src/config/keys.local.js`
 * 2. Paste your API keys below
 * 
 * Note: `*.local.js` is gitignored to guarantee zero credential leaks.
 */

export const LOCAL_AI_KEYS = {
  geminiApiKey: "your_gemini_api_key_here",
  groqApiKey: "your_groq_api_key_here",
  // YouTube Data API v3 key — required for Flip the Feed to show real video thumbnails,
  // channel names, and direct watch links (instead of search result pages).
  // Get a free key at: https://console.cloud.google.com/
  //   1. Enable "YouTube Data API v3" in your project
  //   2. Create an API key under Credentials
  //   3. Restrict it to "YouTube Data API v3" for security
  youtubeApiKey: "your_youtube_data_api_v3_key_here"
};
