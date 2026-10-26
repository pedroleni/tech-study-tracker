import { css as lenguajeCss } from '@codemirror/lang-css'
import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'
import { Atom, ListChecks, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { ArbolDeRenders } from '@/components/bloques-laboratorio/ArbolDeRenders'
import {
  BarraDirecciones,
  type AccionNavegador,
} from '@/components/bloques-laboratorio/BarraDirecciones'
import {
  ComprobadorReact,
  type FinComprobacion,
} from '@/components/bloques-laboratorio/ComprobadorReact'
import { ConsolaReact } from '@/components/bloques-laboratorio/ConsolaReact'
import { EditorCodeMirror } from '@/components/bloques-laboratorio/EditorCodeMirror'
import {
  PanelDiagnosticosTs,
  type DiagnosticoPanelTs,
} from '@/components/bloques-laboratorio/PanelDiagnosticosTs'
import { PanelLint } from '@/components/bloques-laboratorio/PanelLint'
import { PanelRed, type AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import { RegistroEfectos } from '@/components/bloques-laboratorio/RegistroEfectos'
import { RegistroRouter } from '@/components/bloques-laboratorio/RegistroRouter'
import {
  ResultadosComprobaciones,
  type ResultadoComprobacion,
} from '@/components/bloques-laboratorio/ResultadosComprobaciones'
import { useEntradasConsola } from '@/components/bloques-laboratorio/useEntradasConsola'
import { useRegistroAgrupado } from '@/components/bloques-laboratorio/useRegistroAgrupado'
import { VistaPreviaReact } from '@/components/bloques-laboratorio/VistaPreviaReact'
import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import type { ArchivoReact, DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import { ESPERA_RECONSTRUIR_MS } from '@/lib/react-en-vivo/constantes'
import {
  compilarArchivosReact,
  type AvisoCompiladorReact,
} from '@/lib/react-en-vivo/compilar'
import type {
  MensajeArbol,
  MensajeEfecto,
  MensajePeticion,
  MensajeReactEnVivo,
  MensajeRouterOperacion,
} from '@/lib/react-en-vivo/mensajes'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'
import { transformarParaMostrar } from '@/lib/react-en-vivo/transformar'
import {
  clienteReactKitCompartido,
  type ClienteReactKit,
  type DiagnosticoLint,
} from '@/lib/react-kit/cliente'
import { cn } from '@/lib/utils'

const PESTANA_JS_GENERADO = 'JavaScript generado'
const extensionJsx = lenguajeJavascript({ jsx: true })
const extensionTsx = lenguajeJavascript({ jsx: true, typescript: true })
const extensionCss = lenguajeCss()
const RED_POR_DEFECTO: AjustesRed = { latencia: 600, desordenar: false }
const COMPROBACIONES_VACIAS: NonNullable<DatosReactEnVivo['comprobaciones']> = []

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

function incorporarOperaciones(
  actuales: MensajeRouterOperacion[],
  nuevas: MensajeRouterOperacion[],
) {
  // Un Map conserva el orden y sustituye en su sitio. Recortar en cada paso, y
  // no al final del lote, evita copiar el array entero por cada id nuevo.
  const porId = new Map(actuales.map((operacion) => [operacion.id, operacion]))
  for (const nueva of nuevas) {
    porId.set(nueva.id, nueva)
    if (porId.size > 100) porId.delete(porId.keys().next().value!)
  }
  return [...porId.values()]
}

type EstadoComprobacion =
  | { estado: 'inactivo' }
  | { estado: 'comprobando'; srcDoc: string | null }
  | FinComprobacion

type ResultadoTipos = {
  revision: number
  estado: 'listo' | 'error'
  diagnosticos: DiagnosticoPanelTs[]
  error?: string
}

type ResultadoLintBloque = {
  revision: number
  estado: 'listo' | 'error'
  diagnosticos: DiagnosticoLint[]
  error?: string
}

function recortarMotivo(texto: string, maximo = 240) {
  if (texto.length <= maximo) return texto
  return `${texto.slice(0, maximo - 1).trimEnd()}…`
}

function motivoDiagnosticoLint(diagnostico: DiagnosticoLint) {
  const ubicacion = diagnostico.columna > 0
    ? `${diagnostico.archivo}:${diagnostico.linea}:${diagnostico.columna}`
    : `${diagnostico.archivo}:${diagnostico.linea}`
  return recortarMotivo(
    [
      ubicacion,
      diagnostico.regla,
      diagnostico.mensaje,
    ]
      .filter((parte) => parte !== null)
      .join(' · '),
  )
}

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
  mostrarRouter = false,
  mostrarLint = false,
  compilador = false,
  exigirLintLimpio = false,
  exigirTiposCorrectos = false,
  api,
  red,
  comprobaciones,
  urlInicial,
  barraDeDirecciones = true,
  clienteReactKit = clienteReactKitCompartido,
  // Fuera del esquema de la lección, como en SqlAnotado/GitAnotado: solo
  // para no repetir el nombre de la región en la página de referencia.
  etiquetaSeccion = 'React en vivo',
  etiquetaPanelTipos = 'Errores de tipos',
}: Omit<
  DatosReactEnVivo,
  | 'mostrarArbol'
  | 'mostrarEfectos'
  | 'mostrarRouter'
  | 'mostrarLint'
  | 'compilador'
  | 'exigirLintLimpio'
  | 'exigirTiposCorrectos'
  | 'barraDeDirecciones'
> & {
  mostrarArbol?: boolean
  mostrarEfectos?: boolean
  mostrarRouter?: boolean
  mostrarLint?: boolean
  compilador?: boolean
  exigirLintLimpio?: boolean
  exigirTiposCorrectos?: boolean
  barraDeDirecciones?: boolean
  clienteReactKit?: ClienteReactKit
  etiquetaSeccion?: string
  etiquetaPanelTipos?: string
}) {
  const primeraPestana =
    archivoInicial ??
    (archivosOriginales.some((archivo) => archivo.nombre === 'App.tsx') ? 'App.tsx' : 'App.jsx')
  const [archivos, setArchivos] = useState<ArchivoReact[]>(archivosOriginales)
  const [pestana, setPestana] = useState(primeraPestana)
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const [ubicacion, setUbicacion] = useState<
    Extract<MensajeReactEnVivo, { tipo: 'ubicacion' }> | null
  >(null)
  const urlActualRef = useRef<string | null>(null)
  const [ordenNavegador, setOrdenNavegador] = useState<{
    id: number
    accion: AccionNavegador
    url?: string
  }>()
  const siguienteOrdenNavegadorRef = useRef(0)
  const [errorSintaxis, setErrorSintaxis] = useState<string | null>(null)
  const [jsGenerado, setJsGenerado] = useState('')
  const [avisosCompilador, setAvisosCompilador] = useState<AvisoCompiladorReact[]>([])
  const [comprobacion, setComprobacion] = useState<EstadoComprobacion>({ estado: 'inactivo' })
  const usaTypeScript = archivosOriginales.some(
    (archivo) => archivo.nombre.endsWith('.ts') || archivo.nombre.endsWith('.tsx'),
  )
  const [revisionTipos, setRevisionTipos] = useState(0)
  const [resultadoTipos, setResultadoTipos] = useState<ResultadoTipos>({
    revision: -1,
    estado: 'listo',
    diagnosticos: [],
  })
  const tiposPendientes = usaTypeScript && resultadoTipos.revision !== revisionTipos
  const estadoPanelTipos = resultadoTipos.revision === -1 ? 'cargando' : resultadoTipos.estado
  const diagnosticosTipos = resultadoTipos.diagnosticos
  const versionTiposRef = useRef(0)
  const sesionTiposRef = useRef<Promise<ReturnType<
    typeof import('@/lib/react-en-vivo/tipos')['crearSesionTiposReact']
  >> | null>(null)
  const usaLint = mostrarLint || exigirLintLimpio
  const [revisionLint, setRevisionLint] = useState(0)
  const [resultadoLint, setResultadoLint] = useState<ResultadoLintBloque>({
    revision: -1,
    estado: 'listo',
    diagnosticos: [],
  })
  const lintPendiente = usaLint && resultadoLint.revision !== revisionLint
  const estadoPanelLint = resultadoLint.revision === -1 ? 'cargando' : resultadoLint.estado
  const diagnosticosLintActuales =
    resultadoLint.revision === revisionLint ? resultadoLint.diagnosticos : []
  const versionLintRef = useRef(0)
  const sesionLint = useMemo(() => clienteReactKit.crearSesionLint(), [clienteReactKit])
  const sesionCompiladorVista = useMemo(
    () => clienteReactKit.crearSesionCompilador(),
    [clienteReactKit],
  )
  const sesionCompiladorComprobacion = useMemo(
    () => clienteReactKit.crearSesionCompilador(),
    [clienteReactKit],
  )
  const resultadosTiposRef = useRef<ResultadoComprobacion[]>([])
  const { entradas, recibirMensaje, limpiar } = useEntradasConsola()
  const [arbol, setArbol] = useState<MensajeArbol | null>(null)
  const { entradas: peticiones, recibir: recibirPeticion, limpiar: limpiarPeticiones } =
    useRegistroAgrupado(20, incorporarPeticiones)
  const { entradas: efectos, recibir: recibirEfecto, limpiar: limpiarEfectos } =
    useRegistroAgrupado(200, incorporarEfectos)
  const {
    entradas: operacionesRouter,
    recibir: recibirOperacionRouter,
    limpiar: limpiarOperacionesRouter,
  } = useRegistroAgrupado(100, incorporarOperaciones)
  const [registroRouterLleno, setRegistroRouterLleno] = useState(false)
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
      if (mensaje.tipo === 'ubicacion') {
        urlActualRef.current = mensaje.url
        setUbicacion(mensaje)
      }
      if (mensaje.tipo === 'arbol' && documentoMontadoRef.current) setArbol(mensaje)
      if (mensaje.tipo === 'peticion' && documentoMontadoRef.current) {
        recibirPeticion(mensaje)
        if (mensaje.codigo === 500) setFalloPendiente(false)
      }
      if (mensaje.tipo === 'efecto' && documentoMontadoRef.current) recibirEfecto(mensaje)
      if (mensaje.tipo === 'router-operacion' && documentoMontadoRef.current) {
        recibirOperacionRouter(mensaje)
      }
      if (mensaje.tipo === 'router-lleno') setRegistroRouterLleno(true)
    },
    [recibirEfecto, recibirMensaje, recibirOperacionRouter, recibirPeticion],
  )
  const versionRef = useRef(0)
  const primeraVezRef = useRef(true)
  const botonComprobarRef = useRef<HTMLButtonElement>(null)
  const idErroresTipos = useId()
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
    const version = ++versionRef.current
    if (compilador) sesionCompiladorVista.descartar()
    const temporizador = window.setTimeout(() => {
      void (async () => {
        const resultadoCompilador = compilador
          ? await compilarArchivosReact(archivos, sesionCompiladorVista)
          : { archivos, avisos: [] }
        if (!resultadoCompilador || version !== versionRef.current) return

        const [preparado, textoGenerado] = await Promise.all([
          prepararDocumento(resultadoCompilador.archivos, {
            origen: window.location.origin,
            strictMode,
            conPruebas: false,
            conArbol: mostrarArbol,
            conEfectos: mostrarEfectos,
            conRegistroRouter: mostrarRouter,
            api: apiEstable,
            red: redActualRef.current,
            urlInicial: urlActualRef.current ?? urlInicial,
          }),
          mostrarJsGenerado
            ? transformarParaMostrar(resultadoCompilador.archivos)
            : Promise.resolve(null),
        ])
        // Una compilación o transformación que llega después de otra más
        // nueva se descarta en bloque: vista, avisos y JS siempre coinciden.
        if (version !== versionRef.current) return
        if (textoGenerado !== null) setJsGenerado(textoGenerado)
        if (!preparado.ok) {
          setAvisosCompilador(
            preparado.archivo
              ? resultadoCompilador.avisos.filter((aviso) => aviso.archivo !== preparado.archivo)
              : resultadoCompilador.avisos,
          )
          // La vista previa se queda en el último resultado válido.
          setErrorSintaxis(preparado.error)
          return
        }
        setAvisosCompilador(resultadoCompilador.avisos)
        setErrorSintaxis(null)
        limpiar()
        // El árbol de la vista previa anterior ya no describe nada.
        documentoMontadoRef.current = false
        setUbicacion(null)
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        limpiarOperacionesRouter()
        setRegistroRouterLleno(false)
        setFalloPendiente(false)
        setSrcDoc(preparado.srcDoc)
      })()
    }, espera)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionRef.current) versionRef.current += 1
      if (compilador) sesionCompiladorVista.descartar()
    }
  }, [apiEstable, archivos, compilador, sesionCompiladorVista, strictMode, mostrarJsGenerado, mostrarArbol, mostrarEfectos, mostrarRouter, limpiar, limpiarEfectos, limpiarOperacionesRouter, limpiarPeticiones, reinicios, urlInicial])

  useEffect(() => {
    if (!usaTypeScript) return
    const version = ++versionTiposRef.current
    const temporizador = window.setTimeout(() => {
      void (async () => {
        let sesionTipos
        try {
          sesionTiposRef.current ??= import('@/lib/react-en-vivo/tipos').then(
            ({ crearSesionTiposReact }) => crearSesionTiposReact(),
          )
          sesionTipos = await sesionTiposRef.current
        } catch {
          if (version === versionTiposRef.current) {
            setResultadoTipos((actual) => ({
              revision: revisionTipos,
              estado: 'error',
              diagnosticos: actual.diagnosticos,
              error: 'No se pudo cargar TypeScript',
            }))
          }
          return
        }

        try {
          const diagnosticos = await sesionTipos.diagnosticar(archivos)
          if (version !== versionTiposRef.current) return
          setResultadoTipos({ revision: revisionTipos, estado: 'listo', diagnosticos })
        } catch (error) {
          if (version === versionTiposRef.current) {
            const detalle = error instanceof Error ? error.message : String(error)
            setResultadoTipos((actual) => ({
              revision: revisionTipos,
              estado: 'error',
              diagnosticos: actual.diagnosticos,
              error: detalle,
            }))
          }
        }
      })()
    }, ESPERA_RECONSTRUIR_MS)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionTiposRef.current) versionTiposRef.current += 1
    }
  }, [archivos, revisionTipos, usaTypeScript])

  useEffect(() => {
    if (!usaLint) return
    const version = ++versionLintRef.current
    const temporizador = window.setTimeout(() => {
      const archivosLint = archivos.filter((archivo) => /\.(jsx|tsx)$/.test(archivo.nombre))
      void sesionLint.analizar(archivosLint).then((resultado) => {
        if (!resultado || version !== versionLintRef.current) return
        if (resultado.ok) {
          setResultadoLint({
            revision: revisionLint,
            estado: 'listo',
            diagnosticos: resultado.diagnosticos,
          })
          return
        }
        setResultadoLint({
          revision: revisionLint,
          estado: 'error',
          diagnosticos: [],
          error: resultado.error,
        })
      })
    }, ESPERA_RECONSTRUIR_MS)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionLintRef.current) versionLintRef.current += 1
    }
  }, [archivos, revisionLint, sesionLint, usaLint])

  useEffect(
    () => () => {
      sesionLint.descartar()
      sesionCompiladorVista.descartar()
      sesionCompiladorComprobacion.descartar()
    },
    [sesionCompiladorComprobacion, sesionCompiladorVista, sesionLint],
  )

  const terminarComprobacion = useCallback((fin: FinComprobacion) => {
    setComprobacion({
      ...fin,
      resultados: [...resultadosTiposRef.current, ...fin.resultados],
    })
    // user-event escribe dentro del iframe oculto y se lleva el foco; al
    // quitarlo, el foco caería en <body>. Vuelve al botón, salvo que la
    // persona ya lo haya llevado a otro sitio.
    const activo = document.activeElement
    if (!activo || activo === document.body || activo.tagName === 'IFRAME') {
      botonComprobarRef.current?.focus()
    }
  }, [])

  async function comprobar() {
    if (
      (!comprobaciones && !exigirTiposCorrectos && !exigirLintLimpio) ||
      comprobacion.estado === 'comprobando' ||
      (exigirTiposCorrectos && tiposPendientes) ||
      (exigirLintLimpio && lintPendiente)
    ) return
    const primerErrorTipos = diagnosticosTipos.find(
      (diagnostico) => diagnostico.severidad === 'error',
    )
    const resultadosRequisitos: ResultadoComprobacion[] = []
    if (exigirTiposCorrectos) {
      const tiposListos = resultadoTipos.estado === 'listo'
      resultadosRequisitos.push({
        descripcion: 'El código no tiene errores de tipos',
        ok: tiposListos && !primerErrorTipos,
        ...(resultadoTipos.estado === 'error'
          ? {
              motivo: `No se pudieron comprobar los tipos: ${resultadoTipos.error ?? 'falló el análisis'}`,
            }
          : primerErrorTipos
          ? {
              motivo: `${primerErrorTipos.archivo}:${primerErrorTipos.linea}:${primerErrorTipos.columna} · ${primerErrorTipos.mensaje}`,
            }
          : {}),
      })
    }
    if (exigirLintLimpio) {
      const primerDiagnosticoLint = diagnosticosLintActuales[0]
      resultadosRequisitos.push({
        descripcion: 'El linter no marca nada',
        ok: resultadoLint.estado === 'listo' && !primerDiagnosticoLint,
        ...(resultadoLint.estado === 'error'
          ? { motivo: resultadoLint.error ?? 'No se pudo cargar el linter' }
          : primerDiagnosticoLint
            ? { motivo: motivoDiagnosticoLint(primerDiagnosticoLint) }
            : {}),
      })
    }
    resultadosTiposRef.current = resultadosRequisitos
    if (!comprobaciones || comprobaciones.length === 0) {
      terminarComprobacion({ estado: 'listo', resultados: [] })
      return
    }
    setComprobacion({ estado: 'comprobando', srcDoc: null })
    const resultadoCompilador = compilador
      ? await compilarArchivosReact(archivos, sesionCompiladorComprobacion)
      : { archivos, avisos: [] }
    if (!resultadoCompilador) {
      setComprobacion({ estado: 'inactivo' })
      return
    }
    setAvisosCompilador(resultadoCompilador.avisos)
    const preparado = await prepararDocumento(resultadoCompilador.archivos, {
      origen: window.location.origin,
      strictMode,
      conPruebas: true,
      conEfectos: mostrarEfectos,
      api,
      red,
      urlInicial,
    })
    if (!preparado.ok) {
      setErrorSintaxis(preparado.error)
      setComprobacion({ estado: 'inactivo' })
      return
    }
    setComprobacion({ estado: 'comprobando', srcDoc: preparado.srcDoc })
  }

  function reiniciar() {
    if (usaTypeScript) setRevisionTipos((revision) => revision + 1)
    if (usaLint) setRevisionLint((revision) => revision + 1)
    setArchivos(archivosOriginales)
    urlActualRef.current = null
    setUbicacion(null)
    setOrdenNavegador(undefined)
    setSrcDoc(null)
    setPestana(primeraPestana)
    setComprobacion({ estado: 'inactivo' })
    setAvisosCompilador([])
    resultadosTiposRef.current = []
    setReinicios((anteriores) => anteriores + 1)
    documentoMontadoRef.current = false
    setArbol(null)
    limpiarPeticiones()
    limpiarEfectos()
    limpiarOperacionesRouter()
    setRegistroRouterLleno(false)
    setFalloPendiente(false)
    setFallosSolicitados(0)
    limpiar()
  }

  const actuarEnNavegador = useCallback(
    (accion: AccionNavegador, url?: string) => {
      if (accion === 'recargar' || accion === 'ir') {
        limpiar()
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        limpiarOperacionesRouter()
        setRegistroRouterLleno(false)
        setFalloPendiente(false)
      }
      siguienteOrdenNavegadorRef.current += 1
      setOrdenNavegador({ id: siguienteOrdenNavegadorRef.current, accion, ...(url ? { url } : {}) })
    },
    [limpiar, limpiarEfectos, limpiarOperacionesRouter, limpiarPeticiones],
  )

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
          {(comprobaciones || exigirTiposCorrectos || exigirLintLimpio) && (
            <Button
              ref={botonComprobarRef}
              type="button"
              size="sm"
              onClick={() => void comprobar()}
              // aria-disabled y no disabled: un botón desactivado pierde el foco
              // del teclado y lo manda a <body>.
              aria-disabled={
                comprobacion.estado === 'comprobando' ||
                (exigirTiposCorrectos && tiposPendientes) ||
                (exigirLintLimpio && lintPendiente)
              }
              className="aria-disabled:cursor-wait aria-disabled:opacity-60"
            >
              <ListChecks aria-hidden="true" />
              {exigirTiposCorrectos && tiposPendientes
                ? 'Esperando a los tipos…'
                : exigirLintLimpio && lintPendiente
                  ? 'Esperando al linter…'
                  : 'Comprobar'}
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
              extension={
                archivoActivo.nombre.endsWith('.css')
                  ? extensionCss
                  : /\.(ts|tsx)$/.test(archivoActivo.nombre)
                    ? extensionTsx
                    : extensionJsx
              }
              valor={archivoActivo.codigo}
              onChange={(codigo) => {
                if (usaTypeScript) setRevisionTipos((revision) => revision + 1)
                if (usaLint) setRevisionLint((revision) => revision + 1)
                setArchivos((actuales) =>
                  actuales.map((archivo) =>
                    archivo.nombre === archivoActivo.nombre ? { ...archivo, codigo } : archivo,
                  ),
                )
              }}
            />
          ) : (
            <CodigoResaltado
              codigo={jsGenerado || '// Preparando el JavaScript…'}
              lenguaje="js"
              numerarLineas
              etiqueta={
                compilador
                  ? 'JavaScript generado por React Compiler y Sucrase'
                  : 'JavaScript generado por Sucrase'
              }
            />
          )}

          {errorSintaxis && (
            <p className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {errorSintaxis}
            </p>
          )}

          {usaTypeScript && (
            <section aria-labelledby={idErroresTipos} className="space-y-2">
              <h4 id={idErroresTipos} className="text-sm font-semibold">
                {etiquetaPanelTipos}
              </h4>
              <PanelDiagnosticosTs
                estado={estadoPanelTipos}
                diagnosticos={diagnosticosTipos}
                error={
                  resultadoTipos.estado === 'error'
                    ? `No se pudieron analizar los tipos: ${resultadoTipos.error ?? 'error desconocido'}`
                    : undefined
                }
                agruparPorArchivo
              />
            </section>
          )}

          {mostrarLint && (
            <PanelLint
              estado={estadoPanelLint}
              diagnosticos={resultadoLint.diagnosticos}
              error={resultadoLint.error}
            />
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
          {avisosCompilador.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {avisosCompilador.map((aviso) => (
                <li key={aviso.archivo}>
                  {aviso.archivo} no se pudo compilar: {aviso.error.split(/\r?\n/, 1)[0]}
                </li>
              ))}
            </ul>
          )}
          {srcDoc === null ? (
            <p className="text-sm text-muted-foreground">Preparando React…</p>
          ) : (
            <>
              {barraDeDirecciones && ubicacion && (
                <BarraDirecciones ubicacion={ubicacion} onAccion={actuarEnNavegador} />
              )}
              <VistaPreviaReact
                key={reinicios}
                srcDoc={srcDoc}
                onMensaje={recibir}
                red={api ? redActual : undefined}
                fallosSolicitados={fallosSolicitados}
                codigoCompilado={compilador}
                ordenNavegador={ordenNavegador}
              />
            </>
          )}
        </div>

        {mostrarArbol && <ArbolDeRenders arbol={arbol} />}

        {mostrarRouter && (
          <RegistroRouter
            operaciones={operacionesRouter}
            lleno={registroRouterLleno}
            soloDeclarativo={
              ubicacion !== null &&
              ['MemoryRouter', 'BrowserRouter', 'HashRouter'].includes(ubicacion.origen)
            }
            onLimpiar={() => {
              limpiarOperacionesRouter()
              setRegistroRouterLleno(false)
            }}
          />
        )}

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

      {comprobacion.estado === 'comprobando' &&
        comprobacion.srcDoc &&
        (comprobaciones || exigirTiposCorrectos || exigirLintLimpio) && (
        <ComprobadorReact
          srcDoc={comprobacion.srcDoc}
          comprobaciones={comprobaciones ?? COMPROBACIONES_VACIAS}
          onTerminar={terminarComprobacion}
        />
      )}
    </section>
  )
}
