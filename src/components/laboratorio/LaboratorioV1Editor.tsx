import { useId, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import {
  Braces,
  CircleCheck,
  CircleX,
  FileCode,
  Keyboard,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  WandSparkles,
} from 'lucide-react'

import { CodigoResaltado, EditorCodigo } from '@/components/codigo'
import { cn } from '@/lib/utils'

/**
 * Selector de lo que el navegador hace alcanzable con el tabulador por sí solo,
 * sin que nadie tenga que añadir nada. Es el mismo de LaboratorioFoco: las dos
 * variantes cuentan la misma lección y tienen que coincidir en los hechos.
 */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

type Fichero = 'index.html' | 'estilos.css'
type Nivel = 'error' | 'aviso'
type Panel = 'problemas' | 'recorrido' | 'correccion'

const HTML_INICIAL = `<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete al boletín</h1>
    <p>Un correo al mes. Nada más.</p>

    <input type="email" placeholder="tu@correo.com">

    <!-- Parece un botón, se pinta como un botón... pero es un div. -->
    <div class="boton" onclick="enviar()">Enviar</div>

    <button class="secundario">Cancelar</button>
  </main>
</body>`

const CSS_INICIAL = `body {
  font-family: system-ui, sans-serif;
  color: #0f172a;
  padding: 20px;
}

nav a {
  color: #1d4ed8;
  margin-right: 12px;
}

h1 { font-size: 20px; margin: 18px 0 4px; }
p  { color: #475569; margin: 0 0 16px; }

input {
  width: 220px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.boton {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.boton:hover {
  background: #1d4ed8;
}

.secundario {
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
}`

/**
 * Defensa en profundidad dentro de la vista previa: el `sandbox=""` del iframe
 * ya impide ejecutar scripts, y esta política impide además cualquier petición
 * de red (una `url()` en el CSS del usuario revelaría su IP a un tercero).
 */
const META_SEGURIDAD = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;">`

/**
 * Subrayado de editor sobre la propia página: marca lo que responde al ratón
 * pero no al teclado. Es una aproximación en CSS de dos reglas del panel de
 * problemas —el CSS no puede comprobar si un `label` apunta a un `id`—, así que
 * la lista de abajo manda sobre lo que se ve aquí.
 */
const CAPA_PROBLEMAS = `<style>
  [onclick]:not(${ENFOCABLES}), [role="button"]:not(${ENFOCABLES}) {
    position: relative;
    outline: 2px dashed #dc2626;
    outline-offset: 3px;
    text-decoration: underline wavy #dc2626 2px;
    text-underline-offset: 5px;
  }
  [onclick]:not(${ENFOCABLES})::after, [role="button"]:not(${ENFOCABLES})::after {
    content: "error: el tabulador no llega";
    position: absolute; left: 50%; top: -11px; transform: translateX(-50%);
    background: #dc2626; color: #ffffff; white-space: nowrap;
    font: bold 10px/16px ui-monospace, monospace;
    padding: 0 6px; border-radius: 3px;
  }
  input:not([id]):not([aria-label]):not([aria-labelledby]):not([title]):not([type="hidden"]):not([type="submit"]) {
    outline: 2px dotted #b45309;
    outline-offset: 3px;
  }
</style>`

/** Numera, sobre la página, lo que el tabulador alcanza y en qué orden. */
const CAPA_TABULACION = `<style>
  body { counter-reset: orden; }
  ${ENFOCABLES} {
    counter-increment: orden;
    outline: 2px solid #2563eb;
    outline-offset: 3px;
    position: relative;
  }
  a[href]::before, button::before, select::before, textarea::before {
    content: counter(orden);
    position: absolute; top: -9px; left: -9px;
    background: #2563eb; color: #ffffff; text-align: center;
    font: bold 10px/16px ui-monospace, monospace;
    min-width: 16px; height: 16px; border-radius: 999px;
  }
</style>`

/**
 * La corrección que aplica el botón «Aplicar corrección», expresada como
 * sustituciones de texto: así el botón solo se ofrece mientras el fragmento
 * original siga ahí, y nunca reescribe lo que haya cambiado el usuario.
 */
const CORRECCIONES: { fichero: Fichero; buscar: string; reemplazar: string }[] = [
  {
    fichero: 'index.html',
    buscar: '    <input type="email" placeholder="tu@correo.com">',
    reemplazar:
      '    <label for="correo">Tu correo electrónico</label>\n' +
      '    <input id="correo" type="email" placeholder="tu@correo.com">',
  },
  {
    fichero: 'index.html',
    buscar:
      '    <!-- Parece un botón, se pinta como un botón... pero es un div. -->\n' +
      '    <div class="boton" onclick="enviar()">Enviar</div>',
    reemplazar: '    <button class="boton" type="submit">Enviar</button>',
  },
  {
    fichero: 'estilos.css',
    buscar: '.boton {\n  display: inline-block;',
    reemplazar: '.boton {\n  display: inline-block;\n  border: 0;\n  font: inherit;',
  },
  {
    fichero: 'estilos.css',
    buscar: '.boton:hover {\n  background: #1d4ed8;\n}',
    reemplazar:
      '.boton:hover {\n  background: #1d4ed8;\n}\n\n' +
      '.boton:focus-visible {\n  outline: 3px solid #0f172a;\n  outline-offset: 2px;\n}',
  },
]

const HTML_CORREGIDO = `<label for="correo">Tu correo electrónico</label>
<input id="correo" type="email" placeholder="tu@correo.com">

<button class="boton" type="submit">Enviar</button>`

const CSS_CORREGIDO = `.boton {
  border: 0;
  font: inherit;
}

.boton:focus-visible {
  outline: 3px solid #0f172a;
  outline-offset: 2px;
}`

type Diagnostico = {
  clave: string
  nivel: Nivel
  regla: string
  mensaje: string
  pista?: string
  fichero: Fichero
  linea: number
  columna: number
}

type PasoFoco = { firma: string; texto: string }

type Analisis = {
  diagnosticos: Diagnostico[]
  recorrido: PasoFoco[]
  trampas: PasoFoco[]
}

type Posicion = { linea: number; columna: number }

function truncar(texto: string, limite = 44) {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  return limpio.length > limite ? `${limpio.slice(0, limite - 1)}…` : limpio
}

function describir(elemento: Element): PasoFoco {
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

function analizarHtml(fuente: string): Analisis {
  // DOMParser es inerte por diseño: construye el árbol sin ejecutar nada.
  const documento = new DOMParser().parseFromString(fuente, 'text/html')
  const posicionDe = crearLocalizador(fuente)
  const diagnosticos: Diagnostico[] = []

  const anotar = (
    elemento: Element,
    nivel: Nivel,
    regla: string,
    mensaje: string,
    pista?: string
  ) => {
    const { linea, columna } = posicionDe(elemento)
    diagnosticos.push({
      clave: `${regla}:${linea}:${columna}:${diagnosticos.length}`,
      nivel,
      regla,
      mensaje,
      pista,
      fichero: 'index.html',
      linea,
      columna,
    })
  }

  for (const elemento of documento.querySelectorAll('[onclick], [role="button"]')) {
    if (elemento.matches(ENFOCABLES)) continue
    const { firma, texto } = describir(elemento)
    anotar(
      elemento,
      'error',
      'a11y/control-inalcanzable',
      `${firma} responde al clic, pero el tabulador nunca se detiene en «${texto}»`,
      'Un <button> entra solo en el recorrido del teclado y responde a Enter y Espacio.'
    )
  }

  // Quien añade tabindex a un div arregla la mitad: ya se llega, pero se anuncia
  // como texto suelto.
  for (const elemento of documento.querySelectorAll('[tabindex]:not([tabindex="-1"])')) {
    const etiqueta = elemento.tagName.toLowerCase()
    if (['a', 'button', 'input', 'select', 'textarea'].includes(etiqueta)) continue
    if (elemento.getAttribute('role')?.trim()) continue
    anotar(
      elemento,
      'aviso',
      'a11y/sin-rol',
      `${describir(elemento).firma} ya recibe el foco, pero el lector de pantalla no dice qué es`,
      'Sin role="button" se anuncia como texto: nadie sabe que se puede pulsar.'
    )
  }

  for (const elemento of documento.querySelectorAll('[role="button"]')) {
    if (elemento.tagName.toLowerCase() === 'button') continue
    anotar(
      elemento,
      'aviso',
      'a11y/teclas-del-boton',
      `${describir(elemento).firma} dice ser un botón sin serlo`,
      'Enter y Espacio no lo activan solos: hay que programarlos a mano.'
    )
  }

  for (const elemento of documento.querySelectorAll('[tabindex]')) {
    if (Number(elemento.getAttribute('tabindex')) > 0) {
      anotar(
        elemento,
        'aviso',
        'a11y/tabindex-positivo',
        `${describir(elemento).firma} usa un tabindex mayor que cero`,
        'Se adelanta a todo lo demás y descoloca el orden natural de la página.'
      )
    }
  }

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
    anotar(
      campo,
      'error',
      'a11y/campo-sin-nombre',
      `${describir(campo).firma} no tiene etiqueta asociada`,
      marcador
        ? `«${truncar(marcador)}» es un placeholder: desaparece al escribir y no todos los lectores lo anuncian.`
        : 'Asócialo con <label for="…"> o dale un aria-label.'
    )
  }

  for (const imagen of documento.querySelectorAll('img:not([alt])')) {
    anotar(
      imagen,
      'error',
      'a11y/imagen-sin-alt',
      '<img> sin atributo alt',
      'Si la imagen es decorativa, alt="" la oculta a propósito. Sin alt, se lee la URL.'
    )
  }

  for (const enlace of documento.querySelectorAll('a[href]')) {
    if (enlace.textContent?.trim() || enlace.getAttribute('aria-label')?.trim()) continue
    anotar(enlace, 'aviso', 'a11y/enlace-sin-texto', '<a> sin texto: se anuncia como «enlace»')
  }

  const recorrido = [...documento.querySelectorAll(ENFOCABLES)].map(describir)
  const trampas = [...documento.querySelectorAll('[onclick], [role="button"]')]
    .filter((elemento) => !elemento.matches(ENFOCABLES))
    .map(describir)

  return { diagnosticos, recorrido, trampas }
}

/**
 * El CSS se revisa como texto, sin ejecutarlo ni aplicarlo. Es una heurística
 * a propósito: busca la asimetría clásica entre el ratón y el teclado.
 */
function analizarCss(fuente: string): Diagnostico[] {
  const lineas = fuente.split('\n')
  const diagnosticos: Diagnostico[] = []
  const declaraFoco = /:focus(-visible|-within)?\b/.test(fuente)

  const posicionDe = (patron: RegExp): Posicion => {
    const indice = lineas.findIndex((linea) => patron.test(linea))
    if (indice === -1) return { linea: 1, columna: 1 }
    return { linea: indice + 1, columna: Math.max(lineas[indice].search(/\S/), 0) + 1 }
  }

  const anotar = (nivel: Nivel, regla: string, mensaje: string, pista: string, patron: RegExp) => {
    const { linea, columna } = posicionDe(patron)
    diagnosticos.push({
      clave: `${regla}:${linea}`,
      nivel,
      regla,
      mensaje,
      pista,
      fichero: 'estilos.css',
      linea,
      columna,
    })
  }

  const quitaElFoco = /outline\s*:\s*(none|0)\b/
  if (quitaElFoco.test(fuente) && !declaraFoco) {
    anotar(
      'error',
      'a11y/foco-borrado',
      'se apaga el anillo de foco y no se sustituye por nada',
      'Quien navega con el teclado deja de ver dónde está.',
      quitaElFoco
    )
  }

  const estiloDeRaton = /:hover\b|cursor\s*:\s*pointer/
  if (!declaraFoco && estiloDeRaton.test(fuente)) {
    anotar(
      'aviso',
      'a11y/foco-sin-estilo',
      'hay estilos para el ratón (:hover) y ninguno para el teclado (:focus-visible)',
      'El mismo elemento que se ilumina al pasar el ratón no da ninguna señal al recibir el foco.',
      estiloDeRaton
    )
  }

  return diagnosticos
}

type PropiedadesPestana<T extends string> = {
  id: T
  etiqueta: string
  icono?: ReactNode
  insignia?: number
  nombreAccesible?: string
}

type PropiedadesPestanas<T extends string> = {
  pestanas: PropiedadesPestana<T>[]
  activa: T
  alCambiar: (id: T) => void
  etiqueta: string
  idPestana: (id: T) => string
  idPanel: (id: T) => string
  className?: string
}

/**
 * Pestañas con teclado completo: flechas para moverse, Inicio y Fin para los
 * extremos, y un solo punto de entrada con el tabulador (tabIndex móvil).
 */
function Pestanas<T extends string>({
  pestanas,
  activa,
  alCambiar,
  etiqueta,
  idPestana,
  idPanel,
  className,
}: PropiedadesPestanas<T>) {
  const alTeclado = (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const saltos: Record<string, number> = {
      ArrowRight: indice + 1,
      ArrowLeft: indice - 1,
      Home: 0,
      End: pestanas.length - 1,
    }
    const destino = saltos[evento.key]
    if (destino === undefined) return
    evento.preventDefault()
    const siguiente = pestanas[(destino + pestanas.length) % pestanas.length]
    alCambiar(siguiente.id)
    document.getElementById(idPestana(siguiente.id))?.focus()
  }

  return (
    <div role="tablist" aria-label={etiqueta} className={cn('flex min-w-0 overflow-x-auto', className)}>
      {pestanas.map((pestana, indice) => {
        const seleccionada = pestana.id === activa
        return (
          <button
            key={pestana.id}
            type="button"
            role="tab"
            id={idPestana(pestana.id)}
            aria-selected={seleccionada}
            aria-controls={seleccionada ? idPanel(pestana.id) : undefined}
            aria-label={pestana.nombreAccesible}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => alCambiar(pestana.id)}
            onKeyDown={(evento) => alTeclado(evento, indice)}
            className={cn(
              'flex min-h-11 shrink-0 touch-manipulation items-center gap-1.5 border-r px-3 py-2 font-mono text-xs whitespace-nowrap transition-colors',
              'focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring',
              seleccionada
                ? 'border-b-2 border-b-primary bg-background text-foreground'
                : 'border-b border-b-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            {pestana.icono}
            {pestana.etiqueta}
            {pestana.insignia ? (
              <span
                aria-hidden="true"
                className="rounded bg-destructive/20 px-1 text-[10px] leading-4 text-destructive"
              >
                {pestana.insignia}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

const CLASES_BOTON =
  'inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-[11px] transition-colors ' +
  'hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
  'disabled:pointer-events-none disabled:opacity-40'

/**
 * El panel es oscuro en los dos temas de la aplicación, a propósito: imita un
 * editor incrustado. La clase `dark` no es decorativa —redefine las variables
 * del tema y las de `sintaxis.css`—, así que todo lo de dentro (bordes, texto
 * apagado, colores de los tokens) usa la paleta oscura ya contrastada.
 */
const ESTILO_PANEL = {
  // `--sintaxis-texto` se declara en `:root` como `var(--foreground)` y llega
  // aquí ya resuelto en claro; volver a declararla sobre este contenedor —que
  // sí es `.dark`— hace que el texto plano del código use el color correcto.
  '--sintaxis-texto': 'var(--foreground)',
} as CSSProperties

export function LaboratorioV1Editor() {
  const [html, setHtml] = useState(HTML_INICIAL)
  const [css, setCss] = useState(CSS_INICIAL)
  const [ficheroActivo, setFicheroActivo] = useState<Fichero>('index.html')
  const [panelActivo, setPanelActivo] = useState<Panel>('problemas')
  const [marcarProblemas, setMarcarProblemas] = useState(true)
  const [verTabulacion, setVerTabulacion] = useState(false)
  const base = useId()

  const analisis = useMemo(() => analizarHtml(html), [html])
  const diagnosticosCss = useMemo(() => analizarCss(css), [css])

  const diagnosticos = useMemo(
    () => [...analisis.diagnosticos, ...diagnosticosCss],
    [analisis.diagnosticos, diagnosticosCss]
  )
  const errores = diagnosticos.filter((problema) => problema.nivel === 'error').length
  const avisos = diagnosticos.length - errores

  const lineasConError = useMemo(
    () =>
      diagnosticos
        .filter((problema) => problema.fichero === ficheroActivo)
        .map((problema) => problema.linea),
    [diagnosticos, ficheroActivo]
  )

  const documento = useMemo(
    () =>
      [
        META_SEGURIDAD,
        `<style>\n${css}\n</style>`,
        marcarProblemas ? CAPA_PROBLEMAS : '',
        verTabulacion ? CAPA_TABULACION : '',
        html,
      ]
        .filter(Boolean)
        .join('\n'),
    [css, html, marcarProblemas, verTabulacion]
  )

  const fuenteActiva = ficheroActivo === 'index.html' ? html : css
  const pendientes = CORRECCIONES.filter((correccion) =>
    (correccion.fichero === 'index.html' ? html : css).includes(correccion.buscar)
  )

  const aplicarCorreccion = () => {
    let htmlNuevo = html
    let cssNuevo = css
    for (const correccion of pendientes) {
      if (correccion.fichero === 'index.html') {
        htmlNuevo = htmlNuevo.replace(correccion.buscar, correccion.reemplazar)
      } else {
        cssNuevo = cssNuevo.replace(correccion.buscar, correccion.reemplazar)
      }
    }
    setHtml(htmlNuevo)
    setCss(cssNuevo)
    setPanelActivo('problemas')
  }

  const restaurar = () => {
    setHtml(HTML_INICIAL)
    setCss(CSS_INICIAL)
    setPanelActivo('problemas')
  }

  const idPestanaFichero = (id: Fichero) => `${base}-fichero-${id}`
  const idPanelFichero = (id: Fichero) => `${base}-editor-${id}`
  const idPestanaPanel = (id: Panel) => `${base}-pestana-${id}`
  const idPanelInferior = (id: Panel) => `${base}-panel-${id}`

  const problemasPorFichero = (fichero: Fichero) =>
    diagnosticos.filter((problema) => problema.fichero === fichero).length

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Un formulario visto desde el editor</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Este formulario de suscripción se ve impecable y su botón principal es un{' '}
        <code>&lt;div&gt;</code> disfrazado: nadie que navegue con el teclado podrá enviarlo.
        Edita los ficheros, mira el panel de problemas y arregla la página —o deja que el editor
        lo haga por ti y compara.
      </p>

      <section
        aria-label="Editor del laboratorio"
        style={ESTILO_PANEL}
        className="dark mt-6 overflow-hidden rounded-xl border bg-background text-foreground shadow-lg"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/40 px-3 py-2">
          <span aria-hidden="true" className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </span>
          <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
            laboratorio-html / <span className="text-foreground">formulario-suscripcion</span>
          </p>
          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
            <button type="button" onClick={restaurar} className={CLASES_BOTON}>
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              Restaurar
            </button>
            <button
              type="button"
              onClick={aplicarCorreccion}
              disabled={pendientes.length === 0}
              className={cn(CLASES_BOTON, 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90')}
            >
              <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Aplicar corrección
            </button>
          </div>
        </div>

        <div className="grid min-w-0 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col border-b lg:border-r lg:border-b-0">
            <Pestanas
              etiqueta="Ficheros del proyecto"
              pestanas={[
                {
                  id: 'index.html' as Fichero,
                  etiqueta: 'index.html',
                  icono: <FileCode aria-hidden="true" className="h-3.5 w-3.5" />,
                  insignia: problemasPorFichero('index.html'),
                  nombreAccesible: `index.html, ${problemasPorFichero('index.html')} problemas`,
                },
                {
                  id: 'estilos.css' as Fichero,
                  etiqueta: 'estilos.css',
                  icono: <Braces aria-hidden="true" className="h-3.5 w-3.5" />,
                  insignia: problemasPorFichero('estilos.css'),
                  nombreAccesible: `estilos.css, ${problemasPorFichero('estilos.css')} problemas`,
                },
              ]}
              activa={ficheroActivo}
              alCambiar={setFicheroActivo}
              idPestana={idPestanaFichero}
              idPanel={idPanelFichero}
              className="border-b bg-muted/20"
            />

            <div
              id={idPanelFichero(ficheroActivo)}
              role="tabpanel"
              aria-labelledby={idPestanaFichero(ficheroActivo)}
              className="min-w-0 p-3"
            >
              <EditorCodigo
                valor={fuenteActiva}
                alCambiar={ficheroActivo === 'index.html' ? setHtml : setCss}
                etiqueta={`Código de ${ficheroActivo}, editable`}
                lenguaje={ficheroActivo === 'index.html' ? 'html' : 'css'}
                lineasDestacadas={lineasConError}
                numerarLineas
                className="h-72 sm:h-80 lg:h-92"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/20 px-3 py-1.5">
              <p aria-hidden="true" className="min-w-0 flex-1 truncate rounded border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                vista-previa://formulario-suscripcion
              </p>
              <label className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={marcarProblemas}
                  onChange={(evento) => setMarcarProblemas(evento.target.checked)}
                  className="size-4 accent-primary"
                />
                Subrayar problemas
              </label>
              <label className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={verTabulacion}
                  onChange={(evento) => setVerTabulacion(evento.target.checked)}
                  className="size-4 accent-primary"
                />
                Orden de tabulación
              </label>
            </div>

            <div className="p-3">
              <iframe
                className="block h-72 w-full max-w-full rounded-lg border bg-card sm:h-80 lg:h-92"
                sandbox=""
                srcDoc={documento}
                title="Vista previa del formulario"
              />
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                La vista previa va en un iframe con sandbox vacío y sin permiso de red: aunque
                escribas un <code>&lt;script&gt;</code>, aquí no se ejecuta nada.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t">
          <Pestanas
            etiqueta="Paneles de análisis"
            pestanas={[
              {
                id: 'problemas' as Panel,
                etiqueta: `PROBLEMAS (${diagnosticos.length})`,
                icono: <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" />,
              },
              {
                id: 'recorrido' as Panel,
                etiqueta: `TECLADO (${analisis.recorrido.length})`,
                icono: <Keyboard aria-hidden="true" className="h-3.5 w-3.5" />,
              },
              {
                id: 'correccion' as Panel,
                etiqueta: 'CORRECCIÓN',
                icono: <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />,
              },
            ]}
            activa={panelActivo}
            alCambiar={setPanelActivo}
            idPestana={idPestanaPanel}
            idPanel={idPanelInferior}
            className="bg-muted/20"
          />

          <div
            id={idPanelInferior(panelActivo)}
            role="tabpanel"
            aria-labelledby={idPestanaPanel(panelActivo)}
            tabIndex={0}
            className="max-h-72 min-h-48 overflow-auto p-3 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring lg:h-60"
          >
            {panelActivo === 'problemas' &&
              (diagnosticos.length === 0 ? (
                <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <CircleCheck aria-hidden="true" className="h-4 w-4" />
                  Sin problemas. El teclado llega a todo lo que se puede pulsar.
                </p>
              ) : (
                <ul className="space-y-1">
                  {diagnosticos.map((problema) => (
                    <li
                      key={problema.clave}
                      className="rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted/40"
                    >
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
                        {problema.nivel === 'error' ? (
                          <CircleX aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-destructive" />
                        ) : (
                          <TriangleAlert
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: 'var(--sintaxis-atributo)' }}
                          />
                        )}
                        <span className="sr-only">
                          {problema.nivel === 'error' ? 'Error' : 'Aviso'}:
                        </span>
                        <span
                          className={cn(
                            problema.nivel === 'error' ? 'text-destructive' : 'text-foreground'
                          )}
                          style={
                            problema.nivel === 'aviso'
                              ? { color: 'var(--sintaxis-atributo)' }
                              : undefined
                          }
                        >
                          {problema.regla}
                        </span>
                        <span className="text-muted-foreground">
                          {`${problema.fichero}:${problema.linea}:${problema.columna}`}
                        </span>
                      </p>
                      <p className="mt-0.5 pl-5.5 text-xs">{problema.mensaje}</p>
                      {problema.pista && (
                        <p className="pl-5.5 text-xs text-muted-foreground">
                          {problema.pista}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ))}

            {panelActivo === 'recorrido' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 font-mono text-[11px] text-muted-foreground">
                    Paradas del tabulador, en orden
                  </p>
                  <ol className="space-y-1">
                    {analisis.recorrido.map((paso, indice) => (
                      <li key={`${paso.firma}-${indice}`} className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {indice + 1}
                        </span>
                        <span className="truncate">{paso.texto}</span>
                        <span className="truncate text-muted-foreground">{paso.firma}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[11px] text-muted-foreground">
                    Se puede pulsar, pero no se puede alcanzar
                  </p>
                  {analisis.trampas.length === 0 ? (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Nada. Ratón y teclado ven la misma página.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {analisis.trampas.map((trampa, indice) => (
                        <li
                          key={`${trampa.firma}-${indice}`}
                          className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 font-mono text-[11px]"
                        >
                          <CircleX aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-destructive" />
                          <span className="truncate">{trampa.texto}</span>
                          <span className="truncate text-muted-foreground">{trampa.firma}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {panelActivo === 'correccion' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Tres cambios: el <code>&lt;div&gt;</code> pasa a <code>&lt;button&gt;</code> —entra
                  solo en el recorrido y responde a Enter y Espacio—, el campo recibe un{' '}
                  <code>&lt;label&gt;</code> de verdad, y el CSS vuelve a dibujar el foco que un
                  botón nativo necesita.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 font-mono text-[11px] text-muted-foreground">index.html</p>
                    <CodigoResaltado
                      codigo={HTML_CORREGIDO}
                      lenguaje="html"
                      etiqueta="Corrección propuesta para index.html"
                      numerarLineas
                      lineasDestacadas={[1, 2, 4]}
                      alturaMaxima="9rem"
                    />
                  </div>
                  <div>
                    <p className="mb-1 font-mono text-[11px] text-muted-foreground">estilos.css</p>
                    <CodigoResaltado
                      codigo={CSS_CORREGIDO}
                      lenguaje="css"
                      etiqueta="Corrección propuesta para estilos.css"
                      numerarLineas
                      lineasDestacadas={[6, 7, 8, 9]}
                      alturaMaxima="9rem"
                    />
                  </div>
                </div>
                {pendientes.length === 0 && (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Ya está aplicada (o has cambiado esas líneas a mano).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          <span>{ficheroActivo === 'index.html' ? 'HTML' : 'CSS'}</span>
          <span>Espacios: 2</span>
          <span>{fuenteActiva.split('\n').length} líneas</span>
          <span className={errores > 0 ? 'text-destructive' : undefined}>
            {errores} {errores === 1 ? 'error' : 'errores'}
          </span>
          <span style={avisos > 0 ? { color: 'var(--sintaxis-atributo)' } : undefined}>
            {avisos} {avisos === 1 ? 'aviso' : 'avisos'}
          </span>
          <span>{analisis.recorrido.length} paradas de teclado</span>
          <span className="ml-auto">sandbox vacío · sin red · sin scripts</span>
        </div>
      </section>
    </>
  )
}
