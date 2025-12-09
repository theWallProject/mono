import fs from "fs"
import path from "path"

import { log } from "../../helper"
import type { ManualAdditionItem } from "../manual_resolve/manualAdditions"

const manualAdditionsPath = path.join(__dirname, "../manual_resolve/manualAdditions.ts")

const formatValue = (item: ManualAdditionItem): string => {
  const fields: string[] = []

  // Always include name
  fields.push(`name: ${JSON.stringify(item.name)}`)

  // Add all other fields except name
  if ("reasons" in item && item.reasons !== undefined) {
    fields.push(`reasons: ${JSON.stringify(item.reasons)}`)
  }
  if ("ws" in item && item.ws !== undefined) fields.push(`ws: ${JSON.stringify(item.ws)}`)
  if ("li" in item && item.li !== undefined) fields.push(`li: ${JSON.stringify(item.li)}`)
  if ("fb" in item && item.fb !== undefined) fields.push(`fb: ${JSON.stringify(item.fb)}`)
  if ("tw" in item && item.tw !== undefined) fields.push(`tw: ${JSON.stringify(item.tw)}`)
  if ("ig" in item && item.ig !== undefined) fields.push(`ig: ${JSON.stringify(item.ig)}`)
  if ("gh" in item && item.gh !== undefined) fields.push(`gh: ${JSON.stringify(item.gh)}`)
  if ("ytp" in item && item.ytp !== undefined) fields.push(`ytp: ${JSON.stringify(item.ytp)}`)
  if ("ytc" in item && item.ytc !== undefined) fields.push(`ytc: ${JSON.stringify(item.ytc)}`)
  if ("tt" in item && item.tt !== undefined) fields.push(`tt: ${JSON.stringify(item.tt)}`)
  if ("th" in item && item.th !== undefined) fields.push(`th: ${JSON.stringify(item.th)}`)
  if ("urls" in item && item.urls !== undefined) fields.push(`urls: ${JSON.stringify(item.urls)}`)
  if ("android_dev_id" in item && item.android_dev_id !== undefined)
    fields.push(`android_dev_id: ${JSON.stringify(item.android_dev_id)}`)
  if ("android_app_ids" in item && item.android_app_ids !== undefined)
    fields.push(`android_app_ids: ${JSON.stringify(item.android_app_ids)}`)
  if ("alt" in item && item.alt !== undefined) fields.push(`alt: ${JSON.stringify(item.alt)}`)
  if ("_processed" in item && item._processed === true) fields.push(`_processed: true`)

  return `{ ${fields.join(", ")} }`
}

export const loadManualAdditions = (): ManualAdditionItem[] => {
  const modulePath = path.resolve(manualAdditionsPath)
  const resolvedPath = require.resolve(modulePath)
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath]
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath)
  const additions = (module.manualAdditions || []) satisfies ManualAdditionItem[]
  return additions
}

export const saveManualAdditions = async (additions: ManualAdditionItem[]): Promise<void> => {
  // Sort by name
  const sorted = [...additions].sort((a, b) => a.name.localeCompare(b.name))

  let content = 'import { ManualOverrideFields } from "../../types"\n\n'
  content +=
    "export type ManualAdditionItem = {\n" +
    "  name: string\n" +
    "} & (\n" +
    "  | ManualOverrideFields\n" +
    "  | { _processed: true }\n" +
    "  | (ManualOverrideFields & { _processed: true })\n" +
    "  | (ManualOverrideFields & { urls?: string[] })\n" +
    "  | (ManualOverrideFields & { _processed: true; urls?: string[] })\n" +
    ")\n\n"
  content += "export const manualAdditions: ManualAdditionItem[] = [\n"

  for (const item of sorted) {
    content += `  ${formatValue(item)},\n`
  }

  content += "]\n"

  fs.writeFileSync(manualAdditionsPath, content, "utf-8")
  log(`Saved manualAdditions to ${manualAdditionsPath}`)
}
