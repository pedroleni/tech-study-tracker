import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types'

import { mapProfile } from './mappers'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? mapProfile(data) : null
}
