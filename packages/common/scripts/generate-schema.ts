import { writeFileSync } from "fs"
import { join } from "path"

import { APIListOfReasons } from "../src/index"

// Extract enum values from APIListOfReasons to ensure they stay in sync
const reasonEnumValues = Object.values(APIListOfReasons)

// Manually construct schema to ensure it matches the Zod schema exactly
// This ensures consistency and avoids issues with zod-to-json-schema
const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  description:
    "Array of Android blacklist items. ⚠️ AUTO-GENERATED - Do not edit manually. Run 'pnpm run generate-schema' in common package to regenerate.",
  items: {
    type: "object",
    required: ["androidDevId", "reasonIds"],
    properties: {
      androidDevId: {
        type: "string",
        description: "Android developer ID like 'com.wix' (not full app package IDs)"
      },
      reasonIds: {
        type: "array",
        description: "Array of reason codes matching ALL.json format",
        items: {
          type: "string",
          enum: reasonEnumValues
        },
        minItems: 1
      }
    },
    additionalProperties: false
  }
}

const outputPath = join(__dirname, "../src/schemas/blacklist.schema.json")
writeFileSync(outputPath, JSON.stringify(schema, null, 2))

console.log(`✅ Generated JSON schema at ${outputPath}`)
