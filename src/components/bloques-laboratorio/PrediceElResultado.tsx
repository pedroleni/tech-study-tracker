import { CircleCheck, CircleHelp, CircleX } from 'lucide-react'
import { useId, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DatosPrediceElResultado } from '@/lib/laboratorio/schemas'

export function PrediceElResultado({
  codigo,
  lenguaje,
  opciones,
  correcta,
  explicacion,
}: DatosPrediceElResultado) {
  const nombreOpciones = useId()
  const [seleccionada, setSeleccionada] = useState<number | null>(null)
  const [revelado, setRevelado] = useState(false)

  return (
    <section
      aria-label="Predice el resultado"
      className="my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 dark:bg-blue-950/40">
          <CircleHelp
            aria-hidden="true"
            className="size-4.75 text-blue-600 dark:text-blue-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
            Predice el resultado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            Lee el código, elige una opción y comprueba qué muestra el navegador.
          </h3>
        </div>
      </div>

      <CodigoResaltado
        codigo={codigo}
        lenguaje={lenguaje}
        etiqueta="Código HTML para predecir"
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">¿Qué resultado esperas?</legend>
        {opciones.map((opcion, indice) => (
          <label
            key={`${opcion}-${indice}`}
            className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted/60 has-focus-visible:border-ring has-focus-visible:ring-2 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={nombreOpciones}
              value={indice}
              checked={seleccionada === indice}
              onChange={() => {
                setSeleccionada(indice)
                setRevelado(false)
              }}
              className="size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0 break-words">{opcion}</span>
          </label>
        ))}
      </fieldset>

      <Button
        type="button"
        disabled={seleccionada === null}
        onClick={() => setRevelado(true)}
        className="min-h-11 touch-manipulation px-4"
      >
        Revelar resultado
      </Button>

      <div aria-live="polite">
        {revelado && seleccionada !== null && (
          <div
            className={cn(
              'space-y-4 rounded-lg border-2 p-4',
              seleccionada === correcta
                ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
                : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30',
            )}
          >
            <div className="space-y-1">
              <p
                className={cn(
                  'flex items-center gap-1.5 text-sm font-semibold',
                  seleccionada === correcta
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300',
                )}
              >
                {seleccionada === correcta ? (
                  <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CircleX className="size-4 shrink-0" aria-hidden="true" />
                )}
                {seleccionada === correcta ? 'Respuesta correcta' : 'Esta vez no'}
              </p>
              <p className="text-sm text-pretty text-muted-foreground">{explicacion}</p>
              {seleccionada !== correcta && (
                <p className="text-sm">
                  Respuesta correcta:{' '}
                  <span className="font-medium text-foreground">{opciones[correcta]}</span>
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Así se ve de verdad</p>
              <div className="flex justify-center rounded-lg border bg-muted/40 p-3">
                <iframe
                  className="block h-24 w-full max-w-64 rounded-md border bg-white"
                  sandbox=""
                  srcDoc={codigo}
                  title="Resultado real del código HTML"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
