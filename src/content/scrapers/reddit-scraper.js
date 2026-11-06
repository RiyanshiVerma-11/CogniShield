/**
 * CogniShield - Reddit Post & Echo-Chamber Scraper
 * Extracts post title, selftext, community context (r/subreddit), and top comment counter-arguments.
 * Supports both modern Shreddit Web Components and standard Reddit markup.
 */

class RedditScraper {
  constructor() {
    this.platform = "Reddit";
  }

  isReddit() {
    return window.location.hostname.includes("reddit.com");
  }

  extractRedditContext() {
    if (!this.isReddit()) return null;

    let title = "";
    let selftext = "";
    let subreddit = "";
    const topComments = [];

    try {
      // 1. Subreddit Community Context
      const subEl = document.querySelector("a[href*='/r/'], shreddit-post[subreddit-prefixed-name]");
      if (subEl) {
        subreddit = subEl.getAttribute("subreddit-prefixed-name") || subEl.innerText.trim();
      }

      // 2. Post Title
      const titleEl = document.querySelector("h1, shreddit-post [slot='title'], [data-test-id='post-content'] h1");
      if (titleEl) {
        title = titleEl.innerText.trim();
      }

      // 3. Post Body / Selftext
      const bodyEl = document.querySelector("shreddit-post [slot='text-body'], [data-click-id='text'], .usertext-body");
      if (bodyEl) {
        selftext = bodyEl.innerText.trim().slice(0, 600);
      }

      // 4. Top Comments
      const commentNodes = document.querySelectorAll("shreddit-comment [slot='comment'], .Comment div[data-testid='comment']");
      commentNodes.forEach((node, idx) => {
        if (idx < 2) {
          const t = node.innerText.trim();
          if (t && t.length > 20) topComments.push(t.slice(0, 180));
        }
      });
    } catch (e) {
      console.warn("[CogniShield] Reddit scraper error:", e);
    }

    const combinedPayload = [
      subreddit ? `[Community]: ${subreddit}` : "",
      title ? `[Post Title]: ${title}` : "",
      selftext ? `[Content]: ${selftext}` : "",
      topComments.length > 0 ? `[Top Comments]: ${topComments.join(" | ")}` : ""
    ].filter(Boolean).join("\n");

    return {
      platform: "Reddit",
      subreddit,
      title,
      selftext,
      topComments,
      textPayload: combinedPayload || document.title
    };
  }
}

// Export for browser and node environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { RedditScraper };
} else {
  window.CogniShieldReddit = new RedditScraper();
}

