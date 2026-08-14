import { Link, useNavigate, useParams } from 'react-router-dom'

import { LeccionForm } from '@/components/leccion/LeccionForm'
import type { LeccionFormValues } from '@/components/leccion/LeccionForm'
import { Card } from '@/components/ui/card'
import { useLeccion } from '@/lib/hooks/useLeccion'
import { useCreateLeccion, useUpdateLeccion } from '@/lib/hooks/useLecciones'
import { useTechnology } from '@/lib/hooks/useTechnologies'

export function AdminLeccionFormPage() {
  const { id = '', leccionId } = useParams()
  const editing = Boolean(leccionId)
  const navigate = useNavigate()
  const technologyQuery = useTechnology(id)
  const leccionQuery = useLeccion({ id: leccionId ?? '' })
  const createMutation = useCreateLeccion()
  const updateMutation = useUpdateLeccion()
  const technology = technologyQuery.data
  const leccion = leccionQuery.data

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
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {technology.name} · Administración
        </p>
        <h1
          id="leccion-form-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          {editing ? 'Editar lección' : 'Nueva lección'}
        </h1>
      </header>

      <Card>
        <LeccionForm
          leccion={leccion ?? undefined}
          pending={createMutation.isPending || updateMutation.isPending}
          onSubmit={save}
        />
      </Card>
    </section>
  )
}
