declare module "*.gltf" {
  const value: string
  export default value
}

declare global {
  interface Window {
    // Test mode flag set by test setup
    TEST_MODE?: boolean
  }
}

export {}
