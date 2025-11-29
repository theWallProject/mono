import { LinkField } from "@theWallProject/common"

import { ScrappedItemType } from "../../types"

export type ProcessedState = {
  _processed: true
}

export type ManualOverrideFields = Omit<
  Partial<ScrappedItemType>,
  "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th"
> & {
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
}

export type ManualOverrideValue =
  | (ManualOverrideFields & ProcessedState)
  | ProcessedState
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
): value is ProcessedState | (Partial<ScrappedItemType> & ProcessedState) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "_processed" in value &&
    value._processed === true
  )
}
