import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PrediceElResultado } from './PrediceElResultado'

function revelar(lenguaje: 'html' | 'jsx' | 'tsx', codigo: string) {
  render(
    <PrediceElResultado
      tipo="predice-el-resultado"
      lenguaje={lenguaje}
      codigo={codigo}
      opciones={['Uno', 'Dos']}
      correcta={0}
      explicacion="Porque sí."
    />,
  )
  fireEvent.click(screen.getByRole('radio', { name: 'Uno' }))
  fireEvent.click(screen.getByRole('button', { name: 'Revelar resultado' }))
}

describe('PrediceElResultado', () => {
  it('con HTML enseña el resultado real del código', () => {
    revelar('html', '<p>Hola</p>')
    expect(screen.getByTitle('Resultado real del código HTML')).toBeInTheDocument()
  })

  it('con JSX no intenta pintar el código como si fuera HTML', () => {
    // El iframe de la "vista real" interpreta el código como HTML: con JSX
    // mostraría el código fuente roto. La explicación ya cuenta el resultado.
    revelar('jsx', 'export default function App() {\n  return <p>Hola</p>\n}')
    expect(screen.getByText('Respuesta correcta')).toBeInTheDocument()
    expect(screen.queryByTitle('Resultado real del código HTML')).toBeNull()
  })
})
