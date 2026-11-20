/**
 * Piezas comunes a los tokenizadores del resaltador (`resaltador.ts`).
 *
 * Cada tokenizador avanza una `Lectura` (el código, la posición y la salida)
 * probando en orden una tabla de reglas: la primera que reconoce lo que hay
 * en la posición actual emite su token, avanza y devuelve `true`. La última
 * regla de cada tabla siempre consume al menos un carácter, así que el bucle
 * nunca se queda parado.
 */

export type TipoToken =
  | 'texto'
  | 'puntuacion'
  | 'etiqueta'
  | 'atributo'
  | 'cadena'
  | 'comentario'
  | 'palabraClave'
  | 'numero'
  | 'funcion'
  | 'selector'
  | 'propiedad'
  | 'valor'
  | 'doctype'

export type Token = {
  tipo: TipoToken
  texto: string
}

export type Lectura = {
  codigo: string
  i: number
  salida: Token[]
}

/** Una regla consume lo que reconoce en la posición actual y dice si lo ha hecho. */
export type Regla<C> = (lectura: Lectura, contexto: C) => boolean

/** Busca el final de una cadena que empieza (con su comilla) en `inicio`. */
export type FinDeCadena = (codigo: string, inicio: number) => number

export function crearLectura(codigo: string, salida: Token[]): Lectura {
  return { codigo, i: 0, salida }
}

export function empujar(salida: Token[], tipo: TipoToken, texto: string) {
  if (texto) salida.push({ tipo, texto })
}

/** Emite `texto`, que es lo que hay en la posición actual, y avanza sobre él. */
export function emitir(lectura: Lectura, tipo: TipoToken, texto: string): Token {
  empujar(lectura.salida, tipo, texto)
  lectura.i += texto.length
  return { tipo, texto }
}

/** Emite como un único token todo lo que hay hasta `fin` (sin incluirlo). */
export function emitirHasta(lectura: Lectura, tipo: TipoToken, fin: number): Token {
  return emitir(lectura, tipo, lectura.codigo.slice(lectura.i, fin))
}

export function caracterActual(lectura: Lectura) {
  return lectura.codigo[lectura.i]
}

export function restante(lectura: Lectura) {
  return lectura.codigo.slice(lectura.i)
}

const nuncaTermina = () => false

/**
 * Recorre la lectura aplicando en cada posición la primera regla que encaja,
 * hasta el final del código o hasta que `terminado` diga que hay que parar.
 */
export function recorrer<C>(
  lectura: Lectura,
  reglas: readonly Regla<C>[],
  contexto: C,
  terminado: (lectura: Lectura, contexto: C) => boolean = nuncaTermina,
) {
  while (lectura.i < lectura.codigo.length && !terminado(lectura, contexto)) {
    aplicarPrimera(lectura, reglas, contexto)
  }
}

/** Aplica la primera regla de la tabla que reconoce lo que hay en la posición actual. */
export function aplicarPrimera<C>(lectura: Lectura, reglas: readonly Regla<C>[], contexto: C) {
  reglas.some((regla) => regla(lectura, contexto))
}

/** Devuelve el índice del final del delimitador, o el final del código si no cierra. */
export function hastaCierre(codigo: string, desde: number, cierre: string) {
  const indice = codigo.indexOf(cierre, desde)
  return indice === -1 ? codigo.length : indice + cierre.length
}

/** Cadena sin escapes: termina en la siguiente comilla igual que la de apertura. */
export function finDeCadenaSinEscapes(codigo: string, inicio: number) {
  return hastaCierre(codigo, inicio + 1, codigo[inicio])
}

/** Bloque entre `apertura` y `cierre` (o hasta el final si no cierra) emitido como `tipo`. */
export function reglaDelimitada(apertura: string, cierre: string, tipo: TipoToken): Regla<unknown> {
  return (lectura) => {
    if (!lectura.codigo.startsWith(apertura, lectura.i)) return false
    emitirHasta(lectura, tipo, hastaCierre(lectura.codigo, lectura.i + apertura.length, cierre))
    return true
  }
}

