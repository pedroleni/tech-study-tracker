import type { Difficulty, Priority, Status } from '@/types'

export const difficultyLabels: Record<Difficulty, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
}

export const priorityLabels: Record<Priority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

export const statusLabels: Record<Status, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
}
