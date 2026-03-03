import js from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import suppressApprovedPlugin from "@vibelint/eslint-plugin-vibelint"
import eslintComments from "eslint-plugin-eslint-comments"
import importPlugin from "eslint-plugin-import"
import promise from "eslint-plugin-promise"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import vitest from "eslint-plugin-vitest"
import globals from "globals"

// Global ignores for all packages
const globalIgnores = {
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.plasmo/**",
    "**/*.min.js",
    "**/*.d.ts",
    "**/*.css.d.ts",
    "packages/addon/build-scripts/**",
    "packages/scrapper/results/**",
    "packages/scrapper/dist/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/.playwright/**",
    // Files not in tsconfig.json projects
    "packages/common/scripts/**",
    "packages/common/vitest.config.ts",
    "packages/scrapper/vitest.config.ts",
    "packages/scrapper/src/tmp.js",
    "packages/telegram-bot/scripts/**"
  ]
}

// Base configuration - shared across ALL packages (common JS/TS rules)
const baseConfig = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  languageOptions: {
    parser: tsparser,
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      project: [
        "packages/addon/tsconfig.json",
        "packages/common/tsconfig.json",
        "packages/scrapper/tsconfig.json",
        "packages/telegram-bot/tsconfig.json"
      ],
      tsconfigRootDir: import.meta.dirname || process.cwd()
    }
  },
  plugins: {
    "@typescript-eslint": tseslint,
    "eslint-comments": eslintComments,
    promise
  },
  rules: {
    // JavaScript recommended rules (shared)
    ...js.configs.recommended.rules,
    // TypeScript recommended rules (shared)
    ...tseslint.configs.recommended.rules,
    // Common TypeScript rules for all packages
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-dynamic-delete": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-assertions": [
      "warn",
      {
        assertionStyle: "never"
      }
    ],
    // CRITICAL: Type-aware promise rules (requires parserOptions.project)
    "@typescript-eslint/no-floating-promises": "error", // Catch unawaited promises
    "@typescript-eslint/no-misused-promises": "error", // Prevent async in wrong contexts
    "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
    "@typescript-eslint/promise-function-async": "warn", // Functions returning promises should be async
    "@typescript-eslint/require-await": "warn", // Async functions should use await
    // Common JavaScript rules for all packages
    "prefer-const": "error",
    "no-var": "error",
    // Promise rules for all packages
    "promise/always-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/catch-or-return": "error",
    "promise/no-native": "off",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "off",
    "promise/no-new-statics": "error",
    "promise/no-return-in-finally": "warn",
    "promise/valid-params": "warn",
    "promise/no-multiple-resolved": "error",
    "promise/prefer-await-to-then": "off", // Prefer async/await over .then()
    // Warn on all eslint-disable comments
    "eslint-comments/no-use": ["warn", { allow: [] }],
    "eslint-comments/no-unlimited-disable": "warn",
    "eslint-comments/no-unused-disable": "warn",
    "eslint-comments/no-unused-enable": "warn",
    "eslint-comments/require-description": "warn"
  }
}

// Node.js specific overrides - only adds Node globals and strict TypeScript rules
const nodeConfig = {
  files: [
    "packages/scrapper/**/*.{js,ts}",
    "packages/telegram-bot/**/*.{js,ts}",
    "packages/common/**/*.{js,ts}",
    "scripts/**/*.{js,ts}"
  ],
  languageOptions: {
    globals: {
      ...globals.node
    }
  },
  rules: {
    // Override base TypeScript rules with strict rules for Node.js packages
    ...tseslint.configs.strict.rules,
    "no-undef": "off", // TypeScript handles this
    "@typescript-eslint/consistent-type-assertions": [
      "warn",
      {
        assertionStyle: "never"
      }
    ],
    // Allow dynamic delete for require.cache (legitimate use case for hot-reloading)
    "@typescript-eslint/no-dynamic-delete": "warn",
    // Allow require() in Node.js (legitimate for dynamic module loading and cache management)
    "@typescript-eslint/no-require-imports": "warn"
    // Promise rules inherited from baseConfig (no need to duplicate)
  }
}

// React/Browser Extension specific overrides - only adds React plugins and browser globals
const reactConfig = {
  files: ["packages/addon/src/**/*.{js,jsx,ts,tsx}", "packages/addon/TRANSLATIONS/**/*.ts"],
  languageOptions: {
    globals: {
      // Browser/Extension globals (only for React package)
      ...globals.browser,
      // Extension-specific globals
      browser: true,
      chrome: true,
      // Plasmo provides process.env (https://docs.plasmo.com/framework/env)
      process: "readonly"
    }
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
    import: importPlugin
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    // React recommended rules (only for React package)
    ...react.configs.recommended.rules,
    // React Hooks recommended rules (only for React package)
    ...reactHooks.configs.recommended.rules,
    // Override base config rules for React
    "no-console": "warn", // Allow console in browser extensions
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/prop-types": "off", // Using TypeScript instead
    "react/no-unknown-property": "off", // Allow custom props
    "react-hooks/refs": "off",
    "react-hooks/purity": "off",
    // Import rules (only for React package)
    "import/no-unresolved": "off", // TypeScript handles this
    "import/no-duplicates": "error",
    // Browser extension security rules (only for React package)
    "no-restricted-globals": [
      "error",
      {
        name: "alert",
        message: "Use console.log or custom logging instead of alert() in browser extensions"
      }
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "CallExpression[callee.name='eval']",
        message: "eval() is not allowed in browser extensions for security reasons"
      },
      {
        selector: "CallExpression[callee.name='Function']",
        message: "Function constructor is not allowed in browser extensions for security reasons"
      }
    ]
  }
}

