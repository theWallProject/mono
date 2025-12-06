import js from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import importPlugin from "eslint-plugin-import"
import promise from "eslint-plugin-promise"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
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
    "packages/scrapper/dist/**"
  ]
}

// Base configuration - shared across ALL packages (common JS/TS rules)
const baseConfig = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  languageOptions: {
    parser: tsparser,
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: {
    "@typescript-eslint": tseslint
  },
  rules: {
    // JavaScript recommended rules (shared)
    ...js.configs.recommended.rules,
    // TypeScript recommended rules (shared)
    ...tseslint.configs.recommended.rules,
    // Common TypeScript rules for all packages
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    // Common JavaScript rules for all packages
    "prefer-const": "error",
    "no-var": "error"
  }
}

// Node.js specific overrides - only adds Node globals and promise rules
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
  plugins: {
    promise
  },
  rules: {
    // Override base TypeScript rules with strict rules for Node.js packages
    ...tseslint.configs.strict.rules,
    "no-undef": "off", // TypeScript handles this
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        assertionStyle: "never"
      }
    ],
    // Promise-specific rules (only for Node.js packages)
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
    "promise/no-multiple-resolved": "error"
  }
}

// React/Browser Extension specific overrides - only adds React plugins and browser globals
const reactConfig = {
  files: ["packages/addon/src/**/*.{js,jsx,ts,tsx}", "packages/addon/TRANSLATIONS/**/*.ts"],
  languageOptions: {
    globals: {
      // Browser/Extension globals (only for React package)
      browser: true,
      chrome: true,
      window: true,
      document: true,
      console: true,
      setTimeout: true,
      clearTimeout: true,
      setInterval: true,
      clearInterval: true,
      requestAnimationFrame: true,
      cancelAnimationFrame: true,
      fetch: true,
      URL: true,
      HTMLCanvasElement: true,
      HTMLButtonElement: true,
      HTMLDivElement: true,
      Image: true,
      File: true,
      navigator: true,
      location: true,
      WebSocket: true,
      MessageChannel: true,
      performance: true,
      atob: true,
      btoa: true,
      NodeJS: true,
      MouseEvent: true
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

// File-specific overrides (only when absolutely necessary)
const fileOverrides = [
  {
    files: ["packages/addon/src/helpers.ts", "packages/addon/TRANSLATIONS/generate.ts"],
    rules: {
      "no-console": "off" // Allow console in helper files
    }
  },
  {
    files: ["packages/addon/src/ui/TextScramble.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off" // Disable exhaustive deps for this specific component
    }
  }
]

export default [globalIgnores, baseConfig, nodeConfig, reactConfig, ...fileOverrides]
