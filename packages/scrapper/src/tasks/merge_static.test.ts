import { describe, it, expect } from "vitest"
import { extractIdentifier, deduplicateOverrideUrls } from "./merge_static"

describe("extractIdentifier", () => {
  // ──────────────────────────────────────────────────────────────────────
  // LinkedIn
  // ──────────────────────────────────────────────────────────────────────

  describe("LinkedIn (li)", () => {
    it("extracts company slug from standard URL", () => {
      expect(extractIdentifier("https://www.linkedin.com/company/urban-aeronautics", "li")).toBe("urban-aeronautics")
    })

    it("extracts company slug from URL with query params", () => {
      expect(extractIdentifier("https://www.linkedin.com/company/urban-aeronautics/?origin", "li")).toBe(
        "urban-aeronautics"
      )
    })

    it("extracts company slug from URL with originalSubdomain query", () => {
      expect(
        extractIdentifier("https://www.linkedin.com/company/urban-aeronautics/?originalSubdomain=il", "li")
      ).toBe("urban-aeronautics")
    })

    it("extracts numeric company ID", () => {
      expect(extractIdentifier("http://www.linkedin.com/company/2837526?trk=tyah", "li")).toBe("2837526")
    })

    it("extracts showcase slug", () => {
      expect(extractIdentifier("https://www.linkedin.com/showcase/cellebrite-careers", "li")).toBe("cellebrite-careers")
    })

    it("throws for non-company LinkedIn URLs", () => {
      expect(() => extractIdentifier("https://www.linkedin.com/in/john-doe", "li")).toThrow(
        "Failed to extract LinkedIn identifier"
      )
    })

    it("throws for LinkedIn school URLs", () => {
      expect(() => extractIdentifier("https://www.linkedin.com/school/some-school", "li")).toThrow(
        "Failed to extract LinkedIn identifier"
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Websites
  // ──────────────────────────────────────────────────────────────────────

  describe("Websites (ws)", () => {
    it("extracts domain from full URL", () => {
      expect(extractIdentifier("https://www.example.com/path", "ws")).toBe("example_com")
    })

    it("extracts domain stripping www", () => {
      expect(extractIdentifier("https://www.urbanaero.com/", "ws")).toBe("urbanaero_com")
    })

    it("extracts domain without protocol", () => {
      expect(extractIdentifier("example.com/path", "ws")).toBe("example_com")
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Facebook
  // ──────────────────────────────────────────────────────────────────────

  describe("Facebook (fb)", () => {
    it("extracts page name from standard URL", () => {
      expect(extractIdentifier("https://www.facebook.com/RealUrbanAero", "fb")).toBe("RealUrbanAero")
    })

    it("throws for Facebook sharer URLs", () => {
      expect(() => extractIdentifier("https://www.facebook.com/sharer/sharer.php", "fb")).toThrow(
        "Failed to extract Facebook identifier"
      )
    })

    it("throws for Facebook dialog URLs", () => {
      expect(() => extractIdentifier("https://www.facebook.com/dialog/feed?app_id=123", "fb")).toThrow(
        "Failed to extract Facebook identifier"
      )
    })

    it("throws for Facebook hashtag URLs", () => {
      expect(() => extractIdentifier("https://www.facebook.com/hashtag/something", "fb")).toThrow(
        "Failed to extract Facebook identifier"
      )
    })

    it("throws for Facebook events URLs", () => {
      expect(() => extractIdentifier("https://www.facebook.com/events/12345", "fb")).toThrow(
        "Failed to extract Facebook identifier"
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Twitter
  // ──────────────────────────────────────────────────────────────────────

  describe("Twitter (tw)", () => {
    it("extracts handle from twitter.com", () => {
      expect(extractIdentifier("https://twitter.com/someuser", "tw")).toBe("someuser")
    })

    it("extracts handle from x.com", () => {
      expect(extractIdentifier("https://x.com/someuser", "tw")).toBe("someuser")
    })

    it("throws for non-profile Twitter URLs", () => {
      expect(() => extractIdentifier("https://twitter.com/search?q=test", "tw")).toThrow(
        "Failed to extract Twitter identifier"
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // GitHub
  // ──────────────────────────────────────────────────────────────────────

  describe("GitHub (gh)", () => {
    it("extracts org name from GitHub URL", () => {
      expect(extractIdentifier("https://github.com/some-org", "gh")).toBe("some-org")
    })

    it("throws for reserved GitHub paths", () => {
      expect(() => extractIdentifier("https://github.com/features", "gh")).toThrow(
        "Failed to extract GitHub identifier"
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // YouTube
  // ──────────────────────────────────────────────────────────────────────

  describe("YouTube profile (ytp)", () => {
    it("extracts handle from @-prefixed URL", () => {
      const id = extractIdentifier("https://www.youtube.com/@SomeChannel", "ytp")
      expect(id).toBeTruthy()
    })
  })

  describe("YouTube channel (ytc)", () => {
    it("extracts channel ID", () => {
      expect(extractIdentifier("https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A", "ytc")).toBe(
        "UCGvsgFPVyOwuN8aJJbMem9A"
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // TikTok
  // ──────────────────────────────────────────────────────────────────────

  describe("TikTok (tt)", () => {
    it("extracts username from TikTok URL", () => {
      expect(extractIdentifier("https://www.tiktok.com/@someuser", "tt")).toBe("@someuser")
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Threads
  // ──────────────────────────────────────────────────────────────────────

  describe("Threads (th)", () => {
    it("extracts username from Threads URL", () => {
      // Threads regex uses threads.com domain (not threads.net)
      const id = extractIdentifier("https://www.threads.com/@someuser", "th")
      expect(id).toBeTruthy()
    })

    it("throws for threads.net domain (regex expects threads.com)", () => {
      expect(() => extractIdentifier("https://www.threads.net/@someuser", "th")).toThrow(
        "Failed to extract Threads identifier"
      )
    })
  })
})

describe("deduplicateOverrideUrls", () => {
  // ──────────────────────────────────────────────────────────────────────
  // LinkedIn deduplication
  // ──────────────────────────────────────────────────────────────────────

  describe("LinkedIn (li)", () => {
    it("removes duplicate LinkedIn URLs with query params (keeps first)", () => {
      const urls = [
        "https://www.linkedin.com/company/urban-aeronautics",
        "https://www.linkedin.com/company/urban-aeronautics/?origin"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      expect(result).toEqual(["https://www.linkedin.com/company/urban-aeronautics"])
    })

    it("removes duplicate LinkedIn URLs with originalSubdomain", () => {
      const urls = [
        "https://www.linkedin.com/company/urban-aeronautics",
        "https://www.linkedin.com/company/urban-aeronautics/?originalSubdomain=il"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      expect(result).toEqual(["https://www.linkedin.com/company/urban-aeronautics"])
    })

    it("keeps the first URL when duplicates exist", () => {
      const urls = [
        "https://www.linkedin.com/company/acme-corp/?originalSubdomain=il",
        "https://www.linkedin.com/company/acme-corp"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      // Keeps the first one (with query param in this case)
      expect(result).toEqual(["https://www.linkedin.com/company/acme-corp/?originalSubdomain=il"])
    })

    it("keeps distinct company selectors", () => {
      const urls = [
        "https://www.linkedin.com/company/cellebrite",
        "http://www.linkedin.com/company/100045",
        "https://www.linkedin.com/showcase/cellebrite-careers",
        "https://www.linkedin.com/showcase/cellebrite-enterprise-solutions"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      expect(result).toHaveLength(4)
    })

    it("deduplicates case-insensitively", () => {
      const urls = [
        "https://www.linkedin.com/company/MyCompany",
        "https://www.linkedin.com/company/mycompany/?ref=website"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      expect(result).toHaveLength(1)
    })

    it("handles three-way duplicates", () => {
      const urls = [
        "https://www.linkedin.com/company/foo",
        "https://www.linkedin.com/company/foo/?a=1",
        "https://www.linkedin.com/company/foo/?b=2"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      expect(result).toEqual(["https://www.linkedin.com/company/foo"])
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Other platforms
  // ──────────────────────────────────────────────────────────────────────

  describe("YouTube channel (ytc)", () => {
    it("removes exact duplicate YouTube channel URLs", () => {
      const urls = [
        "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A",
        "https://www.youtube.com/channel/UCCIwsFWZNuugtW1U2X89t7A",
        "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"
      ]
      const result = deduplicateOverrideUrls(urls, "ytc")
      expect(result).toEqual([
        "https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A",
        "https://www.youtube.com/channel/UCCIwsFWZNuugtW1U2X89t7A"
      ])
    })
  })

  describe("Facebook (fb)", () => {
    it("removes duplicate Facebook URLs", () => {
      const urls = [
        "https://www.facebook.com/SomeCompany",
        "https://www.facebook.com/SomeCompany?ref=page_internal"
      ]
      // Facebook selector is case-sensitive, so exact same slug = duplicate
      const result = deduplicateOverrideUrls(urls, "fb")
      expect(result).toHaveLength(1)
    })
  })

  describe("Twitter (tw)", () => {
    it("removes duplicate Twitter URLs from twitter.com and x.com", () => {
      const urls = ["https://twitter.com/someuser", "https://x.com/someuser"]
      const result = deduplicateOverrideUrls(urls, "tw")
      expect(result).toHaveLength(1)
    })
  })

  // ──────────────────────────────────────────────────────────────────────
  // Edge cases
  // ──────────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("returns empty array for empty input", () => {
      expect(deduplicateOverrideUrls([], "li")).toEqual([])
    })

    it("returns single-element array unchanged", () => {
      const urls = ["https://www.linkedin.com/company/foo"]
      expect(deduplicateOverrideUrls(urls, "li")).toEqual(urls)
    })

    it("keeps URLs that don't match the regex pattern", () => {
      const urls = [
        "https://www.linkedin.com/company/foo",
        "https://www.linkedin.com/in/john-doe"
      ]
      const result = deduplicateOverrideUrls(urls, "li")
      // /in/ doesn't match company regex, extractIdentifier throws, so it's kept
      expect(result).toHaveLength(2)
    })

    it("does not mutate the original array", () => {
      const urls = [
        "https://www.linkedin.com/company/acme",
        "https://www.linkedin.com/company/acme/?origin"
      ]
      const originalLength = urls.length
      deduplicateOverrideUrls(urls, "li")
      expect(urls).toHaveLength(originalLength)
    })
  })
})
