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
    <nav aria-label="Navegación entre lecciones" className="grid gap-3 sm:grid-cols-2">
      {anterior ? (
        <Link
          to={`/tecnologias/${technologyId}/${anterior.slug}`}
          className="flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ChevronLeft aria-hidden="true" className="size-3.5" />
            Lección anterior
          </span>
          <span className="text-base font-bold text-balance">{anterior.titulo}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {siguiente ? (
        <Link
          to={`/tecnologias/${technologyId}/${siguiente.slug}`}
          className="flex flex-col items-end gap-1.5 rounded-xl border bg-card p-4 text-right transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            Siguiente lección
            <ChevronRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className="text-base font-bold text-balance">{siguiente.titulo}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  )
}
