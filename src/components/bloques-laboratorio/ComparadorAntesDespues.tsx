import { useId, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'
import type { DatosComparadorAntesDespues } from '@/lib/laboratorio/schemas'

type Version = 'antes' | 'despues'

const VERSIONES: { id: Version; etiqueta: string }[] = [
  { id: 'antes', etiqueta: 'Antes' },
  { id: 'despues', etiqueta: 'Después' },
]

export function ComparadorAntesDespues({
  antes,
  despues,
  nota,
}: DatosComparadorAntesDespues) {
  const nombreVersion = useId()
  const [version, setVersion] = useState<Version>('antes')
  const codigo = version === 'antes' ? antes : despues
  const etiquetaVersion = version === 'antes' ? 'Antes' : 'Después'

  return (
    <section
      aria-label="Comparador antes y después"
      className="my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-balance">Antes y después</h3>
        {nota && <p className="text-sm text-pretty text-muted-foreground">{nota}</p>}
      </div>

      <fieldset className="w-full max-w-sm">
        <legend className="sr-only">Versión que quieres comparar</legend>
        <div className="grid grid-cols-2 rounded-xl border bg-muted p-1">
          {VERSIONES.map((opcion) => {
            const activa = opcion.id === version
            return (
              <label
                key={opcion.id}
                className={cn(
                  'flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-lg px-3 py-2 text-sm font-medium has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
                  activa
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <input
                  type="radio"
                  name={nombreVersion}
                  value={opcion.id}
                  checked={activa}
                  onChange={() => setVersion(opcion.id)}
                  className="sr-only"
                />
                {opcion.etiqueta}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-semibold">Código · {etiquetaVersion}</h4>
          <CodigoResaltado
            codigo={codigo}
            lenguaje="html"
            numerarLineas
            etiqueta={`Código HTML de la versión ${etiquetaVersion}`}
            className="h-64"
          />
        </div>
        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-semibold">Resultado · {etiquetaVersion}</h4>
          <iframe
            className="block h-64 w-full max-w-full rounded-lg border bg-white"
            sandbox=""
            srcDoc={codigo}
            title={`Vista previa de la versión ${etiquetaVersion}`}
          />
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        Mostrando la versión {etiquetaVersion}.
      </p>
    </section>
  )
}
