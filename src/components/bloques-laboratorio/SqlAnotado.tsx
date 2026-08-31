import { Database } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { DatosSqlAnotado } from '@/lib/laboratorio/schemas'
import {
  crearMotorPostgres,
  ejecutarConsultaPostgres,
  type IdentidadSimulada,
} from '@/lib/postgres-en-vivo/motor'
import {
  crearMotorSql,
  ejecutarConsulta,
  type ResultadoConsulta,
} from '@/lib/sql-en-vivo/motor'
import { cn } from '@/lib/utils'

export function SqlAnotado({
  titulo,
  motor: tipoMotor,
  extensiones,
  identidadSimulada,
  esquemaSql,
  consulta,
  anotaciones,
  // Las dos props de abajo están deliberadamente fuera del esquema Zod
  // de la lección (nunca las rellena contenido real): solo las usa la
  // página de referencia (AdminReferenciaContenidoPage) para distinguir
  // dos instancias de este mismo componente en la misma página — dos
  // landmarks con el mismo aria-label son un landmark duplicado real
  // (axe: landmark-unique), y una lección real nunca repite este bloque
  // dos veces en la misma página.
  etiquetaSeccion = 'SQL anotado',
  etiquetaConsulta = 'Consulta SQL anotada',
}: DatosSqlAnotado & { etiquetaSeccion?: string; etiquetaConsulta?: string }) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () =>
      anotaciones.flatMap((anotacion) => {
        const posicion = consulta.indexOf(anotacion.fragmento)
        if (posicion === -1) return []

        return [
          {
            ...anotacion,
            linea: consulta.slice(0, posicion).split('\n').length,
          },
        ]
      }),
    [anotaciones, consulta],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]

  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [identidad] = useState<IdentidadSimulada | undefined>(identidadSimulada?.[0])

  useEffect(() => {
    let cancelado = false
    const ejecutar = async () => {
      try {
        if (tipoMotor === 'postgres') {
          const motor = await crearMotorPostgres()
          if (cancelado) return
          setResultado(
            await ejecutarConsultaPostgres(motor, esquemaSql, consulta, { extensiones, identidad }),
          )
        } else {
          const motor = await crearMotorSql()
          if (cancelado) return
          setResultado(ejecutarConsulta(motor, esquemaSql, consulta))
        }
      } catch (error) {
        if (!cancelado) {
          setResultado({
            ok: false,
            mensaje: error instanceof Error ? error.message : 'No se pudo cargar el motor SQL.',
          })
        }
      }
    }
    void ejecutar()
    return () => {
      cancelado = true
    }
  }, [esquemaSql, consulta, tipoMotor, extensiones, identidad])

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 dark:bg-teal-950/40">
          <Database aria-hidden="true" className="size-4.75 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
            SQL anotado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {titulo ?? 'Selecciona un número para destacar el fragmento y leer la nota'}
          </h3>
        </div>
      </div>

      <CodigoResaltado
        codigo={consulta}
        lenguaje="sql"
        numerarLineas
        lineasDestacadas={activa ? [activa.linea] : []}
        etiqueta={etiquetaConsulta}
      />

      {anotacionesValidas.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Anotaciones de la consulta">
            {anotacionesValidas.map((anotacion, indice) => (
              <Button
                key={`${anotacion.fragmento}-${indice}`}
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={indice === anotacionActiva}
                aria-controls={idNota}
                aria-label={`Ver anotación ${indice + 1}: ${anotacion.nota}`}
                onClick={() => setAnotacionActiva(indice)}
                className={cn(
                  'size-11 touch-manipulation rounded-full transition-colors',
                  indice === anotacionActiva &&
                    'border-teal-500 bg-teal-500 text-white hover:bg-teal-500 dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950',
                )}
              >
                {indice + 1}
              </Button>
            ))}
          </div>
          <p
            key={anotacionActiva}
            id={idNota}
            aria-live="polite"
            className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3 text-sm text-pretty duration-200 motion-reduce:animate-none dark:border-teal-400 dark:bg-teal-950/30"
          >
            <span className="font-semibold">Nota {anotacionActiva + 1}.</span> {activa?.nota}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Resultado</h4>
        {resultado === null && (
          <p className="text-sm text-muted-foreground">Ejecutando la consulta…</p>
        )}
        {resultado?.ok === false && (
          <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {resultado.mensaje}
          </p>
        )}
        {resultado?.ok === true && (
          <>
            <TablaResultado columns={resultado.columns} values={resultado.values} />
            <p className="text-xs text-muted-foreground">
              {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'} — resultado
              real, no escrito a mano.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
