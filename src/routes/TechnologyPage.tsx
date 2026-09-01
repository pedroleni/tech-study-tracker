import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ExternalLink,
  PlayCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { difficultyLabels, priorityLabels, statusLabels } from '@/components/technology/labels'
import { StatusBadge } from '@/components/technology/StatusBadge'
import { TechnologyBrand } from '@/components/technology/TechnologyCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAddFavorite, useFavorites, useRemoveFavorite } from '@/lib/hooks/useFavorites'
import { useLecciones } from '@/lib/hooks/useLecciones'
import {
  useMyLeccionesProgress,
  useMyProgress,
  useSetMyLeccionProgress,
  useSetMyProgress,
} from '@/lib/hooks/useProgress'
import { useTechnology } from '@/lib/hooks/useTechnologies'
import { useProfile } from '@/lib/hooks/useProfile'
import { cn } from '@/lib/utils'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'
import type { Leccion, Status } from '@/types'

// Mismos colores que StatusBadge — el select debe leerse como la misma
// etiqueta de estado el resto de la app, no como un campo de formulario.
const leccionProgressPillClassName: Record<Status, string> = {
  pendiente: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

function groupLecciones(lecciones: Leccion[]) {
  const withoutModule = lecciones.filter((leccion) => !leccion.modulo?.trim())
  const modules = new Map<string, Leccion[]>()

  lecciones.forEach((leccion) => {
    const moduleName = leccion.modulo?.trim()
    if (!moduleName) return
    const group = modules.get(moduleName) ?? []
    group.push(leccion)
    modules.set(moduleName, group)
  })

  return [
    ...(withoutModule.length > 0 ? [{ name: null, lecciones: withoutModule }] : []),
    ...Array.from(modules, ([name, lessons]) => ({ name, lecciones: lessons })),
  ]
}

function FavoriteControl({ technologyId }: { technologyId: string }) {
  const { user } = useAuth()
  const favoritesQuery = useFavorites()
  const addMutation = useAddFavorite()
  const removeMutation = useRemoveFavorite()
  const [error, setError] = useState('')
  const favorite = favoritesQuery.data?.find((item) => item.technologyId === technologyId)
  const pending = addMutation.isPending || removeMutation.isPending

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">Inicia sesión para guardar</Link>
      </Button>
    )
  }

  async function toggleFavorite() {
    setError('')
    try {
      if (favorite) await removeMutation.mutateAsync(favorite.id)
      else await addMutation.mutateAsync(technologyId)
    } catch {
      setError('No se pudo actualizar el favorito. Inténtalo de nuevo.')
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={pending || favoritesQuery.isLoading}
        aria-pressed={Boolean(favorite)}
        onClick={() => void toggleFavorite()}
      >
        {favorite ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
        {pending ? 'Guardando…' : favorite ? 'Guardada' : 'Guardar en favoritos'}
      </Button>
      <p aria-live="polite" className="mt-2 text-sm text-destructive">
        {error}
      </p>
    </div>
  )
}

function ProgressControl({
  technologyId,
  lecciones,
  publishedLeccionIds,
  leccionProgressById,
}: {
  technologyId: string
  lecciones: Leccion[]
  publishedLeccionIds: string[]
  leccionProgressById: ReadonlyMap<string, Status>
}) {
  const { user } = useAuth()
  const progressQuery = useMyProgress(technologyId)
  const setProgressMutation = useSetMyProgress()
  const [error, setError] = useState('')
  const publishedLecciones = lecciones.filter((leccion) => leccion.status === 'publicado')

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">Inicia sesión para guardar tu progreso</Link>
      </Button>
    )
  }

  async function setProgress(patch: { currentLeccionId?: string | null }) {
    setError('')
    try {
      await setProgressMutation.mutateAsync({ technologyId, patch })
    } catch {
      setError('No se pudo guardar tu progreso. Inténtalo de nuevo.')
    }
  }

  const progress = progressQuery.data
  const pending = progressQuery.isLoading || setProgressMutation.isPending
  const pendingPatch = setProgressMutation.variables?.patch
  const totalPublished = publishedLeccionIds.length
  const completedCount = publishedLeccionIds.filter(
    (leccionId) => leccionProgressById.get(leccionId) === 'completado',
  ).length
  const hasStarted = publishedLeccionIds.some((leccionId) => {
    const status = leccionProgressById.get(leccionId) ?? 'pendiente'
    return status === 'en_progreso' || status === 'completado'
  })
  const derivedStatus: Status =
    totalPublished > 0 && completedCount === totalPublished
      ? 'completado'
      : hasStarted
        ? 'en_progreso'
        : 'pendiente'
  const savedLeccionId = publishedLecciones.some(
    (leccion) => leccion.id === progress?.currentLeccionId,
  )
    ? progress?.currentLeccionId
    : ''
  const currentLeccionId =
    pendingPatch?.currentLeccionId !== undefined
      ? pendingPatch.currentLeccionId
      : savedLeccionId

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Estado</p>
          <StatusBadge status={derivedStatus} />
          <p className="text-sm text-muted-foreground tabular-nums">
            {totalPublished > 0
              ? `${completedCount} de ${totalPublished} lecciones completadas`
              : 'Todavía no hay lecciones publicadas'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress-current-leccion">Lección actual</Label>
          <select
            id="progress-current-leccion"
            name="progress-current-leccion"
            value={currentLeccionId ?? ''}
            disabled={pending}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(event) =>
              void setProgress({ currentLeccionId: event.currentTarget.value || null })
            }
          >
            <option value="">Ninguna</option>
            {publishedLecciones.map((leccion) => (
              <option key={leccion.id} value={leccion.id}>
                {leccion.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {setProgressMutation.isPending ? 'Guardando…' : ''}
      </p>
      <p role={error ? 'alert' : undefined} className="text-sm text-destructive">
        {error || (progressQuery.isError ? 'No se pudo cargar tu progreso.' : '')}
      </p>
    </div>
  )
}

export function TechnologyPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const technologyQuery = useTechnology(id)
  const leccionesQuery = useLecciones(id)
  const progressQuery = useMyProgress(id)
  const technology = technologyQuery.data
  const publishedLecciones = (leccionesQuery.data ?? []).filter(
    (leccion) => leccion.status === 'publicado',
  )
  const publishedLeccionIds = publishedLecciones.map((leccion) => leccion.id)
  const leccionesProgressQuery = useMyLeccionesProgress(
    technology?.id ?? '',
    publishedLeccionIds,
  )
  const setLeccionProgressMutation = useSetMyLeccionProgress()
  const leccionProgressById = new Map<string, Status>(
    publishedLeccionIds.map((leccionId) => [leccionId, 'pendiente']),
  )
  leccionesProgressQuery.data?.forEach((progress) => {
    if (leccionProgressById.has(progress.leccionId)) {
      leccionProgressById.set(progress.leccionId, progress.status)
    }
  })

  if (technologyQuery.isLoading || leccionesQuery.isLoading) {
    return <p role="status">Cargando ficha…</p>
  }
  if (technologyQuery.isError || leccionesQuery.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo cargar la ficha. Inténtalo de nuevo.
      </p>
    )
  }
  if (!technology) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Ficha no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Puede que no exista o todavía no esté publicada.
        </p>
        <Link to="/" className="inline-flex font-medium underline underline-offset-4">
          Volver al inicio
        </Link>
      </Card>
    )
  }

  const safeResources = technology.resources.filter((resource) =>
    validateResourceUrl(resource.url),
  )
  const isPublished = technology.status === 'completado'
  const leccionGroups = groupLecciones(leccionesQuery.data ?? [])

  return (
    <TechnologyBrand iconKey={technology.icon}>
      {(brand) => (
        <div className="space-y-10">
          <article className="space-y-8">
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
                      className={cn(
                        'rounded-2xl border p-3',
                        brand.glassClassName,
                      )}
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
                {isPublished && <FavoriteControl technologyId={technology.id} />}
              </div>
            </header>

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
                  <ProgressControl
                    technologyId={technology.id}
                    lecciones={leccionesQuery.data ?? []}
                    publishedLeccionIds={publishedLeccionIds}
                    leccionProgressById={leccionProgressById}
                  />
                </Card>
              </section>
            )}

            <section aria-labelledby="lecciones-title" className="space-y-6">
              <div>
                <h2 id="lecciones-title" className="text-2xl font-semibold text-balance">
                  Lecciones
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contenido ordenado por módulos para avanzar paso a paso.
                </p>
              </div>

              {leccionGroups.length === 0 ? (
                <Card>
                  <p className="text-sm text-muted-foreground">
                    Todavía no hay lecciones publicadas.
                  </p>
                </Card>
              ) : (
                <div className="space-y-8">
                  {leccionGroups.map((group) => (
                    <section
                      key={group.name ?? 'sin-modulo'}
                      aria-label={group.name ?? 'Lecciones sin módulo'}
                    >
                      <Card className="gap-0 overflow-hidden p-0">
                        <div
                          className={cn(
                            'relative isolate overflow-hidden px-5 py-4',
                            brand.backgroundClassName,
                            brand.foregroundClassName,
                          )}
                          style={
                            brand.brandHex
                              ? { backgroundColor: brand.brandHex }
                              : undefined
                          }
                        >
                          <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'shrink-0 rounded-xl border p-2',
                                  brand.glassClassName,
                                )}
                              >
                                <BookOpen className="size-5" />
                              </span>
                              {group.name ? (
                                <h3 className="min-w-0 break-words text-lg font-semibold text-balance">
                                  {group.name}
                                </h3>
                              ) : (
                                <h3 className="sr-only">Lecciones sin módulo</h3>
                              )}
                            </div>
                            <span
                              className={cn(
                                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium tabular-nums',
                                brand.glassClassName,
                              )}
                            >
                              {group.lecciones.length}{' '}
                              {group.lecciones.length === 1 ? 'lección' : 'lecciones'}
                            </span>
                          </div>
                        </div>
                        <ul>
                          {group.lecciones.map((leccion, indice) => {
                            const esActual =
                              leccion.id === progressQuery.data?.currentLeccionId
                            const leccionProgressPending =
                              setLeccionProgressMutation.isPending &&
                              setLeccionProgressMutation.variables?.leccionId === leccion.id
                            const leccionProgressStatus = leccionProgressPending
                              ? setLeccionProgressMutation.variables.status
                              : (leccionProgressById.get(leccion.id) ?? 'pendiente')
                            return (
                              <li
                                key={leccion.id}
                                className={cn(
                                  'group min-w-0 border-t p-4 first:border-t-0 sm:p-5',
                                  esActual && !brand.brandHex && 'bg-muted/50',
                                )}
                                style={
                                  esActual && brand.brandHex
                                    ? { backgroundColor: `${brand.brandHex}1A` }
                                    : undefined
                                }
                              >
                                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <span
                                      aria-hidden="true"
                                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums text-muted-foreground"
                                    >
                                      {String(indice + 1).padStart(2, '0')}
                                    </span>
                                    <div className="min-w-0 flex-1 space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="min-w-0 break-words text-base font-semibold text-balance">
                                          <Link
                                            to={`/tecnologias/${technology.id}/${leccion.slug}`}
                                            className="rounded-sm decoration-foreground/30 underline-offset-4 group-hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          >
                                            {leccion.titulo}
                                          </Link>
                                        </h4>
                                        {esActual && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                            <PlayCircle
                                              aria-hidden="true"
                                              className="size-3.5"
                                            />
                                            Continuando aquí
                                          </span>
                                        )}
                                        {leccion.status === 'borrador' && (
                                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            Borrador
                                          </span>
                                        )}
                                      </div>
                                      <p className="break-words text-sm text-muted-foreground">
                                        {leccion.resumen ||
                                          'Esta lección todavía no tiene resumen.'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-3">
                                    {user && leccion.status === 'publicado' && (
                                      <span className="relative inline-flex shrink-0 items-center">
                                        <select
                                          name={`progress-${leccion.id}`}
                                          value={leccionProgressStatus}
                                          disabled={leccionProgressPending}
                                          aria-label={`Estado de ${leccion.titulo}`}
                                          className={cn(
                                            'h-6 appearance-none rounded-full py-1 pr-6 pl-2.5 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                                            leccionProgressPillClassName[leccionProgressStatus],
                                          )}
                                          onChange={(event) =>
                                            setLeccionProgressMutation.mutate({
                                              leccionId: leccion.id,
                                              technologyId: technology.id,
                                              status: event.currentTarget.value as Status,
                                            })
                                          }
                                        >
                                          <option value="pendiente">Pendiente</option>
                                          <option value="en_progreso">En progreso</option>
                                          <option value="completado">Completado</option>
                                        </select>
                                        <ChevronDown
                                          aria-hidden="true"
                                          className="pointer-events-none absolute right-1.5 size-3"
                                        />
                                      </span>
                                    )}
                                    {isAdmin && (
                                      <Link
                                        to={`/admin/tecnologias/${technology.id}/lecciones/${leccion.id}/editar`}
                                        className="rounded-sm text-sm text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      >
                                        Editar
                                      </Link>
                                    )}
                                    <ArrowUpRight
                                      aria-hidden="true"
                                      className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                                    />
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </Card>
                    </section>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="resources-title" className="space-y-4">
              <h2 id="resources-title" className="text-xl font-semibold text-balance">
                Recursos
              </h2>
              {safeResources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay recursos externos.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {safeResources.map((resource) => (
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
          </article>
        </div>
      )}
    </TechnologyBrand>
  )
}
