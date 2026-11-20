import { useId, useMemo, useState } from 'react'

import { VistaLaboratorioV1 } from './LaboratorioV1Vista'
import { analizarCssV1, analizarHtmlV1 } from './laboratorio-v1-analisis'
import {
  CAPA_PROBLEMAS_V1,
  CAPA_TABULACION_V1,
  CORRECCIONES_V1,
  CSS_INICIAL_V1,
  HTML_INICIAL_V1,
  META_SEGURIDAD_V1,
  type Fichero,
  type Panel,
} from './laboratorio-v1-datos'

export function LaboratorioV1Editor() {
  const [html, setHtml] = useState(HTML_INICIAL_V1)
  const [css, setCss] = useState(CSS_INICIAL_V1)
  const [ficheroActivo, setFicheroActivo] = useState<Fichero>('index.html')
  const [panelActivo, setPanelActivo] = useState<Panel>('problemas')
  const [marcarProblemas, setMarcarProblemas] = useState(true)
  const [verTabulacion, setVerTabulacion] = useState(false)
  const base = useId()

  const analisis = useMemo(() => analizarHtmlV1(html), [html])
  const diagnosticosCss = useMemo(() => analizarCssV1(css), [css])
  const diagnosticos = useMemo(
    () => [...analisis.diagnosticos, ...diagnosticosCss],
    [analisis.diagnosticos, diagnosticosCss]
  )
  const errores = diagnosticos.filter((problema) => problema.nivel === 'error').length
  const avisos = diagnosticos.length - errores
  const lineasConError = useMemo(
    () =>
      diagnosticos
        .filter((problema) => problema.fichero === ficheroActivo)
        .map((problema) => problema.linea),
    [diagnosticos, ficheroActivo]
  )
  const documento = useMemo(
    () =>
      [
        META_SEGURIDAD_V1,
        `<style>\n${css}\n</style>`,
        marcarProblemas ? CAPA_PROBLEMAS_V1 : '',
        verTabulacion ? CAPA_TABULACION_V1 : '',
        html,
      ]
        .filter(Boolean)
        .join('\n'),
    [css, html, marcarProblemas, verTabulacion]
  )

  const fuenteActiva = ficheroActivo === 'index.html' ? html : css
  const pendientes = CORRECCIONES_V1.filter((correccion) =>
    (correccion.fichero === 'index.html' ? html : css).includes(correccion.buscar)
  )

  const aplicarCorreccion = () => {
    let htmlNuevo = html
    let cssNuevo = css
    for (const correccion of pendientes) {
      if (correccion.fichero === 'index.html') {
        htmlNuevo = htmlNuevo.replace(correccion.buscar, correccion.reemplazar)
      } else {
        cssNuevo = cssNuevo.replace(correccion.buscar, correccion.reemplazar)
      }
    }
    setHtml(htmlNuevo)
    setCss(cssNuevo)
    setPanelActivo('problemas')
  }

  const restaurar = () => {
    setHtml(HTML_INICIAL_V1)
    setCss(CSS_INICIAL_V1)
    setPanelActivo('problemas')
  }

  return (
    <VistaLaboratorioV1
      ficheroActivo={ficheroActivo}
      setFicheroActivo={setFicheroActivo}
      panelActivo={panelActivo}
      setPanelActivo={setPanelActivo}
      fuenteActiva={fuenteActiva}
      setHtml={setHtml}
      setCss={setCss}
      lineasConError={lineasConError}
      documento={documento}
      marcarProblemas={marcarProblemas}
      setMarcarProblemas={setMarcarProblemas}
      verTabulacion={verTabulacion}
      setVerTabulacion={setVerTabulacion}
      analisis={analisis}
      diagnosticos={diagnosticos}
      pendientes={pendientes}
      errores={errores}
      avisos={avisos}
      aplicarCorreccion={aplicarCorreccion}
      restaurar={restaurar}
      base={base}
    />
  )
}
