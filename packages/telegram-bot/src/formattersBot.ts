/**
 * Message formatters for Telegram bot.
 * Strict type checking, exhaustive case handling.
 */

import type {Context} from "telegraf";
import type {
  APIListOfReasonsValues,
  UrlCheckResult,
} from "@theWallProject/common";
import {getT, type TFunction} from "./translations.js";

/**
 * Formats a reason code into a human-readable message.
 * @throws Error if reason is unexpected (exhaustive check)
 */
function formatReasonBot(reason: APIListOfReasonsValues, t: TFunction): string {
  switch (reason) {
    case "h":
      return t("reasons.h");
    case "f":
      return t("reasons.f");
    case "i":
      return t("reasons.i");
    case "u":
      return t("reasons.u");
    case "b":
      return t("reasons.b");
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
  reasons: readonly APIListOfReasonsValues[],
  t: TFunction
): string {
  return reasons.map((reason) => `• ${formatReasonBot(reason, t)}`).join("\n");
}

/**
 * Formats a hint result for display.
 */
export function formatHintForBot(
  result: Extract<UrlCheckResult, {isHint: true}>,
  t: TFunction
): string {
  const parts: string[] = [t("hint.header"), result.hintText];

  if (result.hintUrl) {
    parts.push(`\n${result.hintUrl}`);
  }

  return parts.join("\n");
}

/**
 * Formats a flagged result for inline query (compact).
 */
export function formatInlineResultForBot(
  result: Extract<UrlCheckResult, {isHint?: false}>,
  t: TFunction
): string {
  const parts: string[] = [`${t("flagged.header")}: ${result.name}`];

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`;
  }

  parts.push("");
  parts.push(t("formatter.reasons"));
  parts.push(formatReasonsForBot(result.reasons, t));

  return parts.join("\n");
}

/**
 * Formats a flagged result for message reply (detailed).
 */
export function formatMessageReplyForBot(
  result: Extract<UrlCheckResult, {isHint?: false}>,
  t: TFunction
): string {
  const parts: string[] = [`${t("flagged.header")}: *${result.name}*`];

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`;
  }

  parts.push("");
  parts.push(`*${t("formatter.reasons")}*`);
  parts.push(formatReasonsForBot(result.reasons, t));

  if (result.alt && result.alt.length > 0) {
    parts.push("");
    parts.push(`*${t("formatter.alternatives")}*`);
    result.alt.forEach((alt: {n: string; ws: string}) => {
      parts.push(`• ${alt.n} - ${alt.ws}`);
    });
  }

  parts.push("");
  parts.push(t("flagged.learnMore"));

  return parts.join("\n");
}

/**
 * Formats a result for Telegram display.
 * @throws Error if result type is unexpected
 */
export function formatResultForBot(
  result: UrlCheckResult,
  format: "inline" | "message",
  ctx: Context
): string {
  const t = getT(ctx);

  if (result === undefined) {
    return t("safe");
  }

  if (result.isHint) {
    return formatHintForBot(result, t);
  }

  if (format === "inline") {
    return formatInlineResultForBot(result, t);
  }

  return formatMessageReplyForBot(result, t);
}
