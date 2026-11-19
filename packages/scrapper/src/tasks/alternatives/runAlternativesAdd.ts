/**
 * Two-step alternatives flow: propose, review, then apply.
 *
 * Step 1 (`proposeAlternatives`) is fully automated: guard, fetch, infer industries, rank
 * the corpus, write a proposal file. It NEVER touches manualOverrides.
 *
 * Step 2 (`applyAlternatives`) writes only the names a human or agent approved after
 * reading that proposal.
 *
 * The split is deliberate. The automated ranking is a candidate generator, not a decision:
 * on the reference case its top 25 held video-CDN vendors, a subtitling service and a
 * video-indexing company alongside the genuine hits, because "video" dominates the
 * descriptions either way. The judgement has to happen against the actual list.
 */

import fs from "fs"
import path from "path"

import { getRegisteredDomain } from "@theWallProject/common"

import { log } from "../../helper"
import { MergedDataFileSchema } from "../../types"
import { checkAbsence, type CorpusEntry } from "./absenceCheck"
import { buildProfileText, fetchCompanyProfile } from "./companyProfile"
import { buildIndustryTaxonomyHashInput, loadIndustryTaxonomy } from "./industryTaxonomy"
import {
  buildProposal,
  loadProposal,
  resolveApprovedCandidates,
  saveProposal,
  type Proposal,
  type ProposalCandidate
} from "./proposal"
import { assertIndexFresh, gateByIndustries, loadIndex, rankBySimilarity, type SimilarityHit } from "./similarity"
import { appendAlternativeToCompanies, type WrittenCompany } from "./alternativeWriter"

const mergedDataPath = path.join(__dirname, "../../../results/2_merged/2_MERGED_ALL.json")

export type ProposeOptions = {
  name: string
  website: string
  /** How many candidates to put in the proposal. Generous by default: review is the filter. */
  limit: number
  /** Required. Industries to gate on — chosen by the caller, never inferred. */
  industries: string[]
  minScore: number
}

export type ProposeResult = {
  alternative: { n: string; ws: string }
  profileText: string
  industries: string[]
  industriesOverridden: boolean
  /** Where the proposal was written. */
  proposalPath: string
  candidates: ProposalCandidate[]
  rejectedBelowScore: number
}

/** Loads distinct companies from the merged corpus — the same view the index is built from. */
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

/** Corpus fingerprint shared with the index and the taxonomy. */
export const computeAlternativesCorpusHash = (
  corpus: ReadonlyArray<{ name: string; description?: string; industries?: string[] }>
): string => buildIndustryTaxonomyHashInput(corpus)

/**
 * Generates a proposal. Writes a file describing the candidates; writes nothing to the
 * curated override data.
 */
export const proposeAlternatives = async (options: ProposeOptions): Promise<ProposeResult> => {
  const websiteDomain = getRegisteredDomain(options.website)
  log(`Checking whether "${options.name}" (${websiteDomain}) is already in the database...`)

  const corpus = loadCorpus()

  const verdict = checkAbsence({ name: options.name, website: options.website }, corpus)

  if (!verdict.absent) {
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

  const profile = await fetchCompanyProfile(options.website)
  const profileText = buildProfileText(profile)

  if (profileText.length === 0) {
    throw new Error(`No usable description found for ${options.website}; cannot build a similarity query.`)
  }

  log(`Profile: ${profileText.slice(0, 160)}${profileText.length > 160 ? "..." : ""}`)

  const taxonomy = loadIndustryTaxonomy()
  const industryNames = taxonomy.industries.map((entry) => entry.name)

  // Industries are required and are never inferred. Inference measured badly on the
  // reference case: the generic buckets (Video, Video Streaming, Video Editing) outscore
  // the specific ones (Professional Networking, Events, Communities), so an inferred gate
  // admits video-infrastructure vendors as "competitors" of a networking platform. The
  // caller supplies the gate; the tool does not guess it.
  const industries = validateSuppliedIndustries(options.industries, industryNames)

  log(`Industries: ${industries.join(", ")}`)

  const { meta } = loadIndex()
  assertIndexFresh(meta, computeAlternativesCorpusHash(corpus))

  const ranked: SimilarityHit[] = await rankBySimilarity(profileText, corpus)
  const gated = gateByIndustries(ranked, industries)
  const aboveFloor = gated.filter((hit) => hit.score >= options.minScore)
  const rejectedBelowScore = gated.length - aboveFloor.length

  if (aboveFloor.length === 0) {
    throw new Error(
      `No candidates. ${gated.length} passed the industry gate but none reached a similarity of ` +
        `${options.minScore.toFixed(2)}.`
    )
  }

  const candidates: ProposalCandidate[] = aboveFloor.slice(0, options.limit).map((hit) => ({
    name: hit.name,
    score: Number(hit.score.toFixed(4)),
    industries: hit.industries,
    ...(hit.description !== undefined ? { description: hit.description } : {})
  }))

  const proposal = buildProposal({
    alternative: { n: options.name, ws: options.website },
    profileText,
    profileSources: profile.sources,
    industries,
    minScore: options.minScore,
    industriesOverridden: true,
    candidates
  })

  const proposalPath = saveProposal(proposal)
  log(`Proposal written to ${proposalPath}`)

  return {
    alternative: proposal.alternative,
    profileText,
    industries,
    industriesOverridden: true,
    proposalPath,
    candidates,
    rejectedBelowScore
  }
}

export type ApplyResult = {
  alternative: { n: string; ws: string }
  applied: string[]
  written: WrittenCompany[]
}

/**
 * Writes the approved subset of a proposal.
 *
 * Every name must come from that proposal. Writing cannot be reached without an explicit
 * list, which is the property that was missing before: the tool used to decide and write in
 * one step, leaving review to happen after the curated data had already changed.
 */
export const applyAlternatives = async (
  proposalPath: string,
  approvedNames: readonly string[]
): Promise<ApplyResult> => {
  const proposal = loadProposal(proposalPath)
  const approved = resolveApprovedCandidates(proposal, approvedNames)

  log(
    `Applying "${proposal.alternative.n}" to ${approved.length} approved companies ` +
      `(proposal has ${proposal.candidates.length}).`
  )

  const writeResult = await appendAlternativeToCompanies(
    approved.map((candidate) => candidate.name),
    proposal.alternative
  )

  return {
    alternative: proposal.alternative,
    applied: approved.map((candidate) => candidate.name),
    written: writeResult.written
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

export type { Proposal }
