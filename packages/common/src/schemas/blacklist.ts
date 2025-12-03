import { z } from "zod"

import { APIListOfReasonsSchema } from "../index"

/**
 * Schema for Android blacklist item.
 * Matches the format used in ALL.json for reason codes to ensure consistency.
 */
export const BlacklistItemSchema = z.object({
  /**
   * Android developer ID like "com.wix" (not full app package IDs).
   * This is the developer identifier, not a specific app package name.
   */
  androidDevId: z.string().describe("Android developer ID like 'com.wix' (not full app package IDs)"),
  /**
   * Array of reason codes matching ALL.json format.
   * Uses the same APIListOfReasonsSchema to ensure consistency.
   * Type: APIListOfReasonsValues[] ("h" | "f" | "i" | "u" | "b")
   */
  reasonIds: z.array(APIListOfReasonsSchema).min(1)
})

export const BlacklistSchema = z.array(BlacklistItemSchema)

export type BlacklistItem = z.infer<typeof BlacklistItemSchema>
export type Blacklist = z.infer<typeof BlacklistSchema>
