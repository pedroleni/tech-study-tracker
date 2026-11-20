import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { difficultyLabels, priorityLabels, statusLabels } from '@/components/technology/labels'
import { TechnologyBrand } from '@/components/technology/TechnologyCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ControlFavorito, ControlProgreso } from '@/routes/ControlesFichaTecnologia'
import { LeccionesFichaTecnologia } from '@/routes/LeccionesFichaTecnologia'
import type { Leccion, Resource, Status, Technology } from '@/types'

function CabeceraFicha({
  technology,
  isAdmin,
  isPublished,
  brand,
}: {
  technology: Technology
  isAdmin: boolean
  isPublished: boolean
  brand: {
    Icon: React.ComponentType<{ className?: string }>
    backgroundClassName: string
    brandHex?: string
    foregroundClassName: string
    glassClassName: string
  }
}) {
  return (
    <header className="space-y-4">
      <Link
        to={`/categorias/${technology.categoryId}`}
        className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver a la categoría
      </Link>
      <div
        className={cn(
          'relative isolate min-h-60 overflow-hidden rounded-xl border p-8 shadow-sm sm:p-10',
          brand.backgroundClassName,
          brand.foregroundClassName,
        )}
        style={brand.brandHex ? { backgroundColor: brand.brandHex } : undefined}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-12 opacity-[0.14]"
        >
          <brand.Icon className="size-48" />
        </span>
        <div className="relative z-10 flex min-h-40 flex-col justify-between gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <span
              aria-hidden="true"
              className={cn('rounded-2xl border p-3', brand.glassClassName)}
            >
              <brand.Icon className="size-13" />
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  brand.glassClassName,
                )}
              >
                {statusLabels[technology.status]}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  brand.glassClassName,
                )}
              >
                Dificultad {difficultyLabels[technology.difficulty].toLowerCase()}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  brand.glassClassName,
                )}
              >
                Prioridad {priorityLabels[technology.priority].toLowerCase()}
              </span>
            </div>
          </div>
          <h1 className="break-words text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {technology.name}
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-end gap-2">
        {isAdmin && (
          <>
            <Button asChild variant="outline">
              <Link to={`/admin/tecnologias/${technology.id}/editar`}>
                Editar tecnología
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/admin/tecnologias/${technology.id}/lecciones/nueva`}>
                Nueva lección
              </Link>
            </Button>
          </>
        )}
        {isPublished && <ControlFavorito technologyId={technology.id} />}
      </div>
    </header>
  )
}

function RecursosFicha({ resources }: { resources: Resource[] }) {
  return (
    <section aria-labelledby="resources-title" className="space-y-4">
      <h2 id="resources-title" className="text-xl font-semibold text-balance">
        Recursos
      </h2>
      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay recursos externos.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => (
            <li key={`${resource.label}-${resource.url}`}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="min-w-0 break-words">{resource.label}</span>
                <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ContenidoFichaTecnologia({
  technology,
  lecciones,
  safeResources,
  isAdmin,
  user,
  publishedLeccionIds,
  leccionProgressById,
  currentLeccionId,
  pendingLeccionId,
  pendingStatus,
  onCambiarProgreso,
}: {
  technology: Technology
  lecciones: Leccion[]
  safeResources: Resource[]
  isAdmin: boolean
  user: boolean
  publishedLeccionIds: string[]
  leccionProgressById: ReadonlyMap<string, Status>
  currentLeccionId?: string | null
  pendingLeccionId?: string
  pendingStatus?: Status
  onCambiarProgreso: (leccionId: string, status: Status) => void
}) {
  const isPublished = technology.status === 'completado'

  return (
    <TechnologyBrand iconKey={technology.icon}>
      {(brand) => (
        <div className="space-y-10">
          <article className="space-y-8">
            <CabeceraFicha
              technology={technology}
              isAdmin={isAdmin}
              isPublished={isPublished}
              brand={brand}
            />

            <Card className="space-y-4">
              <h2 className="text-xl font-semibold text-balance">Introducción</h2>
              {technology.notes.trim() ? (
                <SafeMarkdown>{technology.notes}</SafeMarkdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta tecnología todavía no tiene introducción.
                </p>
              )}
            </Card>

            {isPublished && (
              <section aria-labelledby="progress-title" className="space-y-4">
                <div>
                  <h2 id="progress-title" className="text-xl font-semibold text-balance">
                    Mi progreso
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Consulta tu avance y guarda la lección que estás estudiando.
                  </p>
                </div>
                <Card>
                  <ControlProgreso
                    technologyId={technology.id}
                    lecciones={lecciones}
                    publishedLeccionIds={publishedLeccionIds}
                    leccionProgressById={leccionProgressById}
                  />
                </Card>
              </section>
            )}

            <LeccionesFichaTecnologia
              lecciones={lecciones}
              technologyId={technology.id}
              iconKey={technology.icon}
              currentLeccionId={currentLeccionId}
              user={user}
              isAdmin={isAdmin}
              leccionProgressById={leccionProgressById}
              pendingLeccionId={pendingLeccionId}
              pendingStatus={pendingStatus}
              onCambiarProgreso={onCambiarProgreso}
            />

            <RecursosFicha resources={safeResources} />
          </article>
        </div>
      )}
    </TechnologyBrand>
  )
}
