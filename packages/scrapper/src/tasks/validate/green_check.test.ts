import { describe, it, expect } from "vitest"

import type { ManualOverrideValue } from "./types"
import {
  normalize,
  extractNameCandidates,
  nameAppearsInLink,
  allLinksGreen,
  describeNonGreenFields
} from "./green_check"

/**
 * Override with optional urls field, matching the shape callers actually use.
 * allLinksGreen/describeNonGreenFields iterate Object.entries() and skip unknown
 * fields via NON_LINK_FIELDS, so this works at runtime.
 */
type OverrideWithUrls = ManualOverrideValue & { urls?: string[] }

// ────────────────────────────────────────────────────────────────────────────
// normalize
// ────────────────────────────────────────────────────────────────────────────

describe("normalize", () => {
  it("lowercases and strips non-alphanumeric characters", () => {
    expect(normalize("Acme-Corp")).toBe("acmecorp")
  })

  it("strips spaces, hyphens, underscores", () => {
    expect(normalize("Tower Semiconductor")).toBe("towersemiconductor")
  })

  it("returns empty string for empty input", () => {
    expect(normalize("")).toBe("")
  })

  it("handles special characters", () => {
    expect(normalize("D-ID (acquired)")).toBe("didacquired")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// extractNameCandidates
// ────────────────────────────────────────────────────────────────────────────

describe("extractNameCandidates", () => {
  it("returns full name as a candidate", () => {
    const candidates = extractNameCandidates("Foretellix")
    expect(candidates).toContain("foretellix")
  })

  it("extracts word before parenthetical", () => {
    const candidates = extractNameCandidates("Acclym (formerly Agritask)")
    expect(candidates).toContain("acclym")
  })

  it("extracts non-noise words from parenthetical", () => {
    const candidates = extractNameCandidates("Acclym (formerly Agritask)")
    expect(candidates).toContain("agritask")
    expect(candidates).not.toContain("formerly")
  })

  it("extracts individual words >= 3 chars", () => {
    const candidates = extractNameCandidates("Tower Semiconductor")
    expect(candidates).toContain("tower")
    expect(candidates).toContain("semiconductor")
  })

  it("skips noise words", () => {
    const candidates = extractNameCandidates("Autotalks (Aquired by Qualcomm)")
    expect(candidates).not.toContain("aquired")
    expect(candidates).not.toContain("by")
    expect(candidates).toContain("qualcomm")
    expect(candidates).toContain("autotalks")
  })

  it("skips words shorter than 3 chars", () => {
    const candidates = extractNameCandidates("AI Co")
    expect(candidates).not.toContain("co")
  })

  it("deduplicates candidates", () => {
    const candidates = extractNameCandidates("Foretellix")
    const unique = new Set(candidates)
    expect(candidates.length).toBe(unique.size)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// nameAppearsInLink
// ────────────────────────────────────────────────────────────────────────────

describe("nameAppearsInLink", () => {
  it("returns true when company name appears in URL", () => {
    expect(nameAppearsInLink("Foretellix", "https://www.linkedin.com/company/foretellix")).toBe(true)
  })

  it("is case-insensitive", () => {
    expect(nameAppearsInLink("Foretellix", "https://github.com/FORETELLIX")).toBe(true)
  })

  it("returns false when company name does not appear", () => {
    expect(nameAppearsInLink("Foretellix", "https://www.linkedin.com/company/some-other-corp")).toBe(false)
  })

  it("returns false for empty link", () => {
    expect(nameAppearsInLink("Foretellix", "")).toBe(false)
  })

  it("matches link slug inside candidate (slug shorter than name)", () => {
    // Link slug "acme" should match candidate "acmecorporation"
    expect(nameAppearsInLink("Acme Corporation", "https://github.com/acme")).toBe(true)
  })

  it("matches former name from parenthetical", () => {
    expect(nameAppearsInLink("Acclym (formerly Agritask)", "https://github.com/agritask")).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// allLinksGreen
// ────────────────────────────────────────────────────────────────────────────

describe("allLinksGreen", () => {
  it("returns true when all links contain the company name", () => {
    expect(
      allLinksGreen("Foretellix", {
        ws: ["https://www.foretellix.com"],
        li: ["https://www.linkedin.com/company/foretellix"],
        fb: ["https://www.facebook.com/foretellix"],
        _meta: { isHomepage: true }
      })
    ).toBe(true)
  })

  it("returns false when any link does not contain the company name", () => {
    expect(
      allLinksGreen("Foretellix", {
        ws: ["https://www.foretellix.com"],
        li: ["https://www.linkedin.com/company/some-other-company"],
        _meta: { isHomepage: true }
      })
    ).toBe(false)
  })

  it("returns false when override has no link fields (only _meta)", () => {
    expect(allLinksGreen("Foretellix", { _meta: { isHomepage: true } })).toBe(false)
  })

  it("excludes _meta, urls, and alt from green check", () => {
    const override: OverrideWithUrls = {
      ws: ["https://www.foretellix.com"],
      urls: ["https://unrelated-domain.com/something"],
      _meta: { isHomepage: true }
    }
    expect(allLinksGreen("Foretellix", override)).toBe(true)
  })

  it("handles string fields (not just arrays)", () => {
    expect(
      allLinksGreen("Foretellix", {
        ws: "https://www.foretellix.com",
        li: "https://www.linkedin.com/company/foretellix",
        _meta: { isHomepage: true }
      })
    ).toBe(true)
  })

  // ── LinkedIn numerical ID handling ──

  describe("LinkedIn numerical IDs", () => {
    it("treats numerical ID as green when a green slug sibling exists", () => {
      expect(
        allLinksGreen("Foretellix", {
          li: [
            "https://www.linkedin.com/company/12345",
            "https://www.linkedin.com/company/foretellix"
          ],
          _meta: { isHomepage: true }
        })
      ).toBe(true)
    })

    it("treats numerical ID as NOT green when no green slug sibling exists", () => {
      expect(
        allLinksGreen("Foretellix", {
          li: ["https://www.linkedin.com/company/12345"],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })

    it("treats numerical ID as NOT green when slug sibling is also not green", () => {
      expect(
        allLinksGreen("Foretellix", {
          li: [
            "https://www.linkedin.com/company/12345",
            "https://www.linkedin.com/company/some-unrelated-company"
          ],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })

    it("handles multiple numerical IDs with one green slug", () => {
      expect(
        allLinksGreen("Foretellix", {
          li: [
            "https://www.linkedin.com/company/12345",
            "https://www.linkedin.com/company/67890",
            "https://www.linkedin.com/company/foretellix"
          ],
          _meta: { isHomepage: true }
        })
      ).toBe(true)
    })

    it("numerical ID does not affect other fields", () => {
      // li is green (numerical + slug), but gh is not
      expect(
        allLinksGreen("Foretellix", {
          li: [
            "https://www.linkedin.com/company/12345",
            "https://www.linkedin.com/company/foretellix"
          ],
          gh: ["https://github.com/unrelated-org"],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })
  })

  // ── YouTube channel inherits from profile ──

  describe("YouTube channel (ytc) inherits green from ytp", () => {
    it("ytc is green when ytp has a green URL", () => {
      expect(
        allLinksGreen("Foretellix", {
          ytp: ["https://www.youtube.com/@foretellix"],
          ytc: ["https://www.youtube.com/channel/UC1_RHjB1GlgKrewVk4GZCyQ"],
          _meta: { isHomepage: true }
        })
      ).toBe(true)
    })

    it("ytc is NOT green when ytp is absent", () => {
      expect(
        allLinksGreen("Foretellix", {
          ytc: ["https://www.youtube.com/channel/UC1_RHjB1GlgKrewVk4GZCyQ"],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })

    it("ytc is NOT green when ytp is not green", () => {
      expect(
        allLinksGreen("Foretellix", {
          ytp: ["https://www.youtube.com/@someotherchannel"],
          ytc: ["https://www.youtube.com/channel/UC1_RHjB1GlgKrewVk4GZCyQ"],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })
  })

  // ── Android app IDs ──

  describe("android_app_ids", () => {
    it("checks Play Store display URL for green", () => {
      expect(
        allLinksGreen("Foretellix", {
          android_app_ids: ["com.foretellix.app"],
          _meta: { isHomepage: true }
        })
      ).toBe(true)
    })

    it("non-green Android app ID makes allLinksGreen false", () => {
      expect(
        allLinksGreen("Foretellix", {
          android_app_ids: ["com.unrelated.app"],
          _meta: { isHomepage: true }
        })
      ).toBe(false)
    })
  })
})

// ────────────────────────────────────────────────────────────────────────────
// describeNonGreenFields
// ────────────────────────────────────────────────────────────────────────────

describe("describeNonGreenFields", () => {
  it("returns 'No link fields found' for meta-only override", () => {
    expect(describeNonGreenFields("Foretellix", { _meta: { isHomepage: true } })).toBe("No link fields found")
  })

  it("lists fields that are not green", () => {
    const result = describeNonGreenFields("Foretellix", {
      ws: ["https://www.foretellix.com"],
      gh: ["https://github.com/unrelated-org"],
      _meta: { isHomepage: true }
    })
    expect(result).toContain("gh=")
    expect(result).toContain("unrelated-org")
    expect(result).not.toContain("ws=")
  })

  it("does not report numerical LinkedIn IDs when a green slug sibling exists", () => {
    const result = describeNonGreenFields("Foretellix", {
      li: [
        "https://www.linkedin.com/company/12345",
        "https://www.linkedin.com/company/foretellix"
      ],
      _meta: { isHomepage: true }
    })
    // All li URLs are green (numerical covered by slug), so no non-green li
    expect(result).toBe("No link fields found")
  })

  it("reports numerical LinkedIn IDs when no green slug sibling exists", () => {
    const result = describeNonGreenFields("Foretellix", {
      li: ["https://www.linkedin.com/company/12345"],
      _meta: { isHomepage: true }
    })
    expect(result).toContain("li=")
    expect(result).toContain("12345")
  })

  it("reports non-green string slug even when numerical ID exists", () => {
    const result = describeNonGreenFields("Foretellix", {
      li: [
        "https://www.linkedin.com/company/12345",
        "https://www.linkedin.com/company/some-unrelated-company"
      ],
      _meta: { isHomepage: true }
    })
    expect(result).toContain("li=")
    expect(result).toContain("some-unrelated-company")
    expect(result).toContain("12345")
  })

  it("excludes urls and alt from report", () => {
    const override: OverrideWithUrls = {
      ws: ["https://www.foretellix.com"],
      urls: ["https://unrelated.com"],
      _meta: { isHomepage: true }
    }
    const result = describeNonGreenFields("Foretellix", override)
    expect(result).not.toContain("urls=")
  })
})
