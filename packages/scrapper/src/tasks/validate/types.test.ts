import { describe, it, expect } from "vitest"
import { hasMeta, isVerified, isHomepage, isBrowserVerified, isAssetlinks, assertNoLegacyProcessed } from "./types"
import type { ManualOverrideValue } from "./types"

describe("hasMeta", () => {
  it("returns true for { _meta: {} }", () => {
    const value: ManualOverrideValue = { _meta: {} }
    expect(hasMeta(value)).toBe(true)
  })

  it("returns true for fields with _meta", () => {
    const value: ManualOverrideValue = { ws: "https://example.com", _meta: { isHomepage: true } }
    expect(hasMeta(value)).toBe(true)
  })

  it("returns false for plain fields without _meta", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(hasMeta(value)).toBe(false)
  })
})

describe("isHomepage", () => {
  it("returns true for { _meta: { isHomepage: true } }", () => {
    const value: ManualOverrideValue = { _meta: { isHomepage: true } }
    expect(isHomepage(value)).toBe(true)
  })

  it("returns true for fields with _meta.isHomepage: true", () => {
    const value: ManualOverrideValue = { android_app_ids: ["com.example"], _meta: { isHomepage: true } }
    expect(isHomepage(value)).toBe(true)
  })

  it("returns false for _meta.isVerified: true", () => {
    const value: ManualOverrideValue = { _meta: { isVerified: true } }
    expect(isHomepage(value)).toBe(false)
  })

  it("returns false for _meta.isAssetlinks: true", () => {
    const value: ManualOverrideValue = { _meta: { isAssetlinks: true } }
    expect(isHomepage(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isHomepage(value)).toBe(false)
  })
})

describe("isVerified", () => {
  it("returns true for { _meta: { isVerified: true } }", () => {
    const value: ManualOverrideValue = { _meta: { isVerified: true } }
    expect(isVerified(value)).toBe(true)
  })

  it("returns false for _meta.isHomepage: true", () => {
    const value: ManualOverrideValue = { _meta: { isHomepage: true } }
    expect(isVerified(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isVerified(value)).toBe(false)
  })
})

describe("isBrowserVerified", () => {
  it("returns true for { _meta: { isBrowserVerified: true } }", () => {
    const value: ManualOverrideValue = { _meta: { isVerified: true, isBrowserVerified: true } }
    expect(isBrowserVerified(value)).toBe(true)
  })

  it("returns false for _meta.isVerified without isBrowserVerified", () => {
    const value: ManualOverrideValue = { _meta: { isVerified: true } }
    expect(isBrowserVerified(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isBrowserVerified(value)).toBe(false)
  })
})

describe("isAssetlinks", () => {
  it("returns true for { _meta: { isAssetlinks: true } }", () => {
    const value: ManualOverrideValue = { _meta: { isAssetlinks: true } }
    expect(isAssetlinks(value)).toBe(true)
  })

  it("returns true for fields with _meta.isAssetlinks: true", () => {
    const value: ManualOverrideValue = { android_app_ids: ["com.example.app"], _meta: { isAssetlinks: true } }
    expect(isAssetlinks(value)).toBe(true)
  })

  it("returns false for _meta.isHomepage: true", () => {
    const value: ManualOverrideValue = { _meta: { isHomepage: true } }
    expect(isAssetlinks(value)).toBe(false)
  })

  it("returns false for _meta.isVerified: true", () => {
    const value: ManualOverrideValue = { _meta: { isVerified: true } }
    expect(isAssetlinks(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isAssetlinks(value)).toBe(false)
  })
})

describe("assertNoLegacyProcessed", () => {
  it("throws for entries with _processed field", () => {
    const value = { _processed: true }
    expect(() => assertNoLegacyProcessed(value, "test_entry")).toThrow(
      'Legacy _processed field found on entry "test_entry"'
    )
  })

  it("does not throw for entries without _processed", () => {
    const value = { _meta: { isHomepage: true } }
    expect(() => assertNoLegacyProcessed(value, "test_entry")).not.toThrow()
  })

  it("does not throw for plain fields", () => {
    const value = { ws: "https://example.com" }
    expect(() => assertNoLegacyProcessed(value, "test_entry")).not.toThrow()
  })
})

describe("type guard exclusivity", () => {
  it("each guard matches exactly one _meta state", () => {
    const states: ManualOverrideValue[] = [
      { _meta: { isHomepage: true } },
      { _meta: { isVerified: true } },
      { _meta: { isBrowserVerified: true, isVerified: true } },
      { _meta: { isAssetlinks: true } },
      { ws: "https://example.com" }
    ]

    const results = states.map((s) => ({
      homepage: isHomepage(s),
      verified: isVerified(s),
      browserVerified: isBrowserVerified(s),
      assetlinks: isAssetlinks(s)
    }))

    // _meta: { isHomepage: true }
    expect(results[0]).toEqual({ homepage: true, verified: false, browserVerified: false, assetlinks: false })
    // _meta: { isVerified: true }
    expect(results[1]).toEqual({ homepage: false, verified: true, browserVerified: false, assetlinks: false })
    // _meta: { isBrowserVerified: true, isVerified: true }
    expect(results[2]).toEqual({ homepage: false, verified: true, browserVerified: true, assetlinks: false })
    // _meta: { isAssetlinks: true }
    expect(results[3]).toEqual({ homepage: false, verified: false, browserVerified: false, assetlinks: true })
    // no _meta
    expect(results[4]).toEqual({ homepage: false, verified: false, browserVerified: false, assetlinks: false })
  })
})
