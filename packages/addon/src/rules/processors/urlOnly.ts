import type { RuleOfType } from "../types"

/**
 * Process URL-only rule
 * Returns the current page URL as-is (no extraction needed)
 */
export const processUrlOnly = async (
  rule: RuleOfType<"urlOnly">
): Promise<string> => {
  void rule // Parameter required for processor signature but not used
  return window.location.href
}
