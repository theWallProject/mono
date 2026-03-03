/**
 * Unified data command entry point.
 *
 * Consolidates all data-related workflows into a single interactive menu:
 *   - Validate URLs (browser workflow → manualOverrides)
 *   - Add company (browser workflow → manualAdditions)
 *   - Delete company (→ manualDeleteIds)
 *   - Quick verify (review auto-extracted entries)
 *   - AI homepage extraction (interactive / batch / retry)
 *   - Apply overrides (regenerate ALL.json)
 *   - Full pipeline (scrape + merge + extract + validate)
 *
 * Usage: pnpm data
 */

import inquirer from "inquirer"

import { error, log } from "./helper"

process.on("unhandledRejection", (reason) => {
  // Ignore ExitPromptError from inquirer when process exits
  if (
    reason &&
    typeof reason === "object" &&
    (("name" in reason && reason.name === "ExitPromptError") ||
      ("constructor" in reason &&
        reason.constructor &&
        typeof reason.constructor === "function" &&
        "name" in reason.constructor &&
        reason.constructor.name === "ExitPromptError"))
  ) {
    return
  }
  error("Unhandled Rejection:", reason)
  throw new Error("Unhandled Rejection")
})

process.on("uncaughtException", (err) => {
  error("Uncaught Exception:", err)
  throw new Error("Uncaught Exception")
})

// ────────────────────────────────────────────────────────────────────────────
// Action types
// ────────────────────────────────────────────────────────────────────────────

type Action =
  | "validate"
  | "add-addition"
  | "delete"
  | "quick-verify"
  | "homepage-ai"
  | "apply-overrides"
  | "full-pipeline"

// ────────────────────────────────────────────────────────────────────────────
// Menu
// ────────────────────────────────────────────────────────────────────────────

const promptForAction = async (): Promise<Action> => {
  const { action } = await inquirer.prompt<{ action: Action }>([
    {
      type: "list",
      name: "action",
      message: "Choose action:",
      choices: [
        {
          name: "Validate URLs          — Browser workflow, save to manualOverrides",
          value: "validate"
        },
        {
          name: "Add company            — New entry in manualAdditions (browser)",
          value: "add-addition"
        },
        {
          name: "Delete company         — Add to manualDeleteIds",
          value: "delete"
        },
        new inquirer.Separator(),
        {
          name: "Quick verify           — Review auto-extracted entries (keyboard)",
          value: "quick-verify"
        },
        {
          name: "AI homepage extraction — Extract social links via LM Studio",
          value: "homepage-ai"
        },
        new inquirer.Separator(),
        {
          name: "Apply overrides        — Regenerate ALL.json from current data",
          value: "apply-overrides"
        },
        {
          name: "Full pipeline          — Scrape + merge + extract + final",
          value: "full-pipeline"
        }
      ]
    }
  ])
  return action
}

// ────────────────────────────────────────────────────────────────────────────
// Action handlers (lazy imports to avoid loading heavy deps upfront)
// ────────────────────────────────────────────────────────────────────────────

const handleValidate = async (): Promise<void> => {
  const { handleValidateAction } = await import("./validate_index")
  await handleValidateAction()
}

const handleAddAddition = async (): Promise<void> => {
  const { handleAddAdditionAction } = await import("./validate_index")
  await handleAddAdditionAction()
}

const handleDelete = async (): Promise<void> => {
  const { handleDeleteAction } = await import("./validate_index")
  await handleDeleteAction()
}

const handleQuickVerify = async (): Promise<void> => {
  const { run } = await import("./tasks/verify_overrides")
  await run()
}

const handleHomepageAI = async (): Promise<void> => {
  const { run } = await import("./homepage_ai_extractor_index")
  await run()
}

const handleApplyOverrides = async (): Promise<void> => {
  const { runUpdateSteps } = await import("./index")
  log("🔄 Applying manual overrides to output files...")
  await runUpdateSteps({ shouldScrap: false, shouldValidate: false })
  log("✅ All files updated successfully!")
}

const handleFullPipeline = async (): Promise<void> => {
  const { runUpdateSteps } = await import("./index")

  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldScrap",
      message: "Scrape Crunchbase?",
      default: false
    },
    {
      type: "confirm",
      name: "shouldValidate",
      message: "Validate URLs via HTTP?",
      default: false
    }
  ])

  await runUpdateSteps({
    shouldScrap: answers.shouldScrap,
    shouldValidate: answers.shouldValidate
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const action = await promptForAction()

  switch (action) {
    case "validate":
      await handleValidate()
      break
    case "add-addition":
      await handleAddAddition()
      break
    case "delete":
      await handleDelete()
      break
    case "quick-verify":
      await handleQuickVerify()
      break
    case "homepage-ai":
      await handleHomepageAI()
      break
    case "apply-overrides":
      await handleApplyOverrides()
      break
    case "full-pipeline":
      await handleFullPipeline()
      break
    default: {
      const _exhaustive: never = action
      throw new Error(`Unknown action: ${_exhaustive}`)
    }
  }
}

main().catch((err) => {
  error("Fatal error:", err)
  process.exit(1)
})
