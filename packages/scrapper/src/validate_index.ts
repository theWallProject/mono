import { execSync } from "child_process"
import path from "path"
import { APIListOfReasonsSchema, formatAndWrite } from "@theWallProject/common"
import type { APIListOfReasonsValues } from "@theWallProject/common"
import inquirer from "inquirer"

import { error, log } from "./helper"
import {
  addNewEntryLinksForAdditions,
  addNewEntryLinksForAdditionsSequential,
  run as validateUrls
} from "./tasks/validate_urls"
import { loadModule } from "./utils/moduleLoader"

// Only register error handlers when this file is executed directly (not imported)
if (require.main === module) {
  process.on("unhandledRejection", (reason) => {
    error("DATA_ERROR Unhandled Rejection:", reason)
    throw new Error("DATA_ERROR Unhandled Rejection")
  })

  process.on("uncaughtException", (err) => {
    error("DATA_ERROR Uncaught Exception:", err)
    throw new Error("DATA_ERROR Uncaught Exception")
  })
}

const manualDeleteIdsPath = path.join(__dirname, "./tasks/manual_resolve/manualDeleteIds.ts")

const loadManualDeleteIds = (): string[] => {
  const modulePath = path.resolve(manualDeleteIdsPath)
  const module = loadModule<{ manualDeleteIds?: string[] }>(modulePath)
  const deleteIds = module.manualDeleteIds || []
  if (!Array.isArray(deleteIds)) {
    throw new Error("manualDeleteIds is not an array")
  }
  return deleteIds
}

const saveManualDeleteIds = async (deleteIds: string[]): Promise<void> => {
  // Sort and deduplicate
  const sortedIds = Array.from(new Set(deleteIds)).sort()

  let content = "export const manualDeleteIds = [\n"
  for (const id of sortedIds) {
    content += `  "${id}",\n`
  }
  content += "]\n"

  await formatAndWrite(manualDeleteIdsPath, content, { parser: "typescript" })
  log(`Saved manualDeleteIds to ${manualDeleteIdsPath}`)
}

const promptForAction = async (): Promise<"validate" | "add-addition" | "delete"> => {
  const result = await inquirer.prompt<{ action: "validate" | "add-addition" | "delete" }>([
    {
      type: "list",
      name: "action",
      message: "Choose action:",
      choices: [
        {
          name: "Validate (validate URLs and add to manualOverrides.ts)",
          value: "validate"
        },
        {
          name: "Add Addition (create new entry in manualAdditions.ts)",
          value: "add-addition"
        },
        {
          name: "Delete (add to manualDeleteIds.ts)",
          value: "delete"
        }
      ]
    }
  ])
  return result.action
}

const promptForCompanyId = async (): Promise<string> => {
  const { companyId } = await inquirer.prompt([
    {
      type: "input",
      name: "companyId",
      message: "Enter company ID to add to manualDeleteIds.ts:",
      validate: (input: string) => {
        if (!input || !input.trim()) {
          return "Company ID cannot be empty"
        }
        return true
      }
    }
  ])
  return companyId.trim()
}

const promptForCompanyName = async (
  target: "manualOverrides" | "manualAdditions" = "manualOverrides"
): Promise<string> => {
  const { companyName } = await inquirer.prompt([
    {
      type: "input",
      name: "companyName",
      message: `Enter company name to add to ${target}.ts:`,
      validate: (input: string) => {
        if (!input || !input.trim()) {
          return "Company name cannot be empty"
        }
        return true
      }
    }
  ])
  return companyName.trim()
}

const loadManualAdditions = (): Array<{ name: string }> => {
  const manualAdditionsPath = path.join(__dirname, "./tasks/manual_resolve/manualAdditions.ts")
  const modulePath = path.resolve(manualAdditionsPath)
  const module = loadModule<{ manualAdditions?: Array<{ name: string }> }>(modulePath)
  const additions = module.manualAdditions || []
  if (!Array.isArray(additions)) {
    throw new Error("manualAdditions is not an array")
  }
  return additions
}

