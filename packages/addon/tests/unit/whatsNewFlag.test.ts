import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

import { SHOULD_SHOW_WHATSNEW } from "../../src/whatsNew"

/**
 * The release script rewrites the flag by regex. If the declaration ever drifts into a shape the
 * regex cannot match (a ternary, a template string, a renamed constant), the release would either
 * silently keep the old value or fail late — after bumping the version. This test fails first.
 */
const FLAG_PATTERN = /^export const SHOULD_SHOW_WHATSNEW = (true|false)$/m

const source = readFileSync(path.resolve(__dirname, "../../src/whatsNew.ts"), "utf-8")

describe("what's new release flag", () => {
  it("is declared as a literal on the exact line the release script rewrites", () => {
    const match = source.match(FLAG_PATTERN)
    expect(match).not.toBeNull()
    expect(match?.[1]).toBe(String(SHOULD_SHOW_WHATSNEW))
  })

  it("matches the flag the release script would write", () => {
    for (const value of ["true", "false"]) {
      const rewritten = source.replace(FLAG_PATTERN, `export const SHOULD_SHOW_WHATSNEW = ${value}`)
      expect(rewritten.match(FLAG_PATTERN)?.[1]).toBe(value)
    }
  })
})
