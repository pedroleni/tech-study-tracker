import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface ItemAcordeon {
  pregunta: string
  respuesta: string
}

export interface PropiedadesAcordeon {
  items: ItemAcordeon[]
}

export function Acordeon({ items }: PropiedadesAcordeon) {
  const [abierto, setAbierto] = useState<number | null>(0)
  const idBase = useId()

  if (items.length === 0) return null

  return (
    <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
      {items.map((item, indice) => {
        const estaAbierto = abierto === indice
        const panelId = `${idBase}-panel-${indice}`
        const botonId = `${idBase}-boton-${indice}`

        return (
          <section key={`${item.pregunta}-${indice}`}>
            <h3>
              <button
                id={botonId}
                type="button"
                aria-expanded={estaAbierto}
                aria-controls={panelId}
                onClick={() => setAbierto(estaAbierto ? null : indice)}
                className="flex min-h-11 w-full touch-manipulation items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-5"
              >
                <span className="min-w-0 break-words">{item.pregunta}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${estaAbierto ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={botonId}
              className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${estaAbierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-pretty text-muted-foreground sm:px-5">
                  {item.respuesta}
                </p>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
