import { describe, it, expect } from "vitest"
import { isAssetlinksExtracted, isAutoExtracted, isProcessed } from "./types"
import type { ManualOverrideValue } from "./types"

describe("isProcessed", () => {
  it("returns true for { _processed: true }", () => {
    const value: ManualOverrideValue = { _processed: true }
    expect(isProcessed(value)).toBe(true)
  })

  it("returns true for fields with _processed: true", () => {
    const value: ManualOverrideValue = { ws: "https://example.com", _processed: true }
    expect(isProcessed(value)).toBe(true)
  })

  it("returns false for _processed: 'auto'", () => {
    const value: ManualOverrideValue = { _processed: "auto" }
    expect(isProcessed(value)).toBe(false)
  })

  it("returns false for _processed: 'assetlinks'", () => {
    const value: ManualOverrideValue = { _processed: "assetlinks" }
    expect(isProcessed(value)).toBe(false)
  })

  it("returns false for plain fields without _processed", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isProcessed(value)).toBe(false)
  })
})

describe("isAutoExtracted", () => {
  it("returns true for { _processed: 'auto' }", () => {
    const value: ManualOverrideValue = { _processed: "auto" }
    expect(isAutoExtracted(value)).toBe(true)
  })

  it("returns true for fields with _processed: 'auto'", () => {
    const value: ManualOverrideValue = { android_app_ids: ["com.example"], _processed: "auto" }
    expect(isAutoExtracted(value)).toBe(true)
  })

  it("returns false for _processed: true", () => {
    const value: ManualOverrideValue = { _processed: true }
    expect(isAutoExtracted(value)).toBe(false)
  })

  it("returns false for _processed: 'assetlinks'", () => {
    const value: ManualOverrideValue = { _processed: "assetlinks" }
    expect(isAutoExtracted(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isAutoExtracted(value)).toBe(false)
  })
})

describe("isAssetlinksExtracted", () => {
  it("returns true for { _processed: 'assetlinks' }", () => {
    const value: ManualOverrideValue = { _processed: "assetlinks" }
    expect(isAssetlinksExtracted(value)).toBe(true)
  })

  it("returns true for fields with _processed: 'assetlinks'", () => {
    const value: ManualOverrideValue = { android_app_ids: ["com.example.app"], _processed: "assetlinks" }
    expect(isAssetlinksExtracted(value)).toBe(true)
  })

  it("returns false for _processed: true", () => {
    const value: ManualOverrideValue = { _processed: true }
    expect(isAssetlinksExtracted(value)).toBe(false)
  })

  it("returns false for _processed: 'auto'", () => {
    const value: ManualOverrideValue = { _processed: "auto" }
    expect(isAssetlinksExtracted(value)).toBe(false)
  })

  it("returns false for plain fields", () => {
    const value: ManualOverrideValue = { ws: "https://example.com" }
    expect(isAssetlinksExtracted(value)).toBe(false)
  })
})

describe("type guard exclusivity", () => {
  it("each guard matches exactly one _processed state", () => {
    const states: ManualOverrideValue[] = [
      { _processed: true },
      { _processed: "auto" },
      { _processed: "assetlinks" },
      { ws: "https://example.com" }
    ]

    const results = states.map((s) => ({
      processed: isProcessed(s),
      auto: isAutoExtracted(s),
      assetlinks: isAssetlinksExtracted(s)
    }))

    // _processed: true
    expect(results[0]).toEqual({ processed: true, auto: false, assetlinks: false })
    // _processed: "auto"
    expect(results[1]).toEqual({ processed: false, auto: true, assetlinks: false })
    // _processed: "assetlinks"
    expect(results[2]).toEqual({ processed: false, auto: false, assetlinks: true })
    // no _processed
    expect(results[3]).toEqual({ processed: false, auto: false, assetlinks: false })
  })
})
