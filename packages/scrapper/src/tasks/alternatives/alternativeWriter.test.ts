import { beforeEach, describe, expect, it, vi } from "vitest"

// `vi.mock` is hoisted above imports, so the factories cannot reference outer variables.
// `vi.hoisted` creates them first.
const mocks = vi.hoisted(() => ({
  loadManualOverrides: vi.fn(),
  saveManualOverrides: vi.fn()
}))

vi.mock("../manual_resolve/loaders", () => ({ loadManualOverrides: mocks.loadManualOverrides }))
vi.mock("../validate/override_io", () => ({ saveManualOverrides: mocks.saveManualOverrides }))

import {
  appendAlternativeToCompanies,
  normalizeAlternativeUrl,
  readExistingAlternatives,
  removeAlternativeFromCompanies
} from "./alternativeWriter"

const { loadManualOverrides, saveManualOverrides } = mocks

// The writer's IO is the override file, which is exercised end-to-end by the CLI rather
// than in unit tests. These cover the pure rules that decide what gets written.
const ALTERNATIVE = { n: "BrainsMingle", ws: "https://brainsmingle.com" }

beforeEach(() => {
  vi.clearAllMocks()
  loadManualOverrides.mockReturnValue({})
})

describe("normalizeAlternativeUrl", () => {
  it("treats scheme, www and trailing slash as non-identity", () => {
    const variants = [
      "https://brainsmingle.com",
      "http://brainsmingle.com/",
      "brainsmingle.com",
      "https://www.brainsmingle.com"
    ]
    const normalized = new Set(variants.map(normalizeAlternativeUrl))

    expect(normalized.size).toBe(1)
  })

  it("keeps genuinely different sites distinct", () => {
    expect(normalizeAlternativeUrl("https://a.com")).not.toBe(normalizeAlternativeUrl("https://b.com"))
  })
})

describe("readExistingAlternatives", () => {
  it("returns an empty list for a missing override", () => {
    expect(readExistingAlternatives(undefined)).toEqual([])
  })

  it("returns an empty list for an override without alt", () => {
    expect(readExistingAlternatives({ ws: ["https://wix.com"] })).toEqual([])
  })

  it("reads stored alternatives", () => {
    const alt = [{ n: "Tilda", ws: "https://tilda.cc" }]
    expect(readExistingAlternatives({ alt })).toEqual(alt)
  })

  it("drops malformed entries instead of propagating them", () => {
    const stored = [{ n: "Good", ws: "https://good.com" }, { n: 1, ws: "https://bad.com" }, null]
    // @ts-expect-error -- deliberately malformed input from an untyped JSON-era file
    expect(readExistingAlternatives({ alt: stored })).toEqual([{ n: "Good", ws: "https://good.com" }])
  })
})

