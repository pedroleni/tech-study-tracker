import { ArrowLeft, CircleHelp } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { TechnologyCard } from '@/components/technology/TechnologyCard'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/lib/hooks/useCategories'
import { useTechnologies } from '@/lib/hooks/useTechnologies'
import { categoryIcons } from '@/lib/icons/categoryIcons'

export function CategoryPage() {
  const { id = '' } = useParams()
  const categoriesQuery = useCategories()
  const technologiesQuery = useTechnologies()
  const category = categoriesQuery.data?.find((item) => item.id === id)
  const technologies =
    technologiesQuery.data?.filter(
      (item) => item.categoryId === id && item.status === 'completado',
    ) ?? []
  const loading = categoriesQuery.isLoading || technologiesQuery.isLoading
  const failed = categoriesQuery.isError || technologiesQuery.isError

  if (loading) return <p role="status">Cargando categoría…</p>
  if (failed) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo cargar la categoría. Inténtalo de nuevo.
      </p>
    )
  }
  if (!category) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Categoría no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Puede que no exista o todavía no tenga contenido público.
        </p>
        <Link to="/" className="inline-flex font-medium underline underline-offset-4">
          Volver al inicio
        </Link>
      </Card>
    )
  }
  const CategoryIcon = categoryIcons[category.icon ?? '']?.Icon ?? CircleHelp

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Todas las categorías
        </Link>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="rounded-xl bg-muted p-2 text-muted-foreground">
            <CategoryIcon className="size-7" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {category.name}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat('es-ES').format(technologies.length)}{' '}
          {technologies.length === 1 ? 'ficha publicada' : 'fichas publicadas'}
        </p>
      </header>

      {technologies.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Esta categoría todavía no tiene fichas publicadas.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {technologies.map((technology) => (
            <TechnologyCard key={technology.id} technology={technology} />
          ))}
        </div>
      )}
    </div>
  )
}
