/**
 * Bot configuration with fail-fast environment variable validation.
 * Throws immediately if required environment variables are missing.
 */

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`${key} environment variable is required`);
  }
  return value;
};

export const NODE_ENV: "development" | "production" = (():
  | "development"
  | "production" => {
  const env = getRequiredEnv("NODE_ENV");
  if (env !== "development" && env !== "production") {
    throw new Error(
      `Invalid NODE_ENV: ${env}. Must be "development" or "production"`
    );
  }
  return env;
})();

/**
 * Gets bot token based on environment.
 * Dev: Requires BOT_TOKEN_DEV (fail-fast, no fallback).
 * Prod: Requires BOT_TOKEN.
 */
export const BOT_TOKEN: string = ((): string => {
  if (NODE_ENV === "development") {
    // Dev: require BOT_TOKEN_DEV (fail-fast)
    return getRequiredEnv("BOT_TOKEN_DEV");
  }
  // Prod: require BOT_TOKEN
  return getRequiredEnv("BOT_TOKEN");
})();

/**
 * Gets bot username based on environment.
 * Dev: Requires BOT_USERNAME_DEV (fail-fast, no fallback).
 * Prod: Requires BOT_USERNAME.
 */
export const BOT_USERNAME: string = ((): string => {
  if (NODE_ENV === "development") {
    // Dev: require BOT_USERNAME_DEV (fail-fast)
    return getRequiredEnv("BOT_USERNAME_DEV");
  }
  // Prod: require BOT_USERNAME
  return getRequiredEnv("BOT_USERNAME");
})();

export const PORT: number = ((): number => {
  const portStr = getRequiredEnv("PORT");
  const port = Number.parseInt(portStr, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${portStr}. Must be a number between 1 and 65535`
    );
  }
  return port;
})();

/**
 * Gets webhook URL based on environment.
 * Dev: Optional (uses polling mode if not set).
 * Prod: Required (fail-fast).
 */
export const WEBHOOK_URL: string | undefined = ((): string | undefined => {
  if (NODE_ENV === "production") {
    // Prod: require WEBHOOK_URL (fail-fast)
    return getRequiredEnv("WEBHOOK_URL");
  }
  // Dev: optional (polling mode if not set)
  return process.env.WEBHOOK_URL;
})();
