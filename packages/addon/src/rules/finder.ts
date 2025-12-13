import { findMatchingRule, findRuleOfType, isUrlOnlyRule } from "./config"
import type { Rule } from "./types"

// Re-export finder functions
export { findMatchingRule, findRuleOfType, isUrlOnlyRule }

/**
 * Check if a URL matches any rule
 */
export const hasMatchingRule = async (url: string): Promise<boolean> => {
  const rule = await findMatchingRule(url)
  return rule !== null
}

/**
 * Get the type of rule that matches a URL (if any)
 */
export const getMatchingRuleType = async (url: string): Promise<Rule["type"] | null> => {
  const rule = await findMatchingRule(url)
  return rule?.type ?? null
}
