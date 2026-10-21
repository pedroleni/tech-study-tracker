// Construye los dos workers del kit de React para los bloques de React:
//   compilador.js → babel-plugin-react-compiler (bloque compilador-react y
//                   opción compilador de react-en-vivo)
//   lint.js       → eslint-plugin-react-hooks (opción mostrarLint)
// y copia los tipos de React (tipos/) para los errores de TypeScript del TSX.
//
// Es un paquete aislado, con su package.json y su lockfile, como
// scripts/react-en-vivo: estas dependencias no son de la web. Se ejecuta solo
// al cambiar de versión:
//   cd scripts/react-kit && npm ci && npm run construir
// La salida se commitea en public/vendor/react-kit/<VERSION>/. La versión va en
// la ruta para servirla con caché inmutable (ver vercel.json): si cambia
// cualquier dependencia, sube VERSION.
//
// Trampas resueltas al empaquetar (ver specs/features/react-en-vivo.md, fase 4):
// - Los módulos de Node que arrastran se sustituyen por relleno-node.js.
// - El plugin de ESLint llama a require.resolve('react-native-reanimated') al
//   empezar; en el navegador lanza y sus reglas del compilador fallan en
//   silencio. Se parchea hasModule para que devuelva false.
// - hermes-parser no arranca en el navegador: el worker de lint pasa los
//   archivos como .tsx (parser de Babel) y hermes-parser sale del paquete.
import { build } from 'esbuild'
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const VERSION = '1'
const aqui = (ruta) => fileURLToPath(new URL(ruta, import.meta.url))
const destino = aqui(`../../public/vendor/react-kit/${VERSION}/`)
rmSync(destino, { recursive: true, force: true })
mkdirSync(destino, { recursive: true })

const nativos = new Set([...builtinModules, ...builtinModules.map((m) => 'node:' + m)])
const rellenos = {
  name: 'rellenos',
  setup(b) {
    b.onResolve({ filter: /.*/ }, (a) =>
      nativos.has(a.path) || a.path === 'hermes-parser' ? { path: aqui('./relleno-node.js') } : undefined,
    )
  },
}
const sinReanimated = {
  name: 'sin-reanimated',
  setup(b) {
    b.onLoad({ filter: /(babel-plugin-react-compiler|eslint-plugin-react-hooks)[\\/].*\.js$/ }, async (a) => {
      const codigo = await readFile(a.path, 'utf8')
      return { contents: codigo.replace(/return !!require\.resolve\(name\);/g, 'return false;'), loader: 'js' }
    })
  },
}

for (const [entrada, salida] of [
  ['entrada-compilador.js', 'compilador.js'],
  ['entrada-lint.js', 'lint.js'],
]) {
  await build({
    entryPoints: [aqui(entrada)],
    outfile: destino + salida,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    minify: true,
    legalComments: 'eof',
    inject: [aqui('./relleno-process.js')],
    define: { 'process.env.NODE_ENV': '"production"', global: 'globalThis' },
    plugins: [sinReanimated, rellenos],
    logLevel: 'error',
  })
  const bytes = readFileSync(destino + salida)
  const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`
  console.log(`${VERSION}/${salida}: ${mb(bytes.length)} (gzip ${mb(gzipSync(bytes, { level: 9 }).length)})`)
}

// Tipos de React para el compilador de TypeScript del navegador.
const tipos = destino + 'tipos/'
for (const archivo of ['index.d.ts', 'global.d.ts', 'jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts', 'package.json']) {
  cpSync(aqui(`./node_modules/@types/react/${archivo}`), `${tipos}react/${archivo}`)
}
for (const archivo of ['index.d.ts', 'package.json']) {
  cpSync(aqui(`./node_modules/csstype/${archivo}`), `${tipos}csstype/${archivo}`)
}
console.log(`${VERSION}/tipos: @types/react ${JSON.parse(readFileSync(aqui('./node_modules/@types/react/package.json'))).version}, csstype ${JSON.parse(readFileSync(aqui('./node_modules/csstype/package.json'))).version}`)
