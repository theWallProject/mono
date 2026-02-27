/**
 * JSONL checkpoint for crash recovery.
 *
 * Each line is a JSON object recording one company+stage result.
 * On --resume, we read the checkpoint and skip already-completed work.
 */

import fs from "fs"
import path from "path"

import { CONFIG } from "../config"
import type { CheckpointEntry, StrategyResult } from "../types"

export class CheckpointManager {
  private readonly filePath: string
  private readonly completed: Map<string, CheckpointEntry>

  constructor(baseDir: string) {
    const dir = path.join(baseDir, CONFIG.resultsDir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    this.filePath = path.join(dir, CONFIG.checkpointFile)
    this.completed = new Map()
  }

  /** Load existing checkpoint entries from disk */
  load(): void {
    if (!fs.existsSync(this.filePath)) {
      return
    }

    const content = fs.readFileSync(this.filePath, "utf-8")
    const lines = content.split("\n").filter((line) => line.trim().length > 0)

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as CheckpointEntry
        const key = this.makeKey(entry.domain, entry.stage)
        this.completed.set(key, entry)
      } catch {
        // Skip malformed lines — they may be from a crash mid-write
      }
    }
  }

  /** Check if a company+stage has already been processed */
  isCompleted(domain: string, stage: string): boolean {
    return this.completed.has(this.makeKey(domain, stage))
  }

  /** Get the cached result for a completed company+stage */
  getResult(domain: string, stage: string): StrategyResult | undefined {
    return this.completed.get(this.makeKey(domain, stage))?.result
  }

  /** Record a completed company+stage result */
  record(company: string, domain: string, stage: string, result: StrategyResult): void {
    const entry: CheckpointEntry = {
      company,
      domain,
      stage,
      ts: Date.now(),
      result
    }

    const key = this.makeKey(domain, stage)
    this.completed.set(key, entry)

    // Append to JSONL file immediately for crash safety
    fs.appendFileSync(this.filePath, JSON.stringify(entry) + "\n")
  }

  /** Get count of completed entries */
  get size(): number {
    return this.completed.size
  }

  private makeKey(domain: string, stage: string): string {
    return `${domain}::${stage}`
  }
}
