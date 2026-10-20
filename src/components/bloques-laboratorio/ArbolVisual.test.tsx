import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArbolVisual } from './ArbolVisual'

describe('ArbolVisual', () => {
  it('pinta nombre, key, renders, marca y el estado como texto', () => {
    render(
      <ArbolVisual
        etiqueta="Árbol de prueba"
        nodos={[
          { id: 1, nivel: 0, nombre: 'App', estado: 'renderizado', renders: 3 },
          { id: 2, nivel: 1, nombre: 'Tarea', clave: 'a', estado: 'montado', renders: 1 },
          { id: 3, nivel: 1, nombre: 'Pie', marca: 'memo', estado: 'sin-cambios', renders: 1 },
          { id: 4, nivel: 1, nombre: 'Tarea', clave: 'b', estado: 'desmontado', renders: 2 },
        ]}
      />,
    )

    const lista = screen.getByRole('list', { name: 'Árbol de prueba' })
    expect(within(lista).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('key=a')).toBeInTheDocument()
    expect(screen.getByText('·3')).toBeInTheDocument()
    expect(screen.getByText('memo')).toBeInTheDocument()
    for (const estado of ['re-render', 'montado', 'sin cambios', 'desmontado']) {
      expect(screen.getByText(estado)).toBeInTheDocument()
    }
    const desmontado = screen.getByText('desmontado').closest('li')!
    expect(within(desmontado).getByText('Tarea')).toHaveClass('line-through')
  })

  it('dibuja las guías del árbol según el nivel y si quedan hermanos', () => {
    render(
      <ArbolVisual
        etiqueta="Guías"
        nodos={[
          { id: 1, nivel: 0, nombre: 'App' },
          { id: 2, nivel: 1, nombre: 'Lista' },
          { id: 3, nivel: 2, nombre: 'Tarea' },
          { id: 4, nivel: 1, nombre: 'Pie' },
        ]}
      />,
    )

    const filas = within(screen.getByRole('list', { name: 'Guías' })).getAllByRole('listitem')
    expect(filas[1]).toHaveTextContent(/^├─ Lista/)
    expect(filas[2]).toHaveTextContent(/^│ └─ Tarea/)
    expect(filas[3]).toHaveTextContent(/^└─ Pie/)
  })
})
