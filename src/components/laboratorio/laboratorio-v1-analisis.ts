import { ENFOCABLES_V1, type Fichero, type Nivel } from './laboratorio-v1-datos'

export type DiagnosticoV1 = {
  clave: string
  nivel: Nivel
  regla: string
  mensaje: string
  pista?: string
  fichero: Fichero
  linea: number
  columna: number
}

export type PasoFocoV1 = { firma: string; texto: string }

export type AnalisisV1 = {
  diagnosticos: DiagnosticoV1[]
  recorrido: PasoFocoV1[]
  trampas: PasoFocoV1[]
}

type Posicion = { linea: number; columna: number }
type NuevoDiagnostico = Omit<DiagnosticoV1, 'clave' | 'fichero' | 'linea' | 'columna'>
type AnotarHtml = (elemento: Element, diagnostico: NuevoDiagnostico) => void

function truncar(texto: string, limite = 44) {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  return limpio.length > limite ? `${limpio.slice(0, limite - 1)}…` : limpio
}

function describir(elemento: Element): PasoFocoV1 {
  const etiqueta = elemento.tagName.toLowerCase()
  const clase = elemento.getAttribute('class')
  return {
    firma: `<${etiqueta}${clase ? ` class="${clase}"` : ''}>`,
    texto: truncar(
      elemento.textContent?.trim() ||
        elemento.getAttribute('placeholder') ||
        elemento.getAttribute('aria-label') ||
        elemento.getAttribute('value') ||
        '(sin texto)'
    ),
  }
}

/**
 * DOMParser entrega elementos, no posiciones. Para poder escribir
 * `index.html:12:5` como haría un linter de verdad, se busca la firma del
 * elemento en el texto original. Si la misma firma se repite, cada búsqueda
 * arranca donde terminó la anterior para no señalar siempre la primera.
 */
function crearLocalizador(fuente: string) {
  const lineas = fuente.split('\n')
  const encontradas = new Map<Element, Posicion>()
  const siguienteDesde = new Map<string, number>()

  return (elemento: Element): Posicion => {
    const previa = encontradas.get(elemento)
    if (previa) return previa

    const etiqueta = elemento.tagName.toLowerCase()
    const clase = elemento.getAttribute('class')
    const agujas = [
      elemento.outerHTML.split('\n')[0],
      clase ? `<${etiqueta} class="${clase}"` : '',
      `<${etiqueta}`,
    ].filter(Boolean)

    for (const aguja of agujas) {
      for (let indice = siguienteDesde.get(aguja) ?? 0; indice < lineas.length; indice += 1) {
        const columna = lineas[indice].indexOf(aguja)
        if (columna === -1) continue
        siguienteDesde.set(aguja, indice + 1)
        const posicion = { linea: indice + 1, columna: columna + 1 }
        encontradas.set(elemento, posicion)
        return posicion
      }
    }

    const porDefecto = { linea: 1, columna: 1 }
    encontradas.set(elemento, porDefecto)
    return porDefecto
  }
}

/**
 * Un campo tiene nombre si alguien —quien sea— se lo da. El placeholder no
 * cuenta: desaparece en cuanto se escribe la primera letra.
 *
 * `destinos` son los `for` de las etiquetas del documento. Se comparan como
 * cadenas en vez de construir un selector `label[for="…"]`, porque un `id` con
 * comillas dentro rompería el selector.
 */
function tieneNombreAccesible(campo: Element, destinos: Set<string>) {
  if (campo.getAttribute('aria-label')?.trim()) return true
  if (campo.getAttribute('aria-labelledby')?.trim()) return true
  if (campo.getAttribute('title')?.trim()) return true
  if (campo.closest('label')) return true
  const id = campo.getAttribute('id')
  return Boolean(id && destinos.has(id))
}

function crearAnotadorHtml(
  posicionDe: (elemento: Element) => Posicion,
  diagnosticos: DiagnosticoV1[]
): AnotarHtml {
  return (elemento, diagnostico) => {
    const { linea, columna } = posicionDe(elemento)
    diagnosticos.push({
      ...diagnostico,
      clave: `${diagnostico.regla}:${linea}:${columna}:${diagnosticos.length}`,
      fichero: 'index.html',
      linea,
      columna,
    })
  }
}

function revisarControles(documento: Document, anotar: AnotarHtml) {
  for (const elemento of documento.querySelectorAll('[onclick], [role="button"]')) {
    if (elemento.matches(ENFOCABLES_V1)) continue
    const { firma, texto } = describir(elemento)
    anotar(elemento, {
      nivel: 'error',
      regla: 'a11y/control-inalcanzable',
      mensaje: `${firma} responde al clic, pero el tabulador nunca se detiene en «${texto}»`,
      pista: 'Un <button> entra solo en el recorrido del teclado y responde a Enter y Espacio.',
    })
  }
}

function revisarRoles(documento: Document, anotar: AnotarHtml) {
  // Quien añade tabindex a un div arregla la mitad: ya se llega, pero se anuncia
  // como texto suelto.
  for (const elemento of documento.querySelectorAll('[tabindex]:not([tabindex="-1"])')) {
    const etiqueta = elemento.tagName.toLowerCase()
    if (['a', 'button', 'input', 'select', 'textarea'].includes(etiqueta)) continue
    if (elemento.getAttribute('role')?.trim()) continue
    anotar(elemento, {
      nivel: 'aviso',
      regla: 'a11y/sin-rol',
      mensaje: `${describir(elemento).firma} ya recibe el foco, pero el lector de pantalla no dice qué es`,
      pista: 'Sin role="button" se anuncia como texto: nadie sabe que se puede pulsar.',
    })
  }

  for (const elemento of documento.querySelectorAll('[role="button"]')) {
    if (elemento.tagName.toLowerCase() === 'button') continue
    anotar(elemento, {
      nivel: 'aviso',
      regla: 'a11y/teclas-del-boton',
      mensaje: `${describir(elemento).firma} dice ser un botón sin serlo`,
      pista: 'Enter y Espacio no lo activan solos: hay que programarlos a mano.',
    })
  }
}

