import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMarcarVisibleAlEntrar } from '@/components/referencia-contenido/useMarcarVisibleAlEntrar'

type Aviso = (entradas: Partial<IntersectionObserverEntry>[]) => void

function instalarObservadorFalso() {
  const creados: { aviso: Aviso; opciones: IntersectionObserverInit; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor(aviso: Aviso, opciones: IntersectionObserverInit) {
        creados.push({ aviso, opciones, observe: this.observe, disconnect: this.disconnect })
      }
    },
  )
  return creados
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMarcarVisibleAlEntrar', () => {
  it('observa el contenedor con un umbral del 35 % y marca visible una sola vez', () => {
    const creados = instalarObservadorFalso()
    const elemento = document.createElement('section')
    const contenedorRef = { current: elemento }
    const setVisible = vi.fn()

    const { rerender, unmount } = renderHook(() => useMarcarVisibleAlEntrar(contenedorRef, setVisible))

    expect(creados).toHaveLength(1)
    const [observador] = creados
    expect(observador.opciones).toEqual({ threshold: 0.35 })
    expect(observador.observe).toHaveBeenCalledWith(elemento)

    observador.aviso([{ isIntersecting: false }])
    expect(setVisible).not.toHaveBeenCalled()
    expect(observador.disconnect).not.toHaveBeenCalled()

    observador.aviso([{ isIntersecting: true }])
    expect(setVisible).toHaveBeenCalledExactlyOnceWith(true)
    expect(observador.disconnect).toHaveBeenCalledTimes(1)

    // Con la ref y el setter estables (como en los componentes) no se crea otro observador.
    rerender()
    expect(creados).toHaveLength(1)

    unmount()
    expect(observador.disconnect).toHaveBeenCalledTimes(2)
  })

  it('no hace nada sin contenedor o sin IntersectionObserver', () => {
    const creados = instalarObservadorFalso()
    const setVisible = vi.fn()
    renderHook(() => useMarcarVisibleAlEntrar({ current: null }, setVisible))
    expect(creados).toHaveLength(0)

    vi.unstubAllGlobals()
    vi.stubGlobal('IntersectionObserver', undefined)
    renderHook(() => useMarcarVisibleAlEntrar({ current: document.createElement('div') }, setVisible))
    expect(setVisible).not.toHaveBeenCalled()
  })
})
