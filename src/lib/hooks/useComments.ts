import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/hooks/useAuth'
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '@/lib/queries/comments'
import type { NewCommentInput } from '@/lib/queries/mappers'
import { queryKeys } from '@/lib/queries/queryKeys'

export function useComments(technologyId: string) {
  return useQuery({
    queryKey: queryKeys.comments(technologyId),
    queryFn: () => listComments(technologyId),
    enabled: Boolean(technologyId),
  })
}

export function useCreateComment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewCommentInput) => {
      if (!user) throw new Error('Inicia sesión para comentar.')
      return createComment(user.id, input)
    },
    onSuccess: (comment) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(comment.technologyId) }),
  })
}

export function useUpdateComment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string; technologyId: string }) => {
      if (!user) throw new Error('Inicia sesión para editar el comentario.')
      return updateComment(id, body)
    },
    onSuccess: (comment) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(comment.technologyId) }),
  })
}

export function useDeleteComment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; technologyId: string }) => {
      if (!user) throw new Error('Inicia sesión para borrar el comentario.')
      return deleteComment(id)
    },
    onSuccess: (comment) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(comment.technologyId) }),
  })
}
