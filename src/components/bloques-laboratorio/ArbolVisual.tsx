import { cn } from '@/lib/utils'

// Dibujo común del árbol de componentes: lo usan el panel en vivo
// (ArbolDeRenders, datos del iframe) y el bloque estático
// (ArbolDeComponentes, datos del autor). Ver specs/features/react-en-vivo.md.

export type EstadoNodoArbol = 'montado' | 'renderizado' | 'sin-cambios' | 'desmontado'

export type NodoVisual = {
  id: string | number
  nivel: number
  nombre: string
  clave?: string
  marca?: string
  etiqueta?: string
  estado?: EstadoNodoArbol
  renders?: number
  nota?: string
  motivo?: string
}

// El estado va escrito, no solo en color.
const ESTADOS_ARBOL: Record<EstadoNodoArbol, { texto: string; significado: string; clase: string }> = {
  montado: {
    texto: 'montado',
    significado: 'aparece ahora, su estado empieza de cero',
    clase: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  renderizado: {
    texto: 're-render',
    significado: 'se ha vuelto a ejecutar, conserva su estado',
    clase: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  'sin-cambios': {
    texto: 'sin cambios',
    significado: 'no se ha ejecutado en este commit',
    clase: 'bg-muted text-muted-foreground',
  },
  desmontado: {
    texto: 'desmontado',
    significado: 'ha desaparecido, y su estado con él',
    clase: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  },
}

// Guías tipo `tree`: "├─ " si al nodo le quedan hermanos debajo, "└─ " si es
// el último, y "│ " por cada antepasado al que todavía le quedan hermanos.
function prefijos(nodos: { nivel: number }[]) {
  const quedanHermanos = nodos.map((nodo, i) => {
    for (let j = i + 1; j < nodos.length; j += 1) {
      if (nodos[j].nivel < nodo.nivel) return false
      if (nodos[j].nivel === nodo.nivel) return true
    }
    return false
  })
  const abiertos: boolean[] = []
  return nodos.map((nodo, i) => {
    abiertos[nodo.nivel] = quedanHermanos[i]
    abiertos.length = nodo.nivel + 1
    if (nodo.nivel === 0) return ''
    let prefijo = ''
    for (let nivel = 1; nivel < nodo.nivel; nivel += 1) prefijo += abiertos[nivel] ? '│ ' : '  '
    return prefijo + (quedanHermanos[i] ? '├─ ' : '└─ ')
  })
}

export function ArbolVisual({
  nodos,
  etiqueta,
  destello,
  seleccionado,
  idDetalle,
  onSeleccionar,
}: {
  nodos: NodoVisual[]
  etiqueta: string
  // Número de commit: los nodos montados o re-renderizados destellan una vez por commit.
  destello?: number
  seleccionado?: string | number | null
  idDetalle?: string
  onSeleccionar?: (id: string | number) => void
}) {
  const guias = prefijos(nodos)

  return (
    <ul aria-label={etiqueta} className="min-w-0 space-y-0.5 font-mono text-xs">
      {nodos.map((nodo, i) => {
        const estado = nodo.estado ? ESTADOS_ARBOL[nodo.estado] : null
        const destella =
          destello !== undefined && (nodo.estado === 'montado' || nodo.estado === 'renderizado')
        const claseNombre = cn('font-semibold', nodo.estado === 'desmontado' && 'line-through opacity-70')
        return (
          <li
            // Con el número de commit en la key, la fila se vuelve a crear y el destello se repite.
            key={destella ? `${nodo.id}-${destello}` : nodo.id}
            className={cn(
              'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded px-1 py-0.5',
              destella && 'animate-[arbol-destello_900ms_ease-out] motion-reduce:animate-none',
            )}
          >
            <span className="flex min-w-0 items-baseline">
              <span aria-hidden="true" className="whitespace-pre text-muted-foreground/70">
                {guias[i]}
              </span>
              {onSeleccionar ? (
                <button
                  type="button"
                  aria-expanded={seleccionado === nodo.id}
                  aria-controls={seleccionado === nodo.id ? idDetalle : undefined}
                  onClick={() => onSeleccionar(nodo.id)}
                  className={cn(
                    claseNombre,
                    'rounded underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  )}
                >
                  {nodo.nombre}
                </button>
              ) : (
                <span className={claseNombre}>{nodo.nombre}</span>
              )}
            </span>
            {nodo.clave !== undefined && <span className="text-muted-foreground">key={nodo.clave}</span>}
            {nodo.renders !== undefined && (
              <>
                <span aria-hidden="true" className="text-muted-foreground">
                  ·{nodo.renders}
                </span>
                <span className="sr-only">
                  {nodo.renders === 1 ? '1 render' : `${nodo.renders} renders`}
                </span>
              </>
            )}
            {nodo.marca && (
              <span className="rounded border px-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                {nodo.marca}
              </span>
            )}
            {nodo.etiqueta && (
              <span className="rounded bg-sky-100 px-1.5 text-[11px] text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                {nodo.etiqueta}
              </span>
            )}
            {estado && (
              <span className={cn('rounded px-1.5 text-[10px] font-semibold', estado.clase)}>{estado.texto}</span>
            )}
            {nodo.motivo && (
              <span className="flex min-w-0 gap-1 font-sans text-amber-800 dark:text-amber-300">
                <span aria-hidden="true">←</span>
                <span className="min-w-0 break-words">{nodo.motivo}</span>
              </span>
            )}
            {nodo.nota && <span className="min-w-0 font-sans break-words text-muted-foreground">{nodo.nota}</span>}
            <span className="sr-only">, nivel {nodo.nivel}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function LeyendaArbol() {
  return (
    <ul aria-label="Leyenda" className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {Object.values(ESTADOS_ARBOL).map((estado) => (
        <li key={estado.texto} className="flex items-baseline gap-1.5">
          <span className={cn('rounded px-1.5 font-mono text-[10px] font-semibold', estado.clase)}>{estado.texto}</span>
          {estado.significado}
        </li>
      ))}
    </ul>
  )
}
