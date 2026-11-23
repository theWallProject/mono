/**
 * Top-level release command for The Wall monorepo.
 *
 * Orchestrates a release for one package:
 *   - addon:   derive whether this build ships a new what's-new page from its page id, bump the
 *              version, run tests, build + package all browsers
 *   - android: delegate to the existing release.sh script
 *
 * **Two modes, same code path.**
 *
 *   pnpm release                             interactive (unchanged default)
 *   pnpm release --package addon --bump patch [--skip-tests] [--yes]
 *
 * The flags exist because the prompts make this script unusable by anything that is not a human at
 * a TTY: an agent, CI, or a script has no one to answer `inquirer`. Without them the only way to
 * release was to re-implement these steps by hand, which is how a release and the script that
 * documents it drift apart.
 *
 * `--yes` skips the final confirmation and is REQUIRED together with `--skip-tests`: a release that
 * neither ran the tests nor asked about it should be a deliberate act, not a default.
 *
 * Exit codes: 0 success, 1 failure, 2 bad usage. A machine caller can trust those; it cannot trust
 * a human answering a prompt on its behalf.
 */

import { execSync } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import inquirer from "inquirer"

// ────────────────────────────────────────────────────────────────────────────
// Error handling
// ────────────────────────────────────────────────────────────────────────────

process.on("unhandledRejection", (reason) => {
  if (
    reason &&
    typeof reason === "object" &&
    (("name" in reason && reason.name === "ExitPromptError") ||
      ("constructor" in reason &&
        reason.constructor &&
        typeof reason.constructor === "function" &&
        "name" in reason.constructor &&
        reason.constructor.name === "ExitPromptError"))
  ) {
    return
  }
  console.error("Unhandled Rejection:", reason)
  process.exit(1)
})

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err)
  process.exit(1)
})

// ────────────────────────────────────────────────────────────────────────────
// Constants & paths
// ────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, "..")
const ADDON_PKG_PATH = resolve(ROOT, "packages/addon/package.json")
const ADDON_WHATSNEW_PATH = resolve(ROOT, "packages/addon/src/whatsNew.ts")
const ANDROID_VERSION_PATH = resolve(ROOT, "packages/android/version.properties")

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type Package = "addon" | "android"
type BumpType = "patch" | "minor" | "major"

interface SemVer {
  major: number
  minor: number
  patch: number
}

// ────────────────────────────────────────────────────────────────────────────
// Semver utilities
// ────────────────────────────────────────────────────────────────────────────

const parseSemVer = (version: string): SemVer => {
  const parts = version.split(".")
  if (parts.length !== 3) {
    throw new Error(`Invalid semver: "${version}" — expected MAJOR.MINOR.PATCH`)
  }

  const [major, minor, patch] = parts.map((p) => {
    const n = Number(p)
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`Invalid semver: "${version}" — "${p}" is not a valid number`)
    }
    return n
  })

  return { major: major!, minor: minor!, patch: patch! }
}

const formatSemVer = (v: SemVer): string => `${v.major}.${v.minor}.${v.patch}`

