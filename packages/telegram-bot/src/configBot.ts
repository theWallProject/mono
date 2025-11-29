/**
 * Bot configuration with fail-fast environment variable validation.
 * Throws immediately if required environment variables are missing.
 */

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (value === undefined || value === "") {
    throw new Error(`${key} environment variable is required`)
  }
  return value
}

export const NODE_ENV: "development" | "production" = (():
  | "development"
  | "production" => {
  const env = getRequiredEnv("NODE_ENV")
  if (env !== "development" && env !== "production") {
    throw new Error(
      `Invalid NODE_ENV: ${env}. Must be "development" or "production"`
    )
  }
  return env
})()

/**
 * Gets bot token based on environment.
 * Uses BOT_TOKEN from .env.dev (development) or .env.prod (production).
 */
export const BOT_TOKEN: string = getRequiredEnv("BOT_TOKEN")

/**
 * Gets bot username based on environment.
 * Uses BOT_USERNAME from .env.dev (development) or .env.prod (production).
 */
export const BOT_USERNAME: string = getRequiredEnv("BOT_USERNAME")

/**
 * Server port (hardcoded).
 * Port 3333 is used for the Telegram bot service.
 */
export const PORT: number = 3333

/**
 * Gets webhook URL based on environment.
 * Dev: Optional (uses polling mode if not set).
 * Prod: Required (fail-fast).
 */
export const WEBHOOK_URL: string | undefined = ((): string | undefined => {
  if (NODE_ENV === "production") {
    // Prod: require WEBHOOK_URL (fail-fast)
    return getRequiredEnv("WEBHOOK_URL")
  }
  // Dev: optional (polling mode if not set)
  return process.env.WEBHOOK_URL
})()
