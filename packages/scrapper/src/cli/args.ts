/**
 * Shared CLI argument parsing for the scrapper data commands.
 *
 * Every data command works in two modes:
 *   - interactive: no flags → inquirer menus, browser review (unchanged)
 *   - headless:    flags   → no prompts, no keypresses, deterministic output
 *
 * Fail early: unknown flags, bad enums and invalid values throw.
 */

import { parseArgs } from "node:util"
import { z } from "zod"

export const DATA_ACTIONS = [
  "add",
  "validate",
  "delete",
  "quick-verify",
  "homepage-ai",
  "apply-overrides",
  "full-pipeline"
] as const

export type DataAction = (typeof DATA_ACTIONS)[number]

export const HOMEPAGE_MODES = ["interactive", "batch", "retry"] as const

export type HomepageMode = (typeof HOMEPAGE_MODES)[number]

/** Link fields accepted as `--<field>` flags, in addition to ws. */
export const CLI_LINK_FLAGS = ["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"] as const

export type CliLinkFlag = (typeof CLI_LINK_FLAGS)[number]

const stringOption = { type: "string" } as const
const multiStringOption = { type: "string", multiple: true } as const
const booleanOption = { type: "boolean" } as const

const OPTIONS = {
  // routing
  action: stringOption,
  help: booleanOption,
  json: booleanOption,
  // company selection
  name: stringOption,
  company: stringOption,
  id: stringOption,
  // entry payload
  reasons: multiStringOption,
  ws: multiStringOption,
  li: multiStringOption,
  fb: multiStringOption,
  tw: multiStringOption,
  ig: multiStringOption,
  gh: multiStringOption,
  ytp: multiStringOption,
  ytc: multiStringOption,
  tt: multiStringOption,
  th: multiStringOption,
  urls: multiStringOption,
  androidDevId: stringOption,
  androidAppIds: multiStringOption,
  proofText: stringOption,
  proofLink: stringOption,
  // behaviour
  apply: booleanOption,
  strict: booleanOption,
  dryRun: booleanOption,
  autoOnly: booleanOption,
  // homepage extractor
  mode: stringOption,
  size: stringOption,
  baseUrl: stringOption,
  // full pipeline
  scrap: booleanOption,
  validate: booleanOption
} as const

/** Accepts both `--base-url` and `--baseUrl`. */
const normalizeArgv = (argv: string[]): string[] =>
  argv.map((arg) => {
    if (!arg.startsWith("--")) return arg
    const body = arg.slice(2)
    const camel = body.replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase())
    return `--${camel}`
  })

const urlArray = z.array(z.string().trim().min(1))

const CliOptionsSchema = z
  .object({
    action: z.enum(DATA_ACTIONS).optional(),
    help: z.boolean().optional(),
    json: z.boolean().optional(),
    name: z.string().trim().min(1).optional(),
    company: z.string().trim().min(1).optional(),
    id: z.string().trim().min(1).optional(),
    reasons: z.array(z.string().trim().min(1)).optional(),
    ws: urlArray.optional(),
    li: urlArray.optional(),
    fb: urlArray.optional(),
    tw: urlArray.optional(),
    ig: urlArray.optional(),
    gh: urlArray.optional(),
    ytp: urlArray.optional(),
    ytc: urlArray.optional(),
    tt: urlArray.optional(),
    th: urlArray.optional(),
    urls: urlArray.optional(),
    androidDevId: z.string().trim().min(1).optional(),
    androidAppIds: z.array(z.string().trim().min(1)).optional(),
    proofText: z.string().trim().min(1).optional(),
    proofLink: z.string().trim().url().optional(),
    apply: z.boolean().optional(),
    strict: z.boolean().optional(),
    dryRun: z.boolean().optional(),
    autoOnly: z.boolean().optional(),
    mode: z.enum(HOMEPAGE_MODES).optional(),
    size: z.coerce.number().int().min(1).max(10000).optional(),
    baseUrl: z.string().trim().url().optional(),
    scrap: z.boolean().optional(),
    validate: z.boolean().optional()
  })
  .strict()

