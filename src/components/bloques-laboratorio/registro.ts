import type { ComponentType } from 'react'

import { Callout } from '@/components/bloques-laboratorio/Callout'
import { CodigoAnotado } from '@/components/bloques-laboratorio/CodigoAnotado'
import { ComparadorAntesDespues } from '@/components/bloques-laboratorio/ComparadorAntesDespues'
import { DiagramaEtiqueta } from '@/components/bloques-laboratorio/DiagramaEtiqueta'
import { LineaDeTiempo } from '@/components/bloques-laboratorio/LineaDeTiempo'
import { NotasClave } from '@/components/bloques-laboratorio/NotasClave'
import { PrediceElResultado } from '@/components/bloques-laboratorio/PrediceElResultado'
import { Recursos } from '@/components/bloques-laboratorio/Recursos'
import { Roles } from '@/components/bloques-laboratorio/Roles'

// El registro es deliberadamente cerrado: el JSON solo puede escoger uno de
// estos componentes, nunca un nombre de elemento o módulo arbitrario.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registroBloquesLaboratorio: Record<string, ComponentType<any>> = {
  'predice-el-resultado': PrediceElResultado,
  'codigo-anotado': CodigoAnotado,
  'comparador-antes-despues': ComparadorAntesDespues,
  'notas-clave': NotasClave,
  'diagrama-etiqueta': DiagramaEtiqueta,
  callout: Callout,
  'linea-de-tiempo': LineaDeTiempo,
  roles: Roles,
  recursos: Recursos,
}
