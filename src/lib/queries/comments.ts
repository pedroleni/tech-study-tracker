import { supabase } from '@/lib/supabaseClient'
import type { Comment } from '@/types'

import { mapComment } from './mappers'
import type { NewCommentInput } from './mappers'

function validateCommentBody(body: string) {
  const length = body.trim().length
  if (length < 1 || length > 2000) {
    throw new Error('El comentario debe tener entre 1 y 2000 caracteres.')
  }
}

export async function listComments(leccionId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select()
    .eq('leccion_id', leccionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(mapComment)
}

export async function createComment(
  userId: string,
  input: NewCommentInput,
): Promise<Comment> {
  validateCommentBody(input.body)
  const { data, error } = await supabase
    .from('comments')
    .insert({
      leccion_id: input.leccionId,
      user_id: userId,
      parent_comment_id: input.parentCommentId ?? null,
      body: input.body,
    })
    .select()
    .single()
  if (error) throw error
  return mapComment(data)
}

export async function updateComment(id: string, body: string): Promise<Comment> {
  validateCommentBody(body)
  const { data, error } = await supabase
    .from('comments')
    .update({ body })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapComment(data)
}

export async function deleteComment(id: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapComment(data)
}
