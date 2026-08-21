import { supabase } from '@/lib/supabaseClient'
import type { Leccion } from '@/types'

import { mapLeccion } from './mappers'
import type { LeccionPatch, NewLeccionInput } from './mappers'

export type LeccionLookup =
  | { id: string; technologyId?: never; slug?: never }
  | { id?: never; technologyId: string; slug: string }

function toNewLeccionPayload(input: NewLeccionInput) {
  return {
    technology_id: input.technologyId,
    slug: input.slug,
    modulo: input.modulo,
    titulo: input.titulo,
    resumen: input.resumen,
    contenido: input.contenido,
    orden: input.orden,
  }
}

function toLeccionPatch(patch: LeccionPatch) {
  return {
    ...(patch.slug !== undefined && { slug: patch.slug }),
    ...(patch.modulo !== undefined && { modulo: patch.modulo }),
    ...(patch.titulo !== undefined && { titulo: patch.titulo }),
    ...(patch.resumen !== undefined && { resumen: patch.resumen }),
    ...(patch.contenido !== undefined && { contenido: patch.contenido }),
    ...(patch.orden !== undefined && { orden: patch.orden }),
    ...(patch.status !== undefined && { status: patch.status }),
  }
}

export async function listLecciones(technologyId: string): Promise<Leccion[]> {
  const { data, error } = await supabase
    .from('lecciones')
    .select()
    .eq('technology_id', technologyId)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(mapLeccion)
}

export async function getLeccion(lookup: LeccionLookup): Promise<Leccion | null> {
  const query = supabase.from('lecciones').select()
  const { data, error } =
    'id' in lookup && lookup.id
      ? await query.eq('id', lookup.id).maybeSingle()
      : await query
          .eq('technology_id', lookup.technologyId)
          .eq('slug', lookup.slug)
          .maybeSingle()
  if (error) throw error
  return data ? mapLeccion(data) : null
}

export async function createLeccion(input: NewLeccionInput): Promise<Leccion> {
  const { data, error } = await supabase
    .from('lecciones')
    .insert(toNewLeccionPayload(input))
    .select()
    .single()
  if (error) throw error
  return mapLeccion(data)
}

export async function updateLeccion(
  id: string,
  patch: LeccionPatch,
): Promise<Leccion> {
  const { data, error } = await supabase
    .from('lecciones')
    .update(toLeccionPatch(patch))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapLeccion(data)
}

export async function deleteLeccion(id: string): Promise<Leccion> {
  const { data, error } = await supabase
    .from('lecciones')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapLeccion(data)
}
