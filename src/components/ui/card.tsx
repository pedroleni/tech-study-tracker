import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('bg-card text-card-foreground rounded-xl border p-6 shadow-sm', className)} {...props} />
}

export { Card }
