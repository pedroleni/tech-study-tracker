import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { CommentsSection } from '@/components/comment/CommentsSection'
import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLeccion } from '@/lib/hooks/useLeccion'
import { useProfile } from '@/lib/hooks/useProfile'
import { useTechnology } from '@/lib/hooks/useTechnologies'

export function LeccionPage() {
  const { id = '', leccionSlug = '' } = useParams()
  const { isAdmin } = useProfile()
  const technologyQuery = useTechnology(id)
  const leccionQuery = useLeccion({ technologyId: id, slug: leccionSlug })
  const technology = technologyQuery.data
  const leccion = leccionQuery.data
  const loading = technologyQuery.isLoading || leccionQuery.isLoading
  const failed = technologyQuery.isError || leccionQuery.isError

  if (loading) return <p role="status">Cargando lección…</p>
  if (failed) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo cargar la lección. Inténtalo de nuevo.
      </p>
    )
  }
  if (!technology || !leccion) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Lección no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Puede que no exista o todavía no esté publicada.
        </p>
        <Link to={`/tecnologias/${id}`} className="font-medium underline underline-offset-4">
          Volver a la tecnología
        </Link>
      </Card>
    )
  }

  const writable =
    technology.status === 'completado' && leccion.status === 'publicado'

  return (
    <div className="space-y-10">
      <article className="space-y-8">
        <header className="space-y-4">
          <Link
            to={`/tecnologias/${technology.id}`}
            className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver a {technology.name}
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              {leccion.modulo && (
                <p className="text-sm font-medium text-muted-foreground">{leccion.modulo}</p>
              )}
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {leccion.titulo}
              </h1>
              {leccion.resumen && (
                <p className="max-w-3xl text-base text-pretty text-muted-foreground">
                  {leccion.resumen}
                </p>
              )}
            </div>
            {isAdmin && (
              <Button asChild variant="outline">
                <Link
                  to={`/admin/tecnologias/${technology.id}/lecciones/${leccion.id}/editar`}
                >
                  Editar lección
                </Link>
              </Button>
            )}
          </div>
          {leccion.status === 'borrador' && (
            <p className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Borrador · solo visible para administración
            </p>
          )}
        </header>

        <Card>
          {leccion.contenido.trim() ? (
            <SafeMarkdown>{leccion.contenido}</SafeMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta lección todavía no tiene contenido.
            </p>
          )}
        </Card>
      </article>

      <CommentsSection leccionId={leccion.id} writable={writable} />
    </div>
  )
}
