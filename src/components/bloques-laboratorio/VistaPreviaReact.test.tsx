import { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { VistaPreviaReact } from './VistaPreviaReact'

function enviarDesde(origen: Window | null, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, source: origen }))
  })
}

const iframe = () => screen.getByTitle('Vista previa de React') as HTMLIFrameElement

describe('VistaPreviaReact', () => {
  it('envía la orden del navegador cuando cambia su id y el iframe ya montó', () => {
    const { rerender } = render(<VistaPreviaReact srcDoc="<p>a</p>" />)
    const enviar = vi.spyOn(iframe().contentWindow!, 'postMessage')
    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })

    rerender(
      <VistaPreviaReact
        srcDoc="<p>a</p>"
        ordenNavegador={{ id: 1, accion: 'ir', url: '/recetas' }}
      />,
    )
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'navegador', accion: 'ir', url: '/recetas' },
      '*',
    )
  })

  it('guarda la orden hasta el primer montado', () => {
    const { rerender } = render(<VistaPreviaReact srcDoc="<p>a</p>" />)
    rerender(
      <VistaPreviaReact
        srcDoc="<p>a</p>"
        ordenNavegador={{ id: 1, accion: 'recargar' }}
      />,
    )
    const enviar = vi.spyOn(iframe().contentWindow!, 'postMessage')
    expect(enviar).not.toHaveBeenCalled()

    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'navegador', accion: 'recargar' },
      '*',
    )
  })

  it('no reenvía una orden que ya existía al crear la vista previa', () => {
    render(
      <VistaPreviaReact
        srcDoc="<p>a</p>"
        ordenNavegador={{ id: 7, accion: 'ir', url: '/secreto' }}
      />,
    )
    const enviar = vi.spyOn(iframe().contentWindow!, 'postMessage')

    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })

    expect(enviar).not.toHaveBeenCalled()
  })

  it('conserva montado entre las dos ejecuciones de StrictMode con el mismo documento', () => {
    const quitarOriginal = window.removeEventListener.bind(window)
    let montadoEntreEfectos = false
    const quitar = vi.spyOn(window, 'removeEventListener').mockImplementation(
      (tipo, listener, opciones) => {
        if (tipo === 'message' && !montadoEntreEfectos) {
          montadoEntreEfectos = true
          const marco = document.querySelector('iframe') as HTMLIFrameElement
          ;(listener as EventListener)(
            new MessageEvent('message', {
              source: marco.contentWindow,
              data: { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' },
            }),
          )
        }
        quitarOriginal(tipo, listener, opciones)
      },
    )
    const { rerender } = render(
      <StrictMode>
        <VistaPreviaReact
          srcDoc="<p>a</p>"
          red={{ latencia: 600, desordenar: false }}
          fallosSolicitados={1}
        />
      </StrictMode>,
    )
    quitar.mockRestore()
    const enviar = vi.spyOn(iframe().contentWindow!, 'postMessage')

    rerender(
      <StrictMode>
        <VistaPreviaReact
          srcDoc="<p>a</p>"
          red={{ latencia: 1200, desordenar: true }}
          fallosSolicitados={2}
          ordenNavegador={{ id: 1, accion: 'recargar' }}
        />
      </StrictMode>,
    )

    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'navegador', accion: 'recargar' },
      '*',
    )
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'red', latencia: 1200, desordenar: true },
      '*',
    )
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'fallar-siguiente' },
      '*',
    )
  })

  it.each(['recargar', 'ir'] as const)('borra el error al enviar la orden %s', (accion) => {
    const { rerender } = render(<VistaPreviaReact srcDoc="<p>a</p>" />)
    enviarDesde(iframe().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'error-render',
      texto: 'Roto',
    })
    expect(screen.getByText('Error al renderizar: Roto')).toBeInTheDocument()

    rerender(
      <VistaPreviaReact
        srcDoc="<p>a</p>"
        ordenNavegador={{ id: 1, accion, ...(accion === 'ir' ? { url: '/bien' } : {}) }}
      />,
    )

    expect(screen.queryByText('Error al renderizar: Roto')).toBeNull()
  })

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

  it('explica en castellano un error de React reconocido sin sustituir el original', () => {
    render(<VistaPreviaReact srcDoc="<p>a</p>" />)

    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'error-render',
      texto: 'Too many re-renders. React limits the number of renders to prevent an infinite loop.',
    })

    expect(
      screen.getByText(
        'Error al renderizar: Too many re-renders. React limits the number of renders to prevent an infinite loop.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Qué suele significar: Un cambio de estado se ejecuta durante el propio render y lo repite sin fin. Suele ser un onClick={fn()} en vez de onClick={fn} o un set… suelto en el cuerpo del componente.',
      ),
    ).toBeInTheDocument()

    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'error',
      texto: 'ReferenceError: ListaTareas is not defined',
    })
    expect(screen.getByText('Error: ReferenceError: ListaTareas is not defined')).toBeInTheDocument()
    expect(
      screen.getByText('Qué suele significar: Usas «ListaTareas» sin haberlo declarado ni importado.'),
    ).toBeInTheDocument()
  })

  it('reintenta una vez, ofrece recarga manual y reinicia el automático al cambiar srcDoc', () => {
    vi.useFakeTimers()
    try {
      const { rerender } = render(<VistaPreviaReact srcDoc="<p>a</p>" />)
      const primero = iframe()

      enviarDesde(primero.contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'runtime-no-cargado',
        libreria: 'react-router',
      })
      enviarDesde(primero.contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'error-render',
        texto: 'No se pudo cargar React Router en la vista previa. Pulsa «Recargar vista previa» para intentarlo de nuevo.',
      })
      expect(screen.queryByText(/No se pudo cargar React/)).toBeNull()
      act(() => vi.advanceTimersByTime(799))
      expect(iframe()).toBe(primero)
      act(() => vi.advanceTimersByTime(1))
      const segundo = iframe()
      expect(segundo).not.toBe(primero)

      enviarDesde(segundo.contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'runtime-no-cargado',
        libreria: 'react-router',
      })
      expect(
        screen.getByText(
          'No se pudo cargar React Router en la vista previa. Puede ser un corte de conexión momentáneo.',
        ),
      ).toBeInTheDocument()
      const boton = screen.getByRole('button', { name: 'Recargar vista previa' })
      fireEvent.click(boton)
      const tercero = iframe()
      expect(tercero).not.toBe(segundo)
      expect(screen.queryByRole('button', { name: 'Recargar vista previa' })).toBeNull()

      rerender(<VistaPreviaReact srcDoc="<p>b</p>" />)
      const editado = iframe()
      enviarDesde(editado.contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'runtime-no-cargado',
        libreria: 'react',
      })
      act(() => vi.advanceTimersByTime(800))
      expect(iframe()).not.toBe(editado)
      expect(screen.queryByText(/No se pudo cargar React/)).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('no introduce problemas básicos de accesibilidad en el error recuperable', async () => {
    vi.useFakeTimers()
    render(<VistaPreviaReact srcDoc="<p>a</p>" />)
    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'runtime-no-cargado',
      libreria: 'react',
    })
    act(() => vi.advanceTimersByTime(800))
    vi.useRealTimers()
    enviarDesde(iframe().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'runtime-no-cargado',
      libreria: 'react',
    })

    const caja = screen
      .getByText(/Puede ser un corte de conexión momentáneo/)
      .closest('[aria-live]')
    expect(caja).not.toBeNull()
    expect(
      (await axe(caja!, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
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
