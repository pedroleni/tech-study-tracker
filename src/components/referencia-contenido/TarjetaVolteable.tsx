import { useState } from 'react'
import { Rotate3D } from 'lucide-react'

export interface PropiedadesTarjetaVolteable {
  tituloFrontal: string
  contenidoFrontal: string
  tituloTrasero: string
  contenidoTrasero: string
  etiqueta?: string
}

export function TarjetaVolteable({
  tituloFrontal,
  contenidoFrontal,
  tituloTrasero,
  contenidoTrasero,
  etiqueta = 'Voltear tarjeta',
}: PropiedadesTarjetaVolteable) {
  const [volteada, setVolteada] = useState(false)

  return (
    <div className="mx-auto h-64 max-w-md [perspective:900px]">
      <button
        type="button"
        aria-label={etiqueta}
        aria-pressed={volteada}
        onClick={() => setVolteada((actual) => !actual)}
        className="group h-full w-full touch-manipulation rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span
          className={`relative block h-full w-full [transform-style:preserve-3d] transition-transform duration-700 motion-reduce:transition-none group-hover:[transform:rotateY(180deg)] ${
            volteada ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <span className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-card p-6 shadow-lg [backface-visibility:hidden]">
            <Rotate3D aria-hidden="true" className="size-7 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="block text-lg font-semibold text-balance">{tituloFrontal}</span>
              <span className="mt-2 block text-sm text-pretty text-muted-foreground">
                {contenidoFrontal}
              </span>
            </span>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
              Pulsa o pasa el cursor para girar
            </span>
          </span>
          <span className="absolute inset-0 flex flex-col justify-center rounded-xl border border-violet-600 bg-violet-50 p-6 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-400 dark:bg-violet-950/40">
            <span className="block text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
              Respuesta
            </span>
            <span className="mt-2 block text-lg font-semibold text-balance">{tituloTrasero}</span>
            <span className="mt-2 block text-sm text-pretty text-muted-foreground">
              {contenidoTrasero}
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
