import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalidaTerminal } from './SalidaTerminal'

describe('SalidaTerminal', () => {
  it('muestra el comando con el prefijo git', () => {
    render(<SalidaTerminal comando="log --oneline" />)
    expect(screen.getByText(/git log --oneline/)).toBeInTheDocument()
  })

  it('muestra la salida real cuando se pasa', () => {
    render(<SalidaTerminal comando="log --oneline" salida="a1b2c3d primer commit" />)
    expect(screen.getByText(/a1b2c3d primer commit/)).toBeInTheDocument()
  })

  it('muestra el error cuando se pasa', () => {
    render(<SalidaTerminal comando="checkout x" error="revspec 'x' not found" />)
    expect(screen.getByText(/revspec 'x' not found/)).toBeInTheDocument()
  })
})
