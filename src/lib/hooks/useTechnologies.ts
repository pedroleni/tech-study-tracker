import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
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
  return useQuery({ queryKey: queryKeys.technologies, queryFn: listTechnologies })
}

export function useTechnology(id: string) {
  return useQuery({
    queryKey: [...queryKeys.technologies, id],
    queryFn: () => getTechnology(id),
  })
}

export function useCreateTechnology() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewTechnologyInput) => {
      if (!user) throw new Error('No hay sesión activa.')
      return createTechnology(user.id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}

export function useUpdateTechnology() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TechnologyPatch }) =>
      updateTechnology(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}

export function useDeleteTechnology() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTechnology(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.technologies }),
  })
}