describe("appendAlternativeToCompanies", () => {
  it("creates an alt-only override for a company that had none", async () => {
    // This is the 80% case: most corpus companies have no manual entry at all.
    await appendAlternativeToCompanies(["Sage Pair Ltd."], ALTERNATIVE)

    expect(saveManualOverrides).toHaveBeenCalledTimes(1)
    const written = saveManualOverrides.mock.calls[0]?.[0]
    expect(written["Sage Pair Ltd."]).toEqual({ alt: [ALTERNATIVE] })
  })

  it("preserves existing fields when adding to an existing override", async () => {
    loadManualOverrides.mockReturnValue({ Wix: { ws: ["https://wix.com"], li: ["https://linkedin.com/company/wix"] } })

    await appendAlternativeToCompanies(["Wix"], ALTERNATIVE)

    const written = saveManualOverrides.mock.calls[0]?.[0]
    expect(written.Wix.ws).toEqual(["https://wix.com"])
    expect(written.Wix.li).toEqual(["https://linkedin.com/company/wix"])
    expect(written.Wix.alt).toEqual([ALTERNATIVE])
  })

  it("appends rather than replacing existing alternatives", async () => {
    loadManualOverrides.mockReturnValue({ Wix: { alt: [{ n: "Tilda", ws: "https://tilda.cc" }] } })

    await appendAlternativeToCompanies(["Wix"], ALTERNATIVE)

    const written = saveManualOverrides.mock.calls[0]?.[0]
    expect(written.Wix.alt).toEqual([{ n: "Tilda", ws: "https://tilda.cc" }, ALTERNATIVE])
  })

  it("is idempotent: re-running does not add a duplicate", async () => {
    loadManualOverrides.mockReturnValue({ Wix: { alt: [ALTERNATIVE] } })

    const result = await appendAlternativeToCompanies(["Wix"], ALTERNATIVE)

    expect(saveManualOverrides).not.toHaveBeenCalled()
    expect(result.skipped).toEqual(["Wix"])
    expect(result.written[0]?.added).toBe(false)
  })

  it("recognizes an existing alternative through URL variations", async () => {
    loadManualOverrides.mockReturnValue({ Wix: { alt: [{ n: "BM", ws: "http://www.brainsmingle.com/" }] } })

    const result = await appendAlternativeToCompanies(["Wix"], ALTERNATIVE)

    expect(result.skipped).toEqual(["Wix"])
  })

  it("writes nothing when every company already has the alternative", async () => {
    loadManualOverrides.mockReturnValue({
      A: { alt: [ALTERNATIVE] },
      B: { alt: [ALTERNATIVE] }
    })

    const result = await appendAlternativeToCompanies(["A", "B"], ALTERNATIVE)

    expect(saveManualOverrides).not.toHaveBeenCalled()
    expect(result.written.every((entry) => !entry.added)).toBe(true)
  })

  it("reports per-company alternative counts", async () => {
    loadManualOverrides.mockReturnValue({ A: { alt: [{ n: "X", ws: "https://x.com" }] } })

    const result = await appendAlternativeToCompanies(["A", "B"], ALTERNATIVE)

    expect(result.written).toEqual([
      { name: "A", added: true, alternativeCount: 2 },
      { name: "B", added: true, alternativeCount: 1 }
    ])
  })

  it("passes allowNewKeys because most targets have no override yet", async () => {
    await appendAlternativeToCompanies(["Sage Pair Ltd."], ALTERNATIVE)

    expect(saveManualOverrides.mock.calls[0]?.[1]).toEqual({ allowNewKeys: true })
  })

  it("throws when there is nothing to attach to", async () => {
    await expect(appendAlternativeToCompanies([], ALTERNATIVE)).rejects.toThrow(/No companies/)
  })

  it("throws on an empty alternative name", async () => {
    await expect(appendAlternativeToCompanies(["A"], { n: "  ", ws: "https://x.com" })).rejects.toThrow(/name is empty/)
  })

  it("throws on an empty alternative website", async () => {
    await expect(appendAlternativeToCompanies(["A"], { n: "X", ws: "  " })).rejects.toThrow(/website/)
  })
})

describe("removeAlternativeFromCompanies", () => {
  it("removes the alternative from an entry that has others", async () => {
    loadManualOverrides.mockReturnValue({
      Wix: { alt: [{ n: "Tilda", ws: "https://tilda.cc" }, ALTERNATIVE] }
    })

    await removeAlternativeFromCompanies(["Wix"], ALTERNATIVE)

    const written = saveManualOverrides.mock.calls[0]?.[0]
    expect(written.Wix.alt).toEqual([{ n: "Tilda", ws: "https://tilda.cc" }])
  })

  it("drops the alt key entirely when it was the only alternative", async () => {
    // `alt: []` is a different shape from "no alternatives" and would render an empty popup.
    loadManualOverrides.mockReturnValue({ Wix: { ws: ["https://wix.com"], alt: [ALTERNATIVE] } })

    await removeAlternativeFromCompanies(["Wix"], ALTERNATIVE)

    const written = saveManualOverrides.mock.calls[0]?.[0]
    expect(written.Wix).toEqual({ ws: ["https://wix.com"] })
    expect("alt" in written.Wix).toBe(false)
  })

  it("leaves companies that do not carry the alternative untouched", async () => {
    loadManualOverrides.mockReturnValue({ A: { alt: [ALTERNATIVE] }, B: { alt: [{ n: "X", ws: "https://x.com" }] } })

    const result = await removeAlternativeFromCompanies(["A", "B"], ALTERNATIVE)

    expect(result.removed).toEqual(["A"])
    expect(result.untouched).toEqual(["B"])
  })

  it("matches through URL variations", async () => {
    loadManualOverrides.mockReturnValue({ Wix: { alt: [{ n: "BM", ws: "http://www.brainsmingle.com/" }] } })

    const result = await removeAlternativeFromCompanies(["Wix"], ALTERNATIVE)
    expect(result.removed).toEqual(["Wix"])
  })

  it("throws when no company carries it, rather than reporting a silent success", async () => {
    loadManualOverrides.mockReturnValue({ A: { alt: [{ n: "X", ws: "https://x.com" }] } })

    await expect(removeAlternativeFromCompanies(["A"], ALTERNATIVE)).rejects.toThrow(/Nothing to remove/)
  })

  it("throws when there is nothing to remove from", async () => {
    await expect(removeAlternativeFromCompanies([], ALTERNATIVE)).rejects.toThrow(/No companies/)
  })
})
