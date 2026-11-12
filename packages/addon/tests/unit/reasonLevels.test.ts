import { APIListOfReasons, type valuesOfListOfReasons } from "@theWallProject/common"
import { describe, expect, it } from "vitest"

import { getModalReasonLevel, getReasonLevel, type ReasonLevel } from "../../src/helpers/reasonLevels"

const ALL_REASONS: readonly valuesOfListOfReasons[] = Object.values(APIListOfReasons)

const RED_REASONS: readonly valuesOfListOfReasons[] = [
  APIListOfReasons.HeadQuarterInIL,
  APIListOfReasons.Url,
  APIListOfReasons.BDSPriority
]

const YELLOW_REASONS: readonly valuesOfListOfReasons[] = [
  APIListOfReasons.FounderInIL,
  APIListOfReasons.InvestorNotFounderInIL,
  APIListOfReasons.BDSGrassroots,
  APIListOfReasons.BDSPressure,
  APIListOfReasons.Custom
]

const levelOf = (reason: valuesOfListOfReasons): ReasonLevel => getReasonLevel(reason)

describe("getReasonLevel", () => {
  it("assigns red to exactly the direct reasons", () => {
    expect(ALL_REASONS.filter((reason) => levelOf(reason) === "red")).toEqual([...RED_REASONS])
  })

  it("assigns yellow to exactly the indirect reasons", () => {
    expect(ALL_REASONS.filter((reason) => levelOf(reason) === "yellow")).toEqual([...YELLOW_REASONS])
  })

  it("covers every reason code with no duplicates and no gaps", () => {
    // Fails as soon as a new reason code is added to APIListOfReasons but not classified
    // above: the two lists above would no longer partition ALL_REASONS.
    expect(new Set([...RED_REASONS, ...YELLOW_REASONS])).toEqual(new Set(ALL_REASONS))
    expect(RED_REASONS.length + YELLOW_REASONS.length).toBe(ALL_REASONS.length)
  })
})

describe("getModalReasonLevel", () => {
  it("stays red for a headquarter-only company", () => {
    expect(getModalReasonLevel([APIListOfReasons.HeadQuarterInIL])).toBe("red")
  })

  it("escalates to red when any red-tier reason is present", () => {
    expect(
      getModalReasonLevel([
        APIListOfReasons.FounderInIL,
        APIListOfReasons.InvestorNotFounderInIL,
        APIListOfReasons.BDSPriority
      ])
    ).toBe("red")
  })

  it("stays yellow when every reason is yellow-tier", () => {
    expect(getModalReasonLevel([...YELLOW_REASONS])).toBe("yellow")
  })

  it("falls back to red on an empty reason list", () => {
    // FinalDBFileSchema declares `r` as a plain array with no minimum, so an empty list is
    // schema-valid. Red keeps today's rendering and never demotes a flagged company to the
    // softer yellow styling.
    expect(getModalReasonLevel([])).toBe("red")
  })
})
