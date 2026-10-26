import path from "path"

import { loadModule } from "../../utils/moduleLoader"
import { assertNoLegacyProcessed, type ManualOverrideValue } from "../validate/types"
import type { ManualAdditionItem } from "./manualAdditions"

/**
 * Canonical loaders for the hand-curated data files.
 *
 * These files are *written at runtime* by the CLI (`add`, `validate`, `homepage-ai`), so a static
 * `import { manualAdditions } from "./manualAdditions"` binds whatever was on disk when the process
 * started. Anything that regenerates the DB in the same process then silently reads pre-write data:
 * that is how `pnpm data --action add ... --apply` once reported success while writing zero new rows.
 *
 * Always load through these functions, inside the function that needs the data, never at module top
 * level. `loadModule` clears `require.cache` first so each call sees the current file.
 */

const additionsPath = path.resolve(path.join(__dirname, "manualAdditions.ts"))
const overridesPath = path.resolve(path.join(__dirname, "manualOverrides.ts"))

/** Load `manualAdditions.ts` from disk, bypassing the require cache. */
export const loadManualAdditions = (): ManualAdditionItem[] => {
  const module = loadModule<{ manualAdditions?: ManualAdditionItem[] }>(additionsPath)
  const additions = module.manualAdditions
  if (!Array.isArray(additions)) {
    throw new Error(`manualAdditions is not an array (${additionsPath})`)
  }

  for (const item of additions) {
    assertNoLegacyProcessed(item, item.name ?? "<unknown>")
  }

  return additions
}

/** Load `manualOverrides.ts` from disk, bypassing the require cache. */
export const loadManualOverrides = (): Record<string, ManualOverrideValue> => {
  const module = loadModule<{ manualOverrides?: Record<string, ManualOverrideValue> }>(overridesPath)
  const overrides = module.manualOverrides
  if (typeof overrides !== "object" || overrides === null) {
    throw new Error(`manualOverrides is not an object (${overridesPath})`)
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "object" && value !== null) {
      assertNoLegacyProcessed(value, key)
    }
  }

  return overrides
}
