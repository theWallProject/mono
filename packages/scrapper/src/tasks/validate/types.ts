import { CrunchbaseScrappedItemType, ManualOverrideFields } from "../../types"

export type ProcessedState = {
  _processed: true
}

export type ManualOverrideValue = (ManualOverrideFields & ProcessedState) | ProcessedState | ManualOverrideFields

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
}

export const isProcessed = (
  value: ManualOverrideValue
): value is ProcessedState | (Partial<CrunchbaseScrappedItemType> & ProcessedState) => {
  return typeof value === "object" && value !== null && "_processed" in value && value._processed === true
}
