import { useId, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
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
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-balance">Predice el resultado</h3>
        <p className="text-sm text-pretty text-muted-foreground">
          Lee el código, elige una opción y comprueba qué muestra el navegador.
        </p>
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
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {seleccionada === correcta ? 'Respuesta correcta' : 'Esta vez no'}
              </p>
              <p className="text-sm text-pretty text-muted-foreground">{explicacion}</p>
              <p className="text-sm">
                Respuesta: <span className="font-medium">{opciones[correcta]}</span>
              </p>
            </div>
            <iframe
              className="block h-48 w-full max-w-full rounded-lg border bg-white"
              sandbox=""
              srcDoc={codigo}
              title="Resultado real del código HTML"
            />
          </div>
        )}
      </div>
    </section>
  )
}
