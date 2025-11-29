/**
 * Main entry point for Telegram bot server.
 * Express.js server with Telegraf webhook/polling support.
 */

import {config} from "dotenv";
import {resolve} from "node:path";
import express, {type Request, type Response} from "express";
import {createBot} from "./bot.js";
import {PORT, WEBHOOK_URL, NODE_ENV} from "./configBot.js";

// Load environment-specific .env file
// First check if NODE_ENV is set externally, otherwise default to development
const env = process.env.NODE_ENV ?? "development";
const envFile = env === "production" ? ".env.prod" : ".env.dev";
const envPath = resolve(process.cwd(), envFile);

// Load the appropriate env file (fail-fast if file doesn't exist)
const result = config({path: envPath});
if (result.error) {
  throw new Error(
    `Failed to load environment file ${envFile} at ${envPath}: ${result.error.message}`
  );
}

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response): void => {
  res.json({status: "ok", timestamp: new Date().toISOString()});
});

// Initialize bot
const bot = createBot();

// Webhook or polling setup
if (WEBHOOK_URL) {
  // Webhook mode (production or dev with webhook)
  // Use bot.createWebhook instead of bot.webhookCallback (recommended by Telegraf)
  bot
    .createWebhook({
      domain: WEBHOOK_URL,
      path: "/webhook",
    })
    .then((webhookMiddleware) => {
      app.use(webhookMiddleware);
      console.log(`Bot webhook set to: ${WEBHOOK_URL}/webhook`);
    })
    .catch((error) => {
      throw new Error(
        `Failed to create webhook: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });
} else {
  // Polling mode (development only - WEBHOOK_URL is required in production)
  bot.launch().catch((error) => {
    throw new Error(
      `Failed to launch bot: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  });
  console.log("Bot started in polling mode");
}

// Error handling middleware
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: express.NextFunction
  ): void => {
    console.error("Express error:", err);
    res.status(500).json({error: "Internal server error"});
    // Don't swallow errors - let them propagate
    throw err;
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});

// Graceful shutdown
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  server.close();
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  server.close();
});
