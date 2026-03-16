import { describe, it, expect } from "vitest"
import type { FinalDBFileType } from "@theWallProject/common"

import type { ManualOverrideValue } from "./types"
import {
  classifyEntry,
  classifyEntryFields,
  isLinkedInResolverDuplicate,
  isYouTubeResolverDuplicate
} from "./classify_entry"

// ────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ────────────────────────────────────────────────────────────────────────────

/** Minimal ALL.json entry factory */
const makeDbEntry = (overrides: Partial<FinalDBFileType> & { n: string }): FinalDBFileType => ({
  id: overrides.n.toLowerCase().replace(/\s+/g, "-"),
  r: ["h"],
  ...overrides
})

const db: FinalDBFileType[] = [
  makeDbEntry({ n: "Acme Corp", ws: "acme.com", li: "acme-corp", fb: "AcmeCorp", tw: "acmecorp" }),
  makeDbEntry({
    n: "TechStartup",
    ws: "techstartup.io",
    li: "techstartup",
    ytp: "TechStartup",
    ytc: "UCabc123def456"
  }),
  makeDbEntry({ n: "AppCo", ws: "appco.com", android_app_ids: ["com.appco.main"], android_dev_id: "com.appco" }),
  makeDbEntry({ n: "SocialBrand", ig: "socialbrand", gh: "socialbrand", tt: "@socialbrand", th: "@socialbrand" }),
  makeDbEntry({ n: "MultiLi", li: "multili-main" })
]

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — company not in ALL.json
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — company not in ALL.json", () => {
  it("returns 'new' when company name is not found in database", () => {
    const value: ManualOverrideValue = {
      ws: "https://unknown-company.com",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Unknown Company", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — meta-only / urls-only entries
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — entries with no meaningful fields", () => {
  it("returns 'duplicate' for meta-only entry", () => {
    const value: ManualOverrideValue = { _meta: { isHomepage: true } }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' for entry with only _meta and urls", () => {
    const value: ManualOverrideValue = {
      urls: ["https://some-random-url.com"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' for entry with only _meta and name", () => {
    const value: ManualOverrideValue = {
      name: "Acme Corporation",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' for entry with only _meta, urls, name, and alt", () => {
    const value: ManualOverrideValue = {
      name: "Acme Corporation",
      urls: ["https://some-url.com"],
      alt: [{ n: "AcmeAlt", ws: "acme-alt.com" }],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — website field
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — website field", () => {
  it("returns 'duplicate' when ws domain matches ALL.json", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' when ws domain is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      ws: "https://acme-new-domain.com",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'duplicate' when ws is an array and all domains match", () => {
    const value: ManualOverrideValue = {
      ws: ["https://www.acme.com", "https://acme.com/about"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' when ws array has one new domain", () => {
    const value: ManualOverrideValue = {
      ws: ["https://www.acme.com", "https://acme-new.com"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — social link fields
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — social link fields", () => {
  it("returns 'duplicate' when li slug matches ALL.json", () => {
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/acme-corp",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when li slug matches case-insensitively", () => {
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/ACME-CORP",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' when li slug is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/acme-new-page",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'duplicate' when fb matches ALL.json", () => {
    const value: ManualOverrideValue = {
      fb: "https://www.facebook.com/AcmeCorp",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' when fb is not in ALL.json (case-sensitive)", () => {
    const value: ManualOverrideValue = {
      fb: "https://www.facebook.com/acmecorp",
      _meta: { isHomepage: true }
    }
    // Facebook is case-sensitive: "acmecorp" !== "AcmeCorp"
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'duplicate' when tw matches case-insensitively", () => {
    const value: ManualOverrideValue = {
      tw: "https://x.com/AcmeCorp",
      _meta: { isHomepage: true }
    }
    // Twitter is case-insensitive: "AcmeCorp" matches "acmecorp"
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when ig matches ALL.json", () => {
    const value: ManualOverrideValue = {
      ig: "https://www.instagram.com/socialbrand",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("SocialBrand", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when gh matches ALL.json", () => {
    const value: ManualOverrideValue = {
      gh: "https://github.com/socialbrand",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("SocialBrand", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when tt matches ALL.json (with @ prefix)", () => {
    const value: ManualOverrideValue = {
      tt: "https://www.tiktok.com/@socialbrand",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("SocialBrand", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when th matches ALL.json (with @ prefix)", () => {
    const value: ManualOverrideValue = {
      th: "https://www.threads.com/@socialbrand",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("SocialBrand", value, db)).toBe("duplicate")
  })

  it("returns 'new' when ig is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      ig: "https://www.instagram.com/newprofile",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("SocialBrand", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — YouTube fields
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — YouTube fields", () => {
  it("returns 'duplicate' when ytp matches ALL.json", () => {
    const value: ManualOverrideValue = {
      ytp: "https://www.youtube.com/@TechStartup",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when ytp matches case-insensitively", () => {
    const value: ManualOverrideValue = {
      ytp: "https://www.youtube.com/@techstartup",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("duplicate")
  })

  it("returns 'duplicate' when ytc matches ALL.json", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCabc123def456",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("duplicate")
  })

  it("returns 'new' when ytp is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      ytp: "https://www.youtube.com/@NewChannel",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — Android fields
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — Android fields", () => {
  it("returns 'duplicate' when android_app_ids match ALL.json", () => {
    const value: ManualOverrideValue = {
      android_app_ids: ["com.appco.main"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("AppCo", value, db)).toBe("duplicate")
  })

  it("returns 'new' when android_app_ids has a new ID", () => {
    const value: ManualOverrideValue = {
      android_app_ids: ["com.appco.newapp"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("AppCo", value, db)).toBe("new")
  })

  it("returns 'duplicate' when android_dev_id matches ALL.json", () => {
    const value: ManualOverrideValue = {
      android_dev_id: "com.appco",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("AppCo", value, db)).toBe("duplicate")
  })

  it("returns 'new' when android_dev_id differs", () => {
    const value: ManualOverrideValue = {
      android_dev_id: "com.appco.new",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("AppCo", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — mixed fields (some duplicate, some new)
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — mixed fields", () => {
  it("returns 'new' when one field is new even if others are duplicates", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      li: "https://www.linkedin.com/company/acme-corp",
      fb: "https://www.facebook.com/AcmeCorp",
      ig: "https://www.instagram.com/acmenewprofile",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'duplicate' when all fields are duplicates", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      li: "https://www.linkedin.com/company/acme-corp",
      fb: "https://www.facebook.com/AcmeCorp",
      tw: "https://x.com/acmecorp",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — LinkedIn resolver artifacts
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — LinkedIn resolver artifacts", () => {
  it("returns 'duplicate' when li has numerical+slug and slug is in ALL.json", () => {
    const value: ManualOverrideValue = {
      li: [
        "https://www.linkedin.com/company/9999999",
        "https://www.linkedin.com/company/acme-corp"
      ],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' when li has numerical+slug but slug is NOT in ALL.json", () => {
    const value: ManualOverrideValue = {
      li: [
        "https://www.linkedin.com/company/9999999",
        "https://www.linkedin.com/company/brand-new-slug"
      ],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'new' when li has only numerical IDs (no resolver output)", () => {
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/9999999",
      _meta: { isHomepage: true }
    }
    // No slug paired with it — not a resolver artifact, and numerical ID isn't in db
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })

  it("returns 'new' when li has resolver duplicate but another field is new", () => {
    const value: ManualOverrideValue = {
      li: [
        "https://www.linkedin.com/company/9999999",
        "https://www.linkedin.com/company/acme-corp"
      ],
      ig: "https://www.instagram.com/acme-brand-new",
      _meta: { isHomepage: true }
    }
    // li is a resolver duplicate, but ig is new → overall "new"
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — YouTube resolver artifacts
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — YouTube resolver artifacts", () => {
  it("returns 'duplicate' when ytc+ytp both exist in ALL.json", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCabc123def456",
      ytp: "https://www.youtube.com/@TechStartup",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("duplicate")
  })

  it("returns 'new' when ytc exists but ytp is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCabc123def456",
      ytp: "https://www.youtube.com/@BrandNewHandle",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("new")
  })

  it("returns 'new' when ytp exists but ytc is not in ALL.json", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCnewchannel999",
      ytp: "https://www.youtube.com/@TechStartup",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("new")
  })

  it("returns 'new' when ytc+ytp are resolver duplicates but another field is new", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCabc123def456",
      ytp: "https://www.youtube.com/@TechStartup",
      gh: "https://github.com/newrepo",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// isLinkedInResolverDuplicate (unit tests for helper)
// ────────────────────────────────────────────────────────────────────────────

describe("isLinkedInResolverDuplicate", () => {
  // Use only the company's rows (as the real code does)
  const acmeRows = db.filter((row) => row.n === "Acme Corp")

  it("returns true when numerical+slug and slug exists in company rows", () => {
    const urls = [
      "https://www.linkedin.com/company/12345",
      "https://www.linkedin.com/company/acme-corp"
    ]
    expect(isLinkedInResolverDuplicate(urls, acmeRows)).toBe(true)
  })

  it("returns false when no numerical IDs present", () => {
    const urls = ["https://www.linkedin.com/company/acme-corp"]
    expect(isLinkedInResolverDuplicate(urls, acmeRows)).toBe(false)
  })

  it("returns false when no non-numerical slugs present", () => {
    const urls = ["https://www.linkedin.com/company/12345"]
    expect(isLinkedInResolverDuplicate(urls, acmeRows)).toBe(false)
  })

  it("returns false when slug does not exist in company rows", () => {
    const urls = [
      "https://www.linkedin.com/company/12345",
      "https://www.linkedin.com/company/not-in-db"
    ]
    expect(isLinkedInResolverDuplicate(urls, acmeRows)).toBe(false)
  })

  it("returns false when slug exists under a different company", () => {
    // "techstartup" exists in db but under TechStartup, not Acme Corp
    const urls = [
      "https://www.linkedin.com/company/12345",
      "https://www.linkedin.com/company/techstartup"
    ]
    expect(isLinkedInResolverDuplicate(urls, acmeRows)).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// isYouTubeResolverDuplicate (unit tests for helper)
// ────────────────────────────────────────────────────────────────────────────

describe("isYouTubeResolverDuplicate", () => {
  // Use only the company's rows (as the real code does)
  const techRows = db.filter((row) => row.n === "TechStartup")

  it("returns true when both ytp and ytc exist in company rows", () => {
    const ytpUrls = ["https://www.youtube.com/@TechStartup"]
    const ytcUrls = ["https://www.youtube.com/channel/UCabc123def456"]
    expect(isYouTubeResolverDuplicate(ytpUrls, ytcUrls, techRows)).toBe(true)
  })

  it("returns false when ytp does not exist in company rows", () => {
    const ytpUrls = ["https://www.youtube.com/@NotInDb"]
    const ytcUrls = ["https://www.youtube.com/channel/UCabc123def456"]
    expect(isYouTubeResolverDuplicate(ytpUrls, ytcUrls, techRows)).toBe(false)
  })

  it("returns false when ytc does not exist in company rows", () => {
    const ytpUrls = ["https://www.youtube.com/@TechStartup"]
    const ytcUrls = ["https://www.youtube.com/channel/UCnotindb"]
    expect(isYouTubeResolverDuplicate(ytpUrls, ytcUrls, techRows)).toBe(false)
  })

  it("returns false when ytc is empty", () => {
    const ytpUrls = ["https://www.youtube.com/@TechStartup"]
    expect(isYouTubeResolverDuplicate(ytpUrls, [], techRows)).toBe(false)
  })

  it("returns false when ytp is empty", () => {
    const ytcUrls = ["https://www.youtube.com/channel/UCabc123def456"]
    expect(isYouTubeResolverDuplicate([], ytcUrls, techRows)).toBe(false)
  })

  it("returns false when ytp exists under a different company", () => {
    // Search Acme Corp rows — TechStartup's ytp won't be there
    const acmeRows = db.filter((row) => row.n === "Acme Corp")
    const ytpUrls = ["https://www.youtube.com/@TechStartup"]
    const ytcUrls = ["https://www.youtube.com/channel/UCabc123def456"]
    expect(isYouTubeResolverDuplicate(ytpUrls, ytcUrls, acmeRows)).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — entries without _meta (hand-curated)
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — entries without _meta", () => {
  it("returns 'duplicate' for hand-curated entry with matching fields", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      li: "https://www.linkedin.com/company/acme-corp"
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("duplicate")
  })

  it("returns 'new' for hand-curated entry with new field", () => {
    const value: ManualOverrideValue = {
      ws: "https://acme-brand-new.com"
    }
    expect(classifyEntry("Acme Corp", value, db)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntry — company-scoped comparison (cross-company must NOT match)
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntry — company-scoped comparison", () => {
  it("returns 'new' when selector exists in ALL.json but under a different company", () => {
    // "acme.com" domain exists in ALL.json under "Acme Corp",
    // but "MultiLi" has no ws field — so an override adding acme.com to MultiLi is new
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("MultiLi", value, db)).toBe("new")
  })

  it("returns 'new' when li slug exists under a different company", () => {
    // "acme-corp" LinkedIn slug exists under "Acme Corp",
    // but "TechStartup" has li: "techstartup" — different slug
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/acme-corp",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("new")
  })

  it("returns 'duplicate' when selector exists under the SAME company", () => {
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/techstartup",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("TechStartup", value, db)).toBe("duplicate")
  })

  it("returns 'new' when company exists but the specific field is absent in ALL.json", () => {
    // "MultiLi" exists in db with li: "multili-main", but has no ws field
    const value: ManualOverrideValue = {
      ws: "https://multili.com",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("MultiLi", value, db)).toBe("new")
  })

  it("handles companies with multiple rows (from array-URL splitting)", () => {
    // Simulate a company with multiple rows in ALL.json
    const dbWithMultiRows: FinalDBFileType[] = [
      makeDbEntry({ n: "MultiRow", id: "multirow", ws: "multirow.com", li: "multirow" }),
      makeDbEntry({ n: "MultiRow", id: "multirow_manual_li_multirow-extra", li: "multirow-extra" })
    ]

    // Override with both LinkedIn slugs — both exist across the company's rows
    const value: ManualOverrideValue = {
      li: ["https://www.linkedin.com/company/multirow", "https://www.linkedin.com/company/multirow-extra"],
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("MultiRow", value, dbWithMultiRows)).toBe("duplicate")

    // Override with a new slug not in any row
    const newValue: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/multirow-brand-new",
      _meta: { isHomepage: true }
    }
    expect(classifyEntry("MultiRow", newValue, dbWithMultiRows)).toBe("new")
  })
})

// ────────────────────────────────────────────────────────────────────────────
// classifyEntryFields — per-field classification
// ────────────────────────────────────────────────────────────────────────────

describe("classifyEntryFields — per-field classification", () => {
  it("returns empty map for meta-only entry", () => {
    const value: ManualOverrideValue = { _meta: { isHomepage: true } }
    expect(classifyEntryFields("Acme Corp", value, db)).toEqual({})
  })

  it("returns empty map for entry with only ignored fields (_meta, urls, name, alt)", () => {
    const value: ManualOverrideValue = {
      name: "Acme Corporation",
      urls: ["https://some-url.com"],
      alt: [{ n: "AcmeAlt", ws: "acme-alt.com" }],
      _meta: { isHomepage: true }
    }
    expect(classifyEntryFields("Acme Corp", value, db)).toEqual({})
  })

  it("classifies all fields as 'new' when company is not in db", () => {
    const value: ManualOverrideValue = {
      ws: "https://unknown.com",
      li: "https://www.linkedin.com/company/unknown",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("Unknown Company", value, db)
    expect(result).toEqual({ ws: "new", li: "new" })
  })

  it("classifies each field independently — mixed new and duplicate", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      li: "https://www.linkedin.com/company/acme-corp",
      fb: "https://www.facebook.com/AcmeCorp",
      ig: "https://www.instagram.com/acme-brand-new",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("Acme Corp", value, db)
    expect(result).toEqual({
      ws: "duplicate",
      li: "duplicate",
      fb: "duplicate",
      ig: "new"
    })
  })

  it("classifies all fields as 'duplicate' when all match", () => {
    const value: ManualOverrideValue = {
      ws: "https://www.acme.com",
      li: "https://www.linkedin.com/company/acme-corp",
      fb: "https://www.facebook.com/AcmeCorp",
      tw: "https://x.com/acmecorp",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("Acme Corp", value, db)
    expect(result).toEqual({
      ws: "duplicate",
      li: "duplicate",
      fb: "duplicate",
      tw: "duplicate"
    })
  })

  it("classifies LinkedIn resolver artifacts as 'duplicate' per-field", () => {
    const value: ManualOverrideValue = {
      li: [
        "https://www.linkedin.com/company/9999999",
        "https://www.linkedin.com/company/acme-corp"
      ],
      ig: "https://www.instagram.com/acme-brand-new",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("Acme Corp", value, db)
    expect(result).toEqual({
      li: "duplicate",
      ig: "new"
    })
  })

  it("classifies YouTube resolver artifacts as 'duplicate' per-field", () => {
    const value: ManualOverrideValue = {
      ytc: "https://www.youtube.com/channel/UCabc123def456",
      ytp: "https://www.youtube.com/@TechStartup",
      gh: "https://github.com/newrepo",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("TechStartup", value, db)
    expect(result).toEqual({
      ytc: "duplicate",
      ytp: "duplicate",
      gh: "new"
    })
  })

  it("classifies Android fields independently", () => {
    const value: ManualOverrideValue = {
      android_app_ids: ["com.appco.main"],
      android_dev_id: "com.appco.new",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("AppCo", value, db)
    expect(result).toEqual({
      android_app_ids: "duplicate",
      android_dev_id: "new"
    })
  })

  it("is consistent with classifyEntry — 'new' iff any field is 'new'", () => {
    const testCases: Array<{ name: string; value: ManualOverrideValue }> = [
      {
        name: "Acme Corp",
        value: { ws: "https://www.acme.com", li: "https://www.linkedin.com/company/acme-corp", _meta: { isHomepage: true } }
      },
      {
        name: "Acme Corp",
        value: { ws: "https://www.acme.com", ig: "https://www.instagram.com/new-profile", _meta: { isHomepage: true } }
      },
      {
        name: "Unknown Co",
        value: { ws: "https://unknown.com", _meta: { isHomepage: true } }
      },
      {
        name: "Acme Corp",
        value: { _meta: { isHomepage: true } }
      }
    ]

    for (const { name, value } of testCases) {
      const entryResult = classifyEntry(name, value, db)
      const fieldResults = classifyEntryFields(name, value, db)
      const fieldValues = Object.values(fieldResults)
      const expectedEntry = fieldValues.length === 0
        ? "duplicate"
        : fieldValues.some((v) => v === "new")
          ? "new"
          : "duplicate"
      expect(entryResult).toBe(expectedEntry)
    }
  })

  it("scopes comparison to same company — cross-company fields are 'new'", () => {
    // "acme-corp" LinkedIn slug exists under "Acme Corp", not "TechStartup"
    const value: ManualOverrideValue = {
      li: "https://www.linkedin.com/company/acme-corp",
      ytp: "https://www.youtube.com/@TechStartup",
      _meta: { isHomepage: true }
    }
    const result = classifyEntryFields("TechStartup", value, db)
    expect(result).toEqual({
      li: "new",
      ytp: "duplicate"
    })
  })
})
