/**
 * `--action alternatives-add`: attach a clean alternative to its competitors in our corpus.
 *
 * The flow, in order, each step a hard gate:
 *
 *   1. Refuse if the company is already in our database. Mido's requirement is explicit:
 *      "I have an alternative that I know is not in our database, you should inform me
 *      otherwise and stop." Stopping means stopping — nothing is fetched or written.
 *   2. Fetch the company's own profile (JSON-LD / meta description). No profile means no
 *      query, and a vague query produces a confident wrong answer.
 *   3. Choose which of OUR industries describe it, by zero-shot match against the taxonomy.
 *   4. Rank the whole corpus by embedding similarity.
 *   5. Gate on those industries. The gate filters; it never reorders — measured, letting
 *      industry overlap influence the score put broadcast hardware vendors above real
 *      competitors.
 *   6. Attach the alternative to the survivors, or (with --dryRun) just report them.
 *
 * Every step that can fail loudly does: a stale index, an empty profile, an empty gate and
 * an empty result set all throw rather than producing a plausible-looking empty answer.
 */

import fs from "fs"
import path from "path"

import { getRegisteredDomain } from "@theWallProject/common"

import { error, log } from "../../helper"
import { MergedDataFileSchema } from "../../types"
import { checkAbsence, type CorpusEntry } from "./absenceCheck"
import { buildProfileText, fetchCompanyProfile, type CompanyProfile } from "./companyProfile"
import { buildIndustryTaxonomyHashInput, loadIndustryTaxonomy } from "./industryTaxonomy"
import { inferIndustries } from "./industrySelection"
import {
  assertIndexFresh,
  buildCorpusText,
  EMBEDDING_DIMENSIONS,
  gateByIndustries,
  loadIndex,
  rankBySimilarity,
  type SimilarityHit
} from "./similarity"
import { appendAlternativeToCompanies, type WrittenCompany } from "./alternativeWriter"

const mergedDataPath = path.join(__dirname, "../../../results/2_merged/2_MERGED_ALL.json")

export type AlternativesAddOptions = {
  /** Company being added as an alternative. */
  name: string
  /** Its website. */
  website: string
  /** How many competitors to attach to. */
  limit: number
  /** Skip writing; report what would happen. */
  dryRun: boolean
  /** Override the automatically selected industries. */
  industries?: string[] | undefined
  /** Reject hits below this similarity. */
  minScore: number
}

export type AlternativesAddResult = {
  /** Company name as supplied. */
  name: string
  /** The profile text actually used as the query. */
  profileText: string
  /** Profile provenance, so a weak profile is visible. */
  profileSources: CompanyProfile["sources"]
  /** Industries the gate used. */
  industries: string[]
  /** Companies that would receive / received the alternative. */
  selected: Array<{ name: string; score: number; industries: string[] }>
  /** Per-company write outcome (empty on a dry run). */
  written: WrittenCompany[]
  /** Companies below `minScore` that were therefore not attached. */
  rejectedBelowScore: number
  /** True when nothing was written. */
  dryRun: boolean
}

/** Loads distinct companies from the merged corpus, the same view the index is built from. */
export const loadCorpus = (): Array<CorpusEntry & { description?: string; industries?: string[] }> => {
  const raw = fs.readFileSync(mergedDataPath, "utf-8")
  const parsed = MergedDataFileSchema.parse(JSON.parse(raw))

  const byName = new Map<string, CorpusEntry & { description?: string; industries?: string[] }>()
  for (const entry of parsed) {
    if (byName.has(entry.name)) {
      continue
    }
    byName.set(entry.name, {
      id: entry.id,
      name: entry.name,
      ...(entry.ws !== undefined ? { ws: entry.ws } : {}),
      ...(entry.li !== undefined ? { li: entry.li } : {}),
      ...(entry.fb !== undefined ? { fb: entry.fb } : {}),
      ...(entry.tw !== undefined ? { tw: entry.tw } : {}),
      ...(entry.ig !== undefined ? { ig: entry.ig } : {}),
      ...(entry.gh !== undefined ? { gh: entry.gh } : {}),
      ...(entry.ytp !== undefined ? { ytp: entry.ytp } : {}),
      ...(entry.ytc !== undefined ? { ytc: entry.ytc } : {}),
      ...(entry.tt !== undefined ? { tt: entry.tt } : {}),
      ...(entry.th !== undefined ? { th: entry.th } : {}),
      ...(entry.description !== undefined ? { description: entry.description } : {}),
      ...(entry.industries !== undefined ? { industries: entry.industries } : {})
    })
  }

  return [...byName.values()]
}

/**
 * Computes the corpus fingerprint for a set of companies.
 *
 * Must match exactly what the index was built with, so it derives from `buildCorpusText`
 * over the same distinct-company view.
 */
export const computeAlternativesCorpusHash = (
  corpus: ReadonlyArray<{ name: string; description?: string; industries?: string[] }>
): string => buildIndustryTaxonomyHashInput(corpus)

