// Worker del linter de los hooks (eslint/universal + eslint-plugin-react-hooks,
// configuración recommended-latest). Recibe { id, tipo: 'lint', archivos } y
// responde { id, ok, diagnosticos } o { id, ok: false, error }.
import { Linter } from 'eslint/universal'
import reactHooks from 'eslint-plugin-react-hooks'
import { transform } from 'sucrase'

const linter = new Linter({ configType: 'flat' })
const configuracion = [
  {
    files: ['**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
]

self.onmessage = (mensaje) => {
  const { id, tipo, archivos } = mensaje.data || {}
  if (tipo !== 'lint' || !Array.isArray(archivos)) return
  try {
    const diagnosticos = []
    for (const archivo of archivos) {
      if (!/\.(jsx|tsx)$/.test(archivo.nombre)) continue
      // El parser de ESLint no entiende TypeScript: en un .tsx se quitan los
      // tipos con Sucrase (conserva las líneas y deja el JSX tal cual) antes de
      // pasarlo.
      const codigo = archivo.nombre.endsWith('.tsx')
        ? transform(archivo.codigo, {
            transforms: ['typescript', 'jsx'],
            jsxRuntime: 'preserve',
            disableESTransforms: true,
            keepUnusedImports: true,
          }).code
        : archivo.codigo
      // Siempre con nombre .tsx: con .jsx el plugin analiza con hermes-parser,
      // que no arranca en el navegador, y sus reglas del compilador callan.
      const nombre = archivo.nombre.replace(/\.(jsx|tsx)$/, '.tsx')
      for (const m of linter.verify(codigo, configuracion, nombre)) {
        diagnosticos.push({
          archivo: archivo.nombre,
          linea: m.line ?? 1,
          columna: m.column ?? 1,
          regla: m.ruleId ?? null,
          mensaje: String(m.message).slice(0, 2000),
          severidad: m.severity === 2 ? 'error' : 'aviso',
        })
      }
    }
    self.postMessage({ id, ok: true, diagnosticos })
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.message ?? error).slice(0, 2000) })
  }
}
