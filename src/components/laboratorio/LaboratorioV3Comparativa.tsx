import { useMemo, useState } from 'react'

import {
  CodigoYResultadoV3,
  DiferenciasV3,
  RecorridosV3,
  SelectorVersionV3,
  VeredictoV3,
} from './LaboratorioV3Secciones'
import {
  CAMBIOS_V3,
  CUERPO_ANTES_V3,
  CUERPO_DESPUES_V3,
  TOTAL_LINEAS_V3,
  VERSIONES_V3,
  analizarV3,
  construirFilasV3,
  type IdVersionV3,
} from './laboratorio-v3-modelo'

export function LaboratorioV3Comparativa() {
  const [versionActiva, setVersionActiva] = useState<IdVersionV3>('antes')
  const esAntes = versionActiva === 'antes'
  const version = esAntes ? VERSIONES_V3[0] : VERSIONES_V3[1]
  const analisis = useMemo(
    () => ({ antes: analizarV3(CUERPO_ANTES_V3), despues: analizarV3(CUERPO_DESPUES_V3) }),
    []
  )
  const filas = useMemo(() => construirFilasV3(analisis.antes, analisis.despues), [analisis])

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Se ven igual. Solo uno funciona.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Dos versiones del mismo formulario de suscripción. Cambian{' '}
        <strong className="font-semibold text-foreground">
          {CAMBIOS_V3.length} líneas de {TOTAL_LINEAS_V3}
        </strong>{' '}
        y el CSS es el mismo byte a byte. Cambia de versión con el interruptor: el código se mueve,
        la imagen no —ni un píxel— y el veredicto de abajo se da la vuelta entero.
      </p>
      <SelectorVersionV3 versionActiva={versionActiva} setVersionActiva={setVersionActiva} />
      <CodigoYResultadoV3 version={version} />
      <DiferenciasV3 />
      <VeredictoV3 filas={filas} esAntes={esAntes} />
      <RecorridosV3 analisis={analisis} />
    </>
  )
}
