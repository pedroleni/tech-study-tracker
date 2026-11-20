/**
 * Lo que el navegador mete en el recorrido del tabulador por sí solo, sin que
 * nadie tenga que añadir nada.
 */
export const ENFOCABLES_V3 =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * El CSS es el mismo, byte a byte, para las dos versiones: ahí está media
 * lección. `border: 0` y `font: inherit` en `.boton` son justo lo que hace que
 * un <button> de verdad salga indistinguible del <div> disfrazado.
 */
export const HOJA_DE_ESTILOS_V3 = `<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; color: #0f172a; background: #ffffff; }
  nav { display: flex; gap: 14px; margin-bottom: 20px; }
  nav a { color: #1d4ed8; }
  h1 { font-size: 20px; margin: 0 0 14px; }
  input { font: inherit; width: 230px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
  .acciones { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .boton { background: #2563eb; color: #ffffff; padding: 8px 16px; border: 0; border-radius: 6px; font: inherit; cursor: pointer; }
  .secundario { background: #ffffff; color: #334155; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit; cursor: pointer; }
</style>`

/*
  Las dos versiones están escritas línea a línea en paralelo —mismo número de
  líneas, mismo orden— y solo se separan en dos de ellas. Es una restricción
  del ejemplo, no una casualidad: permite marcar el diff comparando por índice.
*/
export const CUERPO_ANTES_V3 = `<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete al boletín</h1>

    <!-- El campo del correo -->
    <input type="email" placeholder="tu@correo.com">

    <div class="acciones">
      <!-- El control que envía el formulario -->
      <div class="boton" onclick="enviar()">Enviar</div>
      <button class="secundario">Cancelar</button>
    </div>
  </main>
</body>`

export const CUERPO_DESPUES_V3 = `<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete al boletín</h1>

    <!-- El campo del correo -->
    <input type="email" placeholder="tu@correo.com" aria-label="Tu correo">

    <div class="acciones">
      <!-- El control que envía el formulario -->
      <button class="boton" onclick="enviar()">Enviar</button>
      <button class="secundario">Cancelar</button>
    </div>
  </main>
</body>`

export type IdVersionV3 = 'antes' | 'despues'
export type VersionV3 = { id: IdVersionV3; nombre: string; pie: string; cuerpo: string }

export const VERSIONES_V3: VersionV3[] = [
  {
    id: 'antes',
    nombre: 'Antes',
    pie: 'un <div> disfrazado de botón y un campo sin nombre',
    cuerpo: CUERPO_ANTES_V3,
  },
  {
    id: 'despues',
    nombre: 'Después',
    pie: 'los mismos píxeles, con elementos que el navegador entiende',
    cuerpo: CUERPO_DESPUES_V3,
  },
]

/** Por qué importa cada línea que cambia, en el mismo orden en que cambian. */
const MOTIVOS = [
  'El marcador de posición desaparece al escribir y no es un nombre: quien usa un lector de pantalla oye «cuadro de edición» y nada más. El aria-label pone nombre sin dibujar un solo píxel.',
  'Un <div> no entra en el recorrido del tabulador, no responde a Enter ni a la barra espaciadora y no se anuncia como botón. Un <button> hace las tres cosas de serie.',
]

/**
 * Números de línea en los que las dos versiones se separan. Con textos
 * paralelos basta comparar por índice: no hace falta un diff de verdad.
 */
function lineasQueCambian(primero: string, segundo: string): number[] {
  const lineasPrimero = primero.split('\n')
  const lineasSegundo = segundo.split('\n')
  const total = Math.max(lineasPrimero.length, lineasSegundo.length)
  const cambios: number[] = []
  for (let indice = 0; indice < total; indice += 1) {
    if (lineasPrimero[indice] !== lineasSegundo[indice]) cambios.push(indice + 1)
  }
  return cambios
}

export const LINEAS_CAMBIADAS_V3 = lineasQueCambian(CUERPO_ANTES_V3, CUERPO_DESPUES_V3)
export const CAMBIOS_V3 = LINEAS_CAMBIADAS_V3.map((numero, indice) => ({
  numero,
  antes: CUERPO_ANTES_V3.split('\n')[numero - 1].trim(),
  despues: CUERPO_DESPUES_V3.split('\n')[numero - 1].trim(),
  motivo: MOTIVOS[indice] ?? '',
}))
export const TOTAL_LINEAS_V3 = CUERPO_ANTES_V3.split('\n').length

