import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { LeccionForm } from '@/components/leccion/LeccionForm'
import type { LeccionFormValues } from '@/components/leccion/LeccionForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLeccion } from '@/lib/hooks/useLeccion'
import { useCreateLeccion, useDeleteLeccion, useUpdateLeccion } from '@/lib/hooks/useLecciones'
import { useTechnology } from '@/lib/hooks/useTechnologies'

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
    })
    navigate(`/admin/tecnologias/${id}/lecciones/${created.id}/editar`)
  }

  const loading = technologyQuery.isLoading || (editing && leccionQuery.isLoading)
  const failed = technologyQuery.isError || (editing && leccionQuery.isError)
  if (loading) return <p role="status">Cargando editor…</p>
  if (failed) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo abrir el editor. Inténtalo de nuevo.
      </p>
    )
  }
  if (!technology || (editing && (!leccion || leccion.technologyId !== id))) {
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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {technology.name} · Administración
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
            disabled={deleteMutation.isPending}
            onClick={() => void remove()}
          >
            {deleteMutation.isPending ? 'Borrando…' : 'Borrar lección'}
          </Button>
        )}
      </header>

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
