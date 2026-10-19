/**
 * Git integration for the Homepage AI Extractor batch mode.
 *
 * Provides safety checks (branch, clean state) and per-company auto-commit
 * so each company's extraction result is an atomic, revertable commit.
 *
 * Design philosophy: fail hard and early. Every unexpected state is a fatal
 * error that aborts the batch immediately. No warnings, no silent skips.
 */

import { execSync } from "child_process"

import { log } from "../../helper"

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const PROTECTED_BRANCHES = ["main", "master"] as const
// `git add .` from the monorepo root scans a multi-GB working tree (per-company
// logs + regenerated DB files). 30s was too tight under load (batch + chromium +
// LLM inference) and execSync kills the process on timeout, aborting the batch.
const GIT_TIMEOUT_MS = 180_000

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Resolve the monorepo root once (git rev-parse --show-toplevel). Cached. */
let _repoRoot: string | null = null

const getRepoRoot = (): string => {
  if (_repoRoot) return _repoRoot

  try {
    _repoRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
      timeout: GIT_TIMEOUT_MS,
      stdio: ["pipe", "pipe", "pipe"]
    }).trim()
    return _repoRoot
  } catch (err) {
    throw new Error(
      `Fatal: not inside a git repository (or git is not installed).\n` +
        `Underlying error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

/**
 * Execute a git command from the monorepo root.
 * Throws on non-zero exit code with full context.
 */
const git = (args: string): string => {
  const cwd = getRepoRoot()

  try {
    return execSync(`git ${args}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT_MS,
      stdio: ["pipe", "pipe", "pipe"]
    }).trim()
  } catch (err) {
    throw new Error(
      `Fatal: git command failed: git ${args}\n` +
        `cwd: ${cwd}\n` +
        `Error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Assert all git preconditions before batch processing begins.
 * Throws on ANY violation — fail hard and early.
 *
 * Checks (in order):
 *  1. Inside a git repository
 *  2. Not on a protected branch (main/master)
 *  3. Not in detached HEAD state
 *  4. Working tree is completely clean (no untracked, no staged, no unstaged)
 */
export const assertGitPreconditions = (): void => {
  log("Git precondition checks...")

  // 1. Inside a git repo (getRepoRoot throws if not)
  const root = getRepoRoot()
  log(`  Repository root: ${root}`)

  // 2. Branch check
  const branch = git("branch --show-current")

  if (!branch) {
    throw new Error(
      "Fatal: detached HEAD state. Checkout a branch before running batch mode.\n" +
        "Example: git checkout -b data/homepage-extract"
    )
  }

  const protectedSet: ReadonlySet<string> = new Set(PROTECTED_BRANCHES)
  if (protectedSet.has(branch)) {
    throw new Error(
      `Fatal: refusing to run on protected branch "${branch}".\n` +
        `Create a feature branch first: git checkout -b data/homepage-extract`
    )
  }
  log(`  Branch: ${branch} (OK)`)

  // 3. Clean working tree (--porcelain returns empty string if clean)
  const status = git("status --porcelain")

  if (status.length > 0) {
    const lines = status.split("\n")
    const preview = lines.slice(0, 10).join("\n")
    const suffix = lines.length > 10 ? `\n  ... and ${lines.length - 10} more` : ""

    throw new Error(
      `Fatal: working tree is not clean. Commit or stash all changes before running batch mode.\n` +
        `Dirty files:\n${preview}${suffix}`
    )
  }
  log("  Working tree: clean (OK)")

  log("Git preconditions passed.\n")
}

/**
 * Stage all changes and commit with a descriptive message for one company.
 *
 * @param companyName - The company that was just processed
 * @param success     - Whether extraction succeeded
 * @param errorType   - For failures, the error classification (e.g. "CLOUDFLARE_BLOCKED")
 *
 * Commit messages:
 *   Success: "homepage-extract: Tower Semiconductor"
 *   Failure: "homepage-extract-failed: D-ID - DNS_FAILURE"
 *
 * Note: WS_ONLY and NON_GREEN_LINKS results use success=true because the
 * extraction itself succeeded — they're added to the retry list for manual
 * review, but the commit title should reflect that data was extracted.
 *
 * Throws on git failures. When there is nothing staged (a same-name company
 * produced byte-identical data), it logs a NO-OP marker and returns instead of
 * aborting — the batch tracks and continues. See same_name_collisions tracking
 * in run.ts / the batch log.
 */
export const commitCompanyResult = (
  companyName: string,
  success: boolean,
  errorType?: string
): void => {
  // Stage modifications to tracked files only. The batch never creates new
  // tracked files (per-company logs are gitignored), and `git add .` walks the
  // entire multi-GB working tree — which can stall and trip the execSync
  // timeout under load (observed: intermittent fatal `git add .` aborts).
  // `-u` restricts staging to tracked paths (manualOverrides.ts, retry_list.json,
  // regenerated ALL.json copies).
  git("add -u")

  // Check whether anything is staged. Nothing staged = the extraction produced
  // byte-identical data (typically a second entry sharing the same company
  // name — overrides are keyed by name). That is not data loss, so skip the
  // commit and continue rather than aborting the whole run.
  try {
    git("diff --cached --quiet")
    log(
      `  NO-OP: no changes for "${companyName}" — identical to existing override (same-name collision); skipping commit`
    )
    return
  } catch (err) {
    // Exit code 1 from `git diff --cached --quiet` means there ARE staged
    // changes — the happy path. Re-throw any non-"failed command" error.
    if (err instanceof Error && !err.message.startsWith("Fatal: git command failed")) {
      throw err
    }
  }

  // Build commit message
  const message = success
    ? `homepage-extract: ${companyName}`
    : `homepage-extract-failed: ${companyName} - ${errorType ?? "UNKNOWN"}`

  // Commit with --no-verify to skip hooks for speed.
  // Escape double quotes in company names (e.g. companies with quotes in their name).
  const escapedMessage = message.replace(/"/g, '\\"')
  git(`commit --no-verify -m "${escapedMessage}"`)

  log(`  Committed: ${message}`)
}
