import type { Rule } from "./types"

import { findMatchingRule, findRuleOfType, isUrlOnlyRule } from "./config"

// Re-export finder functions
export { findMatchingRule, findRuleOfType, isUrlOnlyRule }

/**
 * Check if a URL matches any rule
 */
export const hasMatchingRule = (url: string): boolean => {
  return findMatchingRule(url) !== null
}

/**
 * Get the type of rule that matches a URL (if any)
 */
export const getMatchingRuleType = (
  url: string
): Rule["type"] | null => {
  const rule = findMatchingRule(url)
  return rule?.type ?? null
}

