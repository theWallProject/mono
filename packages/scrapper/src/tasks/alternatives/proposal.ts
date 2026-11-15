/**
 * The proposal file: the hand-off point between automation and review.
 *
 * The split exists because the automated ranking is not trustworthy enough to write
 * directly. On the reference case (brainsmingle.com) the unfiltered top 25 contained
 * video-CDN vendors, a subtitling shop and a video-indexing company — all sharing the
 * token "video", none able to replace a networking platform. Writing that list into the
 * curated override file without a human or agent looking at it was wrong, so:
 *
 *   propose  → ranks candidates, writes a proposal, touches nothing else
 *   apply    → takes an explicitly approved subset of that proposal and writes it
 *
 * `apply` refuses any name that is not in the proposal it was given, so the two steps
 * cannot drift apart and a typo cannot attach an alternative to an unrelated company.
 */

import fs from "fs"
import path from "path"
import { z } from "zod"

import type { CompanyProfile } from "./companyProfile"

const proposalsDir = path.join(__dirname, "../../../results/alternatives")

export const ProposalCandidateSchema = z
  .object({
    name: z.string().min(1),
    score: z.number(),
    industries: z.array(z.string()),
    description: z.string().optional()
  })
  .strict()

export const ProposalSchema = z
  .object({
    /** Company being offered as the alternative. */
    alternative: z.object({ n: z.string().min(1), ws: z.string().url() }).strict(),
    /** When the proposal was generated. */
    generatedAt: z.string(),
    /** Text the ranking used, so a reviewer can see what was actually compared. */
    profileText: z.string(),
    /** Which sources produced that text. */
    profileSources: z.array(z.enum(["jsonLd", "metaDescription", "title"])),
    /** Industries the gate used. */
    industries: z.array(z.string()),
    /** Similarity floor applied. */
    minScore: z.number(),
    /** Ranked candidates, best first. */
    candidates: z.array(ProposalCandidateSchema),
    /** True when the industries were supplied by the caller rather than inferred. */
    industriesOverridden: z.boolean()
  })
  .strict()

export type Proposal = z.infer<typeof ProposalSchema>
export type ProposalCandidate = z.infer<typeof ProposalCandidateSchema>

/** Filesystem-safe slug for the alternative's name. */
export const proposalSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const proposalPathFor = (name: string): string =>
  path.join(proposalsDir, `${proposalSlug(name)}.proposal.json`)

/** Writes the proposal, creating the directory when missing. */
export const saveProposal = (proposal: Proposal): string => {
  const validated = ProposalSchema.parse(proposal)
  const target = proposalPathFor(validated.alternative.n)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(validated, null, 2)}\n`, "utf-8")
  return target
}

/** Loads a proposal by explicit path. Throws when missing or malformed. */
export const loadProposal = (proposalPath: string): Proposal => {
  if (!fs.existsSync(proposalPath)) {
    throw new Error(`Proposal not found at ${proposalPath}. Run --action alternatives-propose first.`)
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(proposalPath, "utf-8"))
  return ProposalSchema.parse(parsed)
}

/**
 * Resolves the approved names against a proposal.
 *
 * Every requested name must appear in the proposal. This is the guard that makes "apply
 * what was reviewed" true rather than aspirational: a name from anywhere else — a typo, a
 * hand-written override, a stale list from a different run — is refused rather than
 * silently attached.
 */
export const resolveApprovedCandidates = (
  proposal: Proposal,
  approvedNames: readonly string[]
): ProposalCandidate[] => {
  if (approvedNames.length === 0) {
    throw new Error("No companies approved. Pass --names with the names you have reviewed.")
  }

  const byName = new Map(proposal.candidates.map((candidate) => [candidate.name, candidate]))
  const duplicates = approvedNames.filter((name, i) => approvedNames.indexOf(name) !== i)
  if (duplicates.length > 0) {
    throw new Error(`Duplicate names in --names: ${[...new Set(duplicates)].join(", ")}.`)
  }

  const unknown = approvedNames.filter((name) => !byName.has(name))
  if (unknown.length > 0) {
    throw new Error(
      `These names are not in the proposal for "${proposal.alternative.n}": ${unknown.join(", ")}. ` +
        "Only candidates from the reviewed proposal can be applied."
    )
  }

  return approvedNames.map((name) => {
    const candidate = byName.get(name)
    if (candidate === undefined) {
      throw new Error(`Internal inconsistency: "${name}" passed validation but is not in the proposal map.`)
    }
    return candidate
  })
}

/** Builds a proposal object from pipeline output. */
export const buildProposal = (input: {
  alternative: { n: string; ws: string }
  profileText: string
  profileSources: CompanyProfile["sources"]
  industries: string[]
  minScore: number
  industriesOverridden: boolean
  candidates: ProposalCandidate[]
}): Proposal =>
  ProposalSchema.parse({
    alternative: input.alternative,
    generatedAt: new Date().toISOString(),
    profileText: input.profileText,
    profileSources: input.profileSources,
    industries: input.industries,
    minScore: input.minScore,
    industriesOverridden: input.industriesOverridden,
    candidates: input.candidates
  })
