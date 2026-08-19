import { useId, useState } from 'react'
import { Lightbulb, Plus } from 'lucide-react'

export interface PropiedadesTarjetaExpandible {
  titulo: string
  resumen: string
  contenido: string
}

export function TarjetaExpandible({
  titulo,
  resumen,
  contenido,
}: PropiedadesTarjetaExpandible) {
  const [abierta, setAbierta] = useState(false)
  const panelId = useId()

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={panelId}
        onClick={() => setAbierta((actual) => !actual)}
        className="flex min-h-11 w-full touch-manipulation items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-5"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <Lightbulb aria-hidden="true" className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-balance">{titulo}</span>
          <span className="mt-1 block text-sm text-pretty text-muted-foreground">{resumen}</span>
        </span>
        <Plus
          aria-hidden="true"
          className={`mt-2 size-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${abierta ? 'rotate-45' : ''}`}
        />
      </button>
      <div
        id={panelId}
        className={`grid border-t transition-[grid-template-rows,border-color] duration-300 motion-reduce:transition-none ${abierta ? 'grid-rows-[1fr] border-border' : 'grid-rows-[0fr] border-transparent'}`}
      >
        <div className="overflow-hidden">
          <p className="px-4 py-4 text-sm text-pretty text-muted-foreground sm:px-5">
            {contenido}
          </p>
        </div>
      </div>
    </article>
  )
}
