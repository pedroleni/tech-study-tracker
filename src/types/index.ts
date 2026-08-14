export type Status = 'pendiente' | 'en_progreso' | 'completado'
export type Priority = 'alta' | 'media' | 'baja'
export type Difficulty = 'facil' | 'media' | 'dificil'
export type ProfileRole = 'user' | 'admin'
export type LeccionStatus = 'borrador' | 'publicado'

export interface Resource {
  label: string
  url: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Technology {
  id: string
  categoryId: string
  name: string
  /** `completado` also means the technology is publicly visible. */
  status: Status
  priority: Priority
  difficulty: Difficulty
  notes: string
  resources: Resource[]
  createdAt: string
  updatedAt: string
}

export interface Leccion {
  id: string
  technologyId: string
  slug: string
  modulo: string | null
  titulo: string
  resumen: string
  contenido: string
  orden: number
  status: LeccionStatus
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  role: ProfileRole
  createdAt: string
}

export interface Comment {
  id: string
  leccionId: string
  userId: string
  parentCommentId: string | null
  body: string
  createdAt: string
  updatedAt: string
}

export interface Favorite {
  id: string
  userId: string
  technologyId: string
  createdAt: string
}
