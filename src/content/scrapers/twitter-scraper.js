/**
 * CogniShield - X / Twitter Feed & Thread Scraper
 * Extracts tweet body, author context, quote tweets, and thread replies.
 * Runs client-side in sub-20ms with zero network overhead.
 */

class TwitterScraper {
  constructor() {
    this.platform = "Twitter/X";
  }

  isTwitter() {
    return window.location.hostname.includes("twitter.com") || window.location.hostname.includes("x.com");
  }

  /**
   * Extracts focal tweet and surrounding discussion context
   */
  extractTweetContext() {
    if (!this.isTwitter()) return null;

    let focalTweetText = "";
    let authorHandle = "";
    let quoteTweetText = "";
    const replies = [];

    try {
      // 1. Focal Tweet text selector
      const tweetNodes = document.querySelectorAll("article [data-testid='tweetText']");
      if (tweetNodes.length > 0) {
        focalTweetText = tweetNodes[0].innerText.trim();
      }

      // 2. Author handle
      const userNode = document.querySelector("article [data-testid='User-Name']");
      if (userNode) {
        authorHandle = userNode.innerText.replace(/\n/g, " ").trim();
      }

      // 3. Quote Tweet context if present
      const quoteNode = document.querySelector("article [role='link'] [data-testid='tweetText']");
      if (quoteNode && quoteNode !== tweetNodes[0]) {
        quoteTweetText = quoteNode.innerText.trim();
      }

      // 4. Top reply arguments (up to 2 replies for context)
      for (let i = 1; i < Math.min(tweetNodes.length, 3); i++) {
        const replyText = tweetNodes[i].innerText.trim();
        if (replyText) replies.push(replyText.slice(0, 150));
      }
    } catch (e) {
      console.warn("[CogniShield] Twitter scrape error:", e);
    }

    const combinedPayload = [
      focalTweetText,
      quoteTweetText ? `[Quote]: ${quoteTweetText}` : "",
      replies.length > 0 ? `[Replies]: ${replies.join(" | ")}` : ""
    ].filter(Boolean).join("\n");

    return {
      platform: "Twitter/X",
      author: authorHandle,
      focalTweet: focalTweetText,
      quoteTweet: quoteTweetText,
      replies,
      textPayload: combinedPayload || document.title
    };
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TwitterScraper };
} else {
  window.CogniShieldTwitter = new TwitterScraper();
}

