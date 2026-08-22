import { useState } from 'react'
import { Rotate3D, RotateCw } from 'lucide-react'

import type { DatosMitos } from '@/lib/laboratorio/schemas'

export function Mitos({ titulo = 'Mitos y realidades', mitos }: DatosMitos) {
  const [volteadas, setVolteadas] = useState(() => mitos.map(() => false))

  const alternarTarjeta = (indice: number) => {
    setVolteadas((actuales) =>
      actuales.map((volteada, indiceActual) =>
        indiceActual === indice ? !volteada : volteada,
      ),
    )
  }

  return (
    <section
      aria-label="Mitos y realidades"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-orange-50 dark:bg-orange-950/40">
          <RotateCw
            aria-hidden="true"
            className="size-4.75 text-orange-600 dark:text-orange-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Gira para descubrir
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <ul className="grid list-none! grid-cols-1 gap-4 pl-0! sm:grid-cols-2">
        {mitos.map((item, indice) => {
          const volteada = volteadas[indice] ?? false

          return (
            <li key={`${item.mito}-${indice}`} className="h-64 min-w-0 [perspective:900px]">
              <button
                type="button"
                aria-label={
                  volteada
                    ? `Volver al mito: ${item.mito}`
                    : `Girar tarjeta: ${item.mito}`
                }
                aria-pressed={volteada}
                onClick={() => alternarTarjeta(indice)}
                className="group h-full w-full touch-manipulation rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <span
                  className={`relative block h-full w-full [transform-style:preserve-3d] transition-transform duration-700 motion-reduce:transition-none group-hover:[transform:rotateY(180deg)] ${
                    volteada ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  <span className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-background/50 p-5 shadow-lg [backface-visibility:hidden]">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                        Mito
                      </span>
                      <Rotate3D
                        aria-hidden="true"
                        className="size-6 shrink-0 text-orange-600 dark:text-orange-400"
                      />
                    </span>
                    <span className="break-words text-xl font-bold text-balance sm:text-2xl">
                      {item.mito}
                    </span>
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      Pulsa o pasa el cursor para girar
                    </span>
                  </span>

                  <span className="absolute inset-0 flex flex-col justify-center rounded-xl border border-orange-300 bg-orange-50 p-5 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-orange-700 dark:bg-orange-950/50">
                    <span className="text-[11px] font-bold tracking-wider text-orange-700 uppercase dark:text-orange-300">
                      Realidad
                    </span>
                    <span className="mt-3 block break-words text-sm leading-relaxed text-pretty text-orange-950 dark:text-orange-100">
                      {item.realidad}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
