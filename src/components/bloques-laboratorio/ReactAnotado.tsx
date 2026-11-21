import { VistaReactAnotado } from '@/components/bloques-laboratorio/VistaReactAnotado'
import {
  type PropiedadesReactAnotado,
  useEstadoReactAnotado,
} from '@/components/bloques-laboratorio/useEstadoReactAnotado'

export function ReactAnotado({
  titulo,
  codigo,
  css,
  anotaciones,
  strictMode,
  mostrarConsola,
  mostrarArbol = false,
  mostrarEfectos = false,
  mostrarRouter = false,
  api,
  red,
  urlInicial,
  barraDeDirecciones = true,
  lenguaje = 'jsx',
  // Fuera del esquema de la lección, como en GitAnotado: solo para no
  // repetir el nombre de la región en la página de referencia.
  etiquetaSeccion = 'React anotado',
}: PropiedadesReactAnotado) {
  const estado = useEstadoReactAnotado({
    codigo,
    css,
    anotaciones,
    strictMode,
    mostrarArbol,
    mostrarEfectos,
    mostrarRouter,
    api,
    red,
    urlInicial,
    lenguaje,
  })

  return (
    <VistaReactAnotado
      titulo={titulo}
      codigo={codigo}
      lenguaje={lenguaje}
      mostrarConsola={mostrarConsola}
      mostrarArbol={mostrarArbol}
      mostrarEfectos={mostrarEfectos}
      mostrarRouter={mostrarRouter}
      api={api}
      barraDeDirecciones={barraDeDirecciones}
      etiquetaSeccion={etiquetaSeccion}
      estado={estado}
    />
  )
}
