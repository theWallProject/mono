import { writeFileSync } from "fs"
import { join } from "path"

import { APIListOfReasons } from "../src/index"

// Extract enum values from APIListOfReasons to ensure they stay in sync
const reasonEnumValues = Object.values(APIListOfReasons)

// Manually construct schema to ensure it matches the Zod schema exactly
// This ensures consistency and avoids issues with zod-to-json-schema
const itemProperties = {
  androidDevId: {
    type: "string",
    description: "Android developer ID like 'com.wix' (not full app package IDs)"
  },
  androidAppIds: {
    type: "array",
    description: "Array of full Android app package IDs for exact matching",
    items: {
      type: "string"
    },
    minItems: 1
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
}

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  description:
    "Array of Android blacklist items. ⚠️ AUTO-GENERATED - Do not edit manually. Run 'pnpm run generate-schema' in common package to regenerate.",
  items: {
    type: "object",
    required: ["reasonIds"],
    properties: itemProperties,
    additionalProperties: false,
    // Ensure at least one of androidDevId or androidAppIds is present
    anyOf: [
      {
        properties: itemProperties,
        required: ["androidDevId", "reasonIds"]
      },
      {
        properties: itemProperties,
        required: ["androidAppIds", "reasonIds"]
      }
    ]
  }
}

const outputPath = join(__dirname, "../src/schemas/blacklist.schema.json")
writeFileSync(outputPath, JSON.stringify(schema, null, 2))

console.log(`✅ Generated JSON schema at ${outputPath}`)
