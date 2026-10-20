import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ComprobacionReact } from '@/lib/laboratorio/schemas'

import { ComprobadorReact } from './ComprobadorReact'

const comprobaciones: ComprobacionReact[] = [
  { descripcion: 'Aparece el saludo', pasos: [], espera: { texto: 'Hola' } },
]

function enviarDesde(origen: Window | null, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, source: origen }))
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ComprobadorReact', () => {
  it('es un iframe aislado y fuera de pantalla', () => {
    render(<ComprobadorReact srcDoc="<p></p>" comprobaciones={comprobaciones} onTerminar={() => {}} />)
    const iframe = screen.getByTitle('Comprobaciones')

    expect(iframe).toHaveAttribute('aria-hidden', 'true')
    expect(iframe).toHaveAttribute('tabindex', '-1')
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-forms')
    expect(iframe.style.left).toBe('-10000px')
  })

  it('envía las comprobaciones al recibir montado y termina con el resultado', () => {
    const onTerminar = vi.fn()
    render(<ComprobadorReact srcDoc="<p></p>" comprobaciones={comprobaciones} onTerminar={onTerminar} />)
    const iframe = screen.getByTitle('Comprobaciones') as HTMLIFrameElement
    const enviado = vi.spyOn(iframe.contentWindow!, 'postMessage')

    enviarDesde(iframe.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviado).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'comprobar', comprobaciones },
      '*',
    )

    const resultados = [{ descripcion: 'Aparece el saludo', ok: true }]
    enviarDesde(iframe.contentWindow, { canal: 'react-en-vivo', tipo: 'resultado-comprobaciones', resultados })
    expect(onTerminar).toHaveBeenCalledWith({ estado: 'listo', resultados })
  })

  it('se rinde a los 15 segundos', () => {
    vi.useFakeTimers()
    const onTerminar = vi.fn()
    render(<ComprobadorReact srcDoc="<p></p>" comprobaciones={comprobaciones} onTerminar={onTerminar} />)

    act(() => {
      vi.advanceTimersByTime(14_999)
    })
    expect(onTerminar).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onTerminar).toHaveBeenCalledWith({ estado: 'tiempo-agotado' })
  })
})
