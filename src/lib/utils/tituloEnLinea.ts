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

interface ResultadoSegmento {
  fragmentos: FragmentoTitulo[]
  indice: number
  cerrado: boolean
}

function parsearSegmento(
  texto: string,
  inicio: number,
  cierre?: '*' | '**',
): ResultadoSegmento {
  const fragmentos: FragmentoTitulo[] = []
  let indice = inicio

  while (indice < texto.length) {
    if (
      cierre &&
      texto.startsWith(cierre, indice) &&
      puedeCerrar(texto, indice, cierre)
    ) {
      return { fragmentos, indice: indice + cierre.length, cerrado: true }
    }

    const caracter = texto[indice]
    const siguiente = texto[indice + 1]

    // Como en CommonMark, una barra delante de cualquier signo de puntuación ASCII
    // lo deja literal: target=\"_blank\" se lee target="_blank".
    if (caracter === '\\' && siguiente && PUNTUACION_ASCII.test(siguiente)) {
      agregarTexto(fragmentos, siguiente)
      indice += 2
      continue
    }

    if (caracter === '`') {
      const fin = texto.indexOf('`', indice + 1)
      if (fin !== -1) {
        fragmentos.push({ tipo: 'codigo', contenido: texto.slice(indice + 1, fin) })
        indice = fin + 1
        continue
      }
    }

    // Solo asteriscos: el guion bajo aparece en identificadores sin comillas
    // (worker_threads, node_modules, __proto__) y nunca como énfasis en los títulos.
    const marcador = texto.startsWith('**', indice) ? '**' : caracter === '*' ? '*' : null

    const esAsteriscoSimpleRodeado =
      marcador === '*' && (texto[indice - 1] === '*' || texto[indice + 1] === '*')

    if (marcador && !esAsteriscoSimpleRodeado && puedeAbrir(texto, indice, marcador)) {
      const interior = parsearSegmento(texto, indice + marcador.length, marcador)
      if (interior.cerrado) {
        fragmentos.push({
          tipo: marcador === '**' ? 'negrita' : 'cursiva',
          contenido: interior.fragmentos,
        })
        indice = interior.indice
        continue
      }
    }

    agregarTexto(fragmentos, caracter)
    indice += 1
  }

  return { fragmentos, indice, cerrado: false }
}

export function parsearTituloEnLinea(texto: string): FragmentoTitulo[] {
  return parsearSegmento(texto, 0).fragmentos
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
