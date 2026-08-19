import { useState, type PointerEvent } from 'react'
import { MousePointer2 } from 'lucide-react'

export interface PropiedadesTarjetaInclinacion {
  titulo: string
  descripcion: string
  intensidad?: number
}

interface Inclinacion {
  x: number
  y: number
}

export function TarjetaInclinacion({
  titulo,
  descripcion,
  intensidad = 9,
}: PropiedadesTarjetaInclinacion) {
  const [inclinacion, setInclinacion] = useState<Inclinacion>({ x: 0, y: 0 })

  function inclinar(evento: PointerEvent<HTMLElement>) {
    if (evento.pointerType === 'touch') return
    const limites = evento.currentTarget.getBoundingClientRect()
    const x = (evento.clientX - limites.left) / limites.width - 0.5
    const y = (evento.clientY - limites.top) / limites.height - 0.5
    setInclinacion({ x: x * intensidad * 2, y: y * intensidad * -2 })
  }

  return (
    <div className="mx-auto max-w-md [perspective:900px]">
      <article
        onPointerMove={inclinar}
        onPointerLeave={() => setInclinacion({ x: 0, y: 0 })}
        className="rounded-xl border bg-card p-6 transition-[transform,box-shadow] duration-200 motion-reduce:transform-none motion-reduce:transition-none"
        style={{
          transform: `rotateX(${inclinacion.y}deg) rotateY(${inclinacion.x}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: `${inclinacion.x * -1.2}px ${inclinacion.y * 1.2 + 12}px 28px color-mix(in oklch, var(--foreground) 16%, transparent)`,
        }}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 [transform:translateZ(32px)] dark:bg-blue-950/40 dark:text-blue-400">
          <MousePointer2 aria-hidden="true" className="size-5" />
        </span>
        <div className="mt-7 [transform:translateZ(24px)]">
          <h3 className="text-xl font-semibold text-balance">{titulo}</h3>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{descripcion}</p>
        </div>
      </article>
    </div>
  )
}
