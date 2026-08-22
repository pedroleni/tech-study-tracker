import { ListChecks } from 'lucide-react'

import type { DatosNotasClave } from '@/lib/laboratorio/schemas'

export function NotasClave({ items }: DatosNotasClave) {
  return (
    <section
      aria-label="Puntos clave"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 dark:bg-teal-950/40">
          <ListChecks
            aria-hidden="true"
            className="size-4.75 text-teal-600 dark:text-teal-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5 pt-1">
          <p className="text-[11px] font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
            Puntos clave
          </p>
        </div>
      </div>

      <ul className="grid list-none! gap-3 pl-0!">
        {items.map((item, indice) => (
          <li
            key={`${item.titulo}-${indice}`}
            className="animate-in fade-in-0 slide-in-from-left-2 flex gap-3 rounded-lg bg-muted/50 p-3.5 duration-300 motion-reduce:animate-none"
            style={{ animationDelay: `${indice * 70}ms`, animationFillMode: 'both' }}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white dark:bg-teal-400 dark:text-teal-950"
            >
              {indice + 1}
            </span>
            <p className="text-sm text-pretty">
              <span className="font-semibold">{item.titulo}</span>{' '}
              <span className="text-muted-foreground">{item.texto}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