const handleDeleteAction = async (): Promise<void> => {
  const currentDeleteIds = loadManualDeleteIds()
  log(`\nCurrent manualDeleteIds: ${currentDeleteIds.length} entries`)

  const companyId = await promptForCompanyId()

  if (currentDeleteIds.includes(companyId)) {
    log(`⚠️  Company ID "${companyId}" already exists in manualDeleteIds.ts`)
    return
  }

  const updatedDeleteIds = [...currentDeleteIds, companyId]
  await saveManualDeleteIds(updatedDeleteIds)
  log(`✅ Added "${companyId}" to manualDeleteIds.ts`)
}

const promptForReasons = async (): Promise<APIListOfReasonsValues[]> => {
  const { reasons } = await inquirer.prompt<{ reasons: string[] }>([
    {
      type: "checkbox",
      name: "reasons",
      message: "Select reasons (at least one required):",
      choices: [
        { name: "h - Headquartered in Israel", value: "h" },
        { name: "f - Founded by Israeli entrepreneurs", value: "f" },
        { name: "i - Significant investment from Israeli VCs", value: "i" },
        { name: "BDS_PRIO - Priority target on BDS boycott list", value: "BDS_PRIO" },
        { name: "BDS_GRASS - Grassroots target on BDS boycott list", value: "BDS_GRASS" },
        { name: "BDS_PRESSURE - Pressure target on BDS boycott list", value: "BDS_PRESSURE" },
        { name: "c - Custom (requires proof_text or proof_link)", value: "c" }
      ],
      validate: (input: string[]) => {
        if (!Array.isArray(input) || input.length === 0) {
          return "At least one reason must be selected"
        }
        return true
      }
    }
  ])

  // Validate all reasons using the schema
  const validatedReasons: APIListOfReasonsValues[] = []
  for (const reason of reasons) {
    try {
      validatedReasons.push(APIListOfReasonsSchema.parse(reason))
    } catch {
      throw new Error(`Invalid reason value: ${reason}`)
    }
  }
  return validatedReasons
}

/**
 * Prompt for proof fields when 'c' (Custom) reason is selected.
 * At least one of proof_text or proof_link must be provided.
 */
const promptForProofFields = async (): Promise<{ proof_text?: string; proof_link?: string }> => {
  const { hasProof } = await inquirer.prompt<{ hasProof: boolean }>([
    {
      type: "confirm",
      name: "hasProof",
      message: "Add proof_text (custom evidence text)?",
      default: true
    }
  ])

  let proof_text: string | undefined
  let proof_link: string | undefined

  if (hasProof) {
    const { text } = await inquirer.prompt<{ text: string }>([
      {
        type: "input",
        name: "text",
        message: "Enter proof_text (evidence for why company is flagged):",
        validate: (input: string) => {
          if (!input || !input.trim()) {
            return "proof_text cannot be empty (press Ctrl+C to skip)"
          }
          return true
        }
      }
    ])
    proof_text = text.trim()
  }

  const { hasLink } = await inquirer.prompt<{ hasLink: boolean }>([
    {
      type: "confirm",
      name: "hasLink",
      message: "Add proof_link (URL to source/evidence)?",
      default: !proof_text
    }
  ])

  if (hasLink) {
    const { link } = await inquirer.prompt<{ link: string }>([
      {
        type: "input",
        name: "link",
        message: "Enter proof_link (URL to source/evidence):",
        validate: (input: string) => {
          if (!input || !input.trim()) {
            return "proof_link cannot be empty (press Ctrl+C to skip)"
          }
          try {
            new URL(input.trim())
            return true
          } catch {
            return "proof_link must be a valid URL"
          }
        }
      }
    ])
    proof_link = link.trim()
  }

  // Ensure at least one proof field is provided
  if (!proof_text && !proof_link) {
    error("At least one of proof_text or proof_link is required for 'c' (Custom) reason")
    // Recursively prompt until at least one is provided
    return promptForProofFields()
  }

  const result: { proof_text?: string; proof_link?: string } = {}
  if (proof_text) result.proof_text = proof_text
  if (proof_link) result.proof_link = proof_link
  return result
}

