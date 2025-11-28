/**
 * Message formatters for Telegram bot.
 * Strict type checking, exhaustive case handling.
 */

import type {
  APIListOfReasonsValues,
  UrlCheckResult,
} from "@theWallProject/common";
import {MESSAGES_BOT} from "./messagesBot.js";

/**
 * Formats a reason code into a human-readable message.
 * @throws Error if reason is unexpected (exhaustive check)
 */
function formatReasonBot(reason: APIListOfReasonsValues): string {
  switch (reason) {
    case "h":
      return MESSAGES_BOT.reasons.h;
    case "f":
      return MESSAGES_BOT.reasons.f;
    case "i":
      return MESSAGES_BOT.reasons.i;
    case "u":
      return MESSAGES_BOT.reasons.u;
    case "b":
      return MESSAGES_BOT.reasons.b;
    default: {
      const _exhaustive: never = reason;
      throw new Error(`Unexpected reason: ${_exhaustive}`);
    }
  }
}

/**
 * Formats reasons array into formatted text.
 */
export function formatReasonsForBot(
  reasons: readonly APIListOfReasonsValues[]
): string {
  return reasons.map((reason) => `• ${formatReasonBot(reason)}`).join("\n");
}

/**
 * Formats a hint result for display.
 */
export function formatHintForBot(
  result: Extract<UrlCheckResult, {isHint: true}>
): string {
  const parts: string[] = [MESSAGES_BOT.hint.header, result.hintText];

  if (result.hintUrl) {
    parts.push(`\n${result.hintUrl}`);
  }

  return parts.join("\n");
}

/**
 * Formats a flagged result for inline query (compact).
 */
export function formatInlineResultForBot(
  result: Extract<UrlCheckResult, {isHint?: false}>
): string {
  const parts: string[] = [`${MESSAGES_BOT.flagged.header}: ${result.name}`];

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`;
  }

  parts.push("");
  parts.push("Reasons:");
  parts.push(formatReasonsForBot(result.reasons));

  return parts.join("\n");
}

/**
 * Formats a flagged result for message reply (detailed).
 */
export function formatMessageReplyForBot(
  result: Extract<UrlCheckResult, {isHint?: false}>
): string {
  const parts: string[] = [`${MESSAGES_BOT.flagged.header}: *${result.name}*`];

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`;
  }

  parts.push("");
  parts.push("*Reasons:*");
  parts.push(formatReasonsForBot(result.reasons));

  if (result.alt && result.alt.length > 0) {
    parts.push("");
    parts.push("*Alternatives:*");
    result.alt.forEach((alt: {n: string; ws: string}) => {
      parts.push(`• ${alt.n} - ${alt.ws}`);
    });
  }

  parts.push("");
  parts.push(MESSAGES_BOT.flagged.learnMore);

  return parts.join("\n");
}

/**
 * Formats a result for Telegram display.
 * @throws Error if result type is unexpected
 */
export function formatResultForBot(
  result: UrlCheckResult,
  format: "inline" | "message" = "message"
): string {
  if (result === undefined) {
    return MESSAGES_BOT.safe;
  }

  if (result.isHint) {
    return formatHintForBot(result);
  }

  if (format === "inline") {
    return formatInlineResultForBot(result);
  }

  return formatMessageReplyForBot(result);
}
