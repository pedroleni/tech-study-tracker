import type { ComponentType } from 'react'

import { Callout } from '@/components/bloques-laboratorio/Callout'
import { CapasDeCaja } from '@/components/bloques-laboratorio/CapasDeCaja'
import { CodigoAnotado } from '@/components/bloques-laboratorio/CodigoAnotado'
import { ComparadorAntesDespues } from '@/components/bloques-laboratorio/ComparadorAntesDespues'
import { DiagramaEtiqueta } from '@/components/bloques-laboratorio/DiagramaEtiqueta'
import { EsquemaDePagina } from '@/components/bloques-laboratorio/EsquemaDePagina'
import { EditorEnVivo } from '@/components/bloques-laboratorio/EditorEnVivo'
import { GitAnotado } from '@/components/bloques-laboratorio/GitAnotado'
import { GitEnVivo } from '@/components/bloques-laboratorio/GitEnVivo'
import { Imagen } from '@/components/bloques-laboratorio/Imagen'
import { LineaDeTiempo } from '@/components/bloques-laboratorio/LineaDeTiempo'
import { MapaDeRegiones } from '@/components/bloques-laboratorio/MapaDeRegiones'
import { Mitos } from '@/components/bloques-laboratorio/Mitos'
import { NotasClave } from '@/components/bloques-laboratorio/NotasClave'
import { PrediceElResultado } from '@/components/bloques-laboratorio/PrediceElResultado'
import { Recursos } from '@/components/bloques-laboratorio/Recursos'
import { Roles } from '@/components/bloques-laboratorio/Roles'
import { SqlAnotado } from '@/components/bloques-laboratorio/SqlAnotado'
import { SqlEnVivo } from '@/components/bloques-laboratorio/SqlEnVivo'
import { VistaPreviaSocial } from '@/components/bloques-laboratorio/VistaPreviaSocial'

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
  mitos: Mitos,
  'vista-previa-social': VistaPreviaSocial,
  'mapa-de-regiones': MapaDeRegiones,
  'esquema-de-pagina': EsquemaDePagina,
  'capas-de-caja': CapasDeCaja,
  'editor-en-vivo': EditorEnVivo,
  'sql-anotado': SqlAnotado,
  'sql-en-vivo': SqlEnVivo,
  'git-anotado': GitAnotado,
  'git-en-vivo': GitEnVivo,
  imagen: Imagen,
}
