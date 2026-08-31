export function TablaResultado({
  columns,
  values,
}: {
  columns: string[]
  // unknown, no SqlValue (tipo de sql.js): esta tabla es agnóstica de
  // motor — también renderiza resultados de PGlite (motor: 'postgres'),
  // que puede devolver tipos que sql.js no tiene (bigint, objetos JSONB
  // ya parseados). String(valor) más abajo funciona igual para todos.
  values: unknown[][]
}) {
  if (columns.length === 0) {
    return <p className="p-3 text-sm text-muted-foreground">Sin filas</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.map((columna) => (
              <th
                key={columna}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((fila, indiceFila) => (
            <tr key={indiceFila} className="border-b last:border-0">
              {fila.map((valor, indiceCelda) => (
                <td key={indiceCelda} className="px-3 py-2">
                  {/* Nunca dangerouslySetInnerHTML: el alumno controla este
                      valor a través de literales de cadena en su propia
                      consulta. Un hijo de JSX ya se escapa automáticamente. */}
                  {valor === null ? 'NULL' : String(valor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
