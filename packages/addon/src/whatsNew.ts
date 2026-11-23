/**
 * The "what's new" page: which page this build carries, and the per-installation marker that
 * makes each page open at most once.
 *
 * There is deliberately no build-time switch and no page-specific version.
 *
 *  - The current build version is not duplicated here; it comes from `package.json` through the
 *    manifest, so a bump can never leave the page labelled with a stale version.
 *  - Whether this build carries a page is not answered by a second flag either. It is derived from
 *    whether {@link WHATS_NEW_PAGE_ID} changed: an unchanged id means this release ships no page and
 *    an existing installation therefore sees nothing.
 *
 * The identity stored per installation is the page id, never a version. That is what lets a hotfix
 * stay silent while a user who skipped the release carrying a page still gets it later.
 */

/**
 * Identifies the page, not the release.
 *
 * Change this whenever the page's contents change; bumping a build must NOT change it.
 */
export const WHATS_NEW_PAGE_ID = "2026-11-boycott-assistant"

/** Where the last page id this installation has seen is stored. */
export const WHATS_NEW_SEEN_KEY = "whats_new_seen_id"
