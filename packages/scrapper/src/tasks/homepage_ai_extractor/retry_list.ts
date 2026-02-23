/**
 * Retry list management for expected extraction failures.
 *
 * When a company fails with an expected error (Cloudflare, timeout, DNS, etc.),
 * it's added to a retry_list.json file. This allows re-processing failed companies
 * without re-running the entire batch.
 *
 * The retry list stores:
 *   - Company name
 *   - Error type (Cloudflare, timeout, etc.)
 *   - Error message
 *   - Timestamp of the failure
 *   - The website URL that failed
 */

import fs from "fs"
import path from "path"
import { z } from "zod"

import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"

/** Zod schema for a single retry entry */
const RetryEntrySchema = z.object({
  companyName: z.string(),
  websiteUrl: z.string(),
  errorType: z.string(),
  errorMessage: z.string(),
  failedAt: z.string(),
  retryCount: z.number()
})

/** A single retry entry */
export type RetryEntry = z.infer<typeof RetryEntrySchema>

/** Zod schema for the full retry list file structure */
const RetryListFileSchema = z.object({
  updatedAt: z.string(),
  entries: z.array(RetryEntrySchema)
})

/** The full retry list file structure */
type RetryListFile = z.infer<typeof RetryListFileSchema>

const getRetryListPath = (): string => {
  const baseDir = path.join(__dirname, "../../../", HOMEPAGE_AI_EXTRACTOR_CONFIG.logging.baseDir)
  return path.join(baseDir, "retry_list.json")
}

/**
 * Loads the retry list from disk. Returns an empty list if the file doesn't exist.
 * Throws on malformed JSON (unexpected failure).
 */
export const loadRetryList = (): RetryEntry[] => {
  const filePath = getRetryListPath()

  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, "utf-8")
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error(`Malformed retry_list.json at ${filePath}: not valid JSON`)
  }

  const file = RetryListFileSchema.parse(parsed)
  return file.entries
}

/**
 * Saves the retry list to disk. Creates the directory if needed.
 */
export const saveRetryList = (entries: RetryEntry[]): void => {
  const filePath = getRetryListPath()
  const dir = path.dirname(filePath)

  fs.mkdirSync(dir, { recursive: true })

  const file: RetryListFile = {
    updatedAt: new Date().toISOString(),
    entries
  }

  fs.writeFileSync(filePath, JSON.stringify(file, null, 2), "utf-8")
}

/**
 * Adds a company to the retry list. If the company already exists, increments its retryCount.
 */
export const addToRetryList = (
  companyName: string,
  websiteUrl: string,
  errorType: string,
  errorMessage: string
): void => {
  const entries = loadRetryList()

  // Check if company already in retry list
  const existingIndex = entries.findIndex((e) => e.companyName === companyName)
  if (existingIndex >= 0) {
    const existing = entries[existingIndex]
    if (!existing) {
      throw new Error(`Unexpected: retry list entry at index ${existingIndex} is undefined`)
    }
    // Update the existing entry
    existing.errorType = errorType
    existing.errorMessage = errorMessage
    existing.failedAt = new Date().toISOString()
    existing.websiteUrl = websiteUrl
    existing.retryCount += 1
  } else {
    // Add new entry
    entries.push({
      companyName,
      websiteUrl,
      errorType,
      errorMessage,
      failedAt: new Date().toISOString(),
      retryCount: 0
    })
  }

  saveRetryList(entries)
}

/**
 * Removes a company from the retry list (e.g., after successful retry).
 */
export const removeFromRetryList = (companyName: string): void => {
  const entries = loadRetryList()
  const filtered = entries.filter((e) => e.companyName !== companyName)

  if (filtered.length !== entries.length) {
    saveRetryList(filtered)
  }
}

/**
 * Gets the number of entries in the retry list.
 */
export const getRetryListCount = (): number => {
  return loadRetryList().length
}
