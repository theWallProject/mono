/**
 * Similarity search over the company corpus.
 *
 * Two decisions here were made from measurement, not taste:
 *
 * 1. **No vector database.** 23,674 companies at 384 dimensions is 34.7MB as float32
 *    (8.7MB as int8) and a brute-force cosine scan takes ~5.4ms. Qdrant or pgvector would
 *    add an operational dependency to save single-digit milliseconds on a build-time
 *    authoring tool.
 *
 * 2. **`all-MiniLM-L6-v2`, not a larger model.** `bge-small-en-v1.5` was benchmarked on
 *    this exact corpus and produced worse neighbours: at its top scores it surfaced risk
 *    management, web3 marketing and consulting firms for a video-networking query, where
 *    MiniLM's top hits were video conferencing, event management and ticketing.
 *
 * The index is a committed sidecar so a query costs milliseconds and zero tokens. It
 * carries a corpus hash: querying a stale index would silently return neighbours computed
 * against companies that no longer exist, so that is a hard error, not a warning.
 */

import fs from "fs"
import path from "path"
import { z } from "zod"

import { log } from "../../helper"

/** Embedding width of all-MiniLM-L6-v2. Fixed, and asserted against the model output. */
export const EMBEDDING_DIMENSIONS = 384

/** Bump when the embedding model or the embedded text format changes. */
export const INDEX_FORMAT_VERSION = 1

const MODEL_ID = "Xenova/all-MiniLM-L6-v2"

const indexDir = path.join(__dirname, "../../../results/index")
const vectorsPath = path.join(indexDir, "embeddings.int8.bin")
const metaPath = path.join(indexDir, "meta.json")

export const IndexMetaSchema = z
  .object({
    formatVersion: z.number().int().positive(),
    model: z.string(),
    dimensions: z.number().int().positive(),
    /** Number of vectors in the binary file. */
    count: z.number().int().nonnegative(),
    /** Corpus fingerprint the vectors were built from. */
    corpusHash: z.string(),
    /** Company names in vector order; index i in this array owns vector i. */
    names: z.array(z.string())
  })
  .strict()

export type IndexMeta = z.infer<typeof IndexMetaSchema>

/** A scored corpus company. */
export type SimilarityHit = {
  name: string
  /** Cosine similarity, cosine of unit vectors so this is in [-1, 1]. */
  score: number
  /** Industries on the corpus row, used by the gate and shown to the reviewer. */
  industries: string[]
  description?: string
  id: string
}

/** Text fed to the model for a corpus company. Mirrors the query-side format. */
export const buildCorpusText = (entry: { name: string; description?: string; industries?: string[] }): string =>
  [entry.name, entry.description ?? "", (entry.industries ?? []).join(", ")]
    .filter((part) => part.trim().length > 0)
    .join(". ")

type Embedder = (texts: string[]) => Promise<Float32Array>

/**
 * Lazily loads transformers.js.
 *
 * The dependency is ~536MB (onnxruntime-node) and is only needed by authoring commands,
 * so it is imported at call time. That keeps `pnpm data --help` and every other action
 * from paying for it.
 */
const loadEmbedder = async (): Promise<Embedder> => {
  const { pipeline, env } = await import("@huggingface/transformers")

  // Cache models inside the repo's existing model directory convention rather than the
  // user's home, so a clean checkout re-downloads once instead of probing several paths.
  env.cacheDir = process.env.ALTERNATIVES_MODEL_CACHE ?? path.join(indexDir, "models")

  const extractor = await pipeline("feature-extraction", MODEL_ID, { dtype: "q8" })

  return async (texts: string[]): Promise<Float32Array> => {
    const output = await extractor(texts, { pooling: "mean", normalize: true })
    const dims = output.dims
    const lastDimension = dims[dims.length - 1]

    if (lastDimension !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Model returned ${String(lastDimension)} dimensions, expected ${EMBEDDING_DIMENSIONS}.`)
    }

    // `data` is typed as a union (it can be BigInt64Array for other tasks). Feature
    // extraction with float pooling always yields floats, and anything else would corrupt
    // every later comparison, so this narrows explicitly rather than casting.
    if (!(output.data instanceof Float32Array)) {
      throw new Error(`Model returned ${output.data.constructor.name} rather than Float32Array.`)
    }

    return new Float32Array(output.data)
  }
}

/** Quantizes unit-range floats to int8 so the committed sidecar stays small. */
export const quantizeToInt8 = (vector: Float32Array): Int8Array => {
  const out = new Int8Array(vector.length)
  for (let i = 0; i < vector.length; i++) {
    const value = vector[i]
    if (value === undefined) {
      throw new Error(`Vector has a hole at index ${i}.`)
    }
    out[i] = Math.max(-127, Math.min(127, Math.round(value * 127)))
  }
  return out
}

/**
 * Cosine similarity for int8-quantized vectors. Scaling by 127 cancels in the ratio.
 *
 * `dimensions` is required rather than inferred from `a.length`: a caller whose query
 * vector is the wrong width would otherwise compare against a truncated slice of `b` and
 * silently return a plausible-looking number instead of failing.
 */
export const cosineInt8 = (a: Int8Array, b: Int8Array, offset: number, dimensions: number): number => {
  if (a.length !== dimensions) {
    throw new Error(`Query vector has ${a.length} dimensions, expected ${dimensions}.`)
  }
  if (b.length < offset + dimensions) {
    throw new Error(
      `Stored vector block at offset ${offset} is shorter than ${dimensions} dimensions (have ${b.length - offset}).`
    )
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < dimensions; i++) {
    const av = a[i]
    const bv = b[offset + i]
    if (av === undefined || bv === undefined) {
      throw new Error(`Vector index out of range at ${i} (offset ${offset}).`)
    }
    dot += av * bv
    normA += av * av
    normB += bv * bv
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) {
    throw new Error("Zero-length vector encountered while scoring.")
  }

  return dot / denominator
}

/** Builds the sidecar from corpus entries. Writes vectors and metadata atomically. */
export const buildIndex = async (
  entries: ReadonlyArray<{ name: string; description?: string; industries?: string[] }>,
  corpusHash: string
): Promise<IndexMeta> => {
  const embed = await loadEmbedder()
  const vectors: Int8Array[] = []

  const BATCH_SIZE = 256
  for (let start = 0; start < entries.length; start += BATCH_SIZE) {
    const batch = entries.slice(start, start + BATCH_SIZE)
    const embedded = await embed(batch.map(buildCorpusText))

    if (embedded.length !== batch.length * EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding batch returned ${embedded.length} values, expected ${batch.length * EMBEDDING_DIMENSIONS}.`
      )
    }

    for (let i = 0; i < batch.length; i++) {
      vectors.push(quantizeToInt8(embedded.subarray(i * EMBEDDING_DIMENSIONS, (i + 1) * EMBEDDING_DIMENSIONS)))
    }

    if (start % 4096 === 0) {
      log(`Embedded ${Math.min(start + BATCH_SIZE, entries.length)}/${entries.length}`)
    }
  }

  const meta: IndexMeta = {
    formatVersion: INDEX_FORMAT_VERSION,
    model: MODEL_ID,
    dimensions: EMBEDDING_DIMENSIONS,
    count: vectors.length,
    corpusHash,
    names: entries.map((entry) => entry.name)
  }

  fs.mkdirSync(indexDir, { recursive: true })

  const combined = new Int8Array(vectors.length * EMBEDDING_DIMENSIONS)
  vectors.forEach((vector, i) => combined.set(vector, i * EMBEDDING_DIMENSIONS))

  fs.writeFileSync(vectorsPath, Buffer.from(combined.buffer, combined.byteOffset, combined.byteLength))
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf-8")

  log(`Wrote ${vectors.length} vectors to ${vectorsPath}`)
  return meta
}

