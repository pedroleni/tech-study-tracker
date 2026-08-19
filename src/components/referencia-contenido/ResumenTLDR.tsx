import { Bookmark } from 'lucide-react'

export interface PropiedadesResumenTLDR {
  titulo: string
  puntos: string[]
}

export function ResumenTLDR({ titulo, puntos }: PropiedadesResumenTLDR) {
  if (puntos.length === 0) return null

  return (
    <section className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <Bookmark
        aria-hidden="true"
        className="absolute top-0 right-5 size-12 fill-primary-foreground/10 text-primary-foreground/20"
      />
      <div className="relative max-w-2xl">
        <p className="text-[11px] font-bold tracking-wider uppercase opacity-70">TL;DR</p>
        <h3 className="mt-1 text-lg font-semibold text-balance">{titulo}</h3>
        <ul className="mt-4 space-y-2">
          {puntos.map((punto, indice) => (
            <li key={`${punto}-${indice}`} className="flex gap-3 text-sm text-pretty">
              <span aria-hidden="true" className="font-bold opacity-60">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span>{punto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
