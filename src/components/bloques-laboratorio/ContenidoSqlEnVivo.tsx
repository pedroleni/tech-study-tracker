import type { ReactNode } from 'react'

import { IndicadorCoincidencia } from '@/components/bloques-laboratorio/IndicadorCoincidencia'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { IdentidadSimulada } from '@/lib/postgres-en-vivo/motor'
import type { ResultadoConsulta } from '@/lib/sql-en-vivo/motor'

function ErrorConsultaSql({ mensaje }: { mensaje: string }) {
  return (
    <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
      {mensaje}
    </p>
  )
}

function ResultadoCorrectoSql({ resultado }: { resultado: Extract<ResultadoConsulta, { ok: true }> }) {
  return (
    <>
      <TablaResultado columns={resultado.columns} values={resultado.values} />
      <p className="text-xs text-muted-foreground">
        {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'}
      </p>
    </>
  )
}

export function ContenidoSqlEnVivo({
  identidadSimulada,
  identidad,
  resultado,
  consultaSolucion,
  coincide,
  editor,
  onCambiarIdentidad,
}: {
  identidadSimulada?: IdentidadSimulada[]
  identidad?: IdentidadSimulada
  resultado: ResultadoConsulta | null
  consultaSolucion?: string
  coincide: boolean
  editor: ReactNode
  onCambiarIdentidad: (identidad?: IdentidadSimulada) => void
}) {
  return (
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
              onCambiarIdentidad(elegida)
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

      {editor}

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
          <ErrorConsultaSql mensaje={resultado.mensaje} />
        )}
        {resultado?.ok === true && (
          <ResultadoCorrectoSql resultado={resultado} />
        )}
        {consultaSolucion && resultado?.ok === true && (
          <IndicadorCoincidencia coincide={coincide} />
        )}
      </div>
    </>
  )
}
