import { ArrowUpRight, CircleHelp } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { technologyBrandColors } from '@/lib/icons/technologyBrandColors'
import { technologyIcons } from '@/lib/icons/technologyIcons'
import { cn } from '@/lib/utils'
import type { Technology } from '@/types'

import { difficultyLabels, priorityLabels, statusLabels } from './labels'

interface TechnologyBrandPresentation {
  Icon: ComponentType<{ className?: string }>
  backgroundClassName: string
  brandHex?: string
  foregroundClassName: string
  glassClassName: string
}

function getTechnologyBrandPresentation(
  iconKey: string | null | undefined,
): TechnologyBrandPresentation {
  const brand = technologyBrandColors[iconKey ?? '']
  const Icon = technologyIcons[iconKey ?? '']?.Icon ?? CircleHelp

  if (!brand) {
    return {
      Icon,
      backgroundClassName: 'bg-muted',
      foregroundClassName: 'text-muted-foreground',
      glassClassName:
        'border-border bg-background/60 text-muted-foreground backdrop-blur-sm',
    }
  }

  const usesDarkTone = brand.iconTone === 'dark'

  return {
    Icon,
    brandHex: brand.hex,
    backgroundClassName: '',
    foregroundClassName: usesDarkTone ? 'text-neutral-900' : 'text-white',
    glassClassName: usesDarkTone
      ? 'border-black/15 bg-black/10 text-neutral-900 backdrop-blur-sm'
      : 'border-white/30 bg-white/15 text-white backdrop-blur-sm',
  }
}

export function TechnologyBrand({
  iconKey,
  children,
}: {
  iconKey: string | null | undefined
  children: (brand: TechnologyBrandPresentation) => ReactNode
}) {
  return children(getTechnologyBrandPresentation(iconKey))
}

export function TechnologyCard({
  technology,
  showStatus = false,
}: {
  technology: Technology
  showStatus?: boolean
}) {
  return (
    <TechnologyBrand iconKey={technology.icon}>
      {(brand) => (
        <Card className="group flex h-full min-w-0 flex-col gap-0 overflow-hidden p-0 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          <div
            className={cn(
              'relative isolate h-[8.75rem] overflow-hidden rounded-t-xl',
              brand.backgroundClassName,
              brand.foregroundClassName,
            )}
            style={brand.brandHex ? { backgroundColor: brand.brandHex } : undefined}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-8 opacity-[0.14]"
            >
              <brand.Icon className="size-36" />
            </span>
            <span
              aria-hidden="true"
              className="relative z-10 flex h-full items-center px-6 sm:px-8"
            >
              <brand.Icon className="size-14" />
            </span>
            <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2">
              {showStatus && (
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    brand.glassClassName,
                  )}
                >
                  {statusLabels[technology.status]}
                </span>
              )}
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  brand.glassClassName,
                )}
              >
                {difficultyLabels[technology.difficulty]}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  brand.glassClassName,
                )}
              >
                {priorityLabels[technology.priority]}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="min-w-0 flex-1">
              <h3 className="min-w-0 break-words text-xl font-bold text-balance">
                <Link
                  to={`/tecnologias/${technology.id}`}
                  className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {technology.name}
                </Link>
              </h3>
              <p className="mt-2 break-words text-sm text-muted-foreground">
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
          </div>
        </Card>
      )}
    </TechnologyBrand>
  )
}
