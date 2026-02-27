import { describe, it, expect } from "vitest"
import { cleanWebsite } from "./helper"

describe("cleanWebsite", () => {
  // ──────────────────────────────────────────────────────────────────────
  // Protocol stripping
  // ──────────────────────────────────────────────────────────────────────

  it("strips https:// protocol", () => {
    expect(cleanWebsite("https://www.example.com")).toBe("www.example.com")
  })

  it("strips http:// protocol", () => {
    expect(cleanWebsite("http://www.example.com")).toBe("www.example.com")
  })

  it("handles URL without protocol", () => {
    expect(cleanWebsite("www.example.com")).toBe("www.example.com")
  })

  // ──────────────────────────────────────────────────────────────────────
  // Trailing slash removal
  // ──────────────────────────────────────────────────────────────────────

  it("removes trailing slash", () => {
    expect(cleanWebsite("https://www.example.com/")).toBe("www.example.com")
  })

  it("does not remove path-internal slashes", () => {
    expect(cleanWebsite("https://www.example.com/path/to/page")).toBe("www.example.com/path/to/page")
  })

  // ──────────────────────────────────────────────────────────────────────
  // Query parameter stripping (/?... format)
  // ──────────────────────────────────────────────────────────────────────

  it("strips query params in /? format", () => {
    expect(cleanWebsite("https://www.linkedin.com/company/foo/?origin")).toBe("www.linkedin.com/company/foo")
  })

  it("strips query params with full key=value in /? format", () => {
    expect(cleanWebsite("https://www.linkedin.com/company/foo/?originalSubdomain=il")).toBe(
      "www.linkedin.com/company/foo"
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // Edge cases
  // ──────────────────────────────────────────────────────────────────────

  it("returns undefined for undefined input", () => {
    expect(cleanWebsite(undefined)).toBeUndefined()
  })

  it("returns empty string for empty string input", () => {
    expect(cleanWebsite("")).toBe("")
  })

  it("handles URL with only protocol", () => {
    expect(cleanWebsite("https://")).toBe("")
  })

  it("handles complex LinkedIn URL", () => {
    expect(cleanWebsite("https://www.linkedin.com/company/urban-aeronautics/?origin")).toBe(
      "www.linkedin.com/company/urban-aeronautics"
    )
  })

  it("preserves path without query params", () => {
    expect(cleanWebsite("https://www.linkedin.com/company/cellebrite")).toBe("www.linkedin.com/company/cellebrite")
  })

  it("handles URL with trk query param (without /?)", () => {
    // Note: cleanWebsite uses .split("/?") — only strips "/?..." format, not "?..."
    // This is intentional: not all query params should be stripped for all URL types
    expect(cleanWebsite("http://www.linkedin.com/company/2837526?trk=tyah")).toBe(
      "www.linkedin.com/company/2837526?trk=tyah"
    )
  })

  it("handles URL with company-beta path (pre-normalization)", () => {
    expect(cleanWebsite("https://www.linkedin.com/company-beta/some-company")).toBe(
      "www.linkedin.com/company-beta/some-company"
    )
  })
})
