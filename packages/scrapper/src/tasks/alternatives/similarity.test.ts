import { describe, expect, it } from "vitest"

import {
  assertIndexFresh,
  buildCorpusText,
  cosineInt8,
  gateByIndustries,
  quantizeToInt8,
  type IndexMeta,
  type SimilarityHit
} from "./similarity"

const meta = (over: Partial<IndexMeta> = {}): IndexMeta => ({
  formatVersion: 1,
  model: "Xenova/all-MiniLM-L6-v2",
  dimensions: 4,
  count: 2,
  corpusHash: "abc123",
  names: ["A", "B"],
  ...over
})

const hit = (name: string, score: number, industries: string[]): SimilarityHit => ({
  name,
  score,
  industries,
  id: name.toLowerCase()
})

describe("buildCorpusText", () => {
  it("joins name, description and industries", () => {
    expect(buildCorpusText({ name: "Wix", description: "Site builder", industries: ["Internet"] })).toBe(
      "Wix. Site builder. Internet"
    )
  })

  it("skips missing parts without leaving separators", () => {
    expect(buildCorpusText({ name: "Wix" })).toBe("Wix")
    expect(buildCorpusText({ name: "Wix", industries: [] })).toBe("Wix")
  })
})

describe("quantizeToInt8", () => {
  it("maps unit-range values onto the int8 range", () => {
    const out = quantizeToInt8(new Float32Array([1, 0, -1, 0.5]))
    expect(Array.from(out)).toEqual([127, 0, -127, 64])
  })

  it("clamps values outside the unit range instead of wrapping", () => {
    // Wrapping would silently invert a vector's direction.
    const out = quantizeToInt8(new Float32Array([2, -2]))
    expect(Array.from(out)).toEqual([127, -127])
  })
})

describe("cosineInt8", () => {
  it("returns 1 for identical vectors", () => {
    const a = quantizeToInt8(new Float32Array([0.5, 0.5, 0.5, 0.5]))
    expect(cosineInt8(a, a, 0, 4)).toBeCloseTo(1, 5)
  })

  it("returns -1 for opposite vectors", () => {
    const a = quantizeToInt8(new Float32Array([1, 0]))
    const b = quantizeToInt8(new Float32Array([-1, 0]))
    expect(cosineInt8(a, b, 0, 2)).toBeCloseTo(-1, 5)
  })

  it("returns 0 for orthogonal vectors", () => {
    const a = quantizeToInt8(new Float32Array([1, 0]))
    const b = quantizeToInt8(new Float32Array([0, 1]))
    expect(cosineInt8(a, b, 0, 2)).toBeCloseTo(0, 5)
  })

  it("reads the target vector at the given offset", () => {
    const a = quantizeToInt8(new Float32Array([1, 0]))
    const stored = new Int8Array([
      ...quantizeToInt8(new Float32Array([0, 1])),
      ...quantizeToInt8(new Float32Array([1, 0]))
    ])

    expect(cosineInt8(a, stored, 0, 2)).toBeCloseTo(0, 5)
    expect(cosineInt8(a, stored, 2, 2)).toBeCloseTo(1, 5)
  })

  it("throws on a zero-length vector rather than returning NaN", () => {
    const zero = new Int8Array([0, 0])
    expect(() => cosineInt8(zero, zero, 0, 2)).toThrow(/Zero-length vector/)
  })

  it("throws when the query vector is the wrong width", () => {
    // Silently comparing a 2-dim query against the first 2 of a 384-dim row would return a
    // plausible number for a meaningless comparison.
    const query = quantizeToInt8(new Float32Array([1, 0]))
    const stored = new Int8Array(384)
    expect(() => cosineInt8(query, stored, 0, 384)).toThrow(/dimensions/)
  })

  it("throws when the stored block is too short", () => {
    const query = quantizeToInt8(new Float32Array([1, 0, 0, 0]))
    const stored = new Int8Array(4)
    expect(() => cosineInt8(query, stored, 2, 4)).toThrow(/shorter than 4 dimensions/)
  })
})

describe("assertIndexFresh", () => {
  it("accepts a matching hash", () => {
    expect(() => assertIndexFresh(meta({ corpusHash: "abc123" }), "abc123")).not.toThrow()
  })

  it("rejects a stale index with an actionable message", () => {
    expect(() => assertIndexFresh(meta({ corpusHash: "old" }), "new")).toThrow(/stale/i)
    expect(() => assertIndexFresh(meta({ corpusHash: "old" }), "new")).toThrow(/alternatives-index/)
  })
})

describe("gateByIndustries", () => {
  const hits = [hit("A", 0.9, ["Events"]), hit("B", 0.8, ["Video"]), hit("C", 0.7, ["Events", "Video"])]

  it("keeps hits matching any selected industry", () => {
    expect(gateByIndustries(hits, ["Events"]).map((h) => h.name)).toEqual(["A", "C"])
  })

  it("preserves score ordering", () => {
    const gated = gateByIndustries(hits, ["Video"])
    expect(gated.map((h) => h.score)).toEqual([0.8, 0.7])
  })

  it("throws on an empty industry set instead of silently passing or dropping everything", () => {
    expect(() => gateByIndustries(hits, [])).toThrow(/empty industry set/)
  })

  it("returns an empty list when nothing matches", () => {
    expect(gateByIndustries(hits, ["Biotech"])).toEqual([])
  })
})
