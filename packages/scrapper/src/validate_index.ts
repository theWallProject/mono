import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { APIListOfReasonsSchema } from "@theWallProject/common"
import type { APIListOfReasonsValues } from "@theWallProject/common"
import inquirer from "inquirer"

import { error, log } from "./helper"
import { addNewEntryLinksForAdditions, run as validateUrls } from "./tasks/validate_urls"
import { loadModule } from "./utils/moduleLoader"

process.on("unhandledRejection", (reason) => {
  error("DATA_ERROR Unhandled Rejection:", reason)
  throw new Error("DATA_ERROR Unhandled Rejection")
})

process.on("uncaughtException", (err) => {
  error("DATA_ERROR Uncaught Exception:", err)
  throw new Error("DATA_ERROR Uncaught Exception")
})

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

const saveManualDeleteIds = (deleteIds: string[]): void => {
  // Sort and deduplicate
  const sortedIds = Array.from(new Set(deleteIds)).sort()

  let content = "export const manualDeleteIds = [\n"
  for (const id of sortedIds) {
    content += `  "${id}",\n`
  }
  content += "]\n"

  fs.writeFileSync(manualDeleteIdsPath, content, "utf-8")
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
  saveManualDeleteIds(updatedDeleteIds)
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
        { name: "b - On the BDS boycott list", value: "b" }
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

const handleAddAdditionAction = async (): Promise<void> => {
  const currentAdditions = loadManualAdditions()
  log(`\nCurrent manualAdditions: ${currentAdditions.length} entries`)

  const companyName = await promptForCompanyName("manualAdditions")

  if (currentAdditions.some((item) => item.name === companyName)) {
    error(`\n❌ Company "${companyName}" already exists in manualAdditions.ts`)
    throw new Error(`Company "${companyName}" already exists in manualAdditions.ts`)
  }

  const reasons = await promptForReasons()

  try {
    await addNewEntryLinksForAdditions(companyName, reasons)
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
    log("⏭️  Skipping apply-overrides. Run 'pnpm run apply-overrides' manually when ready.")
    process.exit(0)
    return
  }

  // Run apply-overrides after user confirmation
  log("\n🔄 Applying manual overrides to output files...")
  try {
    execSync("pnpm run apply-overrides", {
      stdio: "inherit",
      cwd: process.cwd()
    })
    log("✅ All files updated successfully!")
    process.exit(0)
  } catch {
    error("⚠️  Failed to apply overrides. Run 'pnpm run apply-overrides' manually.")
    process.exit(1)
  }
}

const handleValidateAction = async (): Promise<void> => {
  try {
    await validateUrls()
  } catch (err) {
    error("Validation error:", err)
    // Still try to apply overrides even if validation had errors
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
    log("⏭️  Skipping apply-overrides. Run 'pnpm run apply-overrides' manually when ready.")
    process.exit(0)
    return
  }

  // Run apply-overrides after user confirmation
  log("\n🔄 Applying manual overrides to output files...")
  try {
    execSync("pnpm run apply-overrides", {
      stdio: "inherit",
      cwd: process.cwd()
    })
    log("✅ All files updated successfully!")
    process.exit(0)
  } catch {
    error("⚠️  Failed to apply overrides. Run 'pnpm run apply-overrides' manually.")
    process.exit(1)
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

main()
