import type { valuesOfListOfReasons } from "@theWallProject/common"

/**
 * Visual severity level of a flag reason, as rendered by the banner modal.
 *
 * - "red": the company itself is anchored in Israel, or is a top-priority BDS target.
 * - "yellow": an indirect connection (founder/investor), a lower-pressure BDS tier,
 *   or an unclassified custom connection.
 */
export type ReasonLevel = "red" | "yellow"

/**
 * Maps a reason code to its visual severity level.
 *
 * Uses a strict switch with a TypeScript `never` exhaustiveness check so that adding a
 * new reason code to `APIListOfReasons` becomes a compile error here rather than
 * silently inheriting a level.
 */
export function getReasonLevel(reason: valuesOfListOfReasons): ReasonLevel {
  switch (reason) {
    // Direct: the company itself is Israel-anchored or a priority boycott target.
    case "h":
    case "u":
    case "BDS_PRIO":
      return "red"

    // Indirect: one hop removed, lower-pressure BDS tier, or unclassified connection.
    case "f":
    case "i":
    case "BDS_GRASS":
    case "BDS_PRESSURE":
    case "c":
      return "yellow"

    default: {
      // Exhaustiveness check: if all cases are handled, reason should be never
      const _exhaustive: never = reason
      throw new Error(`Unknown reason code: ${String(_exhaustive)}`)
    }
  }
}

/**
 * Reduces a company's full reason list to a single level for the whole modal.
 * A single red-tier reason escalates the entire dialog; otherwise it stays yellow.
 *
 * An empty list resolves to "red": `FinalDBFileSchema` declares `r` as a plain array
 * with no minimum, so an empty list is schema-valid even though every real entry
 * carries at least one reason. Red is the conservative resolution — it keeps the
 * dialog exactly as it renders today and never understates a flagged company by
 * demoting it to the softer yellow styling.
 */
export function getModalReasonLevel(reasons: readonly valuesOfListOfReasons[]): ReasonLevel {
  if (reasons.length === 0) {
    return "red"
  }

  return reasons.some((reason) => getReasonLevel(reason) === "red") ? "red" : "yellow"
}
