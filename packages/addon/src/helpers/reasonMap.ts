import type { valuesOfListOfReasons } from "@theWallProject/common"

import type { ReasonI18nKey } from "./i18n-keys"

/**
 * Maps reason codes to i18n message keys for chrome.i18n.getMessage.
 * Uses a strict function with switch cases and TypeScript never check for exhaustiveness.
 * Returns a strongly typed union of valid i18n message keys from the actual messages.json file.
 *
 * Uses valuesOfListOfReasons (derived from APIListOfReasons const)
 * (derived from Zod schema) to ensure proper type narrowing in switch statements.
 */
export function getReasonI18nKey(reason: valuesOfListOfReasons): ReasonI18nKey {
  switch (reason) {
    case "u":
      return "reasonUrlIL"
    case "f":
      return "reasonFounder"
    case "i":
      return "reasonInvestor"
    case "h":
      return "reasonHeadquarter"
    case "b":
      return "reasonBDS"
    default: {
      // Exhaustiveness check: if all cases are handled, reason should be never
      const _exhaustive: never = reason
      throw new Error(`Unknown reason code: ${_exhaustive}`)
    }
  }
}
