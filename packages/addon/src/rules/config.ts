import { log } from "../helpers"
import type { Rule, RuleOfType } from "./types"

/**
 * Unified configuration for all rule types
 * Single source of truth with discriminated unions for type safety
 */
export const RULES = [
  // YouTube: extract channel URL from watch/shorts pages
  {
    type: "urlDomFull",
    id: "youtube_channel",
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(watch|shorts)/,
    linkSelector: "ytd-channel-name a",
    linkAttribute: "href"
  },

  // LinkedIn: extract company URL from job detail pane
  {
    type: "urlDomFull",
    id: "linkedin_job_processing",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/jobs\//,
    linkSelector: "div[aria-label^='Company,'] a",
    linkAttribute: "href"
  }
] satisfies Rule[]

/**
 * Find matching rule for a URL
 * Returns first matching specific rule (urlDomFull) or null
 * If null, the URL should be treated as urlOnly (default fallback)
 */
export const findMatchingRule = (url: string): Rule | null => {
  for (const rule of RULES) {
    if (rule.urlPattern.test(url)) {
      log(`[Rules] Found matching rule for URL: ${url}`)
      return rule
    }
  }
  return null
}

/**
 * Check if a URL should be treated as URL-only (default fallback)
 * This is true when no specific DOM-based rule matches
 */
export const isUrlOnlyRule = (url: string): boolean => {
  return findMatchingRule(url) === null
}

/**
 * Type guard to check if a rule matches a specific type
 */
function isRuleOfType<T extends Rule["type"]>(rule: Rule | null, type: T): rule is RuleOfType<T> {
  return rule !== null && rule.type === type
}

/**
 * Find rule of a specific type
 * Type-safe helper that narrows the return type
 */
export function findRuleOfType<T extends Rule["type"]>(url: string, type: T): RuleOfType<T> | null {
  const rule = findMatchingRule(url)
  return isRuleOfType(rule, type) ? rule : null
}
