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
import { LeccionForm } from '@/components/leccion/LeccionForm'

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

  it('derives a lesson slug, forces draft creation, and remains accessible', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<LeccionForm pending={false} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Árbol del DOM' },
    })

    expect(screen.getByLabelText('Slug')).toHaveValue('arbol-del-dom')
    expect(screen.getByLabelText('Estado')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Es un proyecto'))
    fireEvent.click(screen.getByRole('button', { name: 'Crear borrador' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'arbol-del-dom',
          titulo: 'Árbol del DOM',
          status: 'borrador',
          esProyecto: true,
        }),
      ),
    )
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('freezes an existing lesson slug and saves its project flag when editing', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <LeccionForm
        leccion={{
          id: 'leccion-1',
          technologyId: 'technology-1',
          slug: 'enlace-estable',
          modulo: null,
          titulo: 'Título anterior',
          resumen: '',
          contenido: '',
          orden: 10,
          status: 'borrador',
          esProyecto: true,
          createdAt: '2026-08-14T10:00:00.000Z',
          updatedAt: '2026-08-14T10:00:00.000Z',
        }}
        pending={false}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Título nuevo' },
    })
    expect(screen.getByLabelText('Slug')).toHaveValue('enlace-estable')
    expect(screen.getByLabelText('Estado')).toBeEnabled()
    expect(screen.getByLabelText('Es un proyecto')).toBeChecked()
    fireEvent.click(screen.getByLabelText('Es un proyecto'))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ esProyecto: false })),
    )
  })
})
