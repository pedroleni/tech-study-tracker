import { ArrowLeft, Layers } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CommentsSection } from '@/components/comment/CommentsSection'
import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { BarraNavegacionLeccion } from '@/components/leccion/BarraNavegacionLeccion'
import { RielSecciones } from '@/components/leccion/RielSecciones'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLeccion } from '@/lib/hooks/useLeccion'
import { useLecciones } from '@/lib/hooks/useLecciones'
import { useProfile } from '@/lib/hooks/useProfile'
import { useTechnology } from '@/lib/hooks/useTechnologies'
import { dividirEnSecciones } from '@/lib/utils/dividirEnSecciones'

export function LeccionPage() {
  const { id = '', leccionSlug = '' } = useParams()
  const { isAdmin } = useProfile()
  const technologyQuery = useTechnology(id)
  const leccionQuery = useLeccion({ technologyId: id, slug: leccionSlug })
  const leccionesQuery = useLecciones(id)
  const technology = technologyQuery.data
  const leccion = leccionQuery.data
  const lecciones = leccionesQuery.data ?? []
  const loading = technologyQuery.isLoading || leccionQuery.isLoading
  const failed = technologyQuery.isError || leccionQuery.isError
  const secciones = useMemo(
    () => dividirEnSecciones(leccion?.contenido ?? ''),
    [leccion?.contenido],
  )
  const mostrarBarraNav =
    lecciones.filter((item) => item.status === 'publicado').length > 1

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
    <div className={mostrarBarraNav ? 'space-y-10 pb-16' : 'space-y-10'}>
      <div
        className={
          secciones.length > 0
            ? 'lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10'
            : ''
        }
      >
        {secciones.length > 0 && (
          <div className="hidden lg:block">
            <RielSecciones secciones={secciones} />
          </div>
        )}
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
                  <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Layers aria-hidden="true" className="size-3.5" />
                    {leccion.modulo}
                  </p>
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

          {!leccion.contenido.trim() ? (
            <Card>
              <p className="text-sm text-muted-foreground">
                Esta lección todavía no tiene contenido.
              </p>
            </Card>
          ) : secciones.length > 0 ? (
            <div className="space-y-6">
              {secciones.map((seccion, indice) => (
                <Card key={seccion.id} id={seccion.id} className="scroll-mt-28">
                  <div className="flex items-start gap-5">
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-4xl leading-none font-extrabold tabular-nums text-foreground/[0.14] dark:text-foreground/20"
                    >
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <h2 className="pt-1 text-xl font-bold tracking-tight text-balance">
                      {seccion.titulo}
                    </h2>
                  </div>
                  {seccion.cuerpo && (
                    <div className="mt-4">
                      <SafeMarkdown permitirLaboratorios>{seccion.cuerpo}</SafeMarkdown>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <SafeMarkdown permitirLaboratorios>{leccion.contenido}</SafeMarkdown>
            </Card>
          )}
        </article>
      </div>

      <CommentsSection leccionId={leccion.id} writable={writable} />

      <BarraNavegacionLeccion
        technologyId={technology.id}
        leccionActualId={leccion.id}
        lecciones={lecciones}
      />
    </div>
  )
}
