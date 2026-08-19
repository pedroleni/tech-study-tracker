import { Check, X } from 'lucide-react'

export type ValorComparativa = boolean | string

export interface FilaTablaComparativa {
  caracteristica: string
  valores: ValorComparativa[]
}

export interface PropiedadesTablaComparativa {
  columnas: string[]
  filas: FilaTablaComparativa[]
  caption: string
}

function ValorCelda({ valor }: { valor: ValorComparativa }) {
  if (typeof valor === 'string') return <span>{valor}</span>

  return valor ? (
    <>
      <Check aria-hidden="true" className="mx-auto size-5 text-green-600 dark:text-green-400" />
      <span className="sr-only">Sí</span>
    </>
  ) : (
    <>
      <X aria-hidden="true" className="mx-auto size-5 text-red-600 dark:text-red-400" />
      <span className="sr-only">No</span>
    </>
  )
}

export function TablaComparativa({ columnas, filas, caption }: PropiedadesTablaComparativa) {
  if (columnas.length === 0 || filas.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-xl border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b bg-muted/60">
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Característica
            </th>
            {columnas.map((columna) => (
              <th key={columna} scope="col" className="px-4 py-3 text-center font-semibold">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr
              key={`${fila.caracteristica}-${indice}`}
              className="border-b transition-colors last:border-b-0 hover:bg-muted/50"
            >
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {fila.caracteristica}
              </th>
              {columnas.map((columna, valorIndice) => (
                <td key={columna} className="px-4 py-3 text-center text-muted-foreground">
                  <ValorCelda valor={fila.valores[valorIndice] ?? '—'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
