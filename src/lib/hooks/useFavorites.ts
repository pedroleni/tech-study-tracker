import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { addFavorite, listFavorites, removeFavorite } from '@/lib/queries/favorites'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useFavorites() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...queryKeys.favorites, user?.id ?? 'anonymous'],
    queryFn: () => listFavorites(user!.id),
    enabled: Boolean(user),
  })
}

export function useAddFavorite() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (technologyId: string) => {
      if (!user) throw new Error('Inicia sesión para guardar favoritos.')
      return addFavorite(user.id, technologyId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  })
}

export function useRemoveFavorite() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('Inicia sesión para quitar favoritos.')
      return removeFavorite(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  })
}
