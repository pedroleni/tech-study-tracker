import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

export interface ItemAparicionEscalonada {
  titulo: string
  descripcion: string
}

export interface PropiedadesAparicionEscalonada {
  items: ItemAparicionEscalonada[]
  etiqueta?: string
}

export function AparicionEscalonada({
  items,
  etiqueta = 'Conceptos relacionados',
}: PropiedadesAparicionEscalonada) {
  const contenedorRef = useRef<HTMLUListElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const elemento = contenedorRef.current
    if (!elemento) return
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <ul ref={contenedorRef} aria-label={etiqueta} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, indice) => (
        <li
          key={`${item.titulo}-${indice}`}
          className={`rounded-xl border bg-card p-4 shadow-sm transition-[opacity,transform] duration-500 motion-reduce:translate-y-0 motion-reduce:transition-none ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ transitionDelay: visible ? `${indice * 90}ms` : '0ms' }}
        >
          <Sparkles aria-hidden="true" className="size-5 text-amber-600 dark:text-amber-400" />
          <h3 className="mt-4 font-semibold text-balance">{item.titulo}</h3>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.descripcion}</p>
        </li>
      ))}
    </ul>
  )
}
