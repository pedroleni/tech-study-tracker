import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/technology/StatusBadge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAddFavorite, useFavorites, useRemoveFavorite } from '@/lib/hooks/useFavorites'
import { useMyProgress, useSetMyProgress } from '@/lib/hooks/useProgress'
import { textoPlanoDeTitulo } from '@/lib/utils/tituloEnLinea'
import type { LeccionResumen, Status } from '@/types'

function textoBotonFavorito(pending: boolean, favorite: boolean) {
  if (pending) return 'Guardando…'
  if (favorite) return 'Guardada'
  return 'Guardar en favoritos'
}

export function ControlFavorito({ technologyId }: { technologyId: string }) {
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
        {textoBotonFavorito(pending, Boolean(favorite))}
      </Button>
      <p aria-live="polite" className="mt-2 text-sm text-destructive">
        {error}
      </p>
    </div>
  )
}

function derivarEstado(
  totalPublished: number,
  completedCount: number,
  hasStarted: boolean,
): Status {
  if (totalPublished > 0 && completedCount === totalPublished) return 'completado'
  if (hasStarted) return 'en_progreso'
  return 'pendiente'
}

export function ControlProgreso({
  technologyId,
  lecciones,
  publishedLeccionIds,
  leccionProgressById,
}: {
  technologyId: string
  lecciones: LeccionResumen[]
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
  const derivedStatus = derivarEstado(totalPublished, completedCount, hasStarted)
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
                {textoPlanoDeTitulo(leccion.titulo)}
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
