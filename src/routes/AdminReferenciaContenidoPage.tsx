import { useState } from 'react'

import { BarraProgresoLectura } from '@/components/referencia-contenido/BarraProgresoLectura'
import { CategoriaActivaContext } from '@/routes/referencia-contenido/categoriaActiva'
import { FiltroCategorias } from '@/routes/referencia-contenido/FiltroCategorias'
import { GrupoBloquesLaboratorio } from '@/routes/referencia-contenido/GrupoBloquesLaboratorio'
import {
  GrupoAnimacionesDeScroll,
  GrupoCarruseles,
  GrupoDatosAnimados,
  GrupoEfectos3D,
  GrupoInteractivos,
  GrupoTextoDinamico,
} from '@/routes/referencia-contenido/GruposPrototiposAnimados'
import {
  GrupoAvisosYAlertas,
  GrupoComparacionYVerificacion,
  GrupoEnriquecimientoDeTexto,
  GrupoEstructuraSecuencial,
  GrupoMetadatosYProgreso,
  GrupoNavegacionYContenidoExpandible,
  GrupoTarjetasDeRecursos,
} from '@/routes/referencia-contenido/GruposPrototiposLectura'

export function AdminReferenciaContenidoPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)

  return (
    <section aria-labelledby="admin-referencia-contenido-title" className="space-y-10">
      <BarraProgresoLectura etiqueta="Progreso por el catálogo de componentes" />

      <header>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1
          id="admin-referencia-contenido-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          Componentes de contenido
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-pretty text-muted-foreground">
          Catálogo visual de componentes React organizado por tipo. El primer grupo, "Bloques de
          laboratorio", son los 25 tipos reales que ya renderiza cualquier lección a través
          de un bloque <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">```laboratorio</code>{' '}
          en su Markdown (ver <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">specs/features/laboratorios.md</code>).
          El resto de grupos son prototipos de diseño de <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">referencia-contenido/</code> —
          sirven para comparar patrones de presentación, pero todavía no forman parte del
          pipeline de Markdown ni del sistema de laboratorios.
        </p>
      </header>

      <FiltroCategorias categoriaActiva={categoriaActiva} onCambiar={setCategoriaActiva} />

      <CategoriaActivaContext.Provider value={categoriaActiva}>
        <GrupoBloquesLaboratorio />
        <GrupoAvisosYAlertas />
        <GrupoNavegacionYContenidoExpandible />
        <GrupoEstructuraSecuencial />
        <GrupoEnriquecimientoDeTexto />
        <GrupoMetadatosYProgreso />
        <GrupoComparacionYVerificacion />
        <GrupoTarjetasDeRecursos />
        <GrupoCarruseles />
        <GrupoEfectos3D />
        <GrupoAnimacionesDeScroll />
        <GrupoTextoDinamico />
        <GrupoInteractivos />
        <GrupoDatosAnimados />
      </CategoriaActivaContext.Provider>
    </section>
  )
}
