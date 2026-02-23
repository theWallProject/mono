/**
 * LM Studio API client using the OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Uses only Node.js built-in `http` module — no external dependencies needed.
 * Validates responses with Zod and throws on any unexpected structure.
 */

import http from "http"
import https from "https"
import { z } from "zod"

import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"

/** A single message in the OpenAI chat format */
type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

/** Zod schema for the OpenAI-compatible chat completion response */
const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  choices: z
    .array(
      z.object({
        index: z.number(),
        message: z.object({
          role: z.string(),
          content: z.string()
        }),
        finish_reason: z.string()
      })
    )
    .min(1, "AI response must have at least one choice"),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number()
    })
    .optional()
})

/**
 * Sends a chat completion request to the LM Studio server.
 *
 * Throws on:
 *   - Connection failure (server down, wrong IP/port)
 *   - HTTP error responses (4xx, 5xx)
 *   - Malformed response JSON
 *   - Unexpected response structure
 *   - Timeout
 *
 * Returns the content string from the first choice.
 */
export const chatCompletion = async (messages: ChatMessage[]): Promise<string> => {
  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio

  const url = new URL("/v1/chat/completions", config.baseUrl)
  const isHttps = url.protocol === "https:"
  const httpModule = isHttps ? https : http

  const requestBody = JSON.stringify({
    model: config.model,
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    stream: false
  })

  return new Promise<string>((resolve, reject) => {
    const req = httpModule.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody)
        },
        timeout: config.requestTimeout
      },
      (res) => {
        const chunks: Buffer[] = []

        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk)
        })

        res.on("end", () => {
          const responseText = Buffer.concat(chunks).toString("utf-8")

          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `LM Studio API returned HTTP ${res.statusCode}: ${responseText.slice(0, 1000)}`
              )
            )
            return
          }

          let parsed: unknown
          try {
            parsed = JSON.parse(responseText)
          } catch {
            reject(
              new Error(
                `LM Studio API returned non-JSON response: ${responseText.slice(0, 1000)}`
              )
            )
            return
          }

          try {
            const validated = ChatCompletionResponseSchema.parse(parsed)
            const firstChoice = validated.choices[0]
            if (!firstChoice) {
              reject(new Error("AI response has no choices after validation"))
              return
            }
            resolve(firstChoice.message.content)
          } catch (validationError) {
            reject(validationError)
          }
        })

        res.on("error", (err) => {
          reject(new Error(`LM Studio API response stream error: ${err.message}`))
        })
      }
    )

    req.on("error", (err) => {
      reject(new Error(`Failed to connect to LM Studio at ${config.baseUrl}: ${err.message}`))
    })

    req.on("timeout", () => {
      req.destroy()
      reject(
        new Error(
          `LM Studio API request timed out after ${config.requestTimeout}ms. ` +
            "Is the model loaded? Large models can take time to respond."
        )
      )
    })

    req.write(requestBody)
    req.end()
  })
}

/**
 * Tests connectivity to the LM Studio server by sending a minimal request.
 * Throws with a descriptive error if the server is unreachable or misconfigured.
 */
export const testConnection = async (): Promise<void> => {
  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio
  try {
    const response = await chatCompletion([
      { role: "user", content: "Reply with exactly: OK" }
    ])
    if (!response || response.trim().length === 0) {
      throw new Error("LM Studio returned empty response to connectivity test")
    }
    console.log(`LM Studio connection OK (model: ${config.model}, server: ${config.baseUrl})`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `LM Studio connectivity test failed:\n` +
        `  Server: ${config.baseUrl}\n` +
        `  Model: ${config.model}\n` +
        `  Error: ${message}\n` +
        `  \n` +
        `  Troubleshooting:\n` +
        `  1. Is LM Studio running and the model loaded?\n` +
        `  2. Is the server URL correct in config.ts?\n` +
        `  3. Is the network accessible from this machine?\n` +
        `  4. Is the model name correct? Check LM Studio's loaded models.`
    )
  }
}
