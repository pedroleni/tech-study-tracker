import { BookOpen, ExternalLink } from 'lucide-react'

export interface RecursoCuadricula {
  titulo: string
  descripcion: string
  url: string
  etiqueta?: string
}

export interface PropiedadesCuadriculaRecursos {
  recursos: RecursoCuadricula[]
}

function urlWebSegura(url: string) {
  try {
    const protocolo = new URL(url).protocol
    return protocolo === 'http:' || protocolo === 'https:' ? url : null
  } catch {
    return null
  }
}

export function CuadriculaRecursos({ recursos }: PropiedadesCuadriculaRecursos) {
  const recursosSeguros = recursos.flatMap((recurso) => {
    const url = urlWebSegura(recurso.url)
    return url ? [{ ...recurso, url }] : []
  })

  if (recursosSeguros.length === 0) return null

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {recursosSeguros.map((recurso) => (
        <li key={`${recurso.url}-${recurso.titulo}`}>
          <a
            href={recurso.url}
            target="_blank"
            rel="noreferrer"
            className="group flex h-full min-w-0 touch-manipulation flex-col rounded-xl border bg-card p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:p-5"
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
            <h3 className="mt-1 break-words font-semibold text-balance">{recurso.titulo}</h3>
            <p className="mt-2 break-words text-sm text-pretty text-muted-foreground">
              {recurso.descripcion}
            </p>
          </a>
        </li>
      ))}
    </ul>
  )
}
