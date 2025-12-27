import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { log } from "../../helper"
import type { ManualOverrideValue } from "./types"
import { isProcessed } from "./types"

const manualOverridesPath = path.join(__dirname, "../manual_resolve/manualOverrides.ts")

const formatValue = (value: ManualOverrideValue): string => {
  // Fields to exclude from output (handled specially)
  const excludeKeys = new Set(["_processed"])

  if (isProcessed(value)) {
    const fields: string[] = []

    // Preserve all fields except _processed
    for (const [key, val] of Object.entries(value)) {
      if (excludeKeys.has(key)) {
        continue
      }
      if (val !== undefined) {
        fields.push(`${key}: ${JSON.stringify(val)}`)
      }
    }

    if (fields.length > 0) {
      // Has changes - include both the fields and the processed state
      return `{ ${fields.join(", ")}, _processed: true }`
    } else {
      // No changes - just processed state
      return `{ _processed: true }`
    }
  } else {
    // Regular override without processed state
    const fields: string[] = []

    // Preserve all fields
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        fields.push(`${key}: ${JSON.stringify(val)}`)
      }
    }

    if (fields.length > 0) {
      return `{ ${fields.join(", ")} }`
    } else {
      return `{}`
    }
  }
}

export const loadManualOverrides = (): Record<string, ManualOverrideValue> => {
  const modulePath = path.resolve(manualOverridesPath)
  const resolvedPath = require.resolve(modulePath)
  delete require.cache[resolvedPath]
  const module = require(modulePath)
  const overrides = module.manualOverrides satisfies Record<string, ManualOverrideValue>
  return overrides
}

export const saveManualOverrides = async (overrides: Record<string, ManualOverrideValue>): Promise<void> => {
  // Load existing overrides to check for new keys
  const existingOverrides = loadManualOverrides()
  const existingKeys = new Set(Object.keys(existingOverrides))
  const newKeys = Object.keys(overrides).filter((key) => !existingKeys.has(key))

  if (newKeys.length > 0) {
    throw new Error(
      `Cannot add new keys to manualOverrides.ts: ${newKeys.join(", ")}. ` +
        "New entries must be added to manualAdditions.ts instead."
    )
  }

  const keys = Object.keys(overrides).sort()
  let content = 'import { ManualOverrideFields } from "../../types";\n\n'
  content +=
    "export const manualOverrides: Record<string, ManualOverrideFields | { _processed: true } | (ManualOverrideFields & { _processed: true }) | (ManualOverrideFields & { urls?: string[] }) | (ManualOverrideFields & { _processed: true; urls?: string[] })> = {\n"

  for (const key of keys) {
    const value = overrides[key]
    if (value === undefined) {
      throw new Error(`Unexpected undefined value for key: ${key}`)
    }
    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
    const keyStr = needsQuotes ? `"${key.replace(/"/g, '\\"')}"` : key
    content += `  ${keyStr}: ${formatValue(value)},\n`
  }

  content += "};\n"

  await formatAndWrite(manualOverridesPath, content, { parser: "typescript" })
  log(`Saved manualOverrides to ${manualOverridesPath}`)
}
