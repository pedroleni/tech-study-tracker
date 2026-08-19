export interface ItemPasos {
  titulo: string
  descripcion: string
}

export interface PropiedadesPasos {
  pasos: ItemPasos[]
  pasoActivo: number
}

export function Pasos({ pasos, pasoActivo }: PropiedadesPasos) {
  if (pasos.length === 0) return null

  const activo = Math.min(Math.max(pasoActivo, 1), pasos.length)

  return (
    <ol aria-label={`Paso ${activo} de ${pasos.length}`} className="space-y-0">
      {pasos.map((paso, indice) => {
        const numero = indice + 1
        const completado = numero < activo
        const actual = numero === activo

        return (
          <li key={`${paso.titulo}-${indice}`} className="relative flex gap-4 pb-6 last:pb-0">
            {indice < pasos.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-9 bottom-0 left-[17px] w-0.5 ${completado ? 'bg-primary' : 'bg-border'}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-[background-color,border-color,color,transform] duration-300 motion-reduce:transition-none ${
                actual
                  ? 'scale-110 border-primary bg-primary text-primary-foreground'
                  : completado
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {numero}
            </span>
            <div className="min-w-0 pt-1">
              <p className={`font-semibold text-balance ${actual ? 'text-foreground' : ''}`}>
                {paso.titulo}
                {actual && <span className="sr-only"> (paso actual)</span>}
              </p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{paso.descripcion}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
