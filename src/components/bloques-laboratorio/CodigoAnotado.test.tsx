import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { CodigoAnotado } from './CodigoAnotado'

it('nombra el lenguaje real en la etiqueta del bloque', () => {
  render(<CodigoAnotado tipo="codigo-anotado" lenguaje="jsx" codigo="<p />" anotaciones={[{ fragmento: 'p', nota: 'n' }]} />)
  expect(screen.getByLabelText('Código JSX anotado')).toBeInTheDocument()
})
