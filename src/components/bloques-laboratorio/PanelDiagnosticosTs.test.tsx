import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PanelDiagnosticosTs } from './PanelDiagnosticosTs'

describe('PanelDiagnosticosTs', () => {
  it('usa contraste reforzado en claro y conserva variantes oscuras', () => {
    const { container } = render(
      <PanelDiagnosticosTs
        estado="listo"
        diagnosticos={[
          { linea: 1, columna: 2, mensaje: 'Aviso', severidad: 'aviso' },
        ]}
      />,
    )
    expect(screen.getByText('Aviso').closest('li')).toHaveClass(
      'text-amber-800',
      'dark:text-amber-300',
    )

    const { container: vacio } = render(
      <PanelDiagnosticosTs estado="listo" diagnosticos={[]} />,
    )
    expect(vacio.querySelector('p')).toHaveClass('text-green-700', 'dark:text-green-400')
    expect(container).not.toBeEmptyDOMElement()
  })
})
