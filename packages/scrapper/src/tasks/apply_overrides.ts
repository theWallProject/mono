/**
 * Script to apply manual overrides to output files
 * Runs the update steps (merge, extract, final) without any prompts
 */

import { error, log } from "../helper"
import { runUpdateSteps } from "../index"

async function main() {
  log("🔄 Applying manual overrides to output files...")
  log(
    "This will regenerate ALL.json and other output files with latest manualOverrides.ts"
  )

  try {
    // Run update steps without any prompts (skip scraping, validation, copy to addon)
    await runUpdateSteps({
      shouldScrap: false,
      shouldValidate: false,
      shouldCopyToAddon: false
    })

    log("\n✅ Successfully applied manual overrides!")
    log("Updated files:")
    log("  - results/2_merged/2_MERGED_ALL.json")
    log("  - results/3_networks/*.json")
    log("  - results/4_final/ALL.json")
    process.exit(0)
  } catch (err) {
    error("❌ Failed to apply manual overrides:", err)
    process.exit(1)
  }
}

main()
