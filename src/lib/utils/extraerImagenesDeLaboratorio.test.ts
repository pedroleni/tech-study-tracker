import { describe, expect, it } from 'vitest'

import { extraerImagenesDeLaboratorio } from './extraerImagenesDeLaboratorio'

describe('extraerImagenesDeLaboratorio', () => {
  it('devuelve una lista vacía cuando no hay imágenes', () => {
    expect(extraerImagenesDeLaboratorio('# Una lección\n\nTexto sin imágenes.')).toEqual([])
  })

  it('extrae todas las imágenes válidas', () => {
    const markdown = [
      'Antes',
      '```laboratorio',
      '{"tipo":"imagen","src":"https://www.techstudytracker.com/img/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png","alt":"Primera"}',
      '```',
      'Entre medias',
      '```laboratorio',
      '{',
      '  "tipo": "imagen",',
      '  "src": "https://www.techstudytracker.com/img/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.webp",',
      '  "alt": "Segunda",',
      '  "titulo": "Con título"',
      '}',
      '```',
    ].join('\n')

    expect(extraerImagenesDeLaboratorio(markdown).map(({ datos }) => datos)).toEqual([
      {
        tipo: 'imagen',
        src: 'https://www.techstudytracker.com/img/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png',
        alt: 'Primera',
      },
      {
        tipo: 'imagen',
        src: 'https://www.techstudytracker.com/img/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.webp',
        alt: 'Segunda',
        titulo: 'Con título',
      },
    ])
  })

  it('ignora un bloque laboratorio que no es de tipo imagen', () => {
    const markdown = `\`\`\`laboratorio
{"tipo":"callout","variante":"info","titulo":"Aviso","contenido":"Texto"}
\`\`\``

    expect(extraerImagenesDeLaboratorio(markdown)).toEqual([])
  })

  it('ignora un bloque con JSON roto sin impedir que extraiga los siguientes', () => {
    const markdown = `\`\`\`laboratorio
{"tipo":"imagen", esto no es JSON}
\`\`\`

\`\`\`laboratorio
{"tipo":"imagen","src":"https://www.techstudytracker.com/img/cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc.jpg","alt":"Válida"}
\`\`\``

    expect(extraerImagenesDeLaboratorio(markdown)).toHaveLength(1)
    expect(extraerImagenesDeLaboratorio(markdown)[0].datos.alt).toBe('Válida')
  })

  it('conserva el fence completo exactamente como aparece en el markdown', () => {
    const bloqueOriginal = `\`\`\`laboratorio
{
  "tipo": "imagen",
  "src": "https://www.techstudytracker.com/img/dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd.jpeg",
  "alt": "Texto exacto"
}
\`\`\``
    const markdown = `Texto anterior\n\n${bloqueOriginal}\n\nTexto posterior`

    expect(extraerImagenesDeLaboratorio(markdown)[0].bloqueCompleto).toBe(bloqueOriginal)
    expect(markdown.replace(bloqueOriginal, '')).toBe('Texto anterior\n\n\n\nTexto posterior')
  })
})
