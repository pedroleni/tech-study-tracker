import {
  aplicarPrimera,
  caracterActual,
  crearLectura,
  emitir,
  emitirHasta,
  etiquetaCerrada,
  leerCadena,
  leerCaracterSuelto,
  leerCierreDeEtiqueta,
  leerEspacios,
  leerIdentificador,
  leerIgualDeAtributo,
  leerPatron,
  reglaCadenaDeAtributo,
  reglaComentarioDeLinea,
  reglaDelimitada,
  reglaPalabraDeAtributo,
  restante,
  type ContextoAtributos,
  type Lectura,
  type Regla,
  type Token,
} from './resaltadorBase'

const PALABRAS_CLAVE_JS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'null', 'of', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
])

const PALABRAS_CLAVE_TS = new Set([
  'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected',
  'readonly', 'keyof', 'satisfies', 'declare', 'namespace', 'abstract', 'is',
  'infer', 'unique',
])

export type OpcionesJs = {
  jsx: boolean
  ts: boolean
}

// ---------------------------------------------------------------- Pila de marcos

/**
 * JavaScript anida JSX y JSX anida JavaScript. En vez de recursión, cada
 * nivel abierto es un marco en una pila explícita, así el anidamiento no
 * tiene más límite que la memoria (con recursión, un código muy anidado
 * desbordaría la pila de llamadas). Un marco recorre el código con su tabla
 * de reglas, y una regla puede abrir otro marco encima; cuando el de arriba
 * termina, se hace lo que tenía pendiente y sigue el de abajo.
 */
type Marco = {
  terminado: () => boolean
  avanzar: () => void
  alTerminar: () => void
}

type Pila = Marco[]

function sinPendientes() {
  // Nada que hacer al terminar el marco.
}

type DefinicionMarco<C> = {
  reglas: readonly Regla<C>[]
  contexto: C
  terminado: (lectura: Lectura, contexto: C) => boolean
  alTerminar?: (lectura: Lectura, contexto: C) => void
}

function crearMarco<C>(
  lectura: Lectura,
  { reglas, contexto, terminado, alTerminar = sinPendientes }: DefinicionMarco<C>,
): Marco {
  return {
    terminado: () => terminado(lectura, contexto),
    avanzar: () => aplicarPrimera(lectura, reglas, contexto),
    alTerminar: () => alTerminar(lectura, contexto),
  }
}

/** Avanza siempre el marco de arriba; al acabar el código o su condición de parada, lo cierra. */
function ejecutarPila(lectura: Lectura, pila: Pila) {
  while (pila.length > 0) {
    const marco = pila[pila.length - 1]
    if (lectura.i < lectura.codigo.length && !marco.terminado()) {
      marco.avanzar()
    } else {
      pila.pop()
      marco.alTerminar()
    }
  }
}

// ---------------------------------------------------------------- JavaScript

type ContextoJs = {
  pila: Pila
  opciones: OpcionesJs
  /** Dentro de una `{expresión}` de JSX: se para en la `}` que la cierra. */
  hastaLlave: boolean
  profundidadLlaves: number
  /** Último token que no es espacio ni comentario: decide si un `<` abre JSX. */
  ultimoSignificativo: Token | null
}

/** Cuánto sube o baja cada llave la profundidad dentro de una expresión de JSX. */
const CAMBIO_DE_PROFUNDIDAD = new Map([
  ['{', 1],
  ['}', -1],
])

/** Avanza sobre una cadena respetando los escapes `\"`. */
function finDeCadenaJs(codigo: string, inicio: number) {
  const comilla = codigo[inicio]
  let i = inicio + 1
  while (i < codigo.length) {
    if (codigo[i] === '\\') {
      i += 2
      continue
    }
    if (codigo[i] === comilla) return i + 1
    i += 1
  }
  return codigo.length
}

function recordar(contexto: ContextoJs, token: Token | null): boolean {
  if (!token) return false
  contexto.ultimoSignificativo = token
  return true
}

function puedeAbrirJsx(ultimo: Token | null, siguiente: string) {
  if (!/[A-Za-z>]/.test(siguiente)) return false
  if (!ultimo) return true
  if (['texto', 'funcion', 'numero', 'cadena'].includes(ultimo.tipo)) return false
  return ultimo.texto !== ')' && ultimo.texto !== ']'
}

// En TSX, `<T,>(x) =>` y `<T extends X>(x) =>` son flechas genéricas, no
// etiquetas: JSX no admite una coma ni un `extends` suelto en una etiqueta.
function esFlechaGenerica(lectura: Lectura, opciones: OpcionesJs) {
  return (
    opciones.ts &&
    /^<[A-Za-z_$][\w$]*\s*(?:,|extends\b)/.test(lectura.codigo.slice(lectura.i, lectura.i + 80))
  )
}

