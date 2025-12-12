import type { BrowserContext } from "playwright"

import { HINT_DISMISSED_PERM_PREFIX, HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { getExtensionPopupUrl } from "./browser"

/**
 * Backup current storage state
 */
export async function backupStorage(context: BrowserContext, extensionId: string): Promise<Record<string, unknown>> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    return await page.evaluate(() => {
      return new Promise<Record<string, unknown>>((resolve) => {
        chrome.storage.local.get(null, (items) => {
          resolve(items)
        })
      })
    })
  } finally {
    await page.close()
  }
}

/**
 * Restore storage state
 */
export async function restoreStorage(
  context: BrowserContext,
  extensionId: string,
  backup: Record<string, unknown>
): Promise<void> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    await page.evaluate((storageData: Record<string, unknown>) => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.set(storageData, () => {
          resolve()
        })
      })
    }, backup)
  } finally {
    await page.close()
  }
}

/**
 * Clear all storage (fresh install simulation)
 */
export async function clearAllStorage(context: BrowserContext, extensionId: string): Promise<void> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.clear(() => {
          chrome.storage.session.clear(() => {
            resolve()
          })
        })
      })
    })
  } finally {
    await page.close()
  }
}

/**
 * Set specific settings
 */
export async function setSettings(
  context: BrowserContext,
  extensionId: string,
  settings: Record<string, unknown>
): Promise<void> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    await page.evaluate((settingsData: Record<string, unknown>) => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.set(settingsData, () => {
          resolve()
        })
      })
    }, settings)
  } finally {
    await page.close()
  }
}

/**
 * Verify storage state
 */
export async function verifyStorage(
  context: BrowserContext,
  extensionId: string,
  expected: Record<string, unknown>
): Promise<boolean> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    const actual = await page.evaluate(() => {
      return new Promise<Record<string, unknown>>((resolve) => {
        chrome.storage.local.get(null, (items) => {
          resolve(items)
        })
      })
    })

    for (const [key, value] of Object.entries(expected)) {
      if (actual[key] !== value) {
        return false
      }
    }
    return true
  } finally {
    await page.close()
  }
}

/**
 * Simulate fresh install (clear all storage)
 */
export async function simulateFreshInstall(context: BrowserContext, extensionId: string): Promise<void> {
  await clearAllStorage(context, extensionId)
}

/**
 * Simulate existing user (set common settings)
 */
export async function simulateExistingUser(
  context: BrowserContext,
  extensionId: string,
  options?: {
    hintsDisabled?: boolean
    dismissedHints?: string[]
  }
): Promise<void> {
  const settings: Record<string, unknown> = {}

  if (options?.hintsDisabled !== undefined) {
    settings[HINTS_SYSTEM_DISABLED_KEY] = options.hintsDisabled
  }

  if (options?.dismissedHints) {
    for (const hintId of options.dismissedHints) {
      settings[`${HINT_DISMISSED_PERM_PREFIX}${hintId}`] = true
    }
  }

  if (Object.keys(settings).length > 0) {
    await setSettings(context, extensionId, settings)
  }
}
