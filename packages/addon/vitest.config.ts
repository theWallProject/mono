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
    setupFiles: ["./tests/utils/test-mode.ts"], // Enable test mode before tests run
    // Run tests serially (one at a time) to avoid conflicts
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Stop on first failure for easier debugging
    bail: 1,
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
