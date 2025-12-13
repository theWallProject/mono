#!/usr/bin/env tsx
import { spawnSync } from "child_process"
import { createHash } from "crypto"
import { existsSync } from "fs"
import { readFile, rename, writeFile } from "fs/promises"
import { join, relative } from "path"
import kleur from "kleur"
import prompts from "prompts"
import { z } from "zod"

const CACHE_FILE = ".eslint-warnings-cache.json"
const CACHE_VERSION = "1.1" // Bumped for config hash support

interface WarningFingerprint {
  file: string
  ruleId: string
  codeHash: string
  message: string
}

interface CacheFile {
  version: string
  eslintConfigHash: string
  approvedWarnings: WarningFingerprint[]
}

interface ESLintMessage {
  ruleId: string | null
  severity: number
  message: string
  line: number
  column: number
  endLine?: number
  endColumn?: number
  source?: string
}

interface ESLintFileResult {
  filePath: string
  messages: ESLintMessage[]
  suppressedMessages?: ESLintMessage[]
  errorCount: number
  warningCount: number
  fatalErrorCount?: number
  fixableErrorCount?: number
  fixableWarningCount?: number
  usedDeprecatedRules?: unknown[]
}

// Zod schemas for runtime validation
const warningFingerprintSchema = z.object({
  file: z.string(),
  ruleId: z.string(),
  codeHash: z.string(),
  message: z.string()
})

const cacheFileSchema = z.object({
  version: z.string(),
  eslintConfigHash: z.string(),
  approvedWarnings: z.array(warningFingerprintSchema)
})

const eslintMessageSchema = z.object({
  ruleId: z.string().nullable(),
  severity: z.number(),
  message: z.string(),
  line: z.number(),
  column: z.number(),
  endLine: z.number().optional(),
  endColumn: z.number().optional(),
  source: z.string().optional()
})

const eslintFileResultSchema = z.object({
  filePath: z.string(),
  messages: z.array(eslintMessageSchema),
  suppressedMessages: z.array(eslintMessageSchema).optional(),
  errorCount: z.number(),
  warningCount: z.number(),
  fatalErrorCount: z.number().optional(),
  fixableErrorCount: z.number().optional(),
  fixableWarningCount: z.number().optional(),
  usedDeprecatedRules: z.array(z.unknown()).optional()
})

function computeCodeHash(lineContent: string): string {
  const trimmed = lineContent.trim()
  return createHash("sha256").update(trimmed).digest("hex")
}

async function readSourceLine(filePath: string, lineNumber: number): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8")
    const lines = content.split("\n")
    if (lineNumber > 0 && lineNumber <= lines.length) {
      return lines[lineNumber - 1] // ESLint uses 1-indexed lines
    }
    return ""
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error}`)
    return ""
  }
}

async function readSourceContext(
  filePath: string,
  lineNumber: number,
  contextLines: number = 3
): Promise<{ line: string; context: string[] }> {
  try {
    const content = await readFile(filePath, "utf-8")
    const lines = content.split("\n")
    if (lineNumber > 0 && lineNumber <= lines.length) {
      const startLine = Math.max(0, lineNumber - contextLines - 1) // -1 because ESLint uses 1-indexed
      const endLine = Math.min(lines.length, lineNumber + contextLines)
      const context = lines.slice(startLine, endLine)
      const line = lines[lineNumber - 1]
      return { line, context }
    }
    return { line: "", context: [] }
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error}`)
    return { line: "", context: [] }
  }
}

function createFingerprint(
  filePath: string,
  ruleId: string | null,
  message: string,
  lineContent: string
): WarningFingerprint {
  const relativePath = relative(process.cwd(), filePath).replace(/\\/g, "/")
  const codeHash = computeCodeHash(lineContent)
  return {
    file: relativePath,
    ruleId: ruleId || "unknown",
    codeHash,
    message
  }
}

function fingerprintMatches(fp1: WarningFingerprint, fp2: WarningFingerprint): boolean {
  return (
    fp1.file === fp2.file && fp1.ruleId === fp2.ruleId && fp1.codeHash === fp2.codeHash && fp1.message === fp2.message
  )
}

/**
 * Detect and hash ESLint configuration files
 * Checks for: eslint.config.mjs, eslint.config.js, eslint.config.ts, .eslintrc.json, .eslintrc.js, .eslintrc.cjs
 */
