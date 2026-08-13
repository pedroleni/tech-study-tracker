import type { Comment } from '@/types'

export interface CommentThread {
  comment: Comment
  replies: Comment[]
}

export function groupComments(comments: Comment[]): CommentThread[] {
  const roots = comments
    .filter((comment) => comment.parentCommentId === null)
    .map((comment) => ({ comment, replies: [] as Comment[] }))
  const rootsById = new Map(roots.map((thread) => [thread.comment.id, thread]))

  for (const comment of comments) {
    if (comment.parentCommentId) {
      rootsById.get(comment.parentCommentId)?.replies.push(comment)
    }
  }

  return roots
}
