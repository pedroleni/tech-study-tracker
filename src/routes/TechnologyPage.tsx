import { Link, useParams } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLecciones } from '@/lib/hooks/useLecciones'
import {
  useMyLeccionesProgress,
  useMyProgress,
  useSetMyLeccionProgress,
} from '@/lib/hooks/useProgress'
import { useProfile } from '@/lib/hooks/useProfile'
import { useTechnology } from '@/lib/hooks/useTechnologies'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'
import { ContenidoFichaTecnologia } from '@/routes/ficha-tecnologia/ContenidoFichaTecnologia'
import type { Status, UserLeccionProgress } from '@/types'

function crearMapaProgreso(
  publishedLeccionIds: string[],
  progressItems?: UserLeccionProgress[],
) {
  const progressById = new Map<string, Status>(
    publishedLeccionIds.map((leccionId) => [leccionId, 'pendiente']),
  )
  progressItems?.forEach((progress) => {
    if (progressById.has(progress.leccionId)) {
      progressById.set(progress.leccionId, progress.status)
    }
  })
  return progressById
}

function obtenerProgresoPendiente(
  isPending: boolean,
  variables?: { leccionId: string; status: Status },
) {
  if (!isPending) return {}
  return {
    pendingLeccionId: variables?.leccionId,
    pendingStatus: variables?.status,
  }
}

export function TechnologyPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const technologyQuery = useTechnology(id)
  const leccionesQuery = useLecciones(id)
  const progressQuery = useMyProgress(id)
  const technology = technologyQuery.data
  const publishedLecciones = (leccionesQuery.data ?? []).filter(
    (leccion) => leccion.status === 'publicado',
  )
  const publishedLeccionIds = publishedLecciones.map((leccion) => leccion.id)
  const leccionesProgressQuery = useMyLeccionesProgress(
    technology?.id ?? '',
    publishedLeccionIds,
  )
  const setLeccionProgressMutation = useSetMyLeccionProgress()
  const leccionProgressById = crearMapaProgreso(
    publishedLeccionIds,
    leccionesProgressQuery.data,
  )

  if (technologyQuery.isLoading || leccionesQuery.isLoading) {
    return <p role="status">Cargando ficha…</p>
  }
  if (technologyQuery.isError || leccionesQuery.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudo cargar la ficha. Inténtalo de nuevo.
      </p>
    )
  }
  if (!technology) {
    return (
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Ficha no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Puede que no exista o todavía no esté publicada.
        </p>
        <Link to="/" className="inline-flex font-medium underline underline-offset-4">
          Volver al inicio
        </Link>
      </Card>
    )
  }

  const safeResources = technology.resources.filter((resource) =>
    validateResourceUrl(resource.url),
  )
  const { pendingLeccionId, pendingStatus } = obtenerProgresoPendiente(
    setLeccionProgressMutation.isPending,
    setLeccionProgressMutation.variables,
  )

  return (
    <ContenidoFichaTecnologia
      technology={technology}
      lecciones={leccionesQuery.data ?? []}
      safeResources={safeResources}
      isAdmin={isAdmin}
      haySesion={Boolean(user)}
      publishedLeccionIds={publishedLeccionIds}
      leccionProgressById={leccionProgressById}
      currentLeccionId={progressQuery.data?.currentLeccionId}
      pendingLeccionId={pendingLeccionId}
      pendingStatus={pendingStatus}
      onCambiarProgreso={(leccionId, status) =>
        setLeccionProgressMutation.mutate({
          leccionId,
          technologyId: technology.id,
          status,
        })
      }
    />
  )
}
