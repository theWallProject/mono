import type { DecidedExclusion } from "../tasks/extract_websites"

/**
 * Scraped rows a human has decided about, because their website is a platform host.
 *
 * Why this file exists: a website field holding a platform host does not merely lose a row — it
 * blocks that platform for every user. A Spotify artist page scraped into the website field would
 * wall `spotify.com`; a Facebook group in the Twitter field is the same class of mistake. Those are
 * credibility-destroying bugs, so the pipeline refuses to guess: it stops, names every undecided row,
 * and waits for the resolution to be written down here.
 *
 * A row lands here only after its real status is checked. Two honest outcomes:
 *
 * - `deleted` — the company should never have been in the dataset (a Wix placeholder shop, a
 *   directory listing, a duplicate). Add its id to `manualDeleteIds.ts` and record it here.
 * - `resolved` — the company is real and is now flagged through its own domain or its social
 *   selectors, so the bad website is not needed.
 *
 * Keyed by row id. Never by name: one company can own several rows, and only one of them may be the
 * bad one.
 */
export const decidedExclusions: DecidedExclusion[] = [
  {
    id: "manual_ws_wixsite_com",
    name: "Wixsite (blanket block)",
    website: "wixsite.com",
    decision: "resolved",
    note: "Deliberate blanket block on free Wix subdomains, carried here from the old source-level allowlist."
  }
]

export const DECIDED_EXCLUSIONS: Map<string, DecidedExclusion> = new Map(decidedExclusions.map((d) => [d.id, d]))
