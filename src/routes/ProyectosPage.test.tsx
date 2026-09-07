import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

let proyectosMock = proyectos

vi.mock('@/lib/hooks/useLecciones', () => ({
  useProyectos: () => ({ data: proyectosMock, isLoading: false, isError: false }),
}))

import { ProyectosPage } from './ProyectosPage'

beforeEach(() => {
  proyectosMock = proyectos
})

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

function generarProyectos(
  cantidad: number,
  tecnologia: { id: string; name: string; icon: string } = { id: 'html', name: 'HTML', icon: 'html5' },
) {
  return Array.from({ length: cantidad }, (_, indice) => {
    const numero = indice + 1

    return {
      id: `project-${tecnologia.id}-${numero}`,
      technologyId: tecnologia.id,
      slug: `proyecto-${tecnologia.id}-${numero}`,
      modulo: null,
      titulo: `Proyecto ${tecnologia.name} ${numero}`,
      resumen: `Resumen del proyecto ${numero}.`,
      contenido: `# Proyecto ${numero}`,
      orden: numero,
      status: 'publicado' as const,
      esProyecto: true,
      createdAt: '2026-08-29T10:00:00.000Z',
      updatedAt: '2026-08-29T10:00:00.000Z',
      technology: { ...tecnologia, status: 'completado' as const },
    }
  })
}

describe('paginación de proyectos', () => {
  it('muestra 9 tarjetas y los controles de paginado en la primera página', () => {
    proyectosMock = generarProyectos(11)

    render(
      <MemoryRouter initialEntries={['/proyectos']}>
        <ProyectosPage />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9)
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument()
  })

  it('muestra únicamente los proyectos restantes al cambiar a la página 2', () => {
    proyectosMock = generarProyectos(11)

    render(
      <MemoryRouter initialEntries={['/proyectos']}>
        <ProyectosPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '2' }))

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Proyecto HTML 10' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Proyecto HTML 11' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Proyecto HTML 1' })).not.toBeInTheDocument()
  })

  it('no muestra controles de paginado con 9 proyectos exactos', () => {
    proyectosMock = generarProyectos(9)

    render(
      <MemoryRouter initialEntries={['/proyectos']}>
        <ProyectosPage />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9)
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
  })

  it('vuelve a la página 1 al cambiar de tecnología estando en la página 2', () => {
    // Dos tecnologías con más de 9 proyectos cada una: si el reset de
    // página fallara, cambiar a CSS mientras estamos en la página 2 de
    // HTML mostraría "Proyecto CSS 10/11" (el mismo índice de slice) en
    // vez de "Proyecto CSS 1" — así el test detecta de verdad el fallo,
    // no solo que aparezca contenido cualquiera.
    proyectosMock = [
      ...generarProyectos(11, { id: 'html', name: 'HTML', icon: 'html5' }),
      ...generarProyectos(11, { id: 'css', name: 'CSS', icon: 'css3' }),
    ]

    render(
      <MemoryRouter initialEntries={['/proyectos']}>
        <ProyectosPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'HTML' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByRole('heading', { name: 'Proyecto HTML 10' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'CSS' }))

    expect(screen.getByRole('heading', { name: 'Proyecto CSS 1' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Proyecto CSS 10' })).not.toBeInTheDocument()
  })
})
