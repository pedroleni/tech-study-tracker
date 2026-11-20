import {
  ENFOCABLES_V4,
  REGIONES_V4,
  SELECTOR_ENCABEZADOS_V4,
  SELECTOR_REGIONES_V4,
  SELECTOR_TRAMPAS_V4,
  type AnalisisV4,
  type GravedadV4,
  type HallazgoV4,
  type IdCapaV4,
} from './laboratorio-v4-datos'

type ProblemaNombre = { gravedad: GravedadV4; motivo: string }

/**
 * Selector único del elemento contando hermanos. El iframe recibe exactamente
 * el mismo HTML que analizamos aquí (la lente se inyecta como un `<style>` al
 * principio, que el parser manda siempre al `<head>`), así que la ruta calculada
 * sobre este documento señala al mismo elemento allí.
 */
function rutaDe(elemento: Element): string {
  const partes: string[] = []
  let actual: Element | null = elemento
  while (actual && actual.tagName !== 'HTML') {
    const padre: Element | null = actual.parentElement
    if (!padre) break
    const posicion = [...padre.children].indexOf(actual) + 1
    partes.unshift(`${actual.tagName.toLowerCase()}:nth-child(${posicion})`)
    actual = padre
  }
  return partes.join(' > ')
}

function textoDe(elemento: Element): string {
  const texto = (elemento.textContent ?? '').replace(/\s+/g, ' ').trim()
  const alternativa =
    texto ||
    elemento.getAttribute('aria-label') ||
    elemento.getAttribute('placeholder') ||
    elemento.getAttribute('alt') ||
    '(sin texto)'
  return alternativa.length > 64 ? `${alternativa.slice(0, 63)}…` : alternativa
}

/** ¿Ese texto dice algo, o son solo símbolos? «✕» es texto, pero no es un nombre. */
function tieneLetras(texto: string): boolean {
  return /[\p{L}\p{N}]/u.test(texto)
}

function etiquetaAsociada(elemento: Element, documento: Document): boolean {
  if (elemento.closest('label')) return true
  const id = elemento.getAttribute('id')
  if (!id) return false
  return [...documento.querySelectorAll('label[for]')].some(
    (etiqueta) => etiqueta.getAttribute('for') === id
  )
}

function revisarReferencias(elemento: Element, documento: Document): ProblemaNombre | null {
  const referencias = (elemento.getAttribute('aria-labelledby') ?? '').trim()
  if (!referencias) return null
  const resuelve = referencias
    .split(/\s+/)
    .every((id) => (documento.getElementById(id)?.textContent ?? '').trim().length > 0)
  if (resuelve) return null
  return {
    gravedad: 'error',
    motivo: 'aria-labelledby apunta a un id que no existe o está vacío',
  }
}

function revisarCampo(elemento: Element, documento: Document): ProblemaNombre | null {
  const tipo = (elemento.getAttribute('type') ?? 'text').toLowerCase()
  // Estos sí traen nombre de fábrica («Enviar», «Restablecer»).
  if (['submit', 'button', 'reset'].includes(tipo)) return null
  if (etiquetaAsociada(elemento, documento)) return null
  if ((elemento.getAttribute('title') ?? '').trim()) {
    return {
      gravedad: 'aviso',
      motivo: 'solo lo nombra el title, que no aparece con el teclado ni en el móvil',
    }
  }
  if ((elemento.getAttribute('placeholder') ?? '').trim()) {
    return {
      gravedad: 'aviso',
      motivo: 'solo lo nombra el placeholder, que desaparece en cuanto escribes',
    }
  }
  return { gravedad: 'error', motivo: 'no tiene ninguna etiqueta asociada' }
}

function revisarTexto(elemento: Element): ProblemaNombre | null {
  const texto = (elemento.textContent ?? '').trim()
  if (!texto) {
    const imagenConAlt = [...elemento.querySelectorAll('img[alt]')].some((imagen) =>
      (imagen.getAttribute('alt') ?? '').trim()
    )
    if (imagenConAlt) return null
    if ((elemento.getAttribute('title') ?? '').trim()) {
      return { gravedad: 'aviso', motivo: 'solo lo nombra el title' }
    }
    return { gravedad: 'error', motivo: 'no tiene texto: se anuncia vacío' }
  }
  if (!tieneLetras(texto)) {
    return { gravedad: 'aviso', motivo: `su nombre es «${texto}»: un icono no se lee en voz alta` }
  }
  return null
}

/**
 * Aproximación al nombre accesible. Devuelve `null` cuando el elemento se
 * anuncia bien; si no, el motivo y su gravedad.
 */
