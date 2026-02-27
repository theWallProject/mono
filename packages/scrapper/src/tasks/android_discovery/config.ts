/** Pipeline configuration */
export const CONFIG = {
  /** Max concurrent assetlinks fetches (each to a different domain) */
  concurrency: 8,

  /** Timeout for each HTTP fetch in milliseconds */
  fetchTimeoutMs: 10_000,

  /** Delay between batches to be respectful */
  batchDelayMs: 200,

  /** Save to manualOverrides every N companies */
  saveInterval: 20,

  /** Google DAL API base URL */
  dalApiUrl: "https://digitalassetlinks.googleapis.com/v1/statements:list",

  /** DAL API relation parameter */
  dalRelation: "delegate_permission/common.handle_all_urls",

  /** Results output directory */
  resultsDir: "results/android_discovery",

  /** Checkpoint filename */
  checkpointFile: "checkpoint.jsonl"
} as const
