export type FragmentoTitulo =
  | { tipo: 'texto'; contenido: string }
  | { tipo: 'codigo'; contenido: string }
  | { tipo: 'negrita' | 'cursiva'; contenido: FragmentoTitulo[] }

const PUNTUACION_ASCII = /[!-/:-@[-`{-~]/

function agregarTexto(fragmentos: FragmentoTitulo[], contenido: string) {
  if (!contenido) return

  const ultimo = fragmentos.at(-1)
  if (ultimo?.tipo === 'texto') {
    ultimo.contenido += contenido
  } else {
    fragmentos.push({ tipo: 'texto', contenido })
  }
}

function puedeAbrir(texto: string, indice: number, marcador: string) {
  const siguiente = texto[indice + marcador.length]
  return Boolean(siguiente && !/\s/.test(siguiente))
}

function puedeCerrar(texto: string, indice: number, marcador: string) {
  const anterior = texto[indice - 1]
  if (!anterior || /\s/.test(anterior)) return false

  if (marcador === '*') {
    return texto[indice - 1] !== '*' && texto[indice + 1] !== '*'
  }

  return true
}

type Marcador = '*' | '**'

/**
 * Trozo del título que se está leyendo. La raíz es el título entero; cada
 * énfasis abierto (`*` o `**`) es un segmento encima, en una pila explícita
 * y no con recursión, para que el anidamiento no desborde la pila de llamadas.
 */
interface Segmento {
  fragmentos: FragmentoTitulo[]
  indice: number
  /** Marcador que abrió el segmento y dónde; la raíz no tiene. */
  apertura?: { marcador: Marcador; indice: number }
}

export function parsearTituloEnLinea(texto: string): FragmentoTitulo[] {
  const raiz: Segmento = { fragmentos: [], indice: 0 }
  const pila: Segmento[] = [raiz]
  while (pila.length > 0) avanzarSegmento(texto, pila)
  return raiz.fragmentos
}

function avanzarSegmento(texto: string, pila: Segmento[]) {
  const actual = pila[pila.length - 1]
  if (actual.indice >= texto.length) {
    terminarSinCierre(texto, pila)
    return
  }
  if (actual.apertura && cierraEn(texto, actual.indice, actual.apertura.marcador)) {
    terminarConCierre(pila, actual.apertura.marcador)
    return
  }
  const siguiente =
    leerEscape(texto, actual.indice, actual.fragmentos) ??
    leerCodigo(texto, actual.indice, actual.fragmentos)
  if (siguiente !== null) {
    actual.indice = siguiente
    return
  }
  const enfasis = abrirEnfasis(texto, actual.indice)
  if (enfasis) pila.push(enfasis)
  else actual.indice = leerCaracter(texto, actual.indice, actual.fragmentos)
}

function cierraEn(texto: string, indice: number, marcador: Marcador) {
  return texto.startsWith(marcador, indice) && puedeCerrar(texto, indice, marcador)
}

/** El énfasis se cierra: pasa entero al segmento de abajo, que sigue tras el marcador. */
function terminarConCierre(pila: Segmento[], marcador: Marcador) {
  const cerrado = pila.pop()!
  const padre = pila[pila.length - 1]
  padre.fragmentos.push({
    tipo: marcador === '**' ? 'negrita' : 'cursiva',
    contenido: cerrado.fragmentos,
  })
  padre.indice = cerrado.indice + marcador.length
}

/**
 * Fin del texto. En la raíz, el título está leído. En un énfasis que nunca
 * cerró, se descarta lo leído dentro: el primer carácter del marcador queda
 * como texto en el segmento de abajo, que sigue justo detrás.
 */
function terminarSinCierre(texto: string, pila: Segmento[]) {
  const { apertura } = pila.pop()!
  if (!apertura) return
  const padre = pila[pila.length - 1]
  agregarTexto(padre.fragmentos, texto[apertura.indice])
  padre.indice = apertura.indice + 1
}

// Cada lector reconoce una construcción en `indice`, la añade a `fragmentos` y
// devuelve dónde sigue el texto, o `null` si ahí no empieza esa construcción.

// Como en CommonMark, una barra delante de cualquier signo de puntuación ASCII
// lo deja literal: target=\"_blank\" se lee target="_blank".
function leerEscape(texto: string, indice: number, fragmentos: FragmentoTitulo[]) {
  const siguiente = texto[indice + 1]
  if (texto[indice] !== '\\' || !siguiente || !PUNTUACION_ASCII.test(siguiente)) return null
  agregarTexto(fragmentos, siguiente)
  return indice + 2
}

function leerCodigo(texto: string, indice: number, fragmentos: FragmentoTitulo[]) {
  if (texto[indice] !== '`') return null
  const fin = texto.indexOf('`', indice + 1)
  if (fin === -1) return null
  fragmentos.push({ tipo: 'codigo', contenido: texto.slice(indice + 1, fin) })
  return fin + 1
}

// Solo asteriscos: el guion bajo aparece en identificadores sin comillas
// (worker_threads, node_modules, __proto__) y nunca como énfasis en los títulos.
function marcadorEn(texto: string, indice: number): Marcador | null {
  if (texto.startsWith('**', indice)) return '**'
  if (texto[indice] === '*') return '*'
  return null
}

/** Segmento nuevo si en `indice` empieza un énfasis; `null` si el marcador no puede abrir. */
function abrirEnfasis(texto: string, indice: number): Segmento | null {
  const marcador = marcadorEn(texto, indice)
  if (!marcador) return null
  const esAsteriscoSimpleRodeado =
    marcador === '*' && (texto[indice - 1] === '*' || texto[indice + 1] === '*')
  if (esAsteriscoSimpleRodeado || !puedeAbrir(texto, indice, marcador)) return null
  return { fragmentos: [], indice: indice + marcador.length, apertura: { marcador, indice } }
}

function leerCaracter(texto: string, indice: number, fragmentos: FragmentoTitulo[]) {
  agregarTexto(fragmentos, texto[indice])
  return indice + 1
}

function textoPlanoDeFragmentos(fragmentos: FragmentoTitulo[]): string {
  return fragmentos
    .map((fragmento) =>
      fragmento.tipo === 'texto' || fragmento.tipo === 'codigo'
        ? fragmento.contenido
        : textoPlanoDeFragmentos(fragmento.contenido),
    )
    .join('')
}

export function textoPlanoDeTitulo(texto: string): string {
  return textoPlanoDeFragmentos(parsearTituloEnLinea(texto))
}
