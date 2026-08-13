import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types'

import { mapCategory } from './mappers'

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select()
  if (error) throw error
  return data.map(mapCategory)
}

export async function createCategory(userId: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return mapCategory(data)
}

export async function renameCategory(id: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCategory(data)
}

export async function deleteCategory(id: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCategory(data)
}
