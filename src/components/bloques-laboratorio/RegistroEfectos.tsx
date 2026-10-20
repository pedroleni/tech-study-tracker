import { Eraser, ListRestart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { MensajeEfecto } from '@/lib/react-en-vivo/mensajes'
import { cn } from '@/lib/utils'

function detalleEfecto(entrada: MensajeEfecto) {
  if (entrada.accion === 'limpieza') {
    return entrada.motivo === 'desmontaje' ? ' · desmontaje' : ''
  }
  switch (entrada.motivo) {
    case 'montaje':
      return ' · montaje'
    case 'strict-mode':
      return ' · repetido por StrictMode'
    case 'cada-render':
      return ' · se ejecuta en cada render'
    case 'desmontaje':
      return ' · desmontaje'
    case 'dependencias': {
      if (entrada.cambios.length === 0) return ' · cambiaron sus dependencias'
      const cambios = entrada.cambios
        .map((cambio) => `${cambio.nombre}: ${cambio.antes} → ${cambio.ahora}`)
        .join('; ')
      return ` · cambió ${cambios}`
    }
    default:
      return ''
  }
}

function textoEfecto(entrada: MensajeEfecto) {
  const origen = entrada.gancho
    ? `${entrada.componente} · ${entrada.gancho}`
    : entrada.componente
  const accion = entrada.accion === 'efecto' ? '▶ efecto' : '⟲ limpieza'
  return `${origen} ${accion}${detalleEfecto(entrada)}`
}

export function RegistroEfectos({
  entradas,
  onLimpiar,
}: {
  entradas: MensajeEfecto[]
  onLimpiar: () => void
}) {
  const visibles = entradas.slice(-200)
  const porCommit = new Map<number, MensajeEfecto[]>()
  for (const entrada of visibles) {
    const grupo = porCommit.get(entrada.commit)
    if (grupo) grupo.push(entrada)
    else porCommit.set(entrada.commit, [entrada])
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListRestart aria-hidden="true" className="size-4 text-violet-600 dark:text-violet-400" />
          <h4 className="text-sm font-semibold">Efectos</h4>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onLimpiar}>
          <Eraser aria-hidden="true" />
          Limpiar
        </Button>
      </div>

      <div
        role="region"
        aria-label="Registro de efectos"
        className="max-h-72 overflow-auto rounded-lg border bg-muted/40 p-2 font-mono text-xs"
      >
        {visibles.length === 0 ? (
          <p className="px-1 py-0.5 text-muted-foreground">Todavía no hay efectos.</p>
        ) : (
          <ol className="space-y-2">
            {[...porCommit].map(([commit, grupo]) => (
              <li key={commit} className="space-y-1">
                <p className="px-1 font-semibold text-muted-foreground">commit {commit}</p>
                <ul className="space-y-0.5">
                  {grupo.map((entrada, indice) => (
                    <li
                      key={`${entrada.archivo}-${entrada.linea}-${entrada.accion}-${indice}`}
                      className={cn(
                        'break-words px-1',
                        entrada.accion === 'efecto'
                          ? 'text-violet-700 dark:text-violet-300'
                          : 'text-amber-700 dark:text-amber-300',
                      )}
                    >
                      {textoEfecto(entrada)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
