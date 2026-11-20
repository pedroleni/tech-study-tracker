import {
  caracterActual,
  crearLectura,
  emitir,
  emitirHasta,
  etiquetaCerrada,
  finDeCadenaSinEscapes,
  leerCaracterSuelto,
  leerCierreDeEtiqueta,
  leerEspacios,
  leerIgualDeAtributo,
  recorrer,
  reglaCadenaDeAtributo,
  reglaDelimitada,
  reglaPalabraDeAtributo,
  restante,
  type ContextoAtributos,
  type Lectura,
  type Regla,
  type Token,
} from './resaltadorBase'
import { tokenizarCss } from './resaltadorCss'
import { tokenizarJs } from './resaltadorJs'

const INICIO_ETIQUETA = /^<\/?([a-zA-Z][^\s/>]*)/

const REGLAS_ATRIBUTOS_HTML: readonly Regla<ContextoAtributos>[] = [
  leerCierreDeEtiqueta,
  leerEspacios,
  leerIgualDeAtributo,
  reglaCadenaDeAtributo(finDeCadenaSinEscapes),
  reglaPalabraDeAtributo(/^[^\s=/>'"]+/),
  leerCaracterSuelto,
]

// El contenido de <style> y <script> es texto crudo para el analizador de
// HTML: se colorea con el tokenizador del lenguaje que toca.
const TOKENIZADORES_TEXTO_CRUDO = new Map<string, (codigo: string, salida: Token[]) => void>([
  ['style', tokenizarCss],
  ['script', tokenizarJs],
])

function leerTextoCrudo(lectura: Lectura, etiqueta: string) {
  const tokenizarContenido = TOKENIZADORES_TEXTO_CRUDO.get(etiqueta)
  if (!tokenizarContenido) return
  const cierre = new RegExp(`</${etiqueta}\\b`, 'i').exec(restante(lectura))
  const fin = cierre ? lectura.i + cierre.index : lectura.codigo.length
  const contenido = lectura.codigo.slice(lectura.i, fin)
  if (contenido) tokenizarContenido(contenido, lectura.salida)
  lectura.i = fin
}

function tokenizarEtiqueta(lectura: Lectura) {
  const nombre = INICIO_ETIQUETA.exec(restante(lectura))![1]
  const esCierre = lectura.codigo.startsWith('</', lectura.i)

  emitir(lectura, 'puntuacion', esCierre ? '</' : '<')
  emitir(lectura, 'etiqueta', nombre)
  const atributos: ContextoAtributos = { esperandoValor: false, cierre: null }
  recorrer(lectura, REGLAS_ATRIBUTOS_HTML, atributos, etiquetaCerrada)

  if (!esCierre && atributos.cierre !== '/>') leerTextoCrudo(lectura, nombre.toLowerCase())
}

function leerEtiqueta(lectura: Lectura): boolean {
  if (caracterActual(lectura) !== '<' || !INICIO_ETIQUETA.test(restante(lectura))) return false
  tokenizarEtiqueta(lectura)
  return true
}

// Texto normal hasta el siguiente '<'. Si el propio '<' no abre etiqueta
// (por ejemplo `a < b`), se consume como texto y se sigue buscando.
function leerTextoHtml(lectura: Lectura): boolean {
  const { codigo, i } = lectura
  const siguiente = codigo.indexOf('<', codigo[i] === '<' ? i + 1 : i)
  emitirHasta(lectura, 'texto', siguiente === -1 ? codigo.length : siguiente)
  return true
}

const REGLAS_HTML: readonly Regla<unknown>[] = [
  reglaDelimitada('<!--', '-->', 'comentario'),
  reglaDelimitada('<!', '>', 'doctype'),
  leerEtiqueta,
  leerTextoHtml,
]

export function tokenizarHtml(codigo: string, salida: Token[]) {
  recorrer(crearLectura(codigo, salida), REGLAS_HTML, undefined)
}
