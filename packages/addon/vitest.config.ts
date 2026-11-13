import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vitest/config"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "build", ".plasmo"],
    testTimeout: 180000, // 3 minutes - tests may try multiple URLs
    hookTimeout: 120000, // 2 minutes
    retry: 0, // No retries - tests must pass on first attempt
    setupFiles: ["./tests/utils/test-mode.ts"], // Enable test mode before tests run
    // Close every browser context once the run ends (see the file for why this matters).
    globalSetup: "./tests/utils/global-teardown.ts",
    // Run tests serially (one at a time) to avoid conflicts, but give every test file its
    // own worker.
    //
    // Sharing one worker across files accumulates each file's module graph and browser
    // state. Past ~2 GB the worker dies mid-run, and the symptom is not a clean OOM: later
    // files report "Calling the test function inside another test function is not allowed"
    // or "RangeError: Invalid string length" because collection happens in a poisoned
    // process. A fresh worker per file plus a raised heap cap removes both failure modes.
    pool: "forks",
    poolOptions: {
      forks: {
        // Fresh worker per file (isolation), but only one at a time: each test file drives a
        // real Chrome instance, and running several concurrently exhausts memory so pages
        // stop loading and banner assertions fail for environmental reasons.
        singleFork: false,
        maxForks: 1,
        minForks: 1,
        execArgv: ["--max-old-space-size=4096"]
      }
    },
    // Continue running all tests even if some fail
    bail: 0,
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "build/", ".plasmo/", "tests/", "**/*.d.ts", "**/*.config.*"]
    }
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src")
    }
  }
})
