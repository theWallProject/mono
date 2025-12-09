import { ManualOverrideFields } from "../../types"

export type ManualAdditionItem = {
  name: string
} & (
  | ManualOverrideFields
  | { _processed: true }
  | (ManualOverrideFields & { _processed: true })
  | (ManualOverrideFields & { urls?: string[] })
  | (ManualOverrideFields & { _processed: true; urls?: string[] })
)

export const manualAdditions: ManualAdditionItem[] = [
  {
    name: "Wordtune",
    reasons: ["h"],
    ws: ["https://www.wordtune.com"],
    li: ["https://www.linkedin.com/showcase/wordtune"],
    fb: ["https://www.facebook.com/wordtune"],
    tw: ["https://x.com/wordtune"],
    ig: ["https://www.instagram.com/wordtune_official"],
    ytc: ["https://www.youtube.com/channel/UCDQlFKBK11jIxm4iVymoAtA"],
    tt: ["https://www.tiktok.com/@wordtune_official"],
    urls: [
      "https://chromewebstore.google.com/detail/wordtune-ai-paraphrasing/nllcnknpjnininklegdoijpljgdjkijc",
      "https://microsoftedge.microsoft.com/addons/detail/wordtune-ai-paraphrasing/fgngodlaekdlibajobmkaklibdggemdd",
      "https://www.linkedin.com/newsletters/6995001803318681600"
    ],
    _processed: true
  }
]
