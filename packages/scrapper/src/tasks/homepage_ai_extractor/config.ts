/**
 * Configuration for the Homepage AI Extractor
 *
 * OpenAI-compatible model server settings (Unsloth local backend by default),
 * Playwright options, batch parameters, and logging config.
 */

export const HOMEPAGE_AI_EXTRACTOR_CONFIG = {
  provider: {
    /** Base URL for the OpenAI-compatible model server - defaults to local Unsloth */
    baseUrl: process.env.HOMEPAGE_AI_BASE_URL ?? "http://127.0.0.1:8888",
    /**
     * API key sent as `Authorization: Bearer`. Set explicitly via
     * HOMEPAGE_AI_API_KEY. No fallback: if the server needs a key (e.g. to
     * auto-load an unloaded model), the run fails early rather than guessing.
     */
    apiKey: process.env.HOMEPAGE_AI_API_KEY,
    /** Model identifier as served by the model server */
    model: process.env.HOMEPAGE_AI_MODEL ?? "unsloth/Qwen3.8-27B-GGUF",
    /**
     * Enable the model's hidden reasoning phase (Qwen3.x `enable_thinking`).
     *
     * This extraction task is grounded link-filtering — the model must return
     * only verbatim URLs from the provided list. Reasoning adds a 5-7x latency
     * cost and produces identical output (measured). Disabled by default, but
     * trivially re-enabled with HOMEPAGE_AI_ENABLE_THINKING=1 (or flipping this
     * constant) if a future model or domain-set benefits from it.
     */
    enableThinking: process.env.HOMEPAGE_AI_ENABLE_THINKING === "1",
    /** Maximum tokens for AI response (generous - reasoning models spend tokens thinking) */
    maxTokens: 8192,
    /** Low temperature for deterministic extraction */
    temperature: 0.1,
    /** Overall hard deadline for the entire AI request in milliseconds (30 minutes) */
    requestTimeout: 1000 * 60 * 30,
    /**
     * Max time to wait with no data before considering the server stalled.
     * Generous: reasoning models stream `reasoning_content` while thinking, which
     * keeps the idle timer alive — this only catches true stalls (server crash
     * mid-stream), not slow inference.
     */
    streamIdleTimeout: 1000 * 60 * 15
  },
  playwright: {
    /** Page load timeout in milliseconds */
    timeout: 60_000,
    /** Wait for network idle timeout (for JS-rendered content) */
    networkIdleTimeout: 10_000,
    /**
     * Firefox UA — CRITICAL for Cloudflare WAF bypass.
     *
     * Many target sites run Cloudflare WAF rules that block any request whose
     * UA contains the literal token "Chrome" (measured: 0/20 403-sites pass
     * with Chrome UA, 10/20 pass with Firefox/Safari on the same IP/TLS).
     * Firefox UA renders full JS identically — it just avoids the naive
     * string-based anti-scraper rule.
     */
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
    /** Viewport dimensions */
    viewport: { width: 1280, height: 720 }
  },
  batch: {
    /** Default batch size for automated mode */
    defaultSize: 100,
    /** Delay between processing companies in milliseconds (be polite to servers) */
    delayBetweenRequests: 2000,
    /**
     * Maximum number of companies that can be skipped (due to unexpected errors
     * that persist after retry) before the entire batch fails hard.
     * Prevents silent degradation when something systemic is wrong.
     */
    maxSkipsPerBatch: 5,
    /**
     * Run the full pipeline regeneration (merge → extract → final ALL.json →
     * copy to addon/android/telegram) every N processed companies.
     *
     * Each regen costs ~2-4 minutes on the 18MB merged dataset, so doing it
     * every 10 companies is a major tax on long batches. Every 50 is a good
     * balance: the addon DB stays reasonably fresh during a run, and a full
     * regeneration is always run at the end of the batch.
     *
     * Overridable via HOMEPAGE_AI_FINALIZE_EVERY.
     */
    finalizeEvery: Number(process.env.HOMEPAGE_AI_FINALIZE_EVERY ?? 50)
  },
  logging: {
    /** Base directory for per-company debug logs (relative to scrapper package root) */
    baseDir: "logs/homepage_ai_extractor"
  }
} as const