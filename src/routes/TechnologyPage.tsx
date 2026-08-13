import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CommentsSection } from '@/components/comment/CommentsSection'
import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { DifficultyBadge } from '@/components/technology/DifficultyBadge'
import { PriorityBadge } from '@/components/technology/PriorityBadge'
import { StatusBadge } from '@/components/technology/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAddFavorite, useFavorites, useRemoveFavorite } from '@/lib/hooks/useFavorites'
import { useTechnology } from '@/lib/hooks/useTechnologies'
import { useProfile } from '@/lib/hooks/useProfile'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'

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

export function TechnologyPage() {
  const { id = '' } = useParams()
  const { isAdmin } = useProfile()
  const technologyQuery = useTechnology(id)
  const technology = technologyQuery.data

  if (technologyQuery.isLoading) return <p role="status">Cargando ficha…</p>
  if (technologyQuery.isError) {
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

  return (
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {technology.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={technology.status} />
                <DifficultyBadge difficulty={technology.difficulty} />
                <PriorityBadge priority={technology.priority} />
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              {isAdmin && (
                <Button asChild variant="outline">
                  <Link to={`/admin/tecnologias/${technology.id}/editar`}>Editar ficha</Link>
                </Button>
              )}
              {isPublished && <FavoriteControl technologyId={technology.id} />}
            </div>
          </div>
        </header>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-balance">Apuntes</h2>
          {technology.notes.trim() ? (
            <SafeMarkdown>{technology.notes}</SafeMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">Esta ficha todavía no tiene apuntes.</p>
          )}
        </Card>

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

      <CommentsSection technologyId={technology.id} writable={isPublished} />
    </div>
  )
}
