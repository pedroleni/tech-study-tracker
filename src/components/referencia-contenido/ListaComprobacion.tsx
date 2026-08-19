import { useState } from 'react'
import { Check } from 'lucide-react'

export interface ItemListaComprobacion {
  id: string
  texto: string
  completado?: boolean
}

export interface PropiedadesListaComprobacion {
  items: ItemListaComprobacion[]
  titulo: string
}

export function ListaComprobacion({ items, titulo }: PropiedadesListaComprobacion) {
  const [completados, setCompletados] = useState(
    () => new Set(items.filter((item) => item.completado).map((item) => item.id)),
  )

  if (items.length === 0) return null

  function alternar(id: string) {
    setCompletados((actuales) => {
      const siguientes = new Set(actuales)
      if (siguientes.has(id)) siguientes.delete(id)
      else siguientes.add(id)
      return siguientes
    })
  }

  return (
    <section aria-label={titulo} className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <p className="mb-3 font-semibold text-balance">{titulo}</p>
      <ul className="space-y-2">
        {items.map((item) => {
          const completado = completados.has(item.id)
          return (
            <li key={item.id}>
              <label className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
                <input
                  type="checkbox"
                  checked={completado}
                  onChange={() => alternar(item.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-[background-color,border-color,transform] duration-200 motion-reduce:transition-none ${
                    completado
                      ? 'scale-100 border-primary bg-primary text-primary-foreground'
                      : 'scale-95 border-input bg-background text-transparent'
                  }`}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span
                  className={`text-sm transition-[color,text-decoration-color] duration-200 motion-reduce:transition-none ${
                    completado
                      ? 'text-muted-foreground line-through decoration-muted-foreground'
                      : 'decoration-transparent'
                  }`}
                >
                  {item.texto}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
