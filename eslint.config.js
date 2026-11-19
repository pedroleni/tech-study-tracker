import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'

export default tseslint.config(
  {
    // public/ts-libs: ficheros lib.*.d.ts vendorizados tal cual desde
    // typescript-en-vivo (ver scripts/dev/generar-ts-libs.mjs) para el
    // compilador de TypeScript en vivo del navegador — no son código propio,
    // no tiene sentido aplicarles las reglas de este proyecto. Lo mismo con
    // public/vendor: código de terceros empaquetado, como el React
    // minificado que se ejecuta dentro del iframe de react-en-vivo (ver
    // scripts/react-en-vivo/construir.mjs).
    ignores: ['dist', 'public/ts-libs', 'public/vendor'],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui generated components: each file exports both the component
    // and its cva() variants function by design (the standard shadcn
    // pattern) — these are vendored files, not hand-authored, so the
    // fast-refresh export-shape rule doesn't apply.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Normas de clean code (docs/clean-code.md). Lo que el código anterior ya incumplía está
  // congelado en eslint-suppressions.json: solo puede bajar (`npm run clean-code:podar`).
  {
    files: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
    ignores: ['src/components/ui/**'],
    plugins: { sonarjs },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      'max-nested-callbacks': ['error', 4],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'no-nested-ternary': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'prefer-const': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
    },
  },
  // Los componentes llevan JSX: algo más de margen por función.
  {
    files: ['src/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
  // Los tests se leen como una lista de casos: sin límite de longitud, con describe/it anidados.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-nested-callbacks': ['error', 6],
      'sonarjs/no-identical-functions': 'off',
    },
  },
)
