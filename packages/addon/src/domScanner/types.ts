import type { UrlTestResult } from "../types"

/**
 * Configuration rule for DOM scanning
 */
export type DomScanRule = {
  urlPattern: RegExp
  itemSelector: string // Parent container selector (e.g., job listing row)
  linkSelector: string // Nested selector for link within item container
  linkAttribute?: string // default: 'href'
}

/**
 * Extracted item data from DOM
 */
export type ExtractedItem = {
  itemElement: globalThis.Element // The parent container element
  linkElement: globalThis.Element | null // The link element (null if not found)
  url: string | null // Extracted URL (null if not found or invalid)
}

/**
 * Item with check result
 */
export type ScannedItem = ExtractedItem & {
  checkResult: UrlTestResult
}
