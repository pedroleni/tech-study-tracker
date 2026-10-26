import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { MensajeUbicacion } from '@/lib/react-en-vivo/mensajes'

import { BarraDirecciones } from './BarraDirecciones'

const ubicacion = (cambios: Partial<MensajeUbicacion> = {}): MensajeUbicacion => ({
  canal: 'react-en-vivo',
  tipo: 'ubicacion',
  url: '/recetas?q=pan',
  puedeAtras: true,
  puedeAdelante: false,
  origen: 'createMemoryRouter',
  ...cambios,
})

describe('BarraDirecciones', () => {
  it('enseña la URL y el texto del historial según el origen', () => {
    const { rerender } = render(<BarraDirecciones ubicacion={ubicacion()} onAccion={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'Dirección de la vista previa' })).toHaveValue('/recetas?q=pan')
    expect(screen.getByText((_, elemento) => elemento?.textContent === 'Historial en memoria (createMemoryRouter)')).toBeInTheDocument()

    rerender(
      <BarraDirecciones
        ubicacion={ubicacion({ origen: 'BrowserRouter' })}
        onAccion={vi.fn()}
      />,
    )
    expect(
      screen.getByText((_, elemento) =>
        elemento?.tagName === 'P' &&
        (elemento.textContent?.includes('BrowserRouter usa la dirección del navegador') ?? false),
      ),
    ).toBeInTheDocument()
  })

  it('Atrás y Adelante se desactivan según la ubicación y llaman a onAccion', () => {
    const onAccion = vi.fn()
    render(<BarraDirecciones ubicacion={ubicacion()} onAccion={onAccion} />)
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))
    expect(onAccion).toHaveBeenCalledWith('atras')
    expect(screen.getByRole('button', { name: 'Adelante' })).toBeDisabled()
  })

  it("Ir con una dirección válida llama a onAccion('ir', url); con una no válida enseña el error y no llama", () => {
    const onAccion = vi.fn()
    render(<BarraDirecciones ubicacion={ubicacion()} onAccion={onAccion} />)
    const campo = screen.getByRole('textbox', { name: 'Dirección de la vista previa' })

    fireEvent.change(campo, { target: { value: '/pisto#ingredientes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onAccion).toHaveBeenCalledWith('ir', '/pisto#ingredientes')

    onAccion.mockClear()
    fireEvent.change(campo, { target: { value: '//otro.example' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onAccion).not.toHaveBeenCalled()
    expect(
      screen.getByText('La dirección tiene que empezar por una sola / y no llevar espacios.'),
    ).toBeInTheDocument()
  })

  it('Recargar llama a onAccion recargar', () => {
    const onAccion = vi.fn()
    render(<BarraDirecciones ubicacion={ubicacion()} onAccion={onAccion} />)
    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))
    expect(onAccion).toHaveBeenCalledWith('recargar')
  })

  it('una ubicación nueva sustituye a lo escrito', () => {
    const { rerender } = render(<BarraDirecciones ubicacion={ubicacion()} onAccion={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Dirección de la vista previa' }), {
      target: { value: '/sin-enviar' },
    })
    rerender(
      <BarraDirecciones ubicacion={ubicacion({ url: '/nueva' })} onAccion={vi.fn()} />,
    )
    expect(screen.getByRole('textbox', { name: 'Dirección de la vista previa' })).toHaveValue('/nueva')
  })

  it('expone nombres accesibles y no tiene violaciones automáticas', async () => {
    const { container } = render(<BarraDirecciones ubicacion={ubicacion()} onAccion={vi.fn()} />)
    for (const nombre of ['Atrás', 'Adelante', 'Recargar', 'Ir']) {
      expect(screen.getByRole('button', { name: nombre })).toBeInTheDocument()
    }
    expect(screen.getByRole('textbox', { name: 'Dirección de la vista previa' })).toBeInTheDocument()
    expect(
      (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
  })
})
