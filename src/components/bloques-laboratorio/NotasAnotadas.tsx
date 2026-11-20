import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Botones numerados y nota activa de los bloques anotados (código, React, Git y
// SQL). Cada bloque solo cambia su color y el nombre del grupo de botones. Las
// clases van escritas enteras para que Tailwind las encuentre.
const COLORES = {
  amber: {
    boton:
      'border-amber-500 bg-amber-500 text-white hover:bg-amber-500 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950',
    nota: 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30',
  },
  sky: {
    boton:
      'border-sky-500 bg-sky-500 text-white hover:bg-sky-500 dark:border-sky-400 dark:bg-sky-400 dark:text-sky-950',
    nota: 'border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/30',
  },
  orange: {
    boton:
      'border-orange-500 bg-orange-500 text-white hover:bg-orange-500 dark:border-orange-400 dark:bg-orange-400 dark:text-orange-950',
    nota: 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/30',
  },
  teal: {
    boton:
      'border-teal-500 bg-teal-500 text-white hover:bg-teal-500 dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950',
    nota: 'border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/30',
  },
} as const

export type ColorNotas = keyof typeof COLORES

export function NotasAnotadas({
  anotaciones,
  activa,
  onActivar,
  idNota,
  etiqueta,
  color,
}: {
  anotaciones: readonly { fragmento: string; nota: string }[]
  activa: number
  onActivar: (indice: number) => void
  idNota: string
  etiqueta: string
  color: ColorNotas
}) {
  if (anotaciones.length === 0) return null
  const clases = COLORES[color]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" aria-label={etiqueta}>
        {anotaciones.map((anotacion, indice) => (
          <Button
            key={`${anotacion.fragmento}-${indice}`}
            type="button"
            variant="outline"
            size="icon"
            aria-pressed={indice === activa}
            aria-controls={idNota}
            aria-label={`Ver anotación ${indice + 1}: ${anotacion.nota}`}
            onClick={() => onActivar(indice)}
            className={cn(
              'size-11 touch-manipulation rounded-full transition-colors',
              indice === activa && clases.boton,
            )}
          >
            {indice + 1}
          </Button>
        ))}
      </div>
      <p
        key={activa}
        id={idNota}
        aria-live="polite"
        className={cn(
          'animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border-l-4 p-3 text-sm text-pretty duration-200 motion-reduce:animate-none',
          clases.nota,
        )}
      >
        <span className="font-semibold">Nota {activa + 1}.</span> {anotaciones[activa]?.nota}
      </p>
    </div>
  )
}
