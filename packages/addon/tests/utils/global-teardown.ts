import { getBrowserContexts } from "./browser"

/**
 * Global teardown - force-close all browser contexts
 * This is a safety net to ensure all browsers are closed when tests complete
 */
export default async function globalTeardown(): Promise<void> {
  console.log("[GLOBAL TEARDOWN] Closing all browser contexts...")
  const contexts = getBrowserContexts()
  console.log(`[GLOBAL TEARDOWN] Found ${contexts.length} browser context(s)`)

  for (const context of contexts) {
    try {
      await context.close()
      console.log("[GLOBAL TEARDOWN] ✓ Browser context closed")
    } catch (error) {
      console.error(
        "[GLOBAL TEARDOWN] ✗ Error closing browser context:",
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  console.log("[GLOBAL TEARDOWN] Complete")
}
