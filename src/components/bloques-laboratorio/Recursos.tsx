import { BookOpen, ExternalLink, Library } from 'lucide-react'

import type { DatosRecursos } from '@/lib/laboratorio/schemas'

function urlWebSegura(url: string) {
  try {
    const protocolo = new URL(url).protocol
    return protocolo === 'http:' || protocolo === 'https:' ? url : null
  } catch {
    return null
  }
}

export function Recursos({ titulo = 'Para profundizar', recursos }: DatosRecursos) {
  const recursosSeguros = recursos.flatMap((recurso) => {
    const url = urlWebSegura(recurso.url)
    return url ? [{ ...recurso, url }] : []
  })

  if (recursosSeguros.length === 0) return null

  return (
    <section
      aria-label="Recursos para profundizar"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-cyan-50 dark:bg-cyan-950/40">
          <Library aria-hidden="true" className="size-4.75 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            Recursos
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>

      <ul className="grid list-none! gap-4 pl-0! sm:grid-cols-2">
        {recursosSeguros.map((recurso, indice) => (
          <li
            key={`${recurso.url}-${recurso.titulo}`}
            className="animate-in fade-in-0 zoom-in-95 duration-300 motion-reduce:animate-none"
            style={{ animationDelay: `${indice * 70}ms`, animationFillMode: 'both' }}
          >
            <a
              href={recurso.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full min-w-0 touch-manipulation flex-col rounded-xl border bg-background/50 p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                  <BookOpen aria-hidden="true" className="size-4.5" />
                </span>
                <ExternalLink
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </div>
              {recurso.etiqueta && (
                <p className="mt-4 text-[11px] font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
                  {recurso.etiqueta}
                </p>
              )}
              <h4 className="mt-1 break-words font-semibold text-balance">{recurso.titulo}</h4>
              <p className="mt-2 break-words text-sm text-pretty text-muted-foreground">
                {recurso.descripcion}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
