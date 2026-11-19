import type { valuesOfListOfReasons } from "@theWallProject/common"

/**
 * The actions a banner can offer, in render order.
 *
 * Previously the modal chose between these with a nested ternary, which made them
 * mutually exclusive: a BDS entry that also had alternatives silently lost one of the
 * two. They are independent capabilities, so they are resolved into a ranked list here
 * and the modal renders the first as the primary button and the rest as secondary links.
 */
export type BannerAction = "alternatives" | "bdsGuide" | "supportPalestine"

/** Reason codes that make the BDS guide relevant. */
const BDS_REASONS: readonly valuesOfListOfReasons[] = ["BDS_PRIO", "BDS_GRASS", "BDS_PRESSURE"]

export type BannerActionInput = {
  /** Reason codes on the matched entry. */
  reasons: readonly valuesOfListOfReasons[]
  /** Whether the entry carries at least one alternative. */
  hasAlternatives: boolean
}

/**
 * Resolves which banner actions apply, most relevant first.
 *
 * Ordering rationale: showing a usable replacement is the most actionable thing the modal
 * can offer, so `alternatives` wins the primary slot when present. The BDS guide follows
 * for BDS-tier reasons, and `supportPalestine` is the fallback when there is nothing more
 * specific to say. The support link is never combined with the others — it is the default,
 * not an additional capability.
 *
 * An entry with alternatives but no BDS reasons yields exactly `["alternatives"]`, and one
 * with neither yields `["supportPalestine"]`, so the modal's primary button is unchanged
 * for every entry that exists today.
 */
export function resolveBannerActions({ reasons, hasAlternatives }: BannerActionInput): BannerAction[] {
  const actions: BannerAction[] = []

  if (hasAlternatives) {
    actions.push("alternatives")
  }

  if (reasons.some((reason) => BDS_REASONS.includes(reason))) {
    actions.push("bdsGuide")
  }

  if (actions.length === 0) {
    actions.push("supportPalestine")
  }

  return actions
}
