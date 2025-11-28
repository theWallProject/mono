/**
 * Telegram bot setup and handlers.
 * Fail-fast error handling, no silent failures.
 */

import type {Context} from "telegraf";
import {Telegraf} from "telegraf";
import {checkUrlForBot} from "./urlCheckerBot.js";
import {formatResultForBot} from "./formattersBot.js";
import {extractUrlFromTextBot} from "./urlExtractorBot.js";
import {MESSAGES_BOT} from "./messagesBot.js";
import {BOT_TOKEN, BOT_USERNAME} from "./configBot.js";

/**
 * Handles inline queries.
 */
export async function handleInlineQueryBot(ctx: Context): Promise<void> {
  if (!("inlineQuery" in ctx) || !ctx.inlineQuery) {
    throw new Error("Invalid inline query context");
  }

  const query = ctx.inlineQuery.query.trim();

  if (!query) {
    await ctx.answerInlineQuery([]);
    return;
  }

  const url = extractUrlFromTextBot(query);

  if (!url) {
    await ctx.answerInlineQuery([]);
    return;
  }

  const result = checkUrlForBot(url);
  const formatted = formatResultForBot(result, "inline");

  const title = result?.isHint
    ? result.name
    : result
    ? `${result.name}${result.stockSymbol ? ` (${result.stockSymbol})` : ""}`
    : "Safe";

  const description = result?.isHint
    ? result.hintText
    : result
    ? result.reasons
        .map((r) => {
          switch (r) {
            case "h":
              return "HQ in Israel";
            case "f":
              return "Founder in Israel";
            case "i":
              return "Investor in Israel";
            case "u":
              return "Israeli website";
            case "b":
              return "BDS listed";
            default: {
              const _exhaustive: never = r;
              throw new Error(`Unexpected reason: ${_exhaustive}`);
            }
          }
        })
        .join(", ")
    : "No issues found";

  await ctx.answerInlineQuery([
    {
      type: "article",
      id: `url-check-${Date.now()}`,
      title,
      description,
      input_message_content: {
        message_text: formatted,
        parse_mode: "Markdown",
      },
    },
  ]);
}

/**
 * Handles direct messages.
 */
export async function handleMessageBot(ctx: Context): Promise<void> {
  if (!("message" in ctx) || !ctx.message || !("text" in ctx.message)) {
    return; // Not a text message, ignore
  }

  const text = ctx.message.text;
  if (!text) {
    await ctx.reply(MESSAGES_BOT.help.noUrl);
    return;
  }

  const url = extractUrlFromTextBot(text);

  if (!url) {
    await ctx.reply(MESSAGES_BOT.help.noUrl);
    return;
  }

  try {
    const result = checkUrlForBot(url);
    const formatted = formatResultForBot(result, "message");
    await ctx.reply(formatted, {parse_mode: "Markdown"});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to check URL: ${message}`);
  }
}

/**
 * Handles group mentions.
 */
export async function handleMentionBot(ctx: Context): Promise<void> {
  if (!("message" in ctx) || !ctx.message || !("text" in ctx.message)) {
    return;
  }

  const text = ctx.message.text;
  if (!text) {
    return;
  }

  // Check if bot is mentioned
  const mentionPattern = new RegExp(
    `@${BOT_USERNAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "i"
  );
  if (!mentionPattern.test(text)) {
    return;
  }

  const url = extractUrlFromTextBot(text);

  if (!url) {
    await ctx.reply(MESSAGES_BOT.help.noUrl);
    return;
  }

  try {
    const result = checkUrlForBot(url);
    const formatted = formatResultForBot(result, "message");
    await ctx.reply(formatted, {parse_mode: "Markdown"});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to check URL: ${message}`);
  }
}

/**
 * Sets up all bot handlers.
 */
export function setupBotHandlers(bot: Telegraf): void {
  bot.on("inline_query", handleInlineQueryBot);
  bot.on("message", handleMessageBot);
  bot.on("text", handleMentionBot);

  bot.catch((err) => {
    console.error("Bot error:", err);
    // Fail fast - don't silently catch errors
    throw err;
  });
}

/**
 * Creates and configures the Telegram bot.
 * @throws Error if bot creation fails
 */
export function createBot(): Telegraf {
  if (!BOT_TOKEN || BOT_TOKEN.length === 0) {
    throw new Error("BOT_TOKEN is required");
  }

  const bot = new Telegraf(BOT_TOKEN);
  setupBotHandlers(bot);

  return bot;
}
