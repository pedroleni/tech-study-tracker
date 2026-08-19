import { useId, useState } from 'react'
import { Code2 } from 'lucide-react'

export interface ItemGaleriaMiniaturas {
  titulo: string
  descripcion: string
  codigo: string
}

export interface PropiedadesGaleriaMiniaturas {
  items: ItemGaleriaMiniaturas[]
  etiqueta?: string
}

export function GaleriaMiniaturas({
  items,
  etiqueta = 'Galería de ejemplos HTML',
}: PropiedadesGaleriaMiniaturas) {
  const [activo, setActivo] = useState(0)
  const idBase = useId()

  if (items.length === 0) return null
  const item = items[Math.min(activo, items.length - 1)]

  return (
    <section aria-label={etiqueta} className="grid gap-4 md:grid-cols-[11rem_1fr]">
      <div className="flex gap-2 overflow-x-auto md:flex-col" role="tablist" aria-label="Ejemplos disponibles">
        {items.map((opcion, indice) => (
          <button
            key={`${opcion.titulo}-${indice}`}
            type="button"
            role="tab"
            id={`${idBase}-tab-${indice}`}
            aria-controls={`${idBase}-panel`}
            aria-selected={activo === indice}
            onClick={() => setActivo(indice)}
            className={`min-h-11 min-w-36 touch-manipulation rounded-lg border px-3 py-2 text-left text-sm transition-[background-color,border-color,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none md:min-w-0 ${
              activo === indice
                ? 'border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40'
                : 'bg-card hover:bg-muted'
            }`}
          >
            <span className="font-medium">{opcion.titulo}</span>
            <span className="mt-1 block truncate font-mono text-xs text-muted-foreground" translate="no">
              {opcion.codigo}
            </span>
          </button>
        ))}
      </div>
      <div
        key={item.titulo}
        id={`${idBase}-panel`}
        role="tabpanel"
        aria-labelledby={`${idBase}-tab-${activo}`}
        className="animate-in fade-in-0 zoom-in-95 min-w-0 rounded-xl border bg-card p-5 shadow-sm duration-300 motion-reduce:animate-none"
      >
        <Code2 aria-hidden="true" className="size-6 text-teal-600 dark:text-teal-400" />
        <h3 className="mt-4 text-xl font-semibold text-balance">{item.titulo}</h3>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{item.descripcion}</p>
        <code className="mt-5 block overflow-x-auto rounded-lg bg-muted p-3 text-sm" translate="no">
          {item.codigo}
        </code>
      </div>
    </section>
  )
}
