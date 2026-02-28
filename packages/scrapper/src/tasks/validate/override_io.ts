import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { log } from "../../helper"
import type { ManualOverrideValue } from "./types"
import { isAssetlinksExtracted, isAutoExtracted, isProcessed } from "./types"
import { cleanFieldValue } from "./url_utils"

const manualOverridesPath = path.join(__dirname, "../manual_resolve/manualOverrides.ts")

const formatValue = (value: ManualOverrideValue): string => {
  // Fields to exclude from output (handled specially)
  const excludeKeys = new Set(["_processed"])

  // Determine the _processed suffix based on state
  const processedSuffix: string | null = isProcessed(value)
    ? "_processed: true"
    : isAutoExtracted(value)
      ? '_processed: "auto"'
      : isAssetlinksExtracted(value)
        ? '_processed: "assetlinks"'
        : null

  if (processedSuffix) {
    const fields: string[] = []

    // Preserve all fields except _processed
    for (const [key, val] of Object.entries(value)) {
      if (excludeKeys.has(key)) {
        continue
      }
      if (val !== undefined) {
        fields.push(`${key}: ${JSON.stringify(cleanFieldValue(key, val))}`)
      }
    }

    if (fields.length > 0) {
      return `{ ${fields.join(", ")}, ${processedSuffix} }`
    } else {
      return `{ ${processedSuffix} }`
    }
  } else {
    // Regular override without processed state
    const fields: string[] = []

    // Preserve all fields
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        fields.push(`${key}: ${JSON.stringify(cleanFieldValue(key, val))}`)
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
  Reflect.deleteProperty(require.cache, resolvedPath)
  const module = require(modulePath)
  const overrides = module.manualOverrides satisfies Record<string, ManualOverrideValue>
  return overrides
}

export const saveManualOverrides = async (
  overrides: Record<string, ManualOverrideValue>,
  options?: { allowNewKeys?: boolean }
): Promise<void> => {
  // Load existing overrides to check for new keys (unless explicitly allowed)
  if (!options?.allowNewKeys) {
    const existingOverrides = loadManualOverrides()
    const existingKeys = new Set(Object.keys(existingOverrides))
    const newKeys = Object.keys(overrides).filter((key) => !existingKeys.has(key))

    if (newKeys.length > 0) {
      throw new Error(
        `Cannot add new keys to manualOverrides.ts: ${newKeys.join(", ")}. ` +
          "New entries must be added to manualAdditions.ts instead."
      )
    }
  }

  const keys = Object.keys(overrides).sort()
  let content = 'import { ManualOverrideFields } from "../../types";\n\n'
  content +=
    'export const manualOverrides: Record<string, ManualOverrideFields | { _processed: true } | { _processed: "auto" } | { _processed: "assetlinks" } | (ManualOverrideFields & { _processed: true }) | (ManualOverrideFields & { _processed: "auto" }) | (ManualOverrideFields & { _processed: "assetlinks" }) | (ManualOverrideFields & { urls?: string[] }) | (ManualOverrideFields & { _processed: true; urls?: string[] }) | (ManualOverrideFields & { _processed: "auto"; urls?: string[] }) | (ManualOverrideFields & { _processed: "assetlinks"; urls?: string[] })> = {\n'

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
