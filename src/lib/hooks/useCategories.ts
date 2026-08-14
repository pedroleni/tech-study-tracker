import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
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
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, icon }: { name: string; icon: string | null }) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return createCategory(user.id, name, icon)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useRenameCategory() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, icon }: { id: string; name: string; icon: string | null }) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return renameCategory(id, name, icon)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return deleteCategory(id)
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        // Technologies are deleted by the category FK cascade.
        queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
      ]),
  })
}
