import { ArrowUpRight, BookOpen, ChevronDown, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TituloEnLinea } from '@/components/content/TituloEnLinea'
import { TechnologyBrand } from '@/components/technology/TechnologyCard'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { textoPlanoDeTitulo } from '@/lib/utils/tituloEnLinea'
import type { Leccion, Status } from '@/types'

// Mismos colores que StatusBadge — el select debe leerse como la misma
// etiqueta de estado el resto de la app, no como un campo de formulario.
const leccionProgressPillClassName: Record<Status, string> = {
  pendiente: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

interface GrupoLecciones {
  name: string | null
  lecciones: Leccion[]
}

function agruparLecciones(lecciones: Leccion[]): GrupoLecciones[] {
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

function FilaLeccion({
  leccion,
  indice,
  technologyId,
  currentLeccionId,
  user,
  isAdmin,
  brandHex,
  progressStatus,
  progressPending,
  onCambiarProgreso,
}: {
  leccion: Leccion
  indice: number
  technologyId: string
  currentLeccionId?: string | null
  user: boolean
  isAdmin: boolean
  brandHex?: string
  progressStatus: Status
  progressPending: boolean
  onCambiarProgreso: (leccionId: string, status: Status) => void
}) {
  const esActual = leccion.id === currentLeccionId

  return (
    <li
      className={cn(
        'group min-w-0 border-t p-4 first:border-t-0 sm:p-5',
        esActual && !brandHex && 'bg-muted/50',
      )}
      style={esActual && brandHex ? { backgroundColor: `${brandHex}1A` } : undefined}
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
                  to={`/tecnologias/${technologyId}/${leccion.slug}`}
                  className="rounded-sm decoration-foreground/30 underline-offset-4 group-hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TituloEnLinea texto={leccion.titulo} />
                </Link>
              </h4>
              {esActual && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <PlayCircle aria-hidden="true" className="size-3.5" />
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
              {leccion.resumen || 'Esta lección todavía no tiene resumen.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {user && leccion.status === 'publicado' && (
            <span className="relative inline-flex shrink-0 items-center">
              <select
                name={`progress-${leccion.id}`}
                value={progressStatus}
                disabled={progressPending}
                aria-label={`Estado de ${textoPlanoDeTitulo(leccion.titulo)}`}
                className={cn(
                  'h-6 appearance-none rounded-full py-1 pr-6 pl-2.5 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                  leccionProgressPillClassName[progressStatus],
                )}
                onChange={(event) =>
                  onCambiarProgreso(leccion.id, event.currentTarget.value as Status)
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
              to={`/admin/tecnologias/${technologyId}/lecciones/${leccion.id}/editar`}
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
}

function GrupoLecciones({
  group,
  technologyId,
  currentLeccionId,
  user,
  isAdmin,
  brand,
  leccionProgressById,
  pendingLeccionId,
  pendingStatus,
  onCambiarProgreso,
}: {
  group: GrupoLecciones
  technologyId: string
  currentLeccionId?: string | null
  user: boolean
  isAdmin: boolean
  brand: {
    backgroundClassName: string
    foregroundClassName: string
    glassClassName: string
    brandHex?: string
  }
  leccionProgressById: ReadonlyMap<string, Status>
  pendingLeccionId?: string
  pendingStatus?: Status
  onCambiarProgreso: (leccionId: string, status: Status) => void
}) {
  return (
    <section aria-label={group.name ?? 'Lecciones sin módulo'}>
      <Card className="gap-0 overflow-hidden p-0">
        <div
          className={cn(
            'relative isolate overflow-hidden px-5 py-4',
            brand.backgroundClassName,
            brand.foregroundClassName,
          )}
          style={brand.brandHex ? { backgroundColor: brand.brandHex } : undefined}
        >
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className={cn('shrink-0 rounded-xl border p-2', brand.glassClassName)}
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
            const progressPending = pendingLeccionId === leccion.id
            const progressStatus = progressPending
              ? (pendingStatus ?? 'pendiente')
              : (leccionProgressById.get(leccion.id) ?? 'pendiente')
            return (
              <FilaLeccion
                key={leccion.id}
                leccion={leccion}
                indice={indice}
                technologyId={technologyId}
                currentLeccionId={currentLeccionId}
                user={user}
                isAdmin={isAdmin}
                brandHex={brand.brandHex}
                progressStatus={progressStatus}
                progressPending={progressPending}
                onCambiarProgreso={onCambiarProgreso}
              />
            )
          })}
        </ul>
      </Card>
    </section>
  )
}

export function LeccionesFichaTecnologia({
  lecciones,
  technologyId,
  iconKey,
  currentLeccionId,
  user,
  isAdmin,
  leccionProgressById,
  pendingLeccionId,
  pendingStatus,
  onCambiarProgreso,
}: {
  lecciones: Leccion[]
  technologyId: string
  iconKey?: string | null
  currentLeccionId?: string | null
  user: boolean
  isAdmin: boolean
  leccionProgressById: ReadonlyMap<string, Status>
  pendingLeccionId?: string
  pendingStatus?: Status
  onCambiarProgreso: (leccionId: string, status: Status) => void
}) {
  const groups = agruparLecciones(lecciones)

  return (
    <section aria-labelledby="lecciones-title" className="space-y-6">
      <div>
        <h2 id="lecciones-title" className="text-2xl font-semibold text-balance">
          Lecciones
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Contenido ordenado por módulos para avanzar paso a paso.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Todavía no hay lecciones publicadas.
          </p>
        </Card>
      ) : (
        <TechnologyBrand iconKey={iconKey}>
          {(brand) => (
            <div className="space-y-8">
              {groups.map((group) => (
                <GrupoLecciones
                  key={group.name ?? 'sin-modulo'}
                  group={group}
                  technologyId={technologyId}
                  currentLeccionId={currentLeccionId}
                  user={user}
                  isAdmin={isAdmin}
                  brand={brand}
                  leccionProgressById={leccionProgressById}
                  pendingLeccionId={pendingLeccionId}
                  pendingStatus={pendingStatus}
                  onCambiarProgreso={onCambiarProgreso}
                />
              ))}
            </div>
          )}
        </TechnologyBrand>
      )}
    </section>
  )
}
