import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import inquirer from "inquirer"

import { error, log } from "./helper"
import { addNewEntryLinks, run as validateUrls } from "./tasks/validate_urls"

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
  const resolvedPath = require.resolve(modulePath)
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath]
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath)
  const deleteIds = (module.manualDeleteIds || []) satisfies string[]
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

const promptForAction = async (): Promise<"validate" | "add" | "delete"> => {
  const result = await inquirer.prompt<{ action: "validate" | "add" | "delete" }>([
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
          name: "Add (create new entry in manualOverrides.ts)",
          value: "add"
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

const promptForCompanyName = async (): Promise<string> => {
  const { companyName } = await inquirer.prompt([
    {
      type: "input",
      name: "companyName",
      message: "Enter company name to add to manualOverrides.ts:",
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

const loadManualOverrides = (): Record<string, unknown> => {
  const manualOverridesPath = path.join(__dirname, "./tasks/manual_resolve/manualOverrides.ts")
  const modulePath = path.resolve(manualOverridesPath)
  const resolvedPath = require.resolve(modulePath)
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath]
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath)
  const overrides = module.manualOverrides || {}
  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    throw new Error("manualOverrides is not an object")
  }
  return overrides
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

const handleAddAction = async (): Promise<void> => {
  const currentOverrides = loadManualOverrides()
  log(`\nCurrent manualOverrides: ${Object.keys(currentOverrides).length} entries`)

  const companyName = await promptForCompanyName()

  if (companyName in currentOverrides) {
    error(`\n❌ Company "${companyName}" already exists in manualOverrides.ts`)
    error("Use the Validate option to update existing entries.")
    throw new Error(`Company "${companyName}" already exists in manualOverrides.ts`)
  }

  try {
    await addNewEntryLinks(companyName)
    log(`✅ Added new entry "${companyName}" to manualOverrides.ts`)
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
  } else if (action === "add") {
    await handleAddAction()
  } else {
    await handleValidateAction()
  }
}

main()
