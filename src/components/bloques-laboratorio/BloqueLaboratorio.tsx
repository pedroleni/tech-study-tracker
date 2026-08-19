import { createElement, type ReactElement } from 'react'

import { registroBloquesLaboratorio } from '@/components/bloques-laboratorio/registro'
import { esquemaBloqueLaboratorio } from '@/lib/laboratorio/schemas'

export function BloqueLaboratorio({ contenido }: { contenido: string }): ReactElement | null {
  try {
    const datosDesconocidos: unknown = JSON.parse(contenido)
    const resultado = esquemaBloqueLaboratorio.safeParse(datosDesconocidos)

    if (!resultado.success) return null

    const Componente = registroBloquesLaboratorio[resultado.data.tipo]
    if (!Componente) return null

    return createElement(Componente, resultado.data)
  } catch {
    return null
  }
}
