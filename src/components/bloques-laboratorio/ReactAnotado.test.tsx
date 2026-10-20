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
})
