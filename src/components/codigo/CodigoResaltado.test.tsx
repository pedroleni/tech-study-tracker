import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { CodigoResaltado } from '@/components/codigo/CodigoResaltado'

describe('CodigoResaltado', () => {
  it('pinta cada parte de una etiqueta con su propia clase', () => {
    const { container } = render(
      <CodigoResaltado codigo='<a href="/inicio">Inicio</a>' lenguaje="html" />
    )

    expect(container.querySelector('.sintaxis-etiqueta')).toHaveTextContent('a')
    expect(container.querySelector('.sintaxis-atributo')).toHaveTextContent('href')
    expect(container.querySelector('.sintaxis-cadena')).toHaveTextContent('"/inicio"')
    expect(container.querySelector('code')).toHaveTextContent('<a href="/inicio">Inicio</a>')
  })

  // El requisito de seguridad del proyecto: el código del usuario es DATO,
  // nunca marcado. Se renderiza como nodos de texto de React, jamás con
  // dangerouslySetInnerHTML.
  it('trata el código como texto y nunca lo inyecta como HTML', () => {
    const peligroso =
      '<script>window.__ejecutado = true</script>\n<img src=x onerror="window.__ejecutado = true">\n<iframe src="https://ejemplo.test"></iframe>'

    const { container } = render(<CodigoResaltado codigo={peligroso} lenguaje="html" />)

    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(container.innerHTML).not.toContain('<script>')
    expect((window as unknown as Record<string, unknown>).__ejecutado).toBeUndefined()
    // Y aun así se ve, coloreado, letra por letra.
    expect(container.querySelector('code')?.textContent).toContain(
      '<script>window.__ejecutado = true</script>'
    )
    expect(container.querySelector('.sintaxis-etiqueta')).toHaveTextContent('script')
  })

  it('no rompe con HTML mal formado', () => {
    const { container } = render(<CodigoResaltado codigo={'<div class="caja\n<p>suelto'} />)

    expect(container.querySelector('code')?.textContent).toContain('<div class="caja')
    expect(container.querySelector('code')?.textContent).toContain('<p>suelto')
  })

  it('numera las líneas solo cuando se le pide', () => {
    const { container, rerender } = render(<CodigoResaltado codigo={'<p>uno</p>\n<p>dos</p>'} />)
    expect(container.querySelectorAll('.sintaxis-numero-linea')).toHaveLength(0)

    rerender(<CodigoResaltado codigo={'<p>uno</p>\n<p>dos</p>'} numerarLineas />)
    const numeros = [...container.querySelectorAll('.sintaxis-numero-linea')]
    expect(numeros.map((numero) => numero.textContent)).toEqual(['1', '2'])
    // Decorativos: no se anuncian junto al código.
    expect(numeros.every((numero) => numero.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('destaca las líneas indicadas y lo cuenta también sin ver', () => {
    const { container } = render(
      <CodigoResaltado codigo={'<p>uno</p>\n<p>dos</p>\n<p>tres</p>'} lineasDestacadas={[2]} />
    )

    const destacadas = [...container.querySelectorAll('.sintaxis-linea-destacada')]
    expect(destacadas).toHaveLength(1)
    expect(destacadas[0]).toHaveTextContent('dos')
    expect(screen.getByText(/Líneas destacadas de este ejemplo: 2\./)).toBeInTheDocument()
  })

  it('deja el desbordamiento dentro de su propia caja y accesible por teclado', () => {
    render(<CodigoResaltado codigo="<p>una línea muy larga</p>" etiqueta="Ejemplo de HTML" />)

    const caja = screen.getByRole('region', { name: 'Ejemplo de HTML' })
    expect(caja).toHaveAttribute('tabindex', '0')
    expect(caja.className).toContain('overflow-auto')
    expect(caja.parentElement?.className).toContain('overflow-hidden')
  })

  it('no tiene violaciones de axe', async () => {
    const { container } = render(
      <CodigoResaltado
        codigo={'<h1>Título</h1>\n<p>Texto</p>'}
        etiqueta="Ejemplo de HTML semántico"
        lineasDestacadas={[1]}
        numerarLineas
      />
    )

    const resultados = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(resultados.violations).toEqual([])
  })
})
