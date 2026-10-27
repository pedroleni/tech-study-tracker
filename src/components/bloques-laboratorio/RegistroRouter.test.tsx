import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { MensajeRouterOperacion } from '@/lib/react-en-vivo/mensajes'

import { RegistroRouter } from './RegistroRouter'

const operacion = (
  cambios: Partial<MensajeRouterOperacion> = {},
): MensajeRouterOperacion => ({
  canal: 'react-en-vivo',
  tipo: 'router-operacion',
  id: 1,
  clase: 'carga-inicial',
  metodo: 'GET',
  destino: '/recetas',
  estado: 'terminada',
  duracion: 47,
  pasos: [],
  truncado: false,
  ...cambios,
})

afterEach(() => vi.useRealTimers())

describe('RegistroRouter', () => {
  it('enseña cada clase de operación con su texto en español', () => {
    render(
      <RegistroRouter
        operaciones={[
          operacion(),
          operacion({ id: 2, clase: 'navegacion', destino: '/lento' }),
          operacion({ id: 3, clase: 'envio', metodo: 'POST' }),
          operacion({ id: 4, clase: 'atras', destino: '', urlFinal: '/anterior' }),
          operacion({ id: 5, clase: 'adelante', destino: '', urlFinal: '/siguiente' }),
          operacion({ id: 6, clase: 'revalidacion' }),
          operacion({ id: 7, clase: 'fetcher-carga', fetcher: 'nueva', destino: '/lento' }),
          operacion({ id: 8, clase: 'fetcher-envio', fetcher: 'nueva', metodo: 'POST' }),
        ]}
        lleno={false}
        soloDeclarativo={false}
        onLimpiar={() => {}}
      />,
    )

    const registro = screen.getByRole('region', { name: 'Registro del router' })
    for (const texto of [
      'Carga inicial /recetas',
      'Navegación → /lento',
      'Envío · POST /recetas',
      'Atrás → /anterior',
      'Adelante → /siguiente',
      'Revalidación /recetas',
      'Fetcher «nueva» · carga /lento',
      'Fetcher «nueva» · POST /recetas',
    ]) expect(within(registro).getByText(new RegExp(texto))).toBeInTheDocument()
  })

  it.each(['fetcher-carga', 'fetcher-envio'] as const)(
    'un %s no dice que acabó en la URL actual del router',
    (clase) => {
      render(
        <RegistroRouter
          operaciones={[
            operacion({ clase, fetcher: 'detalle', destino: '/recetas/7', urlFinal: '/recetas' }),
          ]}
          lleno={false}
          soloDeclarativo={false}
          onLimpiar={() => {}}
        />,
      )

      const registro = screen.getByRole('region', { name: 'Registro del router' })
      expect(within(registro).getByText(/Fetcher «detalle»/)).not.toHaveTextContent(
        'acabó en /recetas',
      )
    },
  )

  it('agrupa los pasos por fase y escribe inicio y duración', () => {
    render(
      <RegistroRouter
        operaciones={[
          operacion({
            pasos: [
              { tipo: 'action', ruta: 'recetas', fase: 'envio', inicio: 4, duracion: 1, estado: 'ok' },
              { tipo: 'loader', ruta: 'recetas', fase: 'revalidacion', inicio: 6, duracion: 42, estado: 'ok' },
              { tipo: 'middleware', ruta: '/', fase: 'carga', inicio: 1, estado: 'en-curso' },
              { tipo: 'loader', ruta: 'destino', fase: 'redireccion', inicio: 8, duracion: 2, estado: 'error', error: 'Error: se rompió' },
            ],
          }),
        ]}
        lleno={false}
        soloDeclarativo={false}
        onLimpiar={() => {}}
      />,
    )
    for (const fase of ['Envío', 'Revalidación', 'Carga', 'Tras redirigir']) {
      expect(screen.getByText(fase)).toBeInTheDocument()
    }
    expect(screen.getByText(/action recetas · \+4 ms · 1 ms/)).toBeInTheDocument()
    expect(screen.getByText(/middleware \/ · \+1 ms · en curso/)).toBeInTheDocument()
    expect(screen.getByText(/error: Error: se rompió/)).toBeInTheDocument()
  })

  it('escribe Se volvió a ejecutar y No se volvió a ejecutar', () => {
    render(
      <RegistroRouter
        operaciones={[operacion({ pasos: [{ tipo: 'loader', ruta: 'recetas', fase: 'revalidacion', inicio: 1, duracion: 2, estado: 'ok' }], sinEjecutar: ['/'] })]}
        lleno={false}
        soloDeclarativo={false}
        onLimpiar={() => {}}
      />,
    )
    expect(screen.getByText('Se volvió a ejecutar: recetas.')).toBeInTheDocument()
    expect(screen.getByText('No se volvió a ejecutar: /.')).toBeInTheDocument()
  })

  it('en una carga escribe Se ejecutó, no Se volvió a ejecutar', () => {
    render(
      <RegistroRouter
        operaciones={[operacion({ pasos: [{ tipo: 'loader', ruta: 'recetas', fase: 'carga', inicio: 0, duracion: 3, estado: 'ok' }] })]}
        lleno={false}
        soloDeclarativo={false}
        onLimpiar={() => {}}
      />,
    )
    expect(screen.getByText('Se ejecutó: recetas.')).toBeInTheDocument()
    expect(screen.queryByText(/Se volvió a ejecutar/)).not.toBeInTheDocument()
  })

  it('marca cancelada por #N y los pasos tardíos', () => {
    render(
      <RegistroRouter
        operaciones={[operacion({ estado: 'cancelada', canceladaPor: 7, pasos: [{ tipo: 'loader', ruta: 'lento', fase: 'carga', inicio: 3, duracion: 152, estado: 'ok', tarde: true }] })]}
        lleno={false}
        soloDeclarativo={false}
        onLimpiar={() => {}}
      />,
    )
    expect(screen.getByText(/cancelada por #7/)).toBeInTheDocument()
    expect(screen.getByText(/terminó después de cancelarse/)).toBeInTheDocument()
  })

  it('enseña los errores con su ErrorBoundary', () => {
    render(<RegistroRouter operaciones={[operacion({ errores: [{ ruta: 'raíz', texto: '404 No existe' }] })]} lleno={false} soloDeclarativo={false} onLimpiar={() => {}} />)
    expect(screen.getByText('Error en pantalla (ErrorBoundary de raíz): 404 No existe')).toBeInTheDocument()
  })

  it('enseña el aviso de lleno, el de router declarativo y el vacío', () => {
    const { rerender } = render(<RegistroRouter operaciones={[]} lleno soloDeclarativo={false} onLimpiar={() => {}} />)
    expect(screen.getByText(/más de 200 operaciones/)).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay actividad del router.')).toBeInTheDocument()
    rerender(<RegistroRouter operaciones={[]} lleno={false} soloDeclarativo onLimpiar={() => {}} />)
    expect(screen.getByText(/Este router no carga datos/)).toBeInTheDocument()
  })

  it('las barras son aria-hidden y el estado no depende solo del color', async () => {
    const { container } = render(<RegistroRouter operaciones={[operacion({ estado: 'en-curso', duracion: undefined, pasos: [{ tipo: 'loader', ruta: '/', fase: 'carga', inicio: 0, estado: 'en-curso' }] })]} lleno={false} soloDeclarativo={false} onLimpiar={() => {}} />)
    expect(screen.getAllByText('en curso').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-barra-paso]')).toHaveAttribute('aria-hidden', 'true')
    expect(
      (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
  })

  it('el status anuncia como mucho una operación por segundo', () => {
    vi.useFakeTimers()
    const { rerender } = render(<RegistroRouter operaciones={[operacion()]} lleno={false} soloDeclarativo={false} onLimpiar={() => {}} />)
    const estado = screen.getByRole('status')
    expect(estado).toHaveTextContent('Carga inicial GET /recetas terminado en 47 ms')
    rerender(<RegistroRouter operaciones={[operacion(), operacion({ id: 2, clase: 'envio', metodo: 'POST' })]} lleno={false} soloDeclarativo={false} onLimpiar={() => {}} />)
    expect(estado).toHaveTextContent('Carga inicial GET /recetas terminado en 47 ms')
    act(() => vi.advanceTimersByTime(1_000))
    expect(estado).toHaveTextContent('Envío POST /recetas terminado en 47 ms')
  })

  it('Limpiar llama a onLimpiar', () => {
    const onLimpiar = vi.fn()
    render(<RegistroRouter operaciones={[]} lleno={false} soloDeclarativo={false} onLimpiar={onLimpiar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onLimpiar).toHaveBeenCalledOnce()
  })
})