async function detectAndHashEslintConfig(): Promise<string> {
  const configFiles = [
    "eslint.config.mjs",
    "eslint.config.js",
    "eslint.config.ts",
    ".eslintrc.json",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.yml",
    ".eslintrc.yaml"
  ]

  const foundConfigs: Array<{ path: string; content: string }> = []

  for (const configFile of configFiles) {
    const configPath = join(process.cwd(), configFile)
    if (existsSync(configPath)) {
      try {
        const content = await readFile(configPath, "utf-8")
        foundConfigs.push({ path: configFile, content })
      } catch (error) {
        console.warn(`Warning: Could not read ESLint config file ${configFile}: ${error}`)
      }
    }
  }

  if (foundConfigs.length === 0) {
    // No config found - return empty hash (shouldn't happen in practice)
    console.warn("Warning: No ESLint configuration file found!")
    return createHash("sha256").update("no-config").digest("hex")
  }

  // Sort by path for consistent hashing
  foundConfigs.sort((a, b) => a.path.localeCompare(b.path))

  // Create combined hash of all config files
  const hash = createHash("sha256")
  for (const config of foundConfigs) {
    hash.update(config.path)
    hash.update("\0") // Null separator
    hash.update(config.content)
    hash.update("\0")
  }

  return hash.digest("hex")
}

/**
 * Prompt user to confirm ESLint config changes
 */
async function confirmEslintConfigChange(oldHash: string, newHash: string): Promise<boolean> {
  console.log(`\n${kleur.yellow().bold("⚠️  ESLint Configuration Change Detected!")}\n`)
  console.log(`${kleur.dim("The ESLint configuration has changed since the last run.")}\n`)
  console.log(`${kleur.dim("Old config hash:")} ${kleur.gray(oldHash.substring(0, 16))}...`)
  console.log(`${kleur.dim("New config hash:")} ${kleur.gray(newHash.substring(0, 16))}...\n`)
  console.log(`${kleur.yellow("This could affect which warnings are detected.")}\n`)
  console.log(`${kleur.dim("Please review the ESLint config changes carefully.")}\n`)

  // Ensure stdin is ready
  if (process.stdin.isPaused()) {
    process.stdin.resume()
  }

  if (!process.stdin.isTTY) {
    console.error("\nERROR: stdin is not a TTY. Cannot prompt for confirmation.")
    console.error("This script requires an interactive terminal.")
    process.exit(1)
  }

  try {
    const response = await prompts(
      {
        type: "confirm",
        name: "confirmed",
        message: "Do you want to proceed with the new ESLint configuration?",
        initial: false, // Default to false for safety
        stdin: process.stdin,
        stdout: process.stdout
      },
      {
        onCancel: () => {
          console.log("\nCancelled by user. Exiting.")
          process.exit(1)
        }
      }
    )

    if (!response || typeof response !== "object" || !("confirmed" in response)) {
      console.error("\nERROR: No response received from prompt.")
      console.error("Exiting for safety.")
      process.exit(1)
    }

    return response.confirmed === true
  } catch (error) {
    console.error("\nERROR: Prompt failed:", error)
    console.error("Exiting for safety.")
    process.exit(1)
  }
}

async function loadCache(currentConfigHash: string): Promise<CacheFile> {
  try {
    const content = await readFile(CACHE_FILE, "utf-8")
    const parsed = cacheFileSchema.parse(JSON.parse(content))
    if (parsed.version !== CACHE_VERSION) {
      console.warn(`Warning: Cache version mismatch. Starting fresh.`)
      return { version: CACHE_VERSION, eslintConfigHash: currentConfigHash, approvedWarnings: [] }
    }
    // Ensure eslintConfigHash exists (for backward compatibility)
    if (!parsed.eslintConfigHash) {
      parsed.eslintConfigHash = currentConfigHash
    }
    return { ...parsed, eslintConfigHash: parsed.eslintConfigHash }
  } catch (error) {
    // Cache file doesn't exist or is corrupted - start fresh
    if (error instanceof Error && "code" in error && typeof error.code === "string") {
      if (error.code === "ENOENT") {
        return {
          version: CACHE_VERSION,
          eslintConfigHash: currentConfigHash,
          approvedWarnings: []
        }
      }
    }
    console.warn(`Warning: Could not read cache file: ${error}. Starting fresh.`)
    return { version: CACHE_VERSION, eslintConfigHash: currentConfigHash, approvedWarnings: [] }
  }
}

