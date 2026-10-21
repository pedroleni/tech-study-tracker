import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { MensajePeticion } from '@/lib/react-en-vivo/mensajes'

import { PanelRed } from './PanelRed'

const peticion = (datos: Partial<MensajePeticion> & Pick<MensajePeticion, 'id'>): MensajePeticion => ({
  canal: 'react-en-vivo',
  tipo: 'peticion',
  metodo: 'GET',
  ruta: '/api/recetas',
  estado: 'pendiente',
  ...datos,
})

describe('PanelRed', () => {
  it('enseña la latencia con su valor y la cambia', () => {
    const onCambiar = vi.fn()
    render(
      <PanelRed
        red={{ latencia: 600, desordenar: false }}
        peticiones={[]}
        falloPendiente={false}
        onCambiar={onCambiar}
        onFallarSiguiente={() => {}}
      />,
    )

    expect(screen.getByText('600 ms')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Latencia' })).toHaveAttribute('step', '50')
    expect(screen.getByRole('slider', { name: 'Latencia' })).toHaveAttribute('aria-valuetext', '600 ms')
    fireEvent.change(screen.getByRole('slider', { name: 'Latencia' }), { target: { value: '1200' } })
    expect(onCambiar).toHaveBeenCalledWith({ latencia: 1200, desordenar: false })
  })

  it('«Responder desordenado» es un interruptor', () => {
    const onCambiar = vi.fn()
    render(
      <PanelRed
        red={{ latencia: 600, desordenar: false }}
        peticiones={[]}
        falloPendiente={false}
        onCambiar={onCambiar}
        onFallarSiguiente={() => {}}
      />,
    )

    const interruptor = screen.getByRole('switch', { name: 'Responder desordenado' })
    expect(interruptor).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(interruptor)
    expect(onCambiar).toHaveBeenCalledWith({ latencia: 600, desordenar: true })
  })

  it('avisa mientras la siguiente petición va a fallar', () => {
    const onFallarSiguiente = vi.fn()
    const propiedades = {
      red: { latencia: 600, desordenar: false },
      peticiones: [] as MensajePeticion[],
      falloPendiente: false,
      onCambiar: () => {},
      onFallarSiguiente,
    }
    const { rerender } = render(<PanelRed {...propiedades} />)
    const estado = screen.getByRole('status')
    expect(estado).toBeEmptyDOMElement()

    fireEvent.click(screen.getByRole('button', { name: 'Fallar la siguiente petición' }))
    expect(onFallarSiguiente).toHaveBeenCalledOnce()
    rerender(<PanelRed {...propiedades} falloPendiente />)
    expect(screen.getByRole('status')).toHaveTextContent('La siguiente petición fallará')

    rerender(
      <PanelRed
        {...propiedades}
        peticiones={[peticion({ id: 1, estado: 'error', codigo: 500, ms: 601 })]}
      />,
    )
    expect(screen.getByRole('status')).toBe(estado)
    expect(estado).toBeEmptyDOMElement()
  })

  it('registra las peticiones con su estado escrito', () => {
    render(
      <PanelRed
        red={{ latencia: 600, desordenar: false }}
        peticiones={[
          peticion({ id: 1, estado: 'ok', codigo: 200, ms: 812 }),
          peticion({ id: 2, ruta: '/api/recetas?q=pa', estado: 'cancelada', ms: 42 }),
        ]}
        falloPendiente={false}
        onCambiar={() => {}}
        onFallarSiguiente={() => {}}
      />,
    )

    const registro = screen.getByLabelText('Peticiones de la API simulada')
    expect(registro).toHaveAttribute('aria-live', 'off')
    expect(registro).not.toHaveAttribute('role', 'log')
    expect(within(registro).getByText('GET /api/recetas · 200 · 812 ms')).toBeInTheDocument()
    expect(within(registro).getByText('GET /api/recetas?q=pa · cancelada · 42 ms')).toBeInTheDocument()
  })

  it('muestra como mucho las 20 últimas peticiones', () => {
    render(
      <PanelRed
        red={{ latencia: 600, desordenar: false }}
        peticiones={Array.from({ length: 25 }, (_, indice) =>
          peticion({ id: indice + 1, ruta: `/api/recetas/${indice + 1}` }),
        )}
        falloPendiente={false}
        onCambiar={() => {}}
        onFallarSiguiente={() => {}}
      />,
    )

    const filas = within(screen.getByLabelText('Peticiones de la API simulada')).getAllByRole('listitem')
    expect(filas).toHaveLength(20)
    expect(filas[0]).toHaveTextContent('/api/recetas/6')
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(
      <PanelRed
        red={{ latencia: 600, desordenar: false }}
        peticiones={[]}
        falloPendiente={false}
        onCambiar={() => {}}
        onFallarSiguiente={() => {}}
      />,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
