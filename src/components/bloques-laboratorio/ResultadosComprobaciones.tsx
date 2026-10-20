import { CircleCheck, CircleX } from 'lucide-react'

export type ResultadoComprobacion = { descripcion: string; ok: boolean; motivo?: string }

export function ResultadosComprobaciones({
  estado,
  resultados,
}: {
  estado: 'comprobando' | 'listo' | 'tiempo-agotado'
  resultados: ResultadoComprobacion[]
}) {
  const superadas = resultados.filter((resultado) => resultado.ok).length

  return (
    <div role="status" aria-live="polite" className="space-y-2">
      {estado === 'comprobando' && <p className="text-sm text-muted-foreground">Comprobando…</p>}
      {estado === 'tiempo-agotado' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          La comprobación tardó demasiado. Revisa si tu código se queda en un bucle.
        </p>
      )}
      {estado === 'listo' && (
        <>
          <p className="text-sm font-semibold">
            {superadas} de {resultados.length} comprobaciones superadas
          </p>
          <ul className="space-y-1.5">
            {resultados.map((resultado, indice) => (
              <li key={indice} className="flex items-start gap-2 text-sm">
                {resultado.ok ? (
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
                  />
                ) : (
                  <CircleX
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
                  />
                )}
                <div className="min-w-0">
                  <span className="sr-only">{resultado.ok ? 'Superada: ' : 'No superada: '}</span>
                  <span>{resultado.descripcion}</span>
                  {!resultado.ok && resultado.motivo && (
                    <p className="text-pretty text-muted-foreground">{resultado.motivo}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
