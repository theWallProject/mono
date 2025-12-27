import { copyFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

import { FinalDBFileSchema, formatAndWrite } from "../src/index"

/**
 * Schema generation script - generates JSON schema from Zod schema.
 *
 * ⚠️ IMPORTANT: The Zod schema (FinalDBFileSchema) is the absolute source of truth.
 * This script generates a JSON schema file from the Zod schema for validation purposes.
 *
 * The generated JSON schema is used for:
 * - Build-time validation of ALL.json files
 * - Android build validation
 * - Cross-platform validation
 *
 * ⚠️ AUTO-GENERATED - Do not edit manually. Run 'pnpm run generate-schema' to regenerate.
 */

// Generate JSON schema from Zod schema - create array schema
const arraySchema = z.array(FinalDBFileSchema)

// TypeScript has issues with complex type inference from zod-to-json-schema
// Use unknown and type guard to avoid type errors
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Type instantiation is excessively deep due to complex Zod schema
const generatedSchemaUnknown: unknown = zodToJsonSchema(arraySchema, {
  name: "AllJsonSchema",
  target: "jsonSchema7",
  $refStrategy: "none"
})

// Type guard to ensure it's a record
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

if (!isRecord(generatedSchemaUnknown)) {
  throw new Error("zodToJsonSchema did not return a valid object")
}

const generatedSchema: Record<string, unknown> = generatedSchemaUnknown

// Extract the actual schema
let finalSchema: Record<string, unknown> = generatedSchema

// Handle $ref and definitions
if (
  "$ref" in generatedSchema &&
  typeof generatedSchema.$ref === "string" &&
  generatedSchema.definitions &&
  typeof generatedSchema.definitions === "object"
) {
  const refName = generatedSchema.$ref.replace("#/definitions/", "")
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const definitions = generatedSchema.definitions as Record<string, Record<string, unknown>>
  const resolved = definitions[refName]
  if (resolved) {
    finalSchema = resolved
  }
} else if (generatedSchema.definitions && typeof generatedSchema.definitions === "object") {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const definitions = generatedSchema.definitions as Record<string, Record<string, unknown>>
  const defKeys = Object.keys(definitions)
  if (defKeys.length > 0 && defKeys[0]) {
    const defValue = definitions[defKeys[0]]
    if (defValue && (("type" in defValue && defValue.type === "array") || "items" in defValue)) {
      finalSchema = defValue
    }
  }
}

// Validate that we have a proper array schema
if (!finalSchema || !("type" in finalSchema) || finalSchema.type !== "array" || !("items" in finalSchema)) {
  const errorMsg = `Failed to generate valid JSON schema from Zod. Got: ${JSON.stringify(finalSchema, null, 2).substring(0, 500)}`
  console.error(errorMsg)
  throw new Error(`Schema generation failed. zod-to-json-schema did not produce a valid array schema.`)
}

// Add description and $schema if not present
if (!finalSchema.$schema) {
  finalSchema.$schema = "http://json-schema.org/draft-07/schema#"
}
finalSchema.description =
  "Schema for ALL.json database file. ⚠️ AUTO-GENERATED - Do not edit manually. Generated from Zod schema (FinalDBFileSchema). Run 'pnpm run generate-schema' in common package to regenerate."

async function generateSchema() {
  const outputPath = join(__dirname, "../src/schemas/all.generated.schema.json")
  await formatAndWrite(outputPath, finalSchema, { parser: "json" })

  console.log(`✅ Generated JSON schema at ${outputPath}`)

  // Copy to Android assets folder
  const androidAssetsPath = join(__dirname, "../../android/app/src/main/assets/all.generated.schema.json")
  const androidAssetsDir = join(__dirname, "../../android/app/src/main/assets")
  if (!existsSync(androidAssetsDir)) {
    mkdirSync(androidAssetsDir, { recursive: true })
  }
  copyFileSync(outputPath, androidAssetsPath)
  console.log(`✅ Copied schema to Android assets at ${androidAssetsPath}`)
}

generateSchema().catch((error) => {
  console.error("Failed to generate schema:", error)
  process.exit(1)
})
