import { describe, expect, it } from "vitest"

import { resolveBannerActions } from "../../src/helpers/bannerActions"
import type { valuesOfListOfReasons } from "@theWallProject/common"

const reasons = (...codes: valuesOfListOfReasons[]): valuesOfListOfReasons[] => codes

describe("resolveBannerActions", () => {
  it("offers only alternatives when the entry has alternatives and no BDS reasons", () => {
    expect(resolveBannerActions({ reasons: reasons("h"), hasAlternatives: true })).toEqual(["alternatives"])
  })

  it("offers only the BDS guide when the entry has BDS reasons and no alternatives", () => {
    expect(resolveBannerActions({ reasons: reasons("BDS_PRIO"), hasAlternatives: false })).toEqual(["bdsGuide"])
  })

  it("falls back to support Palestine when there is nothing else to offer", () => {
    expect(resolveBannerActions({ reasons: reasons("f"), hasAlternatives: false })).toEqual(["supportPalestine"])
  })

  it("keeps the BDS guide reachable when an entry has both alternatives and BDS reasons", () => {
    // The regression this guards: the modal used to pick one branch and drop the other.
    expect(resolveBannerActions({ reasons: reasons("BDS_GRASS"), hasAlternatives: true })).toEqual([
      "alternatives",
      "bdsGuide"
    ])
  })

  it("ranks alternatives first so the primary button shows a usable replacement", () => {
    const actions = resolveBannerActions({ reasons: reasons("h", "BDS_PRIO"), hasAlternatives: true })
    expect(actions[0]).toBe("alternatives")
    expect(actions).toEqual(["alternatives", "bdsGuide"])
  })

  it("treats every BDS tier as a guide trigger", () => {
    for (const code of reasons("BDS_PRIO", "BDS_GRASS", "BDS_PRESSURE")) {
      expect(resolveBannerActions({ reasons: reasons(code), hasAlternatives: false })).toEqual(["bdsGuide"])
    }
  })

  it("never combines support Palestine with another action", () => {
    const combos = [
      resolveBannerActions({ reasons: reasons("h"), hasAlternatives: true }),
      resolveBannerActions({ reasons: reasons("BDS_PRIO"), hasAlternatives: false }),
      resolveBannerActions({ reasons: reasons("BDS_PRIO"), hasAlternatives: true })
    ]

    for (const combo of combos) {
      expect(combo).not.toContain("supportPalestine")
    }
  })
})
