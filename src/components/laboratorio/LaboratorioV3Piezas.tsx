import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'

import type { AnalisisV3, TonoV3 } from './laboratorio-v3-modelo'

const TRAZO_ICONO: Record<TonoV3, string> = {
  bien: 'M3 8.5l3.4 3.4L13 5',
  mal: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  igual: 'M3.5 6.5h9M3.5 9.5h9',
}

export function IconoV3({ tono }: { tono: TonoV3 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRAZO_ICONO[tono]} />
    </svg>
  )
}

/**
 * Una línea del diff. El signo no es solo decoración: distingue quitado de
 * añadido sin depender del color, que es la única forma de que también
 * funcione para quien no distingue rojo y verde.
 */
export function LineaDiffV3({
  signo,
  descripcion,
  codigo,
  etiqueta,
  destructivo,
}: {
  signo: string
  descripcion: string
  codigo: string
  etiqueta: string
  destructivo: boolean
}) {
  return (
    <div className="flex min-w-0 items-stretch gap-2">
      <span
        className={cn(
          'flex w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold',
          destructivo
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-primary/30 bg-primary/10 text-foreground'
        )}
      >
        <span aria-hidden="true">{signo}</span>
        <span className="sr-only">{descripcion}</span>
      </span>
      <CodigoResaltado
        codigo={codigo}
        lenguaje="html"
        etiqueta={etiqueta}
        className={cn(
          'min-w-0 flex-1',
          destructivo ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'
        )}
      />
    </div>
  )
}

export function ListaRecorridoV3({
  analisis,
  titulo,
  destructivo,
}: {
  analisis: AnalisisV3
  titulo: string
  destructivo: boolean
}) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-xl border p-4',
        destructivo ? 'border-destructive/40 bg-destructive/5' : 'border-primary/40 bg-primary/5'
      )}
    >
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <p className="mt-1 text-xs text-muted-foreground">Lo que alcanza el tabulador, en orden.</p>
      <ol className="mt-3 space-y-1.5">
        {analisis.recorrido.map((paso, indice) => (
          <li key={`${paso.etiqueta}-${indice}`} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {indice + 1}
            </span>
            <span className="truncate">{paso.texto}</span>
            <span className="shrink-0 opacity-40">&lt;{paso.etiqueta}&gt;</span>
            {!paso.conNombre && (
              <span className="shrink-0 rounded bg-destructive/10 px-1 text-[10px] font-medium text-destructive">
                sin nombre
              </span>
            )}
          </li>
        ))}
      </ol>
      {analisis.trampas.length > 0 ? (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-2">
          <p className="text-xs font-semibold text-destructive">El tabulador salta por encima de esto</p>
          <ul className="mt-1 space-y-1">
            {analisis.trampas.map((trampa, indice) => (
              <li key={`${trampa.etiqueta}-${indice}`} className="text-xs">
                {trampa.texto} <span className="opacity-40">&lt;{trampa.etiqueta}&gt;</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium">
          <IconoV3 tono="bien" />
          Nada se queda fuera: todo lo pulsable se alcanza con el teclado.
        </p>
      )}
    </section>
  )
}
