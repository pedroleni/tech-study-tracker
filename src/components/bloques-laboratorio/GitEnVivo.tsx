import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GrafoCommits } from '@/components/bloques-laboratorio/GrafoCommits'
import { SalidaTerminal } from '@/components/bloques-laboratorio/SalidaTerminal'
import type { DatosGitEnVivo } from '@/lib/laboratorio/schemas'
import {
  crearMotorGit,
  ejecutarComandosGit,
  obtenerGrafo,
  type GrafoGit,
  type MotorGit,
  type ResultadoGit,
} from '@/lib/git-en-vivo/motor'

const RETRASO_EJECUCION_MS = 300

export function GitEnVivo({
  consigna,
  esquemaGit,
  comandoInicial,
  comandoSolucion,
  mostrarGrafo,
  // Prop deliberadamente fuera del esquema Zod de la lección — mismo
  // motivo que en SqlEnVivo.tsx.
  etiquetaSeccion = 'Git en vivo',
}: DatosGitEnVivo & { etiquetaSeccion?: string }) {
  const [comando, setComando] = useState(comandoInicial)
  const [motor, setMotor] = useState<MotorGit | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoGit | null>(null)
  const [solucionEjecutada, setSolucionEjecutada] = useState<ResultadoGit | null>(null)
  const [grafo, setGrafo] = useState<GrafoGit | null>(null)

  useEffect(() => {
    let cancelado = false
    crearMotorGit()
      .then((m) => {
        if (!cancelado) {
          setMotor(m)
          setEstadoMotor('listo')
        }
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (estadoMotor !== 'listo' || !motor) return
    let cancelado = false
    const temporizador = window.setTimeout(() => {
      const texto = comando.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      void (async () => {
        const resultadoEjecucion = await ejecutarComandosGit(motor, esquemaGit, texto)
        if (cancelado) return
        setResultado(resultadoEjecucion)
        if (mostrarGrafo) {
          const grafoReal = await obtenerGrafo(motor, esquemaGit)
          if (!cancelado) setGrafo(grafoReal)
        }
      })()
    }, RETRASO_EJECUCION_MS)

    return () => {
      cancelado = true
      window.clearTimeout(temporizador)
    }
  }, [comando, motor, esquemaGit, estadoMotor, mostrarGrafo])

  useEffect(() => {
    if (!comandoSolucion || !motor) return
    let cancelado = false
    void ejecutarComandosGit(motor, esquemaGit, comandoSolucion).then((resultadoEjecucion) => {
      if (!cancelado) setSolucionEjecutada(resultadoEjecucion)
    })
    return () => {
      cancelado = true
    }
  }, [motor, esquemaGit, comandoSolucion])

  const solucion = comandoSolucion ? solucionEjecutada : null
  const coincide =
    resultado?.ok === true &&
    solucion?.ok === true &&
    resultado.salida.trim() === solucion.salida.trim()

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Git en vivo
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            Escribe el comando y comprueba el resultado real
          </h3>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setComando(comandoInicial)}>
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      {estadoMotor === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando el motor Git…</p>
      )}
      {estadoMotor === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el motor Git. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {estadoMotor === 'listo' && (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 font-mono text-sm">
            <span className="text-green-400">$</span>
            <span className="text-neutral-400">git</span>
            <input
              type="text"
              value={comando}
              onChange={(evento) => setComando(evento.target.value)}
              aria-label="Comando git"
              className="min-w-0 flex-1 bg-transparent text-neutral-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            {resultado === null && (
              <p className="text-sm text-muted-foreground">Escribe un comando para ejecutarlo.</p>
            )}
            {resultado?.ok === false && (
              <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {resultado.mensaje}
              </p>
            )}
            {resultado?.ok === true && <SalidaTerminal comando={comando} salida={resultado.salida} />}
            {mostrarGrafo && grafo && <GrafoCommits grafo={grafo} />}
            {comandoSolucion && resultado?.ok === true && (
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
