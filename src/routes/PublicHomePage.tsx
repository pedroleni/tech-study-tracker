import { ArrowRight, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { useCategories } from '@/lib/hooks/useCategories'
import { useTechnologies } from '@/lib/hooks/useTechnologies'
import { categoryIcons } from '@/lib/icons/categoryIcons'
import { groupByCategory } from '@/lib/utils/groupByCategory'

export function PublicHomePage() {
  const categoriesQuery = useCategories()
  const technologiesQuery = useTechnologies()
  const loading = categoriesQuery.isLoading || technologiesQuery.isLoading
  const failed = categoriesQuery.isError || technologiesQuery.isError
  const publishedTechnologies =
    technologiesQuery.data?.filter((technology) => technology.status === 'completado') ?? []
  const grouped = groupByCategory(publishedTechnologies)

  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-8 lg:grid-cols-2 lg:items-center" aria-labelledby="home-title">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Biblioteca técnica</p>
          <h1 id="home-title" className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Apuntes prácticos para aprender tecnología con contexto
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
            Documentación técnica estructurada y visual, con ejemplos reales orientados a la
            comprensión, no a la memorización.
          </p>
        </div>
        <img
          src="/hero.png"
          alt="Ilustración de un desarrollador estudiando con portátil, código, documentación y una mascota robot"
          className="h-auto w-full rounded-xl"
        />
      </section>

      <section id="categorias" className="scroll-mt-20 space-y-5" aria-labelledby="categories-title">
        <div>
          <h2 id="categories-title" className="text-2xl font-semibold text-balance">
            Explora por categoría
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo aparecen las fichas terminadas y publicadas.
          </p>
        </div>

        {loading && <p role="status">Cargando biblioteca…</p>}
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            No se pudo cargar la biblioteca. Inténtalo de nuevo.
          </p>
        )}
        {!loading && !failed && categoriesQuery.data?.length === 0 && (
          <Card>
            <p className="text-sm text-muted-foreground">
              Todavía no hay categorías publicadas.
            </p>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesQuery.data?.map((category) => {
            const count = grouped[category.id]?.length ?? 0
            const CategoryIcon = categoryIcons[category.icon ?? '']?.Icon ?? CircleHelp
            return (
              <Link
                key={category.id}
                to={`/categorias/${category.id}`}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="flex h-full items-center justify-between gap-4 transition-shadow group-hover:shadow-md">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <CategoryIcon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{category.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Intl.NumberFormat('es-ES').format(count)}{' '}
                        {count === 1 ? 'ficha' : 'fichas'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