export type ElementoV3 = { etiqueta: string; texto: string; conNombre: boolean }
export type AnalisisV3 = {
  recorrido: ElementoV3[]
  trampas: ElementoV3[]
  sinNombre: ElementoV3[]
}

/**
 * Nombre accesible, en su versión corta y honesta. El `placeholder` está
 * excluido a propósito: no es un nombre, y esa es justo la trampa del ejemplo.
 */
function tieneNombreAccesible(elemento: Element): boolean {
  const atributos = ['aria-label', 'aria-labelledby', 'title']
  if (atributos.some((atributo) => elemento.getAttribute(atributo)?.trim())) return true
  // El resto de controles toman su nombre del texto que llevan dentro.
  if (elemento.tagName !== 'INPUT') return (elemento.textContent ?? '').trim().length > 0
  if (elemento.closest('label')) return true
  const id = elemento.getAttribute('id')
  if (!id) return false
  return [...elemento.ownerDocument.querySelectorAll('label[for]')].some(
    (etiqueta) => etiqueta.getAttribute('for') === id
  )
}

function describir(elemento: Element): ElementoV3 {
  return {
    etiqueta: elemento.tagName.toLowerCase(),
    texto:
      elemento.textContent?.trim() ||
      elemento.getAttribute('aria-label') ||
      elemento.getAttribute('placeholder') ||
      '(sin texto)',
    conNombre: tieneNombreAccesible(elemento),
  }
}

/** Análisis inerte: DOMParser construye el árbol sin ejecutar absolutamente nada. */
export function analizarV3(cuerpo: string): AnalisisV3 {
  const doc = new DOMParser().parseFromString(cuerpo, 'text/html')
  const recorrido = [...doc.querySelectorAll(ENFOCABLES_V3)].map(describir)
  return {
    recorrido,
    // Parece pulsable, pero el navegador no lo pone en el camino del teclado.
    trampas: [...doc.querySelectorAll('[onclick], [role="button"]')]
      .filter((elemento) => !elemento.matches(ENFOCABLES_V3))
      .map(describir),
    sinNombre: recorrido.filter((elemento) => !elemento.conNombre),
  }
}

export type TonoV3 = 'bien' | 'mal' | 'igual'
export const COLOR_TONO_V3: Record<TonoV3, string> = {
  bien: 'text-foreground',
  mal: 'text-destructive',
  igual: 'text-muted-foreground',
}
export type CeldaV3 = { texto: string; tono: TonoV3 }
export type FilaV3 = { titulo: string; antes: CeldaV3; despues: CeldaV3 }

export function construirFilasV3(antes: AnalisisV3, despues: AnalisisV3): FilaV3[] {
  const celda = (texto: string, correcto: boolean): CeldaV3 => ({
    texto,
    tono: correcto ? 'bien' : 'mal',
  })
  const paradas = (analisis: AnalisisV3): CeldaV3 =>
    celda(
      `${analisis.recorrido.length} ${analisis.recorrido.length === 1 ? 'parada' : 'paradas'}`,
      analisis.trampas.length === 0
    )
  const alcance = (analisis: AnalisisV3): CeldaV3 =>
    celda(
      analisis.trampas.length === 0 ? 'Ninguno' : `${analisis.trampas.length} fuera de alcance`,
      analisis.trampas.length === 0
    )
  const nombres = (analisis: AnalisisV3): CeldaV3 =>
    celda(
      analisis.sinNombre.length === 0 ? 'Todos tienen nombre' : `${analisis.sinNombre.length} sin nombre`,
      analisis.sinNombre.length === 0
    )
  const sinRaton = (analisis: AnalisisV3): CeldaV3 =>
    celda(analisis.trampas.length === 0 ? 'Sí' : 'No', analisis.trampas.length === 0)
  return [
    {
      titulo: 'Cómo se ve en pantalla',
      antes: { texto: 'Idéntico', tono: 'igual' },
      despues: { texto: 'Idéntico', tono: 'igual' },
    },
    { titulo: 'Paradas del tabulador', antes: paradas(antes), despues: paradas(despues) },
    { titulo: 'Controles que el teclado no alcanza', antes: alcance(antes), despues: alcance(despues) },
    { titulo: 'Campos sin nombre para un lector de pantalla', antes: nombres(antes), despues: nombres(despues) },
    { titulo: '¿Se puede enviar el formulario sin ratón?', antes: sinRaton(antes), despues: sinRaton(despues) },
  ]
}
