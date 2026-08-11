export type Status = 'pendiente' | 'en_progreso' | 'completado'
export type Priority = 'alta' | 'media' | 'baja'
export type Difficulty = 'facil' | 'media' | 'dificil'

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
  status: Status
  priority: Priority
  difficulty: Difficulty
  notes: string
  resources: Resource[]
  createdAt: string
  updatedAt: string
}
