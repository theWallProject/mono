import { describe, it, expect } from "vitest"

import { categorizedToOverride, isWsOnlyOverride } from "./run"
import type { CategorizedLinks } from "./ai_categorizer"

// ────────────────────────────────────────────────────────────────────────────
// isWsOnlyOverride
// ────────────────────────────────────────────────────────────────────────────

describe("isWsOnlyOverride", () => {
  it("returns true for _meta + ws only", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        ws: ["https://example.com"]
      })
    ).toBe(true)
  })

  it("returns true for _meta only (no ws)", () => {
    expect(isWsOnlyOverride({ _meta: { isHomepage: true } })).toBe(true)
  })

  it("returns false when li is present", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        ws: ["https://example.com"],
        li: ["https://www.linkedin.com/company/example"]
      })
    ).toBe(false)
  })

  it("returns false when fb is present", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        ws: ["https://example.com"],
        fb: ["https://www.facebook.com/example"]
      })
    ).toBe(false)
  })

  it("returns false when urls is present", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        ws: ["https://example.com"],
        urls: ["https://other.com"]
      })
    ).toBe(false)
  })

  it("returns false when android_app_ids is present", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        ws: ["https://example.com"],
        android_app_ids: ["com.example.app"]
      })
    ).toBe(false)
  })

  it("returns false when gh is present", () => {
    expect(
      isWsOnlyOverride({
        _meta: { isHomepage: true },
        gh: ["https://github.com/example"]
      })
    ).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// categorizedToOverride
// ────────────────────────────────────────────────────────────────────────────

describe("categorizedToOverride", () => {
  // ── Case-insensitive URL dedup ──

  describe("case-insensitive URL dedup", () => {
    it("removes case-only duplicate YouTube profile URLs", () => {
      const input: CategorizedLinks = {
        ytp: [
          "https://www.youtube.com/@foretellix",
          "https://www.youtube.com/@Foretellix"
        ]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ytp).toEqual(["https://www.youtube.com/@foretellix"])
    })

    it("removes case-only duplicate LinkedIn URLs", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme-corp",
          "https://www.linkedin.com/company/Acme-Corp"
        ]
      }
      const result = categorizedToOverride(input, "Acme Corp")
      expect(result.li).toEqual(["https://www.linkedin.com/company/acme-corp"])
    })

    it("keeps genuinely different URLs", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme-corp",
          "https://www.linkedin.com/company/acme-subsidiary"
        ]
      }
      const result = categorizedToOverride(input, "Acme Corp")
      expect(result.li).toHaveLength(2)
    })

    it("does not deduplicate single-element arrays", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toEqual(["https://www.foretellix.com"])
    })

    it("deduplicates across all array fields", () => {
      const input: CategorizedLinks = {
        gh: [
          "https://github.com/Foretellix",
          "https://github.com/foretellix"
        ],
        tw: [
          "https://x.com/ForetellixHQ",
          "https://x.com/foretellixhq"
        ]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.gh).toHaveLength(1)
      expect(result.tw).toHaveLength(1)
    })
  })

  // ── Promote green urls to ws ──

  describe("promote green urls to ws", () => {
    it("promotes green simple-domain urls to ws", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: ["https://foretellix.cn"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toContain("https://foretellix.cn")
      expect(result.urls).toBeUndefined()
    })

    it("does not promote non-green urls", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: ["https://unrelated-domain.com"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toEqual(["https://www.foretellix.com"])
      expect(result.urls).toEqual(["https://unrelated-domain.com"])
    })

    it("does not promote deep-path urls even if green", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: ["https://foretellix.com/about/careers/team"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toHaveLength(1) // original only
      expect(result.urls).toEqual(["https://foretellix.com/about/careers/team"])
    })

    it("does not promote url already in ws", () => {
      const input: CategorizedLinks = {
        ws: ["https://foretellix.cn"],
        urls: ["https://foretellix.cn"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toEqual(["https://foretellix.cn"])
      expect(result.urls).toBeUndefined()
    })

    it("creates ws array if it does not exist", () => {
      const input: CategorizedLinks = {
        urls: ["https://foretellix.cn"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toContain("https://foretellix.cn")
      expect(result.urls).toBeUndefined()
    })

    it("promotes locale-path urls like /en", () => {
      const input: CategorizedLinks = {
        urls: ["https://foretellix.com/en"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toContain("https://foretellix.com/en")
    })
  })

  // ── Remove urls that duplicate ws ──

  describe("remove urls duplicating ws origins", () => {
    it("removes urls entry whose origin matches a ws entry", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: [
          "https://www.foretellix.com/about",
          "https://other-site.com/page"
        ]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.urls).toEqual(["https://other-site.com/page"])
    })

    it("removes all urls if they all match ws origins", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: [
          "https://www.foretellix.com/about",
          "https://www.foretellix.com/contact"
        ]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.urls).toBeUndefined()
    })

    it("keeps urls with different origins", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        urls: ["https://blog.foretellix-partner.com/article"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.urls).toEqual(["https://blog.foretellix-partner.com/article"])
    })
  })

  // ── General override construction ──

  describe("general override construction", () => {
    it("always includes _meta with isHomepage", () => {
      const result = categorizedToOverride({}, "Foretellix")
      expect(result._meta).toEqual({ isHomepage: true })
    })

    it("omits empty array fields", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        li: [],
        fb: []
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toBeDefined()
      expect(result.li).toBeUndefined()
      expect(result.fb).toBeUndefined()
    })

    it("includes all populated social fields", () => {
      const input: CategorizedLinks = {
        ws: ["https://www.foretellix.com"],
        li: ["https://www.linkedin.com/company/foretellix"],
        fb: ["https://www.facebook.com/foretellix"],
        tw: ["https://x.com/foretellix"],
        ig: ["https://www.instagram.com/foretellix"],
        gh: ["https://github.com/foretellix"],
        ytp: ["https://www.youtube.com/@foretellix"],
        ytc: ["https://www.youtube.com/channel/UCtest"],
        tt: ["https://www.tiktok.com/foretellix"],
        th: ["https://www.threads.net/foretellix"]
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.ws).toBeDefined()
      expect(result.li).toBeDefined()
      expect(result.fb).toBeDefined()
      expect(result.tw).toBeDefined()
      expect(result.ig).toBeDefined()
      expect(result.gh).toBeDefined()
      expect(result.ytp).toBeDefined()
      expect(result.ytc).toBeDefined()
      expect(result.tt).toBeDefined()
      expect(result.th).toBeDefined()
    })

    it("includes android fields", () => {
      const input: CategorizedLinks = {
        android_app_ids: ["com.foretellix.app"],
        android_dev_id: "com.foretellix"
      }
      const result = categorizedToOverride(input, "Foretellix")
      expect(result.android_app_ids).toEqual(["com.foretellix.app"])
      expect(result.android_dev_id).toBe("com.foretellix")
    })
  })
})
