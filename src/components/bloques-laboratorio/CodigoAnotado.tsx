import { useId, useMemo, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DatosCodigoAnotado } from '@/lib/laboratorio/schemas'

export function CodigoAnotado({
  codigo,
  lenguaje,
  anotaciones,
}: DatosCodigoAnotado) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () =>
      anotaciones.flatMap((anotacion) => {
        const posicion = codigo.indexOf(anotacion.fragmento)
        if (posicion === -1) return []

        return [
          {
            ...anotacion,
            linea: codigo.slice(0, posicion).split('\n').length,
          },
        ]
      }),
    [anotaciones, codigo],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]

  return (
    <section
      aria-label="Código anotado"
      className="my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-balance">Código anotado</h3>
        <p className="text-sm text-pretty text-muted-foreground">
          Selecciona un número para destacar su línea y leer la nota.
        </p>
      </div>

      <CodigoResaltado
        codigo={codigo}
        lenguaje={lenguaje}
        numerarLineas
        lineasDestacadas={activa ? [activa.linea] : []}
        etiqueta="Código HTML anotado"
      />

      {anotacionesValidas.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Anotaciones del código">
            {anotacionesValidas.map((anotacion, indice) => (
              <Button
                key={`${anotacion.fragmento}-${indice}`}
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={indice === anotacionActiva}
                aria-controls={idNota}
                aria-label={`Ver anotación ${indice + 1}: ${anotacion.nota}`}
                onClick={() => setAnotacionActiva(indice)}
                className={cn(
                  'size-11 touch-manipulation rounded-full transition-colors',
                  indice === anotacionActiva &&
                    'border-amber-500 bg-amber-500 text-white hover:bg-amber-500 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950',
                )}
              >
                {indice + 1}
              </Button>
            ))}
          </div>
          <p
            id={idNota}
            aria-live="polite"
            className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-pretty dark:border-amber-400 dark:bg-amber-950/30"
          >
            <span className="font-semibold">Nota {anotacionActiva + 1}.</span>{' '}
            {activa?.nota}
          </p>
        </div>
      )}
    </section>
  )
}
