import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

export interface PanelAntesDespues {
  etiqueta: string
  titulo: string
  contenido: string
}

export interface PropiedadesAntesDespuesDeslizante {
  antes: PanelAntesDespues
  despues: PanelAntesDespues
  valorInicial?: number
}

export function AntesDespuesDeslizante({
  antes,
  despues,
  valorInicial = 50,
}: PropiedadesAntesDespuesDeslizante) {
  const [porcentaje, setPorcentaje] = useState(Math.min(100, Math.max(0, valorInicial)))
  const [arrastrando, setArrastrando] = useState(false)
  const contenedorRef = useRef<HTMLElement>(null)

  function actualizar(evento: PointerEvent<HTMLElement>) {
    if (!arrastrando && evento.type === 'pointermove') return
    const limites = contenedorRef.current?.getBoundingClientRect()
    if (!limites || limites.width === 0) return
    const siguiente = ((evento.clientX - limites.left) / limites.width) * 100
    setPorcentaje(Math.min(100, Math.max(0, siguiente)))
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return
    evento.preventDefault()
    setPorcentaje((actual) =>
      Math.min(100, Math.max(0, actual + (evento.key === 'ArrowRight' ? 5 : -5))),
    )
  }

  return (
    <section
      ref={contenedorRef}
      aria-label="Comparación antes y después"
      onPointerMove={actualizar}
      onPointerUp={(evento) => {
        setArrastrando(false)
        evento.currentTarget.releasePointerCapture?.(evento.pointerId)
      }}
      onPointerCancel={() => setArrastrando(false)}
      className={`relative min-h-64 touch-none overflow-hidden rounded-xl border shadow-sm ${arrastrando ? 'select-none' : ''}`}
    >
      <article className="absolute inset-0 flex flex-col justify-center bg-green-50 p-6 pl-[55%] dark:bg-green-950/40">
        <p className="text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400">
          {despues.etiqueta}
        </p>
        <h3 className="mt-2 font-semibold text-balance">{despues.titulo}</h3>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{despues.contenido}</p>
      </article>
      <article
        className="absolute inset-0 flex flex-col justify-center overflow-hidden bg-red-50 p-6 dark:bg-red-950/40"
        style={{ clipPath: `inset(0 ${100 - porcentaje}% 0 0)` }}
      >
        <div className="w-[calc(200%_-_3rem)] max-w-sm">
          <p className="text-xs font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
            {antes.etiqueta}
          </p>
          <h3 className="mt-2 font-semibold text-balance">{antes.titulo}</h3>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{antes.contenido}</p>
        </div>
      </article>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground"
        style={{ left: `${porcentaje}%` }}
      />
      <button
        type="button"
        role="slider"
        aria-label="Posición del divisor"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(porcentaje)}
        onKeyDown={manejarTeclado}
        onPointerDown={(evento) => {
          setArrastrando(true)
          contenedorRef.current?.setPointerCapture?.(evento.pointerId)
          actualizar(evento)
        }}
        className="absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        style={{ left: `${porcentaje}%` }}
      >
        <ChevronsLeftRight aria-hidden="true" className="size-5" />
      </button>
    </section>
  )
}