function revisarTabindex(documento: Document, anotar: AnotarHtml) {
  for (const elemento of documento.querySelectorAll('[tabindex]')) {
    if (Number(elemento.getAttribute('tabindex')) <= 0) continue
    anotar(elemento, {
      nivel: 'aviso',
      regla: 'a11y/tabindex-positivo',
      mensaje: `${describir(elemento).firma} usa un tabindex mayor que cero`,
      pista: 'Se adelanta a todo lo demás y descoloca el orden natural de la página.',
    })
  }
}

function revisarCampos(documento: Document, anotar: AnotarHtml) {
  const destinos = new Set(
    [...documento.querySelectorAll('label[for]')]
      .map((etiqueta) => etiqueta.getAttribute('for') ?? '')
      .filter(Boolean)
  )
  const campos =
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea'

  for (const campo of documento.querySelectorAll(campos)) {
    if (tieneNombreAccesible(campo, destinos)) continue
    const marcador = campo.getAttribute('placeholder')
    anotar(campo, {
      nivel: 'error',
      regla: 'a11y/campo-sin-nombre',
      mensaje: `${describir(campo).firma} no tiene etiqueta asociada`,
      pista: marcador
        ? `«${truncar(marcador)}» es un placeholder: desaparece al escribir y no todos los lectores lo anuncian.`
        : 'Asócialo con <label for="…"> o dale un aria-label.',
    })
  }
}

function revisarImagenesYEnlaces(documento: Document, anotar: AnotarHtml) {
  for (const imagen of documento.querySelectorAll('img:not([alt])')) {
    anotar(imagen, {
      nivel: 'error',
      regla: 'a11y/imagen-sin-alt',
      mensaje: '<img> sin atributo alt',
      pista: 'Si la imagen es decorativa, alt="" la oculta a propósito. Sin alt, se lee la URL.',
    })
  }

  for (const enlace of documento.querySelectorAll('a[href]')) {
    if (enlace.textContent?.trim() || enlace.getAttribute('aria-label')?.trim()) continue
    anotar(enlace, {
      nivel: 'aviso',
      regla: 'a11y/enlace-sin-texto',
      mensaje: '<a> sin texto: se anuncia como «enlace»',
    })
  }
}

export function analizarHtmlV1(fuente: string): AnalisisV1 {
  // DOMParser es inerte por diseño: construye el árbol sin ejecutar nada.
  const documento = new DOMParser().parseFromString(fuente, 'text/html')
  const diagnosticos: DiagnosticoV1[] = []
  const anotar = crearAnotadorHtml(crearLocalizador(fuente), diagnosticos)

  revisarControles(documento, anotar)
  revisarRoles(documento, anotar)
  revisarTabindex(documento, anotar)
  revisarCampos(documento, anotar)
  revisarImagenesYEnlaces(documento, anotar)

  const recorrido = [...documento.querySelectorAll(ENFOCABLES_V1)].map(describir)
  const trampas = [...documento.querySelectorAll('[onclick], [role="button"]')]
    .filter((elemento) => !elemento.matches(ENFOCABLES_V1))
    .map(describir)

  return { diagnosticos, recorrido, trampas }
}

function posicionDeCss(lineas: string[], patron: RegExp): Posicion {
  const indice = lineas.findIndex((linea) => patron.test(linea))
  if (indice === -1) return { linea: 1, columna: 1 }
  return { linea: indice + 1, columna: Math.max(lineas[indice].search(/\S/), 0) + 1 }
}

function diagnosticoCss(
  lineas: string[],
  patron: RegExp,
  diagnostico: Omit<DiagnosticoV1, 'clave' | 'fichero' | 'linea' | 'columna'>
): DiagnosticoV1 {
  const { linea, columna } = posicionDeCss(lineas, patron)
  return {
    ...diagnostico,
    clave: `${diagnostico.regla}:${linea}`,
    fichero: 'estilos.css',
    linea,
    columna,
  }
}

/**
 * El CSS se revisa como texto, sin ejecutarlo ni aplicarlo. Es una heurística
 * a propósito: busca la asimetría clásica entre el ratón y el teclado.
 */
export function analizarCssV1(fuente: string): DiagnosticoV1[] {
  const lineas = fuente.split('\n')
  const diagnosticos: DiagnosticoV1[] = []
  const declaraFoco = /:focus(-visible|-within)?\b/.test(fuente)
  const quitaElFoco = /outline\s*:\s*(none|0)\b/

  if (quitaElFoco.test(fuente) && !declaraFoco) {
    diagnosticos.push(
      diagnosticoCss(lineas, quitaElFoco, {
        nivel: 'error',
        regla: 'a11y/foco-borrado',
        mensaje: 'se apaga el anillo de foco y no se sustituye por nada',
        pista: 'Quien navega con el teclado deja de ver dónde está.',
      })
    )
  }

  const estiloDeRaton = /:hover\b|cursor\s*:\s*pointer/
  if (!declaraFoco && estiloDeRaton.test(fuente)) {
    diagnosticos.push(
      diagnosticoCss(lineas, estiloDeRaton, {
        nivel: 'aviso',
        regla: 'a11y/foco-sin-estilo',
        mensaje: 'hay estilos para el ratón (:hover) y ninguno para el teclado (:focus-visible)',
        pista: 'El mismo elemento que se ilumina al pasar el ratón no da ninguna señal al recibir el foco.',
      })
    )
  }

  return diagnosticos
}
