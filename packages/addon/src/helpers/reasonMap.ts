import type { APIListOfReasonsValues } from "@theWallProject/common"

/**
 * Maps reason codes to i18n message keys for chrome.i18n.getMessage
 */
export const REASON_TO_I18N_KEY: Record<APIListOfReasonsValues, string> = {
  u: "reasonUrlIL",
  f: "reasonFounder",
  i: "reasonInvestor",
  h: "reasonHeadquarter",
  b: "reasonBDS"
} as const satisfies Record<APIListOfReasonsValues, string>
