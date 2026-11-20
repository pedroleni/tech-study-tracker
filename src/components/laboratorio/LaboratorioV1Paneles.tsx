import { CircleCheck, CircleX, Keyboard, TriangleAlert, WandSparkles } from 'lucide-react'

import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'

import { PestanasV1 } from './LaboratorioV1Pestanas'
import type { AnalisisV1, DiagnosticoV1 } from './laboratorio-v1-analisis'
import {
  CSS_CORREGIDO_V1,
  HTML_CORREGIDO_V1,
  type CorreccionV1,
  type Panel,
} from './laboratorio-v1-datos'

function PanelProblemasV1({ diagnosticos }: { diagnosticos: DiagnosticoV1[] }) {
  if (diagnosticos.length === 0) {
    return (
      <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <CircleCheck aria-hidden="true" className="h-4 w-4" />
        Sin problemas. El teclado llega a todo lo que se puede pulsar.
      </p>
    )
  }

  return (
    <ul className="space-y-1">
      {diagnosticos.map((problema) => (
        <li
          key={problema.clave}
          className="rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted/40"
        >
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
            {problema.nivel === 'error' ? (
              <CircleX aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-destructive" />
            ) : (
              <TriangleAlert
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: 'var(--sintaxis-atributo)' }}
              />
            )}
            <span className="sr-only">
              {problema.nivel === 'error' ? 'Error' : 'Aviso'}:
            </span>
            <span
              className={cn(problema.nivel === 'error' ? 'text-destructive' : 'text-foreground')}
              style={problema.nivel === 'aviso' ? { color: 'var(--sintaxis-atributo)' } : undefined}
            >
              {problema.regla}
            </span>
            <span className="text-muted-foreground">
              {`${problema.fichero}:${problema.linea}:${problema.columna}`}
            </span>
          </p>
          <p className="mt-0.5 pl-5.5 text-xs">{problema.mensaje}</p>
          {problema.pista && <p className="pl-5.5 text-xs text-muted-foreground">{problema.pista}</p>}
        </li>
      ))}
    </ul>
  )
}

function PanelRecorridoV1({ analisis }: { analisis: AnalisisV1 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 font-mono text-[11px] text-muted-foreground">Paradas del tabulador, en orden</p>
        <ol className="space-y-1">
          {analisis.recorrido.map((paso, indice) => (
            <li key={`${paso.firma}-${indice}`} className="flex items-center gap-2 font-mono text-[11px]">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {indice + 1}
              </span>
              <span className="truncate">{paso.texto}</span>
              <span className="truncate text-muted-foreground">{paso.firma}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="mb-2 font-mono text-[11px] text-muted-foreground">
          Se puede pulsar, pero no se puede alcanzar
        </p>
        {analisis.trampas.length === 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            Nada. Ratón y teclado ven la misma página.
          </p>
        ) : (
          <ul className="space-y-1">
            {analisis.trampas.map((trampa, indice) => (
              <li
                key={`${trampa.firma}-${indice}`}
                className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 font-mono text-[11px]"
              >
                <CircleX aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-destructive" />
                <span className="truncate">{trampa.texto}</span>
                <span className="truncate text-muted-foreground">{trampa.firma}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function PanelCorreccionV1({ pendientes }: { pendientes: CorreccionV1[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Tres cambios: el <code>&lt;div&gt;</code> pasa a <code>&lt;button&gt;</code> —entra solo en el
        recorrido y responde a Enter y Espacio—, el campo recibe un{' '}<code>&lt;label&gt;</code> de
        verdad, y el CSS vuelve a dibujar el foco que un botón nativo necesita.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 font-mono text-[11px] text-muted-foreground">index.html</p>
          <CodigoResaltado
            codigo={HTML_CORREGIDO_V1}
            lenguaje="html"
            etiqueta="Corrección propuesta para index.html"
            numerarLineas
            lineasDestacadas={[1, 2, 4]}
            alturaMaxima="9rem"
          />
        </div>
        <div>
          <p className="mb-1 font-mono text-[11px] text-muted-foreground">estilos.css</p>
          <CodigoResaltado
            codigo={CSS_CORREGIDO_V1}
            lenguaje="css"
            etiqueta="Corrección propuesta para estilos.css"
            numerarLineas
            lineasDestacadas={[6, 7, 8, 9]}
            alturaMaxima="9rem"
          />
        </div>
      </div>
      {pendientes.length === 0 && (
        <p className="font-mono text-[11px] text-muted-foreground">
          Ya está aplicada (o has cambiado esas líneas a mano).
        </p>
      )}
    </div>
  )
}

type PropiedadesPanelesV1 = {
  panelActivo: Panel
  setPanelActivo: (panel: Panel) => void
  diagnosticos: DiagnosticoV1[]
  analisis: AnalisisV1
  pendientes: CorreccionV1[]
  idPestana: (panel: Panel) => string
  idPanel: (panel: Panel) => string
}

export function PanelesV1({
  panelActivo,
  setPanelActivo,
  diagnosticos,
  analisis,
  pendientes,
  idPestana,
  idPanel,
}: PropiedadesPanelesV1) {
  return (
    <div className="border-t">
      <PestanasV1
        etiqueta="Paneles de análisis"
        pestanas={[
          {
            id: 'problemas' as Panel,
            etiqueta: `PROBLEMAS (${diagnosticos.length})`,
            icono: <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" />,
          },
          {
            id: 'recorrido' as Panel,
            etiqueta: `TECLADO (${analisis.recorrido.length})`,
            icono: <Keyboard aria-hidden="true" className="h-3.5 w-3.5" />,
          },
          {
            id: 'correccion' as Panel,
            etiqueta: 'CORRECCIÓN',
            icono: <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />,
          },
        ]}
        activa={panelActivo}
        alCambiar={setPanelActivo}
        idPestana={idPestana}
        idPanel={idPanel}
        className="bg-muted/20"
      />

      <div
        id={idPanel(panelActivo)}
        role="tabpanel"
        aria-labelledby={idPestana(panelActivo)}
        tabIndex={0}
        className="max-h-72 min-h-48 overflow-auto p-3 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring lg:h-60"
      >
        {panelActivo === 'problemas' && <PanelProblemasV1 diagnosticos={diagnosticos} />}
        {panelActivo === 'recorrido' && <PanelRecorridoV1 analisis={analisis} />}
        {panelActivo === 'correccion' && <PanelCorreccionV1 pendientes={pendientes} />}
      </div>
    </div>
  )
}
