import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Imagen } from './Imagen'

describe('Imagen', () => {
  it('renderiza la imagen con su alt y loading lazy', () => {
    render(
      <Imagen
        tipo="imagen"
        src="https://techstudytracker.com/img/abc123.png"
        alt="Captura de la pestaña Network de DevTools"
      />,
    )

    const img = screen.getByRole('img', {
      name: 'Captura de la pestaña Network de DevTools',
    })
    expect(img).toHaveAttribute('src', 'https://techstudytracker.com/img/abc123.png')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('muestra el pie de foto cuando hay titulo', () => {
    render(
      <Imagen
        tipo="imagen"
        src="https://techstudytracker.com/img/abc123.png"
        alt="Captura"
        titulo="Figura 1: la pestaña Network"
      />,
    )

    expect(screen.getByText('Figura 1: la pestaña Network')).toBeInTheDocument()
  })

  it('no renderiza figcaption sin titulo', () => {
    const { container } = render(
      <Imagen
        tipo="imagen"
        src="https://techstudytracker.com/img/abc123.png"
        alt="Captura"
      />,
    )

    expect(container.querySelector('figcaption')).toBeNull()
  })
})
