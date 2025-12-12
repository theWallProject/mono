/**
 * Type declarations for test mode utilities
 */

declare global {
  interface Window {
    TEST_MODE?: boolean
  }

  namespace NodeJS {
    interface ProcessEnv {
      TEST_MODE?: string
    }
  }
}

export {}
