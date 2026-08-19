import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const cuerpoLaboratorio = `\`\`\`laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<p>Hola</p>",
  "opciones": ["Hola", "Adiós"],
  "correcta": 0,
  "explicacion": "El párrafo muestra Hola."
}
\`\`\``

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, session: null }),
}))

vi.mock('@/lib/hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: false, loading: false }),
}))

vi.mock('@/lib/hooks/useComments', () => ({
  useComments: () => ({
    data: [
      {
        id: 'comment-1',
        leccionId: 'leccion-1',
        userId: 'user-1',
        parentCommentId: null,
        body: cuerpoLaboratorio,
        createdAt: '2026-08-19T10:00:00.000Z',
        updatedAt: '2026-08-19T10:00:00.000Z',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useCreateComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeleteComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

import { CommentsSection } from '@/components/comment/CommentsSection'

describe('CommentsSection', () => {
  it('renderiza un bloque laboratorio válido como código plano, no como componente', () => {
    render(
      <MemoryRouter>
        <CommentsSection leccionId="leccion-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código laboratorio' })).toHaveTextContent(
      'predice-el-resultado',
    )
    expect(screen.queryByRole('button', { name: 'Revelar resultado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Resultado real del código HTML')).not.toBeInTheDocument()
  })
})
