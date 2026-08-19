import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export interface PropiedadesInterruptorAnimado {
  etiqueta: string
  activoInicial?: boolean
  textoActivo?: string
  textoInactivo?: string
}

export function InterruptorAnimado({
  etiqueta,
  activoInicial = false,
  textoActivo = 'Activado',
  textoInactivo = 'Desactivado',
}: PropiedadesInterruptorAnimado) {
  const [activo, setActivo] = useState(activoInicial)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <p className="font-semibold">{etiqueta}</p>
        <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
          {activo ? textoActivo : textoInactivo}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={etiqueta}
        onClick={() => setActivo((actual) => !actual)}
        className={`relative h-10 w-[4.5rem] touch-manipulation rounded-full border-2 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none ${
          activo
            ? 'border-violet-600 bg-violet-600 dark:border-violet-400 dark:bg-violet-400'
            : 'border-border bg-muted'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 left-1 flex size-7 items-center justify-center rounded-full bg-background shadow-md transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none ${
            activo ? 'translate-x-8 rotate-180' : 'translate-x-0 rotate-0'
          }`}
        >
          {activo ? <Moon className="size-4 text-violet-600 dark:text-violet-400" /> : <Sun className="size-4 text-amber-600 dark:text-amber-400" />}
        </span>
      </button>
    </div>
  )
}
