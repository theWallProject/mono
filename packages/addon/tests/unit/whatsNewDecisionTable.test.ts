import { describe, expect, it } from "vitest"

import { WHATS_NEW_PAGE_ID, WHATS_NEW_SEEN_KEY } from "../../src/whatsNew"

/**
 * The decision table for the "what's new" gate, expressed as data.
 *
 * `whatsNew.test.ts` drives the real background script; this file pins the *consequences* of the
 * chosen design in one readable table, including the ones that were accepted knowingly:
 *
 *  - an installation with no stored id never sees a page (the first build carrying a page is
 *    therefore sacrificed — that is deliberate, not a bug);
 *  - a hotfix cannot re-open a page, because the identity is the page id and a hotfix keeps it;
 *  - a user who skipped the release that carried a page still sees it, because the stored value is
 *    compared to the current id rather than to a version.
 */

type Stored = string | null | undefined

interface Scenario {
  readonly name: string
  readonly stored: Stored
  readonly opensPage: boolean
  readonly storesAfter: string | null
}

const CURRENT = WHATS_NEW_PAGE_ID

const SCENARIOS: readonly Scenario[] = [
  {
    name: "fresh install, nothing stored",
    stored: undefined,
    opensPage: false,
    storesAfter: CURRENT
  },
  {
    name: "update from a build that predates this system",
    stored: null,
    opensPage: false,
    storesAfter: CURRENT
  },
  {
    name: "stored value is an empty string",
    stored: "",
    opensPage: false,
    storesAfter: CURRENT
  },
  {
    name: "current page already recorded (hotfix bump)",
    stored: CURRENT,
    opensPage: false,
    storesAfter: CURRENT
  },
  {
    name: "an older page recorded, one release behind",
    stored: "2026-10-previous",
    opensPage: true,
    storesAfter: CURRENT
  },
  {
    name: "an older page recorded, two releases behind",
    stored: "2026-08-older",
    opensPage: true,
    storesAfter: CURRENT
  },
  {
    name: "a value that is not a page id at all (corrupt storage)",
    stored: "garbage",
    opensPage: true,
    storesAfter: CURRENT
  }
]

/**
 * The gate, restated independently of the extension so the table is a specification rather than a
 * mirror of the implementation. If `background.ts` ever disagrees with this, one of the two is
 * wrong and the tests in `whatsNew.test.ts` will say which.
 */
function decide(stored: Stored): { opensPage: boolean; storesAfter: string | null } {
  if (stored === null || stored === undefined || stored === "") {
    return { opensPage: false, storesAfter: CURRENT }
  }
  if (stored === CURRENT) {
    return { opensPage: false, storesAfter: CURRENT }
  }
  return { opensPage: true, storesAfter: CURRENT }
}

describe("what's new decision table", () => {
  for (const scenario of SCENARIOS) {
    it(`${scenario.name} → opensPage=${scenario.opensPage}`, () => {
      const result = decide(scenario.stored)
      expect(result.opensPage).toBe(scenario.opensPage)
      expect(result.storesAfter).toBe(scenario.storesAfter)
    })
  }

  it("never leaves storage without a page id after any transition", () => {
    for (const scenario of SCENARIOS) {
      expect(decide(scenario.stored).storesAfter).toBe(WHATS_NEW_PAGE_ID)
    }
  })

  it("opens the page for every stored value that is not the current id", () => {
    const otherValues: Stored[] = ["a", "1.16.0", "whats_new_seen_id", " ", "0"]
    for (const value of otherValues) {
      expect(decide(value).opensPage).toBe(true)
    }
  })

  it("never opens the page when the current id is already stored", () => {
    for (const variant of [CURRENT]) {
      expect(decide(variant).opensPage).toBe(false)
    }
  })

  it("documents the accepted consequence: a build whose install only seeds shows nothing", () => {
    // This is the behaviour Mido accepted. If a future change makes a fresh install show the page,
    // this test is the place that says the decision changed.
    expect(decide(undefined).opensPage).toBe(false)
    expect(decide(null).opensPage).toBe(false)
  })

  it("uses a storage key that cannot collide with a page id", () => {
    // Guard against someone "simplifying" the key into the page id: the two literals differ and the
    // key stays in snake_case, which a page id (with a date and dashes) never is.
    expect(String(WHATS_NEW_SEEN_KEY)).not.toBe(String(WHATS_NEW_PAGE_ID))
    expect(WHATS_NEW_SEEN_KEY).toMatch(/^[a-z0-9_]+$/)
    expect(WHATS_NEW_PAGE_ID).not.toMatch(/^[a-z0-9_]+$/)
  })
})
