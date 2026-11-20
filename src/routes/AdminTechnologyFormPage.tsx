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
import type { Category, Technology } from '@/types'

type EstadoEditor = 'cargando' | 'error' | 'no-encontrado' | 'listo'

function obtenerEstadoEditor({
  editing,
  technology,
  categoriesLoading,
  technologyLoading,
  categoriesError,
  technologyError,
}: {
  editing: boolean
  technology?: Technology | null
  categoriesLoading: boolean
  technologyLoading: boolean
  categoriesError: boolean
  technologyError: boolean
}): EstadoEditor {
  if (categoriesLoading || (editing && technologyLoading)) return 'cargando'
  if (categoriesError || (editing && technologyError)) return 'error'
  if (editing && !technology) return 'no-encontrado'
  return 'listo'
}

function CabeceraEditorTecnologia({
  editing,
  deleting,
  onRemove,
}: {
  editing: boolean
  deleting: boolean
  onRemove: () => void
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1 id="technology-form-title" className="mt-1 text-3xl font-semibold tracking-tight text-balance">
          {editing ? 'Editar ficha' : 'Nueva ficha'}
        </h1>
      </div>
      {editing && (
        <Button type="button" variant="destructive" disabled={deleting} onClick={onRemove}>
          {deleting ? 'Borrando…' : 'Borrar ficha'}
        </Button>
      )}
    </header>
  )
}

function ContenidoEditorTecnologia({
  categories,
  technology,
  pending,
  onSubmit,
}: {
  categories: Category[]
  technology?: Technology
  pending: boolean
  onSubmit: (input: NewTechnologyInput) => Promise<void>
}) {
  if (categories.length === 0) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Crea al menos una categoría antes de añadir una ficha.
        </p>
        <Button asChild variant="outline">
          <Link to="/admin/categorias">Crear categoría</Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <TechnologyForm
        categories={categories}
        technology={technology}
        pending={pending}
        onSubmit={onSubmit}
      />
    </Card>
  )
}

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

  const estadoEditor = obtenerEstadoEditor({
    editing,
    technology: technologyQuery.data,
    categoriesLoading: categoriesQuery.isLoading,
    technologyLoading: technologyQuery.isLoading,
    categoriesError: categoriesQuery.isError,
    technologyError: technologyQuery.isError,
  })
  if (estadoEditor === 'cargando') {
    return <p role="status">Cargando editor…</p>
  }
  if (estadoEditor === 'error') {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo abrir el editor. Inténtalo de nuevo.
      </p>
    )
  }
  if (estadoEditor === 'no-encontrado') {
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
      <CabeceraEditorTecnologia
        editing={editing}
        deleting={deleteMutation.isPending}
        onRemove={() => void remove()}
      />

      <ContenidoEditorTecnologia
        categories={categoriesQuery.data ?? []}
        technology={technologyQuery.data ?? undefined}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={save}
      />
      <p aria-live="polite" className="text-sm text-destructive">
        {deleteError}
      </p>
    </section>
  )
}
