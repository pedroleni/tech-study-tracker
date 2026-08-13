import { describe, expect, it } from 'vitest'

import type { Comment } from '@/types'

import { groupComments } from './groupComments'

function comment(id: string, parentCommentId: string | null): Comment {
  return {
    id,
    technologyId: 'technology-1',
    userId: `user-${id}`,
    parentCommentId,
    body: id,
    createdAt: `2026-08-13T10:00:0${id.length}.000Z`,
    updatedAt: `2026-08-13T10:00:0${id.length}.000Z`,
  }
}

describe('groupComments', () => {
  it('groups one reply level under each root while preserving order', () => {
    const rootA = comment('root-a', null)
    const replyA1 = comment('reply-a-1', rootA.id)
    const rootB = comment('root-b', null)
    const replyA2 = comment('reply-a-2', rootA.id)

    expect(groupComments([rootA, replyA1, rootB, replyA2])).toEqual([
      { comment: rootA, replies: [replyA1, replyA2] },
      { comment: rootB, replies: [] },
    ])
  })

  it('does not promote an orphaned reply to a root comment', () => {
    expect(groupComments([comment('orphan', 'missing-root')])).toEqual([])
  })
})
