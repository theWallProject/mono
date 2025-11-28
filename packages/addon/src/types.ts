import type { UrlCheckResult } from "@theWallProject/common";

export enum MessageTypes {
  TestUrl = "TestUrl",
  RequestUrlTest = "RequestUrlTest",
  DissmissUrl = "DissmissUrl",
}

/**
 * Addon-specific extension of UrlCheckResult.
 * Adds dismissal tracking and additional fields for UI display.
 */
export type UrlTestResult =
  | (Extract<UrlCheckResult, { isHint: true }> & {
      isDismissed?: boolean;
    })
  | (Extract<UrlCheckResult, { isHint?: false }> & {
      isDismissed?: boolean;
      hintUrl?: string;
      hintText?: string;
    })
  | undefined;

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

export type SendResponse<T extends keyof MessageResponseMap> = (
  response: MessageResponseMap[T]
) => void
