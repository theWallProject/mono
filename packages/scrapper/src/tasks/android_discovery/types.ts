/** Result from a single discovery strategy for one company */
export type StrategyResult = {
  readonly packages: readonly string[]
  readonly rawCount: number
  readonly filteredCount: number
}

/** A single checkpoint entry in the JSONL file */
export type CheckpointEntry = {
  readonly company: string
  readonly domain: string
  readonly stage: string
  readonly ts: number
  readonly result: StrategyResult
}

/** Final discovery result for a company after all strategies */
export type DiscoveryResult = {
  readonly company: string
  readonly domain: string
  readonly packages: readonly string[]
  readonly source: "assetlinks" | "homepage" | "playstore"
  readonly autoAccepted: boolean
}

/** Summary report for a pipeline run */
export type RunReport = {
  readonly runId: string
  readonly startedAt: string
  readonly completedAt: string
  readonly totalCompanies: number
  readonly fetchedSuccessfully: number
  readonly noAssetlinks: number
  readonly errors: number
  readonly autoAccepted: number
  readonly rejected: number
  readonly newEntriesWritten: number
  readonly existingEntriesEnriched: number
}

/** Company entry extracted from ALL.json for processing */
export type CompanyEntry = {
  readonly name: string
  readonly website: string
  readonly reasons: readonly string[]
}

