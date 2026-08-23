import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Leccion } from '@/types'

export interface PropiedadesBarraNavegacionLeccion {
  technologyId: string
  leccionActualId: string
  lecciones: Leccion[]
}

export function BarraNavegacionLeccion({
  technologyId,
  leccionActualId,
  lecciones,
}: PropiedadesBarraNavegacionLeccion) {
  const publicadas = lecciones
    .filter((leccion) => leccion.status === 'publicado')
    .sort((a, b) => a.orden - b.orden || a.createdAt.localeCompare(b.createdAt))
  const indice = publicadas.findIndex((leccion) => leccion.id === leccionActualId)
  if (indice === -1) return null

  const anterior = indice > 0 ? publicadas[indice - 1] : null
  const siguiente = indice < publicadas.length - 1 ? publicadas[indice + 1] : null
  if (!anterior && !siguiente) return null

  return (
    <nav
      aria-label="Navegación entre lecciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 py-2.5 shadow-[0_-2px_8px_0_rgb(0_0_0_/_0.05)] backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {anterior ? (
          <Link
            to={`/tecnologias/${technologyId}/${anterior.slug}`}
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Anterior
              </span>
              <span className="block max-w-52 truncate text-sm font-semibold sm:max-w-80">
                {anterior.titulo}
              </span>
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {siguiente ? (
          <Link
            to={`/tecnologias/${technologyId}/${siguiente.slug}`}
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-right hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Siguiente
              </span>
              <span className="block max-w-52 truncate text-sm font-semibold sm:max-w-80">
                {siguiente.titulo}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </nav>
  )
}
