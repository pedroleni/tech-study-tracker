export interface PropiedadesMedidorDificultad {
  nivel: 1 | 2 | 3 | 4 | 5
  etiqueta: string
}

export function MedidorDificultad({ nivel, etiqueta }: PropiedadesMedidorDificultad) {
  return (
    <div
      aria-label={`${etiqueta}: ${nivel} de 5`}
      className="inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm"
    >
      <span className="text-sm font-medium">{etiqueta}</span>
      <span aria-hidden="true" className="flex h-6 items-end gap-1">
        {Array.from({ length: 5 }, (_, indice) => {
          const rellena = indice < nivel
          return (
            <span
              key={indice}
              className={`w-2 origin-bottom rounded-full ${
                rellena
                  ? 'animate-in zoom-in-0 bg-amber-600 duration-300 motion-reduce:animate-none dark:bg-amber-400'
                  : 'bg-muted'
              }`}
              style={{
                height: `${10 + indice * 3}px`,
                animationDelay: `${indice * 90}ms`,
                animationFillMode: 'both',
              }}
            />
          )
        })}
      </span>
    </div>
  )
}
