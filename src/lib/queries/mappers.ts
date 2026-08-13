import type { Category, Technology } from '@/types'

// Fila cruda tal como la devuelve Supabase (snake_case, sin validar).
interface CategoryRow {
  id: string
  name: string
  created_at: string
}

interface TechnologyRow {
  id: string
  category_id: string
  name: string
  status: Technology['status']
  priority: Technology['priority']
  difficulty: Technology['difficulty']
  notes: string
  resources: Technology['resources']
  created_at: string
  updated_at: string
}

export function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, createdAt: row.created_at }
}

export function mapTechnology(row: TechnologyRow): Technology {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    status: row.status,
    priority: row.priority,
    difficulty: row.difficulty,
    notes: row.notes,
    resources: row.resources,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export type NewCategoryInput = Pick<Category, 'name'>
export type CategoryPatch = Pick<Category, 'name'>

export type NewTechnologyInput = Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>

export type TechnologyPatch = Partial<
  Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>
>
