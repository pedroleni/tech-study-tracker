import { supabase } from '@/lib/supabaseClient'
import type { Favorite } from '@/types'

import { mapFavorite } from './mappers'

export async function listFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapFavorite)
}

export async function addFavorite(
  userId: string,
  technologyId: string,
): Promise<Favorite> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, technology_id: technologyId })
    .select()
    .single()
  if (error) throw error
  return mapFavorite(data)
}

export async function removeFavorite(id: string): Promise<Favorite> {
  const { data, error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapFavorite(data)
}