function esPalabraClaveJs(palabra: string, opciones: OpcionesJs) {
  return PALABRAS_CLAVE_JS.has(palabra) || (opciones.ts && PALABRAS_CLAVE_TS.has(palabra))
}

function leerCadenaJs(lectura: Lectura, contexto: ContextoJs): boolean {
  return recordar(contexto, leerCadena(lectura, '"\'`', finDeCadenaJs))
}

function leerElementoJsx(lectura: Lectura, contexto: ContextoJs): boolean {
  if (!contexto.opciones.jsx || caracterActual(lectura) !== '<') return false
  if (esFlechaGenerica(lectura, contexto.opciones)) return false
  if (!puedeAbrirJsx(contexto.ultimoSignificativo, lectura.codigo[lectura.i + 1] ?? '')) return false
  abrirElementoJsx(lectura, contexto.pila, contexto.opciones)
  // Nadie lee este contexto mientras el elemento está abierto: puede quedar ya
  // como si el elemento hubiera terminado en `>`.
  contexto.ultimoSignificativo = { tipo: 'puntuacion', texto: '>' }
  return true
}

function leerNumeroJs(lectura: Lectura, contexto: ContextoJs): boolean {
  const patron = /^(?:0[xX][\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)/
  return recordar(contexto, leerPatron(lectura, patron, 'numero'))
}

function leerIdentificadorJs(lectura: Lectura, contexto: ContextoJs): boolean {
  const esPalabraClave = (palabra: string) => esPalabraClaveJs(palabra, contexto.opciones)
  return recordar(contexto, leerIdentificador(lectura, /^[A-Za-z_$][\w$]*/, esPalabraClave))
}

// Operadores y signos sueltos. Las expresiones regulares literales se
// tratan como divisiones: distinguirlas exige contexto sintáctico y no
// aporta nada al contenido que se documenta aquí.
function leerPuntuacionJs(lectura: Lectura, contexto: ContextoJs): boolean {
  const caracter = caracterActual(lectura)
  if (contexto.hastaLlave) contexto.profundidadLlaves += CAMBIO_DE_PROFUNDIDAD.get(caracter) ?? 0
  return recordar(contexto, emitir(lectura, 'puntuacion', caracter))
}

const REGLAS_JS: readonly Regla<ContextoJs>[] = [
  reglaComentarioDeLinea('//'),
  reglaDelimitada('/*', '*/', 'comentario'),
  leerCadenaJs,
  leerEspacios,
  leerElementoJsx,
  leerNumeroJs,
  leerIdentificadorJs,
  leerPuntuacionJs,
]

function llegaALlaveDeCierre(lectura: Lectura, contexto: ContextoJs) {
  return contexto.hastaLlave && caracterActual(lectura) === '}' && contexto.profundidadLlaves === 0
}

/** Al terminar una `{expresión}` de JSX, su llave de cierre, si la hay. */
function cerrarExpresion(lectura: Lectura) {
  if (caracterActual(lectura) === '}') emitir(lectura, 'puntuacion', '}')
}

function abrirMarcoJs(lectura: Lectura, pila: Pila, opciones: OpcionesJs, hastaLlave: boolean) {
  const contexto: ContextoJs = { pila, opciones, hastaLlave, profundidadLlaves: 0, ultimoSignificativo: null }
  const alTerminar = hastaLlave ? cerrarExpresion : sinPendientes
  pila.push(crearMarco(lectura, { reglas: REGLAS_JS, contexto, terminado: llegaALlaveDeCierre, alTerminar }))
}

export function tokenizarJs(
  codigo: string,
  salida: Token[],
  opciones: OpcionesJs = { jsx: false, ts: false },
) {
  const lectura = crearLectura(codigo, salida)
  const pila: Pila = []
  abrirMarcoJs(lectura, pila, opciones, false)
  ejecutarPila(lectura, pila)
}

// ---------------------------------------------------------------- JSX

type ContextoAtributosJsx = ContextoAtributos & { pila: Pila; opciones: OpcionesJs }

type ContextoHijosJsx = {
  pila: Pila
  opciones: OpcionesJs
  cerrado: boolean
}

/**
 * `{expresión}` dentro de JSX, como hijo o como valor de un atributo: abre
 * JavaScript hasta la llave que la cierra. En un atributo, la expresión es
 * su valor, así que después ya no se espera ninguno.
 */
function leerExpresionJsx(
  lectura: Lectura,
  contexto: { pila: Pila; opciones: OpcionesJs; esperandoValor?: boolean },
): boolean {
  if (caracterActual(lectura) !== '{') return false
  emitir(lectura, 'puntuacion', '{')
  if (contexto.esperandoValor) contexto.esperandoValor = false
  abrirMarcoJs(lectura, contexto.pila, contexto.opciones, true)
  return true
}

const REGLAS_ATRIBUTOS_JSX: readonly Regla<ContextoAtributosJsx>[] = [
  leerCierreDeEtiqueta,
  leerEspacios,
  leerIgualDeAtributo,
  reglaCadenaDeAtributo(finDeCadenaJs),
  leerExpresionJsx,
  reglaPalabraDeAtributo(/^[^\s=/>{'"]+/),
  leerCaracterSuelto,
]

/** Tras los atributos vienen los hijos, salvo que la etiqueta se cierre sola con `/>`. */
function despuesDeAtributos(lectura: Lectura, contexto: ContextoAtributosJsx) {
  if (contexto.cierre !== '/>') abrirMarcoHijos(lectura, contexto.pila, contexto.opciones)
}

/** Abre `<>` o `<Nombre atributos…>`: emite lo que ya se sabe y apila el resto. */
function abrirElementoJsx(lectura: Lectura, pila: Pila, opciones: OpcionesJs) {
  if (lectura.codigo.startsWith('<>', lectura.i)) {
    emitir(lectura, 'puntuacion', '<>')
    abrirMarcoHijos(lectura, pila, opciones)
    return
  }
  emitir(lectura, 'puntuacion', '<')
  if (!leerPatron(lectura, /^[A-Za-z][\w.:-]*/, 'etiqueta')) return
  const contexto: ContextoAtributosJsx = { pila, opciones, esperandoValor: false, cierre: null }
  pila.push(
    crearMarco(lectura, {
      reglas: REGLAS_ATRIBUTOS_JSX,
      contexto,
      terminado: etiquetaCerrada,
      alTerminar: despuesDeAtributos,
    }),
  )
}

function leerCierreDeFragmento(lectura: Lectura, contexto: ContextoHijosJsx): boolean {
  if (!lectura.codigo.startsWith('</>', lectura.i)) return false
  emitir(lectura, 'puntuacion', '</>')
  contexto.cerrado = true
  return true
}

function leerEtiquetaDeCierreJsx(lectura: Lectura, contexto: ContextoHijosJsx): boolean {
  const cierre = /^<\/([A-Za-z][\w.:-]*)/.exec(restante(lectura))
  if (!cierre) return false
  emitir(lectura, 'puntuacion', '</')
  emitir(lectura, 'etiqueta', cierre[1])
  const fin = lectura.codigo.indexOf('>', lectura.i)
  emitirHasta(lectura, 'texto', fin === -1 ? lectura.codigo.length : fin)
  if (fin !== -1) emitir(lectura, 'puntuacion', '>')
  contexto.cerrado = true
  return true
}

function leerElementoHijo(lectura: Lectura, contexto: ContextoHijosJsx): boolean {
  const abreElemento = /[A-Za-z>]/.test(lectura.codigo[lectura.i + 1] ?? '')
  if (caracterActual(lectura) !== '<' || !abreElemento) return false
  abrirElementoJsx(lectura, contexto.pila, contexto.opciones)
  return true
}

/** Texto de los hijos hasta el siguiente `<` o `{`, empezando siempre por el carácter actual. */
function leerTextoJsx(lectura: Lectura): boolean {
  let fin = lectura.i + 1
  while (fin < lectura.codigo.length && lectura.codigo[fin] !== '<' && lectura.codigo[fin] !== '{') fin += 1
  emitirHasta(lectura, 'texto', fin)
  return true
}

const REGLAS_HIJOS_JSX: readonly Regla<ContextoHijosJsx>[] = [
  leerCierreDeFragmento,
  leerEtiquetaDeCierreJsx,
  leerExpresionJsx,
  leerElementoHijo,
  leerTextoJsx,
]

function elementoCerrado(_lectura: Lectura, contexto: ContextoHijosJsx) {
  return contexto.cerrado
}

function abrirMarcoHijos(lectura: Lectura, pila: Pila, opciones: OpcionesJs) {
  const contexto: ContextoHijosJsx = { pila, opciones, cerrado: false }
  pila.push(crearMarco(lectura, { reglas: REGLAS_HIJOS_JSX, contexto, terminado: elementoCerrado }))
}
