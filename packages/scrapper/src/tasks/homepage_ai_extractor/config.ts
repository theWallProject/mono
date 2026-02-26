/**
 * Configuration for the Homepage AI Extractor
 *
 * LM Studio server settings, Playwright options, batch parameters, and logging config.
 * Update the lmStudio.baseUrl with your server's IP and port.
 */

export const HOMEPAGE_AI_EXTRACTOR_CONFIG = {
  lmStudio: {
    /** Base URL for the LM Studio server (OpenAI-compatible API) */
    baseUrl: "http://100.86.94.30:1234",
    /** Model identifier as registered in LM Studio */
    model: "Qwen2.5-72B-Instruct-GGUF",
    /** Maximum tokens for AI response */
    maxTokens: 4096,
    /** Low temperature for deterministic extraction */
    temperature: 0.1,
    /** Request timeout in milliseconds (15 minutes for large models with big prompts) */
    requestTimeout: 900_000
  },
  playwright: {
    /** Page load timeout in milliseconds */
    timeout: 60_000,
    /** Wait for network idle timeout (for JS-rendered content) */
    networkIdleTimeout: 10_000,
    /** Realistic user agent string */
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    /** Viewport dimensions */
    viewport: { width: 1280, height: 720 }
  },
  batch: {
    /** Default batch size for automated mode */
    defaultSize: 100,
    /** Delay between processing companies in milliseconds (be polite to servers) */
    delayBetweenRequests: 2000
  },
  logging: {
    /** Base directory for per-company debug logs (relative to scrapper package root) */
    baseDir: "logs/homepage_ai_extractor"
  }
} as const
