import { useId, useState } from 'react'

export interface ItemPestanas {
  etiqueta: string
  contenido: string
}

export interface PropiedadesPestanas {
  items: ItemPestanas[]
}

export function Pestanas({ items }: PropiedadesPestanas) {
  const [activa, setActiva] = useState(0)
  const idBase = useId()

  if (items.length === 0) return null

  const indiceActivo = Math.min(activa, items.length - 1)

  function activarConTeclado(indice: number) {
    const siguiente = (indice + items.length) % items.length
    setActiva(siguiente)
    document.getElementById(`${idBase}-tab-${siguiente}`)?.focus()
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto border-b">
        <div
          className="relative grid min-w-full w-max"
          role="tablist"
          aria-label="Contenido relacionado"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(10rem, 1fr))` }}
        >
          {items.map((item, indice) => (
            <button
              key={`${item.etiqueta}-${indice}`}
              id={`${idBase}-tab-${indice}`}
              type="button"
              role="tab"
              aria-selected={indiceActivo === indice}
              aria-controls={`${idBase}-panel-${indice}`}
              tabIndex={indiceActivo === indice ? 0 : -1}
              onClick={() => setActiva(indice)}
              onKeyDown={(evento) => {
                if (evento.key === 'ArrowRight') activarConTeclado(indice + 1)
                else if (evento.key === 'ArrowLeft') activarConTeclado(indice - 1)
                else if (evento.key === 'Home') activarConTeclado(0)
                else if (evento.key === 'End') activarConTeclado(items.length - 1)
                else return
                evento.preventDefault()
              }}
              className="min-h-11 touch-manipulation px-5 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring aria-selected:text-foreground"
            >
              {item.etiqueta}
            </button>
          ))}
          <span
            aria-hidden="true"
            className="absolute bottom-0 h-0.5 bg-primary transition-[left,width] duration-300 motion-reduce:transition-none"
            style={{
              left: `${(indiceActivo * 100) / items.length}%`,
              width: `${100 / items.length}%`,
            }}
          />
        </div>
      </div>
      <div
        id={`${idBase}-panel-${indiceActivo}`}
        role="tabpanel"
        aria-labelledby={`${idBase}-tab-${indiceActivo}`}
        className="animate-in fade-in-0 p-4 text-sm text-pretty text-muted-foreground duration-300 motion-reduce:animate-none sm:p-5"
      >
        {items[indiceActivo].contenido}
      </div>
    </div>
  )
}
