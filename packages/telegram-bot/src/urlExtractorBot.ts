/**
 * URL extraction from text messages.
 * Strict validation, no fallbacks - returns null if no valid URL found.
 */

import LinkifyIt from "linkify-it";

// Initialize linkify-it instance
const linkify = new LinkifyIt();

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

  // Find all links in the text
  const matches = linkify.match(text);

  if (!matches || matches.length === 0) {
    return null;
  }

  // Get the first match
  const firstMatch = matches[0];

  if (!firstMatch || !firstMatch.url) {
    return null;
  }

  let url = firstMatch.url.trim();

  // Remove trailing punctuation
  url = url.replace(/[.,;:!?]+$/, "");

  // Add protocol if missing (for domain-only URLs)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    // Only add protocol if it looks like a domain
    if (/^[a-zA-Z0-9]/.test(url)) {
      url = `https://${url}`;
    } else {
      return null; // Doesn't look like a valid domain
    }
  }

  // Basic URL validation
  try {
    new URL(url);
    return url;
  } catch {
    // Invalid URL
    return null;
  }
}
