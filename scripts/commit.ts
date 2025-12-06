#!/usr/bin/env node
import { exec, spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import http from "node:http"
import { join } from "node:path"
import prompts from "prompts"
import { z } from "zod"

const OLLAMA_BASE_URL = "http://127.0.0.1:11434"
const CONFIG_FILE = join(process.cwd(), ".commit-config.json")

const OllamaTagsSchema = z.object({
  models: z.array(
    z
      .object({
        name: z.string(),
        model: z.string()
      })
      .passthrough()
  )
})

const ConfigSchema = z.object({
  selectedModel: z.string()
})

type Config = z.infer<typeof ConfigSchema>

async function getAvailableModels(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const req = http.get(`${OLLAMA_BASE_URL}/api/tags`, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        try {
          const parsedData = OllamaTagsSchema.safeParse(JSON.parse(data))
          if (!parsedData.success) {
            reject(new Error("Failed to parse Ollama response"))
            return
          }

          const models = parsedData.data.models
          const modelNames = models.map((model) => model.name)
          resolve(modelNames)
        } catch {
          reject(new Error("Failed to parse Ollama response"))
        }
      })
    })

    req.on("error", (error: unknown) => {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "ECONNREFUSED") {
          reject(new Error("Ollama is not running. Please start it and try again."))
        } else {
          reject(new Error(`Unexpected error checking Ollama: ${String(error)}`))
        }
      } else {
        reject(new Error(`Unexpected error checking Ollama: ${String(error)}`))
      }
    })

    req.end()
  })
}

function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    throw new Error(`Config file not found: ${CONFIG_FILE}`)
  }

  const content = readFileSync(CONFIG_FILE, "utf-8")
  const parsed = ConfigSchema.safeParse(JSON.parse(content))
  if (!parsed.success) {
    throw new Error(`Invalid config file: ${parsed.error.message}`)
  }
  return parsed.data
}

function saveConfig(config: Config): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8")
}

async function selectModel(availableModels: string[]): Promise<string> {
  let initialIndex = 0
  try {
    const config = loadConfig()
    const foundIndex = availableModels.findIndex((model) => model === config.selectedModel)
    if (foundIndex >= 0) {
      initialIndex = foundIndex
    }
  } catch {
    // No config file or invalid config - use default index 0
  }

  const { model } = await prompts({
    type: "select",
    name: "model",
    message: "Select an Ollama model:",
    choices: availableModels.map((name) => ({ title: name, value: name })),
    initial: initialIndex
  })

  if (!model || typeof model !== "string") {
    console.error("❌ No model selected.")
    process.exit(1)
  }

  // Save the selected model
  saveConfig({ selectedModel: model })

  return model
}

