import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { MensajeEfecto } from '@/lib/react-en-vivo/mensajes'

import { RegistroEfectos } from './RegistroEfectos'

const efecto = (datos: Partial<MensajeEfecto>): MensajeEfecto => ({
  canal: 'react-en-vivo',
  tipo: 'efecto',
  commit: 1,
  componente: 'Chat',
  archivo: 'App.jsx',
  linea: 8,
  accion: 'efecto',
  clase: 'useEffect',
  motivo: 'montaje',
  cambios: [],
  ...datos,
})

describe('RegistroEfectos', () => {
  it('agrupa por commit y escribe cada línea en español', () => {
    render(
      <RegistroEfectos
        entradas={[
          efecto({ commit: 1, motivo: 'strict-mode' }),
          efecto({ commit: 4, accion: 'limpieza', motivo: undefined }),
          efecto({
            commit: 4,
            motivo: 'dependencias',
            cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }],
          }),
          efecto({ commit: 4, gancho: 'useConexion', motivo: 'montaje' }),
        ]}
        onLimpiar={() => {}}
      />,
    )

    const registro = screen.getByRole('region', { name: 'Registro de efectos' })
    expect(within(registro).getByText('commit 1')).toBeInTheDocument()
    expect(within(registro).getByText('commit 4')).toBeInTheDocument()
    expect(within(registro).getByText('Chat ▶ efecto · repetido por StrictMode')).toBeInTheDocument()
    expect(within(registro).getByText('Chat ⟲ limpieza')).toBeInTheDocument()
    expect(
      within(registro).getByText('Chat ▶ efecto · cambió sala: "general" → "viaje"'),
    ).toBeInTheDocument()
    expect(within(registro).getByText('Chat · useConexion ▶ efecto · montaje')).toBeInTheDocument()
  })

  it('Limpiar vacía el registro', () => {
    const onLimpiar = vi.fn()
    render(<RegistroEfectos entradas={[efecto({})]} onLimpiar={onLimpiar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onLimpiar).toHaveBeenCalledOnce()
  })

  it('muestra como mucho 200 entradas', () => {
    render(
      <RegistroEfectos
        entradas={Array.from({ length: 205 }, (_, indice) =>
          efecto({ commit: indice + 1, componente: `C${indice + 1}` }),
        )}
        onLimpiar={() => {}}
      />,
    )
    const registro = screen.getByRole('region', { name: 'Registro de efectos' })
    expect(within(registro).getAllByText(/▶ efecto/)).toHaveLength(200)
    expect(within(registro).queryByText(/^C1 /)).toBeNull()
    expect(within(registro).getByText(/^C6 /)).toBeInTheDocument()
  })

  it('no tiene aria-live ni violaciones de accesibilidad', async () => {
    const { container } = render(<RegistroEfectos entradas={[]} onLimpiar={() => {}} />)
    expect(container.querySelector('[aria-live]')).toBeNull()
    expect((await axe(container)).violations).toEqual([])
  })
})
