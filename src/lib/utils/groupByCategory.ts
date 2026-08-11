import type { Technology } from '@/types'

export function groupByCategory(
  technologies: Technology[],
): Record<string, Technology[]> {
  return technologies.reduce<Record<string, Technology[]>>(
    (groupedTechnologies, technology) => {
      const categoryTechnologies = groupedTechnologies[technology.categoryId]

      if (categoryTechnologies) {
        categoryTechnologies.push(technology)
      } else {
        groupedTechnologies[technology.categoryId] = [technology]
      }

      return groupedTechnologies
    },
    {},
  )
}
