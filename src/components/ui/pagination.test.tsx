import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './pagination'

describe('Pagination', () => {
  it('no renderiza nada cuando solo hay una página', () => {
    const { container } = render(
      <Pagination paginaActual={1} totalPaginas={1} onCambiarPagina={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza los controles y marca únicamente la página actual', async () => {
    const { container } = render(
      <Pagination paginaActual={2} totalPaginas={3} onCambiarPagina={vi.fn()} />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '3' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()

    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })

  it('deshabilita Anterior en la primera página y Siguiente en la última', () => {
    const { rerender } = render(
      <Pagination paginaActual={1} totalPaginas={3} onCambiarPagina={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()

    rerender(<Pagination paginaActual={3} totalPaginas={3} onCambiarPagina={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('cambia a la página numérica seleccionada', () => {
    const onCambiarPagina = vi.fn()
    render(<Pagination paginaActual={1} totalPaginas={3} onCambiarPagina={onCambiarPagina} />)

    fireEvent.click(screen.getByRole('button', { name: '3' }))

    expect(onCambiarPagina).toHaveBeenCalledWith(3)
  })

  it('cambia a las páginas anterior y siguiente', () => {
    const onCambiarPagina = vi.fn()
    render(<Pagination paginaActual={2} totalPaginas={3} onCambiarPagina={onCambiarPagina} />)

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(onCambiarPagina).toHaveBeenNthCalledWith(1, 1)
    expect(onCambiarPagina).toHaveBeenNthCalledWith(2, 3)
  })
})
