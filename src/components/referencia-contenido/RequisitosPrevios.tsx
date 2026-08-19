import { Check, Flag } from 'lucide-react'

export interface PropiedadesRequisitosPrevios {
  titulo: string
  requisitos: string[]
}

export function RequisitosPrevios({ titulo, requisitos }: PropiedadesRequisitosPrevios) {
  if (requisitos.length === 0) return null

  return (
    <section className="overflow-hidden rounded-xl border border-t-4 border-t-violet-600 bg-card shadow-sm dark:border-t-violet-400">
      <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3 sm:px-5">
        <Flag aria-hidden="true" className="size-5 text-violet-600 dark:text-violet-400" />
        <h3 className="font-semibold text-balance">{titulo}</h3>
      </div>
      <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {requisitos.map((requisito, indice) => (
          <li key={`${requisito}-${indice}`} className="flex items-start gap-2 text-sm">
            <Check
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-violet-600 dark:text-violet-400"
            />
            <span className="text-pretty">{requisito}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
