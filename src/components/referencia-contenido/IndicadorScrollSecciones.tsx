import { useEffect, useRef, useState } from 'react'

export interface SeccionIndicadorScroll {
  titulo: string
  contenido: string
}

export interface PropiedadesIndicadorScrollSecciones {
  secciones: SeccionIndicadorScroll[]
  etiqueta?: string
}

export function IndicadorScrollSecciones({
  secciones,
  etiqueta = 'Progreso por secciones',
}: PropiedadesIndicadorScrollSecciones) {
  const seccionesRef = useRef<(HTMLElement | null)[]>([])
  const [activa, setActiva] = useState(0)

  useEffect(() => {
    const elementos = seccionesRef.current.filter((elemento): elemento is HTMLElement => Boolean(elemento))
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      (entradas) => {
        const candidatas = entradas.filter((entrada) => entrada.isIntersecting)
        if (candidatas.length === 0) return
        const mejor = candidatas.reduce((a, b) =>
          a.intersectionRatio >= b.intersectionRatio ? a : b,
        )
        setActiva(Number((mejor.target as HTMLElement).dataset.indice))
      },
      { rootMargin: '-25% 0px -45%', threshold: [0.1, 0.5, 0.9] },
    )
    elementos.forEach((elemento) => observador.observe(elemento))
    return () => observador.disconnect()
  }, [secciones.length])

  if (secciones.length === 0) return null

  return (
    <div className="grid grid-cols-[2rem_1fr] gap-4">
      <nav aria-label={etiqueta} className="relative">
        <div className="sticky top-20 flex flex-col items-center gap-3 py-3">
          {secciones.map((seccion, indice) => (
            <button
              key={`${seccion.titulo}-punto`}
              type="button"
              aria-label={`Ir a ${seccion.titulo}`}
              aria-current={activa === indice ? 'step' : undefined}
              onClick={() => {
                setActiva(indice)
                seccionesRef.current[indice]?.scrollIntoView({
                  behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                  block: 'center',
                })
              }}
              className={`size-3 touch-manipulation rounded-full transition-[transform,background-color] hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${
                activa === indice ? 'scale-125 bg-teal-600 dark:bg-teal-400' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </nav>
      <div className="space-y-4">
        {secciones.map((seccion, indice) => (
          <section
            key={`${seccion.titulo}-${indice}`}
            ref={(elemento) => {
              seccionesRef.current[indice] = elemento
            }}
            data-indice={indice}
            className={`min-h-36 scroll-mt-24 rounded-xl border bg-card p-5 transition-[border-color,transform] duration-300 motion-reduce:transition-none ${
              activa === indice ? 'translate-x-1 border-teal-600 dark:border-teal-400' : ''
            }`}
          >
            <p className="text-xs font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
              Sección {indice + 1}
            </p>
            <h3 className="mt-2 font-semibold text-balance">{seccion.titulo}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{seccion.contenido}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
