import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArbolDeComponentes } from './ArbolDeComponentes'

describe('ArbolDeComponentes', () => {
  it('pinta título, nodos, etiquetas y notas, con leyenda si hay estados', () => {
    render(
      <ArbolDeComponentes
        tipo="arbol-de-componentes"
        titulo="El estado, levantado a App"
        nodos={[
          { nombre: 'App', nivel: 0, etiqueta: 'estado: tareas' },
          { nombre: 'Lista', nivel: 1, estado: 'renderizado', nota: '← recibe tareas por props' },
          { nombre: 'Formulario', nivel: 1, estado: 'sin-cambios' },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'El estado, levantado a App' })).toBeInTheDocument()
    expect(screen.getByText('estado: tareas')).toBeInTheDocument()
    expect(screen.getByText('← recibe tareas por props')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Leyenda' })).toBeInTheDocument()
  })

  it('sin estados no enseña leyenda', () => {
    render(<ArbolDeComponentes tipo="arbol-de-componentes" nodos={[{ nombre: 'App', nivel: 0 }]} />)
    expect(screen.queryByRole('list', { name: 'Leyenda' })).toBeNull()
  })
})
