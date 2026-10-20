/**
 * Headless `add` command: create a manualAdditions entry from CLI flags.
 *
 * Same validation the interactive flow performs, minus the browser:
 *   - name must be new (manualAdditions and manualOverrides)
 *   - at least one reason, validated against the shared schema
 *   - reason "c" requires proof_text or proof_link
 *   - at least one real URL across ws/li/fb/tw/ig/gh/ytp/ytc/tt/th/urls
 *
 * Entries are written as browser-verified: a human/agent supplied the URLs
 * explicitly, unlike the AI extractor which writes `isHomepage`.
 */

import { APIListOfReasonsSchema, type valuesOfListOfReasons } from "@theWallProject/common"

import { log } from "../helper"
import type { ManualAdditionItem } from "../tasks/manual_resolve/manualAdditions"
import { loadManualAdditions, saveManualAdditions } from "../tasks/validate/addition_io"
import { allLinksGreen, describeNonGreenFields } from "../tasks/validate/green_check"
import { loadManualOverrides } from "../tasks/validate/override_io"
import { browserVerifiedMeta } from "../tasks/validate/types"
import { CLI_LINK_FLAGS, requireArray, requireString, type CliOptions } from "./args"

export type AddResult = {
  readonly action: "add"
  readonly name: string
  readonly written: boolean
  readonly dryRun: boolean
  readonly green: boolean
  readonly nonGreen: string | null
  readonly entry: ManualAdditionItem
}

const collectLinkFields = (options: CliOptions): Partial<Record<(typeof CLI_LINK_FLAGS)[number], string[]>> => {
  const fields: Partial<Record<(typeof CLI_LINK_FLAGS)[number], string[]>> = {}
  for (const field of CLI_LINK_FLAGS) {
    const value = options[field]
    if (value !== undefined && value.length > 0) {
      fields[field] = value
    }
  }
  return fields
}

export const addEntryFromCli = async (options: CliOptions): Promise<AddResult> => {
  const name = requireString(options, "name", 'Pass --name "Company Name".')
  const reasons = requireArray(options, "reasons", "Pass --reasons h,f (see --help).")

  const validatedReasons: valuesOfListOfReasons[] = reasons.map((reason) => {
    const parsed = APIListOfReasonsSchema.safeParse(reason)
    if (!parsed.success) {
      throw new Error(`Invalid reason "${reason}". Allowed: ${APIListOfReasonsSchema.options.join(", ")}`)
    }
    return parsed.data
  })

  if (validatedReasons.includes("c") && options.proofText === undefined && options.proofLink === undefined) {
    throw new Error('Reason "c" (Custom) requires --proofText or --proofLink.')
  }

  const linkFields = collectLinkFields(options)
  const urlCount = Object.values(linkFields).reduce((total, urls) => total + (urls?.length ?? 0), 0)
  if (urlCount === 0) {
    throw new Error(
      "No links supplied. Pass at least one of --ws --li --fb --tw --ig --gh --ytp --ytc --tt --th --urls."
    )
  }

  const existingAdditions = loadManualAdditions()
  if (existingAdditions.some((item) => item.name === name)) {
    throw new Error(`Company "${name}" already exists in manualAdditions.ts`)
  }

  const existingOverrides = loadManualOverrides()
  if (Object.hasOwn(existingOverrides, name)) {
    throw new Error(
      `Company "${name}" already has a manualOverrides entry. ` +
        "Remove it first, or update the override instead of adding a duplicate."
    )
  }

  const entry: ManualAdditionItem = {
    name,
    reasons: validatedReasons,
    _meta: browserVerifiedMeta,
    ...(options.urls !== undefined ? { urls: options.urls } : {}),
    ...(options.androidDevId !== undefined ? { android_dev_id: options.androidDevId } : {}),
    ...(options.androidAppIds !== undefined ? { android_app_ids: options.androidAppIds } : {}),
    ...(options.proofText !== undefined ? { proof_text: options.proofText } : {}),
    ...(options.proofLink !== undefined ? { proof_link: options.proofLink } : {}),
    ...linkFields
  }

  // Green check runs on link fields only: `reasons` and `name` are not links
  // and allLinksGreen would otherwise flag them as non-green.
  const green = allLinksGreen(name, {
    _meta: browserVerifiedMeta,
    ...(options.urls !== undefined ? { urls: options.urls } : {}),
    ...(options.androidAppIds !== undefined ? { android_app_ids: options.androidAppIds } : {}),
    ...linkFields
  })
  const nonGreen = green
    ? null
    : describeNonGreenFields(name, {
        _meta: browserVerifiedMeta,
        ...(options.urls !== undefined ? { urls: options.urls } : {}),
        ...(options.androidAppIds !== undefined ? { android_app_ids: options.androidAppIds } : {}),
        ...linkFields
      })

  if (!green && options.strict === true) {
    throw new Error(`Non-green links (name not in URL): ${nonGreen ?? "unknown"}. Fix them or drop --strict.`)
  }

  if (options.dryRun === true) {
    log(`Dry run: would add "${name}" to manualAdditions.ts`)
    return { action: "add", name, written: false, dryRun: true, green, nonGreen, entry }
  }

  await saveManualAdditions([...existingAdditions, entry])
  log(`Added "${name}" to manualAdditions.ts`)

  return { action: "add", name, written: true, dryRun: false, green, nonGreen, entry }
}
