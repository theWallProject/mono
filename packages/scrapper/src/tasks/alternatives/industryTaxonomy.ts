/**
 * Industry taxonomy built from the merged corpus.
 *
 * The scrapper needs a fixed, inspectable list of the industries that actually
 * exist in our data before it can ask "which of these describe this company?".
 * The list is derived, not hand-maintained: every industry string that appears on
 * at least one merged row, with its company count.
 *
 * Why derive it instead of hardcoding:
 *   - Crunchbase's vocabulary drifts. A hardcoded list silently rots and starts
 *     filtering on industries that no longer exist.
 *   - The zero-shot selector embeds these names, so a stale list means a candidate
 *     is judged against industry names no company carries.
 *
 * Output is committed (`static_data/industry_taxonomy.json`) so the alternatives
 * tooling can run without re-reading the 18MB merged file, and so changes to the
 * vocabulary show up in review as a diff rather than as a silent behaviour shift.
 */

import { createHash } from "node:crypto"
import fs from "fs"
import path from "path"
import { z } from "zod"

import { log } from "../../helper"
import { MergedDataFileSchema } from "../../types"

const mergedDataPath = path.join(__dirname, "../../../results/2_merged/2_MERGED_ALL.json")
const outputPath = path.join(__dirname, "../../static_data/industry_taxonomy.json")

/** Minimum companies an industry needs before it is worth offering as a label. */
export const MIN_COMPANIES_FOR_LABEL = 1

export const IndustryTaxonomySchema = z
  .object({
    /** Total distinct companies in the corpus the taxonomy was built from. */
    companyCount: z.number().int().nonnegative(),
    /** Companies carrying at least one industry. */
    companiesWithIndustries: z.number().int().nonnegative(),
    /** Distinct industry labels. */
    industryCount: z.number().int().nonnegative(),
    /** Source corpus fingerprint, so consumers can detect a stale taxonomy. */
    corpusHash: z.string(),
    /** Labels sorted by descending company count, then name. */
    industries: z.array(
      z
        .object({
          name: z.string(),
          count: z.number().int().positive()
        })
        .strict()
    )
  })
  .strict()

export type IndustryTaxonomy = z.infer<typeof IndustryTaxonomySchema>

/**
 * Stable fingerprint of the corpus content that the taxonomy depends on.
 *
 * Hashes the sorted `name:industries` pairs rather than the raw file: the raw file
 * changes on every regeneration (URLs, rankings, descriptions), which would make the
 * hash useless as a staleness signal. Only the fields this taxonomy is derived from
 * participate.
 */
export const computeIndustryCorpusHash = (entries: ReadonlyArray<{ name: string; industries?: string[] }>): string => {
  const lines = entries
    .map((entry) => `${entry.name}\u0000${(entry.industries ?? []).slice().sort().join("\u0001")}`)
    .sort()

  return createHash("sha256").update(lines.join("\n")).digest("hex").slice(0, 16)
}

/**
 * Fingerprint input shared by the taxonomy and the similarity index.
 *
 * Both must agree on exactly what "the corpus" is: the distinct-company view, keyed by
 * name, with only the fields the derived artifacts depend on. If they disagreed, either
 * artifact would report itself stale against its own rebuild.
 */
export const buildIndustryTaxonomyHashInput = (
  entries: ReadonlyArray<{ name: string; industries?: string[] }>
): string => computeIndustryCorpusHash(entries)

/** Builds the taxonomy from merged rows. Pure — no I/O, so it is unit-testable. */
export const buildIndustryTaxonomy = (
  entries: ReadonlyArray<{ name: string; industries?: string[] }>
): IndustryTaxonomy => {
  // One row per distinct company. The corpus holds several rows per company (one per
  // link field), and counting them all would scale an industry's weight by how many
  // social profiles that company happens to have.
  const byName = new Map<string, { name: string; industries?: string[] }>()
  for (const entry of entries) {
    if (!byName.has(entry.name)) {
      byName.set(entry.name, entry)
    }
  }

  const distinct = [...byName.values()]
  const counts = new Map<string, number>()
  let companiesWithIndustries = 0

  for (const entry of distinct) {
    const industries = entry.industries
    if (industries === undefined || industries.length === 0) {
      continue
    }

    companiesWithIndustries++

    // A company can repeat a label in malformed data; count it once per company.
    for (const industry of new Set(industries)) {
      counts.set(industry, (counts.get(industry) ?? 0) + 1)
    }
  }

  const industries = [...counts.entries()]
    .filter(([, count]) => count >= MIN_COMPANIES_FOR_LABEL)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count === a.count ? a.name.localeCompare(b.name) : b.count - a.count))

  return {
    companyCount: distinct.length,
    companiesWithIndustries,
    industryCount: industries.length,
    corpusHash: computeIndustryCorpusHash(distinct),
    industries
  }
}

/** Writes the taxonomy, creating the directory when missing. */
export const saveIndustryTaxonomy = (taxonomy: IndustryTaxonomy): void => {
  const validated = IndustryTaxonomySchema.parse(taxonomy)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(validated, null, 2)}\n`, "utf-8")
}

/** Loads the committed taxonomy. Throws when it is missing — never silently empty. */
export const loadIndustryTaxonomy = (): IndustryTaxonomy => {
  if (!fs.existsSync(outputPath)) {
    throw new Error(
      `Industry taxonomy not found at ${outputPath}. Run 'pnpm data --action industry-taxonomy' to generate it.`
    )
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(outputPath, "utf-8"))
  return IndustryTaxonomySchema.parse(parsed)
}

export const run = (): IndustryTaxonomy => {
  log(`Reading merged data from ${mergedDataPath}`)
  const raw: unknown = JSON.parse(fs.readFileSync(mergedDataPath, "utf-8"))
  const merged = MergedDataFileSchema.parse(raw)

  const taxonomy = buildIndustryTaxonomy(merged)

  if (taxonomy.industryCount === 0) {
    throw new Error("Built an empty industry taxonomy. The merged data has no industries — refusing to write it.")
  }

  saveIndustryTaxonomy(taxonomy)
  log(
    `Wrote ${taxonomy.industryCount} industries from ${taxonomy.companiesWithIndustries}/${taxonomy.companyCount} companies to ${outputPath}`
  )

  return taxonomy
}
