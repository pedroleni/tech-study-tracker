import { Tags } from 'lucide-react'

import type { DatosDiagramaEtiqueta } from '@/lib/laboratorio/schemas'

type RolParte = DatosDiagramaEtiqueta['partes'][number]['rol']
type RolEtiquetado = Exclude<RolParte, 'simbolo'>

const etiquetasRol: Record<RolEtiquetado, string> = {
  apertura: 'Etiqueta de apertura',
  'atributo-nombre': 'Nombre del atributo',
  'atributo-valor': 'Valor del atributo',
  contenido: 'Contenido',
  cierre: 'Etiqueta de cierre',
}

const clasesRol: Record<
  RolEtiquetado,
  { chip: string; etiqueta: string; muestra: string }
> = {
  apertura: {
    chip: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200',
    etiqueta: 'text-rose-700 dark:text-rose-300',
    muestra: 'bg-rose-500 dark:bg-rose-400',
  },
  'atributo-nombre': {
    chip: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
    etiqueta: 'text-emerald-700 dark:text-emerald-300',
    muestra: 'bg-emerald-500 dark:bg-emerald-400',
  },
  'atributo-valor': {
    chip: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-200',
    etiqueta: 'text-orange-700 dark:text-orange-300',
    muestra: 'bg-orange-500 dark:bg-orange-400',
  },
  contenido: {
    chip: 'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-200',
    etiqueta: 'text-cyan-700 dark:text-cyan-300',
    muestra: 'bg-cyan-500 dark:bg-cyan-400',
  },
  cierre: {
    chip: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200',
    etiqueta: 'text-rose-700 dark:text-rose-300',
    muestra: 'bg-rose-500 dark:bg-rose-400',
  },
}

export function DiagramaEtiqueta({
  titulo = 'Así se descompone esta etiqueta',
  partes,
}: DatosDiagramaEtiqueta) {
  const rolesPresentes = Array.from(
    new Set(
      partes.flatMap(({ rol }) =>
        rol === 'simbolo' ? [] : [rol satisfies RolEtiquetado],
      ),
    ),
  )

  return (
    <section
      aria-label="Diagrama de etiqueta"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-50 dark:bg-rose-950/40">
          <Tags
            aria-hidden="true"
            className="size-4.75 text-rose-600 dark:text-rose-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
            Anatomía de una etiqueta
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <div
        className="inline-flex max-w-full flex-wrap items-end gap-x-2.5 gap-y-3"
        aria-label={titulo}
      >
        {partes.map((parte, indice) => {
          if (parte.rol === 'simbolo') {
            return (
              <span
                key={`${parte.rol}-${parte.texto}-${indice}`}
                className="whitespace-pre font-mono text-sm text-muted-foreground"
              >
                {parte.texto}
              </span>
            )
          }

          const clases = clasesRol[parte.rol]

          return (
            <span
              key={`${parte.rol}-${parte.texto}-${indice}`}
              className="animate-in fade-in-0 zoom-in-95 inline-flex flex-col items-center gap-1 duration-300 motion-reduce:animate-none"
              style={{ animationDelay: `${indice * 60}ms`, animationFillMode: 'both' }}
            >
              <span
                className={`text-center text-[9px] leading-tight font-bold tracking-wide uppercase ${clases.etiqueta}`}
              >
                {etiquetasRol[parte.rol]}
              </span>
              <span
                className={`rounded-md border px-1.5 py-0.5 font-mono text-xs ${clases.chip}`}
              >
                {parte.texto}
              </span>
            </span>
          )
        })}
      </div>

      <ul className="grid gap-1.5 text-xs text-muted-foreground" aria-label="Leyenda">
        {rolesPresentes.map((rol) => (
          <li key={rol} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-sm ${clasesRol[rol].muestra}`}
            />
            <span>{etiquetasRol[rol]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
