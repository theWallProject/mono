import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["dist/**", "node_modules/**"],
    env: {
      LM_STUDIO_URL: "http://localhost:1234"
    }
  }
})
