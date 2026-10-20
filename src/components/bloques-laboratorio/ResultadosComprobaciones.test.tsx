import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ResultadosComprobaciones } from './ResultadosComprobaciones'

describe('ResultadosComprobaciones', () => {
  it('resume cuántas se superan y explica cada fallo', () => {
    render(
      <ResultadosComprobaciones
        estado="listo"
        resultados={[
          { descripcion: 'Al añadir una tarea, aparece en la lista', ok: true },
          {
            descripcion: 'Se puede guardar',
            ok: false,
            motivo: 'No encuentro ningún botón llamado «Guardar».',
          },
        ]}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('1 de 2 comprobaciones superadas')
    expect(screen.getByText('Al añadir una tarea, aparece en la lista')).toBeInTheDocument()
    expect(screen.getByText('No encuentro ningún botón llamado «Guardar».')).toBeInTheDocument()
  })

  it('avisa mientras comprueba y cuando se agota el tiempo', () => {
    const { rerender } = render(<ResultadosComprobaciones estado="comprobando" resultados={[]} />)
    expect(screen.getByRole('status')).toHaveTextContent('Comprobando…')

    rerender(<ResultadosComprobaciones estado="tiempo-agotado" resultados={[]} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'La comprobación tardó demasiado. Revisa si tu código se queda en un bucle.',
    )
  })
})
