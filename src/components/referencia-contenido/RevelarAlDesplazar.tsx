import { useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'

export interface ItemRevelar {
  titulo: string
  descripcion: string
}

export interface PropiedadesRevelarAlDesplazar {
  items: ItemRevelar[]
  etiqueta?: string
}

export function RevelarAlDesplazar({
  items,
  etiqueta = 'Contenido revelado al desplazar',
}: PropiedadesRevelarAlDesplazar) {
  const elementosRef = useRef<(HTMLLIElement | null)[]>([])
  const [visibles, setVisibles] = useState<Set<number>>(() =>
    typeof IntersectionObserver === 'undefined'
      ? new Set(items.map((_, indice) => indice))
      : new Set(),
  )

  useEffect(() => {
    const elementos = elementosRef.current.filter((elemento): elemento is HTMLLIElement => Boolean(elemento))
    if (typeof IntersectionObserver === 'undefined') return

    const observador = new IntersectionObserver(
      (entradas) => {
        const nuevos: number[] = []
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          const indice = Number((entrada.target as HTMLElement).dataset.indice)
          nuevos.push(indice)
          observador.unobserve(entrada.target)
        }
        if (nuevos.length > 0) {
          setVisibles((actuales) => new Set([...actuales, ...nuevos]))
        }
      },
      { threshold: 0.2 },
    )

    elementos.forEach((elemento) => observador.observe(elemento))
    return () => observador.disconnect()
  }, [items.length])

  if (items.length === 0) return null

  return (
    <ul aria-label={etiqueta} className="space-y-3">
      {items.map((item, indice) => (
        <li
          key={`${item.titulo}-${indice}`}
          ref={(elemento) => {
            elementosRef.current[indice] = elemento
          }}
          data-indice={indice}
          className={`flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-[opacity,transform] duration-500 motion-reduce:translate-y-0 motion-reduce:transition-none ${
            visibles.has(indice) ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <Eye aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="min-w-0">
            <h3 className="font-semibold text-balance">{item.titulo}</h3>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.descripcion}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
