import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

const proyectos = [
  {
    id: 'project-1',
    technologyId: 'html',
    slug: 'portfolio-personal',
    modulo: null,
    titulo: 'Portfolio personal',
    resumen: 'Construye una página completa.',
    contenido: '# Portfolio',
    orden: 10,
    status: 'publicado' as const,
    esProyecto: true,
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-29T10:00:00.000Z',
    technology: { id: 'html', name: 'HTML', icon: 'html5', status: 'completado' as const },
  },
  {
    id: 'lesson-1',
    technologyId: 'html',
    slug: 'etiquetas-basicas',
    modulo: null,
    titulo: 'Etiquetas básicas',
    resumen: 'Una lección normal.',
    contenido: '# Etiquetas',
    orden: 20,
    status: 'publicado' as const,
    esProyecto: false,
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-29T10:00:00.000Z',
    technology: { id: 'html', name: 'HTML', icon: 'html5', status: 'completado' as const },
  },
]

vi.mock('@/lib/hooks/useLecciones', () => ({
  useProyectos: () => ({ data: proyectos, isLoading: false, isError: false }),
}))

import { ProyectosPage } from './ProyectosPage'

describe('ProyectosPage', () => {
  it('muestra únicamente las lecciones marcadas como proyecto', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/proyectos']}>
        <ProyectosPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Proyectos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Portfolio personal' })).toBeInTheDocument()
    expect(screen.queryByText('Etiquetas básicas')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio personal' })).toHaveAttribute(
      'href',
      '/tecnologias/html/portfolio-personal',
    )

    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
