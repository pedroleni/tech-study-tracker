import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConsolaReact } from './ConsolaReact'

describe('ConsolaReact', () => {
  it('separa por commit, escribe el nivel y se puede limpiar', () => {
    const onLimpiar = vi.fn()
    render(
      <ConsolaReact
        entradas={[
          { id: 1, nivel: 'log', texto: 'render', commit: 0 },
          { id: 2, nivel: 'log', texto: 'render', commit: 0 },
          { id: 3, nivel: 'error', texto: 'Each child in a list should have a unique "key" prop.', commit: 1 },
        ]}
        onLimpiar={onLimpiar}
      />,
    )
    const consola = screen.getByRole('log')

    expect(within(consola).getAllByText('render')).toHaveLength(2)
    expect(within(consola).getAllByText('commit 1')).toHaveLength(1)
    expect(within(consola).queryByText('commit 0')).toBeNull()
    expect(within(consola).getByText('error')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onLimpiar).toHaveBeenCalledOnce()
  })

  it('dice que está vacía cuando no hay mensajes', () => {
    render(<ConsolaReact entradas={[]} onLimpiar={() => {}} />)
    expect(within(screen.getByRole('log')).getByText('Todavía no hay mensajes.')).toBeInTheDocument()
  })
})