// Test files configuration
const testConfig = {
  files: ["**/*.test.ts", "**/*.test.tsx", "**/tests/**/*.ts", "**/tests/**/*.tsx"],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      project: [
        "packages/addon/tsconfig.json",
        "packages/common/tsconfig.json",
        "packages/scrapper/tsconfig.json",
        "packages/telegram-bot/tsconfig.json"
      ],
      tsconfigRootDir: import.meta.dirname || process.cwd()
    },
    globals: {
      ...globals.node,
      describe: "readonly",
      it: "readonly",
      test: "readonly",
      expect: "readonly",
      beforeEach: "readonly",
      afterEach: "readonly",
      beforeAll: "readonly",
      afterAll: "readonly",
      vi: "readonly",
      // Browser globals available in page.evaluate() context
      window: "readonly",
      chrome: "readonly",
      document: "readonly",
      HTMLElement: "readonly"
    }
  },
  plugins: {
    vitest
  },
  rules: {
    "no-console": "off", // Allow console.log in tests
    // Ensure unused variables are caught in tests
    "@typescript-eslint/no-unused-vars": "error",
    // Vitest plugin rules - prevent common test mistakes
    "vitest/no-standalone-expect": "error", // Prevent expect() outside of test/it blocks
    "vitest/valid-expect": "error", // Ensure expect() is called correctly
    "vitest/no-focused-tests": "warn", // Warn about .only() tests
    "vitest/no-disabled-tests": "warn", // Warn about .skip() tests
    "vitest/no-conditional-expect": "error", // Prevent expect() in conditionals
    "vitest/no-conditional-in-test": "warn", // Warn about conditionals in tests
    "vitest/no-test-return-statement": "error", // Prevent return in test functions
    // Prevent always-true conditions (requires type-aware linting)
    "@typescript-eslint/no-unnecessary-condition": "warn",
    // Prevent unused expressions (like expect() without assertion)
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: false,
        allowTernary: false,
        allowTaggedTemplates: false
      }
    ],
    // Prevent empty test blocks
    "no-empty": ["error", { allowEmptyCatch: true }],
    // Prevent tests with only comments
    "no-empty-function": ["warn", { allow: ["arrowFunctions"] }],
    // ?? ABSOLUTE LAST RESORT - Only use when no plugin rule exists
    // This is a hacky workaround. Always search for proper ESLint plugins first!
    // No plugin exists for detecting useless assertions like expect(true).toBe(true)
    // Checked: eslint-plugin-vitest, eslint-plugin-jest, eslint-plugin-testing-library
    "no-restricted-syntax": [
      "error",
      {
        // Match: expect(true).toBe(true) or expect(true).toEqual(true)
        // AST structure: CallExpression[callee=MemberExpression[object=CallExpression[callee=expect, args=[true]], property=toBe], args=[true]]
        selector:
          "CallExpression[callee.type='MemberExpression'][callee.object.type='CallExpression'][callee.object.callee.name='expect'][callee.object.arguments.0.value=true][callee.property.name=/^(toBe|toEqual|toStrictEqual)$/] > Literal[value=true]",
        message: "Useless assertion: expect(true).toBe(true) always passes. Write a meaningful assertion instead."
      },
      {
        // Match: expect(false).toBe(false) or expect(false).toEqual(false)
        selector:
          "CallExpression[callee.type='MemberExpression'][callee.object.type='CallExpression'][callee.object.callee.name='expect'][callee.object.arguments.0.value=false][callee.property.name=/^(toBe|toEqual|toStrictEqual)$/] > Literal[value=false]",
        message: "Useless assertion: expect(false).toBe(false) always passes. Write a meaningful assertion instead."
      }
    ]
  }
}

// File-specific overrides (only when absolutely necessary)
const fileOverrides = [
  {
    files: ["packages/addon/src/helpers.ts", "packages/addon/TRANSLATIONS/generate.ts"],
    rules: {
      "no-console": "off" // Allow console in helper files (where custom log functions are defined)
    }
  },
  {
    files: ["packages/addon/src/ui/TextScramble.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off" // Disable exhaustive deps for this specific component
    }
  },
  // Content script files - enforce use of custom log functions, error on console.*
  {
    files: [
      "packages/addon/src/content.tsx",
      "packages/addon/src/domScanner/**/*.{ts,tsx}",
      "packages/addon/src/ui/**/*.{ts,tsx}",
      "packages/addon/src/share_button/**/*.{ts,tsx}",
      "packages/addon/src/rules/**/*.{ts,tsx}",
      "packages/addon/src/storageHelpers.ts",
      "packages/addon/src/types.ts"
    ],
    rules: {
      "no-console": "error" // Error on console.* in content scripts - must use custom log functions
    }
  }
]

export default [
  globalIgnores,
  baseConfig,
  nodeConfig,
  reactConfig,
  testConfig,
  ...fileOverrides,
  ...suppressApprovedPlugin.configs.recommended
]
