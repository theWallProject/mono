/**
 * Write discovery results to manualOverrides.ts using the existing
 * saveManualOverrides() infrastructure from override_io.ts.
 *
 * Safety rules:
 * - Never overwrite _processed: true entries (human-verified)
 * - Only add/update android_app_ids, never android_dev_id
 * - Mark auto-discovered entries with _processed: "auto"
 * - Preserve all existing fields on the entry
 */

import { log, warn } from "../../../helper"
import type { ManualOverrideValue } from "../../validate/types"
import { isProcessed } from "../../validate/types"
import { loadManualOverrides, saveManualOverrides } from "../../validate/override_io"
import type { DiscoveryResult } from "../types"

/**
 * Merge discovery results into manualOverrides.ts.
 *
 * @param results - Discovery results to write
 * @param processedLabel - Value for `_processed` on new entries (default: `"auto"`)
 *
 * Returns the count of new entries written and existing entries enriched.
 */
export async function writeDiscoveries(
  results: readonly DiscoveryResult[],
  processedLabel: "auto" | "assetlinks" = "auto"
): Promise<{ newEntries: number; enriched: number; skippedProtected: number }> {
  if (results.length === 0) {
    return { newEntries: 0, enriched: 0, skippedProtected: 0 }
  }

  const overrides = loadManualOverrides()
  let newEntries = 0
  let enriched = 0
  let skippedProtected = 0

  for (const result of results) {
    if (!result.autoAccepted || result.packages.length === 0) {
      continue
    }

    const existing = overrides[result.company]

    if (existing) {
      // Never overwrite human-verified entries
      if (isProcessed(existing)) {
        // Check if the human-verified entry already has android data
        const hasAndroid =
          ("android_dev_id" in existing && existing.android_dev_id) ||
          ("android_app_ids" in existing && existing.android_app_ids)
        if (hasAndroid) {
          skippedProtected++
          continue
        }
      }

      // Enrich existing entry — preserve all fields, add android_app_ids
      const existingAppIds =
        "android_app_ids" in existing && Array.isArray(existing.android_app_ids)
          ? existing.android_app_ids
          : []

      // Merge and deduplicate
      const mergedIds = [...new Set([...existingAppIds, ...result.packages])]

      overrides[result.company] = {
        ...existing,
        android_app_ids: mergedIds
      } as ManualOverrideValue

      enriched++
      log(`  [write] Enriched: ${result.company} (+${result.packages.length} app IDs)`)
    } else {
      // New entry — only android_app_ids + _processed marker
      overrides[result.company] = {
        android_app_ids: [...result.packages],
        _processed: processedLabel
      } as ManualOverrideValue

      newEntries++
      log(`  [write] New entry: ${result.company} (${result.packages.length} app IDs)`)
    }
  }

  if (newEntries > 0 || enriched > 0) {
    await saveManualOverrides(overrides, { allowNewKeys: newEntries > 0 })
    log(`[write] Saved: ${newEntries} new + ${enriched} enriched entries`)
  }

  if (skippedProtected > 0) {
    warn(`[write] Skipped ${skippedProtected} human-verified entries with existing Android data`)
  }

  return { newEntries, enriched, skippedProtected }
}
