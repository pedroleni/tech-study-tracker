import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { MensajeArbol, NodoArbolRender } from '@/lib/react-en-vivo/mensajes'

import { ArbolDeRenders } from './ArbolDeRenders'

const nodo = (datos: Partial<NodoArbolRender> & Pick<NodoArbolRender, 'id' | 'nombre'>): NodoArbolRender => ({
  nivel: 1,
  estado: 'sin-cambios',
  renders: 1,
  motivos: [],
  props: [],
  estados: [],
  ...datos,
})

const arbol = (nodos: NodoArbolRender[], cambios: Partial<MensajeArbol> = {}): MensajeArbol => ({
  canal: 'react-en-vivo',
  tipo: 'arbol',
  commit: 4,
  nodos,
  truncado: false,
  cambiosDom: 2,
  ...cambios,
})

describe('ArbolDeRenders', () => {
  it('sin mensajes enseña cómo empezar', () => {
    render(<ArbolDeRenders arbol={null} />)
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()
  })

  it('resume el commit', () => {
    const { rerender } = render(
      <ArbolDeRenders
        arbol={arbol([
          nodo({ id: 1, nombre: 'App', nivel: 0, estado: 'renderizado' }),
          nodo({ id: 2, nombre: 'Lista', estado: 'renderizado' }),
          nodo({ id: 3, nombre: 'Tarea', estado: 'renderizado' }),
          nodo({ id: 4, nombre: 'Nueva', estado: 'montado' }),
          nodo({ id: 5, nombre: 'Pie' }),
        ])}
      />,
    )
    expect(screen.getByText('Commit 4 · 3 renderizados · 1 montado · 2 cambios en el DOM')).toBeInTheDocument()

    rerender(
      <ArbolDeRenders
        arbol={arbol(
          [nodo({ id: 1, nombre: 'App', nivel: 0, estado: 'renderizado' }), nodo({ id: 2, nombre: 'Vieja', estado: 'desmontado' })],
          { commit: 2, cambiosDom: 1 },
        )}
      />,
    )
    expect(screen.getByText('Commit 2 · 1 renderizado · 1 desmontado · 1 cambio en el DOM')).toBeInTheDocument()
  })

  it('explica cada motivo en español', () => {
    render(
      <ArbolDeRenders
        arbol={arbol([
          nodo({ id: 1, nombre: 'Contador', nivel: 0, estado: 'renderizado', motivos: [{ tipo: 'estado', indice: 1 }], estados: [{ valor: '1' }] }),
          nodo({
            id: 2,
            nombre: 'Formulario',
            estado: 'renderizado',
            motivos: [{ tipo: 'estado', indice: 2 }],
            estados: [{ valor: '""' }, { valor: 'true' }],
          }),
          nodo({
            id: 3,
            nombre: 'Tarea',
            estado: 'renderizado',
            motivos: [
              { tipo: 'prop', nombre: 'alPulsar', detalle: 'funcion-nueva' },
              { tipo: 'prop', nombre: 'estilo', detalle: 'objeto-nuevo' },
              { tipo: 'prop', nombre: 'items', detalle: 'array-nuevo' },
              { tipo: 'prop', nombre: 'texto' },
            ],
          }),
          nodo({ id: 4, nombre: 'Etiqueta', estado: 'renderizado', motivos: [{ tipo: 'contexto', nombre: 'Tema' }] }),
          nodo({ id: 5, nombre: 'Cabecera', estado: 'renderizado', motivos: [{ tipo: 'padre' }] }),
        ])}
      />,
    )

    expect(screen.getByText('cambió su estado')).toBeInTheDocument()
    expect(screen.getByText('cambió su estado n.º 2')).toBeInTheDocument()
    expect(
      screen.getByText(
        'cambió la prop «alPulsar» (función nueva) · cambió la prop «estilo» (objeto nuevo) · cambió la prop «items» (array nuevo) · cambió la prop «texto»',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('cambió el contexto «Tema»')).toBeInTheDocument()
    expect(screen.getByText('se renderizó su padre')).toBeInTheDocument()
  })

  it('al pulsar un nodo enseña sus props y su estado', () => {
    render(
      <ArbolDeRenders
        arbol={arbol([
          nodo({ id: 1, nombre: 'App', nivel: 0, props: [], estados: [{ valor: '["a","b"]' }] }),
          nodo({ id: 2, nombre: 'Tarea', props: [{ nombre: 'texto', valor: '"a"' }] }),
        ])}
      />,
    )

    const app = screen.getByRole('button', { name: /^App/ })
    expect(app).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(app)
    expect(app).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Sin props')).toBeInTheDocument()
    expect(screen.getByText('["a","b"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Tarea/ }))
    expect(screen.getByText('texto: "a"')).toBeInTheDocument()
    expect(screen.getByText('Sin estado')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Tarea/ }))
    expect(screen.queryByText('texto: "a"')).toBeNull()
  })

  it('avisa si el árbol se truncó', () => {
    render(<ArbolDeRenders arbol={arbol([nodo({ id: 1, nombre: 'App', nivel: 0 })], { truncado: true })} />)
    expect(screen.getByText('Solo se muestran los primeros 200 componentes.')).toBeInTheDocument()
  })

  it('sin componentes montados lo dice', () => {
    render(<ArbolDeRenders arbol={arbol([], { cambiosDom: 0 })} />)
    expect(screen.getByText('No hay ningún componente montado.')).toBeInTheDocument()
  })
})
