import { getBrowserContexts } from "./browser"

/**
 * Global setup / teardown for the addon E2E suite.
 *
 * Vitest only exposes a single `globalSetup` entry point, and a file used there can export
 * `setup` and `teardown`. The teardown is the important half here: every E2E context launches
 * a real Chrome instance, and without an explicit close the process list fills with orphaned
 * browsers as files run one after another. That starves memory and makes later files fail on
 * pages that never finish loading — the failure looks like a broken test, but the cause is a
 * leaked browser from an earlier one.
 */
export async function teardown(): Promise<void> {
  console.log("[GLOBAL TEARDOWN] Closing all browser contexts...")
  const contexts = getBrowserContexts()
  console.log(`[GLOBAL TEARDOWN] Found ${contexts.length} browser context(s)`)

  for (const context of contexts) {
    try {
      await context.close()
      console.log("[GLOBAL TEARDOWN] ✓ Browser context closed")
    } catch (error) {
      // A context that is already closed is the desired end state, not a failure. Anything
      // else is reported but must not abort teardown of the remaining contexts.
      console.error(
        "[GLOBAL TEARDOWN] ✗ Error closing browser context:",
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  console.log("[GLOBAL TEARDOWN] Complete")
}
