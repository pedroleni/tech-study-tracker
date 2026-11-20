import { type Dispatch, type SetStateAction } from 'react'

import { CodigoResaltado, EditorCodigo } from '@/components/codigo'
import { cn } from '@/lib/utils'

type VistaCodigoV4 = 'html' | 'lente'

type PropiedadesCodigoV4 = {
  idPanelCodigo: string
  codigoAbierto: boolean
  setCodigoAbierto: Dispatch<SetStateAction<boolean>>
  vistaCodigo: VistaCodigoV4
  setVistaCodigo: Dispatch<SetStateAction<VistaCodigoV4>>
  html: string
  cambiarHtml: (valor: string) => void
  lineasTrampa: number[]
  cssLente: string
}

export function CodigoV4(props: PropiedadesCodigoV4) {
  return (
    <section className="mt-4">
      <button
        type="button"
        aria-expanded={props.codigoAbierto}
        aria-controls={props.idPanelCodigo}
        onClick={() => props.setCodigoAbierto((abierto) => !abierto)}
        className="flex min-h-11 w-full touch-manipulation items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-muted"
      >
        <span>El código</span>
        <span className="text-xs font-normal text-muted-foreground">
          {props.codigoAbierto ? 'Ocultar y dejarle todo el sitio a la página' : 'Mostrar'}
        </span>
      </button>
      <div id={props.idPanelCodigo} hidden={!props.codigoAbierto}>
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            aria-pressed={props.vistaCodigo === 'html'}
            onClick={() => props.setVistaCodigo('html')}
            className={cn(
              'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
              props.vistaCodigo === 'html'
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            HTML de la página
          </button>
          <button
            type="button"
            aria-pressed={props.vistaCodigo === 'lente'}
            onClick={() => props.setVistaCodigo('lente')}
            className={cn(
              'min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs transition-colors',
              props.vistaCodigo === 'lente'
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            CSS de la lente
          </button>
        </div>
        {props.vistaCodigo === 'html' ? (
          <div className="mt-2">
            <p className="mb-1.5 text-xs text-muted-foreground">
              Edítalo y el escáner vuelve a pasar. Se destacan las líneas que cuelgan un manejador
              de algo que no es un control.
            </p>
            <EditorCodigo
              valor={props.html}
              alCambiar={props.cambiarHtml}
              etiqueta="Código HTML de la página"
              lenguaje="html"
              numerarLineas
              lineasDestacadas={props.lineasTrampa}
              className="h-72 sm:h-80 lg:h-[22rem]"
            />
          </div>
        ) : (
          <div className="mt-2">
            <p className="mb-1.5 text-xs text-muted-foreground">
              Esto es lo que el escáner inyecta ahora mismo delante de tu HTML. Cambia con cada
              capa que enciendes.
            </p>
            <CodigoResaltado
              codigo={props.cssLente}
              lenguaje="css"
              numerarLineas
              etiqueta="CSS que el escáner superpone a la página"
              alturaMaxima="22rem"
            />
          </div>
        )}
      </div>
    </section>
  )
}
