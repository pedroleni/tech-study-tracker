import { css as lenguajeCss } from '@codemirror/lang-css'
import { html as lenguajeHtml } from '@codemirror/lang-html'
import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'
import { basicSetup, EditorView } from 'codemirror'
import { Code2, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { DatosEditorEnVivo } from '@/lib/laboratorio/schemas'
import {
  compilarEnEntorno,
  crearEntornoTypeScript,
  type DiagnosticoTs,
  type EntornoTypeScript,
} from '@/lib/typescript-en-vivo/compilar'
import { cn } from '@/lib/utils'

type Lenguaje = 'html' | 'css' | 'js' | 'ts'

const LENGUAJES: Array<{
  id: Lenguaje
  etiqueta: string
  extension: ReturnType<typeof lenguajeHtml>
}> = [
  { id: 'html', etiqueta: 'HTML', extension: lenguajeHtml() },
  { id: 'css', etiqueta: 'CSS', extension: lenguajeCss() },
  { id: 'js', etiqueta: 'JavaScript', extension: lenguajeJavascript() },
  { id: 'ts', etiqueta: 'TypeScript', extension: lenguajeJavascript({ typescript: true }) },
]

const estilosTemaAplicacion = {
  '&': {
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    fontSize: '0.8125rem',
  },
  '&.cm-focused': {
    outline: '2px solid var(--ring)',
    outlineOffset: '-2px',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-content': {
    minHeight: '22rem',
    padding: '0.75rem 0',
    caretColor: 'var(--foreground)',
    whiteSpace: 'pre',
  },
  '.cm-line': {
    padding: '0 0.75rem',
  },
  '.cm-gutters': {
    color: 'var(--muted-foreground)',
    backgroundColor: 'var(--muted)',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'var(--accent)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in oklab, var(--ring) 35%, transparent)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--foreground)',
  },
} as const

function crearTemaAplicacion(modoOscuro: boolean) {
  return EditorView.theme(estilosTemaAplicacion, { dark: modoOscuro })
}

function construirDocumento(html: string, css: string, js: string) {
  const javascriptSeguro = js.replace(/<\/script/gi, '<\\/script')
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${css}</style>
  </head>
  <body>
${html}
    <script>${javascriptSeguro}</script>
  </body>
</html>`
}

function EditorCodigo({
  etiqueta,
  extension,
  valor,
  onChange,
}: {
  etiqueta: string
  extension: ReturnType<typeof lenguajeHtml>
  valor: string
  onChange: (valor: string) => void
}) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const vistaRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const valorRef = useRef(valor)
  const [modoOscuro, setModoOscuro] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valorRef.current = valor
  }, [valor])

  useEffect(() => {
    const observador = new MutationObserver(() => {
      setModoOscuro(document.documentElement.classList.contains('dark'))
    })
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!contenedorRef.current) return

    const vista = new EditorView({
      doc: valorRef.current,
      parent: contenedorRef.current,
      extensions: [
        basicSetup,
        extension,
        crearTemaAplicacion(modoOscuro),
        EditorView.contentAttributes.of({
          'aria-label': etiqueta,
          'aria-multiline': 'true',
          spellcheck: 'false',
        }),
        EditorView.updateListener.of((actualizacion) => {
          if (actualizacion.docChanged) {
            onChangeRef.current(actualizacion.state.doc.toString())
          }
        }),
      ],
    })
    vistaRef.current = vista

    return () => {
      vista.destroy()
      vistaRef.current = null
    }
    // La vista solo se crea de nuevo al cambiar de lenguaje. Los cambios de
    // texto se sincronizan mediante la transacción del efecto siguiente.
  }, [etiqueta, extension, modoOscuro])

  useEffect(() => {
    const vista = vistaRef.current
    if (!vista || vista.state.doc.toString() === valor) return
    vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: valor } })
  }, [valor])

  return (
    <div
      ref={contenedorRef}
      className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-background [&_.cm-editor]:max-w-full [&_.cm-editor]:overflow-hidden"
    />
  )
}

function PanelDiagnosticosTs({
  estado,
  diagnosticos,
}: {
  estado: 'cargando' | 'listo' | 'error'
  diagnosticos: DiagnosticoTs[]
}) {
  if (estado === 'cargando') {
    return <p className="text-sm text-muted-foreground">Cargando el compilador de TypeScript…</p>
  }
  if (estado === 'error') {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudo cargar el compilador de TypeScript. Recarga la página para intentarlo de nuevo.
      </p>
    )
  }
  if (diagnosticos.length === 0) {
    return <p className="text-sm text-green-600 dark:text-green-400">Sin errores de tipos.</p>
  }
  return (
    <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
      {diagnosticos.map((diagnostico, indice) => (
        <li
          key={indice}
          className={
            diagnostico.severidad === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400'
          }
        >
          <span className="font-mono text-xs">
            {diagnostico.linea}:{diagnostico.columna}
          </span>{' '}
          {diagnostico.mensaje}
        </li>
      ))}
    </ul>
  )
}

export function EditorEnVivo({
  titulo = 'Prueba el código y observa el resultado.',
  consigna,
  html: htmlOriginal,
  css: cssOriginal,
  js: jsOriginal,
  ts: tsOriginal,
  pestañaInicial,
}: DatosEditorEnVivo) {
  const originales = useMemo(
    () => ({ html: htmlOriginal, css: cssOriginal, js: jsOriginal, ts: tsOriginal }),
    [cssOriginal, htmlOriginal, jsOriginal, tsOriginal],
  )
  const lenguajesDisponibles = useMemo(
    () => LENGUAJES.filter(({ id }) => originales[id].trim().length > 0),
    [originales],
  )
  const primeraPestana = lenguajesDisponibles.some(({ id }) => id === pestañaInicial)
    ? pestañaInicial
    : (lenguajesDisponibles[0]?.id ?? 'html')
  const [codigo, setCodigo] = useState(originales)
  const [pestanaActiva, setPestanaActiva] = useState<Lenguaje>(primeraPestana)
  const [srcDoc, setSrcDoc] = useState(() =>
    construirDocumento(originales.html, originales.css, originales.js),
  )
  const usaTypeScript = lenguajesDisponibles.some(({ id }) => id === 'ts')
  const [estadoCompiladorTs, setEstadoCompiladorTs] = useState<'cargando' | 'listo' | 'error'>(
    'cargando',
  )
  const [diagnosticosTs, setDiagnosticosTs] = useState<DiagnosticoTs[]>([])
  const entornoTsRef = useRef<EntornoTypeScript | null>(null)

  useEffect(() => {
    if (!usaTypeScript) return
    let cancelado = false
    crearEntornoTypeScript()
      .then((entorno) => {
        if (cancelado) return
        entornoTsRef.current = entorno
        setEstadoCompiladorTs('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoCompiladorTs('error')
      })
    return () => {
      cancelado = true
    }
  }, [usaTypeScript])

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      if (!usaTypeScript) {
        setSrcDoc(construirDocumento(codigo.html, codigo.css, codigo.js))
        return
      }
      // Con ts presente, su JS compilado sustituye a codigo.js por completo
      // (los dos campos no están pensados para combinarse en un mismo bloque).
      if (estadoCompiladorTs !== 'listo' || !entornoTsRef.current) return
      const { js, diagnosticos } = compilarEnEntorno(entornoTsRef.current, codigo.ts)
      setDiagnosticosTs(diagnosticos)
      const hayErrores = diagnosticos.some((d) => d.severidad === 'error')
      if (!hayErrores) {
        setSrcDoc(construirDocumento(codigo.html, codigo.css, js))
      }
      // Si hay errores, no se toca srcDoc: la vista previa se queda en el
      // último resultado válido en vez de mostrar un iframe roto.
    }, 200)

    return () => window.clearTimeout(temporizador)
  }, [codigo, usaTypeScript, estadoCompiladorTs])

  const lenguajeActivo =
    lenguajesDisponibles.find(({ id }) => id === pestanaActiva) ??
    lenguajesDisponibles[0]

  function reiniciar() {
    setCodigo(originales)
    setPestanaActiva(primeraPestana)
  }

  return (
    <section
      aria-label="Editor de código en vivo"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-purple-50 dark:bg-purple-950/40">
            <Code2
              aria-hidden="true"
              className="size-4.75 text-purple-600 dark:text-purple-400"
            />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              Editor en vivo
            </p>
            <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={reiniciar}>
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 space-y-2">
          {lenguajesDisponibles.length > 1 ? (
            <div
              role="group"
              aria-label="Lenguaje que quieres editar"
              className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-muted p-1"
            >
              {lenguajesDisponibles.map((lenguaje) => (
                <button
                  key={lenguaje.id}
                  type="button"
                  aria-pressed={pestanaActiva === lenguaje.id}
                  onClick={() => setPestanaActiva(lenguaje.id)}
                  className={cn(
                    'min-h-10 shrink-0 touch-manipulation rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    pestanaActiva === lenguaje.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {lenguaje.etiqueta}
                </button>
              ))}
            </div>
          ) : (
            <h4 className="text-sm font-semibold">{lenguajeActivo?.etiqueta}</h4>
          )}

          {lenguajeActivo && (
            <EditorCodigo
              key={lenguajeActivo.id}
              etiqueta={`Editor de código ${lenguajeActivo.etiqueta}`}
              extension={lenguajeActivo.extension}
              valor={codigo[lenguajeActivo.id]}
              onChange={(valor) =>
                setCodigo((actual) => ({ ...actual, [lenguajeActivo.id]: valor }))
              }
            />
          )}
          {usaTypeScript && pestanaActiva === 'ts' && (
            <PanelDiagnosticosTs estado={estadoCompiladorTs} diagnosticos={diagnosticosTs} />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-semibold">Vista previa</h4>
          <iframe
            className="block h-72 w-full max-w-full rounded-lg border bg-white sm:h-96"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            title="Vista previa del editor en vivo"
          />
        </div>
      </div>
    </section>
  )
}
