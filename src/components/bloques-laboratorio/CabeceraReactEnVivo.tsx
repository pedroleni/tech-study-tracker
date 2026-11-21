import { Atom, ListChecks, RotateCcw } from 'lucide-react'
import type { RefObject } from 'react'

import { Button } from '@/components/ui/button'

export function CabeceraReactEnVivo({
  titulo,
  mostrarComprobar,
  comprobarDeshabilitado,
  etiquetaComprobar,
  botonComprobarRef,
  onComprobar,
  onReiniciar,
}: {
  titulo: string
  mostrarComprobar: boolean
  comprobarDeshabilitado: boolean
  etiquetaComprobar: string
  botonComprobarRef: RefObject<HTMLButtonElement | null>
  onComprobar: () => void
  onReiniciar: () => void
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 dark:bg-sky-950/40">
          <Atom aria-hidden="true" className="size-4.75 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            React en vivo
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {mostrarComprobar && (
          <Button
            ref={botonComprobarRef}
            type="button"
            size="sm"
            onClick={onComprobar}
            // aria-disabled y no disabled: un botón desactivado pierde el foco
            // del teclado y lo manda a <body>.
            aria-disabled={comprobarDeshabilitado}
            className="aria-disabled:cursor-wait aria-disabled:opacity-60"
          >
            <ListChecks aria-hidden="true" />
            {etiquetaComprobar}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onReiniciar}>
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>
    </div>
  )
}
