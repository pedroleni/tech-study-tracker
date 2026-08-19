import { BookOpen, ExternalLink } from 'lucide-react'

export interface PropiedadesTarjetaRecursoExterno {
  titulo: string
  descripcion: string
  url: string
  dominio: string
}

function urlWebSegura(url: string) {
  try {
    const protocolo = new URL(url).protocol
    return protocolo === 'http:' || protocolo === 'https:' ? url : null
  } catch {
    return null
  }
}

export function TarjetaRecursoExterno({
  titulo,
  descripcion,
  url,
  dominio,
}: PropiedadesTarjetaRecursoExterno) {
  const urlSegura = urlWebSegura(url)
  if (!urlSegura) return null

  return (
    <a
      href={urlSegura}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 touch-manipulation items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:p-5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
        <BookOpen aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="min-w-0 break-words font-semibold text-balance">{titulo}</span>
          <ExternalLink
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </span>
        <span className="mt-1 block break-words text-sm text-pretty text-muted-foreground">
          {descripcion}
        </span>
        <span className="mt-3 block text-xs font-medium text-blue-600 dark:text-blue-400">
          {dominio}
        </span>
      </span>
    </a>
  )
}
