import { useEffect, useRef, useState } from 'react'
import { BarChart3 } from 'lucide-react'

export interface DatoGraficoBarras {
  etiqueta: string
  valor: number
}

export interface PropiedadesGraficoBarras {
  datos: DatoGraficoBarras[]
  titulo: string
  maximo?: number
}

const coloresBarras = [
  'bg-blue-600 dark:bg-blue-400',
  'bg-amber-600 dark:bg-amber-400',
  'bg-violet-600 dark:bg-violet-400',
  'bg-teal-600 dark:bg-teal-400',
  'bg-green-600 dark:bg-green-400',
  'bg-red-600 dark:bg-red-400',
]

export function GraficoBarras({ datos, titulo, maximo }: PropiedadesGraficoBarras) {
  const graficoRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const valorMaximo = maximo ?? Math.max(...datos.map((dato) => dato.valor), 1)
  const formateador = new Intl.NumberFormat('es-ES')

  useEffect(() => {
    const elemento = graficoRef.current
    if (!elemento) return
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  if (datos.length === 0) return null

  return (
    <section ref={graficoRef} aria-label={titulo} className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BarChart3 aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-balance">{titulo}</h3>
      </div>
      <div className="mt-6 flex h-56 items-end gap-3 border-b border-l px-3 pt-4 sm:gap-5">
        {datos.map((dato, indice) => {
          const proporcion = Math.min(1, Math.max(0, dato.valor / valorMaximo))
          return (
            <div
              key={`${dato.etiqueta}-${indice}`}
              aria-label={`${dato.etiqueta}: ${formateador.format(dato.valor)}`}
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
            >
              <span className="mb-2 text-center text-xs font-semibold tabular-nums">
                {formateador.format(dato.valor)}
              </span>
              <span
                aria-hidden="true"
                className={`block min-h-1 origin-bottom rounded-t-md transition-transform duration-700 ease-out motion-reduce:transition-none ${coloresBarras[indice % coloresBarras.length]} ${
                  visible ? 'scale-y-100' : 'scale-y-0'
                }`}
                style={{ height: `${proporcion * 100}%`, transitionDelay: `${indice * 90}ms` }}
              />
              <span className="mt-2 truncate text-center text-[10px] text-muted-foreground sm:text-xs">
                {dato.etiqueta}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
