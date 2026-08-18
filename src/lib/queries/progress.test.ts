import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}))

import { getMyProgress, upsertMyProgress } from './progress'

const row = {
  id: 'progress-1',
  user_id: 'user-1',
  technology_id: 'technology-1',
  status: 'en_progreso' as const,
  current_leccion_id: 'leccion-1',
  created_at: '2026-08-18T10:00:00.000Z',
  updated_at: '2026-08-18T11:00:00.000Z',
}

function setup(result: { data: typeof row | null; error: Error | null } = { data: row, error: null }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const technologyEq = vi.fn().mockReturnValue({ maybeSingle })
  const userEq = vi.fn().mockReturnValue({ eq: technologyEq })
  const selectProgress = vi.fn().mockReturnValue({ eq: userEq })

  mocks.from.mockReturnValue({ select: selectProgress })
  mocks.rpc.mockResolvedValue(result)
  return { userEq, technologyEq }
}

describe('progress queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets only the active user progress and maps the row', async () => {
    const chain = setup()

    await expect(getMyProgress('user-1', 'technology-1')).resolves.toEqual({
      id: 'progress-1',
      userId: 'user-1',
      technologyId: 'technology-1',
      status: 'en_progreso',
      currentLeccionId: 'leccion-1',
      createdAt: '2026-08-18T10:00:00.000Z',
      updatedAt: '2026-08-18T11:00:00.000Z',
    })
    expect(chain.userEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(chain.technologyEq).toHaveBeenCalledWith('technology_id', 'technology-1')
  })

  it('returns null when the user has no progress row', async () => {
    setup({ data: null, error: null })

    await expect(getMyProgress('user-1', 'technology-1')).resolves.toBeNull()
  })

  it('uses the progress RPC with the exact allowlisted parameters', async () => {
    setup()

    await upsertMyProgress('technology-1', {
      status: 'completado',
      currentLeccionId: null,
    })

    expect(mocks.rpc).toHaveBeenCalledWith('upsert_my_technology_progress', {
      p_technology_id: 'technology-1',
      p_status: 'completado',
      p_current_leccion_id: null,
      p_update_current_leccion: true,
    })
  })

  it('propagates Supabase errors', async () => {
    const error = new Error('RLS rejected the progress write')
    setup({ data: null, error })

    await expect(
      upsertMyProgress('draft-technology', { status: 'pendiente' }),
    ).rejects.toBe(error)
  })
})
