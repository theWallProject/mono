/**
 * The "what's new" page: which page this build carries, and the per-installation marker that
 * makes each page open at most once.
 *
 * The old design used a build-time boolean and opened the page on every `onInstalled`. That made
 * "has this user seen it" equal "did this build fire onInstalled", so a hotfix re-opened the page
 * for everyone, and a user who skipped the release never saw it at all.
 *
 * So the identity of the *page* is what gets stored, never the version of the build that shipped
 * it. A hotfix keeps `WHATS_NEW_PAGE_ID` and is invisible to a user who already has that marker.
 */

/**
 * Identifies the page, not the release.
 *
 * Change this whenever the page's contents change; bumping a build must NOT change it.
 */
export const WHATS_NEW_PAGE_ID = "2026-11-boycott-assistant"

/** The version this page describes, shown in the masthead instead of the current build version. */
export const WHATS_NEW_PAGE_VERSION = "1.16.0"

/** Where the last page id this installation has seen is stored. */
export const WHATS_NEW_SEEN_KEY = "whats_new_seen_id"

/**
 * Whether this build carries a page at all.
 *
 * `scripts/release.ts` rewrites the line below on every release, so it must stay a literal
 * `true`/`false` on exactly this line: the script matches
 * /^export const SHOULD_SHOW_WHATSNEW = (true|false)$/m and refuses to release when it finds
 * nothing to rewrite. `tests/unit/whatsNewFlag.test.ts` enforces the same shape.
 */
export const SHOULD_SHOW_WHATSNEW = true
