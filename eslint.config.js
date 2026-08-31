import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    // public/ts-libs: ficheros lib.*.d.ts vendorizados tal cual desde
    // typescript-en-vivo (ver scripts/dev/generar-ts-libs.mjs) para el
    // compilador de TypeScript en vivo del navegador — no son código propio,
    // no tiene sentido aplicarles las reglas de este proyecto.
    ignores: ['dist', 'public/ts-libs'],
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
)
