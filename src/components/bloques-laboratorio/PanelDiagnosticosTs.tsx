export interface DiagnosticoPanelTs {
  archivo?: string
  linea: number
  columna: number
  mensaje: string
  severidad: 'error' | 'aviso'
}

function ListaDiagnosticos({ diagnosticos }: { diagnosticos: DiagnosticoPanelTs[] }) {
  return (
    <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
      {diagnosticos.map((diagnostico, indice) => (
        <li
          key={indice}
          className={
            diagnostico.severidad === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-800 dark:text-amber-300'
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

export function PanelDiagnosticosTs({
  estado,
  diagnosticos,
  agruparPorArchivo = false,
  error,
}: {
  estado: 'cargando' | 'listo' | 'error'
  diagnosticos: DiagnosticoPanelTs[]
  agruparPorArchivo?: boolean
  error?: string
}) {
  if (estado === 'cargando') {
    return <p className="text-sm text-muted-foreground">Cargando el compilador de TypeScript…</p>
  }
  if (estado === 'error') {
    return (
      <p className="text-sm break-words text-red-700 dark:text-red-400">
        {error ?? 'No se pudo cargar el compilador de TypeScript. Recarga la página para intentarlo de nuevo.'}
      </p>
    )
  }
  if (diagnosticos.length === 0) {
    return <p className="text-sm text-green-700 dark:text-green-400">Sin errores de tipos.</p>
  }
  if (!agruparPorArchivo) return <ListaDiagnosticos diagnosticos={diagnosticos} />

  const porArchivo = diagnosticos.reduce<Map<string, DiagnosticoPanelTs[]>>((grupos, diagnostico) => {
    const archivo = diagnostico.archivo || 'General'
    grupos.set(archivo, [...(grupos.get(archivo) ?? []), diagnostico])
    return grupos
  }, new Map())
  return (
    <div className="space-y-2">
      {[...porArchivo].map(([archivo, diagnosticosArchivo]) => (
        <section key={archivo} className="space-y-1">
          <h5 className="font-mono text-xs font-semibold text-muted-foreground">{archivo}</h5>
          <ListaDiagnosticos diagnosticos={diagnosticosArchivo} />
        </section>
      ))}
    </div>
  )
}
