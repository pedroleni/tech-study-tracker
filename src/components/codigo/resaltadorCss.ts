import {
  caracterActual,
  crearLectura,
  emitir,
  finDeCadenaSinEscapes,
  leerCadena,
  leerEspacios,
  leerPatron,
  recorrer,
  reglaDelimitada,
  restante,
  type Lectura,
  type Regla,
  type Token,
} from './resaltadorBase'

/** Dónde está la lectura: fuera de llaves es selector; dentro, propiedad o, tras `:`, valor. */
type ContextoCss = {
  enBloque: boolean
  enValor: boolean
}

/** Signos de puntuación de CSS y cómo cambia el contexto al pasar por cada uno. */
const SIGNOS_CSS = new Map<string, Partial<ContextoCss>>([
  ['{', { enBloque: true, enValor: false }],
  ['}', { enBloque: false, enValor: false }],
  [';', { enValor: false }],
  ['(', {}],
  [')', {}],
  [',', {}],
])

function leerCadenaCss(lectura: Lectura): boolean {
  return leerCadena(lectura, `"'`, finDeCadenaSinEscapes) !== null
}

function leerSignoCss(lectura: Lectura, contexto: ContextoCss): boolean {
  const caracter = caracterActual(lectura)
  const cambio = SIGNOS_CSS.get(caracter)
  if (!cambio) return false
  emitir(lectura, 'puntuacion', caracter)
  Object.assign(contexto, cambio)
  return true
}

/** Los dos puntos solo separan propiedad y valor dentro de un bloque; fuera son parte del selector. */
function leerDosPuntosCss(lectura: Lectura, contexto: ContextoCss): boolean {
  if (caracterActual(lectura) !== ':' || !contexto.enBloque) return false
  emitir(lectura, 'puntuacion', ':')
  contexto.enValor = true
  return true
}

function leerReglaArroba(lectura: Lectura): boolean {
  if (caracterActual(lectura) !== '@') return false
  emitir(lectura, 'palabraClave', /^@[\w-]*/.exec(restante(lectura))![0])
  return true
}

function leerSelector(lectura: Lectura, contexto: ContextoCss): boolean {
  if (contexto.enBloque) return false
  emitir(lectura, 'selector', /^[^{};()@,\s"']+/.exec(restante(lectura))![0])
  return true
}

function leerPropiedad(lectura: Lectura, contexto: ContextoCss): boolean {
  if (contexto.enValor) return false
  emitir(lectura, 'propiedad', /^[^:{};()@,\s"']+/.exec(restante(lectura))![0])
  return true
}

function leerNumeroCss(lectura: Lectura): boolean {
  return leerPatron(lectura, /^[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/, 'numero') !== null
}

function leerFuncionCss(lectura: Lectura): boolean {
  return leerPatron(lectura, /^[\w-]+(?=\()/, 'funcion') !== null
}

function leerValor(lectura: Lectura): boolean {
  emitir(lectura, 'valor', /^[^{};()@,\s"']+/.exec(restante(lectura))![0])
  return true
}

const REGLAS_CSS: readonly Regla<ContextoCss>[] = [
  reglaDelimitada('/*', '*/', 'comentario'),
  leerCadenaCss,
  leerEspacios,
  leerSignoCss,
  leerDosPuntosCss,
  leerReglaArroba,
  leerSelector,
  leerPropiedad,
  leerNumeroCss,
  leerFuncionCss,
  leerValor,
]

export function tokenizarCss(codigo: string, salida: Token[]) {
  recorrer(crearLectura(codigo, salida), REGLAS_CSS, { enBloque: false, enValor: false })
}
