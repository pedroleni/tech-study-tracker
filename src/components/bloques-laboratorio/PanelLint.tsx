import { ScanText } from 'lucide-react'
import { useId } from 'react'

import type { DiagnosticoLint } from '@/lib/react-kit/cliente'
import { cn } from '@/lib/utils'

type EstadoPanelLint = 'cargando' | 'listo' | 'error'

function Diagnostico({ diagnostico }: { diagnostico: DiagnosticoLint }) {
  const [primerParrafo, ...otrosParrafos] = diagnostico.mensaje.split(/\n\s*\n/)

  return (
    <li
      className={cn(
        'min-w-0 break-words',
        diagnostico.severidad === 'error'
          ? 'text-red-700 dark:text-red-400'
          : 'text-amber-800 dark:text-amber-300',
      )}
    >
      <p>
        <span className="font-mono text-xs tabular-nums">
          {diagnostico.linea}:{diagnostico.columna}
        </span>
        {diagnostico.regla && (
          <>
            {' · '}
            <span className="font-mono text-xs" translate="no">
              {diagnostico.regla}
            </span>
          </>
        )}
        {' · '}
        <span className="whitespace-pre-wrap" lang="en">
          {primerParrafo}
        </span>
      </p>
      {otrosParrafos.length > 0 && (
        <details className="mt-1 text-foreground">
          <summary className="w-fit cursor-pointer rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            Ver mensaje completo
          </summary>
          <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground" lang="en">
            {otrosParrafos.join('\n\n')}
          </div>
        </details>
      )}
    </li>
  )
}

export function PanelLint({
  estado,
  diagnosticos,
  error,
}: {
  estado: EstadoPanelLint
  diagnosticos: DiagnosticoLint[]
  error?: string
}) {
  const idTitulo = useId()
  const porArchivo = diagnosticos.reduce<Map<string, DiagnosticoLint[]>>(
    (grupos, diagnostico) => {
      grupos.set(diagnostico.archivo, [...(grupos.get(diagnostico.archivo) ?? []), diagnostico])
      return grupos
    },
    new Map(),
  )

  return (
    <section aria-labelledby={idTitulo} className="min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <ScanText aria-hidden="true" className="size-4 text-sky-600 dark:text-sky-400" />
        <h4 id={idTitulo} className="text-sm font-semibold">
          Linter
        </h4>
      </div>

      {estado === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando el linter…</p>
      )}
      {estado === 'error' && (
        <p className="text-sm break-words text-red-700 dark:text-red-400">
          {error ?? 'No se pudo cargar el linter'}
        </p>
      )}
      {estado === 'listo' && diagnosticos.length === 0 && (
        <p className="text-sm text-green-700 dark:text-green-400">El linter no marca nada</p>
      )}
      {estado === 'listo' && diagnosticos.length > 0 && (
        <div className="space-y-2">
          {[...porArchivo].map(([archivo, diagnosticosArchivo]) => (
            <section key={archivo} className="space-y-1">
              <h5 className="font-mono text-xs font-semibold text-muted-foreground" translate="no">
                {archivo}
              </h5>
              <ul className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm">
                {diagnosticosArchivo.map((diagnostico, indice) => (
                  <Diagnostico key={`${diagnostico.linea}:${diagnostico.columna}:${indice}`} diagnostico={diagnostico} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
