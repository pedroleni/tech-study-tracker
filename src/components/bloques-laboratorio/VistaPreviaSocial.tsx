import { Image, Share2 } from 'lucide-react'

import type { DatosVistaPreviaSocial } from '@/lib/laboratorio/schemas'

export function VistaPreviaSocial({
  titulo = 'Así se ve tu enlace al compartirlo',
  dominio,
  ogTitulo,
  ogDescripcion,
  imagenEtiqueta,
}: DatosVistaPreviaSocial) {
  return (
    <section
      aria-label="Vista previa social"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40">
          <Share2
            aria-hidden="true"
            className="size-4.75 text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            Vista previa social
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <div className="max-w-sm overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="flex aspect-[1.91/1] items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-4">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center text-muted-foreground">
            <Image aria-hidden="true" className="size-7" />
            <span translate="no" className="break-words font-mono text-xs">
              {imagenEtiqueta}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-1 p-3">
          <p
            translate="no"
            className="break-all text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
          >
            {dominio}
          </p>
          <h4 className="line-clamp-2 break-words text-base leading-snug font-bold text-pretty">
            {ogTitulo}
          </h4>
          <p className="line-clamp-2 break-words text-sm leading-snug text-pretty text-muted-foreground">
            {ogDescripcion}
          </p>
        </div>
      </div>
    </section>
  )
}
