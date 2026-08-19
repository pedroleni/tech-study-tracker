import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface PasoCarruselVertical {
  titulo: string
  descripcion: string
}

export interface PropiedadesCarruselVertical {
  pasos: PasoCarruselVertical[]
  etiqueta?: string
}

export function CarruselVertical({
  pasos,
  etiqueta = 'Pasos deslizables',
}: PropiedadesCarruselVertical) {
  const [activo, setActivo] = useState(0)
  const contenedorRef = useRef<HTMLDivElement>(null)

  if (pasos.length === 0) return null

  function irA(indice: number) {
    const siguiente = Math.min(Math.max(indice, 0), pasos.length - 1)
    setActivo(siguiente)
    contenedorRef.current?.children[siguiente]?.scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    })
  }

  function actualizarActivo() {
    const contenedor = contenedorRef.current
    if (!contenedor || contenedor.clientHeight === 0) return
    setActivo(Math.min(pasos.length - 1, Math.round(contenedor.scrollTop / contenedor.clientHeight)))
  }

  return (
    <section aria-label={etiqueta} className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <div
        ref={contenedorRef}
        onScroll={actualizarActivo}
        className="h-52 snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-xl border bg-card shadow-sm"
      >
        {pasos.map((paso, indice) => (
          <article
            key={`${paso.titulo}-${indice}`}
            className="flex min-h-52 snap-center items-center gap-5 p-6"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white dark:bg-blue-400 dark:text-blue-950">
              {indice + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-balance">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">{paso.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 sm:flex-col">
        <button
          type="button"
          aria-label="Paso anterior"
          disabled={activo === 0}
          onClick={() => irA(activo - 1)}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronUp aria-hidden="true" className="size-5" />
        </button>
        <span aria-live="polite" className="min-w-12 text-center text-sm tabular-nums text-muted-foreground">
          {activo + 1}/{pasos.length}
        </span>
        <button
          type="button"
          aria-label="Paso siguiente"
          disabled={activo === pasos.length - 1}
          onClick={() => irA(activo + 1)}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronDown aria-hidden="true" className="size-5" />
        </button>
      </div>
    </section>
  )
}
