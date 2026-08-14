import { CircleHelp } from 'lucide-react'
import { useState } from 'react'

import { CategoryForm } from '@/components/category/CategoryForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from '@/lib/hooks/useCategories'
import { categoryIcons } from '@/lib/icons/categoryIcons'

export function AdminCategoriesPage() {
  const categoriesQuery = useCategories()
  const createMutation = useCreateCategory()
  const renameMutation = useRenameCategory()
  const deleteMutation = useDeleteCategory()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  async function handleDelete(id: string) {
    if (!window.confirm('¿Quieres borrar esta categoría y todas sus fichas?')) return
    setDeleteError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      setDeleteError('No se pudo borrar la categoría. Comprueba si contiene fichas.')
    }
  }

  return (
    <section aria-labelledby="categories-admin-title" className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1 id="categories-admin-title" className="mt-1 text-3xl font-semibold tracking-tight text-balance">
          Categorías
        </h1>
      </header>

      <Card className="max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">Nueva categoría</h2>
        <CategoryForm
          id="new-category-name"
          submitLabel="Crear categoría"
          pending={createMutation.isPending}
          onSubmit={(input) => createMutation.mutateAsync(input).then(() => undefined)}
        />
      </Card>

      {categoriesQuery.isLoading && <p role="status">Cargando categorías…</p>}
      {categoriesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar las categorías. Inténtalo de nuevo.
        </p>
      )}
      <p aria-live="polite" className="text-sm text-destructive">
        {deleteError}
      </p>

      <ul className="divide-y rounded-xl border bg-card">
        {categoriesQuery.data?.map((category) => {
          const CategoryIcon = categoryIcons[category.icon ?? '']?.Icon ?? CircleHelp
          return (
            <li key={category.id} className="p-4">
              {editingId === category.id ? (
                <CategoryForm
                  id={`category-${category.id}`}
                  initialName={category.name}
                  initialIcon={category.icon}
                  submitLabel="Guardar nombre"
                  pending={renameMutation.isPending}
                  onCancel={() => setEditingId(null)}
                  onSubmit={async ({ name, icon }) => {
                    await renameMutation.mutateAsync({ id: category.id, name, icon })
                    setEditingId(null)
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="text-muted-foreground">
                      <CategoryIcon className="size-5" />
                    </span>
                    <span className="min-w-0 break-words font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(category.id)}
                    >
                      Renombrar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => void handleDelete(category.id)}
                    >
                      Borrar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
