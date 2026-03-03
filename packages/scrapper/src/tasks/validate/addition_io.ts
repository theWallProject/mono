import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { log } from "../../helper"
import { loadModule } from "../../utils/moduleLoader"
import type { ManualAdditionItem } from "../manual_resolve/manualAdditions"
import { assertNoLegacyProcessed, type EntryMeta } from "./types"
import { cleanFieldValue } from "./url_utils"

const manualAdditionsPath = path.join(__dirname, "../manual_resolve/manualAdditions.ts")

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

const formatValue = (item: ManualAdditionItem): string => {
  const fields: string[] = []

  // Always include name
  fields.push(`name: ${JSON.stringify(item.name)}`)

  // Add all other fields except name and _meta
  if ("reasons" in item && item.reasons !== undefined) {
    fields.push(`reasons: ${JSON.stringify(item.reasons)}`)
  }
  if ("ws" in item && item.ws !== undefined) fields.push(`ws: ${JSON.stringify(cleanFieldValue("ws", item.ws))}`)
  if ("li" in item && item.li !== undefined) fields.push(`li: ${JSON.stringify(cleanFieldValue("li", item.li))}`)
  if ("fb" in item && item.fb !== undefined) fields.push(`fb: ${JSON.stringify(cleanFieldValue("fb", item.fb))}`)
  if ("tw" in item && item.tw !== undefined) fields.push(`tw: ${JSON.stringify(cleanFieldValue("tw", item.tw))}`)
  if ("ig" in item && item.ig !== undefined) fields.push(`ig: ${JSON.stringify(cleanFieldValue("ig", item.ig))}`)
  if ("gh" in item && item.gh !== undefined) fields.push(`gh: ${JSON.stringify(cleanFieldValue("gh", item.gh))}`)
  if ("ytp" in item && item.ytp !== undefined) fields.push(`ytp: ${JSON.stringify(cleanFieldValue("ytp", item.ytp))}`)
  if ("ytc" in item && item.ytc !== undefined) fields.push(`ytc: ${JSON.stringify(cleanFieldValue("ytc", item.ytc))}`)
  if ("tt" in item && item.tt !== undefined) fields.push(`tt: ${JSON.stringify(cleanFieldValue("tt", item.tt))}`)
  if ("th" in item && item.th !== undefined) fields.push(`th: ${JSON.stringify(cleanFieldValue("th", item.th))}`)
  if ("urls" in item && item.urls !== undefined) fields.push(`urls: ${JSON.stringify(cleanFieldValue("urls", item.urls))}`)
  if ("android_dev_id" in item && item.android_dev_id !== undefined)
    fields.push(`android_dev_id: ${JSON.stringify(item.android_dev_id)}`)
  if ("android_app_ids" in item && item.android_app_ids !== undefined)
    fields.push(`android_app_ids: ${JSON.stringify(item.android_app_ids)}`)
  if ("alt" in item && item.alt !== undefined) fields.push(`alt: ${JSON.stringify(item.alt)}`)

  // Serialize _meta if present
  if ("_meta" in item && typeof item._meta === "object" && item._meta !== null) {
    // item._meta is narrowed to object by the checks above; EntryMeta is structurally compatible
    const meta: EntryMeta = item._meta
    fields.push(`_meta: ${formatMeta(meta)}`)
  }

  return `{ ${fields.join(", ")} }`
}

export const loadManualAdditions = (): ManualAdditionItem[] => {
  const modulePath = path.resolve(manualAdditionsPath)
  const module = loadModule<{ manualAdditions?: ManualAdditionItem[] }>(modulePath)
  const additions = module.manualAdditions || []
  if (!Array.isArray(additions)) {
    throw new Error("manualAdditions is not an array")
  }

  // Fail fast: reject any entries with the legacy _processed field
  for (const item of additions) {
    assertNoLegacyProcessed(item, item.name ?? "<unknown>")
  }

  return additions
}

export const saveManualAdditions = async (additions: ManualAdditionItem[]): Promise<void> => {
  // Sort by name
  const sorted = [...additions].sort((a, b) => a.name.localeCompare(b.name))

  let content = 'import { ManualOverrideFields } from "../../types"\n\n'
  content += 'import { EntryMeta } from "../validate/types"\n\n'
  content +=
    "export type ManualAdditionItem = {\n" +
    "  name: string\n" +
    "} & (\n" +
    "  | ManualOverrideFields\n" +
    "  | { _meta: EntryMeta }\n" +
    "  | (ManualOverrideFields & { _meta: EntryMeta })\n" +
    "  | (ManualOverrideFields & { urls?: string[] })\n" +
    "  | (ManualOverrideFields & { _meta: EntryMeta; urls?: string[] })\n" +
    ")\n\n"
  content += "export const manualAdditions: ManualAdditionItem[] = [\n"

  for (const item of sorted) {
    content += `  ${formatValue(item)},\n`
  }

  content += "]\n"

  await formatAndWrite(manualAdditionsPath, content, { parser: "typescript" })
  log(`Saved manualAdditions to ${manualAdditionsPath}`)
}
