/**
 * Android App ID Discovery Pipeline — Phase 1 (assetlinks only)
 *
 * Discovers Android app package IDs for companies using Google Digital
 * Asset Links (assetlinks.json). Zero false positives, zero human
 * intervention.
 *
 * Usage:
 *   pnpm discover:android                    # Full run
 *   pnpm discover:android -- --dry-run       # Preview without writing
 *   pnpm discover:android -- --resume        # Resume from checkpoint
 *   pnpm discover:android -- --company "Wix" # Test single company
 */

import fs from "fs"
import path from "path"

import { getRegisteredDomain } from "@theWallProject/common"

import { error, log, warn } from "../../helper"
import { CheckpointManager } from "./checkpoint/progress"
import { CONFIG } from "./config"
import { checkKnownSafeApps } from "./filters/known_safe_apps"
import { generateReport } from "./output/report"
import { writeDiscoveries } from "./output/write_overrides"
import { probeAssetlinks } from "./strategies/assetlinks_probe"
import type { CompanyEntry, DiscoveryResult } from "./types"

// ── CLI argument parsing ─────────────────────────────────────────────────

function parseArgs(): {
  dryRun: boolean
  resume: boolean
  company: string | null
} {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes("--dry-run"),
    resume: args.includes("--resume"),
    company: (() => {
      const idx = args.indexOf("--company")
      if (idx !== -1) {
        const val = args[idx + 1]
        return val ?? null
      }
      return null
    })()
  }
}

// ── Load companies from ALL.json ─────────────────────────────────────────

function loadCompanies(baseDir: string, filterCompany: string | null): CompanyEntry[] {
  const allJsonPath = path.join(baseDir, "results/4_final/ALL.json")
  if (!fs.existsSync(allJsonPath)) {
    throw new Error(`ALL.json not found at ${allJsonPath}. Run the scrapper build first.`)
  }

  const raw = JSON.parse(fs.readFileSync(allJsonPath, "utf-8")) as Array<{
    n: string
    ws?: string
    r: string[]
    android_dev_id?: string
    android_app_ids?: string[]
  }>

  // Deduplicate by company name (take first occurrence) and filter to those with websites
  const seen = new Set<string>()
  const companies: CompanyEntry[] = []

  for (const item of raw) {
    if (seen.has(item.n)) continue
    seen.add(item.n)

    if (!item.ws) continue

    // Extract domain from website URL
    const domain = getRegisteredDomain(item.ws)
    if (!domain) continue

    // Filter to specific company if --company flag is set
    if (filterCompany && item.n.toLowerCase() !== filterCompany.toLowerCase()) continue

    companies.push({
      name: item.n,
      website: domain,
      reasons: item.r
    })
  }

  return companies
}

// ── Progress display ─────────────────────────────────────────────────────

function showProgress(
  current: number,
  total: number,
  found: number,
  missed: number,
  errors: number,
  startTime: number
): void {
  const elapsed = Date.now() - startTime
  const perItem = elapsed / current
  const remaining = perItem * (total - current)
  const etaMin = Math.round(remaining / 60000)

  const pct = ((current / total) * 100).toFixed(1)
  process.stdout.write(
    `\r  [assetlinks] ${current}/${total} (${pct}%) | ${found} found | ${missed} miss | ${errors} err | ETA: ${etaMin}min    `
  )
}

// ── Batch processing with concurrency ────────────────────────────────────

