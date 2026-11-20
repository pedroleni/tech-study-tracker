import { cn } from '@/lib/utils'

// Todas las categorías del catálogo, en el orden en que aparecen en la página — la
// lista para los chips de filtro se mantiene a mano porque los títulos de
// GrupoCatalogo también están escritos a mano, no generados desde aquí.
const CATEGORIAS = [
  'Bloques de laboratorio',
  'Avisos y alertas',
  'Navegación y contenido expandible',
  'Estructura secuencial',
  'Enriquecimiento de texto',
  'Metadatos y progreso',
  'Comparación y verificación',
  'Tarjetas de recursos',
  'Carruseles',
  'Efectos 3D',
  'Animaciones de scroll',
  'Texto dinámico',
  'Interactivos',
  'Datos animados',
]

export function FiltroCategorias({
  categoriaActiva,
  onCambiar,
}: {
  categoriaActiva: string | null
  onCambiar: (categoria: string | null) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar componentes por categoría"
      className="sticky top-0 z-10 -mx-1 flex flex-wrap gap-2 border-b bg-background px-1 py-3"
    >
      <button
        type="button"
        aria-pressed={categoriaActiva === null}
        onClick={() => onCambiar(null)}
        className={cn(
          'min-h-9 touch-manipulation rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          categoriaActiva === null
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Todas
      </button>
      {CATEGORIAS.map((categoria) => {
        const activa = categoriaActiva === categoria
        return (
          <button
            key={categoria}
            type="button"
            aria-pressed={activa}
            onClick={() => onCambiar(activa ? null : categoria)}
            className={cn(
              'min-h-9 touch-manipulation rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activa
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {categoria}
          </button>
        )
      })}
    </div>
  )
}
