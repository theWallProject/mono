import { ScrappedItemType } from "../../types";

/**
 * Gets the priority of an item based on its reasons:
 * - "h" reason = priority 1 (highest)
 * - "f" reason = priority 2
 * - others = priority 3 (lowest)
 */
export const getReasonPriority = (item: ScrappedItemType): number => {
  if (!item.reasons || item.reasons.length === 0) {
    return 3; // No reasons = lowest priority
  }
  if (item.reasons.includes("h")) {
    return 1; // Highest priority
  }
  if (item.reasons.includes("f")) {
    return 2; // Second priority
  }
  return 3; // Other reasons = lowest priority
};

export const sortByReasonAndCbRank = (
  items: ScrappedItemType[],
): ScrappedItemType[] => {
  return [...items].sort((a, b) => {
    // First sort by reason priority (h first, then f, then others)
    const priorityA = getReasonPriority(a);
    const priorityB = getReasonPriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by cbRank (lowest first)
    const rankA = a.cbRank
      ? parseInt(a.cbRank.replace(/,/g, ""), 10)
      : Infinity;
    const rankB = b.cbRank
      ? parseInt(b.cbRank.replace(/,/g, ""), 10)
      : Infinity;
    return rankA - rankB;
  });
};

