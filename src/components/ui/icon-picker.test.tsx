import { act, fireEvent, render, screen } from '@testing-library/react'
import { Code2, Server } from 'lucide-react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { IconPicker } from './icon-picker'

const icons = {
  code: { label: 'Código', Icon: Code2 },
  server: { label: 'Servidor', Icon: Server },
}

describe('IconPicker', () => {
  it('filtra por label sin distinguir mayúsculas y selecciona una key', () => {
    const onChange = vi.fn()
    render(<IconPicker icons={icons} value={null} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar icono' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Filtrar iconos' }), {
      target: { value: 'SERV' },
    })

    expect(screen.queryByRole('button', { name: 'Código' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Servidor' }))

    expect(onChange).toHaveBeenCalledWith('server')
    expect(screen.queryByRole('textbox', { name: 'Filtrar iconos' })).not.toBeInTheDocument()
  })

  it('usa el fallback si recibe una key desconocida', () => {
    render(<IconPicker icons={icons} value="future-icon" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Cambiar icono' })).toBeInTheDocument()
  })

  it('permite quitar el icono y no tiene violaciones de accesibilidad', async () => {
    const onChange = vi.fn()
    render(<IconPicker icons={icons} value="code" onChange={onChange} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Código · Cambiar icono' }))
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    fireEvent.click(screen.getByRole('button', { name: 'Quitar icono' }))

    expect(onChange).toHaveBeenCalledWith(null)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Código · Cambiar icono' }))
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    const results = await axe(document.body, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
