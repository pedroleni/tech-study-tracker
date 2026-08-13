import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from '@/lib/queries/categories'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: listCategories })
}

export function useCreateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => {
      if (!user) throw new Error('No hay sesión activa.')
      return createCategory(user.id, name)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useRenameCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCategory(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}
