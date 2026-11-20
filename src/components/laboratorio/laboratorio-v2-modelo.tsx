import { type ReactNode } from 'react'

import { CodigoEnLineaV2 } from './CodigoEnLineaV2'

/** Lo que el navegador hace alcanzable con el tabulador sin que nadie añada nada. */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * El mismo formulario que el laboratorio del tabulador, para que las variantes
 * se puedan comparar entre sí. Aquí no se edita: es una página impresa sobre la
 * que se escribe al margen.
 */
export const EJEMPLO_V2 = `<style>
  body { font-family: system-ui; padding: 16px; }
  .boton {
    background: #2563eb; color: white; padding: 8px 16px;
    border-radius: 6px; display: inline-block; cursor: pointer;
  }
</style>

<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete</h1>
    <input type="email" placeholder="tu@correo.com">

    <!-- Parece un botón. Se comporta como un botón. No es un botón. -->
    <div class="boton" onclick="enviar()">Enviar</div>

    <button>Cancelar</button>
  </main>
</body>`

/* El ámbar del ancla es el mismo que el proyecto usa para destacar una línea de
   código (`--sintaxis-destacado-borde`), escrito aquí en crudo porque las
   variables del tema no cruzan la frontera del iframe. Este tono oscuro pasa de
   4.5:1 sobre blanco, así que el número del ancla se lee. */
const ANCLA_ACTIVA = 'oklch(0.48 0.13 70)'
const ANCLA_SUAVE = 'oklch(0.62 0.12 70)'

export type AnotacionV2 = {
  id: string
  /** Trozo de texto que aparece en la línea a la que se ancla la nota. */
  ancla: string
  /** Selector del elemento que la nota señala dentro de la página. */
  selector: string
  /** Palabra que encabeza la nota: «Problema», «Apunte», «Bien». */
  rotulo: string
  /** Solo el problema se pinta en rojo; lo demás es tinta negra. */
  problema?: boolean
  titulo: string
  texto: ReactNode
  arreglo?: { titulo: string; codigo: string }
}

/** En el orden en que aparecen en el código: el número de la nota es su posición. */
export const ANOTACIONES_V2: AnotacionV2[] = [
  {
    id: 'pintura',
    ancla: '.boton {',
    selector: '.boton',
    rotulo: 'Apunte',
    titulo: 'Cinco declaraciones de pintura',
    texto: (
      <>
        Fondo, color, esquinas, cursor. Todo esto cuenta cómo se <em>ve</em> el elemento y ninguna
        línea dice que se pueda pulsar. Ni siquiera <CodigoEnLineaV2>cursor: pointer</CodigoEnLineaV2>, que solo cambia el
        dibujo del ratón: el aspecto y el comportamiento viajan por caminos separados, y el CSS no
        cruza al otro.
      </>
    ),
  },
  {
    id: 'enlaces',
    ancla: '<a href="/">Inicio</a>',
    selector: 'nav a',
    rotulo: 'Bien',
    titulo: 'Los enlaces entran solos',
    texto: (
      <>
        Un <CodigoEnLineaV2>&lt;a&gt;</CodigoEnLineaV2> con <CodigoEnLineaV2>href</CodigoEnLineaV2> es la primera y la segunda parada del recorrido,
        sin pedir permiso. Quítale el <CodigoEnLineaV2>href</CodigoEnLineaV2> y seguirá viéndose exactamente igual, pero
        desaparecerá del recorrido: es el error de más abajo, cometido en otra etiqueta.
      </>
    ),
  },
  {
    id: 'campo',
    ancla: '<input type="email"',
    selector: 'input[type="email"]',
    rotulo: 'Apunte',
    titulo: 'Se alcanza, pero se queda sin nombre',
    texto: (
      <>
        El campo es enfocable por sí solo. Lo que no tiene es etiqueta: su único texto es el{' '}
        <CodigoEnLineaV2>placeholder</CodigoEnLineaV2>, que desaparece justo cuando empiezas a escribir. Un{' '}
        <CodigoEnLineaV2>&lt;label for&gt;</CodigoEnLineaV2> no se borra nunca, y además amplía la zona pulsable.
      </>
    ),
    arreglo: {
      titulo: 'Con etiqueta',
      codigo: `<label for="correo">Tu correo</label>
<input id="correo" type="email" placeholder="tu@correo.com">`,
    },
  },
  {
    id: 'boton-falso',
    ancla: '<div class="boton" onclick',
    selector: '.boton',
    rotulo: 'Problema',
    problema: true,
    titulo: 'El botón que no es un botón',
    texto: (
      <>
        Tiene el aspecto, tiene el cursor y tiene el <CodigoEnLineaV2>onclick</CodigoEnLineaV2>. Pero es un{' '}
        <CodigoEnLineaV2>&lt;div&gt;</CodigoEnLineaV2>: el navegador no lo mete en el recorrido del tabulador, no responde a
        Enter ni a Espacio, y un lector de pantalla lo anuncia como un trozo de texto cualquiera.
        Quien no use ratón no puede enviar este formulario.
      </>
    ),
    arreglo: {
      titulo: 'El arreglo, en una línea',
      codigo: `<!-- Mismo aspecto. Todo el comportamiento, de fábrica. -->
<button class="boton" type="submit">Enviar</button>`,
    },
  },
  {
    id: 'boton-real',
    ancla: '<button>Cancelar</button>',
    selector: 'main button',
    rotulo: 'Bien',
    titulo: 'El de al lado sí lo es',
    texto: (
      <>
        Dos cosas que se pulsan en el mismo formulario y solo una funciona sin ratón. Esta trae
        incluidos el foco, Enter, Espacio y el anuncio «Cancelar, botón», y no ha hecho falta
        escribir ni un atributo. La versión correcta casi siempre es la más corta.
      </>
    ),
  },
]

