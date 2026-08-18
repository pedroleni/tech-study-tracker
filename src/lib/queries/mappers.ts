import type {
  Category,
  Comment,
  Favorite,
  Leccion,
  Profile,
  Technology,
  UserTechnologyProgress,
} from '@/types'

// Fila cruda tal como la devuelve Supabase (snake_case, sin validar).
interface CategoryRow {
  id: string
  name: string
  icon: string | null
  created_at: string
}

interface TechnologyRow {
  id: string
  category_id: string
  name: string
  icon: string | null
  status: Technology['status']
  priority: Technology['priority']
  difficulty: Technology['difficulty']
  notes: string
  resources: Technology['resources']
  created_at: string
  updated_at: string
}

interface LeccionRow {
  id: string
  technology_id: string
  slug: string
  modulo: string | null
  titulo: string
  resumen: string
  contenido: string
  orden: number
  status: Leccion['status']
  created_at: string
  updated_at: string
}

interface ProfileRow {
  id: string
  role: Profile['role']
  created_at: string
}

interface CommentRow {
  id: string
  leccion_id: string
  user_id: string
  parent_comment_id: string | null
  body: string
  created_at: string
  updated_at: string
}

interface FavoriteRow {
  id: string
  user_id: string
  technology_id: string
  created_at: string
}

export interface ProgressRow {
  id: string
  user_id: string
  technology_id: string
  status: UserTechnologyProgress['status']
  current_leccion_id: string | null
  created_at: string
  updated_at: string
}

export function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, icon: row.icon, createdAt: row.created_at }
}

export function mapTechnology(row: TechnologyRow): Technology {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    icon: row.icon,
    status: row.status,
    priority: row.priority,
    difficulty: row.difficulty,
    notes: row.notes,
    resources: row.resources,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLeccion(row: LeccionRow): Leccion {
  return {
    id: row.id,
    technologyId: row.technology_id,
    slug: row.slug,
    modulo: row.modulo,
    titulo: row.titulo,
    resumen: row.resumen,
    contenido: row.contenido,
    orden: row.orden,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapProfile(row: ProfileRow): Profile {
  return { id: row.id, role: row.role, createdAt: row.created_at }
}

export function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    leccionId: row.leccion_id,
    userId: row.user_id,
    parentCommentId: row.parent_comment_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    technologyId: row.technology_id,
    createdAt: row.created_at,
  }
}

export function mapProgress(row: ProgressRow): UserTechnologyProgress {
  return {
    id: row.id,
    userId: row.user_id,
    technologyId: row.technology_id,
    status: row.status,
    currentLeccionId: row.current_leccion_id,
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

export type NewLeccionInput = Pick<
  Leccion,
  'technologyId' | 'slug' | 'modulo' | 'titulo' | 'resumen' | 'contenido' | 'orden'
>

export type LeccionPatch = Partial<
  Pick<Leccion, 'slug' | 'modulo' | 'titulo' | 'resumen' | 'contenido' | 'orden' | 'status'>
>

export interface NewCommentInput {
  leccionId: string
  parentCommentId?: string | null
  body: string
}

export type ProgressPatch = Partial<
  Pick<UserTechnologyProgress, 'status' | 'currentLeccionId'>
>
