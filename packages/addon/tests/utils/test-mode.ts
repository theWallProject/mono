/**
 * Test mode configuration and utilities
 * Sets up test mode environment to disable tracking and enable test-specific behavior
 * This file is loaded as a setup file in vitest.config.ts
 */

/**
 * Check if test mode is enabled
 */
export function isTestMode(): boolean {
  if (typeof process !== "undefined" && process.env.TEST_MODE === "true") {
    return true
  }
  if (typeof window !== "undefined" && window.TEST_MODE) {
    return true
  }
  return false
}

// Enable test mode when this module is imported (via vitest setupFiles)
if (typeof process !== "undefined") {
  process.env.TEST_MODE = "true"
}
if (typeof window !== "undefined") {
  window.TEST_MODE = true
}
