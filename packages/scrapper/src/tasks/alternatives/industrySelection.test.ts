import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_INDUSTRY_FLOOR,
  MAX_SELECTED_INDUSTRIES,
  industryToPhrase,
  rankIndustries,
  selectIndustries
} from "./industrySelection"

const scored = (entries: Array<[string, number]>): Array<{ name: string; score: number }> =>
  entries.map(([name, score]) => ({ name, score }))

describe("industryToPhrase", () => {
  it("wraps the industry in a sentence rather than embedding a bare noun", () => {
    expect(industryToPhrase("Events")).toBe("a company in the Events industry")
  })
})

describe("rankIndustries", () => {
  // The stub must return full-width vectors: comparing a short query against a truncated
  // row is exactly the misalignment cosineInt8 exists to reject.
  const width = 384
  const vector = (first: number, second: number): number[] => {
    const out = new Array<number>(width).fill(0)
    out[0] = first
    out[1] = second
    return out
  }

  it("scores industries against the profile text and sorts best-first", async () => {
    const embed = vi.fn().mockImplementation(async (texts: string[]): Promise<Float32Array> => {
      const out: number[] = []
      for (const text of texts) {
        if (text.includes("networking for professionals")) {
          out.push(...vector(1, 0))
        } else if (text.includes("Professional Networking")) {
          out.push(...vector(1, 0))
        } else if (text.includes("Video Conferencing")) {
          out.push(...vector(0.9, 0.1))
        } else {
          out.push(...vector(0, 1))
        }
      }
      await Promise.resolve()
      return new Float32Array(out)
    })

    const result = await rankIndustries("video networking for professionals", ["Events", "Professional Networking"], embed)

    expect(result[0]?.name).toBe("Professional Networking")
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 1)
  })

  it("throws when there is nothing to rank against", async () => {
    const embed = vi.fn().mockImplementation(async () => {
      await Promise.resolve()
      return new Float32Array(width)
    })
    await expect(rankIndustries("text", [], embed)).rejects.toThrow(/empty industry list/)
  })

  it("rejects a model whose width does not match the index", async () => {
    // A mismatched width would silently misalign every comparison.
    const embed = vi.fn().mockImplementation(async (texts: string[]) => {
      await Promise.resolve()
      return new Float32Array(texts.length * 8)
    })
    await expect(rankIndustries("text", ["A"], embed)).rejects.toThrow(/dimensions/)
  })
})

describe("selectIndustries", () => {
  it("keeps industries at or above the floor", () => {
    const selection = selectIndustries(scored([["A", 0.5], ["B", 0.34], ["C", 0.2]]))

    expect(selection.selected).toEqual(["A"])
  })

  it("includes a score exactly on the floor", () => {
    const selection = selectIndustries(scored([["A", DEFAULT_INDUSTRY_FLOOR]]))
    expect(selection.selected).toEqual(["A"])
  })

  it("caps the number of selected industries so the gate keeps filtering", () => {
    const many: Array<[string, number]> = Array.from({ length: 20 }, (_, i) => [`I${i}`, 0.5])
    const selection = selectIndustries(scored(many))

    expect(selection.selected).toHaveLength(MAX_SELECTED_INDUSTRIES)
  })

  it("preserves similarity order", () => {
    const selection = selectIndustries(scored([["Best", 0.6], ["Mid", 0.45], ["Low", 0.4]]))
    expect(selection.selected).toEqual(["Best", "Mid", "Low"])
  })

  it("returns the full scored list for inspection", () => {
    const selection = selectIndustries(scored([["A", 0.5], ["B", 0.1]]))
    expect(selection.scored).toHaveLength(2)
  })

  it("throws rather than emitting an empty gate", () => {
    // An empty selection would make the gate keep or drop everything depending on the
    // caller's fallback, which is exactly the silent wrongness this flow must avoid.
    expect(() => selectIndustries(scored([["A", 0.1]]))).toThrow(/floor/)
  })

  it("suggests passing --industries explicitly when nothing matches", () => {
    expect(() => selectIndustries(scored([["A", 0.1]]))).toThrow(/--industries/)
  })

  it("honours a custom floor", () => {
    const selection = selectIndustries(scored([["A", 0.5], ["B", 0.3]]), 0.3)
    expect(selection.selected).toEqual(["A", "B"])
  })
})
