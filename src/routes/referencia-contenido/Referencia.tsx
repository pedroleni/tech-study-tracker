import type { ReactNode } from 'react'

interface PropiedadesReferencia {
  nombre: string
  children: ReactNode
}

export function Referencia({ nombre, children }: PropiedadesReferencia) {
  const tituloId = `referencia-${nombre.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section aria-labelledby={tituloId} className="scroll-mt-6 space-y-3">
      <h3 id={tituloId} className="font-mono text-xs font-semibold text-muted-foreground">
        {nombre}.tsx
      </h3>
      {children}
    </section>
  )
}
