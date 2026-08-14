import { supabase } from '@/lib/supabaseClient'
import type { Technology } from '@/types'

import { mapTechnology } from './mappers'
import type { NewTechnologyInput, TechnologyPatch } from './mappers'

function toTechnologyPayload(input: NewTechnologyInput | TechnologyPatch) {
  return {
    ...(input.categoryId !== undefined && { category_id: input.categoryId }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.icon !== undefined && { icon: input.icon }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.resources !== undefined && { resources: input.resources }),
  }
}

export async function listTechnologies(): Promise<Technology[]> {
  const { data, error } = await supabase.from('technologies').select()
  if (error) throw error
  return data.map(mapTechnology)
}

export async function getTechnology(id: string): Promise<Technology | null> {
  const { data, error } = await supabase
    .from('technologies')
    .select()
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? mapTechnology(data) : null
}

export async function createTechnology(
  userId: string,
  input: NewTechnologyInput,
): Promise<Technology> {
  const { data, error } = await supabase
    .from('technologies')
    .insert({ user_id: userId, ...toTechnologyPayload(input) })
    .select()
    .single()
  if (error) throw error
  return mapTechnology(data)
}

export async function updateTechnology(
  id: string,
  patch: TechnologyPatch,
): Promise<Technology> {
  const { data, error } = await supabase
    .from('technologies')
    .update(toTechnologyPayload(patch))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTechnology(data)
}

export async function deleteTechnology(id: string): Promise<Technology> {
  const { data, error } = await supabase
    .from('technologies')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTechnology(data)
}
