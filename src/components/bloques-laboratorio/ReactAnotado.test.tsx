import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReactAnotado } from './ReactAnotado'

const codigo = `const tareas = ['Leer', 'Correr']
export default function App() {
  return <ul>{tareas.map((tarea) => <li key={tarea}>{tarea}</li>)}</ul>
}`

describe('ReactAnotado', () => {
  it('enseña el código JSX anotado y lo ejecuta debajo', async () => {
    render(
      <ReactAnotado
        tipo="react-anotado"
        codigo={codigo}
        css="li { color: green; }"
        anotaciones={[
          { fragmento: 'tareas.map', nota: 'map convierte cada dato en un elemento.' },
          { fragmento: 'key={tarea}', nota: 'La key identifica cada fila entre renders.' },
          { fragmento: 'no aparece en el código', nota: 'Se descarta.' },
        ]}
        strictMode
        mostrarConsola={false}
      />,
    )

    expect(screen.getByLabelText('Código de React anotado')).toBeInTheDocument()
    const botones = screen.getAllByRole('button', { name: /^Ver anotación/ })
    expect(botones).toHaveLength(2)

    fireEvent.click(botones[1])
    expect(screen.getByText('La key identifica cada fila entre renders.')).toBeInTheDocument()

    await waitFor(() => {
      const srcdoc = (screen.getByTitle('Vista previa de React') as HTMLIFrameElement).getAttribute('srcdoc')
      expect(srcdoc).toContain('jsxDEV')
      expect(srcdoc).toContain('li { color: green; }')
    })
    expect(screen.queryByRole('log')).toBeNull()
  })

  it('con mostrarArbol pide arbol.js y enseña el panel', async () => {
    render(
      <ReactAnotado
        tipo="react-anotado"
        codigo={codigo}
        css=""
        anotaciones={[{ fragmento: 'tareas.map', nota: 'n' }]}
        strictMode
        mostrarConsola={false}
        mostrarArbol
      />,
    )

    expect(screen.getByRole('heading', { name: 'Árbol de renders' })).toBeInTheDocument()
    await waitFor(() =>
      expect((screen.getByTitle('Vista previa de React') as HTMLIFrameElement).getAttribute('srcdoc')).toContain(
        '__resaltados-react-en-vivo',
      ),
    )
  })

  it('con api muestra Red y pasa api y red al documento', async () => {
    render(
      <ReactAnotado
        tipo="react-anotado"
        codigo={codigo}
        css=""
        anotaciones={[{ fragmento: 'tareas.map', nota: 'n' }]}
        strictMode
        mostrarConsola={false}
        api={{ recetas: [{ id: 1, nombre: 'Pisto' }] }}
        red={{ latencia: 700, desordenar: true }}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Red' })).toBeInTheDocument()
    await waitFor(() => {
      const srcdoc = (screen.getByTitle('Vista previa de React') as HTMLIFrameElement).getAttribute('srcdoc')
      expect(srcdoc).toContain('Pisto')
      expect(srcdoc).toContain('"latencia":700')
    })
  })

  it('con mostrarEfectos muestra el registro y pide efectos.js', async () => {
    render(
      <ReactAnotado
        tipo="react-anotado"
        codigo={codigo}
        css=""
        anotaciones={[{ fragmento: 'tareas.map', nota: 'n' }]}
        strictMode
        mostrarConsola={false}
        mostrarEfectos
      />,
    )
    expect(screen.getByRole('heading', { name: 'Efectos' })).toBeInTheDocument()
    await waitFor(() =>
      expect((screen.getByTitle('Vista previa de React') as HTMLIFrameElement).getAttribute('srcdoc')).toContain(
        'window.__efectosReactEnVivo = { envolver }',
      ),
    )
  })
})