/** Loads the sidecar, failing loudly when missing, malformed or built by another format. */
export const loadIndex = (): { meta: IndexMeta; vectors: Int8Array } => {
  if (!fs.existsSync(metaPath) || !fs.existsSync(vectorsPath)) {
    throw new Error(
      `Similarity index missing. Run 'pnpm data --action alternatives-index' to build it before querying.`
    )
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(metaPath, "utf-8"))
  const meta = IndexMetaSchema.parse(parsed)

  if (meta.formatVersion !== INDEX_FORMAT_VERSION) {
    throw new Error(
      `Index format ${meta.formatVersion} does not match expected ${INDEX_FORMAT_VERSION}. Rebuild the index.`
    )
  }

  const buffer = fs.readFileSync(vectorsPath)
  const expectedBytes = meta.count * meta.dimensions

  if (buffer.byteLength !== expectedBytes) {
    throw new Error(
      `Index vectors are ${buffer.byteLength} bytes but metadata implies ${expectedBytes}. The sidecar is corrupt; rebuild it.`
    )
  }

  return {
    meta,
    vectors: new Int8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }
}

/**
 * Rejects a query against a stale index.
 *
 * A stale index still returns plausible-looking neighbours, computed against companies
 * that may have been removed or renamed. Silent wrongness in an evidence-bearing dataset
 * is worse than an error, so this throws.
 */
export const assertIndexFresh = (meta: IndexMeta, corpusHash: string): void => {
  if (meta.corpusHash !== corpusHash) {
    throw new Error(
      `Similarity index is stale: built from corpus ${meta.corpusHash}, current corpus is ${corpusHash}. ` +
        "Run 'pnpm data --action alternatives-index' to rebuild it."
    )
  }
}

/** Scores every indexed company against the profile text and returns them best-first. */
export const rankBySimilarity = async (
  profileText: string,
  corpus: ReadonlyArray<{ name: string; description?: string; industries?: string[]; id: string }>,
  limit?: number
): Promise<SimilarityHit[]> => {
  const { meta, vectors } = loadIndex()
  const embed = await loadEmbedder()

  const query = await embed([profileText])
  const queryVector = quantizeToInt8(query)

  const rowsByName = new Map(corpus.map((entry) => [entry.name, entry]))

  const hits: SimilarityHit[] = []
  for (let i = 0; i < meta.count; i++) {
    const name = meta.names[i]
    if (name === undefined) {
      throw new Error(`Index metadata is shorter than its vector count at position ${i}.`)
    }

    const score = cosineInt8(queryVector, vectors, i * meta.dimensions, meta.dimensions)
    const row = rowsByName.get(name)
    if (row === undefined) {
      throw new Error(
        `Index contains "${name}" which is not in the current corpus. The index is stale — rebuild it.`
      )
    }

    hits.push({
      name,
      score,
      industries: row.industries ?? [],
      ...(row.description !== undefined ? { description: row.description } : {}),
      id: row.id
    })
  }

  hits.sort((a, b) => b.score - a.score)
  return limit === undefined ? hits : hits.slice(0, limit)
}

/** Keeps only hits carrying at least one of the selected industries. */
export const gateByIndustries = (hits: readonly SimilarityHit[], industries: readonly string[]): SimilarityHit[] => {
  if (industries.length === 0) {
    throw new Error("Refusing to gate on an empty industry set: that would silently keep everything or nothing.")
  }

  const wanted = new Set(industries)
  return hits.filter((hit) => hit.industries.some((industry) => wanted.has(industry)))
}
