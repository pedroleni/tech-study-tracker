import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { SafeMarkdown } from '@/components/content/SafeMarkdown'

function bloqueLaboratorio(datos: unknown) {
  return `\`\`\`laboratorio\n${JSON.stringify(datos)}\n\`\`\``
}

describe('SafeMarkdown con laboratorios', () => {
  it('renderiza predice-el-resultado y revela la vista real', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'predice-el-resultado',
          codigo: '<p>Hola      mundo</p>',
          opciones: ['6 espacios', '1 espacio', '0 espacios'],
          correcta: 1,
          explicacion: 'HTML colapsa los espacios en blanco.',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Código HTML para predecir' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: '1 espacio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Revelar resultado' }))

    expect(screen.getByText('Respuesta correcta')).toBeInTheDocument()
    const vista = screen.getByTitle('Resultado real del código HTML')
    expect(vista).toHaveAttribute('sandbox', '')
    expect(vista).toHaveAttribute('srcdoc', '<p>Hola      mundo</p>')
  })

  it('renderiza codigo-anotado y cambia la línea activa', () => {
    const { container } = render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'codigo-anotado',
          codigo: '<main>\n  <h1>Título</h1>\n  <p>Texto</p>\n</main>',
          anotaciones: [
            { fragmento: '<h1>', nota: 'Este es el título principal.' },
            { fragmento: '<p>', nota: 'Este es el párrafo.' },
            { fragmento: '<footer>', nota: 'Este fragmento no existe.' },
          ],
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Este es el título principal.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /fragmento no existe/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ver anotación 2/i }))
    expect(screen.getByText('Este es el párrafo.')).toBeInTheDocument()
    expect(container.querySelector('.sintaxis-linea-destacada')).toHaveTextContent('<p>Texto</p>')
  })

  it('renderiza comparador-antes-despues y permite cambiar de versión', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'comparador-antes-despues',
          antes: '<div>Antes</div>',
          despues: '<main>Después</main>',
          nota: 'Compara ambas estructuras.',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Código HTML de la versión Antes' })).toHaveTextContent(
      '<div>Antes</div>',
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Después' }))
    expect(
      screen.getByRole('region', { name: 'Código HTML de la versión Después' }),
    ).toHaveTextContent('<main>Después</main>')
    expect(screen.getByTitle('Vista previa de la versión Después')).toHaveAttribute('sandbox', '')
  })

  it('renderiza notas-clave con todos sus items', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'notas-clave',
          items: [
            { titulo: 'Primer punto.', texto: 'Explicación del primer punto.' },
            { titulo: 'Segundo punto.', texto: 'Explicación del segundo punto.' },
          ],
        })}
      </SafeMarkdown>,
    )

    const region = screen.getByRole('region', { name: 'Puntos clave' })
    expect(region).toHaveTextContent('Primer punto.')
    expect(region).toHaveTextContent('Segundo punto.')
  })

  it('usa código plano cuando el JSON es inválido', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {'```laboratorio\n{"tipo":"predice-el-resultado"\n```'}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código laboratorio' })).toHaveTextContent(
      '{"tipo":"predice-el-resultado"',
    )
    expect(screen.queryByRole('button', { name: 'Revelar resultado' })).not.toBeInTheDocument()
  })

  it('usa código plano cuando el tipo no pertenece al registro', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({ tipo: 'laboratorio-inventado', codigo: '<p>Hola</p>' })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código laboratorio' })).toHaveTextContent(
      'laboratorio-inventado',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('usa CodigoResaltado para bloques normales y conserva el código inline', () => {
    const { container } = render(
      <SafeMarkdown>{'Usa `main` aquí.\n\n```html\n<main>Contenido</main>\n```'}</SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código html' })).toHaveTextContent(
      '<main>Contenido</main>',
    )
    expect(container.querySelector('p code')).toHaveTextContent('main')
  })

  it('no tiene violaciones de accesibilidad con los cuatro tipos', async () => {
    const markdown = [
      bloqueLaboratorio({
        tipo: 'predice-el-resultado',
        codigo: '<p>Hola</p>',
        opciones: ['Hola', 'Adiós'],
        correcta: 0,
        explicacion: 'El párrafo muestra Hola.',
      }),
      bloqueLaboratorio({
        tipo: 'codigo-anotado',
        codigo: '<p>Hola</p>',
        anotaciones: [{ fragmento: '<p>', nota: 'Un párrafo.' }],
      }),
      bloqueLaboratorio({
        tipo: 'comparador-antes-despues',
        antes: '<div>Hola</div>',
        despues: '<p>Hola</p>',
      }),
      bloqueLaboratorio({
        tipo: 'notas-clave',
        items: [
          { titulo: 'Primer punto.', texto: 'Explicación.' },
          { titulo: 'Segundo punto.', texto: 'Explicación.' },
        ],
      }),
    ].join('\n\n')
    const { container } = render(
      <SafeMarkdown permitirLaboratorios>{markdown}</SafeMarkdown>,
    )

    const resultados = await axe(container, {
      iframes: false,
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
