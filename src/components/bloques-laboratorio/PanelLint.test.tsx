import { render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { PanelLint } from './PanelLint'

const diagnosticos = [
  {
    archivo: 'App.jsx',
    linea: 10,
    columna: 5,
    regla: 'react-hooks/set-state-in-effect',
    mensaje: 'Calling setState synchronously within an effect can trigger cascading renders.\n\nEffects should synchronize React with external systems.',
    severidad: 'error' as const,
  },
  {
    archivo: 'Tarjeta.tsx',
    linea: 4,
    columna: 3,
    regla: 'react-hooks/exhaustive-deps',
    mensaje: 'React Hook useEffect has a missing dependency: value.',
    severidad: 'aviso' as const,
  },
]

describe('PanelLint', () => {
  it('agrupa por archivo y deja el resto de párrafos en un details', () => {
    render(<PanelLint estado="listo" diagnosticos={diagnosticos} />)

    const app = screen.getByRole('heading', { name: 'App.jsx' }).closest('section')
    const tarjeta = screen.getByRole('heading', { name: 'Tarjeta.tsx' }).closest('section')
    expect(app).not.toBeNull()
    expect(tarjeta).not.toBeNull()
    expect(within(app!).getByText('10:5')).toBeInTheDocument()
    expect(within(app!).getByText('react-hooks/set-state-in-effect')).toBeInTheDocument()
    expect(
      within(app!).getByText('Calling setState synchronously within an effect can trigger cascading renders.'),
    ).toBeVisible()
    expect(within(app!).getByText('Effects should synchronize React with external systems.')).not.toBeVisible()
    expect(within(app!).getByText('Ver mensaje completo').closest('details')).not.toHaveAttribute('open')
    expect(within(tarjeta!).getByText('4:3')).toBeInTheDocument()
  })

  it('muestra carga inicial, vacío y error sin una región aria-live', () => {
    const { rerender } = render(<PanelLint estado="cargando" diagnosticos={[]} />)
    expect(screen.getByText('Cargando el linter…')).toBeInTheDocument()

    rerender(<PanelLint estado="listo" diagnosticos={[]} />)
    expect(screen.getByText('El linter no marca nada')).toBeInTheDocument()

    rerender(
      <PanelLint estado="error" diagnosticos={[]} error="No se pudo cargar el linter" />,
    )
    expect(screen.getByText('No se pudo cargar el linter')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Linter' }).closest('section')).not.toHaveAttribute(
      'aria-live',
    )
  })

  it('no introduce problemas automáticos de accesibilidad', async () => {
    const { container } = render(<PanelLint estado="listo" diagnosticos={diagnosticos} />)
    expect(
      (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
  })
})
