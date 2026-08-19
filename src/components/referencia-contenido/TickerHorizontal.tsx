import { useState } from 'react'
import { CodeXml, Pause, Play } from 'lucide-react'

export interface PropiedadesTickerHorizontal {
  items: string[]
  duracionSegundos?: number
  etiqueta?: string
}

export function TickerHorizontal({
  items,
  duracionSegundos = 18,
  etiqueta = 'Temas HTML',
}: PropiedadesTickerHorizontal) {
  const [pausado, setPausado] = useState(false)
  if (items.length === 0) return null

  return (
    <section aria-label={etiqueta} className="group overflow-hidden rounded-xl border-y bg-card py-3">
      <div className="mb-2 flex justify-end px-3">
        <button
          type="button"
          aria-label={pausado ? 'Reanudar cinta' : 'Pausar cinta'}
          aria-pressed={pausado}
          onClick={() => setPausado((actual) => !actual)}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {pausado ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
        </button>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div
          className="flex w-max animate-[catalogo-ticker_linear_infinite] motion-reduce:animate-none group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duracionSegundos}s`, animationPlayState: pausado ? 'paused' : undefined }}
        >
          {[0, 1].map((copia) => (
            <ul key={copia} aria-hidden={copia === 1 ? 'true' : undefined} className="flex shrink-0 gap-3 px-1">
              {items.map((item, indice) => (
                <li
                  key={`${copia}-${item}-${indice}`}
                  className="flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm font-medium whitespace-nowrap"
                >
                  <CodeXml aria-hidden="true" className="size-4 text-blue-600 dark:text-blue-400" />
                  <span translate="no">{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
