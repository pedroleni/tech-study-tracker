import { useMemo, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'

/**
 * Lo que el navegador mete en el recorrido del tabulador por sí solo, sin que
 * nadie tenga que añadir nada.
 */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * El CSS es el mismo, byte a byte, para las dos versiones: ahí está media
 * lección. `border: 0` y `font: inherit` en `.boton` son justo lo que hace que
 * un <button> de verdad salga indistinguible del <div> disfrazado.
 */
const HOJA_DE_ESTILOS = `<style>
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
const CUERPO_ANTES = `<body>
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

const CUERPO_DESPUES = `<body>
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

type IdVersion = 'antes' | 'despues'

type Version = {
  id: IdVersion
  nombre: string
  pie: string
  cuerpo: string
}

const VERSIONES: Version[] = [
  {
    id: 'antes',
    nombre: 'Antes',
    pie: 'un <div> disfrazado de botón y un campo sin nombre',
    cuerpo: CUERPO_ANTES,
  },
  {
    id: 'despues',
    nombre: 'Después',
    pie: 'los mismos píxeles, con elementos que el navegador entiende',
    cuerpo: CUERPO_DESPUES,
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

const LINEAS_CAMBIADAS = lineasQueCambian(CUERPO_ANTES, CUERPO_DESPUES)

const CAMBIOS = LINEAS_CAMBIADAS.map((numero, indice) => ({
  numero,
  antes: CUERPO_ANTES.split('\n')[numero - 1].trim(),
  despues: CUERPO_DESPUES.split('\n')[numero - 1].trim(),
  motivo: MOTIVOS[indice] ?? '',
}))

const TOTAL_LINEAS = CUERPO_ANTES.split('\n').length

type Elemento = {
  etiqueta: string
  texto: string
  conNombre: boolean
}

type Analisis = {
  recorrido: Elemento[]
  trampas: Elemento[]
  sinNombre: Elemento[]
}

/**
 * Nombre accesible, en su versión corta y honesta. El `placeholder` está
 * excluido a propósito: no es un nombre, y esa es justo la trampa del ejemplo.
 */
function tieneNombreAccesible(elemento: Element): boolean {
  const atributos = ['aria-label', 'aria-labelledby', 'title']
  if (atributos.some((atributo) => elemento.getAttribute(atributo)?.trim())) return true

  if (elemento.tagName === 'INPUT') {
    if (elemento.closest('label')) return true
    const id = elemento.getAttribute('id')
    if (!id) return false
    return [...elemento.ownerDocument.querySelectorAll('label[for]')].some(
      (etiqueta) => etiqueta.getAttribute('for') === id
    )
  }

  // El resto de controles toman su nombre del texto que llevan dentro.
  return (elemento.textContent ?? '').trim().length > 0
}

/** Análisis inerte: DOMParser construye el árbol sin ejecutar absolutamente nada. */
function analizar(cuerpo: string): Analisis {
  const doc = new DOMParser().parseFromString(cuerpo, 'text/html')

  const describir = (elemento: Element): Elemento => ({
    etiqueta: elemento.tagName.toLowerCase(),
    texto:
      elemento.textContent?.trim() ||
      elemento.getAttribute('aria-label') ||
      elemento.getAttribute('placeholder') ||
      '(sin texto)',
    conNombre: tieneNombreAccesible(elemento),
  })

  const recorrido = [...doc.querySelectorAll(ENFOCABLES)].map(describir)

  return {
    recorrido,
    // Parece pulsable, pero el navegador no lo pone en el camino del teclado.
    trampas: [...doc.querySelectorAll('[onclick], [role="button"]')]
      .filter((elemento) => !elemento.matches(ENFOCABLES))
      .map(describir),
    sinNombre: recorrido.filter((elemento) => !elemento.conNombre),
  }
}

type Tono = 'bien' | 'mal' | 'igual'

type Celda = { texto: string; tono: Tono }

type Fila = { titulo: string; antes: Celda; despues: Celda }

function construirFilas(antes: Analisis, despues: Analisis): Fila[] {
  const celda = (texto: string, correcto: boolean): Celda => ({
    texto,
    tono: correcto ? 'bien' : 'mal',
  })

  const paradas = (analisis: Analisis): Celda =>
    celda(
      `${analisis.recorrido.length} ${analisis.recorrido.length === 1 ? 'parada' : 'paradas'}`,
      analisis.trampas.length === 0
    )

  const alcance = (analisis: Analisis): Celda =>
    celda(
      analisis.trampas.length === 0 ? 'Ninguno' : `${analisis.trampas.length} fuera de alcance`,
      analisis.trampas.length === 0
    )

  const nombres = (analisis: Analisis): Celda =>
    celda(
      analisis.sinNombre.length === 0 ? 'Todos tienen nombre' : `${analisis.sinNombre.length} sin nombre`,
      analisis.sinNombre.length === 0
    )

  const sinRaton = (analisis: Analisis): Celda =>
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

const TRAZO_ICONO: Record<Tono, string> = {
  bien: 'M3 8.5l3.4 3.4L13 5',
  mal: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  igual: 'M3.5 6.5h9M3.5 9.5h9',
}

const COLOR_TONO: Record<Tono, string> = {
  bien: 'text-foreground',
  mal: 'text-destructive',
  igual: 'text-muted-foreground',
}

function Icono({ tono }: { tono: Tono }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRAZO_ICONO[tono]} />
    </svg>
  )
}

/**
 * Una línea del diff. El signo no es solo decoración: distingue quitado de
 * añadido sin depender del color, que es la única forma de que también
 * funcione para quien no distingue rojo y verde.
 */
function LineaDiff({
  signo,
  descripcion,
  codigo,
  etiqueta,
  destructivo,
}: {
  signo: string
  descripcion: string
  codigo: string
  etiqueta: string
  destructivo: boolean
}) {
  return (
    <div className="flex min-w-0 items-stretch gap-2">
      <span
        className={cn(
          'flex w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold',
          destructivo
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-primary/30 bg-primary/10 text-foreground'
        )}
      >
        <span aria-hidden="true">{signo}</span>
        <span className="sr-only">{descripcion}</span>
      </span>
      <CodigoResaltado
        codigo={codigo}
        lenguaje="html"
        etiqueta={etiqueta}
        className={cn(
          'min-w-0 flex-1',
          destructivo ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'
        )}
      />
    </div>
  )
}

function ListaRecorrido({ analisis, titulo, destructivo }: { analisis: Analisis; titulo: string; destructivo: boolean }) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-xl border p-4',
        destructivo ? 'border-destructive/40 bg-destructive/5' : 'border-primary/40 bg-primary/5'
      )}
    >
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Lo que alcanza el tabulador, en orden.
      </p>

      <ol className="mt-3 space-y-1.5">
        {analisis.recorrido.map((paso, indice) => (
          <li key={`${paso.etiqueta}-${indice}`} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {indice + 1}
            </span>
            <span className="truncate">{paso.texto}</span>
            <span className="shrink-0 opacity-40">&lt;{paso.etiqueta}&gt;</span>
            {!paso.conNombre && (
              <span className="shrink-0 rounded bg-destructive/10 px-1 text-[10px] font-medium text-destructive">
                sin nombre
              </span>
            )}
          </li>
        ))}
      </ol>

      {analisis.trampas.length > 0 ? (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-2">
          <p className="text-xs font-semibold text-destructive">
            El tabulador salta por encima de esto
          </p>
          <ul className="mt-1 space-y-1">
            {analisis.trampas.map((trampa, indice) => (
              <li key={`${trampa.etiqueta}-${indice}`} className="text-xs">
                {trampa.texto} <span className="opacity-40">&lt;{trampa.etiqueta}&gt;</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium">
          <Icono tono="bien" />
          Nada se queda fuera: todo lo pulsable se alcanza con el teclado.
        </p>
      )}
    </section>
  )
}

export function LaboratorioV3Comparativa() {
  const [versionActiva, setVersionActiva] = useState<IdVersion>('antes')

  const esAntes = versionActiva === 'antes'
  const version = esAntes ? VERSIONES[0] : VERSIONES[1]

  const analisis = useMemo(
    () => ({ antes: analizar(CUERPO_ANTES), despues: analizar(CUERPO_DESPUES) }),
    []
  )
  const filas = useMemo(() => construirFilas(analisis.antes, analisis.despues), [analisis])

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Se ven igual. Solo uno funciona.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Dos versiones del mismo formulario de suscripción. Cambian{' '}
        <strong className="font-semibold text-foreground">
          {CAMBIOS.length} líneas de {TOTAL_LINEAS}
        </strong>{' '}
        y el CSS es el mismo byte a byte. Cambia de versión con el interruptor: el código se
        mueve, la imagen no —ni un píxel— y el veredicto de abajo se da la vuelta entero.
      </p>

      <fieldset className="mt-6 w-full min-w-0 max-w-md border-0 p-0">
        <legend className="sr-only">Versión del formulario que quieres ver</legend>
        <div className="relative flex rounded-xl border bg-muted p-1">
          {/* La pastilla se desliza al cambiar: el movimiento está aquí, y no
              en la vista previa, que es exactamente lo que hay que notar. */}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg transition-transform duration-300 ease-out',
              esAntes ? 'bg-destructive/15' : 'bg-primary',
              !esAntes && 'translate-x-full'
            )}
          />
          {VERSIONES.map((opcion) => {
            const activa = opcion.id === versionActiva
            return (
              <label key={opcion.id} className="relative z-10 flex-1">
                <input
                  type="radio"
                  name="laboratorio-v3-version"
                  value={opcion.id}
                  checked={activa}
                  onChange={() => setVersionActiva(opcion.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring sm:px-3',
                    activa
                      ? opcion.id === 'antes'
                        ? 'text-destructive'
                        : 'text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {opcion.nombre}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-4">
        <section aria-labelledby="v3-titulo-codigo" className="min-w-0">
          <h2 id="v3-titulo-codigo" className="mb-2 text-sm font-semibold">
            El código{' '}
            <span className="font-normal text-muted-foreground">— versión «{version.nombre}»</span>
          </h2>
          <CodigoResaltado
            codigo={version.cuerpo}
            lenguaje="html"
            numerarLineas
            lineasDestacadas={LINEAS_CAMBIADAS}
            etiqueta={`Código HTML de la versión ${version.nombre}`}
            alturaMaxima="25rem"
            className="h-72 max-w-full sm:h-88 lg:h-[25rem]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Resaltadas, las líneas {LINEAS_CAMBIADAS.join(' y ')}: las únicas que se mueven.
          </p>
        </section>

        <section aria-labelledby="v3-titulo-vista" className="min-w-0">
          <h2 id="v3-titulo-vista" className="mb-2 text-sm font-semibold">
            El resultado{' '}
            <span className="font-normal text-muted-foreground">— no cambia nunca</span>
          </h2>
          {/* sandbox="" (vacío, sin scripts): el ejemplo se pinta, no se ejecuta. */}
          <iframe
            className="block h-72 w-full max-w-full rounded-lg border bg-card sm:h-88 lg:h-[25rem]"
            sandbox=""
            srcDoc={HOJA_DE_ESTILOS + version.cuerpo}
            title={`Vista previa de la versión ${version.nombre}`}
          />
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            Versión «{version.nombre}» en pantalla. Los mismos píxeles en las dos: por eso este
            fallo llega a producción.
          </p>
        </section>
      </div>

      <section aria-labelledby="v3-titulo-diff" className="mt-8">
        <h2 id="v3-titulo-diff" className="text-sm font-semibold">
          Lo único que cambia
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {CAMBIOS.map((cambio) => (
            <div key={cambio.numero} className="min-w-0 rounded-xl border p-3">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                línea {cambio.numero}
              </p>
              <div className="space-y-2">
                <LineaDiff
                  signo="−"
                  descripcion="Línea quitada"
                  codigo={cambio.antes}
                  etiqueta={`Línea ${cambio.numero} antes`}
                  destructivo
                />
                <LineaDiff
                  signo="+"
                  descripcion="Línea añadida"
                  codigo={cambio.despues}
                  etiqueta={`Línea ${cambio.numero} después`}
                  destructivo={false}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{cambio.motivo}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="v3-titulo-veredicto" className="mt-8">
        <h2 id="v3-titulo-veredicto" className="text-sm font-semibold">
          El veredicto, fila a fila
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Una sola fila dice «idéntico». Todas las demás cambian de bando.
        </p>

        {/*
          role + tabIndex: si la tabla no cabe, la caja se desplaza, y una caja
          que se desplaza tiene que poder recorrerse también con el teclado.
        */}
        <div
          role="region"
          aria-label="Tabla comparativa entre las dos versiones"
          /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- sin tabIndex, axe marca «scrollable-region-focusable» cuando la tabla desborda */
          tabIndex={0}
          className="mt-3 overflow-x-auto rounded-xl border focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <table className="min-w-[32rem] border-collapse text-sm sm:w-full">
            <caption className="sr-only">
              Comparación entre la versión «Antes» y la versión «Después» del mismo formulario
            </caption>
            <thead>
              <tr className="bg-muted/50">
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Lo que se mide
                </th>
                <th
                  scope="col"
                  className={cn(
                    'px-3 py-2 text-left text-xs font-semibold whitespace-nowrap',
                    esAntes && 'bg-destructive/10 text-destructive'
                  )}
                >
                  Antes
                </th>
                <th
                  scope="col"
                  className={cn(
                    'px-3 py-2 text-left text-xs font-semibold whitespace-nowrap',
                    !esAntes && 'bg-primary/10'
                  )}
                >
                  Después
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.titulo} className="border-t">
                  <th scope="row" className="px-3 py-2 text-left text-xs font-normal">
                    {fila.titulo}
                  </th>
                  <td className={cn('px-3 py-2', esAntes && 'bg-destructive/5')}>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 text-xs whitespace-nowrap',
                        COLOR_TONO[fila.antes.tono]
                      )}
                    >
                      <Icono tono={fila.antes.tono} />
                      {fila.antes.texto}
                    </span>
                  </td>
                  <td className={cn('px-3 py-2', !esAntes && 'bg-primary/5')}>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 text-xs whitespace-nowrap',
                        COLOR_TONO[fila.despues.tono]
                      )}
                    >
                      <Icono tono={fila.despues.tono} />
                      {fila.despues.texto}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="v3-titulo-teclado" className="mt-8">
        <h2 id="v3-titulo-teclado" className="text-sm font-semibold">
          Los dos recorridos, uno al lado del otro
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <ListaRecorrido analisis={analisis.antes} titulo="Antes" destructivo />
          <ListaRecorrido analisis={analisis.despues} titulo="Después" destructivo={false} />
        </div>
        <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
          El botón «Enviar» está en la pantalla en las dos versiones. En una de ellas, quien
          navega con el teclado nunca llega a él: puede leer el formulario entero y no puede
          enviarlo.
        </p>
      </section>
    </>
  )
}
