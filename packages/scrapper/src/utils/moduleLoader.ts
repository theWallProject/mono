/**
 * Clear require cache for a module path
 * Required for hot-reloading manual additions/overrides during development
 */
export function clearRequireCache(modulePath: string): void {
  const resolvedPath = require.resolve(modulePath)
  Reflect.deleteProperty(require.cache, resolvedPath)
}

/**
 * Load a module dynamically with cache clearing
 * Required for dynamic module loading of manual additions/overrides
 * @param modulePath - Path to the module to load
 * @returns The loaded module
 * @throws Error if module fails to load
 */
export function loadModule<T>(modulePath: string): T {
  const resolvedPath = require.resolve(modulePath)
  clearRequireCache(resolvedPath)
  const module = require(resolvedPath)
  if (!module) {
    throw new Error(`Failed to load module: ${modulePath}`)
  }
  return module as T
}
