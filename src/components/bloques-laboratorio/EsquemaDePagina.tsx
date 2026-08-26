import { LayoutDashboard } from 'lucide-react'

import type { DatosEsquemaDePagina } from '@/lib/laboratorio/schemas'

export function EsquemaDePagina({
  titulo = 'Cómo se distribuyen las regiones en la página',
  header,
  nav,
  main,
  aside,
  footer,
}: DatosEsquemaDePagina) {
  return (
    <section
      aria-label="Esquema de página"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-lime-50 dark:bg-lime-950/40">
          <LayoutDashboard
            aria-hidden="true"
            className="size-4.75 text-lime-600 dark:text-lime-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-lime-600 uppercase dark:text-lime-400">
            Anatomía de una página
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border bg-background p-2 sm:p-3">
        <div className="flex flex-col gap-2">
          <div className="flex min-h-16 min-w-0 flex-col justify-center rounded-md border border-blue-300 bg-blue-50/80 p-3 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100">
            <code translate="no" className="text-xs font-bold">
              &lt;header&gt;
            </code>
            <p className="mt-1 break-words text-sm text-muted-foreground">{header}</p>
          </div>

          {nav && (
            <div className="flex min-h-14 min-w-0 flex-col justify-center rounded-md border border-violet-300 bg-violet-50/80 p-3 text-violet-900 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100">
              <code translate="no" className="text-xs font-bold">
                &lt;nav&gt;
              </code>
              <p className="mt-1 break-words text-sm text-muted-foreground">{nav}</p>
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <div className="flex min-h-36 min-w-0 flex-1 flex-col justify-center rounded-md border border-amber-300 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
              <code translate="no" className="text-xs font-bold">
                &lt;main&gt;
              </code>
              <p className="mt-2 break-words text-sm text-muted-foreground">{main}</p>
            </div>

            {aside && (
              <div className="flex min-h-36 min-w-0 flex-col justify-center rounded-md border border-rose-300 bg-rose-50/80 p-4 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100 sm:w-40 sm:shrink-0">
                <code translate="no" className="text-xs font-bold">
                  &lt;aside&gt;
                </code>
                <p className="mt-2 break-words text-sm text-muted-foreground">{aside}</p>
              </div>
            )}
          </div>

          <div className="flex min-h-16 min-w-0 flex-col justify-center rounded-md border border-cyan-300 bg-cyan-50/80 p-3 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-100">
            <code translate="no" className="text-xs font-bold">
              &lt;footer&gt;
            </code>
            <p className="mt-1 break-words text-sm text-muted-foreground">{footer}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
