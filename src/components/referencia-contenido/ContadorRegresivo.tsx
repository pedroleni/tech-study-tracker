import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export interface PropiedadesContadorRegresivo {
  duracionSegundos: number
  etiqueta?: string
  alTerminar?: string
}

function partesTiempo(segundosTotales: number) {
  const segundos = Math.max(0, Math.floor(segundosTotales))
  return {
    horas: Math.floor(segundos / 3600),
    minutos: Math.floor((segundos % 3600) / 60),
    segundos: segundos % 60,
  }
}

export function ContadorRegresivo({
  duracionSegundos,
  etiqueta = 'Tiempo restante',
  alTerminar = 'Tiempo completado',
}: PropiedadesContadorRegresivo) {
  const [restantes, setRestantes] = useState(() => Math.max(0, Math.floor(duracionSegundos)))

  useEffect(() => {
    const reinicio = window.setTimeout(
      () => setRestantes(Math.max(0, Math.floor(duracionSegundos))),
      0,
    )
    if (duracionSegundos <= 0) return () => window.clearTimeout(reinicio)
    const fin = Date.now() + duracionSegundos * 1000
    const intervalo = window.setInterval(() => {
      const siguientes = Math.max(0, Math.ceil((fin - Date.now()) / 1000))
      setRestantes(siguientes)
      if (siguientes === 0) window.clearInterval(intervalo)
    }, 1000)
    return () => {
      window.clearTimeout(reinicio)
      window.clearInterval(intervalo)
    }
  }, [duracionSegundos])

  const tiempo = partesTiempo(restantes)
  const formateador = new Intl.NumberFormat('es-ES', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })

  return (
    <section className="rounded-xl border bg-card p-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
        <Timer aria-hidden="true" className="size-4 text-red-600 dark:text-red-400" />
        {etiqueta}
      </div>
      <div aria-live="polite" className="mt-4 flex items-center justify-center gap-2 tabular-nums">
        {restantes === 0 ? (
          <p className="font-semibold text-green-600 dark:text-green-400">{alTerminar}</p>
        ) : (
          Object.entries(tiempo).map(([unidad, valor], indice) => (
            <div key={unidad} className="flex items-center gap-2">
              {indice > 0 && <span aria-hidden="true" className="text-muted-foreground">:</span>}
              <div>
                <span className="block rounded-lg bg-muted px-3 py-2 text-2xl font-semibold">
                  {formateador.format(valor)}
                </span>
                <span className="mt-1 block text-[10px] tracking-wide text-muted-foreground uppercase">
                  {unidad}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
