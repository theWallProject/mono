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

const getOptionalEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const BOT_TOKEN: string = getRequiredEnv("BOT_TOKEN");

export const BOT_USERNAME: string = getRequiredEnv("BOT_USERNAME");

export const PORT: number = ((): number => {
  const portStr = getRequiredEnv("PORT");
  const port = Number.parseInt(portStr, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${portStr}. Must be a number between 1 and 65535`);
  }
  return port;
})();

export const NODE_ENV: "development" | "production" = ((): "development" | "production" => {
  const env = getOptionalEnv("NODE_ENV", "development");
  if (env !== "development" && env !== "production") {
    throw new Error(`Invalid NODE_ENV: ${env}. Must be "development" or "production"`);
  }
  return env;
})();

export const WEBHOOK_URL: string | undefined = process.env.WEBHOOK_URL;

