import { GrupoCatalogo } from '@/routes/referencia-contenido/GrupoCatalogo'
import {
  EjemplosNarrativaYRecursos,
  EjemplosPaginaYEditor,
  EjemplosPreguntasYCodigo,
} from '@/routes/referencia-contenido/EjemplosLaboratorioContenido'
import {
  EjemplosReactEnVivo,
  EjemplosReactHerramientas,
  EjemplosReactRenders,
} from '@/routes/referencia-contenido/EjemplosLaboratorioReact'
import { EjemplosGit, EjemplosSql } from '@/routes/referencia-contenido/EjemplosLaboratorioSqlYGit'

export function GrupoBloquesLaboratorio() {
  return (
    <GrupoCatalogo
      titulo="Bloques de laboratorio"
      descripcion="Los 25 tipos reales que un autor puede usar dentro de un bloque ```laboratorio en el Markdown de una lección (src/components/bloques-laboratorio/). Validados por Zod, registrados en un lookup cerrado — no prototipos."
    >
      <EjemplosPreguntasYCodigo />
      <EjemplosNarrativaYRecursos />
      <EjemplosPaginaYEditor />
      <EjemplosSql />
      <EjemplosGit />
      <EjemplosReactEnVivo />
      <EjemplosReactHerramientas />
      <EjemplosReactRenders />
    </GrupoCatalogo>
  )
}
