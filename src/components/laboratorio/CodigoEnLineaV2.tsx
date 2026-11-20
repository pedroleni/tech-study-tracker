import { type ReactNode } from 'react'

export function CodigoEnLineaV2({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border bg-background px-1 py-px font-mono text-[0.85em]">
      {children}
    </code>
  )
}
