import { Eraser } from 'lucide-react'
import { Fragment } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type EntradaConsola = {
  id: number
  nivel: 'log' | 'info' | 'warn' | 'error'
  texto: string
  commit: number
}

// El nivel va escrito, no solo en color.
const NIVELES: Record<EntradaConsola['nivel'], { etiqueta: string; clase: string }> = {
  log: { etiqueta: 'log', clase: 'text-foreground' },
  info: { etiqueta: 'info', clase: 'text-sky-700 dark:text-sky-300' },
  warn: { etiqueta: 'aviso', clase: 'text-amber-700 dark:text-amber-300' },
  error: { etiqueta: 'error', clase: 'text-red-700 dark:text-red-400' },
}

export function ConsolaReact({
  entradas,
  onLimpiar,
}: {
  entradas: EntradaConsola[]
  onLimpiar: () => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Consola</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onLimpiar}>
          <Eraser aria-hidden="true" />
          Limpiar
        </Button>
      </div>
      <div
        role="log"
        aria-label="Consola de la vista previa"
        className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-2 font-mono text-xs"
      >
        {entradas.length === 0 ? (
          <p className="px-1 py-0.5 text-muted-foreground">Todavía no hay mensajes.</p>
        ) : (
          <ol className="space-y-0.5">
            {entradas.map((entrada, indice) => (
              <Fragment key={entrada.id}>
                {/* Un separador cada vez que React completa un commit entre dos mensajes:
                    así se ve qué se imprimió en qué render. */}
                {indice > 0 && entrada.commit !== entradas[indice - 1].commit && (
                  <li className="flex items-center gap-2 py-1 text-muted-foreground">
                    <span aria-hidden="true" className="h-px flex-1 bg-border" />
                    <span>commit {entrada.commit}</span>
                    <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  </li>
                )}
                <li className={cn('flex gap-2 px-1', NIVELES[entrada.nivel].clase)}>
                  <span className="w-10 shrink-0 font-semibold opacity-70">
                    {NIVELES[entrada.nivel].etiqueta}
                  </span>
                  <span className="min-w-0 break-words whitespace-pre-wrap">{entrada.texto}</span>
                </li>
              </Fragment>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
