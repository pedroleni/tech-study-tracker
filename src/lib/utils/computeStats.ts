import type { Status, Technology } from '@/types'

export type TechnologyStats = Record<Status, number> & { total: number }

export function computeStats(technologies: Technology[]): TechnologyStats {
  return technologies.reduce<TechnologyStats>(
    (stats, technology) => {
      stats[technology.status] += 1
      stats.total += 1

      return stats
    },
    {
      pendiente: 0,
      en_progreso: 0,
      completado: 0,
      total: 0,
    },
  )
}
