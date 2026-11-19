/**
 * Fails the build when a package ships a stale copy of ALL.json.
 *
 * Why this exists: every client (extension, Android, Telegram bot, iOS) bundles its own copy of
 * the company database, produced by the scrapper's fan-out in `tasks/final.ts`. iOS was missing
 * from that fan-out for a whole release, so it shipped 26,821 entries while everything else was
 * on 30,236 — and nothing failed, because each copy is read by a different package nobody diffs.
 *
 * The pipeline only re-runs when the data changes, so the fan-out alone cannot catch a copy that
 * went stale for another reason (a merge conflict that kept one side, a manual edit, a package
 * added without touching final.ts). This check runs in pre-build instead: any consumer whose
 * bytes differ from the canonical addon copy stops the build.
 *
 * Run: pnpm run check:db (wired into pre-build, so it cannot be forgotten).
 */

import { createHash } from "crypto"
import { existsSync, readFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** packages/ — build-scripts -> addon -> packages */
const PKG_ROOT = path.resolve(__dirname, "../..")

/** The addon ships the copy the rule engine actually reads, so it is the reference. */
const REFERENCE = path.join(PKG_ROOT, "addon/src/db/ALL.json")

/**
 * Every other package that bundles ALL.json. Keep in sync with DB_COPY_TARGETS in
 * `packages/scrapper/src/tasks/final.ts` — that list writes these files, this list checks them.
 */
const CONSUMERS = [
  "android/app/src/main/assets/ALL.json",
  "telegram-bot/db/ALL.json",
  "ios/TheWall/TheWall/Data/ALL.json"
]

const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex")
const countEntries = (file) => JSON.parse(readFileSync(file, "utf-8")).length

if (!existsSync(REFERENCE)) {
  console.error(`[check-db] missing reference database: ${REFERENCE}`)
  process.exit(1)
}

const referenceHash = sha(REFERENCE)
const referenceCount = countEntries(REFERENCE)

const stale = []
for (const rel of CONSUMERS) {
  const file = path.join(PKG_ROOT, rel)
  if (!existsSync(file)) {
    stale.push({ rel, reason: "missing", detail: "file does not exist" })
    continue
  }
  if (sha(file) !== referenceHash) {
    const count = countEntries(file)
    const delta = count - referenceCount
    stale.push({
      rel,
      reason: "differs",
      detail: `${count} entries (${delta > 0 ? "+" : ""}${delta} vs the addon's ${referenceCount})`
    })
  }
}

if (stale.length > 0) {
  console.error("[check-db] stale ALL.json copies — the build would ship outdated data:")
  for (const { rel, reason, detail } of stale) {
    console.error(`  - ${rel}: ${reason} (${detail})`)
  }
  console.error("")
  console.error("Fix: regenerate so every client gets the same bytes.")
  console.error("  cd packages/scrapper && pnpm exec ts-node src/tasks/regenerate_db.ts")
  process.exit(1)
}

console.log(`[check-db] all ${CONSUMERS.length + 1} copies match: ${referenceCount} entries`)

/**
 * A symbol count of zero means the ticker pipeline broke silently.
 *
 * This is not hypothetical: Crunchbase stopped emitting a symbol column and nobody noticed until
 * the iOS copy turned out to hold the only surviving values. The addon prints the ticker beside
 * the company name and Android matches search against it, so an empty column degrades both while
 * every build still passes. Compare against the curated map's size, not a guess.
 */
const SYMBOL_MAP = path.join(PKG_ROOT, "scrapper/src/static_data/external/stockSymbols.json")
const symbols = JSON.parse(readFileSync(SYMBOL_MAP, "utf-8"))
const expected = Object.keys(symbols).length
const actual = JSON.parse(readFileSync(REFERENCE, "utf-8")).filter(
  (entry) => typeof entry.s === "string" && entry.s.trim() !== ""
).length

if (actual < expected) {
  console.error(`[check-db] stock symbols missing: ${actual} present, ${expected} expected from stockSymbols.json`)
  console.error("The shipped database lost tickers the curated map still has.")
  console.error("  cd packages/scrapper && pnpm exec ts-node src/tasks/regenerate_db.ts")
  process.exit(1)
}

console.log(`[check-db] stock symbols: ${actual} present (>= ${expected} curated)`)
