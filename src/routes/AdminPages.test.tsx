import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

const technology = {
  id: 'technology-1',
  categoryId: 'category-1',
  name: 'React',
  status: 'pendiente' as const,
  priority: 'alta' as const,
  difficulty: 'media' as const,
  notes: 'Hooks',
  resources: [],
  createdAt: '2026-08-13T10:00:00.000Z',
  updatedAt: '2026-08-13T10:00:00.000Z',
}

vi.mock('@/lib/hooks/useTechnologies', () => ({
  useTechnologies: () => ({ data: [technology], isLoading: false, isError: false }),
}))

import { TechnologyForm } from '@/components/technology/TechnologyForm'

import { AdminDashboardPage } from './AdminDashboardPage'

describe('admin pages', () => {
  it('renders the dashboard without axe violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Estado del contenido' })).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('rejects a resource URL outside http/https and remains accessible', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <TechnologyForm
        categories={[{ id: 'category-1', name: 'Frontend', createdAt: '2026-08-13' }]}
        pending={false}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'React' } })
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'category-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir recurso' }))
    fireEvent.change(screen.getByLabelText('Etiqueta'), { target: { value: 'Malicioso' } })
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'javascript:alert(1)' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear ficha' }))

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())
    expect(screen.getByText('Usa una URL completa http:// o https://.')).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('saves the icon selected for a technology', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <TechnologyForm
        categories={[{ id: 'category-1', name: 'Frontend', createdAt: '2026-08-13' }]}
        pending={false}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'React' } })
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'category-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar icono' }))
    fireEvent.click(screen.getByRole('button', { name: 'React' }))
    fireEvent.click(screen.getByRole('button', { name: 'Crear ficha' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ icon: 'react' })),
    )
  })
})
