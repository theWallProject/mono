/**
 * Bot-specific URL checking wrapper.
 * Loads database and provides checkUrlForBot function.
 * Fails fast if database is missing or empty.
 */

import {
  CONFIG,
  getMainDomain,
  type FinalDBFileType,
  type SpecialDomains,
  type APIListOfReasonsValues,
} from "@theWallProject/common";
import ALL from "../db/ALL.json";

// Validate database at module level - fail immediately if invalid
const database = ALL as unknown;

if (!Array.isArray(database)) {
  throw new Error("Database file is not an array");
}

if (database.length === 0) {
  throw new Error("Database is empty");
}

const typedDatabase = database as FinalDBFileType[];

/**
 * Link field type (bot-specific, not shared).
 */
export type LinkField =
  | "ws"
  | "li"
  | "fb"
  | "tw"
  | "ig"
  | "gh"
  | "ytp"
  | "ytc"
  | "tt"
  | "th"
  | "il";

/**
 * Platform-agnostic URL check result (without dismissal tracking).
 */
export type UrlCheckResult =
  | {
      isHint: true;
      name: string;
      hintText: string;
      hintUrl: string;
      rule: {
        selector: string;
        key: LinkField;
      };
    }
  | {
      isHint?: false | undefined;
      reasons: APIListOfReasonsValues[];
      name: string;
      alt?: {n: string; ws: string}[];
      stockSymbol?: string;
      rule: {
        selector: string;
        key: LinkField;
      };
    }
  | undefined;

/**
 * Gets the selector key (database field name) for a given domain.
 * @throws Error if domain is unexpected or URL is required but missing
 */
function getSelectorKey(domain: SpecialDomains, url?: string): LinkField {
  switch (domain) {
    case "facebook.com":
      return "fb";
    case "twitter.com":
    case "x.com":
      return "tw";
    case "linkedin.com":
      return "li";
    case "instagram.com":
      return "ig";
    case "github.com":
      return "gh";
    case "youtube.com": {
      if (!url) {
        throw new Error(
          "getSelectorKey: url is required for youtube.com domain"
        );
      }
      if (url.includes("/channel/")) {
        return "ytc";
      }
      if (url.includes("/@")) {
        return "ytp";
      }
      return "ytp";
    }
    case "tiktok.com":
      return "tt";
    case "threads.com":
      return "th";
    default: {
      throw new Error(`getSelectorKey: unexpected domain ${domain}`);
    }
  }
}

/**
 * Core URL checking logic (platform-agnostic).
 * Checks if a URL is flagged in the database.
 * @param url - The URL to check
 * @param database - The database array to search
 * @returns UrlCheckResult or undefined if URL is safe
 */
function checkUrl(
  url: string,
  database: FinalDBFileType[]
): UrlCheckResult | undefined {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid URL: ${url}`);
  }

  const domain = getMainDomain(url);

  if (domain.endsWith(".il")) {
    return {
      isHint: true,
      name: "Israeli Website",
      hintText: "Psst, this is an Israeli website.",
      hintUrl: "https://the-wall.win",
      rule: {
        selector: domain,
        key: "il",
      },
    };
  }

  // Normalize URL by removing www. prefix for regex matching
  const normalizedUrl = url.replace(/^(https?:\/\/)www\./i, "$1");

  const ruleForDomain = CONFIG.rules.find((rule) => {
    // Use case-insensitive flag for YouTube, Twitter, LinkedIn
    const flags =
      rule.domain === "youtube.com" ||
      rule.domain === "twitter.com" ||
      rule.domain === "linkedin.com"
        ? "i"
        : "";
    const ruleRegex = new RegExp(rule.regex, flags);
    return ruleRegex.test(normalizedUrl);
  });

  if (ruleForDomain) {
    // Use case-insensitive flag for YouTube, Twitter, LinkedIn
    const flags =
      ruleForDomain.domain === "youtube.com" ||
      ruleForDomain.domain === "twitter.com" ||
      ruleForDomain.domain === "linkedin.com"
        ? "i"
        : "";
    const regex = new RegExp(ruleForDomain.regex, flags);
    const results = regex.exec(normalizedUrl);
    // For YouTube, the regex has multiple capture groups - use the first non-undefined one
    // Groups: 1=user/, 2=c/@?, 3=@, 4=direct
    const selector =
      results &&
      (results[1] || results[2] || results[3] || results[4] || results[1]);

    if (selector) {
      const selectorKey = getSelectorKey(ruleForDomain.domain, normalizedUrl);

      const findResult = database.find((row) => {
        // "il" is not a database field, skip database lookup for .il domains
        if (selectorKey === "il") {
          return false;
        }
        const dbValue = row[selectorKey as keyof FinalDBFileType];
        if (!dbValue || typeof dbValue !== "string") {
          return false;
        }

        // Normalize: strip @ prefix from both values
        // For YouTube, Twitter, LinkedIn: also compare case-insensitively
        const normalizedDbValue = dbValue.replace(/^@/i, "");
        const normalizedSelector = selector.replace(/^@/i, "");

        // Case-insensitive comparison for YouTube, Twitter, LinkedIn
        const isCaseInsensitive =
          ruleForDomain.domain === "youtube.com" ||
          ruleForDomain.domain === "twitter.com" ||
          ruleForDomain.domain === "linkedin.com";

        return isCaseInsensitive
          ? normalizedDbValue.toLowerCase() === normalizedSelector.toLowerCase()
          : normalizedDbValue === normalizedSelector;
      });

      if (findResult) {
        // Check if this is a hint entry
        if (findResult.hint && findResult.hintText) {
          return {
            isHint: true,
            name: findResult.n,
            hintText: findResult.hintText,
            hintUrl: findResult.hintUrl || "",
            rule: {
              selector,
              key: getSelectorKey(ruleForDomain.domain, normalizedUrl),
            },
          };
        }

        return {
          reasons: findResult.r,
          name: findResult.n,
          alt: findResult.alt,
          stockSymbol: findResult.s,
          rule: {
            selector,
            key: getSelectorKey(ruleForDomain.domain, normalizedUrl),
          },
        };
      }
      return undefined;
    }
    return undefined;
  } else {
    const findResult = database.find((row) => row.ws === domain);

    if (findResult) {
      // Check if this is a hint entry
      if (findResult.hint && findResult.hintText) {
        return {
          isHint: true,
          name: findResult.n,
          hintText: findResult.hintText,
          hintUrl: findResult.hintUrl || "",
          rule: {
            selector: domain,
            key: "ws",
          },
        };
      }

      return {
        reasons: findResult.r,
        name: findResult.n,
        alt: findResult.alt,
        stockSymbol: findResult.s,
        rule: {
          selector: domain,
          key: "ws",
        },
      };
    }
  }

  return undefined;
}

/**
 * Checks a URL against the bot's database.
 * @param url - URL to check
 * @returns UrlCheckResult or undefined if safe
 * @throws Error if URL is invalid
 */
export function checkUrlForBot(url: string): UrlCheckResult | undefined {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid URL: ${url}`);
  }

  return checkUrl(url, typedDatabase);
}