const bumpSemVer = (current: SemVer, type: BumpType): SemVer => {
  switch (type) {
    case "patch":
      return { ...current, patch: current.patch + 1 }
    case "minor":
      return { major: current.major, minor: current.minor + 1, patch: 0 }
    case "major":
      return { major: current.major + 1, minor: 0, patch: 0 }
    default: {
      const _exhaustive: never = type
      throw new Error(`Unknown bump type: ${_exhaustive}`)
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Version readers
// ────────────────────────────────────────────────────────────────────────────

const readAddonVersion = (): string => {
  const raw = readFileSync(ADDON_PKG_PATH, "utf-8")
  const pkg = JSON.parse(raw) as { version?: string }

  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error(`Could not read version from ${ADDON_PKG_PATH} — "version" field is missing or empty`)
  }

  // Validate it parses correctly
  parseSemVer(pkg.version)
  return pkg.version
}

const readAndroidVersion = (): string => {
  const raw = readFileSync(ANDROID_VERSION_PATH, "utf-8")
  const match = raw.match(/^VERSION_NAME=(.+)$/m)

  if (!match || !match[1]) {
    throw new Error(`Could not read VERSION_NAME from ${ANDROID_VERSION_PATH}`)
  }

  const version = match[1].trim()
  // Validate it parses correctly
  parseSemVer(version)
  return version
}

const readPackageVersion = (pkg: Package): string => {
  switch (pkg) {
    case "addon":
      return readAddonVersion()
    case "android":
      return readAndroidVersion()
    default: {
      const _exhaustive: never = pkg
      throw new Error(`Unknown package: ${_exhaustive}`)
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// What's new flag
// ────────────────────────────────────────────────────────────────────────────

/**
 * The line in the addon source that decides whether this build opens the what's-new page.
 *
 * Anchored and single-line on purpose: the file carries a long comment above the declaration, and
 * quietly rewriting a declaration that had been reworded would make the release lie about what it
 * shipped. No match — throw.
 */
const WHATSNEW_PAGE_ID_PATTERN = /^export const WHATS_NEW_PAGE_ID = "([^"]+)"$/m

/**
 * The page id this working tree carries.
 *
 * Anchored and single-line on purpose: the file carries a long comment above the declaration, and a
 * declaration that had been reworded would make the release lie about what it shipped. No match —
 * throw, because "could not read it" must never be treated as "no page".
 */
const readWhatsNewPageId = (): string => {
  const raw = readFileSync(ADDON_WHATSNEW_PATH, "utf-8")
  const match = raw.match(WHATSNEW_PAGE_ID_PATTERN)
  if (!match || match[1] === undefined) {
    throw new Error(
      `Could not read WHATS_NEW_PAGE_ID from ${ADDON_WHATSNEW_PATH}. ` +
        'The id must stay a literal `export const WHATS_NEW_PAGE_ID = "..."` on one line.'
    )
  }
  return match[1]
}

/** The page id committed at HEAD, or null when the file did not exist then. */
const readCommittedWhatsNewPageId = (): string | null => {
  try {
    const raw = execSync(`git show HEAD:packages/addon/src/whatsNew.ts`, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"]
    })
    const match = raw.match(WHATSNEW_PAGE_ID_PATTERN)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * Whether this release ships a new page.
 *
 * This is derived, not declared: a page is "new" exactly when its id differs from the id committed
 * at HEAD. An unchanged id means the build carries the same page an earlier release already
 * shipped, so an existing installation sees nothing — which is the hotfix case. There is no second
 * flag to keep in sync with this, and nothing to forget to reset.
 */
const shipsNewWhatsNewPage = (): boolean => {
  const committed = readCommittedWhatsNewPageId()
  const working = readWhatsNewPageId()
  return committed !== working
}

// ────────────────────────────────────────────────────────────────────────────
// Shell execution
// ────────────────────────────────────────────────────────────────────────────

const run = (command: string, cwd?: string): void => {
  console.log(`\n> ${command}\n`)
  execSync(command, {
    stdio: "inherit",
    cwd: cwd ?? ROOT,
    env: { ...process.env }
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Arguments (non-interactive mode)
// ────────────────────────────────────────────────────────────────────────────

/**
 * The flags this script accepts.
 *
 * Parsed by hand rather than with a library: five flags and a strict refusal of anything unknown
 * does not justify a dependency, and an unknown flag must FAIL rather than be ignored — a caller that
 * typed `--bump minro` should not get a patch release because the typo fell through.
 */
type Args = {
  pkg?: Package
  bump?: BumpType
  /** An explicit target version, for a repo whose `package.json` fell behind what is published. */
  version?: string
  skipTests: boolean
  /** Open the what's-new page for this build. Asked every release; never inherited from last time. */
  yes: boolean
  dryRun: boolean
}

const USAGE = `usage: pnpm release [--package addon|android] [--bump patch|minor|major]
                    [--version X.Y.Z] [--skip-tests]
                    [--yes] [--dry-run]

With no flags the script asks interactively, exactly as before.`

const parseArgs = (argv: string[]): Args => {
  const args: Args = { skipTests: false, yes: false, dryRun: false }

  const need = (i: number, flag: string): string => {
    const v = argv[i + 1]
    if (v === undefined || v.startsWith("--")) {
      console.error(`Missing value for ${flag}\n\n${USAGE}`)
      process.exit(2)
    }
    return v
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case "--package":
      case "-p": {
        const v = need(i, a)
        if (v !== "addon" && v !== "android") {
          console.error(`Unknown package '${v}' — expected addon or android\n\n${USAGE}`)
          process.exit(2)
        }
        args.pkg = v
        i++
        break
      }
      case "--bump":
      case "-b": {
        const v = need(i, a)
        if (v !== "patch" && v !== "minor" && v !== "major") {
          console.error(`Unknown bump '${v}' — expected patch, minor or major\n\n${USAGE}`)
          process.exit(2)
        }
        args.bump = v
        i++
        break
      }
      case "--version": {
        const v = need(i, a)
        if (!/^\d+\.\d+\.\d+$/.test(v)) {
          console.error(`Invalid --version '${v}' — expected MAJOR.MINOR.PATCH\n\n${USAGE}`)
          process.exit(2)
        }
        args.version = v
        i++
        break
      }
      case "--skip-tests":
        args.skipTests = true
        break
      case "--yes":
      case "-y":
        args.yes = true
        break
      case "--dry-run":
        args.dryRun = true
        break
      case "--help":
      case "-h":
        console.log(USAGE)
        process.exit(0)
        break
      default:
        console.error(`Unknown argument '${a}'\n\n${USAGE}`)
        process.exit(2)
    }
  }

  if (args.version !== undefined && args.bump !== undefined) {
    console.error(`--version and --bump are alternatives; give one\n\n${USAGE}`)
    process.exit(2)
  }
  // Half a non-interactive invocation is a mistake, not a request for prompts: a caller that named
  // the package but not the target version would otherwise sit waiting on stdin forever.
  const hasTarget = args.bump !== undefined || args.version !== undefined
  if ((args.pkg === undefined) !== !hasTarget) {
    console.error(`--package and one of --bump/--version must be given together\n\n${USAGE}`)
    process.exit(2)
  }
  // Skipping tests without saying so out loud is refused: the confirmation is the only thing standing
  // between a hurried caller and an untested artifact in a store.
  if (args.skipTests && !args.yes && args.pkg !== undefined) {
    console.error(`--skip-tests requires --yes, which acknowledges the release is untested`)
    process.exit(2)
  }
  return args
}

// ────────────────────────────────────────────────────────────────────────────
// Prompts
// ────────────────────────────────────────────────────────────────────────────

/**
 * The version this release will produce, and a refusal when that version is not an increase.
 *
 * Kept as one function because two call sites need the same answer: `main` prints it in the dry-run
 * banner, `releaseAddon` writes it. When the validation lived only in `releaseAddon`, the banner
 * announced a target that the flow was about to refuse — an output that contradicts itself.
 */
const resolveTargetVersion = (currentVersion: string, bumpType: BumpType, explicit?: string): string => {
  const current = parseSemVer(currentVersion)
  if (explicit === undefined) return formatSemVer(bumpSemVer(current, bumpType))

  const target = parseSemVer(explicit)
  const cmp = target.major - current.major || target.minor - current.minor || target.patch - current.patch
  if (cmp <= 0) {
    console.error(`--version ${explicit} is not greater than the current ${currentVersion}; refusing`)
    process.exit(2)
  }
  return formatSemVer(target)
}

const promptForPackage = async (): Promise<Package> => {
  const addonVersion = readAddonVersion()
  const androidVersion = readAndroidVersion()

  const { pkg } = await inquirer.prompt<{ pkg: Package }>([
    {
      type: "list",
      name: "pkg",
      message: "Select package to release:",
      choices: [
        {
          name: `addon     (v${addonVersion})`,
          value: "addon"
        },
        {
          name: `android   (v${androidVersion})`,
          value: "android"
        }
      ]
    }
  ])

  return pkg
}

const promptForBumpType = async (pkg: Package, currentVersion: string): Promise<BumpType> => {
  const current = parseSemVer(currentVersion)

  const { bump } = await inquirer.prompt<{ bump: BumpType }>([
    {
      type: "list",
      name: "bump",
      message: `Bump type for ${pkg} (current: v${currentVersion}):`,
      choices: [
        {
          name: `patch   (v${currentVersion} -> v${formatSemVer(bumpSemVer(current, "patch"))})`,
          value: "patch"
        },
        {
          name: `minor   (v${currentVersion} -> v${formatSemVer(bumpSemVer(current, "minor"))})`,
          value: "minor"
        },
        {
          name: `major   (v${currentVersion} -> v${formatSemVer(bumpSemVer(current, "major"))})`,
          value: "major"
        }
      ]
    }
  ])

  return bump
}

// ────────────────────────────────────────────────────────────────────────────
// Release flows
// ────────────────────────────────────────────────────────────────────────────

const releaseAddon = async (bumpType: BumpType, args: Args): Promise<void> => {
  const currentVersion = readAddonVersion()
  // An explicit `--version` wins over the bump arithmetic: the repo's `package.json` can lag the
  // store (1.15.1 and 1.15.2 were published from this source without a bump landing here), so
  // "patch" from 1.15.0 collides with a version that is already live.
  const nextVersion = resolveTargetVersion(currentVersion, bumpType, args.version)
  // Derived from the page id, not asked and not stored: a changed id is the page, an unchanged id
  // is a build that ships the same page again and therefore shows nothing.
  const showWhatsNew = shipsNewWhatsNewPage()
  const whatsNewPageId = readWhatsNewPageId()

  console.log("\n========================================")
  console.log("  The Wall Addon - Release")
  console.log("========================================")
  console.log(`  ${currentVersion} -> ${nextVersion}`)
  console.log(`  What's new page: ${showWhatsNew ? "NEW" : "none (same page id)"} [${whatsNewPageId}]`)
  console.log("========================================\n")

  // Step 1: tests. `--skip-tests` decides it without a prompt; otherwise ask, as before.
  let runTests: boolean
  if (args.pkg !== undefined) {
    runTests = !args.skipTests
  } else {
    const answer = await inquirer.prompt<{ runTests: boolean }>([
      {
        type: "confirm",
        name: "runTests",
        message: "Run addon tests before release?",
        default: true
      }
    ])
    runTests = answer.runTests
  }

  if (runTests) {
    console.log("[1/5] Running addon tests...")
    if (!args.dryRun) run("pnpm test:addon")
  } else {
    // Loud, not quiet: an untested release is a fact the transcript should carry.
    console.log("[1/5] SKIPPING TESTS (--skip-tests)")
  }

  // Step 2: Bump version in package.json
  console.log("\n[2/5] Bumping version...")
  const raw = readFileSync(ADDON_PKG_PATH, "utf-8")
  const pkg = JSON.parse(raw) as Record<string, unknown>

  if (pkg["version"] !== currentVersion) {
    throw new Error(
      `Version mismatch: expected "${currentVersion}" but found "${String(pkg["version"])}" in package.json. Was it modified during the release?`
    )
  }

  if (args.dryRun) {
    console.log(`  (dry run) would write ${nextVersion} to ${ADDON_PKG_PATH}`)
  } else {
    pkg["version"] = nextVersion
    writeFileSync(ADDON_PKG_PATH, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
    console.log(`  Updated ${ADDON_PKG_PATH}`)
  }

  // Step 3: confirm what the build will say about the page, without writing anything. The page id
  // is the source of truth and it was already edited by hand in the same commit as the copy.
  console.log("\n[3/5] Checking what's-new page...")
  console.log(`  Page id: ${whatsNewPageId}`)
  console.log(`  This release ships a new page: ${showWhatsNew ? "yes" : "no"}`)

  // Step 4: Build + package all browsers
  console.log("\n[4/5] Building and packaging all browsers...")
  if (args.dryRun) {
    console.log("  (dry run) would run: pnpm --filter @theWallProject/addon run package")
  } else {
    run("pnpm --filter @theWallProject/addon run package")
  }

  // Step 5: Open browser store dashboards for upload
  const CHROME_DASHBOARD =
    "https://chrome.google.com/u/1/webstore/devconsole/d286da10-f0e5-4eca-bb9e-e79fa3c8e029/kocebhffdnlgdahkbfeopdokcoikipam/edit/package"
  const FIREFOX_DASHBOARD = "https://addons.mozilla.org/en-US/developers/addon/the-wall-boycott-assistant/edit"

  console.log("\n[5/5] Opening store dashboards...")
  console.log(`  Chrome: ${CHROME_DASHBOARD}`)
  console.log(`  Firefox: ${FIREFOX_DASHBOARD}`)

  // Cross-platform open: 'start' on Windows, 'open' on macOS, 'xdg-open' on Linux
  const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open"
  try {
    execSync(`${openCmd} ${CHROME_DASHBOARD}`, { stdio: "ignore" })
    execSync(`${openCmd} ${FIREFOX_DASHBOARD}`, { stdio: "ignore" })
  } catch {
    // Non-fatal — just print the URLs if opening fails
    console.log("  (Could not open browser automatically — use the URLs above)")
  }

  // Done
  console.log("\n========================================")
  // A dry run built nothing. Saying "release complete" over a run that wrote no file and produced no
  // package is the kind of output that gets trusted and then discovered later.
  console.log(args.dryRun ? "  Addon release DRY RUN — nothing written" : "  Addon release complete!")
  console.log("========================================")
  console.log(`  Version: v${nextVersion}`)
  console.log(`  What's new page: ${showWhatsNew ? "ON" : "OFF"}`)
  console.log(args.dryRun ? "  Packages: none (dry run)" : "  Packages built for: Chrome, Firefox, Edge, Opera")
  console.log("========================================\n")
}

const releaseAndroid = async (bumpType: BumpType): Promise<void> => {
  const currentVersion = readAndroidVersion()
  const current = parseSemVer(currentVersion)
  const next = bumpSemVer(current, bumpType)
  const nextVersion = formatSemVer(next)

  console.log("\n========================================")
  console.log("  The Wall Android - Release")
  console.log("========================================")
  console.log(`  ${currentVersion} -> ${nextVersion}`)
  console.log(`  Delegating to release.sh --bump ${bumpType}`)
  console.log("========================================\n")

  run(`pnpm --filter @theWallProject/android release:${bumpType}`, ROOT)

  // Open Play Console for upload
  const PLAY_CONSOLE =
    "https://play.google.com/console/u/1/developers/8180178620581983549/app/4973169596895167459/tracks/open-testing"

  console.log("\nOpening Play Console...")
  console.log(`  ${PLAY_CONSOLE}`)

  const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open"
  try {
    execSync(`${openCmd} ${PLAY_CONSOLE}`, { stdio: "ignore" })
  } catch {
    console.log("  (Could not open browser automatically — use the URL above)")
  }

  console.log("\n========================================")
  console.log("  Android release complete!")
  console.log("========================================")
  console.log(`  Version: v${nextVersion}`)
  console.log("========================================\n")
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2))

  console.log("\n========================================")
  console.log("  The Wall - Release")
  console.log("========================================\n")

  // Flags given: no prompts at all. Flags absent: the original interactive flow, untouched — so
  // `pnpm release` by hand behaves exactly as it did before this mode existed.
  const pkg = args.pkg ?? (await promptForPackage())
  const currentVersion = readPackageVersion(pkg)
  const bumpType = args.bump ?? (args.version ? "patch" : await promptForBumpType(pkg, currentVersion))

  // Resolved here as well so a refused target is refused before the banner claims it.
  const target = resolveTargetVersion(currentVersion, bumpType, args.version)

  if (args.dryRun) {
    const whatsNew = pkg === "addon" && shipsNewWhatsNewPage() ? "NEW page" : "no new page"
    console.log(
      `DRY RUN: ${pkg} ${currentVersion} -> ${target}, ` +
        `tests ${args.skipTests ? "SKIPPED" : "run"}, what's-new ${whatsNew}, ` +
        `nothing written.\n`
    )
  }

  switch (pkg) {
    case "addon":
      await releaseAddon(bumpType, args)
      break
    case "android":
      await releaseAndroid(bumpType)
      break
    default: {
      const _exhaustive: never = pkg
      throw new Error(`Unknown package: ${_exhaustive}`)
    }
  }
}

main().catch((err: unknown) => {
  // Graceful exit on Ctrl+C / closed prompt
  if (err && typeof err === "object" && "name" in err && err.name === "ExitPromptError") {
    console.log("\nAborted.")
    process.exit(0)
  }

  console.error("\nRelease failed:", err)
  process.exit(1)
})
