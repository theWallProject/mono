import { existsSync } from "fs"
import { mkdir, rm } from "fs/promises"
import * as path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { TRANSLATIONS } from "./DB.ts"

// Output directory relative to the script
const outputDir = "./locales"

// Ensure output directories exist
const ensureDirExists = async (dirPath: string) => {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

// Delete the locales folder if it exists
const deleteFolderRecursive = async (folderPath: string) => {
  if (existsSync(folderPath)) {
    try {
      await rm(folderPath, { recursive: true, force: true })
      console.log(`Deleted folder: ${folderPath}`)
    } catch (err: unknown) {
      console.error(`Error deleting folder: ${err}`)
    }
  }
}

// Generate the locale files
const generateLocaleFiles = async (translations: Record<string, Record<string, string>>) => {
  const translationKeys = Object.keys(translations)
  const firstKey = translationKeys[0]
  if (firstKey === undefined) {
    throw new Error("Unexpected: translations object is empty")
  }
  const firstTranslation = translations[firstKey]
  if (firstTranslation === undefined) {
    throw new Error(`Unexpected: translation for key "${firstKey}" is undefined`)
  }
  const languages = Object.keys(firstTranslation)

  for (const lang of languages) {
    const messages: Record<string, { message: string }> = {}

    for (const [key, translationsForKey] of Object.entries(translations)) {
      const translationValue = translationsForKey[lang]
      if (translationValue === undefined) {
        throw new Error(`Unexpected: translation for key "${key}" and language "${lang}" is undefined`)
      }
      messages[key] = { message: translationValue }
    }

    const langDir = path.join(outputDir, lang)
    await ensureDirExists(langDir)

    const filePath = path.join(langDir, "messages.json")
    await formatAndWrite(filePath, messages, { parser: "json" })
    console.log(`Generated: ${filePath}`)
  }
}

// Execute the generation
const main = async () => {
  await deleteFolderRecursive(outputDir)
  await generateLocaleFiles(TRANSLATIONS)
}

main().catch(console.error)
