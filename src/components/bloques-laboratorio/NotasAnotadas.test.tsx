import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import type { AxeMatchers } from 'vitest-axe/matchers'

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
  const [indiceActivo, setIndiceActivo] = useState(0)
  return (
    <NotasAnotadas
      anotaciones={anotaciones}
      indiceActivo={indiceActivo}
      onActivar={setIndiceActivo}
      idNota="nota"
      etiqueta="Anotaciones de prueba"
      color="teal"
    />
  )
}

function obtenerNotaControlada(boton: HTMLElement, container: HTMLElement) {
  const idNota = boton.getAttribute('aria-controls')
  if (!idNota) throw new Error('El botón de anotación no controla ninguna nota')
  const nota = container.querySelector<HTMLElement>(`#${idNota}`)
  if (!nota) throw new Error(`No existe la nota controlada «${idNota}»`)
  return nota
}

describe('NotasAnotadas', () => {
  it('no pinta nada sin anotaciones', () => {
    const { container } = render(<Notas anotaciones={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marca el botón pulsado y enseña su nota', async () => {
    const { container } = render(
      <Notas
        anotaciones={[
          { fragmento: 'a', nota: 'Primera' },
          { fragmento: 'b', nota: 'Segunda' },
        ]}
      />,
    )
    expect(screen.getByLabelText('Anotaciones de prueba')).toBeInTheDocument()
    const botonPrimera = screen.getByRole('button', { name: 'Ver anotación 1: Primera' })
    expect(obtenerNotaControlada(botonPrimera, container)).toHaveTextContent('Nota 1. Primera')

    fireEvent.click(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' }))

    expect(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ver anotación 1: Primera' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Ver anotación 2: Segunda' })).toHaveClass('bg-teal-500')
    expect(screen.getByRole('button', { name: 'Ver anotación 1: Primera' })).not.toHaveClass('bg-teal-500')
    const botonSegunda = screen.getByRole('button', { name: 'Ver anotación 2: Segunda' })
    const nota = obtenerNotaControlada(botonSegunda, container)
    expect(nota).toHaveTextContent('Nota 2. Segunda')
    expect(nota).toHaveAttribute('id', 'nota')
    expect(nota).toHaveClass('border-teal-500', 'bg-teal-50')
    const resultadoAccesibilidad = expect(await axe(container)) as unknown as AxeMatchers
    resultadoAccesibilidad.toHaveNoViolations()
  })
})
