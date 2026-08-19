import { supabase } from '@/lib/supabaseClient'
import type { Status, UserLeccionProgress, UserTechnologyProgress } from '@/types'

import { mapLeccionProgress, mapProgress, type ProgressPatch } from './mappers'

export async function getMyProgress(
  userId: string,
  technologyId: string,
): Promise<UserTechnologyProgress | null> {
  const { data, error } = await supabase
    .from('user_technology_progress')
    .select()
    .eq('user_id', userId)
    .eq('technology_id', technologyId)
    .maybeSingle()
  if (error) throw error
  return data ? mapProgress(data) : null
}

export async function upsertMyProgress(
  technologyId: string,
  patch: ProgressPatch,
): Promise<UserTechnologyProgress> {
  const { data, error } = await supabase.rpc('upsert_my_technology_progress', {
    p_technology_id: technologyId,
    p_status: patch.status ?? null,
    p_current_leccion_id: patch.currentLeccionId ?? null,
    p_update_current_leccion: patch.currentLeccionId !== undefined,
  })
  if (error) throw error
  return mapProgress(data)
}

export async function getMyLeccionesProgress(
  userId: string,
  leccionIds: string[],
): Promise<UserLeccionProgress[]> {
  if (leccionIds.length === 0) return []

  const { data, error } = await supabase
    .from('user_leccion_progress')
    .select()
    .eq('user_id', userId)
    .in('leccion_id', leccionIds)
  if (error) throw error
  return data.map(mapLeccionProgress)
}

export async function upsertMyLeccionProgress(
  leccionId: string,
  status: Status,
): Promise<UserLeccionProgress> {
  const { data, error } = await supabase.rpc('upsert_my_leccion_progress', {
    p_leccion_id: leccionId,
    p_status: status,
  })
  if (error) throw error
  return mapLeccionProgress(data)
}
