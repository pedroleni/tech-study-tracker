import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorityVariants = cva('inline-flex rounded-full px-2 py-1 text-xs font-medium', {
  variants: {
    priority: {
      baja: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
  },
})

const labels: Record<Priority, string> = {
  baja: 'Prioridad baja',
  media: 'Prioridad media',
  alta: 'Prioridad alta',
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority
  className?: string
}) {
  return (
    <span className={cn(priorityVariants({ priority }), className)}>{labels[priority]}</span>
  )
}
