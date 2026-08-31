// Copia los ficheros que wasm-git necesita en el navegador desde
// node_modules/wasm-git/ a public/ — el motor de Git los carga sin
// depender de ningún CDN en producción. Se ejecuta una vez (o cada vez
// que cambie la versión de wasm-git) y los resultados se comitean,
// siguiendo el patrón de generar-sql-wasm.mjs/generar-pglite-wasm.mjs.
//
// Uso: npm run generar-wasmgit-assets

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const directorioOrigen = dirname(require.resolve('wasm-git/lg2_async.js'))
const directorioDestino = join(process.cwd(), 'public')

mkdirSync(directorioDestino, { recursive: true })

// lg2-async.wasm (con guion, no guion bajo) porque motor.ts hace
// fetch('/lg2-async.wasm') — el nombre real del paquete usa guion bajo
// (lg2_async.wasm); se renombra al copiar para mantener las rutas de
// public/ consistentes con el resto de assets del proyecto (sql-wasm.wasm,
// pglite.wasm, sin guiones bajos).
copyFileSync(join(directorioOrigen, 'lg2_async.wasm'), join(directorioDestino, 'lg2-async.wasm'))
console.log('generar-wasmgit-assets: copiado lg2_async.wasm -> public/lg2-async.wasm')

copyFileSync(join(directorioOrigen, 'COPYING'), join(directorioDestino, 'wasm-git-COPYING.txt'))
console.log('generar-wasmgit-assets: copiado COPYING -> public/wasm-git-COPYING.txt (licencia)')
