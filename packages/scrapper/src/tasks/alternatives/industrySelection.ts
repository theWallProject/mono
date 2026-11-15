/**
 * Selects which of OUR industries describe a company.
 *
 * Measured against two alternatives that both failed:
 *
 *   - Counting industries among the embedding's nearest neighbours only ever surfaced the
 *     mega-buckets ("Video", "Software", "Internet"), because those are what recur in any
 *     large neighbourhood. Specific labels such as "Professional Networking" never
 *     accumulate enough count to win.
 *   - Adding an industry-match bonus to the similarity score reordered results on weak
 *     base scores, putting broadcast hardware vendors at the top for a networking query.
 *
 * Embedding the industry *names* against the company text works: for a video-networking
 * query it returns Video Conferencing, Video Chat, Professional Networking, Events and
 * Online Portals — specific and real. The result is then used as a *gate*, never as a
 * score bonus, so similarity alone decides ordering.
 */

import { log } from "../../helper"
import { buildCorpusText, cosineInt8, EMBEDDING_DIMENSIONS, loadIndex, quantizeToInt8 } from "./similarity"

/** Minimum similarity between the company text and an industry name to consider it. */
export const DEFAULT_INDUSTRY_FLOOR = 0.35

/** Never gate on more than this many industries; a wide gate stops filtering. */
export const MAX_SELECTED_INDUSTRIES = 8

export type IndustrySelection = {
  /** Chosen labels, best match first. */
  selected: string[]
  /** Every industry scored, for `--json` inspection and for asking "why wasn't X chosen?". */
  scored: Array<{ name: string; score: number }>
}

type Embedder = (texts: string[]) => Promise<Float32Array>

/**
 * Embeds industry names with the same model used for companies.
 *
 * Inductries are embedded as short phrases rather than bare nouns: "a company in the
 * Events industry" lands closer to how a company description reads than the word "Events"
 * alone does.
 */
const loadEmbedder = async (): Promise<Embedder> => {
  const { pipeline, env } = await import("@huggingface/transformers")
  const path = await import("path")

  env.cacheDir = process.env.ALTERNATIVES_MODEL_CACHE ?? path.join(__dirname, "../../../results/index/models")

  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { dtype: "q8" })

  return async (texts: string[]): Promise<Float32Array> => {
    const output = await extractor(texts, { pooling: "mean", normalize: true })
    const dims = output.dims
    const last = dims[dims.length - 1]
    if (last !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Model returned ${String(last)} dimensions, expected ${EMBEDDING_DIMENSIONS}.`)
    }
    if (!(output.data instanceof Float32Array)) {
      throw new Error(`Model returned ${output.data.constructor.name} rather than Float32Array.`)
    }
    return new Float32Array(output.data)
  }
}

/** Industry name to the phrase that gets embedded. */
export const industryToPhrase = (industry: string): string => `a company in the ${industry} industry`

/**
 * Ranks every taxonomy industry by similarity to the profile text.
 *
 * Pure apart from the injected embedder, so the ranking and thresholding rules can be
 * tested without loading a model.
 */
export const rankIndustries = async (
  profileText: string,
  industryNames: readonly string[],
  embed: Embedder
): Promise<Array<{ name: string; score: number }>> => {
  if (industryNames.length === 0) {
    throw new Error("Cannot rank against an empty industry list.")
  }

  const industryVectors = await embed(industryNames.map(industryToPhrase))
  const queryVector = quantizeToInt8(await embed([profileText]))

  const scored = industryNames.map((name, i) => ({
    name,
    score: cosineInt8(
      queryVector,
      quantizeToInt8(industryVectors.subarray(i * EMBEDDING_DIMENSIONS, (i + 1) * EMBEDDING_DIMENSIONS)),
      0,
      EMBEDDING_DIMENSIONS
    )
  }))

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Picks the industries that describe the company.
 *
 * Ordered most-similar first and capped, so a company matching many weak labels does not
 * end up gating on half the taxonomy.
 */
export const selectIndustries = (
  scored: ReadonlyArray<{ name: string; score: number }>,
  floor: number = DEFAULT_INDUSTRY_FLOOR
): IndustrySelection => {
  const selected = scored
    .filter((entry) => entry.score >= floor)
    .slice(0, MAX_SELECTED_INDUSTRIES)
    .map((entry) => entry.name)

  if (selected.length === 0) {
    throw new Error(
      `No industry matched above the floor of ${floor.toFixed(2)}. The company's description may be too ` +
        "generic; pass --industries to choose them explicitly."
    )
  }

  return { selected, scored: [...scored] }
}

/** Convenience wrapper: loads the taxonomy, embeds and selects in one call. */
export const inferIndustries = async (
  profileText: string,
  industryNames: readonly string[],
  floor: number = DEFAULT_INDUSTRY_FLOOR
): Promise<IndustrySelection> => {
  const embed = await loadEmbedder()
  const scored = await rankIndustries(profileText, industryNames, embed)

  log(`Top industry matches: ${scored.slice(0, 5).map((s) => `${s.name} (${s.score.toFixed(3)})`).join(", ")}`)

  return selectIndustries(scored, floor)
}

/** Loads and verifies the committed similarity index without using it, for staleness checks. */
export const probeIndex = (): ReturnType<typeof loadIndex> => loadIndex()

export { buildCorpusText }
