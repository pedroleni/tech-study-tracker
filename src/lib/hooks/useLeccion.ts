import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { getLeccion } from '@/lib/queries/lecciones'
import type { LeccionLookup } from '@/lib/queries/lecciones'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useLeccion(lookup: LeccionLookup) {
  const { user, loading } = useAuth()
  const viewerId = user?.id ?? null
  const byId = 'id' in lookup && Boolean(lookup.id)

  return useQuery({
    queryKey: byId
      ? queryKeys.leccionById(viewerId, lookup.id ?? '')
      : queryKeys.leccionBySlug(viewerId, lookup.technologyId ?? '', lookup.slug ?? ''),
    queryFn: () => getLeccion(lookup),
    enabled:
      !loading &&
      (byId ? Boolean(lookup.id) : Boolean(lookup.technologyId && lookup.slug)),
  })
}
