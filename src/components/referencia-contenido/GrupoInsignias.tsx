import { Tags } from 'lucide-react'

export interface PropiedadesGrupoInsignias {
  etiquetas: string[]
  ariaLabel?: string
}

export function GrupoInsignias({
  etiquetas,
  ariaLabel = 'Etiquetas relacionadas',
}: PropiedadesGrupoInsignias) {
  if (etiquetas.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={ariaLabel}>
      <Tags aria-hidden="true" className="mr-1 size-4 text-muted-foreground" />
      {etiquetas.map((etiqueta, indice) => (
        <span
          key={`${etiqueta}-${indice}`}
          className="animate-in fade-in-0 zoom-in-95 rounded-full border bg-muted px-3 py-1 text-xs font-medium duration-300 motion-reduce:animate-none"
          style={{ animationDelay: `${indice * 70}ms`, animationFillMode: 'both' }}
        >
          {etiqueta}
        </span>
      ))}
    </div>
  )
}
