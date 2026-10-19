/**
 * Single-instance lock for the Homepage AI Extractor.
 *
 * Running two extractor runs concurrently corrupts state: both write
 * manualOverrides.ts / retry_list.json and both `git add .`/commit, racing on
 * the git index and interleaving partial results. This guard makes a second
 * run fail fast instead of silently corrupting data.
 *
 * The lock is a PID file under the (gitignored) logs directory. A stale lock
 * left by a SIGKILLed process is detected via `process.kill(pid, 0)` and
 * reclaimed.
 */

import fs from "fs"
import path from "path"
import { z } from "zod"

import { log } from "../../helper"

const LOCK_DIR = path.join(__dirname, "../../../logs/homepage_ai_extractor")
const LOCK_FILE = path.join(LOCK_DIR, "run.lock")

const LockInfoSchema = z.object({
  pid: z.number(),
  label: z.string(),
  startedAt: z.string()
})

type LockInfo = z.infer<typeof LockInfoSchema>

/** Returns true if a process with the given PID is currently alive. */
const isPidAlive = (pid: number): boolean => {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    // Signal 0 performs error checking without sending a signal.
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/** Read the current lock file, tolerating a missing/corrupt file. */
const readLock = (): Partial<LockInfo> => {
  try {
    const parsed = LockInfoSchema.partial().safeParse(JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8")))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

/**
 * Acquire the single-instance lock. Throws if another live run holds it.
 * A stale lock (dead PID) is reclaimed automatically.
 */
export const acquireBatchLock = (label: string): void => {
  fs.mkdirSync(LOCK_DIR, { recursive: true })

  if (fs.existsSync(LOCK_FILE)) {
    const existing = readLock()

    if (existing.pid && isPidAlive(existing.pid)) {
      throw new Error(
        `Refusing to start: a homepage extractor run is already active ` +
          `(pid ${existing.pid}, mode "${existing.label ?? "unknown"}", ` +
          `started ${existing.startedAt ?? "unknown"}).\n` +
          `Only one run may modify the database at a time.\n` +
          `If that process is gone, delete ${LOCK_FILE} and retry.`
      )
    }

    log(`Reclaiming stale run lock (pid ${existing.pid ?? "unknown"} is not alive)`)
    fs.rmSync(LOCK_FILE, { force: true })
  }

  // Exclusive create — atomic; throws if another process won the race.
  let fd: number
  try {
    fd = fs.openSync(LOCK_FILE, "wx")
  } catch {
    throw new Error(
      `Refusing to start: another homepage extractor run acquired the lock first (${LOCK_FILE}).\n` +
        `Only one run may modify the database at a time.`
    )
  }
  const info: LockInfo = { pid: process.pid, label, startedAt: new Date().toISOString() }
  fs.writeSync(fd, JSON.stringify(info))
  fs.closeSync(fd)

  let released = false
  const release = (): void => {
    if (released) return
    released = true
    // Only remove the lock if it is still ours.
    if (readLock().pid === process.pid) {
      fs.rmSync(LOCK_FILE, { force: true })
    }
  }

  process.once("exit", release)
  process.once("SIGINT", () => {
    release()
    process.exit(130)
  })
  process.once("SIGTERM", () => {
    release()
    process.exit(143)
  })

  log(`Acquired run lock (pid ${process.pid}, mode "${label}")`)
}
