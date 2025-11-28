/**
 * Bot message templates.
 * All messages are defined as constants with strict typing.
 */

export const MESSAGES_BOT = {
  safe: "✓ This link appears to be safe",

  flagged: {
    header: "⚠️ Flagged",
    learnMore: "Learn more: https://the-wall.win",
  },

  hint: {
    header: "💡 Hint",
  },

  reasons: {
    h: "Headquarters is in Israel",
    f: "One or more founders are connected to Israel",
    i: "One or more investors are connected to Israel",
    u: "This URL ends with .il, This means it's an Israeli website!",
    b: "Listed on the BDS Boycott list",
  },

  help: {
    noUrl:
      "Please send me a URL to check. I can check if a link is safe or flagged.",
    usage: "Send me a URL or mention me in a group with a URL to check it.",
  },

  error: {
    invalidUrl: "Invalid URL format. Please send a valid URL.",
    checkFailed: "Failed to check URL. Please try again.",
  },
} as const;
