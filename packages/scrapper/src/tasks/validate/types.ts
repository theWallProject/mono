import { CrunchbaseScrappedItemType, ManualOverrideFields } from "../../types"

/** Manually verified by a human through the browser workflow */
export type ProcessedState = {
  _processed: true
}

/** Auto-extracted by the Homepage AI Extractor — not yet human-verified */
export type AutoExtractedState = {
  _processed: "auto"
}

/** Discovered via assetlinks.json probe — not yet human-verified */
export type AssetlinksExtractedState = {
  _processed: "assetlinks"
}

export type ManualOverrideValue =
  | (ManualOverrideFields & ProcessedState)
  | ProcessedState
  | (ManualOverrideFields & AutoExtractedState)
  | AutoExtractedState
  | (ManualOverrideFields & AssetlinksExtractedState)
  | AssetlinksExtractedState
  | ManualOverrideFields

export type OverrideWithUrls = {
  ws?: string | string[]
  li?: string | string[]
  fb?: string | string[]
  tw?: string | string[]
  ig?: string | string[]
  gh?: string | string[]
  ytp?: string | string[]
  ytc?: string | string[]
  tt?: string | string[]
  th?: string | string[]
  urls?: string[]
  android_app_ids?: string[]
}

export type CategorizedUrls = {
  ws?: string[]
  li?: string[]
  fb?: string[]
  tw?: string[]
  ig?: string[]
  gh?: string[]
  ytp?: string[]
  ytc?: string[]
  tt?: string[]
  th?: string[]
  urls?: string[] // Unsupported URLs only
  android_app_ids?: string[] // Android app package IDs extracted from Play Store URLs
}

/** Returns true only for human-verified entries (_processed: true) */
export const isProcessed = (
  value: ManualOverrideValue
): value is ProcessedState | (Partial<CrunchbaseScrappedItemType> & ProcessedState) => {
  return typeof value === "object" && value !== null && "_processed" in value && value._processed === true
}

/** Returns true only for auto-extracted entries (_processed: "auto") */
export const isAutoExtracted = (
  value: ManualOverrideValue
): value is AutoExtractedState | (ManualOverrideFields & AutoExtractedState) => {
  return typeof value === "object" && value !== null && "_processed" in value && value._processed === "auto"
}

/** Returns true only for assetlinks-discovered entries (_processed: "assetlinks") */
export const isAssetlinksExtracted = (
  value: ManualOverrideValue
): value is AssetlinksExtractedState | (ManualOverrideFields & AssetlinksExtractedState) => {
  return typeof value === "object" && value !== null && "_processed" in value && value._processed === "assetlinks"
}
