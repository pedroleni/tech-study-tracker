import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
import type { NewTechnologyInput, TechnologyPatch } from '@/lib/queries/mappers'
import { queryKeys } from '@/lib/queries/queryKeys'
import {
  createTechnology,
  deleteTechnology,
  getTechnology,
  listTechnologies,
  updateTechnology,
} from '@/lib/queries/technologies'

export function useTechnologies() {
  const { user, loading } = useAuth()
  return useQuery({
    queryKey: queryKeys.technologiesForViewer(user?.id ?? null),
    queryFn: listTechnologies,
    enabled: !loading,
  })
}

export function useTechnology(id: string) {
  const { user, loading } = useAuth()
  return useQuery({
    queryKey: queryKeys.technology(user?.id ?? null, id),
    queryFn: () => getTechnology(id),
    enabled: !loading && Boolean(id),
  })
}

export function useCreateTechnology() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewTechnologyInput) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return createTechnology(user.id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}

export function useUpdateTechnology() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TechnologyPatch }) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return updateTechnology(id, patch)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}

export function useDeleteTechnology() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return deleteTechnology(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}
