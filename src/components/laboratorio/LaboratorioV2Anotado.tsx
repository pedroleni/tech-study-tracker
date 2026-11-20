import { useId, useMemo, useState } from 'react'

import { tokenizarLineas } from '@/components/codigo'
import '@/components/codigo/sintaxis.css'

import { PanelCodigoV2, PanelPaginaV2, type NotaPorLineaV2 } from './LaboratorioV2Vistas'
import {
  ANOTACIONES_V2,
  EJEMPLO_V2,
  analizarV2,
  capaAnclasV2,
  localizarLineaV2,
} from './laboratorio-v2-modelo'

export function LaboratorioV2Anotado() {
  const idCodigo = useId()
  const idPagina = useId()
  const [senalada, setSenalada] = useState<string | null>(null)
  const [anclada, setAnclada] = useState<string | null>(null)
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const lineas = useMemo(() => tokenizarLineas(EJEMPLO_V2, 'html'), [])
  const analisis = useMemo(() => analizarV2(EJEMPLO_V2, ANOTACIONES_V2), [])
  const notasPorLinea = useMemo(() => {
    const mapa = new Map<number, NotaPorLineaV2>()
    ANOTACIONES_V2.forEach((nota, indice) => {
      const linea = localizarLineaV2(EJEMPLO_V2, nota.ancla)
      if (linea > 0) mapa.set(linea, { nota, numero: indice + 1 })
    })
    return mapa
  }, [])

  // El ratón manda mientras esté encima; al salir, vuelve la nota anclada.
  const idActivo = senalada ?? anclada
  const activa = ANOTACIONES_V2.find((nota) => nota.id === idActivo) ?? null
  const lineaActiva = activa ? localizarLineaV2(EJEMPLO_V2, activa.ancla) : 0
  const documento = useMemo(
    () => capaAnclasV2(ANOTACIONES_V2, activa, mostrarTodas) + EJEMPLO_V2,
    [activa, mostrarTodas]
  )
  const senalar = (id: string) => () => setSenalada(id)
  const soltar = (id: string) => (evento: { currentTarget: HTMLElement }) => {
    // Si el foco sigue dentro de la tarjeta, el ratón puede irse tranquilo.
    if (evento.currentTarget.contains(document.activeElement)) return
    setSenalada((actual) => (actual === id ? null : actual))
  }

  return (
    <>
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Lectura anotada
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">
          Un formulario, comentado al margen
        </h1>
        <p className="mt-3 text-muted-foreground">
          Este formulario se ve bien, se envía con un clic y nadie ha protestado nunca. Léelo como
          se lee un texto anotado: cada nota está pegada a la línea que comenta. Al pasar por una
          nota —con el ratón o con el tabulador— se enciende su línea{' '}
          <span className="text-foreground">y</span> su elemento en la página, a la vez.
        </p>
      </header>
      <div className="mt-8 grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <PanelCodigoV2
          idCodigo={idCodigo}
          lineas={lineas}
          notasPorLinea={notasPorLinea}
          lineaActiva={lineaActiva}
          analisis={analisis}
          activa={activa}
          anclada={anclada}
          setAnclada={setAnclada}
          setSenalada={setSenalada}
          senalar={senalar}
          soltar={soltar}
        />
        <PanelPaginaV2
          idPagina={idPagina}
          mostrarTodas={mostrarTodas}
          setMostrarTodas={setMostrarTodas}
          documento={documento}
          activa={activa}
          analisis={analisis}
        />
      </div>
    </>
  )
}