async function saveCache(cache: CacheFile): Promise<void> {
  const tempFile = `${CACHE_FILE}.tmp`
  try {
    // Write to temp file first
    await writeFile(tempFile, JSON.stringify(cache, null, 2) + "\n", "utf-8")
    // Atomic rename (works on both Unix and Windows)
    await rename(tempFile, CACHE_FILE)
  } catch (error) {
    // Clean up temp file on error
    try {
      const fs = await import("fs/promises")
      try {
        await fs.unlink(tempFile)
      } catch {
        // Ignore unlink errors
      }
    } catch {
      // Ignore import errors
    }
    throw new Error(`Failed to save cache file: ${error}`)
  }
}

/**
 * Stage the cache file in git if we're in a git repository
 */
async function stageCacheFileInGit(): Promise<void> {
  try {
    // Check if we're in a git repository
    const gitCheckResult = spawnSync("git", ["rev-parse", "--git-dir"], {
      encoding: "utf-8",
      cwd: process.cwd(),
      stdio: "pipe"
    })

    if (gitCheckResult.status !== 0) {
      // Not in a git repository, skip staging
      return
    }

    // Check if cache file has changes
    const statusResult = spawnSync("git", ["status", "--porcelain", CACHE_FILE], {
      encoding: "utf-8",
      cwd: process.cwd(),
      stdio: "pipe"
    })

    if (statusResult.status === 0 && statusResult.stdout.trim()) {
      // File has changes, stage it
      const addResult = spawnSync("git", ["add", CACHE_FILE], {
        encoding: "utf-8",
        cwd: process.cwd(),
        stdio: "pipe"
      })

      if (addResult.status === 0) {
        console.log(kleur.dim(`  → Cache file staged for commit`))
      } else {
        console.warn(kleur.yellow(`  ⚠ Warning: Could not stage cache file: ${addResult.stderr || "unknown error"}`))
      }
    }
  } catch (error) {
    console.error(`Error staging cache file in git:`, error)
    // Silently fail - git operations are optional
    // Don't break the script if git is not available or there's an error
  }
}

function runESLint(): ESLintFileResult[] {
  // Use spawnSync with shell: true for Windows PATH resolution
  // This ensures npx can be found even if not directly in PATH
  const result = spawnSync("npx eslint . --ext ts,tsx --format json --max-warnings 999999", [], {
    encoding: "utf-8",
    cwd: process.cwd(),
    stdio: ["inherit", "pipe", "pipe"],
    shell: true // Use shell for PATH resolution on Windows
  })

  // ESLint exits with non-zero when there are warnings/errors, but still outputs JSON to stdout
  // We need to check stdout first, as it contains the JSON even on non-zero exit
  if (result.stdout && result.stdout.trim()) {
    try {
      const parsed = z.array(eslintFileResultSchema).parse(JSON.parse(result.stdout))
      return parsed
    } catch (parseError) {
      // If we can't parse JSON, ESLint likely had a real error
      console.error("ESLint execution failed - could not parse JSON output:")
      if (parseError instanceof z.ZodError) {
        console.error("Zod validation error:", parseError.issues)
      } else {
        console.error("JSON parse error:", parseError)
      }
      console.error("Raw output:", result.stdout.substring(0, 500))
      if (result.stderr) {
        console.error("Stderr:", result.stderr)
      }
      process.exit(1)
    }
  }

  // No stdout available - real execution error
  console.error("Failed to run ESLint - no output received")
  if (result.stderr) {
    console.error("Stderr:", result.stderr)
  }
  if (result.error) {
    console.error("Error:", result.error)
  }
  process.exit(1)
}

