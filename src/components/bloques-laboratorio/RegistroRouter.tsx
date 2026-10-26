import { Eraser, Route } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { MensajeRouterOperacion } from '@/lib/react-en-vivo/mensajes'
import { cn } from '@/lib/utils'

type Paso = MensajeRouterOperacion['pasos'][number]
type Fase = Paso['fase']

const FASES: Array<{ fase: Fase; etiqueta: string }> = [
  { fase: 'envio', etiqueta: 'Envío' },
  { fase: 'revalidacion', etiqueta: 'Revalidación' },
  { fase: 'carga', etiqueta: 'Carga' },
  { fase: 'redireccion', etiqueta: 'Tras redirigir' },
]

function destinoVisible(operacion: MensajeRouterOperacion) {
  if (operacion.clase === 'atras' || operacion.clase === 'adelante') {
    return operacion.urlFinal ?? operacion.destino
  }
  return operacion.destino
}

function resumenOperacion(operacion: MensajeRouterOperacion) {
  const destino = destinoVisible(operacion)
  switch (operacion.clase) {
    case 'carga-inicial':
      return `Carga inicial ${destino}`
    case 'navegacion':
      return `Navegación → ${destino}`
    case 'envio':
      return `Envío · ${operacion.metodo} ${destino}`
    case 'atras':
      return `Atrás → ${destino}`
    case 'adelante':
      return `Adelante → ${destino}`
    case 'revalidacion':
      return `Revalidación ${destino}`
    case 'fetcher-carga':
      return `Fetcher «${operacion.fetcher ?? ''}» · carga ${destino}`
    case 'fetcher-envio':
      return `Fetcher «${operacion.fetcher ?? ''}» · ${operacion.metodo} ${destino}`
  }
}

function estadoOperacion(operacion: MensajeRouterOperacion) {
  if (operacion.estado === 'cancelada') {
    return `cancelada${operacion.canceladaPor ? ` por #${operacion.canceladaPor}` : ''}`
  }
  return operacion.estado === 'terminada' ? 'terminado' : 'en curso'
}

function clasesEstado(operacion: MensajeRouterOperacion) {
  if (
    operacion.estado === 'cancelada' ||
    operacion.pasos.some((paso) => paso.estado === 'error') ||
    (operacion.errores?.length ?? 0) > 0
  ) {
    return 'text-red-700 dark:text-red-400'
  }
  if (operacion.estado === 'terminada') return 'text-green-700 dark:text-green-400'
  return 'text-amber-700 dark:text-amber-300'
}

function textoPaso(paso: Paso) {
  const duracion = paso.duracion === undefined ? 'en curso' : `${paso.duracion} ms`
  return `${paso.tipo} ${paso.ruta} · +${paso.inicio} ms · ${duracion}${
    paso.estado === 'error' && paso.error ? ` · error: ${paso.error}` : ''
  }${paso.tarde ? ' · terminó después de cancelarse' : ''}`
}

function BarraPaso({ paso, operacion }: { paso: Paso; operacion: MensajeRouterOperacion }) {
  const total = Math.max(
    operacion.duracion ?? 0,
    ...operacion.pasos.map((actual) => actual.inicio + (actual.duracion ?? 0)),
    1,
  )
  const izquierda = Math.min(100, (paso.inicio / total) * 100)
  const ancho = Math.max(2, Math.min(100 - izquierda, ((paso.duracion ?? 1) / total) * 100))
  return (
    <div
      aria-hidden="true"
      data-barra-paso
      className="h-1.5 min-w-0 overflow-hidden rounded-full bg-muted"
    >
      <span
        className={cn(
          'block h-full rounded-full',
          paso.estado === 'error'
            ? 'bg-red-500 dark:bg-red-400'
            : paso.estado === 'en-curso'
              ? 'bg-amber-500 dark:bg-amber-400'
              : 'bg-green-500 dark:bg-green-400',
        )}
        style={{ marginLeft: `${izquierda}%`, width: `${ancho}%` }}
      />
    </div>
  )
}

function anuncioOperacion(operacion: MensajeRouterOperacion) {
  const cantidades = new Map<string, number>()
  for (const paso of operacion.pasos) cantidades.set(paso.tipo, (cantidades.get(paso.tipo) ?? 0) + 1)
  const detalle = [...cantidades]
    .map(([tipo, cantidad]) => `${cantidad} ${tipo}${cantidad === 1 ? '' : 's'}`)
    .join(' y ')
  const etiqueta = {
    'carga-inicial': 'Carga inicial',
    navegacion: 'Navegación',
    envio: 'Envío',
    atras: 'Atrás',
    adelante: 'Adelante',
    revalidacion: 'Revalidación',
    'fetcher-carga': `Fetcher «${operacion.fetcher ?? ''}»`,
    'fetcher-envio': `Fetcher «${operacion.fetcher ?? ''}»`,
  }[operacion.clase]
  const duracion = operacion.duracion ?? 0
  return `${etiqueta} ${operacion.metodo} ${destinoVisible(operacion)} ${
    operacion.estado === 'cancelada' ? 'cancelado' : 'terminado'
  } en ${duracion} ms${detalle ? `: ${detalle}` : ''}`
}

