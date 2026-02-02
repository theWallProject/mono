/**
 * Message formatters for Telegram bot.
 * Strict type checking, exhaustive case handling.
 */

import type { UrlCheckResult, valuesOfListOfReasons } from "@theWallProject/common"
import type { Context } from "telegraf"

import { getT, type TFunction } from "./translations.js"
import type { DomainHint, UrlCheckResultWithDomainHint } from "./urlCheckerBot.js"

/**
 * Formats a reason code into a human-readable message.
 * @throws Error if reason is unexpected (exhaustive check)
 */
function formatReasonBot(reason: valuesOfListOfReasons, t: TFunction): string {
  switch (reason) {
    case "h":
      return t("reasons.h")
    case "f":
      return t("reasons.f")
    case "i":
      return t("reasons.i")
    case "u":
      return t("reasons.u")
    case "BDS_PRIO":
      return t("reasons.BDS_PRIO")
    case "BDS_GRASS":
      return t("reasons.BDS_GRASS")
    case "BDS_PRESSURE":
      return t("reasons.BDS_PRESSURE")
    default: {
      const _exhaustive: never = reason
      throw new Error(`Unexpected reason: ${_exhaustive}`)
    }
  }
}

/**
 * Formats reasons array into formatted text.
 */
export function formatReasonsForBot(reasons: readonly valuesOfListOfReasons[], t: TFunction): string {
  return reasons.map((reason) => `• ${formatReasonBot(reason, t)}`).join("\n")
}

/**
 * Formats a hint result for display.
 */
export function formatHintForBot(result: Extract<UrlCheckResult, { isHint: true }>, t: TFunction): string {
  const parts: string[] = [t("hint.header"), result.hintText]

  if (result.hintUrl) {
    parts.push(`\n${result.hintUrl}`)
  }

  return parts.join("\n")
}

/**
 * Formats a flagged result for inline query (compact).
 */
export function formatInlineResultForBot(result: Extract<UrlCheckResult, { isHint?: false }>, t: TFunction): string {
  const parts: string[] = [`${t("flagged.header")}: ${result.name}`]

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`
  }

  parts.push("")
  parts.push(t("formatter.reasons"))
  parts.push(formatReasonsForBot(result.reasons, t))

  return parts.join("\n")
}

/**
 * Formats a domain hint for display (shown as additional info when viewing flagged content on hint-enabled domains).
 */
function formatDomainHintForBot(domainHint: DomainHint, t: TFunction): string {
  const parts: string[] = ["", "─────────────────", `💡 *${t("domainHint.header")}*`, domainHint.hintText]

  if (domainHint.hintUrl) {
    parts.push(`${domainHint.hintUrl}`)
  }

  return parts.join("\n")
}

/**
 * Formats a flagged result for message reply (detailed).
 */
export function formatMessageReplyForBot(
  result: Extract<UrlCheckResult, { isHint?: false }>,
  t: TFunction,
  domainHint?: DomainHint
): string {
  const parts: string[] = [`${t("flagged.header")}: *${result.name}*`]

  if (result.stockSymbol) {
    parts[0] += ` (${result.stockSymbol})`
  }

  parts.push("")
  parts.push(`*${t("formatter.reasons")}*`)
  parts.push(formatReasonsForBot(result.reasons, t))

  if (result.alt && result.alt.length > 0) {
    parts.push("")
    parts.push(`*${t("formatter.alternatives")}*`)
    result.alt.forEach((alt: { n: string; ws: string }) => {
      parts.push(`• ${alt.n} - ${alt.ws}`)
    })
  }

  parts.push("")
  parts.push(t("flagged.learnMore"))

  // Add domain hint if present (e.g., when viewing Wix on Instagram, suggest Upscrolled)
  if (domainHint) {
    parts.push(formatDomainHintForBot(domainHint, t))
  }

  return parts.join("\n")
}

/**
 * Formats a result for Telegram display.
 * @throws Error if result type is unexpected
 */
export function formatResultForBot(
  result: UrlCheckResultWithDomainHint,
  format: "inline" | "message",
  ctx: Context
): string {
  const t = getT(ctx)

  if (result === undefined) {
    return t("safe")
  }

  if (result.isHint) {
    return formatHintForBot(result, t)
  }

  // Extract domain hint if present
  const domainHint = "domainHint" in result ? result.domainHint : undefined

  if (format === "inline") {
    return formatInlineResultForBot(result, t)
  }

  return formatMessageReplyForBot(result, t, domainHint)
}
