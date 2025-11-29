import { log } from "../helper"
import { runUpdateSteps } from "../index"

// Run the pipeline without scraping, validation, or copying to addon
// This ensures hints are merged into the database
;(async () => {
  try {
    log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Starting database regeneration...")
    await runUpdateSteps({
      shouldScrap: false,
      shouldValidate: false,
      shouldCopyToAddon: false
    })
    log(
      ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Database regeneration completed successfully"
    )
    process.exit(0)
  } catch (error) {
    log(`Error regenerating database: ${error}`)
    console.error("Error regenerating database:", error)
    process.exit(1)
  }
})()
