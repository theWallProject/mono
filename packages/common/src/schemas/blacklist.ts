import { z } from "zod"

import { APIListOfReasonsSchema } from "../index"

/**
 * Schema for Android blacklist item.
 * Matches the format used in ALL.json for reason codes to ensure consistency.
 */
export const BlacklistItemSchema = z
  .object({
    /**
     * Android developer ID like "com.wix" (not full app package IDs).
     * This is the developer identifier, not a specific app package name.
     * Optional, but at least one of androidDevId or androidAppIds must be present.
     */
    androidDevId: z.string().optional().describe("Android developer ID like 'com.wix' (not full app package IDs)"),
    /**
     * Array of full Android app package IDs for exact matching.
     * Optional, but at least one of androidDevId or androidAppIds must be present.
     */
    androidAppIds: z
      .array(z.string())
      .optional()
      .describe("Array of full Android app package IDs for exact matching (e.g., 'com.eventcadence.team8')"),
    /**
     * Array of reason codes matching ALL.json format.
     * Uses the same APIListOfReasonsSchema to ensure consistency.
     * Type: APIListOfReasonsValues[] ("h" | "f" | "i" | "u" | "b")
     */
    reasonIds: z.array(APIListOfReasonsSchema).min(1)
  })
  .strict()
  .refine((data) => data.androidDevId != null || (data.androidAppIds != null && data.androidAppIds.length > 0), {
    message: "At least one of androidDevId or androidAppIds must be present"
  })

export const BlacklistSchema = z.array(BlacklistItemSchema)

export type BlacklistItem = z.infer<typeof BlacklistItemSchema>
export type Blacklist = z.infer<typeof BlacklistSchema>