/** Comentario que empieza por `prefijo` y llega hasta el salto de línea (sin incluirlo). */
export function reglaComentarioDeLinea(prefijo: string): Regla<unknown> {
  return (lectura) => {
    if (!lectura.codigo.startsWith(prefijo, lectura.i)) return false
    const salto = lectura.codigo.indexOf('\n', lectura.i)
    emitirHasta(lectura, 'comentario', salto === -1 ? lectura.codigo.length : salto)
    return true
  }
}

export function leerEspacios(lectura: Lectura): boolean {
  if (!/\s/.test(caracterActual(lectura))) return false
  emitir(lectura, 'texto', /^\s+/.exec(restante(lectura))![0])
  return true
}

/** Cadena que abre con cualquiera de `comillas`; `null` si no hay una en la posición actual. */
export function leerCadena(lectura: Lectura, comillas: string, fin: FinDeCadena): Token | null {
  if (!comillas.includes(caracterActual(lectura))) return null
  return emitirHasta(lectura, 'cadena', fin(lectura.codigo, lectura.i))
}

export function leerPatron(lectura: Lectura, patron: RegExp, tipo: TipoToken): Token | null {
  const coincidencia = patron.exec(restante(lectura))
  return coincidencia ? emitir(lectura, tipo, coincidencia[0]) : null
}

/**
 * Identificador: palabra clave si `esPalabraClave` lo dice, función si le
 * sigue un paréntesis (con espacios por medio o no) y texto en otro caso.
 */
export function leerIdentificador(
  lectura: Lectura,
  patron: RegExp,
  esPalabraClave: (palabra: string) => boolean,
): Token | null {
  const identificador = patron.exec(restante(lectura))
  if (!identificador) return null
  const palabra = identificador[0]
  return emitir(lectura, tipoDeIdentificador(lectura, palabra, esPalabraClave(palabra)), palabra)
}

function tipoDeIdentificador(lectura: Lectura, palabra: string, esPalabraClave: boolean): TipoToken {
  if (esPalabraClave) return 'palabraClave'
  return /^\s*\(/.test(lectura.codigo.slice(lectura.i + palabra.length)) ? 'funcion' : 'texto'
}

/** Cualquier carácter suelto como texto: la regla de último recurso. */
export function leerCaracterSuelto(lectura: Lectura): boolean {
  emitir(lectura, 'texto', caracterActual(lectura))
  return true
}

// ---------------------------------------------------------------- Atributos

/**
 * Estado de los atributos de una etiqueta, compartido entre HTML y JSX: si
 * lo siguiente es el valor de un atributo y con qué se ha cerrado la etiqueta.
 */
export type ContextoAtributos = {
  esperandoValor: boolean
  cierre: '>' | '/>' | null
}

export function leerCierreDeEtiqueta(lectura: Lectura, contexto: ContextoAtributos): boolean {
  const cierre = lectura.codigo.startsWith('/>', lectura.i) ? '/>' : '>'
  if (!lectura.codigo.startsWith(cierre, lectura.i)) return false
  emitir(lectura, 'puntuacion', cierre)
  contexto.cierre = cierre
  return true
}

export function leerIgualDeAtributo(lectura: Lectura, contexto: ContextoAtributos): boolean {
  if (caracterActual(lectura) !== '=') return false
  emitir(lectura, 'puntuacion', '=')
  contexto.esperandoValor = true
  return true
}

/** Valor de atributo entre comillas; `fin` decide si se respetan los escapes. */
export function reglaCadenaDeAtributo(fin: FinDeCadena): Regla<ContextoAtributos> {
  return (lectura, contexto) => {
    if (!leerCadena(lectura, `"'`, fin)) return false
    contexto.esperandoValor = false
    return true
  }
}

/** Nombre de atributo, o valor sin comillas si va detrás de un `=`. */
export function reglaPalabraDeAtributo(patron: RegExp): Regla<ContextoAtributos> {
  return (lectura, contexto) => {
    const tipo = contexto.esperandoValor ? 'cadena' : 'atributo'
    if (!leerPatron(lectura, patron, tipo)) return false
    contexto.esperandoValor = false
    return true
  }
}

/** Condición de parada al leer atributos: la etiqueta ya se ha cerrado con `>` o `/>`. */
export function etiquetaCerrada(_lectura: Lectura, contexto: ContextoAtributos) {
  return contexto.cierre !== null
}
