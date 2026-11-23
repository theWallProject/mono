import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

import { WHATS_NEW_PAGE_ID, WHATS_NEW_SEEN_KEY } from "../../src/whatsNew"

/**
 * The release script derives "does this build ship a page" by reading `WHATS_NEW_PAGE_ID` out of the
 * source with a regex and comparing it to the id committed at HEAD. If the declaration ever drifts
 * into a shape that regex cannot match — a template string, a renamed constant, a wrapped line — the
 * script would either throw late or, worse, treat the build as carrying no page.
 *
 * These tests fail first, on the shape, rather than during a release.
 */
const PAGE_ID_PATTERN = /^export const WHATS_NEW_PAGE_ID = "([^"]+)"$/m

const source = readFileSync(path.resolve(__dirname, "../../src/whatsNew.ts"), "utf-8")

describe("what's new page declaration", () => {
  it("is a single-line string literal the release script can read", () => {
    const match = source.match(PAGE_ID_PATTERN)
    expect(match).not.toBeNull()
    expect(match?.[1]).toBe(WHATS_NEW_PAGE_ID)
  })

  it("survives the regex the release script uses", () => {
    expect(PAGE_ID_PATTERN.test(source)).toBe(true)
  })

  it("is a stable slug, not a version or a date-only string", () => {
    // A version here would reintroduce the drift this whole design removed.
    expect(WHATS_NEW_PAGE_ID).toMatch(/^\d{4}-\d{2}-[a-z0-9-]+$/)
    expect(WHATS_NEW_PAGE_ID).not.toMatch(/^\d+\.\d+\.\d+$/)
  })

  it("has no page-specific version constant anywhere in the module", () => {
    // The build version comes from package.json through the manifest. A second copy in here is the
    // exact mismatch that was removed, so its reappearance must fail a test.
    expect(source).not.toMatch(/WHATS_NEW_PAGE_VERSION/)
    expect(source).not.toMatch(/SHOULD_SHOW_WHATSNEW/)
  })

  it("keeps the storage key distinct from the page id", () => {
    expect(WHATS_NEW_SEEN_KEY).not.toBe(WHATS_NEW_PAGE_ID)
    expect(WHATS_NEW_SEEN_KEY).toMatch(/^[a-z0-9_]+$/)
  })
})
