import { useMemo } from 'react'

import { CLASES_TOKEN, tokenizarLineas, type Lenguaje } from '@/components/codigo/resaltador'
import { cn } from '@/lib/utils'
import '@/components/codigo/sintaxis.css'

export type PropiedadesCodigoResaltado = {
  /** El código a mostrar, tal cual. Nunca se interpreta como HTML. */
  codigo: string
  /** Lenguaje del tokenizador. Por defecto `'html'`. */
  lenguaje?: Lenguaje
  /** Números de línea a destacar, empezando en 1. Por ejemplo `[4]`. */
  lineasDestacadas?: number[]
  /** Muestra la columna de números de línea. Por defecto `false`. */
  numerarLineas?: boolean
  /** Nombre accesible del bloque. Por defecto `'Bloque de código'`. */
  etiqueta?: string
  /** Alto máximo antes de hacer scroll vertical, p. ej. `'20rem'`. */
  alturaMaxima?: string
  /** Clases extra para el contenedor. */
  className?: string
}

export function CodigoResaltado({
  codigo,
  lenguaje = 'html',
  lineasDestacadas,
  numerarLineas = false,
  etiqueta = 'Bloque de código',
  alturaMaxima,
  className,
}: PropiedadesCodigoResaltado) {
  const lineas = useMemo(() => tokenizarLineas(codigo, lenguaje), [codigo, lenguaje])
  const destacadas = useMemo(() => new Set(lineasDestacadas ?? []), [lineasDestacadas])

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-muted/40', className)}>
      {destacadas.size > 0 && (
        <p className="sr-only">
          Líneas destacadas de este ejemplo: {[...destacadas].join(', ')}.
        </p>
      )}

      {/*
        `region` + tabIndex: una caja con scroll tiene que poder recorrerse solo
        con el teclado, y un `pre` con `aria-label` no vale (rol genérico).
      */}
      <pre
        role="region"
        aria-label={etiqueta}
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- es justo lo contrario: sin tabIndex, axe marca «scrollable-region-focusable» y el bloque queda inalcanzable con el teclado */
        tabIndex={0}
        style={alturaMaxima ? { maxHeight: alturaMaxima } : undefined}
        className="m-0 overflow-auto p-3 font-mono text-xs leading-relaxed whitespace-pre focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {/* `w-fit min-w-full`: el fondo de la línea destacada llega hasta el
            final del código, no solo hasta el borde visible. */}
        <code className="block w-fit min-w-full">
          {lineas.map((linea) => (
            <span
              key={linea.numero}
              className={cn(
                'sintaxis-linea',
                destacadas.has(linea.numero) && 'sintaxis-linea-destacada'
              )}
            >
              {numerarLineas && (
                <span aria-hidden="true" className="sintaxis-numero-linea">
                  {linea.numero}
                </span>
              )}
              {linea.tokens.map((token, indice) => (
                <span key={indice} className={CLASES_TOKEN[token.tipo]}>
                  {token.texto}
                </span>
              ))}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
