import { ArrowUpRight, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { technologyIcons } from '@/lib/icons/technologyIcons'
import type { Technology } from '@/types'

import { DifficultyBadge } from './DifficultyBadge'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

export function TechnologyCard({
  technology,
  showStatus = false,
}: {
  technology: Technology
  showStatus?: boolean
}) {
  const TechnologyIcon = technologyIcons[technology.icon ?? '']?.Icon ?? CircleHelp

  return (
    <Card className="flex h-full min-w-0 flex-col gap-4 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap gap-2">
        {showStatus && <StatusBadge status={technology.status} />}
        <DifficultyBadge difficulty={technology.difficulty} />
        <PriorityBadge priority={technology.priority} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="shrink-0 text-muted-foreground">
            <TechnologyIcon className="size-5" />
          </span>
          <h3 className="min-w-0 text-lg font-semibold text-balance">
            <Link
              to={`/tecnologias/${technology.id}`}
              className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {technology.name}
            </Link>
          </h3>
        </div>
        <p className="mt-2 line-clamp-3 break-words text-sm text-muted-foreground">
          {technology.notes.trim() || 'Esta ficha todavía no tiene resumen.'}
        </p>
      </div>
      <Link
        to={`/tecnologias/${technology.id}`}
        className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Leer ficha
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </Card>
  )
}
