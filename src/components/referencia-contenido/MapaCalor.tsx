export interface CeldaMapaCalor {
  etiqueta: string
  intensidad: number
}

export interface PropiedadesMapaCalor {
  celdas: CeldaMapaCalor[]
  columnas?: number
  titulo: string
}

const intensidades = [
  'bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-50',
  'bg-blue-600/25 text-blue-950 dark:bg-blue-600/25 dark:text-blue-50',
  'bg-blue-600/45 text-blue-950 dark:bg-blue-600/45 dark:text-blue-50',
  'bg-blue-600/70 text-white dark:bg-blue-400/70 dark:text-blue-950',
  'bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-950',
]

export function MapaCalor({ celdas, columnas = 7, titulo }: PropiedadesMapaCalor) {
  if (celdas.length === 0) return null
  const columnasVisibles = Math.min(12, Math.max(1, columnas))

  return (
    <figure className="rounded-xl border bg-card p-5 shadow-sm">
      <figcaption className="font-semibold text-balance">{titulo}</figcaption>
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columnasVisibles}, minmax(0, 1fr))` }}
      >
        {celdas.map((celda, indice) => {
          const nivel = Math.min(4, Math.max(0, Math.round(celda.intensidad * 4)))
          return (
            <div
              key={`${celda.etiqueta}-${indice}`}
              aria-label={`${celda.etiqueta}: intensidad ${nivel} de 4`}
              className={`animate-in fade-in-0 zoom-in-75 aspect-square min-w-0 rounded-md duration-300 motion-reduce:animate-none ${intensidades[nivel]}`}
              style={{ animationDelay: `${indice * 28}ms`, animationFillMode: 'both' }}
            >
              <span className="sr-only">{celda.etiqueta}</span>
            </div>
          )
        })}
      </div>
      <div aria-hidden="true" className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        Menos
        {intensidades.map((clase, indice) => (
          <span key={indice} className={`size-3 rounded-sm ${clase}`} />
        ))}
        Más
      </div>
    </figure>
  )
}
