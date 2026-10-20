import { ListTree } from 'lucide-react'

import { ArbolVisual, LeyendaArbol } from '@/components/bloques-laboratorio/ArbolVisual'
import type { DatosArbolDeComponentes } from '@/lib/laboratorio/schemas'

// El mismo dibujo que el árbol de renders, pero escrito por el autor: para
// diagramas que no salen de ejecutar código (dónde vive el estado, quién
// lee un contexto, la frontera servidor/cliente...).
export function ArbolDeComponentes({ titulo, nodos }: DatosArbolDeComponentes) {
  return (
    <section
      aria-label={titulo ? `Árbol de componentes: ${titulo}` : 'Árbol de componentes'}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 dark:bg-teal-950/40">
          <ListTree aria-hidden="true" className="size-4.75 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
            Árbol de componentes
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {titulo ?? 'Así se reparte la interfaz en componentes'}
          </h3>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-lg border bg-muted/40 p-3">
        <ArbolVisual
          etiqueta="Componentes del árbol"
          nodos={nodos.map((nodo, indice) => ({ ...nodo, id: indice }))}
        />
      </div>

      {nodos.some((nodo) => nodo.estado) && <LeyendaArbol />}
    </section>
  )
}
