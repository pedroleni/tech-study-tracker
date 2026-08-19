import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

import { CLASES_TOKEN, tokenizarLineas, type Lenguaje } from '@/components/codigo/resaltador'
import { cn } from '@/lib/utils'
import '@/components/codigo/sintaxis.css'

const SANGRIA = '  '

/**
 * Clases que TIENEN que ser idénticas en las dos capas (el <pre> pintado y el
 * <textarea> transparente). Si una sola de ellas se desincroniza —fuente,
 * interlineado, relleno, ajuste de línea— el texto coloreado deja de caer
 * exactamente debajo del cursor. Se declaran una vez, aquí, a propósito.
 */
const CAPA = 'm-0 w-full border-0 font-mono text-xs leading-relaxed whitespace-pre [tab-size:2]'

export type PropiedadesEditorCodigo = {
  /** Contenido del editor (componente controlado). */
  valor: string
  /** Se llama con el texto completo en cada cambio. */
  alCambiar: (valor: string) => void
  /** Nombre accesible del campo, obligatorio. P. ej. `'Código HTML editable'`. */
  etiqueta: string
  /** Lenguaje del tokenizador. Por defecto `'html'`. */
  lenguaje?: Lenguaje
  /** Muestra la columna de números de línea. Por defecto `false`. */
  numerarLineas?: boolean
  /** Números de línea a destacar, empezando en 1. */
  lineasDestacadas?: number[]
  /** Impide editar sin sacar el campo del recorrido del teclado. */
  soloLectura?: boolean
  /** `id` del textarea, para asociarlo a un <label> externo. */
  id?: string
  /** Clases del marco del editor. Aquí es donde se le da el alto (`h-96`). */
  className?: string
}

export function EditorCodigo({
  valor,
  alCambiar,
  etiqueta,
  lenguaje = 'html',
  numerarLineas = false,
  lineasDestacadas,
  soloLectura = false,
  id,
  className,
}: PropiedadesEditorCodigo) {
  const refTexto = useRef<HTMLTextAreaElement>(null)
  const refPintado = useRef<HTMLPreElement>(null)
  const refNumeros = useRef<HTMLDivElement>(null)
  const cursorPendiente = useRef<number | null>(null)
  const idAyuda = useId()

  // Con el tabulador capturado, el editor sería una trampa de teclado. Escape
  // lo libera: el siguiente tabulador sale del editor (WCAG 2.1.2).
  const [tabuladorSale, setTabuladorSale] = useState(false)

  const lineas = useMemo(() => tokenizarLineas(valor, lenguaje), [valor, lenguaje])
  const destacadas = useMemo(() => new Set(lineasDestacadas ?? []), [lineasDestacadas])
  const relleno = numerarLineas ? 'py-3 pr-3 pl-[3.25rem]' : 'p-3'

  // Las dos capas se desplazan juntas: el <pre> no tiene barras propias, lo
  // arrastra el textarea.
  const sincronizarDesplazamiento = useCallback(() => {
    const texto = refTexto.current
    if (!texto) return
    if (refPintado.current) {
      refPintado.current.scrollTop = texto.scrollTop
      refPintado.current.scrollLeft = texto.scrollLeft
    }
    if (refNumeros.current) refNumeros.current.scrollTop = texto.scrollTop
  }, [])

  useEffect(() => {
    sincronizarDesplazamiento()
    if (cursorPendiente.current !== null && refTexto.current) {
      refTexto.current.setSelectionRange(cursorPendiente.current, cursorPendiente.current)
      cursorPendiente.current = null
    }
  }, [valor, sincronizarDesplazamiento])

  const manejarTeclado = (evento: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evento.key === 'Escape') {
      setTabuladorSale(true)
      return
    }
    if (evento.key !== 'Tab') {
      if (tabuladorSale) setTabuladorSale(false)
      return
    }
    if (tabuladorSale || soloLectura) {
      setTabuladorSale(false)
      return
    }

    const campo = evento.currentTarget
    const inicio = campo.selectionStart
    const fin = campo.selectionEnd

    if (evento.shiftKey) {
      const sangriaPrevia = / {1,2}$/.exec(valor.slice(0, inicio))
      if (!sangriaPrevia) return
      evento.preventDefault()
      const quitados = sangriaPrevia[0].length
      alCambiar(valor.slice(0, inicio - quitados) + valor.slice(fin))
      cursorPendiente.current = inicio - quitados
      return
    }

    evento.preventDefault()
    alCambiar(valor.slice(0, inicio) + SANGRIA + valor.slice(fin))
    cursorPendiente.current = inicio + SANGRIA.length
  }

  return (
    <div>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-muted/30 focus-within:ring-2 focus-within:ring-ring',
          className ?? 'h-96'
        )}
      >
        {/* Capa 1: el código coloreado. Decorativa: lo que se lee es el textarea. */}
        <pre
          ref={refPintado}
          aria-hidden="true"
          className={cn(CAPA, relleno, 'pointer-events-none absolute inset-0 overflow-hidden')}
        >
          <code className="block w-fit min-w-full">
            {lineas.map((linea) => (
              <span
                key={linea.numero}
                className={cn(
                  'sintaxis-linea',
                  destacadas.has(linea.numero) && 'sintaxis-linea-destacada'
                )}
              >
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

        {numerarLineas && (
          <div
            ref={refNumeros}
            aria-hidden="true"
            className={cn(
              CAPA,
              'sintaxis-columna-numeros pointer-events-none absolute inset-y-0 left-0 w-10 overflow-hidden border-r bg-muted py-3 pr-2 text-right'
            )}
          >
            {lineas.map((linea) => (
              <div key={linea.numero}>{linea.numero}</div>
            ))}
          </div>
        )}

        {/* Capa 2: el texto real. Transparente, con el cursor visible. */}
        <textarea
          ref={refTexto}
          id={id}
          aria-label={etiqueta}
          aria-describedby={soloLectura ? undefined : idAyuda}
          value={valor}
          readOnly={soloLectura}
          onChange={(evento) => alCambiar(evento.target.value)}
          onScroll={sincronizarDesplazamiento}
          onKeyDown={manejarTeclado}
          wrap="off"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={cn(
            CAPA,
            relleno,
            'absolute inset-0 h-full resize-none overflow-auto bg-transparent text-transparent caret-foreground outline-none'
          )}
        />
      </div>

      {!soloLectura && (
        <p id={idAyuda} className="mt-1.5 text-xs text-muted-foreground">
          El tabulador sangra el código. Para salir del editor con el teclado, pulsa Escape y
          después el tabulador.
        </p>
      )}
    </div>
  )
}
