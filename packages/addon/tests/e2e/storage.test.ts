import type { BrowserContext } from "playwright"
import { beforeAll, describe, expect, it } from "vitest"

import { HINT_DISMISSED_PERM_PREFIX, HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { launchBrowserWithExtension } from "../utils/browser"
import {
  backupStorage,
  clearAllStorage,
  restoreStorage,
  setSettings,
  simulateExistingUser,
  simulateFreshInstall,
  verifyStorage
} from "../utils/storage"

describe("Storage Operations", () => {
  let context: BrowserContext
  let extensionId: string

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
  })

  // Browser cleanup is handled globally in test-mode.ts

  it("should store dismissal correctly", async () => {
    await clearAllStorage(context, extensionId)

    const testKey = "test_dismissal_key"
    const testValue = Date.now()

    await setSettings(context, extensionId, { [testKey]: testValue })

    const verified = await verifyStorage(context, extensionId, { [testKey]: testValue })
    expect(verified).toBe(true)
  })

  it("should persist hints system state", async () => {
    await clearAllStorage(context, extensionId)

    // Set hints disabled
    await setSettings(context, extensionId, { [HINTS_SYSTEM_DISABLED_KEY]: true })

    // Verify it persists
    const verified = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: true
    })
    expect(verified).toBe(true)
  })

  it("should track dismissed hints", async () => {
    await clearAllStorage(context, extensionId)

    const hintId = "test_hint_123"
    const dismissedKey = `${HINT_DISMISSED_PERM_PREFIX}${hintId}`

    await setSettings(context, extensionId, { [dismissedKey]: true })

    const verified = await verifyStorage(context, extensionId, { [dismissedKey]: true })
    expect(verified).toBe(true)
  })

  it("should clear storage for fresh install", async () => {
    // Set some storage first
    await setSettings(context, extensionId, {
      test_key: "test_value",
      [HINTS_SYSTEM_DISABLED_KEY]: true
    })

    // Clear all storage
    await clearAllStorage(context, extensionId)

    // Verify storage is empty
    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })

  it("should backup and restore storage", async () => {
    await clearAllStorage(context, extensionId)

    // Set some storage
    const testData = {
      test_key: "test_value",
      another_key: 123
    }
    await setSettings(context, extensionId, testData)

    // Backup
    const backup = await backupStorage(context, extensionId)

    // Clear storage
    await clearAllStorage(context, extensionId)

    // Restore
    await restoreStorage(context, extensionId, backup)

    // Verify restored
    const verified = await verifyStorage(context, extensionId, testData)
    expect(verified).toBe(true)
  })

  it("should simulate fresh install correctly", async () => {
    // Set some storage first
    await setSettings(context, extensionId, {
      test_key: "test_value"
    })

    // Simulate fresh install
    await simulateFreshInstall(context, extensionId)

    // Storage should be empty
    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })

  it("should simulate existing user correctly", async () => {
    await clearAllStorage(context, extensionId)

    // Simulate existing user with settings
    await simulateExistingUser(context, extensionId, {
      hintsDisabled: true,
      dismissedHints: ["hint1", "hint2"]
    })

    // Verify settings
    const verified = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: true,
      [`${HINT_DISMISSED_PERM_PREFIX}hint1`]: true,
      [`${HINT_DISMISSED_PERM_PREFIX}hint2`]: true
    })
    expect(verified).toBe(true)
  })

  it("should isolate storage between test runs", async () => {
    // Each test should start with clean storage
    await clearAllStorage(context, extensionId)

    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })
})
