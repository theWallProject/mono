import { ScrappedItemType } from "../../types";
import { log } from "../../helper";
import type { ManualOverrideValue } from "./types";
import { isProcessed } from "./types";
import { getReasonPriority } from "./sorting";

/**
 * Draws a progress bar
 */
export const drawProgressBar = (
  current: number,
  total: number,
  width: number = 40,
): string => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `[${bar}] ${percentage.toFixed(1)}% (${current}/${total})`;
};

/**
 * Gets statistics about processed/unprocessed items
 */
export const getStatistics = (
  allItems: ScrappedItemType[],
  processedItems: Record<string, ManualOverrideValue>,
) => {
  const total = allItems.length;
  let processed = 0;
  let unprocessed = 0;
  const byReason: Record<string, { total: number; processed: number }> = {
    h: { total: 0, processed: 0 },
    f: { total: 0, processed: 0 },
    other: { total: 0, processed: 0 },
  };

  for (const item of allItems) {
    const isProcessedItem =
      processedItems[item.name] && isProcessed(processedItems[item.name]);

    if (isProcessedItem) {
      processed++;
    } else {
      unprocessed++;
    }

    // Count by reason
    const priority = getReasonPriority(item);
    if (priority === 1) {
      // "h" reason
      byReason.h.total++;
      if (isProcessedItem) byReason.h.processed++;
    } else if (priority === 2) {
      // "f" reason
      byReason.f.total++;
      if (isProcessedItem) byReason.f.processed++;
    } else {
      // other reasons
      byReason.other.total++;
      if (isProcessedItem) byReason.other.processed++;
    }
  }

  return {
    total,
    processed,
    unprocessed,
    byReason,
  };
};

/**
 * Displays statistics and progress bar
 */
export const displayStatistics = (
  allItems: ScrappedItemType[],
  processedItems: Record<string, ManualOverrideValue>,
): void => {
  const stats = getStatistics(allItems, processedItems);

  log("\n" + "=".repeat(60));
  log("📊 VALIDATION STATISTICS");
  log("=".repeat(60));

  // Overall progress
  log("\n📈 Overall Progress:");
  log(`   ${drawProgressBar(stats.processed, stats.total, 50)}`);

  // By reason
  log("\n📋 By Reason:");
  log(
    `   Reason "h": ${drawProgressBar(stats.byReason.h.processed, stats.byReason.h.total, 30)}`,
  );
  log(
    `   Reason "f": ${drawProgressBar(stats.byReason.f.processed, stats.byReason.f.total, 30)}`,
  );
  log(
    `   Others:    ${drawProgressBar(stats.byReason.other.processed, stats.byReason.other.total, 30)}`,
  );

  // Summary
  log("\n📊 Summary:");
  log(`   Total companies:     ${stats.total}`);
  log(
    `   ✅ Processed:        ${stats.processed} (${((stats.processed / stats.total) * 100).toFixed(1)}%)`,
  );
  log(
    `   ⏳ Remaining:        ${stats.unprocessed} (${((stats.unprocessed / stats.total) * 100).toFixed(1)}%)`,
  );

  log("\n📋 Remaining by Reason:");
  log(
    `   Reason "h":          ${stats.byReason.h.total - stats.byReason.h.processed} remaining`,
  );
  log(
    `   Reason "f":          ${stats.byReason.f.total - stats.byReason.f.processed} remaining`,
  );
  log(
    `   Others:              ${stats.byReason.other.total - stats.byReason.other.processed} remaining`,
  );

  log("\n" + "=".repeat(60));
};

