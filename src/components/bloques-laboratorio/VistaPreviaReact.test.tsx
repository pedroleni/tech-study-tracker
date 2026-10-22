import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { VistaPreviaReact } from './VistaPreviaReact'

function enviarDesde(origen: Window | null, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, source: origen }))
  })
}

const iframe = () => screen.getByTitle('Vista previa de React') as HTMLIFrameElement

describe('VistaPreviaReact', () => {
  it('muestra el último error con archivo y línea, y lo olvida al cambiar el documento', () => {
    const { rerender } = render(<VistaPreviaReact srcDoc="<p>a</p>" />)

    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'error-render',
      texto: 'Roto',
      archivo: 'App.jsx',
      linea: 3,
    })
    expect(screen.getByText('Error al renderizar: Roto — App.jsx, línea 3')).toBeInTheDocument()

    rerender(<VistaPreviaReact srcDoc="<p>b</p>" />)
    expect(screen.queryByText(/Error al renderizar/)).toBeNull()
  })

  it('aclara que la línea pertenece al código compilado', () => {
    render(<VistaPreviaReact srcDoc="<p>a</p>" codigoCompilado />)

    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'error-render',
      texto: 'Roto',
      archivo: 'App.jsx',
      linea: 12,
    })

    expect(
      screen.getByText('Error al renderizar: Roto — App.jsx, línea 12 del código compilado'),
    ).toBeInTheDocument()
  })

  it('ajusta la altura entre 160 y 2400 px', () => {
    render(<VistaPreviaReact srcDoc="<p>a</p>" />)

    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'alto', alto: 5000 })
    expect(iframe().style.height).toBe('2400px')
    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'alto', alto: 10 })
    expect(iframe().style.height).toBe('160px')
  })

  it('pasa los mensajes válidos a onMensaje e ignora los de otras ventanas', () => {
    const onMensaje = vi.fn()
    render(<VistaPreviaReact srcDoc="<p>a</p>" onMensaje={onMensaje} />)
    const commit = { canal: 'react-en-vivo', tipo: 'commit', numero: 1 }

    enviarDesde(window, commit)
    expect(onMensaje).not.toHaveBeenCalled()
    enviarDesde(iframe().contentWindow, commit)
    expect(onMensaje).toHaveBeenCalledWith(commit)
  })

  it('envía la red al iframe al cambiar y la reenvía cuando queda montado', () => {
    const { rerender } = render(
      <VistaPreviaReact srcDoc="<p>a</p>" red={{ latencia: 600, desordenar: false }} />,
    )
    const enviar = vi.spyOn(iframe().contentWindow!, 'postMessage')

    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviar).toHaveBeenLastCalledWith(
      { canal: 'react-en-vivo', tipo: 'red', latencia: 600, desordenar: false },
      '*',
    )

    rerender(<VistaPreviaReact srcDoc="<p>a</p>" red={{ latencia: 1200, desordenar: true }} />)
    expect(enviar).toHaveBeenLastCalledWith(
      { canal: 'react-en-vivo', tipo: 'red', latencia: 1200, desordenar: true },
      '*',
    )
  })

  it('aísla el código del alumno', () => {
    render(<VistaPreviaReact srcDoc="<p>a</p>" />)
    expect(iframe()).toHaveAttribute('sandbox', 'allow-scripts allow-forms')
  })
})
