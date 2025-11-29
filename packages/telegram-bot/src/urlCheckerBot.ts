/**
 * Bot-specific URL checking wrapper.
 * Loads database and provides checkUrlForBot function.
 * Fails fast if database is missing or empty.
 */

import {
  getMainDomain,
  getSelectorKey,
  findMatchingRule,
  extractSelector,
  findInDatabaseBySelector,
  findInDatabaseByDomain,
  formatResult,
  type FinalDBFileType,
  type UrlCheckResult,
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
 * Creates an .il domain hint result (platform-specific, not shared).
 * Each package can customize the hint text (e.g., with i18n).
 */
function createIlHint(domain: string): UrlCheckResult {
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

/**
 * Core URL checking logic (platform-agnostic).
 * Checks if a URL is flagged in the database.
 * Uses pure functions from common package.
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

  // Handle .il domains separately (platform-specific concern)
  if (domain.endsWith(".il")) {
    return createIlHint(domain);
  }

  // Use shared pure functions for rule matching
  const rule = findMatchingRule(url);

  if (rule) {
    const selector = extractSelector(url, rule);
    if (!selector) {
      return undefined;
    }

    const selectorKey = getSelectorKey(rule.domain, url);
    const findResult = findInDatabaseBySelector(
      selector,
      selectorKey,
      rule.domain,
      database
    );

    if (findResult) {
      return formatResult(findResult, selector, selectorKey);
    }
    return undefined;
  } else {
    // No matching rule, check by domain (website lookup)
    const findResult = findInDatabaseByDomain(domain, database);
    if (findResult) {
      return formatResult(findResult, domain, "ws");
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
