import { describe, expect, it } from "vitest"

import { isFilteredDomain, shouldKeepWebsite } from "./extract_websites"

/**
 * The filter that stops a scraped profile URL from blocking a whole platform.
 *
 * Incoming data must keep being refused. A curated hint is allowed through only when it names a
 * host *below* the filtered domain, because that is the difference between "the Google Ads console"
 * and "Google" — and the second would put a hint on Search, Gmail and Docs.
 */
describe("isFilteredDomain", () => {
  it("recognises each filtered platform", () => {
    expect(isFilteredDomain("google.com")).toBe(true)
    expect(isFilteredDomain("business.site")).toBe(true)
    expect(isFilteredDomain("store.steampowered.com")).toBe(true)
    expect(isFilteredDomain("meetup.com")).toBe(true)
  })

  it("matches apple at the apex and under it", () => {
    // The list spells it ".apple.com" to mean "subdomains of apple.com"; label matching now also
    // covers the apex, which is what that entry was trying to describe.
    expect(isFilteredDomain("apple.com")).toBe(true)
    expect(isFilteredDomain("support.apple.com")).toBe(true)
  })

  it("recognises them under a subdomain too", () => {
    expect(isFilteredDomain("ads.google.com")).toBe(true)
    expect(isFilteredDomain("ditu.google.com")).toBe(true)
    expect(isFilteredDomain("secure.apple.com")).toBe(true)
  })

  it("does not touch ordinary domains", () => {
    expect(isFilteredDomain("wix.com")).toBe(false)
    expect(isFilteredDomain("ethicly.ch")).toBe(false)
  })

  it("does not match a name that merely ends with a filtered one", () => {
    // Was a substring defect: `"notgoogle.com".includes("google.com")` is true, so a real company
    // with such a name was dropped as a scrape defect. Label boundaries are the fix.
    expect(isFilteredDomain("notgoogle.com")).toBe(false)
    expect(isFilteredDomain("mygoogle.com")).toBe(false)
    expect(isFilteredDomain("notmeetup.com")).toBe(false)
    expect(isFilteredDomain("fakeapple.co")).toBe(false)
    // `.steampowered` is a segment, not a full name, so it catches any host whose labels include it
    // — that breadth existed before (it caught store.steampowered.co) and is kept. What it no longer
    // does is match a name that merely ends with the letters.
    expect(isFilteredDomain("mysteampowered.co")).toBe(false)
  })

  it("still matches the filtered name as a whole label", () => {
    expect(isFilteredDomain("google.com")).toBe(true)
    expect(isFilteredDomain("meetup.com")).toBe(true)
    expect(isFilteredDomain("business.site")).toBe(true)
    expect(isFilteredDomain("www.google.com")).toBe(true)
    expect(isFilteredDomain("a.b.google.com")).toBe(true)
  })

  it("ignores case and a trailing dot", () => {
    expect(isFilteredDomain("GOOGLE.COM")).toBe(true)
    expect(isFilteredDomain("google.com.")).toBe(true)
  })
})

describe("shouldKeepWebsite - incoming data", () => {
  const excluded: string[] = []
  const keep = (ws: string) => shouldKeepWebsite({ ws }, (m) => excluded.push(m))

  it("keeps an ordinary company website", () => {
    expect(keep("https://www.wix.com")).toBe(true)
  })

  it("keeps a website whose name merely ends with a filtered one", () => {
    expect(keep("https://notgoogle.com")).toBe(true)
    expect(keep("https://mygoogle.com/shop")).toBe(true)
  })

  it("drops a scraped google.com URL", () => {
    expect(keep("https://www.google.com/search")).toBe(false)
  })

  it("drops a scraped google.com URL even with no path", () => {
    expect(keep("https://google.com")).toBe(false)
  })

  it("drops a scraped subdomain of a filtered platform", () => {
    expect(keep("https://ads.google.com/aw")).toBe(false)
  })

  it("drops the other filtered platforms", () => {
    expect(keep("https://myshop.business.site")).toBe(false)
    expect(keep("https://store.steampowered.com/app/1")).toBe(false)
    expect(keep("https://www.meetup.com/group")).toBe(false)
    expect(keep("https://support.apple.com/en")).toBe(false)
  })

  it("does not let an incoming row claim the hint exemption", () => {
    expect(shouldKeepWebsite({ ws: "https://ads.google.com/aw", isHint: false })).toBe(false)
    expect(shouldKeepWebsite({ ws: "https://ads.google.com/aw" })).toBe(false)
  })

  it("reports why a website was excluded", () => {
    excluded.length = 0
    keep("https://www.google.com/search")
    expect(excluded).toHaveLength(1)
    expect(excluded[0]).toContain("google.com")
  })

  it("drops a row with no website", () => {
    expect(shouldKeepWebsite({ ws: "" })).toBe(false)
    expect(shouldKeepWebsite({})).toBe(false)
  })
})

describe("shouldKeepWebsite - curated hints", () => {
  it("keeps a hint on a host below a filtered domain", () => {
    expect(shouldKeepWebsite({ ws: "https://ads.google.com", isHint: true })).toBe(true)
  })

  it("keeps a hint on a filtered domain's deeper subdomain", () => {
    expect(shouldKeepWebsite({ ws: "https://ads.google.com/aw", isHint: true })).toBe(true)
  })

  it("still drops a hint on the bare filtered host", () => {
    expect(shouldKeepWebsite({ ws: "https://google.com", isHint: true })).toBe(false)
  })

  it("still drops a hint on www of the bare filtered host", () => {
    expect(shouldKeepWebsite({ ws: "https://www.google.com", isHint: true })).toBe(false)
  })

  it("still drops a hint on the bare filtered host with a path", () => {
    expect(shouldKeepWebsite({ ws: "https://google.com/search", isHint: true })).toBe(false)
  })

  it("keeps a hint on a subdomain of any filtered platform", () => {
    expect(shouldKeepWebsite({ ws: "https://store.steampowered.com", isHint: true })).toBe(true)
    expect(shouldKeepWebsite({ ws: "https://support.apple.com", isHint: true })).toBe(true)
  })

  it("drops a hint on a bare filtered platform that the filter covers", () => {
    expect(shouldKeepWebsite({ ws: "https://meetup.com", isHint: true })).toBe(false)
    expect(shouldKeepWebsite({ ws: "https://business.site", isHint: true })).toBe(false)
  })

  it("keeps a hint on an ordinary domain", () => {
    expect(shouldKeepWebsite({ ws: "https://instagram.com", isHint: true })).toBe(true)
    expect(shouldKeepWebsite({ ws: "https://business.facebook.com", isHint: true })).toBe(true)
  })
})

/**
 * The fail-hard path only runs inside `run()`, which needs the whole merged dataset. These call the
 * predicate the same way the loop does, so the contract is pinned where it is cheap.
 */
describe("override as the decision", () => {
  it("a curated real website passes the filter", () => {
    expect(shouldKeepWebsite({ ws: "https://scouterapp.com" })).toBe(true)
  })

  it("the rejected platform URL would have failed", () => {
    expect(shouldKeepWebsite({ ws: "https://apps.apple.com" })).toBe(false)
  })
})
