import { cn } from '@/lib/utils'

const buttonClassName =
  'min-h-10 touch-manipulation rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50'

export function Pagination({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
}: {
  paginaActual: number
  totalPaginas: number
  onCambiarPagina: (pagina: number) => void
}) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        disabled={paginaActual === 1}
        onClick={() => onCambiarPagina(paginaActual - 1)}
        className={cn(buttonClassName, 'bg-background hover:bg-muted hover:text-foreground')}
      >
        Anterior
      </button>
      {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => (
        <button
          key={pagina}
          type="button"
          aria-current={pagina === paginaActual ? 'page' : undefined}
          onClick={() => onCambiarPagina(pagina)}
          className={cn(
            buttonClassName,
            'min-w-10',
            pagina === paginaActual
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {pagina}
        </button>
      ))}
      <button
        type="button"
        disabled={paginaActual === totalPaginas}
        onClick={() => onCambiarPagina(paginaActual + 1)}
        className={cn(buttonClassName, 'bg-background hover:bg-muted hover:text-foreground')}
      >
        Siguiente
      </button>
    </nav>
  )
}
