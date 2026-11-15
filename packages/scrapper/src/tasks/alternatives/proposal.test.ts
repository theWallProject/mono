import { describe, expect, it } from "vitest"

import {
  buildProposal,
  loadProposal,
  ProposalSchema,
  proposalPathFor,
  proposalSlug,
  resolveApprovedCandidates,
  saveProposal,
  type Proposal
} from "./proposal"

const proposal = (candidates: Array<{ name: string; score: number }>): Proposal =>
  buildProposal({
    alternative: { n: "BrainsMingle", ws: "https://brainsmingle.com" },
    profileText: "video networking for professionals",
    profileSources: ["jsonLd", "metaDescription"],
    industries: ["Events", "Professional Networking"],
    minScore: 0.35,
    industriesOverridden: false,
    candidates: candidates.map(({ name, score }) => ({ name, score, industries: ["Events"] }))
  })

describe("proposalSlug", () => {
  it("produces a filesystem-safe slug", () => {
    expect(proposalSlug("BrainsMingle")).toBe("brainsmingle")
    expect(proposalSlug("Sage Pair Ltd.")).toBe("sage-pair-ltd")
    expect(proposalSlug("  A/B:C  ")).toBe("a-b-c")
  })
})

describe("proposalPathFor", () => {
  it("derives the path from the slug", () => {
    expect(proposalPathFor("BrainsMingle")).toMatch(/alternatives\/brainsmingle\.json$/)
  })
})

describe("ProposalSchema", () => {
  it("rejects a candidate without a score", () => {
    const invalid = { ...proposal([{ name: "A", score: 0.5 }]), candidates: [{ name: "A", industries: [] }] }
    expect(ProposalSchema.safeParse(invalid).success).toBe(false)
  })

  it("rejects an alternative with a non-URL website", () => {
    const invalid = { ...proposal([{ name: "A", score: 0.5 }]), alternative: { n: "X", ws: "not a url" } }
    expect(ProposalSchema.safeParse(invalid).success).toBe(false)
  })

  it("rejects unknown fields so a stale proposal cannot smuggle extra data", () => {
    const invalid = { ...proposal([{ name: "A", score: 0.5 }]), surprise: true }
    expect(ProposalSchema.safeParse(invalid).success).toBe(false)
  })
})

describe("saveProposal / loadProposal", () => {
  it("round-trips through disk", () => {
    const written = saveProposal(proposal([{ name: "Vidstart", score: 0.55 }]))
    const loaded = loadProposal(written)

    expect(loaded.alternative.n).toBe("BrainsMingle")
    expect(loaded.candidates[0]?.name).toBe("Vidstart")
  })

  it("throws with an actionable message when the file is missing", () => {
    expect(() => loadProposal("/nonexistent/nope.json")).toThrow(/alternatives-propose/)
  })
})

describe("resolveApprovedCandidates", () => {
  const base = proposal([
    { name: "Vidstart", score: 0.55 },
    { name: "Team Me", score: 0.53 },
    { name: "Qwilt", score: 0.45 }
  ])

  it("returns the approved subset in the order given", () => {
    const approved = resolveApprovedCandidates(base, ["Team Me", "Vidstart"])
    expect(approved.map((candidate) => candidate.name)).toEqual(["Team Me", "Vidstart"])
  })

  it("carries scores through so the write stays traceable", () => {
    const [first] = resolveApprovedCandidates(base, ["Vidstart"])
    expect(first?.score).toBe(0.55)
  })

  it("refuses a name that is not in the proposal", () => {
    // The guard that makes "apply what was reviewed" real rather than aspirational.
    expect(() => resolveApprovedCandidates(base, ["Some Other Company"])).toThrow(/not in the proposal/)
  })

  it("names the offending companies so the mistake is obvious", () => {
    expect(() => resolveApprovedCandidates(base, ["Vidstart", "Typo Inc"])).toThrow(/Typo Inc/)
  })

  it("refuses an empty approval list rather than applying nothing silently", () => {
    expect(() => resolveApprovedCandidates(base, [])).toThrow(/No companies approved/)
  })

  it("refuses duplicates", () => {
    expect(() => resolveApprovedCandidates(base, ["Vidstart", "Vidstart"])).toThrow(/Duplicate/)
  })

  it("accepts every candidate when all are approved", () => {
    expect(resolveApprovedCandidates(base, ["Vidstart", "Team Me", "Qwilt"])).toHaveLength(3)
  })
})

describe("buildProposal", () => {
  it("stamps a timestamp and preserves the query provenance", () => {
    const built = proposal([{ name: "A", score: 0.5 }])

    expect(built.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(built.profileText).toBe("video networking for professionals")
    expect(built.profileSources).toEqual(["jsonLd", "metaDescription"])
  })

  it("records whether industries were inferred or supplied", () => {
    expect(proposal([{ name: "A", score: 0.5 }]).industriesOverridden).toBe(false)
  })
})