export function RegistroRouter({
  operaciones,
  lleno,
  soloDeclarativo,
  onLimpiar,
}: {
  operaciones: MensajeRouterOperacion[]
  lleno: boolean
  soloDeclarativo: boolean
  onLimpiar: () => void
}) {
  const visibles = operaciones.slice(-100)
  const [anuncio, setAnuncio] = useState('')
  const ultimoAnunciado = useRef<number | null>(null)
  const ultimaVez = useRef(0)
  const temporizador = useRef<number | null>(null)

  useEffect(() => {
    const ultima = [...operaciones]
      .reverse()
      .find((operacion) => operacion.estado === 'terminada' || operacion.estado === 'cancelada')
    if (!ultima || ultima.id === ultimoAnunciado.current) return
    const aplicar = () => {
      ultimoAnunciado.current = ultima.id
      ultimaVez.current = Date.now()
      temporizador.current = null
      setAnuncio(anuncioOperacion(ultima))
    }
    const espera = Math.max(0, 1_000 - (Date.now() - ultimaVez.current))
    if (espera === 0) aplicar()
    else {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current)
      temporizador.current = window.setTimeout(aplicar, espera)
    }
    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current)
        temporizador.current = null
      }
    }
  }, [operaciones])

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Route aria-hidden="true" className="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <h4 className="text-sm font-semibold">Registro del router</h4>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onLimpiar}>
          <Eraser aria-hidden="true" />
          Limpiar
        </Button>
      </div>

      <div
        role="region"
        aria-label="Registro del router"
        aria-live="off"
        className="max-h-80 min-w-0 overflow-auto rounded-lg border bg-muted/40 p-2 font-mono text-xs"
      >
        {lleno && (
          <p className="mb-2 rounded-md bg-red-50 p-2 font-sans text-red-700 dark:bg-red-950/30 dark:text-red-400">
            El registro se ha detenido: más de 200 operaciones en esta carga. ¿Hay un bucle de navegaciones?
          </p>
        )}
        {soloDeclarativo && visibles.length === 0 && (
          <p className="mb-2 rounded-md bg-amber-50 p-2 font-sans text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Este router no carga datos: el registro necesita un router de datos (createMemoryRouter o createBrowserRouter con RouterProvider).
          </p>
        )}
        {visibles.length === 0 ? (
          <p className="px-1 py-0.5 text-muted-foreground">Todavía no hay actividad del router.</p>
        ) : (
          <ol aria-label="Operaciones del router" className="space-y-3">
            {visibles.map((operacion) => {
              // En una carga los loader se ejecutan; solo en una revalidación
              // «se vuelven a ejecutar».
              const loadersDe = (fases: Fase[]) => [
                ...new Set(
                  operacion.pasos
                    .filter((paso) => paso.tipo === 'loader' && fases.includes(paso.fase))
                    .map((paso) => paso.ruta),
                ),
              ]
              const ejecutados = loadersDe(['carga', 'redireccion'])
              const revalidados = loadersDe(['revalidacion'])
              const acaboEn =
                operacion.urlFinal &&
                operacion.urlFinal !== operacion.destino &&
                !['atras', 'adelante'].includes(operacion.clase)
                  ? ` · acabó en ${operacion.urlFinal}`
                  : ''
              return (
                <li key={operacion.id} className="min-w-0 space-y-2 rounded-md bg-background p-2">
                  <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 break-words">
                    <p className="min-w-0 break-words">
                      <span className="font-semibold">#{operacion.id}</span>{' '}
                      {resumenOperacion(operacion)}{acaboEn} ·{' '}
                      {operacion.duracion === undefined ? 'en curso' : `${operacion.duracion} ms`}
                    </p>
                    <span className={cn('font-semibold', clasesEstado(operacion))}>
                      {estadoOperacion(operacion)}
                    </span>
                  </div>

                  {FASES.map(({ fase, etiqueta }) => {
                    const pasos = operacion.pasos.filter((paso) => paso.fase === fase)
                    if (pasos.length === 0) return null
                    return (
                      <div key={fase} className="grid min-w-0 gap-1 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                        <p className="font-semibold text-muted-foreground">{etiqueta}</p>
                        <ul className="min-w-0 space-y-1.5">
                          {pasos.map((paso, indice) => (
                            <li key={`${paso.tipo}-${paso.ruta}-${paso.inicio}-${indice}`} className="grid min-w-0 gap-1">
                              <span className="break-words">{textoPaso(paso)}</span>
                              <BarraPaso paso={paso} operacion={operacion} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}

                  <div className="space-y-1 font-sans text-muted-foreground">
                    {ejecutados.length > 0 && <p>Se ejecutó: {ejecutados.join(', ')}.</p>}
                    {revalidados.length > 0 && <p>Se volvió a ejecutar: {revalidados.join(', ')}.</p>}
                    {operacion.sinEjecutar && operacion.sinEjecutar.length > 0 && (
                      <p>No se volvió a ejecutar: {operacion.sinEjecutar.join(', ')}.</p>
                    )}
                    {operacion.errores?.map((error, indice) => (
                      <p key={`${error.ruta}-${indice}`} className="text-red-700 dark:text-red-400">
                        Error en pantalla (ErrorBoundary de {error.ruta}): {error.texto}
                      </p>
                    ))}
                    {operacion.truncado && <p>Lista truncada: más de 40 pasos</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
      <p role="status" className="sr-only">{anuncio}</p>
    </div>
  )
}
