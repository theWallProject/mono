/**
 * Whether this build opens the "what's new" page.
 *
 * This is a build-time switch, not a per-user one: nothing is written to chrome.storage. `onInstalled`
 * fires exactly once per install/update transition, so a build with this `true` shows the page once
 * to every browser that installs or updates to it, and a build with it `false` shows nothing.
 *
 * `scripts/release.ts` asks on every release and rewrites the line below. That is why it must stay a
 * literal `true`/`false` on exactly this line: the script matches
 * /^export const SHOULD_SHOW_WHATSNEW = (true|false)$/m and refuses to release when it finds nothing
 * to rewrite. `tests/unit/whatsNewFlag.test.ts` enforces the same shape.
 */
export const SHOULD_SHOW_WHATSNEW = false
