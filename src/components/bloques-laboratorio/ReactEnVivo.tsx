import { PresentacionReactEnVivo } from '@/components/bloques-laboratorio/PresentacionReactEnVivo'
import type { PropiedadesReactEnVivo } from '@/components/bloques-laboratorio/reactEnVivoAyudas'
import { useComprobacionReactEnVivo } from '@/components/bloques-laboratorio/useComprobacionReactEnVivo'
import { useEstadoReactEnVivo } from '@/components/bloques-laboratorio/useEstadoReactEnVivo'
import { clienteReactKitCompartido } from '@/lib/react-kit/cliente'

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
}: PropiedadesReactEnVivo) {
  const primeraPestana =
    archivoInicial ??
    (archivosOriginales.some((archivo) => archivo.nombre === 'App.tsx') ? 'App.tsx' : 'App.jsx')
  const estado = useEstadoReactEnVivo({
    archivosOriginales,
    primeraPestana,
    strictMode,
    mostrarJsGenerado,
    mostrarArbol,
    mostrarEfectos,
    mostrarRouter,
    mostrarLint,
    exigirLintLimpio,
    compilador,
    api,
    red,
    urlInicial,
    clienteReactKit,
  })
  const control = useComprobacionReactEnVivo({
    comprobaciones,
    exigirTiposCorrectos,
    exigirLintLimpio,
    tiposPendientes: estado.tiposPendientes,
    lintPendiente: estado.lintPendiente,
    diagnosticosTipos: estado.diagnosticosTipos,
    diagnosticosLint: estado.diagnosticosLintActuales,
    resultadoTipos: estado.resultadoTipos,
    resultadoLint: estado.resultadoLint,
    compilador,
    archivos: estado.archivos,
    sesionCompilador: estado.sesionCompiladorComprobacion,
    strictMode,
    mostrarEfectos,
    api,
    red,
    urlInicial,
    setAvisosCompilador: estado.setAvisosCompilador,
    setErrorSintaxis: estado.setErrorSintaxis,
  })

  return (
    <PresentacionReactEnVivo
      configuracion={{
        titulo,
        consigna,
        archivosOriginales,
        primeraPestana,
        mostrarConsola,
        mostrarJsGenerado,
        mostrarArbol,
        mostrarEfectos,
        mostrarRouter,
        mostrarLint,
        compilador,
        exigirLintLimpio,
        exigirTiposCorrectos,
        api,
        comprobaciones,
        barraDeDirecciones,
        etiquetaSeccion,
        etiquetaPanelTipos,
      }}
      estado={estado}
      control={control}
    />
  )
}
