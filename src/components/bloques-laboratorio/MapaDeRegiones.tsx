import { LayoutTemplate } from 'lucide-react'

import type { DatosMapaDeRegiones } from '@/lib/laboratorio/schemas'

const clasesRegion = [
  'border-blue-300 bg-blue-50/80 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100',
  'border-violet-300 bg-violet-50/80 text-violet-900 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100',
  'border-amber-300 bg-amber-50/80 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
  'border-emerald-300 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
  'border-rose-300 bg-rose-50/80 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100',
  'border-cyan-300 bg-cyan-50/80 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-100',
] as const

export function MapaDeRegiones({
  titulo = 'Mapa de regiones de la página',
  regiones,
}: DatosMapaDeRegiones) {
  return (
    <section
      aria-label="Mapa de regiones"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 dark:bg-sky-950/40">
          <LayoutTemplate
            aria-hidden="true"
            className="size-4.75 text-sky-600 dark:text-sky-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            Estructura de la página
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border bg-background p-3 sm:p-4">
        <div className="space-y-3">
          {regiones.map((region, indice) => (
            <div
              key={`${region.elemento}-${region.landmark}-${indice}`}
              className={`flex min-h-24 min-w-0 flex-col justify-center rounded-lg border-l-4 p-4 shadow-xs ${clasesRegion[indice % clasesRegion.length]}`}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h4 className="mr-1 break-words text-sm font-bold text-balance">
                  {region.etiqueta}
                </h4>
                <code
                  translate="no"
                  className="max-w-full rounded border border-current bg-background/80 px-2 py-0.5 text-[11px] font-semibold break-all"
                >
                  &lt;{region.elemento}&gt;
                </code>
                <code
                  translate="no"
                  className="max-w-full rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold break-all"
                >
                  role: {region.landmark}
                </code>
              </div>
              <p className="mt-3 break-words text-sm text-pretty text-muted-foreground">
                {region.contenido}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
