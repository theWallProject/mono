/**
 * Top-level release command for The Wall monorepo.
 *
 * Interactive CLI that orchestrates releases for individual packages:
 *   - addon:   bump version in package.json, run tests, build + package all browsers
 *   - android: delegate to the existing release.sh script
 *
 * Usage: pnpm release
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
const ANDROID_VERSION_PATH = resolve(
  ROOT,
  "packages/android/version.properties"
)

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
      throw new Error(
        `Invalid semver: "${version}" — "${p}" is not a valid number`
      )
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
    throw new Error(
      `Could not read version from ${ADDON_PKG_PATH} — "version" field is missing or empty`
    )
  }

  // Validate it parses correctly
  parseSemVer(pkg.version)
  return pkg.version
}

const readAndroidVersion = (): string => {
  const raw = readFileSync(ANDROID_VERSION_PATH, "utf-8")
  const match = raw.match(/^VERSION_NAME=(.+)$/m)

  if (!match || !match[1]) {
    throw new Error(
      `Could not read VERSION_NAME from ${ANDROID_VERSION_PATH}`
    )
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
// Prompts
// ────────────────────────────────────────────────────────────────────────────

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

const promptForBumpType = async (
  pkg: Package,
  currentVersion: string
): Promise<BumpType> => {
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

const releaseAddon = async (bumpType: BumpType): Promise<void> => {
  const currentVersion = readAddonVersion()
  const current = parseSemVer(currentVersion)
  const next = bumpSemVer(current, bumpType)
  const nextVersion = formatSemVer(next)

  console.log("\n========================================")
  console.log("  The Wall Addon - Release")
  console.log("========================================")
  console.log(`  ${currentVersion} -> ${nextVersion}`)
  console.log("========================================\n")

  // Step 1: Optionally run tests
  const { runTests } = await inquirer.prompt<{ runTests: boolean }>([
    {
      type: "confirm",
      name: "runTests",
      message: "Run addon tests before release?",
      default: true
    }
  ])

  if (runTests) {
    console.log("[1/4] Running addon tests...")
    run("pnpm test:addon")
  } else {
    console.log("[1/4] Skipping tests")
  }

  // Step 2: Bump version in package.json
  console.log("\n[2/4] Bumping version...")
  const raw = readFileSync(ADDON_PKG_PATH, "utf-8")
  const pkg = JSON.parse(raw) as Record<string, unknown>

  if (pkg["version"] !== currentVersion) {
    throw new Error(
      `Version mismatch: expected "${currentVersion}" but found "${String(pkg["version"])}" in package.json. Was it modified during the release?`
    )
  }

  pkg["version"] = nextVersion
  writeFileSync(ADDON_PKG_PATH, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
  console.log(`  Updated ${ADDON_PKG_PATH}`)

  // Step 3: Build + package all browsers
  console.log("\n[3/4] Building and packaging all browsers...")
  run("pnpm --filter @theWallProject/addon run package")

  // Step 4: Open browser store dashboards for upload
  const CHROME_DASHBOARD = "https://chrome.google.com/u/1/webstore/devconsole/d286da10-f0e5-4eca-bb9e-e79fa3c8e029/kocebhffdnlgdahkbfeopdokcoikipam/edit/package"
  const FIREFOX_DASHBOARD = "https://addons.mozilla.org/en-US/developers/addon/the-wall-boycott-assistant/edit"

  console.log("\n[4/4] Opening store dashboards...")
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
  console.log("  Addon release complete!")
  console.log("========================================")
  console.log(`  Version: v${nextVersion}`)
  console.log("  Packages built for: Chrome, Firefox, Edge, Opera")
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

  run(
    `pnpm --filter @theWallProject/android release:${bumpType}`,
    ROOT
  )

  // Open Play Console for upload
  const PLAY_CONSOLE = "https://play.google.com/console/u/1/developers/8180178620581983549/app/4973169596895167459/tracks/open-testing"

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
  console.log("\n========================================")
  console.log("  The Wall - Release")
  console.log("========================================\n")

  const pkg = await promptForPackage()
  const currentVersion = readPackageVersion(pkg)
  const bumpType = await promptForBumpType(pkg, currentVersion)

  switch (pkg) {
    case "addon":
      await releaseAddon(bumpType)
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
  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    err.name === "ExitPromptError"
  ) {
    console.log("\nAborted.")
    process.exit(0)
  }

  console.error("\nRelease failed:", err)
  process.exit(1)
})
