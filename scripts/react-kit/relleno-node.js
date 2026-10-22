// Relleno de los módulos de Node que arrastran Babel, el compilador de React
// y ESLint al empaquetarlos para el navegador. Lo que de verdad se ejecuta en
// el worker solo necesita isDeepStrictEqual (caché del plugin de ESLint) y
// createHmac/createHash (clave de caché: no hace falta que sea criptográfica).
// El resto existe para que los imports no fallen; si algo los llamara, el
// error lo diría claro.
const noDisponible = (nombre) => () => {
  throw new Error(nombre + ' no está disponible en el navegador')
}
const fnv = (texto) => {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
const resumen = (clave = '') => {
  let datos = String(clave)
  const objeto = {
    update(d) {
      datos += String(d)
      return objeto
    },
    digest() {
      return fnv(datos)
    },
  }
  return objeto
}
export const isDeepStrictEqual = (a, b) => {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  return ka.length === kb.length && ka.every((k) => isDeepStrictEqual(a[k], b[k]))
}
export const createHash = () => resumen()
export const createHmac = (_algoritmo, clave) => resumen(clave)
export const isatty = () => false
export const inspect = (v) => String(v)
export const format = (...a) => a.join(' ')
export const deprecate = (f) => f
export const inherits = (c, p) => Object.setPrototypeOf(c.prototype, p.prototype)
export const debuglog = () => () => {}
export const join = (...p) => p.join('/')
export const resolve = (...p) => p.join('/')
export const dirname = (p) => p.split('/').slice(0, -1).join('/')
export const basename = (p) => p.split('/').pop()
export const extname = (p) => /\.[^./]*$/.exec(p)?.[0] ?? ''
export const relative = (_a, b) => b
export const isAbsolute = (p) => p.startsWith('/')
export const sep = '/'
export const randomUUID = noDisponible('crypto.randomUUID')
export const readFileSync = noDisponible('fs.readFileSync')
export const existsSync = () => false
export const homedir = () => '/'
export const platform = () => 'browser'
export const EOL = '\n'
export const fileURLToPath = (u) => String(u)
export const pathToFileURL = (p) => new URL('file://' + p)
export default {
  isDeepStrictEqual, createHash, createHmac, isatty, inspect, format, deprecate, inherits, debuglog,
  join, resolve, dirname, basename, extname, relative, isAbsolute, sep, randomUUID, readFileSync,
  existsSync, homedir, platform, EOL, fileURLToPath, pathToFileURL, env: {},
}
