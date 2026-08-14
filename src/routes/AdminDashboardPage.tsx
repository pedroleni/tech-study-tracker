import { CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/technology/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTechnologies } from '@/lib/hooks/useTechnologies'
import { technologyIcons } from '@/lib/icons/technologyIcons'
import { computeStats } from '@/lib/utils/computeStats'

export function AdminDashboardPage() {
  const technologiesQuery = useTechnologies()
  const technologies = technologiesQuery.data ?? []
  const stats = computeStats(technologies)
  const drafts = technologies.filter((technology) => technology.status !== 'completado')
  const numberFormatter = new Intl.NumberFormat('es-ES')

  return (
    <section aria-labelledby="admin-title" className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administración</p>
          <h1 id="admin-title" className="mt-1 text-3xl font-semibold tracking-tight text-balance">
            Estado del contenido
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/categorias">Gestionar categorías</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/tecnologias/nueva">Nueva ficha</Link>
          </Button>
        </div>
      </header>

      {technologiesQuery.isLoading && <p role="status">Cargando panel…</p>}
      {technologiesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          No se pudo cargar el panel. Inténtalo de nuevo.
        </p>
      )}

      {!technologiesQuery.isLoading && !technologiesQuery.isError && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total', stats.total],
              ['Pendientes', stats.pendiente],
              ['En progreso', stats.en_progreso],
              ['Publicadas', stats.completado],
            ].map(([label, count]) => (
              <Card key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {numberFormatter.format(Number(count))}
                </p>
              </Card>
            ))}
          </div>

          <section aria-labelledby="drafts-title" className="space-y-4">
            <div>
              <h2 id="drafts-title" className="text-xl font-semibold text-balance">
                Borradores
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Las fichas pendientes o en progreso no son visibles públicamente.
              </p>
            </div>
            {drafts.length === 0 ? (
              <Card>
                <p className="text-sm text-muted-foreground">No hay borradores ahora mismo.</p>
              </Card>
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {drafts.map((technology) => {
                  const TechnologyIcon =
                    technologyIcons[technology.icon ?? '']?.Icon ?? CircleHelp
                  return (
                    <li
                      key={technology.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span aria-hidden="true" className="mt-0.5 text-muted-foreground">
                          <TechnologyIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{technology.name}</p>
                          <StatusBadge status={technology.status} className="mt-2" />
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/tecnologias/${technology.id}/editar`}>
                          Editar ficha
                        </Link>
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  )
}
