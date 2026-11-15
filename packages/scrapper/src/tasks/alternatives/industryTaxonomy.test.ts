import { describe, expect, it } from "vitest"

import { buildIndustryTaxonomy, computeIndustryCorpusHash } from "./industryTaxonomy"

const row = (name: string, industries?: string[]): { name: string; industries?: string[] } => ({ name, industries })

describe("buildIndustryTaxonomy", () => {
  it("counts each company once even when it has several corpus rows", () => {
    // The corpus stores one row per link field, so a company with three socials appears
    // three times. Industry weight must not scale with how many profiles it has.
    const taxonomy = buildIndustryTaxonomy([
      row("Wix", ["Internet"]),
      row("Wix", ["Internet"]),
      row("Wix", ["Internet"]),
      row("Other", ["Internet"])
    ])

    expect(taxonomy.companyCount).toBe(2)
    expect(taxonomy.industries).toEqual([{ name: "Internet", count: 2 }])
  })

  it("counts a repeated label on one company only once", () => {
    const taxonomy = buildIndustryTaxonomy([row("Dup", ["Video", "Video", "SaaS"])])

    expect(taxonomy.industries).toEqual([
      { name: "SaaS", count: 1 },
      { name: "Video", count: 1 }
    ])
  })

  it("excludes companies without industries from the labelled count", () => {
    const taxonomy = buildIndustryTaxonomy([row("A", ["Events"]), row("B"), row("C", [])])

    expect(taxonomy.companyCount).toBe(3)
    expect(taxonomy.companiesWithIndustries).toBe(1)
  })

  it("sorts by descending count, then alphabetically on ties", () => {
    const taxonomy = buildIndustryTaxonomy([
      row("A", ["Zebra", "Apple"]),
      row("B", ["Apple"]),
      row("C", ["Apple"])
    ])

    expect(taxonomy.industries).toEqual([
      { name: "Apple", count: 3 },
      { name: "Zebra", count: 1 }
    ])
  })

  it("produces an empty industry list rather than throwing on an industryless corpus", () => {
    // run() is responsible for rejecting this; the pure builder stays total.
    const taxonomy = buildIndustryTaxonomy([row("A"), row("B")])

    expect(taxonomy.industryCount).toBe(0)
    expect(taxonomy.industries).toEqual([])
  })
})

describe("computeIndustryCorpusHash", () => {
  it("is stable across row order", () => {
    const a = computeIndustryCorpusHash([row("A", ["X"]), row("B", ["Y"])])
    const b = computeIndustryCorpusHash([row("B", ["Y"]), row("A", ["X"])])

    expect(a).toBe(b)
  })

  it("is insensitive to the order of a company's industry list", () => {
    const a = computeIndustryCorpusHash([row("A", ["X", "Y"])])
    const b = computeIndustryCorpusHash([row("A", ["Y", "X"])])

    expect(a).toBe(b)
  })

  it("changes when an industry is added", () => {
    const before = computeIndustryCorpusHash([row("A", ["X"])])
    const after = computeIndustryCorpusHash([row("A", ["X", "Y"])])

    expect(before).not.toBe(after)
  })

  it("changes when a company is added", () => {
    const before = computeIndustryCorpusHash([row("A", ["X"])])
    const after = computeIndustryCorpusHash([row("A", ["X"]), row("B", ["X"])])

    expect(before).not.toBe(after)
  })
})
