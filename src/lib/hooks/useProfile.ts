import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { getProfile } from '@/lib/queries/profiles'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const query = useQuery({
    queryKey: [...queryKeys.profile, user?.id ?? 'anonymous'],
    queryFn: () => getProfile(user!.id),
    enabled: Boolean(user),
  })
  const role = query.data?.role ?? null

  return {
    ...query,
    role,
    isAdmin: role === 'admin',
    loading: authLoading || (Boolean(user) && query.isLoading),
  }
}
