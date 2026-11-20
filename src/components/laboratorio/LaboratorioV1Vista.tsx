import { Braces, FileCode, RotateCcw, ShieldCheck, WandSparkles } from 'lucide-react'
import { type CSSProperties, type Dispatch, type SetStateAction } from 'react'

import { EditorCodigo } from '@/components/codigo'
import { cn } from '@/lib/utils'

import { PanelesV1 } from './LaboratorioV1Paneles'
import { PestanasV1 } from './LaboratorioV1Pestanas'
import type { AnalisisV1, DiagnosticoV1 } from './laboratorio-v1-analisis'
import type { CorreccionV1, Fichero, Panel } from './laboratorio-v1-datos'

const CLASES_BOTON =
  'inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-[11px] transition-colors ' +
  'hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
  'disabled:pointer-events-none disabled:opacity-40'

/**
 * El panel es oscuro en los dos temas de la aplicación, a propósito: imita un
 * editor incrustado. La clase `dark` no es decorativa —redefine las variables
 * del tema y las de `sintaxis.css`—, así que todo lo de dentro (bordes, texto
 * apagado, colores de los tokens) usa la paleta oscura ya contrastada.
 */
const ESTILO_PANEL = {
  // `--sintaxis-texto` se declara en `:root` como `var(--foreground)` y llega
  // aquí ya resuelto en claro; volver a declararla sobre este contenedor —que
  // sí es `.dark`— hace que el texto plano del código use el color correcto.
  '--sintaxis-texto': 'var(--foreground)',
} as CSSProperties

type PropiedadesVistaV1 = {
  ficheroActivo: Fichero
  setFicheroActivo: Dispatch<SetStateAction<Fichero>>
  panelActivo: Panel
  setPanelActivo: Dispatch<SetStateAction<Panel>>
  fuenteActiva: string
  setHtml: Dispatch<SetStateAction<string>>
  setCss: Dispatch<SetStateAction<string>>
  lineasConError: number[]
  documento: string
  marcarProblemas: boolean
  setMarcarProblemas: Dispatch<SetStateAction<boolean>>
  verTabulacion: boolean
  setVerTabulacion: Dispatch<SetStateAction<boolean>>
  analisis: AnalisisV1
  diagnosticos: DiagnosticoV1[]
  pendientes: CorreccionV1[]
  errores: number
  avisos: number
  aplicarCorreccion: () => void
  restaurar: () => void
  base: string
}