async function processWarnings(): Promise<void> {
  // Detect current ESLint config
  const currentConfigHash = await detectAndHashEslintConfig()

  // Load cache and check for config changes
  const cache = await loadCache(currentConfigHash)

  // Check if ESLint config has changed
  if (cache.eslintConfigHash !== currentConfigHash) {
    const confirmed = await confirmEslintConfigChange(cache.eslintConfigHash, currentConfigHash)
    if (!confirmed) {
      console.log(kleur.red("\n❌ ESLint config change not confirmed. Exiting."))
      process.exit(1)
    }
    console.log(kleur.green("\n✓ ESLint config change confirmed. Proceeding...\n"))
    // Update cache with new config hash
    cache.eslintConfigHash = currentConfigHash
  }

  console.log(kleur.blue("Running ESLint on entire project..."))
  const eslintResults = runESLint()

  // Collect all warnings
  const warnings: Array<{
    fingerprint: WarningFingerprint
    filePath: string
    line: number
    column: number
    ruleId: string
    message: string
    codeSnippet: string
    codeContext: string[]
  }> = []

  for (const result of eslintResults) {
    for (const msg of result.messages) {
      if (msg.severity === 1) {
        // It's a warning
        const lineContent = msg.source || (await readSourceLine(result.filePath, msg.line))
        const sourceContext = await readSourceContext(result.filePath, msg.line, 3)
        const fingerprint = createFingerprint(result.filePath, msg.ruleId, msg.message, lineContent)

        warnings.push({
          fingerprint,
          filePath: result.filePath,
          line: msg.line,
          column: msg.column,
          ruleId: msg.ruleId || "unknown",
          message: msg.message,
          codeSnippet: lineContent.trim(),
          codeContext: sourceContext.context
        })
      }
    }
  }

  if (warnings.length === 0) {
    console.log(kleur.green("✓ No ESLint warnings found."))
    // Still save cache to update config hash if needed
    await saveCache(cache)
    return
  }

  console.log(
    `Found ${kleur.yellow().bold(warnings.length.toString())} ${kleur.yellow("warning(s)")}. Checking against cache...`
  )

  // Find new warnings
  const newWarnings = warnings.filter(
    (w) => !cache.approvedWarnings.some((approved: WarningFingerprint) => fingerprintMatches(approved, w.fingerprint))
  )

  if (newWarnings.length === 0) {
    console.log(kleur.green("✓ All warnings are already approved."))
    return
  }

  console.log(
    `\nFound ${kleur.cyan().bold(newWarnings.length.toString())} ${kleur.yellow("new warning(s)")} that need approval:\n`
  )

  // Collect rejected warnings to show at the end
  const rejectedWarnings: Array<{
    file: string
    line: number
    column: number
    ruleId: string
    message: string
    codeSnippet: string
    codeContext: string[]
  }> = []

  // Process each new warning
  for (let i = 0; i < newWarnings.length; i++) {
    const warning = newWarnings[i]
    console.log(`\n[${kleur.cyan().bold(`${i + 1}/${newWarnings.length}`)}] ${kleur.yellow().bold("Warning")}:`)
    console.log(
      `  ${kleur.dim("File")}: ${kleur.cyan(warning.fingerprint.file)}:${kleur.cyan().bold(warning.line.toString())}:${kleur.cyan().bold(warning.column.toString())}`
    )
    console.log(`  ${kleur.dim("Rule")}: ${kleur.magenta(warning.ruleId)}`)
    console.log(`  ${kleur.dim("Message")}: ${kleur.white(warning.message)}`)

    // Show code context if available
    if (warning.codeContext && warning.codeContext.length > 0) {
      const contextStartLine = Math.max(1, warning.line - 3)
      console.log(`  ${kleur.dim("Code context")}:`)
      warning.codeContext.forEach((contextLine, idx) => {
        const lineNum = contextStartLine + idx
        const isWarningLine = lineNum === warning.line
        const marker = isWarningLine ? kleur.red().bold(">>>") : kleur.dim("   ")
        const lineNumColor = isWarningLine ? kleur.red().bold : kleur.dim
        const codeColor = isWarningLine ? kleur.red : kleur.gray
        console.log(
          `  ${marker} ${lineNumColor(lineNum.toString().padStart(4, " "))} ${kleur.dim("|")} ${codeColor(contextLine)}`
        )
      })
    } else if (warning.codeSnippet) {
      console.log(`  ${kleur.dim("Code")}: ${kleur.gray(warning.codeSnippet)}`)
    } else {
      console.log(`  ${kleur.dim("Code")}: ${kleur.dim("(no code available)")}`)
    }

    // Use prompts with explicit stdin handling
    // CRITICAL: We need to ensure prompts actually waits for input
    // If stdin isn't available, prompts might return immediately with undefined or empty object
    let response: { action?: string } | undefined

    // CRITICAL: Ensure stdin is readable and resume it if paused
    if (process.stdin.isPaused()) {
      process.stdin.resume()
    }

    // Ensure stdin is in the right mode for prompts
    if (!process.stdin.isTTY) {
      // If not a TTY, we can't prompt - fail fast
      console.error("\nERROR: stdin is not a TTY. Cannot prompt for approval.")
      console.error("This script requires an interactive terminal.")
      process.exit(1)
    }

    try {
      response = await prompts(
        {
          type: "select",
          name: "action",
          message: "What would you like to do? (REQUIRED - script will fail if no input)",
          choices: [
            { title: "✓ Approve (mark as approved)", value: "approve" },
            { title: "✗ Reject (will show all rejections at end)", value: "reject" },
            { title: "→ Skip for now (ask again next time)", value: "skip" }
          ],
          // Don't set initial - force user to make explicit choice
          stdin: process.stdin,
          stdout: process.stdout
        },
        {
          onCancel: () => {
            console.log("\nCancelled by user. Commit aborted.")
            process.exit(1)
          }
        }
      )
    } catch (error) {
      console.error("\nERROR: Prompt failed:", error)
      console.error("This likely means stdin is not properly connected.")
      console.error("Commit aborted for safety.")
      process.exit(1)
    }

    // Fail fast if no response - this happens when stdin isn't available (e.g., non-interactive git hook)
    // CRITICAL: Check for undefined, null, empty object, or missing action property
    if (!response || typeof response !== "object" || !("action" in response)) {
      console.error("\nERROR: No response received from prompt.")
      console.error("Response received:", JSON.stringify(response))
      console.error("This likely means stdin is not properly connected or not interactive.")
      console.error("Please ensure your git hook runs in an interactive terminal,")
      console.error("or run 'npm run lint:check-warnings' manually before committing.")
      console.error("\nNew warnings found:")
      for (const warning of newWarnings.slice(i)) {
        console.error(
          `  - ${warning.fingerprint.file}:${warning.line}:${warning.column} - ${warning.ruleId}: ${warning.message}`
        )
      }
      process.exit(1)
    }

    const action = response.action

    // CRITICAL: Validate action is a non-empty string and is one of the valid values
    if (typeof action !== "string" || action.length === 0) {
      console.error(`\nERROR: Invalid or empty action received: ${JSON.stringify(action)}`)
      console.error("Response object:", JSON.stringify(response))
      console.error("This likely means prompts didn't wait for user input.")
      console.error("Commit aborted for safety.")
      process.exit(1)
    }

    if (!["approve", "reject", "skip"].includes(action)) {
      console.error(`\nERROR: Invalid action value: ${action}`)
      console.error("Expected one of: approve, reject, skip")
      console.error("Commit aborted for safety.")
      process.exit(1)
    }

    if (action === "approve") {
      cache.approvedWarnings.push(warning.fingerprint)
      // Save cache immediately after approval
      await saveCache(cache)
      // Stage cache file in git if in a git repository
      await stageCacheFileInGit()
      console.log(kleur.green("  ✓ Approved and saved to cache"))
    } else if (action === "reject") {
      rejectedWarnings.push({
        file: warning.fingerprint.file,
        line: warning.line,
        column: warning.column,
        ruleId: warning.ruleId,
        message: warning.message,
        codeSnippet: warning.codeSnippet,
        codeContext: warning.codeContext
      })
      console.log(kleur.red("  ✗ Rejected (will be shown at end)"))
      // Continue to next warning instead of exiting
    } else if (action === "skip") {
      console.log(kleur.yellow("  → Skipped"))
      // Continue to next warning
    } else {
      console.log(kleur.red("\nUnknown action. Commit aborted."))
      process.exit(1)
    }
  }

  // After processing all warnings, check if any were rejected
  if (rejectedWarnings.length > 0) {
    console.log(`\n\n${kleur.red().bold("=".repeat(80))}`)
    console.log(
      kleur
        .red()
        .bold(
          `❌ COMMIT ABORTED: ${kleur.yellow().bold(rejectedWarnings.length.toString())} ${kleur.yellow("warning(s)")} were rejected`
        )
    )
    console.log(kleur.red().bold("=".repeat(80)) + "\n")

    // Print AI-friendly message with all rejected warnings
    console.log(kleur.yellow().bold("Here are the ESLint warnings that need to be fixed:\n"))

    for (let i = 0; i < rejectedWarnings.length; i++) {
      const w = rejectedWarnings[i]
      console.log(
        `${kleur.cyan().bold(`${i + 1}.`)} ${kleur.cyan(w.file)}:${kleur.cyan().bold(w.line.toString())}:${kleur.cyan().bold(w.column.toString())}`
      )
      console.log(`   ${kleur.dim("Rule")}: ${kleur.magenta(w.ruleId)}`)
      console.log(`   ${kleur.dim("Message")}: ${kleur.white(w.message)}`)
      if (w.codeContext && w.codeContext.length > 0) {
        const contextStartLine = Math.max(1, w.line - 3)
        console.log(`   ${kleur.dim("Code context")}:`)
        w.codeContext.forEach((contextLine, idx) => {
          const lineNum = contextStartLine + idx
          const isWarningLine = lineNum === w.line
          const marker = isWarningLine ? kleur.red().bold(">>>") : kleur.dim("   ")
          const lineNumColor = isWarningLine ? kleur.red().bold : kleur.dim
          const codeColor = isWarningLine ? kleur.red : kleur.gray
          console.log(
            `   ${marker} ${lineNumColor(lineNum.toString().padStart(4, " "))} ${kleur.dim("|")} ${codeColor(contextLine)}`
          )
        })
      } else if (w.codeSnippet) {
        console.log(`   ${kleur.dim("Code")}: ${kleur.gray(w.codeSnippet)}`)
      }
      console.log("")
    }

    console.log(`${kleur.cyan().bold("=".repeat(80))}`)
    console.log(kleur.cyan().bold("AI-Friendly Fix Request:"))
    console.log(kleur.cyan().bold("=".repeat(80)) + "\n")
    console.log(kleur.yellow().bold("Please fix the following ESLint warnings:\n"))

    // Generate AI-friendly format with context
    const warningsList = rejectedWarnings
      .map((w, i) => {
        let codeSection = ""
        if (w.codeContext && w.codeContext.length > 0) {
          const contextStartLine = Math.max(1, w.line - 3)
          const contextLines = w.codeContext
            .map((line, idx) => {
              const lineNum = contextStartLine + idx
              const marker = lineNum === w.line ? ">>>" : "   "
              return `${marker} ${lineNum.toString().padStart(4, " ")} | ${line}`
            })
            .join("\n")
          codeSection = `\n   Code context:\n${contextLines}`
        } else if (w.codeSnippet) {
          codeSection = `\n   Current code: ${w.codeSnippet}`
        }
        return `${i + 1}. ${w.file}:${w.line}:${w.column}\n   Rule: ${w.ruleId}\n   Issue: ${w.message}${codeSection}`
      })
      .join("\n\n")

    console.log(warningsList)
    console.log(`\n${kleur.red().bold("=".repeat(80))}\n`)

    process.exit(1)
  }

  // Clean up cache: remove warnings that are no longer present (they've been fixed!)
  const currentWarningFingerprints = new Set(warnings.map((w) => JSON.stringify(w.fingerprint)))
  const originalCacheSize = cache.approvedWarnings.length
  cache.approvedWarnings = cache.approvedWarnings.filter((approved: WarningFingerprint) => {
    const approvedKey = JSON.stringify(approved)
    return currentWarningFingerprints.has(approvedKey)
  })
  const fixedCount = originalCacheSize - cache.approvedWarnings.length

  // Save updated cache
  await saveCache(cache)
  // Stage cache file in git if it has changes
  await stageCacheFileInGit()

  // Show summary
  if (fixedCount > 0) {
    console.log(`\n${"=".repeat(80)}`)
    console.log(`🎉 SUCCESS! ${fixedCount} warning(s) have been fixed!`)
    console.log(`${"=".repeat(80)}`)
    console.log(`\nGreat work! ${fixedCount} previously approved warning(s) are no longer present in the codebase.`)
    console.log("They've been automatically removed from the cache.\n")
  }

  if (newWarnings.length > 0) {
    const approvedCount = newWarnings.filter((w) =>
      cache.approvedWarnings.some((approved: WarningFingerprint) => fingerprintMatches(approved, w.fingerprint))
    ).length
    console.log(`\n✓ Cache updated:`)
    console.log(`  - ${approvedCount} new warning(s) approved`)
    console.log(`  - ${fixedCount} warning(s) fixed and removed from cache`)
    console.log(`  - Total approved warnings in cache: ${cache.approvedWarnings.length}`)
  } else {
    console.log(`\n✓ All warnings are already approved.`)
    if (fixedCount > 0) {
      console.log(`  - ${fixedCount} warning(s) fixed and removed from cache`)
    }
  }
}

// Main execution
;(async () => {
  try {
    await processWarnings()
  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  } finally {
    // Restore stdin if we modified it
    if (process.stdin.setRawMode) {
      try {
        process.stdin.setRawMode(false)
      } catch {
        // Ignore errors when restoring
      }
    }
  }
})()
