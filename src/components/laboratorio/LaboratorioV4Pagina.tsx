import { type Dispatch, type SetStateAction } from 'react'

import { cn } from '@/lib/utils'

import { PRESETS_V4, type CapaV4, type IdPresetV4 } from './laboratorio-v4-datos'

type PropiedadesPaginaV4 = {
  idPagina: string
  preset: IdPresetV4
  cambiarPreset: (id: IdPresetV4) => void
  capasActivas: CapaV4[]
  seleccion: string | null
  setSeleccion: Dispatch<SetStateAction<string | null>>
  documento: string
  resumen: string
}

export function PaginaV4(props: PropiedadesPaginaV4) {
  return (
    <section aria-labelledby={props.idPagina} className="min-w-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={props.idPagina} className="text-sm font-semibold">La página, por dentro</h2>
        <div className="flex flex-wrap gap-1">
          {PRESETS_V4.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={props.preset === opcion.id}
              onClick={() => props.cambiarPreset(opcion.id)}
              className={cn(
                'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
                props.preset === opcion.id
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-80 overflow-hidden rounded-lg border">
        <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
          {props.capasActivas.length === 0 ? (
            <span className="text-xs text-muted-foreground">Sin capas: la página, tal cual la ve quien mira.</span>
          ) : (
            props.capasActivas.map((capa) => (
              <span key={capa.id} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: capa.color }} />
                {capa.nombre}
              </span>
            ))
          )}
          {props.seleccion && (
            <button
              type="button"
              onClick={() => props.setSeleccion(null)}
              className="ml-auto min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors hover:bg-muted"
            >
              Quitar el foco del elemento señalado
            </button>
          )}
        </div>
        {/* sandbox="" : el iframe no ejecuta ni un solo script. */}
        <iframe
          className="block h-80 min-h-80 w-full max-w-full bg-card sm:h-[28rem] lg:h-[32rem] xl:h-[36rem]"
          sandbox=""
          srcDoc={props.documento}
          title="La página con las capas del escáner superpuestas"
        />
      </div>
      <p role="status" className="mt-2 text-xs text-muted-foreground">{props.resumen}</p>
    </section>
  )
}
