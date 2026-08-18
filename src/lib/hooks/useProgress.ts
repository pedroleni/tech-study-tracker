import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import type { ProgressPatch } from '@/lib/queries/mappers'
import { getMyProgress, upsertMyProgress } from '@/lib/queries/progress'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useMyProgress(technologyId: string) {
  const { user, loading } = useAuth()

  return useQuery({
    queryKey: queryKeys.myProgress(user?.id ?? 'anonymous', technologyId),
    queryFn: () => getMyProgress(user!.id, technologyId),
    enabled: !loading && Boolean(user && technologyId),
  })
}

export function useSetMyProgress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ technologyId, patch }: { technologyId: string; patch: ProgressPatch }) => {
      if (!user) throw new Error('Inicia sesión para guardar tu progreso.')
      return upsertMyProgress(technologyId, patch)
    },
    onSuccess: (progress) =>
      queryClient.setQueryData(
        queryKeys.myProgress(progress.userId, progress.technologyId),
        progress,
      ),
  })
}
