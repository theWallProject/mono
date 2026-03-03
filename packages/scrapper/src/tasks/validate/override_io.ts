import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { log } from "../../helper"
import type { EntryMeta, ManualOverrideValue } from "./types"
import { assertNoLegacyProcessed, hasMeta } from "./types"
import { cleanFieldValue } from "./url_utils"

const manualOverridesPath = path.join(__dirname, "../manual_resolve/manualOverrides.ts")

/**
 * Serializes a single _meta object into a TypeScript literal string.
 * Only includes flags that are explicitly set (truthy or false).
 */
const formatMeta = (meta: EntryMeta): string => {
  const parts: string[] = []
  if (meta.isHomepage !== undefined) parts.push(`isHomepage: ${meta.isHomepage}`)
  if (meta.isVerified !== undefined) parts.push(`isVerified: ${meta.isVerified}`)
  if (meta.isBrowserVerified !== undefined) parts.push(`isBrowserVerified: ${meta.isBrowserVerified}`)
  return `{ ${parts.join(", ")} }`
}

const formatValue = (value: ManualOverrideValue): string => {
  // Fields to exclude from regular output (handled specially)
  const excludeKeys = new Set(["_meta"])

  const meta = hasMeta(value) ? value._meta : null

  if (meta) {
    const fields: string[] = []

    // Preserve all fields except _meta
    for (const [key, val] of Object.entries(value)) {
      if (excludeKeys.has(key)) {
        continue
      }
      if (val !== undefined) {
        fields.push(`${key}: ${JSON.stringify(cleanFieldValue(key, val))}`)
      }
    }

    const metaSuffix = `_meta: ${formatMeta(meta)}`

    if (fields.length > 0) {
      return `{ ${fields.join(", ")}, ${metaSuffix} }`
    } else {
      return `{ ${metaSuffix} }`
    }
  } else {
    // Regular override without meta state
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

  // Fail fast: reject any entries with the legacy _processed field
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "object" && value !== null) {
      assertNoLegacyProcessed(value, key)
    }
  }

  return overrides
}

const serializeOverrides = (overrides: Record<string, ManualOverrideValue>): string => {
  const keys = Object.keys(overrides).sort()
  let content = 'import { ManualOverrideFields } from "../../types";\n\n'
  content += "import { EntryMeta } from \"../validate/types\";\n\n"
  content +=
    "export const manualOverrides: Record<\n" +
    "  string,\n" +
    "  | ManualOverrideFields\n" +
    "  | { _meta: EntryMeta }\n" +
    "  | (ManualOverrideFields & { _meta: EntryMeta })\n" +
    "  | (ManualOverrideFields & { urls?: string[] })\n" +
    "  | (ManualOverrideFields & { _meta: EntryMeta; urls?: string[] })\n" +
    "> = {\n"

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
  return content
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

  const content = serializeOverrides(overrides)
  await formatAndWrite(manualOverridesPath, content, { parser: "typescript" })
  log(`Saved manualOverrides to ${manualOverridesPath}`)
}

/**
 * Merge-and-save: re-reads the file from disk, applies only the entries
 * that were modified (the dirty set) from the in-memory object, then writes.
 * This preserves any external edits to entries NOT in the dirty set.
 *
 * @param inMemoryOverrides - The full in-memory overrides object (source of dirty values)
 * @param dirtyKeys - Set of entry keys that were modified during the session
 */
export const mergeAndSaveManualOverrides = async (
  inMemoryOverrides: Record<string, ManualOverrideValue>,
  dirtyKeys: Set<string>
): Promise<void> => {
  if (dirtyKeys.size === 0) return

  // Re-read the current state from disk (picks up any external edits)
  const diskOverrides = loadManualOverrides()

  // Apply only the dirty entries from in-memory onto the disk state.
  // If a dirty key is absent from in-memory, it was deleted during the session.
  for (const key of dirtyKeys) {
    const value = inMemoryOverrides[key]
    if (value === undefined) {
      Reflect.deleteProperty(diskOverrides, key)
    } else {
      diskOverrides[key] = value
    }
  }

  const content = serializeOverrides(diskOverrides)
  await formatAndWrite(manualOverridesPath, content, { parser: "typescript" })
  log(`Saved manualOverrides (merged ${dirtyKeys.size} dirty entries) to ${manualOverridesPath}`)
}
