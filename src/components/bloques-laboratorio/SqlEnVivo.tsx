import { sql } from '@codemirror/lang-sql'
import { basicSetup, EditorView } from 'codemirror'
import { CircleCheck, CircleX, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { DatosSqlEnVivo } from '@/lib/laboratorio/schemas'
import {
  compararResultados,
  crearMotorSql,
  ejecutarConsulta,
  type MotorSql,
  type ResultadoConsulta,
} from '@/lib/sql-en-vivo/motor'

const RETRASO_EJECUCION_MS = 300

const estilosTemaAplicacion = {
  '&': {
    color: 'var(--foreground)',
    backgroundColor: 'var(--muted)',
    fontSize: '0.875rem',
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
    minHeight: '4.5rem',
    padding: '0.75rem 0',
    caretColor: 'var(--foreground)',
    whiteSpace: 'pre',
  },
  '.cm-line': {
    padding: '0 0.75rem',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'var(--accent)',
  },
} as const

function crearTemaAplicacion(modoOscuro: boolean) {
  return EditorView.theme(estilosTemaAplicacion, { dark: modoOscuro })
}

function EditorSql({ valor, onChange }: { valor: string; onChange: (valor: string) => void }) {
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
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!contenedorRef.current) return

    const vista = new EditorView({
      doc: valorRef.current,
      parent: contenedorRef.current,
      extensions: [
        basicSetup,
        sql(),
        crearTemaAplicacion(modoOscuro),
        EditorView.contentAttributes.of({
          'aria-label': 'Editor de consulta SQL',
          'aria-multiline': 'true',
          spellcheck: 'false',
        }),
        EditorView.updateListener.of((actualizacion) => {
          if (actualizacion.docChanged) onChangeRef.current(actualizacion.state.doc.toString())
        }),
      ],
    })
    vistaRef.current = vista

    return () => {
      vista.destroy()
      vistaRef.current = null
    }
  }, [modoOscuro])

  useEffect(() => {
    const vista = vistaRef.current
    if (!vista || vista.state.doc.toString() === valor) return
    vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: valor } })
  }, [valor])

  return (
    <div
      ref={contenedorRef}
      className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-muted [&_.cm-editor]:max-w-full [&_.cm-editor]:overflow-hidden"
    />
  )
}

export function SqlEnVivo({
  consigna,
  esquemaSql,
  consultaInicial,
  consultaSolucion,
}: DatosSqlEnVivo) {
  const [consulta, setConsulta] = useState(consultaInicial)
  const [motor, setMotor] = useState<MotorSql | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    let cancelado = false
    crearMotorSql()
      .then((motorCargado) => {
        if (cancelado) return
        setMotor(motorCargado)
        setEstadoMotor('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!motor) return
    const temporizador = window.setTimeout(() => {
      const texto = consulta.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      setResultado(ejecutarConsulta(motor, esquemaSql, texto))
    }, RETRASO_EJECUCION_MS)

    return () => window.clearTimeout(temporizador)
  }, [consulta, motor, esquemaSql])

  const solucion = useMemo(() => {
    if (!motor || !consultaSolucion) return null
    return ejecutarConsulta(motor, esquemaSql, consultaSolucion)
  }, [motor, esquemaSql, consultaSolucion])

  const coincide =
    resultado?.ok === true && solucion?.ok === true && compararResultados(resultado, solucion)

  return (
    <section
      aria-label="SQL en vivo"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-purple-50 dark:bg-purple-950/40">
            <Play aria-hidden="true" className="size-4.75 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              SQL en vivo
            </p>
            <h3 className="text-lg font-bold tracking-tight text-balance">
              Escribe tu consulta y comprueba el resultado real
            </h3>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConsulta(consultaInicial)}
        >
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      {estadoMotor === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando el motor SQL…</p>
      )}
      {estadoMotor === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el motor SQL. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {estadoMotor === 'listo' && (
        <>
          <EditorSql valor={consulta} onChange={setConsulta} />

          <div className="space-y-1">
            {resultado === null && (
              <p className="text-sm text-muted-foreground">Escribe una consulta para ejecutarla.</p>
            )}
            {/* En error se limpia la tabla: un ejercicio de SQL es de intento
                único ("¿funciona esta consulta, sí o no?"), a diferencia de
                la vista previa continua de HTML/CSS/JS/TS, que sí conserva
                el último resultado válido — aquí dejar una tabla vieja
                confundiría más de lo que ayuda. */}
            {resultado?.ok === false && (
              <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {resultado.mensaje}
              </p>
            )}
            {resultado?.ok === true && (
              <>
                <TablaResultado columns={resultado.columns} values={resultado.values} />
                <p className="text-xs text-muted-foreground">
                  {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'}
                </p>
              </>
            )}
            {consultaSolucion && resultado?.ok === true && (
              <div
                className={
                  coincide
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }
              >
                {coincide ? (
                  <>
                    <CircleCheck aria-hidden="true" className="size-4" />
                    Coincide con la solución
                  </>
                ) : (
                  <>
                    <CircleX aria-hidden="true" className="size-4" />
                    Todavía no coincide — sigue intentándolo
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
