import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export interface TarjetaCarrusel {
  titulo: string
  descripcion: string
  etiqueta?: string
}

export interface PropiedadesCarruselTarjetas {
  items: TarjetaCarrusel[]
  etiqueta?: string
}

export function CarruselTarjetas({
  items,
  etiqueta = 'Carrusel de tarjetas',
}: PropiedadesCarruselTarjetas) {
  const [activo, setActivo] = useState(0)
  const contenedorRef = useRef<HTMLDivElement>(null)

  if (items.length === 0) return null

  function irA(indice: number) {
    const siguiente = Math.min(Math.max(indice, 0), items.length - 1)
    setActivo(siguiente)
    contenedorRef.current?.children[siguiente]?.scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }

  function actualizarActivo() {
    const contenedor = contenedorRef.current
    if (!contenedor || contenedor.clientWidth === 0) return
    setActivo(Math.min(items.length - 1, Math.round(contenedor.scrollLeft / contenedor.clientWidth)))
  }

  return (
    <section aria-label={etiqueta} className="space-y-4">
      <div
        ref={contenedorRef}
        onScroll={actualizarActivo}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2"
      >
        {items.map((item, indice) => (
          <article
            key={`${item.titulo}-${indice}`}
            className="min-w-full snap-center rounded-xl border bg-card p-5 shadow-sm sm:min-w-[70%]"
          >
            {item.etiqueta && (
              <p className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                {item.etiqueta}
              </p>
            )}
            <h3 className="mt-1 text-lg font-semibold text-balance">{item.titulo}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{item.descripcion}</p>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2" aria-label="Seleccionar tarjeta">
          {items.map((item, indice) => (
            <button
              key={`${item.titulo}-punto`}
              type="button"
              aria-label={`Mostrar tarjeta ${indice + 1}: ${item.titulo}`}
              aria-current={activo === indice ? 'true' : undefined}
              onClick={() => irA(indice)}
              className={`size-3 touch-manipulation rounded-full transition-transform duration-200 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${
                activo === indice ? 'bg-blue-600 dark:bg-blue-400' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Tarjeta anterior"
            disabled={activo === 0}
            onClick={() => irA(activo - 1)}
            className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-[background-color,transform] hover:-translate-x-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Tarjeta siguiente"
            disabled={activo === items.length - 1}
            onClick={() => irA(activo + 1)}
            className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-[background-color,transform] hover:translate-x-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
