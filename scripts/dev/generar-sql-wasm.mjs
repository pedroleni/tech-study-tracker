// Copia public/sql-wasm.wasm desde node_modules/sql.js/dist/ - el binario
// que src/lib/sql-en-vivo/motor.ts carga en el navegador (fetch('/sql-wasm.wasm'))
// sin depender de ningún CDN en producción. Se ejecuta una vez (o cada vez
// que cambie la versión de sql.js en package.json) y el resultado se
// comitea - no se regenera en cada build.
//
// Uso: npm run generar-sql-wasm

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const origen = require.resolve('sql.js/dist/sql-wasm.wasm')
const directorioDestino = join(process.cwd(), 'public')
const destino = join(directorioDestino, 'sql-wasm.wasm')

mkdirSync(directorioDestino, { recursive: true })
copyFileSync(origen, destino)

console.log(`generar-sql-wasm: copiado ${origen} -> ${destino}`)
