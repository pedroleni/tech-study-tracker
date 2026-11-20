import { useId, useMemo, useState } from 'react'

import { CodigoV4 } from './LaboratorioV4Codigo'
import { LecturasV4 } from './LaboratorioV4Lecturas'
import { PaginaV4 } from './LaboratorioV4Pagina'
import { PanelCapasV4 } from './LaboratorioV4PanelCapas'
import { analizarV4, localizarTrampasV4 } from './laboratorio-v4-analisis'
import {
  CAPAS_V4,
  HTML_FORMULARIO_V4,
  PRESETS_V4,
  type IdCapaV4,
  type IdPresetV4,
} from './laboratorio-v4-datos'
import { construirCssLenteV4 } from './laboratorio-v4-lente'

export function LaboratorioV4Radiografia() {
  const [preset, setPreset] = useState<IdPresetV4>('formulario')
  const [html, setHtml] = useState(HTML_FORMULARIO_V4)
  const [capas, setCapas] = useState<Set<IdCapaV4>>(
    () => new Set<IdCapaV4>(['regiones', 'foco'])
  )
  const [rotulos, setRotulos] = useState(true)
  const [radiografia, setRadiografia] = useState(false)
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [codigoAbierto, setCodigoAbierto] = useState(true)
  const [vistaCodigo, setVistaCodigo] = useState<'html' | 'lente'>('html')

  const idPanelCodigo = useId()
  const idCapas = useId()
  const idPagina = useId()
  const idLecturas = useId()

  const analisis = useMemo(() => analizarV4(html), [html])
  const capasActivas = useMemo(() => CAPAS_V4.filter((capa) => capas.has(capa.id)), [capas])
  // Con tres capas o más los rótulos largos empiezan a estorbar: se abrevian solos.
  const compacto = capasActivas.length >= 3
  const cssLente = useMemo(
    () => construirCssLenteV4(analisis, { capas, rotulos, compacto, radiografia, seleccion }),
    [analisis, capas, rotulos, compacto, radiografia, seleccion]
  )
  const lineasTrampa = useMemo(() => localizarTrampasV4(html), [html])
  const documento = `<style>\n${cssLente}\n</style>\n${html}`

  const cambiarHtml = (valor: string) => {
    setSeleccion(null)
    setHtml(valor)
  }
  const cambiarPreset = (id: IdPresetV4) => {
    setPreset(id)
    setSeleccion(null)
    setHtml(PRESETS_V4.find((opcion) => opcion.id === id)!.html)
  }
  const alternarCapa = (id: IdCapaV4) => {
    setCapas((previas) => {
      const siguientes = new Set(previas)
      if (siguientes.has(id)) siguientes.delete(id)
      else siguientes.add(id)
      return siguientes
    })
  }

  const resumen = [
    `${capasActivas.length} ${capasActivas.length === 1 ? 'capa encendida' : 'capas encendidas'}`,
    `${analisis.regiones.length} regiones`,
    `${analisis.foco.length} paradas del teclado`,
    `${analisis.encabezados.length} encabezados`,
    `${analisis.trampas.length + analisis.nombres.filter((hallazgo) => hallazgo.gravedad === 'error').length} problemas graves`,
  ].join(' · ')

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Radiografía de una página</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Esta página se ve perfecta y su botón principal es un <code>&lt;div&gt;</code>{' '}
        disfrazado. Enciende las capas del escáner y míralo por dentro: las regiones, el recorrido
        del teclado, el índice de encabezados y lo que no tiene nombre, dibujados encima de la
        página de verdad.
      </p>
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        {/* ---------- Panel de capas ---------- */}
        <PanelCapasV4
          idCapas={idCapas}
          capas={capas}
          setCapas={setCapas}
          alternarCapa={alternarCapa}
          radiografia={radiografia}
          setRadiografia={setRadiografia}
          rotulos={rotulos}
          setRotulos={setRotulos}
          analisis={analisis}
        />
        {/* ---------- La página, que es la protagonista ---------- */}
        <PaginaV4
          idPagina={idPagina}
          preset={preset}
          cambiarPreset={cambiarPreset}
          capasActivas={capasActivas}
          seleccion={seleccion}
          setSeleccion={setSeleccion}
          documento={documento}
          resumen={resumen}
        />
        {/* ---------- Lecturas del escáner ---------- */}
        <LecturasV4
          idLecturas={idLecturas}
          capasActivas={capasActivas}
          analisis={analisis}
          seleccion={seleccion}
          setSeleccion={setSeleccion}
        />
      </div>
      {/* ---------- El código, en segundo plano ---------- */}
      <CodigoV4
        idPanelCodigo={idPanelCodigo}
        codigoAbierto={codigoAbierto}
        setCodigoAbierto={setCodigoAbierto}
        vistaCodigo={vistaCodigo}
        setVistaCodigo={setVistaCodigo}
        html={html}
        cambiarHtml={cambiarHtml}
        lineasTrampa={lineasTrampa}
        cssLente={cssLente}
      />
    </>
  )
}
