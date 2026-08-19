import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export interface ItemPilaTarjetas {
  titulo: string
  descripcion: string
  etiqueta: string
}

export interface PropiedadesPilaTarjetas {
  items: ItemPilaTarjetas[]
  etiquetaBoton?: string
}

export function PilaTarjetas({
  items,
  etiquetaBoton = 'Descartar tarjeta superior',
}: PropiedadesPilaTarjetas) {
  const [primera, setPrimera] = useState(0)
  const [saliendo, setSaliendo] = useState(false)
  const temporizadorRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current)
    },
    [],
  )

  if (items.length === 0) return null

  function descartar() {
    if (saliendo) return
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducir) {
      setPrimera((actual) => (actual + 1) % items.length)
      return
    }
    setSaliendo(true)
    temporizadorRef.current = window.setTimeout(() => {
      setPrimera((actual) => (actual + 1) % items.length)
      setSaliendo(false)
    }, 350)
  }

  return (
    <section className="space-y-5">
      <div className="relative mx-auto h-64 max-w-md">
        {[2, 1, 0].map((profundidad) => {
          const indice = (primera + profundidad) % items.length
          const item = items[indice]
          return (
            <article
              key={`${primera}-${profundidad}-${item.titulo}`}
              aria-hidden={profundidad !== 0}
              className={`absolute inset-x-0 top-0 rounded-xl border bg-card p-6 shadow-lg transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
                profundidad === 0 && saliendo
                  ? 'translate-x-full rotate-12 opacity-0'
                  : profundidad === 0
                    ? 'translate-y-0 rotate-0'
                    : profundidad === 1
                      ? 'translate-y-3 rotate-2 scale-[0.97]'
                      : 'translate-y-6 -rotate-2 scale-[0.94]'
              }`}
              style={{ zIndex: 3 - profundidad }}
            >
              <p className="text-xs font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
                {item.etiqueta}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-balance">{item.titulo}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">{item.descripcion}</p>
            </article>
          )
        })}
      </div>
      <button
        type="button"
        onClick={descartar}
        disabled={saliendo}
        className="mx-auto flex min-h-11 touch-manipulation items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 motion-reduce:transition-none"
      >
        {etiquetaBoton}
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </section>
  )
}
