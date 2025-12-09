import fs from "fs"
import path from "path"

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
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath]
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath)
  const overrides = (module.manualOverrides || {}) satisfies Record<string, ManualOverrideValue>
  return overrides
}

export const saveManualOverrides = async (overrides: Record<string, ManualOverrideValue>): Promise<void> => {
  const keys = Object.keys(overrides).sort()
  let content = 'import { CrunchbaseScrappedItemType } from "../../types";\n\n'
  content +=
    '// Allow arrays for link fields in overrides\ntype ManualOverrideFields = {\n  ws?: string | string[];\n  li?: string | string[];\n  fb?: string | string[];\n  tw?: string | string[];\n  ig?: string | string[];\n  gh?: string | string[];\n  ytp?: string | string[];\n  ytc?: string | string[];\n  tt?: string | string[];\n  th?: string | string[];\n} & Omit<Partial<CrunchbaseScrappedItemType>, "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th">;\n\n'
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

  fs.writeFileSync(manualOverridesPath, content, "utf-8")
  log(`Saved manualOverrides to ${manualOverridesPath}`)
}
