import { useId, useState } from 'react'
import { ChevronRight, FileCode2, FolderTree } from 'lucide-react'

export interface NodoArbol {
  id: string
  etiqueta: string
  descripcion?: string
  hijos?: NodoArbol[]
}

export interface PropiedadesArbolExpandible {
  nodos: NodoArbol[]
  etiqueta?: string
}

function RamaArbol({ nodo, nivel, idBase }: { nodo: NodoArbol; nivel: number; idBase: string }) {
  const [abierto, setAbierto] = useState(nivel === 0)
  const tieneHijos = Boolean(nodo.hijos?.length)
  const panelId = `${idBase}-${nodo.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`

  return (
    <li>
      {tieneHijos ? (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={panelId}
          onClick={() => setAbierto((actual) => !actual)}
          className="flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        >
          <ChevronRight
            aria-hidden="true"
            className={`size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${abierto ? 'rotate-90' : ''}`}
          />
          <FolderTree aria-hidden="true" className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{nodo.etiqueta}</span>
            {nodo.descripcion && <span className="block text-xs text-muted-foreground">{nodo.descripcion}</span>}
          </span>
        </button>
      ) : (
        <div className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-2">
          <span aria-hidden="true" className="size-4 shrink-0" />
          <FileCode2 aria-hidden="true" className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="min-w-0">
            <span className="block text-sm font-medium" translate="no">{nodo.etiqueta}</span>
            {nodo.descripcion && <span className="block text-xs text-muted-foreground">{nodo.descripcion}</span>}
          </span>
        </div>
      )}
      {tieneHijos && (
        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${abierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <ul className="ml-4 border-l pl-3">
              {nodo.hijos?.map((hijo) => (
                <RamaArbol key={hijo.id} nodo={hijo} nivel={nivel + 1} idBase={idBase} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}

export function ArbolExpandible({
  nodos,
  etiqueta = 'Árbol de contenido',
}: PropiedadesArbolExpandible) {
  const idBase = useId()
  if (nodos.length === 0) return null

  return (
    <section aria-label={etiqueta} className="rounded-xl border bg-card p-4 shadow-sm">
      <ul>
        {nodos.map((nodo) => (
          <RamaArbol key={nodo.id} nodo={nodo} nivel={0} idBase={idBase} />
        ))}
      </ul>
    </section>
  )
}
