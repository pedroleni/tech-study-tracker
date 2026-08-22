import { LayoutGrid } from 'lucide-react'

import type { DatosRoles } from '@/lib/laboratorio/schemas'

const clasesRol = [
  'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-200',
  'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
  'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
  'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200',
] as const

export function Roles({ titulo = 'Reparto de roles', roles }: DatosRoles) {
  return (
    <section
      aria-label="Reparto de roles"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-fuchsia-50 dark:bg-fuchsia-950/40">
          <LayoutGrid
            aria-hidden="true"
            className="size-4.75 text-fuchsia-600 dark:text-fuchsia-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-fuchsia-600 uppercase dark:text-fuchsia-400">
            Reparto de roles
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <ul className="flex list-none! flex-col gap-4 pl-0! sm:flex-row sm:flex-wrap">
        {roles.map((item, indice) => (
          <li
            key={`${item.etiqueta}-${indice}`}
            className="animate-in fade-in-0 zoom-in-95 min-w-0 flex-1 rounded-lg border bg-background/50 p-4 duration-300 motion-reduce:animate-none sm:min-w-36"
            style={{ animationDelay: `${indice * 70}ms`, animationFillMode: 'both' }}
          >
            <h4 className="break-words text-base font-bold text-balance">{item.etiqueta}</h4>
            <span
              className={`mt-2 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${clasesRol[indice % clasesRol.length]}`}
            >
              <span className="break-words">{item.rol}</span>
            </span>
            <p className="mt-3 break-words text-sm text-pretty text-muted-foreground">
              {item.descripcion}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
