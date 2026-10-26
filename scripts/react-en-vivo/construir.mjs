// Construye el React que se ejecuta DENTRO del iframe de los bloques
// react-en-vivo y react-anotado, y el Testing Library de sus comprobaciones.
//
// Es un paquete aislado, con su propio package.json y lockfile, porque la
// web sigue en su propia versión de React: el sandbox lleva la versión que
// enseña el temario y no debe arrastrar a la web (ni al revés).
//
// Solo se ejecuta al cambiar de versión de React:
//   cd scripts/react-en-vivo && npm ci && npm run construir
// La salida se commitea en public/vendor/react-en-vivo/<versión>/, igual que
// public/ts-libs/. La versión va en la ruta para poder servirla con caché
// inmutable (ver vercel.json): una versión nueva es una ruta nueva.
//
// Build de DESARROLLO a propósito: trae los avisos que enseñan ("Each child
// in a list should have a unique key", reglas de los hooks...). Minificado
// para que no pese el doble. Ver specs/features/react-en-vivo.md.
import { build } from 'esbuild'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const { version } = JSON.parse(readFileSync(new URL('./node_modules/react/package.json', import.meta.url)))
const destino = fileURLToPath(new URL(`../../public/vendor/react-en-vivo/${version}/`, import.meta.url))

const kb = (n) => `${Math.round(n / 1024)} KB`

for (const [entrada, salida] of [
  ['entrada-react.js', 'react.js'],
  ['entrada-pruebas.js', 'pruebas.js'],
]) {
  await build({
    entryPoints: [fileURLToPath(new URL(entrada, import.meta.url))],
    outfile: destino + salida,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    minify: true,
    legalComments: 'eof',
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'error',
  })
  const bytes = readFileSync(destino + salida)
  console.log(`${version}/${salida}: ${kb(bytes.length)} (gzip ${kb(gzipSync(bytes, { level: 9 }).length)})`)
}

const paqueteRouter = JSON.parse(
  readFileSync(new URL('./node_modules/react-router/package.json', import.meta.url)),
)
const versionRouter = paqueteRouter.version
const destinoRouter = fileURLToPath(
  new URL(`../../public/vendor/react-en-vivo/react-router/${versionRouter}/`, import.meta.url),
)
const reactCompartido = {
  name: 'react-compartido',
  setup(construccion) {
    construccion.onResolve({ filter: /^react(-dom)?(?:\/.*)?$/ }, ({ path }) => ({
      path,
      namespace: 'react-compartido',
    }))
    construccion.onLoad({ filter: /.*/, namespace: 'react-compartido' }, ({ path }) => {
      const expresiones = {
        react: 'globalThis.__reactEnVivo.React',
        'react-dom': 'globalThis.__reactEnVivo.ReactDOM',
        'react-dom/client': 'globalThis.__reactEnVivo.ReactDOMClient',
        'react/jsx-runtime': 'globalThis.__reactEnVivo.JsxRuntime',
      }
      const expresion = expresiones[path]
      if (!expresion) return { errors: [{ text: `React Router importa una ruta de React no admitida: ${path}` }] }
      return { contents: `module.exports = ${expresion}` }
    })
  },
}

const resultadoRouter = await build({
  entryPoints: [fileURLToPath(new URL('./entrada-react-router.js', import.meta.url))],
  outfile: destinoRouter + 'react-router.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  minify: true,
  legalComments: 'eof',
  define: { 'process.env.NODE_ENV': '"development"' },
  conditions: ['development'],
  metafile: true,
  plugins: [reactCompartido],
  logLevel: 'error',
})
if (
  Object.keys(resultadoRouter.metafile.inputs).some((ruta) =>
    /node_modules\/(react|react-dom|scheduler)\//.test(ruta.replaceAll('\\', '/')),
  )
) {
  throw new Error('React Router ha empaquetado su propia copia de React')
}
const bytesRouter = readFileSync(destinoRouter + 'react-router.js')
console.log(
  `${versionRouter}/react-router.js: ${kb(bytesRouter.length)} (gzip ${kb(gzipSync(bytesRouter, { level: 9 }).length)})`,
)

const raizNodeModules = fileURLToPath(new URL('./node_modules/', import.meta.url))
const raizTiposRouter = join(raizNodeModules, 'react-router/dist/production')
const rutasTiposRouter = readdirSync(raizTiposRouter, { recursive: true })
  .filter((ruta) => typeof ruta === 'string' && ruta.endsWith('.d.ts'))
  .map((ruta) => join(raizTiposRouter, ruta))
const rutasTipos = [
  join(raizNodeModules, 'react-router/package.json'),
  ...rutasTiposRouter,
  join(raizNodeModules, 'cookie-es/package.json'),
  join(raizNodeModules, 'cookie-es/dist/index.d.mts'),
]
const archivosTipos = Object.fromEntries(
  rutasTipos
    .map((ruta) => [relative(raizNodeModules, ruta).replaceAll('\\', '/'), readFileSync(ruta, 'utf8')])
    .sort(([a], [b]) => a.localeCompare(b)),
)
const tiposJson = `${JSON.stringify({ version: versionRouter, archivos: archivosTipos })}\n`
mkdirSync(destinoRouter, { recursive: true })
writeFileSync(destinoRouter + 'tipos.json', tiposJson)
const bytesTipos = Object.values(archivosTipos).reduce(
  (total, contenido) => total + Buffer.byteLength(contenido),
  0,
)
console.log(`${versionRouter}/tipos.json: ${Object.keys(archivosTipos).length} archivos, ${kb(bytesTipos)}`)
