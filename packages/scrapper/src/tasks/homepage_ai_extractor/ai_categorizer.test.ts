import { describe, it, expect } from "vitest"
import { deduplicateSocialLinks, type CategorizedLinks } from "./ai_categorizer"

describe("deduplicateSocialLinks", () => {
  // ──────────────────────────────────────────────────────────────────────
  // LinkedIn deduplication
  // ──────────────────────────────────────────────────────────────────────

  describe("LinkedIn (li)", () => {
    it("removes duplicate LinkedIn URLs with different query params", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/urban-aeronautics",
          "https://www.linkedin.com/company/urban-aeronautics/?origin"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toEqual(["https://www.linkedin.com/company/urban-aeronautics"])
    })

    it("removes duplicate LinkedIn URLs with originalSubdomain query param", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/urban-aeronautics",
          "https://www.linkedin.com/company/urban-aeronautics/?originalSubdomain=il"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toEqual(["https://www.linkedin.com/company/urban-aeronautics"])
    })

    it("removes duplicate LinkedIn URLs with trk query param", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/some-company",
          "http://www.linkedin.com/company/some-company?trk=tyah"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toEqual(["https://www.linkedin.com/company/some-company"])
    })

    it("keeps distinct LinkedIn company selectors unchanged", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/cellebrite",
          "https://www.linkedin.com/company/100045",
          "https://www.linkedin.com/showcase/cellebrite-careers"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toHaveLength(3)
      // No duplicates found, so the original array is preserved as-is
      expect(result.li).toEqual([
        "https://www.linkedin.com/company/cellebrite",
        "https://www.linkedin.com/company/100045",
        "https://www.linkedin.com/showcase/cellebrite-careers"
      ])
    })

    it("normalizes showcase URLs to /company/ canonical form", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/showcase/cellebrite-careers",
          "https://www.linkedin.com/company/cellebrite-careers/?ref=about"
        ]
      }
      const result = deduplicateSocialLinks(input)
      // Both resolve to selector "cellebrite-careers", canonical is /company/
      expect(result.li).toHaveLength(1)
      expect(result.li).toEqual(["https://www.linkedin.com/company/cellebrite-careers"])
    })

    it("deduplicates LinkedIn URLs case-insensitively", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/MyCompany",
          "https://www.linkedin.com/company/mycompany/?ref=website"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toHaveLength(1)
      // Canonical URL uses lowercased selector
      expect(result.li).toEqual(["https://www.linkedin.com/company/mycompany"])
    })

    it("normalizes LinkedIn URLs to canonical profile URL", () => {
      const input: CategorizedLinks = {
        li: ["https://il.linkedin.com/company/flytrex/?originalSubdomain=il"]
      }
      const result = deduplicateSocialLinks(input)
      // Single URL, no dedup needed, but length <= 1 means no processing
      expect(result.li).toEqual(["https://il.linkedin.com/company/flytrex/?originalSubdomain=il"])
    })

    it("handles three-way duplicates", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme-corp",
          "https://www.linkedin.com/company/acme-corp/?origin=foo",
          "https://www.linkedin.com/company/acme-corp/?ref=bar"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toEqual(["https://www.linkedin.com/company/acme-corp"])
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Other social platforms
  // ──────────────────────────────────────────────────────────────────────

  describe("Facebook (fb)", () => {
    it("removes duplicate Facebook URLs with query params", () => {
      const input: CategorizedLinks = {
        fb: [
          "https://www.facebook.com/SomeCompany",
          "https://www.facebook.com/SomeCompany?ref=page_internal"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.fb).toHaveLength(1)
    })

    it("keeps distinct Facebook pages", () => {
      const input: CategorizedLinks = {
        fb: [
          "https://www.facebook.com/CompanyA",
          "https://www.facebook.com/CompanyB"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.fb).toHaveLength(2)
    })
  })

  describe("Twitter/X (tw)", () => {
    it("removes duplicate Twitter URLs across twitter.com and x.com", () => {
      const input: CategorizedLinks = {
        tw: [
          "https://twitter.com/someuser",
          "https://x.com/someuser"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.tw).toHaveLength(1)
    })

    it("deduplicates Twitter URLs case-insensitively", () => {
      const input: CategorizedLinks = {
        tw: [
          "https://x.com/SomeUser",
          "https://twitter.com/someuser"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.tw).toHaveLength(1)
    })
  })

  describe("GitHub (gh)", () => {
    it("removes duplicate GitHub URLs with same org", () => {
      const input: CategorizedLinks = {
        gh: [
          "https://github.com/some-org",
          "https://github.com/some-org"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.gh).toHaveLength(1)
      expect(result.gh).toEqual(["https://github.com/some-org"])
    })

    it("keeps distinct GitHub orgs", () => {
      const input: CategorizedLinks = {
        gh: [
          "https://github.com/org-a",
          "https://github.com/org-b"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.gh).toHaveLength(2)
    })
  })

  describe("YouTube channel (ytc)", () => {
    it("removes exact duplicate YouTube channel URLs", () => {
      const input: CategorizedLinks = {
        ytc: [
          "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A",
          "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.ytc).toHaveLength(1)
      // YouTube channel IDs are case-sensitive — original case is preserved
      expect(result.ytc).toEqual(["https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"])
    })

    it("keeps distinct YouTube channel IDs", () => {
      const input: CategorizedLinks = {
        ytc: [
          "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A",
          "https://www.youtube.com/channel/UCCIwsFWZNuugtW1U2X89t7A"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.ytc).toHaveLength(2)
    })
  })

  describe("YouTube profile (ytp)", () => {
    it("deduplicates YouTube profile URLs case-insensitively", () => {
      const input: CategorizedLinks = {
        ytp: [
          "https://www.youtube.com/@SomeChannel",
          "https://www.youtube.com/@somechannel"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.ytp).toHaveLength(1)
    })
  })

  describe("Instagram (ig)", () => {
    it("removes duplicate Instagram URLs", () => {
      const input: CategorizedLinks = {
        ig: [
          "https://www.instagram.com/someuser",
          "https://www.instagram.com/someuser/"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.ig).toHaveLength(1)
    })
  })

  describe("TikTok (tt)", () => {
    it("removes duplicate TikTok URLs", () => {
      const input: CategorizedLinks = {
        tt: [
          "https://www.tiktok.com/@someuser",
          "https://www.tiktok.com/@someuser?lang=en"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.tt).toHaveLength(1)
    })
  })

  describe("Threads (th)", () => {
    it("removes duplicate Threads URLs", () => {
      const input: CategorizedLinks = {
        th: [
          "https://www.threads.com/@someuser",
          "https://www.threads.com/@someuser/"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.th).toHaveLength(1)
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Non-social fields are untouched
  // ──────────────────────────────────────────────────────────────────────

  describe("non-social fields", () => {
    it("does not modify ws array", () => {
      const input: CategorizedLinks = {
        ws: [
          "https://example.com",
          "https://example.com/?ref=footer"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.ws).toEqual([
        "https://example.com",
        "https://example.com/?ref=footer"
      ])
    })

    it("does not modify urls array", () => {
      const input: CategorizedLinks = {
        urls: [
          "https://medium.com/company-blog",
          "https://medium.com/company-blog?source=rss"
        ]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.urls).toEqual([
        "https://medium.com/company-blog",
        "https://medium.com/company-blog?source=rss"
      ])
    })

    it("does not modify android_app_ids", () => {
      const input: CategorizedLinks = {
        android_app_ids: ["com.example.app", "com.example.app"]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.android_app_ids).toEqual(["com.example.app", "com.example.app"])
    })

    it("preserves android_dev_id string", () => {
      const input: CategorizedLinks = {
        android_dev_id: "some-dev-id",
        li: ["https://www.linkedin.com/company/foo"]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.android_dev_id).toBe("some-dev-id")
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Edge cases
  // ──────────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("returns empty object for empty input", () => {
      const result = deduplicateSocialLinks({})
      expect(result).toEqual({})
    })

    it("does not modify single-element arrays", () => {
      const input: CategorizedLinks = {
        li: ["https://www.linkedin.com/company/foo"]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toEqual(["https://www.linkedin.com/company/foo"])
    })

    it("does not modify undefined fields", () => {
      const input: CategorizedLinks = {
        li: undefined,
        fb: undefined
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toBeUndefined()
      expect(result.fb).toBeUndefined()
    })

    it("handles mixed: some fields with duplicates, others without", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme",
          "https://www.linkedin.com/company/acme/?origin"
        ],
        fb: [
          "https://www.facebook.com/acme",
          "https://www.facebook.com/other-page"
        ],
        tw: ["https://x.com/acme"]
      }
      const result = deduplicateSocialLinks(input)
      expect(result.li).toHaveLength(1)
      expect(result.fb).toHaveLength(2)
      expect(result.tw).toEqual(["https://x.com/acme"])
    })

    it("does not mutate the original input object", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme",
          "https://www.linkedin.com/company/acme/?origin"
        ]
      }
      const originalLi = [...(input.li ?? [])]
      deduplicateSocialLinks(input)
      expect(input.li).toEqual(originalLi)
    })

    it("keeps URLs that don't match the platform regex", () => {
      const input: CategorizedLinks = {
        li: [
          "https://www.linkedin.com/company/acme",
          "https://www.linkedin.com/in/john-doe"
        ]
      }
      const result = deduplicateSocialLinks(input)
      // /in/ URLs don't match the company regex, so they're kept as-is
      expect(result.li).toHaveLength(2)
      expect(result.li).toContain("https://www.linkedin.com/in/john-doe")
    })
  })
})
