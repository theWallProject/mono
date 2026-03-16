/**
 * LM Studio API client using the OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Uses streaming mode (Server-Sent Events) so that:
 *   1. The idle timeout resets on every chunk — the request won't be killed
 *      just because inference is slow (only if the server truly stops responding).
 *   2. A hard overall deadline guarantees the request is killed after the
 *      configured timeout, regardless of socket activity.
 *   3. Lifecycle and progress callbacks give full visibility into what's happening.
 *
 * Uses only Node.js built-in `http`/`https` modules — no external dependencies.
 */

import http from "http"
import https from "https"

import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"

/** A single message in the OpenAI chat format */
type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

/** Callbacks for the chat completion call */
type ChatCompletionCallbacks = {
  /** Called at key lifecycle points (connecting, first token, etc.) */
  log: (message: string) => void
  /**
   * Called whenever new content tokens arrive from the stream.
   * `charsSoFar` is the total accumulated content length.
   */
  onProgress: (charsSoFar: number) => void
}

/**
 * Parses a single SSE `data:` line from the streaming response.
 * Returns the content delta string, or `null` for non-content events.
 * Returns the special symbol `DONE` when the stream signals `[DONE]`.
 */
const DONE = Symbol("DONE")

const parseSseLine = (line: string): string | null | typeof DONE => {
  if (!line.startsWith("data:")) return null

  const payload = line.slice("data:".length).trim()
  if (payload === "[DONE]") return DONE

  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>
    }
    return parsed?.choices?.[0]?.delta?.content ?? null
  } catch {
    return null
  }
}

/**
 * Sends a streaming chat completion request to the LM Studio server.
 *
 * Throws on:
 *   - Connection failure (server down, wrong IP/port)
 *   - HTTP error responses (4xx, 5xx)
 *   - Overall hard deadline exceeded
 *   - Idle timeout (no data from server for `streamIdleTimeout` ms)
 *   - Empty response after stream completes
 *
 * Returns the accumulated content string from all streamed deltas.
 */
export const chatCompletion = async (
  messages: ChatMessage[],
  callbacks: ChatCompletionCallbacks
): Promise<string> => {
  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio
  const { log, onProgress } = callbacks

  const url = new URL("/v1/chat/completions", config.baseUrl)
  const isHttps = url.protocol === "https:"
  const httpModule = isHttps ? https : http

  const requestBody = JSON.stringify({
    model: config.model,
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    stream: true
  })

  log(`Connecting to LM Studio at ${config.baseUrl} (model: ${config.model})...`)

  return new Promise<string>((resolve, reject) => {
    let settled = false
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true
        fn()
      }
    }

    // ── Hard overall deadline ──
    const deadlineTimer = setTimeout(() => {
      req.destroy()
      settle(() =>
        reject(
          new Error(
            `LM Studio API request exceeded overall deadline of ${config.requestTimeout}ms. ` +
              "The model may be too slow for this prompt size."
          )
        )
      )
    }, config.requestTimeout)

    // ── Idle timeout helper ──
    const idleMs = config.streamIdleTimeout
    let idleTimer: ReturnType<typeof setTimeout> | null = null

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        req.destroy()
        settle(() =>
          reject(
            new Error(
              `LM Studio stream idle for ${idleMs}ms with no data. ` +
                "The server may have stalled. Check LM Studio logs."
            )
          )
        )
      }, idleMs)
    }

    const cleanup = () => {
      clearTimeout(deadlineTimer)
      if (idleTimer) clearTimeout(idleTimer)
    }

    // Start idle timer immediately — covers the wait for HTTP headers too.
    resetIdleTimer()

    const req = httpModule.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody)
        }
      },
      (res) => {
        resetIdleTimer()
        log(`Connected — HTTP ${res.statusCode}, waiting for first token...`)

        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          const errorChunks: Buffer[] = []
          res.on("data", (chunk: Buffer) => errorChunks.push(chunk))
          res.on("end", () => {
            const body = Buffer.concat(errorChunks).toString("utf-8")
            cleanup()
            settle(() =>
              reject(
                new Error(
                  `LM Studio API returned HTTP ${res.statusCode}: ${body.slice(0, 1000)}`
                )
              )
            )
          })
          return
        }

        // ── Stream processing ──
        let accumulated = ""
        let buffer = ""
        let firstTokenLogged = false
        let rawBytesReceived = 0

        resetIdleTimer()

        res.on("data", (chunk: Buffer) => {
          resetIdleTimer()
          rawBytesReceived += chunk.length
          buffer += chunk.toString("utf-8")
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            const result = parseSseLine(trimmed)
            if (result === DONE) return
            if (result !== null) {
              if (!firstTokenLogged) {
                firstTokenLogged = true
                log("First token received, streaming...")
              }
              accumulated += result
              onProgress(accumulated.length)
            }
          }
        })

        res.on("end", () => {
          cleanup()

          // Process any remaining buffered data
          if (buffer.trim()) {
            const result = parseSseLine(buffer.trim())
            if (result !== null && result !== DONE) {
              accumulated += result
            }
          }

          if (!accumulated) {
            log(`AI returned empty response (${rawBytesReceived} raw bytes) — model produced no tokens`)
          }

          settle(() => resolve(accumulated))
        })

        res.on("error", (err) => {
          cleanup()
          settle(() =>
            reject(new Error(`LM Studio API response stream error: ${err.message}`))
          )
        })
      }
    )

    req.on("error", (err) => {
      cleanup()
      settle(() =>
        reject(
          new Error(`Failed to connect to LM Studio at ${config.baseUrl}: ${err.message}`)
        )
      )
    })

    req.write(requestBody)
    req.end()
  })
}

/**
 * Warms up the LM Studio model by sending a small request and waiting for a
 * full response. This forces the model to load into memory (if not already)
 * so that subsequent real requests don't stall on cold-start latency.
 *
 * Also serves as a connectivity test — throws with a descriptive error if
 * the server is unreachable or the model fails to respond.
 */
export const warmUpModel = async (): Promise<void> => {
  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.lmStudio
  const startTime = Date.now()

  try {
    const response = await chatCompletion(
      [{ role: "user", content: "Reply with exactly: OK" }],
      {
        log: (msg) => console.log(`  [warmup] ${msg}`),
        onProgress: () => {}
      }
    )
    if (!response || response.trim().length === 0) {
      throw new Error("LM Studio returned empty response during warmup")
    }
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(
      `LM Studio warmed up in ${elapsed}s — model ready (${config.model} @ ${config.baseUrl})`
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `LM Studio warmup failed:\n` +
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