/** Número de línea (empezando en 1) donde aparece el ancla, o 0 si no está. */
export function localizarLineaV2(codigo: string, ancla: string) {
  return codigo.split('\n').findIndex((linea) => linea.includes(ancla)) + 1
}

function atributoObjetivo(elemento: Element): string {
  const clase = elemento.getAttribute('class')?.split(/\s+/)[0]
  if (clase) return ` class="${clase}"`
  const tipo = elemento.getAttribute('type')
  if (tipo) return ` type="${tipo}"`
  return ''
}

/** Describe el objetivo de una nota como lo escribiría alguien: `<div class="boton">`. */
function describirObjetivo(elementos: Element[]) {
  const elemento = elementos[0]
  if (!elemento) return 'sin coincidencias'
  const etiqueta = elemento.tagName.toLowerCase()
  const atributo = atributoObjetivo(elemento)
  const repeticion = elementos.length > 1 ? ` ×${elementos.length}` : ''
  return `<${etiqueta}${atributo}>${repeticion}`
}

export type AnalisisV2 = {
  /** Descripción del elemento al que apunta cada nota, por id de nota. */
  objetivos: Record<string, string>
  paradas: number
  trampas: string[]
}

/**
 * Todo el análisis sale de DOMParser: un documento inerte, sin ejecución de
 * nada. Es la misma lectura que hace el navegador, hecha aparte.
 */
export function analizarV2(html: string, anotaciones: AnotacionV2[]): AnalisisV2 {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const objetivos: Record<string, string> = {}
  for (const nota of anotaciones) {
    objetivos[nota.id] = describirObjetivo([...doc.querySelectorAll(nota.selector)])
  }
  return {
    objetivos,
    paradas: doc.querySelectorAll(ENFOCABLES).length,
    // Parece interactivo y sin embargo el foco nunca pasa por ahí.
    trampas: [...doc.querySelectorAll('[onclick], [role="button"]')]
      .filter((elemento) => !elemento.matches(ENFOCABLES))
      .map((elemento) => elemento.textContent?.trim() || '(sin texto)'),
  }
}

/** Una regla que rodea el elemento señalado y le cuelga el número de la nota. */
function reglaAncla(selector: string, numeros: string, activa: boolean) {
  const color = activa ? ANCLA_ACTIVA : ANCLA_SUAVE
  return `
  ${selector} {
    outline: ${activa ? '2px solid' : '1px dashed'} ${color};
    outline-offset: 4px;
    position: relative;
  }
  ${selector}::after {
    content: "${numeros}";
    position: absolute; top: -11px; left: -11px;
    background: ${activa ? color : '#ffffff'};
    color: ${activa ? '#ffffff' : color};
    border: 1px solid ${color};
    font: 700 11px/16px system-ui, sans-serif;
    min-width: 16px; height: 16px; padding: 0 3px;
    border-radius: 999px; text-align: center;
  }`
}

/**
 * Hoja de estilo que se antepone al ejemplo. Las notas que comparten elemento
 * comparten globo (`1 4`), y la nota activa se escribe la última para ganar.
 */
export function capaAnclasV2(
  anotaciones: AnotacionV2[],
  activa: AnotacionV2 | null,
  todas: boolean
) {
  const reglas: string[] = []
  if (todas) {
    const porSelector = new Map<string, number[]>()
    anotaciones.forEach((nota, indice) => {
      porSelector.set(nota.selector, [...(porSelector.get(nota.selector) ?? []), indice + 1])
    })
    for (const [selector, numeros] of porSelector) {
      reglas.push(reglaAncla(selector, numeros.join(' '), false))
    }
  }
  if (activa) {
    reglas.push(reglaAncla(activa.selector, String(anotaciones.indexOf(activa) + 1), true))
  }
  return reglas.length === 0 ? '' : `<style>${reglas.join('\n')}\n</style>\n`
}
