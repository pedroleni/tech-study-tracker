import { Fragment, useId, useMemo, useState, type ReactNode } from 'react'

import { CLASES_TOKEN, CodigoResaltado, tokenizarLineas } from '@/components/codigo'
import { cn } from '@/lib/utils'
import '@/components/codigo/sintaxis.css'

/** Lo que el navegador hace alcanzable con el tabulador sin que nadie añada nada. */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * El mismo formulario que el laboratorio del tabulador, para que las variantes
 * se puedan comparar entre sí. Aquí no se edita: es una página impresa sobre la
 * que se escribe al margen.
 */
const EJEMPLO = `<style>
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

function Cod({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border bg-background px-1 py-px font-mono text-[0.85em]">
      {children}
    </code>
  )
}

type Anotacion = {
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
const ANOTACIONES: Anotacion[] = [
  {
    id: 'pintura',
    ancla: '.boton {',
    selector: '.boton',
    rotulo: 'Apunte',
    titulo: 'Cinco declaraciones de pintura',
    texto: (
      <>
        Fondo, color, esquinas, cursor. Todo esto cuenta cómo se <em>ve</em> el elemento y
        ninguna línea dice que se pueda pulsar. Ni siquiera <Cod>cursor: pointer</Cod>, que
        solo cambia el dibujo del ratón: el aspecto y el comportamiento viajan por caminos
        separados, y el CSS no cruza al otro.
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
        Un <Cod>&lt;a&gt;</Cod> con <Cod>href</Cod> es la primera y la segunda parada del
        recorrido, sin pedir permiso. Quítale el <Cod>href</Cod> y seguirá viéndose
        exactamente igual, pero desaparecerá del recorrido: es el error de más abajo,
        cometido en otra etiqueta.
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
        <Cod>placeholder</Cod>, que desaparece justo cuando empiezas a escribir. Un{' '}
        <Cod>&lt;label for&gt;</Cod> no se borra nunca, y además amplía la zona pulsable.
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
        Tiene el aspecto, tiene el cursor y tiene el <Cod>onclick</Cod>. Pero es un{' '}
        <Cod>&lt;div&gt;</Cod>: el navegador no lo mete en el recorrido del tabulador, no
        responde a Enter ni a Espacio, y un lector de pantalla lo anuncia como un trozo de
        texto cualquiera. Quien no use ratón no puede enviar este formulario.
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
        Dos cosas que se pulsan en el mismo formulario y solo una funciona sin ratón. Esta
        trae incluidos el foco, Enter, Espacio y el anuncio «Cancelar, botón», y no ha hecho
        falta escribir ni un atributo. La versión correcta casi siempre es la más corta.
      </>
    ),
  },
]

/** Número de línea (empezando en 1) donde aparece el ancla, o 0 si no está. */
function localizarLinea(codigo: string, ancla: string) {
  return codigo.split('\n').findIndex((linea) => linea.includes(ancla)) + 1
}

/** Describe el objetivo de una nota como lo escribiría alguien: `<div class="boton">`. */
function describirObjetivo(elementos: Element[]) {
  const elemento = elementos[0]
  if (!elemento) return 'sin coincidencias'

  const etiqueta = elemento.tagName.toLowerCase()
  const clase = elemento.getAttribute('class')?.split(/\s+/)[0]
  const tipo = elemento.getAttribute('type')
  const atributo = clase ? ` class="${clase}"` : tipo ? ` type="${tipo}"` : ''
  const repeticion = elementos.length > 1 ? ` ×${elementos.length}` : ''

  return `<${etiqueta}${atributo}>${repeticion}`
}

type Analisis = {
  /** Descripción del elemento al que apunta cada nota, por id de nota. */
  objetivos: Record<string, string>
  paradas: number
  trampas: string[]
}

/**
 * Todo el análisis sale de DOMParser: un documento inerte, sin ejecución de
 * nada. Es la misma lectura que hace el navegador, hecha aparte.
 */
function analizar(html: string, anotaciones: Anotacion[]): Analisis {
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
function capaAnclas(anotaciones: Anotacion[], activa: Anotacion | null, todas: boolean) {
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

function Marca({ numero, activa, grande }: { numero: number; activa: boolean; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border font-sans font-semibold tabular-nums transition-colors',
        grande ? 'size-6 text-xs' : 'size-[1.125rem] text-[10px]',
        activa
          ? 'border-transparent bg-foreground text-background'
          : 'border-border bg-muted text-foreground'
      )}
    >
      {numero}
    </span>
  )
}

export function LaboratorioV2Anotado() {
  const idCodigo = useId()
  const idPagina = useId()

  const [senalada, setSenalada] = useState<string | null>(null)
  const [anclada, setAnclada] = useState<string | null>(null)
  const [mostrarTodas, setMostrarTodas] = useState(false)

  const lineas = useMemo(() => tokenizarLineas(EJEMPLO, 'html'), [])
  const analisis = useMemo(() => analizar(EJEMPLO, ANOTACIONES), [])

  const notasPorLinea = useMemo(() => {
    const mapa = new Map<number, { nota: Anotacion; numero: number }>()
    ANOTACIONES.forEach((nota, indice) => {
      const linea = localizarLinea(EJEMPLO, nota.ancla)
      if (linea > 0) mapa.set(linea, { nota, numero: indice + 1 })
    })
    return mapa
  }, [])

  // El ratón manda mientras esté encima; al salir, vuelve la nota anclada.
  const idActivo = senalada ?? anclada
  const activa = ANOTACIONES.find((nota) => nota.id === idActivo) ?? null
  const lineaActiva = activa ? localizarLinea(EJEMPLO, activa.ancla) : 0

  const documento = useMemo(
    () => capaAnclas(ANOTACIONES, activa, mostrarTodas) + EJEMPLO,
    [activa, mostrarTodas]
  )

  const señalar = (id: string) => () => setSenalada(id)
  const soltar = (id: string) => (evento: { currentTarget: HTMLElement }) => {
    // Si el foco sigue dentro de la tarjeta, el ratón puede irse tranquilo.
    if (evento.currentTarget.contains(document.activeElement)) return
    setSenalada((actual) => (actual === id ? null : actual))
  }

  return (
    <>
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Lectura anotada
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">
          Un formulario, comentado al margen
        </h1>
        <p className="mt-3 text-muted-foreground">
          Este formulario se ve bien, se envía con un clic y nadie ha protestado nunca.
          Léelo como se lee un texto anotado: cada nota está pegada a la línea que comenta.
          Al pasar por una nota —con el ratón o con el tabulador— se enciende su línea{' '}
          <span className="text-foreground">y</span> su elemento en la página, a la vez.
        </p>
      </header>

      <div className="mt-8 grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby={idCodigo} className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={idCodigo} className="text-sm font-semibold">
              El código, comentado
            </h2>
            <p className="text-xs text-muted-foreground">{ANOTACIONES.length} notas al margen</p>
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
              <span className="font-mono text-xs text-muted-foreground">suscripcion.html</span>
              <span className="text-xs text-muted-foreground">solo lectura</span>
            </div>

            <div className="p-3 font-mono text-xs leading-relaxed">
              {lineas.map((linea) => {
                const marcada = notasPorLinea.get(linea.numero)

                return (
                  <Fragment key={linea.numero}>
                    <div
                      onMouseEnter={marcada ? señalar(marcada.nota.id) : undefined}
                      onMouseLeave={marcada ? soltar(marcada.nota.id) : undefined}
                      className={cn(
                        'flex min-h-[1.625em] gap-3 rounded-sm',
                        lineaActiva === linea.numero && 'sintaxis-linea-destacada'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex w-[1.125rem] shrink-0 justify-end select-none"
                      >
                        {marcada && (
                          <Marca
                            numero={marcada.numero}
                            activa={activa?.id === marcada.nota.id}
                          />
                        )}
                      </span>

                      <code className="min-w-0 flex-1 break-words whitespace-pre-wrap">
                        {linea.tokens.map((token, indice) => (
                          <span key={indice} className={CLASES_TOKEN[token.tipo]}>
                            {token.texto}
                          </span>
                        ))}
                      </code>
                    </div>

                    {marcada && (
                      <div
                        onMouseEnter={señalar(marcada.nota.id)}
                        onMouseLeave={soltar(marcada.nota.id)}
                        onFocus={señalar(marcada.nota.id)}
                        onBlur={(evento) => {
                          if (evento.currentTarget.contains(evento.relatedTarget)) return
                          setSenalada((actual) =>
                            actual === marcada.nota.id ? null : actual
                          )
                        }}
                        className={cn(
                          'my-3 ml-[1.875rem] rounded-lg border p-3 font-sans transition-colors',
                          activa?.id === marcada.nota.id
                            ? 'border-foreground/30 bg-muted/70'
                            : 'bg-muted/25'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Marca
                            numero={marcada.numero}
                            activa={activa?.id === marcada.nota.id}
                            grande
                          />

                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
                              <span
                                className={cn(
                                  marcada.nota.problema
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {marcada.nota.rotulo}
                              </span>
                              <span aria-hidden="true" className="text-muted-foreground/50">
                                ·
                              </span>
                              <span className="font-normal tracking-normal text-muted-foreground normal-case">
                                línea {linea.numero}
                              </span>
                            </p>

                            <h3 className="mt-1 text-sm font-semibold">{marcada.nota.titulo}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                              {marcada.nota.texto}
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                              Señala a{' '}
                              <code className="font-mono">
                                {analisis.objetivos[marcada.nota.id]}
                              </code>
                            </p>
                          </div>

                          <button
                            type="button"
                            aria-pressed={anclada === marcada.nota.id}
                            aria-label={`Fijar en la página la nota ${marcada.numero}: ${marcada.nota.titulo}`}
                            onClick={() =>
                              setAnclada((actual) =>
                                actual === marcada.nota.id ? null : marcada.nota.id
                              )
                            }
                            className={cn(
                              'min-h-11 shrink-0 touch-manipulation rounded-full border px-3 py-2 text-xs whitespace-nowrap transition-colors',
                              anclada === marcada.nota.id
                                ? 'border-transparent bg-primary text-primary-foreground'
                                : 'hover:bg-background'
                            )}
                          >
                            En la página
                          </button>
                        </div>

                        {marcada.nota.arreglo && (
                          <div className="mt-3">
                            <p className="mb-1.5 text-xs font-medium">
                              {marcada.nota.arreglo.titulo}
                            </p>
                            <CodigoResaltado
                              codigo={marcada.nota.arreglo.codigo}
                              lenguaje="html"
                              etiqueta={`${marcada.nota.arreglo.titulo}, nota ${marcada.numero}`}
                              className="bg-background"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby={idPagina}
          className="min-w-0 lg:sticky lg:top-6 lg:self-start"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id={idPagina} className="text-sm font-semibold">
              La página
            </h2>
            <label className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4"
                checked={mostrarTodas}
                onChange={(evento) => setMostrarTodas(evento.target.checked)}
              />
              Ver las cinco anclas a la vez
            </label>
          </div>

          <iframe
            className="mt-2 block h-72 w-full max-w-full rounded-xl border bg-card sm:h-80 lg:h-[20rem]"
            sandbox=""
            srcDoc={documento}
            title="Vista previa del formulario de suscripción"
          />

          <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground">
            {activa ? (
              <>
                Señalando la nota {ANOTACIONES.indexOf(activa) + 1}:{' '}
                <span className="text-foreground">{activa.titulo}</span>.
              </>
            ) : (
              'Pasa el ratón por una nota, o tabula hasta ella, y su elemento aparece rodeado aquí mismo.'
            )}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Paradas del tabulador</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{analisis.paradas}</dd>
            </div>
            <div
              className={cn(
                'rounded-xl border p-3',
                analisis.trampas.length > 0 && 'border-destructive/40 bg-destructive/10'
              )}
            >
              <dt className="text-xs text-muted-foreground">Parecen pulsables y quedan fuera</dt>
              <dd
                className={cn(
                  'mt-1 text-2xl font-semibold tabular-nums',
                  analisis.trampas.length > 0 && 'text-destructive'
                )}
              >
                {analisis.trampas.length}
              </dd>
            </div>
          </dl>

          {analisis.trampas.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              La que se queda fuera dice «{analisis.trampas.join('», «')}».
            </p>
          )}

          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            La vista previa se muestra en un iframe sin permiso para ejecutar scripts, y las
            cuentas de arriba salen de leer el HTML con DOMParser, que no ejecuta nada.
          </p>
        </section>
      </div>
    </>
  )
}
