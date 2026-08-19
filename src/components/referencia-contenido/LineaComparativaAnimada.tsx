import { useEffect, useRef, useState } from 'react'

export interface LadoComparativa {
  etiqueta: string
  valor: number
}

export interface PropiedadesLineaComparativaAnimada {
  izquierda: LadoComparativa
  derecha: LadoComparativa
  titulo: string
}

export function LineaComparativaAnimada({
  izquierda,
  derecha,
  titulo,
}: PropiedadesLineaComparativaAnimada) {
  const contenedorRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const total = Math.max(0, izquierda.valor) + Math.max(0, derecha.valor)
  const porcentajeIzquierda = total > 0 ? (Math.max(0, izquierda.valor) / total) * 100 : 50

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
      { threshold: 0.35 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return (
    <section ref={contenedorRef} aria-label={titulo} className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-balance">{titulo}</h3>
      <div className="mt-4 flex items-end justify-between gap-4 text-sm">
        <div>
          <p className="font-medium text-blue-600 dark:text-blue-400">{izquierda.etiqueta}</p>
          <p className="text-2xl font-semibold tabular-nums">{Math.round(porcentajeIzquierda)}%</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-amber-600 dark:text-amber-400">{derecha.etiqueta}</p>
          <p className="text-2xl font-semibold tabular-nums">{Math.round(100 - porcentajeIzquierda)}%</p>
        </div>
      </div>
      <div
        role="img"
        aria-label={`${izquierda.etiqueta} ${Math.round(porcentajeIzquierda)}%, ${derecha.etiqueta} ${Math.round(100 - porcentajeIzquierda)}%`}
        className={`mt-3 flex h-5 origin-left overflow-hidden rounded-full transition-transform duration-1000 motion-reduce:transition-none ${visible ? 'scale-x-100' : 'scale-x-0'}`}
      >
        <span className="bg-blue-600 dark:bg-blue-400" style={{ width: `${porcentajeIzquierda}%` }} />
        <span className="bg-amber-600 dark:bg-amber-400" style={{ width: `${100 - porcentajeIzquierda}%` }} />
      </div>
    </section>
  )
}
