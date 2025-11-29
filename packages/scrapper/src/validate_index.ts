import { execSync } from "child_process"
import * as readline from "readline"

import { error, log } from "./helper"
import { run as validateUrls } from "./tasks/validate_urls"

process.on("unhandledRejection", (reason) => {
  error("VALIDATE_ERROR Unhandled Rejection:", reason)
  throw new Error("VALIDATE_ERROR Unhandled Rejection")
})

process.on("uncaughtException", (err) => {
  error("VALIDATE_ERROR Uncaught Exception:", err)
  throw new Error("VALIDATE_ERROR Uncaught Exception")
})

const main = async () => {
  try {
    await validateUrls()
  } catch (err) {
    error("Validation error:", err)
    // Still try to apply overrides even if validation had errors
  }

  // Wait for user confirmation before applying overrides
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise<void>((resolve) => {
    rl.question(
      "\n❓ Apply manual overrides to output files? (y/n): ",
      (answer) => {
        rl.close()
        const shouldApply =
          answer.trim().toLowerCase() === "y" ||
          answer.trim().toLowerCase() === "yes"

        if (!shouldApply) {
          log(
            "⏭️  Skipping apply-overrides. Run 'pnpm run apply-overrides' manually when ready."
          )
          process.exit(0)
          return
        }

        // Run apply-overrides after user confirmation
        log("\n🔄 Applying manual overrides to output files...")
        try {
          execSync("pnpm run apply-overrides", {
            stdio: "inherit",
            cwd: process.cwd()
          })
          log("✅ All files updated successfully!")
          process.exit(0)
        } catch (err) {
          error(
            "⚠️  Failed to apply overrides. Run 'pnpm run apply-overrides' manually."
          )
          process.exit(1)
        }
        resolve()
      }
    )
  })
}

main()
