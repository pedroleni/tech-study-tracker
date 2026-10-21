import { Atom } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { ArbolDeRenders } from '@/components/bloques-laboratorio/ArbolDeRenders'
import { ConsolaReact } from '@/components/bloques-laboratorio/ConsolaReact'
import { PanelRed, type AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import { RegistroEfectos } from '@/components/bloques-laboratorio/RegistroEfectos'
import { useEntradasConsola } from '@/components/bloques-laboratorio/useEntradasConsola'
import { useRegistroAgrupado } from '@/components/bloques-laboratorio/useRegistroAgrupado'
import { VistaPreviaReact } from '@/components/bloques-laboratorio/VistaPreviaReact'
import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import type { DatosReactAnotado } from '@/lib/laboratorio/schemas'
import type {
  MensajeArbol,
  MensajeEfecto,
  MensajePeticion,
  MensajeReactEnVivo,
} from '@/lib/react-en-vivo/mensajes'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'
import { cn } from '@/lib/utils'

const RED_POR_DEFECTO: AjustesRed = { latencia: 600, desordenar: false }

function incorporarPeticion(actuales: MensajePeticion[], nueva: MensajePeticion) {
  const posicion = actuales.findIndex((peticion) => peticion.id === nueva.id)
  if (posicion === -1) return [...actuales, nueva].slice(-20)
  return actuales.map((peticion, indice) => (indice === posicion ? nueva : peticion))
}
function incorporarPeticiones(actuales: MensajePeticion[], nuevas: MensajePeticion[]) {
  return nuevas.reduce(incorporarPeticion, actuales)
}
const incorporarEfectos = (actuales: MensajeEfecto[], nuevos: MensajeEfecto[]) => [...actuales, ...nuevos]

export function ReactAnotado({
  titulo,
  codigo,
  css,
  anotaciones,
  strictMode,
  mostrarConsola,
  mostrarArbol = false,
  mostrarEfectos = false,
  api,
  red,
  // Fuera del esquema de la lección, como en GitAnotado: solo para no
  // repetir el nombre de la región en la página de referencia.
  etiquetaSeccion = 'React anotado',
}: Omit<DatosReactAnotado, 'mostrarArbol' | 'mostrarEfectos'> & {
  mostrarArbol?: boolean
  mostrarEfectos?: boolean
  etiquetaSeccion?: string
}) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () =>
      anotaciones.flatMap((anotacion) => {
        const posicion = codigo.indexOf(anotacion.fragmento)
        if (posicion === -1) return []
        return [{ ...anotacion, linea: codigo.slice(0, posicion).split('\n').length }]
      }),
    [anotaciones, codigo],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { entradas, recibirMensaje, limpiar } = useEntradasConsola()
  const [arbol, setArbol] = useState<MensajeArbol | null>(null)
  const { entradas: peticiones, recibir: recibirPeticion, limpiar: limpiarPeticiones } =
    useRegistroAgrupado(20, incorporarPeticiones)
  const { entradas: efectos, recibir: recibirEfecto, limpiar: limpiarEfectos } =
    useRegistroAgrupado(200, incorporarEfectos)
  const [falloPendiente, setFalloPendiente] = useState(false)
  const [fallosSolicitados, setFallosSolicitados] = useState(0)
  const [redActual, setRedActual] = useState<AjustesRed>({
    latencia: red?.latencia ?? RED_POR_DEFECTO.latencia,
    desordenar: red?.desordenar ?? RED_POR_DEFECTO.desordenar,
  })
  const redActualRef = useRef(redActual)
  const cambiarRed = useCallback((nueva: AjustesRed) => {
    redActualRef.current = nueva
    setRedActual(nueva)
  }, [])
  const documentoMontadoRef = useRef(false)
  const recibir = useCallback(
    (mensaje: MensajeReactEnVivo) => {
      recibirMensaje(mensaje)
      if (mensaje.tipo === 'montado') documentoMontadoRef.current = true
      if (mensaje.tipo === 'arbol' && documentoMontadoRef.current) setArbol(mensaje)
      if (mensaje.tipo === 'peticion' && documentoMontadoRef.current) {
        recibirPeticion(mensaje)
        if (mensaje.codigo === 500) setFalloPendiente(false)
      }
      if (mensaje.tipo === 'efecto' && documentoMontadoRef.current) recibirEfecto(mensaje)
    },
    [recibirEfecto, recibirMensaje, recibirPeticion],
  )

  const claveApi = JSON.stringify(api)
  const apiEstable = useMemo<Record<string, unknown[]> | undefined>(
    () => (claveApi === undefined ? undefined : JSON.parse(claveApi)),
    [claveApi],
  )

  useEffect(() => {
    let cancelado = false
    const archivos = [
      { nombre: 'App.jsx', codigo },
      ...(css ? [{ nombre: 'estilos.css', codigo: css }] : []),
    ]
    void prepararDocumento(archivos, {
      origen: window.location.origin,
      strictMode,
      conPruebas: false,
      conArbol: mostrarArbol,
      conEfectos: mostrarEfectos,
      api: apiEstable,
      red: redActualRef.current,
    }).then((preparado) => {
      if (cancelado) return
      if (preparado.ok) {
        documentoMontadoRef.current = false
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        setFalloPendiente(false)
        limpiar()
        setSrcDoc(preparado.srcDoc)
      } else setError(preparado.error)
    })
    return () => {
      cancelado = true
    }
  }, [apiEstable, codigo, css, strictMode, mostrarArbol, mostrarEfectos, limpiar, limpiarEfectos, limpiarPeticiones])

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
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

      <CodigoResaltado
        codigo={codigo}
        lenguaje="jsx"
        numerarLineas
        lineasDestacadas={activa ? [activa.linea] : []}
        // Distinta de la de CodigoAnotado ("Código JSX anotado"): las dos
        // pueden convivir en una lección y una región no debe repetir nombre.
        etiqueta="Código de React anotado"
      />

      {anotacionesValidas.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Anotaciones del código">
            {anotacionesValidas.map((anotacion, indice) => (
              <Button
                key={`${anotacion.fragmento}-${indice}`}
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={indice === anotacionActiva}
                aria-controls={idNota}
                aria-label={`Ver anotación ${indice + 1}: ${anotacion.nota}`}
                onClick={() => setAnotacionActiva(indice)}
                className={cn(
                  'size-11 touch-manipulation rounded-full transition-colors',
                  indice === anotacionActiva &&
                    'border-sky-500 bg-sky-500 text-white hover:bg-sky-500 dark:border-sky-400 dark:bg-sky-400 dark:text-sky-950',
                )}
              >
                {indice + 1}
              </Button>
            ))}
          </div>
          <p
            key={anotacionActiva}
            id={idNota}
            aria-live="polite"
            className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border-l-4 border-sky-500 bg-sky-50 p-3 text-sm text-pretty duration-200 motion-reduce:animate-none dark:border-sky-400 dark:bg-sky-950/30"
          >
            <span className="font-semibold">Nota {anotacionActiva + 1}.</span> {activa?.nota}
          </p>
        </div>
      )}

      <div className="min-w-0 space-y-2">
        <h4 className="text-sm font-semibold">Resultado real</h4>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}
        {srcDoc === null && !error && (
          <p className="text-sm text-muted-foreground">Preparando React…</p>
        )}
        {srcDoc !== null && (
          <VistaPreviaReact
            srcDoc={srcDoc}
            onMensaje={recibir}
            red={api ? redActual : undefined}
            fallosSolicitados={fallosSolicitados}
          />
        )}
      </div>

      {mostrarArbol && <ArbolDeRenders arbol={arbol} />}

      {api && (
        <PanelRed
          red={redActual}
          peticiones={peticiones}
          falloPendiente={falloPendiente}
          onCambiar={cambiarRed}
          onFallarSiguiente={() => {
            setFalloPendiente(true)
            setFallosSolicitados((cantidad) => cantidad + 1)
          }}
        />
      )}

      {mostrarEfectos && (
        <RegistroEfectos entradas={efectos} onLimpiar={limpiarEfectos} />
      )}

      {mostrarConsola && <ConsolaReact entradas={entradas} onLimpiar={limpiar} />}
    </section>
  )
}
