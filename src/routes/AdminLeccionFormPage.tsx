import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { LeccionForm } from '@/components/leccion/LeccionForm'
import type { LeccionFormValues } from '@/components/leccion/LeccionForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLeccion } from '@/lib/hooks/useLeccion'
import { useCreateLeccion, useDeleteLeccion, useUpdateLeccion } from '@/lib/hooks/useLecciones'
import { useTechnology } from '@/lib/hooks/useTechnologies'
import type { Leccion, Technology } from '@/types'

type EstadoEditor = 'cargando' | 'error' | 'no-encontrado' | 'listo'

function obtenerEstadoEditor({
  editing,
  technology,
  leccion,
  technologyId,
  technologyLoading,
  leccionLoading,
  technologyError,
  leccionError,
}: {
  editing: boolean
  technology?: Technology | null
  leccion?: Leccion | null
  technologyId: string
  technologyLoading: boolean
  leccionLoading: boolean
  technologyError: boolean
  leccionError: boolean
}): EstadoEditor {
  if (technologyLoading || (editing && leccionLoading)) return 'cargando'
  if (technologyError || (editing && leccionError)) return 'error'
  if (!technology || (editing && (!leccion || leccion.technologyId !== technologyId))) {
    return 'no-encontrado'
  }
  return 'listo'
}

function CabeceraEditorLeccion({
  editing,
  technologyName,
  deleting,
  onRemove,
}: {
  editing: boolean
  technologyName: string
  deleting: boolean
  onRemove: () => void
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {technologyName} · Administración
        </p>
        <h1
          id="leccion-form-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          {editing ? 'Editar lección' : 'Nueva lección'}
        </h1>
      </div>
      {editing && (
        <Button
          type="button"
          variant="destructive"
          disabled={deleting}
          onClick={onRemove}
        >
          {deleting ? 'Borrando…' : 'Borrar lección'}
        </Button>
      )}
    </header>
  )
}

export function AdminLeccionFormPage() {
  const { id = '', leccionId } = useParams()
  const editing = Boolean(leccionId)
  const navigate = useNavigate()
  const technologyQuery = useTechnology(id)
  const leccionQuery = useLeccion({ id: leccionId ?? '' })
  const createMutation = useCreateLeccion()
  const updateMutation = useUpdateLeccion()
  const deleteMutation = useDeleteLeccion()
  const [deleteError, setDeleteError] = useState('')
  const technology = technologyQuery.data
  const leccion = leccionQuery.data

  async function remove() {
    if (
      !leccionId ||
      !window.confirm('¿Quieres borrar esta lección? La acción no se puede deshacer.')
    ) {
      return
    }
    setDeleteError('')
    try {
      await deleteMutation.mutateAsync(leccionId)
      navigate(`/admin/tecnologias/${id}/editar`)
    } catch {
      setDeleteError('No se pudo borrar la lección. Inténtalo de nuevo.')
    }
  }

  async function save(values: LeccionFormValues) {
    if (leccionId) {
      await updateMutation.mutateAsync({
        id: leccionId,
        patch: {
          modulo: values.modulo,
          titulo: values.titulo,
          resumen: values.resumen,
          contenido: values.contenido,
          orden: values.orden,
          status: values.status,
          esProyecto: values.esProyecto,
        },
      })
      navigate(`/tecnologias/${id}/${values.slug}`)
      return
    }

    const created = await createMutation.mutateAsync({
      technologyId: id,
      slug: values.slug,
      modulo: values.modulo,
      titulo: values.titulo,
      resumen: values.resumen,
      contenido: values.contenido,
      orden: values.orden,
      esProyecto: values.esProyecto,
    })
    navigate(`/admin/tecnologias/${id}/lecciones/${created.id}/editar`)
  }

  const estadoEditor = obtenerEstadoEditor({
    editing,
    technology,
    leccion,
    technologyId: id,
    technologyLoading: technologyQuery.isLoading,
    leccionLoading: leccionQuery.isLoading,
    technologyError: technologyQuery.isError,
    leccionError: leccionQuery.isError,
  })
  if (estadoEditor === 'cargando') return <p role="status">Cargando editor…</p>
  if (estadoEditor === 'error') {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo abrir el editor. Inténtalo de nuevo.
      </p>
    )
  }
  if (estadoEditor === 'no-encontrado' || !technology) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Lección no encontrada</h1>
        <Link to="/admin" className="font-medium underline underline-offset-4">
          Volver al panel
        </Link>
      </Card>
    )
  }

  return (
    <section aria-labelledby="leccion-form-title" className="space-y-8">
      <CabeceraEditorLeccion
        editing={editing}
        technologyName={technology.name}
        deleting={deleteMutation.isPending}
        onRemove={() => void remove()}
      />

      <Card>
        <LeccionForm
          leccion={leccion ?? undefined}
          pending={createMutation.isPending || updateMutation.isPending}
          onSubmit={save}
        />
      </Card>
      <p aria-live="polite" className="text-sm text-destructive">
        {deleteError}
      </p>
    </section>
  )
}
