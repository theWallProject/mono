import type { RuleOfType } from "../types"

/**
 * Process URL + DOM + inline block rule
 * Returns the rule config for DomScanner to use
 * No extraction happens here - DomScanner handles it
 */
export const processUrlDomInline = (
  rule: RuleOfType<"urlDomInline">
): RuleOfType<"urlDomInline"> => {
  // Return rule as-is for DomScanner to use
  return rule
}

