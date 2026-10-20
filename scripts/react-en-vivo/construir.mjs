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
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const { version } = JSON.parse(readFileSync(new URL('./node_modules/react/package.json', import.meta.url)))
const destino = fileURLToPath(new URL(`../../public/vendor/react-en-vivo/${version}/`, import.meta.url))

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
  const kb = (n) => `${Math.round(n / 1024)} KB`
  console.log(`${version}/${salida}: ${kb(bytes.length)} (gzip ${kb(gzipSync(bytes, { level: 9 }).length)})`)
}
