import { GitBranch } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { NotasAnotadas } from '@/components/bloques-laboratorio/NotasAnotadas'
import { GrafoCommits } from '@/components/bloques-laboratorio/GrafoCommits'
import { SalidaTerminal } from '@/components/bloques-laboratorio/SalidaTerminal'
import type { DatosGitAnotado } from '@/lib/laboratorio/schemas'
import {
  crearMotorGit,
  ejecutarComandosGit,
  obtenerGrafo,
  type GrafoGit,
  type ResultadoGit,
} from '@/lib/git-en-vivo/motor'

export function GitAnotado({
  titulo,
  esquemaGit,
  comando,
  mostrarGrafo,
  anotaciones,
  // Prop deliberadamente fuera del esquema Zod de la lección — mismo
  // motivo que en SqlAnotado.tsx: evitar un landmark aria-label duplicado
  // cuando dos instancias conviven en la página de referencia.
  etiquetaSeccion = 'Git anotado',
}: DatosGitAnotado & { etiquetaSeccion?: string }) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () => anotaciones.filter((anotacion) => comando.includes(anotacion.fragmento)),
    [anotaciones, comando],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)

  const [resultado, setResultado] = useState<ResultadoGit | null>(null)
  const [grafo, setGrafo] = useState<GrafoGit | null>(null)

  useEffect(() => {
    let cancelado = false
    void (async () => {
      try {
        const motor = await crearMotorGit()
        if (cancelado) return
        const resultadoEjecucion = await ejecutarComandosGit(motor, esquemaGit, comando)
        if (!cancelado) setResultado(resultadoEjecucion)
        if (mostrarGrafo) {
          const grafoReal = await obtenerGrafo(motor, esquemaGit)
          if (!cancelado) setGrafo(grafoReal)
        }
      } catch (error) {
        if (!cancelado) {
          setResultado({
            ok: false,
            mensaje: error instanceof Error ? error.message : 'No se pudo cargar el motor Git.',
          })
        }
      }
    })()
    return () => {
      cancelado = true
    }
  }, [esquemaGit, comando, mostrarGrafo])

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-orange-50 dark:bg-orange-950/40">
          <GitBranch aria-hidden="true" className="size-4.75 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Git anotado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {titulo ?? 'Selecciona un número para destacar la línea y leer la nota'}
          </h3>
        </div>
      </div>

      <SalidaTerminal
        comando={comando}
        salida={resultado?.ok ? resultado.salida : undefined}
        error={resultado?.ok === false ? resultado.mensaje : undefined}
      />

      {mostrarGrafo && grafo && <GrafoCommits grafo={grafo} />}

      <NotasAnotadas
        anotaciones={anotacionesValidas}
        activa={anotacionActiva}
        onActivar={setAnotacionActiva}
        idNota={idNota}
        etiqueta="Anotaciones del comando"
        color="orange"
      />
    </section>
  )
}
