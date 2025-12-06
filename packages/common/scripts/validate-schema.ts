import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { Validator } from "jsonschema"

/**
 * Schema validation script - validates ALL.json files against the generated JSON schema.
 *
 * ⚠️ IMPORTANT: The Zod schema (FinalDBFileSchema) is the absolute source of truth.
 * The JSON schema file is AUTO-GENERATED from the Zod schema.
 *
 * This script validates that:
 * 1. The schema file in common package matches the copy in Android assets
 * 2. All ALL.json files conform to the schema (which was generated from FinalDBFileSchema)
 */

const schemaPath = join(__dirname, "../src/schemas/all.generated.schema.json")
const androidSchemaPath = join(__dirname, "../../android/app/src/main/assets/all.generated.schema.json")

// ALL.json file locations to validate
const allJsonPaths = [
  join(__dirname, "../../scrapper/results/4_final/ALL.json"),
  join(__dirname, "../../addon/src/db/ALL.json"),
  join(__dirname, "../../android/app/src/main/assets/ALL.json"),
  join(__dirname, "../../telegram-bot/db/ALL.json")
]

function validateSchemaSync() {
  console.log("🔍 Validating schema as source of truth (using JSON schema file, not Zod)...")

  // 1. Check that source schema exists
  if (!existsSync(schemaPath)) {
    throw new Error(`❌ Source schema not found at ${schemaPath}. Run 'pnpm run generate-schema' first.`)
  }

  const sourceSchema = readFileSync(schemaPath, "utf-8")

  // 2. Check that Android assets schema exists and matches source
  if (!existsSync(androidSchemaPath)) {
    throw new Error(
      `❌ Android assets schema not found at ${androidSchemaPath}. The schema file must be copied to Android assets.`
    )
  }

  const androidSchema = readFileSync(androidSchemaPath, "utf-8")

  // Compare schemas (normalize JSON to handle formatting differences)
  const sourceSchemaObj = JSON.parse(sourceSchema)
  const androidSchemaObj = JSON.parse(androidSchema)

  if (JSON.stringify(sourceSchemaObj) !== JSON.stringify(androidSchemaObj)) {
    throw new Error(
      `❌ Schema mismatch! The Android assets schema at ${androidSchemaPath} does not match the source schema at ${schemaPath}. Run 'pnpm run generate-schema' to regenerate.`
    )
  }

  console.log("✅ Schema files are in sync")

  // 3. Validate all ALL.json files against the JSON schema file (source of truth)
  // Using jsonschema library, NOT Zod, to validate against the schema file
  const validator = new Validator()
  const schema = JSON.parse(sourceSchema)

  let allValid = true
  const errors: string[] = []

  for (const allJsonPath of allJsonPaths) {
    if (!existsSync(allJsonPath)) {
      console.log(`⚠️  Skipping ${allJsonPath} (file does not exist)`)
      continue
    }

    try {
      const allJsonContent = readFileSync(allJsonPath, "utf-8")
      const allJsonData = JSON.parse(allJsonContent)

      const validationResult = validator.validate(allJsonData, schema)

      if (!validationResult.valid) {
        allValid = false
        const fileErrors = validationResult.errors.map((err) => `  - ${err.property}: ${err.message}`).join("\n")
        errors.push(`❌ ${allJsonPath} validation failed:\n${fileErrors}`)
      } else {
        console.log(`✅ ${allJsonPath} is valid`)
      }
    } catch (error) {
      allValid = false
      if (error instanceof Error) {
        errors.push(`❌ ${allJsonPath} error: ${error.message}`)
      } else {
        errors.push(`❌ ${allJsonPath} error: ${String(error)}`)
      }
    }
  }

  if (!allValid) {
    console.error("\n❌ Schema validation failed:")
    errors.forEach((error) => console.error(error))
    throw new Error("Schema validation failed. See errors above.")
  }

  console.log("\n✅ All schema validations passed!")
}

try {
  validateSchemaSync()
  process.exit(0)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error(String(error))
  }
  process.exit(1)
}
