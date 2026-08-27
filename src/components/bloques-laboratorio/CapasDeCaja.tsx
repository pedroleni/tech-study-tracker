import { Box } from 'lucide-react'

import type { DatosCapasDeCaja } from '@/lib/laboratorio/schemas'

export function CapasDeCaja({
  titulo = 'El modelo de caja, capa por capa',
  margin,
  border,
  padding,
  content,
}: DatosCapasDeCaja) {
  return (
    <section
      aria-label="Capas del modelo de caja de CSS"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-orange-50 dark:bg-orange-950/40">
          <Box
            aria-hidden="true"
            className="size-4.75 text-orange-600 dark:text-orange-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Radiografía de una caja
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border bg-background p-2 sm:p-3">
        <div className="min-w-0 rounded-md border border-dashed border-orange-300 bg-orange-50/80 p-3 text-orange-900 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-100 sm:p-4">
          <p className="text-[10px] font-bold tracking-wider uppercase">Margin</p>
          <p className="mt-0.5 break-words text-xs font-semibold">{margin}</p>

          <div className="mt-3 min-w-0 rounded-md border-2 border-yellow-400 bg-yellow-50/80 p-3 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-100 sm:mt-4 sm:p-4">
            <p className="text-[10px] font-bold tracking-wider uppercase">Border</p>
            <p className="mt-0.5 break-words text-xs font-semibold">{border}</p>

            <div className="mt-3 min-w-0 rounded-md border border-emerald-300 bg-emerald-50/80 p-3 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100 sm:mt-4 sm:p-4">
              <p className="text-[10px] font-bold tracking-wider uppercase">Padding</p>
              <p className="mt-0.5 break-words text-xs font-semibold">{padding}</p>

              <div className="mt-3 flex min-h-24 min-w-0 flex-col items-center justify-center rounded-md border border-blue-400 bg-blue-100 p-4 text-center text-blue-950 dark:border-blue-600 dark:bg-blue-900/70 dark:text-blue-50 sm:mt-4 sm:min-h-28">
                <p className="text-[10px] font-bold tracking-wider uppercase">Content</p>
                <p className="mt-2 max-w-full break-words text-sm font-semibold text-pretty">
                  {content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
