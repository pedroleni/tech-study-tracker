import type { ComponentProps } from 'react'

import { CabeceraReactEnVivo } from '@/components/bloques-laboratorio/CabeceraReactEnVivo'
import { ComprobadorReact } from '@/components/bloques-laboratorio/ComprobadorReact'
import { PanelCodigoReactEnVivo } from '@/components/bloques-laboratorio/EditorReactEnVivo'
import {
  PanelesActividadReactEnVivo,
  PanelVistaPreviaReactEnVivo,
} from '@/components/bloques-laboratorio/PanelesReactEnVivo'
import { ResultadosComprobaciones } from '@/components/bloques-laboratorio/ResultadosComprobaciones'
import type { EstadoComprobacion } from '@/components/bloques-laboratorio/reactEnVivoAyudas'

type PropiedadesVista = {
  etiquetaSeccion: string
  titulo: string
  consigna?: string
  cabecera: Omit<ComponentProps<typeof CabeceraReactEnVivo>, 'titulo'>
  codigo: ComponentProps<typeof PanelCodigoReactEnVivo>
  comprobacion: EstadoComprobacion
  vistaPrevia: ComponentProps<typeof PanelVistaPreviaReactEnVivo>
  actividad: ComponentProps<typeof PanelesActividadReactEnVivo>
  comprobador?: ComponentProps<typeof ComprobadorReact>
}

export function VistaReactEnVivo({
  etiquetaSeccion,
  titulo,
  consigna,
  cabecera,
  codigo,
  comprobacion,
  vistaPrevia,
  actividad,
  comprobador,
}: PropiedadesVista) {
  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 relative my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <CabeceraReactEnVivo titulo={titulo} {...cabecera} />

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      <div className="grid min-w-0 gap-4">
        <PanelCodigoReactEnVivo {...codigo} />

        {comprobacion.estado !== 'inactivo' && (
          <ResultadosComprobaciones
            estado={comprobacion.estado}
            resultados={'resultados' in comprobacion ? comprobacion.resultados : []}
          />
        )}

        <PanelVistaPreviaReactEnVivo {...vistaPrevia} />

        <PanelesActividadReactEnVivo {...actividad} />
      </div>

      {comprobador && <ComprobadorReact {...comprobador} />}
    </section>
  )
}
