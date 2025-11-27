import type { APIListOfReasonsValues } from "@theWallProject/common"

export enum MessageTypes {
  TestUrl = "TestUrl",
  RequestUrlTest = "RequestUrlTest",
  DissmissUrl = "DissmissUrl"
}

export type UrlTestResult =
  | {
      isHint: true
      name: string
      hintText: string
      hintUrl: string
      isDismissed?: boolean
      rule: {
        selector: string
        key:
          | "li"
          | "il"
          | "fb"
          | "ws"
          | "tw"
          | "ig"
          | "gh"
          | "ytp"
          | "ytc"
          | "tt"
          | "th"
      }
    }
  | {
      isHint?: false | undefined
      hintUrl?: string
      hintText?: string
      reasons: APIListOfReasonsValues[]
      name: string
      comment?: string
      link?: string
      isDismissed?: boolean
      rule: {
        selector: string
        key:
          | "li"
          | "il"
          | "fb"
          | "ws"
          | "tw"
          | "ig"
          | "gh"
          | "ytp"
          | "ytc"
          | "tt"
          | "th"
      }
      alt?: { n: string; ws: string }[]
      stockSymbol?: string
    }
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

export type SendResponse<T extends keyof MessageResponseMap> = (
  response: MessageResponseMap[T]
) => void
