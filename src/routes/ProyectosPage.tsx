import { ArrowUpRight, FolderKanban } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { TechnologyBrand } from '@/components/technology/TechnologyCard'
import { Card } from '@/components/ui/card'
import { useProyectos } from '@/lib/hooks/useLecciones'
import { cn } from '@/lib/utils'

export function ProyectosPage() {
  const proyectosQuery = useProyectos()
  const [technologyId, setTechnologyId] = useState<string | null>(null)
  const proyectos = (proyectosQuery.data ?? []).filter(
    (proyecto) =>
      proyecto.esProyecto &&
      proyecto.status === 'publicado' &&
      proyecto.technology.status === 'completado',
  )
  const tecnologias = Array.from(
    new Map(proyectos.map((proyecto) => [proyecto.technology.id, proyecto.technology])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  const proyectosVisibles = technologyId
    ? proyectos.filter((proyecto) => proyecto.technology.id === technologyId)
    : proyectos

  if (proyectosQuery.isLoading) return <p role="status">Cargando proyectos…</p>
  if (proyectosQuery.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudieron cargar los proyectos. Inténtalo de nuevo.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
          >
            <FolderKanban className="size-7" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Proyectos</h1>
        </div>
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          Pon en práctica lo aprendido con ejercicios completos de varias tecnologías.
        </p>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat('es-ES').format(proyectos.length)}{' '}
          {proyectos.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}
        </p>
      </header>

      {tecnologias.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar proyectos por tecnología"
          className="flex max-w-full flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={technologyId === null}
            onClick={() => setTechnologyId(null)}
            className={cn(
              'min-h-10 touch-manipulation rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              technologyId === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            Todos
          </button>
          {tecnologias.map((technology) => (
            <button
              key={technology.id}
              type="button"
              aria-pressed={technologyId === technology.id}
              onClick={() => setTechnologyId(technology.id)}
              className={cn(
                'min-h-10 touch-manipulation rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                technologyId === technology.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {technology.name}
            </button>
          ))}
        </div>
      )}

      {proyectosVisibles.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            {proyectos.length === 0
              ? 'Todavía no hay proyectos publicados.'
              : 'No hay proyectos publicados para esta tecnología.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proyectosVisibles.map((proyecto) => (
            <TechnologyBrand key={proyecto.id} iconKey={proyecto.technology.icon}>
              {(brand) => (
                <Card className="group flex h-full min-w-0 flex-col gap-0 overflow-hidden p-0 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div
                    className={cn(
                      'relative isolate h-28 overflow-hidden rounded-t-xl',
                      brand.backgroundClassName,
                      brand.foregroundClassName,
                    )}
                    style={brand.brandHex ? { backgroundColor: brand.brandHex } : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-4 -bottom-8 opacity-[0.14]"
                    >
                      <brand.Icon className="size-28" />
                    </span>
                    <span aria-hidden="true" className="relative z-10 flex h-full items-center px-6">
                      <brand.Icon className="size-11" />
                    </span>
                    <span
                      className={cn(
                        'absolute top-4 right-4 z-10 rounded-full border px-3 py-1 text-xs font-medium',
                        brand.glassClassName,
                      )}
                    >
                      {proyecto.technology.name}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="min-w-0 flex-1">
                      <h2 className="min-w-0 break-words text-xl font-bold text-balance">
                        <Link
                          to={`/tecnologias/${proyecto.technology.id}/${proyecto.slug}`}
                          className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {proyecto.titulo}
                        </Link>
                      </h2>
                      <p className="mt-2 break-words text-sm text-pretty text-muted-foreground">
                        {proyecto.resumen.trim() || 'Proyecto práctico paso a paso.'}
                      </p>
                    </div>
                    <Link
                      to={`/tecnologias/${proyecto.technology.id}/${proyecto.slug}`}
                      className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Abrir proyecto
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                </Card>
              )}
            </TechnologyBrand>
          ))}
        </div>
      )}
    </div>
  )
}
