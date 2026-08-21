import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
import type { LeccionPatch, NewLeccionInput } from '@/lib/queries/mappers'
import { queryKeys } from '@/lib/queries/queryKeys'
import {
  createLeccion,
  deleteLeccion,
  listLecciones,
  updateLeccion,
} from '@/lib/queries/lecciones'

export function useLecciones(technologyId: string) {
  const { user, loading } = useAuth()
  return useQuery({
    queryKey: queryKeys.leccionesForTechnology(user?.id ?? null, technologyId),
    queryFn: () => listLecciones(technologyId),
    enabled: !loading && Boolean(technologyId),
  })
}

export function useCreateLeccion() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewLeccionInput) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return createLeccion(input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.lecciones }),
  })
}

export function useUpdateLeccion() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: LeccionPatch }) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return updateLeccion(id, patch)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.lecciones }),
  })
}

export function useDeleteLeccion() {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('No hay sesión activa.')
      if (!isAdmin) throw new Error('Solo el administrador puede gestionar contenido.')
      return deleteLeccion(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.lecciones }),
  })
}
