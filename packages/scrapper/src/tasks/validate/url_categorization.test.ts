import { describe, it, expect } from "vitest"
import { categorizeUrl, isFromRegexDomain } from "./url_categorization"

describe("isFromRegexDomain", () => {
  it("returns true for bare regex domains", () => {
    expect(isFromRegexDomain("https://linkedin.com/legal/privacy")).toBe(true)
    expect(isFromRegexDomain("https://facebook.com/sharer.php")).toBe(true)
    expect(isFromRegexDomain("https://twitter.com/intent/tweet")).toBe(true)
    expect(isFromRegexDomain("https://x.com/intent/tweet")).toBe(true)
    expect(isFromRegexDomain("https://instagram.com/accounts/login")).toBe(true)
    expect(isFromRegexDomain("https://github.com/about")).toBe(true)
    expect(isFromRegexDomain("https://youtube.com/watch?v=abc")).toBe(true)
    expect(isFromRegexDomain("https://tiktok.com/about")).toBe(true)
    expect(isFromRegexDomain("https://threads.com/login")).toBe(true)
  })

  it("returns true for www. subdomains", () => {
    expect(isFromRegexDomain("https://www.linkedin.com/legal")).toBe(true)
    expect(isFromRegexDomain("https://www.facebook.com/sharer")).toBe(true)
    expect(isFromRegexDomain("https://www.twitter.com/intent")).toBe(true)
  })

  it("returns true for m. subdomains", () => {
    expect(isFromRegexDomain("https://m.facebook.com/sharer")).toBe(true)
    expect(isFromRegexDomain("https://m.youtube.com/watch")).toBe(true)
  })

  it("returns true for mobile. subdomains", () => {
    expect(isFromRegexDomain("https://mobile.twitter.com/intent")).toBe(true)
  })

  it("returns true for business. subdomains", () => {
    expect(isFromRegexDomain("https://business.facebook.com/page")).toBe(true)
  })

  it("returns true for l. and lm. subdomains", () => {
    expect(isFromRegexDomain("https://l.facebook.com/redirect")).toBe(true)
    expect(isFromRegexDomain("https://lm.facebook.com/redirect")).toBe(true)
  })

  it("returns true for platform. subdomains (the fix for platform.twitter.com)", () => {
    expect(isFromRegexDomain("https://platform.twitter.com/widgets/follow_button.html")).toBe(true)
    expect(isFromRegexDomain("https://platform.twitter.com/widgets/tweet_button.html")).toBe(true)
    expect(isFromRegexDomain("https://platform.instagram.com/embed")).toBe(true)
  })

  it("returns false for non-regex domains", () => {
    expect(isFromRegexDomain("https://example.com")).toBe(false)
    expect(isFromRegexDomain("https://google.com")).toBe(false)
    expect(isFromRegexDomain("https://crunchbase.com/org/test")).toBe(false)
  })

  it("returns false for unrecognized subdomains of regex domains", () => {
    expect(isFromRegexDomain("https://api.twitter.com/endpoint")).toBe(false)
    expect(isFromRegexDomain("https://developer.facebook.com/docs")).toBe(false)
    expect(isFromRegexDomain("https://studio.youtube.com/channel")).toBe(false)
  })

  it("returns false for invalid URLs", () => {
    expect(isFromRegexDomain("not a url")).toBe(false)
    expect(isFromRegexDomain("")).toBe(false)
  })
})

describe("categorizeUrl", () => {
  it("categorizes LinkedIn company URLs", () => {
    expect(categorizeUrl("https://www.linkedin.com/company/acme-corp")).toBe("li")
    expect(categorizeUrl("https://linkedin.com/company/acme-corp/")).toBe("li")
  })

  it("categorizes Facebook URLs", () => {
    expect(categorizeUrl("https://www.facebook.com/AcmeCorp")).toBe("fb")
  })

  it("categorizes Twitter/X URLs", () => {
    expect(categorizeUrl("https://twitter.com/AcmeCorp")).toBe("tw")
    expect(categorizeUrl("https://x.com/AcmeCorp")).toBe("tw")
  })

  it("categorizes Instagram URLs", () => {
    expect(categorizeUrl("https://www.instagram.com/acmecorp")).toBe("ig")
  })

  it("categorizes GitHub URLs", () => {
    expect(categorizeUrl("https://github.com/acme-corp")).toBe("gh")
  })

  it("categorizes YouTube profile URLs", () => {
    expect(categorizeUrl("https://www.youtube.com/@AcmeCorp")).toBe("ytp")
  })

  it("categorizes YouTube channel URLs", () => {
    expect(categorizeUrl("https://www.youtube.com/channel/UCxxxxxxxx")).toBe("ytc")
  })

  it("categorizes TikTok URLs", () => {
    expect(categorizeUrl("https://www.tiktok.com/@acmecorp")).toBe("tt")
  })

  it("categorizes Threads URLs", () => {
    expect(categorizeUrl("https://www.threads.com/@acmecorp")).toBe("th")
  })

  it("returns null for excluded patterns", () => {
    expect(categorizeUrl("https://www.youtube.com/watch?v=abc123")).toBeNull()
    expect(categorizeUrl("https://apps.apple.com/app/acme")).toBeNull()
    expect(categorizeUrl("https://play.google.com/store/apps/details?id=com.acme")).toBeNull()
  })

  it("returns null for non-social URLs", () => {
    expect(categorizeUrl("https://www.example.com")).toBeNull()
    expect(categorizeUrl("https://www.acme-corp.com/about")).toBeNull()
  })

  it("returns null for invalid URLs", () => {
    expect(categorizeUrl("not a url")).toBeNull()
  })
})
