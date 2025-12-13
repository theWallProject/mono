import type { Rule } from "../types"
import { processUrlDomFull } from "./urlDomFull"
import { processUrlDomInline } from "./urlDomInline"
import { processUrlOnly } from "./urlOnly"

/**
 * Process a rule using its corresponding processor
 * Uses discriminated union narrowing to ensure type safety without assertions
 */
export function processRule(rule: Rule): Promise<string | null> | Rule {
  switch (rule.type) {
    case "urlOnly": {
      return processUrlOnly(rule)
    }
    case "urlDomFull": {
      return processUrlDomFull(rule)
    }
    case "urlDomInline": {
      return processUrlDomInline(rule)
    }
    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustive: never = rule
      throw new Error(`Unknown rule type: ${_exhaustive}`)
    }
  }
}
