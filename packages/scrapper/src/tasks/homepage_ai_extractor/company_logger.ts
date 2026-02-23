/**
 * Per-company logging and debug artifact storage.
 *
 * Creates a directory for each company under logs/homepage_ai_extractor/{sanitized_company_name}/
 * and stores:
 *   - page.html       -- Full saved HTML of the homepage
 *   - links.json      -- All extracted links (raw)
 *   - ai_prompt.txt   -- Exact prompt sent to AI
 *   - ai_response.json -- Raw AI response
 *   - result.json     -- Final categorized result
 *   - run.log         -- Text log of the entire process for this company
 */

import fs from "fs"
import path from "path"

import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"

/**
 * Sanitize a company name for use as a filesystem directory name.
 * Replaces special characters with underscores, collapses multiples, trims.
 */
export const sanitizeCompanyName = (name: string): string => {
  if (!name || name.trim().length === 0) {
    throw new Error("Cannot sanitize empty company name")
  }
  // Build regex dynamically to avoid control characters in source (no-control-regex rule)
  const nul = String.fromCharCode(0x00)
  const us = String.fromCharCode(0x1f)
  return name
    .replace(new RegExp(`[<>:"/\\\\|?*${nul}-${us}]`, "g"), "_") // Replace filesystem-unsafe chars + control chars
    .replace(/\s+/g, "_") // Replace whitespace with underscores
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, "") // Trim leading/trailing underscores
    .slice(0, 200) // Limit length for filesystem safety
}

export class CompanyLogger {
  private readonly logDir: string
  private readonly logLines: string[] = []
  private readonly companyName: string

  constructor(companyName: string) {
    this.companyName = companyName
    const sanitized = sanitizeCompanyName(companyName)
    const baseDir = path.join(__dirname, "../../../", HOMEPAGE_AI_EXTRACTOR_CONFIG.logging.baseDir)
    this.logDir = path.join(baseDir, sanitized)

    // Create directory tree
    fs.mkdirSync(this.logDir, { recursive: true })

    this.log(`=== Homepage AI Extractor: ${companyName} ===`)
    this.log(`Started at: ${new Date().toISOString()}`)
    this.log(`Log directory: ${this.logDir}`)
  }

  /** Append a line to the in-memory log buffer AND write to console */
  log(message: string): void {
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] ${message}`
    this.logLines.push(line)
    console.log(`  [${this.companyName}] ${message}`)
  }

  /** Append an error line to the in-memory log buffer AND write to console */
  error(message: string): void {
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] ERROR: ${message}`
    this.logLines.push(line)
    console.error(`  [${this.companyName}] ERROR: ${message}`)
  }

  /** Save full HTML of the company homepage */
  saveHtml(html: string): void {
    const filePath = path.join(this.logDir, "page.html")
    fs.writeFileSync(filePath, html, "utf-8")
    this.log(`Saved HTML (${html.length} bytes) to page.html`)
  }

  /** Save extracted links as JSON */
  saveLinks(links: string[]): void {
    const filePath = path.join(this.logDir, "links.json")
    fs.writeFileSync(filePath, JSON.stringify(links, null, 2), "utf-8")
    this.log(`Saved ${links.length} links to links.json`)
  }

  /** Save the AI prompt text */
  saveAiPrompt(prompt: string): void {
    const filePath = path.join(this.logDir, "ai_prompt.txt")
    fs.writeFileSync(filePath, prompt, "utf-8")
    this.log(`Saved AI prompt (${prompt.length} chars) to ai_prompt.txt`)
  }

  /** Save the raw AI response */
  saveAiResponse(response: unknown): void {
    const filePath = path.join(this.logDir, "ai_response.json")
    fs.writeFileSync(filePath, JSON.stringify(response, null, 2), "utf-8")
    this.log(`Saved AI response to ai_response.json`)
  }

  /** Save the final categorized result */
  saveResult(result: unknown): void {
    const filePath = path.join(this.logDir, "result.json")
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8")
    this.log(`Saved final result to result.json`)
  }

  /** Flush all accumulated log lines to the run.log file */
  flush(): void {
    const filePath = path.join(this.logDir, "run.log")
    this.log(`Finished at: ${new Date().toISOString()}`)
    fs.writeFileSync(filePath, this.logLines.join("\n") + "\n", "utf-8")
  }

  /** Get the log directory path */
  getLogDir(): string {
    return this.logDir
  }
}
