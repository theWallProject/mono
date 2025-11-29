/**
 * Bot-specific TypeScript types.
 * All types are strictly typed with no `any` allowed.
 */

import type { UrlCheckResult } from "@theWallProject/common"

/**
 * Inline query result for Telegram.
 */
export interface InlineQueryResultBot {
  type: "article"
  id: string
  title: string
  description: string
  message_text: string
  parse_mode?: "Markdown" | "HTML"
}

/**
 * Bot handler context type.
 */
export interface BotHandlerContext {
  url: string
  result: UrlCheckResult
}

/**
 * Message formatting options.
 */
export interface FormatOptionsBot {
  includeDetails?: boolean
  format?: "inline" | "message"
}
