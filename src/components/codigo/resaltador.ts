/**
 * Tokenizador propio para HTML, CSS y JavaScript.
 *
 * Es deliberadamente pequeño y sin dependencias: el contenido de esta
 * biblioteca es HTML y CSS, y una gramática completa (TextMate/Lezer) costaría
 * cientos de kilobytes para colorear ejemplos de veinte líneas.
 *
 * Invariante que sostiene todo lo demás y que los tests comprueban:
 * concatenar el `texto` de todos los tokens devuelve EXACTAMENTE el código de
 * entrada. Así nunca se pierde ni se inventa un carácter, ni siquiera con
 * código a medio escribir —que es el estado normal dentro de un editor.
 *
 * Cada lenguaje vive en su archivo (`resaltadorHtml.ts`, `resaltadorCss.ts`,
 * `resaltadorJs.ts`, `resaltadorSql.ts`) sobre las piezas comunes de
 * `resaltadorBase.ts`; este expone la API.
 */

import { empujar, type TipoToken, type Token } from './resaltadorBase'
import { tokenizarCss } from './resaltadorCss'
import { tokenizarHtml } from './resaltadorHtml'
import { tokenizarJs } from './resaltadorJs'
import { tokenizarSql } from './resaltadorSql'

export type Lenguaje = 'html' | 'css' | 'js' | 'jsx' | 'tsx' | 'sql' | 'texto'

export type { TipoToken, Token } from './resaltadorBase'

export type LineaResaltada = {
  /** Número de línea empezando en 1, como lo cuenta cualquier editor. */
  numero: number
  tokens: Token[]
}

/** Clase CSS de cada tipo de token. Los colores viven en `sintaxis.css`. */
export const CLASES_TOKEN: Record<TipoToken, string> = {
  texto: 'sintaxis-texto',
  puntuacion: 'sintaxis-puntuacion',
  etiqueta: 'sintaxis-etiqueta',
  atributo: 'sintaxis-atributo',
  cadena: 'sintaxis-cadena',
  comentario: 'sintaxis-comentario',
  palabraClave: 'sintaxis-palabra-clave',
  numero: 'sintaxis-numero',
  funcion: 'sintaxis-funcion',
  selector: 'sintaxis-selector',
  propiedad: 'sintaxis-propiedad',
  valor: 'sintaxis-valor',
  doctype: 'sintaxis-doctype',
}

// ---------------------------------------------------------------- API

type Tokenizador = (codigo: string, salida: Token[]) => void

const TOKENIZADORES = new Map<string, Tokenizador>([
  ['html', tokenizarHtml],
  ['css', tokenizarCss],
  ['js', tokenizarJs],
  ['jsx', (codigo, salida) => tokenizarJs(codigo, salida, { jsx: true, ts: false })],
  ['tsx', (codigo, salida) => tokenizarJs(codigo, salida, { jsx: true, ts: true })],
  ['sql', tokenizarSql],
])

export function tokenizar(codigo: string, lenguaje: Lenguaje = 'html'): Token[] {
  const salida: Token[] = []
  if (!codigo) return salida

  // Un lenguaje sin tokenizador (`texto` o cualquier otro) sale como un único token de texto.
  const tokenizarLenguaje = TOKENIZADORES.get(lenguaje)
  if (tokenizarLenguaje) tokenizarLenguaje(codigo, salida)
  else empujar(salida, 'texto', codigo)

  return salida
}

/**
 * Igual que `tokenizar`, pero partido por líneas: ningún token contiene un
 * salto de línea, así cada línea se puede pintar, numerar o destacar por
 * separado.
 */
export function tokenizarLineas(codigo: string, lenguaje: Lenguaje = 'html'): LineaResaltada[] {
  const lineas: LineaResaltada[] = [{ numero: 1, tokens: [] }]

  for (const token of tokenizar(codigo, lenguaje)) {
    const trozos = token.texto.split('\n')
    trozos.forEach((trozo, indice) => {
      if (indice > 0) lineas.push({ numero: lineas.length + 1, tokens: [] })
      if (trozo) lineas[lineas.length - 1].tokens.push({ tipo: token.tipo, texto: trozo })
    })
  }

  return lineas
}
