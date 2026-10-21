import { css as lenguajeCss } from '@codemirror/lang-css'
import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'
import { Atom, ListChecks, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ArbolDeRenders } from '@/components/bloques-laboratorio/ArbolDeRenders'
import {
  ComprobadorReact,
  type FinComprobacion,
} from '@/components/bloques-laboratorio/ComprobadorReact'
import { ConsolaReact } from '@/components/bloques-laboratorio/ConsolaReact'
import { EditorCodeMirror } from '@/components/bloques-laboratorio/EditorCodeMirror'
import { PanelRed, type AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import { RegistroEfectos } from '@/components/bloques-laboratorio/RegistroEfectos'
import { ResultadosComprobaciones } from '@/components/bloques-laboratorio/ResultadosComprobaciones'
import { useEntradasConsola } from '@/components/bloques-laboratorio/useEntradasConsola'
import { useRegistroAgrupado } from '@/components/bloques-laboratorio/useRegistroAgrupado'
import { VistaPreviaReact } from '@/components/bloques-laboratorio/VistaPreviaReact'
import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import type { ArchivoReact, DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import { ESPERA_RECONSTRUIR_MS } from '@/lib/react-en-vivo/constantes'
import type {
  MensajeArbol,
  MensajeEfecto,
  MensajePeticion,
  MensajeReactEnVivo,
} from '@/lib/react-en-vivo/mensajes'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'
import { transformarParaMostrar } from '@/lib/react-en-vivo/transformar'
import { cn } from '@/lib/utils'

const PESTANA_JS_GENERADO = 'JavaScript generado'
const extensionJsx = lenguajeJavascript({ jsx: true })
const extensionCss = lenguajeCss()
const RED_POR_DEFECTO: AjustesRed = { latencia: 600, desordenar: false }

function incorporarPeticion(actuales: MensajePeticion[], nueva: MensajePeticion) {
  const posicion = actuales.findIndex((peticion) => peticion.id === nueva.id)
  if (posicion === -1) return [...actuales, nueva].slice(-20)
  return actuales.map((peticion, indice) => (indice === posicion ? nueva : peticion))
}

function incorporarPeticiones(actuales: MensajePeticion[], nuevas: MensajePeticion[]) {
  return nuevas.reduce(incorporarPeticion, actuales)
}

const incorporarEfectos = (actuales: MensajeEfecto[], nuevos: MensajeEfecto[]) => [
  ...actuales,
  ...nuevos,
]

type EstadoComprobacion =
  | { estado: 'inactivo' }
  | { estado: 'comprobando'; srcDoc: string | null }
  | FinComprobacion

export function ReactEnVivo({
  titulo = 'Escribe React y mira cómo responde.',
  consigna,
  archivos: archivosOriginales,
  archivoInicial,
  strictMode,
  mostrarConsola,
  mostrarJsGenerado,
  mostrarArbol = false,
  mostrarEfectos = false,
  api,
  red,
  comprobaciones,
  // Fuera del esquema de la lección, como en SqlAnotado/GitAnotado: solo
  // para no repetir el nombre de la región en la página de referencia.
  etiquetaSeccion = 'React en vivo',
}: Omit<DatosReactEnVivo, 'mostrarArbol' | 'mostrarEfectos'> & {
  mostrarArbol?: boolean
  mostrarEfectos?: boolean
  etiquetaSeccion?: string
}) {
  const primeraPestana = archivoInicial ?? 'App.jsx'
  const [archivos, setArchivos] = useState<ArchivoReact[]>(archivosOriginales)
  const [pestana, setPestana] = useState(primeraPestana)
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const [errorSintaxis, setErrorSintaxis] = useState<string | null>(null)
  const [jsGenerado, setJsGenerado] = useState('')
  const [comprobacion, setComprobacion] = useState<EstadoComprobacion>({ estado: 'inactivo' })
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
  const versionRef = useRef(0)
  const primeraVezRef = useRef(true)
  const botonComprobarRef = useRef<HTMLButtonElement>(null)
  // Cambia en cada "Reiniciar": remonta la vista previa aunque el código no
  // haya cambiado, para que la app vuelva a arrancar de cero.
  const [reinicios, setReinicios] = useState(0)

  const claveApi = JSON.stringify(api)
  const apiEstable = useMemo<Record<string, unknown[]> | undefined>(
    () => (claveApi === undefined ? undefined : JSON.parse(claveApi)),
    [claveApi],
  )

  useEffect(() => {
    // La primera vista previa sale sin esperar; después, 400 ms tras la última tecla.
    const espera = primeraVezRef.current ? 0 : ESPERA_RECONSTRUIR_MS
    primeraVezRef.current = false
    const temporizador = window.setTimeout(() => {
      versionRef.current += 1
      const version = versionRef.current
      void prepararDocumento(archivos, {
        origen: window.location.origin,
        strictMode,
        conPruebas: false,
        conArbol: mostrarArbol,
        conEfectos: mostrarEfectos,
        api: apiEstable,
        red: redActualRef.current,
      }).then((preparado) => {
        // Una transformación que llega después de otra más nueva se descarta.
        if (version !== versionRef.current) return
        if (!preparado.ok) {
          // La vista previa se queda en el último resultado válido.
          setErrorSintaxis(preparado.error)
          return
        }
        setErrorSintaxis(null)
        limpiar()
        // El árbol de la vista previa anterior ya no describe nada.
        documentoMontadoRef.current = false
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        setFalloPendiente(false)
        setSrcDoc(preparado.srcDoc)
      })
      if (mostrarJsGenerado) {
        void transformarParaMostrar(archivos).then((texto) => {
          if (version === versionRef.current) setJsGenerado(texto)
        })
      }
    }, espera)
    return () => window.clearTimeout(temporizador)
  }, [apiEstable, archivos, strictMode, mostrarJsGenerado, mostrarArbol, mostrarEfectos, limpiar, limpiarEfectos, limpiarPeticiones])

  const terminarComprobacion = useCallback((fin: FinComprobacion) => {
    setComprobacion(fin)
    // user-event escribe dentro del iframe oculto y se lleva el foco; al
    // quitarlo, el foco caería en <body>. Vuelve al botón, salvo que la
    // persona ya lo haya llevado a otro sitio.
    const activo = document.activeElement
    if (!activo || activo === document.body || activo.tagName === 'IFRAME') {
      botonComprobarRef.current?.focus()
    }
  }, [])

  async function comprobar() {
    if (!comprobaciones || comprobacion.estado === 'comprobando') return
    setComprobacion({ estado: 'comprobando', srcDoc: null })
    const preparado = await prepararDocumento(archivos, {
      origen: window.location.origin,
      strictMode,
      conPruebas: true,
      conEfectos: mostrarEfectos,
      api,
      red,
    })
    if (!preparado.ok) {
      setErrorSintaxis(preparado.error)
      setComprobacion({ estado: 'inactivo' })
      return
    }
    setComprobacion({ estado: 'comprobando', srcDoc: preparado.srcDoc })
  }

  function reiniciar() {
    setArchivos(archivosOriginales)
    setPestana(primeraPestana)
    setComprobacion({ estado: 'inactivo' })
    setReinicios((anteriores) => anteriores + 1)
    documentoMontadoRef.current = false
    setArbol(null)
    limpiarPeticiones()
    limpiarEfectos()
    setFalloPendiente(false)
    setFallosSolicitados(0)
    limpiar()
  }

  const pestanas = [
    ...archivos.map((archivo) => archivo.nombre),
    ...(mostrarJsGenerado ? [PESTANA_JS_GENERADO] : []),
  ]
  const archivoActivo = archivos.find((archivo) => archivo.nombre === pestana)

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 relative my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 dark:bg-sky-950/40">
            <Atom aria-hidden="true" className="size-4.75 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
              React en vivo
            </p>
            <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {comprobaciones && (
            <Button
              ref={botonComprobarRef}
              type="button"
              size="sm"
              onClick={() => void comprobar()}
              // aria-disabled y no disabled: un botón desactivado pierde el foco
              // del teclado y lo manda a <body>.
              aria-disabled={comprobacion.estado === 'comprobando'}
              className="aria-disabled:cursor-wait aria-disabled:opacity-60"
            >
              <ListChecks aria-hidden="true" />
              Comprobar
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={reiniciar}>
            <RotateCcw aria-hidden="true" />
            Reiniciar
          </Button>
        </div>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 space-y-2">
          <div
            role="group"
            aria-label="Archivo que quieres ver"
            className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-muted p-1"
          >
            {pestanas.map((nombre) => (
              <button
                key={nombre}
                type="button"
                aria-pressed={pestana === nombre}
                onClick={() => setPestana(nombre)}
                className={cn(
                  'min-h-10 shrink-0 touch-manipulation rounded-md px-3 py-1.5 font-mono text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  pestana === nombre
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {nombre}
              </button>
            ))}
          </div>

          {archivoActivo ? (
            <EditorCodeMirror
              key={archivoActivo.nombre}
              etiqueta={`Editor de ${archivoActivo.nombre}`}
              extension={archivoActivo.nombre.endsWith('.css') ? extensionCss : extensionJsx}
              valor={archivoActivo.codigo}
              onChange={(codigo) =>
                setArchivos((actuales) =>
                  actuales.map((archivo) =>
                    archivo.nombre === archivoActivo.nombre ? { ...archivo, codigo } : archivo,
                  ),
                )
              }
            />
          ) : (
            <CodigoResaltado
              codigo={jsGenerado || '// Preparando el JavaScript…'}
              lenguaje="js"
              numerarLineas
              etiqueta="JavaScript generado por Sucrase"
            />
          )}

          {errorSintaxis && (
            <p className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {errorSintaxis}
            </p>
          )}
        </div>

        {comprobacion.estado !== 'inactivo' && (
          <ResultadosComprobaciones
            estado={comprobacion.estado}
            resultados={'resultados' in comprobacion ? comprobacion.resultados : []}
          />
        )}

        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-semibold">Vista previa</h4>
          {srcDoc === null ? (
            <p className="text-sm text-muted-foreground">Preparando React…</p>
          ) : (
            <VistaPreviaReact
              key={reinicios}
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
      </div>

      {comprobacion.estado === 'comprobando' && comprobacion.srcDoc && comprobaciones && (
        <ComprobadorReact
          srcDoc={comprobacion.srcDoc}
          comprobaciones={comprobaciones}
          onTerminar={terminarComprobacion}
        />
      )}
    </section>
  )
}
