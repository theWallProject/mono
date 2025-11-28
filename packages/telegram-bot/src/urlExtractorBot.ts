/**
 * URL extraction from text messages.
 * Strict validation, no fallbacks - returns null if no valid URL found.
 */

/**
 * Extracts the first valid URL from text.
 * Supports URLs with or without protocol.
 * @param text - Text to extract URL from
 * @returns Extracted URL or null if none found
 * @throws Error on unexpected failures (not on "no URL found")
 */
export function extractUrlFromTextBot(text: string): string | null {
  if (!text || typeof text !== "string") {
    throw new Error(`Invalid text input: ${text}`);
  }

  // Regex pattern for URLs:
  // - http:// or https:// URLs
  // - URLs without protocol (domain.tld with optional path)
  // - Handles markdown links [text](url) and <url>
  const urlPatterns = [
    // Full URLs with protocol
    /https?:\/\/[^\s<>"']+/gi,
    // Markdown links: [text](url)
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi,
    // HTML-style links: <url>
    /<https?:\/\/[^\s>]+>/gi,
    // URLs without protocol (domain.tld format)
    /(?:^|\s)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\/[^\s<>"']*)?)/gi,
  ];

  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Get first match and clean it up
      let url = matches[0]?.trim() ?? "";

      // Remove markdown/HTML brackets if present
      url = url.replace(/^\[([^\]]+)\]\(/, "").replace(/^<|>$/g, "");

      // Remove trailing punctuation
      url = url.replace(/[.,;:!?]+$/, "");

      // Add protocol if missing (for domain-only URLs)
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        // Only add protocol if it looks like a domain
        if (/^[a-zA-Z0-9]/.test(url)) {
          url = `https://${url}`;
        } else {
          continue; // Skip if doesn't look like a valid domain
        }
      }

      // Basic URL validation
      try {
        new URL(url);
        return url;
      } catch {
        // Invalid URL, try next pattern
        continue;
      }
    }
  }

  return null;
}
