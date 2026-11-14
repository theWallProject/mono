/**
 * Records the size and shape of the company database.
 *
 * Why this exists: the store listing and the what's-new page both make claims about how
 * many companies the extension covers, and those numbers were previously typed by hand in
 * several places. They drifted — nine locales disagreed with each other and every one of
 * them was wrong. Generating the figures from the database and committing the result makes
 * the claim auditable and gives each release a checkpoint to diff against.
 *
 * Output: src/db/database-stats.json (committed).
 *
 * Run: pnpm run stats (wired into pre-build, so it cannot be forgotten).
 */

import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, "../src/db/ALL.json")
const OUT_PATH = path.resolve(__dirname, "../src/db/database-stats.json")
const PKG_PATH = path.resolve(__dirname, "../package.json")

/** Every field that holds a link. Mirrors the schema consumed by the rule engine. */
const LINK_FIELDS = ["ws", "fb", "li", "tw", "ig", "tt", "ytp", "ytc", "gh", "th", "android_app_ids"]

/**
 * Rows are keyed by a distinct id, but a company can own many rows: one per website, per
 * regional Facebook page, per app listing. So the entry count is not a company count, and
 * reporting only the entry count would overstate coverage. Both numbers are recorded, plus
 * the deduplicated name count, so the difference is visible rather than hidden.
 */
const normaliseName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "")

const fail = (message) => {
  console.error(`[stats] ${message}`)
  process.exit(1)
}

const parseDatabase = () => {
  let raw
  try {
    raw = readFileSync(DB_PATH, "utf-8")
  } catch (error) {
    fail(`could not read ${DB_PATH}: ${error instanceof Error ? error.message : String(error)}`)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    fail(`database is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!Array.isArray(parsed)) {
    fail(`database must be an array of entries, got ${typeof parsed}`)
  }
  if (parsed.length === 0) {
    fail("database is empty — refusing to record zero counts")
  }

  return parsed
}

const readVersion = () => {
  const pkg = JSON.parse(readFileSync(PKG_PATH, "utf-8"))
  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    fail("package.json has no version")
  }
  return pkg.version
}

const entries = parseDatabase()
const version = readVersion()

const linksByField = Object.fromEntries(LINK_FIELDS.map((field) => [field, 0]))
const reasons = {}
const names = new Map()

let totalLinks = 0
let entriesWithoutName = 0
let entriesWithoutWebsite = 0

for (const entry of entries) {
  if (typeof entry !== "object" || entry === null) {
    fail("database contains a non-object entry")
  }

  for (const field of LINK_FIELDS) {
    const value = entry[field]
    if (value === undefined || value === null) {
      continue
    }
    const count = Array.isArray(value) ? value.length : 1
    linksByField[field] += count
    totalLinks += count
  }

  for (const reason of entry.r ?? []) {
    reasons[reason] = (reasons[reason] ?? 0) + 1
  }

  const name = typeof entry.n === "string" ? normaliseName(entry.n) : ""
  if (name.length === 0) {
    entriesWithoutName += 1
  } else {
    names.set(name, (names.get(name) ?? 0) + 1)
  }

  if (!entry.ws) {
    entriesWithoutWebsite += 1
  }
}

const sortedReasons = Object.fromEntries(
  Object.entries(reasons).sort(([, a], [, b]) => b - a)
)

const stats = {
  version,
  entries: entries.length,
  distinctNames: names.size,
  totalLinks,
  entriesWithWebsite: entries.length - entriesWithoutWebsite,
  entriesWithoutWebsite,
  entriesWithoutName,
  linksByField,
  reasons: sortedReasons
}

writeFileSync(OUT_PATH, `${JSON.stringify(stats, null, 2)}\n`, "utf-8")

console.log(
  `[stats] v${version}: ${stats.entries} entries, ${stats.distinctNames} distinct names, ${stats.totalLinks} links`
)
