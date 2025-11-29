/**
 * Environment initialization - must run before any other imports.
 * Loads .env.dev or .env.prod based on NODE_ENV.
 */

import {config} from "dotenv";
import {resolve} from "node:path";

// Preserve NODE_ENV from environment (set by command) before loading .env file
const nodeEnvFromEnv = process.env.NODE_ENV;

// Fail hard if NODE_ENV is not defined
if (!nodeEnvFromEnv || nodeEnvFromEnv.trim() === "") {
  throw new Error(
    "NODE_ENV environment variable is required and must be set to either 'development' or 'production'. " +
      "Set it via command: cross-env NODE_ENV=development pnpm run bot:dev"
  );
}

// Load environment file based on NODE_ENV
// Development: .env.dev, Production: .env.prod
// Use process.cwd() which should be the package root when running via tsx
const envFile = nodeEnvFromEnv === "development" ? ".env.dev" : ".env.prod";
const envPath = resolve(process.cwd(), envFile);

// Load env file - use override: true to ensure values from file are loaded
// (NODE_ENV will be restored after loading)
console.log(`[ENV] Loading env file: ${envPath}`);
console.log(`[ENV] Current working directory: ${process.cwd()}`);
const envResult = config({path: envPath, override: true});

if (envResult.error) {
  const error = envResult.error as Error & {code?: string};
  // In development, .env.dev is required
  if (nodeEnvFromEnv === "development") {
    if (error.code === "ENOENT") {
      throw new Error(
        `.env.dev file is required in development mode but not found at ${envPath}. ` +
          `Please create .env.dev with BOT_TOKEN, BOT_USERNAME, etc.`
      );
    }
    throw new Error(
      `Failed to load environment file ${envFile} at ${envPath}: ${error.message}`
    );
  }
  // In production, .env.prod is optional (env vars may come from Docker)
  if (error.code !== "ENOENT") {
    throw new Error(
      `Failed to load environment file ${envFile} at ${envPath}: ${error.message}`
    );
  }
} else {
  console.log(`[ENV] Successfully loaded ${envFile}`);
}

// Restore NODE_ENV from command/environment (don't use value from .env file)
// This ensures NODE_ENV from command takes precedence over any value in .env file
process.env.NODE_ENV = nodeEnvFromEnv;

// Verify BOT_TOKEN is loaded
if (!process.env.BOT_TOKEN) {
  throw new Error(
    `BOT_TOKEN not found after loading ${envFile} from ${envPath}. ` +
      `Please ensure BOT_TOKEN is set in ${envFile}`
  );
}

console.log(`[ENV] BOT_TOKEN loaded: ${process.env.BOT_TOKEN ? "YES" : "NO"}`);

