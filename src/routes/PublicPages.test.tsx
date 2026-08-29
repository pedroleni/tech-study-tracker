import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  user: null as { id: string } | null,
  isAdmin: false,
  status: 'completado' as 'pendiente' | 'en_progreso' | 'completado',
  leccionStatus: 'publicado' as 'borrador' | 'publicado',
  setProgress: vi.fn(),
  setLeccionProgress: vi.fn(),
}))

const technology = {
  id: 'technology-1',
  categoryId: 'category-1',
  name: 'React',
  status: 'completado' as const,
  priority: 'alta' as const,
  difficulty: 'media' as const,
  notes:
    '# Hooks\n\nTexto seguro <script>alert(1)</script>\n\n![Píxel remoto](https://tracker.example/pixel.gif)',
  resources: [
    { label: 'Documentación', url: 'https://react.dev' },
    { label: 'Enlace bloqueado', url: 'javascript:alert(1)' },
  ],
  createdAt: '2026-08-13T10:00:00.000Z',
  updatedAt: '2026-08-13T10:00:00.000Z',
}

const leccion = {
  id: 'leccion-1',
  technologyId: 'technology-1',
  slug: 'hooks',
  modulo: 'Fundamentos',
  titulo: 'Hooks',
  resumen: 'Estado y efectos en componentes.',
  contenido:
    '# Efectos\n\nTexto seguro <script>alert(1)</script>\n\n![Píxel remoto](https://tracker.example/pixel.gif)',
  orden: 10,
  status: 'publicado' as const,
  esProyecto: false,
  createdAt: '2026-08-14T10:00:00.000Z',
  updatedAt: '2026-08-14T10:00:00.000Z',
}

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: state.user, session: state.user ? { user: state.user } : null }),
}))
vi.mock('@/lib/hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: state.isAdmin, loading: false }),
}))
vi.mock('@/lib/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 'category-1', name: 'Frontend', createdAt: '2026-08-13' }],
    isLoading: false,
    isError: false,
  }),
}))
vi.mock('@/lib/hooks/useTechnologies', () => ({
  useTechnology: () => ({
    data: { ...technology, status: state.status },
    isLoading: false,
    isError: false,
  }),
  useTechnologies: () => ({
    data: [
      technology,
      { ...technology, id: 'draft-1', name: 'Borrador privado', status: 'pendiente' },
    ],
    isLoading: false,
    isError: false,
  }),
}))
vi.mock('@/lib/hooks/useLecciones', () => ({
  useLecciones: () => ({
    data: [
      { ...leccion, status: state.leccionStatus },
      ...(state.user && !state.isAdmin
        ? [
            {
              ...leccion,
              id: 'leccion-draft',
              titulo: 'Lección interna',
              status: 'borrador' as const,
            },
          ]
        : []),
    ],
    isLoading: false,
    isError: false,
  }),
}))
vi.mock('@/lib/hooks/useLeccion', () => ({
  useLeccion: () => ({
    data: { ...leccion, status: state.leccionStatus },
    isLoading: false,
    isError: false,
  }),
}))
vi.mock('@/lib/hooks/useComments', () => ({
  useComments: () => ({ data: [], isLoading: false, isError: false }),
  useCreateComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('@/lib/hooks/useFavorites', () => ({
  useFavorites: () => ({ data: [], isLoading: false, isError: false }),
  useAddFavorite: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRemoveFavorite: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('@/lib/hooks/useProgress', () => ({
  useMyProgress: () => ({ data: null, isLoading: false, isError: false }),
  useSetMyProgress: () => ({
    isPending: false,
    mutateAsync: state.setProgress.mockResolvedValue(undefined),
  }),
  useMyLeccionesProgress: () => ({ data: [], isLoading: false }),
  useSetMyLeccionProgress: () => ({
    isPending: false,
    mutate: state.setLeccionProgress,
  }),
}))

import { FavoritesPage } from './FavoritesPage'
import { CategoryPage } from './CategoryPage'
import { LeccionPage } from './LeccionPage'
import { TechnologyPage } from './TechnologyPage'

describe('public and account pages', () => {
  beforeEach(() => {
    state.user = null
    state.isAdmin = false
    state.status = 'completado'
    state.leccionStatus = 'publicado'
    state.setProgress.mockClear()
    state.setLeccionProgress.mockClear()
  })

  it('does not mix admin drafts into the public category view', () => {
    render(
      <MemoryRouter initialEntries={['/categorias/category-1']}>
        <Routes>
          <Route path="/categorias/:id" element={<CategoryPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument()
    expect(screen.queryByText('Borrador privado')).not.toBeInTheDocument()
  })

  it('offers edit but not public interactions when an admin previews a draft', () => {
    state.user = { id: 'admin-1' }
    state.isAdmin = true
    state.status = 'pendiente'
    state.leccionStatus = 'borrador'

    render(
      <MemoryRouter initialEntries={['/tecnologias/technology-1']}>
        <Routes>
          <Route path="/tecnologias/:id" element={<TechnologyPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Editar tecnología' })).toHaveAttribute(
      'href',
      '/admin/tecnologias/technology-1/editar',
    )
    expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('renders lesson content safely and anchors comments to the lesson', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tecnologias/technology-1/hooks']}>
        <Routes>
          <Route path="/tecnologias/:id/:leccionSlug" element={<LeccionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Hooks' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Efectos' })).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Píxel remoto')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comentarios' })).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('renders a public technology safely and without axe violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tecnologias/technology-1']}>
        <Routes>
          <Route path="/tecnologias/:id" element={<TechnologyPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Enlace bloqueado' })).not.toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Píxel remoto')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Inicia sesión para guardar tu progreso' }),
    ).toHaveAttribute('href', '/login')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('shows accessible progress controls to a signed-in user with published lessons only', async () => {
    state.user = { id: 'user-1' }

    const { container } = render(
      <MemoryRouter initialEntries={['/tecnologias/technology-1']}>
        <Routes>
          <Route path="/tecnologias/:id" element={<TechnologyPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Mi progreso' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
    expect(screen.getByText('Pendiente', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('0 de 1 lecciones completadas')).toBeInTheDocument()
    expect(screen.getByLabelText('Lección actual')).toHaveTextContent('Hooks')
    expect(screen.getByLabelText('Lección actual')).not.toHaveTextContent(
      'Lección interna',
    )
    expect(screen.getByLabelText('Estado de Hooks')).toHaveValue('pendiente')
    expect(screen.queryByLabelText('Estado de Lección interna')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Estado de Hooks'), {
      target: { value: 'en_progreso' },
    })
    expect(state.setLeccionProgress).toHaveBeenCalledWith({
      leccionId: 'leccion-1',
      technologyId: 'technology-1',
      status: 'en_progreso',
    })
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('renders favorites without axe violations', async () => {
    state.user = { id: 'user-1' }
    const { container } = render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Tus favoritos' })).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
