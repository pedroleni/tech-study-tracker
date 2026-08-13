import { TechnologyCard } from '@/components/technology/TechnologyCard'
import { Card } from '@/components/ui/card'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useTechnologies } from '@/lib/hooks/useTechnologies'

export function FavoritesPage() {
  const favoritesQuery = useFavorites()
  const technologiesQuery = useTechnologies()
  const loading = favoritesQuery.isLoading || technologiesQuery.isLoading
  const failed = favoritesQuery.isError || technologiesQuery.isError
  const favoriteIds = new Set(favoritesQuery.data?.map((favorite) => favorite.technologyId))
  const technologies =
    technologiesQuery.data?.filter(
      (technology) =>
        technology.status === 'completado' && favoriteIds.has(technology.id),
    ) ?? []

  return (
    <section aria-labelledby="favorites-title" className="space-y-6">
      <header>
        <h1 id="favorites-title" className="text-3xl font-semibold tracking-tight text-balance">
          Tus favoritos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Una lista privada para volver rápido a las fichas que te interesan.
        </p>
      </header>

      {loading && <p role="status">Cargando favoritos…</p>}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar tus favoritos. Inténtalo de nuevo.
        </p>
      )}
      {!loading && !failed && technologies.length === 0 && (
        <Card>
          <p className="text-sm text-muted-foreground">
            Todavía no has guardado ninguna ficha pública.
          </p>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {technologies.map((technology) => (
          <TechnologyCard key={technology.id} technology={technology} />
        ))}
      </div>
    </section>
  )
}
