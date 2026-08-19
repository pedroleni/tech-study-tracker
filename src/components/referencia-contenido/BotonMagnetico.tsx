import { useState, type PointerEvent } from 'react'
import { MousePointerClick } from 'lucide-react'

export interface PropiedadesBotonMagnetico {
  etiqueta: string
  intensidad?: number
  onClick?: () => void
}

export function BotonMagnetico({
  etiqueta,
  intensidad = 10,
  onClick,
}: PropiedadesBotonMagnetico) {
  const [posicion, setPosicion] = useState({ x: 0, y: 0 })

  function atraer(evento: PointerEvent<HTMLDivElement>) {
    if (evento.pointerType === 'touch') return
    const limites = evento.currentTarget.getBoundingClientRect()
    setPosicion({
      x: ((evento.clientX - limites.left) / limites.width - 0.5) * intensidad,
      y: ((evento.clientY - limites.top) / limites.height - 0.5) * intensidad,
    })
  }

  return (
    <div
      onPointerMove={atraer}
      onPointerLeave={() => setPosicion({ x: 0, y: 0 })}
      className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-muted/40 p-8"
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-11 touch-manipulation items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-[transform,box-shadow] duration-200 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transform-none motion-reduce:transition-none dark:bg-blue-400 dark:text-blue-950"
        style={{ transform: `translate3d(${posicion.x}px, ${posicion.y}px, 0)` }}
      >
        <MousePointerClick aria-hidden="true" className="size-5" />
        {etiqueta}
      </button>
    </div>
  )
}