const promptForBrowserMode = async (): Promise<"sequential" | "all-at-once"> => {
  const { mode } = await inquirer.prompt<{ mode: "sequential" | "all-at-once" }>([
    {
      type: "list",
      name: "mode",
      message: "Choose browser mode:",
      choices: [
        {
          name: "Sequential (one platform at a time - easier to manage tabs)",
          value: "sequential"
        },
        {
          name: "All at once (all platforms open together - faster but more tabs)",
          value: "all-at-once"
        }
      ],
      default: "sequential"
    }
  ])
  return mode
}

const handleAddAdditionAction = async (): Promise<void> => {
  const currentAdditions = loadManualAdditions()
  log(`\nCurrent manualAdditions: ${currentAdditions.length} entries`)

  const companyName = await promptForCompanyName("manualAdditions")

  if (currentAdditions.some((item) => item.name === companyName)) {
    error(`\n❌ Company "${companyName}" already exists in manualAdditions.ts`)
    throw new Error(`Company "${companyName}" already exists in manualAdditions.ts`)
  }

  const reasons = await promptForReasons()

  // If 'c' (Custom) reason is selected, prompt for proof fields
  let proofFields: { proof_text?: string; proof_link?: string } | undefined
  if (reasons.includes("c")) {
    proofFields = await promptForProofFields()
  }

  const browserMode = await promptForBrowserMode()

  try {
    if (browserMode === "sequential") {
      await addNewEntryLinksForAdditionsSequential(companyName, reasons, proofFields)
    } else {
      await addNewEntryLinksForAdditions(companyName, reasons, proofFields)
    }
    log(`✅ Added new entry "${companyName}" to manualAdditions.ts`)
  } catch (err) {
    error("Add entry error:", err)
    throw err
  }

  // Wait for user confirmation before applying overrides
  const { shouldApply } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldApply",
      message: "Apply manual overrides to output files?",
      default: true
    }
  ])

  if (!shouldApply) {
    log("⏭️  Skipping apply-overrides. Run 'pnpm data apply' manually when ready.")
    return
  }

  applyOverridesWithLog()
}

const handleValidateAction = async (): Promise<void> => {
  try {
    await validateUrls()
  } catch (err) {
    error("Validation error:", err)
    // Still try to apply overrides even if validation had errors
  }

  await promptAndApplyOverrides()
}

const promptAndApplyOverrides = async (): Promise<void> => {
  const { shouldApply } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldApply",
      message: "Apply manual overrides to output files?",
      default: true
    }
  ])

  if (!shouldApply) {
    log("⏭️  Skipping apply-overrides. Run 'pnpm data apply' manually when ready.")
    return
  }

  applyOverridesWithLog()
}

const applyOverridesWithLog = (): void => {
  log("\n🔄 Applying manual overrides to output files...")
  try {
    execSync("pnpm run apply-overrides", {
      stdio: "inherit",
      cwd: process.cwd()
    })
    log("✅ All files updated successfully!")
  } catch {
    throw new Error("Failed to apply overrides. Run 'pnpm data apply' manually.")
  }
}

const main = async () => {
  const action = await promptForAction()

  if (action === "delete") {
    await handleDeleteAction()
  } else if (action === "add-addition") {
    await handleAddAdditionAction()
  } else {
    await handleValidateAction()
  }
}

export { main as run, handleValidateAction, handleAddAdditionAction, handleDeleteAction }

// Run directly when executed as a script
if (require.main === module) {
  main().catch((err) => {
    error("Fatal error in main():", err)
    process.exit(1)
  })
}
