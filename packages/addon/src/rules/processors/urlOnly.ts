import type { RuleOfType } from "../types"

/**
 * Process URL-only rule
 * Returns the current page URL as-is (no extraction needed)
 */
// eslint-disable-next-line @typescript-eslint/require-await -- No async operations needed, but must return Promise for consistent processor API
export const processUrlOnly = async (rule: RuleOfType<"urlOnly">): Promise<string> => {
  void rule // Parameter required for processor signature but not used
  return window.location.href
}
