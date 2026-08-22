import { useEffect, useState } from 'react'

import type { EncabezadoH2 } from '@/lib/utils/extraerEncabezadosH2'

export interface PropiedadesRielSecciones {
  secciones: EncabezadoH2[]
}

export function RielSecciones({ secciones }: PropiedadesRielSecciones) {
  const [seccionActiva, setSeccionActiva] = useState(0)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const elementos = secciones.flatMap((seccion, indice) => {
      const elemento = document.getElementById(seccion.id)
      return elemento ? [{ elemento, indice }] : []
    })
    if (elementos.length === 0) return

    const indices = new Map<Element, number>(
      elementos.map(({ elemento, indice }) => [elemento, indice]),
    )
    const observador = new IntersectionObserver(
      (entradas) => {
        const candidatas = entradas.filter((entrada) => entrada.isIntersecting)
        if (candidatas.length === 0) return

        const mejor = candidatas.reduce((a, b) =>
          a.intersectionRatio >= b.intersectionRatio ? a : b,
        )
        const indice = indices.get(mejor.target)
        if (indice !== undefined) setSeccionActiva(indice)
      },
      { rootMargin: '-25% 0px -45%', threshold: [0.1, 0.5, 0.9] },
    )

    elementos.forEach(({ elemento }) => observador.observe(elemento))
    return () => observador.disconnect()
  }, [secciones])

  if (secciones.length === 0) return null

  return (
    <nav aria-label="Secciones de la lección" className="h-full w-42 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-1">
        <ul className="relative before:absolute before:top-1 before:bottom-1 before:left-1 before:w-0.5 before:bg-border before:content-['']">
          {secciones.map((seccion, indice) => {
            const activa = seccionActiva === indice

            return (
              <li key={seccion.id} className="relative pb-5.5 last:pb-0">
                <button
                  type="button"
                  aria-label={`Ir a ${seccion.titulo}`}
                  aria-current={activa ? 'true' : undefined}
                  onClick={() => {
                    setSeccionActiva(indice)
                    document.getElementById(seccion.id)?.scrollIntoView({
                      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
                        ? 'auto'
                        : 'smooth',
                      block: 'start',
                    })
                  }}
                  className={`relative w-full touch-manipulation pl-5.5 text-left text-[13px] leading-5 text-pretty transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${
                    activa ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 left-0 z-10 rounded-full border-2 border-background transition-[width,height,background-color] motion-reduce:transition-none ${
                      activa ? 'size-2.75 -translate-x-px bg-primary' : 'size-2.25 bg-border'
                    }`}
                  />
                  {seccion.titulo}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
