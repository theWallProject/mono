import { log } from "../../helper"
import { ScrappedItemType } from "../../types"
import { getReasonPriority } from "./sorting"
import type { ManualOverrideValue } from "./types"
import { isProcessed } from "./types"

/**
 * Draws a progress bar
 */
export const drawProgressBar = (current: number, total: number, width: number = 40): string => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const bar = "█".repeat(filled) + "░".repeat(empty)
  return `[${bar}] ${percentage.toFixed(1)}% (${current}/${total})`
}

/**
 * Gets statistics about processed/unprocessed items
 */
export const getStatistics = (allItems: ScrappedItemType[], processedItems: Record<string, ManualOverrideValue>) => {
  const total = allItems.length
  let processed = 0
  let unprocessed = 0
  const byReason: Record<string, { total: number; processed: number }> = {
    h: { total: 0, processed: 0 },
    f: { total: 0, processed: 0 },
    other: { total: 0, processed: 0 }
  }

  for (const item of allItems) {
    const processedItem = processedItems[item.name]
    const isProcessedItem = processedItem !== undefined && isProcessed(processedItem)

    if (isProcessedItem) {
      processed++
    } else {
      unprocessed++
    }

    // Count by reason
    const priority = getReasonPriority(item)
    const reasonH = byReason.h
    const reasonF = byReason.f
    const reasonOther = byReason.other
    if (reasonH === undefined || reasonF === undefined || reasonOther === undefined) {
      throw new Error("Unexpected: byReason properties are undefined")
    }
    if (priority === 1) {
      // "h" reason
      reasonH.total++
      if (isProcessedItem) reasonH.processed++
    } else if (priority === 2) {
      // "f" reason
      reasonF.total++
      if (isProcessedItem) reasonF.processed++
    } else {
      // other reasons
      reasonOther.total++
      if (isProcessedItem) reasonOther.processed++
    }
  }

  return {
    total,
    processed,
    unprocessed,
    byReason
  }
}

/**
 * Displays statistics and progress bar
 */
export const displayStatistics = (
  allItems: ScrappedItemType[],
  processedItems: Record<string, ManualOverrideValue>
): void => {
  const stats = getStatistics(allItems, processedItems)

  log("\n" + "=".repeat(60))
  log("📊 VALIDATION STATISTICS")
  log("=".repeat(60))

  // Overall progress
  log("\n📈 Overall Progress:")
  log(`   ${drawProgressBar(stats.processed, stats.total, 50)}`)

  // By reason
  log("\n📋 By Reason:")
  const statsH = stats.byReason.h
  const statsF = stats.byReason.f
  const statsOther = stats.byReason.other
  if (statsH === undefined || statsF === undefined || statsOther === undefined) {
    throw new Error("Unexpected: stats.byReason properties are undefined")
  }
  log(`   Reason "h": ${drawProgressBar(statsH.processed, statsH.total, 30)}`)
  log(`   Reason "f": ${drawProgressBar(statsF.processed, statsF.total, 30)}`)
  log(`   Others:    ${drawProgressBar(statsOther.processed, statsOther.total, 30)}`)

  // Summary
  log("\n📊 Summary:")
  log(`   Total companies:     ${stats.total}`)
  log(`   ✅ Processed:        ${stats.processed} (${((stats.processed / stats.total) * 100).toFixed(1)}%)`)
  log(`   ⏳ Remaining:        ${stats.unprocessed} (${((stats.unprocessed / stats.total) * 100).toFixed(1)}%)`)

  log("\n📋 Remaining by Reason:")
  log(`   Reason "h":          ${statsH.total - statsH.processed} remaining`)
  log(`   Reason "f":          ${statsF.total - statsF.processed} remaining`)
  log(`   Others:              ${statsOther.total - statsOther.processed} remaining`)

  log("\n" + "=".repeat(60))
}
