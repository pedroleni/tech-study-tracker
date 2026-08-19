import { useId, useMemo, useState } from 'react'

import { CodigoResaltado, EditorCodigo } from '@/components/codigo'
import { cn } from '@/lib/utils'

/** Lo que el navegador mete en el recorrido del tabulador sin que nadie añada nada. */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/** Elementos que parecen pulsables pero se quedan fuera de ese recorrido. */
const SELECTOR_TRAMPAS = `[onclick]:not(${ENFOCABLES}), [role="button"]:not(${ENFOCABLES})`

/** Puntos de referencia que un lector de pantalla puede listar, y cómo los anuncia. */
const REGIONES: Record<string, string> = {
  header: 'banner',
  nav: 'navegación',
  main: 'principal',
  aside: 'complementaria',
  footer: 'pie de página',
  form: 'formulario',
  section: 'región',
}

const SELECTOR_REGIONES =
  'header, nav, main, aside, footer, form, section[aria-label], section[aria-labelledby]'

const SELECTOR_ENCABEZADOS = 'h1, h2, h3, h4, h5, h6'

type IdCapa = 'regiones' | 'foco' | 'encabezados' | 'nombres'

type Capa = {
  id: IdCapa
  nombre: string
  /** Color de la línea. Es el mismo dentro del iframe y en la leyenda de fuera. */
  color: string
  /** Fondo de los rótulos: más oscuro, para que el texto blanco pase de 4.5:1. */
  rotulo: string
  /**
   * Canal visual que ocupa la capa. Es la clave de esta variante: dos capas
   * encendidas a la vez no se tapan porque no dibujan sobre lo mismo.
   */
  canal: string
  explicacion: string
}

/*
  El reparto de canales, que es el problema de diseño de esta variante:

    capa           forma                         esquina del rótulo
    ─────────────  ────────────────────────────  ──────────────────────
    regiones       relleno + línea interior      superior derecha
    foco           contorno exterior             superior izquierda
    trampas        contorno exterior discontinuo inferior izquierda
    encabezados    raíl en el borde izquierdo    encima, a la izquierda
    nombres        trama diagonal de fondo       inferior derecha

  Ninguna capa usa la propiedad CSS de otra (unas pintan `outline`, otras
  `box-shadow`, otras `background-image`), y cada rótulo tiene su esquina
  reservada. Por eso se pueden encender las cuatro sin que el resultado sea
  un amasijo. Los conjuntos de elementos tampoco se cruzan: un punto de
  referencia no es un encabezado, y un encabezado no es enfocable.
*/
const CAPAS: readonly Capa[] = [
  {
    id: 'regiones',
    nombre: 'Regiones',
    color: '#8b5cf6',
    rotulo: '#6d28d9',
    canal: 'relleno + esquina superior derecha',
    explicacion: 'Las zonas a las que un lector de pantalla puede saltar directamente.',
  },
  {
    id: 'foco',
    nombre: 'Recorrido del foco',
    color: '#3b82f6',
    rotulo: '#1d4ed8',
    canal: 'contorno exterior + esquina superior izquierda',
    explicacion: 'Por dónde pasa el tabulador, en orden, y qué se queda fuera.',
  },
  {
    id: 'encabezados',
    nombre: 'Encabezados',
    color: '#0d9488',
    rotulo: '#0f766e',
    canal: 'raíl izquierdo + rótulo encima',
    explicacion: 'El índice de la página: los niveles y los huecos entre ellos.',
  },
  {
    id: 'nombres',
    nombre: 'Nombres accesibles',
    color: '#d97706',
    rotulo: '#b45309',
    canal: 'trama diagonal + esquina inferior derecha',
    explicacion: 'Controles que se anuncian mal o no se anuncian de ninguna manera.',
  },
]

const COLOR_TRAMPA = '#dc2626'
const ROTULO_TRAMPA = '#b91c1c'

type IdPreset = 'formulario' | 'pagina'

/* El primer ejemplo es, palabra por palabra, el de LaboratorioFoco: las cinco
   variantes tienen que poder compararse contando la misma historia. */
