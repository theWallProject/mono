import path from "path"
import { APIListOfReasonsSchema, formatAndWrite, type valuesOfListOfReasons } from "@theWallProject/common"
import { z } from "zod"

import { log } from "../helper"
import AFSC from "../static_data/external/afsc.json"
import AFSC_DECISIONS from "../static_data/external/afscDecisions.json"

const outputFilePath = path.join(__dirname, "../../results/1_batches/static/AFSC.json")

/**
 * AFSC Investigate dataset — https://investigate.afsc.org/download-our-data
 *
 * The xlsx is the source of record (`afsc-dataset-2025-07.xlsx`), parsed to `afsc.json`.
 * This generator is idempotent on purpose: it rewrites AFSC.json from scratch each run, so a
 * re-scrape can never accumulate duplicate rows.
 *
 * **Ids are keyed on ISIN, not on the company slug.** The dataset's `Link` slugs are NOT unique —
 * 13 companies share a slug with another (Delta Galil Industries and Delta Israel Brands both point
 * at `/company/delta-galil-industries`). ISIN is unique: 255 rows, 255 distinct values, none blank.
 * Keying on the slug silently merged two different companies into one id.
 */

const AfscRowSchema = z
  .object({
    short: z.string().min(1),
    standard: z.string(),
    hq: z.string(),
    symbol: z.string(),
    exchange: z.string(),
    exchangeName: z.string(),
    industry: z.string(),
    isin: z.string(),
    summary: z.string(),
    divest: z.string(),
    prisons: z.string(),
    occupations: z.string(),
    borders: z.string(),
    link: z.string(),
  })
  .strict()

const AfscDatasetSchema = z.array(AfscRowSchema)

/**
 * One human ruling, keyed by ISIN. Absent means "undecided" — never "add by default".
 * `ws` may be supplied here when the domain was resolved by hand during the collision review.
 */
const DecisionSchema = z
  .object({
    action: z.enum(["add", "skip", "merge", "enrich"]),
    reason: APIListOfReasonsSchema.optional(),
    ws: z.string().optional(),
    note: z.string().optional(),
    decidedAt: z.string().optional(),
  })
  .strict()

const DecisionsSchema = z.record(z.string(), DecisionSchema)

/** AFSC ships `&amp;` in names; unescape before it reaches the DB. */
const decodeEntities = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim()

export async function run() {
  const dataset = AfscDatasetSchema.parse(AFSC)
  const decisions = DecisionsSchema.parse(AFSC_DECISIONS)

  const merged: Array<{
    name: string
    id: string
    reasons: valuesOfListOfReasons[]
    ws: string
    proof_text: string
    proof_link: string
  }> = []

  const skipped: string[] = []
  const missingDomain: string[] = []

  for (const row of dataset) {
    const isin = row.isin.trim()
    if (isin === "") {
      throw new Error(`AFSC row has no ISIN, cannot build a stable id: ${row.short}`)
    }

    const decision = decisions[isin]
    const name = decodeEntities(row.short)

    if (decision?.action === "skip") {
      skipped.push(name)
      continue
    }

    const ws = decision?.ws
    if (ws === undefined) {
      // A row with no website blocks nothing in the extension, so it is not emitted. It is reported
      // instead: resolving the domain is the outstanding work, not a silent omission.
      missingDomain.push(name)
      continue
    }

    const reason = decision?.reason ?? (row.hq === "Israel" ? "h" : "c")

    merged.push({
      name,
      id: `AFSC_${isin}`,
      reasons: [reason],
      ws,
      proof_text: decodeEntities(row.summary),
      proof_link: row.link,
    })
  }

  const sorted = merged.sort((a, b) => a.name.localeCompare(b.name))

  // ISIN is unique in the dataset, so a duplicate here means the data changed underneath us.
  const seen = new Map<string, string>()
  for (const row of sorted) {
    const previous = seen.get(row.id)
    if (previous !== undefined) {
      throw new Error(
        `AFSC: duplicate id "${row.id}" from "${previous}" and "${row.name}". ` +
          `The dataset should have one ISIN per company — check afsc.json before trusting it.`
      )
    }
    seen.set(row.id, row.name)
  }

  await formatAndWrite(outputFilePath, sorted, { parser: "json" })

  log(`AFSC: dataset ${dataset.length} rows, emitted ${sorted.length} to ${outputFilePath}`)
  if (skipped.length > 0) {
    log(`AFSC: skipped by decision (${skipped.length}): ${skipped.join(", ")}`)
  }
  log(`AFSC: not emitted, no domain resolved yet (${missingDomain.length})`)

  return sorted
}
