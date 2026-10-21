import { Radio, ServerCrash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { MensajePeticion } from '@/lib/react-en-vivo/mensajes'
import { cn } from '@/lib/utils'

export type AjustesRed = { latencia: number; desordenar: boolean }

const ESTADO_PETICION: Record<MensajePeticion['estado'], string> = {
  pendiente: 'pendiente',
  ok: 'completada',
  error: 'error',
  cancelada: 'cancelada',
}

const COLOR_ESTADO: Record<MensajePeticion['estado'], string> = {
  pendiente: 'text-sky-700 dark:text-sky-300',
  ok: 'text-green-700 dark:text-green-300',
  error: 'text-red-700 dark:text-red-400',
  cancelada: 'text-amber-700 dark:text-amber-300',
}

function textoPeticion(peticion: MensajePeticion) {
  const estado = peticion.codigo === undefined ? ESTADO_PETICION[peticion.estado] : String(peticion.codigo)
  return [`${peticion.metodo} ${peticion.ruta}`, estado, peticion.ms === undefined ? undefined : `${peticion.ms} ms`]
    .filter(Boolean)
    .join(' · ')
}

export function PanelRed({
  red,
  peticiones,
  falloPendiente,
  onCambiar,
  onFallarSiguiente,
}: {
  red: AjustesRed
  peticiones: MensajePeticion[]
  falloPendiente: boolean
  onCambiar: (red: AjustesRed) => void
  onFallarSiguiente: () => void
}) {
  const visibles = peticiones.slice(-20)

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <Radio aria-hidden="true" className="size-4 text-sky-600 dark:text-sky-400" />
        <h4 className="text-sm font-semibold">Red</h4>
      </div>

      <div className="min-w-0 space-y-3 rounded-lg border bg-muted/40 p-3 text-xs">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="grid min-w-0 gap-1 font-medium">
            <span className="flex items-center justify-between gap-3">
              <span>Latencia</span>
              <span className="font-mono text-muted-foreground">{red.latencia} ms</span>
            </span>
            <input
              type="range"
              min={0}
              max={3000}
              step={50}
              value={red.latencia}
              aria-label="Latencia"
              aria-valuetext={`${red.latencia} ms`}
              onChange={(evento) => onCambiar({ ...red, latencia: Number(evento.currentTarget.value) })}
              className="min-h-6 w-full cursor-pointer accent-sky-600"
            />
          </label>

          <button
            type="button"
            role="switch"
            aria-checked={red.desordenar}
            onClick={() => onCambiar({ ...red, desordenar: !red.desordenar })}
            className="flex min-h-8 touch-manipulation items-center gap-2 rounded-md px-1 text-left font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-6 w-10 shrink-0 items-center rounded-full border p-0.5 transition-colors',
                red.desordenar ? 'border-sky-600 bg-sky-600' : 'border-border bg-background',
              )}
            >
              <span
                className={cn(
                  'size-4.5 rounded-full bg-white shadow-sm transition-transform',
                  red.desordenar && 'translate-x-4',
                )}
              />
            </span>
            Responder desordenado
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onFallarSiguiente}>
            <ServerCrash aria-hidden="true" />
            Fallar la siguiente petición
          </Button>
          <p role="status" className="font-medium text-amber-700 dark:text-amber-300">
            {falloPendiente ? 'La siguiente petición fallará' : ''}
          </p>
        </div>

        <div
          aria-live="off"
          aria-label="Peticiones de la API simulada"
          className="max-h-64 overflow-auto rounded-md border bg-background p-2 font-mono"
        >
          {visibles.length === 0 ? (
            <p className="px-1 py-0.5 text-muted-foreground">Todavía no hay peticiones.</p>
          ) : (
            <ol className="space-y-1">
              {visibles.map((peticion) => (
                <li
                  key={peticion.id}
                  className={cn('break-words px-1', COLOR_ESTADO[peticion.estado])}
                >
                  {textoPeticion(peticion)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
