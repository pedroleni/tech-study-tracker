// Copia los dos ficheros que PGlite necesita en el navegador desde
// node_modules/@electric-sql/pglite/dist/ a public/ — el motor de
// Postgres los carga sin depender de ningún CDN en producción. Se ejecuta
// una vez (o cada vez que cambie la versión de PGlite) y los resultados se
// comitean, siguiendo el patrón de generar-sql-wasm.mjs.
//
// Uso: npm run generar-pglite-wasm

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const directorioOrigen = dirname(require.resolve('@electric-sql/pglite'))
const directorioDestino = join(process.cwd(), 'public')
const nombres = ['pglite.wasm', 'pglite.data']

mkdirSync(directorioDestino, { recursive: true })

for (const nombre of nombres) {
  const origen = join(directorioOrigen, nombre)
  const destino = join(directorioDestino, nombre)
  copyFileSync(origen, destino)
  console.log(`generar-pglite-wasm: copiado ${origen} -> ${destino}`)
}
