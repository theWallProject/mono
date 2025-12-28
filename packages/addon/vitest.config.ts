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
    // Run tests serially (one at a time) to avoid conflicts
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true
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
