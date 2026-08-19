import { Columns2 } from 'lucide-react'
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
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 dark:bg-violet-950/40">
          <Columns2
            aria-hidden="true"
            className="size-4.75 text-violet-600 dark:text-violet-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
            Antes y después
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {nota ?? 'Compara las dos versiones y su resultado en vivo.'}
          </h3>
        </div>
      </div>

      <fieldset className="w-full max-w-sm">
        <legend className="sr-only">Versión que quieres comparar</legend>
        <div className="relative grid grid-cols-2 rounded-xl border bg-muted p-1">
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-background shadow-sm transition-transform duration-300 ease-out',
              version === 'despues' && 'translate-x-[calc(100%+0.125rem)]',
            )}
          />
          {VERSIONES.map((opcion) => {
            const activa = opcion.id === version
            return (
              <label
                key={opcion.id}
                className={cn(
                  'relative z-10 flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
                  activa ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
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
