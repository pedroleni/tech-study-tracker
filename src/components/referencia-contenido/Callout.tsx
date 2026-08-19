import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'

export interface PropiedadesCallout {
  variante: 'info' | 'aviso' | 'error' | 'exito'
  titulo: string
  contenido: string
}

const variantes = {
  info: {
    Icono: Info,
    contenedor: 'border-blue-200 bg-card dark:border-blue-950',
    icono: 'bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-950',
    etiqueta: 'text-blue-600 dark:text-blue-400',
  },
  aviso: {
    Icono: TriangleAlert,
    contenedor: 'border-amber-200 bg-card dark:border-amber-950',
    icono: 'bg-amber-600 text-white dark:bg-amber-400 dark:text-amber-950',
    etiqueta: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    Icono: CircleX,
    contenedor: 'border-red-200 bg-card dark:border-red-950',
    icono: 'bg-red-600 text-white dark:bg-red-400 dark:text-red-950',
    etiqueta: 'text-red-600 dark:text-red-400',
  },
  exito: {
    Icono: CircleCheck,
    contenedor: 'border-green-200 bg-card dark:border-green-950',
    icono: 'bg-green-600 text-white dark:bg-green-400 dark:text-green-950',
    etiqueta: 'text-green-600 dark:text-green-400',
  },
} as const

export function Callout({ variante, titulo, contenido }: PropiedadesCallout) {
  const { Icono, contenedor, icono, etiqueta } = variantes[variante]

  return (
    <aside
      className={`animate-in fade-in-0 slide-in-from-left-2 rounded-xl border p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5 ${contenedor}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${icono}`}
        >
          <Icono className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className={`text-[11px] font-bold tracking-wider uppercase ${etiqueta}`}>{titulo}</p>
          <p className="mt-1 break-words text-sm text-pretty text-foreground">{contenido}</p>
        </div>
      </div>
    </aside>
  )
}