export const runAlternativesAdd = async (options: AlternativesAddOptions): Promise<AlternativesAddResult> => {
  const websiteDomain = getRegisteredDomain(options.website)
  log(`Checking whether "${options.name}" (${websiteDomain}) is already in the database...`)

  const corpus = loadCorpus()

  // ── 1. Hard stop when the company is already ours ──────────────────────────────
  const verdict = checkAbsence({ name: options.name, website: options.website }, corpus)

  if (!verdict.absent) {
    // Cap the list: a platform domain (wix.com) also matches every customer site hosted on a
    // subdomain of it, so a legitimate collision can arrive with dozens of rows attached.
    const MAX_REPORTED = 10
    const reported = verdict.matches.slice(0, MAX_REPORTED)
    const detail = reported
      .map((match) => `  - ${match.name} (id ${match.id}, matched by ${match.kind}: "${match.matchedValue}")`)
      .join("\n")
    const remaining = verdict.matches.length - reported.length

    throw new Error(
      `"${options.name}" is already in the database, so it cannot be added as an alternative:\n${detail}` +
        (remaining > 0 ? `\n  ...and ${remaining} more` : "") +
        "\nNothing was fetched or written."
    )
  }

  log(`"${options.name}" is not in the database. Continuing.`)

  // ── 2. Profile ────────────────────────────────────────────────────────────────
  const profile = await fetchCompanyProfile(options.website)
  const profileText = buildProfileText(profile)

  if (profileText.length === 0) {
    throw new Error(`No usable description found for ${options.website}; cannot build a similarity query.`)
  }

  log(`Profile: ${profileText.slice(0, 160)}${profileText.length > 160 ? "..." : ""}`)

  // ── 3. Industries ─────────────────────────────────────────────────────────────
  const taxonomy = loadIndustryTaxonomy()
  const industryNames = taxonomy.industries.map((entry) => entry.name)

  const industries =
    options.industries !== undefined && options.industries.length > 0
      ? validateSuppliedIndustries(options.industries, industryNames)
      : (await inferIndustries(profileText, industryNames)).selected

  log(`Industries: ${industries.join(", ")}`)

  // ── 4. Similarity ─────────────────────────────────────────────────────────────
  const { meta } = loadIndex()
  assertIndexFresh(meta, computeAlternativesCorpusHash(corpus))

  const ranked: SimilarityHit[] = await rankBySimilarity(profileText, corpus)

  // ── 5. Gate, then score floor ─────────────────────────────────────────────────
  const gated = gateByIndustries(ranked, industries)
  const aboveFloor = gated.filter((hit) => hit.score >= options.minScore)
  const rejectedBelowScore = gated.length - aboveFloor.length
  const selected = aboveFloor.slice(0, options.limit)

  if (selected.length === 0) {
    throw new Error(
      `No companies matched. ${gated.length} passed the industry gate but none reached a similarity of ` +
        `${options.minScore.toFixed(2)}. Nothing to attach to.`
    )
  }

  const selectedNames = selected.map((hit) => hit.name)

  // ── 6. Write ──────────────────────────────────────────────────────────────────
  if (options.dryRun) {
    log(`Dry run: would attach "${options.name}" to ${selectedNames.length} companies.`)
    return {
      name: options.name,
      profileText,
      profileSources: profile.sources,
      industries,
      selected: selected.map((hit) => ({ name: hit.name, score: hit.score, industries: hit.industries })),
      written: [],
      rejectedBelowScore,
      dryRun: true
    }
  }

  const writeResult = await appendAlternativeToCompanies(selectedNames, {
    n: options.name,
    ws: options.website
  })

  return {
    name: options.name,
    profileText,
    profileSources: profile.sources,
    industries,
    selected: selected.map((hit) => ({ name: hit.name, score: hit.score, industries: hit.industries })),
    written: writeResult.written,
    rejectedBelowScore,
    dryRun: false
  }
}

/**
 * Validates `--industries` against the taxonomy.
 *
 * A typo'd industry would silently gate to nothing, which reads as "no competitors found"
 * rather than "you misspelled Events".
 */
export const validateSuppliedIndustries = (
  supplied: readonly string[],
  taxonomyNames: readonly string[]
): string[] => {
  const known = new Map(taxonomyNames.map((name) => [name.toLowerCase(), name]))
  const unknown: string[] = []
  const resolved: string[] = []

  for (const name of supplied) {
    const match = known.get(name.trim().toLowerCase())
    if (match === undefined) {
      unknown.push(name)
      continue
    }
    if (!resolved.includes(match)) {
      resolved.push(match)
    }
  }

  if (unknown.length > 0) {
    throw new Error(
      `Unknown industries: ${unknown.join(", ")}. They must be exact names from the taxonomy ` +
        "(see static_data/industry_taxonomy.json)."
    )
  }

  return resolved
}

export { error, EMBEDDING_DIMENSIONS, buildCorpusText }
