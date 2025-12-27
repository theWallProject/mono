import fs from "fs"
import path from "path"
import prettier from "prettier"

/**
 * Options for file writing operations
 */
export interface WriteOptions {
  /**
   * Use atomic write (write to temp file, then rename)
   * Recommended for critical files to prevent corruption
   */
  atomic?: boolean
  /**
   * File type for prettier parser detection
   * If not provided, prettier will auto-detect from file extension
   */
  parser?: "json" | "typescript" | "babel" | "markdown" | "css" | "html"
  /**
   * Override prettier config options
   */
  prettierOptions?: prettier.Options
}

/**
 * Load prettier config using prettier's built-in resolution
 * Searches for config files (.prettierrc, prettier.config.js, .mjs, etc.) up the directory tree
 */
async function loadPrettierConfig(filePath: string): Promise<prettier.Options> {
  const config = await prettier.resolveConfig(filePath)
  if (!config) {
    throw new Error(`No prettier config found for ${filePath}`)
  }
  return config
}

/**
 * Format content using prettier
 */
async function formatContent(content: string, filePath: string, options?: WriteOptions): Promise<string> {
  const config = await loadPrettierConfig(filePath)
  const mergedOptions: prettier.Options = {
    ...config,
    ...options?.prettierOptions,
    filepath: filePath,
    // Only set parser if explicitly provided, otherwise let prettier auto-detect
    ...(options?.parser ? { parser: options.parser } : {})
  }

  return prettier.format(content, mergedOptions)
}

/**
 * Write content to file (async with atomic write support)
 */
async function writeFileAtomicAsync(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath)
  const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp`)

  // Ensure directory exists
  await fs.promises.mkdir(dir, { recursive: true })

  // Write to temp file
  await fs.promises.writeFile(tempPath, content, "utf-8")

  // Delete old file if it exists
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath)
  }

  // Rename temp to final
  await fs.promises.rename(tempPath, filePath)
}

/**
 * Format and write content to file (async version - RECOMMENDED)
 *
 * This function formats content using prettier before writing to disk.
 * Use this for all file generation to ensure consistent formatting.
 *
 * @param filePath - Absolute path to the file to write
 * @param content - Content to write (string or object for JSON)
 * @param options - Write options including atomic write and prettier config
 *
 * @example
 * ```typescript
 * // Write formatted JSON
 * await formatAndWrite('/path/to/file.json', { foo: 'bar' })
 *
 * // Write with atomic write (recommended for critical files)
 * await formatAndWrite('/path/to/file.json', data, { atomic: true })
 *
 * // Write TypeScript file
 * await formatAndWrite('/path/to/file.ts', sourceCode, { parser: 'typescript' })
 * ```
 */
export async function formatAndWrite(
  filePath: string,
  content: string | object,
  options?: WriteOptions
): Promise<void> {
  // Convert objects to JSON strings
  const stringContent = typeof content === "string" ? content : JSON.stringify(content, null, 2)

  // Format the content
  const formattedContent = await formatContent(stringContent, filePath, options)

  // Write to file
  if (options?.atomic) {
    await writeFileAtomicAsync(filePath, formattedContent)
  } else {
    const dir = path.dirname(filePath)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(filePath, formattedContent, "utf-8")
  }
}
