import { type Dispatch, type SetStateAction } from 'react'

import { cn } from '@/lib/utils'

import { hallazgosDeV4 } from './laboratorio-v4-analisis'
import { CAPAS_V4, type AnalisisV4, type IdCapaV4 } from './laboratorio-v4-datos'

type PropiedadesPanelCapasV4 = {
  idCapas: string
  capas: Set<IdCapaV4>
  setCapas: Dispatch<SetStateAction<Set<IdCapaV4>>>
  alternarCapa: (id: IdCapaV4) => void
  radiografia: boolean
  setRadiografia: Dispatch<SetStateAction<boolean>>
  rotulos: boolean
  setRotulos: Dispatch<SetStateAction<boolean>>
  analisis: AnalisisV4
}

export function PanelCapasV4(props: PropiedadesPanelCapasV4) {
  return (
    <section aria-labelledby={props.idCapas} className="min-w-0 lg:sticky lg:top-4 lg:self-start">
      <h2 id={props.idCapas} className="mb-2 text-sm font-semibold">Capas del escáner</h2>
      <div className="space-y-2 rounded-lg border p-2">
        {CAPAS_V4.map((capa) => {
          const total = hallazgosDeV4(props.analisis, capa.id).length
          const encendida = props.capas.has(capa.id)
          return (
            <label
              key={capa.id}
              htmlFor={`capa-${capa.id}`}
              className={cn(
                'flex min-h-11 cursor-pointer touch-manipulation gap-2 rounded-md border p-2 transition-colors',
                encendida ? 'bg-muted' : 'border-transparent hover:bg-muted/50'
              )}
            >
              <input
                id={`capa-${capa.id}`}
                type="checkbox"
                aria-label={capa.nombre}
                className="mt-0.5 size-4 shrink-0"
                checked={encendida}
                onChange={() => props.alternarCapa(capa.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  {/* El único color crudo de la interfaz: tiene que ser
                      exactamente el mismo que se pinta sobre la página. */}
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: capa.color }}
                  />
                  <span className="flex-1 text-sm font-medium">{capa.nombre}</span>
                  <span className="shrink-0 rounded bg-muted-foreground/15 px-1.5 text-xs tabular-nums">
                    {total}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{capa.explicacion}</span>
              </span>
            </label>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => props.setCapas(new Set(CAPAS_V4.map((capa) => capa.id)))}
          className="min-h-11 flex-1 touch-manipulation rounded-md border px-2 py-2 text-xs transition-colors hover:bg-muted"
        >
          Encender todas
        </button>
        <button
          type="button"
          onClick={() => props.setCapas(new Set())}
          className="min-h-11 flex-1 touch-manipulation rounded-md border px-2 py-2 text-xs transition-colors hover:bg-muted"
        >
          Apagar todas
        </button>
      </div>
      <div className="mt-3 space-y-2 rounded-lg border p-2">
        <label className="flex min-h-11 cursor-pointer touch-manipulation items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0"
            checked={props.radiografia}
            onChange={(evento) => props.setRadiografia(evento.target.checked)}
          />
          <span>
            Modo radiografía
            <span className="block text-xs text-muted-foreground">
              La página pierde su color y solo queda la estructura. El botón falso, sin su disfraz
              de CSS, deja de parecer un botón.
            </span>
          </span>
        </label>
        <label className="flex min-h-11 cursor-pointer touch-manipulation items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0"
            checked={props.rotulos}
            onChange={(evento) => props.setRotulos(evento.target.checked)}
          />
          <span>
            Rótulos de texto
            <span className="block text-xs text-muted-foreground">
              Apágalos para quedarte solo con los colores. Los números del teclado se quedan igual.
            </span>
          </span>
        </label>
      </div>
      <details className="mt-3 rounded-lg border px-3 py-2">
        <summary className="flex min-h-11 cursor-pointer touch-manipulation items-center text-sm font-medium">
          ¿Por qué no se estorban entre ellas?
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">
          Cada capa dibuja con una propiedad distinta y tiene una esquina reservada para su rótulo,
          así que nunca compiten por el mismo píxel:
        </p>
        <ul className="mt-2 space-y-1">
          {CAPAS_V4.map((capa) => (
            <li key={capa.id} className="flex gap-2 text-xs">
              <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: capa.color }} />
              <span><span className="font-medium">{capa.nombre}:</span>{' '}<span className="text-muted-foreground">{capa.canal}</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Con tres capas o más los rótulos se abrevian solos, y al señalar un hallazgo se apaga todo
          lo demás.
        </p>
      </details>
    </section>
  )
}
