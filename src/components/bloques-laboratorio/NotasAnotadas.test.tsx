import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { NotasAnotadas } from './NotasAnotadas'
import { useAnotacionesConLinea } from './useAnotacionesConLinea'

describe('useAnotacionesConLinea', () => {
  it('da la línea de la primera aparición y descarta los fragmentos que no están', () => {
    const anotaciones = [
      { fragmento: 'b', nota: 'segunda línea' },
      { fragmento: 'zzz', nota: 'no aparece' },
      { fragmento: 'a', nota: 'primera aparición' },
    ]
    const { result } = renderHook(() => useAnotacionesConLinea(anotaciones, 'a\nb\na'))
    expect(result.current).toEqual([
      { fragmento: 'b', nota: 'segunda línea', linea: 2 },
      { fragmento: 'a', nota: 'primera aparición', linea: 1 },
    ])
  })

  it('devuelve el mismo array mientras no cambian las entradas', () => {
    const anotaciones = [{ fragmento: 'a', nota: 'n' }]
    const { result, rerender } = renderHook(() => useAnotacionesConLinea(anotaciones, 'a'))
    const primero = result.current
    rerender()
    expect(result.current).toBe(primero)
  })
})

function Notas({ anotaciones }: { anotaciones: { fragmento: string; nota: string }[] }) {
  const [activa, setActiva] = useState(0)
  return (
    <NotasAnotadas
      anotaciones={anotaciones}
      activa={activa}
      onActivar={setActiva}
      idNota="nota"
      etiqueta="Anotaciones de prueba"
      color="teal"
    />
  )
}

describe('NotasAnotadas', () => {
  it('no pinta nada sin anotaciones', () => {
    const { container } = render(<Notas anotaciones={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marca el botón pulsado y enseña su nota', () => {
    render(
      <Notas
        anotaciones={[
          { fragmento: 'a', nota: 'Primera' },
          { fragmento: 'b', nota: 'Segunda' },
        ]}
      />,
    )
    expect(screen.getByLabelText('Anotaciones de prueba')).toBeInTheDocument()
    expect(screen.getByText('Nota 1.').parentElement).toHaveTextContent('Nota 1. Primera')

    fireEvent.click(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' }))

    expect(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ver anotación 1: Primera' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' })).toHaveClass('bg-teal-500')
    expect(screen.getByRole('button', { name: 'Ver anotación 1: Primera' })).not.toHaveClass('bg-teal-500')
    const nota = screen.getByText('Nota 2.').parentElement
    expect(nota).toHaveTextContent('Nota 2. Segunda')
    expect(nota).toHaveAttribute('id', 'nota')
    expect(nota).toHaveClass('border-teal-500', 'bg-teal-50')
  })
})
