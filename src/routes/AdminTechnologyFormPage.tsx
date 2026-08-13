import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { TechnologyForm } from '@/components/technology/TechnologyForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/lib/hooks/useCategories'
import {
  useCreateTechnology,
  useDeleteTechnology,
  useTechnology,
  useUpdateTechnology,
} from '@/lib/hooks/useTechnologies'
import type { NewTechnologyInput } from '@/lib/queries/mappers'

export function AdminTechnologyFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const categoriesQuery = useCategories()
  const technologyQuery = useTechnology(id ?? '')
  const createMutation = useCreateTechnology()
  const updateMutation = useUpdateTechnology()
  const deleteMutation = useDeleteTechnology()
  const [deleteError, setDeleteError] = useState('')

  async function save(input: NewTechnologyInput) {
    if (id) await updateMutation.mutateAsync({ id, patch: input })
    else await createMutation.mutateAsync(input)
    navigate('/admin')
  }

  async function remove() {
    if (!id || !window.confirm('¿Quieres borrar esta ficha? La acción no se puede deshacer.')) {
      return
    }
    setDeleteError('')
    try {
      await deleteMutation.mutateAsync(id)
      navigate('/admin')
    } catch {
      setDeleteError('No se pudo borrar la ficha. Inténtalo de nuevo.')
    }
  }

  if (categoriesQuery.isLoading || (editing && technologyQuery.isLoading)) {
    return <p role="status">Cargando editor…</p>
  }
  if (categoriesQuery.isError || (editing && technologyQuery.isError)) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo abrir el editor. Inténtalo de nuevo.
      </p>
    )
  }
  if (editing && !technologyQuery.data) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Ficha no encontrada</h1>
        <Link to="/admin" className="font-medium underline underline-offset-4">
          Volver al panel
        </Link>
      </Card>
    )
  }

  return (
    <section aria-labelledby="technology-form-title" className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administración</p>
          <h1 id="technology-form-title" className="mt-1 text-3xl font-semibold tracking-tight text-balance">
            {editing ? 'Editar ficha' : 'Nueva ficha'}
          </h1>
        </div>
        {editing && (
          <Button type="button" variant="destructive" disabled={deleteMutation.isPending} onClick={() => void remove()}>
            {deleteMutation.isPending ? 'Borrando…' : 'Borrar ficha'}
          </Button>
        )}
      </header>

      {(categoriesQuery.data?.length ?? 0) === 0 ? (
        <Card className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Crea al menos una categoría antes de añadir una ficha.
          </p>
          <Button asChild variant="outline">
            <Link to="/admin/categorias">Crear categoría</Link>
          </Button>
        </Card>
      ) : (
        <Card>
          <TechnologyForm
            categories={categoriesQuery.data ?? []}
            technology={technologyQuery.data ?? undefined}
            pending={createMutation.isPending || updateMutation.isPending}
            onSubmit={save}
          />
        </Card>
      )}
      <p aria-live="polite" className="text-sm text-destructive">
        {deleteError}
      </p>
    </section>
  )
}
