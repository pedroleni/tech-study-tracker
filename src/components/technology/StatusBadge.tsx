import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import type { Status } from '@/types'

const statusVariants = cva('inline-flex rounded-full px-2 py-1 text-xs font-medium', {
  variants: {
    status: {
      pendiente: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      completado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
  },
})

const labels: Record<Status, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return <span className={cn(statusVariants({ status }), className)}>{labels[status]}</span>
}
