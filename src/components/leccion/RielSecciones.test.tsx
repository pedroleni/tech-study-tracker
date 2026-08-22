import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { RielSecciones } from '@/components/leccion/RielSecciones'

class IntersectionObserverFalso implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = []

  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve() {}
}

describe('RielSecciones', () => {
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverFalso)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('no renderiza nada cuando no hay secciones', () => {
    const { container } = render(<RielSecciones secciones={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza un botón accesible por cada sección', () => {
    render(
      <RielSecciones
        secciones={[
          { id: 'uno', titulo: 'Uno' },
          { id: 'dos', titulo: 'Dos' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Ir a Uno' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir a Dos' })).toBeInTheDocument()
  })

  it('desplaza la sección correspondiente al pulsar su botón', () => {
    render(
      <>
        <RielSecciones
          secciones={[
            { id: 'uno', titulo: 'Uno' },
            { id: 'dos', titulo: 'Dos' },
          ]}
        />
        <div id="uno" />
        <div id="dos" />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ir a Dos' }))

    expect(document.getElementById('dos')?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('no tiene violaciones de accesibilidad detectables', async () => {
    const { container } = render(
      <RielSecciones
        secciones={[
          { id: 'uno', titulo: 'Uno' },
          { id: 'dos', titulo: 'Dos' },
        ]}
      />,
    )

    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
