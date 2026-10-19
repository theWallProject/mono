import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["dist/**", "node_modules/**"],
    env: {
      HOMEPAGE_AI_BASE_URL: "http://localhost:1234"
    }
  }
})