function revisarNombre(elemento: Element, documento: Document): ProblemaNombre | null {
  if ((elemento.getAttribute('aria-label') ?? '').trim()) return null
  if ((elemento.getAttribute('aria-labelledby') ?? '').trim()) {
    return revisarReferencias(elemento, documento)
  }

  const etiqueta = elemento.tagName.toLowerCase()
  if (etiqueta === 'img') {
    // Un alt vacío es una decisión válida: «esta imagen no aporta nada».
    return elemento.hasAttribute('alt')
      ? null
      : { gravedad: 'error', motivo: 'una imagen sin atributo alt no tiene nombre' }
  }
  if (etiqueta === 'iframe') {
    return (elemento.getAttribute('title') ?? '').trim()
      ? null
      : { gravedad: 'error', motivo: 'un iframe sin title se anuncia como «marco»' }
  }
  if (etiqueta === 'input' || etiqueta === 'select' || etiqueta === 'textarea') {
    return revisarCampo(elemento, documento)
  }
  return revisarTexto(elemento)
}

function analizarRegiones(documento: Document): HallazgoV4[] {
  return [...documento.querySelectorAll(SELECTOR_REGIONES_V4)].map((elemento) => {
    const etiqueta = elemento.tagName.toLowerCase()
    return {
      ruta: rutaDe(elemento),
      etiqueta,
      texto: textoDe(elemento),
      detalle: REGIONES_V4[etiqueta] ?? 'región',
      gravedad: 'ok',
    }
  })
}

function analizarFoco(documento: Document): HallazgoV4[] {
  return [...documento.querySelectorAll(ENFOCABLES_V4)].map((elemento, indice) => ({
    ruta: rutaDe(elemento),
    etiqueta: elemento.tagName.toLowerCase(),
    texto: textoDe(elemento),
    detalle: String(indice + 1),
    gravedad: 'ok',
  }))
}

function analizarTrampas(documento: Document): HallazgoV4[] {
  return [...documento.querySelectorAll(SELECTOR_TRAMPAS_V4)].map((elemento) => ({
    ruta: rutaDe(elemento),
    etiqueta: elemento.tagName.toLowerCase(),
    texto: textoDe(elemento),
    detalle: 'el tabulador no llega',
    gravedad: 'error',
    codigo: elemento.outerHTML.replace(/\s+/g, ' ').slice(0, 240),
  }))
}

function analizarEncabezados(documento: Document): HallazgoV4[] {
  const encabezados: HallazgoV4[] = []
  let nivelAnterior = 0
  for (const elemento of documento.querySelectorAll(SELECTOR_ENCABEZADOS_V4)) {
    const nivel = Number(elemento.tagName[1])
    const salto = nivelAnterior !== 0 && nivel > nivelAnterior + 1
    encabezados.push({
      ruta: rutaDe(elemento),
      etiqueta: elemento.tagName.toLowerCase(),
      texto: textoDe(elemento),
      detalle: salto ? `h${nivel} · hueco en el índice` : `h${nivel}`,
      gravedad: salto ? 'aviso' : 'ok',
      sangria: nivel - 1,
    })
    nivelAnterior = nivel
  }
  return encabezados
}

function analizarNombres(documento: Document): HallazgoV4[] {
  const nombres: HallazgoV4[] = []
  const selector = 'img, iframe, input:not([type="hidden"]), select, textarea, button, a[href]'
  for (const elemento of documento.querySelectorAll(selector)) {
    const problema = revisarNombre(elemento, documento)
    if (!problema) continue
    nombres.push({
      ruta: rutaDe(elemento),
      etiqueta: elemento.tagName.toLowerCase(),
      texto: textoDe(elemento),
      detalle: problema.motivo,
      gravedad: problema.gravedad,
    })
  }
  return nombres
}

export function analizarV4(html: string): AnalisisV4 {
  // DOMParser es inerte por diseño: no ejecuta nada de lo que hay dentro.
  const documento = new DOMParser().parseFromString(html, 'text/html')
  return {
    regiones: analizarRegiones(documento),
    foco: analizarFoco(documento),
    trampas: analizarTrampas(documento),
    encabezados: analizarEncabezados(documento),
    nombres: analizarNombres(documento),
  }
}

export function hallazgosDeV4(analisis: AnalisisV4, id: IdCapaV4): HallazgoV4[] {
  if (id === 'regiones') return analisis.regiones
  if (id === 'foco') return [...analisis.foco, ...analisis.trampas]
  if (id === 'encabezados') return analisis.encabezados
  return analisis.nombres
}

/** Líneas con un `onclick` colgado de algo que no es un control. */
export function localizarTrampasV4(html: string): number[] {
  const lineas: number[] = []
  html.split('\n').forEach((linea, indice) => {
    const tieneManejador = /\son(click|mousedown|keydown)\s*=/i.test(linea)
    const esControl = /<\s*(a\s|a>|button|input|select|textarea)/i.test(linea)
    if (tieneManejador && !esControl) lineas.push(indice + 1)
  })
  return lineas
}
