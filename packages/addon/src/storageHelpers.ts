import { error, log } from "./helpers"

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  log(`getStorageItem getting key[${key}]`)
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.session.get([key], (result) => {
        log(`getStorageItem got key[${key}] result`, result[key])

        resolve((result[key] as T) || null)
      })
    } catch (e) {
      error(`getStorageItem error: ${key}`, e)

      reject(e)
    }
  })
}

export const setStorageItem = async <T>(
  key: string,
  value: T
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.session.set({ [key]: value }, () => {
        log(`setStorageItem setting key[${key}] with value`, value)

        resolve()
      })
    } catch (e) {
      error(`setStorageItem error: ${key} ${value}`, e)
      reject(e)
    }
  })
}

export const getLocalStorageItem = async <T>(key: string): Promise<T | null> => {
  log(`getLocalStorageItem getting key[${key}]`)
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([key], (result) => {
        log(`getLocalStorageItem got key[${key}] result`, result[key])

        resolve((result[key] as T) || null)
      })
    } catch (e) {
      error(`getLocalStorageItem error: ${key}`, e)

      reject(e)
    }
  })
}

export const setLocalStorageItem = async <T>(
  key: string,
  value: T
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [key]: value }, () => {
        log(`setLocalStorageItem setting key[${key}] with value`, value)

        resolve()
      })
    } catch (e) {
      error(`setLocalStorageItem error: ${key} ${value}`, e)
      reject(e)
    }
  })
}

export const removeLocalStorageItems = async (keys: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, () => {
        log(`removeLocalStorageItems removed keys`, keys)
        resolve()
      })
    } catch (e) {
      error(`removeLocalStorageItems error: ${keys}`, e)
      reject(e)
    }
  })
}

export const getAllLocalStorageItems = async (): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(null, (items) => {
        log(`getAllLocalStorageItems got ${Object.keys(items).length} items`)
        resolve(items)
      })
    } catch (e) {
      error(`getAllLocalStorageItems error`, e)
      reject(e)
    }
  })
}
