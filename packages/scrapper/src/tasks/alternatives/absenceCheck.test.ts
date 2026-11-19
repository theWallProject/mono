import { describe, expect, it } from "vitest"

import { checkAbsence, normalizeCompanyName, toRegisteredDomain, type CollisionMatch, type CorpusEntry } from "./absenceCheck"

const entry = (over: Partial<CorpusEntry> & { id: string; name: string }): CorpusEntry => ({ ...over })

const CORPUS: CorpusEntry[] = [
  entry({ id: "wix", name: "Wix", ws: "wix.com" }),
  entry({ id: "wix_manual_ws_ja", name: "Wix", ws: "ja.wix.com" }),
  entry({ id: "brainsway", name: "Brainsway", ws: "brainsway.com" }),
  entry({ id: "brainstorm", name: "BrainStorm Cell Therapeutics", ws: "brainstormcell.com" }),
  entry({ id: "monday", name: "monday.com", ws: "monday.com" })
]

/**
 * Narrows to the collision case and returns its matches.
 *
 * Keeps the tests free of conditionals: an "absent" verdict here is a hard failure with
 * the reason, rather than a branch the linter has to tolerate.
 */
const requireMatches = (verdict: ReturnType<typeof checkAbsence>): CollisionMatch[] => {
  if (verdict.absent) {
    throw new Error("Expected a collision but the company was reported absent.")
  }
  return verdict.matches
}

describe("normalizeCompanyName", () => {
  it("ignores case, spacing and punctuation", () => {
    expect(normalizeCompanyName("Brain Storm")).toBe(normalizeCompanyName("brainstorm"))
    expect(normalizeCompanyName("monday.com")).toBe("mondaycom")
    expect(normalizeCompanyName("  BrainsMingle  ")).toBe("brainsmingle")
  })
})

describe("toRegisteredDomain", () => {
  it("reduces a scheme, www and subdomains to the registrable domain", () => {
    expect(toRegisteredDomain("https://www.wix.com")).toBe("wix.com")
    expect(toRegisteredDomain("ja.wix.com")).toBe("wix.com")
    expect(toRegisteredDomain("blog.wix.com")).toBe("wix.com")
  })

  it("handles multi-part public suffixes", () => {
    expect(toRegisteredDomain("https://www.example.co.uk")).toBe("example.co.uk")
  })
})

describe("checkAbsence", () => {
  it("reports an absent company as absent", () => {
    const verdict = checkAbsence({ name: "BrainsMingle", website: "https://brainsmingle.com" }, CORPUS)
    expect(verdict).toEqual({ absent: true })
  })

  it("collides on an exact name even when the domain is new", () => {
    const matches = requireMatches(checkAbsence({ name: "Wix", website: "https://brand-new-wix.com" }, CORPUS))

    expect(matches.some((m) => m.kind === "name")).toBe(true)
  })

  it("collides on an exact domain even when the name is new", () => {
    // The realistic case: our row is a legal entity, the user typed the product name.
    const matches = requireMatches(checkAbsence({ name: "Totally Other Name", website: "https://wix.com" }, CORPUS))

    expect(matches.some((m) => m.kind === "domain")).toBe(true)
  })

  it("collides through a subdomain", () => {
    const verdict = checkAbsence({ name: "Something", website: "https://careers.wix.com" }, CORPUS)
    expect(verdict.absent).toBe(false)
  })

  it("collides through a stored subdomain", () => {
    // ja.wix.com is stored on a separate row; it must still reduce to wix.com.
    const verdict = checkAbsence({ name: "Something", website: "https://wix.com" }, CORPUS)
    expect(verdict.absent).toBe(false)
  })

  it("reports each company once even though the corpus has several rows for it", () => {
    const matches = requireMatches(checkAbsence({ name: "Wix", website: "https://wix.com" }, CORPUS))

    const wixMatches = matches.filter((m) => m.name === "Wix")
    expect(wixMatches).toHaveLength(1)
  })

  it("does not fire on companies that merely share a token", () => {
    // BrainsMingle shares "brain" with Brainsway and BrainStorm. Blocking on that would
    // reject a legitimate addition, so exact-name matching must not leak into substring.
    const verdict = checkAbsence({ name: "BrainsMingle", website: "https://brainsmingle.com" }, CORPUS)
    expect(verdict.absent).toBe(true)
  })

  it("does not fire on an unrelated company with a similar domain", () => {
    const verdict = checkAbsence({ name: "BrainsMingle", website: "https://brainsway-cdn.com" }, CORPUS)
    expect(verdict.absent).toBe(true)
  })

  it("throws when the name carries no comparable characters", () => {
    expect(() => checkAbsence({ name: "---", website: "https://x.com" }, CORPUS)).toThrow(
      /normalizes to nothing/
    )
  })

  it("throws when the website has no registrable domain", () => {
    expect(() => checkAbsence({ name: "Acme", website: "localhost" }, CORPUS)).toThrow(/no registrable domain/)
  })
})
