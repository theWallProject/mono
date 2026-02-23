/**
 * Entry point for the Homepage AI Extractor command (pnpm data:homepage).
 *
 * Interactive CLI menu modeled after validate_index.ts:
 *   1. Interactive — Process one company, review in browser, confirm
 *   2. Batch — Auto-process next N companies, no review
 *   3. Retry — Re-process failed companies from retry_list.json
 *
 * After processing, optionally runs apply-overrides to regenerate output files.
 */

import { execSync } from "child_process"
import inquirer from "inquirer"

import { error, log } from "./helper"
import { testConnection } from "./tasks/homepage_ai_extractor/ai_client"
import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./tasks/homepage_ai_extractor/config"
import { runInteractive, runBatch, runRetry } from "./tasks/homepage_ai_extractor/run"
import { getRetryListCount } from "./tasks/homepage_ai_extractor/retry_list"

process.on("unhandledRejection", (reason) => {
  error("HOMEPAGE_AI_EXTRACTOR Unhandled Rejection:", reason)
  throw new Error("HOMEPAGE_AI_EXTRACTOR Unhandled Rejection")
})

process.on("uncaughtException", (err) => {
  error("HOMEPAGE_AI_EXTRACTOR Uncaught Exception:", err)
  throw new Error("HOMEPAGE_AI_EXTRACTOR Uncaught Exception")
})

// ────────────────────────────────────────────────────────────────────────────
// Prompts
// ────────────────────────────────────────────────────────────────────────────

type Mode = "interactive" | "batch" | "retry"

const promptForMode = async (): Promise<Mode> => {
  const retryCount = getRetryListCount()
  const retryLabel = retryCount > 0 ? ` (${retryCount} companies)` : " (empty)"

  const result = await inquirer.prompt<{ mode: Mode }>([
    {
      type: "list",
      name: "mode",
      message: "Choose mode:",
      choices: [
        {
          name: "Interactive (review each company in browser before saving)",
          value: "interactive"
        },
        {
          name: `Batch (auto-process next ${HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.defaultSize} companies, no review)`,
          value: "batch"
        },
        {
          name: `Retry (re-process failed companies)${retryLabel}`,
          value: "retry"
        }
      ]
    }
  ])
  return result.mode
}

const promptForBatchSize = async (): Promise<number> => {
  const { size } = await inquirer.prompt<{ size: number }>([
    {
      type: "number",
      name: "size",
      message: `Batch size (default ${HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.defaultSize}):`,
      default: HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.defaultSize,
      validate: (input: number) => {
        if (!Number.isInteger(input) || input < 1) {
          return "Batch size must be a positive integer"
        }
        if (input > 10000) {
          return "Batch size too large (max 10000)"
        }
        return true
      }
    }
  ])
  return size
}

const promptForApplyOverrides = async (): Promise<boolean> => {
  const { shouldApply } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldApply",
      message: "Apply manual overrides to output files?",
      default: true
    }
  ])
  return shouldApply
}

// ────────────────────────────────────────────────────────────────────────────
// Mode handlers
// ────────────────────────────────────────────────────────────────────────────

const handleInteractiveMode = async (): Promise<void> => {
  log("\n--- Interactive Mode ---")
  log("This will process one company at a time with browser review.\n")

  // For interactive, we could let the user pick a specific company
  // For now, process the next one in queue (can override via prompt)
  const result = await runInteractive()

  if (result === null) {
    log("No companies left to process.")
    return
  }

  log(`\nProcessed: ${result}`)
}

const handleBatchMode = async (): Promise<void> => {
  log("\n--- Batch Mode ---")
  log("This will auto-process companies without browser review.\n")

  const batchSize = await promptForBatchSize()
  log(`Starting batch of ${batchSize} companies...\n`)

  await runBatch(batchSize)
}

const handleRetryMode = async (): Promise<void> => {
  log("\n--- Retry Mode ---")

  const retryCount = getRetryListCount()
  if (retryCount === 0) {
    log("Retry list is empty. Nothing to retry.")
    return
  }

  log(`${retryCount} companies in retry list.\n`)
  await runRetry()
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

const main = async () => {
  log("╔══════════════════════════════════════════════════════╗")
  log("║         Homepage AI Extractor                       ║")
  log("║   Automated social link extraction using AI         ║")
  log("╚══════════════════════════════════════════════════════╝")
  log("")
  log(`LM Studio: ${HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio.baseUrl}`)
  log(`Model:     ${HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio.model}`)
  log("")

  // Test AI server connectivity first
  log("Testing LM Studio connection...")
  await testConnection()
  log("")

  const mode = await promptForMode()

  if (mode === "interactive") {
    await handleInteractiveMode()
  } else if (mode === "batch") {
    await handleBatchMode()
  } else {
    await handleRetryMode()
  }

  // Prompt to apply overrides (same pattern as validate_index.ts)
  const shouldApply = await promptForApplyOverrides()

  if (!shouldApply) {
    log("Skipping apply-overrides. Run 'pnpm run apply-overrides' manually when ready.")
    process.exit(0)
    return
  }

  log("\nApplying manual overrides to output files...")
  try {
    execSync("pnpm run apply-overrides", {
      stdio: "inherit",
      cwd: process.cwd()
    })
    log("All files updated successfully!")
    process.exit(0)
  } catch {
    error("Failed to apply overrides. Run 'pnpm run apply-overrides' manually.")
    process.exit(1)
  }
}

main().catch((err) => {
  error("Fatal error in Homepage AI Extractor:", err)
  process.exit(1)
})
