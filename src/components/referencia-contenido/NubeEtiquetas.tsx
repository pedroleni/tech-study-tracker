import { Tags } from 'lucide-react'

export interface EtiquetaNube {
  texto: string
  peso: number
}

export interface PropiedadesNubeEtiquetas {
  etiquetas: EtiquetaNube[]
  titulo?: string
}

export function NubeEtiquetas({
  etiquetas,
  titulo = 'Conceptos de la lección',
}: PropiedadesNubeEtiquetas) {
  if (etiquetas.length === 0) return null
  const pesos = etiquetas.map((etiqueta) => etiqueta.peso)
  const minimo = Math.min(...pesos)
  const maximo = Math.max(...pesos)

  return (
    <section aria-label={titulo} className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Tags aria-hidden="true" className="size-4 text-teal-600 dark:text-teal-400" />
        {titulo}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {etiquetas.map((etiqueta, indice) => {
          const proporcion = maximo === minimo ? 0.5 : (etiqueta.peso - minimo) / (maximo - minimo)
          return (
            <span
              key={`${etiqueta.texto}-${indice}`}
              className="animate-in fade-in-0 zoom-in-90 inline-block animate-[catalogo-flotar_4s_ease-in-out_infinite] rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-600 motion-reduce:animate-none dark:bg-teal-950/40 dark:text-teal-400"
              style={{
                fontSize: `${0.75 + proporcion * 0.75}rem`,
                animationDelay: `${indice * -320}ms`,
              }}
            >
              {etiqueta.texto}
            </span>
          )
        })}
      </div>
    </section>
  )
}