async function getStagedDiff() {
  return new Promise<string | null>((resolve, reject) => {
    exec("git diff --cached", (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
}

function limitDiffPerFile(diff: string): string {
  const PER_FILE_LINE_LIMIT = 100
  const TOTAL_CHAR_LIMIT = 5000

  // Split diff by file (each file starts with "diff --git")
  const fileSections = diff.split(/\n(?=diff --git)/)
  const limitedSections: string[] = []
  let totalChars = 0
  let fileCount = 0
  const truncatedFiles: string[] = []

  // Count original stats
  const originalChars = diff.length
  const originalLines = diff.split("\n").length
  const originalFileCount = fileSections.length

  for (const section of fileSections) {
    if (!section.trim()) continue

    fileCount++
    const lines = section.split("\n")
    const headerLines: string[] = []
    const contentLines: string[] = []
    let inHeader = true

    // Separate header from content
    for (const line of lines) {
      if (
        inHeader &&
        (line.startsWith("diff --git") ||
          line.startsWith("index ") ||
          line.startsWith("---") ||
          line.startsWith("+++") ||
          line.startsWith("@@") ||
          line.trim() === "")
      ) {
        headerLines.push(line)
        if (line.startsWith("@@")) {
          inHeader = false
        }
      } else {
        inHeader = false
        contentLines.push(line)
      }
    }

    // Limit content lines
    let limitedContent = contentLines
    if (contentLines.length > PER_FILE_LINE_LIMIT) {
      limitedContent = contentLines.slice(0, PER_FILE_LINE_LIMIT)
      limitedContent.push(`... (truncated, showing first ${PER_FILE_LINE_LIMIT} lines)`)
      // Extract filename from header
      const fileMatch = section.match(/diff --git a\/(.+?) b\//)
      if (fileMatch) {
        truncatedFiles.push(fileMatch[1])
      }
    }

    const limitedSection = [...headerLines, ...limitedContent].join("\n")
    const sectionChars = limitedSection.length

    // Check if adding this section would exceed total limit
    if (totalChars + sectionChars > TOTAL_CHAR_LIMIT) {
      // Try to fit at least part of this section
      const remainingChars = TOTAL_CHAR_LIMIT - totalChars
      if (remainingChars > 100) {
        // Include partial section
        const partialSection = limitedSection.substring(0, remainingChars - 50)
        limitedSections.push(partialSection + "\n... (diff truncated, total limit reached)")
        totalChars = TOTAL_CHAR_LIMIT
      }
      break
    }

    limitedSections.push(limitedSection)
    totalChars += sectionChars
  }

  const result = limitedSections.join("\n")
  const finalChars = result.length
  const finalLines = result.split("\n").length

  // Log stats
  console.log(`📊 Diff stats: ${originalFileCount} files, ${originalLines} lines, ${originalChars} chars`)
  if (truncatedFiles.length > 0) {
    console.log(`   Files truncated (per-file limit): ${truncatedFiles.join(", ")}`)
  }
  if (finalChars < originalChars) {
    console.log(`   → Limited to: ${fileCount} files, ${finalLines} lines, ${finalChars} chars`)
  } else {
    console.log(`   → Final: ${fileCount} files, ${finalLines} lines, ${finalChars} chars`)
  }

  return result
}

async function generateCommitMessage(diff: string, model: string): Promise<string> {
  console.log(`🤖 Generating commit message using ${model}...`)
  console.log("📝 Commit message: ")

  const body = {
    model,
    stream: true,
    prompt: `Write a git commit message. First line is a short title. Then add details. End with a sarcastic, roasting-style, witty, funny joke about the changes. No markdown, no formatting, just plain text.

${diff}`
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Failed to generate commit message: ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error("No response body from Ollama")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let fullResponse = ""
  let buffer = ""

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.trim() === "") continue

        try {
          const json = JSON.parse(line)
          if (json.response) {
            process.stdout.write(json.response)
            fullResponse += json.response
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer)
        if (json.response) {
          process.stdout.write(json.response)
          fullResponse += json.response
        }
      } catch {
        // Skip invalid JSON
      }
    }

    console.log() // New line after streaming
  } finally {
    reader.releaseLock()
  }

  const result = fullResponse.trim()
  if (!result) {
    throw new Error("Empty response from Ollama")
  }

  return result
}

async function commitChanges(message: string) {
  // Split message into lines - first line is the title
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length === 0) {
    throw new Error("Empty commit message")
  }

  const title = lines[0]
  const body = lines.slice(1)

  // Use first line as title, rest as body
  const args = ["commit", "-m", title]
  for (const line of body) {
    args.push("-m", line)
  }

  const result = spawnSync("git", args, {
    stdio: "inherit"
  })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`Git commit failed with status ${result.status}`)
  }
}

async function main() {
  // Get available models and check if Ollama is running
  let availableModels: string[]
  try {
    availableModels = await getAvailableModels()
    if (availableModels.length === 0) {
      console.error(
        "❌ No Ollama models found. Please install at least one model (e.g., `ollama pull mistral-openorca`)."
      )
      process.exit(1)
    }
  } catch (error: unknown) {
    console.error(`❌ ${error instanceof Error ? error.message : "Failed to connect to Ollama"}`)
    process.exit(1)
  }

  // Select model (will preselect previously chosen one if available)
  const selectedModel = await selectModel(availableModels)

  // Get staged diff
  const rawDiff = await getStagedDiff()
  if (!rawDiff || rawDiff.trim().length === 0) {
    throw new Error("No staged changes to commit")
  }

  // Limit diff per file and apply total limit
  const diff = limitDiffPerFile(rawDiff)

  // Generate commit message based on limited diff
  const commitMessage = await generateCommitMessage(diff, selectedModel)

  console.log("📝 Generated Commit Message:")
  console.log(
    commitMessage
      .split("\n")
      .map((line) => `   ${line}`)
      .join("\n")
  )

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Looks good?",
    initial: true
  })

  if (confirm) {
    await commitChanges(commitMessage)
    console.log("✅ Changes committed.")
  } else {
    console.log("🙅 Commit aborted.")
  }
}

main().catch((error: unknown) => {
  console.error("❌ An unexpected error occurred:", error)
  process.exit(1)
})
