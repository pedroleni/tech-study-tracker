// Genera public/ts-libs/ - los ficheros lib.*.d.ts que el compilador de
// TypeScript en el navegador necesita (src/lib/typescript-en-vivo/compilar.ts)
// para no depender de ningún CDN en producción. Se ejecuta una vez (o cada
// vez que cambie la versión de typescript-en-vivo en package.json) y el
// resultado se comitea - no se regenera en cada build.
//
// Uso: npm run generar-ts-libs

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import ts from 'typescript-en-vivo'
import { knownLibFilesForCompilerOptions } from '@typescript/vfs'

const require = createRequire(import.meta.url)
const directorioLib = join(dirname(require.resolve('typescript-en-vivo/package.json')), 'lib')
const directorioDestino = join(process.cwd(), 'public', 'ts-libs')

// Debe coincidir con el target/lib que usa
// src/lib/typescript-en-vivo/compilar.ts (ver el comentario allí) - si
// cambias uno, cambia el otro y vuelve a ejecutar este script.
const nombresLib = knownLibFilesForCompilerOptions(
  { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
  ts,
)

mkdirSync(directorioDestino, { recursive: true })

let copiados = 0
let saltados = 0
for (const nombre of nombresLib) {
  const origen = join(directorioLib, nombre)
  if (!existsSync(origen)) {
    // knownLibFilesForCompilerOptions incluye nombres históricos que ya no
    // existen en esta versión de TypeScript - comportamiento documentado
    // por la propia librería (ver su comentario en el código fuente), no
    // un error de este script.
    saltados++
    continue
  }
  writeFileSync(join(directorioDestino, nombre), readFileSync(origen, 'utf8'))
  copiados++
}

console.log(
  `generar-ts-libs: ${copiados} ficheros copiados a public/ts-libs/, ${saltados} saltados (no existen en esta versión de TypeScript)`,
)
if (copiados === 0) {
  throw new Error('No se copió ningún fichero lib - revisa la instalación de typescript-en-vivo')
}
