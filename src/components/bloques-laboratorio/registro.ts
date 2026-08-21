import type { ComponentType } from 'react'

import { CodigoAnotado } from '@/components/bloques-laboratorio/CodigoAnotado'
import { ComparadorAntesDespues } from '@/components/bloques-laboratorio/ComparadorAntesDespues'
import { DiagramaEtiqueta } from '@/components/bloques-laboratorio/DiagramaEtiqueta'
import { NotasClave } from '@/components/bloques-laboratorio/NotasClave'
import { PrediceElResultado } from '@/components/bloques-laboratorio/PrediceElResultado'

// El registro es deliberadamente cerrado: el JSON solo puede escoger uno de
// estos componentes, nunca un nombre de elemento o módulo arbitrario.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registroBloquesLaboratorio: Record<string, ComponentType<any>> = {
  'predice-el-resultado': PrediceElResultado,
  'codigo-anotado': CodigoAnotado,
  'comparador-antes-despues': ComparadorAntesDespues,
  'notas-clave': NotasClave,
  'diagrama-etiqueta': DiagramaEtiqueta,
}
