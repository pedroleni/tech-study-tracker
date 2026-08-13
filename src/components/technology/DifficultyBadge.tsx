import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import type { Difficulty } from '@/types'

const difficultyVariants = cva('inline-flex rounded-full px-2 py-1 text-xs font-medium', {
  variants: {
    difficulty: {
      facil: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      dificil: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
  },
})

const labels: Record<Difficulty, string> = {
  facil: 'Dificultad fácil',
  media: 'Dificultad media',
  dificil: 'Dificultad difícil',
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  return (
    <span className={cn(difficultyVariants({ difficulty }), className)}>
      {labels[difficulty]}
    </span>
  )
}
