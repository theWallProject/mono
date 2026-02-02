import type { DomainHint, UrlCheckResult } from "@theWallProject/common"

// Re-export DomainHint for backward compatibility within addon
export type { DomainHint }

export enum MessageTypes {
  TestUrl = "TestUrl",
  RequestUrlTest = "RequestUrlTest",
  DissmissUrl = "DissmissUrl"
}

/**
 * Addon-specific extension of UrlCheckResult.
 * Adds dismissal tracking and additional fields for UI display.
 */
export type UrlTestResult =
  | (Extract<UrlCheckResult, { isHint: true }> & {
      isDismissed?: boolean
    })
  | (Extract<UrlCheckResult, { isHint?: false }> & {
      isDismissed?: boolean
      hintUrl?: string
      hintText?: string
      /** Domain hint to show as toast when a flagged company is on a domain with a hint */
      domainHint?: DomainHint
    })
  | undefined

export type Message =
  | {
      action: MessageTypes.TestUrl
      url: string
    }
  | {
      action: MessageTypes.RequestUrlTest
    }
  | {
      action: MessageTypes.DissmissUrl
      key: string
      selector: string
    }

export type MessageResponseMap = {
  [MessageTypes.TestUrl]: UrlTestResult
  [MessageTypes.DissmissUrl]: true
}

export type SendResponse<T extends keyof MessageResponseMap> = (response: MessageResponseMap[T]) => void
