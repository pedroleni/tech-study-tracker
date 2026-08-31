import { sql } from '@codemirror/lang-sql'
import { basicSetup, EditorView } from 'codemirror'
import { CircleCheck, CircleX, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { DatosSqlEnVivo } from '@/lib/laboratorio/schemas'
import {
  crearMotorPostgres,
  ejecutarConsultaPostgres,
  type IdentidadSimulada,
  type MotorPostgres,
} from '@/lib/postgres-en-vivo/motor'
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
    fontSize: '0.75rem',
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
  motor: tipoMotor,
  extensiones,
  identidadSimulada,
  esquemaSql,
  consultaInicial,
  consultaSolucion,
  // Prop deliberadamente fuera del esquema Zod de la lección — ver el
  // mismo comentario en SqlAnotado.tsx: solo la usa la página de
  // referencia para evitar un landmark aria-label duplicado cuando dos
  // instancias de este componente conviven en la misma página.
  etiquetaSeccion = 'SQL en vivo',
}: DatosSqlEnVivo & { etiquetaSeccion?: string }) {
  const [consulta, setConsulta] = useState(consultaInicial)
  const [identidad, setIdentidad] = useState<IdentidadSimulada | undefined>(identidadSimulada?.[0])
  const [motorSql, setMotorSql] = useState<MotorSql | null>(null)
  const [motorPostgres, setMotorPostgres] = useState<MotorPostgres | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    let cancelado = false
    const carga =
      tipoMotor === 'postgres'
        ? crearMotorPostgres().then((m) => {
            if (!cancelado) setMotorPostgres(m)
          })
        : crearMotorSql().then((m) => {
            if (!cancelado) setMotorSql(m)
          })
    carga
      .then(() => {
        if (!cancelado) setEstadoMotor('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [tipoMotor])

  useEffect(() => {
    if (estadoMotor !== 'listo') return
    let cancelado = false
    const temporizador = window.setTimeout(() => {
      const texto = consulta.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      if (tipoMotor === 'postgres' && motorPostgres) {
        ejecutarConsultaPostgres(motorPostgres, esquemaSql, texto, { extensiones, identidad }).then(
          (resultadoEjecucion) => {
            if (!cancelado) setResultado(resultadoEjecucion)
          },
        )
      } else if (motorSql) {
        setResultado(ejecutarConsulta(motorSql, esquemaSql, texto))
      }
    }, RETRASO_EJECUCION_MS)

    return () => {
      cancelado = true
      window.clearTimeout(temporizador)
    }
  }, [consulta, motorSql, motorPostgres, esquemaSql, tipoMotor, extensiones, identidad, estadoMotor])

  // solucionEjecutada, no solucion: cuando no hay consultaSolucion, el
  // efecto de abajo no toca este estado en absoluto (nunca lo pone a
  // null "por dentro" de un effect — eso dispara cascading renders,
  // ver react-hooks/set-state-in-effect). El valor final se deriva en
  // el render, justo debajo.
  const [solucionEjecutada, setSolucionEjecutada] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    if (!consultaSolucion) return
    let cancelado = false
    // IIFE async: incluso la rama sqlite (ejecutarConsulta es síncrona)
    // pasa por un await para que el setState quede dentro de una
    // continuación async, nunca directamente en el cuerpo del efecto
    // (react-hooks/set-state-in-effect lo marca como error si no).
    void (async () => {
      const resultadoEjecucion =
        tipoMotor === 'postgres' && motorPostgres
          ? await ejecutarConsultaPostgres(motorPostgres, esquemaSql, consultaSolucion, {
              extensiones,
              identidad,
            })
          : motorSql
            ? ejecutarConsulta(motorSql, esquemaSql, consultaSolucion)
            : null
      if (!cancelado && resultadoEjecucion) setSolucionEjecutada(resultadoEjecucion)
    })()
    return () => {
      cancelado = true
    }
  }, [motorSql, motorPostgres, esquemaSql, consultaSolucion, tipoMotor, extensiones, identidad])

  const solucion = consultaSolucion ? solucionEjecutada : null

  const coincide =
    resultado?.ok === true && solucion?.ok === true && compararResultados(resultado, solucion)

  return (
    <section
      aria-label={etiquetaSeccion}
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
          {identidadSimulada && identidadSimulada.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="sql-en-vivo-identidad" className="text-sm font-medium">
                Estás conectado como
              </label>
              <select
                id="sql-en-vivo-identidad"
                value={identidad?.valor ?? ''}
                onChange={(evento) => {
                  const elegida = identidadSimulada.find((i) => i.valor === evento.target.value)
                  setIdentidad(elegida)
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {identidadSimulada.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}

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
