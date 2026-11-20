import { CircleCheck, CircleX } from 'lucide-react'

export function IndicadorCoincidencia({ coincide }: { coincide: boolean }) {
  if (coincide) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <CircleCheck aria-hidden="true" className="size-4" />
        Coincide con la solución
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
      <CircleX aria-hidden="true" className="size-4" />
      Todavía no coincide — sigue intentándolo
    </div>
  )
}
