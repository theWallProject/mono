import { describe, expect, it } from "vitest"

import {
  buildCompanyProfileFromHtml,
  buildProfileText,
  extractJsonLdNodes,
  extractMetaDescription,
  extractTitle
} from "./companyProfile"

// Trimmed from the real brainsmingle.com page, which is the reference case for this flow.
const REAL_HTML = `<!doctype html><html><head>
<title>Video Networking Platform for Professionals | BrainsMingle</title>
<meta name="description" content="Meet people in your field face to face in short 1:1 video rounds." />
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","name":"BrainsMingle","url":"https://brainsmingle.com/",
  "description":"Video-first networking platform for professionals: speed networking, webinars, paid consultations, courses and communities.",
  "sameAs":["https://www.linkedin.com/company/brainsmingle/","https://x.com/brainsmingle"]},
 {"@type":"WebSite","name":"BrainsMingle","url":"https://brainsmingle.com/"}
]}
</script></head><body></body></html>`

describe("extractMetaDescription", () => {
  it("reads a plain meta description", () => {
    expect(extractMetaDescription(REAL_HTML)).toBe("Meet people in your field face to face in short 1:1 video rounds.")
  })

  it("handles attribute order variations", () => {
    const html = `<meta content="Reordered description" name="description">`
    expect(extractMetaDescription(html)).toBe("Reordered description")
  })

  it("falls back to og:description", () => {
    const html = `<meta property="og:description" content="OpenGraph description">`
    expect(extractMetaDescription(html)).toBe("OpenGraph description")
  })

  it("returns undefined when there is no description", () => {
    expect(extractMetaDescription("<html><head></head></html>")).toBeUndefined()
  })

  it("decodes HTML entities", () => {
    const html = `<meta name="description" content="Data &amp; analytics">`
    expect(extractMetaDescription(html)).toBe("Data & analytics")
  })
})

describe("extractTitle", () => {
  it("reads the title tag and collapses whitespace", () => {
    expect(extractTitle(REAL_HTML)).toBe("Video Networking Platform for Professionals | BrainsMingle")
  })

  it("returns undefined when absent", () => {
    expect(extractTitle("<html></html>")).toBeUndefined()
  })
})

describe("extractJsonLdNodes", () => {
  it("unwraps an @graph block", () => {
    const nodes = extractJsonLdNodes(REAL_HTML)
    const names = nodes.map((node) => node.name).filter((name) => name !== undefined)
    expect(names).toContain("BrainsMingle")
  })

  it("reads a bare array of nodes", () => {
    const html = `<script type="application/ld+json">[{"@type":"Organization","name":"Solo"}]</script>`
    expect(extractJsonLdNodes(html)[0]?.name).toBe("Solo")
  })

  it("reads a single bare object", () => {
    const html = `<script type="application/ld+json">{"@type":"Organization","name":"Bare"}</script>`
    expect(extractJsonLdNodes(html)[0]?.name).toBe("Bare")
  })

  it("skips malformed blocks instead of throwing", () => {
    // A broken block must not take down an otherwise usable page.
    const html = `
      <script type="application/ld+json">{not valid json</script>
      <script type="application/ld+json">{"@type":"Organization","name":"Survivor"}</script>`
    const nodes = extractJsonLdNodes(html)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]?.name).toBe("Survivor")
  })

  it("ignores scripts that are not ld+json", () => {
    const html = `<script type="text/javascript">var x = 1;</script>`
    expect(extractJsonLdNodes(html)).toEqual([])
  })

  it("normalizes a string @type and an array @type alike", () => {
    const html = `<script type="application/ld+json">
      {"@type":["Organization","Corporation"],"name":"Multi"}</script>`
    expect(extractJsonLdNodes(html)[0]?.["@type"]).toEqual(["Organization", "Corporation"])
  })
})

describe("buildCompanyProfileFromHtml", () => {
  it("pulls name, description and sameAs from the organization node", () => {
    const profile = buildCompanyProfileFromHtml(REAL_HTML)

    expect(profile.name).toBe("BrainsMingle")
    expect(profile.description).toContain("speed networking")
    expect(profile.sameAs).toEqual([
      "https://www.linkedin.com/company/brainsmingle/",
      "https://x.com/brainsmingle"
    ])
    expect(profile.sources).toContain("jsonLd")
  })

  it("reports which sources contributed", () => {
    const onlyMeta = `<meta name="description" content="Just a meta description">`
    expect(buildCompanyProfileFromHtml(onlyMeta).sources).toEqual(["metaDescription"])

    const nothing = `<html><head></head><body></body></html>`
    expect(buildCompanyProfileFromHtml(nothing).sources).toEqual([])
  })

  it("accepts a SoftwareApplication node as organization-like", () => {
    const html = `<script type="application/ld+json">
      {"@type":"SoftwareApplication","name":"App Co","description":"An app"}</script>`
    const profile = buildCompanyProfileFromHtml(html)
    expect(profile.name).toBe("App Co")
  })

  it("handles sameAs given as a single string", () => {
    const html = `<script type="application/ld+json">
      {"@type":"Organization","name":"One","sameAs":"https://x.com/one"}</script>`
    expect(buildCompanyProfileFromHtml(html).sameAs).toEqual(["https://x.com/one"])
  })
})

describe("buildProfileText", () => {
  it("uses the description, not the company name", () => {
    // Regression: including the name made "BrainsMingle" match every company called
    // Brain*, which outranked real competitors. Measured: Sage Pair fell 0.66 -> 0.53.
    const text = buildProfileText({
      name: "BrainsMingle",
      description: "Video networking for professionals",
      sameAs: [],
      sources: ["jsonLd"]
    })

    expect(text).toBe("Video networking for professionals")
    expect(text).not.toContain("BrainsMingle")
  })

  it("excludes the page title, which usually just repeats the brand", () => {
    const text = buildProfileText({
      description: "Speed networking rounds",
      title: "BrainsMingle | Video Networking",
      sameAs: [],
      sources: ["jsonLd", "title"]
    })

    expect(text).toBe("Speed networking rounds")
  })

  it("combines description and meta description", () => {
    const text = buildProfileText({
      description: "JSON-LD description",
      metaDescription: "Meta description",
      sameAs: [],
      sources: ["jsonLd", "metaDescription"]
    })

    expect(text).toBe("JSON-LD description. Meta description")
  })

  it("skips blank parts rather than leaving separators behind", () => {
    const text = buildProfileText({ metaDescription: "Only meta", sameAs: [], sources: ["metaDescription"] })
    expect(text).toBe("Only meta")
  })

  it("does not double up periods when a part already ends with one", () => {
    const text = buildProfileText({
      description: "Analytics for everyone.",
      sameAs: [],
      sources: ["jsonLd"]
    })
    expect(text).toBe("Analytics for everyone")
    expect(text).not.toContain("..")
  })

  it("caps the length so a long page cannot flood the embedding", () => {
    const text = buildProfileText({ description: "x".repeat(2000), sameAs: [], sources: [] })
    expect(text.length).toBeLessThanOrEqual(600)
  })

  it("returns an empty string when nothing was found", () => {
    expect(buildProfileText({ sameAs: [], sources: [] })).toBe("")
  })
})