async function processBatch(
  companies: CompanyEntry[],
  checkpoint: CheckpointManager,
  resume: boolean
): Promise<{
  results: DiscoveryResult[]
  found: number
  missed: number
  errors: number
}> {
  const results: DiscoveryResult[] = []
  let found = 0
  let missed = 0
  let errCount = 0
  const startTime = Date.now()

  // Process in batches of CONFIG.concurrency
  for (let i = 0; i < companies.length; i += CONFIG.concurrency) {
    const batch = companies.slice(i, i + CONFIG.concurrency)

    const promises = batch.map(async (company) => {
      // Skip if already in checkpoint (resume mode)
      if (resume && checkpoint.isCompleted(company.website, "assetlinks")) {
        const cached = checkpoint.getResult(company.website, "assetlinks")
        if (cached && cached.packages.length > 0) {
          found++
          return {
            company: company.name,
            domain: company.website,
            packages: cached.packages,
            source: "assetlinks" as const,
            autoAccepted: true
          }
        }
        missed++
        return null
      }

      try {
        const result = await probeAssetlinks(company.website)

        // Record to checkpoint immediately for crash recovery
        checkpoint.record(company.name, company.website, "assetlinks", result)

        if (result.packages.length > 0) {
          found++
          return {
            company: company.name,
            domain: company.website,
            packages: result.packages,
            source: "assetlinks" as const,
            autoAccepted: true
          }
        }

        missed++
        return null
      } catch (err: unknown) {
        errCount++
        const msg = err instanceof Error ? err.message : String(err)
        warn(`  [error] ${company.name} (${company.website}): ${msg}`)

        // Record empty result to checkpoint so we don't retry
        checkpoint.record(company.name, company.website, "assetlinks", {
          packages: [],
          rawCount: 0,
          filteredCount: 0
        })

        return null
      }
    })

    const batchResults = await Promise.all(promises)
    for (const r of batchResults) {
      if (r) results.push(r)
    }

    // Show progress every batch
    showProgress(Math.min(i + CONFIG.concurrency, companies.length), companies.length, found, missed, errCount, startTime)

    // Brief pause between batches
    if (i + CONFIG.concurrency < companies.length) {
      await new Promise((resolve) => setTimeout(resolve, CONFIG.batchDelayMs))
    }
  }

  // Clear progress line
  process.stdout.write("\n")

  return { results, found, missed, errors: errCount }
}

// ── Known-safe-apps validation ───────────────────────────────────────────

function validateSafety(results: readonly DiscoveryResult[]): void {
  const allDiscoveredIds = results
    .filter((r) => r.autoAccepted)
    .flatMap((r) => [...r.packages])

  const conflicts = checkKnownSafeApps(allDiscoveredIds)
  if (conflicts.length > 0) {
    throw new Error(
      `SAFETY FAILURE: Discovered app IDs conflict with known-safe apps: ${conflicts.join(", ")}. ` +
        "This indicates a false positive. Pipeline aborted."
    )
  }
}

// ── Main pipeline ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { dryRun, resume, company } = parseArgs()
  const baseDir = path.resolve(__dirname, "../../../")
  const startedAt = new Date()

  log("════════════════════════════════════════════════════")
  log("  Android App ID Discovery Pipeline (Phase 1)")
  log(`  Mode: ${dryRun ? "DRY RUN" : "LIVE"}${resume ? " (resuming)" : ""}`)
  if (company) log(`  Company filter: ${company}`)
  log("════════════════════════════════════════════════════\n")

  // Load companies
  log("[1/4] Loading companies from ALL.json...")
  const companies = loadCompanies(baseDir, company)
  log(`  Found ${companies.length} companies with websites\n`)

  if (companies.length === 0) {
    warn("No companies to process. Exiting.")
    return
  }

  // Initialize checkpoint
  const checkpoint = new CheckpointManager(baseDir)
  if (resume) {
    checkpoint.load()
    log(`  Loaded checkpoint with ${checkpoint.size} completed entries\n`)
  }

  // Run assetlinks probe
  log("[2/4] Probing assetlinks.json via Google DAL API...")
  const { results, found, missed, errors } = await processBatch(companies, checkpoint, resume)

  log(`  Results: ${found} found, ${missed} no assetlinks, ${errors} errors\n`)

  if (results.length === 0) {
    log("No discoveries. Exiting.")
    return
  }

  // Safety validation
  log("[3/4] Validating against known-safe-apps list...")
  validateSafety(results)
  log("  Safety check passed\n")

  // Write results
  let newEntriesWritten = 0
  let existingEntriesEnriched = 0

  if (dryRun) {
    log("[4/4] DRY RUN — not writing to manualOverrides.ts")

    // Write dry-run results to a JSON file for inspection
    const { formatAndWrite } = await import("@theWallProject/common")
    const dryRunPath = path.join(baseDir, CONFIG.resultsDir, "dry_run.json")
    const dir = path.dirname(dryRunPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    await formatAndWrite(dryRunPath, results, { parser: "json" })
    log(`  Wrote ${results.length} discoveries to ${dryRunPath}`)
  } else {
    log("[4/4] Writing discoveries to manualOverrides.ts...")
    const writeResult = await writeDiscoveries(results)
    newEntriesWritten = writeResult.newEntries
    existingEntriesEnriched = writeResult.enriched
  }

  // Generate report
  await generateReport(baseDir, {
    totalCompanies: companies.length,
    fetchedSuccessfully: found,
    noAssetlinks: missed,
    errors,
    results,
    newEntriesWritten,
    existingEntriesEnriched,
    startedAt
  })
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    error("Fatal error:", err)
    process.exit(1)
  })
}

export { main as runAndroidDiscovery }
