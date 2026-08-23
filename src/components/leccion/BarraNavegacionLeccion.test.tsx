import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { BarraNavegacionLeccion } from '@/components/leccion/BarraNavegacionLeccion'
import type { Leccion } from '@/types'

function leccion(datos: Partial<Leccion> & Pick<Leccion, 'id' | 'slug' | 'titulo' | 'orden'>): Leccion {
  return {
    technologyId: 'tec-1',
    modulo: null,
    resumen: '',
    contenido: '',
    status: 'publicado',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...datos,
  }
}

const lecciones = [
  leccion({ id: 'l1', slug: 'que-es-html', titulo: '¿Qué es HTML?', orden: 1 }),
  leccion({ id: 'l2', slug: 'anatomia', titulo: 'Anatomía de una etiqueta', orden: 2 }),
  leccion({ id: 'l3', slug: 'navegador', titulo: 'Lo mínimo que el navegador necesita', orden: 3 }),
]

describe('BarraNavegacionLeccion', () => {
  it('muestra anterior y siguiente cuando la lección actual está en medio', () => {
    render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="l2" lecciones={lecciones} />
      </MemoryRouter>,
    )

    const anterior = screen.getByRole('link', { name: /¿Qué es HTML?/ })
    const siguiente = screen.getByRole('link', { name: /Lo mínimo que el navegador necesita/ })
    expect(anterior).toHaveAttribute('href', '/tecnologias/tec-1/que-es-html')
    expect(siguiente).toHaveAttribute('href', '/tecnologias/tec-1/navegador')
  })

  it('solo muestra "Siguiente" en la primera lección', () => {
    render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="l1" lecciones={lecciones} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Anterior')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Anatomía de una etiqueta/ })).toBeInTheDocument()
  })

  it('solo muestra "Anterior" en la última lección', () => {
    render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="l3" lecciones={lecciones} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Siguiente')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Anatomía de una etiqueta/ })).toBeInTheDocument()
  })

  it('ignora lecciones en borrador al calcular anterior/siguiente', () => {
    const conBorrador = [
      lecciones[0],
      leccion({ id: 'l1b', slug: 'borrador', titulo: 'Borrador oculto', orden: 2, status: 'borrador' }),
      lecciones[1],
      lecciones[2],
    ]
    render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="l1" lecciones={conBorrador} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Borrador oculto')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Anatomía de una etiqueta/ })).toBeInTheDocument()
  })

  it('no renderiza nada cuando la lección actual no está en la lista publicada', () => {
    const { container } = render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="inexistente" lecciones={lecciones} />
      </MemoryRouter>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('no renderiza nada cuando es la única lección publicada', () => {
    const { container } = render(
      <MemoryRouter>
        <BarraNavegacionLeccion
          technologyId="tec-1"
          leccionActualId="l1"
          lecciones={[lecciones[0]]}
        />
      </MemoryRouter>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('no tiene violaciones de accesibilidad detectables', async () => {
    const { container } = render(
      <MemoryRouter>
        <BarraNavegacionLeccion technologyId="tec-1" leccionActualId="l2" lecciones={lecciones} />
      </MemoryRouter>,
    )

    const resultados = await axe(container)
    expect(resultados.violations).toEqual([])
  })
})
