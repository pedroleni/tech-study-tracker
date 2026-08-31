/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    // El pre-bundler de Vite (esbuild) reescribe la URL relativa interna
    // con la que @electric-sql/pglite localiza initdb.wasm junto a sí
    // mismo — la reescritura cae en /node_modules/.vite/deps/initdb.wasm,
    // que no existe, y el fallback de SPA sirve index.html (HTML) donde
    // se esperaba un binario WASM real. Excluirlo del pre-bundling deja
    // que el navegador sirva los ficheros del paquete tal cual están en
    // node_modules, sin reescribir esa ruta. Ver
    // specs/features/postgresql-en-vivo.md.
    exclude: ['@electric-sql/pglite'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
