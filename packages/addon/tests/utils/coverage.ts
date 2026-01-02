import { existsSync, readFileSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COVERAGE_FILE = path.resolve(__dirname, "../fixtures/coverage-data.json")

interface CoverageData {
  testedUrls: string[]
  testedByRuleType: {
    urlOnly: number
    urlDomFull: number
    urlDomInline: number
  }
  testedByReason: {
    f: number
    i: number
    h: number
    BDS_PRIO: number
    BDS_GRASS: number
    BDS_PRESSURE: number
    u: number
  }
  lastUpdated: string
}

/**
 * Type guard to check if a string is a valid reason key
 */
function isValidReasonKey(reason: string): reason is keyof CoverageData["testedByReason"] {
  return (
    reason === "f" ||
    reason === "i" ||
    reason === "h" ||
    reason === "BDS_PRIO" ||
    reason === "BDS_GRASS" ||
    reason === "BDS_PRESSURE" ||
    reason === "u"
  )
}

/**
 * Load coverage data
 */
function loadCoverage(): CoverageData {
  if (existsSync(COVERAGE_FILE)) {
    try {
      return JSON.parse(readFileSync(COVERAGE_FILE, "utf-8"))
    } catch {
      // If file is corrupted, start fresh
    }
  }

  return {
    testedUrls: [],
    testedByRuleType: {
      urlOnly: 0,
      urlDomFull: 0,
      urlDomInline: 0
    },
    testedByReason: {
      f: 0,
      i: 0,
      h: 0,
      BDS_PRIO: 0,
      BDS_GRASS: 0,
      BDS_PRESSURE: 0,
      u: 0
    },
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Save coverage data
 */
function saveCoverage(data: CoverageData): void {
  writeFileSync(COVERAGE_FILE, JSON.stringify(data, null, 2), "utf-8")
}

/**
 * Mark URL as tested
 */
export function markUrlAsTested(
  url: string,
  ruleType?: "urlOnly" | "urlDomFull" | "urlDomInline",
  reasons?: string[]
): void {
  const coverage = loadCoverage()

  if (!coverage.testedUrls.includes(url)) {
    coverage.testedUrls.push(url)

    if (ruleType) {
      coverage.testedByRuleType[ruleType]++
    }

    if (reasons) {
      for (const reason of reasons) {
        if (isValidReasonKey(reason)) {
          coverage.testedByReason[reason]++
        }
      }
    }

    coverage.lastUpdated = new Date().toISOString()
    saveCoverage(coverage)
  }
}

/**
 * Get coverage statistics
 */
export function getCoverageStats(): {
  totalTested: number
  byRuleType: CoverageData["testedByRuleType"]
  byReason: CoverageData["testedByReason"]
  lastUpdated: string
} {
  const coverage = loadCoverage()
  return {
    totalTested: coverage.testedUrls.length,
    byRuleType: coverage.testedByRuleType,
    byReason: coverage.testedByReason,
    lastUpdated: coverage.lastUpdated
  }
}

/**
 * Check if URL has been tested
 */
export function isUrlTested(url: string): boolean {
  const coverage = loadCoverage()
  return coverage.testedUrls.includes(url)
}

/**
 * Get tested URLs
 */
export function getTestedUrls(): string[] {
  const coverage = loadCoverage()
  return [...coverage.testedUrls]
}

/**
 * Reset coverage data
 */
export function resetCoverage(): void {
  const fresh: CoverageData = {
    testedUrls: [],
    testedByRuleType: {
      urlOnly: 0,
      urlDomFull: 0,
      urlDomInline: 0
    },
    testedByReason: {
      f: 0,
      i: 0,
      h: 0,
      BDS_PRIO: 0,
      BDS_GRASS: 0,
      BDS_PRESSURE: 0,
      u: 0
    },
    lastUpdated: new Date().toISOString()
  }
  saveCoverage(fresh)
}

/**
 * Generate coverage report
 */
export function generateCoverageReport(): string {
  const stats = getCoverageStats()
  const lines = [
    "=== Test Coverage Report ===",
    `Total URLs Tested: ${stats.totalTested}`,
    "",
    "By Rule Type:",
    `  urlOnly: ${stats.byRuleType.urlOnly}`,
    `  urlDomFull: ${stats.byRuleType.urlDomFull}`,
    `  urlDomInline: ${stats.byRuleType.urlDomInline}`,
    "",
    "By Reason:",
    `  Founder (f): ${stats.byReason.f}`,
    `  Investor (i): ${stats.byReason.i}`,
    `  Headquarters (h): ${stats.byReason.h}`,
    `  BDS Priority (BDS_PRIO): ${stats.byReason.BDS_PRIO}`,
    `  BDS Grassroots (BDS_GRASS): ${stats.byReason.BDS_GRASS}`,
    `  BDS Pressure (BDS_PRESSURE): ${stats.byReason.BDS_PRESSURE}`,
    `  URL (.il) (u): ${stats.byReason.u}`,
    "",
    `Last Updated: ${stats.lastUpdated}`
  ]

  return lines.join("\n")
}
