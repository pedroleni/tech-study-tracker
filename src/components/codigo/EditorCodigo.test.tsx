import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { EditorCodigo, type PropiedadesEditorCodigo } from '@/components/codigo/EditorCodigo'

type PropiedadesPrueba = Omit<PropiedadesEditorCodigo, 'valor' | 'alCambiar'> & {
  inicial: string
  alCambiar?: (valor: string) => void
}

/** El editor es controlado: la prueba pone el estado que en producción pone el laboratorio. */
function EditorControlado({ inicial, alCambiar, ...resto }: PropiedadesPrueba) {
  const [valor, setValor] = useState(inicial)

  return (
    <EditorCodigo
      {...resto}
      valor={valor}
      alCambiar={(nuevo) => {
        alCambiar?.(nuevo)
        setValor(nuevo)
      }}
    />
  )
}

describe('EditorCodigo', () => {
  it('colorea lo que se escribe y avisa del cambio', () => {
    const alCambiar = vi.fn()
    const { container } = render(
      <EditorControlado inicial="" etiqueta="Código HTML editable" alCambiar={alCambiar} />
    )

    const campo = screen.getByRole('textbox', { name: 'Código HTML editable' })
    fireEvent.change(campo, { target: { value: '<p class="aviso">Hola</p>' } })

    expect(alCambiar).toHaveBeenCalledWith('<p class="aviso">Hola</p>')
    expect(campo).toHaveValue('<p class="aviso">Hola</p>')
    expect(container.querySelector('.sintaxis-etiqueta')).toHaveTextContent('p')
    expect(container.querySelector('.sintaxis-cadena')).toHaveTextContent('"aviso"')
  })

  it('nunca inyecta el código como HTML mientras se escribe', () => {
    const { container } = render(<EditorControlado inicial="" etiqueta="Código HTML editable" />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '<script>window.__ejecutadoEditor = true</script>' },
    })

    expect(container.querySelector('script')).toBeNull()
    expect((window as unknown as Record<string, unknown>).__ejecutadoEditor).toBeUndefined()
    expect(container.querySelector('pre')?.textContent).toContain('<script>')
  })

  it('la capa pintada es decorativa y el nombre accesible lo pone el textarea', () => {
    const { container } = render(
      <EditorControlado inicial="<p>hola</p>" etiqueta="Código HTML editable" />
    )

    expect(container.querySelector('pre')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Código HTML editable')
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(/Escape/)
  })

  it('el tabulador sangra el código sin mover el foco', () => {
    const { container } = render(<EditorControlado inicial="<p>" etiqueta="Código HTML editable" />)
    const campo = screen.getByRole('textbox') as HTMLTextAreaElement
    campo.setSelectionRange(3, 3)

    // fireEvent devuelve false cuando el componente ha llamado a preventDefault.
    expect(fireEvent.keyDown(campo, { key: 'Tab' })).toBe(false)

    expect(campo).toHaveValue('<p>  ')
    expect(campo.selectionStart).toBe(5)
    expect(container.querySelector('pre')?.textContent).toContain('<p>  ')
  })

  it('Escape libera el tabulador para poder salir del editor', () => {
    const alCambiar = vi.fn()
    render(
      <EditorControlado inicial="<p>" etiqueta="Código HTML editable" alCambiar={alCambiar} />
    )
    const campo = screen.getByRole('textbox') as HTMLTextAreaElement
    campo.setSelectionRange(3, 3)

    fireEvent.keyDown(campo, { key: 'Escape' })
    // Sin preventDefault: el navegador mueve el foco al siguiente elemento.
    expect(fireEvent.keyDown(campo, { key: 'Tab' })).toBe(true)
    expect(alCambiar).not.toHaveBeenCalled()
    expect(campo).toHaveValue('<p>')

    // Y al seguir escribiendo, el tabulador vuelve a sangrar.
    fireEvent.keyDown(campo, { key: 'a' })
    expect(fireEvent.keyDown(campo, { key: 'Tab' })).toBe(false)
    expect(campo).toHaveValue('<p>  ')
  })

  it('mayúsculas más tabulador quita la sangría, y deja pasar el foco si no hay ninguna', () => {
    render(<EditorControlado inicial="  <p>" etiqueta="Código HTML editable" />)
    const campo = screen.getByRole('textbox') as HTMLTextAreaElement

    campo.setSelectionRange(2, 2)
    expect(fireEvent.keyDown(campo, { key: 'Tab', shiftKey: true })).toBe(false)
    expect(campo).toHaveValue('<p>')

    campo.setSelectionRange(0, 0)
    expect(fireEvent.keyDown(campo, { key: 'Tab', shiftKey: true })).toBe(true)
    expect(campo).toHaveValue('<p>')
  })

  it('numera las líneas y destaca la que se le indica', () => {
    const { container } = render(
      <EditorControlado
        inicial={'<p>uno</p>\n<p>dos</p>'}
        etiqueta="Código HTML editable"
        numerarLineas
        lineasDestacadas={[2]}
      />
    )

    expect(container.querySelector('.sintaxis-columna-numeros')?.textContent).toBe('12')
    const destacadas = container.querySelectorAll('.sintaxis-linea-destacada')
    expect(destacadas).toHaveLength(1)
    expect(destacadas[0]).toHaveTextContent('dos')
  })

  it('en solo lectura no captura el tabulador ni promete sangría', () => {
    render(<EditorControlado inicial="<p>" etiqueta="Código de ejemplo" soloLectura />)
    const campo = screen.getByRole('textbox') as HTMLTextAreaElement
    campo.setSelectionRange(3, 3)

    expect(campo).toHaveAttribute('readonly')
    expect(fireEvent.keyDown(campo, { key: 'Tab' })).toBe(true)
    expect(screen.queryByText(/Escape/)).not.toBeInTheDocument()
  })

  it('no tiene violaciones de axe', async () => {
    const { container } = render(
      <EditorControlado
        inicial={'<h1>Título</h1>\n<p>Texto</p>'}
        etiqueta="Código HTML editable"
        numerarLineas
      />
    )

    const resultados = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(resultados.violations).toEqual([])
  })
})
