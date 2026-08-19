import { useState } from 'react'

import { LaboratorioV1Editor } from '@/components/laboratorio/LaboratorioV1Editor'
import { LaboratorioV2Anotado } from '@/components/laboratorio/LaboratorioV2Anotado'
import { LaboratorioV3Comparativa } from '@/components/laboratorio/LaboratorioV3Comparativa'
import { LaboratorioV4Radiografia } from '@/components/laboratorio/LaboratorioV4Radiografia'
import { LaboratorioV5Bloque } from '@/components/laboratorio/LaboratorioV5Bloque'

const LABORATORIOS = [
  { id: 'v1', label: 'V1 - Editor', Component: LaboratorioV1Editor },
  { id: 'v2', label: 'V2 - Anotado', Component: LaboratorioV2Anotado },
  { id: 'v3', label: 'V3 - Antes y después', Component: LaboratorioV3Comparativa },
  { id: 'v4', label: 'V4 - Radiografía', Component: LaboratorioV4Radiografia },
  { id: 'v5', label: 'V5 - Bloque incrustado', Component: LaboratorioV5Bloque },
] as const

type LaboratorioId = (typeof LABORATORIOS)[number]['id']

export function AdminLaboratorioEjemplosPage() {
  const [activeId, setActiveId] = useState<LaboratorioId>('v1')
  const ActiveComponent = LABORATORIOS.find(({ id }) => id === activeId)!.Component

  return (
    <section aria-labelledby="admin-laboratorio-title" className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1
          id="admin-laboratorio-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          Componentes de laboratorio
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Estos prototipos sirven como referencia para diseñar el futuro sistema de bloques de
          tipo laboratorio, formado por fenced code blocks etiquetados con el lenguaje
          laboratorio y embebidos en lecciones. Aún no tienen spec ni implementación real:
          están pensados para discutirlos, no para publicar.
        </p>
      </header>

      <div>
        <nav aria-label="Variantes del laboratorio" className="mb-8 flex flex-wrap gap-2">
          {LABORATORIOS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId(id)}
              aria-pressed={activeId === id}
              className={`min-h-11 touch-manipulation rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                activeId === id
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <ActiveComponent />
      </div>
    </section>
  )
}