const HTML_FORMULARIO = `<style>
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

/* El segundo es el mismo formulario dentro de una página entera, para que las
   cuatro capas tengan algo que enseñar a la vez. */
const HTML_PAGINA = `<style>
  body { font-family: system-ui; margin: 0; color: #18181b; }
  header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 12px 20px; background: #f4f4f5;
  }
  nav a { margin-left: 12px; color: #1d4ed8; }
  main { padding: 20px; }
  form { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  aside { margin: 0 20px 20px; padding: 12px 16px; background: #fef3c7; }
  footer { padding: 12px 20px; background: #f4f4f5; font-size: 13px; }
  .campo { width: 200px; padding: 8px 10px; border: 1px solid #d4d4d8; border-radius: 6px; }
  .boton {
    background: #2563eb; color: white; padding: 8px 16px;
    border-radius: 6px; display: inline-block; cursor: pointer;
  }
  .icono { border: 0; background: #e4e4e7; border-radius: 6px; padding: 9px 12px; cursor: pointer; }
</style>

<body>
  <header>
    <strong>Boletín semanal</strong>
    <nav>
      <a href="/">Inicio</a>
      <a href="/archivo">Archivo</a>
    </nav>
  </header>

  <main>
    <h1>Suscríbete</h1>
    <p>Un correo cada viernes. Sin ruido.</p>

    <form>
      <input class="campo" type="email" placeholder="tu@correo.com">

      <!-- Parece un botón. Se comporta como un botón. No es un botón. -->
      <div class="boton" onclick="enviar()">Enviar</div>

      <button class="icono">✕</button>
    </form>

    <h3>Lo que vas a recibir</h3>
    <p>Un resumen, dos enlaces y ninguna promesa.</p>
  </main>

  <aside>
    <p>Ese h3 viene justo detrás de un h1: falta el h2 de en medio.</p>
  </aside>

  <footer>
    <p>© 2026</p>
  </footer>
</body>`

const PRESETS: readonly { id: IdPreset; nombre: string; html: string }[] = [
  { id: 'formulario', nombre: 'Formulario de suscripción', html: HTML_FORMULARIO },
  { id: 'pagina', nombre: 'La página entera', html: HTML_PAGINA },
]

type Gravedad = 'ok' | 'aviso' | 'error'

type Hallazgo = {
  /** Selector `:nth-child` exacto del elemento, para poder señalarlo en la página. */
  ruta: string
  etiqueta: string
  texto: string
  detalle: string
  gravedad: Gravedad
  /** Sangrado del listado; solo lo usan los encabezados. */
  sangria?: number
  /** El HTML del elemento, para enseñarlo resaltado. Solo en las trampas. */
  codigo?: string
}

type Analisis = {
  regiones: Hallazgo[]
  foco: Hallazgo[]
  trampas: Hallazgo[]
  encabezados: Hallazgo[]
  nombres: Hallazgo[]
}

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

/**
 * Aproximación al nombre accesible. Devuelve `null` cuando el elemento se
 * anuncia bien; si no, el motivo y su gravedad.
 */
function revisarNombre(
  elemento: Element,
  documento: Document
): { gravedad: Gravedad; motivo: string } | null {
  const etiqueta = elemento.tagName.toLowerCase()

  if ((elemento.getAttribute('aria-label') ?? '').trim()) return null

  const referencias = (elemento.getAttribute('aria-labelledby') ?? '').trim()
  if (referencias) {
    const resuelve = referencias
      .split(/\s+/)
      .every((id) => (documento.getElementById(id)?.textContent ?? '').trim().length > 0)
    return resuelve
      ? null
      : { gravedad: 'error', motivo: 'aria-labelledby apunta a un id que no existe o está vacío' }
  }

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
    const tipo = (elemento.getAttribute('type') ?? 'text').toLowerCase()
    if (tipo === 'submit' || tipo === 'button' || tipo === 'reset') {
      // Estos sí traen nombre de fábrica («Enviar», «Restablecer»).
      return null
    }
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

function analizar(html: string): Analisis {
  // DOMParser es inerte por diseño: no ejecuta nada de lo que hay dentro.
  const documento = new DOMParser().parseFromString(html, 'text/html')

  const regiones = [...documento.querySelectorAll(SELECTOR_REGIONES)].map<Hallazgo>((elemento) => {
    const etiqueta = elemento.tagName.toLowerCase()
    return {
      ruta: rutaDe(elemento),
      etiqueta,
      texto: textoDe(elemento),
      detalle: REGIONES[etiqueta] ?? 'región',
      gravedad: 'ok',
    }
  })

  const foco = [...documento.querySelectorAll(ENFOCABLES)].map<Hallazgo>((elemento, indice) => ({
    ruta: rutaDe(elemento),
    etiqueta: elemento.tagName.toLowerCase(),
    texto: textoDe(elemento),
    detalle: String(indice + 1),
    gravedad: 'ok',
  }))

  const trampas = [...documento.querySelectorAll(SELECTOR_TRAMPAS)].map<Hallazgo>((elemento) => ({
    ruta: rutaDe(elemento),
    etiqueta: elemento.tagName.toLowerCase(),
    texto: textoDe(elemento),
    detalle: 'el tabulador no llega',
    gravedad: 'error',
    codigo: elemento.outerHTML.replace(/\s+/g, ' ').slice(0, 240),
  }))

  const encabezados: Hallazgo[] = []
  let nivelAnterior = 0
  for (const elemento of documento.querySelectorAll(SELECTOR_ENCABEZADOS)) {
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

  const nombres: Hallazgo[] = []
  for (const elemento of documento.querySelectorAll(
    'img, iframe, input:not([type="hidden"]), select, textarea, button, a[href]'
  )) {
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

  return { regiones, foco, trampas, encabezados, nombres }
}

type OpcionesLente = {
  capas: Set<IdCapa>
  rotulos: boolean
  compacto: boolean
  radiografia: boolean
  seleccion: string | null
}

function color(id: IdCapa, campo: 'color' | 'rotulo'): string {
  return CAPAS.find((capa) => capa.id === id)![campo]
}

/** Propiedades comunes de todos los rótulos. Cambian el fondo y la posición. */
function rotulo(fondo: string, posicion: string): string {
  return `  position: absolute;
${posicion}
  z-index: 6;
  background: ${fondo};
  color: #ffffff;
  font: 700 10px/15px ui-sans-serif, system-ui, sans-serif;
  padding: 0 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;`
}

/**
 * Construye la lente: la hoja de estilos que se superpone a la página.
 * Nunca interpola texto del usuario, solo nombres de etiqueta y números, así
 * que no hay forma de colar nada por aquí.
 */
function construirCssLente(analisis: Analisis, opciones: OpcionesLente): string {
  const { capas, rotulos, compacto, radiografia, seleccion } = opciones
  const bloques: string[] = []

  bloques.push(`/* La lente del escáner. Se inyecta delante del HTML de la página.
   Cada capa pinta con una propiedad distinta y coloca su rótulo en una esquina
   propia: por eso pueden estar todas encendidas sin taparse entre ellas. */`)

  if (radiografia) {
    bloques.push(`/* Modo radiografía: la página renuncia a su color.
   Solo se tocan color, fondo y borde, así que el contorno (outline), el
   relleno de las capas (box-shadow) y la trama (background-image) sobreviven. */
* {
  color: #3f3f46 !important;
  background-color: transparent !important;
  border-color: #d4d4d8 !important;
  text-shadow: none !important;
}
body { background-color: #ffffff !important; }`)
  }

  if (capas.has('regiones')) {
    bloques.push(`/* Capa: regiones. Canal = relleno interior. */
${SELECTOR_REGIONES} {
  position: relative;
  box-shadow: inset 0 0 0 1px ${color('regiones', 'color')},
              inset 0 0 0 9999px ${color('regiones', 'color')}12;
}`)

    if (rotulos) {
      const contenidos = Object.entries(REGIONES)
        .map(([etiqueta, nombre]) =>
          etiqueta === 'section'
            ? `section[aria-label]::before, section[aria-labelledby]::before { content: "${nombre}"; }`
            : `${etiqueta}::before { content: "${nombre}"; }`
        )
        .join('\n')

      const selectoresRotulo = SELECTOR_REGIONES.split(', ')
        .map((selector) => `${selector}::before`)
        .join(',\n')

      bloques.push(`${contenidos}

${selectoresRotulo} {
${rotulo(color('regiones', 'rotulo'), '  top: 0;\n  right: 0;')}
}

/* Una región dentro de otra saca su rótulo fuera de su propia caja, justo
   debajo — así nunca compite con su propio contenido sea cual sea su
   altura (un <nav> de una sola línea no tiene 16px libres dentro para
   empujar el rótulo sin taparse a sí mismo), y tampoco con el rótulo de
   la región que la contiene, que vive arriba, dentro de su caja. */
:is(${SELECTOR_REGIONES}) :is(${SELECTOR_REGIONES})::before {
  top: 100%;
  margin-top: 2px;
}`)
    }
  }

  if (capas.has('foco')) {
    bloques.push(`/* Capa: recorrido del foco. Canal = contorno por fuera. */
body { counter-reset: rx-orden; }

${ENFOCABLES} {
  position: relative;
  counter-increment: rx-orden;
  outline: 2px solid ${color('foco', 'color')};
  outline-offset: 3px;
}

/* Un <input> no admite ::before ni ::after: su número se lee en el panel. */
a[href]::after,
button::after,
select::after,
textarea::after,
[tabindex]:not([tabindex="-1"])::after {
  content: counter(rx-orden);
${rotulo(color('foco', 'rotulo'), '  top: -10px;\n  left: -10px;')}
  min-width: 9px;
  text-align: center;
  border-radius: 999px;
}

/* Parece pulsable y no lo es. */
${SELECTOR_TRAMPAS} {
  position: relative;
  outline: 2px dashed ${COLOR_TRAMPA};
  outline-offset: 3px;
}`)

    if (rotulos) {
      const texto = compacto ? 'sin teclado' : 'el tabulador no llega'
      bloques.push(`${SELECTOR_TRAMPAS.split(', ')
        .map((selector) => `${selector}::after`)
        .join(',\n')} {
  content: "${texto}";
${rotulo(ROTULO_TRAMPA, '  bottom: -9px;\n  left: -2px;')}
}`)
    }
  }

  if (capas.has('encabezados')) {
    bloques.push(`/* Capa: encabezados. Canal = raíl en el borde izquierdo. */
${SELECTOR_ENCABEZADOS} {
  position: relative;
  box-shadow: inset 4px 0 0 0 ${color('encabezados', 'color')};
}`)

    if (rotulos) {
      const contenidos = [1, 2, 3, 4, 5, 6]
        .map((nivel) => `h${nivel}::before { content: "h${nivel}"; }`)
        .join('\n')

      bloques.push(`${contenidos}

/* El rótulo se sube por encima del encabezado, donde suele haber margen. */
${SELECTOR_ENCABEZADOS.split(', ')
  .map((selector) => `${selector}::before`)
  .join(',\n')} {
${rotulo(color('encabezados', 'rotulo'), '  top: 0;\n  left: 0;\n  transform: translateY(-100%);')}
}`)
    }
  }

  if (capas.has('nombres')) {
    const porGravedad = (gravedad: Gravedad) =>
      analisis.nombres.filter((hallazgo) => hallazgo.gravedad === gravedad).map((h) => h.ruta)

    const errores = porGravedad('error')
    const avisos = porGravedad('aviso')

    // El nombre accesible no se puede calcular con un selector, así que esta
    // capa la dibuja el análisis: una ruta exacta por cada elemento señalado.
    const pintar = (rutas: string[], tono: string, fondo: string, texto: string) => {
      if (rutas.length === 0) return
      bloques.push(`${rutas.join(',\n')} {
  position: relative;
  outline: 2px dotted ${tono};
  outline-offset: 2px;
  background-image: repeating-linear-gradient(
    135deg, ${tono}2e 0 5px, transparent 5px 11px
  );
}${
        rotulos
          ? `

${rutas.map((ruta) => `${ruta}::before`).join(',\n')} {
  content: "${texto}";
${rotulo(fondo, '  bottom: 0;\n  right: 0;')}
}`
          : ''
      }`)
    }

    bloques.push('/* Capa: nombres accesibles. Canal = trama diagonal de fondo. */')
    pintar(
      errores,
      COLOR_TRAMPA,
      ROTULO_TRAMPA,
      compacto ? 'sin nombre' : 'sin nombre accesible'
    )
    pintar(
      avisos,
      color('nombres', 'color'),
      color('nombres', 'rotulo'),
      compacto ? 'frágil' : 'nombre frágil'
    )
    if (errores.length === 0 && avisos.length === 0) {
      bloques.push('/* Nada que señalar: todos los controles tienen nombre. */')
    }
  }

  if (seleccion) {
    bloques.push(`/* Elemento señalado desde el panel: se apaga todo lo demás.
   La sombra exterior de 9999px hace de foco de teatro; el elemento sube al
   frente para quedar por encima de ella. */
${seleccion} {
  position: relative;
  z-index: 9999;
  outline: 3px solid #f8fafc;
  outline-offset: 4px;
  box-shadow: 0 0 0 9999px rgba(9, 9, 11, 0.66);
}`)
  }

  return bloques.join('\n\n')
}

/** Líneas con un `onclick` colgado de algo que no es un control. */
function localizarTrampas(html: string): number[] {
  const lineas: number[] = []
  html.split('\n').forEach((linea, indice) => {
    const tieneManejador = /\son(click|mousedown|keydown)\s*=/i.test(linea)
    const esControl = /<\s*(a\s|a>|button|input|select|textarea)/i.test(linea)
    if (tieneManejador && !esControl) lineas.push(indice + 1)
  })
  return lineas
}

export function LaboratorioV4Radiografia() {
  const [preset, setPreset] = useState<IdPreset>('formulario')
  const [html, setHtml] = useState(HTML_FORMULARIO)
  const [capas, setCapas] = useState<Set<IdCapa>>(() => new Set<IdCapa>(['regiones', 'foco']))
  const [rotulos, setRotulos] = useState(true)
  const [radiografia, setRadiografia] = useState(false)
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [codigoAbierto, setCodigoAbierto] = useState(true)
  const [vistaCodigo, setVistaCodigo] = useState<'html' | 'lente'>('html')

  const idPanelCodigo = useId()
  const idCapas = useId()
  const idPagina = useId()
  const idLecturas = useId()

  const analisis = useMemo(() => analizar(html), [html])
  const capasActivas = useMemo(() => CAPAS.filter((capa) => capas.has(capa.id)), [capas])

  // Con tres capas o más los rótulos largos empiezan a estorbar: se abrevian solos.
  const compacto = capasActivas.length >= 3

  const cssLente = useMemo(
    () => construirCssLente(analisis, { capas, rotulos, compacto, radiografia, seleccion }),
    [analisis, capas, rotulos, compacto, radiografia, seleccion]
  )

  const lineasTrampa = useMemo(() => localizarTrampas(html), [html])

  const documento = `<style>\n${cssLente}\n</style>\n${html}`

  const cambiarHtml = (valor: string) => {
    setSeleccion(null)
    setHtml(valor)
  }

  const cambiarPreset = (id: IdPreset) => {
    setPreset(id)
    setSeleccion(null)
    setHtml(PRESETS.find((opcion) => opcion.id === id)!.html)
  }

  const alternarCapa = (id: IdCapa) => {
    setCapas((previas) => {
      const siguientes = new Set(previas)
      if (siguientes.has(id)) siguientes.delete(id)
      else siguientes.add(id)
      return siguientes
    })
  }

  const hallazgosDe = (id: IdCapa): Hallazgo[] => {
    if (id === 'regiones') return analisis.regiones
    if (id === 'foco') return [...analisis.foco, ...analisis.trampas]
    if (id === 'encabezados') return analisis.encabezados
    return analisis.nombres
  }

  const VACIOS: Record<IdCapa, string> = {
    regiones:
      'Ninguna. Quien navegue por regiones no puede saltar a ningún sitio: se recorre la página entera, cada vez.',
    foco: 'Nada alcanzable con el teclado. Quien no usa ratón no puede hacer absolutamente nada aquí.',
    encabezados: 'Sin encabezados no hay índice, y sin índice no hay forma de hojear la página.',
    nombres: 'Todos los controles se anuncian con un nombre propio. Así se hace.',
  }

  const resumen = [
    `${capasActivas.length} ${capasActivas.length === 1 ? 'capa encendida' : 'capas encendidas'}`,
    `${analisis.regiones.length} regiones`,
    `${analisis.foco.length} paradas del teclado`,
    `${analisis.encabezados.length} encabezados`,
    `${analisis.trampas.length + analisis.nombres.filter((h) => h.gravedad === 'error').length} problemas graves`,
  ].join(' · ')

  const trampaPrincipal = analisis.trampas[0]

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Radiografía de una página</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Esta página se ve perfecta y su botón principal es un <code>&lt;div&gt;</code>{' '}
        disfrazado. Enciende las capas del escáner y míralo por dentro: las regiones, el
        recorrido del teclado, el índice de encabezados y lo que no tiene nombre, dibujados
        encima de la página de verdad.
      </p>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        {/* ---------- Panel de capas ---------- */}
        <section aria-labelledby={idCapas} className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <h2 id={idCapas} className="mb-2 text-sm font-semibold">
            Capas del escáner
          </h2>

          <div className="space-y-2 rounded-lg border p-2">
            {CAPAS.map((capa) => {
              const total = hallazgosDe(capa.id).length
              const encendida = capas.has(capa.id)
              return (
                <label
                  key={capa.id}
                  htmlFor={`capa-${capa.id}`}
                  className={cn(
                    'flex min-h-11 cursor-pointer touch-manipulation gap-2 rounded-md border p-2 transition-colors',
                    encendida ? 'bg-muted' : 'border-transparent hover:bg-muted/50'
                  )}
                >
                  <input
                    id={`capa-${capa.id}`}
                    type="checkbox"
                    aria-label={capa.nombre}
                    className="mt-0.5 size-4 shrink-0"
                    checked={encendida}
                    onChange={() => alternarCapa(capa.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      {/* El único color crudo de la interfaz: tiene que ser
                          exactamente el mismo que se pinta sobre la página. */}
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: capa.color }}
                      />
                      <span className="flex-1 text-sm font-medium">{capa.nombre}</span>
                      <span className="shrink-0 rounded bg-muted-foreground/15 px-1.5 text-xs tabular-nums">
                        {total}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {capa.explicacion}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setCapas(new Set(CAPAS.map((capa) => capa.id)))}
              className="min-h-11 flex-1 touch-manipulation rounded-md border px-2 py-2 text-xs transition-colors hover:bg-muted"
            >
              Encender todas
            </button>
            <button
              type="button"
              onClick={() => setCapas(new Set())}
              className="min-h-11 flex-1 touch-manipulation rounded-md border px-2 py-2 text-xs transition-colors hover:bg-muted"
            >
              Apagar todas
            </button>
          </div>

          <div className="mt-3 space-y-2 rounded-lg border p-2">
            <label className="flex min-h-11 cursor-pointer touch-manipulation items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0"
                checked={radiografia}
                onChange={(evento) => setRadiografia(evento.target.checked)}
              />
              <span>
                Modo radiografía
                <span className="block text-xs text-muted-foreground">
                  La página pierde su color y solo queda la estructura. El botón falso, sin
                  su disfraz de CSS, deja de parecer un botón.
                </span>
              </span>
            </label>

            <label className="flex min-h-11 cursor-pointer touch-manipulation items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0"
                checked={rotulos}
                onChange={(evento) => setRotulos(evento.target.checked)}
              />
              <span>
                Rótulos de texto
                <span className="block text-xs text-muted-foreground">
                  Apágalos para quedarte solo con los colores. Los números del teclado se
                  quedan igual.
                </span>
              </span>
            </label>
          </div>

          <details className="mt-3 rounded-lg border px-3 py-2">
            <summary className="flex min-h-11 cursor-pointer touch-manipulation items-center text-sm font-medium">
              ¿Por qué no se estorban entre ellas?
            </summary>
            <p className="mt-2 text-xs text-muted-foreground">
              Cada capa dibuja con una propiedad distinta y tiene una esquina reservada para
              su rótulo, así que nunca compiten por el mismo píxel:
            </p>
            <ul className="mt-2 space-y-1">
              {CAPAS.map((capa) => (
                <li key={capa.id} className="flex gap-2 text-xs">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-2 w-2 shrink-0 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: capa.color }}
                  />
                  <span>
                    <span className="font-medium">{capa.nombre}:</span>{' '}
                    <span className="text-muted-foreground">{capa.canal}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Con tres capas o más los rótulos se abrevian solos, y al señalar un hallazgo se
              apaga todo lo demás.
            </p>
          </details>
        </section>

        {/* ---------- La página, que es la protagonista ---------- */}
        <section aria-labelledby={idPagina} className="min-w-0">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={idPagina} className="text-sm font-semibold">
              La página, por dentro
            </h2>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  aria-pressed={preset === opcion.id}
                  onClick={() => cambiarPreset(opcion.id)}
                  className={cn(
                    'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
                    preset === opcion.id
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {opcion.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-80 overflow-hidden rounded-lg border">
            <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
              {capasActivas.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Sin capas: la página, tal cual la ve quien mira.
                </span>
              ) : (
                capasActivas.map((capa) => (
                  <span
                    key={capa.id}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: capa.color }}
                    />
                    {capa.nombre}
                  </span>
                ))
              )}
              {seleccion && (
                <button
                  type="button"
                  onClick={() => setSeleccion(null)}
                  className="ml-auto min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors hover:bg-muted"
                >
                  Quitar el foco del elemento señalado
                </button>
              )}
            </div>

            {/* sandbox="" : el iframe no ejecuta ni un solo script. */}
            <iframe
              className="block h-80 min-h-80 w-full max-w-full bg-card sm:h-[28rem] lg:h-[32rem] xl:h-[36rem]"
              sandbox=""
              srcDoc={documento}
              title="La página con las capas del escáner superpuestas"
            />
          </div>

          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {resumen}
          </p>
        </section>

        {/* ---------- Lecturas del escáner ---------- */}
        <section
          aria-labelledby={idLecturas}
          className="min-w-0 lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1"
        >
          <h2 id={idLecturas} className="mb-2 text-sm font-semibold">
            Lecturas
          </h2>

          <div className="space-y-3">
            {trampaPrincipal && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                <h3 className="text-sm font-semibold text-destructive">
                  El botón que no es un botón
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Esto es lo que hay en tu HTML:
                </p>
                <CodigoResaltado
                  codigo={trampaPrincipal.codigo ?? ''}
                  lenguaje="html"
                  etiqueta="El elemento que parece un botón"
                  className="mt-1.5"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Cámbialo por un <code>&lt;button&gt;</code> y entra solo en el recorrido del
                  teclado, se activa con Intro y con Espacio, y se anuncia como botón:
                </p>
                <CodigoResaltado
                  codigo={(trampaPrincipal.codigo ?? '')
                    .replace(/^<\s*[a-z0-9]+/i, '<button')
                    .replace(/<\/\s*[a-z0-9]+\s*>$/i, '</button>')}
                  lenguaje="html"
                  etiqueta="El mismo elemento, con la etiqueta correcta"
                  className="mt-1.5"
                />
              </div>
            )}

            {capasActivas.length === 0 && (
              <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                Enciende una capa para que el escáner tenga algo que contar.
              </p>
            )}

            {capasActivas.map((capa) => {
              const hallazgos = hallazgosDe(capa.id)
              return (
                <div key={capa.id} className="rounded-lg border p-2">
                  <h3 className="mb-1.5 flex items-center gap-2 px-1 text-sm font-semibold">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: capa.color }}
                    />
                    {capa.nombre}
                  </h3>

                  {hallazgos.length === 0 ? (
                    <p className="px-1 pb-1 text-xs text-muted-foreground">{VACIOS[capa.id]}</p>
                  ) : (
                    <ul className="max-h-72 space-y-1 overflow-y-auto">
                      {hallazgos.map((hallazgo) => {
                        const señalado = seleccion === hallazgo.ruta
                        return (
                          <li key={`${capa.id}-${hallazgo.ruta}-${hallazgo.detalle}`}>
                            <button
                              type="button"
                              aria-pressed={señalado}
                              onClick={() => setSeleccion(señalado ? null : hallazgo.ruta)}
                              style={{ paddingLeft: `${8 + (hallazgo.sangria ?? 0) * 10}px` }}
                              className={cn(
                                'flex min-h-11 w-full touch-manipulation items-start gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors',
                                señalado
                                  ? 'border-transparent ring-2 ring-ring'
                                  : 'border-transparent hover:bg-muted',
                                hallazgo.gravedad === 'error' && 'bg-destructive/10',
                                hallazgo.gravedad === 'aviso' && 'bg-muted/60'
                              )}
                            >
                              <span
                                className={cn(
                                  'mt-px shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-4 font-bold',
                                  hallazgo.gravedad === 'error' && 'text-destructive'
                                )}
                                style={
                                  hallazgo.gravedad === 'error'
                                    ? undefined
                                    : { backgroundColor: capa.rotulo, color: '#ffffff' }
                                }
                              >
                                {hallazgo.gravedad === 'error' ? '!' : hallazgo.detalle}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate">{hallazgo.texto}</span>
                                {hallazgo.gravedad !== 'ok' && (
                                  <span className="block text-[11px] text-muted-foreground">
                                    {hallazgo.detalle}
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 font-mono text-[11px] opacity-50">
                                &lt;{hallazgo.etiqueta}&gt;
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}

            <p className="text-xs text-muted-foreground">
              Pulsa cualquier hallazgo para señalarlo sobre la página: se apaga todo lo demás
              y solo queda ese elemento iluminado.
            </p>
          </div>
        </section>
      </div>

      {/* ---------- El código, en segundo plano ---------- */}
      <section className="mt-4">
        <button
          type="button"
          aria-expanded={codigoAbierto}
          aria-controls={idPanelCodigo}
          onClick={() => setCodigoAbierto((abierto) => !abierto)}
          className="flex min-h-11 w-full touch-manipulation items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-muted"
        >
          <span>El código</span>
          <span className="text-xs font-normal text-muted-foreground">
            {codigoAbierto ? 'Ocultar y dejarle todo el sitio a la página' : 'Mostrar'}
          </span>
        </button>

        <div id={idPanelCodigo} hidden={!codigoAbierto}>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              aria-pressed={vistaCodigo === 'html'}
              onClick={() => setVistaCodigo('html')}
              className={cn(
                'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
                vistaCodigo === 'html'
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              HTML de la página
            </button>
            <button
              type="button"
              aria-pressed={vistaCodigo === 'lente'}
              onClick={() => setVistaCodigo('lente')}
              className={cn(
                'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
                vistaCodigo === 'lente'
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              CSS de la lente
            </button>
          </div>

          {vistaCodigo === 'html' ? (
            <div className="mt-2">
              <p className="mb-1.5 text-xs text-muted-foreground">
                Edítalo y el escáner vuelve a pasar. Se destacan las líneas que cuelgan un
                manejador de algo que no es un control.
              </p>
              <EditorCodigo
                valor={html}
                alCambiar={cambiarHtml}
                etiqueta="Código HTML de la página"
                lenguaje="html"
                numerarLineas
                lineasDestacadas={lineasTrampa}
                className="h-72 sm:h-80 lg:h-[22rem]"
              />
            </div>
          ) : (
            <div className="mt-2">
              <p className="mb-1.5 text-xs text-muted-foreground">
                Esto es lo que el escáner inyecta ahora mismo delante de tu HTML. Cambia con
                cada capa que enciendes.
              </p>
              <CodigoResaltado
                codigo={cssLente}
                lenguaje="css"
                numerarLineas
                etiqueta="CSS que el escáner superpone a la página"
                alturaMaxima="22rem"
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
