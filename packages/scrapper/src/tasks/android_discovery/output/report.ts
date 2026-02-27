/**
 * Run report generation — summary statistics and audit manifest.
 */

import fs from "fs"
import path from "path"

import { formatAndWrite } from "@theWallProject/common"

import { log } from "../../../helper"
import { CONFIG } from "../config"
import type { DiscoveryResult, RunReport } from "../types"

/**
 * Generate and save a run report with summary statistics.
 */
export async function generateReport(
  baseDir: string,
  stats: {
    totalCompanies: number
    fetchedSuccessfully: number
    noAssetlinks: number
    errors: number
    results: readonly DiscoveryResult[]
    newEntriesWritten: number
    existingEntriesEnriched: number
    startedAt: Date
  }
): Promise<RunReport> {
  const autoAccepted = stats.results.filter((r) => r.autoAccepted).length
  const rejected = stats.results.filter((r) => !r.autoAccepted).length

  const report: RunReport = {
    runId: `android_${Date.now()}`,
    startedAt: stats.startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    totalCompanies: stats.totalCompanies,
    fetchedSuccessfully: stats.fetchedSuccessfully,
    noAssetlinks: stats.noAssetlinks,
    errors: stats.errors,
    autoAccepted,
    rejected,
    newEntriesWritten: stats.newEntriesWritten,
    existingEntriesEnriched: stats.existingEntriesEnriched
  }

  // Write report to disk
  const dir = path.join(baseDir, CONFIG.resultsDir)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const reportPath = path.join(dir, "run_report.json")
  await formatAndWrite(reportPath, report, { parser: "json" })

  // Write full discoveries for audit
  const discoveriesPath = path.join(dir, "discoveries.json")
  await formatAndWrite(discoveriesPath, stats.results, { parser: "json" })

  // Print summary to console
  const duration = new Date().getTime() - stats.startedAt.getTime()
  const minutes = Math.round(duration / 60000)

  log("\n════════════════════════════════════════════════════")
  log("  Android Discovery Run Summary")
  log("════════════════════════════════════════════════════")
  log(`  Total companies processed:  ${stats.totalCompanies}`)
  log(`  Assetlinks found:           ${stats.fetchedSuccessfully} (${pct(stats.fetchedSuccessfully, stats.totalCompanies)})`)
  log(`  No assetlinks (404/empty):  ${stats.noAssetlinks} (${pct(stats.noAssetlinks, stats.totalCompanies)})`)
  log(`  Errors (timeout/DNS/etc):   ${stats.errors} (${pct(stats.errors, stats.totalCompanies)})`)
  log(`  ────────────────────────────────────────────────`)
  log(`  Auto-accepted:              ${autoAccepted}`)
  log(`  Rejected (filtered out):    ${rejected}`)
  log(`  ────────────────────────────────────────────────`)
  log(`  New entries written:        ${stats.newEntriesWritten}`)
  log(`  Existing entries enriched:  ${stats.existingEntriesEnriched}`)
  log(`  Duration:                   ${minutes}min`)
  log("════════════════════════════════════════════════════\n")

  return report
}

function pct(n: number, total: number): string {
  if (total === 0) return "0%"
  return `${((n / total) * 100).toFixed(1)}%`
}
