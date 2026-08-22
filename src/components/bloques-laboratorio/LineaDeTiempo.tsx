import { History } from 'lucide-react'

import type { DatosLineaDeTiempo } from '@/lib/laboratorio/schemas'

export function LineaDeTiempo({
  titulo = 'Cómo se llegó hasta aquí',
  items,
}: DatosLineaDeTiempo) {
  return (
    <section
      aria-label="Línea de tiempo"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 dark:bg-indigo-950/40">
          <History
            aria-hidden="true"
            className="size-4.75 text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Línea de tiempo
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <ol className="relative ml-2 list-none! border-l pl-0!">
        {items.map((item, indice) => (
          <li
            key={`${item.titulo}-${indice}`}
            className="animate-in fade-in-0 slide-in-from-bottom-2 relative pb-7 pl-7 duration-500 last:pb-0 motion-reduce:animate-none"
            style={{ animationDelay: `${indice * 90}ms`, animationFillMode: 'both' }}
          >
            <span
              aria-hidden="true"
              className="absolute top-1 -left-2 size-4 rounded-full border-4 border-background bg-indigo-500 dark:bg-indigo-400"
            />
            {item.fecha && (
              <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                {item.fecha}
              </p>
            )}
            <h4 className="font-semibold text-balance">{item.titulo}</h4>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
