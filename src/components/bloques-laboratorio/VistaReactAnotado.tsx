import { Atom } from 'lucide-react'

import { ArbolDeRenders } from '@/components/bloques-laboratorio/ArbolDeRenders'
import { BarraDirecciones } from '@/components/bloques-laboratorio/BarraDirecciones'
import { ConsolaReact } from '@/components/bloques-laboratorio/ConsolaReact'
import { NotasAnotadas } from '@/components/bloques-laboratorio/NotasAnotadas'
import { PanelRed } from '@/components/bloques-laboratorio/PanelRed'
import { RegistroEfectos } from '@/components/bloques-laboratorio/RegistroEfectos'
import { RegistroRouter } from '@/components/bloques-laboratorio/RegistroRouter'
import type { EstadoReactAnotado } from '@/components/bloques-laboratorio/useEstadoReactAnotado'
import { VistaPreviaReact } from '@/components/bloques-laboratorio/VistaPreviaReact'
import { CodigoResaltado } from '@/components/codigo'

type PropiedadesVistaReactAnotado = {
  titulo?: string
  codigo: string
  lenguaje: 'jsx' | 'tsx'
  mostrarConsola: boolean
  mostrarArbol: boolean
  mostrarEfectos: boolean
  mostrarRouter: boolean
  api?: Record<string, unknown[]>
  barraDeDirecciones: boolean
  etiquetaSeccion: string
  estado: EstadoReactAnotado
}

function CabeceraReactAnotado({ titulo }: { titulo?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 dark:bg-sky-950/40">
        <Atom aria-hidden="true" className="size-4.75 text-sky-600 dark:text-sky-400" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
          React anotado
        </p>
        <h3 className="text-lg font-bold tracking-tight text-balance">
          {titulo ?? 'Selecciona un número para destacar su línea y leer la nota'}
        </h3>
      </div>
    </div>
  )
}

function ResultadoReactAnotado({
  barraDeDirecciones,
  api,
  estado,
}: Pick<PropiedadesVistaReactAnotado, 'barraDeDirecciones' | 'api' | 'estado'>) {
  return (
    <div className="min-w-0 space-y-2">
      <h4 className="text-sm font-semibold">Resultado real</h4>
      {estado.error && (
        <p className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {estado.error}
        </p>
      )}
      {estado.srcDoc === null && !estado.error && (
        <p className="text-sm text-muted-foreground">Preparando React…</p>
      )}
      {estado.srcDoc !== null && (
        <>
          {barraDeDirecciones && estado.ubicacion && (
            <BarraDirecciones
              ubicacion={estado.ubicacion}
              onAccion={estado.actuarEnNavegador}
            />
          )}
          <VistaPreviaReact
            srcDoc={estado.srcDoc}
            onMensaje={estado.recibir}
            red={api ? estado.redActual : undefined}
            fallosSolicitados={estado.fallosSolicitados}
            ordenNavegador={estado.ordenNavegador}
          />
        </>
      )}
    </div>
  )
}

export function VistaReactAnotado({
  titulo,
  codigo,
  lenguaje,
  mostrarConsola,
  mostrarArbol,
  mostrarEfectos,
  mostrarRouter,
  api,
  barraDeDirecciones,
  etiquetaSeccion,
  estado,
}: PropiedadesVistaReactAnotado) {
  const anotacionActiva = estado.anotacionesValidas[estado.anotacionActiva]
  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <CabeceraReactAnotado titulo={titulo} />

      <CodigoResaltado
        codigo={codigo}
        lenguaje={lenguaje}
        numerarLineas
        lineasDestacadas={anotacionActiva ? [anotacionActiva.linea] : []}
        // Distinta de la de CodigoAnotado ("Código JSX anotado"): las dos
        // pueden convivir en una lección y una región no debe repetir nombre.
        etiqueta={
          etiquetaSeccion === 'React anotado'
            ? 'Código de React anotado'
            : `${etiquetaSeccion}: código anotado`
        }
      />

      <NotasAnotadas
        anotaciones={estado.anotacionesValidas}
        indiceActivo={estado.anotacionActiva}
        onActivar={estado.setAnotacionActiva}
        idNota={estado.idNota}
        etiqueta="Anotaciones del código"
        color="sky"
      />

      <ResultadoReactAnotado
        barraDeDirecciones={barraDeDirecciones}
        api={api}
        estado={estado}
      />

      {mostrarArbol && <ArbolDeRenders arbol={estado.arbol} />}

      {mostrarRouter && (
        <RegistroRouter
          operaciones={estado.operacionesRouter}
          lleno={estado.registroRouterLleno}
          soloDeclarativo={
            estado.ubicacion !== null &&
            ['MemoryRouter', 'BrowserRouter', 'HashRouter'].includes(estado.ubicacion.origen)
          }
          onLimpiar={() => {
            estado.limpiarOperacionesRouter()
            estado.setRegistroRouterLleno(false)
          }}
        />
      )}

      {api && (
        <PanelRed
          red={estado.redActual}
          peticiones={estado.peticiones}
          falloPendiente={estado.falloPendiente}
          onCambiar={estado.cambiarRed}
          onFallarSiguiente={() => {
            estado.setFalloPendiente(true)
            estado.setFallosSolicitados((cantidad) => cantidad + 1)
          }}
        />
      )}

      {mostrarEfectos && (
        <RegistroEfectos entradas={estado.efectos} onLimpiar={estado.limpiarEfectos} />
      )}

      {mostrarConsola && (
        <ConsolaReact entradas={estado.entradas} onLimpiar={estado.limpiar} />
      )}
    </section>
  )
}
