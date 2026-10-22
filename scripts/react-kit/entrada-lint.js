// Worker del linter de los hooks (eslint/universal + eslint-plugin-react-hooks,
// configuración recommended-latest). Recibe { id, tipo: 'lint', archivos } y
// responde { id, ok, diagnosticos } o { id, ok: false, error }. Cada archivo se
// analiza por separado: un error de sintaxis en uno es un diagnóstico de ese
// archivo, no un fallo de todos. Los límites son los del esquema de cliente.ts.
import { Linter } from 'eslint/universal'
import reactHooks from 'eslint-plugin-react-hooks'
import { transform } from 'sucrase'

const MAX_DIAGNOSTICOS = 200
const MAX_MENSAJE = 2000

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

const diagnosticar = (archivo) => {
  const esTsx = archivo.nombre.endsWith('.tsx')
  // Siempre con nombre .tsx: con .jsx el plugin analiza con hermes-parser,
  // que no arranca en el navegador, y sus reglas del compilador callan.
  const nombreAnalizado = archivo.nombre.replace(/\.(jsx|tsx)$/, '.tsx')
  let codigo = archivo.codigo
  if (esTsx) {
    // El parser de ESLint no entiende TypeScript: se quitan los tipos con
    // Sucrase, que conserva las líneas pero no las columnas (columna 0 =
    // desconocida; la página enseña solo la línea).
    codigo = transform(archivo.codigo, {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'preserve',
      disableESTransforms: true,
      keepUnusedImports: true,
    }).code
  }
  return linter.verify(codigo, configuracion, nombreAnalizado).map((m) => ({
    archivo: archivo.nombre,
    linea: m.line ?? 1,
    columna: esTsx ? 0 : (m.column ?? 0),
    regla: m.ruleId ?? null,
    // Los mensajes largos del compilador citan el archivo analizado: se
    // devuelve su nombre real.
    mensaje: String(m.message).split(nombreAnalizado).join(archivo.nombre).slice(0, MAX_MENSAJE),
    severidad: m.severity === 2 ? 'error' : 'aviso',
  }))
}

self.onmessage = (mensaje) => {
  const { id, tipo, archivos } = mensaje.data || {}
  if (tipo !== 'lint' || !Array.isArray(archivos)) return
  const diagnosticos = []
  for (const archivo of archivos) {
    if (!archivo || typeof archivo.nombre !== 'string' || typeof archivo.codigo !== 'string') continue
    if (!/\.(jsx|tsx)$/.test(archivo.nombre)) continue
    try {
      diagnosticos.push(...diagnosticar(archivo))
    } catch (error) {
      // Sucrase lanza con un .tsx que no se puede analizar: como en un .jsx,
      // es un error de sintaxis de ese archivo.
      const posicion = /\((\d+):(\d+)\)/.exec(String(error?.message ?? ''))
      diagnosticos.push({
        archivo: archivo.nombre,
        linea: posicion ? Number(posicion[1]) : 1,
        columna: 0,
        regla: null,
        mensaje: ('Parsing error: ' + String(error?.message ?? error)).slice(0, MAX_MENSAJE),
        severidad: 'error',
      })
    }
  }
  self.postMessage({ id, ok: true, diagnosticos: diagnosticos.slice(0, MAX_DIAGNOSTICOS) })
}
