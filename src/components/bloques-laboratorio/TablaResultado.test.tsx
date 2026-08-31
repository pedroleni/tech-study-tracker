import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TablaResultado } from './TablaResultado'

describe('TablaResultado', () => {
  it('renderiza cabeceras y filas', () => {
    render(
      <TablaResultado columns={['nombre', 'salario']} values={[['Ana', 55000], ['Luis', 62000]]} />,
    )

    expect(screen.getByRole('columnheader', { name: 'nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'salario' })).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('62000')).toBeInTheDocument()
  })

  it('muestra NULL en vez de una celda vacía para un valor null', () => {
    render(<TablaResultado columns={['nombre']} values={[[null]]} />)

    expect(screen.getByText('NULL')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay filas', () => {
    render(<TablaResultado columns={[]} values={[]} />)

    expect(screen.getByText('Sin filas')).toBeInTheDocument()
  })

  it('renderiza un valor de cadena con HTML literal como texto, no como marcado', () => {
    render(<TablaResultado columns={['x']} values={[['<img src=x onerror=alert(1)>']]} />)

    // Si esto se hubiera renderizado como HTML habría una etiqueta <img> real
    // en el documento — el checkpoint de seguridad de esta tarea es
    // precisamente que eso no ocurra nunca.
    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
  })
})