function CabeceraEditorV1({
  restaurar,
  aplicarCorreccion,
  deshabilitada,
}: {
  restaurar: () => void
  aplicarCorreccion: () => void
  deshabilitada: boolean
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/40 px-3 py-2">
      <span aria-hidden="true" className="flex shrink-0 gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      </span>
      <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
        laboratorio-html / <span className="text-foreground">formulario-suscripcion</span>
      </p>
      <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
        <button type="button" onClick={restaurar} className={CLASES_BOTON}>
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          Restaurar
        </button>
        <button
          type="button"
          onClick={aplicarCorreccion}
          disabled={deshabilitada}
          className={cn(
            CLASES_BOTON,
            'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Aplicar corrección
        </button>
      </div>
    </div>
  )
}

function AreaEdicionV1(props: PropiedadesVistaV1) {
  const idPestana = (id: Fichero) => `${props.base}-fichero-${id}`
  const idPanel = (id: Fichero) => `${props.base}-editor-${id}`
  const problemasPorFichero = (fichero: Fichero) =>
    props.diagnosticos.filter((problema) => problema.fichero === fichero).length

  return (
    <div className="grid min-w-0 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col border-b lg:border-r lg:border-b-0">
        <PestanasV1
          etiqueta="Ficheros del proyecto"
          pestanas={[
            {
              id: 'index.html' as Fichero,
              etiqueta: 'index.html',
              icono: <FileCode aria-hidden="true" className="h-3.5 w-3.5" />,
              insignia: problemasPorFichero('index.html'),
              nombreAccesible: `index.html, ${problemasPorFichero('index.html')} problemas`,
            },
            {
              id: 'estilos.css' as Fichero,
              etiqueta: 'estilos.css',
              icono: <Braces aria-hidden="true" className="h-3.5 w-3.5" />,
              insignia: problemasPorFichero('estilos.css'),
              nombreAccesible: `estilos.css, ${problemasPorFichero('estilos.css')} problemas`,
            },
          ]}
          activa={props.ficheroActivo}
          alCambiar={props.setFicheroActivo}
          idPestana={idPestana}
          idPanel={idPanel}
          className="border-b bg-muted/20"
        />
        <div
          id={idPanel(props.ficheroActivo)}
          role="tabpanel"
          aria-labelledby={idPestana(props.ficheroActivo)}
          className="min-w-0 p-3"
        >
          <EditorCodigo
            valor={props.fuenteActiva}
            alCambiar={props.ficheroActivo === 'index.html' ? props.setHtml : props.setCss}
            etiqueta={`Código de ${props.ficheroActivo}, editable`}
            lenguaje={props.ficheroActivo === 'index.html' ? 'html' : 'css'}
            lineasDestacadas={props.lineasConError}
            numerarLineas
            className="h-72 sm:h-80 lg:h-92"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/20 px-3 py-1.5">
          <p aria-hidden="true" className="min-w-0 flex-1 truncate rounded border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            vista-previa://formulario-suscripcion
          </p>
          <label className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 font-mono text-[11px]">
            <input
              type="checkbox"
              checked={props.marcarProblemas}
              onChange={(evento) => props.setMarcarProblemas(evento.target.checked)}
              className="size-4 accent-primary"
            />
            Subrayar problemas
          </label>
          <label className="flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 font-mono text-[11px]">
            <input
              type="checkbox"
              checked={props.verTabulacion}
              onChange={(evento) => props.setVerTabulacion(evento.target.checked)}
              className="size-4 accent-primary"
            />
            Orden de tabulación
          </label>
        </div>
        <div className="p-3">
          <iframe
            className="block h-72 w-full max-w-full rounded-lg border bg-card sm:h-80 lg:h-92"
            sandbox=""
            srcDoc={props.documento}
            title="Vista previa del formulario"
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            La vista previa va en un iframe con sandbox vacío y sin permiso de red: aunque escribas
            un <code>&lt;script&gt;</code>, aquí no se ejecuta nada.
          </p>
        </div>
      </div>
    </div>
  )
}

function BarraEstadoV1(props: PropiedadesVistaV1) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
      <span>{props.ficheroActivo === 'index.html' ? 'HTML' : 'CSS'}</span>
      <span>Espacios: 2</span>
      <span>{props.fuenteActiva.split('\n').length} líneas</span>
      <span className={props.errores > 0 ? 'text-destructive' : undefined}>
        {props.errores} {props.errores === 1 ? 'error' : 'errores'}
      </span>
      <span style={props.avisos > 0 ? { color: 'var(--sintaxis-atributo)' } : undefined}>
        {props.avisos} {props.avisos === 1 ? 'aviso' : 'avisos'}
      </span>
      <span>{props.analisis.recorrido.length} paradas de teclado</span>
      <span className="ml-auto">sandbox vacío · sin red · sin scripts</span>
    </div>
  )
}

export function VistaLaboratorioV1(props: PropiedadesVistaV1) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Un formulario visto desde el editor</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Este formulario de suscripción se ve impecable y su botón principal es un{' '}
        <code>&lt;div&gt;</code> disfrazado: nadie que navegue con el teclado podrá enviarlo. Edita los
        ficheros, mira el panel de problemas y arregla la página —o deja que el editor lo haga por ti
        y compara.
      </p>
      <section
        aria-label="Editor del laboratorio"
        style={ESTILO_PANEL}
        className="dark mt-6 overflow-hidden rounded-xl border bg-background text-foreground shadow-lg"
      >
        <CabeceraEditorV1
          restaurar={props.restaurar}
          aplicarCorreccion={props.aplicarCorreccion}
          deshabilitada={props.pendientes.length === 0}
        />
        <AreaEdicionV1 {...props} />
        <PanelesV1
          panelActivo={props.panelActivo}
          setPanelActivo={props.setPanelActivo}
          diagnosticos={props.diagnosticos}
          analisis={props.analisis}
          pendientes={props.pendientes}
          idPestana={(id) => `${props.base}-pestana-${id}`}
          idPanel={(id) => `${props.base}-panel-${id}`}
        />
        <BarraEstadoV1 {...props} />
      </section>
    </>
  )
}