export type CliOptions = z.infer<typeof CliOptionsSchema>

/** `--reasons h,f` and `--reasons h --reasons f` are both accepted. */
const splitReasons = (values: string[] | undefined): string[] | undefined => {
  if (values === undefined) return undefined
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

/** RFC 4180-ish split for comma separated URL lists (quoted values stay joined). */
const splitUrlList = (values: string[] | undefined): string[] | undefined => {
  if (values === undefined) return undefined
  return values.flatMap((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
  )
}

/**
 * Parses `process.argv.slice(2)` into validated options.
 * Throws on unknown flags, invalid enum values and malformed URLs.
 */
export const parseDataCli = (argv: string[]): CliOptions => {
  const { values } = parseArgs({
    args: normalizeArgv(argv),
    options: OPTIONS,
    allowPositionals: false,
    strict: true
  })

  const raw: Record<string, unknown> = { ...values }
  raw.reasons = splitReasons(values.reasons)
  for (const field of CLI_LINK_FLAGS) {
    raw[field] = splitUrlList(values[field])
  }
  raw.urls = splitUrlList(values.urls)
  raw.androidAppIds = splitUrlList(values.androidAppIds)

  return CliOptionsSchema.parse(raw)
}

export const HELP_TEXT = `Scrapper data CLI — interactive menus and headless flags

Usage:
  pnpm data                      Interactive menu (human)
  pnpm data --action <action>    Headless (agent)

Actions:
  add              Add a company to manualAdditions.ts
  validate         Browser-validate one company → manualOverrides.ts
  delete           Add a company id to manualDeleteIds.ts
  quick-verify     Review homepage-extracted entries
  homepage-ai      Run the homepage AI extractor
  apply-overrides  Regenerate merged/final ALL.json + copies
  full-pipeline    Run the whole data pipeline

Common flags:
  --action <action>         See above
  --name <company>          Company name (--action add)
  --company <company>       Company to process (validate / homepage-ai)
  --id <companyId>          Company id to delete (--action delete)
  --reasons h,f             Reasons, repeatable or comma separated
  --ws --li --fb --tw --ig --gh --ytp --ytc --tt --th --urls
                            Link fields, repeatable
  --androidDevId <id>       Android developer id
  --androidAppIds a,b       Android app package ids
  --proofText / --proofLink Required for reason "c"
  --apply                   Run apply-overrides afterwards
  --strict                  Fail on non-green (name-not-in-URL) links
  --dryRun                  Validate + print, write nothing
  --json                    Print the result as JSON
  --help                    This text

Homepage extractor flags:
  --mode interactive|batch|retry
  --size <n>                Batch size
  --baseUrl <url>           Local model server (e.g. http://192.168.122.1:8888)

Quick verify flags:
  --autoOnly                Only auto-verify duplicates, no keypress review

Full pipeline flags:
  --scrap --validate        Enable scraping / HTTP validation

Examples:
  pnpm data --action add --name "Acme" --reasons h --ws https://acme.com \\
            --li https://www.linkedin.com/company/acme --apply

  pnpm data --action homepage-ai --mode retry --company Nerdeez

  pnpm data --action apply-overrides
`

/** Prints help when `--help` is present. Returns true when handled. */
export const handleHelp = (options: CliOptions): boolean => {
  if (options.help !== true) return false
  console.log(HELP_TEXT)
  return true
}

/** Requires a flag for a headless run; throws with usage guidance otherwise. */
export const requireString = (options: CliOptions, key: "name" | "company" | "id", hint: string): string => {
  const value = options[key]
  if (value === undefined) {
    throw new Error(`Missing required flag --${key}. ${hint}`)
  }
  return value
}

/** Requires a repeatable flag for a headless run. */
export const requireArray = (options: CliOptions, key: "reasons" | "ws", hint: string): string[] => {
  const value = options[key]
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required flag --${key}. ${hint}`)
  }
  return value
}
